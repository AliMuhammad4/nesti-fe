"use client";

export const PROCHAT_ATTACHMENT_LIMITS = {
  images: 10,
  documents: 10,
};

export function displayName(u) {
  if (!u) return "Professional";
  const full = String(u.full_name || "").trim();
  if (full) return full;
  return [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.email || "Professional";
}

export function initialsFor(u) {
  const name = displayName(u);
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";
}

export function displayRole(u) {
  const raw = String(u?.role || "").trim();
  if (!raw) return "Professional";
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function safeUuid() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    // ignore
  }
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0;
  let v = n;
  while (v >= 1024 && idx < units.length - 1) {
    v /= 1024;
    idx += 1;
  }
  return `${v.toFixed(v >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export function isImageAttachment(a) {
  const mime = String(a?.mime_type || "").toLowerCase();
  // If backend provides a mime_type, trust it.
  // Cloudinary may return PDFs under resource_type "image" (and /image/upload URLs),
  // but PDFs should render as document chips (not <img> previews).
  if (mime) return mime.startsWith("image/");
  const rt = String(a?.resource_type || "").toLowerCase();
  if (rt === "image") return true;
  const url = String(a?.secure_url || a?.url || "").toLowerCase();
  return url.includes("/image/upload/");
}

export function countProChatAttachmentTypes(attachments) {
  return (Array.isArray(attachments) ? attachments : []).reduce(
    (acc, att) => {
      if (isImageAttachment(att)) acc.images += 1;
      else acc.documents += 1;
      return acc;
    },
    { images: 0, documents: 0 }
  );
}

export function validateProChatAttachmentLimits(attachments) {
  const counts = countProChatAttachmentTypes(attachments);
  if (counts.images > PROCHAT_ATTACHMENT_LIMITS.images) {
    return {
      ok: false,
      message: `You can attach up to ${PROCHAT_ATTACHMENT_LIMITS.images} images per message.`,
    };
  }
  if (counts.documents > PROCHAT_ATTACHMENT_LIMITS.documents) {
    return {
      ok: false,
      message: `You can attach up to ${PROCHAT_ATTACHMENT_LIMITS.documents} PDFs/documents per message.`,
    };
  }
  return { ok: true, counts };
}

export function prettyAttachmentName(a) {
  const mime = String(a?.mime_type || "").toLowerCase();
  const url = String(a?.secure_url || a?.url || "");
  const raw =
    String(a?.filename || "").trim() ||
    String(a?.original_filename || "").trim() ||
    (isImageAttachment(a) ? "Image" : "Attachment");
  const looksPdf =
    mime === "application/pdf" || raw.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf");
  if (looksPdf && !raw.toLowerCase().endsWith(".pdf")) return `${raw}.pdf`;
  return raw;
}

function truncatePreview(value, maxLength = 120) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function cleanPropertyFollowup(value) {
  return String(value || "")
    .trim()
    .replace(/^Client question:\s*/i, "");
}

/**
 * Human-readable one-line preview for conversation lists.
 * Parses structured property inquiry messages instead of showing raw JSON tags.
 */
export function formatProChatMessagePreview(raw, { maxLength = 120 } = {}) {
  const text = String(raw || "").trim();
  if (!text) return "";

  const structuredMatch = /\[PROPERTY_CARD\]\s*([\s\S]*?)\s*\[\/PROPERTY_CARD\](?:\s*\n\s*([\s\S]+))?/i.exec(text);
  if (structuredMatch) {
    try {
      const card = JSON.parse(structuredMatch[1]);
      const followup = cleanPropertyFollowup(structuredMatch[2]);
      if (followup) return truncatePreview(followup, maxLength);

      const title = String(card?.title || "Property").trim();
      const location = String(card?.location || "").trim();
      const price = String(card?.price || "").trim();
      const parts = [title];
      if (location && location.toLowerCase() !== title.toLowerCase()) parts.push(location);
      if (price) parts.push(price);
      return truncatePreview(`Property inquiry: ${parts.join(" · ")}`, maxLength);
    } catch {
      const titleMatch = /"title"\s*:\s*"([^"]+)"/i.exec(structuredMatch[1] || text);
      const priceMatch = /"price"\s*:\s*"([^"]+)"/i.exec(structuredMatch[1] || text);
      const title = String(titleMatch?.[1] || "Property").trim();
      const price = String(priceMatch?.[1] || "").trim();
      const followup = cleanPropertyFollowup(structuredMatch[2]);
      if (followup) return truncatePreview(followup, maxLength);
      return truncatePreview(`Property inquiry: ${[title, price].filter(Boolean).join(" · ")}`, maxLength);
    }
  }

  if (/\[PROPERTY_CARD\]/i.test(text)) {
    const titleMatch = /"title"\s*:\s*"([^"]+)"/i.exec(text);
    const priceMatch = /"price"\s*:\s*"([^"]+)"/i.exec(text);
    const title = String(titleMatch?.[1] || "Property").trim();
    const price = String(priceMatch?.[1] || "").trim();
    return truncatePreview(`Property inquiry: ${[title, price].filter(Boolean).join(" · ")}`, maxLength);
  }

  const legacyMatch =
    /^I selected this (property|comparable):\s*([\s\S]+?)\.\s*Please guide me on[\s\S]*?(?:\n\n([\s\S]+))?$/i.exec(text);
  if (legacyMatch) {
    const followup = cleanPropertyFollowup(legacyMatch[3]);
    if (followup) return truncatePreview(followup, maxLength);
    const summary = String(legacyMatch[2] || "").trim();
    if (summary) return truncatePreview(`Property inquiry: ${summary}`, maxLength);
  }

  return truncatePreview(text, maxLength);
}
