"use client";

import { Room } from "livekit-client";

const DEFAULT_ROOM_OPTIONS = {
  adaptiveStream: true,
  dynacast: true,
  stopLocalTrackOnUnpublish: true,
  disconnectOnPageLeave: true,
};

export const FAST_CONNECT_OPTIONS = {
  autoSubscribe: true,
  maxRetries: 2,
  peerConnectionTimeout: 12_000,
  websocketTimeout: 10_000,
  rtcConfig: {
    // Pre-gather ICE candidates so the first offer is faster.
    iceCandidatePoolSize: 10,
  },
};

let hostWarmPromise = null;
let mediaWarmPromise = null;

export function resolveLiveKitUrl(preferredUrl = "") {
  const fromPreferred = String(preferredUrl || "").trim();
  if (fromPreferred) return fromPreferred;
  return String(process.env.NEXT_PUBLIC_LIVEKIT_URL || "").trim();
}

/**
 * DNS/TLS warm-up for LiveKit Cloud. Safe to call when an invite rings so the
 * later authenticated prepareConnection/connect is much faster.
 */
export function warmLiveKitHost(preferredUrl = "") {
  if (typeof window === "undefined") return Promise.resolve();
  const url = resolveLiveKitUrl(preferredUrl);
  if (!url) return Promise.resolve();
  if (hostWarmPromise) return hostWarmPromise;

  hostWarmPromise = (async () => {
    const warmer = new Room(DEFAULT_ROOM_OPTIONS);
    try {
      await warmer.prepareConnection(url);
    } catch {
      // Best effort — connect still works without a warm host.
    } finally {
      try {
        await warmer.disconnect(true);
      } catch {
        // ignore
      }
    }
  })().finally(() => {
    // Allow another warm after a while in long-lived tabs.
    window.setTimeout(() => {
      hostWarmPromise = null;
    }, 60_000);
  });

  return hostWarmPromise;
}

/**
 * Ask for mic/camera early so SignalConnected publish does not wait on the
 * first permission + device-open cost.
 */
export function prewarmCallMedia({ video = false } = {}) {
  if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
    return Promise.resolve();
  }
  if (mediaWarmPromise) return mediaWarmPromise;

  mediaWarmPromise = (async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: video
          ? {
              facingMode: "user",
            }
          : false,
      });
      for (const track of stream.getTracks()) {
        track.stop();
      }
    } catch {
      // Permission denied or device missing — LiveKit will surface the real error later.
    }
  })().finally(() => {
    window.setTimeout(() => {
      mediaWarmPromise = null;
    }, 30_000);
  });

  return mediaWarmPromise;
}

export function createCallRoom() {
  return new Room(DEFAULT_ROOM_OPTIONS);
}

/**
 * Region-aware prepareConnection for the room instance that will actually connect.
 */
export async function prepareCallRoom(room, serverUrl, token) {
  if (!room || !serverUrl || !token) return;
  try {
    await room.prepareConnection(serverUrl, token);
  } catch {
    // Best effort.
  }
}
