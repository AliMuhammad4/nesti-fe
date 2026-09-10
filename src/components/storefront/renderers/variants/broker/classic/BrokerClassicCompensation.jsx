'use client';

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
  brokerIconSurfaceProps,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  transparentSectionPresentation,
} from './brokerSectionUtils';
import { BROKER_CLASSIC_COMPENSATION_ITEMS } from './brokerClassicDefaults';

const COMP_ICON_KEYS = ['building', 'percent', 'briefcase', 'home', 'shield', 'target'];

export function BrokerClassicCompensation({
  profile,
  block,
  fallbackItems = BROKER_CLASSIC_COMPENSATION_ITEMS,
  headingDefaults = {
    eyebrow: '',
    heading: 'Transparent broker compensation',
    body: 'Clear disclosures help clients understand lender compensation, brokerage fees, and private-mortgage costs.',
  },
  disclaimerDefault = 'Compensation structures vary by lender, product, and transaction type. This section is informational and does not replace a written disclosure for your specific mortgage.',
}) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '2');
  const { items, hasPersisted } = normalizedItems(content, fallbackItems, 'items', 8);
  const disclaimer = brokerContentValue(content, 'disclaimer', disclaimerDefault).trim();

  return (
    <section
      id="compensation"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow={headingDefaults.eyebrow}
          heading={headingDefaults.heading}
          body={headingDefaults.body}
        />

        {items.length ? (
          <div className={`mt-10 grid items-stretch gap-4 ${lawyerClassicGridClass(presentation.columns, items.length, true)} ${brokerContentRegionClass(presentation.contentAlignment)}`}>
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, COMP_ICON_KEYS);
              const iconProps = brokerIconSurfaceProps(content, item, presentation, {
                backgroundClass: 'bg-[color:var(--storefront-primary,#0c2139)]',
                colorClass: 'text-white',
              });
              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-field="content.items"
                  data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                  data-storefront-label={`Compensation ${index + 1}`}
                  data-storefront-collection="items"
                  data-storefront-item-id={item.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  className={`flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:border-[color:var(--storefront-accent,#008fd5)]/30 ${presentation.cardVisualClass}`}
                  style={cardSurfaceStyle(presentation)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-11 w-11 ${iconProps.className}`}
                      style={iconProps.style}
                    >
                      <Icon size={18} />
                    </span>
                    <EditableText
                      as="h3"
                      field="content.items"
                      label={`Compensation ${index + 1} title`}
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
                    label={`Compensation ${index + 1} description`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="description"
                    className="mt-4 flex-1 text-sm leading-7 text-slate-600"
                  >
                    {item.description || item.text || ''}
                  </EditableText>
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-10 rounded-[1.25rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
            Add compensation items in the Content panel.
          </div>
        ) : null}

        {disclaimer ? (
          <EditableText
            as="p"
            field="content.disclaimer"
            label="Compensation disclaimer"
            source={lawyerContentSource(content, 'disclaimer')}
            className="mt-6 max-w-4xl text-xs leading-5 text-slate-500"
          >
            {disclaimer}
          </EditableText>
        ) : null}
      </div>
    </section>
  );
}
