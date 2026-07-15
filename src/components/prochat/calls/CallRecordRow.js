"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Loader2,
  MessageSquare,
  Phone,
  PhoneCall,
  Video,
} from "lucide-react";
import { formatCallDate, formatCallDuration, displayCallStatus } from "@/lib/callFormatters";
import { getCallNotesStatus } from "@/lib/callTranscriptionConsent";

export default function CallRecordRow({ record, client, forceEnded = false, onOpenDetails }) {
  const [startingCall, setStartingCall] = useState(false);
  const [now, setNow] = useState(null);
  const person = record?.other_participants?.[0] || {};
  const name = String(person.full_name || "Participant");
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P";
  const outgoing = record.direction === "outgoing";
  const isVideo = record.call_type === "video";
  const status = displayCallStatus(record.status);
  const notes = getCallNotesStatus(record.artifacts);
  const isLive = record.status === "active" && !forceEnded;
  const liveDuration =
    isLive && record.started_at && now
      ? Math.max(
          Number(record.duration_seconds) || 0,
          Math.floor((now - new Date(record.started_at).getTime()) / 1000),
        )
      : record.duration_seconds;
  const conversationTitle =
    record.thread?.title ||
    (record.thread?.thread_type === "dm" ? "Direct conversation" : "Conversation");

  useEffect(() => {
    if (!isLive || !record.started_at) return undefined;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isLive, record.started_at]);

  const callAgain = () => {
    if (!record.thread_id || startingCall) return;
    setStartingCall(true);
    window.dispatchEvent(
      new CustomEvent("nesti:start-call", {
        detail: {
          threadId: record.thread_id,
          callType: record.call_type,
          client,
          title: name,
          onResult: (result) => {
            setStartingCall(false);
            if (!result?.success) {
              toast.error(result?.message || "Could not start the call.");
            }
          },
        },
      }),
    );
  };

  const callCouldHaveNotes = !["declined", "expired", "unanswered"].includes(
    String(record.status || "").toLowerCase(),
  );
  const canOpenNotes =
    callCouldHaveNotes &&
    ["ready", "preparing", "minutes_failed", "empty", "failed"].includes(notes.key);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-3 px-3 py-3 sm:grid sm:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] sm:items-center sm:gap-5 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
            {person.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.profile_image} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-slate-900">{name}</span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${status.style}`}
              >
                {status.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            {outgoing ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
            {outgoing ? "Outgoing" : "Incoming"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            {isVideo ? <Video size={12} /> : <Phone size={12} />}
            {isVideo ? "Video" : "Voice"}
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Clock3 size={12} />
            {formatCallDuration(liveDuration)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={12} />
            {formatCallDate(record.created_at)}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MessageSquare size={12} className="shrink-0" />
            <span className="truncate">{conversationTitle}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:justify-self-end sm:self-center">
          {canOpenNotes ? (
            <button
              type="button"
              onClick={() => onOpenDetails?.(record)}
              className={`inline-flex h-9 items-center rounded-full px-3.5 text-xs font-semibold transition ${
                notes.key === "ready"
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              {notes.key === "ready" ? "Open notes" : "View notes"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={callAgain}
            disabled={startingCall}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
            aria-label={`Call ${name} again`}
          >
            {startingCall ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />}
            <span className="hidden sm:inline">Call again</span>
          </button>
        </div>
      </div>
    </article>
  );
}
