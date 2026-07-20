const HANDLED_TTL_MS = 2 * 60_000;
const CLAIM_TTL_MS = 2 * 60_000;
const START_LOCK_TTL_MS = 10_000;
const ACTIVE_CALL_TTL_MS = 15_000;
const ACTIVE_CALL_HEARTBEAT_MS = 5_000;
const STORAGE_PREFIX = "nesti:call-coordination:";
const handledRooms = new Map();
const tabId =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
let channel;
let coordinationInitialized = false;
let activeCallHeartbeat = null;
let activeCallHeartbeatRoom = "";

function storageKey(kind, value) {
  return `${STORAGE_PREFIX}${kind}:${encodeURIComponent(String(value || ""))}`;
}

function readStored(key) {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function dispatchHandled(roomName, action = "handled") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nesti:incoming-call-handled", {
      detail: { roomName, action },
    }),
  );
}

function handledEntry(action = "handled", at = Date.now()) {
  return { at: Number(at) || Date.now(), action: String(action || "handled") };
}

function readHandledEntry(value) {
  if (value == null) return null;
  if (typeof value === "number") return handledEntry("handled", value);
  return handledEntry(value.action, value.at);
}

function receiveCoordinationMessage(message) {
  if (!message || message.sender === tabId) return;
  if (message.type === "incoming-handled" && message.roomName) {
    handledRooms.set(
      String(message.roomName),
      handledEntry(message.action || "handled", message.at),
    );
    dispatchHandled(String(message.roomName), message.action);
  }
}

function initializeCoordination() {
  if (coordinationInitialized || typeof window === "undefined") return;
  coordinationInitialized = true;
  if (typeof window.BroadcastChannel === "function") {
    channel = new window.BroadcastChannel("nesti-call-coordination");
    channel.addEventListener("message", (event) =>
      receiveCoordinationMessage(event.data),
    );
  }
  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith(`${STORAGE_PREFIX}event:`) || !event.newValue) return;
    try {
      receiveCoordinationMessage(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed or unrelated storage updates.
    }
  });
}

function publish(message) {
  if (typeof window === "undefined") return;
  initializeCoordination();
  const payload = { ...message, sender: tabId, at: Date.now() };
  channel?.postMessage(payload);
  try {
    window.localStorage.setItem(
      storageKey("event", payload.at),
      JSON.stringify(payload),
    );
  } catch {
    // BroadcastChannel or same-tab events still provide coordination.
  }
}

function cleanupHandledRooms() {
  const cutoff = Date.now() - HANDLED_TTL_MS;
  for (const [roomName, value] of handledRooms.entries()) {
    const entry = readHandledEntry(value);
    if (!entry || entry.at < cutoff) handledRooms.delete(roomName);
  }
}

export function markIncomingCallHandled(roomName, action = "shown") {
  const normalized = String(roomName || "").trim();
  if (!normalized) return;
  cleanupHandledRooms();
  handledRooms.set(normalized, handledEntry(action));
  if (typeof window !== "undefined") {
    initializeCoordination();
    dispatchHandled(normalized, action);
  }
}

export function resolveIncomingCallAcrossTabs(roomName, action = "handled") {
  const normalized = String(roomName || "").trim();
  if (!normalized) return;
  markIncomingCallHandled(normalized, action);
  publish({ type: "incoming-handled", roomName: normalized, action });
}

export async function claimIncomingCall(roomName) {
  const normalized = String(roomName || "").trim();
  if (!normalized || typeof window === "undefined") return false;
  initializeCoordination();
  const key = storageKey("answer", normalized);
  const now = Date.now();
  const existing = readStored(key);
  if (
    existing?.owner &&
    existing.owner !== tabId &&
    now - Number(existing.claimedAt || 0) < CLAIM_TTL_MS
  ) {
    return false;
  }
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ owner: tabId, claimedAt: now }),
    );
  } catch {
    // In storage-restricted browsers, this tab still uses the in-page action lock.
    return true;
  }
  await new Promise((resolve) => window.setTimeout(resolve, 60));
  const winner = readStored(key);
  return winner?.owner === tabId;
}

export function releaseIncomingCallClaim(roomName) {
  const normalized = String(roomName || "").trim();
  if (!normalized || typeof window === "undefined") return;
  const key = storageKey("answer", normalized);
  if (readStored(key)?.owner !== tabId) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // The claim expires automatically.
  }
}

export async function acquireCallStartLock(threadId) {
  const normalized = String(threadId || "").trim();
  if (!normalized || typeof window === "undefined") return null;
  initializeCoordination();
  const key = storageKey("start", normalized);
  const now = Date.now();
  const existing = readStored(key);
  if (
    existing?.owner &&
    existing.owner !== tabId &&
    now - Number(existing.claimedAt || 0) < START_LOCK_TTL_MS
  ) {
    return null;
  }
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ owner: tabId, claimedAt: now }),
    );
  } catch {
    return () => {};
  }
  await new Promise((resolve) => window.setTimeout(resolve, 40));
  if (readStored(key)?.owner !== tabId) return null;
  return () => {
    if (readStored(key)?.owner !== tabId) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // The short lease expires even if storage becomes unavailable.
    }
  };
}

function readActiveRooms() {
  const raw = readStored(storageKey("active", "browser"));
  // Legacy single-room shape → map
  if (raw?.roomName) {
    return {
      [String(raw.roomName)]: {
        owner: String(raw.owner || ""),
        updatedAt: Number(raw.updatedAt || 0),
      },
    };
  }
  if (raw?.rooms && typeof raw.rooms === "object") return { ...raw.rooms };
  return {};
}

function writeActiveRooms(rooms) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey("active", "browser"),
      JSON.stringify({ rooms, updatedAt: Date.now() }),
    );
  } catch {
    // Component-local session guards remain available without storage.
  }
}

export function isBrowserCallBusy(exceptRoomName = "") {
  const except = String(exceptRoomName || "").trim();
  const rooms = readActiveRooms();
  const now = Date.now();
  for (const [roomName, meta] of Object.entries(rooms)) {
    if (roomName === except) continue;
    if (now - Number(meta?.updatedAt || 0) >= ACTIVE_CALL_TTL_MS) continue;
    return true;
  }
  return false;
}

export function markBrowserCallActive(roomName) {
  const normalized = String(roomName || "").trim();
  if (!normalized || typeof window === "undefined") return;
  const writeActivity = () => {
    const rooms = readActiveRooms();
    rooms[normalized] = { owner: tabId, updatedAt: Date.now() };
    writeActiveRooms(rooms);
  };
  writeActivity();
  if (activeCallHeartbeatRoom === normalized && activeCallHeartbeat) return;
  if (activeCallHeartbeat) window.clearInterval(activeCallHeartbeat);
  activeCallHeartbeatRoom = normalized;
  activeCallHeartbeat = window.setInterval(writeActivity, ACTIVE_CALL_HEARTBEAT_MS);
}

export function clearBrowserCallActive(roomName) {
  const normalized = String(roomName || "").trim();
  if (!normalized || typeof window === "undefined") return;
  if (activeCallHeartbeatRoom === normalized && activeCallHeartbeat) {
    window.clearInterval(activeCallHeartbeat);
    activeCallHeartbeat = null;
    activeCallHeartbeatRoom = "";
  }
  const rooms = readActiveRooms();
  if (!rooms[normalized]) return;
  // Any tab leaving this room may clear it — needed when multiple accounts
  // share one browser during multiparty testing.
  delete rooms[normalized];
  if (Object.keys(rooms).length) writeActiveRooms(rooms);
  else {
    try {
      window.localStorage.removeItem(storageKey("active", "browser"));
    } catch {
      // The activity lease expires automatically.
    }
  }
}

const TERMINAL_INCOMING_ACTIONS = new Set([
  "answered",
  "declined",
  "expired",
  "ended",
  "left",
  "handled",
]);

/**
 * Returns true if this room should not show another ring UI.
 * Pass inviteOccurredAt from the invite payload so a later reinvite can ring again.
 */
export function wasIncomingCallHandled(roomName, { inviteOccurredAt } = {}) {
  const normalized = String(roomName || "").trim();
  if (!normalized) return false;
  cleanupHandledRooms();
  const entry = readHandledEntry(handledRooms.get(normalized));
  if (!entry) return false;
  const inviteAt =
    Date.parse(String(inviteOccurredAt || "")) || Number(inviteOccurredAt) || 0;
  if (inviteAt > entry.at) {
    // Fresh invite/reinvite after a prior disposition — allow UI again.
    handledRooms.delete(normalized);
    return false;
  }
  // "shown" only suppresses duplicate UI for the same wave (other tabs / inbox).
  // Terminal actions block until a newer invite arrives.
  return TERMINAL_INCOMING_ACTIONS.has(entry.action) || entry.action === "shown";
}

export function clearIncomingCallHandled(roomName) {
  const normalized = String(roomName || "").trim();
  if (!normalized) return;
  handledRooms.delete(normalized);
}
