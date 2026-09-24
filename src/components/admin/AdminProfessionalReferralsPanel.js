"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminReferrals } from "@/hooks/useAdminApi";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPagination,
  AdminTabs,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import ReferralsDataTable, {
  normalizeReferralRows,
} from "@/components/referrals/ReferralsDataTable";

const DIRECTION_TABS = [
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
];

function pageFromSearchParams(searchParams) {
  const n = Number(searchParams.get("page"));
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/**
 * Inbound / outbound referrals for one professional on the admin profile.
 * Uses the same table and workspace entry points as the professional referrals page.
 */
export default function AdminProfessionalReferralsPanel({
  userId,
  professionalProfileId,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const directionFromUrl = String(searchParams.get("direction") || "inbound")
    .trim()
    .toLowerCase();
  const direction = directionFromUrl === "outbound" ? "outbound" : "inbound";
  const page = pageFromSearchParams(searchParams);

  const replaceReferralsQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "referrals");
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === "" || (key === "page" && Number(value) <= 1)) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setDirection = (next) => {
    const value = next === "outbound" ? "outbound" : "inbound";
    replaceReferralsQuery({ direction: value, page: 1 });
  };

  const queryParams = useMemo(
    () => ({
      user_id: userId,
      direction,
      page,
      limit: 10,
    }),
    [userId, direction, page],
  );

  const { data, isLoading, isError, error, isFetching, refetch } =
    useAdminReferrals(queryParams, Boolean(userId));

  if (!userId) {
    return (
      <AdminEmptyState
        title="No user linked"
        hint="This professional profile is missing a user account, so referrals cannot be listed."
      />
    );
  }

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <AdminErrorState
        message={error?.message}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  const rows = normalizeReferralRows(data);
  const pagination = data?.pagination || { page: 1, pages: 1 };
  const counts = data?.counts || {};
  const backParams = new URLSearchParams();
  backParams.set("tab", "referrals");
  backParams.set("direction", direction);
  if (page > 1) backParams.set("page", String(page));
  const back = `/admin/professionals/${professionalProfileId}?${backParams.toString()}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Referrals</h3>
          <p className="mt-1 text-xs text-slate-500">
            Inbound are sent to this professional. Outbound are referrals they sent.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          {Number(counts.inbound_total || 0)} in · {Number(counts.outbound_total || 0)} out
          {counts.inbound_pending_total
            ? ` · ${Number(counts.inbound_pending_total)} pending inbound`
            : ""}
        </p>
      </div>

      <AdminTabs tabs={DIRECTION_TABS} value={direction} onChange={setDirection} />

      <ReferralsDataTable
        rows={rows}
        isLoading={false}
        isError={false}
        direction={direction}
        getDetailHref={(id, dir) =>
          `/admin/referrals/${id}?direction=${encodeURIComponent(dir)}&back=${encodeURIComponent(back)}&acting_user_id=${encodeURIComponent(userId)}`
        }
        heading={direction === "inbound" ? "Inbound referrals" : "Outbound referrals"}
        hint="Same columns and open actions this professional sees on their referrals list."
        emptyMessage={
          direction === "inbound" ? "No inbound referrals" : "No outbound referrals"
        }
        rowsPerPage={10}
        footer={
          <AdminPagination
            page={pagination.page || page}
            pages={pagination.pages || 1}
            onPageChange={(nextPage) => replaceReferralsQuery({ direction, page: nextPage })}
            disabled={isFetching}
          />
        }
      />
    </div>
  );
}
