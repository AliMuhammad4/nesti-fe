import { toast } from "react-toastify";
import { PROFESSIONAL_ROLE_VALUES } from "@/constants/auth";
import { isPublicMarketingRoute, normalizePathname } from "@/lib/publicRoutes";

export const SETUP_ALLOWED_PREFIXES = [
  "/settings",
  "/checkout",
  "/calendly-callback",
  "/profile",
];

export const PRIVATE_WORKSPACE_PREFIXES = [
  "/dashboard",
  "/leads",
  "/conversations",
  "/call-history",
  "/referrals",
  "/clients",
  "/professionals",
  "/analytics",
  "/nurture-logs",
  "/calendar",
  "/messages",
];

/**
 * Returns true if the pathname corresponds to a private, authenticated workspace area
 * that requires full registration and profile completion.
 * Public marketing pages, blogs, terms, and landing pages will return FALSE.
 */
export function isPrivateWorkspaceRoute(pathname) {
  if (!pathname) return false;
  const clean = normalizePathname(pathname);
  if (isPublicMarketingRoute(clean)) return false;
  return PRIVATE_WORKSPACE_PREFIXES.some(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`)
  );
}

/**
 * Returns true if the pathname is permitted during incomplete profile setup.
 * Public marketing pages, docs, external links, and allowed setup routes return TRUE.
 */
export function isRouteAllowedDuringSetup(pathname) {
  if (!pathname) return true;
  const clean = normalizePathname(pathname);
  if (isPublicMarketingRoute(clean)) return true;
  return SETUP_ALLOWED_PREFIXES.some((p) => clean === p || clean.startsWith(`${p}/`));
}

/**
 * Evaluates whether the current user is a professional with an incomplete profile setup.
 */
export function isProfileSetupLocked(user, profileData, isSuccess) {
  const effectiveRole = user?.role || profileData?.user?.role;
  const needsGate = Boolean(
    effectiveRole && PROFESSIONAL_ROLE_VALUES.includes(effectiveRole)
  );
  if (!needsGate || !isSuccess || !profileData) return false;
  const setup = profileData.profile_setup;
  return Boolean(!setup || !setup.is_complete);
}

/**
 * Displays an inline warning toast when a user attempts to access a locked feature.
 */
export function notifyProfileSetupLocked(featureName = "this area") {
  toast.warn(
    `Complete your personal and business information in Settings to unlock ${featureName}.`,
    {
      toastId: `profile-setup-locked-${featureName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      autoClose: 4000,
    }
  );
}
