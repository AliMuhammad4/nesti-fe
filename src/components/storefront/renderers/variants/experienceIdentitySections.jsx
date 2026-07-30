import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
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
      onAppointmentClick={actions.onAppointmentClick}
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
      onAppointmentClick={actions.onAppointmentClick}
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
      onAppointmentClick={actions.onAppointmentClick}
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
      onAppointmentClick={actions.onAppointmentClick}
      block={withForcedHeroVariant(block, 'lead-magnet')}
      flushTop
    />
  );
}

function aboutParagraphs(body) {
  return String(body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line, index, lines) => lines.indexOf(line) === index)
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
  const sectionStyle = profile?.storefront_section_style || {};
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const paragraphs = aboutParagraphs(profile?.storefront_section_content?.body ?? profile?.about);
  const copy = identityCopy(profile, { eyebrow: 'Private profile', heading: profile?.professional_name || 'Trusted advisor' });
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="px-4 py-10 sm:px-8 sm:py-14" style={{ color: sectionStyle.textColor || undefined }}>
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-amber-300/40 bg-white/95 p-7 shadow-[0_24px_70px_rgba(60,45,10,0.10)] sm:p-9">
        <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${hasCustomTextColor ? 'text-current' : 'text-amber-600'}`} style={hasCustomTextColor ? { opacity: 0.78 } : undefined}>{copy.eyebrow}</p>
        <h2 className={`mt-2 text-3xl font-semibold tracking-tight ${hasCustomTextColor ? 'text-current' : 'text-text-heading'}`}>{copy.heading}</h2>
        <p className={`mt-1 text-sm font-medium ${hasCustomTextColor ? 'text-current' : 'text-text-muted'}`} style={hasCustomTextColor ? { opacity: 0.82 } : undefined}>{roleHeadline(profile)}</p>
        <div className="mt-5 space-y-4">
          {paragraphs.map((paragraph, index) => <p key={index} className={`text-[15px] leading-8 ${hasCustomTextColor ? 'text-current' : 'text-text-body'}`} style={hasCustomTextColor ? { opacity: 0.92 } : undefined}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

export function IndustrialAboutSection({ profile, content: blockContent, block }) {
  const content = blockContent || profile?.storefront_section_content || {};
  const layout = block?.data?.layout || block?.layout || {};
  const style = block?.data?.style || block?.style || {};
  const paragraphs = aboutParagraphs(
    Object.prototype.hasOwnProperty.call(content, 'body') ? content.body : profile?.about,
  );
  const copy = identityCopy(profile, {
    eyebrow: 'Professional profile',
    heading: `About ${profile?.professional_name || 'Your Advisor'}`,
  });
  const name = content.name || profile?.professional_name || 'Trusted Professional';
  const role = content.role || roleHeadline(profile);
  const profilePosition = profile?.storefront_profile_position || {};
  const profileX = Math.min(100, Math.max(0, Number(profilePosition.x ?? 50)));
  const profileY = Math.min(100, Math.max(0, Number(profilePosition.y ?? 25)));
  const profileZoom = Math.min(3, Math.max(1, Number(profile?.storefront_profile_zoom ?? 1)));
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const alignment = layout.alignment || 'left';
  const variant = layout.variant || 'standard';
  const hasCustomTextColor = Boolean(style.textColor);
  const radiusByStyle = {
    none: '0px',
    default: '12px',
    large: '24px',
  }[style.radius || 'default'];
  const shadowByStyle = {
    none: 'none',
    small: '0 10px 28px rgba(15,23,42,0.10)',
    medium: '0 20px 52px rgba(15,23,42,0.14)',
    large: '0 30px 74px rgba(15,23,42,0.18)',
  }[style.shadow || 'none'];
  const appliedShadow = ['small', 'medium', 'large'].includes(style.shadow)
    ? shadowByStyle
    : undefined;
  const widthClass = 'w-full';
  const paddingClass = {
    small: 'px-4 py-8 sm:px-6 sm:py-10',
    medium: 'px-5 py-12 sm:px-8 sm:py-14',
    large: 'px-6 py-14 sm:px-10 sm:py-16',
  }[layout.padding || 'medium'];
  const headingFrameClass = alignment === 'center'
    ? 'mx-auto max-w-3xl border-b-2 border-slate-900 pb-4 text-center'
    : alignment === 'right'
      ? 'ml-auto max-w-3xl border-b-2 border-slate-900 pb-4 text-right'
      : 'max-w-3xl border-b-2 border-slate-900 pb-4 text-left';
  const proseAlignClass = alignment === 'center' ? 'mx-auto max-w-3xl text-center' : alignment === 'right' ? 'ml-auto text-right' : 'text-left';
  const cardShellClass = layout.cardStyle === 'elevated'
    ? 'rounded-2xl bg-white shadow-[0_22px_60px_rgba(15,23,42,0.12)]'
    : layout.cardStyle === 'glass'
      ? 'rounded-2xl border border-white/60 bg-white/75 shadow-[0_20px_44px_rgba(15,23,42,0.10)] backdrop-blur'
      : layout.cardStyle === 'bordered'
        ? 'rounded-2xl border border-slate-200 bg-white'
        : 'rounded-2xl bg-transparent';
  const variantShellClass = variant === 'premium'
    ? 'bg-gradient-to-br from-amber-50/65 via-white to-amber-100/30 ring-1 ring-amber-200/70'
    : variant === 'editorial'
      ? 'bg-white ring-1 ring-slate-200/70'
      : variant === 'lead-magnet'
        ? 'bg-gradient-to-br from-emerald-50/55 via-white to-cyan-50/40'
        : variant === 'minimal'
          ? 'bg-transparent ring-0 shadow-none'
          : '';
  const variantGridClass = variant === 'split'
    ? 'grid gap-9 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-center lg:gap-12'
    : variant === 'feature-grid'
      ? 'grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-14'
      : 'grid gap-9 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-center lg:gap-10';
  const compactVariantGridClass = variant === 'feature-grid' ? 'grid gap-8' : 'grid gap-7';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="w-full bg-transparent">
      <div className={`w-full ${widthClass} ${paddingClass}`}>
        <div
          className={`${cardShellClass} ${variantShellClass} p-3 sm:p-5`}
          style={{
            backgroundColor: style.background || undefined,
            color: style.textColor || undefined,
            borderRadius: radiusByStyle,
            boxShadow: variant === 'minimal' ? 'none' : appliedShadow,
          }}
        >
        <div className={forceCompactPreview ? compactVariantGridClass : variantGridClass}>
          <div>
            <div data-storefront-field="brandKit.profile_photo_url" data-storefront-source="profile" data-storefront-label="Profile photo" className="relative aspect-[4/5] overflow-hidden bg-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
              {profile?.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={name}
                  fill
                  sizes="(min-width: 1280px) 272px, (min-width: 1024px) 240px, 80vw"
                  className="object-cover"
                  style={{
                    objectPosition: `${profileX}% ${profileY}%`,
                    transform: `scale(${profileZoom})`,
                    transformOrigin: `${profileX}% ${profileY}%`,
                  }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-4xl font-bold text-slate-400">
                  {initials}
                </div>
              )}
            </div>
            <div className="border-b border-slate-200 py-4">
              <h3 data-storefront-field="content.name" data-storefront-source={content.name ? 'persisted' : 'fallback'} data-storefront-label="Professional name" className={`text-base font-bold ${hasCustomTextColor ? 'text-current' : 'text-slate-900'}`}>{name}</h3>
              <p data-storefront-field="content.role" data-storefront-source={content.role ? 'persisted' : 'fallback'} data-storefront-label="Professional role" className={`mt-1 text-xs font-medium uppercase tracking-[0.14em] ${hasCustomTextColor ? 'text-current' : 'text-slate-500'}`} style={hasCustomTextColor ? { opacity: 0.8 } : undefined}>
                {role}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className={headingFrameClass}>
              {copy.eyebrow ? (
                <p data-storefront-field="content.eyebrow" data-storefront-source={profile?.storefront_section_content?.eyebrow ? 'persisted' : 'fallback'} data-storefront-label="About eyebrow" className={`text-[10px] font-bold uppercase tracking-[0.22em] ${hasCustomTextColor ? 'text-current' : 'text-slate-500'}`} style={hasCustomTextColor ? { opacity: 0.72 } : undefined}>
                  {copy.eyebrow}
                </p>
              ) : null}
              <h2 data-storefront-field="content.heading" data-storefront-source={profile?.storefront_section_content?.heading ? 'persisted' : 'fallback'} data-storefront-label="About heading" className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${hasCustomTextColor ? 'text-current' : 'text-slate-900'}`}>
                {copy.heading}
              </h2>
            </div>
            <div className={`mt-6 space-y-4 ${proseAlignClass}`}>
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  data-storefront-field="content.body"
                  data-storefront-source={profile?.storefront_section_content?.body ? 'persisted' : 'fallback'}
                  data-storefront-instance={index}
                  data-storefront-label="About description"
                  className={`${index === 0 ? 'text-base leading-8' : 'text-sm leading-7'} ${hasCustomTextColor ? 'text-current' : (index === 0 ? 'text-slate-700' : 'text-slate-600')}`}
                  style={hasCustomTextColor ? { opacity: index === 0 ? 0.92 : 0.84 } : undefined}
                >
                  {paragraph}
                </p>
              ))}
            </div>

          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export function WarmAboutSection({ profile }) {
  const sectionStyle = profile?.storefront_section_style || {};
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const paragraphs = aboutParagraphs(profile?.storefront_section_content?.body ?? profile?.about);
  const copy = identityCopy(profile, { eyebrow: 'Meet your advisor', heading: `Meet ${profile?.professional_name || 'Your Advisor'}` });
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="px-4 py-10 sm:py-14" style={{ color: sectionStyle.textColor || undefined }}>
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-9">
        <p className={`text-center text-[10px] font-bold uppercase tracking-[0.22em] ${hasCustomTextColor ? 'text-current' : 'text-primary'}`} style={hasCustomTextColor ? { opacity: 0.78 } : undefined}>{copy.eyebrow}</p>
        <h2 className={`mt-2 text-center text-3xl font-bold tracking-tight ${hasCustomTextColor ? 'text-current' : 'text-text-heading'}`}>{copy.heading}</h2>
        <div className="mx-auto mt-5 max-w-3xl space-y-4 text-center">
          {paragraphs.map((paragraph, index) => <p key={index} className={`text-[15px] leading-7 ${hasCustomTextColor ? 'text-current' : 'text-text-body'}`} style={hasCustomTextColor ? { opacity: 0.92 } : undefined}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

export function FunnelAboutSection({ profile }) {
  const sectionStyle = profile?.storefront_section_style || {};
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const paragraphs = aboutParagraphs(profile?.storefront_section_content?.body ?? profile?.about);
  const copy = identityCopy(profile, { eyebrow: 'Why choose us', heading: `Why work with ${profile?.professional_name || 'us'}` });
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="px-4 py-10 sm:py-12" style={{ color: sectionStyle.textColor || undefined }}>
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${hasCustomTextColor ? 'text-current' : 'text-primary'}`} style={hasCustomTextColor ? { opacity: 0.78 } : undefined}>{copy.eyebrow}</p>
        <h2 className={`mt-2 text-2xl font-bold tracking-tight ${hasCustomTextColor ? 'text-current' : 'text-text-heading'}`}>{copy.heading}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="rounded-xl bg-slate-50 p-4">
              <p className={`text-sm leading-6 ${hasCustomTextColor ? 'text-current' : 'text-text-body'}`} style={hasCustomTextColor ? { opacity: 0.9 } : undefined}>{paragraph}</p>
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
