"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store";
import {
  ADMIN_PERMISSION,
  adminHasPermission,
  adminLacksScopedPermission,
} from "@/lib/adminPermissions";

/**
 * Reads `user.admin_permissions` from the auth store.
 * Empty / missing permissions grant nothing. Write controls are shown only
 * when the matching permission or the full-access wildcard is present.
 */
export function useAdminPermissions() {
  const user = useAppSelector((state) => state.auth.user);
  return useMemo(() => {
    const list = Array.isArray(user?.admin_permissions) ? user.admin_permissions : null;
    const hasScopedList = Boolean(list && list.length);
    return {
      user,
      permissions: list || [],
      hasScopedList,
      can: (permission) => adminHasPermission(user, permission),
      lacks: (permission) => adminLacksScopedPermission(user, permission),
    };
  }, [user]);
}

/** Convenience: hide write UI when the admin lacks the given write scope. */
export function useAdminCanWrite(permission = ADMIN_PERMISSION.PROFESSIONALS_WRITE) {
  const { lacks } = useAdminPermissions();
  return !lacks(permission);
}

export { ADMIN_PERMISSION };
