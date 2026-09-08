'use client';

import PublicHero from '@/components/public-profile/PublicHero';
import {
  BrokerClassicAbout,
  BrokerClassicCta,
  BrokerClassicFaq,
  BrokerClassicGuidance,
  BrokerClassicPrograms,
  BrokerClassicServices,
  BrokerClassicSnapshot,
  BrokerClassicTestimonials,
} from '../classic';
import {
  RENEWAL_FAQS,
  RENEWAL_GUIDANCE_STEPS,
  RENEWAL_PROGRAM_ITEMS,
  RENEWAL_SERVICE_ITEMS,
} from './brokerRenewalDefaults';

const RENEWAL_PROGRAM_HEADINGS = {
  eyebrow: 'Renewal pathways',
  heading: 'Options before your term ends',
  body: 'Renew, refinance, or switch with a clear view of payments, penalties, and timing.',
};

function withMinimalHeroVariant(block) {
  return {
    ...(block || {}),
    data: {
      ...(block?.data || {}),
      layout: {
        ...(block?.data?.layout || block?.layout || {}),
        variant: 'minimal',
      },
    },
  };
}

/** Same PublicHero / industrial style as agent-investor free default. */
export function BrokerRenewalHero({ profile, actions = {}, block }) {
  return (
    <PublicHero
      profile={profile}
      onCTAClick={actions.onCtaClick}
      onDirectLeadClick={actions.onDirectLeadClick}
      onAppointmentClick={actions.onAppointmentClick}
      block={withMinimalHeroVariant(block)}
      flushTop
    />
  );
}

export function BrokerRenewalSnapshot(props) {
  return <BrokerClassicSnapshot {...props} />;
}

export function BrokerRenewalPrograms(props) {
  return (
    <BrokerClassicPrograms
      {...props}
      fallbackItems={RENEWAL_PROGRAM_ITEMS}
      headingDefaults={RENEWAL_PROGRAM_HEADINGS}
    />
  );
}

export function BrokerRenewalServices(props) {
  return <BrokerClassicServices {...props} fallbackItems={RENEWAL_SERVICE_ITEMS} />;
}

export function BrokerRenewalAbout(props) {
  return <BrokerClassicAbout {...props} />;
}

export function BrokerRenewalGuidance(props) {
  return <BrokerClassicGuidance {...props} fallbackSteps={RENEWAL_GUIDANCE_STEPS} />;
}

export function BrokerRenewalTestimonials(props) {
  return <BrokerClassicTestimonials {...props} />;
}

export function BrokerRenewalFaq(props) {
  return <BrokerClassicFaq {...props} fallbackFaqs={RENEWAL_FAQS} />;
}

export function BrokerRenewalCta(props) {
  const block = props.block || {};
  const data = block.data || {};
  const existing = data.content || block.content || {};
  const existingStyle = data.style || block.style || {};
  const content = {
    ...existing,
    cta_label: existing.cta_label || 'Upload my offer',
    secondary_cta_label: existing.secondary_cta_label || 'Book a consultation',
  };
  const style = {
    ...existingStyle,
    background: existingStyle.background && String(existingStyle.background).toLowerCase() !== 'transparent'
      ? existingStyle.background
      : '#0E1116',
    textColor: existingStyle.textColor || '#ffffff',
  };
  return (
    <BrokerClassicCta
      {...props}
      block={{
        ...block,
        data: {
          ...data,
          content,
          style,
        },
        style,
      }}
    />
  );
}

export { BrokerRenewalFooter } from './BrokerRenewalFooter';
