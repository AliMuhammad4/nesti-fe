"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppChromeShell from "../AppChromeShell";
import { useAppSelector } from "@/store";
import { getDashboardRoute } from "@/lib/roleUtils";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

function AdminGuard({ children }) {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  // Auth is hydrated from localStorage on the client only — wait until mount
  // so server HTML and the first client render match (avoids h1 hydration errors).
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/log-in");
      return;
    }
    if (user && String(user.role || "").toLowerCase() !== "admin") {
      router.replace(getDashboardRoute(user.role));
    }
  }, [ready, token, user, router]);

  if (!ready || !token || !user || String(user.role || "").toLowerCase() !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <WorkspaceLoader fullHeight={false} />
      </div>
    );
  }

  return children;
}

export default function AdminLayout({ children }) {
  return (
    <AppChromeShell>
      <AdminGuard>
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
          {children}
        </div>
      </AdminGuard>
    </AppChromeShell>
  );
}
