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
import StorefrontInlineStyle from '@/components/storefront/StorefrontInlineStyle';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';

/** Desktop split — retain the compact hero and keep the cover filling
 *  the existing media column without adding side blur treatments. */
const LUXURY_HERO_LAYOUT_CSS = `
  @media (min-width: 1024px) {
    .storefront-luxury-hero {
      display: grid !important;
      grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
      height: 32rem !important;
      min-height: 32rem !important;
      background: var(--luxury-hero-surface, #0c0a09);
    }
    .storefront-luxury-hero-media {
      position: relative !important;
      inset: auto !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      bottom: auto !important;
      width: 100% !important;
      height: 100% !important;
      grid-column: 2;
      grid-row: 1;
      overflow: hidden;
    }
    .storefront-luxury-hero-image {
      --cover-zoom: 1 !important;
      transform: none !important;
      animation: none !important;
      background: var(--luxury-hero-media-surface, #151311);
    }
    .storefront-luxury-hero-copy {
      position: relative !important;
      z-index: 2;
      grid-column: 1;
      grid-row: 1;
      background: var(--luxury-hero-surface, #0c0a09);
      align-items: center;
    }
    .storefront-luxury-hero-wash,
    .storefront-luxury-hero-glow,
    .storefront-luxury-hero-scan {
      display: none !important;
    }
    .storefront-luxury-hero-foreground {
      position: absolute;
      z-index: 1;
      object-fit: cover !important;
      object-position: 50% 42% !important;
      filter: grayscale(0.28) contrast(1.02) brightness(1.04);
    }
  }
  @media (min-width: 1280px) {
    .storefront-luxury-hero {
      height: 34rem !important;
      min-height: 34rem !important;
      grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
    }
  }
  @media (max-width: 1023px) {
    .storefront-luxury-hero-media {
      position: absolute !important;
      inset: 0 !important;
    }
  }

  /*
   * Builder device preview: the canvas is CSS-scaled, so viewport media
   * queries still match desktop even when the frame is phone-width. Force
   * the single-column full-bleed treatment back for those previews.
   */
  .storefront-preview-mobile .storefront-luxury-hero,
  .storefront-preview-tablet .storefront-luxury-hero {
    display: block !important;
    grid-template-columns: none !important;
    height: 26rem !important;
    min-height: 26rem !important;
  }
  .storefront-preview-mobile .storefront-luxury-hero-media,
  .storefront-preview-tablet .storefront-luxury-hero-media {
    position: absolute !important;
    inset: 0 !important;
    width: auto !important;
    height: auto !important;
  }
  .storefront-preview-mobile .storefront-luxury-hero-copy,
  .storefront-preview-tablet .storefront-luxury-hero-copy {
    background: transparent !important;
  }
  .storefront-preview-mobile .storefront-luxury-hero-wash,
  .storefront-preview-tablet .storefront-luxury-hero-wash,
  .storefront-preview-mobile .storefront-luxury-hero-glow,
  .storefront-preview-tablet .storefront-luxury-hero-glow,
  .storefront-preview-mobile .storefront-luxury-hero-scan,
  .storefront-preview-tablet .storefront-luxury-hero-scan {
    display: block !important;
  }
  .storefront-preview-mobile .storefront-luxury-hero-image,
  .storefront-preview-tablet .storefront-luxury-hero-image {
    animation: storefront-luxury-hero-kenburns 18s ease-out both !important;
  }
  .storefront-preview-mobile .storefront-luxury-hero-image img,
  .storefront-preview-tablet .storefront-luxury-hero-image img {
    object-position: var(--cover-origin-x, 50%) var(--cover-origin-y, 50%) !important;
  }
  .storefront-preview-tablet .storefront-luxury-hero {
    height: 28rem !important;
    min-height: 28rem !important;
  }
`;

const SELLER_HERO_LAYOUT_CSS = `
  .storefront-seller-hero-media img {
    animation: storefront-seller-hero-zoom 11s ease-in-out infinite alternate;
    will-change: transform, filter;
  }

  .storefront-seller-hero-glow {
    animation: storefront-seller-hero-glow 4.6s ease-in-out infinite alternate;
  }

  .storefront-seller-stage-item {
    animation: storefront-seller-stage-rise 540ms cubic-bezier(.2,.8,.2,1) both;
  }

  .storefront-seller-stage-item:nth-child(2) { animation-delay: 90ms; }
  .storefront-seller-stage-item:nth-child(3) { animation-delay: 170ms; }

  @keyframes storefront-seller-hero-zoom {
    from { transform: scale(1); filter: saturate(.96) contrast(1.02); }
    to { transform: scale(1.04); filter: saturate(1.04) contrast(1.05); }
  }

  @keyframes storefront-seller-hero-glow {
    from { opacity: .32; transform: translateY(0); }
    to { opacity: .58; transform: translateY(-5px); }
  }

  @keyframes storefront-seller-stage-rise {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const HERO_COPY = {
  classic: { eyebrow: 'Full-service real estate', icon: Compass, proof: 'Clear guidance. Strong advocacy. Every step covered.' },
  luxury: { eyebrow: 'Private property advisory', icon: Gem, proof: 'Discreet representation for exceptional properties.' },
  firstHome: { eyebrow: 'First-home specialist', icon: HeartHandshake, proof: 'Clear answers for a milestone move.' },
  seller: { eyebrow: 'Seller growth platform', icon: TrendingUp, proof: 'A structured launch flow built for speed and confidence.' },
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
  const templateKey = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase();
  const isCommunity = templateKey === 'agent-community-expert';
  const rawCta = String(content.cta_label || profile?.hero_cta_label || '').trim();
  const communityLegacyCta = /^ask about my area$/i.test(rawCta);
  return {
    name: content.hero_name || profile?.professional_name || 'Your advisor',
    eyebrow: content.eyebrow || profile?.hero_eyebrow || '',
    heading: content.heading || profile?.headline || `Move with ${profile?.professional_name || 'confidence'}`,
    body: content.body || profile?.tagline || 'Focused real estate guidance built around your timing, goals, and next move.',
    primaryCta: isCommunity
      ? (
        content.primary_cta_label
        && !/^(submit inquiry|message me)$/i.test(String(content.primary_cta_label).trim())
          ? content.primary_cta_label
          : 'Send detailed inquiry'
      )
      : (content.primary_cta_label || 'Submit inquiry'),
    cta: isCommunity
      ? (rawCta && !communityLegacyCta ? rawCta : 'Book an appointment')
      : (rawCta || 'Start a conversation'),
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

function resolveCoverPhoto(profile) {
  return profile?.cover_photo_url
    || profile?.cover_image
    || profile?.storefront_brand_kit?.cover_url
    || profile?.brand_kit?.cover_url
    || profile?.storefront_essentials?.cover_url
    || profile?.storefront_essentials?.cover
    || profile?.professional_profile?.cover_photo_url
    || '';
}

function resolveProfilePhoto(profile) {
  return profile?.profile_photo_url
    || profile?.storefront_essentials?.profile_photo_url
    || profile?.storefront_essentials?.profile
    || '';
}

function HeroFrame({ profile, actions, block, variant }) {
  const copy = HERO_COPY[variant];
  const values = heroValues(profile, block);
  const Icon = copy.icon;
  const companyName = values.companyBadge;
  const inviteShareUrl = String(profile?.invite_link?.share_url || '').trim();
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const compact = isPreview && ['mobile', 'tablet'].includes(profile?.storefront_preview_mode);
  const showCover = (block?.data?.layout?.mediaPosition || 'background') !== 'none';
  const cover = showCover ? resolveCoverPhoto(profile) : '';
  const portrait = resolveProfilePhoto(profile);
  const coverStyle = imageStyle(profile, 'storefront_cover_position');
  const portraitStyle = imageStyle(profile, 'storefront_profile_position');
  const content = block?.data?.content || profile?.storefront_section_content || {};
  const style = block?.data?.style || profile?.storefront_section_style || {};
  const defaultSurface = {
    classic: 'bg-[#07101f] text-white',
    luxury: 'bg-stone-950 text-stone-50',
    firstHome: 'bg-[#0b3d20] text-white',
    seller: 'bg-[#f8fafc] text-slate-950',
    community: 'bg-[#07142f] text-white',
  }[variant];
  const defaultButtonText = 'var(--storefront-primary-contrast)';
  const rawHeroBackground = String(style.background || '').trim();
  const normalizedHeroBackground = rawHeroBackground.toLowerCase();
  const sellerHeroBackground = (
    !rawHeroBackground
    || ['#0b1220', '#0f172a', '#020617', '#111827'].includes(normalizedHeroBackground)
  )
    ? '#f8fafc'
    : rawHeroBackground;
  const heroBackground = variant === 'seller'
    ? sellerHeroBackground
    : TEMPLATE_HERO_BACKGROUND_DEFAULTS.has(normalizedHeroBackground)
      ? ''
      : rawHeroBackground;
  // Luxury and First Home copy sit on image overlays and must remain legible.
  const forceLightText = variant === 'luxury' || variant === 'firstHome';
  const heroTextColor = content.hero_card_text_color
    || (!forceLightText && heroBackground && !isDarkHex(heroBackground) ? '#0f172a' : '#ffffff');
  const mutedTextColor = content.hero_card_text_color
    || (!forceLightText && heroBackground && !isDarkHex(heroBackground) ? '#475569' : 'rgba(255,255,255,0.72)');
  const legacyLuxuryButtonYellow = ['#c9a227', '#c9b08a', '#d4af37', '#f59e0b'].includes(
    String(content.primary_button_background || '').trim().toLowerCase(),
  );
  const legacyFirstHomeButton = variant === 'firstHome' && [
    '#f59e0b', '#fb7185', '#c78960', '#e58b5b', '#ed8b62',
  ].includes(String(content.primary_button_background || '').trim().toLowerCase());
  const primaryButtonStyle = {
    backgroundColor: content.primary_button_background && !legacyLuxuryButtonYellow && !legacyFirstHomeButton
      ? content.primary_button_background
      : (['luxury', 'firstHome', 'community'].includes(variant) ? 'var(--storefront-accent)' : 'var(--storefront-primary)'),
    color: content.primary_button_text_color
      || (variant === 'luxury'
        ? '#14110e'
        : variant === 'firstHome'
          ? '#ffffff'
          : variant === 'community'
            ? 'var(--storefront-accent-contrast, #ffffff)'
            : defaultButtonText),
  };
  const secondaryButtonStyle = variant === 'seller'
    ? {
        backgroundColor: content.secondary_button_background || primaryButtonStyle.backgroundColor,
        borderColor: content.secondary_button_background || primaryButtonStyle.backgroundColor,
        color: content.secondary_button_text_color || primaryButtonStyle.color,
      }
    : {
        ...(content.secondary_button_background ? { backgroundColor: content.secondary_button_background, borderColor: content.secondary_button_background } : {}),
        ...(content.secondary_button_text_color ? { color: content.secondary_button_text_color } : {}),
        ...(variant === 'luxury' && !content.secondary_button_text_color ? { color: heroTextColor } : {}),
        ...(variant === 'luxury' && !content.secondary_button_background ? { borderColor: 'color-mix(in srgb, currentColor 42%, transparent)' } : {}),
      };
  // Match PublicHero: open the professional profile Calendly link when present.
  const calendlyUrl = buildTrackedCalendlyUrl(profile?.professional_profile?.calendly_link, profile);
  const handleConsultationClick = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      actions.onAppointmentClick?.();
      return;
    }
    actions.onCtaClick?.('book_consultation');
  };
  const heroSurfaceStyle = {
    background: {
      classic: 'linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 20%, #07101f) 0%, #07101f 54%, color-mix(in srgb, var(--storefront-accent) 10%, #07101f) 100%)',
      luxury: 'linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 16%, #0c0a09) 0%, #0c0a09 48%, color-mix(in srgb, var(--storefront-accent) 14%, #0c0a09) 100%)',
      firstHome: 'linear-gradient(135deg, #0b3d20 0%, color-mix(in srgb, var(--storefront-accent) 32%, #0b3d20) 100%)',
      seller: '#f8fafc',
      community: 'linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 28%, #07142f) 0%, #07142f 52%, color-mix(in srgb, var(--storefront-accent) 16%, #07142f) 100%)',
    }[variant],
  };

  const textBlock = (
    <div className={`relative z-10 p-6 sm:p-10 lg:p-14 ${
      variant === 'classic'
        ? 'max-w-2xl lg:max-w-lg lg:px-10 lg:py-10 lg:pr-12'
        : variant === 'firstHome'
          ? 'storefront-first-home-hero-copy max-w-2xl rounded-md lg:max-w-3xl lg:px-12 lg:py-12'
          : variant === 'community'
            ? 'max-w-4xl'
          : 'max-w-2xl'
    }`}>
      <div data-storefront-field="content.eyebrow" data-storefront-source={block?.data?.content?.eyebrow ? 'persisted' : 'fallback'} data-storefront-label="Hero eyebrow" className={`inline-flex items-center gap-2 font-bold uppercase ${
        variant === 'classic'
          ? 'text-[9px] tracking-[0.22em]'
          : variant === 'firstHome'
            ? 'bg-white/90 px-4 py-2 text-[10px] tracking-[0.16em] shadow-sm backdrop-blur-sm'
            : 'text-[10px] tracking-[0.24em]'
      }`} style={{ color: mutedTextColor }}>
        {variant !== 'community' ? <Icon size={14} /> : null}
        {values.eyebrow || copy.eyebrow}
      </div>
      <h1 data-storefront-field="content.heading" data-storefront-source={block?.data?.content?.heading ? 'persisted' : 'fallback'} data-storefront-label="Hero heading" className={`font-bold tracking-tight ${
        variant === 'classic'
          ? 'mt-5 max-w-[24rem] text-2xl leading-[1.08] sm:text-[1.75rem] lg:text-[2rem]'
          : variant === 'firstHome'
            ? 'mt-4 max-w-2xl text-[2rem] font-bold leading-[1.03] sm:text-[2.2rem] lg:text-[2.75rem]'
            : variant === 'community'
              ? 'mt-5 max-w-4xl text-3xl leading-[1.08] sm:text-4xl lg:text-[2.75rem]'
            : 'mt-5 max-w-xl text-3xl leading-[1.08] sm:text-4xl lg:text-5xl'
      }`} style={{ color: heroTextColor, ...(variant === 'firstHome' ? { textShadow: '0 8px 22px rgba(0,0,0,.42)' } : {}) }}>
        {values.heading}
      </h1>
      <p data-storefront-field="content.body" data-storefront-source={block?.data?.content?.body ? 'persisted' : 'fallback'} data-storefront-label="Hero description" className={`max-w-xl leading-7 ${
        variant === 'classic'
          ? 'mt-3 max-w-[25rem] text-[13px] leading-6 sm:text-sm'
          : variant === 'firstHome'
            ? 'mt-4 max-w-2xl text-[12px] leading-6 sm:text-[13px]'
            : 'mt-5 text-sm sm:text-base'
      }`} style={{ color: mutedTextColor, ...(variant === 'firstHome' ? { textShadow: '0 4px 16px rgba(0,0,0,.35)' } : {}) }}>
        {values.body}
      </p>
      {variant === 'community' ? (
        <div className="mt-7 max-w-xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={actions.onDirectLeadClick}
              data-storefront-field="content.primary_cta_label"
              data-storefront-source={block?.data?.content?.primary_cta_label ? 'persisted' : 'fallback'}
              data-storefront-label="Primary hero button"
              className="inline-flex h-11 min-w-[10.5rem] items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-bold shadow-[0_12px_28px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:brightness-110"
              style={primaryButtonStyle}
            >
              {values.primaryCta}
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              onClick={handleConsultationClick}
              data-storefront-field="content.cta_label"
              data-storefront-source={block?.data?.content?.cta_label ? 'persisted' : 'fallback'}
              data-storefront-label="Consultation button"
              className="inline-flex h-11 min-w-[10.5rem] items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/[0.08] px-5 text-[13px] font-semibold transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/[0.14]"
              style={{ color: heroTextColor, ...secondaryButtonStyle }}
            >
              {values.cta}
            </button>
          </div>
          {(inviteShareUrl || companyName) ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              {inviteShareUrl ? (
                <a
                  href={inviteShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 text-[11px] font-semibold transition hover:border-white/35 hover:bg-white/[0.12]"
                  style={{ color: mutedTextColor }}
                >
                  <UserPlus size={13} />
                  Join Nesti
                </a>
              ) : null}
              {inviteShareUrl && companyName ? (
                <div className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden="true" />
              ) : null}
              {companyName ? (
                <span
                  data-storefront-field="content.hero_company_badge"
                  data-storefront-source={content.hero_company_badge ? 'persisted' : 'profile'}
                  data-storefront-label="Company name"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 text-[11px] font-semibold"
                  style={{ color: mutedTextColor }}
                >
                  <Building2 size={13} />
                  {companyName}
                </span>
              ) : null}
            </div>
          ) : null}
          <p className="text-xs font-medium leading-5" style={{ color: mutedTextColor }}>{copy.proof}</p>
        </div>
      ) : (
        <>
      <div className={`${variant === 'classic' ? 'mt-4' : 'mt-7'} flex flex-wrap items-center gap-2.5`}>
        <button type="button" onClick={actions.onDirectLeadClick} data-storefront-field="content.primary_cta_label" data-storefront-source={block?.data?.content?.primary_cta_label ? 'persisted' : 'fallback'} data-storefront-label="Primary hero button" className={`inline-flex items-center gap-2 font-bold shadow-lg ${variant === 'classic' ? 'rounded-xl px-3.5 py-2 text-[11px]' : variant === 'firstHome' ? 'rounded px-7 py-3.5 text-xs' : 'rounded-xl px-4 py-2.5 text-sm'}`} style={primaryButtonStyle}>
          {values.primaryCta}
          <ArrowRight size={15} />
        </button>
        <button type="button" onClick={handleConsultationClick} data-storefront-field="content.cta_label" data-storefront-source={block?.data?.content?.cta_label ? 'persisted' : 'fallback'} data-storefront-label="Consultation button" className={`inline-flex items-center gap-2 border font-semibold transition ${variant === 'classic' ? 'rounded-xl border-white/25 bg-white/10 px-3.5 py-2 text-[11px] hover:bg-white/15' : variant === 'firstHome' ? 'rounded border-white/55 bg-black/10 px-7 py-3.5 text-xs hover:border-white hover:bg-white/10' : 'rounded-xl border-white/25 bg-white/10 px-4 py-2.5 text-sm hover:bg-white/15'}`} style={{ color: heroTextColor, ...secondaryButtonStyle }}>
          {values.cta}
          <span aria-hidden="true" className={variant === 'seller' ? 'text-base leading-none' : 'hidden'}>→</span>
        </button>
      </div>
      {!['firstHome', 'seller', 'community'].includes(variant) && inviteShareUrl ? (
        <a href={inviteShareUrl} target="_blank" rel="noopener noreferrer" className={`mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/25 font-semibold transition hover:bg-white/10 ${variant === 'classic' ? 'px-3.5 py-2 text-[11px]' : 'px-4 py-2.5 text-sm'}`} style={{ color: mutedTextColor }}>
          <UserPlus size={14} />
          Join Nesti
        </a>
      ) : null}
      {variant === 'firstHome' && (inviteShareUrl || companyName) ? (
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {inviteShareUrl ? (
            <a
              href={inviteShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2 text-[11px] font-semibold transition hover:bg-white/15"
              style={{ color: mutedTextColor }}
            >
              <UserPlus size={14} />
              Join Nesti
            </a>
          ) : null}
          {companyName ? (
            <span
              data-storefront-field="content.hero_company_badge"
              data-storefront-source={content.hero_company_badge ? 'persisted' : 'profile'}
              data-storefront-label="Company name"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-semibold"
              style={{ color: mutedTextColor }}
            >
              <Building2 size={13} />
              {companyName}
            </span>
          ) : null}
        </div>
      ) : null}
      {variant === 'seller' && (inviteShareUrl || companyName) ? (
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {companyName ? (
            <span
              data-storefront-field="content.hero_company_badge"
              data-storefront-source={content.hero_company_badge ? 'persisted' : 'profile'}
              data-storefront-label="Company name"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-[11px] font-semibold"
              style={{ color: mutedTextColor }}
            >
              <Building2 size={14} />
              {companyName}
            </span>
          ) : null}
          {inviteShareUrl ? (
            <a
              href={inviteShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-accent/45 bg-accent/10 px-3.5 py-2 text-[11px] font-semibold transition hover:bg-accent/20"
              style={{ color: heroTextColor }}
            >
              <UserPlus size={14} className="text-accent" />
              Join Nesti
            </a>
          ) : null}
        </div>
      ) : null}
      {variant !== 'classic' ? (
        <p className="mt-4 text-xs font-medium" style={{ color: mutedTextColor }}>{copy.proof}</p>
      ) : null}
      {!['firstHome', 'seller', 'community'].includes(variant) && companyName ? (
        <span data-storefront-field="content.hero_company_badge" data-storefront-source="profile" data-storefront-label="Company name" className={`${variant === 'classic' ? 'mt-4 text-[10px]' : 'mt-5 text-xs'} inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-semibold`} style={{ color: mutedTextColor }}>
          <Building2 size={13} />
          {companyName}
        </span>
      ) : null}
        </>
      )}
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

  // Each variant passes its own frame height so nested min-h values never conflict.
  const photo = (heightClass = 'min-h-[17rem]', extraImgClass = '') => (
    <div className={`relative h-full w-full overflow-hidden ${heightClass}`}>
      {cover ? (
        <Image src={cover} alt={`${values.name} cover`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className={`object-cover ${extraImgClass}`} style={coverStyle} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      {portrait && !['classic', 'luxury', 'firstHome', 'seller', 'community'].includes(variant) ? (
        <div className="absolute bottom-5 left-5 h-20 w-20 overflow-hidden rounded-full border-4 border-white/80 shadow-xl sm:h-24 sm:w-24">
          <Image src={portrait} alt={values.name} fill sizes="96px" className="object-cover" style={portraitStyle} />
        </div>
      ) : null}
    </div>
  );

  // LUXURY — compact left-aligned editorial stage. Desktop keeps the original
  // height and lets the cover fully fill the existing media column.
  const luxuryCoverZoom = Math.min(1.25, Math.max(1, Number(profile?.storefront_cover_zoom ?? 1)));
  const luxuryCoverX = Math.min(100, Math.max(0, Number(profile?.storefront_cover_position?.x ?? 50)));
  const luxuryCoverY = Math.min(100, Math.max(0, Number(profile?.storefront_cover_position?.y ?? 28)));
  const luxuryLayout = (
    <div
      className="storefront-luxury-hero relative h-[26rem] overflow-hidden sm:h-[28rem] lg:h-[32rem] xl:h-[34rem]"
      style={{
        '--luxury-hero-surface': heroBackground || '#0c0a09',
        '--luxury-hero-media-surface': content.hero_strip_background || '#151311',
      }}
    >
      <StorefrontInlineStyle css={LUXURY_HERO_LAYOUT_CSS} />
      <div className="storefront-luxury-hero-media absolute inset-0">
        <div
          className="storefront-luxury-hero-image absolute inset-0 overflow-hidden"
          style={{
            '--cover-zoom': String(luxuryCoverZoom),
            '--cover-origin-x': `${luxuryCoverX}%`,
            '--cover-origin-y': `${luxuryCoverY}%`,
          }}
        >
          {cover ? (
            <Image
              src={cover}
              alt={`${values.name} cover`}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="storefront-luxury-hero-foreground object-cover"
              style={{ objectPosition: `${luxuryCoverX}% ${luxuryCoverY}%` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
          )}
        </div>
      </div>
      {/* Mobile wash only — desktop uses a real text column background. */}
      <div
        className="storefront-luxury-hero-wash pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background: cover
            ? 'linear-gradient(90deg, rgba(8,7,6,.72) 0%, rgba(8,7,6,.42) 38%, rgba(8,7,6,.18) 68%, rgba(8,7,6,.38) 100%)'
            : 'linear-gradient(135deg, rgba(8,7,6,.9), rgba(8,7,6,.72))',
        }}
      />
      <div
        className="storefront-luxury-hero-glow pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background: 'radial-gradient(ellipse 42% 50% at 18% 55%, rgba(228,215,195,.08), transparent 70%)',
        }}
      />
      <div className="storefront-luxury-hero-scan pointer-events-none absolute inset-x-0 top-0 h-px lg:hidden" aria-hidden="true" />

      <div className="storefront-luxury-hero-copy relative z-10 flex h-full items-center px-5 pb-10 pt-20 sm:px-8 sm:pb-11 sm:pt-20 lg:px-12 lg:pb-12 lg:pt-16 xl:px-16">
        <div className="w-full max-w-xl lg:max-w-none">
          <p
            data-storefront-field="content.eyebrow"
            data-storefront-source={block?.data?.content?.eyebrow ? 'persisted' : 'fallback'}
            data-storefront-label="Hero eyebrow"
            className="storefront-luxury-hero-label text-[10px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: mutedTextColor }}
          >
            {values.eyebrow || copy.eyebrow}
          </p>
          <span className="storefront-luxury-hero-rule mt-3 block h-px w-12 origin-left" style={{ background: 'color-mix(in srgb, currentColor 55%, transparent)', color: mutedTextColor }} aria-hidden="true" />

          <h1
            data-storefront-field="content.heading"
            data-storefront-source={block?.data?.content?.heading ? 'persisted' : 'fallback'}
            data-storefront-label="Hero heading"
            className="storefront-luxury-hero-title mt-3.5 font-serif text-[1.9rem] font-normal leading-[1.08] tracking-[-0.02em] sm:text-[2.35rem] lg:text-[2.75rem]"
            style={{ color: heroTextColor }}
          >
            {values.heading}
          </h1>

          <p
            data-storefront-field="content.body"
            data-storefront-source={block?.data?.content?.body ? 'persisted' : 'fallback'}
            data-storefront-label="Hero description"
            className="storefront-luxury-hero-body mt-3.5 max-w-md text-[13px] leading-6"
            style={{ color: mutedTextColor }}
          >
            {values.body}
          </p>

          <div className="storefront-luxury-hero-actions mt-6 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={actions.onDirectLeadClick}
              data-storefront-field="content.primary_cta_label"
              data-storefront-source={block?.data?.content?.primary_cta_label ? 'persisted' : 'fallback'}
              data-storefront-label="Primary hero button"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_14px_32px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-0.5"
              style={primaryButtonStyle}
            >
              {values.primaryCta}
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={handleConsultationClick}
              data-storefront-field="content.cta_label"
              data-storefront-source={block?.data?.content?.cta_label ? 'persisted' : 'fallback'}
              data-storefront-label="Consultation button"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-transparent px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/5"
              style={secondaryButtonStyle}
            >
              {values.cta}
            </button>
          </div>

          {(companyName || inviteShareUrl) ? (
            <div className="storefront-luxury-hero-meta mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/12 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ borderColor: 'color-mix(in srgb, currentColor 18%, transparent)', color: mutedTextColor }}>
              {companyName ? (
                <span data-storefront-field="content.hero_company_badge" data-storefront-source="profile" data-storefront-label="Company name" className="inline-flex items-center gap-2">
                  <Building2 size={12} />
                  {companyName}
                </span>
              ) : null}
              {inviteShareUrl ? (
                <a href={inviteShareUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-white">
                  <UserPlus size={12} />
                  Join Nesti
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  // FIRST HOME — GreenVilla-inspired full-image property stage.
  const firstHomeLayout = (
    <div className="storefront-first-home-hero grid min-h-[34rem] sm:min-h-[39rem] lg:min-h-[calc(100vh-4rem)]">
      <div className="col-start-1 row-start-1">
        {photo('min-h-[34rem] sm:min-h-[39rem] lg:min-h-[calc(100vh-4rem)]', 'storefront-first-home-cover')}
      </div>
      <div className="pointer-events-none col-start-1 row-start-1 bg-black/28" aria-hidden="true" />
      <div className="pointer-events-none col-start-1 row-start-1 shadow-[inset_0_-180px_220px_rgba(0,0,0,.46),inset_0_0_130px_rgba(0,0,0,.24)]" aria-hidden="true" />
      <div className="col-start-1 row-start-1 flex items-end bg-[linear-gradient(90deg,rgba(4,25,13,.9)_0%,rgba(4,25,13,.64)_45%,rgba(4,25,13,.26)_100%)]">
        {textBlock}
      </div>
    </div>
  );

  // SELLER — copy dominant, narrow proof column with a launch-stage ledger.
  const sellerLayout = (
    <div className="storefront-seller-hero grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
      <StorefrontInlineStyle css={SELLER_HERO_LAYOUT_CSS} />
      <div className="order-2 flex items-center lg:order-none">{textBlock}</div>
      <div className="order-1 h-full border-white/10 lg:order-none lg:border-l">
        <div className="storefront-seller-hero-media relative h-full">
          {photo('min-h-[15rem] lg:min-h-[24rem]')}
          <div className="storefront-seller-hero-glow pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/25 blur-3xl" />
        </div>
      </div>
    </div>
  );

  // COMMUNITY — locality plate with copy on the right.
  const communityLayout = (
    <div className={`grid ${compact ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'}`}>
      <div className="relative order-1 lg:order-none">
        {photo('min-h-[16rem] lg:min-h-[28rem]')}
      </div>
      <div className="order-2 flex items-center border-white/10 lg:order-none lg:border-l">{textBlock}</div>
    </div>
  );

  const layout = variant === 'luxury'
    ? luxuryLayout
    : variant === 'firstHome'
      ? firstHomeLayout
      : variant === 'seller'
        ? sellerLayout
        : variant === 'community'
          ? communityLayout
          : <div className="grid lg:grid-cols-[1.15fr_0.85fr]">{textBlock}{photo('min-h-[14.5rem]')}</div>;

  return (
    <section className="relative pt-16" suppressHydrationWarning={variant === 'community'}>
      <PublicStorefrontHeader
        profile={profile}
        forceCompactPreview={compact}
        forceMobilePreview={profile?.storefront_preview_mode === 'mobile'}
        variant={variant === 'luxury' ? 'luxury' : undefined}
      />
      <div
        className={`relative overflow-hidden ${heroBackground ? 'text-white' : defaultSurface}`}
        style={heroBackground ? { backgroundColor: heroBackground, color: heroTextColor } : heroSurfaceStyle}
        suppressHydrationWarning={variant === 'community'}
      >
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

