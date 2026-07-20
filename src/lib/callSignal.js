const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRIES = 2;
const END_SIGNAL_RETRIES = 4;

/** Server codes that mean the call is already over / end is safe to treat as done. */
const END_CONFIRMED_CODES = new Set([
  "call_not_found",
  "call_ended",
  "invalid_call_state",
  "call_action_rate_limited",
]);

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function isCallEndConfirmed(ack) {
  if (!ack) return false;
  if (ack.success) return true;
  const code = String(ack.code || "").trim();
  // Only treat server-side terminal codes as confirmed. Timeouts / disconnects
  // must remain unconfirmed so the UI can retry or warn instead of silently
  // leaving the server call live.
  return END_CONFIRMED_CODES.has(code);
}

/**
 * Emit a prochat call control event and wait for the server ack.
 * Retries only on Socket.IO ack timeouts / brief disconnects.
 */
export async function emitCallSignal(
  socket,
  eventName,
  payload,
  {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    notConnectedMessage = "Chat is not connected.",
    timeoutMessage = "Call signaling timed out.",
  } = {},
) {
  if (!socket) {
    return { success: false, code: "not_connected", message: notConnectedMessage };
  }

  let last = {
    success: false,
    code: "not_connected",
    message: notConnectedMessage,
  };

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (attempt > 0) await wait(160 * attempt);

    if (!socket.connected) {
      last = {
        success: false,
        code: "not_connected",
        message: notConnectedMessage,
      };
      continue;
    }

    last = await new Promise((resolve) => {
      try {
        socket.timeout(timeoutMs).emit(eventName, payload, (error, ack) => {
          if (error) {
            resolve({
              success: false,
              code: "signal_timeout",
              message: timeoutMessage,
            });
            return;
          }
          resolve(
            ack || {
              success: false,
              code: "signal_failed",
              message: "Call signaling failed.",
            },
          );
        });
      } catch {
        resolve({
          success: false,
          code: "signal_failed",
          message: "Call signaling failed.",
        });
      }
    });

    if (last?.success) return last;
    if (last?.code !== "signal_timeout" && last?.code !== "not_connected") {
      return last;
    }
  }

  return last;
}

/** Extra retries for hangup / leave so the server is less likely to stay live. */
export async function emitCallEndSignal(socket, eventName, payload, options = {}) {
  return emitCallSignal(socket, eventName, payload, {
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    retries: options.retries ?? END_SIGNAL_RETRIES,
    notConnectedMessage: options.notConnectedMessage ?? "Chat is not connected.",
    timeoutMessage: options.timeoutMessage ?? "Call end signaling timed out.",
  });
}
