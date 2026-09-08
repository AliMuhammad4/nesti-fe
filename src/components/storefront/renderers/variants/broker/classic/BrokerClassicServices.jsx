'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import { blockContent, resolveLawyerClassicIcon } from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentValue,
  brokerContentRegionClass,
  brokerIconSurfaceProps,
  brokerDarkSurfaceClass,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  shellSurfaceStyle,
  transparentSectionPresentation,
} from './brokerSectionUtils';
import { BROKER_CLASSIC_SERVICE_ITEMS } from './brokerClassicDefaults';
import {
  resolveServiceBenefits,
  serviceBenefitsPersisted,
} from './brokerClassicServiceBenefits';

export function BrokerClassicServices({
  profile,
  block,
  fallbackItems = BROKER_CLASSIC_SERVICE_ITEMS,
}) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '2');
  const { items, hasPersisted } = normalizedItems(content, fallbackItems, 'items', 8);
  const [activeTab, setActiveTab] = useState(0);
  const builderSelection = profile?.storefront_builder_selection;
  const selectedServiceIndex = (() => {
    if (!profile?.storefront_builder_preview || builderSelection?.collection !== 'items') return -1;
    if (builderSelection.itemId) {
      const byId = items.findIndex((item) => item.id === builderSelection.itemId);
      if (byId >= 0) return byId;
    }
    const byIndex = Number(builderSelection?.itemIndex);
    return Number.isInteger(byIndex) && byIndex >= 0 && byIndex < items.length
      ? byIndex
      : -1;
  })();

  useEffect(() => {
    if (selectedServiceIndex >= 0) setActiveTab(selectedServiceIndex);
  }, [selectedServiceIndex]);

  const activeItem = items[activeTab] || items[0];
  const activeBenefits = resolveServiceBenefits(activeItem);
  const benefitsPersisted = serviceBenefitsPersisted(activeItem);
  const ActiveIcon = resolveLawyerClassicIcon(
    activeItem,
    activeTab,
    ['home', 'shield', 'percent', 'target', 'building', 'briefcase'],
  );
  const activeIconProps = brokerIconSurfaceProps(content, activeItem, presentation, {
    backgroundClass: 'bg-[color:var(--storefront-accent,#008fd5)]',
    colorClass: 'text-white',
  });
  const activeIconClassName = `h-12 w-12 sm:h-14 sm:w-14 ${activeIconProps.className}`;

  return (
    <section
      id="services"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="Mortgage solutions"
          heading="Advice for every stage of your mortgage"
          body="Explore practical financing strategies backed by clear comparisons, careful preparation, and responsive support."
        />
        <div className={`mt-10 grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8 ${brokerContentRegionClass(presentation.contentAlignment)}`}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold transition ${
                  activeTab === index
                    ? 'bg-[color:var(--storefront-accent,#008fd5)] text-white'
                    : `${presentation.cardVisualClass} text-[color:var(--storefront-primary,#0c2139)] hover:opacity-95`
                }`}
                style={
                  activeTab === index
                    ? { borderRadius: presentation.controlRadius }
                    : { ...cardSurfaceStyle(presentation), borderRadius: presentation.controlRadius }
                }
              >
                <EditableText
                  as="span"
                  field="content.items"
                  label={`Service ${index + 1} title`}
                  source={hasPersisted ? 'persisted' : 'fallback'}
                  collection="items"
                  itemId={item.id}
                  itemIndex={index}
                  itemField="title"
                >
                  {item.title || item.label}
                </EditableText>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
          <article
            className="relative overflow-hidden bg-[color:var(--storefront-primary,#0c2139)] p-7 text-white sm:p-9"
            style={shellSurfaceStyle(presentation)}
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[color:var(--storefront-accent,#008fd5)]/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-4 sm:gap-5">
                <span
                  className={activeIconClassName}
                  style={activeIconProps.style}
                >
                  <ActiveIcon size={23} />
                </span>
                <EditableText
                  as="h3"
                  field="content.items"
                  label="Active service title"
                  source={hasPersisted ? 'persisted' : 'fallback'}
                  collection="items"
                  itemId={activeItem?.id}
                  itemIndex={activeTab}
                  itemField="title"
                  className="text-2xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-3xl"
                >
                  {activeItem?.title}
                </EditableText>
              </div>
              <EditableText
                as="p"
                field="content.items"
                label="Active service description"
                source={hasPersisted ? 'persisted' : 'fallback'}
                collection="items"
                itemId={activeItem?.id}
                itemIndex={activeTab}
                itemField="description"
                className="mt-6 max-w-2xl border-l-2 border-[color:var(--storefront-accent,#008fd5)]/60 pl-4 text-sm leading-7 text-white/65"
              >
                {activeItem?.description || brokerContentValue(content, 'body', 'Easy loan solutions with a clear process, minimal paperwork, and responsive support.')}
              </EditableText>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {activeBenefits.map((benefit, benefitIndex) => {
                  const isBuilderPreview = Boolean(profile?.storefront_builder_preview);
                  const isEmpty = !String(benefit || '').trim();
                  return (
                  <div
                    key={`${activeItem?.id}-benefit-${benefitIndex}`}
                    className={`flex items-start gap-2.5 p-3.5 ${brokerDarkSurfaceClass(presentation)}`}
                    style={{ ...cardSurfaceStyle(presentation), borderRadius: presentation.controlRadius }}
                  >
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[color:var(--storefront-accent,#008fd5)]" />
                    <EditableText
                      as="span"
                      field="content.items"
                      label={`Service ${activeTab + 1} benefit ${benefitIndex + 1}`}
                      source={benefitsPersisted ? 'persisted' : 'fallback'}
                      collection="items"
                      itemId={activeItem?.id}
                      itemIndex={activeTab}
                      itemField={`benefit_${benefitIndex}`}
                      className="block min-h-5 min-w-[2rem] flex-1 text-xs font-semibold leading-5 text-white/80"
                    >
                      {isEmpty && isBuilderPreview ? (
                        <span className="text-white/35 italic" data-storefront-placeholder="true">Click to add benefit</span>
                      ) : (
                        benefit
                      )}
                    </EditableText>
                  </div>
                  );
                })}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
