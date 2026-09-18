"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminPatchReferral, useAdminReferral } from "@/hooks/useAdminApi";
import {
  AdminPageHeader,
  AdminSelect,
  adminButtonClass,
  adminTextareaClass,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

export default function AdminReferralDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useAdminReferral(id);
  const patch = useAdminPatchReferral();
  const [form, setForm] = useState({ status: "pending", notes: "" });

  useEffect(() => {
    const referral = data?.referral;
    if (!referral) return;
    setForm({
      status: referral.status || "pending",
      notes: referral.notes || "",
    });
  }, [data?.referral]);

  if (isLoading) return <WorkspaceLoader />;
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  const referral = data?.referral;
  if (!referral) return null;

  return (
    <div className="space-y-4">
      <AdminPageHeader title={`Referral ${String(referral._id || id).slice(-8)}`} subtitle={referral.target_vertical} />
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <AdminSelect
          aria-label="Referral status"
          value={form.status}
          options={STATUS_OPTIONS}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        />
        <textarea
          className={adminTextareaClass}
          value={form.notes}
          placeholder="Notes"
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <button type="button" className={adminButtonClass} disabled={patch.isPending} onClick={() => patch.mutate({ id, data: form })}>
          Save referral
        </button>
      </div>
    </div>
  );
}
