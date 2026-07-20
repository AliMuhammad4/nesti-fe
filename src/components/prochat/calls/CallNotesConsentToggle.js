"use client";

import { NotebookPen } from "lucide-react";
import { CALL_TRANSCRIPTION_DISCLOSURE } from "@/lib/callTranscriptionConsent";

export default function CallNotesConsentToggle({
  value = false,
  onChange,
  disabled = false,
  variant = "dark",
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
          : "rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left"
      }
    >
      <div
        className={
          isDark
            ? "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300"
            : "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
        }
      >
        <NotebookPen size={14} />
        Call minutes
      </div>
      <p
        className={
          isDark
            ? "mt-1 text-xs leading-5 text-slate-400"
            : "mt-1 text-xs leading-5 text-gray-600"
        }
      >
        Optional. {CALL_TRANSCRIPTION_DISCLOSURE}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(false)}
          className={`min-h-9 flex-1 rounded-full border px-3 text-xs font-semibold transition ${
            !value
              ? isDark
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                : "border-emerald-300 bg-emerald-50 text-emerald-800"
              : isDark
                ? "border-white/10 bg-transparent text-slate-300 hover:bg-white/5"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Minutes off
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(true)}
          className={`min-h-9 flex-1 rounded-full border px-3 text-xs font-semibold transition ${
            value
              ? isDark
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                : "border-emerald-300 bg-emerald-50 text-emerald-800"
              : isDark
                ? "border-white/10 bg-transparent text-slate-300 hover:bg-white/5"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Allow minutes
        </button>
      </div>
    </div>
  );
}
