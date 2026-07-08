"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const reasons = [
  {
    title: "Asymmetrical Math",
    copy:
      "A yearly Nesti subscription is roughly $1,500. A single closed deal pockets you $5,000 to $20,000+ in commissions or fees. Closing just one extra deal pays for Nesti 10 times over. Everything after that is 100% pure profit.",
  },
  {
    title: "24/7 Monopolization",
    copy:
      "You are not losing clients because of your sales skills. You are losing them to admin fatigue. Nesti puts your lead operations and cold database on 24/7 autopilot. It qualifies and scores buyers while you sleep, ensuring your competitors never touch them.",
  },
  {
    title: "The Bottom Line",
    copy:
      "Nesti is not an expense; it is a revenue machine. You either pay a small subscription to dominate your market, or you pay the ultimate price by letting thousands in commissions slide to those who bought the subscription to Nesti.",
  },
];

export default function NoBrainerSection() {
  return (
    <section className="relative bg-transparent py-6 md:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(160deg,#050810_0%,#071018_100%)] shadow-[0_16px_48px_-20px_rgba(0,0,0,0.5)]"
          suppressHydrationWarning
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#20f5c4]/40 to-transparent" />

          <div className="border-b border-white/[0.06] px-5 py-4 text-center md:px-6 md:py-5">
            <span className="mb-3 inline-flex items-center rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              Market Economics
            </span>
            <h2 className="text-2xl font-black leading-tight text-white md:text-3xl lg:text-4xl">
              The Ultimate Competitive Math
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 lg:items-stretch">
            <article className="flex flex-col justify-center border-b border-white/[0.06] px-5 py-4 md:px-6 md:py-5 lg:border-b-0 lg:border-r">
              <h3 className="text-lg font-black leading-tight text-[#20f5c4]">
                The $144,000 Invisible Leak
              </h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-slate-400 md:text-base">
                The average real estate professional is actively bleeding out{" "}
                <span className="font-medium text-slate-200">$144,000</span> every single year. This massive financial loss happens silently, simply because your phone and old CRM are stuffed with dead leads that you do not have the time to manually follow up with, text, or qualify. You are not avoiding a software bill by skipping Nesti. You are paying a brutal{" "}
                <span className="font-medium text-slate-200">$12,000 monthly penalty</span> in lost commissions straight to competitors who bought the subscription to Nesti. Stop the bleeding now.
              </p>
            </article>

            <article className="px-5 py-4 md:px-6 md:py-5">
              <h3 className="text-lg font-black leading-tight text-[#20f5c4]">
                Why Nesti is an Absolute No-Brainer
              </h3>
              <div className="mt-3.5 space-y-3.5">
                {reasons.map(({ title, copy }, index) => (
                  <div
                    key={title}
                    className={`flex gap-3 ${index > 0 ? "border-t border-white/[0.06] pt-3.5" : ""}`}
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[#20f5c4]/80"
                    />
                    <p className="text-[15px] leading-[1.7] text-slate-400 md:text-base">
                      <span className="font-black text-slate-100">{title}: </span>
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
