"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store";

/**
 * Client-side auth presence guard.
 * Redirects to login when hydrated and there is no token.
 */
export function useAuthGuard({ redirect = true, redirectTo = "/log-in" } = {}) {
  const token = useAppSelector((state) => state.auth.token);
  const pathname = usePathname() || "";
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!redirect || !hydrated) return;
    if (token) return;
    if (
      pathname === "/log-in"
      || pathname === "/sign-up"
      || pathname.startsWith("/forgot-password")
      || pathname.startsWith("/verify-")
      || pathname.startsWith("/reset-password")
    ) {
      return;
    }
    router.replace(redirectTo);
  }, [redirect, hydrated, token, pathname, router, redirectTo]);

  return {
    isAuthenticated: hydrated && Boolean(token),
    token,
    profile: null,
    hydrated,
    isLoading: !hydrated,
  };
}
