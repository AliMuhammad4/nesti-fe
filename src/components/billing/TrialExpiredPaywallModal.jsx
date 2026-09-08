"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Crown, Lock, Sparkles, X, ArrowRight } from "lucide-react";
import { useAppSelector } from "@/store";
import { getUpgradeBillingRoute } from "@/lib/trialSubscriptionGate";

export default function TrialExpiredPaywallModal() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [modalState, setModalState] = useState({ isOpen: false, featureName: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleOpen = (e) => {
      setModalState({
        isOpen: true,
        featureName: e?.detail?.featureName || "",
      });
    };

    window.addEventListener("nesti:open-trial-expired-modal", handleOpen);
    return () => window.removeEventListener("nesti:open-trial-expired-modal", handleOpen);
  }, []);

  useEffect(() => {
    if (!modalState.isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setModalState((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalState.isOpen]);

  const handleClose = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleUpgrade = () => {
    handleClose();
    const upgradeRoute = getUpgradeBillingRoute(user);
    router.push(upgradeRoute);
  };

  if (!mounted) return null;

  const isClient = String(user?.role || "").toLowerCase() === "client";
  const featureName = modalState.featureName;

  const clientBenefits = [
    "Direct inquiry submissions to verified agents, brokers & lawyers",
    "Real-time property search, portfolio saves & match scoring",
    "Full milestone progress tracking for your home acquisition",
    "Direct messaging, document sharing & AI concierge",
  ];

  const proBenefits = [
    "AI-powered lead qualification & client intent scoring",
    "Automated follow-up workflows & client nurturing",
    "Complete pipeline tracking & performance analytics",
    "Direct client referral network & verified calendar booking",
  ];

  const benefits = isClient ? clientBenefits : proBenefits;

  return createPortal(
    <AnimatePresence>
      {modalState.isOpen ? (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-paywall-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-2xl"
          >
            {/* Header Ambient Glow */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-primary/5 px-6 pt-7 pb-6 border-b border-border/60">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-primary/20 blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-white">
                    <Crown size={24} className="drop-shadow-sm" />
                  </span>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 ring-1 ring-amber-500/25">
                      <Lock size={11} />
                      Trial Period Ended
                    </span>
                    <h2
                      id="trial-paywall-title"
                      className="mt-1 text-xl font-bold text-text-heading sm:text-2xl"
                    >
                      {featureName ? `Unlock ${featureName}` : "Subscribe to Continue"}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-black/5 hover:text-text-heading transition"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-3 text-sm text-text-body leading-relaxed">
                Your 3-day evaluation window has concluded. Choose an active subscription plan to restore full access and continue seamlessly.
              </p>
            </div>

            {/* Content Body */}
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                What you get with an active plan:
              </p>

              <ul className="mt-3 space-y-2.5">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-text-body">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-dark">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-body hover:bg-slate-50 transition"
                >
                  Remind Me Later
                </button>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:from-primary-dark hover:to-primary transition group"
                >
                  <span>View Subscription Plans</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
