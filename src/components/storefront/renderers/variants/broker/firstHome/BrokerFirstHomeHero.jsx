'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Calculator, ChevronLeft, ChevronRight, MessageSquareText, UserPlus } from 'lucide-react';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../../lawyer/shared/ResilientStorefrontImage';
import {
  blockContent,
  lawyerContentSource,
  resolveProfessionalIdentity,
} from '../../lawyer/shared/lawyerSectionUtils';
import { brokerContentValue } from '../classic/brokerSectionUtils';
import { normalizeFirstHomeHeroSlides, resolveSlideImagePlacement } from './brokerFirstHomeDefaults';
import { FIRST_HOME_PALETTE as P } from './brokerFirstHomePalette';

const FONT = 'var(--font-first-home-body, "Source Sans 3"), Inter, ui-sans-serif, system-ui, sans-serif';
const HEADING_FONT = 'var(--font-inter, Inter), "Source Sans 3", ui-sans-serif, system-ui, sans-serif';
const BTN = 'inline-flex min-h-[2.9rem] shrink-0 items-center justify-center gap-2 rounded-sm px-5 text-[13px] font-semibold tracking-[0.02em] transition duration-200';
const AUTOPLAY_MS = 7000;

const HERO_SHELL_CLASS = 'min-h-[clamp(28rem,76vh,58rem)]';

export function BrokerFirstHomeHero({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const coverFallback = profile?.cover_photo_url
    || profile?.storefront_cover_fallback_url
    || profile?.storefront_brand_kit?.cover_url
    || '';
  const slides = useMemo(
    () => normalizeFirstHomeHeroSlides(content.slides, { fallbackCover: coverFallback }),
    [content.slides, coverFallback],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideCount = slides.length;
  const autoplayEnabled = slideCount > 1 && !isPreview && !paused;
  const autoplayEnabledRef = useRef(autoplayEnabled);
  autoplayEnabledRef.current = autoplayEnabled;

  useEffect(() => {
    if (activeIndex > slideCount - 1) setActiveIndex(0);
  }, [activeIndex, slideCount]);

  useEffect(() => {
    if (slideCount < 2 || isPreview) return undefined;
    const id = setInterval(() => {
      if (!autoplayEnabledRef.current) return;
      setActiveIndex((current) => (current + 1) % slideCount);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPreview, slideCount]);

  const active = slides[activeIndex] || slides[0];
  const primaryLabel = brokerContentValue(content, 'primary_cta_label', 'Start my pre-approval');
  const secondaryLabel = brokerContentValue(content, 'cta_label', 'Check my affordability');
  const joinLabel = brokerContentValue(content, 'join_label', 'Join Nesti');
  const joinHref = String(profile?.invite_link?.share_url || '').trim() || '/sign-up';

  const goTo = (index) => {
    if (slideCount < 2) return;
    setActiveIndex((index + slideCount) % slideCount);
  };

  return (
    <div
      className={`relative ${HERO_SHELL_CLASS} overflow-hidden pt-16`}
      data-broker-first-home-hero="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ backgroundColor: `var(--storefront-primary, ${P.primary})`, color: P.white, fontFamily: FONT }}
    >
      <PublicStorefrontHeader
        profile={profile}
        variant="brokerClassic"
        forceCompactPreview={isPreview && profile.storefront_preview_mode !== 'desktop'}
        forceMobilePreview={isPreview && profile.storefront_preview_mode === 'mobile'}
      />

      {/* Full-bleed slide media */}
      <div className="absolute inset-0 top-16 overflow-hidden">
        {slides.map((slide, index) => {
          const visible = index === activeIndex;
          const placement = resolveSlideImagePlacement(slide);
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 overflow-hidden transition-opacity duration-[900ms] ease-out ${
                visible ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={!visible}
              style={{ backgroundColor: P.dark }}
            >
              {slide.image_url ? (
                <ResilientStorefrontImage
                  profile={profile}
                  candidates={[{ src: slide.image_url, kind: 'cover' }]}
                  alt={slide.heading || identity.name || 'First-home mortgage guidance'}
                  priority={index === 0}
                  sizes="100vw"
                  placement={placement}
                  showLoading
                  className="h-full w-full object-cover"
                  fallback={<div className="absolute inset-0" style={{ background: P.dark }} />}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(145deg, ${P.dark} 0%, ${P.primary} 55%, ${P.footer} 100%)`,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Light full-image gradient — same on every slide, keeps photos visible and text readable */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(8,20,36,0.42) 0%,
                rgba(8,20,36,0.18) 24%,
                rgba(8,20,36,0.34) 50%,
                rgba(8,20,36,0.18) 76%,
                rgba(8,20,36,0.46) 100%),
              linear-gradient(90deg,
                rgba(8,20,36,0.22) 0%,
                rgba(8,20,36,0.08) 18%,
                rgba(8,20,36,0.08) 82%,
                rgba(8,20,36,0.22) 100%)
            `,
          }}
        />
      </div>

      {/* Content grid — vertically centered */}
      <div className={`relative z-10 flex ${HERO_SHELL_CLASS} flex-col items-center justify-center px-5 py-14 sm:px-8 lg:px-14 xl:px-20`}>
        <div key={active.id} className="broker-fh-copy relative mx-auto w-full max-w-3xl text-center lg:max-w-5xl">
          <EditableText
            as="p"
            field="content.slides"
            collection="slides"
            itemId={active.id}
            itemIndex={activeIndex}
            itemField="eyebrow"
            label={`Slide ${activeIndex + 1} eyebrow`}
            source={lawyerContentSource(content, 'slides')}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 sm:text-xs lg:whitespace-nowrap lg:tracking-[0.26em]"
            style={{ fontFamily: FONT, textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}
          >
            {active.eyebrow}
          </EditableText>
          <EditableText
            as="h1"
            field="content.slides"
            collection="slides"
            itemId={active.id}
            itemIndex={activeIndex}
            itemField="heading"
            label={`Slide ${activeIndex + 1} heading`}
            source={lawyerContentSource(content, 'slides')}
            className="mx-auto mt-3 max-w-[20ch] text-[2rem] font-medium leading-[1.12] tracking-[-0.035em] text-white sm:max-w-[28ch] sm:text-[2.5rem] md:max-w-[34ch] lg:max-w-none lg:text-[2.85rem] lg:leading-[1.08] xl:text-[3rem]"
            style={{ fontFamily: HEADING_FONT, textShadow: '0 2px 28px rgba(0,0,0,0.5)' }}
          >
            {active.heading}
          </EditableText>
          <EditableText
            as="p"
            field="content.slides"
            collection="slides"
            itemId={active.id}
            itemIndex={activeIndex}
            itemField="body"
            label={`Slide ${activeIndex + 1} description`}
            source={lawyerContentSource(content, 'slides')}
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-white/95 lg:max-w-3xl lg:text-base lg:leading-8"
            style={{ fontFamily: FONT, textShadow: '0 1px 16px rgba(0,0,0,0.45)' }}
          >
            {active.body}
          </EditableText>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 pb-1">
            <button
              type="button"
              onClick={actions.onDirectLeadClick}
              className={`${primaryLabel ? BTN : 'hidden'} broker-fh-btn whitespace-nowrap bg-white text-[#0B1F33] shadow-[0_14px_28px_rgba(0,0,0,0.28)] hover:-translate-y-0.5`}
              style={{ fontFamily: FONT }}
            >
              <MessageSquareText size={16} strokeWidth={2.2} />
              <EditableText as="span" field="content.primary_cta_label" label="Primary hero button">
                {primaryLabel}
              </EditableText>
              <ArrowRight size={14} strokeWidth={2.2} className="broker-fh-btn-arrow" />
            </button>
            <button
              type="button"
              onClick={() => actions.onCtaClick?.('calculator')}
              className={`${secondaryLabel ? BTN : 'hidden'} broker-fh-btn whitespace-nowrap border border-white/70 bg-white/[0.08] text-white backdrop-blur-[6px] hover:-translate-y-0.5 hover:bg-white hover:text-[#0B1F33]`}
              style={{ fontFamily: FONT }}
            >
              <Calculator size={16} strokeWidth={2.2} />
              <EditableText as="span" field="content.cta_label" label="Secondary hero button">
                {secondaryLabel}
              </EditableText>
            </button>
            {joinLabel ? (
              <a
                href={joinHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN} broker-fh-btn whitespace-nowrap border border-white/45 bg-transparent text-white hover:-translate-y-0.5 hover:border-white hover:bg-white/10`}
                style={{ fontFamily: FONT }}
              >
                <UserPlus size={16} strokeWidth={2.2} />
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

      {slideCount > 1 ? (
        <div className="absolute bottom-6 right-4 z-20 flex items-center gap-2 sm:bottom-8 sm:right-6 lg:right-8">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur-md transition hover:border-white hover:bg-white hover:text-[#0B1F33]"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur-md transition hover:border-white hover:bg-white hover:text-[#0B1F33]"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes broker-fh-copy-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        [data-broker-first-home-hero='true'] .broker-fh-copy {
          animation: broker-fh-copy-in 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        [data-broker-first-home-hero='true'] .broker-fh-btn-arrow {
          transition: transform 220ms ease;
          margin-left: 2px;
        }
        [data-broker-first-home-hero='true'] .broker-fh-btn:hover .broker-fh-btn-arrow {
          transform: translateX(3px);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-broker-first-home-hero='true'] .broker-fh-copy { animation: none; }
          [data-broker-first-home-hero='true'] .broker-fh-btn-arrow { transition: none; }
        }
      `}</style>
    </div>
  );
}
