"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Briefcase,
  CheckCircle2,
  FileStack,
  ShieldCheck,
  User,
  CreditCard,
} from "lucide-react";
import { useAdminProfessional } from "@/hooks/useAdminApi";
import {
  AdminErrorState,
  adminGhostButtonClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import PersonalCard from "@/components/profile/PersonalCard";
import BusinessCard from "@/components/profile/BusinessCard";
import CredentialDocumentPreview, {
  isPreviewableDocument,
} from "@/components/admin/CredentialDocumentPreview";
import CredentialPdfThumb from "@/components/admin/CredentialPdfThumb";
import CredentialImageThumb from "@/components/admin/CredentialImageThumb";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import { useAppSelector } from "@/store";

function humanizeToken(value) {
  return String(value || "")
    .trim()
    .replace(/_/g, " ");
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  const text = String(value).trim();
  if (!text) return [];
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatWhen(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function isPdfDoc(doc) {
  const mime = String(doc?.mime_type || "").toLowerCase();
  if (mime.includes("pdf")) return true;
  return /\.pdf$/i.test(String(doc?.file_name || ""));
}

function isImageDoc(doc) {
  const mime = String(doc?.mime_type || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(String(doc?.file_name || ""));
}

const STATUS_STYLES = {
  pending_review: "bg-sky-50 text-sky-800 ring-sky-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending_docs: "bg-amber-50 text-amber-900 ring-amber-200",
  not_started: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function AdminProfessionalDetailPage() {
  const { id } = useParams();
  const authToken = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminProfessional(id);
  const [previewIndex, setPreviewIndex] = useState(null);

  const professional = data?.professional;
  const user = professional?.user || {};
  const userId = user.id;
  const verification = data?.verification || {};
  const documents = data?.documents || verification.documents || [];
  const subscription = data?.subscription;
  const completeness = data?.completeness || {};
  const recentLeads = data?.recent_leads || [];
  const stats = data?.stats || {};

  const name = useMemo(() => {
    const full = String(professional?.full_name || "").trim();
    if (full) return formatPersonName(full);
    return formatPersonName(
      [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Professional"
    );
  }, [professional, user]);

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <AdminErrorState
        message={error?.message || "Failed to load professional"}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }
  if (!professional) return null;

  const coverPos = user.cover_image_position || {};
  const coverX = Math.min(100, Math.max(0, Number(coverPos.x) || 50));
  const coverY = Math.min(100, Math.max(0, Number(coverPos.y) || 50));
  const coverZoomRaw = Number(user.cover_image_zoom || 1);
  const coverZoom = Number.isFinite(coverZoomRaw) ? Math.min(3, Math.max(1, coverZoomRaw)) : 1;

  const personalInfo = {
    fullName: name,
    email: user.email || "",
    phone: professional.phone || user.phone || "",
    website: professional.website || "",
    calendlyUrl: professional.calendly_link || "",
    location: professional.location || "",
    role: humanizeToken(professional.professional_type || user.role || ""),
    profileImage: user.profile_image || "",
    coverImage: user.cover_image || "",
  };

  const businessInfo = {
    professionalType: humanizeToken(professional.professional_type || user.role || ""),
    companyName: professional.company_name || "",
    website: professional.website || "",
    phone: professional.phone || "",
    email: user.email || "",
    experience: professional.experience || professional.experience_level || "",
    licenseNumber: professional.license_number || "",
    socialMedia: professional.social_media || "",
    transactionVolume: professional.transaction_volume || "",
    avgSalePrice: professional.avg_sale_price || "",
    responseTime: professional.response_time || "",
    availability: professional.availability || "",
    supportLevel: professional.support_level || "",
    negotiationStyle: professional.negotiation_style || "",
    salesApproach: professional.sales_approach || "",
    energyStyle: professional.energy_style || "",
    personalityTag: professional.personality_tag || "",
    awards: professional.awards || "",
    bio: professional.bio || "",
    targetNeighborhoods: professional.target_neighborhoods || "",
    specializations: toArray(professional.specializations).map(humanizeToken),
    communicationChannels: toArray(professional.communication_channels).map(humanizeToken),
    preferredClients: toArray(professional.preferred_clients).map(humanizeToken),
    location: professional.location || "",
  };

  const hasCover = Boolean(personalInfo.coverImage);
  const credStatus = verification.credential_status || professional.credential_status || "not_started";
  const statusTone = STATUS_STYLES[credStatus] || STATUS_STYLES.not_started;
  const previewDoc = previewIndex != null ? documents[previewIndex] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Professional profile</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatAdminLabel(professional.professional_type)} · {stats.leads_owned ?? 0} leads ·{" "}
            {user.is_active === false ? "Suspended" : "Active"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {userId ? (
            <Link href={`/admin/verifications/${userId}`} className={adminGhostButtonClass}>
              Open verification
            </Link>
          ) : null}
          <Link href="/admin/professionals" className={adminGhostButtonClass}>
            Back
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative aspect-[16/5] w-full min-h-[10rem]">
          {hasCover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={personalInfo.coverImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: `${coverX}% ${coverY}%`,
                  transform: coverZoom > 1 ? `scale(${coverZoom})` : undefined,
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600" />
          )}
        </div>
        <div className="relative flex items-end gap-4 px-5 pb-5 sm:px-7">
          <div className="relative z-[1] -mt-8 shrink-0 sm:-mt-10">
            <div className="relative flex h-[5rem] w-[5rem] items-center justify-center overflow-hidden rounded-xl border-[3px] border-white bg-slate-50 text-xl font-bold text-slate-700 shadow-md sm:h-[6rem] sm:w-[6rem]">
              {personalInfo.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={personalInfo.profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                name.slice(0, 1).toUpperCase()
              )}
            </div>
          </div>
          <div className="min-w-0 pb-1">
            <h2 className="truncate text-lg font-semibold text-slate-950">{name}</h2>
            <p className="text-sm text-slate-500">{personalInfo.role || "Professional"}</p>
          </div>
          <span className={`mb-1 ml-auto inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusTone}`}>
            {formatAdminLabel(credStatus)}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Verification</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-950">{formatAdminLabel(credStatus)}</p>
          <p className="mt-1 text-xs text-slate-500">
            Reviewed {formatWhen(verification.credential_reviewed_at)}
            {verification.reviewed_by?.name ? ` by ${verification.reviewed_by.name}` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <CreditCard size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Subscription</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {subscription
              ? `${formatAdminLabel(subscription.plan_key || "plan")} · ${formatAdminLabel(subscription.status)}`
              : "No subscription"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {subscription?.trial_end
              ? `Trial ends ${formatWhen(subscription.trial_end)}`
              : subscription?.current_period_end
                ? `Period ends ${formatWhen(subscription.current_period_end)}`
                : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Completeness</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {completeness.is_complete ? "Profile complete" : "Incomplete"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {(completeness.missing_fields || []).length
              ? `Missing: ${(completeness.missing_fields || []).map(formatAdminLabel).join(", ")}`
              : "Personal + business basics filled"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <FileStack size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Activity</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {stats.leads_owned ?? 0} leads · {stats.referrals_sent ?? 0} sent / {stats.referrals_received ?? 0} recv
          </p>
          <p className="mt-1 text-xs text-slate-500">Joined {formatWhen(user.createdAt)}</p>
        </div>
      </div>

      {documents.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <header className="mb-4 flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <FileStack size={14} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Documents</h3>
            <div className="flex-1 border-t border-slate-100" />
          </header>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc, index) => (
              <button
                key={doc.id}
                type="button"
                disabled={!isPreviewableDocument(doc)}
                onClick={() => setPreviewIndex(index)}
                className="overflow-hidden rounded-xl border border-slate-200 text-left hover:border-slate-300"
              >
                <div className="aspect-[4/3] bg-slate-50">
                  {isImageDoc(doc) ? (
                    <CredentialImageThumb
                      doc={doc}
                      userId={userId}
                      authToken={authToken || ""}
                      alt={doc.file_name || doc.type}
                    />
                  ) : isPdfDoc(doc) ? (
                    <CredentialPdfThumb doc={doc} userId={userId} authToken={authToken || ""} />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-slate-400">
                      {formatAdminLabel(doc.type)}
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-100 px-3 py-2">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {formatAdminLabel(doc.type)}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">{doc.file_name || doc.status}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {recentLeads.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <header className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Recent leads</h3>
            <Link href="/admin/leads" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
              View all
            </Link>
          </header>
          <ul className="divide-y divide-slate-100">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{lead.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatAdminLabel(lead.lead_type)} · {formatWhen(lead.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-600">
                  {formatAdminLabel(lead.match_status)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(verification.events || []).length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Verification timeline</h3>
          <ol className="mt-3 space-y-2">
            {(verification.events || []).slice(0, 8).map((ev) => (
              <li key={ev.id || `${ev.type}-${ev.at}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-900">{formatAdminLabel(ev.type)}</span>
                <span className="text-slate-500"> · {formatWhen(ev.at)}</span>
                {ev.actor?.name ? <span className="text-slate-500"> · {ev.actor.name}</span> : null}
                {ev.reason ? <p className="mt-1 text-xs text-slate-600">{ev.reason}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <header className="mb-4 flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <User size={14} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Contact & role</h3>
          <div className="flex-1 border-t border-slate-100" />
        </header>
        <PersonalCard
          displayFullName={name}
          personalInfo={personalInfo}
          businessInfo={businessInfo}
          compact
          professionalLineLayout
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <header className="mb-4 flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Briefcase size={14} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Business & expertise</h3>
          <div className="flex-1 border-t border-slate-100" />
        </header>
        <BusinessCard businessInfo={businessInfo} />
      </section>

      <CredentialDocumentPreview
        open={previewIndex != null && Boolean(previewDoc)}
        document={previewDoc}
        label={previewDoc ? formatAdminLabel(previewDoc.type) : ""}
        onClose={() => setPreviewIndex(null)}
        hasPrev={previewIndex > 0}
        hasNext={previewIndex != null && previewIndex < documents.length - 1}
        onPrev={() => setPreviewIndex((i) => (i == null ? i : Math.max(0, i - 1)))}
        onNext={() =>
          setPreviewIndex((i) => (i == null ? i : Math.min(documents.length - 1, i + 1)))
        }
        authToken={authToken || ""}
        userId={userId || ""}
      />
    </div>
  );
}
