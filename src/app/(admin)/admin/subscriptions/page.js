"use client";

import { useMemo, useState } from "react";
import { useAdminPatchSubscription, useAdminSubscriptions } from "@/hooks/useAdminApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  AdminSelect,
  AdminTable,
  adminButtonClass,
  adminInputClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const KIND_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "professional", label: "Professional" },
  { value: "client", label: "Client" },
];

const EDIT_KIND_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "client", label: "Client" },
];

const PLAN_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "enterprise", label: "Enterprise" },
];

const TIER_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "pro", label: "Pro" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "free_trial", label: "Free trial" },
  { value: "trialing", label: "Trialing" },
  { value: "active", label: "Active" },
  { value: "past_due", label: "Past due" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
  { value: "incomplete", label: "Incomplete" },
  { value: "incomplete_expired", label: "Incomplete expired" },
  { value: "expired", label: "Expired" },
];

const EDIT_STATUS_OPTIONS = STATUS_FILTER_OPTIONS.filter((o) => o.value);

export default function AdminSubscriptionsPage() {
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const params = useMemo(
    () => ({
      kind,
      status,
      q: debouncedQ,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: 10,
    }),
    [kind, status, debouncedQ, from, to, page]
  );
  const { data, isLoading, isError, error, isFetching, refetch } = useAdminSubscriptions(params);
  const patch = useAdminPatchSubscription();
  const [edit, setEdit] = useState({
    userId: "",
    kind: "professional",
    plan_key: "basic",
    tier: "basic",
    status: "active",
  });

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <AdminErrorState message={error?.message} onRetry={() => refetch()} retrying={isFetching} />
    );
  }

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Subscriptions" subtitle="Override professional and client subscription presentation." />
      <AdminFilters>
        <input
          className={adminInputClass}
          placeholder="Search name or email"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <AdminSelect
          aria-label="Filter by kind"
          value={kind}
          options={KIND_FILTER_OPTIONS}
          onChange={(e) => {
            setPage(1);
            setKind(e.target.value);
          }}
        />
        <AdminSelect
          aria-label="Filter by status"
          value={status}
          options={STATUS_FILTER_OPTIONS}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        />
        <input
          type="date"
          className={adminInputClass}
          aria-label="From date"
          value={from}
          onChange={(e) => {
            setPage(1);
            setFrom(e.target.value);
          }}
        />
        <input
          type="date"
          className={adminInputClass}
          aria-label="To date"
          value={to}
          onChange={(e) => {
            setPage(1);
            setTo(e.target.value);
          }}
        />
      </AdminFilters>

      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm lg:grid-cols-5">
        <input
          className={adminInputClass}
          placeholder="User id"
          value={edit.userId}
          onChange={(e) => setEdit((f) => ({ ...f, userId: e.target.value }))}
        />
        <AdminSelect
          aria-label="Override kind"
          value={edit.kind}
          options={EDIT_KIND_OPTIONS}
          onChange={(e) => setEdit((f) => ({ ...f, kind: e.target.value }))}
        />
        {edit.kind === "professional" ? (
          <AdminSelect
            aria-label="Plan"
            value={edit.plan_key}
            options={PLAN_OPTIONS}
            onChange={(e) => setEdit((f) => ({ ...f, plan_key: e.target.value }))}
          />
        ) : (
          <AdminSelect
            aria-label="Tier"
            value={edit.tier}
            options={TIER_OPTIONS}
            onChange={(e) => setEdit((f) => ({ ...f, tier: e.target.value }))}
          />
        )}
        <AdminSelect
          aria-label="Override status"
          value={edit.status}
          options={EDIT_STATUS_OPTIONS}
          onChange={(e) => setEdit((f) => ({ ...f, status: e.target.value }))}
        />
        <button
          type="button"
          className={adminButtonClass}
          disabled={!edit.userId || patch.isPending}
          onClick={() =>
            patch.mutate({
              userId: edit.userId,
              data:
                edit.kind === "professional"
                  ? { kind: "professional", plan_key: edit.plan_key, status: edit.status }
                  : { kind: "client", tier: edit.tier, status: edit.status },
            })
          }
        >
          Apply override
        </button>
      </div>

      {items.length ? (
        <AdminTable
          getRowHref={(row) => (row.user?.id ? `/admin/subscriptions/${row.user.id}` : null)}
          columns={[
            {
              key: "user",
              label: "User",
              render: (row) => (
                <span className="whitespace-nowrap font-semibold text-slate-900">
                  {formatPersonName(
                    [row.user?.first_name, row.user?.last_name].filter(Boolean).join(" ") ||
                      row.user?.email ||
                      "User"
                  )}
                </span>
              ),
            },
            { key: "kind", label: "Kind", render: (row) => formatAdminLabel(row.kind) },
            {
              key: "plan",
              label: "Plan",
              render: (row) => formatAdminLabel(row.plan_key || row.tier || "—"),
            },
            { key: "status", label: "Status", render: (row) => formatAdminLabel(row.status) },
          ]}
          rows={items}
        />
      ) : (
        <AdminEmptyState title="No subscriptions found" hint="Try adjusting search or filters." />
      )}
      <AdminPagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} disabled={isFetching} />
    </div>
  );
}
