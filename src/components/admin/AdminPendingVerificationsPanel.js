"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Ban, CheckCircle2, Eye, ShieldAlert, XCircle } from "lucide-react";
import {
  useAdminApproveVerification,
  useAdminRejectVerification,
  useAdminSuspendUser,
  useAdminVerifications,
} from "@/hooks/useAdminApi";
import {
  AdminConfirmModal,
  AdminPersonCell,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import { regionLabel } from "@/lib/credentialJurisdictions";

export default function AdminPendingVerificationsPanel() {
  const params = useMemo(() => ({ status: "pending_review", page: 1, limit: 8 }), []);
  const { data, isLoading, isError, error } = useAdminVerifications(params);
  const approve = useAdminApproveVerification();
  const reject = useAdminRejectVerification();
  const suspend = useAdminSuspendUser();

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);

  const items = data?.items || [];
  const pendingCount = Number(data?.pending_count ?? items.length);

  const busy = approve.isPending || reject.isPending || suspend.isPending;

  // Mutation hooks already toast failures; swallow the rejection here so a failed
  // decision does not surface as an unhandled promise and leaves the dialog open.
  const runApprove = async () => {
    if (!approveTarget) return;
    try {
      await approve.mutateAsync({ userId: approveTarget.user_id });
      setApproveTarget(null);
    } catch {
      /* handled by the mutation's onError toast */
    }
  };

  const runReject = async (reason) => {
    if (!rejectTarget) return;
    try {
      await reject.mutateAsync({ userId: rejectTarget.user_id, reason });
      setRejectTarget(null);
    } catch {
      /* handled by the mutation's onError toast */
    }
  };

  const runBlock = async (reason) => {
    if (!blockTarget) return;
    const userId = blockTarget.user_id;
    try {
      await reject.mutateAsync({ userId, reason });
      await suspend.mutateAsync({
        id: userId,
        reason: `Credential verification blocked: ${reason}`,
      });
      setBlockTarget(null);
    } catch {
      /* handled by the mutation's onError toast */
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">Credential requests</h2>
            <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-inset ring-sky-200">
              {pendingCount} pending
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            Review agent, mortgage broker, and lawyer submissions. Any admin can approve, reject, or block.
          </p>
        </div>
        <Link
          href="/admin/verifications"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
        >
          Open queue
          <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-10">
          <WorkspaceLoader fullHeight={false} />
        </div>
      ) : isError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error?.message || "Failed to load verification requests"}
        </div>
      ) : !items.length ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          No credential submissions waiting for review.
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.map((row) => {
            const name = formatPersonName(
              [row.user?.first_name, row.user?.last_name].filter(Boolean).join(" ")
                || row.user?.email
                || "Professional"
            );
            return (
              <li key={row.user_id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <AdminPersonCell
                      name={name}
                      email={row.user?.email}
                      imageUrl={row.user?.profile_image}
                      subtitle={row.user?.email}
                    />
                  <p className="mt-1 truncate pl-12 text-xs text-slate-500">
                    {formatAdminLabel(row.professional_type)}
                    {" · "}
                    {regionLabel(row.country, row.jurisdiction) || "Region n/a"}
                    {" · "}
                    {row.document_count ?? 0} docs
                    {row.credential_submitted_at
                      ? ` · ${new Date(row.credential_submitted_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/admin/verifications/${row.user_id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={12} />
                    Review
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setApproveTarget(row)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <CheckCircle2 size={12} />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setRejectTarget(row)}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                  >
                    <XCircle size={12} />
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setBlockTarget(row)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                    title="Reject credentials and suspend the account"
                  >
                    <Ban size={12} />
                    Block
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AdminConfirmModal
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        onConfirm={runApprove}
        title="Approve credentials"
        subtitle={
          approveTarget
            ? `Approve ${approveTarget.user?.email || "this professional"} and start their free trial?`
            : ""
        }
        message="Approving marks credentials verified and starts the professional free trial immediately."
        confirmLabel="Approve & start trial"
        pending={approve.isPending}
      />

      <AdminConfirmModal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={runReject}
        title="Reject credentials"
        subtitle={
          rejectTarget
            ? `Tell ${rejectTarget.user?.email || "the professional"} what to fix before resubmitting.`
            : ""
        }
        confirmLabel="Reject submission"
        tone="warning"
        requireReason
        reasonPlaceholder="Explain what must be fixed before resubmitting…"
        pending={reject.isPending}
      />

      <AdminConfirmModal
        open={Boolean(blockTarget)}
        onClose={() => setBlockTarget(null)}
        onConfirm={runBlock}
        title="Block professional"
        subtitle={
          blockTarget
            ? `Reject credentials and suspend ${blockTarget.user?.email || "this account"}. They will not access the workspace until unsuspended.`
            : ""
        }
        confirmLabel="Reject & block"
        tone="danger"
        requireReason
        reasonPlaceholder="Explain why this account is being blocked…"
        pending={busy}
      />

      {pendingCount > items.length ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <ShieldAlert size={14} className="text-slate-400" />
          Showing latest {items.length} of {pendingCount}. Open the full queue for the rest.
        </div>
      ) : null}
    </section>
  );
}
