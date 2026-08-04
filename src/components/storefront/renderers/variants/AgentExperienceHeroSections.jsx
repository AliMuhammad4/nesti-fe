'use client';

import Image from 'next/image';
import {
  ArrowRight,
  Building2,
  Compass,
  Gem,
  HeartHandshake,
  MapPin,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';

const HERO_COPY = {
  classic: { eyebrow: 'Full-service real estate', icon: Compass, proof: 'Clear guidance. Strong advocacy. Every step covered.' },
  luxury: { eyebrow: 'Private property advisory', icon: Gem, proof: 'Discreet representation for exceptional properties.' },
  firstHome: { eyebrow: 'First-home specialist', icon: HeartHandshake, proof: 'Clear answers for a milestone move.' },
  seller: { eyebrow: 'Seller strategy desk', icon: TrendingUp, proof: 'A deliberate launch built to protect value.' },
  community: { eyebrow: 'Neighborhood expert', icon: MapPin, proof: 'Local context for a place that fits your life.' },
};

const TEMPLATE_HERO_BACKGROUND_DEFAULTS = new Set([
  '#f7fcfa',
  '#f8f2e4',
  '#edf5ff',
  '#fff0f3',
  '#eaf8ef',
]);

function heroValues(profile, block) {
  const content = block?.data?.content || profile?.storefront_section_content || {};
  return {
    name: content.hero_name || profile?.professional_name || 'Your advisor',
    eyebrow: content.eyebrow || profile?.hero_eyebrow || '',
    heading: content.heading || profile?.headline || `Move with ${profile?.professional_name || 'confidence'}`,
    body: content.body || profile?.tagline || 'Focused real estate guidance built around your timing, goals, and next move.',
    primaryCta: content.primary_cta_label || 'Submit inquiry',
    cta: content.cta_label || profile?.hero_cta_label || 'Start a conversation',
    companyBadge: content.hero_company_badge || profile?.professional_profile?.company_name || '',
  };
}

function imageStyle(profile, key) {
  const position = profile?.[key] || {};
  const zoomKey = key === 'storefront_cover_position' ? 'storefront_cover_zoom' : 'storefront_profile_zoom';
  const x = Math.min(100, Math.max(0, Number(position.x ?? 50)));
  const y = Math.min(100, Math.max(0, Number(position.y ?? 50)));
  const zoom = Math.min(3, Math.max(1, Number(profile?.[zoomKey] ?? 1)));
  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  };
}

function isDarkHex(hex) {
  const value = String(hex || '').trim();
  if (!/^#[0-9a-f]{6}$/i.test(value)) return false;
  const r = parseInt(value.slice(1, 3), 16) / 255;
  const g = parseInt(value.slice(3, 5), 16) / 255;
  const b = parseInt(value.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.5;
}

function HeroFrame({ profile, actions, block, variant }) {
  const copy = HERO_COPY[variant];
  const values = heroValues(profile, block);
  const Icon = copy.icon;
  const companyName = values.companyBadge;
  const inviteShareUrl = String(profile?.invite_link?.share_url || '').trim();
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const compact = isPreview && ['mobile', 'tablet'].includes(profile?.storefront_preview_mode);
  const cover = profile?.cover_photo_url;
  const portrait = profile?.profile_photo_url;
  const coverStyle = imageStyle(profile, 'storefront_cover_position');
  const portraitStyle = imageStyle(profile, 'storefront_profile_position');
  const content = block?.data?.content || profile?.storefront_section_content || {};
  const style = block?.data?.style || profile?.storefront_section_style || {};
  const defaultSurface = {
    classic: 'bg-[#07101f] text-white',
    luxury: 'bg-stone-950 text-stone-50',
    firstHome: 'bg-gradient-to-br from-sky-600 to-indigo-700 text-white',
    seller: 'bg-rose-950 text-white',
    community: 'bg-emerald-950 text-white',
  }[variant];
  const defaultButtonText = 'var(--storefront-primary-contrast)';
  const rawHeroBackground = String(style.background || '').trim();
  const heroBackground = TEMPLATE_HERO_BACKGROUND_DEFAULTS.has(rawHeroBackground.toLowerCase())
    ? ''
    : rawHeroBackground;
  const heroTextColor = content.hero_card_text_color || (heroBackground && !isDarkHex(heroBackground) ? '#0f172a' : '#ffffff');
  const mutedTextColor = content.hero_card_text_color || (heroBackground && !isDarkHex(heroBackground) ? '#475569' : 'rgba(255,255,255,0.72)');
  const primaryButtonStyle = {
    backgroundColor: content.primary_button_background || 'var(--storefront-primary)',
    color: content.primary_button_text_color || defaultButtonText,
  };
  const secondaryButtonStyle = {
    ...(content.secondary_button_background ? { backgroundColor: content.secondary_button_background, borderColor: content.secondary_button_background } : {}),
    ...(content.secondary_button_text_color ? { color: content.secondary_button_text_color } : {}),
  };
  const themeAccentColor = 'var(--storefront-accent)';
  const heroSurfaceStyle = {
    background: {
      classic: 'linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 20%, #07101f) 0%, #07101f 54%, color-mix(in srgb, var(--storefront-accent) 10%, #07101f) 100%)',
      luxury: 'linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 16%, #0c0a09) 0%, #0c0a09 48%, color-mix(in srgb, var(--storefront-accent) 14%, #0c0a09) 100%)',
      firstHome: 'linear-gradient(135deg, var(--storefront-primary) 0%, color-mix(in srgb, var(--storefront-accent) 45%, var(--storefront-primary)) 100%)',
      seller: 'linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 26%, #4c0519) 0%, #4c0519 52%, color-mix(in srgb, var(--storefront-accent) 18%, #4c0519) 100%)',
      community: 'linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 26%, #052e1b) 0%, #052e1b 52%, color-mix(in srgb, var(--storefront-accent) 18%, #052e1b) 100%)',
    }[variant],
  };

  const textBlock = (
    <div className={`relative z-10 max-w-2xl p-6 sm:p-10 lg:p-14 ${variant === 'classic' ? 'lg:max-w-lg lg:px-10 lg:py-10 lg:pr-12' : ''}`}>
      <div data-storefront-field="content.eyebrow" data-storefront-source={block?.data?.content?.eyebrow ? 'persisted' : 'fallback'} data-storefront-label="Hero eyebrow" className={`inline-flex items-center gap-2 font-bold uppercase ${
        variant === 'classic' ? 'text-[9px] tracking-[0.22em]' : 'text-[10px] tracking-[0.24em]'
      }`} style={{ color: mutedTextColor }}>
        <Icon size={14} />
        {values.eyebrow || copy.eyebrow}
      </div>
      <h1 data-storefront-field="content.heading" data-storefront-source={block?.data?.content?.heading ? 'persisted' : 'fallback'} data-storefront-label="Hero heading" className={`mt-5 font-bold tracking-tight ${
        variant === 'luxury'
          ? 'font-serif text-4xl leading-[1.05] sm:text-6xl'
          : variant === 'classic'
            ? 'max-w-[24rem] text-2xl leading-[1.08] sm:text-[1.75rem] lg:text-[2rem]'
            : 'text-4xl leading-[1.05] sm:text-6xl'
      }`} style={{ color: heroTextColor }}>
        {values.heading}
      </h1>
      <p data-storefront-field="content.body" data-storefront-source={block?.data?.content?.body ? 'persisted' : 'fallback'} data-storefront-label="Hero description" className={`max-w-xl leading-7 ${
        variant === 'classic' ? 'mt-3 max-w-[25rem] text-[13px] leading-6 sm:text-sm' : 'mt-5 text-sm sm:text-base'
      }`} style={{ color: mutedTextColor }}>
        {values.body}
      </p>
      <div className={`${variant === 'classic' ? 'mt-4' : 'mt-7'} flex flex-wrap items-center gap-2.5`}>
        <button type="button" onClick={actions.onDirectLeadClick} data-storefront-field="content.primary_cta_label" data-storefront-source={block?.data?.content?.primary_cta_label ? 'persisted' : 'fallback'} data-storefront-label="Primary hero button" className={`inline-flex items-center gap-2 rounded-xl font-bold shadow-lg ${variant === 'classic' ? 'px-3.5 py-2 text-[11px]' : 'px-4 py-2.5 text-sm'}`} style={primaryButtonStyle}>
          {values.primaryCta}
          <ArrowRight size={15} />
        </button>
        <button type="button" onClick={() => actions.onCtaClick?.('book_consultation')} data-storefront-field="content.cta_label" data-storefront-source={block?.data?.content?.cta_label ? 'persisted' : 'fallback'} data-storefront-label="Consultation button" className={`inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 font-semibold transition hover:bg-white/15 ${variant === 'classic' ? 'px-3.5 py-2 text-[11px]' : 'px-4 py-2.5 text-sm'}`} style={{ color: heroTextColor, ...secondaryButtonStyle }}>
          {values.cta}
        </button>
        {inviteShareUrl ? (
          <a href={inviteShareUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 rounded-xl border border-white/25 font-semibold transition hover:bg-white/10 ${variant === 'classic' ? 'px-3.5 py-2 text-[11px]' : 'px-4 py-2.5 text-sm'}`} style={{ color: mutedTextColor }}>
            <UserPlus size={14} />
            Join Nesti
          </a>
        ) : null}
        {variant !== 'classic' ? (
          <span className="text-xs font-medium" style={{ color: mutedTextColor }}>{copy.proof}</span>
        ) : null}
      </div>
      {companyName ? (
        <span data-storefront-field="content.hero_company_badge" data-storefront-source="profile" data-storefront-label="Company name" className={`${variant === 'classic' ? 'mt-4 text-[10px]' : 'mt-5 text-xs'} inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-semibold`} style={{ color: mutedTextColor }}>
          <Building2 size={13} />
          {companyName}
        </span>
      ) : null}
      {variant === 'classic' ? (
        <div className="mt-6 grid max-w-sm grid-cols-3 border-t border-white/10 pt-4 text-left">
          <div className="border-r border-white/10 pr-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: mutedTextColor }}>Approach</p>
          <p className="mt-1 text-[11px] font-medium" style={{ color: mutedTextColor }}>Client first</p>
          </div>
          <div className="border-r border-white/10 px-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: mutedTextColor }}>Focus</p>
            <p className="mt-1 text-[11px] font-medium" style={{ color: mutedTextColor }}>Local insight</p>
          </div>
          <div className="pl-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: mutedTextColor }}>Result</p>
            <p className="mt-1 text-[11px] font-medium" style={{ color: mutedTextColor }}>Clear next step</p>
          </div>
        </div>
      ) : null}
    </div>
  );

  const photo = (
    <div className={`relative overflow-hidden ${variant === 'classic' ? 'min-h-[14.5rem]' : 'min-h-[17rem]'}`}>
      {cover ? (
        <Image src={cover} alt={`${values.name} cover`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" style={coverStyle} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      {portrait && variant !== 'classic' ? (
        <div className="absolute bottom-5 left-5 h-20 w-20 overflow-hidden rounded-full border-4 border-white/80 shadow-xl sm:h-24 sm:w-24">
          <Image src={portrait} alt={values.name} fill sizes="96px" className="object-cover" style={portraitStyle} />
        </div>
      ) : null}
    </div>
  );

  const layout = variant === 'luxury'
    ? <div className="grid lg:grid-cols-[1.1fr_0.9fr]">{photo}{textBlock}</div>
    : variant === 'firstHome'
      ? <div className="grid lg:grid-cols-[0.95fr_1.05fr]">{textBlock}{photo}</div>
      : variant === 'seller'
        ? <div className="grid lg:grid-cols-[1.2fr_0.8fr]">{textBlock}{photo}</div>
        : variant === 'community'
          ? <div className="grid lg:grid-cols-[0.85fr_1.15fr]">{photo}{textBlock}</div>
          : <div className="grid lg:grid-cols-[1.15fr_0.85fr]">{textBlock}{photo}</div>;

  return (
    <section className="relative pt-16">
      <PublicStorefrontHeader profile={profile} forceCompactPreview={compact} forceMobilePreview={profile?.storefront_preview_mode === 'mobile'} />
      <div className={`relative overflow-hidden ${heroBackground ? 'text-white' : defaultSurface}`} style={heroBackground ? { backgroundColor: heroBackground, color: heroTextColor } : heroSurfaceStyle}>
        {variant === 'classic' ? (
          <>
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: 'color-mix(in srgb, var(--storefront-accent) 16%, transparent)' }} />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--storefront-accent), transparent)', opacity: 0.6 }} />
          </>
        ) : null}
        {layout}
      </div>
    </section>
  );
}

export function ClassicExperienceHero(props) { return <HeroFrame {...props} variant="classic" />; }
export function LuxuryExperienceHero(props) { return <HeroFrame {...props} variant="luxury" />; }
export function FirstHomeExperienceHero(props) { return <HeroFrame {...props} variant="firstHome" />; }
export function SellerExperienceHero(props) { return <HeroFrame {...props} variant="seller" />; }
export function CommunityExperienceHero(props) { return <HeroFrame {...props} variant="community" />; }
