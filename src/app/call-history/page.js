"use client";

import FeaturePageGate from "@/components/billing/FeaturePageGate";
import CallHistoryPage from "@/components/prochat/calls/CallHistoryPage";
import { FEATURES } from "@/constants/features";

export default function ProfessionalCallHistoryRoute() {
  return (
    <FeaturePageGate feature={FEATURES.PRO_CHAT_DM}>
      <CallHistoryPage />
    </FeaturePageGate>
  );
}
