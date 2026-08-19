import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  MapPin,
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

export function ClassicHeroSection({ profile, actions, block }) {
  return (
    <PublicHero
      profile={profile}
      onCTAClick={actions.onCtaClick}
      onDirectLeadClick={actions.onDirectLeadClick}
      onAppointmentClick={actions.onAppointmentClick}
      block={withForcedHeroVariant(block, 'standard')}
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

export function NeighborhoodHeroSection({ profile, actions, block }) {
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

function resolveProfilePhoto(profile) {
  return profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || profile?.storefront_essentials?.profile
    || '';
}

function resolveProfilePlacement(profile, defaultY = 50) {
  const position = profile?.storefront_profile_position || {};
  const rawX = position.x ?? profile?.profile_position_x ?? profile?.storefront_essentials?.profile_position_x ?? 50;
  const rawY = position.y ?? profile?.profile_position_y ?? profile?.storefront_essentials?.profile_position_y ?? defaultY;
  const rawZoom = profile?.storefront_profile_zoom ?? profile?.profile_zoom ?? profile?.storefront_essentials?.profile_zoom ?? 1;
  return {
    x: Math.min(100, Math.max(0, Number(rawX))),
    y: Math.min(100, Math.max(0, Number(rawY))),
    zoom: Math.min(3, Math.max(1, Number(rawZoom))),
  };
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

/**
 * Builder edit markers. Every experience variant needs these so the composer can
 * select and inspect the same fields the Classic sections already expose.
 */
function editable(profile, field, label) {
  const content = profile?.storefront_section_content || {};
  return {
    'data-storefront-field': `content.${field}`,
    'data-storefront-source': content[field] ? 'persisted' : 'fallback',
    'data-storefront-label': label,
  };
}

function bodyMarker(profile, index, label = 'About description') {
  const content = profile?.storefront_section_content || {};
  return {
    'data-storefront-field': 'content.body',
    'data-storefront-source': content.body ? 'persisted' : 'fallback',
    'data-storefront-instance': index,
    'data-storefront-label': label,
  };
}

function luxurySurface(value, fallback) {
  const stored = String(value || '').trim();
  const normalized = stored.toLowerCase().replace(/\s+/g, '');
  const legacyLight = ['#faf7ef', '#f8f2e4', '#fffaf1'].includes(normalized)
    || ['250,247,239', '248,242,228', '255,250,241'].some((rgb) => normalized.includes(rgb));
  const legacyTeal = ['#0f766e', '#0c5c4c', '#0d9488', '#115e59', '#134e4a'].includes(normalized)
    || ['15,118,110', '12,92,76', '13,148,136'].some((rgb) => normalized.includes(rgb));
  return !stored || legacyLight || legacyTeal ? fallback : stored;
}

/**
 * Luxury builder chrome for the identity sections. Mirrors the resolver in
 * experienceSections.jsx; kept local so these two modules stay independent.
 * Previously CTA read only background + textColor, so padding, width,
 * alignment, radius and shadow were silent no-ops in the inspector.
 */
function luxuryChrome(profile, { defaultAlignment = 'left', defaultRadius = 'default', defaultShadow = 'none', surfaceFallback = '#141210' } = {}) {
  const content = profile?.storefront_section_content || {};
  const layout = profile?.storefront_section_layout || {};
  const style = profile?.storefront_section_style || {};
  const width = layout.width || 'full';
  const alignment = layout.alignment || defaultAlignment;
  return {
    content,
    layout,
    style,
    alignment,
    variant: layout.variant || 'standard',
    alignmentClass: { left: 'text-left', center: 'text-center', right: 'text-right' }[alignment] || 'text-left',
    widthClass: { narrow: 'mx-auto max-w-5xl', contained: 'mx-auto max-w-6xl', full: 'mx-auto max-w-none' }[width] || 'mx-auto max-w-none',
    horizontalClass: width === 'full' ? 'px-2 sm:px-4 lg:px-6 xl:px-8' : 'px-4 sm:px-8',
    paddingClass: {
      none: 'py-0',
      small: 'py-3 sm:py-4',
      medium: 'py-4 sm:py-6',
      large: 'py-8 sm:py-10',
    }[layout.padding || 'medium'] || 'py-4 sm:py-6',
    shellRadius: {
      none: '0px',
      small: '12px',
      default: '1.2rem',
      medium: '20px',
      large: '28px',
      full: '36px',
    }[style.radius || defaultRadius] || '1.2rem',
    shellShadow: {
      none: 'none',
      small: '0 10px 28px rgba(0,0,0,.18)',
      medium: '0 24px 60px rgba(0,0,0,.28)',
      large: '0 30px 80px rgba(0,0,0,.35)',
    }[style.shadow || defaultShadow] || 'none',
    panelText: style.textColor || '#f5f1e8',
    panelBackground: luxurySurface(style.background, surfaceFallback),
  };
}

export function LuxuryAboutSection({ profile }) {
  const content = profile?.storefront_section_content || {};
  const layout = profile?.storefront_section_layout || {};
  const sectionStyle = profile?.storefront_section_style || {};
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const paragraphs = aboutParagraphs(content.body ?? profile?.about);
  const copy = identityCopy(profile, { eyebrow: 'Private profile', heading: profile?.professional_name || 'Trusted advisor' });
  const credential = content.about_badge || roleHeadline(profile);
  const editorialLabel = content.about_label || 'The advisory standard';
  const profileNote = content.about_note || 'Confidential · Considered · Personal';
  const name = profile?.professional_name || 'Trusted advisor';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const profilePhotoUrl = resolveProfilePhoto(profile);
  const { x: profileX, y: profileY, zoom: profileZoom } = resolveProfilePlacement(profile);
  const widthClass = {
    narrow: 'max-w-5xl',
    contained: 'max-w-6xl',
    full: 'w-full max-w-none',
  }[layout.width || 'full'] || 'w-full max-w-none';
  const sectionHorizontalClass = (layout.width || 'full') === 'full'
    ? 'px-2 sm:px-4 lg:px-6 xl:px-8'
    : 'px-4 sm:px-8';
  const sectionPaddingClass = {
    small: 'py-4 sm:py-5',
    medium: 'py-5 sm:py-6',
    large: 'py-8 sm:py-10',
  }[layout.padding || 'medium'];
  const alignmentClass = {
    center: 'text-center',
    right: 'text-right',
    left: 'text-left',
  }[layout.alignment || 'left'];
  const radius = {
    none: '0px',
    small: '16px',
    default: '24px',
    large: '32px',
  }[sectionStyle.radius || 'large'];
  const shadow = {
    none: 'none',
    small: '0 10px 28px rgba(0,0,0,0.18)',
    medium: '0 24px 60px rgba(0,0,0,0.28)',
    large: '0 30px 80px rgba(0,0,0,0.35)',
  }[sectionStyle.shadow || 'medium'];
  const aboutBorderColor = sectionStyle.borderColor || 'color-mix(in srgb, var(--storefront-accent) 40%, transparent)';
  const aboutCaptionBorderColor = sectionStyle.borderColor || 'color-mix(in srgb, var(--storefront-accent) 28%, transparent)';
  const cardStyleClass = {
    flat: 'border-accent/10',
    bordered: 'border-accent/15',
    elevated: 'border-accent/12',
    glass: 'border-accent/20 backdrop-blur-md',
  }[layout.cardStyle || 'bordered'] || 'border-accent/15';
  const panelText = sectionStyle.textColor || '#f5f1e8';
  if (!paragraphs.length) return null;
  return (
    <section id="about" className={`${sectionHorizontalClass} ${sectionPaddingClass}`} style={{ color: sectionStyle.textColor || undefined }}>
      <div
        className={`mx-auto grid overflow-hidden border lg:grid-cols-[0.56fr_0.44fr] ${widthClass} ${cardStyleClass}`}
        style={{
          background: luxurySurface(sectionStyle.background, '#141210'),
          color: panelText,
          borderColor: aboutBorderColor,
          borderRadius: radius,
          boxShadow: layout.cardStyle === 'flat' ? 'none' : shadow,
        }}
      >
        <aside className="relative order-1 min-h-[22rem] overflow-hidden bg-stone-900 text-white lg:order-2 lg:min-h-[32rem]">
          <div className="absolute inset-0 overflow-hidden">
            {profilePhotoUrl ? (
              <Image
                src={profilePhotoUrl}
                alt={name}
                fill
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="object-cover"
                style={{
                  objectPosition: `${profileX}% ${profileY}%`,
                  transform: `scale(${profileZoom})`,
                  transformOrigin: `${profileX}% ${profileY}%`,
                }}
              />
            ) : (
              <div className="grid h-full place-items-center font-serif text-4xl text-accent">{initials}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 border-t border-accent/20 bg-black/50 p-6 backdrop-blur-sm"
            style={{ borderTopColor: aboutCaptionBorderColor }}
          >
            <p {...editable(profile, 'about_badge', 'About credential')} className="max-w-[18rem] font-serif text-lg leading-6 text-white">{credential}</p>
            <p {...editable(profile, 'about_note', 'About profile note')} className="mt-3 text-[8px] font-bold uppercase tracking-[0.22em] text-white/60">{profileNote}</p>
          </div>
        </aside>
        <div className={`relative order-2 flex flex-col justify-center p-7 sm:p-10 lg:order-1 lg:p-14 ${alignmentClass}`}>
          <p {...editable(profile, 'eyebrow', 'About eyebrow')} className={`text-[9px] font-bold uppercase tracking-[0.28em] ${hasCustomTextColor ? 'text-current' : 'text-accent'}`} style={hasCustomTextColor ? { opacity: 0.72 } : undefined}>{copy.eyebrow}</p>
          <p {...editable(profile, 'about_label', 'About editorial label')} className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-current opacity-55">{editorialLabel}</p>
          <h2 {...editable(profile, 'heading', 'About heading')} className="mt-3 max-w-2xl font-serif text-3xl font-normal leading-[1.05] text-current sm:text-4xl">{copy.heading}</h2>
          <div className={`mt-7 h-px w-20 bg-accent/70 ${layout.alignment === 'center' ? 'mx-auto' : layout.alignment === 'right' ? 'ml-auto' : ''}`} />
          <div className="mt-7 space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                {...bodyMarker(profile, index)}
                className="text-[13px] leading-7 text-current"
                style={{ opacity: index === 0 ? 0.9 : 0.66 }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ClassicAboutSection({ profile }) {
  const sectionStyle = profile?.storefront_section_style || {};
  const content = profile?.storefront_section_content || {};
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const paragraphs = aboutParagraphs(content.body ?? profile?.about);
  const copy = identityCopy(profile, {
    eyebrow: 'Trusted local guidance',
    heading: `Meet ${profile?.professional_name || 'Your advisor'}`,
  });
  const practiceBadge = content.about_badge || 'A relationship-first real estate practice';
  const name = profile?.professional_name || 'Your advisor';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const profilePhotoUrl = resolveProfilePhoto(profile);
  const { x: profileX, y: profileY, zoom: profileZoom } = resolveProfilePlacement(profile);
  const radiusByStyle = {
    none: '0px',
    default: '16px',
    large: '32px',
  }[sectionStyle.radius || 'large'];
  const shadowByStyle = {
    none: 'none',
    small: '0 12px 34px rgba(15,23,42,0.08)',
    medium: '0 22px 60px rgba(15,23,42,0.12)',
    large: '0 30px 80px rgba(15,23,42,0.16)',
  }[sectionStyle.shadow || 'medium'];
  if (!paragraphs.length) return null;
  return (
    <section id="about" className="px-4 py-8 sm:px-8 sm:py-10">
      <div
        className="mx-auto max-w-7xl overflow-hidden border border-primary/15 bg-white/90"
        style={{
          backgroundColor: sectionStyle.background || undefined,
          color: sectionStyle.textColor || undefined,
          borderRadius: radiusByStyle,
          boxShadow: shadowByStyle,
        }}
      >
        <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[16rem] overflow-hidden bg-slate-100 sm:min-h-full">
            {profilePhotoUrl ? (
              <Image
                src={profilePhotoUrl}
                alt={name}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
                style={{
                  objectPosition: `${profileX}% ${profileY}%`,
                  transform: `scale(${profileZoom})`,
                  transformOrigin: `${profileX}% ${profileY}%`,
                }}
              />
            ) : (
              <div className="grid h-full min-h-[22rem] place-items-center bg-primary/10 text-5xl font-bold text-primary">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
          </div>
          <div className="p-6 sm:p-7 lg:p-8">
            <p data-storefront-field="content.eyebrow" data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'} data-storefront-label="About eyebrow" className={`text-[10px] font-bold uppercase tracking-[0.24em] ${hasCustomTextColor ? 'text-current' : 'text-primary'}`} style={hasCustomTextColor ? { opacity: 0.78 } : undefined}>{copy.eyebrow}</p>
            <h2 data-storefront-field="content.heading" data-storefront-source={content.heading ? 'persisted' : 'fallback'} data-storefront-label="About heading" className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${hasCustomTextColor ? 'text-current' : 'text-text-heading'}`}>{copy.heading}</h2>
            <p data-storefront-field="content.about_badge" data-storefront-source={content.about_badge ? 'persisted' : 'fallback'} data-storefront-label="About practice badge" className={`mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold ${hasCustomTextColor ? 'text-current' : 'text-text-muted'}`} style={hasCustomTextColor ? { opacity: 0.84 } : undefined}>
              <BookOpen size={14} className={hasCustomTextColor ? 'text-current' : 'text-primary'} />
              {practiceBadge}
            </p>
            <div className="mt-5 space-y-3.5">
            {paragraphs.map((paragraph, index) => (
              <p key={index} data-storefront-field="content.body" data-storefront-source={content.body ? 'persisted' : 'fallback'} data-storefront-label="About description" className={`${index === 0 ? 'text-lg leading-8' : 'text-[15px] leading-7'} ${hasCustomTextColor ? 'text-current' : (index === 0 ? 'text-text-heading' : 'text-text-body')}`} style={hasCustomTextColor ? { opacity: index === 0 ? 0.95 : 0.88 } : undefined}>
                {paragraph}
              </p>
            ))}
            </div>
          </div>
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
  const profilePhotoUrl = resolveProfilePhoto(profile);
  const { x: profileX, y: profileY, zoom: profileZoom } = resolveProfilePlacement(profile);
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
              {profilePhotoUrl ? (
                <Image
                  src={profilePhotoUrl}
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
  const templateKey = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase();
  const isFirstHomeTemplate = templateKey === 'agent-first-home';
  const profilePhotoUrl = resolveProfilePhoto(profile) || profile?.storefront_profile_fallback_url || '';
  const name = profile?.professional_name || 'Your Advisor';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'YA';
  const { x: profileX, y: profileY, zoom: profileZoom } = resolveProfilePlacement(profile);
  if (!paragraphs.length) return null;
  if (isFirstHomeTemplate) {
    return (
      <section id="about" className="w-full px-5 py-10 sm:px-8 sm:py-14 lg:px-12 2xl:px-16" style={{ color: sectionStyle.textColor || undefined }}>
        <div className="w-full max-w-none overflow-hidden rounded-[1.6rem] border border-[#5bd36d]/24 bg-white shadow-[0_20px_52px_rgba(11,61,32,0.08)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="relative min-h-[18rem] overflow-hidden bg-[#0b3d20]">
              {profilePhotoUrl ? (
                <Image
                  src={profilePhotoUrl}
                  alt={name}
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                  style={{
                    objectPosition: `${profileX}% ${profileY}%`,
                    transform: `scale(${profileZoom})`,
                    transformOrigin: `${profileX}% ${profileY}%`,
                  }}
                />
              ) : (
                <div className="grid h-full place-items-center text-5xl font-semibold text-white/80">{initials}</div>
              )}
              {/* Keep the portrait clean — no milky/blur overlay on top of the image. */}
            </aside>
            <div className="p-6 sm:p-8 lg:p-10">
              <p {...editable(profile, 'eyebrow', 'About eyebrow')} className={`text-[10px] font-bold uppercase tracking-[0.22em] ${hasCustomTextColor ? 'text-current' : 'text-primary'}`} style={hasCustomTextColor ? { opacity: 0.78 } : undefined}>{copy.eyebrow}</p>
              <h2 {...editable(profile, 'heading', 'About heading')} className={`mt-2 text-[1.9rem] font-bold leading-[1.06] tracking-[-0.02em] ${hasCustomTextColor ? 'text-current' : 'text-text-heading'} sm:text-[2.2rem]`}>{copy.heading}</h2>
              <div className="mt-5 h-px w-16 bg-accent/70" />
              <div className="mt-5 space-y-3.5">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    {...bodyMarker(profile, index)}
                    className={`${index === 0 ? 'text-[14px] leading-6' : 'text-[13px] leading-6'} ${hasCustomTextColor ? 'text-current' : 'text-text-body'}`}
                    style={hasCustomTextColor ? { opacity: 0.92 } : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="about" className="px-4 py-10 sm:py-14" style={{ color: sectionStyle.textColor || undefined }}>
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-9">
        <p {...editable(profile, 'eyebrow', 'About eyebrow')} className={`text-center text-[10px] font-bold uppercase tracking-[0.22em] ${hasCustomTextColor ? 'text-current' : 'text-primary'}`} style={hasCustomTextColor ? { opacity: 0.78 } : undefined}>{copy.eyebrow}</p>
        <h2 {...editable(profile, 'heading', 'About heading')} className={`mt-2 text-center text-3xl font-bold tracking-tight ${hasCustomTextColor ? 'text-current' : 'text-text-heading'}`}>{copy.heading}</h2>
        <div className="mx-auto mt-5 max-w-3xl space-y-4 text-center">
          {paragraphs.map((paragraph, index) => <p key={index} {...bodyMarker(profile, index)} className={`text-[15px] leading-7 ${hasCustomTextColor ? 'text-current' : 'text-text-body'}`} style={hasCustomTextColor ? { opacity: 0.92 } : undefined}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

export function FunnelAboutSection({ profile, block = {} }) {
  const sectionStyle = block?.data?.style || profile?.storefront_section_style || {};
  const sectionLayout = block?.data?.layout || {};
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const templateKey = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase();
  const isSellerExpertTemplate = templateKey === 'agent-seller-expert';
  const paragraphs = aboutParagraphs(profile?.storefront_section_content?.body ?? profile?.about);
  const profilePhoto = resolveProfilePhoto(profile);
  const placement = resolveProfilePlacement(profile, 48);
  const copy = identityCopy(profile, { eyebrow: 'Why choose us', heading: `Why work with ${profile?.professional_name || 'us'}` });
  if (!paragraphs.length) return null;
  if (isSellerExpertTemplate) {
    const forceCompactPreview = Boolean(
      profile?.storefront_builder_preview
      && ['mobile', 'tablet'].includes(profile?.storefront_preview_mode),
    );
    const cardStyle = sectionLayout.cardStyle || 'bordered';
    const cardSurfaceClass = {
      flat: 'bg-gradient-to-br from-[#020617] via-[#0b1222] to-[#111827]',
      bordered: 'bg-gradient-to-br from-[#020617] via-[#0b1222] to-[#111827] ring-1 ring-white/10',
      elevated: 'bg-gradient-to-br from-[#020617] via-[#0b1222] to-[#111827] shadow-[0_24px_55px_rgba(2,6,23,0.42)]',
      glass: 'bg-[#07111f]/90 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_20px_48px_rgba(2,6,23,0.32)]',
    }[cardStyle] || 'bg-gradient-to-br from-[#020617] via-[#0b1222] to-[#111827] ring-1 ring-white/10';
    const radiusClass = {
      none: 'rounded-none',
      large: 'rounded-[2.5rem]',
      default: 'rounded-[1.9rem]',
    }[sectionStyle.radius || 'default'] || 'rounded-[1.9rem]';
    const shadowValue = {
      none: '',
      small: '0 8px 22px rgba(2,6,23,0.2)',
      medium: '0 18px 42px rgba(2,6,23,0.3)',
      large: '0 28px 64px rgba(2,6,23,0.42)',
    }[sectionStyle.shadow || 'none'] || '';
    const alignmentClass = sectionLayout.alignment === 'center'
      ? 'text-center'
      : sectionLayout.alignment === 'right'
        ? 'text-right'
        : 'text-left';
    const leadParagraph = paragraphs[0];
    const supportParagraphs = paragraphs.slice(1, 3);
    return (
      <section id="about" className="w-full px-5 py-10 sm:px-8 sm:py-12 lg:px-12 2xl:px-16" style={{ color: sectionStyle.textColor || undefined }}>
        <div
          className={`relative grid w-full max-w-none overflow-hidden ${forceCompactPreview ? 'grid-cols-1' : 'lg:grid-cols-[1.08fr_.92fr] lg:items-stretch'} ${radiusClass} ${cardSurfaceClass}`}
          style={shadowValue ? { boxShadow: shadowValue } : undefined}
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className={`relative flex min-h-[320px] flex-col justify-center p-6 sm:p-8 lg:p-10 ${alignmentClass}`}>
            <p {...editable(profile, 'eyebrow', 'About eyebrow')} className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent/95">{copy.eyebrow}</p>
            <h2 {...editable(profile, 'heading', 'About heading')} className={`mt-2 text-2xl font-bold tracking-tight sm:text-[2rem] ${hasCustomTextColor ? 'text-current' : 'text-white'}`}>{copy.heading}</h2>
            <article className="mt-5 rounded-2xl bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[2px] sm:p-6">
              <p {...bodyMarker(profile, 0)} className={`max-w-3xl text-[14px] leading-7 ${hasCustomTextColor ? 'text-current' : 'text-slate-50/95'}`} style={hasCustomTextColor ? { opacity: 0.95 } : undefined}>
                {leadParagraph}
              </p>
            </article>
            {supportParagraphs.length ? (
            <div className={`mt-4 grid gap-3 ${forceCompactPreview ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
              {supportParagraphs.map((paragraph, index) => (
                <div key={index} className="rounded-xl bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <p {...bodyMarker(profile, index + 1)} className={`text-[13px] leading-6 ${hasCustomTextColor ? 'text-current' : 'text-slate-100/90'}`} style={hasCustomTextColor ? { opacity: 0.9 } : undefined}>
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>
            ) : null}
          </div>
          <div className="relative min-h-[320px] overflow-hidden bg-[#07111f] lg:min-h-full">
            {profilePhoto ? (
              <Image
                src={profilePhoto}
                alt={`${profile?.professional_name || 'Professional'} profile`}
                fill
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 90vw, 100vw"
                className="object-cover"
                style={{
                  objectPosition: `${placement.x}% ${placement.y}%`,
                  transform: `scale(${placement.zoom})`,
                  transformOrigin: 'center',
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300/70">
                <ShieldCheck size={30} />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#020617]/42 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="about" className="px-4 py-10 sm:py-12" style={{ color: sectionStyle.textColor || undefined }}>
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p {...editable(profile, 'eyebrow', 'About eyebrow')} className={`text-[10px] font-bold uppercase tracking-[0.22em] ${hasCustomTextColor ? 'text-current' : 'text-primary'}`} style={hasCustomTextColor ? { opacity: 0.78 } : undefined}>{copy.eyebrow}</p>
        <h2 {...editable(profile, 'heading', 'About heading')} className={`mt-2 text-2xl font-bold tracking-tight ${hasCustomTextColor ? 'text-current' : 'text-text-heading'}`}>{copy.heading}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="rounded-xl bg-slate-50 p-4">
              <p {...bodyMarker(profile, index)} className={`text-sm leading-6 ${hasCustomTextColor ? 'text-current' : 'text-text-body'}`} style={hasCustomTextColor ? { opacity: 0.9 } : undefined}>{paragraph}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NeighborhoodAboutSection({ profile }) {
  const content = profile?.storefront_section_content || {};
  const layout = profile?.storefront_section_layout || {};
  const sectionStyle = profile?.storefront_section_style || {};
  const paragraphs = aboutParagraphs(profile?.storefront_section_content?.body ?? profile?.about);
  const copy = identityCopy(profile, {
    eyebrow: 'The local perspective',
    heading: `A guide to ${profile?.service_area || 'your next neighborhood'}`,
  });
  const profilePhotoUrl = resolveProfilePhoto(profile);
  const placement = resolveProfilePlacement(profile, 42);
  const name = profile?.professional_name || 'Your local advisor';
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const forceCompactPreview = profile?.storefront_builder_preview
    && ['mobile', 'tablet'].includes(profile?.storefront_preview_mode);
  const widthClass = { narrow: 'max-w-5xl', contained: 'max-w-6xl', full: 'max-w-none' }[layout.width || 'contained'] || 'max-w-6xl';
  const paddingClass = { none: 'py-0', small: 'py-6', medium: 'py-10 sm:py-12', large: 'py-12 sm:py-16' }[layout.padding || 'large'] || 'py-12 sm:py-16';
  const alignmentClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[layout.alignment || 'left'] || 'text-left';
  const radius = { none: 0, small: 12, default: 20, medium: 24, large: 32, full: 40 }[sectionStyle.radius || 'large'] ?? 32;
  const shadow = {
    none: 'none',
    small: '0 8px 24px rgba(23,21,43,.08)',
    medium: '0 18px 48px rgba(23,21,43,.12)',
    large: '0 24px 65px rgba(23,21,43,.16)',
  }[sectionStyle.shadow || 'medium'] || '0 18px 48px rgba(23,21,43,.12)';
  if (!paragraphs.length) return null;
  return (
    <section id="about" className={`px-4 sm:px-8 ${paddingClass}`} style={{ color: sectionStyle.textColor || undefined }}>
      <div
        className={`mx-auto overflow-hidden border border-primary/10 bg-white ${widthClass}`}
        style={{
          background: sectionStyle.background || undefined,
          borderColor: sectionStyle.borderColor || undefined,
          borderRadius: radius,
          boxShadow: layout.cardStyle === 'flat' ? 'none' : shadow,
        }}
      >
        <div className={`grid ${forceCompactPreview ? 'grid-cols-1' : 'lg:grid-cols-[.82fr_1.18fr]'}`}>
          <div
            data-storefront-field="brandKit.profile_photo_url"
            data-storefront-source={profilePhotoUrl ? 'profile' : 'fallback'}
            data-storefront-label="Profile photo"
            className="relative min-h-[22rem] overflow-hidden bg-primary sm:min-h-[28rem]"
          >
            {profilePhotoUrl ? (
              <Image
                src={profilePhotoUrl}
                alt={name}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out"
                style={{
                  objectPosition: `${placement.x}% ${placement.y}%`,
                  transform: `scale(${placement.zoom})`,
                  transformOrigin: `${placement.x}% ${placement.y}%`,
                }}
              />
            ) : (
              <div className="grid h-full min-h-[22rem] place-items-center text-white/55 sm:min-h-[28rem]">
                <MapPin size={42} />
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/65 to-transparent" />
          </div>
          <div className={`relative flex items-center p-7 sm:p-10 lg:p-12 ${alignmentClass}`}>
            <span className="pointer-events-none absolute right-0 top-0 h-20 w-20 border-r border-t border-accent/35" />
            <div className="w-full max-w-2xl">
              <div>
                <p {...editable(profile, 'eyebrow', 'About eyebrow')} className="inline-flex rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-contrast">{copy.eyebrow}</p>
                <h2 {...editable(profile, 'heading', 'About heading')} className={`mt-2 text-3xl font-bold tracking-[-.035em] ${hasCustomTextColor ? 'text-current' : 'text-slate-900'}`}>{copy.heading}</h2>
              </div>
              <div className="mt-6 h-px w-20 bg-gradient-to-r from-accent to-transparent" />
              <div className="mt-6 space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} {...bodyMarker(profile, index)} className={`${index === 0 ? 'text-[16px] leading-8' : 'text-[14px] leading-7'} ${hasCustomTextColor ? 'text-current' : index === 0 ? 'text-slate-800' : 'text-slate-600'}`}>
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
  const content = profile?.storefront_section_content || {};
  const layout = profile?.storefront_section_layout || {};
  const sectionStyle = profile?.storefront_section_style || {};
  const panelText = sectionStyle.textColor || '#f5f1e8';
  const widthClass = {
    narrow: 'max-w-5xl',
    contained: 'max-w-6xl',
    full: 'w-full max-w-none',
  }[layout.width || 'full'] || 'w-full max-w-none';
  const sectionHorizontalClass = (layout.width || 'full') === 'full'
    ? 'px-2 sm:px-4 lg:px-6 xl:px-8'
    : 'px-4 sm:px-8';
  const sectionPaddingClass = {
    none: 'py-0',
    small: 'py-4 sm:py-5',
    medium: 'py-5 sm:py-6',
    large: 'py-7 sm:py-9',
  }[layout.padding || 'medium'] || 'py-5 sm:py-6';
  const alignmentClass = {
    center: 'text-center',
    right: 'text-right',
    left: 'text-left',
  }[layout.alignment || 'left'];
  const shellRadius = {
    none: '0px',
    small: '14px',
    default: '20px',
    large: '28px',
  }[sectionStyle.radius || 'default'];
  const shellShadow = {
    none: 'none',
    small: '0 12px 30px rgba(0,0,0,0.18)',
    medium: '0 24px 56px rgba(0,0,0,0.28)',
    large: '0 30px 80px rgba(0,0,0,0.35)',
  }[sectionStyle.shadow || 'medium'];
  const ctaBorderColor = sectionStyle.borderColor || 'color-mix(in srgb, var(--storefront-accent) 52%, transparent)';
  const ctaRuleColor = sectionStyle.borderColor || 'color-mix(in srgb, var(--storefront-accent) 42%, transparent)';
  return (
    <section id="contact" className={`${sectionHorizontalClass} ${sectionPaddingClass}`}>
      <div
        className={`relative mx-auto grid w-full overflow-hidden border border-white/12 md:grid-cols-[1fr_auto] md:items-center ${widthClass} ${alignmentClass}`}
        style={{
          background: luxurySurface(sectionStyle.background, '#141210'),
          color: panelText,
          borderColor: ctaBorderColor,
          borderRadius: shellRadius,
          boxShadow: shellShadow,
        }}
      >
        <div className="p-5 sm:p-6 lg:p-7">
          <p {...editable(profile, 'eyebrow', 'CTA eyebrow')} className="text-[8px] font-semibold uppercase tracking-[0.26em] text-accent">{copy.eyebrow}</p>
          <div className="mt-2 h-px w-16" style={{ background: ctaRuleColor }} />
          <h3 {...editable(profile, 'heading', 'CTA heading')} className="mt-3 max-w-3xl font-serif text-[2rem] font-normal leading-tight text-current sm:text-[2.35rem]">{copy.heading}</h3>
          <p {...editable(profile, 'body', 'CTA description')} className="mt-2.5 max-w-2xl text-[12px] leading-6 text-current opacity-68">{copy.body}</p>
        </div>
        <button
          type="button"
          onClick={actions.onDirectLeadClick}
          {...editable(profile, 'cta_label', 'CTA button')}
          className="m-5 inline-flex items-center justify-center gap-2.5 rounded-full border border-accent/55 bg-accent px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] sm:m-6 lg:m-7"
          style={{
            background: content.button_background || 'var(--storefront-accent)',
            color: content.button_text_color || '#1a1510',
            borderColor: ctaBorderColor,
          }}
        >
          {copy.ctaLabel}
          <ArrowRight size={13} />
        </button>
      </div>
    </section>
  );
}

export function ClassicCtaSection({ profile, actions }) {
  const content = profile?.storefront_section_content || {};
  const copy = identityCopy(profile, {
    eyebrow: 'A clear next step',
    heading: 'Start with a conversation',
    body: ctaDescription(profile),
    ctaLabel: 'Plan my next move',
  });
  return (
    <section id="contact" className="px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[2rem] border border-primary/15 bg-white/95 p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-9 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-3xl">
          <p data-storefront-field="content.eyebrow" data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'} data-storefront-label="CTA eyebrow" className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
          <h3 data-storefront-field="content.heading" data-storefront-source={content.heading ? 'persisted' : 'fallback'} data-storefront-label="CTA heading" className="mt-3 text-3xl font-bold tracking-tight text-text-heading">{copy.heading}</h3>
          <p data-storefront-field="content.body" data-storefront-source={content.body ? 'persisted' : 'fallback'} data-storefront-label="CTA description" className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">{copy.body}</p>
        </div>
        <button type="button" onClick={actions.onDirectLeadClick} data-storefront-field="content.cta_label" data-storefront-source={content.cta_label ? 'persisted' : 'fallback'} data-storefront-label="CTA button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold shadow-lg shadow-primary/10" style={{ color: 'var(--storefront-primary-contrast)' }}>
          {copy.ctaLabel}
          <ArrowRight size={15} />
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
          <p {...editable(profile, 'eyebrow', 'CTA eyebrow')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{copy.eyebrow}</p>
          <h3 {...editable(profile, 'heading', 'CTA heading')} className="mt-2 text-2xl font-bold uppercase tracking-[0.08em] text-slate-900">{copy.heading}</h3>
          <p {...editable(profile, 'body', 'CTA description')} className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{copy.body}</p>
        </div>
        <button
          type="button"
          onClick={actions.onDirectLeadClick}
          {...editable(profile, 'cta_label', 'CTA button')}
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
  const templateKey = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase();
  const isFirstHomeTemplate = templateKey === 'agent-first-home';
  const content = profile?.storefront_section_content || {};
  const sectionStyle = profile?.storefront_section_style || {};
  if (isFirstHomeTemplate) {
    return (
      <section id="contact" className="px-4 py-10 sm:py-14" style={{ color: sectionStyle.textColor || undefined }}>
        <div
          className="mx-auto max-w-7xl overflow-hidden rounded-[1.6rem] border border-[#5bd36d]/24 bg-white shadow-[0_20px_52px_rgba(11,61,32,0.08)]"
          style={{ backgroundColor: sectionStyle.background || undefined }}
        >
          <div className="relative grid gap-6 px-6 py-8 text-center sm:px-10 sm:py-10 md:grid-cols-[1fr_auto] md:items-center md:text-left">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(91,211,109,0.18),transparent_48%)]" aria-hidden="true" />
            <div className="relative">
              <p
                {...editable(profile, 'eyebrow', 'CTA eyebrow')}
                className={`text-[10px] font-bold uppercase tracking-[0.24em] ${sectionStyle.textColor ? 'text-current' : 'text-primary'}`}
                style={sectionStyle.textColor ? { opacity: 0.82 } : undefined}
              >
                {copy.eyebrow}
              </p>
              <h3
                {...editable(profile, 'heading', 'CTA heading')}
                className={`mt-2 text-[1.95rem] font-bold tracking-tight sm:text-[2.25rem] ${sectionStyle.textColor ? 'text-current' : 'text-text-heading'}`}
              >
                {copy.heading}
              </h3>
              <p
                {...editable(profile, 'body', 'CTA description')}
                className={`mx-auto mt-3 max-w-2xl text-[13px] leading-6 md:mx-0 ${sectionStyle.textColor ? 'text-current' : 'text-text-muted'}`}
                style={sectionStyle.textColor ? { opacity: 0.9 } : undefined}
              >
                {copy.body}
              </p>
            </div>
            <div className="relative flex justify-center md:justify-end">
              <button
                type="button"
                onClick={actions.onDirectLeadClick}
                {...editable(profile, 'cta_label', 'CTA button')}
                className="storefront-first-home-cta-button inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] !text-white shadow-[0_16px_34px_rgba(11,61,32,0.18)] transition hover:-translate-y-0.5"
                style={{
                  background: content.button_background || 'var(--storefront-accent)',
                  color: '#ffffff',
                }}
              >
                {copy.ctaLabel}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="contact" className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-7 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-10">
        <p {...editable(profile, 'eyebrow', 'CTA eyebrow')} className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <h3 {...editable(profile, 'heading', 'CTA heading')} className="mt-2 text-3xl font-bold tracking-tight text-text-heading">{copy.heading}</h3>
        <p {...editable(profile, 'body', 'CTA description')} className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-muted">{copy.body}</p>
        <button type="button" onClick={actions.onDirectLeadClick} {...editable(profile, 'cta_label', 'CTA button')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          {copy.ctaLabel}
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

export function FunnelCtaSection({ profile, actions }) {
  const templateKey = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase();
  const isSellerExpertTemplate = templateKey === 'agent-seller-expert';
  const copy = identityCopy(profile, { eyebrow: 'Final step', heading: 'Complete your request', body: ctaDescription(profile), ctaLabel: 'Continue' });
  if (isSellerExpertTemplate) {
    const forceCompactPreview = Boolean(
      profile?.storefront_builder_preview
      && ['mobile', 'tablet'].includes(profile?.storefront_preview_mode),
    );
    return (
      <section id="contact" className="w-full px-5 py-10 sm:px-8 sm:py-12 lg:px-12 2xl:px-16">
        <div className={`relative grid w-full max-w-none overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-[#020617] via-[#0b1222] to-[#111827] shadow-[0_24px_55px_rgba(2,6,23,0.34)] ring-1 ring-white/5 ${forceCompactPreview ? 'grid-cols-1' : 'md:grid-cols-[1fr_auto] md:items-center'}`}>
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-accent/18 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative p-6 sm:p-8 lg:p-10">
            <p {...editable(profile, 'eyebrow', 'CTA eyebrow')} className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">{copy.eyebrow}</p>
            <h3 {...editable(profile, 'heading', 'CTA heading')} className="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl">{copy.heading}</h3>
            <p {...editable(profile, 'body', 'CTA description')} className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-100/90">{copy.body}</p>
            <div className={`mt-5 grid max-w-4xl gap-2 ${forceCompactPreview ? 'grid-cols-1' : 'sm:grid-cols-3'}`}>
              {['Share your goal', 'Add property details', 'Receive a seller plan'].map((step) => (
                <div key={step} className="flex items-center gap-2 rounded-xl bg-white/[0.055] px-3 py-2 text-[11px] font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <CheckCircle2 size={13} className="text-accent" />
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className={`relative flex flex-col gap-3 border-t border-white/10 p-6 sm:p-8 lg:p-10 ${forceCompactPreview ? '' : 'md:min-w-[17rem] md:border-l md:border-t-0'}`}>
            <button type="button" onClick={actions.onDirectLeadClick} {...editable(profile, 'cta_label', 'CTA button')} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(6,182,212,0.22)] transition hover:-translate-y-0.5 hover:brightness-110">
              {copy.ctaLabel}
              <ArrowRight size={15} />
            </button>
            <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-100/85">
              <ShieldCheck size={12} className="text-accent" />
              Secure seller intake
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="contact" className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p {...editable(profile, 'eyebrow', 'CTA eyebrow')} className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <h3 {...editable(profile, 'heading', 'CTA heading')} className="mt-2 text-2xl font-bold tracking-tight text-text-heading">{copy.heading}</h3>
        <p {...editable(profile, 'body', 'CTA description')} className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{copy.body}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {['Tell us your goal', 'Share your details', 'Get a follow-up plan'].map((step) => (
            <div key={step} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
              <CheckCircle2 size={13} className="text-primary" />
              {step}
            </div>
          ))}
        </div>
        <button type="button" onClick={actions.onDirectLeadClick} {...editable(profile, 'cta_label', 'CTA button')} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
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

export function NeighborhoodCtaSection({ profile, actions }) {
  const content = profile?.storefront_section_content || {};
  const layout = profile?.storefront_section_layout || {};
  const sectionStyle = profile?.storefront_section_style || {};
  const rawPrimary = String(content.cta_label || '').trim();
  const legacyPrimary = /^(message me|submit inquiry)$/i.test(rawPrimary);
  // Older Community publishes stored the primary CTA in secondary_cta_label.
  const legacySecondaryPrimary = String(content.secondary_cta_label || '').trim();
  const primaryFromLegacySecondary =
    /^send detailed inquiry$/i.test(legacySecondaryPrimary)
    && (!rawPrimary || legacyPrimary || /^book an appointment$/i.test(rawPrimary));
  const primaryLabel = primaryFromLegacySecondary
    ? legacySecondaryPrimary
    : (rawPrimary && !legacyPrimary ? rawPrimary : 'Send detailed inquiry');
  const copy = identityCopy(profile, {
    eyebrow: 'Start your local move',
    heading: 'Talk local with someone who knows',
    body: ctaDescription(profile),
    ctaLabel: primaryLabel,
  });
  const widthClass = { narrow: 'max-w-5xl', contained: 'max-w-6xl', full: 'max-w-none' }[layout.width || 'contained'] || 'max-w-6xl';
  const paddingClass = { none: 'py-0', small: 'py-6', medium: 'py-10 sm:py-12', large: 'py-12 sm:py-16' }[layout.padding || 'large'] || 'py-12 sm:py-16';
  const alignmentClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[layout.alignment || 'center'] || 'text-center';
  const radius = { none: 0, small: 12, default: 20, medium: 24, large: 32, full: 40 }[sectionStyle.radius || 'large'] ?? 32;
  const shadow = {
    none: 'none',
    small: '0 8px 24px rgba(23,21,43,.12)',
    medium: '0 18px 48px rgba(23,21,43,.18)',
    large: '0 28px 70px rgba(23,21,43,.24)',
  }[sectionStyle.shadow || 'none'] || 'none';
  return (
    <section id="contact" className={`px-4 sm:px-8 ${paddingClass}`}>
      <div
        className={`mx-auto px-7 py-9 text-white sm:px-10 sm:py-12 ${widthClass} ${alignmentClass}`}
        style={{
          background: sectionStyle.background || 'color-mix(in srgb, var(--storefront-primary, #17152b) 78%, #061022)',
          color: sectionStyle.textColor || '#ffffff',
          borderRadius: radius,
          boxShadow: shadow,
        }}
      >
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div className="min-w-0 flex-1 text-left">
            <p {...editable(profile, 'eyebrow', 'CTA eyebrow')} className="text-[10px] font-bold uppercase tracking-[0.24em] text-white">{copy.eyebrow}</p>
            <h3 {...editable(profile, 'heading', 'CTA heading')} className="mt-3 text-3xl font-bold tracking-tight text-current">{copy.heading}</h3>
            <p {...editable(profile, 'body', 'CTA description')} className="mt-3 max-w-2xl text-sm leading-6 text-current opacity-75">{copy.body}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2.5 sm:items-end">
            <button
              type="button"
              onClick={() => {
                if (actions.onDirectLeadClick) {
                  actions.onDirectLeadClick();
                  return;
                }
                actions.onCtaClick?.('community_primary_cta');
              }}
              {...editable(profile, 'cta_label', 'Primary CTA button')}
              className="inline-flex items-center justify-center gap-2 border border-accent bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast shadow-[0_10px_24px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5 hover:brightness-110"
              style={{ borderRadius: 'var(--storefront-radius, 0.75rem)' }}
            >
              {primaryLabel}
              <ArrowRight size={15} />
            </button>
            {content.helper_text || profile?.storefront_builder_preview ? (
              <p
                {...editable(profile, 'helper_text', 'CTA helper text')}
                className={`mt-1 text-xs text-current opacity-65 ${!content.helper_text ? 'opacity-40' : ''}`}
              >
                {content.helper_text || 'Add helper text under the button'}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
