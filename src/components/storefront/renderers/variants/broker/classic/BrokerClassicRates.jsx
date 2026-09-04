'use client';

import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerContentSource,
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

const RATE_FALLBACK = [
  { id: 'rate-5y-fixed', title: '5-Year Fixed', rate: 'Starting from —%', description: 'Popular fixed term for purchase and refinance planning.' },
  { id: 'rate-3y-fixed', title: '3-Year Fixed', rate: 'Starting from —%', description: 'Shorter fixed term when flexibility matters.' },
  { id: 'rate-variable', title: 'Variable', rate: 'Starting from —%', description: 'Variable options for borrowers comfortable with rate movement.' },
  { id: 'rate-alternative', title: 'Alternative', rate: 'Starting from —%', description: 'Solutions when A-lender criteria are not the best fit.' },
  { id: 'rate-private', title: 'Private', rate: 'Custom', description: 'Short-term and private options reviewed case by case.' },
];

export function BrokerClassicRates({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '1');
  const { items, hasPersisted } = normalizedItems(content, RATE_FALLBACK, 'items', 12);
  const ctaLabel = brokerContentValue(content, 'cta_label', 'Get My Personalized Rate');

  return (
    <section
      id="rates"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="Current rate ranges"
          heading="Explore starting mortgage rates"
          body="Compare common rate categories, then request a personalized review based on your file."
        />

        {items.length ? (
          <div
            className={`mt-10 overflow-hidden ${presentation.cardVisualClass} ${brokerContentRegionClass(presentation.contentAlignment)}`}
            style={cardSurfaceStyle(presentation)}
          >
            <div className="hidden border-b border-slate-100 bg-slate-50/90 px-6 py-3 sm:grid sm:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)_minmax(0,1.45fr)] sm:gap-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Product</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Rate</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Best for</p>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-field="content.items"
                  data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                  data-storefront-label={`Rate ${index + 1}`}
                  data-storefront-collection="items"
                  data-storefront-item-id={item.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  className="grid gap-2 px-5 py-5 transition hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)_minmax(0,1.45fr)] sm:items-center sm:gap-6 sm:px-6 sm:py-5"
                >
                  <EditableText
                    as="h3"
                    field="content.items"
                    label={`Rate ${index + 1} title`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className="text-[15px] font-bold tracking-tight text-[color:var(--storefront-primary,#0c2139)] sm:text-base"
                  >
                    {item.title}
                  </EditableText>
                  <EditableText
                    field="content.items"
                    label={`Rate ${index + 1} value`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="rate"
                    className="text-[1.05rem] font-semibold tracking-tight text-[color:var(--storefront-accent,#008fd5)] sm:text-lg"
                  >
                    {item.rate || item.value || ''}
                  </EditableText>
                  <EditableText
                    as="p"
                    field="content.items"
                    label={`Rate ${index + 1} description`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="description"
                    className="text-sm leading-6 text-slate-500"
                  >
                    {item.description || ''}
                  </EditableText>
                </article>
              ))}
            </div>

            <div className="flex justify-center border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-5 py-5 sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => {
                  actions.onCtaClick?.('get_rate');
                  actions.onDirectLeadClick?.();
                }}
                className="inline-flex min-h-12 w-full items-center justify-center bg-[color:var(--storefront-accent,#008fd5)] px-6 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:brightness-105 sm:w-auto"
                style={{
                  borderRadius: presentation.controlRadius,
                  boxShadow: presentation.shellShadow,
                }}
              >
                <EditableText
                  field="content.cta_label"
                  label="Rates CTA label"
                  source={lawyerContentSource(content, 'cta_label')}
                >
                  {ctaLabel}
                </EditableText>
              </button>
            </div>
          </div>
        ) : isPreview ? (
          <div className="mt-10 rounded-[1.35rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
            Add mortgage rates in the Content panel. Edit the product name, rate, and description for each row.
          </div>
        ) : null}
      </div>
    </section>
  );
}
