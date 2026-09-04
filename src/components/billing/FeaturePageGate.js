"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

export default function FeaturePageGate({ feature, children, redirectTo = "/checkout" }) {
  const router = useRouter();
  const {
    hasFeature,
    token,
    sessionInvalid,
    isProfileReady,
  } = useFeatureAccess();
  const [isHydrated, setIsHydrated] = useState(false);
  const allowed = hasFeature(feature);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !isProfileReady) return;

    // Expired/invalid session must go to login — never billing/checkout.
    if (!token || sessionInvalid) {
      router.replace("/log-in");
      return;
    }

    if (!allowed) {
      router.replace(redirectTo);
    }
  }, [isHydrated, isProfileReady, token, sessionInvalid, allowed, redirectTo, router]);

  // Keep initial server/client markup identical to avoid hydration mismatch.
  if (!isHydrated || (token && !isProfileReady)) {
    return <div className="min-h-[12rem]" />;
  }

  if (!token || sessionInvalid) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center p-6 text-sm text-text-muted">
        Your session expired. Redirecting to login…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center p-6 text-sm text-text-muted">
        This feature is not included in your current plan.
      </div>
    );
  }

  return children;
}
