"use client";

import { useMemo, useState } from "react";
import { useAdminDeleteLead, useAdminLeads } from "@/hooks/useAdminApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  AdminConfirmModal,
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  AdminPersonCell,
  AdminSelect,
  AdminTable,
  AdminTabs,
  adminGhostButtonClass,
  adminInputClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const AUDIENCE_TABS = [
  { value: "professionals", label: "Professionals" },
  { value: "clients", label: "Clients" },
];

const SOURCE_TABS = [
  { value: "all", label: "All sources" },
  { value: "chatbot", label: "Chatbot" },
  { value: "form", label: "Form" },
  { value: "direct_inquiry", label: "Direct inquiry" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "consult_booked", label: "Consult booked" },
  { value: "showing_booked", label: "Showing booked" },
  { value: "nurturing", label: "Nurturing" },
  { value: "converted", label: "Converted" },
  { value: "closed_lost", label: "Closed lost" },
];

function sourceLabel(value) {
  if (value === "chatbot") return "Chatbot";
  if (value === "form") return "Form";
  if (value === "direct_inquiry") return "Direct inquiry";
  return formatAdminLabel(value || "unknown");
}

export default function AdminLeadsPage() {
  const [audience, setAudience] = useState("professionals");
  const [source, setSource] = useState("all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedQ = useDebouncedValue(q, 300);
  const params = useMemo(
    () => ({
      audience,
      source: source === "all" ? undefined : source,
      q: debouncedQ,
      status,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: 10,
    }),
    [audience, source, debouncedQ, status, from, to, page]
  );
  const { data, isLoading, isError, error, isFetching, refetch } = useAdminLeads(params);
  const deleteLead = useAdminDeleteLead();

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
      <AdminPageHeader
        title="Leads"
        subtitle="People who inquired via chatbot, form, or direct inquiry — Professionals and Clients stay on separate tabs."
      />
      <AdminTabs
        tabs={AUDIENCE_TABS}
        value={audience}
        onChange={(next) => {
          setPage(1);
          setAudience(next);
        }}
      />
      <AdminTabs
        tabs={SOURCE_TABS}
        value={source}
        onChange={(next) => {
          setPage(1);
          setSource(next);
        }}
      />
      <AdminFilters>
        <input
          className={adminInputClass}
          placeholder="Search inquirer, owner, or type"
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
          getRowHref={(row) => `/admin/leads/${row.id}`}
          columns={[
            {
              key: "inquirer",
              label: "Inquirer",
              render: (row) => (
                <AdminPersonCell
                  name={formatPersonName(
                    row.inquirer_name || row.inquirer_email || `Lead ${String(row.id).slice(-6)}`
                  )}
                  email={row.inquirer_email}
                  imageUrl={row.inquirer_image}
                />
              ),
            },
            {
              key: "inquiry_source",
              label: "Source",
              render: (row) => (
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  {sourceLabel(row.inquiry_source)}
                </span>
              ),
            },
            { key: "match_status", label: "Status", render: (row) => formatAdminLabel(row.match_status) },
            { key: "lead_type", label: "Type", render: (row) => formatAdminLabel(row.lead_type) },
            {
              key: "professional",
              label: "Professional",
              render: (row) => (
                <AdminPersonCell
                  name={formatPersonName(
                    [row.professional?.first_name, row.professional?.last_name].filter(Boolean).join(" ")
                      || row.professional?.email
                      || "—"
                  )}
                  email={row.professional?.email}
                  imageUrl={row.professional?.profile_image}
                />
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <button
                  type="button"
                  className={adminGhostButtonClass}
                  disabled={deleteLead.isPending}
                  onClick={() => setDeleteTarget(row)}
                >
                  Delete
                </button>
              ),
            },
          ]}
          rows={items}
        />
      ) : (
        <AdminEmptyState
          title="No leads found"
          hint="Try the other audience tab or a different inquiry source."
        />
      )}
      <AdminPagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} disabled={isFetching} />

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete lead"
        subtitle={deleteTarget ? `Lead ${String(deleteTarget.id).slice(-8)}` : ""}
        message="Permanently delete this lead? This cannot be undone."
        confirmLabel="Delete lead"
        tone="danger"
        pending={deleteLead.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteLead.mutate({ id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
