"use client";

import { useEffect, useState } from "react";
import { useConnectionState } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";

function CallDuration({ startedAt }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt) return undefined;
    const timer = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function LiveCallStatus() {
  const connectionState = useConnectionState();
  const [startedAt, setStartedAt] = useState(null);
  const reconnecting = connectionState === ConnectionState.Reconnecting;
  const connected = connectionState === ConnectionState.Connected;

  useEffect(() => {
    if (connected) {
      setStartedAt((current) => current || Date.now());
    }
  }, [connected]);

  const label = reconnecting ? "Reconnecting…" : connected ? "Live" : "Connecting…";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md ${
        reconnecting
          ? "border-amber-400/25 bg-amber-500/15 text-amber-100"
          : "border-white/10 bg-black/45 text-white"
      }`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          reconnecting ? "animate-pulse bg-amber-300" : "bg-emerald-400"
        }`}
      />
      {label}
      {startedAt ? (
        <>
          <span className="text-white/35">·</span>
          <CallDuration startedAt={startedAt} />
        </>
      ) : null}
    </div>
  );
}
