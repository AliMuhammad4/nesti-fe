"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAdminPatchReferral, useAdminReferral } from "@/hooks/useAdminApi";
import { useAdminCanWrite } from "@/hooks/useAdminPermissions";
import { ADMIN_PERMISSION } from "@/lib/adminPermissions";
import {
  AdminPageHeader,
  AdminSelect,
  adminButtonClass,
  adminTextareaClass,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import ReferralLeadWorkspace from "@/components/referrals/ReferralLeadWorkspace";
import { useAppSelector } from "@/store";
import { sanitizeInternalReturnPath } from "@/lib/leadsPageUtils";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

/**
 * Global admin referral editor (status/notes), or the professional referral
 * workspace when opened from a professional profile with acting_user_id.
 */
export default function AdminReferralDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const token = useAppSelector((state) => state.auth.token);
  const actingUserId = String(searchParams.get("acting_user_id") || "").trim();
  const directionRaw = String(searchParams.get("direction") || "inbound")
    .trim()
    .toLowerCase();
  const direction = directionRaw === "outbound" ? "outbound" : "inbound";
  const backHref =
    sanitizeInternalReturnPath(searchParams.get("back")) || "/admin/referrals";

  const { data, isLoading, isError, error } = useAdminReferral(id);
  const patch = useAdminPatchReferral();
  const canWriteReferrals = useAdminCanWrite(ADMIN_PERMISSION.REFERRALS_WRITE);
  const [form, setForm] = useState({ status: "pending", notes: "" });

  useEffect(() => {
    const referral = data?.referral;
    if (!referral) return;
    setForm({
      status: referral.status || "pending",
      notes: referral.notes || "",
    });
  }, [data?.referral]);

  const subtitle = useMemo(() => {
    if (actingUserId) {
      return direction === "outbound"
        ? "Outbound referral workspace for this professional"
        : "Inbound referral workspace for this professional";
    }
    return data?.referral?.target_vertical || "";
  }, [actingUserId, direction, data?.referral?.target_vertical]);

  if (actingUserId) {
    return (
      <div className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={14} />
          Back to professional referrals
        </Link>
        <AdminPageHeader
          title={`Referral ${String(id).slice(-8)}`}
          subtitle={subtitle}
        />
        {!token ? (
          <WorkspaceLoader />
        ) : (
          <ReferralLeadWorkspace
            token={token}
            referralId={String(id)}
            meId={actingUserId}
            referralDirection={direction}
            adminActingUserId={actingUserId}
            fromPipelineReferrals
          />
        )}
      </div>
    );
  }

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error.message}
      </div>
    );
  }
  const referral = data?.referral;
  if (!referral) return null;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={`Referral ${String(referral._id || id).slice(-8)}`}
        subtitle={referral.target_vertical}
      />
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
        {!canWriteReferrals ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Read-only: your admin permissions do not include referrals.write.
          </p>
        ) : null}
        <AdminSelect
          aria-label="Referral status"
          value={form.status}
          options={STATUS_OPTIONS}
          disabled={!canWriteReferrals}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        />
        <textarea
          className={adminTextareaClass}
          value={form.notes}
          placeholder="Notes"
          disabled={!canWriteReferrals}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        {canWriteReferrals ? (
          <button
            type="button"
            className={adminButtonClass}
            disabled={patch.isPending}
            onClick={() => patch.mutate({ id, data: form })}
          >
            Save referral
          </button>
        ) : null}
      </div>
    </div>
  );
}
