"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Flame,
  GraduationCap,
  Handshake,
  Inbox,
  Link2,
  MessageCircle,
  MousePointerClick,
  Send,
  Shuffle,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { fetchRewardsLedger } from "@/lib/inviteClient";
import {
  formatLedgerActivity,
  formatLedgerDate,
  formatLedgerEarned,
  getLedgerActivityVisual,
  getLedgerCategory,
  getLedgerSubtitle,
} from "@/lib/rewardsFormat";

const ROWS_PER_PAGE = 8;

const ICON_COMPONENTS = {
  BadgeCheck,
  Bot,
  CircleDollarSign,
  Flame,
  GraduationCap,
  Handshake,
  Inbox,
  Link2,
  MessageCircle,
  MousePointerClick,
  Send,
  Shuffle,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Zap,
};

const STATUS_STYLES = {
  Success: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  Active: "bg-sky-50 text-sky-700 ring-sky-200/60",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200/60",
};

function StatusBadge({ status }) {
  const key = String(status || "Pending");
  const cls = STATUS_STYLES[key] || STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ring-1 ring-inset ${cls}`}>
      {key}
    </span>
  );
}

function CategoryBadge({ row }) {
  const category = getLedgerCategory(row);
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold ring-1 ring-inset ${category.toneClass}`}
    >
      {category.label}
    </span>
  );
}

function EarnedCell({ row }) {
  const earned = formatLedgerEarned(row);

  if (earned.kind === "empty") {
    return <span className="text-[11px] text-slate-400">—</span>;
  }

  const isCredit = earned.kind === "credit";

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1">
        <span
          className={`text-xs font-bold tabular-nums ${isCredit ? "text-emerald-700" : "text-amber-800"}`}
        >
          {earned.sign}
          {isCredit ? `$${earned.amount}` : earned.amount}
        </span>
        <span
          className={`rounded px-1 py-px text-[8px] font-bold uppercase tracking-wide ${
            isCredit ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"
          }`}
        >
          {earned.suffix}
        </span>
      </div>
    </div>
  );
}

function ActivityCell({ row }) {
  const label = formatLedgerActivity(row);
  const subtitle = getLedgerSubtitle(row);
  const visual = getLedgerActivityVisual(row);
  const Icon = ICON_COMPONENTS[visual.icon] || Sparkles;

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span
        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${visual.toneClass}`}
      >
        <Icon size={13} strokeWidth={2.25} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-text-heading" title={label}>
          {label}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-slate-500" title={subtitle}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function DateCell({ row }) {
  const { relative, absolute } = formatLedgerDate(row.occurred_at);
  const dt = row?.occurred_at ? new Date(row.occurred_at) : null;
  const hasValidDate = dt && !Number.isNaN(dt.getTime());
  const dateOnly = hasValidDate
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(dt)
    : relative;
  const timeOnly = hasValidDate
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(dt)
    : "";
  const showTimeOnly = Boolean(timeOnly) && (relative === dateOnly || /ago$/i.test(relative));
  return (
    <div className="min-w-[72px] text-center">
      <p className="text-[11px] font-medium tabular-nums text-text-heading">{dateOnly}</p>
      {absolute ? (
        <p className="mt-0.5 text-[9px] leading-tight text-slate-400" title={absolute}>
          {showTimeOnly ? timeOnly : absolute}
        </p>
      ) : null}
    </div>
  );
}

export default function NetworkCircleLedger({ token, enabled = true }) {
  const [page, setPage] = useState(1);

  const ledgerQuery = useQuery({
    queryKey: ["analytics-rewards-ledger", token, page],
    enabled: Boolean(token) && enabled,
    queryFn: () => fetchRewardsLedger({ token, page, limit: ROWS_PER_PAGE }),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const rows = Array.isArray(ledgerQuery.data?.items) ? ledgerQuery.data.items : [];
  const pagination = ledgerQuery.data?.pagination || {};
  const totalPages = Math.max(1, Number(pagination.total_pages || 1));
  const currentPage = Number(pagination.page || page || 1);
  const total = Number(pagination.total || 0);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-primary" />
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Rewards ledger
          </h2>
        </div>
        {total > 0 ? (
          <span className="text-[10px] tabular-nums text-slate-400">{total} total events</span>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2 font-semibold">Activity</th>
                <th className="hidden px-2 py-2 font-semibold sm:table-cell">Category</th>
                <th className="px-2 py-2 text-center font-semibold">When</th>
                <th className="hidden px-2 py-2 text-center font-semibold md:table-cell">Status</th>
                <th className="px-3 py-2 text-right font-semibold">Reward</th>
              </tr>
            </thead>
            <tbody>
              {ledgerQuery.isLoading && !ledgerQuery.data ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[11px] text-slate-400">
                    Loading rewards…
                  </td>
                </tr>
              ) : ledgerQuery.isError ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-[11px] text-amber-700">
                    Could not load ledger.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[11px] text-slate-400">
                    No reward activity yet. Share your invite link to start earning.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50/80 ${
                      ledgerQuery.isFetching ? "opacity-70" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 align-middle">
                      <ActivityCell row={row} />
                    </td>
                    <td className="hidden px-2 py-2.5 align-middle sm:table-cell">
                      <CategoryBadge row={row} />
                    </td>
                    <td className="px-2 py-2.5 text-center align-middle">
                      <DateCell row={row} />
                    </td>
                    <td className="hidden px-2 py-2.5 align-middle md:table-cell">
                      <div className="flex justify-center">
                        <StatusBadge status={row.status} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <EarnedCell row={row} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-3 py-1.5">
            <p className="text-[10px] text-slate-500">
              Page <span className="font-semibold text-text-heading">{currentPage}</span> of{" "}
              <span className="font-semibold text-text-heading">{totalPages}</span>
              <span className="mx-1 text-slate-300">·</span>
              Showing{" "}
              <span className="font-semibold text-text-heading">{rows.length}</span> of{" "}
              <span className="font-semibold text-text-heading">{total}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!hasPrev || ledgerQuery.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-6 items-center gap-0.5 rounded border border-slate-200 bg-white px-2 text-[10px] font-semibold text-text-heading transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft size={12} />
                Prev
              </button>
              <button
                type="button"
                disabled={!hasNext || ledgerQuery.isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-6 items-center gap-0.5 rounded border border-slate-200 bg-white px-2 text-[10px] font-semibold text-text-heading transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                Next
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
