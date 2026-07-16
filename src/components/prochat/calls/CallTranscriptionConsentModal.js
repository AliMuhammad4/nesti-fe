"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NotebookPen, X } from "lucide-react";

import {
  CALL_TRANSCRIPTION_CONSENT_CANCEL_EVENT,
  CALL_TRANSCRIPTION_CONSENT_EVENT,
} from "@/lib/callTranscriptionConsent";

export default function CallTranscriptionConsentModal() {
  const [request, setRequest] = useState(null);
  const dialogRef = useRef(null);
  const declineButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const choose = useCallback(
    (consent) => {
      if (!request) return;
      request.resolve(consent === true);
      setRequest(null);
    },
    [request],
  );

  useEffect(() => {
    const open = (event) => {
      const resolve = event?.detail?.resolve;
      if (typeof resolve !== "function") return;
      setRequest((current) => current || { resolve });
    };
    const cancel = () => setRequest(null);

    window.addEventListener(CALL_TRANSCRIPTION_CONSENT_EVENT, open);
    window.addEventListener(CALL_TRANSCRIPTION_CONSENT_CANCEL_EVENT, cancel);
    return () => {
      window.removeEventListener(CALL_TRANSCRIPTION_CONSENT_EVENT, open);
      window.removeEventListener(CALL_TRANSCRIPTION_CONSENT_CANCEL_EVENT, cancel);
    };
  }, []);

  useEffect(() => {
    if (!request) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => declineButtonRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        choose(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [choose, request]);

  if (!request || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) choose(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-notes-title"
        aria-describedby="call-notes-description"
        className="relative w-full max-w-[360px] rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <button
          type="button"
          onClick={() => choose(false)}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Continue without minutes"
        >
          <X size={16} />
        </button>

        <div className="px-5 pb-1 pt-5">
          <div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700">
            <NotebookPen size={17} aria-hidden="true" />
          </div>
          <h2 id="call-notes-title" className="pr-7 text-base font-semibold tracking-tight text-slate-900">
            Allow minutes of meeting?
          </h2>
          <p id="call-notes-description" className="mt-1.5 text-sm leading-5 text-slate-600">
            Nesti will transcribe your speech and create minutes of meeting for this call.
          </p>
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-4">
          <div className="flex flex-1 gap-2">
            <button
              ref={declineButtonRef}
              type="button"
              onClick={() => choose(false)}
              className="min-h-10 flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              No thanks
            </button>
            <button
              type="button"
              onClick={() => choose(true)}
              className="min-h-10 flex-1 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Allow minutes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
