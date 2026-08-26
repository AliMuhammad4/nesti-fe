'use client';

import { CalendarDays, KeyRound, MessageSquareText, Scale, UserPlus } from 'lucide-react';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../shared/ResilientStorefrontImage';
import {
  blockContent,
  lawyerContentSource,
  lawyerContentValue,
  resolveProfessionalIdentity,
} from '../shared/lawyerSectionUtils';

const PROOF_FIELDS = [
  {
    title: 'proof_one_title',
    body: 'proof_one_body',
    fallbackTitle: 'Plain-language advice',
    fallbackBody: 'Know what happens before signing day.',
  },
  {
    title: 'proof_two_title',
    body: 'proof_two_body',
    fallbackTitle: 'Transparent planning',
    fallbackBody: 'Understand documents and expected costs.',
  },
  {
    title: 'proof_three_title',
    body: 'proof_three_body',
    fallbackTitle: 'Closing-day ready',
    fallbackBody: 'Move from accepted offer to keys with clarity.',
  },
];

export function LawyerFirstHomeHero({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const eyebrow = lawyerContentValue(content, 'eyebrow', 'First-home legal guidance');
  const heading = lawyerContentValue(content, 'heading', 'Your first closing, handled with clarity.');
  const body = lawyerContentValue(content, 'body', 'Understand costs, documents, and signing day before stress builds.');
  const primaryCtaLabel = lawyerContentValue(content, 'primary_cta_label', 'Start my closing file');
  const ctaLabel = lawyerContentValue(content, 'cta_label', 'Book a consultation');
  const joinLabel = lawyerContentValue(content, 'join_label', 'Join Nesti');
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const layout = block?.data?.layout || block?.layout || {};
  const sectionStyle = block?.data?.style || block?.style || {};
  const identity = resolveProfessionalIdentity(profile);
  const coverUrl = profile?.cover_photo_url
    || profile?.storefront_cover_fallback_url
    || profile?.storefront_brand_kit?.cover_url
    || '';
  const portraitUrl = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  const showHeroMedia = layout.mediaPosition !== 'none';
  const requestedBackground = String(sectionStyle.background || '').trim().toLowerCase();
  const usesThemeBackground = !requestedBackground
    || ['transparent', '#eff6ff', '#101a2b'].includes(requestedBackground);
  const heroBackground = usesThemeBackground
    ? 'var(--storefront-primary, #1f2839)'
    : sectionStyle.background;
  const heroTextColor = String(content.hero_card_text_color || sectionStyle.textColor || '').trim();
  const primaryButtonBackground = String(content.primary_button_background || '').trim();
  const primaryButtonText = String(content.primary_button_text_color || '').trim();
  const secondaryButtonBackground = String(content.secondary_button_background || '').trim();
  const secondaryButtonText = String(content.secondary_button_text_color || '').trim();
  const inviteShareUrl = String(profile?.invite_link?.share_url || '').trim();
  const calendlyUrl = buildTrackedCalendlyUrl(
    profile?.professional_profile?.calendly_link,
    profile,
  );
  const openConsultation = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      actions.onAppointmentClick?.();
      return;
    }
    actions.onCtaClick?.('book_consultation');
  };

  return (
    <div
      className="lawyer-first-home-hero relative min-h-0 overflow-hidden border-0 pt-16 shadow-none sm:min-h-[40rem]"
      data-first-home-hero="true"
      style={{
        backgroundColor: heroBackground,
        color: heroTextColor || 'var(--storefront-primary-contrast, #ffffff)',
      }}
    >
      <PublicStorefrontHeader
        profile={profile}
        variant="lawyerFirstHome"
        forceCompactPreview={isPreview && profile.storefront_preview_mode !== 'desktop'}
        forceMobilePreview={isPreview && profile.storefront_preview_mode === 'mobile'}
      />

      <div
        className="absolute inset-0 top-16 overflow-hidden"
        data-storefront-field="brandKit.cover_url"
        data-storefront-source="profile"
        data-storefront-label="Hero cover image"
        style={{ backgroundColor: heroBackground }}
      >
        {showHeroMedia && (coverUrl || portraitUrl) ? (
          <ResilientStorefrontImage
            profile={profile}
            candidates={[
              { src: coverUrl, kind: 'cover' },
              { src: portraitUrl, kind: 'profile' },
            ]}
            alt={`${identity.name} first-home closing practice`}
            priority
            sizes="100vw"
            className="object-cover object-center"
            fallback={<div className="absolute inset-0 bg-primary" />}
          />
        ) : (
          <div className="absolute inset-0 bg-primary" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, color-mix(in srgb, ${heroBackground} 98%, transparent) 0%, color-mix(in srgb, ${heroBackground} 94%, transparent) 48%, color-mix(in srgb, ${heroBackground} 56%, transparent) 72%, color-mix(in srgb, ${heroBackground} 28%, transparent) 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.42))]" />
        {showHeroMedia && !coverUrl && !portraitUrl ? (
          <div
            className="pointer-events-none absolute inset-y-0 right-[8%] hidden w-[34%] items-center justify-center lg:flex"
            aria-hidden="true"
          >
            <div className="relative grid h-72 w-72 place-items-center border border-white/10">
              <div className="absolute inset-7 rotate-45 border border-accent/20" />
              <div className="absolute inset-14 border border-white/10" />
              <div className="relative text-center">
                <Scale size={70} strokeWidth={1.1} className="mx-auto text-accent/75" aria-hidden="true" />
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
                  Property law
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/30">
                  <KeyRound size={13} className="text-accent/60" aria-hidden="true" />
                  Offer to keys
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="absolute inset-y-0 left-[8%] hidden w-px bg-white/[0.07] lg:block" />
        <div className="absolute inset-y-0 right-[8%] hidden w-px bg-white/[0.07] lg:block" />
      </div>

      <div
        className="relative z-10 flex min-h-0 w-full items-start px-5 pb-12 pt-20 sm:min-h-[36rem] sm:items-center sm:px-8 sm:pb-40 sm:pt-16 lg:px-12 xl:px-20"
        data-first-home-hero-content="true"
      >
        <div className="max-w-3xl">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="Hero eyebrow"
            source={lawyerContentSource(content, 'eyebrow')}
            className="text-sm font-medium tracking-[0.08em] text-accent sm:text-base"
            animated
          >
            {eyebrow}
          </EditableText>
          <EditableText
            as="h1"
            field="content.heading"
            label="Hero heading"
            source={lawyerContentSource(content, 'heading')}
            className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-current sm:text-5xl"
            animated
          >
            {heading}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="Hero description"
            source={lawyerContentSource(content, 'body')}
            className="mt-5 max-w-2xl text-base leading-7 text-current opacity-75 sm:text-[17px]"
            animated
          >
            {body}
          </EditableText>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={actions.onDirectLeadClick}
              data-storefront-anim-item="true"
              data-storefront-field="content.primary_cta_label"
              data-storefront-source={lawyerContentSource(content, 'primary_cta_label')}
              data-storefront-label="Primary hero button"
              className={`${primaryCtaLabel ? 'inline-flex' : 'hidden'} storefront-btn min-h-14 items-center justify-center gap-2 border border-accent bg-accent px-7 text-xs font-bold uppercase tracking-[0.13em] text-accent-contrast transition hover:-translate-y-0.5 hover:brightness-105`}
              style={{
                ...(primaryButtonBackground ? { backgroundColor: primaryButtonBackground, borderColor: primaryButtonBackground } : {}),
                ...(primaryButtonText ? { color: primaryButtonText } : {}),
              }}
            >
              <MessageSquareText size={17} />
              {primaryCtaLabel}
            </button>
            <button
              type="button"
              onClick={openConsultation}
              data-storefront-anim-item="true"
              data-storefront-field="content.cta_label"
              data-storefront-source={lawyerContentSource(content, 'cta_label')}
              data-storefront-label="Consultation button"
              className={`${ctaLabel ? 'inline-flex' : 'hidden'} storefront-btn min-h-14 items-center justify-center gap-2 border border-white/35 bg-white/[0.06] px-7 text-xs font-bold uppercase tracking-[0.13em] text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent`}
              style={{
                ...(secondaryButtonBackground ? { backgroundColor: secondaryButtonBackground, borderColor: secondaryButtonBackground } : {}),
                ...(secondaryButtonText ? { color: secondaryButtonText } : {}),
              }}
            >
              <CalendarDays size={17} />
              {ctaLabel}
            </button>
            {inviteShareUrl ? (
              <a
                href={inviteShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-storefront-anim-item="true"
                data-storefront-field="content.join_label"
                data-storefront-source={lawyerContentSource(content, 'join_label')}
                data-storefront-label="Join Nesti button"
                className={`${joinLabel ? 'inline-flex' : 'hidden'} storefront-btn min-h-14 items-center justify-center gap-2 border border-accent/60 bg-transparent px-7 text-xs font-bold uppercase tracking-[0.13em] text-accent transition hover:-translate-y-0.5 hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:text-primary`}
              >
                <UserPlus size={17} />
                {joinLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="relative z-20 border-t border-white/10 bg-[color-mix(in_srgb,var(--storefront-primary,#1f2839)_94%,transparent)] backdrop-blur-md sm:absolute sm:inset-x-0 sm:bottom-0"
        data-first-home-hero-proof="true"
      >
        <div className="grid w-full divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0" data-first-home-grid="hero-proof">
          {PROOF_FIELDS.map((item, index) => (
            <div key={item.title} className="min-h-28 px-5 py-5 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <EditableText
                  as="h2"
                  field={`content.${item.title}`}
                  label={`Hero proof ${index + 1} title`}
                  source={lawyerContentSource(content, item.title)}
                  className="text-sm font-semibold text-current"
                >
                  {lawyerContentValue(content, item.title, item.fallbackTitle)}
                </EditableText>
                <EditableText
                  as="p"
                  field={`content.${item.body}`}
                  label={`Hero proof ${index + 1} description`}
                  source={lawyerContentSource(content, item.body)}
                  className="mt-1.5 text-xs leading-5 text-current opacity-60"
                >
                  {lawyerContentValue(content, item.body, item.fallbackBody)}
                </EditableText>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
