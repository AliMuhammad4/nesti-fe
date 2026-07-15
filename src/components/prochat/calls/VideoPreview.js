"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Loader2, Mic, RefreshCw, Video } from "lucide-react";
import { VIDEO_PREVIEW_TIMEOUT_MS } from "./livekitParticipants";

export default function VideoPreview({ title, onStart, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  const [previewState, setPreviewState] = useState("loading");
  const [previewError, setPreviewError] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.ceil(VIDEO_PREVIEW_TIMEOUT_MS / 1000),
  );

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  const stopPreview = () => {
    for (const track of streamRef.current?.getTracks?.() || []) track.stop();
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startPreview = async () => {
    stopPreview();
    setPreviewState("loading");
    setPreviewError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPreviewState("ready");
    } catch (error) {
      setPreviewState("error");
      setPreviewError(
        error?.name === "NotAllowedError"
          ? "Camera or microphone permission was denied."
          : "Camera preview is unavailable. Check your devices and try again.",
      );
    }
  };

  useEffect(() => {
    void startPreview();
    return stopPreview;
    // Preview initializes once for this call setup screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const deadline = Date.now() + VIDEO_PREVIEW_TIMEOUT_MS;
    const update = () =>
      setSecondsRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    const interval = window.setInterval(update, 250);
    const timeout = window.setTimeout(() => {
      stopPreview();
      onCancelRef.current?.();
    }, VIDEO_PREVIEW_TIMEOUT_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
    // The deadline is fixed when this preview mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beginCall = () => {
    const cameraEnabled = previewState === "ready";
    stopPreview();
    onStart?.({ cameraEnabled });
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-white">Check your camera and microphone</p>
          <p className="mt-0.5 text-xs text-slate-400">
            You will call {title || "the participant"} after continuing. Preview
            expires in {secondsRemaining}s.
          </p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200 sm:inline-flex">
          <CheckCircle2 size={14} />
          Private preview
        </span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full scale-x-[-1] object-cover transition-opacity duration-300 ${
            previewState === "ready" ? "opacity-100" : "opacity-20"
          }`}
        />
        {previewState === "loading" ? (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-3 text-sm text-slate-300">
              <Loader2 size={28} className="animate-spin text-emerald-300" />
              Starting camera preview…
            </div>
          </div>
        ) : null}
        {previewState === "error" ? (
          <div className="absolute inset-0 grid place-items-center p-6">
            <div className="max-w-sm rounded-2xl border border-amber-400/30 bg-amber-950/90 p-5 text-center">
              <AlertTriangle size={28} className="mx-auto text-amber-300" />
              <p className="mt-3 text-sm font-semibold text-white">{previewError}</p>
              <button
                type="button"
                onClick={() => void startPreview()}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15"
              >
                <RefreshCw size={14} />
                Retry devices
              </button>
            </div>
          </div>
        ) : null}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-200 backdrop-blur">
          <Camera size={16} />
          <Mic size={16} />
          <span className="text-xs">Camera and microphone</span>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-slate-900 px-4 py-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => {
            stopPreview();
            onCancel?.();
          }}
          className="h-10 rounded-full border border-white/15 px-5 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={beginCall}
          disabled={previewState === "loading"}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60"
        >
          <Video size={17} />
          {previewState === "error" ? "Call without camera" : "Start video call"}
        </button>
      </div>
    </div>
  );
}
