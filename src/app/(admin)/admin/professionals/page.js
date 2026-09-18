"use client";

import { useMemo, useState } from "react";
import { useAdminProfessionals } from "@/hooks/useAdminApi";
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

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "agent", label: "Agent" },
  { value: "mortgage_broker", label: "Mortgage broker" },
  { value: "lawyer", label: "Lawyer" },
];

const CREDENTIAL_OPTIONS = [
  { value: "", label: "All credentials" },
  { value: "not_started", label: "Not started" },
  { value: "pending_docs", label: "Pending docs" },
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All account statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export default function AdminProfessionalsPage() {
  const [q, setQ] = useState("");
  const [professional_type, setType] = useState("");
  const [credential_status, setCredentialStatus] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const params = useMemo(
    () => ({
      q: debouncedQ,
      professional_type,
      credential_status,
      status,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: 10,
    }),
    [debouncedQ, professional_type, credential_status, status, from, to, page]
  );
  const { data, isLoading, isError, error, isFetching, refetch } = useAdminProfessionals(params);

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <AdminErrorState
        message={error?.message}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Professionals" subtitle="Agents, brokers, and lawyers across the platform." />
      <AdminFilters>
        <input
          className={adminInputClass}
          placeholder="Search professionals"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <AdminSelect
          aria-label="Filter by type"
          value={professional_type}
          options={TYPE_OPTIONS}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
        />
        <AdminSelect
          aria-label="Filter by credential status"
          value={credential_status}
          options={CREDENTIAL_OPTIONS}
          onChange={(e) => {
            setPage(1);
            setCredentialStatus(e.target.value);
          }}
        />
        <AdminSelect
          aria-label="Filter by account status"
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
          getRowHref={(row) => `/admin/professionals/${row.id}`}
          columns={[
            {
              key: "name",
              label: "Professional",
              render: (row) => (
                <AdminPersonCell
                  name={formatPersonName(
                    row.full_name
                      || [row.user?.first_name, row.user?.last_name].filter(Boolean).join(" ")
                      || row.user?.email
                      || "Professional"
                  )}
                  email={row.user?.email}
                  imageUrl={row.user?.profile_image}
                  subtitle={formatAdminLabel(row.professional_type)}
                />
              ),
            },
            { key: "company_name", label: "Company" },
            { key: "location", label: "Location" },
            {
              key: "credential_status",
              label: "Credentials",
              render: (row) => formatAdminLabel(row.credential_status || "not_started"),
            },
          ]}
          rows={items}
        />
      ) : (
        <AdminEmptyState title="No professionals found" hint="Try adjusting search or filters." />
      )}
      <AdminPagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} disabled={isFetching} />
    </div>
  );
}
