"use client";

import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Maximize2, Calendar, Image as ImageIcon, Tag } from "lucide-react";

function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Price on request";

  const num = Number(raw.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(num) && num > 0) {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `$${num.toLocaleString()}`;
    return `$${num.toLocaleString()}`;
  }

  return raw;
}

export default function PropertyCard({ property }) {
  const mainImage = property.images?.[0]?.secure_url || property.images?.[0]?.url;
  const formattedDate = property.listedDate 
    ? new Date(property.listedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const price = formatPrice(property.price);
  const title = property.address && property.address !== "Address not provided"
    ? property.address
    : property.location || "Available Property";
  const hasStats = property.bedrooms || property.bathrooms || property.squareFootage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-primary/25 hover:shadow-md"
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={title}
            className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/85 text-slate-400 shadow-sm">
              <ImageIcon size={22} />
            </div>
            <span className="text-[11px] font-semibold text-slate-400">No photo uploaded</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent" />

        <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[12px] font-bold text-white shadow">
          {price}
        </div>

        {property.propertyType && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-sm">
            <Tag size={11} />
            {property.propertyType}
          </div>
        )}

        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <ImageIcon size={12} />
            <span>{property.images.length}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3">
          <h3 className="line-clamp-1 text-[15px] font-bold text-slate-950">
            {title}
          </h3>
          {property.location && property.location !== title && (
            <div className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
              <MapPin size={13} className="text-primary" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          )}
        </div>

        {hasStats ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-600">
            {property.bedrooms ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
                <Bed size={12} className="text-primary" />
                {property.bedrooms} Beds
              </span>
            ) : null}
            {property.bathrooms ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
                <Bath size={12} className="text-primary" />
                {property.bathrooms} Baths
              </span>
            ) : null}
            {property.squareFootage ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
                <Maximize2 size={12} className="text-primary" />
                {property.squareFootage} sqft
              </span>
            ) : null}
          </div>
        ) : null}

        {property.features && (
          <p className="mb-3 line-clamp-2 text-[13px] leading-5 text-slate-500">
            {property.features}
          </p>
        )}

        <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
              <Calendar size={12} className="text-slate-400" />
              <span>Listed {formattedDate}</span>
            </div>
          )}

          <button className="w-full rounded-xl bg-primary/8 px-4 py-2.5 text-sm font-bold text-primary transition group-hover:bg-primary group-hover:text-white">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}
