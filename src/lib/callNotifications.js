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

function receiveCoordinationMessage(message) {
  if (!message || message.sender === tabId) return;
  if (message.type === "incoming-handled" && message.roomName) {
    handledRooms.set(String(message.roomName), Number(message.at) || Date.now());
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
  for (const [roomName, handledAt] of handledRooms.entries()) {
    if (handledAt < cutoff) handledRooms.delete(roomName);
  }
}

export function markIncomingCallHandled(roomName) {
  const normalized = String(roomName || "").trim();
  if (!normalized) return;
  cleanupHandledRooms();
  handledRooms.set(normalized, Date.now());
  if (typeof window !== "undefined") {
    initializeCoordination();
    dispatchHandled(normalized);
  }
}

export function resolveIncomingCallAcrossTabs(roomName, action = "handled") {
  const normalized = String(roomName || "").trim();
  if (!normalized) return;
  markIncomingCallHandled(normalized);
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

export function isBrowserCallBusy(exceptRoomName = "") {
  const active = readStored(storageKey("active", "browser"));
  if (!active?.roomName) return false;
  if (Date.now() - Number(active.updatedAt || 0) >= ACTIVE_CALL_TTL_MS) return false;
  return String(active.roomName) !== String(exceptRoomName || "");
}

export function markBrowserCallActive(roomName) {
  const normalized = String(roomName || "").trim();
  if (!normalized || typeof window === "undefined") return;
  const writeActivity = () => {
    try {
      window.localStorage.setItem(
        storageKey("active", "browser"),
        JSON.stringify({ owner: tabId, roomName: normalized, updatedAt: Date.now() }),
      );
    } catch {
      // Component-local session guards remain available without storage.
    }
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
  const key = storageKey("active", "browser");
  const active = readStored(key);
  if (activeCallHeartbeatRoom === normalized && activeCallHeartbeat) {
    window.clearInterval(activeCallHeartbeat);
    activeCallHeartbeat = null;
    activeCallHeartbeatRoom = "";
  }
  if (active?.owner !== tabId || String(active.roomName || "") !== normalized) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // The activity lease expires automatically.
  }
}

export function wasIncomingCallHandled(roomName) {
  const normalized = String(roomName || "").trim();
  if (!normalized) return false;
  cleanupHandledRooms();
  return handledRooms.has(normalized);
}
