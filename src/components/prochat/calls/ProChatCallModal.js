"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { AlertTriangle, Loader2, PhoneCall, PhoneOff, Video, X } from "lucide-react";
import CallPeoplePanel from "./CallPeoplePanel";
import RemoteDepartureGuard from "./RemoteDepartureGuard";
import VideoCallView from "./VideoCallView";
import VideoPreview from "./VideoPreview";
import VoiceCallView from "./VoiceCallView";
import WaitingForAnswerOverlay from "./WaitingForAnswerOverlay";
import CallActivationGate from "./CallActivationGate";
import { callHeading } from "./livekitParticipants";
import { shouldAttemptCallActivation } from "@/lib/callActivation";
import {
  createCallRoom,
  FAST_CONNECT_OPTIONS,
  prepareCallRoom,
  warmLiveKitHost,
} from "@/lib/liveKitCallPrep";

export default function ProChatCallModal({
  open,
  token,
  serverUrl,
  callType = "voice",
  title = "Conversation",
  connecting = false,
  ringing = false,
  peerConnecting = false,
  callScope = "direct",
  isHost = false,
  participantStates = [],
  transcriptionStatus = "pending",
  members = [],
  myUserId = "",
  onInviteParticipant,
  onClose,
  onConnected,
  onActivateCall,
  onRingTimeout,
  onAnswered,
}) {
  const [callError, setCallError] = useState("");
  const [videoPreviewConfirmed, setVideoPreviewConfirmed] = useState(false);
  const [initialCameraEnabled, setInitialCameraEnabled] = useState(true);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const disconnectTimerRef = useRef(null);
  const connectionStartedAtRef = useRef(0);
  const room = useMemo(() => (typeof window === "undefined" ? null : createCallRoom()), []);
  const shouldActivateCall =
    typeof onActivateCall === "function" &&
    shouldAttemptCallActivation({ ringing, callScope });

  const clearDisconnectTimer = () => {
    if (disconnectTimerRef.current) window.clearTimeout(disconnectTimerRef.current);
    disconnectTimerRef.current = null;
  };

  useEffect(() => {
    if (open) setCallError("");
  }, [open, token]);

  useEffect(() => {
    if (open && serverUrl) {
      void warmLiveKitHost(serverUrl);
    }
  }, [open, serverUrl]);

  useEffect(() => {
    if (!open || !token || !serverUrl || !room) {
      return undefined;
    }
    connectionStartedAtRef.current = performance.now();
    void prepareCallRoom(room, serverUrl, token);
    return undefined;
  }, [open, room, serverUrl, token]);

  useEffect(() => {
    if (open) return undefined;
    if (room) {
      void room.disconnect(true);
    }
    return undefined;
  }, [open, room]);

  useEffect(() => {
    if (!open) {
      setVideoPreviewConfirmed(false);
      setInitialCameraEnabled(true);
      setPeopleOpen(false);
      return;
    }
    if (String(callType || "").toLowerCase() !== "video" || !ringing) {
      setVideoPreviewConfirmed(true);
    }
  }, [callType, open, ringing]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  useEffect(
    () => () => {
      clearDisconnectTimer();
      if (room) void room.disconnect(true);
    },
    [room],
  );

  if (!open || typeof document === "undefined") return null;
  const isVideo = String(callType || "").toLowerCase() === "video";
  const isMultiparty = callScope === "multiparty";
  const endLabel = isMultiparty ? (isHost ? "End for everyone" : "Leave call") : "End call";
  const showPeople = isMultiparty
    ? () => setPeopleOpen((current) => !current)
    : undefined;
  const canConnect = Boolean(token && serverUrl && room);
  const showVideoPreview = isVideo && ringing && !videoPreviewConfirmed;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483500] flex h-[100dvh] w-screen items-center justify-center bg-slate-950/80 p-2 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${callHeading(callType)} with ${title}`}
    >
      <div className="absolute inset-0" aria-hidden="true" />
      <div className="relative flex h-[min(94dvh,52rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl shadow-black/60 sm:h-[min(90dvh,52rem)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
              {isVideo ? <Video size={14} /> : <PhoneCall size={14} />}
              {showVideoPreview
                ? "Camera preview"
                : connecting
                  ? "Connecting…"
                  : ringing
                    ? "Calling…"
                    : callHeading(callType)}
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
          {showVideoPreview ? (
            <VideoPreview
              title={title}
              onCancel={onClose}
              onStart={({ cameraEnabled } = {}) => {
                setInitialCameraEnabled(cameraEnabled !== false);
                setVideoPreviewConfirmed(true);
              }}
            />
          ) : canConnect ? (
            <LiveKitRoom
              room={room}
              token={token}
              serverUrl={serverUrl}
              connect
              connectOptions={FAST_CONNECT_OPTIONS}
              audio
              video={isVideo && initialCameraEnabled}
              onConnected={() => {
                clearDisconnectTimer();
                setCallError("");
                if (process.env.NODE_ENV === "development" && connectionStartedAtRef.current) {
                  console.info("[prochat-call] LiveKit connected", {
                    elapsedMs: Math.round(performance.now() - connectionStartedAtRef.current),
                  });
                }
                onConnected?.();
              }}
              onDisconnected={() => {
                setCallError("Connection lost. Trying to recover the call…");
                clearDisconnectTimer();
                disconnectTimerRef.current = window.setTimeout(() => {
                  disconnectTimerRef.current = null;
                  onClose?.();
                }, 20_000);
              }}
              onError={(error) => {
                setCallError(error?.message || "Could not connect to the call.");
              }}
              onMediaDeviceFailure={(_, kind) => {
                const device =
                  kind === "videoinput"
                    ? "Camera"
                    : kind === "audioinput"
                      ? "Microphone"
                      : kind === "audiooutput"
                        ? "Speaker"
                        : "Media device";
                setCallError(`${device} access failed. Check browser permissions and device availability.`);
              }}
              className="relative h-full w-full"
            >
              <RemoteDepartureGuard enabled={!isMultiparty} onDeparted={onClose} />
              <CallActivationGate enabled={shouldActivateCall} onActivate={onActivateCall} />
              {isVideo ? (
                <VideoCallView
                  endLabel={endLabel}
                  onEnd={onClose}
                  onShowPeople={showPeople}
                  onDeviceError={(error) => {
                    setCallError(error?.message || "Camera or microphone access failed.");
                  }}
                />
              ) : (
                <VoiceCallView
                  endLabel={endLabel}
                  onEnd={onClose}
                  onShowPeople={showPeople}
                  onDeviceError={(error) => {
                    setCallError(error?.message || "Microphone access failed.");
                  }}
                />
              )}
              <WaitingForAnswerOverlay
                callType={callType}
                enabled={ringing}
                connecting={peerConnecting}
                title={title}
                onEnd={onClose}
                onTimeout={onRingTimeout}
                onAnswered={onAnswered}
              />
              {peopleOpen && isMultiparty ? (
                <CallPeoplePanel
                  participantStates={participantStates}
                  members={members}
                  myUserId={myUserId}
                  isHost={isHost}
                  onClose={() => setPeopleOpen(false)}
                  onInviteParticipant={onInviteParticipant}
                />
              ) : null}
              {callError ? (
                <div className="absolute left-1/2 top-4 z-30 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-950/95 px-3 py-2 text-xs text-amber-100 shadow-lg">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{callError}</span>
                </div>
              ) : null}
            </LiveKitRoom>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/90">
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
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  <PhoneOff size={17} />
                  {endLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
