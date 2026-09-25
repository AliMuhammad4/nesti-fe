"use client";

import Link from "next/link";
import { useAdminOverview, useAdminSalesPipeline } from "@/hooks/useAdminApi";
import {
  AdminAreaChart,
  AdminBarChart,
  AdminDonutChart,
  AdminKpiGrid,
  AdminLineChart,
  AdminPageHeader,
  prepareRoleMix,
  prepareNamedMix,
  prepareTopProfessionals,
} from "@/components/admin/AdminUi";
import AdminTimedChart from "@/components/admin/AdminTimedChart";
import AdminPendingVerificationsPanel from "@/components/admin/AdminPendingVerificationsPanel";
import AdminPipelineBoard from "@/components/admin/AdminPipelineBoard";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

export default function AdminOverviewPage() {
  const overviewQuery = useAdminOverview();
  const pipelineQuery = useAdminSalesPipeline();

  if (overviewQuery.isLoading) {
    return <WorkspaceLoader />;
  }

  if (overviewQuery.isError) {
    return (
      <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{overviewQuery.error.message}</p>
        <button
          type="button"
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold"
          onClick={() => overviewQuery.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const kpis = overviewQuery.data?.kpis || {};

  const kpiItems = [
    {
      label: "Pending verifications",
      value: kpis.verifications?.pending_review ?? 0,
      hint: "Awaiting admin review",
      href: "/admin/verifications",
    },
    {
      label: "Approved / rejected",
      value: `${kpis.verifications?.approved ?? 0} / ${kpis.verifications?.rejected ?? 0}`,
      hint: "Credential decisions",
      href: "/admin/verifications",
    },
    {
      label: "Professionals",
      value: kpis.professionals?.total ?? 0,
      hint: `+${kpis.growth?.professionals_7d ?? 0} / 7d · +${kpis.growth?.professionals_30d ?? 0} / 30d`,
    },
    { label: "Clients", value: kpis.clients?.total ?? 0, hint: `+${kpis.growth?.clients_30d ?? 0} / 30d` },
    {
      label: "Trials",
      value: kpis.subscriptions?.professional?.free_trial ?? 0,
      hint: `${kpis.subscriptions?.trial_to_paid_conversion_pct ?? 0}% paid share (est.)`,
    },
    {
      label: "Est. MRR",
      value: `$${Number(kpis.subscriptions?.estimated_mrr ?? 0).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`,
      hint: "Active paid plans × catalog prices",
    },
    { label: "Leads", value: kpis.leads?.total ?? 0, hint: `${kpis.leads?.open ?? 0} open` },
    {
      label: "Subscriptions",
      value: (kpis.subscriptions?.professional?.active ?? 0) + (kpis.subscriptions?.client?.active ?? 0),
      hint: `${kpis.subscriptions?.professional?.paid ?? 0} paid pros`,
    },
  ];

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Platform overview"
        subtitle="Live platform health across professionals, clients, leads, and subscriptions."
        actions={
          <Link
            href="/admin/analytics"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Open analytics
          </Link>
        }
      />

      <AdminKpiGrid items={kpiItems} />

      <section className="space-y-3 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Subscription desk</h2>
            <p className="text-xs text-slate-500">Unsubscribed professionals and clients from demo bookings and contact requests.</p>
          </div>
          <Link href="/admin/leads" className="text-xs font-semibold text-slate-700 underline">
            Open the desk
          </Link>
        </div>
        <AdminPipelineBoard
          items={pipelineQuery.data?.items || []}
        />
      </section>

      <AdminPendingVerificationsPanel />

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminTimedChart title="Signups" subtitle="New accounts over time">
          {(data) => (
            <AdminLineChart
              data={data?.series?.signupsByDay || []}
              lines={[
                { key: "agent", color: "#14b8a6", name: "Agent" },
                { key: "mortgage_broker", color: "#0ea5e9", name: "Mortgage broker" },
                { key: "lawyer", color: "#6366f1", name: "Lawyer" },
                { key: "client", color: "#f59e0b", name: "Client" },
              ]}
            />
          )}
        </AdminTimedChart>

        <AdminTimedChart title="Leads created" subtitle="Open vs closed">
          {(data) => (
            <AdminAreaChart
              data={data?.series?.leadsByDay || []}
              areas={[
                { key: "open", color: "#0ea5e9", name: "Open" },
                { key: "closed", color: "#64748b", name: "Closed" },
              ]}
            />
          )}
        </AdminTimedChart>

        <AdminTimedChart title="Role mix" subtitle="New users by role (excludes admin)">
          {(data) => <AdminDonutChart data={prepareRoleMix(data?.mixes?.roleMix || [])} />}
        </AdminTimedChart>

        <AdminTimedChart title="Lead status mix" subtitle="Pipeline in selected range">
          {(data) => <AdminBarChart data={prepareNamedMix(data?.mixes?.leadStatusMix || [])} />}
        </AdminTimedChart>

        <AdminTimedChart title="Subscription activity" subtitle="New subscription rows">
          {(data) => (
            <AdminAreaChart
              data={data?.series?.subscriptionsByDay || []}
              areas={[
                { key: "active", color: "#14b8a6", name: "Active" },
                { key: "trial", color: "#f59e0b", name: "Trial" },
                { key: "canceled", color: "#f43f5e", name: "Canceled" },
              ]}
            />
          )}
        </AdminTimedChart>

        <AdminTimedChart title="Top professionals by leads" subtitle="Top 10 in range">
          {(data) => (
            <AdminBarChart
              data={prepareTopProfessionals(data?.topProfessionalsByLeads || [])}
              layout="horizontal"
            />
          )}
        </AdminTimedChart>
      </div>
    </div>
  );
}
