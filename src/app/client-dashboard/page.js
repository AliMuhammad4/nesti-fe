"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  DollarSign,
  Calendar,
  Target,
  Users,
  Loader2,
  AlertCircle,
  ChevronRight,
  Briefcase,
  Scale,
  Building2,
} from "lucide-react";
import { toast } from "react-toastify";

const PROFILE_COMPLETION_SECTIONS = [
  {
    id: "financial",
    title: "Financial Foundation",
    description: "Income and savings details used to understand readiness.",
    fields: [
      {
        key: "annual_income",
        label: "Annual Income",
        isComplete: (profile) => Number(profile?.annual_income) > 0,
      },
      {
        key: "employment_status",
        label: "Employment Status",
        isComplete: (profile) => Boolean(profile?.employment_status),
      },
      {
        key: "current_savings",
        label: "Current Savings",
        isComplete: (profile) =>
          profile?.current_savings !== null &&
          profile?.current_savings !== undefined &&
          profile?.current_savings !== "",
      },
      {
        key: "monthly_savings",
        label: "Monthly Savings",
        isComplete: (profile) =>
          profile?.monthly_savings !== null &&
          profile?.monthly_savings !== undefined &&
          profile?.monthly_savings !== "",
      },
    ],
  },
  {
    id: "home",
    title: "Home Goals",
    description: "Target home price and preferred purchase timeline.",
    fields: [
      {
        key: "dream_home_price",
        label: "Target Home Price",
        isComplete: (profile) => Number(profile?.dream_home_price) > 0,
      },
      {
        key: "preferred_location",
        label: "Preferred Location",
        isComplete: (profile) => Boolean(profile?.preferred_location?.trim?.() || profile?.preferred_location),
      },
      {
        key: "purchase_timeline",
        label: "Purchase Timeline",
        isComplete: (profile) => Boolean(profile?.purchase_timeline),
      },
    ],
  },
];

const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "Not set";
  return `$${Math.round(n).toLocaleString()}`;
};

const formatTimeline = (value) => {
  if (!value) return "Not set";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatMonths = (value) => {
  if (value === null || value === undefined || value === "") return "Not set";
  const months = Number(value);
  if (!Number.isFinite(months)) return "Not set";
  if (months <= 0) return "Ready";
  return `${Math.ceil(months)} mo`;
};

export default function ClientDashboardPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const profileCompletion = useMemo(() => {
    if (!profile) {
      return {
        percentage: 0,
        completed: [],
        missing: [],
        sections: PROFILE_COMPLETION_SECTIONS.map((section) => ({
          ...section,
          completedCount: 0,
          totalCount: section.fields.length,
          fields: section.fields.map((field) => ({ ...field, complete: false })),
        })),
        total: PROFILE_COMPLETION_SECTIONS.reduce((sum, section) => sum + section.fields.length, 0),
      };
    }

    const sections = PROFILE_COMPLETION_SECTIONS.map((section) => {
      const fields = section.fields.map((field) => ({
        key: field.key,
        label: field.label,
        complete: field.isComplete(profile),
      }));

      return {
        ...section,
        fields,
        completedCount: fields.filter((field) => field.complete).length,
        totalCount: fields.length,
      };
    });

    const completed = sections.flatMap((section) => section.fields.filter((field) => field.complete));
    const missing = sections.flatMap((section) => section.fields.filter((field) => !field.complete));
    const total = sections.reduce((sum, section) => sum + section.totalCount, 0);
    const percentage = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    return { percentage, completed, missing, sections, total };
  }, [profile]);

  // Handle hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Handle authentication and role checks
  useEffect(() => {
    if (!hydrated) return;
    
    // Check authentication
    if (!token) {
      router.push('/log-in');
      return;
    }
    
    // Verify user is a client
    if (user?.role && user.role !== 'client') {
      router.push('/dashboard');
      return;
    }
    
    fetchClientData();
  }, [hydrated, token, user?.role]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/profile/me`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      const profileData = await profileRes.json();

      if (profileData.success) {
        setProfile(profileData.data);
      }

    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" />
          <p className="mt-4 text-sm text-gray-600 sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const clientDisplayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.name ||
    "there";
  const currentSavings =
    profile?.current_savings !== null &&
    profile?.current_savings !== undefined &&
    profile?.current_savings !== ""
      ? Number(profile.current_savings)
      : null;
  const dreamHomePrice = Number(profile?.dream_home_price || 0);
  const monthlySavings =
    profile?.monthly_savings !== null &&
    profile?.monthly_savings !== undefined &&
    profile?.monthly_savings !== ""
      ? Number(profile.monthly_savings)
      : null;
  const downPaymentGoal = dreamHomePrice > 0 ? Math.round(dreamHomePrice * 0.2) : null;
  const remainingAmount =
    currentSavings !== null && downPaymentGoal !== null
      ? Math.max(0, downPaymentGoal - currentSavings)
      : null;
  const monthsToGoal =
    remainingAmount !== null
      ? remainingAmount <= 0
        ? 0
        : monthlySavings && monthlySavings > 0
          ? Math.ceil(remainingAmount / monthlySavings)
          : null
      : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(52,199,89,0.18),transparent_30%),linear-gradient(135deg,#F3FBF6_0%,#EAF8EF_42%,#F8FFFB_100%)] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-2xl border border-white/70 bg-white/72 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl"
        >
          <div className="relative p-5 sm:p-6">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  Client Dashboard
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  Welcome back, {clientDisplayName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  Keep your buying goals, savings progress, and professional connections organized in one clean workspace.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {profileCompletion.percentage < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.04 }}
            className="flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 ring-1 ring-amber-200">
                <AlertCircle size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-950">
                  Complete your profile to improve your matches
                </p>
                <p className="mt-0.5 text-xs leading-5 text-gray-600">
                  {profileCompletion.percentage}% complete. Missing{" "}
                  {profileCompletion.missing.slice(0, 2).map((item) => item.label).join(", ")}
                  {profileCompletion.missing.length > 2 ? ` and ${profileCompletion.missing.length - 2} more` : ""}.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/settings?tab=personal")}
              className="shrink-0 rounded-lg bg-gray-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
            >
              Complete Now
            </button>
          </motion.div>
        )}

        <div className="grid gap-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            id="progress"
            className="rounded-2xl border border-white/70 bg-white/72 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.055)] backdrop-blur-xl sm:p-6"
          >
            <div className="mb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  Financial Snapshot
                </p>
                <h2 className="mt-1 text-lg font-bold text-gray-950 sm:text-xl">
                  Homeownership Goals
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your latest savings, target down payment, and purchase timeline.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Current Savings",
                  value: formatCurrency(currentSavings),
                  helper: "Saved so far",
                  Icon: DollarSign,
                },
                {
                  label: "Down Payment Goal",
                  value: formatCurrency(downPaymentGoal),
                  helper: "20% of target price",
                  Icon: Target,
                },
                {
                  label: "Monthly Savings",
                  value: formatCurrency(monthlySavings),
                  helper: "Saved each month",
                  Icon: DollarSign,
                },
                {
                  label: "Months to Goal",
                  value: formatMonths(monthsToGoal),
                  helper: monthlySavings && monthlySavings > 0 ? "Based on monthly savings" : "Add monthly savings",
                  Icon: Calendar,
                },
              ].map(({ label, value, helper, Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/70 bg-gradient-to-br from-white/85 to-primary/[0.035] p-3.5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:border-primary/20 hover:bg-white/95 hover:shadow-sm"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
                    <Icon size={16} />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">{label}</div>
                  <div className="mt-1 text-xl font-bold text-gray-950">{value}</div>
                  <p className="mt-1 text-xs text-gray-400">{helper}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid gap-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-2xl border border-white/70 bg-white/72 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.055)] backdrop-blur-xl"
          >
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Next Steps</p>
              <h2 className="mt-1 text-base font-bold text-gray-950">Continue Your Journey</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Browse Properties",
                  helper: "View available homes",
                  href: "/client-dashboard/properties",
                  Icon: Building2,
                  tone: "text-primary bg-primary/8",
                },
                {
                  title: "Find an Agent",
                  helper: "Connect with top agents",
                  href: "/professionals?role=agent",
                  Icon: Users,
                  tone: "text-emerald-600 bg-emerald-50",
                },
                {
                  title: "Find a Lawyer",
                  helper: "Get legal guidance",
                  href: "/professionals?role=lawyer",
                  Icon: Scale,
                  tone: "text-indigo-600 bg-indigo-50",
                },
                {
                  title: "Get Pre-Approved",
                  helper: "Talk to mortgage brokers",
                  href: "/professionals?role=mortgage_broker",
                  Icon: Briefcase,
                  tone: "text-blue-600 bg-blue-50",
                },
              ].map(({ title, helper, href, Icon, tone }) => (
                <button
                  key={title}
                  onClick={() => router.push(href)}
                  className="group flex items-center justify-between rounded-xl border border-white/70 bg-gradient-to-br from-white/90 to-primary/[0.035] p-3.5 text-left shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:border-primary/20 hover:bg-white"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-gray-950">{title}</span>
                      <span className="block truncate text-xs text-gray-500">{helper}</span>
                    </span>
                  </span>
                  <ChevronRight size={18} className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
