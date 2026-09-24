/** Mirrors backend `constants/adminPermissions.js` for client-side UI gating. */
export const ADMIN_PERMISSION = Object.freeze({
  ALL: "*",
  USERS_WRITE: "users.write",
  PROFESSIONALS_READ: "professionals.read",
  PROFESSIONALS_WRITE: "professionals.write",
  CLIENTS_READ: "clients.read",
  CLIENTS_WRITE: "clients.write",
  LEADS_READ: "leads.read",
  LEADS_WRITE: "leads.write",
  PROPERTIES_READ: "properties.read",
  PROPERTIES_WRITE: "properties.write",
  SUBSCRIPTIONS_READ: "subscriptions.read",
  SUBSCRIPTIONS_WRITE: "subscriptions.write",
  REFERRALS_READ: "referrals.read",
  REFERRALS_WRITE: "referrals.write",
  VERIFICATIONS_READ: "verifications.read",
  VERIFICATIONS_APPROVE: "verifications.approve",
  DOCUMENTS_READ: "documents.read",
  ANALYTICS_READ: "analytics.read",
});

/** Fail-closed: only '*' grants full access; empty/missing grants nothing. */
export function adminHasPermission(user, permission) {
  if (!user || user.role !== "admin") return false;
  const list = Array.isArray(user.admin_permissions) ? user.admin_permissions : [];
  if (list.includes(ADMIN_PERMISSION.ALL) || list.includes("*")) return true;
  if (!list.length) return false;
  return list.includes(permission);
}

/** True when the admin does not have the requested permission. */
export function adminLacksScopedPermission(user, permission) {
  if (!user || user.role !== "admin") return true;
  const list = Array.isArray(user.admin_permissions) ? user.admin_permissions : [];
  if (list.includes(ADMIN_PERMISSION.ALL) || list.includes("*")) return false;
  if (!list.length) return true;
  return !list.includes(permission);
}
