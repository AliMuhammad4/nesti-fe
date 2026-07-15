"use client";

import { formatTranscriptClock } from "@/lib/callTranscriptionConsent";
import { CallDetailEmptyState, CallDetailPreparingState } from "./CallDetailStates";

export default function CallTranscriptTab({
  notes,
  transcript,
  transcriptPagination,
  transcriptPage,
  preparingTranscript,
  onTranscriptPageChange,
}) {
  return (
    <div>
      {preparingTranscript && !(transcript.segments || []).length ? (
        <CallDetailPreparingState
          title="Preparing transcript"
          message={notes.emptyTranscript}
        />
      ) : null}
      {!preparingTranscript && !(transcript.segments || []).length ? (
        <CallDetailEmptyState message={notes.emptyTranscript} />
      ) : null}
      {(transcript.segments || []).length ? (
        <div className="space-y-5">
          {(transcript.segments || []).map((segment) => (
            <div key={segment.id}>
              <p className="flex flex-wrap items-baseline gap-x-2 text-xs font-semibold text-slate-400">
                <span>{segment.speaker_name}</span>
                <span className="font-medium tabular-nums text-slate-300">
                  {formatTranscriptClock(segment.start_time_ms)}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-slate-800">
                {segment.text}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {Number(transcriptPagination.pages || 1) > 1 ? (
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={transcriptPage <= 1}
            onClick={() => onTranscriptPageChange(transcriptPage - 1)}
            className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {transcriptPagination.page} of {transcriptPagination.pages}
          </span>
          <button
            type="button"
            disabled={transcriptPage >= transcriptPagination.pages}
            onClick={() => onTranscriptPageChange(transcriptPage + 1)}
            className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
