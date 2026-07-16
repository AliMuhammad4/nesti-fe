const RETRY_DELAYS_MS = [0, 100, 200, 400];
const RETRYABLE_CODES = new Set(["media_not_ready", "signal_timeout", "not_connected"]);

function wait(delayMs) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

export async function activateCallWithRetry({
  emit,
  payload,
  isCurrent = () => true,
}) {
  let lastResult = null;
  for (const delayMs of RETRY_DELAYS_MS) {
    if (delayMs) await wait(delayMs);
    if (!isCurrent()) return { success: false, code: "call_closed" };
    lastResult = await emit("prochat:call_active", payload);
    if (lastResult?.success) return lastResult;
    if (!RETRYABLE_CODES.has(String(lastResult?.code || ""))) return lastResult;
  }
  return lastResult || { success: false, code: "media_not_ready" };
}

export function shouldAttemptCallActivation({ ringing = false, callScope = "direct" } = {}) {
  return !ringing || callScope === "multiparty";
}

export function activateCallSessionWhenReady({ emit, getSession, threadId }) {
  const active = getSession?.();
  if (!active?.roomName) return;
  if (!shouldAttemptCallActivation(active)) return;

  const roomName = active.roomName;
  void activateCallWithRetry({
    emit,
    payload: {
      thread_id: threadId,
      room_name: roomName,
      call_type: active.callType,
    },
    isCurrent: () => {
      const current = getSession?.();
      return (
        current?.open &&
        String(current?.roomName || "") === String(roomName)
      );
    },
  });
}
