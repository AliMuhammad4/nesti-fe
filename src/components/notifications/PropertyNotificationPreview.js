"use client";

import { MapPin, BedDouble, Bath, Ruler, Home, Clock, DollarSign } from "lucide-react";

function MetaChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-white/90 px-2 py-1 text-xs font-medium text-text-heading">
      {Icon ? <Icon size={12} className="shrink-0 text-primary" /> : null}
      <span>{value}</span>
    </span>
  );
}

export default function PropertyNotificationPreview({ preview, compact = false }) {
  if (!preview || typeof preview !== "object") return null;

  const address = String(preview.address || "").trim();
  const location = String(preview.location || "").trim();
  const headline = address || location;
  const imageUrl = String(preview.image_url || "").trim();
  const agent = preview.listing_agent && typeof preview.listing_agent === "object" ? preview.listing_agent : null;
  const agentName = String(agent?.name || "").trim();
  const agentCompany = String(agent?.company || "").trim();
  const agentImage = String(agent?.profile_image || "").trim();

  if (compact) {
    const bits = [
      preview.price,
      preview.bedrooms ? `${preview.bedrooms} bed` : "",
      preview.bathrooms ? `${preview.bathrooms} bath` : "",
    ].filter(Boolean);
    if (!bits.length && !headline) return null;
    return (
      <p className="mt-1 text-xs text-text-muted">
        {[headline, bits.join(" · ")].filter(Boolean).join(" — ")}
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-white/90">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-40 w-full object-cover sm:h-48" />
      ) : (
        <div className="flex h-28 items-center justify-center bg-background-light/80 text-text-muted sm:h-32">
          <Home size={28} className="opacity-40" />
        </div>
      )}
      <div className="space-y-3 p-4">
        {headline ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Property</p>
            <p className="text-base font-semibold text-text-heading">{headline}</p>
            {address && location && address.toLowerCase() !== location.toLowerCase() ? (
              <p className="mt-0.5 flex items-start gap-1 text-sm text-text-muted">
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                <span>{location}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {preview.price ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign size={16} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Asking price</p>
              <p className="text-lg font-bold text-text-heading">{preview.price}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <MetaChip icon={BedDouble} value={preview.bedrooms ? `${preview.bedrooms} beds` : ""} />
          <MetaChip icon={Bath} value={preview.bathrooms ? `${preview.bathrooms} baths` : ""} />
          <MetaChip icon={Ruler} value={preview.square_footage ? `${preview.square_footage} sq ft` : ""} />
          <MetaChip icon={Home} value={preview.property_type || ""} />
          <MetaChip icon={Clock} value={preview.timeline || ""} />
        </div>

        {agentName ? (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background-light/60 px-3 py-2">
            {agentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agentImage} alt="" className="h-9 w-9 rounded-lg object-cover ring-1 ring-border/60" />
            ) : (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary-dark">
                {agentName.split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("") || "A"}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Listing agent</p>
              <p className="truncate text-sm font-semibold text-text-heading">{agentName}</p>
              {agentCompany ? <p className="truncate text-xs text-text-muted">{agentCompany}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
