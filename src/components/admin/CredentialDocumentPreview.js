"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, FileText, Loader2, X } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { fetchDocBuffer } from "@/components/admin/pdfPreview";

function isImage(doc) {
  const mime = String(doc?.mime_type || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(String(doc?.file_name || ""));
}

function isPdf(doc) {
  const mime = String(doc?.mime_type || "").toLowerCase();
  if (mime.includes("pdf")) return true;
  return /\.pdf$/i.test(String(doc?.file_name || ""));
}

export default function CredentialDocumentPreview({
  open,
  document: doc,
  label,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  authToken = "",
  userId = "",
  proxyUrl = "",
}) {
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = label || doc?.file_name || "Document";
  const fileUrl = doc?.file_url || "";
  const image = isImage(doc);
  const pdf = isPdf(doc);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, onPrev, onNext]);

  useEffect(() => {
    if (!open || !doc) {
      setSrc("");
      setError("");
      return undefined;
    }

    let alive = true;
    let objectUrl = "";

    (async () => {
      setLoading(true);
      setError("");
      setSrc("");
      try {
        const resolvedProxy =
          proxyUrl
          || (userId && doc.id ? API_ENDPOINTS.admin.verificationDocument(userId, doc.id) : "");
        if (!resolvedProxy && !fileUrl) {
          throw new Error("Document URL missing");
        }
        const buffer = await fetchDocBuffer({
          url: fileUrl,
          proxyUrl: resolvedProxy || undefined,
          authToken,
        });
        const type = pdf
          ? "application/pdf"
          : image
            ? doc.mime_type || "image/jpeg"
            : doc.mime_type || "application/octet-stream";
        objectUrl = URL.createObjectURL(new Blob([buffer], { type }));
        if (alive) setSrc(objectUrl);
      } catch (err) {
        if (alive) setError(err?.message || "Could not load preview");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, doc, authToken, userId, fileUrl, image, pdf, proxyUrl]);

  if (!open || !doc || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-950/70" aria-label="Close preview" onClick={onClose} />
      <div className="relative flex max-h-[min(94vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="mt-0.5 truncate text-xs text-slate-400">{doc.file_name || "Uploaded file"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {hasPrev ? (
              <button type="button" onClick={onPrev} className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">
                Prev
              </button>
            ) : null}
            {hasNext ? (
              <button type="button" onClick={onNext} className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">
                Next
              </button>
            ) : null}
            {src ? (
              <>
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <ExternalLink size={13} /> Open
                </a>
                <a
                  href={src}
                  download={doc.file_name || "document"}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <Download size={13} /> Download
                </a>
              </>
            ) : null}
            <button type="button" onClick={onClose} className="rounded-lg border border-white/15 p-1.5 text-slate-200 hover:bg-white/10" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-900/80 p-3 sm:p-5">
          {loading ? (
            <Loader2 className="animate-spin text-slate-300" size={28} />
          ) : src && image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={title} className="max-h-[min(78vh,760px)] max-w-full rounded-lg object-contain" />
          ) : src && pdf ? (
            <iframe title={title} src={src} className="h-[min(78vh,760px)] w-full rounded-lg border border-white/10 bg-white" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center text-slate-300">
              <FileText size={36} />
              <p className="text-sm">{error || "Preview not available"}</p>
              {src ? (
                <a href={src} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900">
                  Open in new tab
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function isPreviewableDocument(doc) {
  return Boolean(doc?.file_url || doc?.id) && (isImage(doc) || isPdf(doc));
}

export function documentKindLabel(doc) {
  if (isImage(doc)) return "Image";
  if (isPdf(doc)) return "PDF";
  return "File";
}
