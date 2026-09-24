"use client";

import { User, Mail, Phone, Globe2, MapPin, Calendar } from "lucide-react";
import { InfoCard, InfoGrid } from "./ProfileInfoCard";

export default function PersonalCard({
  displayFullName,
  personalInfo,
  businessInfo,
  compact = false,
  columns = 3,
}) {
  const items = [
    { label: "Full Name", value: displayFullName, icon: User },
    { label: "Email", value: personalInfo?.email, icon: Mail },
    { label: "Phone", value: personalInfo?.phone, icon: Phone },
    {
      label: "Location",
      value: businessInfo?.location || personalInfo?.location,
      icon: MapPin,
    },
    {
      label: "Website",
      value: businessInfo?.website || personalInfo?.website,
      icon: Globe2,
    },
    {
      label: "Calendly",
      value: personalInfo?.calendlyUrl || businessInfo?.calendlyLink,
      icon: Calendar,
    },
  ];

  return (
    <InfoCard delay={0.05}>
      <InfoGrid compact={compact} columns={columns} items={items} />
    </InfoCard>
  );
}
