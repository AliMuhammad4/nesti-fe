'use client';

import { useEffect, useRef, useState } from 'react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  resolveLawyerClassicIcon,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentRegionClass,
  brokerIconSurfaceProps,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  transparentSectionPresentation,
} from './brokerSectionUtils';
import { BROKER_CLASSIC_PROGRAM_ITEMS } from './brokerClassicDefaults';

const PROGRAM_ICON_KEYS = ['home', 'building', 'percent', 'target', 'briefcase', 'shield'];

function ProgramDescription({
  text,
  hasPersisted,
  itemId,
  itemIndex,
}) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const measureRef = useRef(null);

  useEffect(() => {
    const node = measureRef.current;
    if (!node) return undefined;

    const check = () => {
      if (expanded) return;
      setNeedsToggle(node.scrollHeight > node.clientHeight + 1);
    };

    check();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(check)
      : null;
    observer?.observe(node);
    window.addEventListener('resize', check);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [text, expanded]);

  return (
    <div className="mt-4 flex min-h-[5.25rem] flex-1 flex-col">
      <div
        ref={measureRef}
        className={expanded ? '' : 'line-clamp-3'}
      >
        <EditableText
          as="p"
          field="content.items"
          label={`Program ${itemIndex + 1} description`}
          source={hasPersisted ? 'persisted' : 'fallback'}
          collection="items"
          itemId={itemId}
          itemIndex={itemIndex}
          itemField="description"
          className="text-sm leading-7 text-slate-600"
        >
          {text}
        </EditableText>
      </div>
      {needsToggle || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 self-start text-sm font-semibold text-[color:var(--storefront-accent,#008fd5)] transition hover:brightness-110"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      ) : (
        <span className="mt-2 h-5" aria-hidden />
      )}
    </div>
  );
}

export function BrokerClassicPrograms({
  profile,
  block,
  fallbackItems = BROKER_CLASSIC_PROGRAM_ITEMS,
  headingDefaults = {
    eyebrow: 'Mortgage programs',
    heading: 'Financing paths for every stage',
    body: 'Purchase, refinance, renewal, and first-time buyer guidance with clear next steps.',
  },
}) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '3');
  const { items, hasPersisted } = normalizedItems(
    content,
    fallbackItems,
    'items',
    12,
  );

  return (
    <section
      id="programs"
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
          <div className={`mt-10 grid items-stretch gap-5 ${lawyerClassicGridClass(presentation.columns, items.length, true)} ${brokerContentRegionClass(presentation.contentAlignment)}`}>
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, PROGRAM_ICON_KEYS);
              const iconProps = brokerIconSurfaceProps(content, item, presentation);
              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-field="content.items"
                  data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                  data-storefront-label={`Program ${index + 1}`}
                  data-storefront-collection="items"
                  data-storefront-item-id={item.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  className={`flex h-full flex-col p-6 transition hover:-translate-y-1 hover:border-[color:var(--storefront-accent,#008fd5)]/30 ${presentation.cardVisualClass}`}
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
                      label={`Program ${index + 1} title`}
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

                  <ProgramDescription
                    text={item.description || ''}
                    hasPersisted={hasPersisted}
                    itemId={item.id}
                    itemIndex={index}
                  />
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-10 rounded-[1.25rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
            Add mortgage programs in the Content panel.
          </div>
        ) : null}
      </div>
    </section>
  );
}
