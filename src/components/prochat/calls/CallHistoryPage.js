"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Loader2 } from "lucide-react";
import { useAppSelector } from "@/store";
import { fetchProChatCallRecords } from "@/lib/proChatClient";
import CallDetailModal from "@/components/prochat/calls/CallDetailModal";
import CallRecordRow from "@/components/prochat/calls/CallRecordRow";

const PAGE_SIZE = 12;
const TYPE_FILTERS = [
  { id: "", label: "All calls" },
  { id: "voice", label: "Voice" },
  { id: "video", label: "Video" },
];
const STATUS_OPTIONS = [
  ["", "All statuses"],
  ["ended", "Completed"],
  ["declined", "Declined"],
  ["expired", "Missed"],
  ["unanswered", "No answer"],
  ["active", "In progress"],
];

function recordNeedsLiveUpdates(record, locallyEndedRooms) {
  if (!record) return false;
  const roomName = String(record.room_name || "");
  if (record.status === "active" && !locallyEndedRooms.has(roomName)) return true;
  const artifacts = record.artifacts || {};
  if (["pending", "dispatching", "active"].includes(String(artifacts.transcription_status || ""))) {
    return true;
  }
  if (["pending", "processing"].includes(String(artifacts.minutes_status || ""))) {
    return true;
  }
  return false;
}

export default function CallHistoryPage({ client = false }) {
  const token = useAppSelector((state) => state.auth.token);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [callType, setCallType] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [locallyEndedRooms, setLocallyEndedRooms] = useState(() => new Set());
  const [selectedRecord, setSelectedRecord] = useState(null);

  const callsQuery = useQuery({
    queryKey: ["prochat-call-records", client, token, page, callType, status, from, to],
    queryFn: () =>
      fetchProChatCallRecords({
        token,
        client,
        page,
        limit: PAGE_SIZE,
        callType,
        status,
        from,
        to,
      }),
    enabled: mounted && Boolean(token),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
    refetchInterval: (query) => {
      const items = Array.isArray(query.state.data?.records) ? query.state.data.records : [];
      return items.some((record) => recordNeedsLiveUpdates(record, locallyEndedRooms))
        ? 10_000
        : false;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  const records = useMemo(
    () => (Array.isArray(callsQuery.data?.records) ? callsQuery.data.records : []),
    [callsQuery.data?.records],
  );
  const hasLiveUpdates = useMemo(
    () => records.some((record) => recordNeedsLiveUpdates(record, locallyEndedRooms)),
    [locallyEndedRooms, records],
  );
  const refetchCalls = callsQuery.refetch;
  const pagination = callsQuery.data?.pagination || {};
  const totalPages = Math.max(1, Number(pagination.pages) || 1);
  const total = Math.max(0, Number(pagination.total) || 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const stopEndedTimer = (event) => {
      const roomName = String(event?.detail?.roomName || "").trim();
      if (!roomName) return;
      setLocallyEndedRooms((current) => {
        const next = new Set(current);
        next.add(roomName);
        return next;
      });
      void refetchCalls();
    };
    window.addEventListener("nesti:call-history-ended", stopEndedTimer);
    return () =>
      window.removeEventListener("nesti:call-history-ended", stopEndedTimer);
  }, [refetchCalls]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetPage = (setter, value) => {
    setter(value);
    setPage(1);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 ring-1 ring-primary/20">
              <History size={19} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Call History</h1>
              <p className="text-xs text-gray-600">Review your voice and video call activity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${callsQuery.isFetching ? "animate-pulse" : ""}`} />
              {hasLiveUpdates ? "Live updates" : "Updated on open"}
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {total} {total === 1 ? "call" : "calls"}
            </span>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.id || "all"}
                type="button"
                onClick={() => resetPage(setCallType, filter.id)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                  callType === filter.id ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(event) => resetPage(setStatus, event.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 outline-none focus:border-primary"
              aria-label="Filter by call status"
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value || "all"} value={value}>{label}</option>
              ))}
            </select>
            <input
              type="date"
              value={from}
              onChange={(event) => resetPage(setFrom, event.target.value)}
              className="h-9 rounded-lg border border-gray-200 px-2 text-xs text-gray-600 outline-none focus:border-primary"
              aria-label="Calls from date"
            />
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => resetPage(setTo, event.target.value)}
              className="h-9 rounded-lg border border-gray-200 px-2 text-xs text-gray-600 outline-none focus:border-primary"
              aria-label="Calls to date"
            />
          </div>
        </div>

        {callsQuery.isLoading ? (
          <div className="grid min-h-64 place-items-center rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <p className="mt-2 text-xs text-gray-500">Loading call history…</p>
            </div>
          </div>
        ) : callsQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
            {callsQuery.error?.message || "Failed to load call history."}
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center shadow-sm">
            <History size={34} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-900">No call records found</p>
            <p className="mt-1 text-xs text-gray-500">Your completed, missed, and declined calls will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <CallRecordRow
                key={record.id}
                record={record}
                client={client}
                forceEnded={locallyEndedRooms.has(String(record.room_name || ""))}
                onOpenDetails={setSelectedRecord}
              />
            ))}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-medium text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || callsQuery.isFetching}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="h-8 rounded-lg border border-gray-200 px-3 text-[11px] font-semibold text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[11px] font-semibold text-gray-500">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages || callsQuery.isFetching}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  className="h-8 rounded-lg border border-gray-200 px-3 text-[11px] font-semibold text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CallDetailModal
        open={Boolean(selectedRecord)}
        callId={selectedRecord?.id}
        token={token}
        client={client}
        initialRecord={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
