'use client';

import { CalendarDays, MessageSquareText } from 'lucide-react';
import { buildTrackedCalendlyUrl, resolvePublicCalendlySource } from '@/lib/publicProfileLinks';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerContentSource,
} from '../../lawyer/shared/lawyerSectionUtils';
import {
  brokerAlignmentClass,
  brokerAlignmentMarginClass,
  brokerContentValue,
  brokerSectionPaddingClass,
  transparentSectionPresentation,
} from './brokerSectionUtils';

export function BrokerClassicCta({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, '#ffffff');
  const layout = block?.data?.layout || block?.layout || {};
  const style = block?.data?.style || block?.style || {};
  const primary = brokerContentValue(content, 'cta_label', 'Find My Mortgage Options');
  const secondary = brokerContentValue(content, 'secondary_cta_label', 'Book a Consultation');
  const helperText = brokerContentValue(content, 'helper_text', '');
  const isInlineButtons = layout.buttonLayout === 'inline';
  const sectionBackground = presentation.background === 'transparent'
    ? 'var(--storefront-accent, #008fd5)'
    : presentation.background;
  const sectionTextColor = style.textColor || '#ffffff';
  const calendlyUrl = buildTrackedCalendlyUrl(resolvePublicCalendlySource(profile), profile);
  const contactHref = profile?.slug
    ? `/professional/${encodeURIComponent(profile.slug)}/contact`
    : '#contact';
  const openCalendar = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      actions.onAppointmentClick?.();
      return;
    }
    if (profile?.slug) {
      window.location.assign(contactHref);
      return;
    }
    actions.onCtaClick?.('book_consultation');
  };
  const openContact = () => {
    if (profile?.slug) {
      window.location.assign(contactHref);
      return;
    }
    if (typeof actions.onDirectLeadClick === 'function') {
      actions.onDirectLeadClick();
      return;
    }
    actions.onCtaClick?.('mortgage_options');
  };

  return (
    <section
      id="contact"
      className={`relative isolate overflow-hidden px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: sectionBackground, color: sectionTextColor }}
    >
      <div className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rotate-45 border border-white/15" />
      <div className="pointer-events-none absolute -right-8 top-1/2 h-40 w-40 -translate-y-1/2 rotate-45 border border-white/15" />

      <div className="relative grid w-full max-w-none items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
        <div
          className={`${brokerAlignmentClass(presentation.headingAlignment)} ${brokerAlignmentMarginClass(presentation.headingAlignment)}`}
          data-storefront-anim-item="true"
        >
          <EditableText
            field="content.eyebrow"
            label="CTA eyebrow"
            source={lawyerContentSource(content, 'eyebrow')}
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{
              color: sectionTextColor,
              WebkitTextFillColor: sectionTextColor,
              opacity: 0.82,
            }}
          >
            {brokerContentValue(content, 'eyebrow', 'Mortgage consultation')}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="CTA heading"
            source={lawyerContentSource(content, 'heading')}
            className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-[-0.02em] text-balance sm:text-4xl"
            style={{ color: sectionTextColor, WebkitTextFillColor: sectionTextColor }}
          >
            {brokerContentValue(content, 'heading', 'Find the mortgage options that may fit your file')}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="CTA supporting copy"
            source={lawyerContentSource(content, 'body')}
            className="mt-4 max-w-3xl text-base leading-7 text-balance sm:leading-8"
            style={{
              color: sectionTextColor,
              WebkitTextFillColor: sectionTextColor,
              opacity: 0.85,
            }}
          >
            {brokerContentValue(content, 'body', 'Share your goals and receive a clear, personalized financing strategy from an experienced mortgage advisor.')}
          </EditableText>
        </div>

        <div
          className={`flex w-full flex-col flex-wrap gap-3 sm:flex-row lg:w-auto lg:min-w-[18rem] ${
            isInlineButtons ? 'lg:flex-row' : 'lg:flex-col'
          }`}
          data-storefront-anim-item="true"
        >
          <button
            type="button"
            onClick={openContact}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-white px-6 text-xs font-bold tracking-wide transition hover:bg-slate-50 lg:min-w-[16rem]"
            style={{
              borderRadius: presentation.controlRadius,
              boxShadow: presentation.shellShadow,
              backgroundColor: content.primary_button_background || '#ffffff',
              color: content.primary_button_text_color || 'var(--storefront-primary, #0c2139)',
            }}
          >
            <MessageSquareText size={16} />
            <EditableText
              as="span"
              field="content.cta_label"
              label="Primary CTA button"
              source={lawyerContentSource(content, 'cta_label')}
            >
              {primary}
            </EditableText>
          </button>
          <button
            type="button"
            onClick={openCalendar}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border-2 border-white/75 bg-transparent px-6 text-xs font-bold tracking-wide transition hover:bg-white/10 lg:min-w-[16rem]"
            style={{
              borderRadius: presentation.controlRadius,
              backgroundColor: content.secondary_button_background || 'transparent',
              color: content.secondary_button_text_color || sectionTextColor,
              borderColor: content.secondary_button_text_color || sectionTextColor,
            }}
          >
            <CalendarDays size={16} />
            <EditableText
              as="span"
              field="content.secondary_cta_label"
              label="Secondary CTA button"
              source={lawyerContentSource(content, 'secondary_cta_label')}
            >
              {secondary}
            </EditableText>
          </button>
          {helperText ? (
            <EditableText
              as="p"
              field="content.helper_text"
              label="CTA helper text"
              source={lawyerContentSource(content, 'helper_text')}
              className={`text-xs leading-5 opacity-80 ${isInlineButtons ? 'basis-full lg:text-center' : 'text-center'}`}
            >
              {helperText}
            </EditableText>
          ) : null}
        </div>
      </div>
    </section>
  );
}
