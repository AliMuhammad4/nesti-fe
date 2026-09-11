'use client';

import { useEffect, useRef, useState } from 'react';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerClassicItemSurface,
  lawyerClassicResolvedPaddingClass,
  lawyerClassicSectionStyle,
  lawyerClassicToneClass,
  isLightHexColor,
  resolveLawyerClassicIcon,
} from '../shared/lawyerSectionUtils';

const PRACTICE_ICON_KEYS = ['building', 'home', 'contract', 'landmark', 'gavel', 'briefcase'];

export function LawyerClassicPracticeAreas({ profile, block }) {
  const content = blockContent(block);
  const hasPersistedItems = Object.prototype.hasOwnProperty.call(content, 'items')
    && Array.isArray(content.items);
  const sourceItems = hasPersistedItems
    ? content.items
    : (profile?.practice_areas || []).map((title) => ({ title }));
  const fallback = [
    { title: 'Residential Closings', description: 'Purchase and sale guidance from agreement through registration.' },
    { title: 'Commercial Real Estate', description: 'Practical support for commercial property transactions and documents.' },
    { title: 'Contract Review', description: 'Understand key obligations, conditions, timelines, and legal risks.' },
    { title: 'Title & Ownership', description: 'Resolve title, transfer, registration, and ownership concerns.' },
    { title: 'Refinancing', description: 'Coordinate lender requirements, payout statements, and registration.' },
    { title: 'Property Disputes', description: 'Organize the facts and identify an appropriate legal next step.' },
  ];
  const items = (sourceItems.length || hasPersistedItems ? sourceItems : fallback)
    .map((item, index) => (
      typeof item === 'string'
        ? { id: `practice-area-${index}`, title: item, description: '' }
        : item
    ))
    .filter((item) => item?.title)
    .slice(0, 6);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const columns = block?.data?.layout?.columns || block?.layout?.columns || '3';
  const padding = block?.data?.layout?.padding || block?.layout?.padding || 'medium';
  const sectionStyle = lawyerClassicSectionStyle(block);
  const usesLayeredSectionStyle = [
    'lawyer-first-home-closing',
    'lawyer-investor',
  ].includes(profile?.storefront_template_key);
  const hasCustomText = usesLayeredSectionStyle && Boolean(String(sectionStyle.textColor || '').trim());
  const descriptionRefs = useRef({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandableDescriptions, setExpandableDescriptions] = useState({});
  const descriptionSignature = items
    .map((item, index) => `${item.id || index}:${item.description || item.text || ''}`)
    .join('|');

  useEffect(() => {
    const measure = () => {
      const next = {};
      Object.entries(descriptionRefs.current).forEach(([id, node]) => {
        next[id] = Boolean(node && node.scrollHeight > node.clientHeight + 1);
      });
      setExpandableDescriptions((current) => {
        const keys = [...new Set([...Object.keys(current), ...Object.keys(next)])];
        return keys.every((key) => current[key] === next[key]) ? current : next;
      });
    };
    const frame = window.requestAnimationFrame(measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    Object.values(descriptionRefs.current).forEach((node) => {
      if (node) observer?.observe(node);
    });
    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [descriptionSignature]);

  return (
    <div
      id="services"
      className={`w-full max-w-none bg-transparent px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicResolvedPaddingClass(padding, 'py-16')}`}
      style={usesLayeredSectionStyle ? {
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      } : undefined}
    >
      <div className="w-full max-w-none">
        <div className="max-w-3xl" data-storefront-anim-item="true">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="Practice areas eyebrow"
            source={content.eyebrow ? 'persisted' : 'fallback'}
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            {content.eyebrow || 'Legal services'}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="Practice areas heading"
            source={content.heading ? 'persisted' : 'fallback'}
            className={`mt-3 text-3xl font-semibold uppercase tracking-tight sm:text-4xl ${hasCustomText ? 'text-current' : 'text-primary'}`}
          >
            {content.heading || 'Our practice areas'}
          </EditableText>
          <div className="mt-5 h-0.5 w-14 bg-accent" />
          <EditableText
            as="p"
            field="content.body"
            label="Practice areas description"
            source={content.body ? 'persisted' : 'fallback'}
            className={`mt-5 max-w-2xl text-sm leading-6 ${hasCustomText ? 'text-current opacity-70' : 'text-slate-500'}`}
          >
            {content.body || 'Focused legal support for real estate decisions, documents, ownership, financing, and closing.'}
          </EditableText>
        </div>

        {items.length ? (
        <div className={`mt-11 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 ${lawyerClassicGridClass(columns, items.length)}`}>
          {items.map((item, index) => {
            const Icon = resolveLawyerClassicIcon(item, index, PRACTICE_ICON_KEYS);
            const itemId = String(item.id || `${item.title}-${index}`);
            const description = item.description || item.text || 'Clear advice, document support, and practical next steps for your matter.';
            const isExpanded = Boolean(expandedDescriptions[itemId]);
            const canExpand = Boolean(expandableDescriptions[itemId]);
            const cardSurface = lawyerClassicItemSurface(item);
            const cardText = item.text_color
              || (cardSurface.background
                ? (isLightHexColor(cardSurface.background) ? '#1f2839' : '#ffffff')
                : '');
            return (
              <article
                key={itemId}
                data-lawyer-practice-card="true"
                data-storefront-anim-item="true"
                data-storefront-anim-hover="lift"
                className={`group flex h-56 flex-col p-6 transition ${cardSurface.background ? '' : 'bg-white hover:bg-primary'}`}
                style={{
                  ...cardSurface,
                  ...(cardText ? { color: cardText } : {}),
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center text-accent transition group-hover:scale-110">
                    <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <EditableText
                    as="h3"
                    field="content.items"
                    label={`Practice area ${index + 1} title`}
                    source={hasPersistedItems ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className={`min-w-0 flex-1 text-lg font-semibold leading-tight transition ${
                      lawyerClassicToneClass(cardText, 'text-primary group-hover:text-primary-contrast')
                    }`}
                  >
                    {item.title}
                  </EditableText>
                </div>
                <EditableText
                  as="p"
                  elementRef={(node) => {
                    if (node) descriptionRefs.current[itemId] = node;
                    else delete descriptionRefs.current[itemId];
                  }}
                  field="content.items"
                  label={`Practice area ${index + 1} description`}
                  source={hasPersistedItems ? 'persisted' : 'fallback'}
                  collection="items"
                  itemId={item.id}
                  itemIndex={index}
                  itemField="description"
                  className={`mt-5 h-[4.5rem] text-sm leading-6 transition ${
                    lawyerClassicToneClass(cardText, 'text-slate-500 group-hover:text-primary-contrast group-hover:opacity-[0.65]')
                  } ${isExpanded ? 'overflow-y-auto pr-2' : 'line-clamp-3 overflow-hidden'}`}
                >
                  {description}
                </EditableText>
                {canExpand ? (
                  <button
                    type="button"
                    onClick={() => setExpandedDescriptions((current) => ({
                      ...current,
                      [itemId]: !current[itemId],
                    }))}
                    className="mt-auto self-start pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-accent"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? 'Read less' : 'Read more'}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
        ) : isPreview ? (
          <div className="mt-11 border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center text-sm text-slate-500">
            Add a practice area in the Content panel.
          </div>
        ) : null}
      </div>
    </div>
  );
}
