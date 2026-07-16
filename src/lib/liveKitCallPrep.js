"use client";

import { Room, ScreenSharePresets, Track, createLocalTracks } from "livekit-client";

const DEFAULT_ROOM_OPTIONS = {
  adaptiveStream: true,
  dynacast: true,
  stopLocalTrackOnUnpublish: true,
  disconnectOnPageLeave: true,
  publishDefaults: {
    simulcast: true,
    screenShareEncoding: ScreenSharePresets.h720fps15.encoding,
    videoCodec: "vp8",
  },
};

export const FAST_CONNECT_OPTIONS = {
  autoSubscribe: true,
  maxRetries: 2,
  peerConnectionTimeout: 20_000,
  websocketTimeout: 15_000,
  rtcConfig: {
    iceCandidatePoolSize: 10,
  },
};

export const SCREEN_SHARE_CAPTURE_OPTIONS = {
  audio: true,
  selfBrowserSurface: "exclude",
  surfaceSwitching: "include",
  contentHint: "detail",
  resolution: ScreenSharePresets.h720fps15.resolution,
};

export const SCREEN_SHARE_PUBLISH_OPTIONS = {
  name: "screen_share",
  source: Track.Source.ScreenShare,
  simulcast: false,
  screenShareEncoding: ScreenSharePresets.h720fps15.encoding,
  degradationPreference: "maintain-resolution",
  videoCodec: "vp8",
};

export function formatLiveKitMediaError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  if (
    message.includes("publication of local track timed out") ||
    (message.includes("timed out") && message.includes("no response"))
  ) {
    return "Screen share could not connect. Check your network and try sharing again.";
  }
  if (message.includes("permission") || message.includes("denied") || message.includes("not allowed")) {
    return "Screen share permission was denied. Allow screen sharing and try again.";
  }
  if (message.includes("device not found") || message.includes("not found")) {
    return "No screen source was available to share.";
  }
  return error?.message || "Could not start screen sharing.";
}

export async function setCallScreenShareEnabled(localParticipant, enabled) {
  if (!localParticipant) {
    throw new Error("Call is not connected yet.");
  }
  if (!enabled) {
    return localParticipant.setScreenShareEnabled(false);
  }

  try {
    return await localParticipant.setScreenShareEnabled(
      true,
      SCREEN_SHARE_CAPTURE_OPTIONS,
      SCREEN_SHARE_PUBLISH_OPTIONS,
    );
  } catch (error) {
    const message = String(error?.message || error || "").toLowerCase();
    const name = String(error?.name || "");
    // User cancelled the picker — don't retry.
    if (name === "NotAllowedError" || message.includes("permission denied")) {
      throw error;
    }
    // Retry with a minimal capture config (common Windows multi-tab failures).
    return localParticipant.setScreenShareEnabled(
      true,
      {
        audio: false,
        contentHint: "detail",
        resolution: ScreenSharePresets.h720fps15.resolution,
      },
      SCREEN_SHARE_PUBLISH_OPTIONS,
    );
  }
}

const AUDIO_CAPTURE = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

let hostWarmPromise = null;
let mediaWarmPromise = null;
let warmedTracks = null;
let warmedIncludesVideo = false;
let mediaWarmGeneration = 0;

export function resolveLiveKitUrl(preferredUrl = "") {
  const fromPreferred = String(preferredUrl || "").trim();
  if (fromPreferred) return fromPreferred;
  return String(process.env.NEXT_PUBLIC_LIVEKIT_URL || "").trim();
}

function stopTracks(tracks) {
  for (const track of tracks || []) {
    try {
      track.stop();
    } catch {}
  }
}

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
    } finally {
      try {
        await warmer.disconnect(true);
      } catch {}
    }
  })().finally(() => {
    window.setTimeout(() => {
      hostWarmPromise = null;
    }, 60_000);
  });

  return hostWarmPromise;
}

export function prewarmCallMedia({ video = false } = {}) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const wantVideo = Boolean(video);
  if (
    mediaWarmPromise &&
    warmedTracks?.length &&
    (!wantVideo || warmedIncludesVideo)
  ) {
    return mediaWarmPromise;
  }

  if (mediaWarmPromise && wantVideo && !warmedIncludesVideo) {
    mediaWarmPromise = null;
  }

  if (mediaWarmPromise) return mediaWarmPromise;

  const generation = ++mediaWarmGeneration;
  mediaWarmPromise = (async () => {
    try {
      stopTracks(warmedTracks);
      warmedTracks = null;
      warmedIncludesVideo = false;
      const tracks = await createLocalTracks({
        audio: AUDIO_CAPTURE,
        video: wantVideo
          ? {
              facingMode: "user",
            }
          : false,
      });
      if (generation !== mediaWarmGeneration) {
        stopTracks(tracks);
        return;
      }
      warmedTracks = tracks;
      warmedIncludesVideo = wantVideo;
    } catch {
      if (generation === mediaWarmGeneration) {
        warmedTracks = null;
        warmedIncludesVideo = false;
      }
    }
  })();

  return mediaWarmPromise;
}

export function getPrewarmedMediaStream() {
  if (!warmedTracks?.length) return null;
  return new MediaStream(
    warmedTracks
      .map((track) => track.mediaStreamTrack)
      .filter(Boolean),
  );
}

export function takePrewarmedLocalTracks({ video = false } = {}) {
  const tracks = warmedTracks || [];
  warmedTracks = null;
  warmedIncludesVideo = false;
  mediaWarmPromise = null;
  mediaWarmGeneration += 1;

  if (!tracks.length) return [];

  const audioTracks = tracks.filter((track) => track.kind === Track.Kind.Audio);
  const videoTracks = tracks.filter((track) => track.kind === Track.Kind.Video);

  if (!video) {
    stopTracks(videoTracks);
    return audioTracks;
  }

  return [...audioTracks, ...videoTracks];
}

export function releasePrewarmedCallMedia() {
  mediaWarmGeneration += 1;
  stopTracks(warmedTracks);
  warmedTracks = null;
  warmedIncludesVideo = false;
  mediaWarmPromise = null;
}

export function createCallRoom() {
  return new Room(DEFAULT_ROOM_OPTIONS);
}

export async function prepareCallRoom(room, serverUrl, token) {
  if (!room || !serverUrl || !token) return;
  try {
    await room.prepareConnection(serverUrl, token);
  } catch {}
}
