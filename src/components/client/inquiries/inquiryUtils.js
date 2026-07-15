export const FILTER_TABS = [
  { id: "", label: "All" },
  { id: "agent", label: "Agents" },
  { id: "lawyer", label: "Lawyers" },
  { id: "broker", label: "Brokers" },
];

export const INQUIRIES_PER_PAGE = 8;

const ROLE_LABELS = {
  agent: "Agent",
  lawyer: "Lawyer",
  mortgage_broker: "Broker",
  broker: "Broker",
  professional: "Professional",
};

const LEGAL_SERVICE_LABELS = {
  full_closing: "Full closing services",
  purchase_closing: "Purchase closing",
  sale_closing: "Sale closing",
  refinance_legal_work: "Refinance legal work",
  agreement_review: "Agreement / contract review",
  title_transfer: "Title transfer",
  document_review: "Document review",
  mortgage_document_review: "Mortgage document review",
  property_dispute_advice: "Property dispute / legal advice",
  other: "Other legal service",
};

export function formatRole(value) {
  const key = String(value || "").trim().toLowerCase();
  if (ROLE_LABELS[key]) return ROLE_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatLegalServiceLabel(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  if (LEGAL_SERVICE_LABELS[key]) return LEGAL_SERVICE_LABELS[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const numeric = Number(raw.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numeric);
  }
  return raw;
}

export function formatStatus(value) {
  const normalized = String(value || "new").trim().replace(/_/g, " ");
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatPropertyType(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes(" ")) return raw;
  return raw.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isPropertyInquiryItem(item, property, professional) {
  if (item?.inquiry_type === "professional") return false;
  if (item?.inquiry_type !== "property") return false;
  // Lawyer/broker profile inquiries must never show as property, even if type is stale.
  const role = String(professional?.professional_type || "").trim().toLowerCase();
  if (role === "lawyer" || role === "mortgage_broker" || role === "broker") return false;
  // Real property rows have a listing id or a non-generic title.
  const propertyId = String(property?.id || "").trim();
  const title = String(property?.title || "").trim().toLowerCase();
  if (propertyId) return true;
  if (title && title !== "property inquiry") return true;
  return Boolean(property?.price || property?.location);
}

export function inquiryTitle(item, property, professional) {
  if (isPropertyInquiryItem(item, property, professional)) return "Property inquiry";
  // Titles always come from Legal service needed — never Transaction type.
  const legalLabel =
    String(item?.legal_service_label || "").trim() ||
    formatLegalServiceLabel(item?.legal_services_needed);
  if (legalLabel) return legalLabel;
  const mortgageLabel = String(item?.mortgage_service_label || "").trim();
  if (mortgageLabel) return mortgageLabel;
  const role = String(professional?.professional_type || "").trim().toLowerCase();
  const propertyType = formatPropertyType(item?.property_type || property?.property_type);
  if ((role === "agent" || role === "real_estate_agent") && propertyType) return propertyType;
  const agentLabel = String(item?.agent_service_label || "").trim();
  if (agentLabel) return agentLabel;
  const roleLabel = formatRole(professional?.professional_type || "professional");
  return `${roleLabel} inquiry`;
}

export function inquirySubject(item, property, professional) {
  if (isPropertyInquiryItem(item, property, professional)) {
    return [property?.title, property?.price ? formatPrice(property.price) : ""].filter(Boolean).join(" · ");
  }
  return [professional?.full_name, professional?.company_name].filter(Boolean).join(" · ") || "Professional profile";
}

export function trimPreview(value, max = 72) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

export function classifyInquiryRole(item) {
  const professional = item?.professional || {};
  const property = item?.property || null;
  if (isPropertyInquiryItem(item, property, professional)) return "agent";
  const key = String(professional?.professional_type || "").trim().toLowerCase();
  if (key === "lawyer") return "lawyer";
  if (key === "mortgage_broker" || key === "broker") return "broker";
  return "agent";
}

export function getInquiryCounts(items = [], apiCounts, paginationTotal) {
  if (apiCounts && typeof apiCounts.total === "number") {
    return {
      total: apiCounts.total,
      agents: apiCounts.agents ?? 0,
      lawyers: apiCounts.lawyers ?? 0,
      brokers: apiCounts.brokers ?? 0,
    };
  }

  let agents = 0;
  let lawyers = 0;
  let brokers = 0;
  for (const item of items) {
    const role = classifyInquiryRole(item);
    if (role === "lawyer") lawyers += 1;
    else if (role === "broker") brokers += 1;
    else agents += 1;
  }

  return {
    total: paginationTotal ?? items.length,
    agents,
    lawyers,
    brokers,
  };
}
