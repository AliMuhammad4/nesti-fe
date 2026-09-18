"use client";

import { useMemo, useState } from "react";
import { useAdminProperties } from "@/hooks/useAdminApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  AdminSelect,
  AdminTable,
  adminInputClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

export default function AdminPropertiesPage() {
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
  const { data, isLoading, isError, error, isFetching, refetch } = useAdminProperties(params);

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
      <AdminPageHeader title="Properties" subtitle="Platform property inquiries linked to leads." />
      <AdminFilters>
        <input
          className={adminInputClass}
          placeholder="Search properties"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <AdminSelect
          aria-label="Filter by status"
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
          getRowHref={(row) => `/admin/properties/${row.lead_match_id || row.id}`}
          columns={[
            {
              key: "title",
              label: "Property",
              render: (row) => <span className="font-semibold text-slate-900">{row.title}</span>,
            },
            { key: "address", label: "Address" },
            { key: "status", label: "Status", render: (row) => formatAdminLabel(row.status) },
            {
              key: "professional",
              label: "Professional",
              render: (row) =>
                formatPersonName(
                  [row.professional?.first_name, row.professional?.last_name].filter(Boolean).join(" ") ||
                    row.professional?.email ||
                    "—"
                ),
            },
          ]}
          rows={items}
        />
      ) : (
        <AdminEmptyState title="No properties found" hint="Try adjusting search or filters." />
      )}
      <AdminPagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} disabled={isFetching} />
    </div>
  );
}
