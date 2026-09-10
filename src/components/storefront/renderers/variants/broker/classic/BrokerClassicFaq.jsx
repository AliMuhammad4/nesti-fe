'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerContentSource,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentRegionClass,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  transparentSectionPresentation,
} from './brokerSectionUtils';
import { BROKER_CLASSIC_FAQS } from './brokerClassicDefaults';

export function BrokerClassicFaq({
  profile,
  block,
  fallbackFaqs = BROKER_CLASSIC_FAQS,
  headingDefaults = {
    eyebrow: 'Helpful questions',
    heading: 'What clients often ask',
    body: 'Clear answers to common mortgage questions before you start.',
  },
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '1');
  const faqCardBackground = content.faq_card_background || '';
  const faqCardTextColor = content.faq_card_text_color || '';
  const hasPersistedFaqs = Object.prototype.hasOwnProperty.call(content, 'faqs')
    && Array.isArray(content.faqs);
  const faqs = (hasPersistedFaqs ? content.faqs : fallbackFaqs)
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const [q = '', a = ''] = item.split('|').map((part) => part.trim());
        return q ? { id: `faq-${index}`, q, a } : null;
      }
      const q = String(item.q || item.title || '').trim();
      if (!q) return null;
      return {
        ...item,
        id: item.id || `faq-${index}`,
        q,
        a: item.a || item.text || item.answer || '',
      };
    })
    .filter(Boolean)
    .slice(0, 8);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const builderSelection = profile?.storefront_builder_selection;
  const selectedFaqIndex = (() => {
    if (!isPreview || builderSelection?.collection !== 'faqs') return -1;
    if (builderSelection.itemId) {
      const byId = faqs.findIndex((faq) => faq.id === builderSelection.itemId);
      if (byId >= 0) return byId;
    }
    const byIndex = Number(builderSelection?.itemIndex);
    return Number.isInteger(byIndex) && byIndex >= 0 && byIndex < faqs.length
      ? byIndex
      : -1;
  })();

  useEffect(() => {
    if (selectedFaqIndex >= 0) setOpenFaqIndex(selectedFaqIndex);
  }, [selectedFaqIndex]);

  return (
    <section
      id="faq"
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

        {faqs.length ? (
          <div className={`mt-10 space-y-3 ${brokerContentRegionClass(presentation.contentAlignment)}`}>
            {faqs.map((item, index) => {
              const expanded = openFaqIndex === index || selectedFaqIndex === index;
              return (
                <div
                  key={item.id}
                  data-storefront-anim-item="true"
                  className={`px-5 py-4 transition hover:border-[color:var(--storefront-accent,#008fd5)]/35 hover:brightness-[1.02] sm:px-6 ${presentation.cardVisualClass}`}
                  style={{
                    ...cardSurfaceStyle(presentation),
                    ...(faqCardBackground ? { backgroundColor: faqCardBackground } : {}),
                    ...(faqCardTextColor ? { color: faqCardTextColor } : {}),
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <EditableText
                      as="span"
                      field="content.faqs"
                      label={`FAQ ${index + 1} question`}
                      source={hasPersistedFaqs ? 'persisted' : 'fallback'}
                      collection="faqs"
                      itemId={item.id}
                      itemIndex={index}
                      itemField="q"
                      className={`flex-1 text-base font-semibold ${faqCardTextColor ? 'text-current' : 'text-[color:var(--storefront-primary,#0c2139)]'}`}
                    >
                      {item.q}
                    </EditableText>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(expanded ? -1 : index)}
                      className="shrink-0 rounded-md p-1 text-[color:var(--storefront-accent,#008fd5)] transition hover:bg-slate-100"
                      aria-expanded={expanded}
                      aria-label={expanded ? 'Collapse answer' : 'Expand answer'}
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  {expanded && item.a ? (
                    <EditableText
                      as="p"
                      field="content.faqs"
                      label={`FAQ ${index + 1} answer`}
                      source={lawyerContentSource(content, 'faqs')}
                      collection="faqs"
                      itemId={item.id}
                      itemIndex={index}
                      itemField="a"
                      className={`mt-3 text-sm leading-6 ${faqCardTextColor ? 'text-current opacity-80' : 'text-slate-600'}`}
                    >
                      {item.a}
                    </EditableText>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-10 text-center text-sm text-slate-500">
            Add up to eight FAQs in the Content panel.
          </div>
        ) : null}
      </div>
    </section>
  );
}
