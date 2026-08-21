"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  CalendarCheck2,
  Flame,
  MessageCircle,
  MousePointerClick,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import HorizontalJourneyTimeline from "./HorizontalJourneyTimeline";

const pipeline = [
  { label: "Visitor", note: "Arrives on your site", type: "Trigger", Icon: MousePointerClick },
  { label: "Lead", note: "Starts a conversation", type: "Capture", Icon: MessageCircle },
  { label: "Qualified", note: "Intent is understood", type: "AI router", Icon: ScanSearch },
  { label: "Hot", note: "Ready for you", type: "Lead score", Icon: Flame },
  { label: "Appointment", note: "On your calendar", type: "Action", Icon: CalendarCheck2 },
  { label: "Client", note: "Won", type: "Output", Icon: BadgeCheck },
];

export default function NestiStorySection() {
  return (
    <section className="relative overflow-hidden bg-transparent py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[12%] top-1/2 h-44 w-80 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[90px]" />
        <div className="absolute right-[12%] top-1/2 h-44 w-80 -translate-y-1/2 rounded-full bg-cyan-100/20 blur-[90px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 2xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative px-2 py-8 sm:px-4 lg:px-6 lg:py-10"
          suppressHydrationWarning
        >
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                <Sparkles size={13} />
                The Nesti story
              </p>
              <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.025em] text-text-heading md:text-[1.75rem]">
                Turn every visitor, lead &amp; connection into your next client.
              </h2>
              <p className="mt-2 max-w-none text-sm leading-6 text-text-body lg:whitespace-nowrap">
                Watch every opportunity move from first interaction to a qualified,
                ready-to-convert relationship.
              </p>
            </div>

            <div className="flex items-center gap-3 border-l border-primary/25 pl-4">
              <span className="relative grid h-9 w-9 rotate-45 place-items-center rounded-[0.7rem] border border-primary/20 bg-white/50 text-primary shadow-[0_8px_24px_-14px_rgba(16,185,129,0.8)] backdrop-blur-sm">
                <span className="absolute inset-0 animate-ping rounded-[0.7rem] border border-primary/20" />
                <span className="-rotate-45">
                <Activity size={17} className="relative" />
                </span>
              </span>
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  Conversion engine
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-text-heading">
                  Live and moving 24/7
                </span>
              </span>
            </div>
          </div>

          <div className="relative mt-9 pt-8">
            <div className="pointer-events-none absolute inset-x-[5%] top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] border border-primary/[0.06]" />
            <HorizontalJourneyTimeline steps={pipeline} advanced />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
