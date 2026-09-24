"use client";

import { Briefcase, BadgeCheck, Layers, CreditCard, MessageSquare, MapPin, Award } from "lucide-react";
import { InfoCard, InfoGrid, DetailList } from "./ProfileInfoCard";
import { formatBusinessInfoForDisplay } from "@/lib/profileFieldDisplay";

const hasAny = (...vals) => vals.some((v) => v !== undefined && v !== null && v !== "");

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function balancedColumns(count, preferred = 3) {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count % preferred === 0) return preferred;
  if (count % 2 === 0) return 2;
  if (preferred === 3 && count % 3 === 2) return 3;
  return 2;
}

export default function BusinessCard({ businessInfo }) {
  const rawRole = normalizeRole(businessInfo?.professionalType);
  const isMortgageBroker = rawRole === "mortgage_broker";
  const b = formatBusinessInfoForDisplay(businessInfo || {});
  const valueLabel = isMortgageBroker ? "Typical Loan Size" : "Avg Sale Price";

  const listSections = [
    { label: "Specializations", items: b.specializations || [] },
    { label: "Communication", items: b.communicationChannels || [] },
    { label: "Preferred clients", items: b.preferredClients || [] },
  ].filter((section) => section.items.length > 0);

  // Top row stays 3 columns (unchanged).
  const topRow = [
    ...(hasAny(b.companyName) ? [{ label: "Company Name", value: b.companyName, icon: Briefcase }] : []),
    { label: "License Number", value: b.licenseNumber, icon: BadgeCheck },
    { label: "Availability", value: b.availability, icon: MapPin },
  ].filter((item) => hasAny(item.value));

  // Last row: Experience, Avg Sale Price, Response Time, Awards — 4 columns.
  const bottomRow = [
    { label: "Experience", value: b.experience, icon: Layers },
    { label: valueLabel, value: b.avgSalePrice, icon: CreditCard },
    { label: "Response Time", value: b.responseTime, icon: MessageSquare },
    ...(hasAny(b.awards) ? [{ label: "Awards", value: b.awards, icon: Award }] : []),
  ].filter((item) => hasAny(item.value));

  const hasGrid = topRow.length > 0 || bottomRow.length > 0;

  return (
    <InfoCard delay={0.1}>
      {hasGrid ? (
        <div className="space-y-3">
          {topRow.length ? <InfoGrid columns={3} items={topRow} /> : null}
          {bottomRow.length ? <InfoGrid columns={4} items={bottomRow} /> : null}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-sm italic text-slate-400">
          No business details added yet.
        </p>
      )}

      {listSections.length ? (
        <div className="mt-4 space-y-3">
          {listSections.map((section) => (
            <DetailList
              key={section.label}
              label={section.label}
              items={section.items}
              columns={balancedColumns(section.items.length, 3)}
            />
          ))}
        </div>
      ) : null}
    </InfoCard>
  );
}
