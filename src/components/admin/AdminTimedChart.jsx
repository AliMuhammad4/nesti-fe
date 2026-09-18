"use client";

import { useState } from "react";
import { useAdminAnalytics } from "@/hooks/useAdminApi";
import { AdminChartCard } from "@/components/admin/AdminUi";

/**
 * Chart card with its own time-range filter and analytics fetch.
 * React Query caches by range, so shared ranges reuse one request.
 */
export default function AdminTimedChart({
  title,
  subtitle,
  defaultRange = "30d",
  children,
}) {
  const [range, setRange] = useState(defaultRange);
  const { data, isLoading, isFetching, isError, error } = useAdminAnalytics(range);

  return (
    <AdminChartCard
      title={title}
      subtitle={subtitle}
      range={range}
      onRangeChange={setRange}
      loading={isLoading}
    >
      {isError ? (
        <div className="flex h-[240px] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-center text-sm text-red-600">
          {error?.message || "Failed to load chart"}
        </div>
      ) : (
        <div className={isFetching && !isLoading ? "opacity-70 transition" : undefined}>
          {typeof children === "function" ? children(data) : children}
        </div>
      )}
    </AdminChartCard>
  );
}
