"use client";

import { useParams } from "next/navigation";
import CallDetailView from "@/components/prochat/calls/CallDetailView";
import { useAppSelector } from "@/store";

export default function ClientCallDetailRoute() {
  const params = useParams();
  const callId = String(params?.callId || "").trim();
  const token = useAppSelector((state) => state.auth.token);

  return (
    <CallDetailView
      callId={callId}
      token={token}
      client
      backHref="/client-dashboard/calls"
    />
  );
}
