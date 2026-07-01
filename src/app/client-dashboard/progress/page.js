"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  Loader2,
  DollarSign,
  Target,
  Calendar,
  Home,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ClientProgressPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setHydrated(true);
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
    
    fetchProfile();
  }, [hydrated, token, user?.role]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" />
          <p className="mt-4 text-sm text-gray-600 sm:text-base">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">No Progress Data</h2>
          <p className="mt-2 text-gray-600">Complete your profile to start tracking progress</p>
          <button
            onClick={() => router.push('/client-dashboard')}
            className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const dreamHomePrice = Number(profile.dream_home_price || 0);
  const downPaymentGoal = dreamHomePrice > 0 ? Math.round(dreamHomePrice * 0.2) : 0;
  const currentSavings = Number(profile.current_savings || 0);
  const monthlySavings = Number(profile.monthly_savings || 0);
  const remainingAmount = Math.max(0, downPaymentGoal - currentSavings);
  const monthsToGoal =
    remainingAmount <= 0 ? 0 : monthlySavings > 0 ? Math.ceil(remainingAmount / monthlySavings) : null;
  const monthlyIncome = profile.annual_income ? Math.round(Number(profile.annual_income) / 12) : 0;
  const savingsRate = monthlyIncome > 0 && monthlySavings > 0
    ? ((monthlySavings / monthlyIncome) * 100).toFixed(1)
    : 0;

  const formatCurrency = (value) => `$${Math.round(Number(value) || 0).toLocaleString()}`;
  const formatMonths = (value) => {
    if (value === null || value === undefined) return "Not set";
    if (Number(value) <= 0) return "Ready";
    return `${value} mo`;
  };

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
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  Homeownership Journey
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  Track your savings, timeline, and target home details in one polished view.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 xl:grid-cols-4">
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
              helper: `${savingsRate}% of monthly income`,
              Icon: DollarSign,
            },
            {
              label: "Months to Goal",
              value: formatMonths(monthsToGoal),
              helper: monthlySavings > 0 ? "Based on monthly savings" : "Add monthly savings",
              Icon: Calendar,
            },
          ].map(({ label, value, helper, Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.04 }}
              className="rounded-2xl border border-white/70 bg-gradient-to-br from-white/90 to-primary/[0.035] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <Icon size={17} />
              </div>
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <p className="mt-1 text-xl font-bold text-gray-950">{value}</p>
              <p className="mt-1 text-xs text-gray-400">{helper}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="rounded-2xl border border-white/70 bg-white/72 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.055)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <h3 className="text-base font-bold text-gray-950">Timeline</h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/70 bg-gradient-to-br from-white/90 to-primary/[0.035] p-4">
                <p className="text-xs font-semibold text-gray-500">Estimated Time to Goal</p>
                <div className="mt-1 text-2xl font-bold text-gray-950">{formatMonths(monthsToGoal)}</div>
                <p className="mt-1 text-xs text-gray-400">
                  {monthsToGoal === null
                    ? "Add monthly savings in your profile to estimate this"
                    : "Based on your current monthly savings"}
                </p>
              </div>
              {profile.purchase_timeline && (
                <div className="rounded-xl border border-white/70 bg-white/80 p-4">
                  <p className="text-xs font-semibold text-gray-500">Preferred Timeline</p>
                  <div className="mt-1 text-lg font-bold capitalize text-gray-950">
                    {profile.purchase_timeline.replace(/_/g, ' ')}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="rounded-2xl border border-white/70 bg-white/72 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.055)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <Home size={20} className="text-primary" />
              <h3 className="text-base font-bold text-gray-950">Dream Home</h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/70 bg-gradient-to-br from-white/90 to-primary/[0.035] px-4 py-3">
                <div className="mb-1 text-xs font-semibold text-gray-500">Target Price</div>
                <div className="text-2xl font-bold text-gray-950">
                  {formatCurrency(profile.dream_home_price)}
                </div>
              </div>
              {profile.preferred_location && (
                <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3">
                  <div className="mb-1 text-xs font-semibold text-gray-500">Preferred Location</div>
                  <div className="flex items-center gap-2 font-semibold text-gray-950">
                    <MapPin size={16} className="text-gray-500" />
                    {profile.preferred_location}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
