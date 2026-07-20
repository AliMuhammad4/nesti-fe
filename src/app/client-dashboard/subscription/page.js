"use client";

import { Suspense } from "react";
import ClientBillingRouteContent from "@/components/client/ClientBillingRouteContent";
import ClientBillingRouteFallback from "@/components/client/ClientBillingRouteFallback";

export default function ClientSubscriptionPage() {
  return (
    <Suspense fallback={<ClientBillingRouteFallback />}>
      <ClientBillingRouteContent
        canonicalPath="/client-dashboard/subscription"
        mode="subscription"
      />
    </Suspense>
  );
}
