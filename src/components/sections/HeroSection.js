"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Star,
  Home,
  Landmark,
  Scale,
  Globe2,
  Radar,
  Bot,
  MessageCircle,
  Users,
  BadgeCheck,
} from "lucide-react";

const capabilities = [
  {
    label: "Build your presence",
    note: "Website and professional profile",
    type: "Presence",
    Icon: Globe2,
  },
  {
    label: "Generate leads",
    note: "Capture high-intent demand",
    type: "Acquisition",
    Icon: Radar,
  },
  {
    label: "Qualify with AI",
    note: "Understand every opportunity",
    type: "AI decision",
    Icon: Bot,
  },
  {
    label: "Nurture",
    note: "Stay present automatically",
    type: "Automation",
    Icon: MessageCircle,
  },
  {
    label: "Grow your network",
    note: "Exchange trusted referrals",
    type: "Network",
    Icon: Users,
  },
  {
    label: "Close",
    note: "Turn relationships into business",
    type: "Outcome",
    Icon: BadgeCheck,
  },
];

const audiences = [
  { label: "Realtors & Agents", Icon: Home },
  { label: "Mortgage Brokers", Icon: Landmark },
  { label: "Real Estate Lawyers", Icon: Scale },
];

const professionalImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
];

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  const [activeCapability, setActiveCapability] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;

    const interval = window.setInterval(() => {
      setActiveCapability((current) => (current + 1) % capabilities.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[54rem] -translate-x-1/2 rounded-full bg-primary/[0.09] blur-[100px]" />
        <div className="absolute left-[8%] top-44 h-52 w-52 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-64 w-64 rounded-full bg-cyan-100/25 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[38rem] opacity-[0.18] [background-image:linear-gradient(rgba(16,185,129,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.12)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="py-12 md:py-16 lg:py-20">
          <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="flex flex-col items-start space-y-5 text-left lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[11px] sm:tracking-[0.22em]"
              suppressHydrationWarning
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
                <Sparkles size={13} className="relative" />
              </span>
              AI-powered growth platform for real estate professionals
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full text-[2rem] font-black leading-[1.08] tracking-[-0.035em] text-text-heading sm:text-[2.75rem] lg:text-[2.55rem] xl:text-[3rem]"
              suppressHydrationWarning
            >
              <span className="block xl:whitespace-nowrap">
                Your entire real estate business.
              </span>
              <span className="mt-1 block bg-gradient-to-r from-primary-dark via-primary to-emerald-400 bg-clip-text text-transparent xl:whitespace-nowrap">
                One intelligent platform.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="max-w-xl text-[15px] font-normal leading-7 text-text-heading/70 md:text-[17px] md:leading-7"
              suppressHydrationWarning
            >
              Nesti brings your website, CRM, lead generation, AI follow-up,
              networking and client matching together, so every visitor, lead
              and connection can become your next client.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="max-w-2xl border-l-2 border-primary/35 pl-4 text-[13px] font-semibold leading-6 text-text-heading/80 sm:text-sm"
              suppressHydrationWarning
            >
              Build your presence. Generate leads. Qualify with AI. Nurture every
              opportunity. Grow your network. Close more business.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row"
              suppressHydrationWarning
            >
              <Link
                href="/sign-up"
                className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-dark to-primary px-7 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-14px_rgba(16,185,129,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-14px_rgba(16,185,129,0.8)] sm:w-auto"
              >
                <span className="absolute inset-y-0 -left-20 w-14 skew-x-[-18deg] bg-white/20 blur-sm transition-transform duration-700 group-hover:translate-x-[18rem]" />
                <span className="relative">Start Free</span>
                <ArrowRight
                  size={17}
                  className="relative transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#how-it-works"
                className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-text-heading/[0.09] bg-white/50 px-6 text-sm font-semibold text-text-heading backdrop-blur-sm transition-all hover:border-primary/25 hover:bg-white/80 hover:text-primary sm:w-auto"
              >
                See How Nesti Works
                <ChevronRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1 text-sm text-text-body"
              suppressHydrationWarning
            >
              <span className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                Built for the people who move real estate forward
              </span>
              {audiences.map(({ label, Icon }, index) => (
                <span key={label} className="inline-flex items-center gap-2">
                  {index > 0 ? (
                    <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden />
                  ) : null}
                  <Icon size={14} className="text-primary" />
                  <span className="font-medium text-text-heading">{label}</span>
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.4, delay: 0.26 }}
              className="flex flex-wrap items-center gap-3 pt-1"
              suppressHydrationWarning
            >
              <div className="flex -space-x-2">
                {professionalImages.map((imageUrl, i) => (
                  <div
                    key={`professional-${i}`}
                    className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Professional ${i + 1}`}
                      width={32}
                      height={32}
                      className="object-cover"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-text-heading">10K+</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={`star-${i}`}
                      size={12}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-text-body">professionals</span>
              </div>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <span className="text-xs font-medium text-text-muted">
                Start with a 3-day free trial
              </span>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
            suppressHydrationWarning
          >
            <div className="relative py-1">
              <div className="relative">
                {capabilities.map(({ label, note, type, Icon }, index) => {
                  const isActive = activeCapability === index;
                  const isComplete = index < activeCapability;
                  const last = index === capabilities.length - 1;

                  return (
                    <div key={label} className="relative">
                      <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        animate={{
                          x: isActive && !reduceMotion ? 3 : 0,
                          y: isActive && !reduceMotion ? -1 : 0,
                          scale: isActive && !reduceMotion ? 1.01 : 1,
                        }}
                        transition={{
                          opacity: { duration: 0.35, delay: 0.15 + index * 0.07 },
                          x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                          y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                          scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                        }}
                        whileHover={{ x: 4 }}
                        className={`group relative grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-xl border px-3 py-2 shadow-[0_10px_26px_-22px_rgba(15,23,42,0.4)] backdrop-blur-xl transition-colors duration-300 ${
                          isActive
                            ? "border-primary/45 bg-white/85 ring-4 ring-primary/[0.06]"
                            : isComplete
                              ? "border-primary/20 bg-white/55"
                              : "border-white/80 bg-white/40"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-white ${
                            isComplete || isActive ? "bg-primary" : "bg-slate-300"
                          }`}
                        />
                        <span
                          aria-hidden
                          className={`absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-white ${
                            isActive ? "bg-primary" : "bg-slate-300"
                          }`}
                        />

                        <motion.span
                          className={`grid h-9 w-9 place-items-center rounded-xl border ${
                            isActive
                              ? "border-primary bg-primary text-white shadow-[0_8px_22px_-9px_rgba(16,185,129,0.9)]"
                              : "border-primary/15 bg-primary/[0.07] text-primary"
                          }`}
                          animate={
                            isActive && !reduceMotion
                              ? { rotate: [0, -4, 4, 0], scale: [1, 1.08, 1] }
                              : { rotate: 0, scale: 1 }
                          }
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                          <Icon size={16} strokeWidth={2} />
                        </motion.span>

                        <span className="min-w-0 text-left">
                          <span className="block text-[8px] font-bold uppercase tracking-[0.16em] text-primary/70">
                            {type}
                          </span>
                          <span
                            className={`mt-0.5 block text-[13px] font-bold leading-tight ${
                              isActive ? "text-primary-dark" : "text-text-heading"
                            }`}
                          >
                            {label}
                          </span>
                          <span className="mt-0.5 block text-[10px] leading-4 text-text-muted">
                            {note}
                          </span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.12em] ${
                            isActive ? "text-primary" : "text-text-muted/60"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive
                                ? "animate-pulse bg-primary"
                                : isComplete
                                  ? "bg-primary/60"
                                  : "bg-slate-300"
                            }`}
                          />
                          {isActive ? "Running" : isComplete ? "Done" : "Ready"}
                        </span>
                      </motion.div>

                      {!last ? (
                        <div className="relative mx-auto h-3 w-4">
                          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-300/60" />
                          <motion.span
                            className="absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 bg-primary"
                            animate={{
                              scaleY: isComplete || isActive ? 1 : 0,
                              opacity: isComplete || isActive ? 1 : 0,
                            }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

            </div>
          </motion.aside>
          </div>

        </div>
      </div>
    </section>
  );
}
