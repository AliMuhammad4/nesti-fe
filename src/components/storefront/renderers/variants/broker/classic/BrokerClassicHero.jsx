'use client';

import {
  Building2,
  CalendarDays,
  MessageSquareText,
  UserPlus,
} from 'lucide-react';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import { buildTrackedCalendlyUrl, resolvePublicCalendlySource } from '@/lib/publicProfileLinks';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../../lawyer/shared/ResilientStorefrontImage';
import {
  blockContent,
  lawyerContentSource,
  resolveProfessionalIdentity,
} from '../../lawyer/shared/lawyerSectionUtils';
import {
  BROKER_INK,
  brokerContentValue,
  sectionPresentation,
} from './brokerSectionUtils';
import { BROKER_CLASSIC_HERO_DEFAULTS } from './brokerClassicDefaults';

const ACTION_BASE = 'broker-hero-action inline-flex min-h-11 items-center justify-center gap-2 px-5 text-[13px] font-semibold tracking-wide transition duration-200';

export function BrokerClassicHero({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const presentation = sectionPresentation(block, BROKER_INK, '#ffffff');
  const blockStyle = block?.data?.style || block?.style || {};
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const cover = profile?.cover_photo_url
    || profile?.storefront_cover_fallback_url
    || profile?.storefront_brand_kit?.cover_url
    || '';
  const showMedia = presentation.mediaPosition !== 'none' && Boolean(cover);
  const primaryLabel = brokerContentValue(content, 'primary_cta_label', BROKER_CLASSIC_HERO_DEFAULTS.primary_cta_label);
  const consultationLabel = brokerContentValue(content, 'cta_label', BROKER_CLASSIC_HERO_DEFAULTS.cta_label);
  const joinLabel = brokerContentValue(content, 'join_label', BROKER_CLASSIC_HERO_DEFAULTS.join_label);
  const joinHref = String(profile?.invite_link?.share_url || '').trim() || '/sign-up';
  const calendlyUrl = buildTrackedCalendlyUrl(resolvePublicCalendlySource(profile), profile);
  const tagline = String(
    profile?.professional_profile?.tagline
    || profile?.professional_profile?.headline
    || '',
  ).trim();
  const openConsultation = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      actions.onAppointmentClick?.();
      return;
    }
    actions.onCtaClick?.('book_consultation');
  };
  const heading = brokerContentValue(
    content,
    'heading',
    'Building a brighter financial future',
  );
  const body = brokerContentValue(
    content,
    'body',
    tagline || 'Simple and secure payment process with trusted mortgage guidance.',
  );
  const configuredHeroBackground = String(blockStyle.background || '').trim();
  const heroSurface = content.hero_card_background
    || (
      configuredHeroBackground
      && configuredHeroBackground.toLowerCase() !== '#0c2139'
        ? configuredHeroBackground
        : ''
    );
  const heroTextColor = content.hero_card_text_color || '#ffffff';
  const eyebrow = brokerContentValue(content, 'eyebrow', `Welcome to ${identity.company || identity.name}`);
  const companyBadge = String(
    content.hero_company_badge
    || profile?.professional_profile?.company_name
    || identity.company
    || '',
  ).trim();
  const companyBadgeSource = content.hero_company_badge ? 'persisted' : 'profile';

  return (
    <div className="relative bg-white pt-16" data-broker-classic-hero="true">
      <PublicStorefrontHeader
        profile={profile}
        variant="brokerClassic"
        forceCompactPreview={isPreview && profile.storefront_preview_mode !== 'desktop'}
        forceMobilePreview={isPreview && profile.storefront_preview_mode === 'mobile'}
      />

      <div className="relative grid min-h-[30rem] w-full max-w-none overflow-hidden bg-[#081b30] text-white isolate sm:min-h-[34rem] sm:grid-cols-2">
        <div
          className="broker-hero-content-panel relative flex items-center overflow-hidden border-b border-white/10 bg-[linear-gradient(145deg,#061728_0%,#0a2947_55%,#071d34_100%)] px-5 py-14 sm:border-b-0 sm:border-r sm:border-white/10 sm:px-7 sm:py-16 lg:px-10 xl:px-14"
          style={heroSurface ? { background: heroSurface } : undefined}
        >
          <div className="broker-hero-network pointer-events-none absolute inset-0" aria-hidden="true">
            <svg
              viewBox="-30 -30 960 660"
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id="broker-network-line" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--storefront-accent, #008fd5)" stopOpacity="0" />
                  <stop offset="48%" stopColor="var(--storefront-accent, #008fd5)" stopOpacity=".72" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity=".08" />
                </linearGradient>
                <radialGradient id="broker-network-node">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity=".95" />
                  <stop offset="45%" stopColor="var(--storefront-accent, #008fd5)" stopOpacity=".9" />
                  <stop offset="100%" stopColor="var(--storefront-accent, #008fd5)" stopOpacity="0" />
                </radialGradient>
                <pattern id="broker-finance-dot-field" width="42" height="42" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#8edcff" opacity=".12" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="900" height="600" fill="url(#broker-finance-dot-field)" />

              <path className="broker-network-link" d="M18 112 C168 58 285 148 420 104 S680 38 884 94" />
              <path className="broker-network-link" d="M420 104 C520 145 566 204 665 225 S800 270 884 322" />
              <path className="broker-network-link" d="M665 225 C620 308 708 350 760 410 S678 498 520 515" />
              <path className="broker-network-link" d="M16 482 C178 432 344 520 520 515" />
              <path className="broker-network-link" d="M420 104 C392 255 438 403 520 515" />
              <path className="broker-network-link" d="M112 310 C236 254 305 318 402 340 S576 314 665 225" />
              <path className="broker-network-link" d="M402 340 C520 385 620 399 760 410" />

              <path className="broker-finance-flow" d="M18 112 C168 58 285 148 420 104 S680 38 884 94" />
              <path className="broker-finance-flow broker-network-link-delay" d="M420 104 C520 145 566 204 665 225 S800 270 884 322" />
              <path className="broker-finance-flow broker-network-link-slow" d="M665 225 C620 308 708 350 760 410 S678 498 520 515" />
              <path className="broker-finance-flow broker-network-link-delay" d="M16 482 C178 432 344 520 520 515" />
              <path className="broker-finance-flow broker-network-link-slow" d="M112 310 C236 254 305 318 402 340 S576 314 665 225" />

              <g className="broker-finance-node" transform="translate(750 82)">
                <circle className="broker-finance-node-halo" r="34" />
                <circle className="broker-finance-node-ring" r="22" />
                <text className="broker-finance-glyph" textAnchor="middle" dominantBaseline="central">$</text>
                <text className="broker-finance-label" x="-34" y="44">FUNDING</text>
              </g>
              <g className="broker-finance-node broker-finance-node-delay-1" transform="translate(665 225)">
                <circle className="broker-finance-node-halo" r="34" />
                <circle className="broker-finance-node-ring" r="22" />
                <text className="broker-finance-glyph" textAnchor="middle" dominantBaseline="central">%</text>
                <text className="broker-finance-label" x="-23" y="44">RATES</text>
              </g>
              <g className="broker-finance-node broker-finance-node-delay-2" transform="translate(760 410)">
                <circle className="broker-finance-node-halo" r="34" />
                <circle className="broker-finance-node-ring" r="22" />
                <path className="broker-finance-icon" d="M-9 1 0-7l9 8v9H3V4h-6v6h-6Z" />
                <text className="broker-finance-label" x="-40" y="44">HOME LOAN</text>
              </g>
              <g className="broker-finance-node broker-finance-node-delay-1" transform="translate(520 515)">
                <circle className="broker-finance-node-halo" r="34" />
                <circle className="broker-finance-node-ring" r="22" />
                <path className="broker-finance-icon" d="M-10 8V-8M-10 8H10M-7 4l5-6 4 3 7-8M5-7h4v4" />
                <text className="broker-finance-label" x="-27" y="44">EQUITY</text>
              </g>
              <g className="broker-finance-node broker-finance-node-delay-2" transform="translate(420 104)">
                <circle className="broker-finance-node-halo" r="25" />
                <circle className="broker-finance-node-dot" r="4" />
              </g>
              <g className="broker-finance-node broker-finance-node-delay-2" transform="translate(402 340)">
                <circle className="broker-finance-node-halo" r="30" />
                <circle className="broker-finance-node-ring" r="19" />
                <path className="broker-finance-icon" d="m-8 0 5 5L9-8" />
                <text className="broker-finance-label" x="-36" y="40">APPROVED</text>
              </g>
              {[
                [112, 310], [178, 464], [310, 482], [566, 204],
                [620, 397], [830, 286], [286, 132], [842, 104],
              ].map(([cx, cy], index) => (
                <g key={`${cx}-${cy}`} className={`broker-finance-satellite broker-finance-node-delay-${index % 3}`}>
                  <circle cx={cx} cy={cy} r="8" className="broker-finance-node-halo" />
                  <circle cx={cx} cy={cy} r="2.3" className="broker-finance-node-dot" />
                </g>
              ))}
            </svg>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_45%,rgba(0,143,213,.18),transparent_42%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,20,37,.28)_0%,rgba(5,20,37,.42)_62%,rgba(5,20,37,.24)_100%)]" />

          <div className="broker-hero-copy relative z-10 w-full max-w-[34rem]">
            {eyebrow ? (
              <EditableText
                field="content.eyebrow"
                label="Hero eyebrow"
                source={lawyerContentSource(content, 'eyebrow')}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--storefront-accent,#008fd5)]"
              >
                {eyebrow}
              </EditableText>
            ) : null}
            {companyBadge || isPreview ? (
              <EditableText
                as="span"
                field="content.hero_company_badge"
                label="Company badge text"
                source={companyBadgeSource}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white/80"
                style={{ color: heroTextColor, WebkitTextFillColor: heroTextColor, opacity: 0.82 }}
              >
                <Building2 size={13} className="shrink-0 text-[color:var(--storefront-accent,#008fd5)]" />
                {companyBadge || 'Company name'}
              </EditableText>
            ) : null}
            <EditableText
              as="h1"
              field="content.heading"
              label="Hero heading"
              source={lawyerContentSource(content, 'heading')}
              className="broker-hero-heading text-balance text-[1.9rem] font-semibold leading-[1.14] tracking-[-0.032em] text-white sm:text-[1.75rem] md:text-[2rem] lg:text-[2.2rem] xl:text-[2.5rem]"
              style={{ color: heroTextColor, WebkitTextFillColor: heroTextColor }}
            >
              {heading}
            </EditableText>

            <div className="broker-hero-rule mt-5 h-px w-0 max-w-[4.5rem] bg-[color:var(--storefront-accent,#008fd5)]/90" />

            <EditableText
              as="p"
              field="content.body"
              label="Hero description"
              source={lawyerContentSource(content, 'body')}
              className="mt-5 max-w-lg text-[15px] leading-7 text-white/72"
              style={{ color: heroTextColor, WebkitTextFillColor: heroTextColor, opacity: 0.72 }}
            >
              {body}
            </EditableText>

            <div className="broker-hero-actions mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={actions.onDirectLeadClick}
                className={`${ACTION_BASE} border border-[color:var(--storefront-accent,#008fd5)] bg-[color:var(--storefront-accent,#008fd5)] text-white hover:-translate-y-0.5 hover:brightness-110`}
                style={{
                  borderRadius: presentation.controlRadius,
                  boxShadow: presentation.shellShadow,
                  backgroundColor: content.primary_button_background || undefined,
                  borderColor: content.primary_button_background || undefined,
                  color: content.primary_button_text_color || undefined,
                }}
              >
                <MessageSquareText size={15} />
                <EditableText
                  as="span"
                  field="content.primary_cta_label"
                  label="Primary hero button"
                  source={lawyerContentSource(content, 'primary_cta_label')}
                >
                  {primaryLabel}
                </EditableText>
              </button>
              <button
                type="button"
                onClick={openConsultation}
                className={`${ACTION_BASE} border border-white/25 bg-white/[0.06] text-white/95 backdrop-blur-md hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.11]`}
                style={{
                  borderRadius: presentation.controlRadius,
                  backgroundColor: content.secondary_button_background || undefined,
                  color: content.secondary_button_text_color || undefined,
                  borderColor: content.secondary_button_text_color || undefined,
                }}
              >
                <CalendarDays size={15} />
                <EditableText
                  as="span"
                  field="content.cta_label"
                  label="Consultation hero button"
                  source={lawyerContentSource(content, 'cta_label')}
                >
                  {consultationLabel}
                </EditableText>
              </button>
              {joinLabel ? (
                <a
                  href={joinHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${ACTION_BASE} border border-transparent bg-transparent px-3 text-white/75 hover:text-white`}
                  style={{ borderRadius: presentation.controlRadius }}
                >
                  <UserPlus size={15} />
                  <EditableText
                    as="span"
                    field="content.join_label"
                    label="Join Nesti hero button"
                    source={lawyerContentSource(content, 'join_label')}
                  >
                    {joinLabel}
                  </EditableText>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="broker-hero-image-panel relative min-h-[20rem] overflow-hidden bg-[#071525] [transform:translateZ(0)] sm:min-h-full"
          data-storefront-field="brandKit.cover_url"
          data-storefront-source="profile"
          data-storefront-label="Hero cover image"
        >
          {showMedia ? (
            <ResilientStorefrontImage
              profile={profile}
              candidates={[{ src: cover, kind: 'cover' }]}
              alt={identity.name}
              priority
              sizes="(min-width: 640px) 50vw, 100vw"
              className="broker-hero-media object-cover"
              fallback={<div className="absolute inset-0 bg-[linear-gradient(145deg,#0c2139,#004aa1)]" />}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#0c2139,#004aa1)]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(5,20,37,.12),transparent_42%,rgba(4,14,27,.05))]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-[#071d34]/40 to-transparent sm:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#071525]/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
