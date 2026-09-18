"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import { useProfileQuery } from "@/hooks/useAuthApi";
import {
  isCredentialLocked,
  isRouteAllowedDuringCredentialLock,
} from "@/lib/credentialGate";
import { isProfileSetupLocked } from "@/lib/profileSetupGate";
import { isPrivateWorkspaceRoute } from "@/lib/profileSetupGate";

/**
 * Redirect professionals with incomplete credential verification away from
 * private workspace routes (except Settings / Verification).
 */
export function useCredentialRedirect() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const user = useAppSelector((state) => state.auth.user);
  const { data: profileData, isSuccess } = useProfileQuery();

  useEffect(() => {
    if (!isSuccess || !user) return;
    if (isProfileSetupLocked(user, profileData, isSuccess)) return;
    if (!isCredentialLocked(user, profileData, isSuccess)) return;
    if (!isPrivateWorkspaceRoute(pathname)) return;
    if (isRouteAllowedDuringCredentialLock(pathname)) return;
    router.replace("/settings?tab=verification");
  }, [isSuccess, user, profileData, pathname, router]);
}
