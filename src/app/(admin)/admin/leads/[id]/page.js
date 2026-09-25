"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import {
  useAdminCancelLeadCalendly,
  useAdminCreateLeadReferral,
  useAdminDeleteLead,
  useAdminLead,
  useAdminLeadConversation,
  useAdminLeadInquiredProperty,
  useAdminLeadNurtureDraft,
  useAdminLeadNurtureLogs,
  useAdminLeadNurturePreview,
  useAdminLeadNurtureRefine,
  useAdminLeadNurtureSend,
  useAdminLeadPropertyMatches,
  useAdminLeadReferrals,
  useAdminPatchLead,
  useAdminPostLeadConversationMessage,
} from "@/hooks/useAdminApi";
import {
  AdminConfirmModal,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import AdminLeadControlsPanel from "@/components/admin/AdminLeadControlsPanel";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import LeadsWorkspaceTabs from "@/components/leads/LeadsWorkspaceTabs";
import LeadsProfileTab from "@/components/leads/LeadsProfileTab";
import LeadsDetailsTab from "@/components/leads/LeadsDetailsTab";
import LeadsConversationTab from "@/components/leads/LeadsConversationTab";
import LeadsPropertyMatchesTab from "@/components/leads/LeadsPropertyMatchesTab";
import LeadsConsultationTab from "@/components/leads/LeadsConsultationTab";
import LeadsIntelligenceTab from "@/components/leads/LeadsIntelligenceTab";
import LeadsNurtureTab from "@/components/leads/LeadsNurtureTab";
import LeadsActionsTab from "@/components/leads/LeadsActionsTab";
import LeadPipelineNotesPanel from "@/components/leads/LeadPipelineNotesPanel";
import { getLeadWorkspaceTabsForRole } from "@/lib/leadWorkspaceTabsMeta";
import { leadApiRowToConversationShape } from "@/lib/leadAdapters";
import {
  extractMessageMeta,
  extractMeta,
  formatMetaEntries,
  getActionConversationId,
  getConversationMeta,
  getPropertyMatchesTabLabel,
  normalizeList,
  sanitizeInternalReturnPath,
  shouldHideLeadConversationTab,
} from "@/lib/leadsPageUtils";
import { inquiredPropertyFromLead } from "@/lib/inquiredPropertyUtils";
import { API_ENDPOINTS, apiClient } from "@/lib/api";
import { useAppSelector } from "@/store";
import AdminVoiceAgentPanel from "@/components/admin/AdminVoiceAgentPanel";
import { useAdminCanWrite } from "@/hooks/useAdminPermissions";
import { ADMIN_PERMISSION } from "@/lib/adminPermissions";


async function fetchAdminProfessionalsForReferral({ token, role, page = 1, limit = 100 }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (role) params.set("professional_type", String(role));
  const data = await apiClient({
    url: `${API_ENDPOINTS.admin.professionals}?${params.toString()}`,
    token,
  });
  const items = Array.isArray(data?.items) ? data.items : [];
  // LeadsActionsTab treats row.id as the referral target user id.
  return {
    ...data,
    items: items
      .map((row) => {
        const userId = row?.user?.id || row?.user?._id || row?.user_id;
        if (!userId) return null;
        const fullName =
          row?.full_name
          || [row?.user?.first_name, row?.user?.last_name].filter(Boolean).join(" ").trim()
          || row?.user?.email
          || "Professional";
        return {
          id: String(userId),
          full_name: fullName,
          first_name: row?.user?.first_name || "",
          last_name: row?.user?.last_name || "",
          email: row?.user?.email || "",
          role: row?.professional_type || row?.user?.role || role || "",
        };
      })
      .filter(Boolean),
  };
}

export default function AdminLeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const token = useAppSelector((state) => state.auth.token);
  const canWriteLeads = useAdminCanWrite(ADMIN_PERMISSION.LEADS_WRITE);
  const canWriteReferrals = useAdminCanWrite(ADMIN_PERMISSION.REFERRALS_WRITE);
  const backHref =
    sanitizeInternalReturnPath(searchParams.get("back")) || "/admin/leads";

  const workspaceFromUrl = String(searchParams.get("ws") || "lead_profile").trim();
  const [activeTab, setActiveTabState] = useState(workspaceFromUrl || "lead_profile");
  const [showDelete, setShowDelete] = useState(false);
  const [nurtureForm, setNurtureForm] = useState({
    to_email: "",
    subject: "",
    body: "",
    refine_instruction: "",
    goal: "",
    tone: "",
    include_property_cards: true,
  });
  const [referralForm, setReferralForm] = useState({
    professional_role: "",
    target_user_id: "",
    notes: "",
  });
  const [activeReferralId, setActiveReferralId] = useState("");

  const leadQuery = useAdminLead(id);
  const patch = useAdminPatchLead();
  const remove = useAdminDeleteLead();
  const conversationQuery = useAdminLeadConversation(
    id,
    activeTab === "conversation" && !shouldHideLeadConversationTab(leadQuery.data?.lead),
  );
  const propertyMatchesQuery = useAdminLeadPropertyMatches(
    id,
    activeTab === "property_matches",
  );
  const inquiredPropertyQuery = useAdminLeadInquiredProperty(
    id,
    activeTab === "property_matches",
  );
  const nurtureLogsQuery = useAdminLeadNurtureLogs(id, activeTab === "nurture");
  const leadReferralsQuery = useAdminLeadReferrals(id, activeTab === "others");
  const postMessage = useAdminPostLeadConversationMessage();
  const nurtureDraft = useAdminLeadNurtureDraft();
  const nurtureRefine = useAdminLeadNurtureRefine();
  const nurturePreview = useAdminLeadNurturePreview();
  const nurtureSend = useAdminLeadNurtureSend();
  const createReferral = useAdminCreateLeadReferral();
  const cancelCalendly = useAdminCancelLeadCalendly();

  const lead = leadQuery.data?.lead || null;
  const owner = leadQuery.data?.admin?.owner || lead?.professional || null;
  const ownerRole = String(owner?.role || searchParams.get("ownerRole") || "").trim();

  const roleTabs = useMemo(() => getLeadWorkspaceTabsForRole(ownerRole), [ownerRole]);
  const hideConversationTab = shouldHideLeadConversationTab(lead);
  const hideInsightsTab = !lead?.ai_insights_ready;
  const tabs = useMemo(() => {
    const propertyMatchesLabel = getPropertyMatchesTabLabel(lead);
    const visible = roleTabs
      .filter((tab) => !(hideConversationTab && tab.id === "conversation"))
      .filter((tab) => !(hideInsightsTab && tab.id === "intelligence"))
      .map((tab) =>
        tab.id === "property_matches" ? { ...tab, label: propertyMatchesLabel } : tab,
      );
    return [...visible, { id: "admin", label: "Admin Controls" }];
  }, [roleTabs, hideConversationTab, hideInsightsTab, lead]);

  useEffect(() => {
    const next = String(searchParams.get("ws") || "lead_profile").trim() || "lead_profile";
    setActiveTabState((prev) => (prev === next ? prev : next));
  }, [searchParams]);

  const setActiveTab = (next) => {
    setActiveTabState(next);
    const params = new URLSearchParams(searchParams.toString());
    if (!next || next === "lead_profile") params.delete("ws");
    else params.set("ws", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (!tabs.length || tabs.some((tab) => tab.id === activeTab)) return;
    const fallback = tabs[0]?.id || "lead_profile";
    setActiveTabState(fallback);
    const params = new URLSearchParams(searchParams.toString());
    if (!fallback || fallback === "lead_profile") params.delete("ws");
    else params.set("ws", fallback);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [tabs, activeTab, searchParams, pathname, router]);

  const selectedConversation = useMemo(
    () => (lead ? leadApiRowToConversationShape(lead) : null),
    [lead],
  );
  const inquiredSellerLeadDetail = inquiredPropertyQuery.data?.seller_lead || null;
  const inquiredSellerConversation = useMemo(() => {
    if (!inquiredSellerLeadDetail) return null;
    return leadApiRowToConversationShape(inquiredSellerLeadDetail);
  }, [inquiredSellerLeadDetail]);
  const messages = useMemo(
    () => conversationQuery.data?.messages || normalizeList(conversationQuery.data),
    [conversationQuery.data],
  );
  const messagesQuery = useMemo(() => {
    if (!conversationQuery.data) return conversationQuery;
    const direct = conversationQuery.data.direct_chat;
    if (!direct) return conversationQuery;
    return {
      ...conversationQuery,
      data: {
        ...conversationQuery.data,
        direct_chat: {
          ...direct,
          can_reply: Boolean(direct.available || direct.thread_id || direct.can_reply),
        },
      },
    };
  }, [conversationQuery]);
  const messageMeta = useMemo(() => {
    const item = [...messages]
      .reverse()
      .find((message) => Object.keys(extractMessageMeta(message) || {}).length);
    return extractMessageMeta(item);
  }, [messages]);
  const propertyMatches = useMemo(() => {
    const payload = propertyMatchesQuery.data;
    return payload?.property_matches || payload?.propertyMatches || normalizeList(payload);
  }, [propertyMatchesQuery.data]);
  const conversationMeta = extractMeta(selectedConversation);
  const patchLead = (body) => patch.mutateAsync({ id, data: body });
  const nurtureLogs = useMemo(
    () => normalizeList(nurtureLogsQuery.data?.items || nurtureLogsQuery.data),
    [nurtureLogsQuery.data],
  );
  const conversationReferrals = useMemo(
    () => normalizeList(leadReferralsQuery.data?.items || leadReferralsQuery.data),
    [leadReferralsQuery.data],
  );

  const actionConversationId = getActionConversationId(lead);

  useEffect(() => {
    const email = String(
      lead?.contact?.email || lead?.contact?.canonical_email || lead?.inquirer?.email || "",
    ).trim();
    if (!email) return;
    setNurtureForm((prev) => (prev.to_email.trim() ? prev : { ...prev, to_email: email }));
  }, [lead?.id, lead?.contact?.email, lead?.contact?.canonical_email, lead?.inquirer?.email]);

  const nurtureDraftMutation = {
    isPending: nurtureDraft.isPending,
    data: nurtureDraft.data,
    reset: nurtureDraft.reset,
    mutate: () =>
      nurtureDraft.mutate(
        {
          id,
          data: {
            goal: nurtureForm.goal?.trim() || undefined,
            tone: nurtureForm.tone?.trim() || undefined,
          },
        },
        {
          onSuccess: (data) => {
            const draft = data?.draft;
            if (draft) {
              setNurtureForm((prev) => ({
                ...prev,
                subject: draft.subject ?? prev.subject,
                body: String(draft.body_text ?? prev.body),
              }));
            }
            toast.success("Draft ready. Review and send.");
          },
          onError: (err) => toast.error(err?.message || "Could not generate draft"),
        },
      ),
  };
  const nurtureRefineMutation = {
    isPending: nurtureRefine.isPending,
    data: nurtureRefine.data,
    reset: nurtureRefine.reset,
    mutate: () =>
      nurtureRefine.mutate(
        {
          id,
          data: {
            subject: nurtureForm.subject,
            body: nurtureForm.body,
            instruction: nurtureForm.refine_instruction.trim(),
          },
        },
        {
          onSuccess: (data) => {
            const draft = data?.draft;
            if (draft) {
              setNurtureForm((prev) => ({
                ...prev,
                subject: draft.subject ?? prev.subject,
                body: String(draft.body_text ?? prev.body),
                refine_instruction: "",
              }));
            }
            toast.success("Refined.");
          },
          onError: (err) => toast.error(err?.message || "Could not refine email"),
        },
      ),
  };
  const nurturePreviewMutation = {
    isPending: nurturePreview.isPending,
    data: nurturePreview.data,
    reset: nurturePreview.reset,
    mutate: () =>
      nurturePreview.mutate(
        {
          id,
          data: {
            conversation_id: actionConversationId || undefined,
            subject: nurtureForm.subject,
            body: nurtureForm.body,
            include_property_cards: nurtureForm.include_property_cards,
          },
        },
        {
          onError: (err) => toast.error(err?.message || "Failed to build email preview"),
        },
      ),
  };
  const nurtureMutation = {
    isPending: nurtureSend.isPending,
    mutate: () =>
      nurtureSend.mutate(
        {
          id,
          data: {
            conversation_id: actionConversationId || undefined,
            to_email: nurtureForm.to_email?.trim() || undefined,
            subject: nurtureForm.subject,
            body: nurtureForm.body,
            include_property_cards: nurtureForm.include_property_cards,
          },
        },
        {
          onSuccess: () => {
            toast.success("Nurture email sent");
            setNurtureForm((prev) => ({
              ...prev,
              subject: "",
              body: "",
              refine_instruction: "",
            }));
          },
          onError: (err) => toast.error(err?.message || "Failed to send nurture email"),
        },
      ),
  };
  const createReferralMutation = {
    isPending: createReferral.isPending,
    mutate: () =>
      createReferral.mutate(
        {
          id,
          data: {
            target_vertical: referralForm.professional_role,
            target_user_id: referralForm.target_user_id,
            notes: referralForm.notes || "",
          },
        },
        {
          onSuccess: () => {
            toast.success("Referral created");
            setReferralForm({
              professional_role: "",
              target_user_id: "",
              notes: "",
            });
          },
          onError: (err) => toast.error(err?.message || "Failed to create referral"),
        },
      ),
  };

  if (leadQuery.isLoading) return <WorkspaceLoader />;
  if (leadQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {leadQuery.error?.message || "Could not load this lead."}
      </div>
    );
  }
  if (!lead) return null;

  const inquirerName = formatPersonName(
    lead.contact?.full_name ||
      [lead.inquirer?.first_name, lead.inquirer?.last_name].filter(Boolean).join(" ") ||
      lead.inquirer?.email ||
      lead.contact?.email ||
      "Lead",
  );
  const ownerName = formatPersonName(
    [owner?.first_name, owner?.last_name].filter(Boolean).join(" ") ||
      owner?.email ||
      "Professional",
  );
  const typeLabel = formatAdminLabel(lead.lead_type || "Lead");
  const roleLabel = formatAdminLabel(ownerRole || "professional");
  const sourceLabel = lead.inquiry_source ? formatAdminLabel(lead.inquiry_source) : "";

  return (
    <div className="space-y-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft size={14} />
        {backHref.includes("/admin/professionals/") ? "Back to professional" : "Back to leads"}
      </Link>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Lead
            </p>
            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-950">
              {inquirerName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Managed for {ownerName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white">
              {typeLabel}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
              {roleLabel}
            </span>
            {sourceLabel ? (
              <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                {sourceLabel}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <LeadsWorkspaceTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
          endSlot={
            canWriteLeads ? (
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            ) : null
          }
        />
      </div>

      {activeTab === "lead_profile" ? (
        <LeadsProfileTab
          selectedConversation={selectedConversation}
          lead={lead}
          onPatchLead={canWriteLeads ? patchLead : undefined}
          patchLeadPending={patch.isPending}
        />
      ) : null}

      {activeTab === "lead_details" ? (
        <LeadsDetailsTab
          selectedConversation={selectedConversation}
          lead={lead}
          messageMeta={messageMeta}
          getConversationMeta={getConversationMeta}
          conversationMeta={conversationMeta}
          formatMetaEntries={formatMetaEntries}
          onOpenMeta={() => {}}
          onCancelCalendlyAppointment={() => cancelCalendly.mutateAsync({ id, data: {} })}
          cancelCalendlyPending={cancelCalendly.isPending}
        />
      ) : null}

      {activeTab === "conversation" ? (
        <LeadsConversationTab
          selectedConversation={selectedConversation}
          messageMeta={messageMeta}
          messagesQuery={messagesQuery}
          messages={messages}
          formatMetaEntries={formatMetaEntries}
          onOpenMeta={() => {}}
          leadId={id}
          token={token}
          myUserId={owner?.id || owner?._id}
          sendMessageOverride={
            canWriteLeads
              ? async ({ body }) => {
                  await postMessage.mutateAsync({ id, data: { body } });
                }
              : undefined
          }
          attachmentsDisabled
        />
      ) : null}

      {activeTab === "intelligence" && lead.ai_insights_ready ? (
        <LeadsIntelligenceTab
          token={token}
          leadId={id}
          lead={lead}
          hasAccessOverride
          analyzeInsights={({ token: authToken, leadId }) =>
            apiClient({
              url: API_ENDPOINTS.admin.leadInsights(leadId),
              method: "POST",
              token: authToken,
            })
          }
        />
      ) : null}

      {activeTab === "property_matches" ? (
        <LeadsPropertyMatchesTab
          selectedConversation={selectedConversation}
          lead={lead}
          propertyMatches={propertyMatches}
          propertyMatchesQuery={propertyMatchesQuery}
          propertyMatchesPayload={propertyMatchesQuery.data || null}
          inquiredProperty={
            inquiredPropertyQuery.data?.inquired_property || inquiredPropertyFromLead(lead)
          }
          inquiredSellerLeadDetail={inquiredSellerLeadDetail}
          inquiredSellerConversation={inquiredSellerConversation}
          inquiredSellerLeadQuery={inquiredPropertyQuery}
        />
      ) : null}

      {activeTab === "consultation" ? (
        <LeadsConsultationTab
          lead={lead}
          onCancelCalendlyAppointment={() => cancelCalendly.mutateAsync({ id, data: {} })}
          cancelCalendlyPending={cancelCalendly.isPending}
          onGoToNurture={() => setActiveTab("nurture")}
        />
      ) : null}

      {activeTab === "nurture" ? (
        <LeadsNurtureTab
          nurtureForm={nurtureForm}
          setNurtureForm={setNurtureForm}
          nurtureMutation={nurtureMutation}
          nurturePreviewMutation={nurturePreviewMutation}
          nurtureDraftMutation={nurtureDraftMutation}
          nurtureRefineMutation={nurtureRefineMutation}
          selectedLeadId={id}
          nurtureEnabled
          logsEnabled
          nurtureLogs={nurtureLogs}
          nurtureLogsLoading={nurtureLogsQuery.isLoading}
        />
      ) : null}

      {activeTab === "pipeline" ? (
        <LeadPipelineNotesPanel
          lead={lead}
          onPatchLead={canWriteLeads ? patchLead : undefined}
          patchLeadPending={patch.isPending}
        />
      ) : null}

      {activeTab === "others" ? (
        <LeadsActionsTab
          token={token}
          referralForm={referralForm}
          setReferralForm={setReferralForm}
          createReferralMutation={createReferralMutation}
          selectedLeadId={id}
          conversationReferrals={conversationReferrals}
          activeReferralId={activeReferralId}
          setActiveReferralId={setActiveReferralId}
          fetchProfessionalsOverride={fetchAdminProfessionalsForReferral}
          canWrite={canWriteReferrals}
        />
      ) : null}

      <AdminVoiceAgentPanel
        targetType="lead"
        targetId={id}
        defaultPhone={lead?.inquirer?.phone || lead?.contact?.phone || ""}
        canWrite={canWriteLeads}
      />
      {activeTab === "admin" ? (
        <AdminLeadControlsPanel
          leadId={id}
          lead={lead}
          owner={owner}
          ownerProfessionalId={leadQuery.data?.admin?.owner_professional_id}
          inquirySource={lead.inquiry_source}
          insightsReady={Boolean(lead.ai_insights_ready)}
        />
      ) : null}

      <AdminConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete lead"
        subtitle={`Lead ${String(lead.id || id).slice(-8)}`}
        message="Permanently delete this lead and its related conversation links? This cannot be undone."
        confirmLabel="Delete lead"
        tone="danger"
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(
            { id },
            {
              onSuccess: () =>
                router.replace(
                  backHref.includes("/admin/professionals/") ? backHref : "/admin/leads",
                ),
            },
          )
        }
      />
    </div>
  );
}
