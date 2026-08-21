"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Magnet,
  Flame,
  MessageCircle,
  RefreshCw,
  Handshake,
  LineChart,
} from "lucide-react";

const assistants = [
  {
    icon: Magnet,
    title: "Lead Capture AI",
    description: "Turns visitors into conversations.",
    mode: "Capture",
  },
  {
    icon: Flame,
    title: "Lead Scoring AI",
    description: "Finds your hottest opportunities instantly.",
    mode: "Prioritize",
  },
  {
    icon: MessageCircle,
    title: "Conversation AI",
    description: "Answers questions and qualifies prospects 24/7.",
    mode: "Converse",
  },
  {
    icon: RefreshCw,
    title: "Follow-Up AI",
    description: "Re-engages leads before they disappear.",
    mode: "Re-engage",
  },
  {
    icon: Handshake,
    title: "Matching AI",
    description: "Connects clients with the right professional.",
    mode: "Match",
  },
  {
    icon: LineChart,
    title: "Growth AI",
    description: "Shows you where your next opportunities are.",
    mode: "Optimize",
  },
];

const pipeline = [
  { label: "Capture", note: "Visitor engaged" },
  { label: "Prioritize", note: "Intent scored" },
  { label: "Converse", note: "Questions answered" },
  { label: "Re-engage", note: "Follow-up active" },
  { label: "Match", note: "Best fit found" },
  { label: "Optimize", note: "Growth surfaced" },
];

export default function AIAssistantsSection() {
  const reduceMotion = useReducedMotion();
  const [activeAssistant, setActiveAssistant] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;

    const interval = window.setInterval(() => {
      setActiveAssistant((current) => (current + 1) % assistants.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <section className="relative overflow-hidden bg-transparent py-10 md:py-14">
      <div className="pointer-events-none absolute left-[12%] top-20 h-72 w-72 rounded-full bg-primary/[0.08] blur-[100px]" />
      <div className="pointer-events-none absolute right-[10%] top-1/3 h-64 w-64 rounded-full bg-cyan-100/25 blur-[100px]" />
      <div className="relative mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="mx-auto mb-8 max-w-5xl text-center md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.3 }}
            suppressHydrationWarning
          >
            <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Activity size={13} />
              AI that works in the background
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.3 }}
            className="mb-3 text-2xl font-black leading-tight text-text-heading md:text-3xl xl:whitespace-nowrap xl:text-4xl"
            suppressHydrationWarning
          >
            Your AI Team Works While You{" "}
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Work With Clients.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-none text-[15px] leading-7 text-text-heading/80 md:text-[17px] xl:whitespace-nowrap"
            suppressHydrationWarning
          >
            Specialized agents capture, score, converse, follow up, match and surface
            growth, keeping the pipeline moving while you close.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assistants.map((assistant, index) => {
            const IconComponent = assistant.icon;
            const isActive = activeAssistant === index;
            return (
              <motion.article
                key={assistant.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className={`group relative h-full overflow-hidden rounded-2xl border bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(244,253,249,0.74))] p-5 backdrop-blur-xl transition-all duration-500 ${
                  isActive
                    ? "border-primary/40 shadow-[0_20px_55px_-30px_rgba(16,185,129,0.7)] ring-4 ring-primary/[0.05]"
                    : "border-white/90 shadow-[0_14px_38px_-30px_rgba(15,23,42,0.3)] hover:border-primary/20"
                }`}
                suppressHydrationWarning
              >
                <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/[0.08] blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <motion.div
                    className={`grid h-11 w-11 place-items-center rounded-xl border ${
                      isActive
                        ? "border-primary bg-primary text-white shadow-[0_8px_24px_-10px_rgba(16,185,129,0.9)]"
                        : "border-primary/15 bg-primary/[0.07] text-primary"
                    }`}
                    animate={
                      isActive && !reduceMotion
                        ? { scale: [1, 1.09, 1], rotate: [0, -4, 4, 0] }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <IconComponent size={20} />
                  </motion.div>
                  <h3
                    className={`text-[15px] font-black md:text-base ${
                      isActive ? "text-primary-dark" : "text-text-heading"
                    }`}
                  >
                    {assistant.title}
                  </h3>
                </div>
                <p className="relative mt-3 text-sm leading-6 text-text-body">
                  {assistant.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.3 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-white/90 bg-white/55 p-5 shadow-[0_22px_70px_-45px_rgba(15,23,42,0.35)] ring-1 ring-primary/10 backdrop-blur-xl md:p-6"
          suppressHydrationWarning
        >
          <div className="relative space-y-2 lg:hidden">
            <span className="pointer-events-none absolute bottom-5 left-4 top-5 w-px bg-primary/15" />
            {pipeline.map((stage, index) => {
              const reached = index <= activeAssistant;
              const current = index === activeAssistant;

              return (
                <motion.div
                  key={`mobile-${stage.label}`}
                  animate={{
                    x: current && !reduceMotion ? 3 : 0,
                    scale: current && !reduceMotion ? 1.01 : 1,
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    current
                      ? "border-primary/35 bg-white shadow-[0_12px_28px_-22px_rgba(16,185,129,0.8)]"
                      : reached
                        ? "border-primary/15 bg-white/80"
                        : "border-white/80 bg-white/55"
                  }`}
                >
                  <motion.span
                    className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-white ${
                      reached ? "bg-primary" : "bg-slate-300"
                    }`}
                    animate={
                      current && !reduceMotion
                        ? { boxShadow: ["0 0 0 0 rgba(16,185,129,0.15)", "0 0 0 6px rgba(16,185,129,0)"] }
                        : { boxShadow: "0 0 0 0 rgba(16,185,129,0)" }
                    }
                    transition={{
                      duration: 1.8,
                      repeat: current && !reduceMotion ? Infinity : 0,
                      ease: "easeOut",
                    }}
                  >
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </motion.span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-bold ${
                        current ? "text-primary-dark" : "text-text-heading"
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-muted">
                      {stage.note}
                    </span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-primary/65">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <div className="-mx-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="relative mx-auto grid min-w-[760px] grid-cols-6 gap-0">
              <span className="absolute left-[8.33%] right-[8.33%] top-2 h-px bg-primary/15" />
              <motion.span
                className="absolute left-[8.33%] top-2 h-px origin-left bg-primary shadow-[0_0_8px_rgba(16,185,129,0.55)]"
                animate={{
                  width: `${(activeAssistant / Math.max(pipeline.length - 1, 1)) * 83.34}%`,
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              {pipeline.map((stage, index) => {
                const reached = index <= activeAssistant;
                const current = index === activeAssistant;
                return (
                  <div
                    key={stage.label}
                    className="relative flex flex-col items-center text-center"
                  >
                    <motion.span
                      className={`relative z-10 h-4 w-4 rounded-full border-2 border-white ${
                        reached
                          ? "bg-primary shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
                          : "bg-slate-300"
                      }`}
                      animate={
                        current && !reduceMotion
                          ? { scale: [1, 1.3, 1] }
                          : { scale: 1 }
                      }
                      transition={{
                        duration: 1.8,
                        repeat: current && !reduceMotion ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                    />
                    <span
                      className={`mt-3 text-xs font-bold ${
                        current ? "text-primary" : "text-text-heading"
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-text-muted">
                      {stage.note}
                    </span>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
