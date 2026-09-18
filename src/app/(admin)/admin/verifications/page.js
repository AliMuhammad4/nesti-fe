"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileStack, ShieldCheck, XCircle } from "lucide-react";
import { useAdminVerifications } from "@/hooks/useAdminApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  AdminFilters,
  AdminPageHeader,
  AdminPersonCell,
  AdminSelect,
  AdminTable,
  adminInputClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import { regionLabel } from "@/lib/credentialJurisdictions";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending_review", label: "Pending review" },
  { value: "rejected", label: "Rejected" },
  { value: "approved", label: "Approved" },
  { value: "pending_docs", label: "Pending docs" },
  { value: "not_started", label: "Not started" },
];

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "agent", label: "Agent" },
  { value: "mortgage_broker", label: "Mortgage broker" },
  { value: "lawyer", label: "Lawyer" },
];

const COUNTRY_OPTIONS = [
  { value: "", label: "All countries" },
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
];

const STATUS_STYLES = {
  pending_review: "bg-sky-50 text-sky-800 ring-sky-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending_docs: "bg-amber-50 text-amber-900 ring-amber-200",
  not_started: "bg-slate-100 text-slate-700 ring-slate-200",
};

function StatusBadge({ status }) {
  const tone = STATUS_STYLES[status] || STATUS_STYLES.not_started;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone}`}>
      {formatAdminLabel(status)}
    </span>
  );
}

function StatusSummaryCard({
  label,
  hint,
  value,
  active,
  onClick,
  icon: Icon,
  tone = "slate",
}) {
  const tones = {
    sky: {
      card: active
        ? "border-sky-300 bg-gradient-to-br from-sky-50 to-white ring-2 ring-sky-200"
        : "border-sky-200/80 bg-gradient-to-br from-sky-50 to-white hover:border-sky-300",
      label: "text-sky-700/80",
      iconWrap: "bg-sky-100 text-sky-700",
    },
    emerald: {
      card: active
        ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white ring-2 ring-emerald-200"
        : "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-300",
      label: "text-emerald-700/80",
      iconWrap: "bg-emerald-100 text-emerald-700",
    },
    rose: {
      card: active
        ? "border-rose-300 bg-gradient-to-br from-rose-50 to-white ring-2 ring-rose-200"
        : "border-rose-200/80 bg-gradient-to-br from-rose-50 to-white hover:border-rose-300",
      label: "text-rose-700/80",
      iconWrap: "bg-rose-100 text-rose-700",
    },
  };
  const t = tones[tone] || tones.sky;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-4 text-left shadow-[0_1px_0_rgba(15,23,42,0.04)] transition ${t.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] font-medium uppercase tracking-[0.12em] ${t.label}`}>{label}</p>
          <p className="mt-2 text-[1.75rem] font-semibold tracking-tight text-slate-950 tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${t.iconWrap}`}>
          <Icon size={18} />
        </span>
      </div>
    </button>
  );
}

export default function AdminVerificationsPage() {
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const params = useMemo(
    () => ({ status, role, country, q: debouncedQ, page, limit: 10 }),
    [status, role, country, debouncedQ, page]
  );
  const { data, isLoading, isFetching, isError, error } = useAdminVerifications(params);

  if (isLoading && !data) return <WorkspaceLoader />;
  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error?.message || "Failed to load verifications"}
      </div>
    );
  }

  const pagination = data?.pagination || { page: 1, pages: 1 };
  const counts = data?.counts || {};
  const pendingCount = Number(counts.pending_review ?? data?.pending_count ?? 0);
  const approvedCount = Number(counts.approved ?? 0);
  const rejectedCount = Number(counts.rejected ?? 0);
  const rows = (data?.items || []).map((row) => ({ ...row, id: row.user_id }));

  const selectStatus = (next) => {
    setPage(1);
    setStatus(next);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Verifications"
        subtitle="Review professional credential submissions. Approval starts their free trial."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatusSummaryCard
          label="Pending review"
          hint="Awaiting admin decision"
          value={pendingCount}
          active={status === "pending_review"}
          onClick={() => selectStatus("pending_review")}
          icon={ShieldCheck}
          tone="sky"
        />
        <StatusSummaryCard
          label="Approved"
          hint="Credentials verified"
          value={approvedCount}
          active={status === "approved"}
          onClick={() => selectStatus("approved")}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatusSummaryCard
          label="Rejected"
          hint="Needs resubmission"
          value={rejectedCount}
          active={status === "rejected"}
          onClick={() => selectStatus("rejected")}
          icon={XCircle}
          tone="rose"
        />
      </div>

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
          aria-label="Filter by status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        />
        <AdminSelect
          aria-label="Filter by role"
          value={role}
          options={ROLE_OPTIONS}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
        />
        <AdminSelect
          aria-label="Filter by country"
          value={country}
          options={COUNTRY_OPTIONS}
          onChange={(e) => {
            setPage(1);
            setCountry(e.target.value);
          }}
        />
      </AdminFilters>

      <AdminTable
        getRowHref={(row) => `/admin/verifications/${row.user_id}`}
        columns={[
          {
            key: "name",
            label: "Professional",
            render: (row) => (
              <AdminPersonCell
                name={formatPersonName(
                  [row.user?.first_name, row.user?.last_name].filter(Boolean).join(" ")
                    || row.user?.email
                    || "Professional"
                )}
                email={row.user?.email}
                imageUrl={row.user?.profile_image}
                subtitle={row.company_name || "—"}
              />
            ),
          },
          {
            key: "email",
            label: "Email",
            render: (row) => (
              <span className="text-slate-600">{row.user?.email || "—"}</span>
            ),
          },
          {
            key: "role",
            label: "Role",
            render: (row) => (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {formatAdminLabel(row.professional_type)}
              </span>
            ),
          },
          {
            key: "region",
            label: "Region",
            render: (row) => (
              <span className="text-slate-700">
                {regionLabel(row.country, row.jurisdiction) || "—"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => <StatusBadge status={row.credential_status} />,
          },
          {
            key: "docs",
            label: "Docs",
            render: (row) => (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                <FileStack size={13} className="text-slate-400" />
                {row.document_count ?? 0}
              </span>
            ),
          },
          {
            key: "submitted",
            label: "Submitted",
            render: (row) =>
              row.credential_submitted_at
                ? new Date(row.credential_submitted_at).toLocaleDateString()
                : "—",
          },
          {
            key: "action",
            label: "",
            render: () => (
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800">
                Review
                <ArrowRight size={12} />
              </span>
            ),
          },
        ]}
        rows={rows}
        empty="No verification records match these filters."
      />

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {pagination.page} of {pagination.pages}
          {isFetching ? <span className="ml-2 text-xs text-slate-400">Updating…</span> : null}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
