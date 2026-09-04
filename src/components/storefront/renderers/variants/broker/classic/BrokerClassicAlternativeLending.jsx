'use client';

import { ArrowUpRight } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerContentSource,
  resolveLawyerClassicIcon,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentValue,
  brokerContentRegionClass,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  transparentSectionPresentation,
} from './brokerSectionUtils';

const ALTERNATIVE_FALLBACK = [
  { id: 'alt-self-employed', title: 'Self-employed borrowers', description: 'Present business income and documentation through suitable lender programs.', icon: 'briefcase' },
  { id: 'alt-non-traditional', title: 'Non-traditional income', description: 'Explore options when income is commission-based, contract, or otherwise non-standard.', icon: 'target' },
  { id: 'alt-credit', title: 'Credit challenges', description: 'Review alternative and private paths when A-lender credit criteria are difficult to meet.', icon: 'shield' },
  { id: 'alt-refinance', title: 'Refinance & debt consolidation', description: 'Restructure debt, access equity, or simplify payments with a clear comparison of options.', icon: 'percent' },
  { id: 'alt-investor', title: 'Investment properties', description: 'Structure financing around rental income, cash flow, and portfolio goals.', icon: 'building' },
  { id: 'alt-private', title: 'Private & short-term financing', description: 'Bridge, construction, and private mortgage options for time-sensitive or complex files.', icon: 'home' },
];

const ALT_ICON_KEYS = ['briefcase', 'target', 'shield', 'percent', 'building', 'home'];

export function BrokerClassicAlternativeLending({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '3');
  const { items, hasPersisted } = normalizedItems(content, ALTERNATIVE_FALLBACK, 'items', 12);
  const ctaLabel = brokerContentValue(content, 'cta_label', 'Explore My Mortgage Options');

  return (
    <section
      id="alternative-lending"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="Private & alternative lending"
          heading="Options beyond the traditional bank path"
          body="Help visitors explore potential solutions for complex income, credit, investment, and short-term financing needs."
        />

        {items.length ? (
          <div className={`mt-10 grid items-stretch gap-5 ${lawyerClassicGridClass(presentation.columns, items.length, true)} ${brokerContentRegionClass(presentation.contentAlignment)}`}>
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, ALT_ICON_KEYS);
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
                  className={`flex h-full flex-col p-6 transition hover:-translate-y-1 hover:border-[color:var(--storefront-accent,#008fd5)]/30 ${presentation.cardVisualClass}`}
                  style={cardSurfaceStyle(presentation)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center bg-[color:var(--storefront-accent,#008fd5)] text-white"
                      style={{ borderRadius: presentation.controlRadius }}>
                      <Icon size={18} />
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
                      className="min-w-0 text-base font-bold leading-snug tracking-tight text-[color:var(--storefront-primary,#0c2139)] sm:text-lg"
                    >
                      {item.title}
                    </EditableText>
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
                    className="mt-4 flex-1 text-sm leading-7 text-slate-600"
                  >
                    {item.description || ''}
                  </EditableText>
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-10 rounded-[1.25rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
            Add alternative lending options in the Content panel.
          </div>
        ) : null}

        <div className="mt-8" data-storefront-anim-item="true">
          <button
            type="button"
            onClick={() => {
              actions.onCtaClick?.('explore_options');
              actions.onDirectLeadClick?.();
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 bg-[color:var(--storefront-primary,#0c2139)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
            style={{
              borderRadius: presentation.controlRadius,
              boxShadow: presentation.shellShadow,
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
