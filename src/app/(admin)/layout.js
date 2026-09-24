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
    <div className="admin-poppins min-h-screen">
      <AppChromeShell>
        <AdminGuard>
          <div className="w-full min-w-0">{children}</div>
        </AdminGuard>
      </AppChromeShell>
    </div>
  );
}
