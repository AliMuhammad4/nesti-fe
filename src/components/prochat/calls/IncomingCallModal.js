"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Phone, PhoneOff, Video } from "lucide-react";
import CallNotesConsentToggle from "./CallNotesConsentToggle";

export default function IncomingCallModal({ call, onAnswer, onDecline, onExpire }) {
  const [action, setAction] = useState("");
  const [notesConsent, setNotesConsent] = useState(false);

  useEffect(() => {
    setAction("");
    setNotesConsent(false);
  }, [call?.roomName, call?.expiresAt, call?.inviteOccurredAt]);

  useEffect(() => {
    if (!call?.roomName || action || typeof window === "undefined") return undefined;
    const deadline = Number(call.expiresAt) || Date.now() + 85_000;
    const timer = window.setTimeout(async () => {
      setAction("expired");
      await onDecline?.();
      await onExpire?.();
    }, Math.max(0, deadline - Date.now()));
    return () => window.clearTimeout(timer);
  }, [action, call?.expiresAt, call?.inviteOccurredAt, call?.roomName, onDecline, onExpire]);

  useEffect(() => {
    if (!call?.roomName || action || typeof window === "undefined") return undefined;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let audioContext;
    let ringTimer;
    let stopped = false;

    const playRing = () => {
      if (!audioContext || audioContext.state !== "running" || stopped) return;
      const startedAt = audioContext.currentTime;
      [0, 0.32].forEach((offset) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(480, startedAt + offset);
        oscillator.frequency.linearRampToValueAtTime(620, startedAt + offset + 0.18);
        gain.gain.setValueAtTime(0.0001, startedAt + offset);
        gain.gain.exponentialRampToValueAtTime(0.16, startedAt + offset + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + offset + 0.24);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startedAt + offset);
        oscillator.stop(startedAt + offset + 0.25);
      });
    };

    const startRingtone = async () => {
      if (!AudioContextClass) return;
      try {
        audioContext = new AudioContextClass();
        if (audioContext.state === "suspended") await audioContext.resume();
        if (stopped) return;
        playRing();
        ringTimer = window.setInterval(playRing, 1900);
      } catch {
        // Browsers may block sound until the user has interacted with the page.
      }
    };

    void startRingtone();
    navigator.vibrate?.([250, 120, 250]);

    return () => {
      stopped = true;
      if (ringTimer) window.clearInterval(ringTimer);
      navigator.vibrate?.(0);
      if (audioContext && audioContext.state !== "closed") {
        void audioContext.close();
      }
    };
  }, [action, call?.expiresAt, call?.inviteOccurredAt, call?.roomName]);

  if (!call || action === "expired" || typeof document === "undefined") return null;
  const isVideo = String(call.callType || "").toLowerCase() === "video";
  const callerName = String(call.callerName || "Someone").trim() || "Someone";

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483600] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-call-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900 px-6 py-8 text-center shadow-2xl shadow-black/60">
        <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/15" />
          {isVideo ? <Video size={38} /> : <Phone size={38} />}
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Incoming {isVideo ? "video" : "voice"} call
        </p>
        <h2 id="incoming-call-title" className="mt-2 truncate text-xl font-bold text-white">
          {callerName}
        </h2>
        <p className="mt-1 text-sm text-slate-400">is calling you</p>

        <div className="mt-5">
          <CallNotesConsentToggle
            value={notesConsent}
            onChange={setNotesConsent}
            disabled={Boolean(action)}
            variant="dark"
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-8">
          <button
            type="button"
            disabled={Boolean(action)}
            onClick={async () => {
              setAction("decline");
              await onDecline?.();
              setAction("");
            }}
            className="flex flex-col items-center gap-2 text-xs font-semibold text-slate-200"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-400">
              {action === "decline" ? <Loader2 size={24} className="animate-spin" /> : <PhoneOff size={24} />}
            </span>
            Decline
          </button>
          <button
            type="button"
            disabled={Boolean(action)}
            onClick={async () => {
              setAction("answer");
              await onAnswer?.(notesConsent);
              setAction("");
            }}
            className="flex flex-col items-center gap-2 text-xs font-semibold text-slate-200"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-400">
              {action === "answer" ? (
                <Loader2 size={24} className="animate-spin" />
              ) : isVideo ? (
                <Video size={24} />
              ) : (
                <Phone size={24} />
              )}
            </span>
            Answer
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
