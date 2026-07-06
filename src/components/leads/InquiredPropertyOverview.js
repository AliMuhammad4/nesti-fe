"use client";

import { inquiredPropertyDisplayAddress } from "@/lib/inquiredPropertyUtils";

function Field({ label, value }) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return (
    <div className="min-w-0 rounded border border-border/45 bg-background-light/35 px-2 py-1.5">
      <div className="text-[9px] font-medium uppercase tracking-wide text-text-muted">{label}</div>
      <div className="mt-px text-[11px] font-normal leading-snug text-text-heading break-words">{text}</div>
    </div>
  );
}

function normalizeImageUrl(image) {
  if (typeof image === "string") return image.trim();
  if (image && typeof image === "object") {
    return String(image.secure_url || image.url || "").trim();
  }
  return "";
}

/**
 * Listing snapshot for buyer inquiries (used on lead workspace + referral lead snapshot).
 */
export default function InquiredPropertyOverview({ property, className = "" }) {
  if (!property || typeof property !== "object") return null;
  const address = inquiredPropertyDisplayAddress(property);
  const images = (Array.isArray(property.images) ? property.images : [])
    .map(normalizeImageUrl)
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div
      className={`rounded-xl border border-primary/15 bg-primary/[0.03] p-3 ${className}`.trim()}
    >
      <div className="text-sm font-semibold text-text-heading">Inquired property</div>
      <p className="mt-0.5 text-[11px] text-text-muted">
        Property the lead asked about before they were referred.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <Field label="Title" value={property.title} />
        <Field label="Address" value={address} />
        <Field label="Price" value={property.expected_price} />
        <Field label="Type" value={property.property_type} />
        <Field label="Bedrooms" value={property.bedrooms} />
        <Field label="Bathrooms" value={property.bathrooms} />
        <Field label="Square footage" value={property.square_footage} />
        <Field label="Listed by" value={property.listed_by_name} />
        <Field label="Seller" value={property.seller_name} />
      </div>
      {images.length ? (
        <div className="mt-3">
          <div className="text-[9px] font-medium uppercase tracking-wide text-text-muted">Photos</div>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="overflow-hidden rounded-md border border-border/60 bg-white"
              >
                <img
                  src={url}
                  alt={`Listing photo ${index + 1}`}
                  className="h-24 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
