"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, Clock3, Eye, FileText, FileUp, ShieldAlert, XCircle } from "lucide-react";
import {
  useDeleteCredentialDocument,
  useMyCredentials,
  usePatchCredentials,
  useSubmitCredentials,
  useUploadCredentialDocument,
} from "@/hooks/useCredentialApi";
import { jurisdictionsForCountry } from "@/lib/credentialJurisdictions";
import { API_ENDPOINTS } from "@/lib/api";
import { useAppSelector } from "@/store";
import CredentialDocumentPreview, {
  documentKindLabel,
  isPreviewableDocument,
} from "@/components/admin/CredentialDocumentPreview";
import CredentialPdfThumb from "@/components/admin/CredentialPdfThumb";
import CredentialImageThumb from "@/components/admin/CredentialImageThumb";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

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

const STATUS_COPY = {
  not_started: { label: "Not started", tone: "bg-slate-100 text-slate-700" },
  pending_docs: { label: "Documents needed", tone: "bg-amber-50 text-amber-800" },
  pending_review: { label: "Under review", tone: "bg-sky-50 text-sky-800" },
  approved: { label: "Approved", tone: "bg-emerald-50 text-emerald-800" },
  rejected: { label: "Rejected", tone: "bg-rose-50 text-rose-800" },
};

export default function VerificationSettings() {
  const { data, isLoading, isError, error, refetch, isFetching } = useMyCredentials();
  const patchMeta = usePatchCredentials();
  const uploadDoc = useUploadCredentialDocument();
  const deleteDoc = useDeleteCredentialDocument();
  const submit = useSubmitCredentials();
  const authToken = useAppSelector((state) => state.auth.token);
  const [previewIndex, setPreviewIndex] = useState(null);

  const [country, setCountry] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nmlsId, setNmlsId] = useState("");

  const savedMeta = useMemo(
    () => ({
      country: data?.country || "",
      jurisdiction: data?.jurisdiction || "",
      license_number: data?.license_number || "",
      company_name: data?.company_name || "",
      nmls_id: data?.nmls_id || "",
    }),
    [data?.country, data?.jurisdiction, data?.license_number, data?.company_name, data?.nmls_id]
  );

  // Re-hydrate only when the saved values actually change. Keying this off `data`
  // would wipe whatever is being typed every time the query refetches (uploading a
  // document, for example, returns a fresh object and would reset the form).
  const lastSyncedRef = useRef(null);
  useEffect(() => {
    if (!data) return;
    const signature = JSON.stringify(savedMeta);
    if (lastSyncedRef.current === signature) return;
    lastSyncedRef.current = signature;
    setCountry(savedMeta.country);
    setJurisdiction(savedMeta.jurisdiction);
    setLicenseNumber(savedMeta.license_number);
    setCompanyName(savedMeta.company_name);
    setNmlsId(savedMeta.nmls_id);
  }, [data, savedMeta]);

  const status = data?.credential_status || "not_started";
  const statusMeta = STATUS_COPY[status] || STATUS_COPY.not_started;
  const jurisdictions = useMemo(() => jurisdictionsForCountry(country), [country]);
  const checklist = useMemo(() => data?.checklist || [], [data?.checklist]);
  const needsNmls = checklist.some((item) => item.type === "nmls_screenshot");
  // Lock edits while under review or after approval; allow changes for draft / rejected.
  const lockedEdit = status === "pending_review" || status === "approved";

  const draftMeta = useMemo(
    () => ({
      country: country || "",
      jurisdiction: jurisdiction || "",
      license_number: licenseNumber.trim(),
      company_name: companyName.trim(),
      nmls_id: nmlsId.trim(),
    }),
    [country, jurisdiction, licenseNumber, companyName, nmlsId]
  );
  // The checklist is derived server-side from the *saved* country and role, so the
  // required-document list is only trustworthy once the details have been saved.
  const hasUnsavedMeta = useMemo(
    () => JSON.stringify(draftMeta) !== JSON.stringify(savedMeta),
    [draftMeta, savedMeta]
  );

  const missingRequiredLabels = useMemo(
    () =>
      checklist
        .filter((item) => item.required && !item.uploaded)
        .map((item) => item.label || item.type),
    [checklist]
  );
  const documents = useMemo(() => data?.documents || [], [data?.documents]);
  const previewDocs = useMemo(
    () => checklist.map((item) => documents.find((doc) => doc.type === item.type)).filter(Boolean),
    [checklist, documents]
  );
  const needsReplaceLabels = useMemo(
    () =>
      checklist
        .filter((item) => {
          const doc = documents.find((entry) => entry.type === item.type);
          return item.required && doc?.status === "rejected";
        })
        .map((item) => item.label || item.type),
    [checklist, documents]
  );

  const submitReady =
    !lockedEdit
    && !hasUnsavedMeta
    && country
    && jurisdiction
    && licenseNumber.trim()
    && companyName.trim()
    && (!needsNmls || nmlsId.trim())
    && checklist.filter((item) => item.required).every((item) => item.uploaded)
    && needsReplaceLabels.length === 0;

  const saveMeta = () => {
    patchMeta.mutate(
      {
        country: country || null,
        jurisdiction,
        license_number: licenseNumber,
        company_name: companyName,
        nmls_id: nmlsId,
      },
      { onSuccess: () => toast.success("License details saved") }
    );
  };

  if (isLoading) return <WorkspaceLoader fullHeight={false} />;
  if (isError) {
    return (
      <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{error?.message || "Failed to load verification"}</p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-800"
        >
          {isFetching ? "Retrying…" : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Credential verification</h2>
            <p className="mt-1 text-sm text-slate-500">
              {data?.requirements_summary
                || "Upload your license documents for admin approval. Your free trial starts after approval."}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}>
            {status === "approved" ? <CheckCircle2 size={14} /> : null}
            {status === "pending_review" ? <Clock3 size={14} /> : null}
            {status === "rejected" ? <XCircle size={14} /> : null}
            {statusMeta.label}
          </span>
        </div>

        {status === "rejected" && data?.credential_reject_reason ? (
          <div className="mt-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">Rejected — update and resubmit</div>
              <div>{data.credential_reject_reason}</div>
              <div className="mt-1 text-xs">Replace any documents marked “Needs update”, then resubmit for review.</div>
            </div>
          </div>
        ) : null}

        {status === "approved" ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            Your credentials are approved. Free trial and dashboard features are unlocked.
          </div>
        ) : null}

        {status === "pending_review" ? (
          <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-800">
            Your documents are with the admin team. You will be notified when a decision is made.
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">License details</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">Country</span>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
              value={country}
              disabled={lockedEdit || patchMeta.isPending}
              onChange={(e) => {
                setCountry(e.target.value);
                setJurisdiction("");
              }}
            >
              <option value="">Select country</option>
              <option value="CA">Canada</option>
              <option value="US">United States</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              {country === "US" ? "State" : "Province / territory"}
            </span>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
              value={jurisdiction}
              disabled={lockedEdit || !country || patchMeta.isPending}
              onChange={(e) => setJurisdiction(e.target.value)}
            >
              <option value="">Select</option>
              {jurisdictions.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">License / registration number</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
              value={licenseNumber}
              disabled={lockedEdit || patchMeta.isPending}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">Company / brokerage / firm</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
              value={companyName}
              disabled={lockedEdit || patchMeta.isPending}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </label>
          {needsNmls ? (
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">NMLS ID</span>
              <input
                className="h-10 w-full rounded-lg border border-slate-200 px-3"
                value={nmlsId}
                disabled={lockedEdit || patchMeta.isPending}
                onChange={(e) => setNmlsId(e.target.value)}
              />
            </label>
          ) : null}
        </div>
        {!lockedEdit ? (
          <button
            type="button"
            onClick={saveMeta}
            disabled={patchMeta.isPending || !hasUnsavedMeta}
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {patchMeta.isPending ? "Saving…" : hasUnsavedMeta ? "Save details" : "Details saved"}
          </button>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Required documents</h3>
        <p className="mt-1 text-xs text-slate-500">
          JPEG, PNG, WEBP, or PDF up to 16MB. Click a file to preview. If a document was rejected, replace it before resubmitting.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {checklist.map((item) => {
            const existing = documents.find((doc) => doc.type === item.type);
            const uploading = uploadDoc.isPending && uploadDoc.variables?.type === item.type;
            const removing = deleteDoc.isPending && deleteDoc.variables === existing?.id;
            const needsUpdate = existing?.status === "rejected";
            const image = existing && isImageDoc(existing);
            const previewable = existing ? isPreviewableDocument(existing) : false;
            const proxyUrl = existing?.id
              ? API_ENDPOINTS.professionals.credentialDocument(existing.id)
              : "";
            const previewPos = existing
              ? previewDocs.findIndex((doc) => doc.id === existing.id)
              : -1;

            return (
              <div
                key={item.type}
                className={`overflow-hidden rounded-xl border bg-white ${
                  needsUpdate
                    ? "border-rose-200"
                    : existing
                      ? "border-slate-200"
                      : "border-dashed border-slate-200 bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  disabled={!existing}
                  onClick={() => {
                    if (previewPos >= 0) setPreviewIndex(previewPos);
                  }}
                  className={`group relative block w-full text-left ${existing ? "" : "cursor-default"}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
                    {image && existing ? (
                      <CredentialImageThumb
                        doc={existing}
                        proxyUrl={proxyUrl}
                        authToken={authToken || ""}
                        alt={item.label}
                        className="h-full w-full object-contain p-2 transition duration-200 group-hover:scale-[1.01]"
                      />
                    ) : existing && isPdfDoc(existing) ? (
                      <div className="h-full w-full p-3">
                        <div className="h-full w-full overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-sm">
                          <CredentialPdfThumb
                            doc={existing}
                            proxyUrl={proxyUrl}
                            authToken={authToken || ""}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400">
                        <FileText size={22} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                          {existing ? documentKindLabel(existing) : "Not uploaded"}
                        </span>
                      </div>
                    )}
                    {existing ? (
                      <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                        <Eye size={11} />
                        {previewable ? "Preview" : "Open"}
                      </span>
                    ) : null}
                  </div>
                </button>
                <div className="flex items-start justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {item.label}
                      {item.required ? <span className="text-rose-500"> *</span> : null}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {existing?.file_name || (item.required ? "Not uploaded" : "Optional — not uploaded")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      existing?.status === "accepted"
                        ? "bg-emerald-50 text-emerald-700"
                        : needsUpdate
                          ? "bg-rose-50 text-rose-700"
                          : existing
                            ? "bg-sky-50 text-sky-700"
                            : item.required
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {existing?.status === "accepted"
                      ? "Accepted"
                      : needsUpdate
                        ? "Needs update"
                        : existing
                          ? "Uploaded"
                          : item.required
                            ? "Missing"
                            : "Optional"}
                  </span>
                </div>
                {!lockedEdit ? (
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-2.5">
                    {existing ? (
                      <button
                        type="button"
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 disabled:opacity-50"
                        disabled={deleteDoc.isPending || uploadDoc.isPending}
                        onClick={() => deleteDoc.mutate(existing.id)}
                      >
                        {removing ? "Removing…" : "Remove"}
                      </button>
                    ) : null}
                    <label
                      className={`inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 text-[11px] font-semibold text-white ${
                        uploadDoc.isPending
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-slate-800"
                      }`}
                    >
                      <FileUp size={12} />
                      {uploading ? "Uploading…" : existing ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        disabled={uploadDoc.isPending}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (!file) return;
                          uploadDoc.mutate({ type: item.type, file });
                        }}
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {!lockedEdit ? (
          <button
            type="button"
            disabled={!submitReady || submit.isPending}
            onClick={() => submit.mutate()}
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {submit.isPending
              ? status === "rejected"
                ? "Resubmitting…"
                : "Submitting…"
              : status === "rejected"
                ? "Resubmit for admin review"
                : "Submit for admin review"}
          </button>
        ) : null}
        {!lockedEdit && !submitReady ? (
          <p className="mt-2 text-xs text-slate-500">
            {hasUnsavedMeta
              ? "Save your license details first — the required document list depends on the country and role you save."
              : needsReplaceLabels.length
                ? `Replace rejected files before resubmitting: ${needsReplaceLabels.join(", ")}.`
                : missingRequiredLabels.length
                  ? `Still required: ${missingRequiredLabels.join(", ")}.`
                  : "Complete country, jurisdiction, license number, company, and all required uploads to submit."}
          </p>
        ) : null}
      </div>

      <CredentialDocumentPreview
        open={previewIndex != null && Boolean(previewDocs[previewIndex])}
        document={previewDocs[previewIndex] || null}
        label={
          previewDocs[previewIndex]
            ? checklist.find((item) => item.type === previewDocs[previewIndex].type)?.label
              || previewDocs[previewIndex].file_name
            : ""
        }
        onClose={() => setPreviewIndex(null)}
        hasPrev={previewIndex > 0}
        hasNext={previewIndex != null && previewIndex < previewDocs.length - 1}
        onPrev={() => setPreviewIndex((i) => (i == null ? i : Math.max(0, i - 1)))}
        onNext={() => setPreviewIndex((i) => (i == null ? i : Math.min(previewDocs.length - 1, i + 1)))}
        authToken={authToken || ""}
        proxyUrl={
          previewDocs[previewIndex]?.id
            ? API_ENDPOINTS.professionals.credentialDocument(previewDocs[previewIndex].id)
            : ""
        }
      />
    </div>
  );
}
