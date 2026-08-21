"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Home,
  Landmark,
  Scale,
  Search,
  MessageCircle,
  UserPlus,
  Brain,
  Contact,
  RefreshCw,
  Inbox,
} from "lucide-react";

const journey = [
  { icon: Search, label: "Ranks in search" },
  { icon: UserPlus, label: "Attracts visitors" },
  { icon: MessageCircle, label: "Answers questions" },
  { icon: Inbox, label: "Captures leads" },
  { icon: Brain, label: "Qualifies prospects" },
  { icon: Contact, label: "Updates your CRM" },
  { icon: RefreshCw, label: "Follows up automatically" },
];

const professions = [
  { icon: Home, label: "Realtors" },
  { icon: Landmark, label: "Mortgage Brokers" },
  { icon: Scale, label: "Real Estate Lawyers" },
];

const launchSteps = [
  "Choose your profession",
  "Choose your template",
  "Customize your brand",
  "Launch",
];

export default function WebsiteBuilderSection() {
  return (
    <section id="website" className="relative bg-transparent py-10 md:py-14">
      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="border-b border-border px-5 py-8 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                className="inline-flex rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary"
              >
                Your storefront
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                className="mt-4 max-w-none text-2xl font-black leading-tight text-text-heading md:text-3xl lg:text-[2rem]"
              >
                <span className="block lg:whitespace-nowrap">
                  Your Website Isn’t Just a Website Anymore.
                </span>
                <span className="mt-1 block text-primary lg:whitespace-nowrap">
                  It’s Your 24/7 Sales Team.
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                className="mt-4 max-w-xl text-sm leading-7 text-text-body md:text-base"
              >
                With Nesti, professionals can build a beautiful, personalized website
                that ranks, answers, captures, qualifies and hands every opportunity
                to your CRM, then follows up automatically.
              </motion.p>

              <div className="mt-6 grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {launchSteps.map((step, index) => (
                  <span
                    key={step}
                    className="flex w-full items-center gap-2 rounded-full border border-border bg-background-light px-3 py-2 text-xs font-semibold text-text-heading"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-white">
                      {index + 1}
                    </span>
                    {step}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {professions.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold text-primary-dark"
                  >
                    <Icon size={13} />
                    {label}
                  </span>
                ))}
              </div>

              <Link
                href="/sign-up"
                className="group mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Start Free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-primary/[0.06] via-white to-white px-5 py-8 sm:px-8 lg:px-9 lg:py-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                From search to follow-up
              </p>
              <ol className="mt-5 space-y-2.5">
                {journey.map(({ icon: Icon, label }, index) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-border/80 bg-white px-3.5 py-3 shadow-sm"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={16} />
                    </span>
                    <span className="text-sm font-bold text-text-heading">{label}</span>
                    <span className="ml-auto text-[11px] font-black text-text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
