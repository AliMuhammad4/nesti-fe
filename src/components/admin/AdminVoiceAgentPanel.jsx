"use client";

import { Fragment, useEffect, useState } from "react";
import {
  useAdminDecideVoiceSuggestion,
  useAdminStartVoiceCall,
  useAdminStopVoiceCall,
  useAdminVoicePlayback,
  useAdminVoiceRecordings,
  useAdminVoiceSuggestions,
  useAdminVoiceTranscript,
  useAdminVoiceCalls,
} from "@/hooks/useAdminApi";

function when(value) {
  if (!value) return "Not started";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not started";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function durationLabel(item) {
  if (!item?.started_at || !item?.ended_at) return "";
  const seconds = Math.max(0, Math.round((new Date(item.ended_at) - new Date(item.started_at)) / 1000));
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `${minutes}m ${rest}s` : `${rest}s`;
}

function TranscriptThread({ segments, minutes, empty }) {
  return (
    <div className="max-h-80 space-y-3 overflow-auto">
      {segments.map((segment) => {
        const maya = segment.speaker_name === "Nesti Voice";
        return (
          <div key={segment.id} className={maya ? "pl-8" : "pr-8"}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{maya ? "Maya" : "Caller"}</p>
            <p className={`mt-1 rounded-2xl px-3 py-2 text-sm leading-6 ${maya ? "bg-emerald-50 text-emerald-950" : "bg-slate-100 text-slate-800"}`}>{segment.text}</p>
          </div>
        );
      })}
      {!segments.length ? <p className="py-8 text-sm text-slate-500">{empty}</p> : null}
      {minutes ? <p className="border-t border-slate-200 pt-3 text-sm leading-6 text-slate-600">{minutes}</p> : null}
    </div>
  );
}

export default function AdminVoiceAgentPanel({
  targetType,
  targetId,
  defaultPhone = "",
  canWrite = false,
  purpose = "",
  personName = "",
  subscriptionLabel = "",
}) {
  const [phone, setPhone] = useState(defaultPhone);
  useEffect(() => {
    if (defaultPhone) setPhone((current) => current || defaultPhone);
  }, [defaultPhone]);
  const [consent, setConsent] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [openId, setOpenId] = useState("");
  const [audioUrls, setAudioUrls] = useState({});
  const calls = useAdminVoiceCalls(targetType, targetId);
  const start = useAdminStartVoiceCall();
  const stop = useAdminStopVoiceCall();
  const selected = openId || activeId || "";
  const selectedCall = calls.data?.items?.find((item) => item.id === selected);
  const liveCall = (calls.data?.items || []).find((item) => ["connecting", "ringing", "active"].includes(item.status));
  const live = Boolean(liveCall);
  const transcript = useAdminVoiceTranscript(selected, { live });
  const recordings = useAdminVoiceRecordings(selected);
  const suggestions = useAdminVoiceSuggestions(selected);
  const playback = useAdminVoicePlayback();
  const decide = useAdminDecideVoiceSuggestion();
  const callItems = calls.data?.items || [];
  const segments = transcript.data?.segments || [];
  const recordingItems = recordings.data?.items || [];
  const suggestionItems = suggestions.data?.items || [];
  function toggleCall(id) {
    setOpenId((current) => (current === id ? "" : id));
    setActiveId(id);
  }

  async function loadRecording(id) {
    if (audioUrls[id]) return;
    const data = await playback.mutateAsync({ id });
    if (data?.url) setAudioUrls((current) => ({ ...current, [id]: data.url }));
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight text-slate-950">Calls</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
          {liveCall?.status || selectedCall?.status || "Ready"}{subscriptionLabel ? ` · ${subscriptionLabel}` : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <label className="min-w-52 flex-1">
          <span className="sr-only">Phone</span>
          <input
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-950 outline-none focus:border-slate-300 focus:bg-white disabled:text-slate-700"
            value={phone}
            placeholder="Phone"
            onChange={(event) => setPhone(event.target.value)}
            disabled={!canWrite || Boolean(defaultPhone)}
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={consent}
            disabled={!canWrite}
            onChange={(event) => setConsent(event.target.checked)}
            className="accent-emerald-400"
          />
          Record and transcribe
        </label>
        {live ? (
          <button
            type="button"
            className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white"
            onClick={() => stop.mutate({ id: liveCall?.id })}
          >
            End call
          </button>
        ) : (
          <button
            type="button"
            className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-40"
            disabled={!canWrite || !consent || !phone || start.isPending}
            onClick={() =>
              start.mutate(
                {
                  target_type: targetType,
                  target_id: targetId,
                  to_phone: phone,
                  transcription_consent: true,
                },
                { onSuccess: (data) => { const id = data?.call?.id || ""; setActiveId(id); setOpenId(id); } },
              )
            }
          >
            {start.isPending ? "Starting" : "Call with Maya"}
          </button>
        )}
      </div>

      {!phone ? <p className="px-5 pb-2 text-xs text-amber-700">No phone on file.</p> : null}
      {selectedCall?.transcription_error_message ? <p className="px-5 pb-2 text-xs text-amber-700">{selectedCall.transcription_error_message}</p> : null}
      {selectedCall?.recording_last_error ? <p className="px-5 pb-2 text-xs text-amber-700">{selectedCall.recording_last_error}</p> : null}

      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Transcript</th>
              <th className="px-4 py-3">Recording</th>
            </tr>
          </thead>
          <tbody>
            {callItems.map((item) => {
              const open = openId === item.id;
              return (
                <Fragment key={item.id}>
                  <tr
                    className={`cursor-pointer border-t border-slate-100 ${open ? "bg-slate-50" : "hover:bg-slate-50/80"}`}
                    onClick={() => toggleCall(item.id)}
                  >
                    <td className="px-4 py-3 font-medium">{when(item.started_at || item.createdAt)}</td>
                    <td className="px-4 py-3 capitalize">{item.status}</td>
                    <td className="px-4 py-3">{durationLabel(item) || "—"}</td>
                    <td className="px-4 py-3">{item.to || phone || "—"}</td>
                    <td className="px-4 py-3 capitalize">{String(item.transcription_status || "").replaceAll("_", " ")}</td>
                    <td className="px-4 py-3 capitalize">{item.recording_count ? `${item.recording_count} file${item.recording_count === 1 ? "" : "s"}` : String(item.recording_status || "").replaceAll("_", " ")}</td>
                  </tr>
                  {open ? (
                    <tr className="border-t border-slate-100 bg-slate-50/70">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Transcript</p>
                            <div className="mt-3">
                              <TranscriptThread
                                segments={segments}
                                minutes={transcript.data?.minutes}
                                empty="This call has no transcript yet."
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Recording</p>
                            <div className="mt-3 space-y-3">
                              {recordingItems.map((recording) => (
                                <div key={recording.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                  <p className="text-sm font-medium capitalize text-slate-950">{recording.ingest_status} · {recording.duration_seconds || 0}s</p>
                                  {audioUrls[recording.id] ? (
                                    <audio className="mt-3 w-full" controls src={audioUrls[recording.id]} />
                                  ) : (
                                    <button
                                      type="button"
                                      className="mt-3 h-9 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white disabled:opacity-40"
                                      disabled={recording.ingest_status !== "ready" || playback.isPending}
                                      onClick={() => loadRecording(recording.id)}
                                    >
                                      {recording.ingest_status === "ready" ? "Play recording" : "Waiting for the file"}
                                    </button>
                                  )}
                                </div>
                              ))}
                              {!recordingItems.length ? <p className="text-sm text-slate-500">No recording file for this call.</p> : null}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            {!callItems.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-slate-400">No calls yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {targetType === "sales" || !suggestionItems.length ? null : (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Suggested updates</p>
          <div className="mt-3 space-y-2">
            {suggestionItems.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-slate-950">{item.action}</p>
                  <p className="text-xs text-slate-400">{item.rationale}</p>
                </div>
                {item.status === "pending" && canWrite ? (
                  <div className="flex gap-2">
                    <button type="button" className="text-xs font-semibold text-slate-950" onClick={() => decide.mutate({ id: item.id, decision: "approve" })}>Approve</button>
                    <button type="button" className="text-xs text-slate-500" onClick={() => decide.mutate({ id: item.id, decision: "reject" })}>Reject</button>
                  </div>
                ) : <span className="text-xs capitalize text-slate-400">{item.status}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
