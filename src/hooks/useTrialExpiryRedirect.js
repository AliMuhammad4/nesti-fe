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
  isAwaitingCredentialApproval,
  isTrialExpiredOrLocked,
  getUpgradeBillingRoute,
} from "@/lib/trialSubscriptionGate";
import { isProfileSetupLocked } from "@/lib/profileSetupGate";

function isAuthEntryPath(pathname) {
  return (
    pathname === "/log-in"
    || pathname === "/sign-up"
    || pathname.startsWith("/forgot-password")
    || pathname.startsWith("/verify-")
    || pathname.startsWith("/reset-password")
  );
}

export function useTrialExpiryRedirect(isMounted) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { token, user: authUser } = useAppSelector((state) => state.auth);
  const [now, setNow] = useState(Date.now());
  const [quotaRedirectRequested, setQuotaRedirectRequested] = useState(false);
  const allowedPath = isAllowedAfterTrial(pathname);
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const authRole = String(authUser?.role || "").toLowerCase();

  const {
    data: profileData,
    isError: profileIsError,
    error: profileError,
    isSuccess: profileIsSuccess,
  } = useQuery({
    queryKey: ["profile"],
    // Always validate the session when a token exists — including /checkout.
    // Disabling this on checkout left expired tokens stranded on billing screens.
    enabled: Boolean(isMounted && token),
    staleTime: 15_000,
    queryFn: () =>
      apiClient({
        url: API_ENDPOINTS.auth.profile,
        method: "GET",
        token,
      }),
  });

  // Never drive checkout redirects from stale Redux user when the session is dead.
  // Expired tokens previously fell through to checkout because Redux still had trial=expired.
  const sessionInvalid = profileIsError && Number(profileError?.status) === 401;
  const effectiveUser = profileIsSuccess ? profileData?.user : null;
  const effectiveRole = String(effectiveUser?.role || authRole || "").toLowerCase();
  // Admins never go through free-trial / subscription paywalls.
  const isAdmin = effectiveRole === "admin" || authRole === "admin" || isAdminPath;

  const accountStatus = String(
    effectiveUser?.accountStatus || effectiveUser?.account_status || ""
  ).toLowerCase();
  const isClient = effectiveRole === "client";
  const trialEndsAt = effectiveUser?.trialEndsAt || effectiveUser?.trial_ends_at;
  const planLimits = effectiveUser?.planLimits || effectiveUser?.plan_limits || null;
  const usage = effectiveUser?.usage || null;
  const trialRemainingMs = useMemo(() => getTrialRemainingMs(trialEndsAt, now), [trialEndsAt, now]);
  const trialStillActive =
    !isAdmin &&
    accountStatus === ACCOUNT_STATUS.FREE_TRIAL &&
    Boolean(trialEndsAt) &&
    trialRemainingMs > 0;

  const setupIncomplete = !isAdmin && isProfileSetupLocked(effectiveUser, profileData, profileIsSuccess);
  const credentialsPending = !isAdmin && isAwaitingCredentialApproval(effectiveUser, profileData);

  // Profile setup + credential verification must finish before billing/trial paywall.
  const deferTrialPaywall = isAdmin || setupIncomplete || credentialsPending;

  const trialHasEnded =
    !isAdmin &&
    !deferTrialPaywall &&
    (
      accountStatus === ACCOUNT_STATUS.EXPIRED ||
      (accountStatus === ACCOUNT_STATUS.FREE_TRIAL && Boolean(trialEndsAt) && trialRemainingMs <= 0) ||
      isTrialExpiredOrLocked(effectiveUser, profileData)
    );
  const trialQuotaExhausted =
    !isAdmin &&
    !deferTrialPaywall &&
    accountStatus === ACCOUNT_STATUS.FREE_TRIAL &&
    !trialStillActive &&
    getActivePlanLimitStates(planLimits, usage).length > 0;

  useEffect(() => {
    if (isAdmin) return;
    if (!isMounted || !token || !effectiveUser || accountStatus !== ACCOUNT_STATUS.FREE_TRIAL || !trialEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isAdmin, isMounted, token, effectiveUser, accountStatus, trialEndsAt]);

  // Dead session → login (apiClient also emits nesti:auth-expired; this covers /checkout).
  useEffect(() => {
    if (!isMounted || !sessionInvalid) return;
    if (isAuthEntryPath(pathname)) return;
    router.replace("/log-in");
  }, [isMounted, sessionInvalid, pathname, router]);

  // Stuck on checkout while still onboarding / awaiting credentials → send back to Settings.
  useEffect(() => {
    if (isAdmin) return;
    if (!isMounted || !token || sessionInvalid || !effectiveUser || !profileIsSuccess) return;
    if (!pathname.startsWith("/checkout")) return;
    if (!deferTrialPaywall) return;
    const next = setupIncomplete
      ? "/settings?tab=personal&setup=required"
      : "/settings?tab=verification";
    router.replace(next);
  }, [
    isAdmin,
    isMounted,
    token,
    sessionInvalid,
    effectiveUser,
    profileIsSuccess,
    pathname,
    deferTrialPaywall,
    setupIncomplete,
    router,
  ]);

  useEffect(() => {
    if (isAdmin) return;
    if (!isMounted || !token || sessionInvalid || !effectiveUser) return;
    if (deferTrialPaywall) return;
    const shouldHonorQuotaRedirect = quotaRedirectRequested && !trialStillActive;
    if (!trialHasEnded && !trialQuotaExhausted && !shouldHonorQuotaRedirect) return;
    if (allowedPath) return;

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
    isAdmin,
    isMounted,
    token,
    sessionInvalid,
    deferTrialPaywall,
    trialHasEnded,
    trialQuotaExhausted,
    quotaRedirectRequested,
    trialStillActive,
    allowedPath,
    pathname,
    router,
    isClient,
    effectiveUser,
  ]);

  useEffect(() => {
    if (isAdmin) return;
    if (!isMounted || !token || sessionInvalid) return;
    const onQuotaRequired = () => {
      if (trialStillActive || deferTrialPaywall) return;
      setQuotaRedirectRequested(true);
    };
    window.addEventListener("nesti:subscription-quota-required", onQuotaRequired);
    return () => window.removeEventListener("nesti:subscription-quota-required", onQuotaRequired);
  }, [isAdmin, isMounted, token, sessionInvalid, trialStillActive, deferTrialPaywall]);
}
