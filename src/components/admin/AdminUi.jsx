"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#0f172a", "#0ea5e9", "#14b8a6", "#6366f1", "#f59e0b", "#f43f5e", "#64748b"];
export const CHART_HEIGHT = 240;

export const CHART_RANGE_OPTIONS = [
  { value: "30d", label: "Last month" },
  { value: "90d", label: "3 months" },
  { value: "180d", label: "6 months" },
  { value: "365d", label: "Year" },
];

const LABEL_MAP = {
  total: "Total",
  open: "Open",
  closed: "Closed",
  active: "Active",
  trial: "Trial",
  canceled: "Canceled",
  cancelled: "Canceled",
  agent: "Agent",
  mortgage_broker: "Mortgage broker",
  lawyer: "Lawyer",
  client: "Client",
  admin: "Admin",
  new: "New",
  consult_booked: "Consult booked",
  showing_booked: "Showing booked",
  nurturing: "Nurturing",
  converted: "Converted",
  closed_lost: "Closed lost",
  free_trial: "Free trial",
  trialing: "Trialing",
  past_due: "Past due",
  expired: "Expired",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
  incomplete_expired: "Incomplete expired",
  basic: "Basic",
  standard: "Standard",
  enterprise: "Enterprise",
  pro: "Pro",
  pending_review: "Pending review",
  pending_docs: "Pending docs",
  not_started: "Not started",
  approved: "Approved",
  rejected: "Rejected",
  gov_id_front: "Government ID (front)",
  gov_id_back: "Government ID (back)",
  selfie: "Selfie",
  license_proof: "License proof",
  affiliation_proof: "Affiliation proof",
  nmls_screenshot: "NMLS screenshot",
  eo_insurance: "E&O insurance",
  professional: "Professional",
};

function titleCaseWords(value = "") {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatAdminLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Unknown";

  if (raw.includes(":")) {
    const [kind, status] = raw.split(":");
    const kindLabel = kind === "pro" ? "Professional" : formatAdminLabel(kind);
    return `${kindLabel} · ${formatAdminLabel(status)}`;
  }

  if (LABEL_MAP[raw]) return LABEL_MAP[raw];
  if (LABEL_MAP[raw.toLowerCase()]) return LABEL_MAP[raw.toLowerCase()];
  return titleCaseWords(raw);
}

export function formatAdminDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatPersonName(value = "") {
  return titleCaseWords(String(value || "").toLowerCase());
}

export function prepareRoleMix(items = []) {
  return (items || [])
    .filter((item) => String(item?.name || "").toLowerCase() !== "admin")
    .map((item) => ({
      ...item,
      name: formatAdminLabel(item.name),
      value: Number(item.value) || 0,
    }));
}

export function prepareNamedMix(items = []) {
  return (items || []).map((item) => ({
    ...item,
    name: formatAdminLabel(item.name),
    value: Number(item.value) || 0,
  }));
}

export function prepareTopProfessionals(items = []) {
  return (items || []).map((item) => ({
    name: formatPersonName(item.name || item.email || "Professional"),
    value: Number(item.leads ?? item.value) || 0,
  }));
}

export function prepareSeries(items = []) {
  return (items || []).map((item) => ({
    ...item,
    date: formatAdminDate(item.date),
  }));
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-950/95 px-3.5 py-2.5 shadow-2xl backdrop-blur">
      {label ? <div className="mb-1.5 text-[11px] font-medium text-slate-400">{label}</div> : null}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-8 text-[12px]">
            <span className="inline-flex items-center gap-2 text-slate-200">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: entry.color || entry.fill || "#94a3b8" }} />
              {formatAdminLabel(entry.name)}
            </span>
            <span className="font-semibold tabular-nums text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartLegend({ items = [] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((item) => (
        <div key={item.key || item.name} className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-600">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: item.color }} />
          {item.name}
        </div>
      ))}
    </div>
  );
}

export function ChartRangeSelect({ value = "30d", onChange }) {
  return (
    <AdminSelect
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      options={CHART_RANGE_OPTIONS}
      className="!h-8 !min-w-0 py-0 pl-2.5 pr-7 text-[11px] font-medium"
      aria-label="Chart time range"
    />
  );
}

export function AdminKpiGrid({ items = [] }) {
  // 2xl:grid-cols-6 -> allow 7 KPI cards
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => {
        const cardClass =
          "rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:border-slate-300";
        const body = (
          <>
            <div className="text-[11px] font-medium text-slate-500">{item.label}</div>
            <div className="mt-2 text-[1.65rem] font-semibold tracking-tight text-slate-950 tabular-nums">
              {item.value}
            </div>
            {item.hint ? <div className="mt-1 text-[11px] leading-4 text-slate-400">{item.hint}</div> : null}
          </>
        );
        if (item.href) {
          return (
            <Link key={item.label} href={item.href} className={`${cardClass} block hover:bg-slate-50`}>
              {body}
            </Link>
          );
        }
        return (
          <div key={item.label} className={cardClass}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function AdminChartCard({
  title,
  subtitle,
  children,
  className = "",
  range,
  onRangeChange,
  loading = false,
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{subtitle}</p> : null}
        </div>
        {onRangeChange ? <ChartRangeSelect value={range} onChange={onRangeChange} /> : null}
      </div>
      <div className="relative w-full" style={{ minHeight: CHART_HEIGHT + 36 }}>
        {loading ? (
          <div className="flex h-[276px] items-center justify-center text-sm text-slate-400">Loading…</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function EmptyChart({ message = "No data in this range" }) {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
      {message}
    </div>
  );
}

export function AdminLineChart({
  data = [],
  lines = [{ key: "total", color: "#0f172a", name: "Total" }],
}) {
  const chartData = prepareSeries(data);
  const primary = lines[0];
  const hasValues = chartData.some((row) => lines.some((line) => Number(row[line.key]) > 0));

  if (!chartData.length) return <EmptyChart />;

  return (
    <div>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={`admin-line-glow-${primary.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary.color} stopOpacity={0.16} />
              <stop offset="100%" stopColor={primary.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            minTickGap={28}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            allowDecimals={false}
            width={28}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={[0, (max) => Math.max(4, max || 0)]}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey={primary.key}
            stroke="none"
            fill={`url(#admin-line-glow-${primary.key})`}
            legendType="none"
            tooltipType="none"
            isAnimationActive={false}
          />
          {lines.map((line, index) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name || formatAdminLabel(line.key)}
              stroke={line.color}
              strokeWidth={index === 0 ? 2.75 : 2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: line.color }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      {!hasValues ? (
        <p className="mt-1 text-center text-[11px] text-slate-400">No activity in this range yet</p>
      ) : null}
      <ChartLegend
        items={lines.map((line) => ({
          key: line.key,
          name: line.name || formatAdminLabel(line.key),
          color: line.color,
        }))}
      />
    </div>
  );
}

export function AdminAreaChart({
  data = [],
  areas = [{ key: "total", color: "#0f172a", name: "Total" }],
}) {
  const chartData = prepareSeries(data);
  const hasValues = chartData.some((row) => areas.some((area) => Number(row[area.key]) > 0));

  if (!chartData.length) return <EmptyChart />;

  return (
    <div>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            {areas.map((area) => (
              <linearGradient key={area.key} id={`admin-area-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={area.color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={area.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            minTickGap={28}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            allowDecimals={false}
            width={28}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={[0, (max) => Math.max(4, max || 0)]}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} />
          {areas.map((area) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.name || formatAdminLabel(area.key)}
              stroke={area.color}
              fill={`url(#admin-area-${area.key})`}
              strokeWidth={2.25}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      {!hasValues ? (
        <p className="mt-1 text-center text-[11px] text-slate-400">No activity in this range yet</p>
      ) : null}
      <ChartLegend
        items={areas.map((area) => ({
          key: area.key,
          name: area.name || formatAdminLabel(area.key),
          color: area.color,
        }))}
      />
    </div>
  );
}

export function AdminBarChart({ data = [], dataKey = "value", nameKey = "name", layout = "vertical" }) {
  const chartData = (data || []).map((item) => ({
    ...item,
    [nameKey]: String(item[nameKey] || ""),
  }));
  const isHorizontal = layout === "horizontal";

  if (!chartData.length) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart
        data={chartData}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 10, left: isHorizontal ? 0 : -12, bottom: isHorizontal ? 0 : 4 }}
        barCategoryGap="28%"
      >
        <CartesianGrid stroke="#f1f5f9" vertical={false} horizontal />
        {isHorizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey={nameKey}
              width={112}
              tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                const label = String(value || "");
                return label.length > 14 ? `${label.slice(0, 13)}…` : label;
              }}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={nameKey}
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              height={36}
            />
            <YAxis allowDecimals={false} width={28} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
        <Bar
          dataKey={dataKey}
          radius={isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
          maxBarSize={isHorizontal ? 18 : 36}
        >
          {chartData.map((entry, index) => (
            <Cell key={`${entry[nameKey]}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AdminDonutChart({ data = [] }) {
  const chartData = (data || [])
    .map((item) => ({
      name: formatAdminLabel(item.name),
      value: Number(item.value) || 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (!chartData.length) {
    return <EmptyChart message="No data in this range" />;
  }

  return (
    <div className="flex min-h-[240px] flex-col justify-center gap-4 py-1">
      <div>
        <div className="text-[11px] font-medium text-slate-500">Total</div>
        <div className="text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">{total}</div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-md bg-slate-100">
        <div className="flex h-full w-full">
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="h-full first:rounded-l-md last:rounded-r-md"
              style={{
                width: `${(item.value / total) * 100}%`,
                background: CHART_COLORS[index % CHART_COLORS.length],
              }}
              title={`${item.name}: ${item.value}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {chartData.map((item, index) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="truncate text-[12px] font-medium text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] tabular-nums">
                <span className="font-semibold text-slate-900">{item.value}</span>
                <span className="w-8 text-right text-slate-400">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, actions = null }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
      <div className="max-w-3xl">
        <h1 className="text-[1.65rem] font-semibold tracking-tight text-slate-950">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}

function isRowClickBlocked(target) {
  return Boolean(
    target?.closest?.("a, button, input, select, textarea, label, [data-stop-row-click]")
  );
}

export function AdminTable({
  columns = [],
  rows = [],
  empty = "No records found.",
  getRowHref,
}) {
  const router = useRouter();

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center text-sm text-slate-500">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-medium text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href = typeof getRowHref === "function" ? getRowHref(row) : null;
              const clickable = Boolean(href);
              return (
                <tr
                  key={row.id || row.key}
                  role={clickable ? "link" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={(e) => {
                    if (!clickable || isRowClickBlocked(e.target)) return;
                    router.push(href);
                  }}
                  onKeyDown={(e) => {
                    if (!clickable || isRowClickBlocked(e.target)) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(href);
                    }
                  }}
                  className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${
                    clickable ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 align-middle text-slate-800">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminFilters({ children }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
      {children}
    </div>
  );
}

export function AdminPagination({ page, pages, onPageChange, disabled = false }) {
  const current = Math.max(1, Number(page) || 1);
  const totalPages = Math.max(1, Number(pages) || 1);
  return (
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>
        Page {current} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || current <= 1}
          onClick={() => onPageChange?.(current - 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={disabled || current >= totalPages}
          onClick={() => onPageChange?.(current + 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function AdminErrorState({ message, onRetry, retrying = false }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      <p>{message || "Something went wrong."}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:opacity-50"
        >
          {retrying ? "Retrying…" : "Retry"}
        </button>
      ) : null}
    </div>
  );
}

export function AdminEmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
      <p className="text-sm font-semibold text-slate-800">{title || "No records found."}</p>
      {hint ? <p className="mt-1.5 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function AdminTabs({ tabs = [], value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange?.(tab.value)}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              active
                ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function initialsFrom(name = "", email = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return String(email || "?").slice(0, 2).toUpperCase();
}

/** Avatar + name cell for admin tables. */
export function AdminPersonCell({
  name,
  email,
  imageUrl,
  href,
  subtitle,
}) {
  const label = name || email || "User";
  const avatar = (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsFrom(name, email)
      )}
    </span>
  );

  const text = (
    <span className="min-w-0">
      <span className="block truncate font-semibold text-slate-900">{label}</span>
      {subtitle || email ? (
        <span className="mt-0.5 block truncate text-xs text-slate-500">{subtitle || email}</span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex min-w-0 items-center gap-3 hover:opacity-90">
        {avatar}
        {text}
      </Link>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-3">
      {avatar}
      {text}
    </div>
  );
}

export const adminInputClass =
  "h-10 min-w-[10.5rem] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export const adminSelectClass =
  `${adminInputClass} appearance-none bg-[length:14px_14px] bg-[right_0.75rem_center] bg-no-repeat pr-9 cursor-pointer`;

export const adminSelectChevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%6494A3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")";

export const adminTextareaClass =
  "min-h-[7rem] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50";

export const adminButtonClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50";
export const adminGhostButtonClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50";
export const adminDangerButtonClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-rose-700 px-4 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50";
export const adminWarningButtonClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50";

/** Polished native select with consistent chevron and option styling. */
export function AdminSelect({
  value,
  onChange,
  options = [],
  placeholder,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
  ...rest
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange?.(e)}
      className={`${adminSelectClass} ${className}`}
      style={{ backgroundImage: adminSelectChevron }}
      {...rest}
    >
      {placeholder ? (
        <option value="" disabled={rest.required}>
          {placeholder}
        </option>
      ) : null}
      {options.map((opt) => {
        const option = typeof opt === "string" ? { value: opt, label: opt } : opt;
        return (
          <option key={String(option.value)} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
}

/** Shared admin modal shell (portal + escape + body scroll lock). */
export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer = null,
  size = "md",
  dismissible = true,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && dismissible) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, dismissible]);

  if (!open || typeof document === "undefined") return null;

  const width =
    size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : size === "xl" ? "max-w-4xl" : "max-w-md";

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={() => dismissible && onClose?.()}
      />
      <div
        className={`relative w-full ${width} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title ? <h3 className="text-base font-semibold tracking-tight text-slate-950">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p> : null}
          </div>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

/** Confirm / reason modal used across admin actions. */
export function AdminConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  subtitle,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pending = false,
  tone = "default",
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Add a short reason…",
  minReasonLength = 3,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const confirmDisabled =
    pending || (requireReason && String(reason || "").trim().length < minReasonLength);

  const confirmClass =
    tone === "danger"
      ? adminDangerButtonClass
      : tone === "warning"
        ? adminWarningButtonClass
        : adminButtonClass;

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      dismissible={!pending}
      footer={
        <>
          <button type="button" className={adminGhostButtonClass} onClick={onClose} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClass}
            disabled={confirmDisabled}
            onClick={() => onConfirm?.(requireReason ? reason.trim() : undefined)}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </>
      }
    >
      {requireReason ? (
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">{reasonLabel}</span>
          <textarea
            className={adminTextareaClass}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            autoFocus
          />
          <span className="mt-1.5 block text-[11px] text-slate-400">
            At least {minReasonLength} characters.
          </span>
        </label>
      ) : (
        <p className="text-sm leading-relaxed text-slate-600">
          {message || "Please confirm you want to continue."}
        </p>
      )}
    </AdminModal>
  );
}
