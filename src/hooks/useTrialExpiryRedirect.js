"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store";
import { ACCOUNT_STATUS } from "@/constants/features";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { getActivePlanLimitStates } from "@/lib/planLimitUtils";
import { getTrialRemainingMs } from "@/components/ui/TrialCountdownBadge";
import {
  isAllowedAfterTrial,
  isTrialExpiredOrLocked,
  getUpgradeBillingRoute,
} from "@/lib/trialSubscriptionGate";

export function useTrialExpiryRedirect(isMounted) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const [now, setNow] = useState(Date.now());
  const [quotaRedirectRequested, setQuotaRedirectRequested] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    enabled: Boolean(isMounted && token),
    staleTime: 15_000,
    queryFn: () =>
      apiClient({
        url: API_ENDPOINTS.auth.profile,
        method: "GET",
        token,
      }),
  });

  const effectiveUser = profileData?.user || user;

  const accountStatus = String(
    effectiveUser?.accountStatus || effectiveUser?.account_status || ""
  ).toLowerCase();
  const isClient = String(effectiveUser?.role || "").toLowerCase() === "client";
  const trialEndsAt = effectiveUser?.trialEndsAt || effectiveUser?.trial_ends_at;
  const planLimits = effectiveUser?.planLimits || effectiveUser?.plan_limits || null;
  const usage = effectiveUser?.usage || null;
  const trialRemainingMs = useMemo(() => getTrialRemainingMs(trialEndsAt, now), [trialEndsAt, now]);
  const trialStillActive =
    accountStatus === ACCOUNT_STATUS.FREE_TRIAL &&
    Boolean(trialEndsAt) &&
    trialRemainingMs > 0;
  const trialHasEnded =
    accountStatus === ACCOUNT_STATUS.EXPIRED ||
    (accountStatus === ACCOUNT_STATUS.FREE_TRIAL && Boolean(trialEndsAt) && trialRemainingMs <= 0) ||
    isTrialExpiredOrLocked(effectiveUser);
  const trialQuotaExhausted =
    accountStatus === ACCOUNT_STATUS.FREE_TRIAL &&
    !trialStillActive &&
    getActivePlanLimitStates(planLimits, usage).length > 0;

  useEffect(() => {
    if (!isMounted || !token || accountStatus !== ACCOUNT_STATUS.FREE_TRIAL || !trialEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isMounted, token, accountStatus, trialEndsAt]);

  useEffect(() => {
    if (!isMounted || !token) return;
    const shouldHonorQuotaRedirect = quotaRedirectRequested && !trialStillActive;
    if (!trialHasEnded && !trialQuotaExhausted && !shouldHonorQuotaRedirect) return;
    if (isAllowedAfterTrial(pathname)) return;

    const quotaLocked = trialQuotaExhausted || shouldHonorQuotaRedirect;
    toast.info(
      quotaLocked
        ? "Your free trial quota has been used. Choose a subscription plan to continue."
        : "Your free trial has ended. Choose a subscription plan to continue.",
      {
        toastId: quotaLocked ? "trial-quota-subscription-required" : "trial-expired-subscription-required",
      }
    );

    const upgradeRoute = isClient
      ? "/client-dashboard/billing"
      : quotaLocked
        ? "/checkout?trial=quota"
        : getUpgradeBillingRoute(effectiveUser);

    router.replace(upgradeRoute);
  }, [
    isMounted,
    token,
    trialHasEnded,
    trialQuotaExhausted,
    quotaRedirectRequested,
    trialStillActive,
    pathname,
    router,
    isClient,
    effectiveUser,
  ]);

  useEffect(() => {
    if (!isMounted || !token) return;
    const onQuotaRequired = () => {
      if (trialStillActive) return;
      setQuotaRedirectRequested(true);
    };
    window.addEventListener("nesti:subscription-quota-required", onQuotaRequired);
    return () => window.removeEventListener("nesti:subscription-quota-required", onQuotaRequired);
  }, [isMounted, token, trialStillActive]);
}
