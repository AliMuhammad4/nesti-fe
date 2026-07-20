"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  NotebookPen,
  Phone,
  Users,
  Video,
} from "lucide-react";
import {
  fetchProChatCallArtifacts,
  fetchProChatCallMinutes,
  fetchProChatCallRecord,
  fetchProChatCallTranscript,
} from "@/lib/proChatClient";
import {
  callStatusLabel,
  formatCallDate,
  formatCallDuration,
} from "@/lib/callFormatters";
import {
  getCallNotesStatus,
  participantNotesChoiceLabel,
} from "@/lib/callTranscriptionConsent";
import CallNotesTab from "./CallNotesTab";
import CallTranscriptTab from "./CallTranscriptTab";

const TABS = [
  { id: "minutes", label: "Minutes" },
  { id: "transcript", label: "Transcript" },
  { id: "overview", label: "Overview" },
  { id: "participants", label: "Participants" },
];
const TRANSCRIPT_PAGE_SIZE = 50;

function initialsFromName(name) {
  return (
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C"
  );
}

export default function CallDetailView({
  callId,
  token,
  client = false,
  backHref = "/call-history",
  initialRecord = null,
}) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState("minutes");
  const [transcriptPage, setTranscriptPage] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTab("minutes");
    setTranscriptPage(1);
  }, [callId]);

  const detailQuery = useQuery({
    queryKey: ["prochat-call-detail", client, callId],
    queryFn: () => fetchProChatCallRecord({ token, callId, client }),
    enabled: mounted && Boolean(token && callId),
    initialData: initialRecord ? { record: initialRecord } : undefined,
  });
  const record = detailQuery.data?.record || initialRecord || {};
  const canAccessNotes = record?.viewer_can_access_notes === true;

  const artifactsQuery = useQuery({
    queryKey: ["prochat-call-artifacts", client, callId],
    queryFn: () => fetchProChatCallArtifacts({ token, callId, client }),
    enabled: mounted && Boolean(token && callId) && canAccessNotes,
    refetchInterval: (query) => {
      const notes = getCallNotesStatus(query.state.data?.artifacts, {
        callStatus: record.status,
        endedAt: record.ended_at,
      });
      return notes.key === "preparing" ? 10_000 : false;
    },
  });

  const notesStatus = useMemo(
    () =>
      getCallNotesStatus(
        canAccessNotes
          ? artifactsQuery.data?.artifacts || record.artifacts || {}
          : {
              transcription_status: "disabled",
              transcription_error_code: "viewer_no_transcription_consent",
              minutes_status: "not_ready",
            },
        {
          callStatus: record.status,
          endedAt: record.ended_at,
        },
      ),
    [
      artifactsQuery.data?.artifacts,
      canAccessNotes,
      record.artifacts,
      record.ended_at,
      record.status,
    ],
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
      mounted &&
      Boolean(token && callId) &&
      canAccessNotes &&
      (tab === "transcript" ||
        ["ready", "preparing", "minutes_failed"].includes(notesStatus.key)),
  });

  const minutesQuery = useQuery({
    queryKey: ["prochat-call-minutes", client, callId],
    queryFn: () => fetchProChatCallMinutes({ token, callId, client }),
    enabled:
      mounted &&
      Boolean(token && callId) &&
      canAccessNotes &&
      (tab === "minutes" ||
        ["ready", "preparing", "minutes_failed"].includes(notesStatus.key)),
  });

  useEffect(() => {
    if (!canAccessNotes || notesStatus.key === "preparing") return;
    if (tab === "minutes") void minutesQuery.refetch();
    if (tab === "transcript") void transcriptQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessNotes, notesStatus.key, tab]);

  const participants = Array.isArray(record.participants) ? record.participants : [];
  const others = Array.isArray(record.other_participants) ? record.other_participants : [];
  // Group threads stay labeled as group calls even with 2 people on the line.
  const isGroup =
    String(record?.thread?.thread_type || "").toLowerCase() === "group" ||
    participants.length > 2 ||
    others.length > 1;
  const person = others[0] || {};
  const caller =
    participants.find(
      (participant) => String(participant.id) === String(record.caller_id || ""),
    ) || null;
  const title = isGroup
    ? String(record?.thread?.title || "").trim() || "Group call"
    : String(person.full_name || "").trim() ||
      String(record?.thread?.title || "").trim() ||
      "Call details";
  const conversationTitle = isGroup
    ? record.direction === "outgoing"
      ? `You started · ${participants.length || others.length + 1} people`
      : `${String(caller?.full_name || "Someone").trim()} started · ${participants.length || others.length + 1} people`
    : record.thread?.title ||
      (record.thread?.thread_type === "dm" ? "Direct conversation" : "Conversation");
  const isVideo = String(record.call_type || "").toLowerCase() === "video";
  const notes = notesStatus;
  const transcript = transcriptQuery.data || {};
  const transcriptPagination = transcript.pagination || {};
  const minutes = minutesQuery.data?.minutes;
  const minutesFailedMessage =
    minutesQuery.data?.processing?.last_error || notes.emptyMinutes;
  const preparingNotes = (minutesQuery.isLoading || notes.key === "preparing") && !minutes;
  const preparingTranscript =
    transcriptQuery.isLoading ||
    (notes.key === "preparing" && !(transcript.segments || []).length);
  const participantCount = participants.length;

  // Avoid SSR/client icon + locale mismatches (same pattern as CallHistoryPage).
  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to call history
          </Link>
        </div>

        <div className="mb-4 flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 ring-1 ring-primary/20">
            <NotebookPen size={20} className="text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
              Minutes of meeting
            </h1>
            <p className="mt-0.5 text-xs text-gray-600">
              {notes.key === "ready"
                ? "Summary, transcript, and participants from this call."
                : notes.detail ||
                  "Review summary, transcript, and participants from this call."}
            </p>
          </div>
        </div>

        <section className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-gray-100 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">
                {person.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.profile_image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initialsFromName(title)
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
                <p className="truncate text-xs text-gray-500">{conversationTitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                {isVideo ? <Video size={12} /> : <Phone size={12} />}
                {isVideo ? "Video" : "Voice"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium tabular-nums text-gray-600">
                <Clock3 size={12} />
                {formatCallDuration(record.duration_seconds, { empty: "—" })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                <CalendarDays size={12} />
                {formatCallDate(record.started_at || record.created_at)}
              </span>
              {participantCount ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                  <Users size={12} />
                  {participantCount} {participantCount === 1 ? "person" : "people"}
                </span>
              ) : null}
            </div>
          </div>

          <div className="border-b border-gray-100 px-3 py-2.5 sm:px-4">
            <nav
              className="inline-flex w-full max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-0.5 sm:w-auto"
              aria-label="Call detail sections"
            >
              {TABS.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`shrink-0 rounded-md px-3.5 py-2 text-[11px] font-semibold transition ${
                      active
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {item.label === "Minutes" ? "Minutes of meeting" : item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-4 py-5 sm:px-6 sm:py-6">
            {detailQuery.isLoading && !record?.id ? (
              <div className="grid min-h-56 place-items-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  <p className="mt-2 text-xs text-gray-500">Loading minutes…</p>
                </div>
              </div>
            ) : null}

            {!detailQuery.isLoading || record?.id ? (
              <>
                {tab === "minutes" ? (
                  <CallNotesTab
                    notes={notes}
                    minutes={minutes}
                    preparingNotes={preparingNotes}
                    minutesFailedMessage={minutesFailedMessage}
                    minutesQuery={minutesQuery}
                  />
                ) : null}

                {tab === "transcript" ? (
                  <CallTranscriptTab
                    notes={notes}
                    transcript={transcript}
                    transcriptPagination={transcriptPagination}
                    transcriptPage={transcriptPage}
                    preparingTranscript={preparingTranscript}
                    onTranscriptPageChange={setTranscriptPage}
                    participants={participants}
                  />
                ) : null}

                {tab === "overview" ? (
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Status", callStatusLabel(record.status)],
                      ["Type", isVideo ? "Video" : "Voice"],
                      [
                        "Direction",
                        record.direction === "outgoing" ? "Outgoing" : "Incoming",
                      ],
                      [
                        "Duration",
                        formatCallDuration(record.duration_seconds, { empty: "—" }),
                      ],
                      [
                        "Started",
                        formatCallDate(record.started_at || record.created_at),
                      ],
                      ["Ended", formatCallDate(record.ended_at)],
                      ["Conversation", conversationTitle],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5"
                      >
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                          {label}
                        </dt>
                        <dd className="mt-1.5 text-sm font-semibold text-gray-900">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {tab === "participants" ? (
                  <ul className="space-y-2.5">
                    {participants.map((participant) => (
                      <li
                        key={participant.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3 shadow-sm"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/15">
                            {participant.profile_image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={participant.profile_image}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initialsFromName(participant.full_name)
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {participant.full_name}
                            </p>
                            <p className="text-[11px] capitalize text-gray-500">
                              {participant.role || "Participant"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            participant.transcription_consent === true
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : participant.transcription_consent === false
                                ? "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                          }`}
                        >
                          {participant.transcription_consent === true ? (
                            <CheckCircle2 size={13} aria-hidden="true" />
                          ) : null}
                          {participantNotesChoiceLabel(participant.transcription_consent)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
