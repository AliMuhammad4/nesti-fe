'use client';

import Image from 'next/image';
import { Building2, UserPlus } from 'lucide-react';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';

const ROLE_HERO = {
  agent: {
    fallbackHeadline: (name) => `Move smarter with ${name}`,
    fallbackTagline:
      'Get guided support for buying, selling, pricing, showings, and consultation requests in one organized experience.',
    cardSubtitle: 'Local Real Estate Agent',
  },
  mortgage_broker: {
    fallbackHeadline: (name) => `Plan your financing with ${name}`,
    fallbackTagline:
      'Start a guided mortgage inquiry for pre-approval, affordability, refinancing, and document readiness.',
    cardSubtitle: 'Mortgage Planning Specialist',
  },
  lawyer: {
    fallbackHeadline: (name) => `Close with clarity beside ${name}`,
    fallbackTagline:
      'Ask about contracts, title matters, closing timelines, and legal transaction support before your next step.',
    cardSubtitle: 'Real Estate Legal Advisor',
  },
};

function hexLuminance(hex) {
  const value = String(hex || '').trim();
  if (!/^#[0-9a-f]{6}$/i.test(value)) return null;
  const channels = [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)]
    .map((part) => parseInt(part, 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function isDarkHex(hex) {
  const lum = hexLuminance(hex);
  return lum != null ? lum < 0.42 : false;
}

export default function PublicHero({
  profile,
  onCTAClick,
  onDirectLeadClick,
  onAppointmentClick,
  block,
  flushTop = false,
}) {
  const professionalType = profile.professional_type;
  const sectionLayout = block?.data?.layout || block?.layout || {};
  const heroMediaPosition = sectionLayout.mediaPosition || 'background';
  const showCover = heroMediaPosition !== 'none';
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const coverPosition = profile.storefront_cover_position || {};
  const coverX = clamp(coverPosition.x, 0, 100, 50);
  const coverY = clamp(coverPosition.y, 0, 100, 50);
  const coverZoom = clamp(profile.storefront_cover_zoom, 1, 3, 1);
  const profilePosition = profile.storefront_profile_position || {};
  const profileX = clamp(profilePosition.x, 0, 100, 50);
  const profileY = clamp(profilePosition.y, 0, 100, 25);
  const profileZoom = clamp(profile.storefront_profile_zoom, 1, 3, 1);
  const coverPhotoStyle = {
    objectPosition: `${coverX}% ${coverY}%`,
    transform: `scale(${coverZoom})`,
    transformOrigin: `${coverX}% ${coverY}%`,
  };
  const profilePhotoStyle = {
    objectPosition: `${profileX}% ${profileY}%`,
    transform: `scale(${profileZoom})`,
    transformOrigin: `${profileX}% ${profileY}%`,
  };
  const coverRenderKey = `${profile.cover_photo_url}-${coverX}-${coverY}-${coverZoom}`;
  const profileRenderKey = `${profile.profile_photo_url}-${profileX}-${profileY}-${profileZoom}`;
  const heroContent = ROLE_HERO[professionalType] || ROLE_HERO.agent;
  const content = profile.storefront_section_content || {};
  const isBuilderPreview = Boolean(profile.storefront_builder_preview);
  const previewMode = profile.storefront_preview_mode || 'desktop';
  const forceCompactPreview = isBuilderPreview && (previewMode === 'mobile' || previewMode === 'tablet');
  const forceMobilePreview = isBuilderPreview && previewMode === 'mobile';
  const professionalProfile = profile.professional_profile || {};
  const companyName = professionalProfile.company_name || '';
  const usesCanonicalHeroCopy = ['lawyer-newcomer', 'mortgage_broker-renewal']
    .includes(String(profile.storefront_template_key || '').toLowerCase());
  const heroName = content.hero_name || profile.professional_name || 'Professional';
  const heroSubtitle = (usesCanonicalHeroCopy ? content.heading : content.hero_subtitle)
    || profile.headline
    || heroContent.fallbackHeadline(profile.professional_name || 'this professional');
  const heroEyebrow = usesCanonicalHeroCopy
    ? (content.eyebrow || profile.hero_eyebrow || '')
    : '';
  const heroBody = usesCanonicalHeroCopy
    ? (content.body || profile.tagline || heroContent.fallbackTagline)
    : '';
  const heroCompanyBadge = content.hero_company_badge || companyName;
  const roleLabel =
    professionalType === 'mortgage_broker'
      ? 'Mortgage Broker'
      : professionalType === 'lawyer'
        ? 'Real Estate Lawyer'
        : 'Real Estate Agent';
  const inviteShareUrl = String(profile.invite_link?.share_url || '').trim();
  const joinHref = inviteShareUrl || '/sign-up';
  const calendlyLink = profile.professional_profile?.calendly_link || '';
  const trackedCalendlyLink = buildTrackedCalendlyUrl(calendlyLink, profile);
  const handleConsultationClick = () => {
    if (trackedCalendlyLink) {
      window.open(trackedCalendlyLink, '_blank', 'noopener,noreferrer');
      onAppointmentClick?.();
      return;
    }
    onCTAClick?.('book_consultation');
  };
  const heroCardBackground = content.hero_card_background || '';
  const heroCardTextColor = content.hero_card_text_color || '';
  const heroStripBackground = content.hero_strip_background || '';
  const isBrokerRenewal = String(profile.storefront_template_key || '').toLowerCase() === 'mortgage_broker-renewal';
  const primaryCtaLabel = String(
    content.primary_cta_label
    || (isBrokerRenewal ? 'Review my renewal' : 'Submit inquiry'),
  ).trim();
  // Builder secondary field is content.cta_label. Ignore duplicates of the primary label.
  const rawSecondaryLabel = String(
    content.cta_label || content.secondary_cta_label || '',
  ).trim();
  const secondaryCtaLabel = (
    rawSecondaryLabel
    && rawSecondaryLabel.toLowerCase() !== primaryCtaLabel.toLowerCase()
  )
    ? rawSecondaryLabel
    : (isBrokerRenewal
      ? 'Book a consultation'
      : (profile.hero_cta_label || 'Book a Free Consultation'));
  const joinCtaLabel = String(content.join_label || 'Join Nesti').trim() || 'Join Nesti';
  const showJoinCta = isBrokerRenewal || Boolean(inviteShareUrl);
  const primaryButtonBackground = content.primary_button_background || '';
  const primaryButtonTextColor = content.primary_button_text_color || '';
  const secondaryButtonBackground = content.secondary_button_background || '';
  const secondaryButtonTextColor = content.secondary_button_text_color || '';
  const cardBgForContrast = heroCardBackground || '#ffffff';
  const cardBgIsDark = isDarkHex(cardBgForContrast);
  const headingColor = heroCardTextColor || (cardBgIsDark ? '#f8fafc' : '#0f172a');
  const subtitleColor = heroCardTextColor || (cardBgIsDark ? '#dbeafe' : '#475569');
  const badgeBackground = cardBgIsDark ? 'rgba(255,255,255,0.12)' : '#ffffff';
  const badgeBorder = cardBgIsDark ? 'rgba(255,255,255,0.25)' : '#e2e8f0';
  const badgeTextColor = cardBgIsDark ? '#f8fafc' : '#1e293b';
  const resolvedPrimaryButtonTextColor = primaryButtonTextColor
    || (primaryButtonBackground ? (isDarkHex(primaryButtonBackground) ? '#f8fafc' : '#0f172a') : '');
  const resolvedSecondaryButtonTextColor = secondaryButtonTextColor
    || (secondaryButtonBackground ? (isDarkHex(secondaryButtonBackground) ? '#f8fafc' : '#0f172a') : '');
  const primaryButtonClass = primaryButtonBackground
    ? 'storefront-btn inline-flex h-10 items-center justify-center px-5 text-[13px] font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.20)] transition hover:-translate-y-px hover:opacity-95'
    : 'storefront-btn inline-flex h-10 items-center justify-center bg-primary px-5 text-[13px] font-semibold text-primary-contrast shadow-lg shadow-primary/20 transition hover:-translate-y-px hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25';
  const secondaryButtonClass = secondaryButtonBackground
    ? 'storefront-btn inline-flex h-10 items-center justify-center border px-5 text-[13px] font-semibold transition hover:-translate-y-px hover:opacity-95 whitespace-nowrap'
    : 'storefront-btn inline-flex h-10 items-center justify-center border border-slate-300 bg-white px-5 text-[13px] font-semibold text-slate-700 transition hover:-translate-y-px hover:border-primary/40 hover:bg-primary/5 hover:text-primary whitespace-nowrap';
  const heroCardDesktopPaddingClass = forceCompactPreview
    ? ''
    : (usesCanonicalHeroCopy ? 'lg:pr-80' : 'lg:pr-56');
  const heroCompanyBadgeClass = forceCompactPreview
    ? 'mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-bold shadow-sm'
    : `mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-bold shadow-sm lg:absolute lg:right-6 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 lg:px-3.5 lg:py-2 lg:text-sm ${
        usesCanonicalHeroCopy ? 'lg:max-w-72' : 'lg:max-w-48'
      }`;

  const sectionStyle = block?.data?.style || block?.style || {};
  // Prefer the live brand kit canvas from the renderer theme.
  const pageCanvas = profile?.storefront_theme?.canvas || '#ffffff';
  const rawHeroBand = String(sectionStyle.background || '').trim();
  const rawHeroBandNormalized = rawHeroBand.toLowerCase();
  // Canonical agent/lawyer-style heroes (incl. Renewal) keep the under-card band on the
  // page background. Template primary fills used to leak as a solid sky/teal/charcoal strip.
  const templateHeroBandColors = new Set([
    '',
    'transparent',
    '#0e1116',
    '#07090c',
    '#155e75',
    '#0f3d4a',
    '#0f766e',
    '#3d2430',
    '#1f1218',
    '#4a2536',
    '#0c2139',
    '#102a43',
    '#008fd5',
    '#1b4b73',
  ]);
  const heroBandBackground = usesCanonicalHeroCopy
    ? (
      rawHeroBand
      && !templateHeroBandColors.has(rawHeroBandNormalized)
        ? rawHeroBand
        : pageCanvas
    )
    : (rawHeroBand || pageCanvas);
  const resolvedHeroStripBackground = heroStripBackground || heroBandBackground;

  return (
    <section
      className="relative pt-16"
      style={{ backgroundColor: heroBandBackground }}
    >
      <PublicStorefrontHeader
        profile={profile}
        forceCompactPreview={forceCompactPreview}
        forceMobilePreview={forceMobilePreview}
      />

      <div className="relative border-b border-slate-200/70" style={{ backgroundColor: resolvedHeroStripBackground }}>
        {/* Cover spans the contained col-12 canvas (not viewport full-bleed). */}
        {showCover ? (
          <div data-storefront-field="brandKit.cover_url" data-storefront-source="profile" data-storefront-label="Cover image" className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64 lg:h-80">
          {profile.cover_photo_url ? (
            <Image
              key={coverRenderKey}
              src={profile.cover_photo_url}
              alt={`${profile.professional_name || 'Professional'} cover`}
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover object-center"
              style={coverPhotoStyle}
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-slate-100 to-primary/15" />
          )}
          </div>
        ) : null}

        <div className={`relative px-4 pb-8 sm:px-6 lg:px-8 ${showCover ? '' : 'pt-8'}`}>
          <div className={`relative flex flex-col items-start gap-4 ${showCover ? '-mt-16 sm:-mt-20' : ''} ${forceMobilePreview ? '' : `${showCover ? 'md:-mt-24' : ''} md:flex-row md:items-start md:gap-6`}`}>
            <div data-storefront-field="brandKit.profile_photo_url" data-storefront-source="profile" data-storefront-label="Profile photo" className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[5px] border-white bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.18)] sm:h-32 sm:w-32 md:h-40 md:w-40">
                {profile.profile_photo_url ? (
                  <Image
                    key={`hero-${profileRenderKey}`}
                    src={profile.profile_photo_url}
                    alt={profile.professional_name || roleLabel}
                    fill
                    sizes="160px"
                    className="object-cover object-top"
                    style={profilePhotoStyle}
                    priority
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-5xl font-bold text-primary">
                    {profile.professional_name?.charAt(0) || 'P'}
                  </div>
                )}
              </div>

            <div
              className={`relative mt-0 w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_22px_56px_rgba(15,23,42,0.14)] sm:p-5 ${forceMobilePreview ? '' : 'md:mt-16 md:flex-1 md:p-6'} ${heroCardDesktopPaddingClass}`}
              style={{
                ...(heroCardBackground ? { backgroundColor: heroCardBackground } : {}),
                ...(heroCardTextColor ? { color: heroCardTextColor } : {}),
              }}
            >
              {heroEyebrow ? (
                <p
                  data-storefront-field="content.eyebrow"
                  data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
                  data-storefront-label="Hero eyebrow"
                  className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
                >
                  {heroEyebrow}
                </p>
              ) : null}
              <h1
                data-storefront-field="content.hero_name"
                data-storefront-source={content.hero_name ? 'persisted' : 'fallback'}
                data-storefront-label="Hero card name"
                className="text-2xl font-bold tracking-tight sm:text-[30px] md:text-3xl"
                style={{ color: headingColor }}
              >
                {heroName}
              </h1>
              <p
                data-storefront-field={usesCanonicalHeroCopy ? 'content.heading' : 'content.hero_subtitle'}
                data-storefront-source={(usesCanonicalHeroCopy ? content.heading : content.hero_subtitle) ? 'persisted' : 'fallback'}
                data-storefront-label={usesCanonicalHeroCopy ? 'Hero heading' : 'Hero card subtitle'}
                className="mt-2 text-[14px] leading-6 md:text-[15px]"
                style={{ color: subtitleColor, opacity: heroCardTextColor ? 0.92 : 1 }}
              >
                {heroSubtitle}
              </p>
              {heroBody ? (
                <p
                  data-storefront-field="content.body"
                  data-storefront-source={content.body ? 'persisted' : 'fallback'}
                  data-storefront-label="Hero description"
                  className="mt-2 max-w-2xl text-[12px] leading-5 md:text-[13px]"
                  style={{ color: subtitleColor, opacity: heroCardTextColor ? 0.78 : 0.88 }}
                >
                  {heroBody}
                </p>
              ) : null}
              <div className={`mt-4 flex items-center gap-2 ${forceMobilePreview ? 'flex-col items-stretch' : 'flex-wrap'}`}>
                  <button
                    type="button"
                    onClick={onDirectLeadClick}
                    data-storefront-field="content.primary_cta_label"
                    data-storefront-source={content.primary_cta_label ? 'persisted' : 'fallback'}
                    data-storefront-label="Primary hero button"
                    className={`${primaryButtonClass} w-full whitespace-nowrap sm:w-auto`}
                    style={{
                      borderRadius: 'var(--storefront-radius)',
                      ...(primaryButtonBackground ? { backgroundColor: primaryButtonBackground } : {}),
                      ...(resolvedPrimaryButtonTextColor ? { color: resolvedPrimaryButtonTextColor } : {}),
                    }}
                  >
                    {primaryCtaLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleConsultationClick}
                    data-storefront-field="content.cta_label"
                    data-storefront-source={content.cta_label ? 'persisted' : (profile.hero_cta_label ? 'persisted' : 'fallback')}
                    data-storefront-label="Consultation button"
                    className={`${secondaryButtonClass} w-full sm:w-auto`}
                    style={{
                      borderRadius: 'var(--storefront-radius)',
                      ...(secondaryButtonBackground ? {
                        backgroundColor: secondaryButtonBackground,
                        borderColor: secondaryButtonBackground,
                      } : {}),
                      ...(resolvedSecondaryButtonTextColor ? { color: resolvedSecondaryButtonTextColor } : {}),
                    }}
                  >
                    {secondaryCtaLabel}
                  </button>
                  {showJoinCta ? (
                    <a
                      href={joinHref}
                      target={inviteShareUrl ? '_blank' : undefined}
                      rel={inviteShareUrl ? 'noopener noreferrer' : undefined}
                      data-storefront-field="content.join_label"
                      data-storefront-source={content.join_label ? 'persisted' : 'fallback'}
                      data-storefront-label="Join Nesti button"
                      className="storefront-btn inline-flex h-10 w-full items-center justify-center gap-1.5 border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary whitespace-nowrap sm:w-auto"
                      style={{ borderRadius: 'var(--storefront-radius)' }}
                    >
                      <UserPlus size={14} />
                      {joinCtaLabel}
                    </a>
                  ) : null}
              </div>

              {heroCompanyBadge ? (
                <span
                  data-storefront-field="content.hero_company_badge"
                  data-storefront-source={content.hero_company_badge ? 'persisted' : 'fallback'}
                  data-storefront-label="Hero company badge"
                  className={heroCompanyBadgeClass}
                  style={{
                    backgroundColor: badgeBackground,
                    borderColor: badgeBorder,
                    color: badgeTextColor,
                  }}
                >
                  <Building2 size={14} className="shrink-0" style={{ color: 'currentColor', opacity: 0.92 }} />
                  <span className={usesCanonicalHeroCopy ? 'min-w-0 whitespace-normal break-words leading-5' : 'truncate'}>
                    {heroCompanyBadge}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

