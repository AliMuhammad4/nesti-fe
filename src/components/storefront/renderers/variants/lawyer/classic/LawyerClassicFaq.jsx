'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import { blockContent, lawyerClassicGridClass, lawyerClassicResolvedPaddingClass } from '../shared/lawyerSectionUtils';

const FAQ_FALLBACK = [
  { q: 'Is this legal advice?', a: 'No. This page starts an inquiry so the lawyer can review the matter and follow up appropriately.' },
  { q: 'Can I request a contract review?', a: 'Yes. Share the agreement, conditions, and timeline so the review request arrives with useful context.' },
  { q: 'What should I send before we speak?', a: 'The property address, agreement of purchase and sale, closing date, and any title or financing documents you already have.' },
  { q: 'When should I contact a lawyer?', a: 'As soon as an offer is being drafted or a closing date is in view — earlier contact leaves more time to resolve conditions and title issues.' },
  { q: 'What happens after I submit an inquiry?', a: 'The lawyer reviews the information, checks whether the matter is a fit, and contacts you about availability and next steps.' },
  { q: 'Can legal fees be confirmed before work begins?', a: 'Yes. Once the scope is clear, the lawyer can explain the expected legal fees, disbursements, and retainer requirements.' },
];

export function LawyerClassicFaq({ block, profile }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const content = blockContent(block);
  const hasPersistedFaqs = Object.prototype.hasOwnProperty.call(content, 'faqs')
    && Array.isArray(content.faqs);
  const faqs = (hasPersistedFaqs ? content.faqs : FAQ_FALLBACK)
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const [q = '', a = ''] = item.split('|').map((part) => part.trim());
        return q ? { id: `faq-${index}`, q, a } : null;
      }
      const q = String(item.q || item.title || '').trim();
      if (!q) return null;
      return {
        id: item.id || `faq-${index}`,
        q,
        a: item.a || item.text || item.answer || '',
      };
    })
    .filter(Boolean)
    .slice(0, 6);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const padding = block?.data?.layout?.padding || block?.layout?.padding || 'medium';
  const columns = String(block?.data?.layout?.columns || block?.layout?.columns || '1');
  const faqListClass = columns === '1'
    ? 'mt-10 space-y-3'
    : `mt-10 grid gap-3 ${lawyerClassicGridClass(columns, faqs.length)}`;
  const faqCardBackground = content.faq_card_background || '';
  const faqCardTextColor = content.faq_card_text_color || '';
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
    <div id="faq" className={`w-full max-w-none bg-transparent px-5 sm:px-6 lg:px-8 ${lawyerClassicResolvedPaddingClass(padding, 'py-20')}`}>
      <div className="w-full max-w-none">
        <div className="max-w-3xl" data-storefront-anim-item="true">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="FAQ eyebrow"
            source={content.eyebrow ? 'persisted' : 'fallback'}
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            {content.eyebrow || 'Helpful questions'}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="FAQ heading"
            source={content.heading ? 'persisted' : 'fallback'}
            className="mt-3 text-3xl font-semibold uppercase tracking-[-0.02em] text-primary sm:text-4xl"
          >
            {content.heading || 'What clients often ask'}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="FAQ description"
            source={content.body ? 'persisted' : 'fallback'}
            className="mt-4 max-w-2xl text-sm leading-7 text-slate-500"
          >
            {content.body || 'Clear answers to common questions before you start.'}
          </EditableText>
          <div className="mt-5 h-0.5 w-16 bg-accent" />
        </div>

        {faqs.length ? (
          <div className={faqListClass}>
            {faqs.map((item, index) => {
              const expanded = openFaqIndex === index || selectedFaqIndex === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpenFaqIndex(expanded ? -1 : index)}
                  data-storefront-anim-item="true"
                  className="w-full border border-primary/10 bg-white/75 px-5 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,.035)] transition hover:border-accent/45 hover:bg-white sm:px-6"
                  style={{
                    background: faqCardBackground || undefined,
                    color: faqCardTextColor || undefined,
                  }}
                  aria-expanded={expanded}
                >
                  <span
                    data-storefront-field="content.faqs"
                    data-storefront-source={hasPersistedFaqs ? 'persisted' : 'fallback'}
                    data-storefront-collection="faqs"
                    data-storefront-item-id={item.id}
                    data-storefront-item-index={index}
                    data-storefront-item-field="q"
                    data-storefront-label={`FAQ ${index + 1}`}
                    className={`flex items-center justify-between gap-4 text-base font-semibold ${faqCardTextColor ? 'text-current' : 'text-primary'}`}
                  >
                    {item.q}
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-accent transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                    />
                  </span>
                  {expanded && item.a ? (
                    <EditableText
                      as="span"
                      field="content.faqs"
                      label={`FAQ ${index + 1} answer`}
                      source={hasPersistedFaqs ? 'persisted' : 'fallback'}
                      collection="faqs"
                      itemId={item.id}
                      itemIndex={index}
                      itemField="a"
                      className={`mt-3 block pr-8 text-sm leading-6 ${faqCardTextColor ? 'text-current opacity-70' : 'text-slate-500'}`}
                    >
                      {item.a}
                    </EditableText>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-10 border border-dashed border-slate-300 bg-white/50 px-6 py-10 text-center text-sm text-slate-500">
            Add up to six FAQs in the Content panel.
          </div>
        ) : null}
      </div>
    </div>
  );
}
