"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bot,
  ClipboardPen,
  Eye,
  Sparkles,
  TrendingDown,
  Trophy,
  Users,
} from "lucide-react";
import { adminGhostButtonClass, formatAdminLabel } from "@/components/admin/AdminUi";

function StatCard({ label, value, hint, icon: Icon, tone = "slate" }) {
  const tones = {
    emerald: "bg-emerald-50/80 text-emerald-700 ring-emerald-100",
    rose: "bg-rose-50/80 text-rose-700 ring-rose-100",
    sky: "bg-sky-50/80 text-sky-700 ring-sky-100",
    indigo: "bg-indigo-50/80 text-indigo-700 ring-indigo-100",
    slate: "bg-slate-50 text-slate-600 ring-slate-100",
  };
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        {Icon ? (
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${tones[tone] || tones.slate}`}
          >
            <Icon size={15} strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[1.85rem] font-semibold leading-none tracking-tight text-slate-950 tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}

function CompactViewsChart({ data = [] }) {
  const chartData = (data || []).map((row) => {
    const parts = String(row.date || "").split("-").map(Number);
    const localDate =
      parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(row.date);
    return {
      key: String(row.date || ""),
      date: Number.isNaN(localDate.getTime())
        ? String(row.date || "")
        : localDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: Number(row.views || 0),
    };
  });
  const hasValues = chartData.some((row) => row.views > 0);
  if (!chartData.length || !hasValues) {
    return (
      <div className="mt-4 flex h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
        <p className="text-sm text-slate-400">No page views in the last 30 days</p>
      </div>
    );
  }
  const peak = Math.max(...chartData.map((row) => row.views), 1);
  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.16),transparent_36%)]" />
      <div className="relative flex items-center justify-between px-4 pt-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-200/85">
          Views · 30 days
        </p>
        <p className="text-[11px] font-medium text-slate-400">Peak {peak}</p>
      </div>
      <div className="relative h-[168px] px-1 pb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="admin-preview-views" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              width={28}
              allowDecimals={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: "rgba(45,212,191,0.35)", strokeWidth: 1 }}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(45,212,191,0.25)",
                borderRadius: 12,
                color: "#e2e8f0",
                fontSize: 12,
              }}
            />
            <Area
              type="linear"
              dataKey="views"
              name="Views"
              stroke="#5eead4"
              fill="url(#admin-preview-views)"
              strokeWidth={2.25}
              dot={{ r: 2.5, fill: "#0f172a", stroke: "#5eead4", strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: "#5eead4", stroke: "#ecfeff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function AdminProfessionalInsights({
  publicPage,
  traffic,
  stats,
}) {
  const page = publicPage;
  const pageStatus = !page
    ? "missing"
    : page.enabled === false
      ? "disabled"
      : page.published
        ? "published"
        : "draft";
  const pageStatusLabel = {
    published: "Published",
    draft: "Draft",
    disabled: "Disabled",
    missing: "Missing",
  }[pageStatus];
  const pageStatusClass = {
    published: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
    draft: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80",
    disabled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/80",
    missing: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80",
  }[pageStatus];
  const pageCopy = {
    published: "This professional has a published page.",
    draft: "A page exists, but it is not published.",
    disabled: "The public page is turned off.",
    missing: "No public page yet.",
  }[pageStatus];

  const metricCards = [
    {
      label: "Visitors",
      value: traffic?.profile_views ?? stats?.page_views ?? 0,
      hint: `${traffic?.unique_visitors ?? 0} unique · last 30 days`,
      icon: Users,
    },
    {
      label: "Chatbot leads captured",
      value: traffic?.chatbot_leads ?? stats?.chatbot_leads ?? 0,
      hint: "All-time from chat",
      icon: Bot,
    },
    {
      label: "Direct inquiry submit",
      value: traffic?.form_leads ?? stats?.form_leads ?? 0,
      hint: "All-time public form submits",
      icon: ClipboardPen,
    },
  ];

  return (
    <div className="w-full space-y-0 border-b border-slate-200 bg-white">
      <div className="grid gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 xl:grid-cols-4 lg:px-8">
        <StatCard
          label="Leads won"
          value={stats?.leads_won ?? 0}
          hint="Converted"
          icon={Trophy}
          tone="emerald"
        />
        <StatCard
          label="Leads lost"
          value={stats?.leads_lost ?? 0}
          hint="Closed lost"
          icon={TrendingDown}
          tone="rose"
        />
        <StatCard
          label="Open pipeline"
          value={stats?.leads_open ?? 0}
          hint={`${stats?.leads_owned ?? 0} total · ${stats?.leads_closed ?? 0} closed`}
          icon={Sparkles}
          tone="sky"
        />
        <StatCard
          label="Page views"
          value={traffic?.profile_views ?? 0}
          hint={`${traffic?.unique_visitors ?? 0} unique visitors · 30 days`}
          icon={Eye}
          tone="indigo"
        />
      </div>

      <section className="border-t border-slate-200 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Public page
            </p>
            <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">
              {page?.template_name || page?.headline || "Storefront"}
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">{pageCopy}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${pageStatusClass}`}
            >
              {pageStatusLabel}
            </span>
            {page?.path ? (
              <a
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className={`${adminGhostButtonClass} h-9 gap-1.5 !rounded-full px-3.5 text-xs`}
              >
                <Eye size={13} />
                Preview page
              </a>
            ) : (
              <span
                className={`${adminGhostButtonClass} pointer-events-none h-9 gap-1.5 !rounded-full px-3.5 text-xs opacity-45`}
              >
                <Eye size={13} />
                Preview page
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {metricCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white px-4 py-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {item.label}
                  </p>
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200/80">
                    <Icon size={14} strokeWidth={2} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">
                  {item.value}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.hint}</p>
              </div>
            );
          })}
        </div>

        <CompactViewsChart data={traffic?.views_by_day || []} />
      </section>
    </div>
  );
}

export function LeadOutcomeBadge({ status }) {
  const tone =
    {
      converted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
      closed_lost: "bg-rose-50 text-rose-800 ring-rose-200",
      consult_booked: "bg-sky-50 text-sky-800 ring-sky-200",
      showing_booked: "bg-indigo-50 text-indigo-800 ring-indigo-200",
      nurturing: "bg-amber-50 text-amber-900 ring-amber-200",
    }[status] || "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tone}`}
    >
      {formatAdminLabel(status)}
    </span>
  );
}
