"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminLeads } from "@/hooks/useAdminApi";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPagination,
  AdminPersonCell,
  AdminTable,
  AdminTabs,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import { PIPELINE_SIDEBAR_ITEMS } from "@/lib/leadPipelineConfig";

function sourceLabel(value) {
  if (value === "chatbot") return "Chatbot";
  if (value === "form") return "Form";
  if (value === "direct_inquiry") return "Direct inquiry";
  return formatAdminLabel(value || "unknown");
}

function pipelineKeyFromSearchParams(searchParams) {
  const raw = String(searchParams.get("pipeline") || "active").trim().toLowerCase();
  return PIPELINE_SIDEBAR_ITEMS.some((item) => item.key === raw) ? raw : "active";
}

function pageFromSearchParams(searchParams) {
  const n = Number(searchParams.get("page"));
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/**
 * Leads list for one professional on the admin profile.
 * Pipeline switches match the professional sidebar: Active / Recurring / Nurturing.
 */
export default function AdminProfessionalLeadsPanel({
  userId,
  professionalProfileId,
  professionalRole,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pipelineKey = pipelineKeyFromSearchParams(searchParams);
  const page = pageFromSearchParams(searchParams);

  const selected = PIPELINE_SIDEBAR_ITEMS.find((item) => item.key === pipelineKey) || PIPELINE_SIDEBAR_ITEMS[0];

  const replaceLeadsQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "leads");
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === "" || (key === "page" && Number(value) <= 1)) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const params = useMemo(() => {
    const next = {
      user_id: userId,
      page,
      limit: 10,
    };
    if (selected?.kind === "status") next.status = selected.value;
    else next.pipeline = selected?.value || "active";
    return next;
  }, [userId, page, selected]);

  const { data, isLoading, isError, error, isFetching, refetch } = useAdminLeads(
    params,
    Boolean(userId),
  );

  if (!userId) {
    return (
      <AdminEmptyState
        title="No user linked"
        hint="This professional profile is missing a user account, so leads cannot be listed."
      />
    );
  }

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <AdminErrorState message={error?.message} onRetry={() => refetch()} retrying={isFetching} />
    );
  }

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };
  const backParams = new URLSearchParams();
  backParams.set("tab", "leads");
  if (pipelineKey && pipelineKey !== "active") backParams.set("pipeline", pipelineKey);
  if (page > 1) backParams.set("page", String(page));
  const back = `/admin/professionals/${professionalProfileId}?${backParams.toString()}`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">Lead pipeline</h3>
        <p className="mt-1 text-xs text-slate-500">
          Same Active / Recurring / Nurturing filters this professional sees on their leads list.
        </p>
      </div>

      <AdminTabs
        tabs={PIPELINE_SIDEBAR_ITEMS.map((item) => ({ value: item.key, label: item.label }))}
        value={pipelineKey}
        onChange={(next) => {
          replaceLeadsQuery({ pipeline: next === "active" ? null : next, page: 1 });
        }}
      />

      {items.length ? (
        <AdminTable
          getRowHref={(row) =>
            `/admin/leads/${row.id}?back=${encodeURIComponent(back)}&ownerRole=${encodeURIComponent(
              professionalRole || "",
            )}`
          }
          columns={[
            {
              key: "inquirer",
              label: "Inquirer",
              render: (row) => (
                <AdminPersonCell
                  name={formatPersonName(
                    row.inquirer_name || row.inquirer_email || `Lead ${String(row.id).slice(-6)}`,
                  )}
                  email={row.inquirer_email}
                  imageUrl={row.inquirer_image}
                />
              ),
            },
            {
              key: "inquiry_source",
              label: "Source",
              render: (row) => (
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  {sourceLabel(row.inquiry_source)}
                </span>
              ),
            },
            {
              key: "match_status",
              label: "Status",
              render: (row) => formatAdminLabel(row.match_status),
            },
            {
              key: "lead_type",
              label: "Type",
              render: (row) => formatAdminLabel(row.lead_type),
            },
            {
              key: "open",
              label: "",
              render: (row) => (
                <Link
                  href={`/admin/leads/${row.id}?back=${encodeURIComponent(back)}&ownerRole=${encodeURIComponent(
                    professionalRole || "",
                  )}`}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-950"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open
                </Link>
              ),
            },
          ]}
          rows={items}
        />
      ) : (
        <AdminEmptyState
          title="No leads in this pipeline"
          hint="Try another pipeline filter, or check again after this professional receives new inquiries."
        />
      )}

      <AdminPagination
        page={pagination.page || page}
        pages={pagination.pages || 1}
        onPageChange={(nextPage) => replaceLeadsQuery({
          pipeline: pipelineKey === "active" ? null : pipelineKey,
          page: nextPage,
        })}
      />
    </div>
  );
}
