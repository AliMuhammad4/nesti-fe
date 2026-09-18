"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminPatchSubscription, useAdminSubscription } from "@/hooks/useAdminApi";
import { AdminPageHeader, AdminSelect, adminButtonClass, adminInputClass } from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const PLAN_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "enterprise", label: "Enterprise" },
];

const TIER_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "pro", label: "Pro" },
];

export default function AdminSubscriptionDetailPage() {
  const { userId } = useParams();
  const { data, isLoading, isError, error } = useAdminSubscription(userId);
  const patch = useAdminPatchSubscription();
  const [proForm, setProForm] = useState({ plan_key: "basic", status: "free_trial" });
  const [clientForm, setClientForm] = useState({ tier: "basic", status: "active" });

  useEffect(() => {
    const pro = data?.subscription?.professional;
    const client = data?.subscription?.client;
    if (pro) setProForm({ plan_key: pro.plan_key || "basic", status: pro.status || "free_trial" });
    if (client) setClientForm({ tier: client.tier || "basic", status: client.status || "active" });
  }, [data?.subscription]);

  if (isLoading) return <WorkspaceLoader />;
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={[data?.user?.first_name, data?.user?.last_name].filter(Boolean).join(" ") || data?.user?.email || "Subscription"}
        subtitle="Professional and client subscription overrides"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold">Professional subscription</h2>
          <AdminSelect
            aria-label="Professional plan"
            value={proForm.plan_key}
            options={PLAN_OPTIONS}
            onChange={(e) => setProForm((f) => ({ ...f, plan_key: e.target.value }))}
          />
          <input className={adminInputClass} value={proForm.status} onChange={(e) => setProForm((f) => ({ ...f, status: e.target.value }))} placeholder="Status" />
          <button
            type="button"
            className={adminButtonClass}
            disabled={patch.isPending}
            onClick={() => patch.mutate({ userId, data: { kind: "professional", ...proForm } })}
          >
            Save professional sub
          </button>
        </div>
        <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold">Client subscription</h2>
          <AdminSelect
            aria-label="Client tier"
            value={clientForm.tier}
            options={TIER_OPTIONS}
            onChange={(e) => setClientForm((f) => ({ ...f, tier: e.target.value }))}
          />
          <input className={adminInputClass} value={clientForm.status} onChange={(e) => setClientForm((f) => ({ ...f, status: e.target.value }))} placeholder="Status" />
          <button
            type="button"
            className={adminButtonClass}
            disabled={patch.isPending}
            onClick={() => patch.mutate({ userId, data: { kind: "client", ...clientForm } })}
          >
            Save client sub
          </button>
        </div>
      </div>
    </div>
  );
}
