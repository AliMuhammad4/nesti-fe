import { toast } from "react-toastify";
import { ACCOUNT_STATUS } from "@/constants/features";
import { isPublicMarketingRoute } from "@/lib/publicRoutes";
import { getActivePlanLimitStates } from "@/lib/planLimitUtils";

export const ALLOWED_AFTER_TRIAL_PREFIXES = [
  "/checkout",
  "/client-dashboard/billing",
  "/client-dashboard/subscription",
  "/settings",
  "/calendly-callback",
  "/log-in",
  "/sign-up",
  "/forgot-password",
  "/verify-reset-otp",
  "/reset-password",
  "/verify-email",
];

export function isAllowedAfterTrial(pathname) {
  if (!pathname || pathname === "/") return true;
  if (isPublicMarketingRoute(pathname)) return true;
  if (pathname.startsWith("/invite/")) return true;
  if (pathname.startsWith("/p/") || pathname.startsWith("/professional/")) return true;
  return ALLOWED_AFTER_TRIAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}?`)
  );
}

export function isTrialExpiredOrLocked(user, profileData = null) {
  const effectiveUser = profileData?.user || user;
  if (!effectiveUser) return false;

  const role = String(effectiveUser.role || "").toLowerCase();
  if (role === "admin") return false;

  const accountStatus = String(
    effectiveUser.accountStatus || effectiveUser.account_status || ""
  ).toLowerCase();

  // Active subscription is never locked
  if (accountStatus === ACCOUNT_STATUS.SUBSCRIBED || accountStatus === "active") {
    return false;
  }

  // Explicitly expired
  if (accountStatus === ACCOUNT_STATUS.EXPIRED) {
    return true;
  }

  const trialEndsAt = effectiveUser.trialEndsAt || effectiveUser.trial_ends_at;

  // Free trial expired by timestamp
  if (accountStatus === ACCOUNT_STATUS.FREE_TRIAL) {
    if (trialEndsAt && new Date(trialEndsAt).getTime() <= Date.now()) {
      return true;
    }

    // Trial quota exhausted
    const planLimits = effectiveUser.planLimits || effectiveUser.plan_limits || null;
    const usage = effectiveUser.usage || null;
    if (getActivePlanLimitStates(planLimits, usage).length > 0) {
      return true;
    }
  }

  // Client accounts without explicit status but with past trial_ends_at
  if (role === "client" && trialEndsAt && new Date(trialEndsAt).getTime() <= Date.now()) {
    return true;
  }

  return false;
}

export function getUpgradeBillingRoute(user) {
  const role = String(user?.role || "").toLowerCase();
  if (role === "client") {
    return "/client-dashboard/billing";
  }
  return "/checkout?trial=expired";
}

export function openTrialExpiredModal(featureName = "") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("nesti:open-trial-expired-modal", {
        detail: { featureName: String(featureName || "").trim() },
      })
    );
  }
}

let lastToastTime = 0;
export function notifyTrialExpired(featureName = "") {
  const now = Date.now();
  if (now - lastToastTime < 1500) return;
  lastToastTime = now;

  const featureText = featureName ? ` to unlock ${featureName}` : "";
  toast.info(`Your free trial has ended. Subscribe${featureText}.`, {
    toastId: "trial-expired-action-toast",
  });
}
