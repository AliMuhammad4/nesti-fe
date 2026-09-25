"use client";

import { useParams } from "next/navigation";
import { useAdminClient } from "@/hooks/useAdminApi";
import AdminVoiceAgentPanel from "@/components/admin/AdminVoiceAgentPanel";
import { useAdminCanWrite } from "@/hooks/useAdminPermissions";
import { ADMIN_PERMISSION } from "@/lib/adminPermissions";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const CLIENT_PLANS = [
  { name: "Basic", price: "$9.99", note: "Progress tracking · 5 matches" },
  { name: "Standard", price: "$24.99", note: "Planning tools · priority matching" },
  { name: "Pro", price: "$49.99", note: "Unlimited matching · dedicated support" },
];

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useAdminClient(id);
  const canWriteClients = useAdminCanWrite(ADMIN_PERMISSION.CLIENTS_WRITE);

  if (isLoading) return <WorkspaceLoader />;
  if (isError) return <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  const client = data?.client;
  if (!client) return null;

  const subscription = data?.subscription;
  const name = [client.user?.first_name, client.user?.last_name].filter(Boolean).join(" ") || "Client";
  const subscriptionName = String(subscription?.tier || subscription?.plan_key || "").replaceAll("_", " ");
  const subscriptionStatus = String(subscription?.status || "unsubscribed").replaceAll("_", " ");
  const hasActivePlan = ["active", "trialing"].includes(String(subscription?.status || "").toLowerCase());
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex w-full min-w-0 flex-col bg-slate-100">
      <section className="relative w-full overflow-hidden bg-slate-950 px-6 py-6 text-white sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex w-full flex-wrap items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-lg font-semibold ring-1 ring-white/15">{initials}</div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Subscription desk</p>
              <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight !text-white">{name}</h1>
              <p className="mt-1 truncate text-sm text-slate-300">{client.user?.email || "No email"} · {client.user?.phone || "No phone"}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-3 ring-1 ring-white/10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Current plan</p>
            <p className="mt-1 text-xl font-semibold capitalize !text-white">{subscriptionName || "None"}</p>
            <p className="text-sm capitalize text-emerald-300">{subscriptionStatus}</p>
          </div>
        </div>
      </section>

      <section className="grid w-full gap-px bg-slate-200 sm:grid-cols-3">
        {CLIENT_PLANS.map((plan) => {
          const current = hasActivePlan && subscriptionName.toLowerCase().includes(plan.name.toLowerCase());
          const recommended = !hasActivePlan && plan.name === "Standard";
          return (
            <article key={plan.name} className={`px-6 py-5 sm:px-8 lg:px-10 ${current ? "bg-emerald-50" : "bg-white"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">{plan.name}</p>
                {current || recommended ? (
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${current ? "bg-emerald-600 text-white" : "bg-slate-950 text-white"}`}>
                    {current ? "Current" : "Suggested"}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{plan.price}<span className="text-sm font-medium text-slate-400">/mo</span></p>
              <p className="mt-1 text-sm text-slate-500">{plan.note}</p>
            </article>
          );
        })}
      </section>

      <div className="w-full p-4 sm:p-6 lg:p-8">
        <AdminVoiceAgentPanel
          targetType="client"
          targetId={id}
          defaultPhone={client.user?.phone || ""}
          canWrite={canWriteClients}
          personName={name}
          subscriptionLabel={hasActivePlan ? `${subscriptionName} · ${subscriptionStatus}` : "Not subscribed"}
          purpose={hasActivePlan
            ? `Walk ${name} through the tools already included in ${subscriptionName}, then ask them to use Nesti as part of their regular workflow.`
            : `Explain progress tracking, planning tools, and professional matching, then recommend one plan and ask ${name} to subscribe.`}
        />
      </div>
    </div>
  );
}
