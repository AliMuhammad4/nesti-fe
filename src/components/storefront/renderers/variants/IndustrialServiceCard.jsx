'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function IndustrialServiceCard({
  service,
  index,
  itemId,
  IconComponent,
  cardVisualClass,
  sectionRadius,
  cardShadow,
  hasCustomTextColor,
  hasPersistedItems,
  cardBackground = '',
  cardTextColor = '',
  iconBackground = '',
  iconColor = '',
}) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const descriptionRef = useRef(null);
  const description = service?.description || '';
  const hasCardText = Boolean(cardTextColor) || hasCustomTextColor;

  useEffect(() => {
    if (expanded) return undefined;
    const element = descriptionRef.current;
    if (!element) return undefined;
    const measure = () => {
      setNeedsToggle(element.scrollHeight - 1 > element.clientHeight);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [description, expanded]);

  const toggleExpanded = (event) => {
    event.stopPropagation();
    setExpanded((current) => !current);
  };

  const visualClass = cardBackground
    ? cardVisualClass.replace(/\bbg-[^\s]+/g, '').replace(/\s+/g, ' ').trim()
    : cardVisualClass;

  return (
    <div
      data-storefront-anim-item="true"
      data-storefront-field="content.items"
      data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
      data-storefront-collection="items"
      data-storefront-item-id={itemId}
      data-storefront-item-index={index}
      data-storefront-item-field="title"
      data-storefront-label={`Service ${index + 1}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-primary/40 sm:p-6 ${visualClass}`}
      style={{
        borderRadius: sectionRadius,
        boxShadow: cardShadow,
        ...(cardBackground ? { backgroundColor: cardBackground } : {}),
        ...(cardTextColor ? { color: cardTextColor } : {}),
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100"
      />
      <div className="relative flex min-w-0 items-center gap-3">
        <span
          data-storefront-field="content.items"
          data-storefront-source={iconBackground || iconColor ? 'persisted' : 'fallback'}
          data-storefront-collection="items"
          data-storefront-item-id={itemId}
          data-storefront-item-field="icon_background"
          data-storefront-label="Service icon style"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl shadow-sm transition duration-300 group-hover:scale-105 ${
            iconBackground || iconColor ? '' : 'bg-primary/10 text-primary'
          }`}
          style={{
            ...(iconBackground ? { backgroundColor: iconBackground } : {}),
            ...(iconColor ? { color: iconColor } : {}),
          }}
        >
          <IconComponent size={20} />
        </span>
        <h3
          data-storefront-field="content.items"
          data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
          data-storefront-collection="items"
          data-storefront-item-id={itemId}
          data-storefront-item-field="title"
          data-storefront-label={`Service ${index + 1} title`}
          className={`min-w-0 text-[15px] font-semibold leading-5 ${hasCardText ? 'text-current' : 'text-slate-900'}`}
        >
          {service.title}
        </h3>
      </div>
      <p
        ref={descriptionRef}
        data-storefront-field="content.items"
        data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
        data-storefront-collection="items"
        data-storefront-item-id={itemId}
        data-storefront-item-field="description"
        data-storefront-label={`Service ${index + 1} description`}
        className={`relative mt-3.5 text-[13px] leading-6 ${expanded ? '' : 'line-clamp-3'} ${hasCardText ? 'text-current' : 'text-slate-500'}`}
        style={hasCardText ? { opacity: 0.85 } : undefined}
      >
        {description}
      </p>
      {needsToggle ? (
        <div className="relative mt-auto pt-4">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            className={`inline-flex items-center gap-1 rounded-md text-[11px] font-semibold uppercase tracking-[0.14em] transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${hasCardText ? 'text-current opacity-85' : 'text-primary'}`}
          >
            {expanded ? (
              <>
                Read less
                <ChevronUp size={12} />
              </>
            ) : (
              <>
                Read more
                <ChevronDown size={12} />
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
