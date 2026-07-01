"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchClientRecommendations, fetchProfessionals } from "@/lib/professionalsClient";
import useDynamicTablePageSize from "@/hooks/useDynamicTablePageSize";
import { ClientMatchExplanation, ClientMatchSummary } from "@/components/matching/MatchExplanation";

const ROLE_TABS = [
  { id: "agent", label: "Agents" },
  { id: "lawyer", label: "Lawyers" },
  { id: "mortgage_broker", label: "Mortgage Brokers" },
];
const RECOMMENDATION_ROLE_TABS = [{ id: "all", label: "All" }, ...ROLE_TABS];

function displayName(row) {
  const full = String(row?.full_name || "").trim();
  if (full) return full;
  const joined = [row?.first_name, row?.last_name].filter(Boolean).join(" ").trim();
  return joined || "Unnamed professional";
}

function initialsFor(row) {
  const name = displayName(row);
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

function formatRole(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DashboardProfessionalsTabs({
  token,
  initialRole = "agent",
  showTabs = true,
  paginationOutside = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const useRecommendations = searchParams?.get("recommended") === "1";
  const availableTabs = useRecommendations ? RECOMMENDATION_ROLE_TABS : ROLE_TABS;
  const normalizedInitialRole = availableTabs.some((t) => t.id === initialRole)
    ? initialRole
    : useRecommendations
      ? "all"
      : "agent";
  const [activeTab, setActiveTab] = useState(normalizedInitialRole);
  const [page, setPage] = useState(1);

  const updateUrl = useCallback(
    (nextParams) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      nextParams(params);
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const updateRoleInUrl = useCallback(
    (tabId) => {
      updateUrl((params) => {
        if (useRecommendations && tabId === "all") {
          params.delete("role");
        } else {
          params.set("role", tabId);
        }
      });
    },
    [updateUrl, useRecommendations],
  );

  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      setPage(1);
      updateRoleInUrl(tabId);
    },
    [updateRoleInUrl],
  );
  const pageSize = useDynamicTablePageSize({
    minRows: 10,
    maxRows: 24,
    rowHeight: 42,
    reserveHeight: 260,
  });
  const effectivePageSize = Math.max(10, pageSize - 2);

  useEffect(() => {
    setActiveTab(normalizedInitialRole);
  }, [normalizedInitialRole]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);
  const activeRole = activeTab === "all" ? "" : activeTab;
  const query = useQuery({
    queryKey: ["dashboard-professionals", token, activeRole, page, effectivePageSize, useRecommendations],
    enabled: Boolean(token),
    queryFn: () =>
      useRecommendations
        ? fetchClientRecommendations({ token, role: activeRole, limit: effectivePageSize })
        : fetchProfessionals({ token, role: activeRole, page, limit: effectivePageSize }),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const items = useMemo(
    () => (Array.isArray(query.data?.items) ? query.data.items : []),
    [query.data?.items],
  );
  const pagination = query.data?.pagination || {};
  const currentPage = Number(pagination.page || page || 1);
  const totalPages = Number(pagination.total_pages || 1);
  const total = Number(pagination.total || items.length || 0);
  const hasPrev = Boolean(pagination.has_prev_page || currentPage > 1);
  const hasNext = Boolean(pagination.has_next_page || currentPage < totalPages);
  const tableRows = useMemo(() => {
    if (items.length >= effectivePageSize) return items;
    return [...items, ...Array.from({ length: effectivePageSize - items.length }, () => null)];
  }, [items, effectivePageSize]);

  const paginationStrip = (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-border/80 bg-background-light/40 px-3 py-2.5 ${
        paginationOutside ? "rounded-md border" : "mt-2 border-t"
      }`}
    >
      <p className="text-xs text-text-muted">
        Page <span className="font-semibold text-text-heading">{currentPage}</span> of{" "}
        <span className="font-semibold text-text-heading">{totalPages}</span>
        {" · "}
        <span className="font-semibold text-text-heading">{total}</span> total
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPrev || query.isFetching}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs font-semibold text-text-heading transition hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <button
          type="button"
          disabled={!hasNext || query.isFetching}
          onClick={() => setPage((p) => p + 1)}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs font-semibold text-text-heading transition hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-border bg-white shadow-sm">
      <div className="shrink-0 border-b border-border/70 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-heading">
            {useRecommendations ? "Recommended for you" : "Professionals"}
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {useRecommendations
              ? "Ranked by your budget, location, timeline, and preferences."
              : "Browse registered profiles by professional role."}
          </p>
        </div>
        {showTabs ? (
          <div className="inline-flex rounded-lg border border-border bg-background-light p-0.5">
            {availableTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    active ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-heading"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      </div>

      {useRecommendations ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {query.isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`recommendation-skeleton-${index}`}
                className="h-[168px] animate-pulse rounded-xl border border-border bg-slate-50"
              />
            ))
          ) : query.isError ? (
            <div className="col-span-full rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
              {query.error?.message || "Failed to load recommendations."}
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-slate-50/70 p-8 text-center">
              <p className="text-sm font-medium text-text-heading">No matches yet</p>
              <p className="mt-1 text-xs text-text-muted">
                Complete your profile preferences to unlock better recommendations.
              </p>
            </div>
          ) : (
            items.map((row) => {
              return (
              <button
                key={row.id}
                type="button"
                onClick={() => router.push(`/professionals/${encodeURIComponent(row.id)}`)}
                className="group flex h-full flex-col rounded-xl border border-border bg-white p-3.5 text-left transition hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  {row.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.profile_image}
                      alt={displayName(row)}
                      className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-border/60"
                    />
                  ) : (
                    <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-sm font-bold text-primary ring-1 ring-primary/10">
                      {initialsFor(row)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-text-heading">{displayName(row)}</h3>
                        <p className="mt-0.5 truncate text-xs text-text-muted">
                          {row.company_name || formatRole(row.professional_type)}
                        </p>
                      </div>
                      <ClientMatchSummary tier={row.ai_match_tier} score={row.ai_match_score} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {formatRole(row.professional_type || row.role || "Professional")}
                      </span>
                      <span className="truncate text-[11px] text-text-muted">
                        {row.location || "Location not listed"}
                      </span>
                    </div>
                  </div>
                </div>
                <ClientMatchExplanation
                  score={row.ai_match_score}
                  breakdown={row.ai_match_breakdown}
                  tier={row.ai_match_tier}
                  compact
                />
              </button>
              );
            })
          )}
        </div>
        </div>
      ) : (
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto px-3 py-3">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-primary/[0.03] text-[10px] uppercase tracking-wide text-text-muted">
              <th className="px-2 py-1.5">Profile</th>
              <th className="px-2 py-1.5">Email</th>
              <th className="px-2 py-1.5">Phone</th>
              <th className="px-2 py-1.5">Company</th>
              <th className="px-2 py-1.5">Location</th>
              <th className="px-2 py-1.5">Leads</th>
              <th className="px-2 py-1.5">Deals</th>
              <th className="px-2 py-1.5">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {query.isLoading ? (
              <tr>
                <td className="px-2 py-3 text-xs text-text-muted" colSpan={8}>
                  Loading profiles...
                </td>
              </tr>
            ) : query.isError ? (
              <tr>
                <td className="px-2 py-3 text-xs text-red-600" colSpan={8}>
                  {query.error?.message || "Failed to load professionals."}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-2 py-3 text-xs text-text-muted" colSpan={8}>
                  No profiles found for this role.
                </td>
              </tr>
            ) : (
              tableRows.map((row, rowIndex) => {
                if (!row) {
                  return (
                    <tr key={`professionals-empty-row-${rowIndex}`} className="h-[42px]" aria-hidden>
                      {Array.from({ length: 8 }).map((_, cellIdx) => (
                        <td
                          key={`professionals-empty-cell-${rowIndex}-${cellIdx}`}
                          className="px-2 py-1.5"
                        >
                          <span className="invisible">—</span>
                        </td>
                      ))}
                    </tr>
                  );
                }
                return (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/professionals/${encodeURIComponent(row.id)}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/professionals/${encodeURIComponent(row.id)}`);
                    }
                  }}
                  className="cursor-pointer text-xs text-text-body transition hover:bg-primary/[0.06]"
                >
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      {row.profile_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.profile_image}
                          alt={displayName(row)}
                          className="h-8 w-8 rounded-lg object-cover ring-1 ring-border/60"
                        />
                      ) : (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.10] text-[10px] font-bold text-primary-dark ring-1 ring-primary/15">
                          {initialsFor(row)}
                        </span>
                      )}
                      <span className="block max-w-[170px] truncate font-medium text-text-heading" title={displayName(row)}>
                        {displayName(row)}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className="block max-w-[180px] truncate" title={row.email || ""}>
                      {row.email || "—"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">{row.phone || "—"}</td>
                  <td className="px-2 py-1.5">
                    <span className="block max-w-[140px] truncate" title={row.company_name || ""}>
                      {row.company_name || "—"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className="block max-w-[140px] truncate" title={row.location || ""}>
                      {row.location || "—"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-semibold tabular-nums">{Number(row.total_leads || 0)}</td>
                  <td className="px-2 py-1.5 font-semibold tabular-nums">{Number(row.total_deals || 0)}</td>
                  <td className="px-2 py-1.5 capitalize">{String(row.professional_type || row.role || "—").replace(/_/g, " ")}</td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}
      {!paginationOutside ? paginationStrip : null}
      </section>
      {paginationOutside ? (
        <div className={`shrink-0 ${useRecommendations ? "mt-3" : "mt-3"}`}>{paginationStrip}</div>
      ) : null}
    </>
  );
}
