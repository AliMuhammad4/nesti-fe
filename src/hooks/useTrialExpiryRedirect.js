"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store";
import { ACCOUNT_STATUS } from "@/constants/features";
import { isPublicMarketingRoute } from "@/lib/publicRoutes";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { getActivePlanLimitStates } from "@/lib/planLimitUtils";
import { getTrialRemainingMs } from "@/components/ui/TrialCountdownBadge";

const ALLOWED_PREFIXES = [
  "/checkout",
  "/client-dashboard/billing",
  "/client-dashboard/subscription",
  "/calendly-callback",
  "/log-in",
  "/sign-up",
  "/forgot-password",
  "/verify-reset-otp",
  "/reset-password",
  "/verify-email",
];

function isAllowedAfterTrial(pathname) {
  if (pathname === "/") return true;
  if (isPublicMarketingRoute(pathname)) return true;
  if (pathname.startsWith("/invite/")) return true;
  if (pathname.startsWith("/p/") || pathname.startsWith("/professional/")) return true;
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

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
  const { token } = useAppSelector((state) => state.auth);
  const [now, setNow] = useState(Date.now());
  const [quotaRedirectRequested, setQuotaRedirectRequested] = useState(false);
  const allowedPath = isAllowedAfterTrial(pathname);

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

  const accountStatus = String(effectiveUser?.accountStatus || effectiveUser?.account_status || "").toLowerCase();
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
    (accountStatus === ACCOUNT_STATUS.FREE_TRIAL && Boolean(trialEndsAt) && trialRemainingMs <= 0);
  const trialQuotaExhausted =
    accountStatus === ACCOUNT_STATUS.FREE_TRIAL &&
    !trialStillActive &&
    getActivePlanLimitStates(planLimits, usage).length > 0;

  useEffect(() => {
    if (!isMounted || !token || !effectiveUser || accountStatus !== ACCOUNT_STATUS.FREE_TRIAL || !trialEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isMounted, token, effectiveUser, accountStatus, trialEndsAt]);

  // Dead session → login (apiClient also emits nesti:auth-expired; this covers /checkout).
  useEffect(() => {
    if (!isMounted || !sessionInvalid) return;
    if (isAuthEntryPath(pathname)) return;
    router.replace("/log-in");
  }, [isMounted, sessionInvalid, pathname, router]);

  useEffect(() => {
    if (!isMounted || !token || sessionInvalid || !effectiveUser) return;
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
    router.replace(
      isClient
        ? "/client-dashboard/billing"
        : quotaLocked
          ? "/checkout?trial=quota"
          : "/checkout?trial=expired"
    );
  }, [
    isMounted,
    token,
    sessionInvalid,
    effectiveUser,
    trialHasEnded,
    trialQuotaExhausted,
    quotaRedirectRequested,
    trialStillActive,
    allowedPath,
    router,
    isClient,
  ]);

  useEffect(() => {
    if (!isMounted || !token || sessionInvalid) return;
    const onQuotaRequired = () => {
      if (trialStillActive) return;
      setQuotaRedirectRequested(true);
    };
    window.addEventListener("nesti:subscription-quota-required", onQuotaRequired);
    return () => window.removeEventListener("nesti:subscription-quota-required", onQuotaRequired);
  }, [isMounted, token, sessionInvalid, trialStillActive]);
}
