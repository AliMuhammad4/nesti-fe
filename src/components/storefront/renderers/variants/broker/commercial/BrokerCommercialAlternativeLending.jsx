'use client';

import { ArrowUpRight } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerContentSource,
  resolveLawyerClassicIcon,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from '../classic/BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentValue,
  brokerContentRegionClass,
  brokerIconSurfaceProps,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  transparentSectionPresentation,
} from '../classic/brokerSectionUtils';
import { COMMERCIAL_ALTERNATIVE_ITEMS } from './brokerCommercialDefaults';
import { COMMERCIAL_PALETTE as P } from './brokerCommercialPalette';

export const COMMERCIAL_ALTERNATIVE_CARD_MAX = 12;
const ALT_ICON_KEYS = ['briefcase', 'target', 'shield', 'percent', 'building', 'home', 'calculator'];

const HEADING_DEFAULTS = {
  eyebrow: 'Private & alternative lending',
  heading: 'Options beyond the traditional bank path',
  body: 'Explore specialty pathways for complex income, credit, investment, and short-term needs across U.S. and Canadian lenders—without assuming approval.',
};

const DISCLAIMER_DEFAULT = '';

export function BrokerCommercialAlternativeLending({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '3');
  const { items, hasPersisted } = normalizedItems(
    content,
    COMMERCIAL_ALTERNATIVE_ITEMS,
    'items',
    COMMERCIAL_ALTERNATIVE_CARD_MAX,
  );
  const ctaLabel = brokerContentValue(content, 'cta_label', 'Explore My Mortgage Options');
  const disclaimer = brokerContentValue(content, 'disclaimer', DISCLAIMER_DEFAULT).trim();
  const ctaBackground = String(content.cta_background || '').trim();
  const ctaTextColor = String(content.cta_text_color || '').trim();

  const handleCta = () => {
    if (typeof actions.onDirectLeadClick === 'function') {
      actions.onDirectLeadClick();
      return;
    }
    actions.onCtaClick?.('explore_options');
  };

  return (
    <section
      id="alternative-lending"
      data-broker-commercial-alternative="true"
      className={`relative overflow-hidden px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${P.accent}66, transparent)` }}
      />

      <div className="relative w-full">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow={HEADING_DEFAULTS.eyebrow}
          heading={HEADING_DEFAULTS.heading}
          body={HEADING_DEFAULTS.body}
        />

        {items.length ? (
          <div
            className={`mt-8 grid items-stretch gap-4 ${lawyerClassicGridClass(presentation.columns, items.length, true)} ${brokerContentRegionClass(presentation.contentAlignment)}`}
          >
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, ALT_ICON_KEYS);
              const iconProps = brokerIconSurfaceProps(content, item, presentation, {
                backgroundClass: 'bg-[color:var(--storefront-accent,#7EADC2)]/15',
                colorClass: 'text-[color:var(--storefront-primary,#141C26)]',
              });
              const indexLabel = String(index + 1).padStart(2, '0');

              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-field="content.items"
                  data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                  data-storefront-label={`Alternative option ${index + 1}`}
                  data-storefront-collection="items"
                  data-storefront-item-id={item.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  className={`group relative flex h-full flex-col overflow-hidden p-5 sm:p-6 transition duration-300 hover:-translate-y-0.5 ${presentation.cardVisualClass}`}
                  style={cardSurfaceStyle(presentation)}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition duration-300 group-hover:scale-x-100"
                    style={{ backgroundColor: `var(--storefront-accent, ${P.accent})` }}
                  />

                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center sm:h-11 sm:w-11 ${iconProps.className}`}
                      style={iconProps.style}
                    >
                      <Icon size={18} strokeWidth={2.1} />
                    </span>
                    <EditableText
                      as="h3"
                      field="content.items"
                      label={`Alternative option ${index + 1} title`}
                      source={hasPersisted ? 'persisted' : 'fallback'}
                      collection="items"
                      itemId={item.id}
                      itemIndex={index}
                      itemField="title"
                      className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-[color:var(--storefront-primary,#141C26)] sm:text-lg"
                    >
                      {item.title}
                    </EditableText>
                    <span
                      className="shrink-0 text-[10px] font-bold tracking-[0.18em] sm:text-[11px]"
                      style={{ color: `var(--storefront-accent, ${P.accent})` }}
                    >
                      {indexLabel}
                    </span>
                  </div>

                  <EditableText
                    as="p"
                    field="content.items"
                    label={`Alternative option ${index + 1} description`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="description"
                    className="mt-3 flex-1 text-sm leading-6 text-slate-600 sm:leading-7"
                  >
                    {item.description || ''}
                  </EditableText>
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-8 border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
            Add up to {COMMERCIAL_ALTERNATIVE_CARD_MAX} alternative lending options in the Content panel.
          </div>
        ) : null}

        <div className={`mt-8 flex flex-col gap-4 sm:flex-row sm:items-end ${disclaimer ? 'sm:justify-between' : 'sm:justify-end'}`} data-storefront-anim-item="true">
          {disclaimer ? (
            <EditableText
              as="p"
              field="content.disclaimer"
              label="Alternative lending disclaimer"
              source={lawyerContentSource(content, 'disclaimer')}
              className="max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6"
            >
              {disclaimer}
            </EditableText>
          ) : null}

          <button
            type="button"
            onClick={handleCta}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-[color:var(--storefront-primary,#141C26)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
            style={{
              borderRadius: presentation.controlRadius,
              boxShadow: presentation.shellShadow,
              ...(ctaBackground ? { backgroundColor: ctaBackground } : {}),
              ...(ctaTextColor ? { color: ctaTextColor } : {}),
            }}
          >
            <EditableText
              field="content.cta_label"
              label="Alternative lending CTA"
              source={lawyerContentSource(content, 'cta_label')}
            >
              {ctaLabel}
            </EditableText>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
