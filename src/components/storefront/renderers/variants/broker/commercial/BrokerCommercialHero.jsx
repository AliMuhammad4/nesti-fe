'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MessageSquareText, UserPlus } from 'lucide-react';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../../lawyer/shared/ResilientStorefrontImage';
import {
  blockContent,
  lawyerContentSource,
  resolveProfessionalIdentity,
} from '../../lawyer/shared/lawyerSectionUtils';
import { brokerContentValue } from '../classic/brokerSectionUtils';
import { normalizeCommercialHeroSlides, resolveSlideImagePlacement } from './brokerCommercialDefaults';
import { COMMERCIAL_PALETTE as P } from './brokerCommercialPalette';

const FONT = 'var(--font-commercial-body, Manrope), Inter, ui-sans-serif, system-ui, sans-serif';
const HEADING_FONT = 'var(--font-commercial-heading, Manrope), Inter, ui-sans-serif, system-ui, sans-serif';
const BTN = 'inline-flex min-h-[3.05rem] shrink-0 items-center justify-center gap-2.5 rounded-none px-6 text-[12px] font-bold uppercase tracking-[0.14em] transition duration-200';
const AUTOPLAY_MS = 7200;
const HERO_SHELL_CLASS = 'min-h-[clamp(30rem,80vh,60rem)]';

function labelsMatch(a = '', b = '') {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

export function BrokerCommercialHero({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const coverFallback = profile?.cover_photo_url
    || profile?.storefront_cover_fallback_url
    || profile?.storefront_brand_kit?.cover_url
    || '';
  const slides = useMemo(
    () => normalizeCommercialHeroSlides(content.slides, { fallbackCover: coverFallback }),
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

  // Single stable timer — avoid progressKey / pause thrash restarting transitions mid-cycle
  useEffect(() => {
    if (slideCount < 2 || isPreview) return undefined;
    const id = setInterval(() => {
      if (!autoplayEnabledRef.current) return;
      setActiveIndex((current) => (current + 1) % slideCount);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPreview, slideCount]);

  const active = slides[activeIndex] || slides[0];
  const primaryLabel = brokerContentValue(content, 'primary_cta_label', 'Submit a deal');
  const secondaryRaw = brokerContentValue(content, 'cta_label', 'Book a consultation');
  const secondaryLabel = labelsMatch(primaryLabel, secondaryRaw) ? 'Book a consultation' : secondaryRaw;
  const showSecondary = Boolean(secondaryLabel) && !labelsMatch(primaryLabel, secondaryLabel);
  const joinLabel = brokerContentValue(content, 'join_label', 'Join Nesti');
  const joinHref = String(profile?.invite_link?.share_url || '').trim() || '/sign-up';

  const goTo = (index) => {
    if (slideCount < 2) return;
    setActiveIndex((index + slideCount) % slideCount);
  };

  return (
    <div
      className={`relative ${HERO_SHELL_CLASS} overflow-hidden pt-16`}
      data-broker-commercial-hero="true"
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

      {/* Full-bleed background slides */}
      <div className="absolute inset-0 top-16 overflow-hidden">
        {slides.map((slide, index) => {
          const visible = index === activeIndex;
          const placement = resolveSlideImagePlacement(slide);
          return (
            <div
              key={`${slide.id}-${index}`}
              className={`absolute inset-0 overflow-hidden transition-[opacity,transform] duration-[1000ms] ease-out ${
                visible ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.04]'
              }`}
              aria-hidden={!visible}
              style={{ backgroundColor: P.dark }}
            >
              {slide.image_url ? (
                <ResilientStorefrontImage
                  profile={profile}
                  candidates={[{ src: slide.image_url, kind: 'cover' }]}
                  alt={slide.heading || identity.name || 'Commercial mortgage financing'}
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
                    background: `
                      radial-gradient(ellipse at 50% 40%, rgba(126,173,194,0.18) 0%, transparent 55%),
                      linear-gradient(145deg, ${P.dark} 0%, ${P.primary} 55%, ${P.footer} 100%)
                    `,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Cinematic vignette — keeps bright photo areas from washing out copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 42%, rgba(8,14,20,0.28) 0%, rgba(8,14,20,0.62) 62%, rgba(8,14,20,0.82) 100%),
              linear-gradient(180deg, rgba(8,14,20,0.55) 0%, rgba(8,14,20,0.2) 28%, rgba(8,14,20,0.35) 55%, rgba(8,14,20,0.72) 100%)
            `,
          }}
        />
      </div>

      {/* Single-column content */}
      <div className={`relative z-10 flex ${HERO_SHELL_CLASS} flex-col items-center justify-center px-5 py-14 sm:px-8 lg:px-14 xl:px-20`}>
        <div
          key={active.id}
          className="broker-commercial-copy relative mx-auto w-full max-w-4xl text-center lg:max-w-5xl"
        >
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-white/85" aria-hidden />
            <EditableText
              as="p"
              field="content.slides"
              collection="slides"
              itemId={active.id}
              itemIndex={activeIndex}
              itemField="eyebrow"
              label={`Slide ${activeIndex + 1} eyebrow`}
              source={lawyerContentSource(content, 'slides')}
              className="text-[11px] font-bold uppercase tracking-[0.28em] text-white sm:text-xs"
              style={{
                fontFamily: FONT,
                color: '#ffffff',
                textShadow: '0 1px 14px rgba(0,0,0,0.55)',
              }}
            >
              {active.eyebrow || 'Deal desk'}
            </EditableText>
            <span className="h-px w-7 bg-white/85" aria-hidden />
          </div>

          <EditableText
            as="h1"
            field="content.slides"
            collection="slides"
            itemId={active.id}
            itemIndex={activeIndex}
            itemField="heading"
            label={`Slide ${activeIndex + 1} heading`}
            source={lawyerContentSource(content, 'slides')}
            className="mx-auto w-full max-w-[22rem] text-[2rem] font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:max-w-3xl sm:text-[2.55rem] md:max-w-4xl lg:max-w-5xl lg:text-[2.95rem] lg:leading-[1.1] xl:text-[3.2rem]"
            style={{
              fontFamily: HEADING_FONT,
              textShadow: '0 2px 28px rgba(0,0,0,0.5)',
              textWrap: 'balance',
            }}
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
            style={{
              fontFamily: FONT,
              textShadow: '0 1px 16px rgba(0,0,0,0.45)',
              textWrap: 'pretty',
            }}
          >
            {active.body}
          </EditableText>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={actions.onDirectLeadClick}
              className={`${primaryLabel ? BTN : 'hidden'} broker-commercial-btn`}
              style={{
                fontFamily: FONT,
                backgroundColor: P.white,
                color: P.ink,
                boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
              }}
            >
              <MessageSquareText size={15} strokeWidth={2.3} />
              <EditableText as="span" field="content.primary_cta_label" label="Primary hero button">
                {primaryLabel}
              </EditableText>
              <ArrowRight size={14} strokeWidth={2.3} className="broker-commercial-btn-arrow" />
            </button>

            {showSecondary ? (
              <button
                type="button"
                onClick={actions.onAppointmentClick || (() => actions.onCtaClick?.('contact'))}
                className={`${BTN} broker-commercial-btn border border-white/70 bg-white/10 text-white hover:bg-white`}
                style={{ fontFamily: FONT }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = P.ink;
                  event.currentTarget.style.borderColor = P.white;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = P.white;
                  event.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
                }}
              >
                <CalendarDays size={15} strokeWidth={2.3} />
                <EditableText as="span" field="content.cta_label" label="Secondary hero button">
                  {secondaryLabel}
                </EditableText>
              </button>
            ) : null}

            {joinLabel ? (
              <a
                href={joinHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN} broker-commercial-btn border border-white/35 bg-transparent text-white/92 hover:border-white hover:bg-white/10 hover:text-white`}
                style={{ fontFamily: FONT }}
              >
                <UserPlus size={15} strokeWidth={2.3} />
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
            className="grid h-11 w-11 place-items-center border border-white/40 bg-black/35 text-white backdrop-blur-md transition hover:border-white hover:bg-white"
            aria-label="Previous slide"
            onMouseEnter={(event) => {
              event.currentTarget.style.color = P.ink;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = P.white;
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="grid h-11 w-11 place-items-center border border-white/40 bg-black/35 text-white backdrop-blur-md transition hover:border-white hover:bg-white"
            aria-label="Next slide"
            onMouseEnter={(event) => {
              event.currentTarget.style.color = P.ink;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = P.white;
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes broker-commercial-copy-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        [data-broker-commercial-hero='true'] .broker-commercial-copy {
          animation: broker-commercial-copy-in 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        [data-broker-commercial-hero='true'] .broker-commercial-btn-arrow {
          transition: transform 220ms ease;
          margin-left: 2px;
        }
        [data-broker-commercial-hero='true'] .broker-commercial-btn:hover .broker-commercial-btn-arrow {
          transform: translateX(3px);
        }
        [data-broker-commercial-hero='true'] .broker-commercial-btn:hover {
          transform: translateY(-1px);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-broker-commercial-hero='true'] .broker-commercial-copy { animation: none; }
          [data-broker-commercial-hero='true'] .broker-commercial-btn,
          [data-broker-commercial-hero='true'] .broker-commercial-btn-arrow { transition: none; transform: none; }
        }
      `}</style>
    </div>
  );
}
