/**
 * Helpers for listing-related lead context.
 * - Client dashboard property inquires: `client_property_inquiry` source only.
 * - Public-profile listing snapshots: `inquired_property` on the lead payload.
 */

function inquiredPropertyHasDisplayData(property) {
  if (!property || typeof property !== "object") return false;
  if (Array.isArray(property.images) && property.images.length > 0) return true;
  return Boolean(
    String(property.title || "").trim() ||
      String(property.address || "").trim() ||
      String(property.location || "").trim() ||
      String(property.expected_price || "").trim()
  );
}

/** Direct client-dashboard inquiry on a specific listing (`client_property_inquiry` only). */
export function isClientDashboardPropertyInquiry(lead) {
  if (!lead || typeof lead !== "object") return false;
  if (lead.is_listed_property_inquiry === true) return true;
  return String(lead.source || "").trim().toLowerCase() === "client_property_inquiry";
}

/** @deprecated Use {@link isClientDashboardPropertyInquiry}. */
export function isListedPropertyInquiry(lead) {
  return isClientDashboardPropertyInquiry(lead);
}

export function listedPropertyInquiryMessage(lead) {
  if (!lead || typeof lead !== "object") return "";
  if (!isClientDashboardPropertyInquiry(lead)) return "";
  return String(lead.inquiry_message || lead.property?.must_have_features || "").trim();
}

export function inquiredPropertyFromLead(lead) {
  const raw = lead?.inquired_property;
  if (raw && typeof raw === "object") return raw;
  if (!isClientDashboardPropertyInquiry(lead)) return null;
  const property = lead.property || {};
  const snapshot = {
    id: null,
    title: property.address || property.location || "Listed property",
    address: property.address || "",
    location: property.location || property.address || "",
    expected_price: property.expected_price || property.budget || "",
    property_type: property.property_type || "",
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
    square_footage: property.square_footage != null ? String(property.square_footage) : "",
    listed_by_name: "",
    seller_name: "",
    images: Array.isArray(property.images) ? property.images : [],
  };
  const hasAny = Object.entries(snapshot).some(([key, value]) => {
    if (key === "images") return value.length > 0;
    return value != null && String(value).trim() !== "";
  });
  return hasAny ? snapshot : null;
}

/** Public-profile or referral listing context (broader than client-dashboard property inquire). */
export function hasInquiredPropertyContext(lead) {
  const property = lead?.inquired_property;
  if (!property || typeof property !== "object") return false;
  const linkedId = String(lead?.linked_seller_lead_match_id || "").trim();
  if (linkedId) return true;
  return inquiredPropertyHasDisplayData(property);
}

/** Seller CRM row is only available via the inquired-property endpoint. */
export function needsInquiredPropertySellerFetch(lead) {
  if (!hasInquiredPropertyContext(lead)) return false;
  const linkedId = String(lead?.linked_seller_lead_match_id || "").trim();
  if (linkedId) return true;
  if (!isClientDashboardPropertyInquiry(lead)) return false;
  const propertyId = String(lead?.inquired_property?.id || lead?.inquired_property_id || "").trim();
  return Boolean(propertyId);
}

export function inquiredPropertyDisplayAddress(property) {
  if (!property || typeof property !== "object") return "";
  return String(property.address || property.location || "").trim();
}

/** Align public-profile submit payload with backend `normalizeInquiredProperty`. */
export function buildInquiredPropertyPayload(property, profile) {
  if (!property || typeof property !== "object") return null;
  const images = Array.isArray(property.images) ? property.images.filter(Boolean).slice(0, 8) : [];
  const professionalProfile = profile?.professional_profile || {};
  const normalized = {
    id: property.id || null,
    title: property.title || null,
    address: property.address || "",
    location: property.location || property.address || "",
    expected_price: property.expected_price || "",
    property_type: property.property_type || "",
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
    square_footage: property.square_footage != null ? String(property.square_footage) : "",
    seller_name: property.seller_name || "",
    seller_email: profile?.email || "",
    seller_phone: professionalProfile?.phone || profile?.phone || "",
    listed_by_name: profile?.professional_name || "",
    images,
  };
  const hasAny = Object.values(normalized).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value != null && String(value).trim() !== "";
  });
  return hasAny ? normalized : null;
}
