"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const getLogoUrl = (domain) => {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || "";
  return `https://img.logo.dev/${domain}?token=${token}&size=280&format=png&retina=true&theme=light`;
};

const pressMentions = [
  {
    name: "Forbes",
    url: "https://www.forbes.com/councils/forbesbusinesscouncil/2025/09/25/the-real-opportunity-in-ai-building-businesses-that-truly-serve-people/",
    logo: getLogoUrl("forbes.com"),
  },
  {
    name: "Business Insider",
    url: "https://markets.businessinsider.com/news/stocks/strategic-real-estate-solutions-unveiled-ravinna-raveenthiran-launches-nesti-transforming-the-property-market-landscape-1033746211",
    logo: getLogoUrl("businessinsider.com"),
  },
  {
    name: "Crunchbase",
    url: "https://www.crunchbase.com/person/ravinna-raveenthiran",
    logo: getLogoUrl("crunchbase.com"),
  },
  {
    name: "AP News",
    url: "https://apnews.com/press-release/accesswire/real-estate-1c9ddf73b1382f89c78c9af9d9ef6c90",
    logo: getLogoUrl("apnews.com"),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/ravinnaravi/",
    logo: getLogoUrl("instagram.com"),
  },
  {
    name: "Wall Street Times",
    url: "https://wallstreettimes.com/how-ravinna-raveenthiran-rebuilt-nesti-and-herself/",
    logo: getLogoUrl("wallstreettimes.com"),
  },
  {
    name: "NY Weekly",
    url: "https://nyweekly.com/entrepreneur/how-ravinna-raveenthiran-rebuilt-nesti-and-redefined-its-future/",
    logo: getLogoUrl("nyweekly.com"),
  },
  {
    name: "The US Times",
    url: "https://theustimes.com/from-adversity-to-innovation-how-ravinna-raveenthiran-is-revolutionizing-real-estate/?amp",
    logo: getLogoUrl("theustimes.com"),
  },
  {
    name: "CEO Feature",
    url: "https://ceofeature.com/queen-of-the-north-how-ravinna-raveenthiran-is-redefining-real-estate-with-resilience-and-compassion/",
    logo: getLogoUrl("ceofeature.com"),
  },
  {
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/strategic-real-estate-solutions-unveiled-092000720.html",
    logo: getLogoUrl("yahoo.com"),
  },
  {
    name: "Digital Journal",
    url: "https://www.digitaljournal.com/pr/news/accesswire/strategic-real-estate-solutions-unveiled-1705781835.html",
    logo: getLogoUrl("digitaljournal.com"),
  },
];

export default function CEOFeaturesSection() {
  const sliderItems = [...pressMentions, ...pressMentions];

  return (
    <section className="relative bg-transparent pb-9 pt-1 md:pb-11">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.3 }}
          className="border-t border-border/40 pt-7 md:pt-8"
          aria-label="Press recognition"
          suppressHydrationWarning
        >
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted sm:text-xs">
              As featured in &amp; recognized by
            </p>
            <span className="mt-2 h-px w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          <div className="press-logo-fade relative mt-6 overflow-hidden py-1">
            <div className="press-logo-track flex w-max items-end gap-12 sm:gap-16">
              {sliderItems.map((mention, index) => (
                <a
                  key={`${mention.name}-${index}`}
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read Nesti's coverage on ${mention.name}`}
                  className="group flex w-[7.5rem] shrink-0 flex-col items-center gap-2.5 outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-36"
                >
                  <Image
                    src={mention.logo}
                    alt={`${mention.name} logo`}
                    width={220}
                    height={72}
                    className="h-[3.25rem] w-auto max-h-[3.25rem] object-contain drop-shadow-sm opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:drop-shadow-md group-focus-visible:opacity-100 sm:h-16 sm:max-h-16"
                    loading="lazy"
                    quality={90}
                    sizes="220px"
                  />
                  <span className="max-w-full truncate text-[11px] font-semibold tracking-wide text-text-body transition-colors duration-300 group-hover:text-primary-dark sm:text-xs">
                    {mention.name}
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
