"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

const PRIMARY = "#16a34a";
const MUTED = "#e2e8f0";
const GOAL_LINE = "#94a3b8";

function formatMoneyShort(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}

function ChartTooltip({ active, payload, label, valueFormatter = (v) => v }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      {label ? <p className="mb-1 font-semibold text-gray-900">{label}</p> : null}
      <ul className="space-y-0.5 text-gray-600">
        {payload.map((entry) => (
          <li key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-gray-900">{valueFormatter(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function buildSavingsProjection({ currentSavings, monthlySavings, downPaymentGoal, maxMonths = 18 }) {
  const start = Math.max(0, Number(currentSavings) || 0);
  const monthly = Math.max(0, Number(monthlySavings) || 0);
  const goal = Math.max(0, Number(downPaymentGoal) || 0);
  const rows = [{ month: "Now", savings: start, goal: goal || undefined }];

  if (!monthly) return rows;

  let balance = start;
  for (let m = 1; m <= maxMonths; m += 1) {
    balance += monthly;
    rows.push({
      month: `+${m} mo`,
      savings: goal > 0 ? Math.min(balance, goal) : balance,
      goal: goal || undefined,
    });
    if (goal > 0 && balance >= goal) break;
  }
  return rows;
}

export function SavingsDonutChart({ currentSavings, downPaymentGoal }) {
  const saved = Math.max(0, Number(currentSavings) || 0);
  const goal = Math.max(0, Number(downPaymentGoal) || 0);
  const remaining = goal > 0 ? Math.max(0, goal - saved) : 0;

  const data = useMemo(() => {
    if (goal <= 0) {
      return saved > 0
        ? [{ name: "Saved", value: saved, color: PRIMARY }]
        : [{ name: "Not set", value: 1, color: MUTED }];
    }
    if (remaining <= 0) {
      return [{ name: "Goal reached", value: saved || 1, color: PRIMARY }];
    }
    return [
      { name: "Saved", value: saved, color: PRIMARY },
      { name: "Remaining", value: remaining, color: MUTED },
    ];
  }, [goal, remaining, saved]);

  const progress = goal > 0 ? Math.min(100, Math.round((saved / goal) * 100)) : 0;

  return (
    <div className="flex h-full min-h-[190px] flex-col">
      <p className="text-xs font-medium text-gray-500">Down payment</p>
      <div className="relative mt-2 flex-1 min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={66}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatMoneyShort(value)}
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  payload={payload}
                  valueFormatter={formatMoneyShort}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-gray-900">{goal > 0 ? `${progress}%` : "—"}</span>
          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-400">saved</span>
        </div>
      </div>
      <div className="mt-1 flex gap-4 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Saved {formatMoneyShort(saved)}
        </span>
        {goal > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            Goal {formatMoneyShort(goal)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SavingsProjectionChart({ currentSavings, monthlySavings, downPaymentGoal }) {
  const data = useMemo(
    () =>
      buildSavingsProjection({
        currentSavings,
        monthlySavings,
        downPaymentGoal,
        maxMonths: 18,
      }),
    [currentSavings, downPaymentGoal, monthlySavings],
  );

  const goal = Math.max(0, Number(downPaymentGoal) || 0);

  return (
    <div className="flex h-full min-h-[190px] flex-col">
      <p className="text-xs font-medium text-gray-500">Savings projection</p>
      <div className="mt-2 flex-1 min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="clientSavingsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={MUTED} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={formatMoneyShort}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip active={active} payload={payload} label={label} valueFormatter={formatMoneyShort} />
              )}
            />
            {goal > 0 ? (
              <ReferenceLine y={goal} stroke={GOAL_LINE} strokeDasharray="4 4" label={{ value: "Goal", fill: "#64748b", fontSize: 10 }} />
            ) : null}
            <Area
              type="monotone"
              dataKey="savings"
              name="Projected savings"
              stroke={PRIMARY}
              strokeWidth={2}
              fill="url(#clientSavingsFill)"
              dot={{ r: 2, fill: PRIMARY }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProfileSectionsBarChart({ sections }) {
  const data = useMemo(
    () =>
      (Array.isArray(sections) ? sections : []).map((section) => ({
        name: section.title,
        complete: section.totalCount > 0 ? Math.round((section.completedCount / section.totalCount) * 100) : 0,
      })),
    [sections],
  );

  return (
    <div className="min-h-[200px]">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={MUTED} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            tick={{ fontSize: 11, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => `${value}%`}
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} payload={payload} label={label} valueFormatter={(v) => `${v}%`} />
            )}
          />
          <Bar dataKey="complete" name="Complete" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
