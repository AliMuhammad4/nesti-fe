"use client";

import { motion } from "framer-motion";
import { CheckCircle2, HeartHandshake, Layers3, Sparkles } from "lucide-react";
import {
  fadeUp,
  ImagePlaceholder,
  PageCta,
  splitTitle,
} from "./shared/PublicPageShared";

/** Drop real assets into /public/about and set src to swap placeholders. */
const MISSION_IMAGES = {
  hero: {
    src: "/images/2.JPG",
    label: "Mission",
    caption: "Ravinna Raveenthiran — Founder & CEO",
    // Face-forward crop; shorter than full portrait so it matches the text column
    objectPosition: "object-[center_18%]",
    aspectClass: "aspect-[5/6]",
  },
  vision: {
    src: "/images/3.JPG",
    label: "Vision",
    // Shift crop down so more of the lower portion (subject) is visible
    objectPosition: "object-[20%_78%]",
    aspectClass: "aspect-[3/2]",
  },
};

function MissionHero({ page, meta, introText = "" }) {
  const title = page.title || "";
  const { before, match, after } = splitTitle(title, meta.highlight);
  const summaryItems = meta.summary || [];

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

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted md:text-[15px]">
              {introText ||
                "Nesti exists to modernize real estate with intelligent systems that help professionals manage leads, automate workflows, improve communication, and deliver a more seamless client experience from first inquiry to long-term relationship."}
            </p>

            {summaryItems.length ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {summaryItems.map((item) => {
                  const cardTitle = typeof item === "string" ? null : item.title;
                  const description =
                    typeof item === "string" ? item : item.description;

                  return (
                    <div
                      key={typeof item === "string" ? item : item.title}
                      className="rounded-xl border border-border/80 bg-white/90 p-3 shadow-sm"
                    >
                      {cardTitle ? (
                        <p className="text-xs font-bold text-text-heading md:text-sm">
                          {cardTitle}
                        </p>
                      ) : null}
                      <p
                        className={`text-[11px] leading-4 text-text-muted md:text-xs md:leading-5 ${
                          cardTitle ? "mt-1" : "font-semibold text-text-heading"
                        }`}
                      >
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <ImagePlaceholder
            {...MISSION_IMAGES.hero}
            className="mx-auto w-full max-w-[300px] lg:max-w-[340px]"
          />
        </motion.div>
      </div>
    </section>
  );
}

function MissionBeliefsSection({ section, closingText = "" }) {
  return (
    <section className="py-5 md:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] md:p-6"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />

          <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] lg:items-stretch lg:gap-6">
            <div className="flex flex-col">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/20">
                  <HeartHandshake size={18} strokeWidth={1.8} aria-hidden />
                </span>
                <h2 className="text-xl font-black leading-tight text-text-heading md:text-2xl">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-2.5">
                {section.paragraphs?.map((p) => (
                  <p
                    key={p}
                    className="text-sm leading-6 text-text-body md:text-[15px]"
                  >
                    {p}
                  </p>
                ))}
              </div>

              {closingText ? (
                <p className="mt-auto border-t border-border/80 pt-3 text-sm font-semibold leading-6 text-text-heading">
                  {closingText}
                </p>
              ) : null}
            </div>

            {section.bullets?.length ? (
              <div className="flex h-full flex-col rounded-xl bg-gradient-to-br from-background-light/90 via-white to-primary/[0.04] p-3.5 ring-1 ring-border/70">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Experience Principles
                </p>
                <div className="grid flex-1 grid-cols-2 content-start gap-1.5">
                  {section.bullets.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold capitalize text-text-heading shadow-sm ring-1 ring-border/60"
                    >
                      <CheckCircle2
                        size={13}
                        className="shrink-0 text-primary"
                        strokeWidth={2.4}
                        aria-hidden
                      />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MissionVisionSection({ section }) {
  if (!section) return null;

  return (
    <section className="py-5 md:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] md:p-6"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />

          <div className="relative z-10 grid items-center gap-5 lg:grid-cols-[minmax(260px,420px)_minmax(0,1fr)] lg:gap-8">
            <ImagePlaceholder
              {...MISSION_IMAGES.vision}
              className="mx-auto w-full max-w-[420px] lg:mx-0"
            />

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <Layers3 size={18} strokeWidth={1.9} className="shrink-0 text-primary" aria-hidden />
                <h2 className="text-xl font-black leading-tight text-text-heading md:text-2xl">
                  {section.title}
                </h2>
              </div>
              <div className="mt-3 space-y-2.5">
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-sm leading-6 text-text-body md:text-[15px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function MissionPage({ page, meta, sections }) {
  const introText = sections?.[0]?.paragraphs?.[0] || "";
  const beliefs = sections?.find((section) => section.title === "What we believe");
  const vision = sections?.find((section) => section.id === "vision");
  const closingText =
    sections?.find((section) => section.id === "closing")?.paragraphs?.[0] || "";

  return (
    <>
      <MissionHero page={page} meta={meta} introText={introText} />
      {beliefs ? (
        <MissionBeliefsSection section={beliefs} closingText={closingText} />
      ) : null}
      <MissionVisionSection section={vision} />
      <PageCta compact transparentSection />
    </>
  );
}
