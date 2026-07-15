"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Phone, Video, X } from "lucide-react";
import CallNotesConsentToggle from "./CallNotesConsentToggle";

export default function OutgoingCallNotesModal({
  open,
  callType = "voice",
  title = "Participant",
  pending = false,
  onCancel,
  onStart,
}) {
  const [notesConsent, setNotesConsent] = useState(false);

  useEffect(() => {
    if (open) setNotesConsent(false);
  }, [open, callType]);

  if (!open || typeof document === "undefined") return null;

  const isVideo = String(callType || "").toLowerCase() === "video";

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483640] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="outgoing-call-notes-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900 px-6 py-7 text-center shadow-2xl shadow-black/60">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          {isVideo ? <Video size={34} /> : <Phone size={34} />}
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Start {isVideo ? "video" : "voice"} call
        </p>
        <h2 id="outgoing-call-notes-title" className="mt-2 truncate text-xl font-bold text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">Choose your notes preference before calling.</p>

        <div className="mt-5">
          <CallNotesConsentToggle
            value={notesConsent}
            onChange={setNotesConsent}
            disabled={pending}
            variant="dark"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onStart?.(notesConsent)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isVideo ? (
              <Video size={16} />
            ) : (
              <Phone size={16} />
            )}
            {pending ? "Starting…" : "Start call"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
