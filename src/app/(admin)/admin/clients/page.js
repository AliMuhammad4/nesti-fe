"use client";

import { useMemo, useState } from "react";
import { useAdminClients } from "@/hooks/useAdminApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  AdminPersonCell,
  AdminSelect,
  AdminTable,
  adminInputClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const STATUS_OPTIONS = [
  { value: "", label: "All subscriptions" },
  { value: "trialing", label: "Trialing" },
  { value: "active", label: "Active" },
  { value: "past_due", label: "Past due" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
  { value: "incomplete", label: "Incomplete" },
  { value: "incomplete_expired", label: "Incomplete expired" },
];

export default function AdminClientsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const params = useMemo(
    () => ({
      q: debouncedQ,
      status,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: 10,
    }),
    [debouncedQ, status, from, to, page]
  );
  const { data, isLoading, isError, error, isFetching, refetch } = useAdminClients(params);

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
      <AdminPageHeader title="Clients" subtitle="Homebuyer profiles only — separate from professionals." />
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
          aria-label="Filter by subscription status"
          value={status}
          options={STATUS_OPTIONS}
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
      {items.length ? (
        <AdminTable
          getRowHref={(row) => `/admin/clients/${row.id}`}
          columns={[
            {
              key: "name",
              label: "Client",
              render: (row) => (
                <AdminPersonCell
                  name={formatPersonName(
                    [row.user?.first_name, row.user?.last_name].filter(Boolean).join(" ")
                      || row.user?.email
                      || "Client"
                  )}
                  email={row.user?.email}
                  imageUrl={row.user?.profile_image}
                />
              ),
            },
            { key: "preferred_location", label: "Location" },
            {
              key: "purchase_timeline",
              label: "Timeline",
              render: (row) => (row.purchase_timeline ? formatAdminLabel(row.purchase_timeline) : "—"),
            },
            {
              key: "dream_home_price",
              label: "Budget",
              render: (row) =>
                row.dream_home_price != null ? `$${Number(row.dream_home_price).toLocaleString()}` : "—",
            },
          ]}
          rows={items}
        />
      ) : (
        <AdminEmptyState title="No clients found" hint="Try adjusting search or filters." />
      )}
      <AdminPagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} disabled={isFetching} />
    </div>
  );
}
