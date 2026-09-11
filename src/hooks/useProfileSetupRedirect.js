"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store";
import { useProfileQuery } from "@/hooks/useAuthApi";
import {
  isRouteAllowedDuringSetup,
  isProfileSetupLocked,
  isPrivateWorkspaceRoute,
} from "@/lib/profileSetupGate";

/**
 * Sends agents / brokers / lawyers to Settings until personal + business basics exist (matches backend gate).
 * Scoped EXCLUSIVELY to private workspace routes so public marketing, landing pages,
 * blogs, documentation, and terms are completely unrestricted.
 */
export function useProfileSetupRedirect(isMounted) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const allowedPath = isRouteAllowedDuringSetup(pathname);
  const { data: profileData, isSuccess, isPending } = useProfileQuery({
    enabled: !allowedPath,
  });
  const toastShownRef = useRef(false);

  const isLocked = isProfileSetupLocked(user, profileData, isSuccess);

  useEffect(() => {
    if (!isLocked) {
      toastShownRef.current = false;
    }
  }, [isLocked]);

  useEffect(() => {
    if (!isMounted || !token) return;
    if (isPending || !isSuccess) return;
    if (!isLocked) return;

    // Do NOT guard or intercept public marketing, landing pages, blogs, or documentation
    if (!isPrivateWorkspaceRoute(pathname)) return;
    if (isRouteAllowedDuringSetup(pathname)) return;

    if (!toastShownRef.current) {
      toastShownRef.current = true;
      toast.info("Complete your personal and business information in Settings to unlock the workspace.", {
        toastId: "profile-setup-required",
      });
    }
    router.replace("/settings?tab=personal&setup=required");
  }, [isMounted, token, isPending, isSuccess, isLocked, pathname, router]);
}
