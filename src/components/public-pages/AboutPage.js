"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Mail,
  Network,
  PhoneCall,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  fadeUp,
  ImagePlaceholder,
  PageCta,
  splitTitle,
} from "./shared/PublicPageShared";

/** Drop a real asset into /public/about and set src to swap the placeholder. */
const ABOUT_HERO_IMAGE = {
  src: "/images/1.jpg",
  label: "About",
  caption: "Ravinna Raveenthiran, Founder & CEO",
  // Keep face centered; avoid oversized tall crop
  objectPosition: "object-[center_22%]",
  aspectClass: "aspect-[5/6]",
};

function AboutHero({ page, meta, audienceSection }) {
  const title = page.title || "";
  const { before, match, after } = splitTitle(title, meta.highlight);
  const introParagraphs = audienceSection?.paragraphs || [];
  const audiences = audienceSection?.bullets || [];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-background-light/40 to-white pt-8 pb-5 md:pt-10 md:pb-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-[-4rem] top-24 h-[180px] w-[180px] rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,380px)] lg:gap-10"
        >
          <div className="flex flex-col justify-center">
            <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Sparkles size={12} aria-hidden />
              {meta.badge}
            </span>

            <h1 className="text-3xl font-black leading-[1.08] tracking-tight text-text-heading md:text-4xl lg:text-[2.75rem]">
              {before ? `${before} ` : null}
              {match ? (
                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {match}
                </span>
              ) : null}
              {after ? ` ${after}` : null}
              {!match ? title : null}
            </h1>

            {page.subtitle ? (
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-text-heading md:text-lg">
                {page.subtitle}
              </p>
            ) : null}

            {introParagraphs.length ? (
              <div className="mt-3 max-w-2xl space-y-2.5">
                {introParagraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-sm leading-6 text-text-muted md:text-[15px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {audiences.length ? (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {audiences.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-heading"
                  >
                    <CheckCircle2 size={14} className="text-primary" strokeWidth={2.4} aria-hidden />
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <ImagePlaceholder
            {...ABOUT_HERO_IMAGE}
            className="mx-auto w-full max-w-[300px] lg:max-w-[340px]"
          />
        </motion.div>
      </div>
    </section>
  );
}

function AboutStorySection({ section }) {
  const paragraphs = section.paragraphs || [];

  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-2xl border border-border bg-white px-5 py-6 shadow-[0_16px_45px_rgba(15,23,42,0.05)] md:px-8 md:py-7"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />

          <div className="relative z-10 grid items-stretch gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="flex h-full flex-col">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Our Story
              </p>
              <div className="mb-3 flex items-center gap-2.5">
                <Network size={18} strokeWidth={1.9} className="shrink-0 text-primary" aria-hidden />
                <h2 className="text-xl font-black leading-tight text-text-heading md:text-2xl">
                  Why Nesti Exists
                </h2>
              </div>

              <div className="flex flex-1 flex-col justify-center space-y-3">
                {paragraphs.map((p, index) => (
                  <p
                    key={p.slice(0, 48)}
                    className={`text-sm leading-6 md:text-[15px] md:leading-7 ${
                      index === 0
                        ? "font-medium text-text-heading"
                        : "text-text-body"
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>

              <Link
                href="/mission"
                className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
              >
                Explore our mission &amp; vision
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>

            <div className="flex h-full min-h-0 flex-col lg:border-l lg:border-border/80 lg:pl-8">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Operating Outcomes
              </p>
              <motion.div
                className="flex flex-1 flex-col"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-20px" }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {section.bullets?.map((item) => (
                  <motion.div
                    key={item}
                    variants={{
                      hidden: { opacity: 0, x: 10 },
                      show: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.28, ease: "easeOut" },
                      },
                    }}
                    className="flex flex-1 items-center gap-2.5 border-b border-border/60 py-2.5 last:border-b-0"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2
                        size={15}
                        className="text-primary"
                        strokeWidth={2.4}
                        aria-hidden
                      />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-text-heading">
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AboutReferralSection({ section }) {
  if (!section) return null;

  const detailCards = [
    { item: section.subsections?.[0], Icon: Share2 },
    { item: section.subsections?.[1], Icon: Gift },
    { item: section.subsections?.[2], Icon: ShieldCheck },
  ].filter(({ item }) => item);

  return (
    <section className="py-5 md:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp}>
          <div className="mb-3.5 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Referral Ecosystem
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight text-text-heading md:text-2xl">
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-2 text-sm leading-6 text-text-muted md:text-[15px]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <motion.div
            className="grid items-stretch gap-2.5 lg:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {detailCards.map(({ item, Icon }) => {
              const isSteps = item.title === "How It Works";
              const rows = item.bullets || [];

              return (
                <motion.div
                  key={item.title}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.3, ease: "easeOut" },
                    },
                  }}
                  whileHover={{ y: -2 }}
                  className="group flex h-full flex-col rounded-xl border border-border bg-white p-3 shadow-sm transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
                >
                  <div className="mb-2 flex h-8 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      <Icon size={15} strokeWidth={1.9} aria-hidden />
                    </span>
                    <h3 className="text-sm font-black leading-tight text-text-heading">
                      {item.title}
                    </h3>
                  </div>

                  <div className="grid flex-1 grid-rows-4 gap-1">
                    {rows.map((bullet, index) => (
                      <motion.div
                        key={bullet}
                        initial={{ opacity: 0, x: -6 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.22,
                          delay: 0.06 + index * 0.04,
                          ease: "easeOut",
                        }}
                        className="flex min-h-[32px] items-center gap-2 rounded-md bg-background-light/70 px-2 py-1.5 text-[11px] font-semibold leading-snug text-text-heading transition-colors duration-200 hover:bg-primary/[0.08]"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {isSteps ? (
                            index + 1
                          ) : (
                            <CheckCircle2 size={10} strokeWidth={2.5} aria-hidden />
                          )}
                        </span>
                        <span className="line-clamp-2">{bullet}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const DIFFERENTIATOR_ICONS = [Target, Users, Network, Zap, TrendingUp];

function AboutDifferentiatorsSection({ section }) {
  if (!section?.subsections?.length) return null;

  const items = section.subsections;
  const featuredIndex = Math.min(2, items.length - 1);
  const featured = { item: items[featuredIndex], index: featuredIndex };
  const others = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => index !== featuredIndex);

  return (
    <section className="py-5 md:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mb-4 max-w-3xl">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Platform Difference
          </p>
          <h2 className="text-xl font-black leading-tight text-text-heading md:text-2xl">
            {section.title}
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Featured spotlight */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.98 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.45, ease: "easeOut" },
              },
            }}
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-white to-background-light/80 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-5"
          >
            <motion.div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
              animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.12, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2.5">
                {(() => {
                  const Icon = DIFFERENTIATOR_ICONS[featured.index] || Network;
                  return (
                    <Icon
                      size={20}
                      strokeWidth={1.9}
                      className="shrink-0 text-primary"
                      aria-hidden
                    />
                  );
                })()}
                <h3 className="text-lg font-black leading-tight text-text-heading md:text-xl">
                  {featured.item.title}
                </h3>
              </div>
              {featured.item.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-2 max-w-3xl text-sm leading-6 text-text-body"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Supporting grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map(({ item, index }) => {
              const Icon = DIFFERENTIATOR_ICONS[index] || Sparkles;

              return (
                <motion.div
                  key={item.title}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: "easeOut" },
                    },
                  }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-white p-3.5 shadow-sm transition-colors duration-300 hover:border-primary/25 hover:shadow-md md:p-4"
                >
                  <span
                    className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/0 blur-2xl transition-colors duration-300 group-hover:bg-primary/10"
                    aria-hidden
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={16}
                        strokeWidth={1.9}
                        className="shrink-0 text-primary transition-transform duration-300 group-hover:scale-110"
                        aria-hidden
                      />
                      <h3 className="text-sm font-black leading-tight text-text-heading">
                        {item.title}
                      </h3>
                    </div>
                    {item.paragraphs?.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-1.5 text-xs leading-5 text-text-body md:text-[13px]"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {item.bullets?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.bullets.map((bullet) => (
                          <span
                            key={bullet}
                            className="inline-flex items-center gap-1 rounded-full bg-background-light/80 px-2 py-0.5 text-[10px] font-semibold capitalize text-text-heading ring-1 ring-border/70"
                          >
                            <CheckCircle2
                              size={9}
                              className="text-primary"
                              strokeWidth={2.5}
                              aria-hidden
                            />
                            {bullet}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <span
                    className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-primary-dark transition-all duration-300 group-hover:w-full"
                    aria-hidden
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AboutContactSection({ section }) {
  if (!section) return null;

  const contactCards = [
    {
      item: section.subsections?.find((item) => item.title === "Email"),
      Icon: Mail,
      href: "mailto:ravinnaraveenthiran@nesti.ca",
    },
    {
      item: section.subsections?.find((item) => item.title === "Phone"),
      Icon: PhoneCall,
      href: "tel:+14165654791",
    },
  ].filter(({ item }) => item);

  return (
    <section className="py-5 md:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-white via-white to-primary/[0.04] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] md:p-6"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />

          <div className="relative z-10 grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Contact
              </p>
              <h2 className="mt-1 text-xl font-black leading-tight text-text-heading md:text-2xl">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-2 max-w-2xl text-sm leading-6 text-text-muted md:text-[15px]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {contactCards.map(({ item, Icon, href }) => (
                <a
                  key={item.title}
                  href={href}
                  className="group flex items-center gap-2.5 rounded-xl border border-border bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon size={17} strokeWidth={1.9} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block break-all text-sm font-bold text-text-heading">
                      {item.paragraphs?.[0]}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function AboutPage({ page, meta, sections }) {
  const story = sections?.[1];
  const differentiators = sections?.find((section) => section.id === "differentiators");
  const referrals = sections?.find((section) => section.id === "referral-ecosystem");
  const contact = sections?.find((section) => section.id === "contact");

  return (
    <>
      <AboutHero page={page} meta={meta} audienceSection={sections?.[0]} />
      {story ? <AboutStorySection section={story} /> : null}
      <AboutReferralSection section={referrals} />
      {differentiators ? <AboutDifferentiatorsSection section={differentiators} /> : null}
      <AboutContactSection section={contact} />
      <PageCta compact transparentSection />
    </>
  );
}
