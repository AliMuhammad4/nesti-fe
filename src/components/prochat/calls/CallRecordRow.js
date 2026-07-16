"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Loader2,
  Phone,
  PhoneCall,
  Users,
  Video,
} from "lucide-react";
import { formatCallDate, formatCallDuration, displayCallStatus } from "@/lib/callFormatters";
import { getCallNotesStatus } from "@/lib/callTranscriptionConsent";

function initialsFromName(name) {
  return (
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

function AvatarStack({ people, fallbackLabel }) {
  const visible = people.slice(0, 3);
  const overflow = Math.max(0, people.length - visible.length);

  if (!visible.length) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
        <Users size={18} aria-hidden="true" />
      </span>
    );
  }

  return (
    <div className="relative flex h-11 w-[3.25rem] shrink-0 items-center">
      {visible.map((person, index) => (
        <span
          key={person.id || `${person.full_name}-${index}`}
          className="absolute grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 ring-2 ring-white"
          style={{ left: index * 14, zIndex: visible.length - index }}
        >
          {person.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.profile_image} alt="" className="h-full w-full object-cover" />
          ) : (
            initialsFromName(person.full_name || fallbackLabel)
          )}
        </span>
      ))}
      {overflow > 0 ? (
        <span
          className="absolute grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-[10px] font-semibold text-white ring-2 ring-white"
          style={{ left: visible.length * 14, zIndex: 0 }}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export default function CallRecordRow({ record, client, forceEnded = false, onOpenDetails }) {
  const [startingCall, setStartingCall] = useState(false);
  const [now, setNow] = useState(null);

  const participants = Array.isArray(record?.participants) ? record.participants : [];
  const others = Array.isArray(record?.other_participants) ? record.other_participants : [];
  // Group threads stay labeled as group calls even with 2 people on the line.
  const isGroup =
    String(record?.thread?.thread_type || "").toLowerCase() === "group" ||
    participants.length > 2 ||
    others.length > 1;

  const caller = useMemo(() => {
    const callerId = String(record?.caller_id || "").trim();
    if (!callerId) return null;
    return participants.find((participant) => String(participant.id) === callerId) || null;
  }, [participants, record?.caller_id]);

  const person = others[0] || {};
  const groupTitle =
    String(record?.thread?.title || "").trim() ||
    (isGroup ? "Group call" : "");
  const dmName = String(person.full_name || "Participant");
  const title = isGroup ? groupTitle : dmName;
  const initials = initialsFromName(isGroup ? groupTitle : dmName);

  const outgoing = record.direction === "outgoing";
  const isVideo = record.call_type === "video";
  const rawStatus = String(record.status || "").toLowerCase();
  const liveStatuses = new Set(["preparing", "ringing", "connecting", "active"]);
  const effectiveStatus =
    forceEnded && liveStatuses.has(rawStatus) ? "ended" : record.status;
  const status = displayCallStatus(effectiveStatus);
  const notes = getCallNotesStatus(record.artifacts);
  const isLive = rawStatus === "active" && !forceEnded;
  const liveDuration =
    isLive && record.started_at && now
      ? Math.max(
          Number(record.duration_seconds) || 0,
          Math.floor((now - new Date(record.started_at).getTime()) / 1000),
        )
      : record.duration_seconds;

  const callerName = String(caller?.full_name || "").trim();
  const participantCount = participants.length || others.length + 1;
  const subtitle = isGroup
    ? outgoing
      ? `You started · ${participantCount} people`
      : callerName
        ? `${callerName} started · ${participantCount} people`
        : `Incoming group call · ${participantCount} people`
    : null;

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
          title,
          onResult: (result) => {
            setStartingCall(false);
            if (!result?.success && !result?.cancelled) {
              toast.error(result?.message || "Could not start the call.");
            }
          },
        },
      }),
    );
  };

  const neverStarted =
    ["declined", "unanswered"].includes(rawStatus) ||
    (rawStatus === "expired" && !record.started_at);
  const canOpenNotes =
    !neverStarted &&
    record.viewer_can_access_notes === true &&
    ["ready", "preparing", "minutes_failed", "failed", "empty"].includes(notes.key);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="grid grid-cols-1 gap-3 px-3 py-3 md:grid-cols-[minmax(0,1.2fr)_5.75rem_minmax(0,1.6fr)_13.75rem] md:items-center md:gap-4 md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          {isGroup ? (
            <AvatarStack people={others} fallbackLabel={groupTitle} />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              {person.profile_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.profile_image} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
          )}
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">{title}</span>
            {subtitle ? (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center md:justify-center">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${status.style}`}
          >
            {status.label}
          </span>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-500 sm:grid-cols-4 sm:gap-x-4">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {outgoing ? <ArrowUpRight size={12} className="shrink-0" /> : <ArrowDownLeft size={12} className="shrink-0" />}
            <span className="truncate">{outgoing ? "Outgoing" : "Incoming"}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {isVideo ? <Video size={12} className="shrink-0" /> : <Phone size={12} className="shrink-0" />}
            <span className="truncate">{isVideo ? "Video" : "Voice"}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5 tabular-nums">
            <Clock3 size={12} className="shrink-0" />
            <span className="truncate">{formatCallDuration(liveDuration)}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <CalendarDays size={12} className="shrink-0" />
            <span className="truncate">{formatCallDate(record.created_at)}</span>
          </span>
        </div>

        <div className="flex w-full items-center justify-end gap-2">
          <div className="flex h-9 w-[6.75rem] shrink-0 items-center justify-end">
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
          </div>
          <button
            type="button"
            onClick={callAgain}
            disabled={startingCall}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
            aria-label={isGroup ? `Call ${title} again` : `Call ${dmName} again`}
          >
            {startingCall ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />}
            <span className="hidden sm:inline">Call again</span>
          </button>
        </div>
      </div>
    </article>
  );
}
