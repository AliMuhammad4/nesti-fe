"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useAppSelector } from "@/store";
import { useProfileQuery } from "@/hooks/useAuthApi";
import { isProfileSetupLocked } from "@/lib/profileSetupGate";
import { isPublicMarketingRoute } from "@/lib/publicRoutes";

const DISMISS_KEY = "nesti_incomplete_profile_banner_dismissed";

export default function IncompleteProfileBanner() {
  const pathname = usePathname() || "";
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const { data: profileData, isSuccess } = useProfileQuery();

  const [isMounted, setIsMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== "undefined" && window.sessionStorage.getItem(DISMISS_KEY) === "true") {
        setIsDismissed(true);
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(DISMISS_KEY, "true");
      }
    } catch {
      // ignore storage access errors
    }
  };

  // Only show when mounted, logged in, and profile setup is genuinely incomplete
  if (!isMounted || !token || isDismissed) return null;

  const isLocked = isProfileSetupLocked(user, profileData, isSuccess);
  if (!isLocked) return null;

  // Show banner exclusively on public marketing and informational routes
  const isPublicPage = isPublicMarketingRoute(pathname);
  if (!isPublicPage) return null;

  return (
    <div
      role="region"
      aria-label="Workspace Setup Reminder"
      className="relative z-50 border-b border-amber-300/60 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-primary/15 px-3.5 py-2 text-amber-950 backdrop-blur-md transition-all sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-800 shadow-sm ring-1 ring-amber-500/30">
            <Sparkles size={13} className="text-amber-700" />
          </span>
          <p className="truncate text-xs font-medium text-amber-950 sm:text-sm">
            <span className="font-bold text-amber-900">Setup Incomplete:</span> Finish your workspace setup to unlock full access to client management, nurture, and analytics.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/settings?tab=personal&setup=required"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-3 py-1 text-xs font-bold text-white shadow-sm shadow-primary/20 transition hover:from-primary-dark hover:to-primary hover:shadow"
          >
            <span>Return to Setup</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md p-1 text-amber-800/80 hover:bg-amber-200/50 hover:text-amber-950 transition"
            title="Dismiss for this session"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
