"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Monitor, MonitorOff } from "lucide-react";
import {
  formatLiveKitMediaError,
  setCallScreenShareEnabled,
} from "@/lib/liveKitCallPrep";

export default function ScreenShareToggle({ onError }) {
  const { localParticipant, isScreenShareEnabled } = useLocalParticipant();
  const [busy, setBusy] = useState(false);
  const onErrorRef = useRef(onError);
  const busyRef = useRef(false);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const toggle = async () => {
    if (!localParticipant || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await setCallScreenShareEnabled(localParticipant, !isScreenShareEnabled);
    } catch (error) {
      // User cancelled the browser picker — not an error to surface.
      const name = String(error?.name || "");
      const message = String(error?.message || "").toLowerCase();
      if (name === "NotAllowedError" || message.includes("permission denied")) {
        if (!message.includes("timed out") && !message.includes("no response")) {
          return;
        }
      }
      onErrorRef.current?.(new Error(formatLiveKitMediaError(error)));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const sharing = Boolean(
    isScreenShareEnabled ||
      localParticipant?.getTrackPublication?.(Track.Source.ScreenShare)?.track,
  );

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy || !localParticipant}
      aria-pressed={sharing}
      title={sharing ? "Stop sharing" : "Share screen"}
      className={`lk-button inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
        sharing
          ? "bg-emerald-500 text-white hover:bg-emerald-400"
          : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
      }`}
    >
      {sharing ? <MonitorOff size={17} /> : <Monitor size={17} />}
      <span className="hidden sm:inline">{sharing ? "Stop share" : "Share"}</span>
    </button>
  );
}
