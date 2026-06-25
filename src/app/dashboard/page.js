"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Copy, Link2, Mail, MessageCircle, RefreshCw, Share2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProfileQuery } from "@/hooks/useAuthApi";
import { useRecordLeadView } from "@/hooks/useRecordLeadView";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchChatAnalyticsSummary,
  fetchChatAnalyticsTimeseries,
} from "@/lib/chatClient";
import { fetchLeads, fetchLeadProfiles } from "@/lib/leadsClient";
import { fetchCalendarBookings } from "@/lib/calendarClient";
import { createInviteLink, fetchInviteConversionRoleTrends } from "@/lib/inviteClient";
import { leadApiRowToConversationShape } from "@/lib/leadAdapters";
import { formatLeadLocationLine, getLeadMeta, getLeadPropertyTypeDisplay } from "@/lib/leadConversationMeta";
import PlanLimitBanner from "@/components/billing/PlanLimitBanner";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FEATURES } from "@/constants/features";
import DashboardKpiStrip from "@/components/dashboard/DashboardKpiStrip";
import DashboardTopTables from "@/components/dashboard/DashboardTopTables";
import DashboardCalendlyButton from "@/components/dashboard/DashboardCalendlyButton";
import DashboardStartGuide from "@/components/dashboard/DashboardStartGuide";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

const DashboardAnalyticsPanels = dynamic(
  () => import("@/components/dashboard/DashboardAnalyticsPanels"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <p className="text-sm text-text-muted">Loading charts…</p>
      </div>
    ),
  }
);

const LeadDetailsModal = dynamic(
  () => import("@/components/dashboard/LeadDetailsModal"),
  { ssr: false }
);
const WINDOW_OPTIONS = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];
const DEFAULT_WINDOW_DAYS = 30;
function normalizeProfilesPayload(data) {
  if (Array.isArray(data?.lead_profiles)) return data.lead_profiles;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user, token } = useAppSelector((state) => state.auth);
  const personalInfo = useAppSelector((state) => state.profile.personalInfo);
  const businessInfo = useAppSelector((state) => state.profile.businessInfo);
  const profileQuery = useProfileQuery();
  const { isAuthenticated, profile } = useAuthGuard();
  const { hasFeature } = useFeatureAccess();
  const canUseReferralInviteLinks = hasFeature(FEATURES.REFERRALS_INVITES);
  const canUseCalendarIntegration = hasFeature(FEATURES.CALENDAR_INTEGRATION);
  const activeUser = profile?.user || profile?.data || user;

  const apiUser = profile?.user;
  const coverImageUrl = useMemo(() => {
    const fromStore = personalInfo?.coverImage && String(personalInfo.coverImage).trim();
    const fromApi = apiUser?.cover_image && String(apiUser.cover_image).trim();
    const fromActive = activeUser?.cover_image && String(activeUser.cover_image).trim();
    return fromStore || fromApi || fromActive || "";
  }, [personalInfo?.coverImage, apiUser?.cover_image, activeUser?.cover_image]);

  const profileImageUrl = useMemo(() => {
    const fromStore = personalInfo?.profileImage && String(personalInfo.profileImage).trim();
    const fromApi =
      apiUser?.profile_image && String(apiUser.profile_image).trim();
    const fromActive =
      activeUser?.profile_image ||
      activeUser?.profileImage ||
      "";
    const s = String(fromStore || fromApi || fromActive || "").trim();
    return s || "";
  }, [
    personalInfo?.profileImage,
    apiUser?.profile_image,
    activeUser?.profile_image,
    activeUser?.profileImage,
  ]);

  const avatarInitials = useMemo(() => {
    const displayName =
      activeUser?.name ||
      [activeUser?.first_name, activeUser?.last_name].filter(Boolean).join(" ").trim() ||
      [activeUser?.firstName, activeUser?.lastName].filter(Boolean).join(" ").trim() ||
      [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ").trim() ||
      activeUser?.email ||
      personalInfo?.email ||
      "";
    if (!displayName) return "?";
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [activeUser, personalInfo]);

  const userRole = activeUser?.role || "agent";

  const professionalRole = useMemo(
    () => String(businessInfo?.professionalType || userRole || "agent").trim().toLowerCase(),
    [businessInfo?.professionalType, userRole],
  );

  const roleBadgeLabel = useMemo(() => {
    if (professionalRole === "mortgage_broker") return "Mortgage Broker";
    if (professionalRole === "lawyer") return "Real Estate Lawyer";
    if (professionalRole === "admin") return "Admin";
    return "Real Estate Agent";
  }, [professionalRole]);

  const displayFullName = useMemo(() => {
    const fromBiz = businessInfo?.fullName && String(businessInfo.fullName).trim();
    if (fromBiz) return fromBiz;
    const fromPersonal = [personalInfo?.firstName, personalInfo?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (fromPersonal) return fromPersonal;
    return (
      activeUser?.name ||
      [activeUser?.first_name, activeUser?.last_name].filter(Boolean).join(" ").trim() ||
      [activeUser?.firstName, activeUser?.lastName].filter(Boolean).join(" ").trim() ||
      ""
    );
  }, [businessInfo?.fullName, personalInfo, activeUser]);

  const [isMounted, setIsMounted] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [windowDays, setWindowDays] = useState(DEFAULT_WINDOW_DAYS);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [guideDismissed, setGuideDismissed] = useState(false);
  const guideStorageKey = useMemo(() => {
    const id =
      activeUser?.id ||
      activeUser?._id ||
      user?.id ||
      user?._id ||
      activeUser?.email ||
      "workspace";
    return `nesti_dashboard_user_guide_${String(id)}`;
  }, [activeUser, user]);

  useEffect(() => {
    setAvatarBroken(false);
  }, [profileImageUrl]);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;
    const status = window.localStorage.getItem(guideStorageKey);
    setGuideDismissed(status === "dismissed" || status === "completed");
  }, [guideStorageKey, isMounted]);

  // Fix #9 — removed artificial 180ms delay that was blocking 3 queries on every dashboard load.

  const leadsQuery = useQuery({
    queryKey: ["dashboard-leads", token],
    enabled: Boolean(token),
    queryFn: () => fetchLeads({ token, page: 1, limit: 25 }),
    staleTime: 60_000,
  });

  const analyticsSummaryQuery = useQuery({
    queryKey: ["dashboard-analytics-summary", token, windowDays],
    enabled: Boolean(token),
    queryFn: () => fetchChatAnalyticsSummary({ token, days: windowDays }),
    staleTime: 60_000,
  });

  const analyticsTimeseriesQuery = useQuery({
    queryKey: ["dashboard-analytics-timeseries", token, windowDays],
    // Fix #9 — fire immediately alongside other queries; no artificial 180ms stagger
    enabled: Boolean(token),
    queryFn: () => fetchChatAnalyticsTimeseries({ token, days: windowDays }),
    staleTime: 60_000,
  });

  const inviteRoleTrendsQuery = useQuery({
    queryKey: ["dashboard-invite-role-trends", token, windowDays],
    // Fix #9 — fire immediately alongside other queries
    enabled: Boolean(token) && canUseReferralInviteLinks,
    queryFn: () => fetchInviteConversionRoleTrends({ token, days: windowDays }),
    staleTime: 60_000,
  });

  const profilesTopQuery = useQuery({
    queryKey: ["dashboard-top-profiles", token],
    // Fix #9 — fire immediately alongside other queries
    enabled: Boolean(token),
    queryFn: () => fetchLeadProfiles({ token, page: 1, limit: 20 }),
    staleTime: 60_000,
  });

  const calendarBookingsQuery = useQuery({
    queryKey: ["calendar-bookings", token],
    enabled: Boolean(token) && canUseCalendarIntegration,
    queryFn: () => fetchCalendarBookings({ token }),
    staleTime: 60_000,
  });

  const kpiSummary = useMemo(() => {
    const summary = analyticsSummaryQuery.data?.summary;
    if (!summary) return summary;
    const calendarBooked = Array.isArray(calendarBookingsQuery.data?.bookings)
      ? calendarBookingsQuery.data.bookings.length
      : 0;
    const leadsTotal =
      Number(
        leadsQuery.data?.pagination?.total ??
          leadsQuery.data?.data?.pagination?.total ??
          NaN
      ) || null;
    return {
      ...summary,
      totals: {
        ...(summary.totals || {}),
        leads_created: leadsTotal ?? summary?.totals?.leads_created ?? 0,
        appointments_booked: calendarBooked,
      },
    };
  }, [
    analyticsSummaryQuery.data?.summary,
    calendarBookingsQuery.data?.bookings,
    leadsQuery.data?.pagination?.total,
    leadsQuery.data?.data?.pagination?.total,
  ]);

  const refreshAll = () => {
    leadsQuery.refetch();
    analyticsSummaryQuery.refetch();
    analyticsTimeseriesQuery.refetch();
    inviteRoleTrendsQuery.refetch();
    profilesTopQuery.refetch();
    calendarBookingsQuery.refetch();
    queryClient.invalidateQueries({ queryKey: ["calendar-bookings", token] });
  };

  const isRefreshing =
    leadsQuery.isFetching ||
    analyticsSummaryQuery.isFetching ||
    analyticsTimeseriesQuery.isFetching ||
    inviteRoleTrendsQuery.isFetching ||
    profilesTopQuery.isFetching ||
    calendarBookingsQuery.isFetching;

  const createInviteMutation = useMutation({
    mutationFn: () =>
      createInviteLink({
        token,
        payload: {
          intended_audience: "professional",
          source_channel: "dashboard",
        },
      }),
    onSuccess: async (data) => {
      const link = String(data?.share_url || data?.invite?.share_url || "").trim();
      setGeneratedInviteLink(link);
      if (link) {
        try {
          await navigator.clipboard.writeText(link);
          toast.success("Invite link created and copied.");
        } catch {
          toast.success("Invite link created.");
        }
      } else {
        toast.success("Invite link created.");
      }
    },
    onError: (err) => toast.error(err?.message || "Could not create invite link."),
  });

  const copyGeneratedInviteLink = async () => {
    if (!generatedInviteLink) return;
    try {
      await navigator.clipboard.writeText(generatedInviteLink);
      toast.success("Invite link copied.");
    } catch {
      toast.error("Could not copy invite link.");
    }
  };

  const handleGuideDismiss = (status = "dismissed") => {
    setGuideDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(guideStorageKey, status);
    }
  };

  const inviteShareText = generatedInviteLink
    ? `Join Nesti via this invite link: ${generatedInviteLink}`
    : "";
  const inviteShareLinks = {
    email: generatedInviteLink
      ? `mailto:?subject=${encodeURIComponent("Join my Nesti network")}&body=${encodeURIComponent(inviteShareText)}`
      : "#",
    whatsapp: generatedInviteLink
      ? `https://wa.me/?text=${encodeURIComponent(inviteShareText)}`
      : "#",
    sms: generatedInviteLink
      ? `sms:?body=${encodeURIComponent(inviteShareText)}`
      : "#",
    social: generatedInviteLink
      ? `https://x.com/intent/tweet?text=${encodeURIComponent(inviteShareText)}`
      : "#",
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const conversations = useMemo(() => {
    const raw = leadsQuery.data?.leads;
    if (!Array.isArray(raw)) return [];
    return raw.map(leadApiRowToConversationShape).filter(Boolean);
  }, [leadsQuery.data]);

  const selectedLead = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          String(conversation?.id || conversation?.conversation_id || conversation?.conversationId) ===
          String(selectedLeadId)
      ),
    [conversations, selectedLeadId]
  );

  useRecordLeadView(selectedLeadId, { token, enabled: Boolean(selectedLead) });

  const topLeadsRows = useMemo(() => {
    const gradeRank = (g) => {
      const x = String(g || "").toLowerCase();
      if (x === "hot") return 3;
      if (x === "warm") return 2;
      if (x === "cold") return 1;
      return 0;
    };
    return [...conversations]
      .map((c) => {
        const meta = getLeadMeta(c);
        const score = Number(meta.leadScore);
        const id = String(c?.id || c?.conversation_id || c?.conversationId || "").trim();
        const location =
          formatLeadLocationLine(c) ||
          c?.property?.address ||
          c?.address ||
          c?.conversion?.property?.address ||
          "—";
        const propertyType = getLeadPropertyTypeDisplay(c);
        const qualification = c?.qualification || {};
        const lawyerQual = qualification?.lawyer || {};
        const mortgageQual = qualification?.mortgage_broker || {};
        const intent = String(meta.intent || "").trim() || "—";
        const grade = meta.leadGrade || "";
        const sortScore = Number.isFinite(score) && !Number.isNaN(score) ? score : -1;
        return {
          id,
          name: meta.name || "Unknown",
          email: meta.email || "",
          propertyType,
          intent,
          transactionStage: qualification?.transaction_stage || lawyerQual?.transaction_stage || "",
          transactionType: qualification?.transaction_type || lawyerQual?.transaction_type || "",
          closingTimeline: qualification?.closing_timeline || lawyerQual?.closing_timeline || "",
          propertyValue: qualification?.property_value || lawyerQual?.property_value || "",
          mortgageTimeline:
            qualification?.mortgage_timeline ||
            mortgageQual?.mortgage_timeline ||
            c?.property?.timeline ||
            "",
          preApprovalStatus:
            qualification?.pre_approval_status ||
            mortgageQual?.pre_approval_status ||
            mortgageQual?.mortgage_status ||
            "",
          creditScoreRange: qualification?.credit_score_range || mortgageQual?.credit_score_range || "",
          grade,
          scoreLabel: sortScore >= 0 ? String(score) : "—",
          location: location || "—",
          sortScore,
          sortGrade: gradeRank(grade),
        };
      })
      .filter((row) => row.id)
      .sort((a, b) => {
        if (b.sortScore !== a.sortScore) return b.sortScore - a.sortScore;
        return b.sortGrade - a.sortGrade;
      })
      .slice(0, 5)
      .map(({ sortScore: _s, sortGrade: _g, ...row }) => row);
  }, [conversations]);

  const topProfilesRows = useMemo(() => {
    const list = normalizeProfilesPayload(profilesTopQuery.data);
    return [...list]
      .sort((a, b) => {
        const ca = Array.isArray(a.lead_refs) ? a.lead_refs.length : 0;
        const cb = Array.isArray(b.lead_refs) ? b.lead_refs.length : 0;
        return cb - ca;
      })
      .slice(0, 5);
  }, [profilesTopQuery.data]);

  const profileSetupState = profileQuery.data?.profile_setup || {};
  const guideDataReady = !profileQuery.isPending;
  const shouldShowStartGuide =
    guideDataReady &&
    Boolean(profileSetupState?.is_complete) &&
    !guideDismissed;

  const chartSeries = useMemo(() => {
    const base = analyticsTimeseriesQuery.data?.series;
    if (!Array.isArray(base) || base.length === 0) return [];
    return base;
  }, [analyticsTimeseriesQuery.data]);

  const leadsTableLoading =
    leadsQuery.isPending || (leadsQuery.isFetching && !Array.isArray(leadsQuery.data?.leads));
  const profilesTableLoading =
    profilesTopQuery.isPending ||
    (profilesTopQuery.isFetching && !Array.isArray(normalizeProfilesPayload(profilesTopQuery.data)));
  const analyticsPanelsLoading =
    analyticsTimeseriesQuery.isPending ||
    (canUseReferralInviteLinks && inviteRoleTrendsQuery.isPending);

  // Avoid hydration mismatch: server has no sessionStorage token; client may. First paint must match server.
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <WorkspaceLoader label="Loading workspace..." sublabel="Syncing your dashboard data" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center px-6">
        <p className="text-sm text-text-muted">Redirecting…</p>
      </div>
    );
  }

  const hasCover = Boolean(coverImageUrl);
  const avatarAlt = displayFullName || "Profile";

  return (
    <div className="relative z-[1] min-h-screen bg-slate-50/50">
      <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 pb-12 pt-5 sm:px-6 sm:pt-6">
        <PlanLimitBanner />
        {/* Hero — LinkedIn-style profile header */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="relative h-[220px] w-full overflow-hidden sm:h-[280px] lg:h-[320px]">
            {hasCover ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.02] contrast-[0.98]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/15 via-slate-900/8 to-slate-900/30" aria-hidden />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#8fa9ae] via-[#9eb3b8] to-[#7a959b]" aria-hidden />
                <div className="pointer-events-none absolute -left-12 top-4 h-[200px] w-[200px] rounded-full border-[32px] border-white/20" aria-hidden />
                <div className="pointer-events-none absolute -right-6 top-[-15%] h-[180px] w-[180px] rounded-full bg-white/10" aria-hidden />
              </>
            )}
          </div>

          <div className="relative px-5 pb-4 sm:px-6 sm:pb-5">
            {/* Avatar — square, overlaps cover bottom edge (LinkedIn-style) */}
            <div className="absolute left-5 top-0 z-[1] -translate-y-1/2 sm:left-6">
              <div className="relative h-[96px] w-[96px] overflow-hidden rounded-lg border-[3px] border-white bg-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/60 sm:h-[128px] sm:w-[128px] sm:rounded-xl">
                {profileImageUrl && !avatarBroken ? (
                  <Image
                    src={profileImageUrl}
                    alt={avatarAlt}
                    width={256}
                    height={256}
                    className="h-full w-full object-cover object-center"
                    sizes="128px"
                    priority
                    unoptimized={
                      profileImageUrl.startsWith("data:") || profileImageUrl.startsWith("blob:")
                    }
                    onError={() => setAvatarBroken(true)}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-500 select-none sm:text-3xl" aria-hidden>
                    {avatarInitials}
                  </span>
                )}
              </div>
            </div>

            <div className="flex min-h-[3.25rem] flex-col gap-3 pt-12 sm:min-h-[4rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pl-[148px] sm:pt-0 lg:pl-[156px]">
              <div className="flex min-w-0 flex-col items-center gap-1.5 sm:items-start">
                <h1 className="text-center text-lg font-semibold leading-tight tracking-tight text-slate-900 sm:text-left sm:text-xl">
                  {displayFullName || "Your workspace"}
                </h1>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary-dark sm:text-[11px]">
                  {roleBadgeLabel}
                </span>
              </div>
              {canUseCalendarIntegration ? (
                <DashboardCalendlyButton surface="light" compact className="mx-auto shrink-0 sm:mx-0" />
              ) : null}
            </div>
          </div>
        </motion.section>

        {shouldShowStartGuide ? (
          <DashboardStartGuide
            professionalRole={String(businessInfo?.professionalType || userRole || "").trim().toLowerCase()}
            onDismiss={handleGuideDismiss}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold tracking-tight text-text-heading">Performance overview</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Everything tracked in the last {windowDays} days.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {canUseReferralInviteLinks ? (
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[0.06] px-3.5 py-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
                title="Create invite link"
              >
                <Link2 size={13} strokeWidth={2.5} />
                Create invite
              </button>
            ) : null}
            <div
              role="tablist"
              aria-label="Analytics window"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5"
            >
              {WINDOW_OPTIONS.map((opt) => {
                const active = opt.value === windowDays;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setWindowDays(opt.value)}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:bg-white hover:text-text-heading hover:shadow-sm"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={refreshAll}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-text-heading shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Refresh dashboard"
            >
              <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <DashboardKpiStrip
          summary={kpiSummary}
          isLoading={analyticsSummaryQuery.isLoading}
        />

        <DashboardAnalyticsPanels
          windowDays={analyticsTimeseriesQuery.data?.window_days || windowDays}
          series={chartSeries}
          inviteRoleTrends={inviteRoleTrendsQuery.data}
          showInviteSignups={canUseReferralInviteLinks}
          isLoading={analyticsPanelsLoading}
          isError={
            analyticsTimeseriesQuery.isError ||
            (canUseReferralInviteLinks && inviteRoleTrendsQuery.isError)
          }
        />

        <DashboardTopTables
          topLeads={topLeadsRows}
          topProfiles={topProfilesRows}
          leadsLoading={leadsTableLoading}
          profilesLoading={profilesTableLoading}
          leadsError={leadsQuery.isError}
          profilesError={profilesTopQuery.isError}
          onSelectLead={(id) => setSelectedLeadId(String(id))}
          professionalType={String(businessInfo?.professionalType || userRole || "").trim().toLowerCase()}
        />

      </div>
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailsModal
            lead={{
              ...selectedLead,
              ...getLeadMeta(selectedLead)
            }}
            onClose={() => setSelectedLeadId(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {canUseReferralInviteLinks && showInviteModal ? (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-text-heading">Create invite link</h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    Generate a professional invite link you can share with your network.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-heading"
                  aria-label="Close invite modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
                <p className="text-xs font-semibold text-text-heading">Invite link</p>
                {generatedInviteLink ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2 text-xs text-text-body outline-none"
                    />
                    <button
                      type="button"
                      onClick={copyGeneratedInviteLink}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-text-heading hover:bg-primary/5"
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-text-muted">
                    Click create below to generate a fresh invite link.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-border/70 bg-white p-3">
                <p className="text-xs font-semibold text-text-heading">Share on platforms</p>
                <p className="mt-1 text-[11px] text-text-muted">
                  Create an invite first, then share it directly through your preferred channel.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <a
                    href={inviteShareLinks.email}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex h-9 items-center justify-center gap-1 rounded-md border text-xs font-semibold ${
                      generatedInviteLink
                        ? "border-border bg-white text-text-heading hover:bg-primary/[0.07]"
                        : "pointer-events-none border-border/60 bg-slate-100 text-text-muted"
                    }`}
                  >
                    <Mail size={12} />
                    Email
                  </a>
                  <a
                    href={inviteShareLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex h-9 items-center justify-center gap-1 rounded-md border text-xs font-semibold ${
                      generatedInviteLink
                        ? "border-border bg-white text-text-heading hover:bg-primary/[0.07]"
                        : "pointer-events-none border-border/60 bg-slate-100 text-text-muted"
                    }`}
                  >
                    <MessageCircle size={12} />
                    WhatsApp
                  </a>
                  <a
                    href={inviteShareLinks.sms}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex h-9 items-center justify-center gap-1 rounded-md border text-xs font-semibold ${
                      generatedInviteLink
                        ? "border-border bg-white text-text-heading hover:bg-primary/[0.07]"
                        : "pointer-events-none border-border/60 bg-slate-100 text-text-muted"
                    }`}
                  >
                    <Share2 size={12} />
                    SMS
                  </a>
                  <a
                    href={inviteShareLinks.social}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex h-9 items-center justify-center gap-1 rounded-md border text-xs font-semibold ${
                      generatedInviteLink
                        ? "border-border bg-white text-text-heading hover:bg-primary/[0.07]"
                        : "pointer-events-none border-border/60 bg-slate-100 text-text-muted"
                    }`}
                  >
                    <Share2 size={12} />
                    Social
                  </a>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-semibold text-text-heading hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => createInviteMutation.mutate()}
                  disabled={!token || createInviteMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Link2 size={13} />
                  {createInviteMutation.isPending ? "Creating..." : "Create invite"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
