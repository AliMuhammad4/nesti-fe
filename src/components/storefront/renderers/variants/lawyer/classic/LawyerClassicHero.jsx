'use client';

import { CalendarDays, MessageSquareText, UserPlus } from 'lucide-react';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../shared/ResilientStorefrontImage';
import { blockContent, resolveProfessionalIdentity } from '../shared/lawyerSectionUtils';

export function LawyerClassicHero({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const layout = block?.data?.layout || block?.layout || {};
  const style = block?.data?.style || block?.style || {};
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
  const heroBackground = style.background && style.background !== 'transparent'
    ? style.background
    : 'var(--storefront-canvas, #f2f1ef)';
  const heroTextColor = String(content.hero_card_text_color || '').trim();
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
      className="lawyer-classic-hero relative min-h-[38rem] overflow-hidden border-0 pt-16 shadow-none"
      style={{
        backgroundColor: heroBackground,
        color: heroTextColor || 'var(--storefront-primary, #262626)',
      }}
    >
      <PublicStorefrontHeader
        profile={profile}
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
            alt={`${identity.name} legal practice`}
            priority
            sizes="100vw"
            className="lawyer-classic-hero-media object-cover"
            fallback={<div className="absolute inset-0 [background:linear-gradient(135deg,var(--storefront-canvas)_0%,color-mix(in_srgb,var(--storefront-canvas)_88%,var(--storefront-primary))_100%)]" />}
          />
        ) : (
          <div className="absolute inset-0 [background:linear-gradient(135deg,var(--storefront-canvas)_0%,color-mix(in_srgb,var(--storefront-canvas)_88%,var(--storefront-primary))_100%)]" />
        )}
        <div className="absolute inset-0 sm:hidden [background:color-mix(in_srgb,var(--storefront-canvas)_91%,transparent)]" />
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background: 'linear-gradient(90deg, color-mix(in srgb, var(--storefront-canvas) 99%, transparent) 0%, color-mix(in srgb, var(--storefront-canvas) 97%, transparent) 43%, color-mix(in srgb, var(--storefront-canvas) 70%, transparent) 58%, color-mix(in srgb, var(--storefront-canvas) 12%, transparent) 78%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[34rem] w-full items-center px-5 py-16 sm:w-[62%] sm:px-10 lg:px-16 xl:px-24">
        <div className="lawyer-classic-hero-copy max-w-2xl">
          <EditableText
            field="content.eyebrow"
            label="Hero eyebrow"
            source={content.eyebrow ? 'persisted' : 'fallback'}
            className="lawyer-classic-hero-kicker text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
            animated
          >
            {content.eyebrow || 'Property law · Closing counsel'}
          </EditableText>
          <EditableText
            as="h1"
            field="content.heading"
            label="Hero heading"
            source={content.heading ? 'persisted' : 'fallback'}
            className={`lawyer-classic-hero-heading mt-6 max-w-2xl text-3xl font-bold uppercase leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl ${
              heroTextColor ? 'text-current' : 'text-primary'
            }`}
            animated
          >
            {content.heading || 'Tell us about your matter.'}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="Hero description"
            source={content.body ? 'persisted' : 'fallback'}
            className="lawyer-classic-hero-description mt-5 max-w-xl leading-7"
            style={{
              color: heroTextColor || 'color-mix(in srgb, var(--storefront-primary) 78%, var(--storefront-canvas))',
              fontSize: 'clamp(1rem, 1.6vw, 1.3rem)',
            }}
            animated
          >
            {content.body || 'Clear legal guidance for contracts, title matters, purchases, sales, and closing day.'}
          </EditableText>
          <div className="lawyer-classic-hero-actions mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={actions.onDirectLeadClick}
              data-storefront-anim-item="true"
              data-storefront-field="content.primary_cta_label"
              data-storefront-source={content.primary_cta_label ? 'persisted' : 'fallback'}
              data-storefront-label="Primary hero button"
              className="lawyer-classic-hero-action storefront-btn inline-flex min-h-12 items-center justify-center gap-2 border border-accent bg-accent px-6 text-xs font-bold uppercase tracking-[0.11em] text-accent-contrast transition hover:-translate-y-0.5 hover:brightness-105"
              style={{
                ...(primaryButtonBackground ? { backgroundColor: primaryButtonBackground, borderColor: primaryButtonBackground } : {}),
                ...(primaryButtonText ? { color: primaryButtonText } : {}),
              }}
            >
              <MessageSquareText size={16} />
              {content.primary_cta_label || 'Submit inquiry'}
            </button>
            <button
              type="button"
              onClick={openConsultation}
              data-storefront-anim-item="true"
              data-storefront-field="content.cta_label"
              data-storefront-source={content.cta_label ? 'persisted' : 'fallback'}
              data-storefront-label="Appointment button"
              className="lawyer-classic-hero-action storefront-btn inline-flex min-h-12 items-center justify-center gap-2 border border-primary/40 bg-white/70 px-6 text-xs font-bold uppercase tracking-[0.11em] text-primary transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-contrast"
              style={{
                ...(secondaryButtonBackground ? { backgroundColor: secondaryButtonBackground, borderColor: secondaryButtonBackground } : {}),
                ...(secondaryButtonText ? { color: secondaryButtonText } : {}),
              }}
            >
              <CalendarDays size={16} />
              {content.cta_label || 'Make an appointment'}
            </button>
            {inviteShareUrl ? (
              <a
                href={inviteShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-storefront-anim-item="true"
                data-storefront-field="content.join_label"
                data-storefront-source={content.join_label ? 'persisted' : 'fallback'}
                data-storefront-label="Join Nesti button"
                className="lawyer-classic-hero-action storefront-btn inline-flex min-h-12 items-center justify-center gap-2 border border-primary/30 bg-white/70 px-6 text-xs font-bold uppercase tracking-[0.11em] text-primary transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                style={{
                  ...(secondaryButtonBackground ? { backgroundColor: secondaryButtonBackground, borderColor: secondaryButtonBackground } : {}),
                  ...(secondaryButtonText ? { color: secondaryButtonText } : {}),
                }}
              >
                <UserPlus size={16} />
                {content.join_label || 'Join Nesti'}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
