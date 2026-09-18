"use client";

import {
  AdminAreaChart,
  AdminBarChart,
  AdminDonutChart,
  AdminLineChart,
  AdminPageHeader,
  prepareNamedMix,
  prepareRoleMix,
  prepareTopProfessionals,
} from "@/components/admin/AdminUi";
import AdminTimedChart from "@/components/admin/AdminTimedChart";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Platform analytics"
        subtitle="Each chart has its own range: last month, 3 months, 6 months, or year."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminTimedChart title="Signups" subtitle="New accounts by role">
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

        <AdminTimedChart title="Leads" subtitle="Created over time">
          {(data) => (
            <AdminAreaChart
              data={data?.series?.leadsByDay || []}
              areas={[
                { key: "total", color: "#0f172a", name: "Total" },
                { key: "open", color: "#0ea5e9", name: "Open" },
                { key: "closed", color: "#64748b", name: "Closed" },
              ]}
            />
          )}
        </AdminTimedChart>

        <AdminTimedChart title="Subscriptions" subtitle="New subscription activity">
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

        <AdminTimedChart title="Property inquiries" subtitle="Inquiries over time">
          {(data) => (
            <AdminLineChart
              data={data?.series?.propertiesByDay || []}
              lines={[{ key: "total", color: "#0f172a", name: "Total" }]}
            />
          )}
        </AdminTimedChart>

        <AdminTimedChart title="Role mix" subtitle="New users by role (excludes admin)">
          {(data) => <AdminDonutChart data={prepareRoleMix(data?.mixes?.roleMix || [])} />}
        </AdminTimedChart>

        <AdminTimedChart title="Subscription mix" subtitle="Subscriptions created in range">
          {(data) => <AdminDonutChart data={prepareNamedMix(data?.mixes?.subscriptionMix || [])} />}
        </AdminTimedChart>

        <AdminTimedChart title="Lead status mix" subtitle="Statuses in selected range">
          {(data) => <AdminBarChart data={prepareNamedMix(data?.mixes?.leadStatusMix || [])} />}
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
