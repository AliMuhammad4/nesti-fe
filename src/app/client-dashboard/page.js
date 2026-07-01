"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  Calendar,
  ChevronRight,
  Building2,
  Loader2,
  MapPin,
  Home,
  TrendingUp,
  ClipboardList,
  Users,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  ProfileSectionsBarChart,
  SavingsDonutChart,
  SavingsProjectionChart,
} from "@/components/client-dashboard/ClientDashboardCharts";

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
    description: "Goal, budget, location, and purchase timeline.",
    fields: [
      {
        key: "home_goal",
        label: "Home Goal",
        isComplete: (profile) => Boolean(profile?.home_goal) || (Array.isArray(profile?.home_goals) && profile.home_goals.length > 0),
      },
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
  {
    id: "preferences",
    title: "Match Preferences",
    description: "Signals used for AI professional compatibility.",
    fields: [
      {
        key: "working_styles",
        label: "Working Style",
        isComplete: (profile) => Array.isArray(profile?.working_styles) && profile.working_styles.length > 0,
      },
      {
        key: "priority_tags",
        label: "What Matters Most",
        isComplete: (profile) => Array.isArray(profile?.priority_tags) && profile.priority_tags.length > 0,
      },
      {
        key: "languages",
        label: "Languages",
        isComplete: (profile) => Array.isArray(profile?.languages) && profile.languages.length > 0,
      },
      {
        key: "preferred_experience",
        label: "Preferred Experience",
        isComplete: (profile) => Boolean(profile?.preferred_experience),
      },
    ],
  },
  {
    id: "contact",
    title: "Contact Preference",
    description: "How and when professionals should contact you.",
    fields: [
      {
        key: "preferred_contact_method",
        label: "Preferred Contact Method",
        isComplete: (profile) => Boolean(profile?.preferred_contact_method),
      },
      {
        key: "best_time_to_contact",
        label: "Best Time to Contact",
        isComplete: (profile) => Boolean(profile?.best_time_to_contact),
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

const formatLabel = (value) => {
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
  const [chartsReady, setChartsReady] = useState(false);

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

  const fetchClientData = useCallback(async () => {
    if (!token) return;
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
  }, [token]);

  // Handle hydration
  useEffect(() => {
    setHydrated(true);
    setChartsReady(true);
  }, []);

  // Handle authentication and role checks
  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.push('/log-in');
      return;
    }

    if (user?.role && user.role !== 'client') {
      router.push('/dashboard');
      return;
    }

    fetchClientData();
  }, [fetchClientData, hydrated, router, token, user?.role]);

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
  const missingFieldsPreview = profileCompletion.missing.slice(0, 3).map((item) => item.label);
  const topPriorityTags = Array.isArray(profile?.priority_tags) ? profile.priority_tags.slice(0, 4) : [];
  const PRIMARY_COLOR = "#16a34a";

  const journeySteps = [
    {
      title: "Browse Properties",
      helper: "Explore listings that match your budget and location",
      href: "/client-dashboard/properties",
      Icon: Building2,
    },
    {
      title: "Find Professionals",
      helper: "See AI-recommended agents, lawyers, and brokers",
      href: "/professionals?recommended=1",
      Icon: Users,
    },
    {
      title: "My Inquiries",
      helper: "Track property and professional conversations",
      href: "/client-dashboard/inquiries",
      Icon: ClipboardList,
    },
    {
      title: "Messages",
      helper: "Continue chats with your matched professionals",
      href: "/conversations",
      Icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen w-full px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Client dashboard</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              Welcome back, {clientDisplayName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Savings, goals, and your next actions in one view.</p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-gray-200/80 bg-white px-3 py-2.5">
            <div className="relative grid h-12 w-12 place-items-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${PRIMARY_COLOR} ${profileCompletion.percentage * 3.6}deg, #f1f5f9 0deg)`,
                }}
              />
              <div className="relative grid h-9 w-9 place-items-center rounded-full bg-white text-[11px] font-semibold text-primary">
                {profileCompletion.percentage}%
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900">Profile ready</p>
              <p className="truncate text-[11px] text-gray-500">
                {profileCompletion.percentage >= 100
                  ? "Ready for AI matching"
                  : `Missing ${missingFieldsPreview.join(", ")}${profileCompletion.missing.length > 3 ? "…" : ""}`}
              </p>
              {profileCompletion.percentage < 100 ? (
                <button
                  type="button"
                  onClick={() => router.push("/settings?tab=personal")}
                  className="mt-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  Complete profile
                </button>
              ) : null}
            </div>
          </div>
        </motion.header>

        <div className="grid gap-4 lg:grid-cols-3">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.03 }}
            id="progress"
            className="rounded-lg border border-gray-200/80 bg-white lg:col-span-2"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Homeownership progress</h2>
                <p className="text-xs text-gray-500">Target {formatCurrency(dreamHomePrice || null)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 sm:grid-cols-4">
              {[
                { label: "Saved", value: formatCurrency(currentSavings) },
                { label: "Down payment", value: formatCurrency(downPaymentGoal) },
                { label: "Monthly", value: formatCurrency(monthlySavings) },
                { label: "To goal", value: formatMonths(monthsToGoal) },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div className="px-4 py-3">
                {chartsReady ? (
                  <SavingsDonutChart currentSavings={currentSavings} downPaymentGoal={downPaymentGoal} />
                ) : (
                  <div className="h-[190px] animate-pulse rounded bg-gray-50" />
                )}
              </div>
              <div className="px-4 py-3">
                {chartsReady ? (
                  <SavingsProjectionChart
                    currentSavings={currentSavings}
                    monthlySavings={monthlySavings}
                    downPaymentGoal={downPaymentGoal}
                  />
                ) : (
                  <div className="h-[190px] animate-pulse rounded bg-gray-50" />
                )}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="rounded-lg border border-gray-200/80 bg-white"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Your goals</h2>
            </div>
            <div className="divide-y divide-gray-100 px-4">
              {[
                { label: "Home goal", value: formatLabel(profile?.home_goal), Icon: Home },
                { label: "Location", value: profile?.preferred_location || "Not set", Icon: MapPin },
                { label: "Timeline", value: formatTimeline(profile?.purchase_timeline), Icon: Calendar },
                { label: "Experience", value: formatLabel(profile?.preferred_experience), Icon: TrendingUp },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center gap-2.5 py-2.5">
                  <Icon size={14} className="shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="truncate text-sm font-medium text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {topPriorityTags.length ? (
              <div className="border-t border-gray-100 px-4 py-3">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">Priorities</p>
                <div className="flex flex-wrap gap-1.5">
                  {topPriorityTags.map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {formatLabel(tag)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.07 }}
            className="rounded-lg border border-gray-200/80 bg-white"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Match signal strength</h2>
              <p className="text-xs text-gray-500">Profile areas used for recommendations</p>
            </div>
            <div className="px-2 py-3">
              {chartsReady ? (
                <ProfileSectionsBarChart sections={profileCompletion.sections} />
              ) : (
                <div className="h-[200px] animate-pulse rounded bg-gray-50" />
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.09 }}
            className="rounded-lg border border-gray-200/80 bg-white"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Next steps</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {journeySteps.map(({ title, helper, href, Icon }) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => router.push(href)}
                  className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50/80"
                >
                  <Icon size={16} className="shrink-0 text-gray-400 group-hover:text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gray-900">{title}</span>
                    <span className="block truncate text-xs text-gray-500">{helper}</span>
                  </span>
                  <ChevronRight size={15} className="shrink-0 text-gray-300 group-hover:text-primary" />
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button
                type="button"
                onClick={() => router.push("/client-dashboard/progress")}
                className="text-xs font-medium text-gray-500 transition hover:text-primary"
              >
                View progress report →
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
