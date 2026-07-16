const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRIES = 2;

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
  if (END_CONFIRMED_CODES.has(code)) return true;
  // Local UI already closed; a lost ack after retries is usually not actionable.
  if (code === "signal_timeout" || code === "not_connected") return true;
  return false;
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
