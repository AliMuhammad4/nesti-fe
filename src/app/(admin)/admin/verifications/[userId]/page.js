"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, FileText, ShieldAlert, UserRound } from "lucide-react";
import {
  useAdminApproveVerification,
  useAdminRejectVerification,
  useAdminVerification,
} from "@/hooks/useAdminApi";
import {
  AdminConfirmModal,
  adminButtonClass,
  adminGhostButtonClass,
  adminTextareaClass,
  formatAdminLabel,
  formatPersonName,
} from "@/components/admin/AdminUi";
import CredentialDocumentPreview, {
  documentKindLabel,
  isPreviewableDocument,
} from "@/components/admin/CredentialDocumentPreview";
import CredentialPdfThumb from "@/components/admin/CredentialPdfThumb";
import CredentialImageThumb from "@/components/admin/CredentialImageThumb";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import { useAppSelector } from "@/store";
import { countryLabel, jurisdictionLabel, regionLabel } from "@/lib/credentialJurisdictions";

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

function formatWhen(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function initialsFrom(name = "", email = "") {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return String(email || "?").slice(0, 2).toUpperCase();
}

const STATUS_STYLES = {
  pending_review: "bg-sky-50 text-sky-800 ring-sky-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending_docs: "bg-amber-50 text-amber-900 ring-amber-200",
  not_started: "bg-slate-100 text-slate-700 ring-slate-200",
};

function StatusBadge({ status }) {
  const tone = STATUS_STYLES[status] || STATUS_STYLES.not_started;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone}`}>
      {formatAdminLabel(status)}
    </span>
  );
}

export default function AdminVerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;
  const authToken = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminVerification(userId);
  const approve = useAdminApproveVerification();
  const reject = useAdminRejectVerification();
  const [reason, setReason] = useState("");
  const [previewIndex, setPreviewIndex] = useState(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const decisionBusy = approve.isPending || reject.isPending;

  const user = data?.user || {};
  const docs = useMemo(() => data?.documents || [], [data?.documents]);
  const checklist = useMemo(() => data?.checklist || [], [data?.checklist]);
  const status = data?.credential_status || "not_started";
  const canDecide = status === "pending_review";
  const missingRequired = checklist.filter((item) => item.required && !item.uploaded);
  const uploadedCount = checklist.filter((item) => item.uploaded).length;

  const displayName = formatPersonName(
    data?.profile?.full_name
      || [user.first_name, user.last_name].filter(Boolean).join(" ")
      || user.email
      || "Professional"
  );

  const selfieDoc = useMemo(
    () => docs.find((d) => d.type === "selfie" && isImageDoc(d) && d.id) || null,
    [docs]
  );

  const docByType = useMemo(() => {
    const map = {};
    docs.forEach((doc) => {
      map[doc.type] = doc;
    });
    return map;
  }, [docs]);

  const docLabel = useCallback(
    (doc) => checklist.find((c) => c.type === doc.type)?.label || formatAdminLabel(doc.type),
    [checklist]
  );

  const openPreview = (index) => setPreviewIndex(index);
  const closePreview = () => setPreviewIndex(null);
  const previewDoc = previewIndex != null ? docs[previewIndex] : null;

  const openDocByType = (type) => {
    const index = docs.findIndex((d) => d.type === type);
    if (index >= 0) openPreview(index);
  };

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{error?.message || "Failed to load verification"}</p>
        <button
          type="button"
          className={adminGhostButtonClass}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Retrying…" : "Retry"}
        </button>
      </div>
    );
  }

  const decisionUnavailableCopy =
    status === "approved"
      ? "These credentials are already approved. There is nothing left to decide here."
      : status === "rejected"
        ? "These credentials were rejected. The professional must resubmit before you can decide again."
        : "This professional has not submitted their credentials yet, so there is nothing to approve or reject.";

  const roleLine = `${formatAdminLabel(data?.profile?.professional_type || user.role)} · ${
    regionLabel(data?.country, data?.jurisdiction) || "Region n/a"
  }`;
  const profileId = data?.profile?.id;
  const phone = data?.profile?.phone || user.phone || "";
  const isUsBroker =
    String(data?.profile?.professional_type || user.role).toLowerCase() === "mortgage_broker"
    && String(data?.country || "").toUpperCase() === "US";
  const jurisdictionHeading = String(data?.country || "").toUpperCase() === "US"
    ? "State"
    : "Province / territory";

  const licenseFields = [
    { label: "Country", value: countryLabel(data?.country) || "—" },
    { label: jurisdictionHeading, value: jurisdictionLabel(data?.country, data?.jurisdiction) || "—" },
    { label: "License #", value: data?.license_number || "—" },
    { label: "Company", value: data?.company_name || data?.profile?.company_name || "—" },
    ...(isUsBroker || data?.nmls_id ? [{ label: "NMLS ID", value: data?.nmls_id || "—" }] : []),
    { label: "Phone", value: phone || "—" },
    { label: "Submitted", value: formatWhen(data?.credential_submitted_at) },
    { label: "Reviewed", value: formatWhen(data?.credential_reviewed_at) },
    {
      label: "Reviewer",
      value: data?.reviewed_by?.name || data?.reviewed_by?.email || "—",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header: avatar + identity + actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white shadow-sm">
            {user.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile_image} alt="" className="h-full w-full object-cover" />
            ) : selfieDoc ? (
              <CredentialImageThumb
                doc={selfieDoc}
                userId={userId}
                authToken={authToken || ""}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-600">
                {initialsFrom(displayName, user.email)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[1.65rem] font-semibold tracking-tight text-slate-950">
              {displayName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{roleLine}</p>
            <p className="mt-0.5 truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {profileId ? (
            <Link
              href={`/admin/professionals/${profileId}`}
              className={`${adminGhostButtonClass} gap-1.5`}
            >
              <UserRound size={14} />
              View profile
            </Link>
          ) : null}
          <Link href="/admin/verifications" className={adminGhostButtonClass}>
            Back to queue
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        {/* Profile / license meta — once */}
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {licenseFields.map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 break-words text-sm font-medium text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
          {data?.requirements_summary ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-500">{data.requirements_summary}</p>
          ) : null}
          {status === "rejected" && data?.credential_reject_reason ? (
            <div className="mt-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">Reject reason</div>
                <div className="mt-0.5">{data.credential_reject_reason}</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Decision — only actions when pending */}
        {canDecide ? (
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-sm font-semibold text-slate-900">Review decision</h2>
            <p className="mt-1 text-sm text-slate-600">
              Review the submitted license details and documents, then approve to start their trial or reject with a reason they will see.
            </p>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="shrink-0 space-y-2">
                <button
                  type="button"
                  className={adminButtonClass}
                  disabled={decisionBusy}
                  onClick={() => setConfirmApprove(true)}
                >
                  {approve.isPending ? "Approving…" : "Approve & start trial"}
                </button>
                {missingRequired.length ? (
                  <p className="max-w-xs text-xs text-amber-700">
                    {missingRequired.length} required file{missingRequired.length === 1 ? "" : "s"} still missing.
                  </p>
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <label className="block text-xs font-medium text-slate-500">Rejection reason</label>
                <textarea
                  className={`${adminTextareaClass} min-h-[4.5rem]`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What should this professional fix before resubmitting?"
                />
                <button
                  type="button"
                  className={`${adminGhostButtonClass} border-rose-200 text-rose-700 hover:bg-rose-50`}
                  disabled={decisionBusy || reason.trim().length < 3}
                  onClick={() => {
                    if (decisionBusy) return;
                    // Success + error toasts come from the mutation hook.
                    reject.mutate(
                      { userId, reason: reason.trim() },
                      { onSuccess: () => router.push("/admin/verifications") }
                    );
                  }}
                >
                  {reject.isPending ? "Rejecting…" : "Reject submission"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-sm text-slate-600">{decisionUnavailableCopy}</p>
          </div>
        )}

        {/* Documents */}
        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Documents</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {uploadedCount}/{checklist.length || docs.length} on file · click to preview
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(checklist.length
              ? checklist
              : docs.map((d) => ({ type: d.type, label: docLabel(d), required: true, uploaded: true }))
            ).map((item) => {
              const doc = docByType[item.type];
              const label = item.label || formatAdminLabel(item.type);
              const uploaded = Boolean(item.uploaded || doc);
              const image = doc && isImageDoc(doc);
              const previewable = doc ? isPreviewableDocument(doc) : false;

              return (
                <button
                  key={item.type}
                  type="button"
                  disabled={!doc}
                  onClick={() => doc && openDocByType(item.type)}
                  className={`group overflow-hidden rounded-xl border text-left transition ${
                    doc
                      ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      : "cursor-default border-dashed border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
                    {image && doc ? (
                      <CredentialImageThumb
                        doc={doc}
                        userId={userId}
                        authToken={authToken || ""}
                        alt={label}
                        className="h-full w-full object-contain p-2 transition duration-200 group-hover:scale-[1.01]"
                      />
                    ) : doc && isPdfDoc(doc) ? (
                      <div className="h-full w-full p-3">
                        <div className="h-full w-full overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-sm">
                          <CredentialPdfThumb doc={doc} userId={userId} authToken={authToken || ""} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400">
                        <FileText size={22} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                          {doc ? documentKindLabel(doc) : "Missing"}
                        </span>
                      </div>
                    )}
                    {doc ? (
                      <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                        <Eye size={11} />
                        {previewable ? "Preview" : "Open"}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-start justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900">{label}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {doc?.file_name
                          || (item.extra
                            ? "Additional upload"
                            : item.required
                              ? "Not uploaded"
                              : "Optional — not uploaded")}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        doc?.status === "accepted"
                          ? "bg-emerald-50 text-emerald-700"
                          : doc?.status === "rejected"
                            ? "bg-rose-50 text-rose-700"
                            : uploaded
                              ? "bg-sky-50 text-sky-700"
                              : item.required
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {doc?.status === "accepted"
                        ? "Accepted"
                        : doc?.status === "rejected"
                          ? "Needs update"
                          : uploaded
                            ? "On file"
                            : item.required
                              ? "Missing"
                              : item.extra
                                ? "Extra"
                                : "Optional"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {(data?.events || []).length ? (
          <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-sm font-semibold text-slate-900">Verification timeline</h2>
            <p className="mt-0.5 text-xs text-slate-500">Submit, review, and notification history</p>
            <ol className="mt-4 space-y-3">
              {(data.events || []).map((ev) => {
                const emailMeta = ev.meta?.email_meta || null;
                const emailResults = ev.meta?.email_results || null;
                return (
                  <li
                    key={ev.id || `${ev.type}-${ev.at}`}
                    className="relative rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatAdminLabel(ev.type)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatWhen(ev.at)}
                          {ev.actor?.name || ev.actor?.email
                            ? ` · ${ev.actor.name || ev.actor.email}`
                            : ev.actor_role
                              ? ` · ${formatAdminLabel(ev.actor_role)}`
                              : ""}
                        </p>
                      </div>
                      {emailMeta?.email_status ? (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                          Email: {emailMeta.email_status}
                        </span>
                      ) : null}
                    </div>
                    {ev.reason ? (
                      <p className="mt-1.5 text-sm text-slate-700">{ev.reason}</p>
                    ) : null}
                    {Array.isArray(emailResults) && emailResults.length ? (
                      <p className="mt-1 text-[11px] text-slate-500">
                        Admin emails:{" "}
                        {emailResults
                          .map((r) => r.email_status)
                          .filter(Boolean)
                          .join(", ") || "n/a"}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>

      <CredentialDocumentPreview
        open={previewIndex != null && Boolean(previewDoc)}
        document={previewDoc}
        label={previewDoc ? docLabel(previewDoc) : ""}
        onClose={closePreview}
        hasPrev={previewIndex > 0}
        hasNext={previewIndex != null && previewIndex < docs.length - 1}
        onPrev={() => setPreviewIndex((i) => (i == null ? i : Math.max(0, i - 1)))}
        onNext={() => setPreviewIndex((i) => (i == null ? i : Math.min(docs.length - 1, i + 1)))}
        authToken={authToken || ""}
        userId={userId || ""}
      />

      <AdminConfirmModal
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        title="Approve credentials"
        subtitle="This action cannot be undone from this screen."
        message={
          missingRequired.length
            ? `${missingRequired.length} required document${
                missingRequired.length === 1 ? " is" : "s are"
              } still missing (${missingRequired
                .map((item) => item.label || formatAdminLabel(item.type))
                .join(", ")}). Approving anyway marks credentials verified and starts the free trial immediately.`
            : "Approving marks credentials verified and starts the professional free trial immediately."
        }
        confirmLabel="Approve & start trial"
        pending={approve.isPending}
        onConfirm={() => {
          if (decisionBusy) return;
          approve.mutate(
            { userId },
            {
              onSuccess: () => {
                setConfirmApprove(false);
                router.push("/admin/verifications");
              },
              onError: () => setConfirmApprove(false),
            }
          );
        }}
      />
    </div>
  );
}
