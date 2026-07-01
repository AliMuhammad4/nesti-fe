"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardProfessionalsTabs from "@/components/dashboard/DashboardProfessionalsTabs";

const ALLOWED_ROLES = new Set(["agent", "lawyer", "mortgage_broker"]);

function ProfessionalsPageContent() {
  const { isAuthenticated } = useAuthGuard();
  const token = useAppSelector((state) => state.auth.token);
  const searchParams = useSearchParams();
  const useRecommendations = String(searchParams?.get("recommended") || "") === "1";
  const role = useMemo(() => {
    const raw = String(searchParams?.get("role") || "").trim().toLowerCase();
    if (useRecommendations && !ALLOWED_ROLES.has(raw)) return "all";
    return ALLOWED_ROLES.has(raw) ? raw : "agent";
  }, [searchParams, useRecommendations]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col bg-gradient-to-br from-slate-50/80 via-white to-primary/[0.04] px-4 py-5">
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <DashboardProfessionalsTabs
          token={token}
          initialRole={role}
          showTabs
          paginationOutside
        />
      </div>
    </div>
  );
}

export default function ProfessionalsPage() {
  return (
    <Suspense fallback={null}>
      <ProfessionalsPageContent />
    </Suspense>
  );
}
