"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { renderPdfFirstPage } from "@/components/admin/pdfPreview";

export default function CredentialPdfThumb({ doc, userId = "", authToken = "", proxyUrl = "" }) {
  const canvasRef = useRef(null);
  const [ok, setOk] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!doc || !canvasRef.current) return undefined;
    let alive = true;
    setOk(false);
    setFailed(false);
    const resolvedProxy =
      proxyUrl
      || (userId && doc.id ? API_ENDPOINTS.admin.verificationDocument(userId, doc.id) : "");

    renderPdfFirstPage(canvasRef.current, {
      url: doc.file_url,
      proxyUrl: resolvedProxy,
      authToken,
      maxWidth: 480,
      maxHeight: 320,
    })
      .then(() => alive && setOk(true))
      .catch(() => alive && setFailed(true));

    return () => {
      alive = false;
    };
  }, [doc, userId, authToken, proxyUrl]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-100">
      <canvas
        ref={canvasRef}
        className={`max-h-full max-w-full object-contain shadow-sm ${ok ? "opacity-100" : "pointer-events-none absolute opacity-0"}`}
      />
      {!ok && !failed ? <Loader2 size={18} className="animate-spin text-slate-400" /> : null}
      {failed ? (
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <FileText size={22} />
          <span className="text-[10px] font-semibold uppercase">PDF</span>
        </div>
      ) : null}
    </div>
  );
}
