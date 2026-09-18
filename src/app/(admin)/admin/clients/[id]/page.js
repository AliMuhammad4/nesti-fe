"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminClient, useAdminPatchClient } from "@/hooks/useAdminApi";
import { AdminPageHeader, adminButtonClass, adminInputClass } from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useAdminClient(id);
  const patch = useAdminPatchClient();
  const [form, setForm] = useState({
    preferred_location: "",
    purchase_timeline: "",
    dream_home_price: "",
    current_savings: "",
    home_goal: "",
    employment_status: "",
  });

  useEffect(() => {
    const c = data?.client;
    if (!c) return;
    setForm({
      preferred_location: c.preferred_location || "",
      purchase_timeline: c.purchase_timeline || "",
      dream_home_price: c.dream_home_price ?? "",
      current_savings: c.current_savings ?? "",
      home_goal: c.home_goal || "",
      employment_status: c.employment_status || "",
    });
  }, [data?.client]);

  if (isLoading) return <WorkspaceLoader />;
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  const client = data?.client;
  if (!client) return null;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={[client.user?.first_name, client.user?.last_name].filter(Boolean).join(" ") || client.user?.email || "Client"}
        subtitle={client.user?.email}
      />
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:grid-cols-2">
        {Object.entries(form).map(([key, value]) => (
          <input
            key={key}
            className={adminInputClass}
            value={value}
            placeholder={key.replaceAll("_", " ")}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          />
        ))}
        <button
          type="button"
          className={`${adminButtonClass} sm:col-span-2`}
          disabled={patch.isPending}
          onClick={() =>
            patch.mutate({
              id,
              data: {
                ...form,
                dream_home_price: form.dream_home_price === "" ? null : Number(form.dream_home_price),
                current_savings: form.current_savings === "" ? null : Number(form.current_savings),
              },
            })
          }
        >
          Save client
        </button>
      </div>
    </div>
  );
}
