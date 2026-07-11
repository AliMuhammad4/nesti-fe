"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LiveKitRoom, VideoConference, useParticipants } from "@livekit/components-react";
import "@livekit/components-styles";
import { AlertTriangle, Loader2, PhoneCall, Video, X } from "lucide-react";

function callHeading(type) {
  return String(type || "").toLowerCase() === "video" ? "Video call" : "Voice call";
}

const RING_TIMEOUT_MS = 45_000;

function WaitingForAnswerOverlay({ callType, enabled, onTimeout, onAnswered }) {
  const participants = useParticipants();
  const waiting = enabled && participants.length <= 1;
  const onTimeoutRef = useRef(onTimeout);
  const onAnsweredRef = useRef(onAnswered);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    onAnsweredRef.current = onAnswered;
  }, [onAnswered]);

  useEffect(() => {
    if (enabled && participants.length > 1) {
      onAnsweredRef.current?.();
    }
  }, [enabled, participants.length]);

  useEffect(() => {
    if (!waiting || typeof onTimeoutRef.current !== "function") return undefined;
    const timer = window.setTimeout(() => onTimeoutRef.current?.(), RING_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [waiting]);

  if (!waiting) return null;
  const isVideo = String(callType || "").toLowerCase() === "video";
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80">
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
          {isVideo ? <Video size={28} /> : <PhoneCall size={28} />}
        </span>
        <p className="text-base font-semibold text-white">Calling…</p>
        <p className="text-sm text-slate-300">Ringing the other participant</p>
      </div>
    </div>
  );
}

export default function ProChatCallModal({
  open,
  token,
  serverUrl,
  callType = "voice",
  title = "Conversation",
  connecting = false,
  ringing = false,
  onClose,
  onRingTimeout,
  onAnswered,
}) {
  const [callError, setCallError] = useState("");

  useEffect(() => {
    if (open) setCallError("");
  }, [open, token]);

  if (!open || typeof document === "undefined") return null;
  const isVideo = String(callType || "").toLowerCase() === "video";
  const canConnect = Boolean(token && serverUrl);

  return createPortal(
    <div className="fixed inset-0 z-[2147483500] flex h-[100dvh] w-screen items-center justify-center bg-slate-950/70 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close call"
        onClick={onClose}
      />
      <div className="relative flex h-[min(90dvh,52rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
              {isVideo ? <Video size={14} /> : <PhoneCall size={14} />}
              {connecting ? "Connecting…" : ringing ? "Calling…" : callHeading(callType)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Close call"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 bg-slate-900">
          {canConnect ? (
            <LiveKitRoom
              token={token}
              serverUrl={serverUrl}
              connect
              audio
              video={isVideo}
              onDisconnected={onClose}
              onError={(error) => {
                setCallError(error?.message || "Could not connect to the call.");
              }}
              onMediaDeviceFailure={(_, kind) => {
                const device = kind === "videoinput" ? "Camera" : "Microphone";
                setCallError(`${device} access failed. Check browser permissions and device availability.`);
              }}
              className="relative h-full w-full"
            >
              <VideoConference />
              <WaitingForAnswerOverlay
                callType={callType}
                enabled={ringing}
                onTimeout={onRingTimeout}
                onAnswered={onAnswered}
              />
              {callError ? (
                <div className="absolute left-1/2 top-4 z-30 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-950/95 px-3 py-2 text-xs text-amber-100 shadow-lg">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{callError}</span>
                </div>
              ) : null}
            </LiveKitRoom>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                {connecting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Connecting call...
                  </span>
                ) : ringing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Calling…
                  </span>
                ) : (
                  "Call is not ready yet."
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
