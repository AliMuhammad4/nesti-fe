"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParticipants } from "@livekit/components-react";
import { PhoneCall, PhoneOff, Video } from "lucide-react";
import { RING_TIMEOUT_MS, humanParticipants } from "./livekitParticipants";

export default function WaitingForAnswerOverlay({
  callType,
  enabled,
  connecting = false,
  title,
  onEnd,
  onTimeout,
  onAnswered,
}) {
  const participants = useParticipants();
  const remoteHumanCount = useMemo(
    () => humanParticipants(participants).filter((participant) => !participant.isLocal).length,
    [participants],
  );
  const waiting = (enabled || connecting) && remoteHumanCount < 1;
  const onTimeoutRef = useRef(onTimeout);
  const onAnsweredRef = useRef(onAnswered);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    onAnsweredRef.current = onAnswered;
  }, [onAnswered]);

  useEffect(() => {
    if ((enabled || connecting) && remoteHumanCount >= 1) {
      onAnsweredRef.current?.();
    }
  }, [connecting, enabled, remoteHumanCount]);

  useEffect(() => {
    if (!enabled || !waiting || typeof onTimeoutRef.current !== "function") return undefined;
    const timer = window.setTimeout(() => onTimeoutRef.current?.(), RING_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, waiting]);

  useEffect(() => {
    if (!enabled || !waiting || typeof window === "undefined") return undefined;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return undefined;
    let context;
    let timer;
    let stopped = false;

    const playRingback = () => {
      if (!context || context.state !== "running" || stopped) return;
      const startedAt = context.currentTime;
      [0, 0.42].forEach((offset) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(425, startedAt + offset);
        gain.gain.setValueAtTime(0.0001, startedAt + offset);
        gain.gain.exponentialRampToValueAtTime(0.08, startedAt + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + offset + 0.3);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startedAt + offset);
        oscillator.stop(startedAt + offset + 0.31);
      });
    };

    const start = async () => {
      try {
        context = new AudioContextClass();
        if (context.state === "suspended") await context.resume();
        if (stopped) return;
        playRingback();
        timer = window.setInterval(playRingback, 2600);
      } catch {
        // The visual ringing state remains available if browser audio is blocked.
      }
    };
    void start();
    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
      if (context && context.state !== "closed") void context.close();
    };
  }, [enabled, waiting]);

  if (!waiting) return null;
  const isVideo = String(callType || "").toLowerCase() === "video";
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
          {isVideo ? <Video size={28} /> : <PhoneCall size={28} />}
        </span>
        <p className="mt-2 max-w-xs truncate text-lg font-semibold text-white">
          {connecting
            ? `${title || "Participant"} accepted`
            : `Calling ${title || "participant"}…`}
        </p>
        <p className="text-sm text-slate-300">
          {connecting ? "Connecting audio…" : "Ringing the other participant"}
        </p>
        <button
          type="button"
          onClick={onEnd}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-400"
        >
          <PhoneOff size={18} />
          End call
        </button>
      </div>
    </div>
  );
}
