"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, NotebookPen, X } from "lucide-react";
import {
  fetchProChatCallArtifacts,
  fetchProChatCallMinutes,
  fetchProChatCallRecord,
  fetchProChatCallTranscript,
} from "@/lib/proChatClient";
import {
  callStatusLabel,
  formatCallDateTime,
  formatCallDuration,
} from "@/lib/callFormatters";
import {
  getCallNotesStatus,
  notesToneClasses,
  participantNotesChoiceLabel,
} from "@/lib/callTranscriptionConsent";
import CallNotesTab from "./CallNotesTab";
import CallTranscriptTab from "./CallTranscriptTab";

const TABS = ["Notes", "Transcript", "Overview", "Participants"];
const TRANSCRIPT_PAGE_SIZE = 50;

export default function CallDetailModal({ open, callId, token, client = false, initialRecord, onClose }) {
  const [tab, setTab] = useState("Notes");
  const [transcriptPage, setTranscriptPage] = useState(1);

  useEffect(() => {
    if (!open) return;
    setTab("Notes");
    setTranscriptPage(1);
  }, [callId, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const detailQuery = useQuery({
    queryKey: ["prochat-call-detail", client, callId],
    queryFn: () => fetchProChatCallRecord({ token, callId, client }),
    enabled: open && Boolean(token && callId),
    initialData: initialRecord ? { record: initialRecord } : undefined,
  });
  const artifactsQuery = useQuery({
    queryKey: ["prochat-call-artifacts", client, callId],
    queryFn: () => fetchProChatCallArtifacts({ token, callId, client }),
    enabled: open && Boolean(token && callId),
    refetchInterval: (query) => {
      if (!open) return false;
      const notes = getCallNotesStatus(query.state.data?.artifacts);
      return notes.key === "preparing" ? 10_000 : false;
    },
  });
  const notesStatus = useMemo(
    () =>
      getCallNotesStatus(
        artifactsQuery.data?.artifacts || initialRecord?.artifacts || {},
      ),
    [artifactsQuery.data?.artifacts, initialRecord?.artifacts],
  );

  const transcriptQuery = useQuery({
    queryKey: ["prochat-call-transcript", client, callId, transcriptPage],
    queryFn: () =>
      fetchProChatCallTranscript({
        token,
        callId,
        client,
        page: transcriptPage,
        limit: TRANSCRIPT_PAGE_SIZE,
      }),
    enabled:
      open &&
      Boolean(token && callId) &&
      (tab === "Transcript" || ["ready", "preparing", "minutes_failed"].includes(notesStatus.key)),
  });
  const minutesQuery = useQuery({
    queryKey: ["prochat-call-minutes", client, callId],
    queryFn: () => fetchProChatCallMinutes({ token, callId, client }),
    enabled:
      open &&
      Boolean(token && callId) &&
      (tab === "Notes" || ["ready", "preparing", "minutes_failed"].includes(notesStatus.key)),
  });

  useEffect(() => {
    if (!open || notesStatus.key === "preparing") return;
    if (tab === "Notes") void minutesQuery.refetch();
    if (tab === "Transcript") void transcriptQuery.refetch();
    // Artifact status is the single polling source; refresh heavy payloads on transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesStatus.key, open, tab]);

  if (!open || typeof document === "undefined") return null;
  const record = detailQuery.data?.record || initialRecord || {};
  const artifacts = artifactsQuery.data?.artifacts || record.artifacts || {};
  const notes = getCallNotesStatus(artifacts);
  const participants = Array.isArray(record.participants) ? record.participants : [];
  const transcript = transcriptQuery.data || {};
  const transcriptPagination = transcript.pagination || {};
  const minutes = minutesQuery.data?.minutes;
  const minutesFailedMessage =
    minutesQuery.data?.processing?.last_error || notes.emptyMinutes;
  const preparingNotes = (minutesQuery.isLoading || notes.key === "preparing") && !minutes;
  const preparingTranscript =
    transcriptQuery.isLoading ||
    (notes.key === "preparing" && !(transcript.segments || []).length);

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483600] grid place-items-center bg-slate-950/50 p-3 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Call notes"
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700">
                <NotebookPen size={17} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Call notes
              </h2>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${notesToneClasses(notes.tone)}`}
              >
                {notes.label}
              </span>
            </div>
            {notes.key !== "preparing" && notes.detail ? (
              <p className="mt-2 text-sm text-slate-500">{notes.detail}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X size={18} />
          </button>
        </header>

        <nav
          className="flex gap-1 border-b border-slate-200 px-3 sm:px-4"
          aria-label="Call detail sections"
        >
          {TABS.map((item) => {
            const active = tab === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-2.5 text-sm font-medium transition focus:outline-none sm:px-4 ${
                  active
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item}
                {active ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-slate-900" />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {detailQuery.isLoading && !record?.id ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            </div>
          ) : null}

          {tab === "Notes" ? (
            <CallNotesTab
              notes={notes}
              minutes={minutes}
              preparingNotes={preparingNotes}
              minutesFailedMessage={minutesFailedMessage}
              minutesQuery={minutesQuery}
            />
          ) : null}

          {tab === "Transcript" ? (
            <CallTranscriptTab
              notes={notes}
              transcript={transcript}
              transcriptPagination={transcriptPagination}
              transcriptPage={transcriptPage}
              preparingTranscript={preparingTranscript}
              onTranscriptPageChange={setTranscriptPage}
            />
          ) : null}

          {tab === "Overview" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Status", callStatusLabel(record.status)],
                ["Type", record.call_type === "video" ? "Video" : "Voice"],
                ["Direction", record.direction === "outgoing" ? "Outgoing" : "Incoming"],
                ["Started", formatCallDateTime(record.started_at || record.created_at)],
                ["Ended", formatCallDateTime(record.ended_at)],
                ["Duration", formatCallDuration(record.duration_seconds, { empty: "—" })],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "Participants" ? (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {participant.full_name}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {participant.role || "Participant"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${
                      participant.transcription_consent === true
                        ? "text-emerald-700"
                        : participant.transcription_consent === false
                          ? "text-slate-500"
                          : "text-amber-700"
                    }`}
                  >
                    {participant.transcription_consent === true ? (
                      <CheckCircle2 size={14} aria-hidden="true" />
                    ) : null}
                    {participantNotesChoiceLabel(participant.transcription_consent)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>,
    document.body,
  );
}
