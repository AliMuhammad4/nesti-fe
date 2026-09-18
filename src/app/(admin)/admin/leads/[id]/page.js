"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminLead, useAdminPatchLead } from "@/hooks/useAdminApi";
import { AdminPageHeader, AdminSelect, adminButtonClass, adminInputClass } from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "consult_booked", label: "Consult booked" },
  { value: "showing_booked", label: "Showing booked" },
  { value: "nurturing", label: "Nurturing" },
  { value: "converted", label: "Converted" },
  { value: "closed_lost", label: "Closed lost" },
];

export default function AdminLeadDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useAdminLead(id);
  const patch = useAdminPatchLead();
  const [form, setForm] = useState({ match_status: "new", user_id: "", lead_type: "" });

  useEffect(() => {
    const lead = data?.lead;
    if (!lead) return;
    setForm({
      match_status: lead.match_status || "new",
      user_id: lead.user_id?._id || lead.user_id || lead.professional?.id || "",
      lead_type: lead.lead_type || "",
    });
  }, [data?.lead]);

  if (isLoading) return <WorkspaceLoader />;
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  const lead = data?.lead;
  if (!lead) return null;

  return (
    <div className="space-y-4">
      <AdminPageHeader title={`Lead ${String(lead._id || id).slice(-8)}`} subtitle={lead.lead_type || "Lead match"} />
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:grid-cols-2">
        <AdminSelect
          aria-label="Match status"
          value={form.match_status}
          options={STATUS_OPTIONS}
          onChange={(e) => setForm((f) => ({ ...f, match_status: e.target.value }))}
        />
        <input className={adminInputClass} value={form.lead_type} placeholder="Lead type" onChange={(e) => setForm((f) => ({ ...f, lead_type: e.target.value }))} />
        <input className={`${adminInputClass} sm:col-span-2`} value={form.user_id} placeholder="Owner user id" onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))} />
        <button type="button" className={`${adminButtonClass} sm:col-span-2`} disabled={patch.isPending} onClick={() => patch.mutate({ id, data: form })}>
          Save lead
        </button>
      </div>
    </div>
  );
}
