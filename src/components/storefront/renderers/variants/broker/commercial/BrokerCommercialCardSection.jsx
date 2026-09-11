'use client';

import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  resolveLawyerClassicIcon,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from '../classic/BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentRegionClass,
  brokerIconSurfaceProps,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  transparentSectionPresentation,
} from '../classic/brokerSectionUtils';
import { COMMERCIAL_PALETTE as P } from './brokerCommercialPalette';

const DEFAULT_ICONS = ['briefcase', 'target', 'shield', 'percent', 'building', 'home', 'calculator'];

/**
 * Shared premium card grid for commercial deal-desk sections.
 * Keeps services / who-we-help / similar layers visually consistent.
 */
export function BrokerCommercialCardSection({
  profile,
  block,
  sectionId,
  dataAttr,
  fallbackItems = [],
  itemLimit = 12,
  collection = 'items',
  headingDefaults = {},
  iconKeys = DEFAULT_ICONS,
  emptyLabel = 'Add cards in the Content panel.',
  showIndex = true,
  columnsFallback = '3',
}) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const presentation = transparentSectionPresentation(block, BROKER_INK, columnsFallback);
  const { items, hasPersisted } = normalizedItems(content, fallbackItems, collection, itemLimit);

  return (
    <section
      id={sectionId}
      {...(dataAttr ? { [dataAttr]: 'true' } : {})}
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
          eyebrow={headingDefaults.eyebrow || ''}
          heading={headingDefaults.heading || ''}
          body={headingDefaults.body || ''}
        />

        {items.length ? (
          <div
            className={`mt-8 grid items-stretch gap-4 ${lawyerClassicGridClass(presentation.columns, items.length, true)} ${brokerContentRegionClass(presentation.contentAlignment)}`}
          >
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, iconKeys);
              const iconProps = brokerIconSurfaceProps(content, item, presentation, {
                backgroundClass: 'bg-[color:var(--storefront-accent,#7EADC2)]/15',
                colorClass: 'text-[color:var(--storefront-primary,#141C26)]',
              });
              const indexLabel = String(index + 1).padStart(2, '0');
              const title = item.title || item.label || '';

              return (
                <article
                  key={item.id || `${sectionId}-${index}`}
                  data-storefront-anim-item="true"
                  data-storefront-field={`content.${collection}`}
                  data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                  data-storefront-label={`${headingDefaults.heading || 'Card'} ${index + 1}`}
                  data-storefront-collection={collection}
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
                      field={`content.${collection}`}
                      label={`Card ${index + 1} title`}
                      source={hasPersisted ? 'persisted' : 'fallback'}
                      collection={collection}
                      itemId={item.id}
                      itemIndex={index}
                      itemField="title"
                      className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-[color:var(--storefront-primary,#141C26)] sm:text-lg"
                    >
                      {title}
                    </EditableText>
                    {showIndex ? (
                      <span
                        className="shrink-0 text-[10px] font-bold tracking-[0.18em] sm:text-[11px]"
                        style={{ color: `var(--storefront-accent, ${P.accent})` }}
                      >
                        {indexLabel}
                      </span>
                    ) : null}
                  </div>

                  <EditableText
                    as="p"
                    field={`content.${collection}`}
                    label={`Card ${index + 1} description`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection={collection}
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
            {emptyLabel}
          </div>
        ) : null}
      </div>
    </section>
  );
}
