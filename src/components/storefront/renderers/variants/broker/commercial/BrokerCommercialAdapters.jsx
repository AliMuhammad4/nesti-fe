'use client';

import {
  BrokerClassicAbout,
  BrokerClassicBusinessLoans,
  BrokerClassicCalculator,
  BrokerClassicCompensation,
  BrokerClassicCredentials,
  BrokerClassicCta,
  BrokerClassicFaq,
  BrokerClassicFooter,
  BrokerClassicGuidance,
  BrokerClassicLenders,
  BrokerClassicPrograms,
  BrokerClassicRates,
  BrokerClassicSnapshot,
  BrokerClassicTestimonials,
} from '../classic';
import {
  COMMERCIAL_FAQS,
  COMMERCIAL_FOOTER_ITEMS,
  COMMERCIAL_GUIDANCE_STEPS,
  COMMERCIAL_LENDER_ITEMS,
  COMMERCIAL_PROGRAM_ITEMS,
  COMMERCIAL_RATE_ITEMS,
  COMMERCIAL_ROLE_HIGHLIGHTS,
  COMMERCIAL_ROLE_SNAPSHOT_DEFAULTS,
  COMMERCIAL_SERVICE_ITEMS,
  COMMERCIAL_WHO_WE_HELP,
} from './brokerCommercialDefaults';
import { COMMERCIAL_PALETTE as P } from './brokerCommercialPalette';
import { BrokerCommercialCardSection } from './BrokerCommercialCardSection';

const PROGRAM_HEADINGS = {
  eyebrow: 'Commercial products',
  heading: 'Programs built for income-producing deals',
  body: 'CMHC multi, conventional CRE, bridge, construction, and private pathways compared side by side.',
};

const SNAPSHOT_HEADINGS = {
  eyebrow: 'Practice snapshot',
  heading: 'Commercial coverage at a glance',
  body: 'Asset focus, markets served, and consultation languages for deal intake.',
};

const SERVICES_HEADINGS = {
  eyebrow: 'Transaction support',
  heading: 'From package to term sheet',
  body: 'Term sheets, underwriting packages, lender matching, and DSCR planning.',
};

const WHO_WE_HELP_HEADINGS = {
  eyebrow: 'Who we help',
  heading: 'Built for commercial operators',
  body: 'Sponsors, developers, and multi-unit investors who need clear capital options.',
};

const GUIDANCE_HEADINGS = {
  eyebrow: 'Case pathway',
  heading: 'Four steps from intake to funding',
  body: 'A simple commercial roadmap that keeps documents, term sheets, and timelines organized.',
};

const RATES_HEADINGS = {
  eyebrow: 'Indicative bands',
  heading: 'Where commercial pricing starts',
  body: 'Compare common product categories, then review what fits your asset and leverage.',
};

const ROLE_HEADINGS = {
  eyebrow: 'Business & commercial',
  heading: 'Verticals we finance',
  body: 'Fast approvals, clear documentation pathways, and structures for multi-unit and commercial needs.',
};

const LENDER_HEADINGS = {
  eyebrow: 'Lender access',
  heading: 'More desks than a single branch',
  body: 'Compare products across banks, credit unions, and specialty lenders suited to commercial files.',
};

const COMPENSATION_HEADINGS = {
  eyebrow: 'Transparent advice',
  heading: 'How commercial advice is compensated',
  body: 'Clear language about how advice is paid so you can focus on the right structure.',
};

const TESTIMONIAL_HEADINGS = {
  eyebrow: 'Client feedback',
  heading: 'Operators who funded with clarity',
  body: 'Clear packages and lender matching help commercial clients move forward with fewer surprises.',
};

const FAQ_HEADINGS = {
  eyebrow: 'Common questions',
  heading: 'Answers before you submit the package',
  body: 'Start with the questions sponsors and operators ask most about commercial financing.',
};

const ABOUT_HEADINGS = {
  eyebrow: 'Your commercial desk',
  heading: 'Meet your advisor',
  body: 'A relationship-first mortgage advisor focused on clear next steps for commercial and multi-unit financing.',
};

export function BrokerCommercialSnapshot(props) {
  return <BrokerClassicSnapshot {...props} headingDefaults={SNAPSHOT_HEADINGS} />;
}

export function BrokerCommercialWhoWeHelp({ profile, block }) {
  return (
    <BrokerCommercialCardSection
      profile={profile}
      block={block}
      sectionId="who-we-help"
      dataAttr="data-broker-commercial-who-we-help"
      fallbackItems={COMMERCIAL_WHO_WE_HELP}
      itemLimit={8}
      headingDefaults={WHO_WE_HELP_HEADINGS}
      emptyLabel="Add audience cards in the Content panel."
      columnsFallback="4"
      iconKeys={['building', 'briefcase', 'target', 'home', 'shield', 'percent']}
    />
  );
}

export function BrokerCommercialPrograms(props) {
  return (
    <BrokerClassicPrograms
      {...props}
      fallbackItems={COMMERCIAL_PROGRAM_ITEMS}
      headingDefaults={PROGRAM_HEADINGS}
    />
  );
}

export function BrokerCommercialServices({ profile, block }) {
  return (
    <BrokerCommercialCardSection
      profile={profile}
      block={block}
      sectionId="services"
      dataAttr="data-broker-commercial-services"
      fallbackItems={COMMERCIAL_SERVICE_ITEMS}
      itemLimit={8}
      headingDefaults={SERVICES_HEADINGS}
      emptyLabel="Add service cards in the Content panel."
      columnsFallback="4"
      iconKeys={['shield', 'briefcase', 'building', 'calculator', 'target', 'percent', 'home']}
    />
  );
}

export function BrokerCommercialRoleDetails(props) {
  return (
    <BrokerClassicBusinessLoans
      {...props}
      fallbackHighlights={COMMERCIAL_ROLE_HIGHLIGHTS}
      snapshotDefaults={COMMERCIAL_ROLE_SNAPSHOT_DEFAULTS}
      headingDefaults={ROLE_HEADINGS}
      ctaDefault="Request a commercial review"
    />
  );
}

export function BrokerCommercialAbout(props) {
  return <BrokerClassicAbout {...props} headingDefaults={ABOUT_HEADINGS} />;
}

export function BrokerCommercialGuidance(props) {
  return (
    <BrokerClassicGuidance
      {...props}
      fallbackSteps={COMMERCIAL_GUIDANCE_STEPS}
      headingDefaults={GUIDANCE_HEADINGS}
    />
  );
}

export function BrokerCommercialRates(props) {
  return (
    <BrokerClassicRates
      {...props}
      fallbackItems={COMMERCIAL_RATE_ITEMS}
      headingDefaults={RATES_HEADINGS}
      ctaDefault="Request a custom review"
    />
  );
}

export function BrokerCommercialCalculator(props) {
  return <BrokerClassicCalculator {...props} />;
}

export function BrokerCommercialLenders(props) {
  return (
    <BrokerClassicLenders
      {...props}
      fallbackItems={COMMERCIAL_LENDER_ITEMS}
      headingDefaults={LENDER_HEADINGS}
      disclaimerDefault=""
    />
  );
}

export function BrokerCommercialCompensation(props) {
  return (
    <BrokerClassicCompensation
      {...props}
      headingDefaults={COMPENSATION_HEADINGS}
      disclaimerDefault=""
    />
  );
}

export function BrokerCommercialCredentials(props) {
  return <BrokerClassicCredentials {...props} />;
}

export function BrokerCommercialTestimonials(props) {
  return <BrokerClassicTestimonials {...props} headingDefaults={TESTIMONIAL_HEADINGS} />;
}

export function BrokerCommercialFaq(props) {
  return (
    <BrokerClassicFaq
      {...props}
      fallbackFaqs={COMMERCIAL_FAQS}
      headingDefaults={FAQ_HEADINGS}
    />
  );
}

export function BrokerCommercialCta(props) {
  const block = props.block || {};
  const data = block.data || {};
  const existing = data.content || block.content || {};
  const existingStyle = data.style || block.style || {};
  const content = {
    ...existing,
    eyebrow: existing.eyebrow || "Let's start",
    heading: existing.heading || 'Send the package',
    body: existing.body || 'Share rent roll, purchase price, and target LTV—we will compare suitable commercial options.',
    cta_label: existing.cta_label || 'Submit a deal',
    secondary_cta_label: existing.secondary_cta_label || 'Book a consultation',
  };
  const style = {
    ...existingStyle,
    background: existingStyle.background && String(existingStyle.background).toLowerCase() !== 'transparent'
      ? existingStyle.background
      : P.primary,
    textColor: existingStyle.textColor || P.white,
  };
  return (
    <BrokerClassicCta
      {...props}
      block={{
        ...block,
        data: { ...data, content, style },
        style,
      }}
    />
  );
}

export function BrokerCommercialFooter(props) {
  return (
    <BrokerClassicFooter
      {...props}
      fallbackItems={COMMERCIAL_FOOTER_ITEMS}
      itemLimit={10}
    />
  );
}
