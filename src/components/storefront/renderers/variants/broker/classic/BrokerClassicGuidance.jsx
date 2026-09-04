'use client';

import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentBadgeMarginClass,
  brokerContentRegionClass,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  transparentSectionPresentation,
} from './brokerSectionUtils';

export function BrokerClassicGuidance({ block }) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '3');
  const processCardBackground = content.process_card_background || '';
  const processCardTextColor = content.process_card_text_color || '';
  const hasCustomCardColors = Boolean(processCardBackground || processCardTextColor);
  const { items, hasPersisted } = normalizedItems(content, [
    { id: 'benefit-team', title: 'Professional team', description: 'Experienced advisors focused on fit, not just the headline rate.' },
    { id: 'benefit-payments', title: 'Quick payments', description: 'Fast approvals and clear timelines from application to funding.' },
    { id: 'benefit-process', title: 'Loan process', description: 'A structured process from consultation through closing.' },
  ], 'steps', 6);

  return (
    <section
      id="guidance"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="Our benefits"
          heading="Why choose us?"
          body="Provide your best loan services and let our experienced team guide you with less paperwork and faster approvals."
        />
        <div className={`mt-10 grid gap-5 ${lawyerClassicGridClass(presentation.columns, items.length, true)} ${brokerContentRegionClass(presentation.contentAlignment)}`}>
          {items.map((item, index) => (
            <article
              key={item.id}
              className={`p-6 transition hover:border-[color:var(--storefront-accent,#008fd5)]/30 ${presentation.cardVisualClass}`}
              style={{
                ...cardSurfaceStyle(presentation),
                ...(processCardBackground ? { backgroundColor: processCardBackground } : {}),
                ...(processCardTextColor ? { color: processCardTextColor } : {}),
              }}
            >
              <span
                className={`mb-4 grid h-12 w-12 place-items-center text-sm font-bold ${brokerContentBadgeMarginClass(presentation.contentAlignment)} ${
                  hasCustomCardColors
                    ? 'bg-current/10 text-current'
                    : 'bg-[color:var(--storefront-accent,#008fd5)]/10 text-[color:var(--storefront-accent,#008fd5)]'
                }`}
                style={{ borderRadius: presentation.controlRadius }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <EditableText
                as="h3"
                field="content.steps"
                label={`Benefit ${index + 1} title`}
                source={hasPersisted ? 'persisted' : 'fallback'}
                collection="steps"
                itemId={item.id}
                itemIndex={index}
                itemField="title"
                className={`text-lg font-bold ${hasCustomCardColors ? 'text-current' : 'text-[color:var(--storefront-primary,#0c2139)]'}`}
              >
                {item.title}
              </EditableText>
              <EditableText
                as="p"
                field="content.steps"
                label={`Benefit ${index + 1} description`}
                source={hasPersisted ? 'persisted' : 'fallback'}
                collection="steps"
                itemId={item.id}
                itemIndex={index}
                itemField="description"
                className={`mt-3 text-sm leading-7 ${hasCustomCardColors ? 'text-current opacity-70' : 'text-slate-600'}`}
              >
                {item.description}
              </EditableText>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
