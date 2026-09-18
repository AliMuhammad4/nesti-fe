import { toast } from "react-toastify";
import { PROFESSIONAL_ROLE_VALUES } from "@/constants/auth";
import { isPublicMarketingRoute, normalizePathname } from "@/lib/publicRoutes";

/** Settings + notifications only until admin approves; checkout unlocks after approval. */
export const CREDENTIAL_ALLOWED_PREFIXES = [
  "/settings",
  "/profile",
  "/calendly-callback",
  "/notifications",
];

/** Within Settings, only account + verification while credentials are locked. */
export const CREDENTIAL_ALLOWED_SETTINGS_TABS = new Set([
  "personal",
  "business",
  "verification",
]);

export function isSettingsTabAllowedDuringCredentialLock(tab) {
  const key = String(tab || "personal").toLowerCase();
  return CREDENTIAL_ALLOWED_SETTINGS_TABS.has(key);
}

export function isRouteAllowedDuringCredentialLock(pathname) {
  if (!pathname) return true;
  const clean = normalizePathname(pathname);
  if (isPublicMarketingRoute(clean)) return true;
  return CREDENTIAL_ALLOWED_PREFIXES.some((p) => clean === p || clean.startsWith(`${p}/`));
}

export function isCredentialLocked(user, profileData, isSuccess) {
  const effectiveRole = user?.role || profileData?.user?.role;
  const needsGate = Boolean(effectiveRole && PROFESSIONAL_ROLE_VALUES.includes(effectiveRole));
  if (!needsGate || !isSuccess || !profileData) return false;

  const gate = profileData.credential_gate;
  if (gate && typeof gate.locked === "boolean") return Boolean(gate.locked);

  const status = String(
    profileData.user?.credential_status
      || profileData.professionalProfile?.credential_status
      || ""
  ).toLowerCase();
  if (!status) return false;
  return status !== "approved";
}

export function getCredentialLockReason(profileData) {
  return (
    profileData?.credential_gate?.reason
    || "Upload and submit your professional credentials to start your free trial."
  );
}

export function notifyCredentialLocked(featureName = "this area") {
  toast.warn(
    `Complete credential verification in Settings to unlock ${featureName}.`,
    {
      toastId: `credential-locked-${featureName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      autoClose: 4000,
    }
  );
}
