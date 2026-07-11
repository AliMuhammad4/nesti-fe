"use client";

import { Briefcase, BadgeCheck, Layers, CreditCard, MessageSquare, MapPin, Award } from "lucide-react";
import { InfoCard, InfoGrid } from "./ProfileInfoCard";
import { formatBusinessInfoForDisplay } from "@/lib/profileFieldDisplay";

const hasAny = (...vals) => vals.some((v) => v !== undefined && v !== null && v !== "");

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function ChipRow({ label, items }) {
  if (!items?.length) return null;
  return (
    <div className="min-w-0 w-full space-y-1.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <div className="flex w-full flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-md border border-primary/15 bg-primary/[0.06] px-2 py-0.5 text-[11px] font-medium text-primary/80"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BusinessCard({ businessInfo }) {
  const rawRole = normalizeRole(businessInfo?.professionalType);
  const isMortgageBroker = rawRole === "mortgage_broker";
  const b = formatBusinessInfoForDisplay(businessInfo);
  const valueLabel = isMortgageBroker ? "Typical Loan Size" : "Avg Sale Price";

  const chipSections = [
    { label: "Specializations", items: b.specializations || [] },
    { label: "Communication", items: b.communicationChannels || [] },
    { label: "Preferred clients", items: b.preferredClients || [] },
  ].filter((section) => section.items.length > 0);

  const hasChips = chipSections.length > 0;

  const gridItems = [
    { label: "Professional Type", value: b.professionalType, icon: Briefcase },
    { label: "License Number", value: b.licenseNumber, icon: BadgeCheck },
    { label: "Experience", value: b.experience, icon: Layers },
    { label: valueLabel, value: b.avgSalePrice, icon: CreditCard },
    { label: "Response Time", value: b.responseTime, icon: MessageSquare },
    { label: "Availability", value: b.availability, icon: MapPin },
    ...(hasAny(b.companyName) ? [{ label: "Company Name", value: b.companyName, icon: Briefcase }] : []),
    ...(hasAny(b.awards) ? [{ label: "Awards", value: b.awards, icon: Award }] : []),
  ].filter((item) => hasAny(item.value));

  return (
    <InfoCard delay={0.1}>
      {gridItems.length ? (
        <InfoGrid className="lg:grid-cols-4" items={gridItems} />
      ) : (
        <p className="text-xs italic text-slate-400">No business details added yet.</p>
      )}

      {hasChips ? (
        <div
          className={`mt-4 grid w-full gap-4 border-t border-slate-100 pt-4 ${
            chipSections.length >= 3
              ? "grid-cols-1 lg:grid-cols-3"
              : chipSections.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
          }`}
        >
          {chipSections.map((section) => (
            <ChipRow key={section.label} label={section.label} items={section.items} />
          ))}
        </div>
      ) : null}
    </InfoCard>
  );
}
