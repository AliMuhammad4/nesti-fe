"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Gauge,
  Inbox,
  RefreshCw,
  SearchCheck,
  Users,
} from "lucide-react";
import HorizontalJourneyTimeline from "./HorizontalJourneyTimeline";

const lostMoments = [
  "Visit your website",
  "Browse your services",
  "Ask questions",
  "Submit inquiries",
  "Call after hours",
  "Stop responding",
  "Forget to follow up",
  "Aren’t ready today",
];

const pipeline = [
  {
    label: "Capture",
    note: "Every opportunity",
    type: "Trigger",
    Icon: Inbox,
  },
  {
    label: "Qualify",
    note: "Intent, not noise",
    type: "AI router",
    Icon: SearchCheck,
  },
  {
    label: "Score",
    note: "Who to call first",
    type: "Decision",
    Icon: Gauge,
  },
  {
    label: "Nurture",
    note: "Until they’re ready",
    type: "Automation",
    Icon: RefreshCw,
  },
  {
    label: "Connect",
    note: "The right professional",
    type: "Match",
    Icon: Users,
  },
  {
    label: "Convert",
    note: "Relationship retained",
    type: "Outcome",
    Icon: BadgeCheck,
  },
];

export default function NoBrainerSection() {
  return (
    <section className="relative bg-transparent py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 2xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(160deg,#050810_0%,#071018_58%,#06141c_100%)]"
          suppressHydrationWarning
        >
          <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[#20f5c4]/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#20f5c4]/8 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#20f5c4]/40 to-transparent" />

          <div className="relative px-6 pt-8 text-center md:px-12 md:pt-10">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#20f5c4]"
            >
              The real opportunity
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mx-auto mt-4 max-w-5xl text-2xl font-black leading-tight text-white [text-wrap:balance] md:text-3xl lg:text-[2rem]"
            >
              Your Biggest Opportunity Isn’t More Leads. It’s the Leads You’re Already Losing.
            </motion.h2>
          </div>

          <div className="relative mt-8 border-t border-white/[0.07] px-6 py-8 md:px-12">
            <div className="max-w-3xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#20f5c4]">
                  Incoming opportunity signals
                </p>
                <h3 className="mt-2 text-xl font-black text-white">
                  Every day, potential clients
                </h3>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Most businesses lose these opportunities because nobody has time
                to follow up with every single person.
              </p>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-x-8 md:grid-cols-4">
              {lostMoments.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.08 + index * 0.05 }}
                  className="group flex items-center gap-3 border-b border-white/[0.07] py-3 text-sm text-slate-200"
                >
                  <motion.span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full border border-[#20f5c4]/70 bg-[#20f5c4]/20"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(32,245,196,0)",
                        "0 0 12px rgba(32,245,196,0.55)",
                        "0 0 0 rgba(32,245,196,0)",
                      ],
                    }}
                    transition={{
                      duration: 2.4,
                      delay: index * 0.18,
                      repeat: Infinity,
                    }}
                  />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          <article className="relative border-t border-white/[0.07] px-6 py-9 md:px-12">
            <div className="max-w-3xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#20f5c4]">
                  Automated relationship engine
                </p>
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                  className="mt-2 text-xl font-black leading-snug text-white"
                >
                  Nesti doesn’t let those relationships disappear.
                </motion.h3>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="mt-3 max-w-2xl text-sm leading-6 text-slate-400"
              >
                Keep every visitor, inquiry and quiet lead moving until they’re
                ready to take the next step.
              </motion.p>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] px-3 pt-5 backdrop-blur-sm">
              <HorizontalJourneyTimeline steps={pipeline} advanced />
            </div>
          </article>
        </motion.div>
      </div>
    </section>
  );
}
