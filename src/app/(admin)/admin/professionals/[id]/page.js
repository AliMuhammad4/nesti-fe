"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Briefcase,
  FileStack,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  useAdminProfessional,
  useAdminSuspendUser,
  useAdminUnsuspendUser,
} from "@/hooks/useAdminApi";
import {
  AdminConfirmModal,
  AdminErrorState,
  AdminTabs,
  adminDangerButtonClass,
  adminGhostButtonClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import AdminProfessionalInsights from "@/components/admin/AdminProfessionalInsights";
import AdminProfessionalBilling, {
  AdminProfessionalInvoices,
} from "@/components/admin/AdminProfessionalBilling";
import AdminProfessionalStorefront from "@/components/admin/AdminProfessionalStorefront";
import AdminProfessionalLeadsPanel from "@/components/admin/AdminProfessionalLeadsPanel";
import AdminProfessionalReferralsPanel from "@/components/admin/AdminProfessionalReferralsPanel";
import AdminProfessionalChatbotPanel from "@/components/admin/AdminProfessionalChatbotPanel";
import PersonalCard from "@/components/profile/PersonalCard";
import BusinessCard from "@/components/profile/BusinessCard";
import { DetailList } from "@/components/profile/ProfileInfoCard";
import CredentialDocumentPreview, {
  isPreviewableDocument,
} from "@/components/admin/CredentialDocumentPreview";
import CredentialPdfThumb from "@/components/admin/CredentialPdfThumb";
import CredentialImageThumb from "@/components/admin/CredentialImageThumb";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import { useAppSelector } from "@/store";
import { useAdminCanWrite } from "@/hooks/useAdminPermissions";
import { ADMIN_PERMISSION } from "@/lib/adminPermissions";

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

function uniqueLabels(values = []) {
  const seen = new Set();
  return values
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function serviceAreaChips(professional = {}) {
  const fromLists = uniqueLabels([
    ...(Array.isArray(professional.service_area_primary_zones) ? professional.service_area_primary_zones : []),
    ...(Array.isArray(professional.service_area_cities) ? professional.service_area_cities : []),
    ...(Array.isArray(professional.service_area_regions) ? professional.service_area_regions : []),
  ]);
  if (fromLists.length) return fromLists;
  const fallback = String(professional.target_neighborhoods || professional.location || "").trim();
  return fallback ? [fallback] : [];
}

function toLabelList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          return String(item.label || item.name || item.value || "").trim();
        }
        return String(item || "").trim();
      })
      .filter(Boolean)
      .map(humanizeToken);
  }
  return toArray(value).map(humanizeToken);
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

const PROFESSIONAL_TABS = [
  "overview",
  "storefront",
  "subscriptions",
  "invoices",
  "leads",
  "referrals",
  "chatbot",
];

function tabFromSearchParams(searchParams) {
  const raw = String(searchParams.get("tab") || "overview").trim().toLowerCase();
  return PROFESSIONAL_TABS.includes(raw) ? raw : "overview";
}

export default function AdminProfessionalDetailPage() {
  const { id } = useParams();
  const authToken = useAppSelector((state) => state.auth.token);
  const canWriteProfessionals = useAdminCanWrite(ADMIN_PERMISSION.PROFESSIONALS_WRITE);
  const canWriteUsers = useAdminCanWrite(ADMIN_PERMISSION.USERS_WRITE);
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminProfessional(id);
  const suspend = useAdminSuspendUser();
  const unsuspend = useAdminUnsuspendUser();
  const [previewIndex, setPreviewIndex] = useState(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [tab, setTab] = useState(() => tabFromSearchParams(searchParams));

  useEffect(() => {
    setTab(tabFromSearchParams(searchParams));
  }, [searchParams]);

  const setProfessionalTab = (next) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    // Drop list-only params so page/pipeline/direction never leak across tabs.
    if (next !== "referrals") {
      params.delete("direction");
    }
    if (next !== "leads") {
      params.delete("pipeline");
    }
    // Always reset pagination when changing tabs (including leads <-> referrals).
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const [accountAction, setAccountAction] = useState(null);

  const professional = data?.professional;
  const user = useMemo(() => professional?.user || {}, [professional?.user]);
  const userId = user.id;
  const verification = data?.verification || {};
  const documents = data?.documents || verification.documents || [];
  const stats = data?.stats || {};
  const publicPage = data?.public_page;
  const billing = data?.billing;
  const traffic = data?.traffic;

  const name = useMemo(() => {
    const fromUser = [user.first_name, user.last_name].filter(Boolean).join(" ");
    const full = String(professional?.full_name || "").trim();
    return formatPersonName(fromUser || full || user.email || "Professional");
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

  const personalInfo = {
    fullName: name,
    email: user.email || "",
    phone: professional.phone || user.phone || "",
    website: professional.website || "",
    calendlyUrl: professional.calendly_link || "",
    location: professional.location || "",
    role: professional.professional_type ? formatAdminLabel(professional.professional_type) : "",
    profileImage: user.profile_image || "",
  };

  const businessInfo = {
    professionalType: professional.professional_type ? formatAdminLabel(professional.professional_type) : "",
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
    specializations: toLabelList(professional.specializations),
    communicationChannels: toLabelList(professional.communication_channels),
    preferredClients: toLabelList(professional.preferred_clients),
    location: professional.location || "",
  };

  const credStatus = verification.credential_status || professional.credential_status || "not_started";
  const previewDoc = previewIndex != null ? documents[previewIndex] : null;
  const accountActive = user.is_active !== false;
  const checklist = (verification.checklist || []).filter((item) => !item.extra);
  const missingDocs = checklist.filter((item) => !item.uploaded);
  const areas = serviceAreaChips(professional);

  return (
    <div className="admin-poppins flex min-h-full w-full min-w-0 flex-1 flex-col bg-slate-50">
      <section className="w-full shrink-0 border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 text-xl font-bold text-slate-700 shadow-md ring-1 ring-slate-200">
              {personalInfo.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={personalInfo.profileImage}
                  alt={`${name}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Professional profile
              </p>
              <p className="truncate text-xl font-semibold tracking-tight text-slate-950">{name}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500">
                  {businessInfo.companyName || personalInfo.role || "Professional"}
                </span>
                {accountActive ? null : (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                    <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                      Suspended
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            {userId && canWriteUsers ? (
              <button
                type="button"
                className={`${accountActive ? adminDangerButtonClass : adminGhostButtonClass} gap-1.5`}
                onClick={() => setAccountAction(accountActive ? "suspend" : "unsuspend")}
              >
                <Ban size={14} />
                {accountActive ? "Suspend account" : "Restore account"}
              </button>
            ) : null}
            {userId ? (
              <Link
                href={`/admin/verifications/${userId}`}
                className={`${adminGhostButtonClass} gap-1.5`}
              >
                <ShieldCheck size={14} />
                Open verification
              </Link>
            ) : null}
            <Link href="/admin/professionals" className={`${adminGhostButtonClass} gap-1.5`}>
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full border-b border-slate-200 bg-white px-4 py-2 sm:px-6 lg:px-8">
        <AdminTabs
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "storefront", label: "Storefront" },
            { value: "leads", label: "Leads" },
            { value: "referrals", label: "Referrals" },
            { value: "chatbot", label: "Chatbot" },
            { value: "subscriptions", label: "Subscriptions" },
            { value: "invoices", label: "Invoices" },
          ]}
          value={tab}
          onChange={setProfessionalTab}
        />
      </div>

      <div
        className={`w-full min-w-0 flex-1 overflow-x-hidden bg-slate-50 ${
          tab === "overview" ? "" : "px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
        }`}
      >
      {tab === "leads" ? (
        <AdminProfessionalLeadsPanel
          userId={userId}
          professionalProfileId={id}
          professionalRole={professional?.professional_type || user?.role || ""}
        />
      ) : tab === "referrals" ? (
        <AdminProfessionalReferralsPanel
          userId={userId}
          professionalProfileId={id}
        />
      ) : tab === "chatbot" ? (
        <AdminProfessionalChatbotPanel
          professionalId={id}
          professionalRole={professional?.professional_type || user?.role || ""}
        />
      ) : tab === "storefront" ? (
        <AdminProfessionalStorefront professionalId={id} />
      ) : tab === "subscriptions" ? (
        <AdminProfessionalBilling billing={billing} />
      ) : tab === "invoices" ? (
        <AdminProfessionalInvoices billing={billing} />
      ) : (
        <div className="w-full min-w-0 space-y-0 bg-slate-50/80">
      <AdminProfessionalInsights
        publicPage={publicPage}
        traffic={traffic}
        stats={stats}
      />

      <article className="w-full border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <ShieldCheck size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Verification
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                {formatAdminLabel(credStatus)}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {verification.credential_reviewed_at
                  ? `Reviewed ${formatWhen(verification.credential_reviewed_at)}${
                      verification.reviewed_by?.name ? ` by ${verification.reviewed_by.name}` : ""
                    }`
                  : verification.credential_submitted_at
                    ? `Submitted ${formatWhen(verification.credential_submitted_at)} · not reviewed yet`
                    : "Not submitted yet"}
              </p>
            </div>
          </div>
          {missingDocs.length ? (
            <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
              {missingDocs.length} document{missingDocs.length === 1 ? "" : "s"} missing
            </span>
          ) : (
            <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
              Documents complete
            </span>
          )}
        </div>

        {credStatus === "rejected" && verification.credential_reject_reason ? (
          <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm leading-relaxed text-rose-700 ring-1 ring-rose-100">
            {verification.credential_reject_reason}
          </p>
        ) : null}

        {checklist.length ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80">
            <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Document checklist
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {missingDocs.length
                  ? `${missingDocs.length} of ${checklist.length} still missing`
                  : `All ${checklist.length} documents on file`}
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
              {checklist.map((item) => {
                const isMissing = !item.uploaded;
                return (
                  <li
                    key={item.type || item.label}
                    className="flex min-h-[3.5rem] items-start justify-between gap-3 bg-white px-4 py-3.5 sm:px-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          isMissing ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium leading-snug text-slate-800">
                          {item.label || formatAdminLabel(item.type)}
                        </p>
                        {!item.required ? (
                          <p className="mt-0.5 text-[11px] text-slate-400">Recommended</p>
                        ) : null}
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                        isMissing
                          ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      }`}
                    >
                      {isMissing ? "Missing" : "On file"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </article>

      {documents.length ? (
        <section className="w-full border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-4 flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-transparent text-slate-500">
              <FileStack size={14} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Documents</p>
            <div className="flex-1 border-t border-slate-100" />
          </header>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc, index) => (
              <button
                key={doc.id}
                type="button"
                disabled={!isPreviewableDocument(doc)}
                onClick={() => setPreviewIndex(index)}
                className="overflow-hidden rounded-xl border border-slate-200/70 bg-transparent text-left hover:border-slate-300 disabled:cursor-default disabled:opacity-70"
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

      {(verification.events || []).length ? (
        <section className="w-full border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Verification timeline</p>
          <ol className="mt-3 space-y-2">
            {(verification.events || []).slice(0, 8).map((ev) => (
              <li key={ev.id || `${ev.type}-${ev.at}`} className="bg-transparent py-1 text-sm">
                <span className="font-semibold text-slate-900">{formatAdminLabel(ev.type)}</span>
                <span className="text-slate-500"> · {formatWhen(ev.at)}</span>
                {ev.actor?.name ? <span className="text-slate-500"> · {ev.actor.name}</span> : null}
                {ev.reason ? <p className="mt-1 text-xs text-slate-600">{ev.reason}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="w-full border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <User size={15} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Contact & role</p>
          <div className="flex-1 border-t border-slate-100" />
        </header>
        <PersonalCard
          displayFullName={name}
          personalInfo={personalInfo}
          businessInfo={businessInfo}
          columns={3}
        />
      </section>

      <section className="w-full border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Briefcase size={15} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Business & expertise</p>
          <div className="flex-1 border-t border-slate-100" />
        </header>
        <BusinessCard businessInfo={businessInfo} columns={3} />
        {areas.length ? (
          <div className="mt-4">
            <DetailList label="Service areas" items={areas} columns={3} />
          </div>
        ) : null}
      </section>
        </div>
      )}
      </div>

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
      <AdminConfirmModal
        open={accountAction === "suspend"}
        onClose={() => setAccountAction(null)}
        title="Suspend this professional?"
        message="They will lose access until an admin unsuspends the account."
        confirmLabel="Suspend"
        tone="danger"
        requireReason
        pending={suspend.isPending}
        onConfirm={async (reason) => {
          try {
            await suspend.mutateAsync({ id: userId, reason });
            setAccountAction(null);
          } catch {
            /* mutation toast */
          }
        }}
      />
      <AdminConfirmModal
        open={accountAction === "unsuspend"}
        onClose={() => setAccountAction(null)}
        title="Restore this professional?"
        message="They will be able to sign in again."
        confirmLabel="Unsuspend"
        pending={unsuspend.isPending}
        onConfirm={async () => {
          try {
            await unsuspend.mutateAsync({ id: userId });
            setAccountAction(null);
          } catch {
            /* mutation toast */
          }
        }}
      />
    </div>
  );
}
