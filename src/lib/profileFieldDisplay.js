const PROFESSIONAL_TYPE_LABELS = {
  agent: "Agent",
  lawyer: "Lawyer",
  mortgage_broker: "Mortgage Broker",
};

const EXPERIENCE_LABELS = {
  junior: "Junior (0-2 years)",
  mid: "Mid (3-7 years)",
  senior: "Senior (7-15 years)",
  elite: "Elite (15+ years)",
  "0-2": "0-2 years",
  "3-5": "3-5 years",
  "6-10": "6-10 years",
  "10+": "10+ years",
};

const RESPONSE_TIME_LABELS = {
  "1hour": "Under 1 hour",
  sameday: "Same day",
  "24hours": "Within 24 hours",
  "48hours": "Within 48 hours",
};

const AVAILABILITY_LABELS = {
  business: "Business hours",
  extended: "Extended hours",
  weekends: "Weekends",
  "247": "24/7",
};

const AVG_SALE_PRICE_LABELS = {
  "0-300k": "< $300K",
  "300-600k": "$300-600K",
  "600k-1m": "$600K-1M",
  "1m+": "$1M+",
};

const TRANSACTION_VOLUME_LABELS = {
  "1-10": "1-10",
  "11-25": "11-25",
  "26-50": "26-50",
  "50+": "50+",
};

const SUPPORT_LEVEL_LABELS = {
  full: "Full support",
  guided: "Guided support",
  minimal: "Minimal support",
};

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function toTitleCase(value) {
  return String(value || "")
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function lookupLabel(map, value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const direct = map[raw.toLowerCase()];
  if (direct) return direct;
  const compact = map[normalizeKey(raw)];
  return compact || "";
}

/** Format coded business-profile values for display cards. */
export function formatProfileBusinessField(label, value) {
  const raw = String(value ?? "").trim();
  if (!raw) return raw;

  switch (label) {
    case "Professional Type":
      return lookupLabel(PROFESSIONAL_TYPE_LABELS, raw) || toTitleCase(raw);
    case "Experience":
      return lookupLabel(EXPERIENCE_LABELS, raw) || toTitleCase(raw);
    case "Response Time":
      return lookupLabel(RESPONSE_TIME_LABELS, raw) || toTitleCase(raw);
    case "Availability":
      return lookupLabel(AVAILABILITY_LABELS, raw) || toTitleCase(raw);
    case "Avg Sale Price":
      return lookupLabel(AVG_SALE_PRICE_LABELS, raw) || raw;
    case "Transaction Volume":
      return lookupLabel(TRANSACTION_VOLUME_LABELS, raw) || raw;
    case "Support Level":
      return lookupLabel(SUPPORT_LEVEL_LABELS, raw) || toTitleCase(raw);
    case "Negotiation Style":
    case "Sales Approach":
    case "Approach":
    case "Energy Style":
    case "Energy":
    case "Personality":
      return toTitleCase(raw);
    default:
      if (/^[a-z0-9_-]+$/i.test(raw)) return toTitleCase(raw);
      return raw;
  }
}

/** Format chip/list labels (specializations, communication, etc.). */
export function formatProfileChipLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return raw;
  if (/[A-Z]/.test(raw) && raw.includes(" ")) return raw;
  return toTitleCase(raw);
}

export function formatBusinessInfoForDisplay(businessInfo = {}) {
  const b = businessInfo || {};
  return {
    ...b,
    professionalType: formatProfileBusinessField("Professional Type", b.professionalType),
    experience: formatProfileBusinessField(
      "Experience",
      b.experience || b.experienceLevel || "",
    ),
    responseTime: formatProfileBusinessField("Response Time", b.responseTime),
    availability: formatProfileBusinessField("Availability", b.availability),
    avgSalePrice: formatProfileBusinessField("Avg Sale Price", b.avgSalePrice),
    transactionVolume: formatProfileBusinessField("Transaction Volume", b.transactionVolume),
    supportLevel: formatProfileBusinessField("Support Level", b.supportLevel),
    negotiationStyle: formatProfileBusinessField("Negotiation Style", b.negotiationStyle),
    salesApproach: formatProfileBusinessField("Sales Approach", b.salesApproach),
    energyStyle: formatProfileBusinessField("Energy Style", b.energyStyle),
    personalityTag: formatProfileBusinessField("Personality", b.personalityTag),
    specializations: (b.specializations || []).map(formatProfileChipLabel),
    communicationChannels: (b.communicationChannels || []).map(formatProfileChipLabel),
    preferredClients: (b.preferredClients || []).map(formatProfileChipLabel),
  };
}
