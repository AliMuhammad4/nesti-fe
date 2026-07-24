"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

const GUIDE_STEPS = [
  {
    id: "personal_details",
    navTitle: "Personal details",
    title: "Complete your personal and contact details",
    body: "Start with the information professionals need to communicate with you comfortably and securely.",
    guidance: [
      "Confirm your name, phone number, preferred language, and contact method.",
      "Choose the best time for professionals to reach you.",
    ],
    detail: "Accurate contact preferences help matched professionals follow up in the way and at the time you prefer.",
    href: "/settings?tab=personal",
    actionLabel: "Open Personal Settings",
  },
  {
    id: "home_profile",
    navTitle: "Home profile",
    title: "Define your home goals and readiness",
    body: "Add your budget, preferred areas, purchase timeline, financing status, and the features that matter most.",
    guidance: [
      "Complete your financial foundation and target home price.",
      "Add preferred locations, timeline, and home requirements.",
    ],
    detail: "Nesti uses these details to improve property suggestions, professional matching, and the context included with inquiries.",
    href: "/settings?tab=professional",
    actionLabel: "Complete Home Profile",
  },
  {
    id: "properties",
    navTitle: "Browse properties",
    title: "Search and review available properties",
    body: "Browse listings, compare key details, and open a property page when you want to learn more.",
    guidance: [
      "Search by the location that matches your plans.",
      "Review property details before starting an inquiry.",
    ],
    detail: "Beginning with a focused search makes it easier to compare opportunities and gives professionals useful property context.",
    href: "/client-dashboard/properties",
    actionLabel: "Browse Properties",
  },
  {
    id: "recommendations",
    navTitle: "Find professionals",
    title: "Review your AI-recommended professionals",
    body: "See agents, mortgage brokers, and lawyers matched to your preferences, goals, and communication needs.",
    guidance: [
      "Review compatibility factors and professional experience.",
      "Open profiles to compare services, locations, and working styles.",
    ],
    detail: "Recommendations become more relevant as your client profile becomes more complete.",
    href: "/professionals?recommended=1",
    actionLabel: "View Recommendations",
  },
  {
    id: "contact",
    navTitle: "Start an inquiry",
    title: "Contact the right professional",
    body: "Open a professional profile to ask questions, submit a role-specific inquiry, or begin a conversation.",
    guidance: [
      "Choose the professional whose role matches your current need.",
      "Share enough detail to receive a focused response.",
    ],
    detail: "Your saved client profile can provide useful context while the inquiry captures the details specific to this request.",
    href: "/professionals?recommended=1",
    actionLabel: "Choose a Professional",
  },
  {
    id: "inquiries",
    navTitle: "Track inquiries",
    title: "Track inquiries and continue conversations",
    body: "Use My Inquiries to review requests, check their status, and continue messaging professionals.",
    guidance: [
      "Open an inquiry to review its latest activity.",
      "Use the conversation drawer to send follow-up messages.",
    ],
    detail: "Keeping property and professional conversations together makes your next steps easier to follow.",
    href: "/client-dashboard/inquiries",
    actionLabel: "Open My Inquiries",
  },
  {
    id: "progress",
    navTitle: "Review progress",
    title: "Review your homeownership progress",
    body: "Use the progress report to understand profile readiness, savings goals, and the next actions in your journey.",
    guidance: [
      "Review savings progress against your down-payment goal.",
      "Return to incomplete profile areas when your plans change.",
    ],
    detail: "Your dashboard becomes a useful planning tool when financial progress, preferences, and conversations stay current.",
    href: "/client-dashboard/progress",
    actionLabel: "View Progress Report",
  },
];

export default function ClientDashboardStartGuide({ onDismiss }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => Math.max(0, index - 1));
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => Math.min(GUIDE_STEPS.length - 1, index + 1));
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const activeStep = GUIDE_STEPS[activeIndex];
  const isLastStep = activeIndex === GUIDE_STEPS.length - 1;
  const progressPercent = `${((activeIndex + 1) / GUIDE_STEPS.length) * 100}%`;
  const goToIndex = (index) => {
    setActiveIndex(Math.max(0, Math.min(GUIDE_STEPS.length - 1, index)));
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-primary/15 bg-white/95 shadow-sm ring-1 ring-primary/[0.03]">
        <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-text-heading">New to your client workspace?</h2>
            <p className="mt-0.5 max-w-none text-xs leading-5 text-text-muted lg:whitespace-nowrap">
              Follow a guided path from completing your profile to finding properties, professionals, inquiries, and progress.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-dark"
            >
              <Sparkles size={14} />
              Open user guide
            </button>
            <button
              type="button"
              onClick={() => onDismiss?.("dismissed")}
              className="inline-flex h-9 items-center rounded-xl border border-border bg-white px-3.5 text-xs font-semibold text-text-muted transition hover:bg-slate-50 hover:text-text-heading"
            >
              Hide
            </button>
          </div>
        </div>
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/30 px-4 py-6 lg:left-60">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} aria-hidden />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-dashboard-user-guide-title"
            className="relative z-[1] flex h-[36rem] max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] ring-1 ring-slate-950/[0.04]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-3.5">
              <div>
                <h2 id="client-dashboard-user-guide-title" className="text-lg font-semibold tracking-tight text-text-heading">
                  Your client journey guide
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-text-muted">
                  Set up your profile, explore opportunities, connect with professionals, and track your progress.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-text-muted shadow-sm transition hover:bg-slate-50 hover:text-text-heading"
                aria-label="Close user guide"
              >
                <X size={15} />
              </button>
            </div>
            <div className="h-1 bg-slate-100" aria-hidden>
              <div className="h-full rounded-r-full bg-primary transition-all duration-300" style={{ width: progressPercent }} />
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[13.5rem_minmax(0,1fr)]">
              <aside className="min-h-0 overflow-hidden border-b border-slate-100 bg-slate-50/80 p-3 lg:border-b-0 lg:border-r">
                <div className="flex h-full min-h-0 flex-col justify-between gap-1">
                  {GUIDE_STEPS.map((step, index) => {
                    const active = index === activeIndex;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => goToIndex(index)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] transition ${
                          active
                            ? "bg-white text-primary-dark shadow-sm ring-1 ring-slate-200"
                            : "text-text-muted hover:bg-white hover:text-text-heading"
                        }`}
                      >
                        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px] font-bold ${
                          active ? "border-primary bg-primary text-white" : "border-border bg-white text-text-muted"
                        }`}>
                          {index + 1}
                        </span>
                        <span className="truncate font-semibold">{step.navTitle}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="min-h-0 overflow-y-auto p-5">
                <h3 className="text-lg font-semibold tracking-tight text-text-heading">{activeStep.title}</h3>
                <p className="mt-2 text-[12.5px] leading-5 text-text-body">{activeStep.body}</p>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">What to do</p>
                  <div className="mt-2 space-y-1.5">
                    {activeStep.guidance.map((item) => (
                      <div key={item} className="flex gap-2 text-[12px] leading-5 text-text-body">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-dark">Why this matters</p>
                  <p className="mt-1.5 text-[12.5px] leading-5 text-text-muted">{activeStep.detail}</p>
                </div>
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <Link
                    href={activeStep.href}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-sm transition hover:bg-primary-dark"
                  >
                    {activeStep.actionLabel}
                    <ArrowRight size={14} />
                  </Link>
                  {isLastStep ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onDismiss?.("completed");
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary/20 bg-white px-4 text-xs font-bold text-primary-dark"
                    >
                      <CheckCircle2 size={14} />
                      Finish guide
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3">
              <button
                type="button"
                onClick={() => goToIndex(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-text-heading disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                Back
              </button>
              <button
                type="button"
                onClick={() => goToIndex(activeIndex + 1)}
                disabled={isLastStep}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-text-heading disabled:opacity-40"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
