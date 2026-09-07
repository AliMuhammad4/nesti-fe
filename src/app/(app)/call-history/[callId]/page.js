"use client";

import { useParams } from "next/navigation";
import FeaturePageGate from "@/components/billing/FeaturePageGate";
import CallDetailView from "@/components/prochat/calls/CallDetailView";
import { FEATURES } from "@/constants/features";
import { useAppSelector } from "@/store";

export default function ProfessionalCallDetailRoute() {
  const params = useParams();
  const callId = String(params?.callId || "").trim();
  const token = useAppSelector((state) => state.auth.token);

  return (
    <FeaturePageGate feature={FEATURES.PRO_CHAT_DM}>
      <CallDetailView
        callId={callId}
        token={token}
        client={false}
        backHref="/call-history"
      />
    </FeaturePageGate>
  );
}
