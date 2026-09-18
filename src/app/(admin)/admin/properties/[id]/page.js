"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminPatchProperty, useAdminProperty } from "@/hooks/useAdminApi";
import { AdminPageHeader, adminButtonClass, adminInputClass, adminTextareaClass } from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

export default function AdminPropertyDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useAdminProperty(id);
  const patch = useAdminPatchProperty();
  const [form, setForm] = useState({ title: "", admin_notes: "", admin_hidden: false });

  useEffect(() => {
    const property = data?.property;
    if (!property) return;
    setForm({
      title: property.title || "",
      admin_notes: property.admin_notes || "",
      admin_hidden: Boolean(property.admin_hidden),
    });
  }, [data?.property]);

  if (isLoading) return <WorkspaceLoader />;
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  const property = data?.property;
  if (!property) return null;

  return (
    <div className="space-y-4">
      <AdminPageHeader title={property.title || "Property"} subtitle={property.address || "Property inquiry"} />
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <input className={adminInputClass} value={form.title} placeholder="Title" onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <textarea
          className={adminTextareaClass}
          value={form.admin_notes}
          placeholder="Admin notes"
          onChange={(e) => setForm((f) => ({ ...f, admin_notes: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.admin_hidden} onChange={(e) => setForm((f) => ({ ...f, admin_hidden: e.target.checked }))} />
          Hidden from platform listings
        </label>
        <button type="button" className={adminButtonClass} disabled={patch.isPending} onClick={() => patch.mutate({ id: property.lead_match_id || id, data: form })}>
          Save property
        </button>
      </div>
    </div>
  );
}
