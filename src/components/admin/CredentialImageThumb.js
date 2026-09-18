"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api";
import { fetchDocBuffer } from "@/components/admin/pdfPreview";

/** Loads credential images through the authenticated admin proxy. */
export default function CredentialImageThumb({
  doc,
  userId = "",
  authToken = "",
  proxyUrl = "",
  alt = "",
  className = "h-full w-full object-contain",
}) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const resolvedProxy =
      proxyUrl
      || (userId && doc?.id ? API_ENDPOINTS.admin.verificationDocument(userId, doc.id) : "");
    if (!doc?.id || !authToken || !resolvedProxy) {
      setSrc("");
      return undefined;
    }
    let alive = true;
    let objectUrl = "";
    (async () => {
      try {
        const buffer = await fetchDocBuffer({
          url: doc.file_url,
          proxyUrl: resolvedProxy,
          authToken,
        });
        objectUrl = URL.createObjectURL(
          new Blob([buffer], { type: doc.mime_type || "image/jpeg" })
        );
        if (alive) setSrc(objectUrl);
      } catch {
        if (alive) setSrc("");
      }
    })();
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc, userId, authToken, proxyUrl]);

  if (!src) {
    return <div className="h-full w-full animate-pulse bg-slate-200/80" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
