"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useAdminPatchLead, useAdminProfessionals } from "@/hooks/useAdminApi";
import {
  AdminPersonCell,
  AdminSelect,
  adminButtonClass,
  adminGhostButtonClass,
  adminInputClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import { LEAD_MATCH_STATUS_OPTIONS, PIPELINE_AUTOMATION_STATUS_LABELS } from "@/lib/leadPipelineConfig";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAdminCanWrite } from "@/hooks/useAdminPermissions";
import { ADMIN_PERMISSION } from "@/lib/adminPermissions";

const LEAD_TYPE_OPTIONS = [
  "hot_buyer",
  "warm_buyer",
  "interested_buyer",
  "cold_buyer",
  "hot_seller",
  "warm_seller",
  "interested_seller",
  "cold_seller",
  "hot_client",
  "warm_client",
  "interested_client",
  "cold_client",
  "unknown",
].map((value) => ({ value, label: formatAdminLabel(value) }));

const OWNER_SEARCH_MIN_LENGTH = 2;

function ownerDisplayName(owner) {
  return formatPersonName(
    [owner?.first_name, owner?.last_name].filter(Boolean).join(" ") || owner?.email || "Professional",
  );
}

export default function AdminLeadControlsPanel({
  leadId,
  lead,
  owner,
  ownerProfessionalId,
  inquirySource,
  insightsReady = false,
}) {
  const canWrite = useAdminCanWrite(ADMIN_PERMISSION.LEADS_WRITE);
  const patch = useAdminPatchLead();
  const [ownerSearch, setOwnerSearch] = useState("");
  const debouncedOwnerSearch = useDebouncedValue(ownerSearch.trim(), 300);
  const [form, setForm] = useState({
    user_id: "",
    lead_type: "",
    match_status: "",
  });

  useEffect(() => {
    if (!lead) return;
    setForm({
      user_id: owner?.id || owner?._id || "",
      lead_type: lead.lead_type || "unknown",
      match_status: lead.status || lead.match_status || "new",
    });
  }, [lead, owner?.id, owner?._id]);

  const searchReady = debouncedOwnerSearch.length >= OWNER_SEARCH_MIN_LENGTH;
  const professionalsQuery = useAdminProfessionals(
    {
      q: searchReady ? debouncedOwnerSearch : undefined,
      limit: 40,
      page: 1,
      status: "active",
    },
    searchReady,
  );
  const professionals = useMemo(
    () => (searchReady ? professionalsQuery.data?.items || [] : []),
    [searchReady, professionalsQuery.data?.items],
  );

  const ownerOptions = useMemo(() => {
    const currentId = String(owner?.id || owner?._id || "");
    const options = professionals
      .map((row) => {
        const userId = row.user?.id || row.user?._id;
        if (!userId) return null;
        const name = formatPersonName(row.full_name || ownerDisplayName(row.user));
        const role = formatAdminLabel(row.professional_type || row.user?.role || "professional");
        return { value: String(userId), label: `${name} · ${role}` };
      })
      .filter(Boolean);
    if (currentId && !options.some((option) => option.value === currentId)) {
      options.unshift({
        value: currentId,
        label: `${ownerDisplayName(owner)} · ${formatAdminLabel(owner?.role || "professional")}`,
      });
    }
    return options;
  }, [professionals, owner]);

  const statusOptions = useMemo(() => {
    const current = String(form.match_status || "");
    const options = [...LEAD_MATCH_STATUS_OPTIONS];
    if (current && PIPELINE_AUTOMATION_STATUS_LABELS[current]) {
      options.unshift({
        value: current,
        label: PIPELINE_AUTOMATION_STATUS_LABELS[current],
      });
    } else if (current && !options.some((option) => option.value === current)) {
      options.unshift({ value: current, label: formatAdminLabel(current) });
    }
    return options;
  }, [form.match_status]);

  const dirty =
    String(form.user_id) !== String(owner?.id || owner?._id || "") ||
    String(form.lead_type) !== String(lead?.lead_type || "") ||
    String(form.match_status) !== String(lead?.status || lead?.match_status || "");

  const createdLabel = lead?.created_at || lead?.createdAt
    ? new Date(lead.created_at || lead.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : "—";

  const onSave = () => {
    if (!canWrite) return;
    const data = {};
    if (form.user_id && String(form.user_id) !== String(owner?.id || owner?._id || "")) {
      data.user_id = form.user_id;
    }
    if (form.lead_type && form.lead_type !== lead?.lead_type) data.lead_type = form.lead_type;
    if (form.match_status && form.match_status !== (lead?.status || lead?.match_status)) {
      data.match_status = form.match_status;
    }
    if (!Object.keys(data).length) return;
    patch.mutate({ id: leadId, data });
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Admin controls</h2>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                Reassign this lead to another professional or correct its type and pipeline. All
                other workspace tabs already run as the current owner.
              </p>
            </div>
          </div>
          {ownerProfessionalId ? (
            <Link
              href={`/admin/professionals/${ownerProfessionalId}`}
              className={`${adminGhostButtonClass} h-9 gap-1.5 px-3 text-xs`}
            >
              Open professional
              <ExternalLink size={13} />
            </Link>
          ) : null}
        </div>

        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Current owner
          </p>
          <div className="mt-3">
            <AdminPersonCell
              name={ownerDisplayName(owner)}
              email={owner?.email}
              imageUrl={owner?.profile_image}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <label className="space-y-1.5 text-xs font-semibold text-slate-700">
            Reassign owner
            <input
              className={`${adminInputClass} w-full min-w-0`}
              value={ownerSearch}
              onChange={(event) => setOwnerSearch(event.target.value)}
              placeholder={`Search professionals (min ${OWNER_SEARCH_MIN_LENGTH} chars)`}
              disabled={!canWrite}
            />
            {ownerSearch.trim() && !searchReady ? (
              <p className="text-[11px] font-normal text-slate-500">
                Type at least {OWNER_SEARCH_MIN_LENGTH} characters to search.
              </p>
            ) : null}
            <AdminSelect
              className="w-full min-w-0"
              value={form.user_id}
              onChange={(event) => setForm((prev) => ({ ...prev, user_id: event.target.value }))}
              options={ownerOptions}
              aria-label="Lead owner"
              disabled={!canWrite}
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-700">
            Lead type
            <AdminSelect
              className="w-full min-w-0"
              value={form.lead_type}
              onChange={(event) => setForm((prev) => ({ ...prev, lead_type: event.target.value }))}
              options={LEAD_TYPE_OPTIONS}
              aria-label="Lead type"
              disabled={!canWrite}
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-700">
            Pipeline status
            <AdminSelect
              className="w-full min-w-0"
              value={form.match_status}
              onChange={(event) => setForm((prev) => ({ ...prev, match_status: event.target.value }))}
              options={statusOptions}
              aria-label="Pipeline status"
              disabled={!canWrite}
            />
          </label>
        </div>

        {canWrite ? (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className={adminGhostButtonClass}
              disabled={patch.isPending || !dirty}
              onClick={() =>
                setForm({
                  user_id: owner?.id || owner?._id || "",
                  lead_type: lead?.lead_type || "unknown",
                  match_status: lead?.status || lead?.match_status || "new",
                })
              }
            >
              Reset
            </button>
            <button
              type="button"
              className={adminButtonClass}
              disabled={patch.isPending || !dirty}
              onClick={onSave}
            >
              {patch.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Source", value: formatAdminLabel(inquirySource || lead?.source || "unknown") },
          { label: "Created", value: createdLabel },
          { label: "Conversation", value: lead?.conversation_id ? "Linked" : "None" },
          { label: "AI insights", value: insightsReady ? "Processed" : "Not processed" },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
