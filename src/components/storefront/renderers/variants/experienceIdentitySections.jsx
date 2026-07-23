import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import PublicHero from '@/components/public-profile/PublicHero';

function withForcedHeroVariant(block, variant) {
  return {
    ...(block || {}),
    data: {
      ...(block?.data || {}),
      layout: {
        ...(block?.data?.layout || block?.layout || {}),
        variant,
      },
    },
  };
}

export function LuxuryHeroSection({ profile, actions, block }) {
  return (
    <PublicHero
      profile={profile}
      onCTAClick={actions.onCtaClick}
      onDirectLeadClick={actions.onDirectLeadClick}
      block={withForcedHeroVariant(block, 'premium')}
      flushTop
    />
  );
}

export function IndustrialHeroSection({ profile, actions, block }) {
  return (
    <PublicHero
      profile={profile}
      onCTAClick={actions.onCtaClick}
      onDirectLeadClick={actions.onDirectLeadClick}
      block={withForcedHeroVariant(block, 'minimal')}
      flushTop
    />
  );
}

export function WarmHeroSection({ profile, actions, block }) {
  return (
    <PublicHero
      profile={profile}
      onCTAClick={actions.onCtaClick}
      onDirectLeadClick={actions.onDirectLeadClick}
      block={withForcedHeroVariant(block, 'editorial')}
      flushTop
    />
  );
}

export function FunnelHeroSection({ profile, actions, block }) {
  return (
    <PublicHero
      profile={profile}
      onCTAClick={actions.onCtaClick}
      onDirectLeadClick={actions.onDirectLeadClick}
      block={withForcedHeroVariant(block, 'lead-magnet')}
      flushTop
    />
  );
}

function aboutParagraphs(profile) {
  return String(profile?.about || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function roleHeadline(profile) {
  if (profile?.professional_type === 'mortgage_broker') return 'Mortgage Strategy Partner';
  if (profile?.professional_type === 'lawyer') return 'Real Estate Legal Counsel';
  return 'Real Estate Market Advisor';
}

function identityCopy(profile, defaults = {}) {
  const content = profile?.storefront_section_content || {};
  return {
    eyebrow: content.eyebrow || defaults.eyebrow || '',
    heading: content.heading || defaults.heading || '',
    body: content.body || defaults.body || '',
    ctaLabel: content.cta_label || defaults.ctaLabel || '',
  };
}

export function LuxuryAboutSection({ profile }) {
  const paragraphs = aboutParagraphs(profile);
  const copy = identityCopy(profile, { eyebrow: 'Private profile', heading: profile?.professional_name || 'Trusted advisor' });
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-amber-300/40 bg-white/95 p-7 shadow-[0_24px_70px_rgba(60,45,10,0.10)] sm:p-9">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-600">{copy.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-heading">{copy.heading}</h2>
        <p className="mt-1 text-sm font-medium text-text-muted">{roleHeadline(profile)}</p>
        <div className="mt-5 space-y-4">
          {paragraphs.map((paragraph, index) => <p key={index} className="text-[15px] leading-8 text-text-body">{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

export function IndustrialAboutSection({ profile }) {
  const paragraphs = aboutParagraphs(profile);
  const copy = identityCopy(profile, { eyebrow: 'Profile', heading: 'Operator background' });
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl border-y border-slate-200 bg-white/90 px-1 py-7 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{copy.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold uppercase tracking-[0.08em] text-slate-900">{copy.heading}</h2>
        <div className="mt-4 space-y-3">
          {paragraphs.map((paragraph, index) => <p key={index} className="text-sm leading-7 text-text-body">{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

export function WarmAboutSection({ profile }) {
  const paragraphs = aboutParagraphs(profile);
  const copy = identityCopy(profile, { eyebrow: 'Meet your advisor', heading: `Meet ${profile?.professional_name || 'Your Advisor'}` });
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-9">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-text-heading">{copy.heading}</h2>
        <div className="mx-auto mt-5 max-w-3xl space-y-4 text-center">
          {paragraphs.map((paragraph, index) => <p key={index} className="text-[15px] leading-7 text-text-body">{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

export function FunnelAboutSection({ profile }) {
  const paragraphs = aboutParagraphs(profile);
  const copy = identityCopy(profile, { eyebrow: 'Why choose us', heading: `Why work with ${profile?.professional_name || 'us'}` });
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-heading">{copy.heading}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm leading-6 text-text-body">{paragraph}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CTA_COPY = {
  agent: 'Share your target area and timeline. We will map your next three steps.',
  mortgage_broker: 'Share your income range and goals. We will return with a financing path.',
  lawyer: 'Share your transaction stage and closing date. We will guide your legal next step.',
};

function ctaDescription(profile) {
  return CTA_COPY[profile?.professional_type] || CTA_COPY.agent;
}

export function LuxuryCtaSection({ profile, actions }) {
  const copy = identityCopy(profile, { eyebrow: 'Private consultation', heading: 'Arrange your next move', body: ctaDescription(profile), ctaLabel: 'Request consultation' });
  return (
    <section id="contact" className="px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 rounded-[2rem] border border-amber-300/45 bg-white p-7 shadow-[0_24px_70px_rgba(60,45,10,0.10)] sm:p-9">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">{copy.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold text-text-heading sm:text-3xl">{copy.heading}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{copy.body}</p>
        </div>
        <button type="button" onClick={actions.onDirectLeadClick} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          {copy.ctaLabel}
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

export function IndustrialCtaSection({ profile, actions }) {
  const copy = identityCopy(profile, { eyebrow: 'Engagement', heading: 'Start your intake', body: ctaDescription(profile), ctaLabel: 'Start intake' });
  return (
    <section id="contact" className="px-4 py-10 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 border-y border-slate-200 bg-white/90 px-1 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{copy.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-bold uppercase tracking-[0.08em] text-slate-900">{copy.heading}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{copy.body}</p>
        </div>
        <button
          type="button"
          onClick={actions.onDirectLeadClick}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white sm:self-center"
        >
          {copy.ctaLabel}
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
}

export function WarmCtaSection({ profile, actions }) {
  const copy = identityCopy(profile, { eyebrow: 'Take the next step', heading: 'Ready to get started?', body: ctaDescription(profile), ctaLabel: 'Submit inquiry' });
  return (
    <section id="contact" className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-7 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight text-text-heading">{copy.heading}</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-muted">{copy.body}</p>
        <button type="button" onClick={actions.onDirectLeadClick} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          {copy.ctaLabel}
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

export function FunnelCtaSection({ profile, actions }) {
  const copy = identityCopy(profile, { eyebrow: 'Final step', heading: 'Complete your request', body: ctaDescription(profile), ctaLabel: 'Continue' });
  return (
    <section id="contact" className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-text-heading">{copy.heading}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{copy.body}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {['Tell us your goal', 'Share your details', 'Get a follow-up plan'].map((step) => (
            <div key={step} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
              <CheckCircle2 size={13} className="text-primary" />
              {step}
            </div>
          ))}
        </div>
        <button type="button" onClick={actions.onDirectLeadClick} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          {copy.ctaLabel}
          <ArrowRight size={14} />
        </button>
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-text-muted">
          <ShieldCheck size={12} className="text-primary" />
          Secure inquiry flow
        </div>
      </div>
    </section>
  );
}
