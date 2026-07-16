"use client";

import { useMemo } from "react";
import {
  formatTranscriptClock,
  resolveTranscriptDisplayTimes,
} from "@/lib/callTranscriptionConsent";
import { CallDetailEmptyState, CallDetailPreparingState } from "./CallDetailStates";

function speakerInitials(name) {
  return (
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function SpeakerAvatar({ name, profileImage }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-[11px] font-bold text-primary ring-1 ring-primary/15">
      {profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profileImage} alt="" className="h-full w-full object-cover" />
      ) : (
        speakerInitials(name)
      )}
    </span>
  );
}

export default function CallTranscriptTab({
  notes,
  transcript,
  transcriptPagination,
  transcriptPage,
  preparingTranscript,
  onTranscriptPageChange,
  participants = [],
}) {
  const segments = useMemo(
    () => resolveTranscriptDisplayTimes(transcript.segments),
    [transcript.segments],
  );
  const speakerLookup = useMemo(() => {
    const byId = new Map();
    const byName = new Map();
    for (const participant of participants || []) {
      const id = String(participant?.id || participant?.user_id || "").trim();
      const name = String(participant?.full_name || "").trim().toLowerCase();
      const image = String(participant?.profile_image || "").trim();
      if (id) byId.set(id, image);
      if (name) byName.set(name, image);
    }
    return { byId, byName };
  }, [participants]);

  const resolveProfileImage = (segment) => {
    const id = String(segment?.speaker_user_id || "").trim();
    if (id && speakerLookup.byId.has(id)) {
      return speakerLookup.byId.get(id) || "";
    }
    const name = String(segment?.speaker_name || "").trim().toLowerCase();
    if (name && speakerLookup.byName.has(name)) {
      return speakerLookup.byName.get(name) || "";
    }
    return "";
  };

  return (
    <div className="w-full">
      {preparingTranscript && !segments.length ? (
        <CallDetailPreparingState
          title="Preparing transcript"
          message={notes.emptyTranscript}
        />
      ) : null}
      {!preparingTranscript && !segments.length ? (
        <CallDetailEmptyState message={notes.emptyTranscript} />
      ) : null}
      {segments.length ? (
        <div className="space-y-1">
          {segments.map((segment, index) => {
            const previous = segments[index - 1];
            const sameSpeaker =
              previous &&
              String(previous.speaker_user_id || previous.speaker_name) ===
                String(segment.speaker_user_id || segment.speaker_name);
            const profileImage = resolveProfileImage(segment);
            const displayTimeMs = Number(segment.display_time_ms ?? segment.start_time_ms ?? 0);
            const previousDisplayTimeMs = previous
              ? Number(previous.display_time_ms ?? previous.start_time_ms ?? 0)
              : null;
            const showContinuationClock =
              sameSpeaker &&
              previousDisplayTimeMs != null &&
              Math.floor(displayTimeMs / 1000) !== Math.floor(previousDisplayTimeMs / 1000);
            return (
              <div
                key={segment.id}
                className={
                  sameSpeaker
                    ? "pl-[3.25rem] pr-1 py-1.5"
                    : "mt-3 flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-3 first:mt-0"
                }
              >
                {!sameSpeaker ? (
                  <SpeakerAvatar
                    name={segment.speaker_name}
                    profileImage={profileImage}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  {!sameSpeaker ? (
                    <p className="mb-1 flex flex-wrap items-baseline gap-x-2 text-[11px]">
                      <span className="font-semibold text-gray-900">
                        {segment.speaker_name}
                      </span>
                      <span className="font-medium tabular-nums text-gray-400">
                        {formatTranscriptClock(displayTimeMs)}
                      </span>
                    </p>
                  ) : showContinuationClock ? (
                    <p className="mb-0.5 text-[10px] tabular-nums text-gray-300">
                      {formatTranscriptClock(displayTimeMs)}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                    {segment.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {Number(transcriptPagination.pages || 1) > 1 ? (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
          <button
            type="button"
            disabled={transcriptPage <= 1}
            onClick={() => onTranscriptPageChange(transcriptPage - 1)}
            className="h-8 rounded-lg border border-gray-200 px-3 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[11px] font-medium text-gray-500">
            Page {transcriptPagination.page} of {transcriptPagination.pages}
          </span>
          <button
            type="button"
            disabled={transcriptPage >= transcriptPagination.pages}
            onClick={() => onTranscriptPageChange(transcriptPage + 1)}
            className="h-8 rounded-lg border border-gray-200 px-3 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
