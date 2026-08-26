'use client';

import { CalendarDays, MessageSquareText } from 'lucide-react';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicBandColors,
  lawyerClassicResolvedPaddingClass,
  lawyerContentSource,
  lawyerContentValue,
} from '../shared/lawyerSectionUtils';

export function LawyerClassicCta({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const eyebrow = lawyerContentValue(content, 'eyebrow', 'Consultation request');
  const heading = lawyerContentValue(content, 'heading', 'If you need legal guidance, we are available.');
  const body = lawyerContentValue(content, 'body', 'Book a consultation or send the transaction details for a focused response.');
  const ctaLabel = lawyerContentValue(content, 'cta_label', 'Get consultation');
  const secondaryCtaLabel = lawyerContentValue(content, 'secondary_cta_label', 'Send inquiry');
  const sectionStyle = block?.data?.style || block?.style || {};
  const band = lawyerClassicBandColors(sectionStyle, {
    emptyBackgrounds: ['', '#202020', '#24211e', '#d39a52'],
    themeBackground: 'var(--storefront-accent, #d39a52)',
    themeText: 'var(--storefront-accent-contrast, #202020)',
    fallbackDark: '#202020',
  });
  const ctaBackground = band.background;
  const ctaTextColor = band.color;
  const padding = block?.data?.layout?.padding || block?.layout?.padding;
  const calendlyUrl = buildTrackedCalendlyUrl(
    profile?.professional_profile?.calendly_link,
    profile,
  );
  const connect = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      actions.onAppointmentClick?.();
      return;
    }
    actions.onCtaClick?.('book_consultation');
  };

  return (
    <div
      id="contact"
      className={`relative isolate w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicResolvedPaddingClass(padding, 'py-14')}`}
      style={{
        backgroundColor: ctaBackground,
        color: ctaTextColor,
      }}
    >
      <div className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rotate-45 border border-current opacity-10" />
      <div className="pointer-events-none absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rotate-45 border border-current opacity-10" />
      <div className="relative grid w-full max-w-none gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="max-w-2xl" data-storefront-anim-item="true">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="CTA eyebrow"
            source={lawyerContentSource(content, 'eyebrow')}
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] opacity-70"
          >
            {eyebrow}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="Contact heading"
            source={lawyerContentSource(content, 'heading')}
            className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
          >
            {heading}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="Contact description"
            source={lawyerContentSource(content, 'body')}
            className="mt-3 max-w-xl text-sm leading-6 opacity-75"
          >
            {body}
          </EditableText>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row" data-storefront-anim-item="true">
          <button
            type="button"
            onClick={connect}
            data-storefront-field="content.cta_label"
            data-storefront-source={lawyerContentSource(content, 'cta_label')}
            data-storefront-label="Consultation button"
            className={`${ctaLabel ? 'inline-flex' : 'hidden'} storefront-btn min-h-12 items-center justify-center gap-2 bg-primary px-7 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-contrast shadow-[0_12px_28px_rgba(32,32,32,.16)] transition hover:-translate-y-0.5`}
          >
            <CalendarDays size={16} />
            {ctaLabel}
          </button>
          <button
            type="button"
            onClick={actions.onDirectLeadClick}
            data-storefront-field="content.secondary_cta_label"
            data-storefront-source={lawyerContentSource(content, 'secondary_cta_label')}
            data-storefront-label="Inquiry button"
            className={`${secondaryCtaLabel ? 'inline-flex' : 'hidden'} storefront-btn min-h-12 items-center justify-center gap-2 border border-current bg-transparent px-7 text-[11px] font-bold uppercase tracking-[0.14em] text-current transition hover:-translate-y-0.5 hover:bg-white/20`}
          >
            <MessageSquareText size={16} />
            {secondaryCtaLabel}
          </button>
        </div>
        {content.helper_text ? (
          <EditableText
            as="p"
            field="content.helper_text"
            label="CTA helper text"
            source="persisted"
            className="text-xs leading-5 opacity-[0.65] md:col-span-2"
          >
            {content.helper_text}
          </EditableText>
        ) : null}
      </div>
    </div>
  );
}
