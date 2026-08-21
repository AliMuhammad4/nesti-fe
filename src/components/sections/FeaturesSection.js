"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Target,
  Brain,
  Contact,
  RefreshCw,
  Handshake,
  Home,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Your Website",
    description:
      "Build a professional, SEO-ready storefront that turns visitors into inquiries.",
  },
  {
    icon: Target,
    title: "Lead Generation",
    description:
      "Capture buyer, seller and client demand from your website and marketing channels.",
  },
  {
    icon: Brain,
    title: "AI Lead Qualification",
    description:
      "Nesti asks the right questions, understands intent and scores every opportunity from 0 to 100.",
  },
  {
    icon: Contact,
    title: "CRM",
    description:
      "Keep every lead, conversation, task and opportunity organized in one place.",
  },
  {
    icon: RefreshCw,
    title: "Automated Nurturing",
    description:
      "Automatically follow up with prospects until they’re ready to take the next step.",
  },
  {
    icon: Handshake,
    title: "Professional Network",
    description:
      "Connect with realtors, mortgage brokers, lawyers and other professionals to exchange referrals and grow.",
  },
  {
    icon: Home,
    title: "Client Matching",
    description:
      "Match clients with professionals based on their needs, location, specialization and preferences.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative bg-transparent py-10 md:py-14">
      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="mx-auto mb-8 max-w-5xl text-center md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.3 }}
            suppressHydrationWarning
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Zap size={14} />
              The platform
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.3 }}
            className="mb-3 text-[1.65rem] font-black leading-tight text-text-heading sm:text-3xl lg:whitespace-nowrap lg:text-4xl"
            suppressHydrationWarning
          >
            Everything You Need to Grow Your{" "}
            <span className="text-primary">Real Estate Business</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-none text-sm leading-6 text-text-body md:text-base lg:whitespace-nowrap"
            suppressHydrationWarning
          >
            Website, CRM, lead generation, AI follow-up, networking and matching
            without stitching five tools together.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ y: -3, transition: { duration: 0.25 } }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md ${
                  index === features.length - 1 ? "lg:col-start-2" : ""
                }`}
                suppressHydrationWarning
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <IconComponent size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-black text-text-heading md:text-base">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-text-body">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
