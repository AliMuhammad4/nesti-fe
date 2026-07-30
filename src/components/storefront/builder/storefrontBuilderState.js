import { STOREFRONT_BLOCK_TYPES, normalizeStorefrontRole } from '../storefrontPresets';

export const BLOCK_LIBRARY = {
  shared: [
    STOREFRONT_BLOCK_TYPES.HERO,
    STOREFRONT_BLOCK_TYPES.ABOUT,
    STOREFRONT_BLOCK_TYPES.SERVICES,
    STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
    STOREFRONT_BLOCK_TYPES.EXPERTISE,
    STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
    STOREFRONT_BLOCK_TYPES.GUIDANCE,
    STOREFRONT_BLOCK_TYPES.CTA,
  ],
  agent: [
    STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
  ],
  mortgage_broker: [
    STOREFRONT_BLOCK_TYPES.MORTGAGE_CALCULATOR,
    STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS,
  ],
  lawyer: [
    STOREFRONT_BLOCK_TYPES.CLOSING_COST_ESTIMATOR,
    STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
    STOREFRONT_BLOCK_TYPES.CREDENTIALS,
  ],
};

export function labelForBlock(type) {
  const overrides = {
    cta: 'CTA',
    faq: 'FAQ',
  };
  const key = String(type || 'block').toLowerCase();
  if (overrides[key]) return overrides[key];
  return key
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function createContentItemId() {
  return `item-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
}

/** Turn pipe-strings / partial records into objects with stable ids (never random). */
export function coerceCollectionItems(collection, items = []) {
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  const uniqueId = (preferred, prefix, index) => {
    const base = preferred || `${prefix}-${index}`;
    if (!seen.has(base)) {
      seen.add(base);
      return base;
    }
    let suffix = 1;
    let next = `${base}-${suffix}`;
    while (seen.has(next)) {
      suffix += 1;
      next = `${base}-${suffix}`;
    }
    seen.add(next);
    return next;
  };

  if (collection === 'steps') {
    return items
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === 'string') {
          const [title = '', text = ''] = item.split('|').map((part) => part.trim());
          return {
            id: uniqueId(`fallback-step-${index}`, 'fallback-step', index),
            title,
            text,
          };
        }
        if (typeof item !== 'object') return null;
        return {
          id: uniqueId(item.id, 'fallback-step', index),
          title: item.title || '',
          text: item.text || '',
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  if (collection === 'faqs') {
    return items
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === 'string') {
          const [q = '', a = ''] = item.split('|').map((part) => part.trim());
          return {
            id: uniqueId(`fallback-faq-${index}`, 'fallback-faq', index),
            q,
            a,
          };
        }
        if (typeof item !== 'object') return null;
        return {
          id: uniqueId(item.id, 'fallback-faq', index),
          q: item.q || '',
          a: item.a || '',
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  if (collection === 'items' || collection === 'services') {
    const iconDefaults = ['target', 'building', 'home', 'percent', 'handshake', 'shield'];
    return items
      .map((item, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        return {
          id: uniqueId(item.id, 'fallback-service', index),
          title: item.title || item.name || '',
          description: item.description || item.text || '',
          icon: item.icon || iconDefaults[index % iconDefaults.length],
          background: item.background || item.card_background || '',
          text_color: item.text_color || item.card_text_color || '',
          icon_background: item.icon_background || '',
          icon_color: item.icon_color || '',
        };
      })
      .filter((item) => item && item.title)
      .slice(0, 6);
  }

  if (collection === 'highlights') {
    return items
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === 'string') {
          const [title = '', text = ''] = item.split('|').map((part) => part.trim());
          if (!title) return null;
          return {
            id: uniqueId(`fallback-highlight-${index}`, 'fallback-highlight', index),
            title,
            text,
            background: '',
            text_color: '',
          };
        }
        if (typeof item !== 'object') return null;
        const title = item.title || '';
        if (!title) return null;
        return {
          id: uniqueId(item.id, 'fallback-highlight', index),
          title,
          text: item.text || '',
          background: item.background || '',
          text_color: item.text_color || '',
        };
      })
      .filter(Boolean)
      .slice(0, 6);
  }

  if (collection === 'proof') {
    return items
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === 'string') {
          const text = item.trim();
          if (!text) return null;
          return {
            id: uniqueId(`fallback-proof-${index}`, 'fallback-proof', index),
            text,
            background: '',
            text_color: '',
          };
        }
        if (typeof item !== 'object') return null;
        const text = String(item.text || item.title || '').trim();
        if (!text) return null;
        return {
          id: uniqueId(item.id, 'fallback-proof', index),
          text,
          background: item.background || '',
          text_color: item.text_color || '',
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  return items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
    return { ...item, id: uniqueId(item.id, `item-${collection || 'row'}`, index) };
  });
}

function coerceGuidanceContent(content = {}) {
  const next = { ...content };
  if (Array.isArray(content.steps)) next.steps = coerceCollectionItems('steps', content.steps);
  if (Array.isArray(content.faqs)) next.faqs = coerceCollectionItems('faqs', content.faqs);
  // Legacy per-badge colors — brand primary is the source of truth now.
  delete next.process_badge_background;
  delete next.process_badge_color;
  return next;
}

function coerceServicesContent(content = {}) {
  const next = { ...content };
  if (Array.isArray(content.items)) next.items = coerceCollectionItems('items', content.items);
  // Nested panel colors removed — section Style background is the single surface.
  delete next.panel_background;
  delete next.panel_text_color;
  return next;
}

function coerceRoleDetailsContent(content = {}) {
  const next = { ...content };
  if (Array.isArray(content.highlights)) next.highlights = coerceCollectionItems('highlights', content.highlights);
  if (Array.isArray(content.proof)) next.proof = coerceCollectionItems('proof', content.proof);
  return next;
}

function withContentItemIds(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return withContentItemIds(item);
      return {
        ...Object.fromEntries(Object.entries(item).map(([key, child]) => [key, withContentItemIds(child)])),
        // Keep existing ids; only fill missing ones with a stable index-based id.
        id: item.id || `item-${index}`,
      };
    });
  }
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, withContentItemIds(child)]));
}

export function rekeyContentItems(content = {}) {
  const rekey = (value) => {
    if (Array.isArray(value)) return value.map(rekey);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      key === 'id' ? createContentItemId() : rekey(child),
    ]));
  };
  return rekey(content);
}

export function resolveContentItem(content = {}, selection) {
  if (!selection?.collection || !selection?.itemId) return null;
  const items = content[selection.collection];
  if (!Array.isArray(items)) return null;
  const index = items.findIndex((item) => item?.id === selection.itemId);
  return index < 0 ? null : { item: items[index], index };
}

export function updateContentItem(content = {}, selection, patch) {
  const resolved = resolveContentItem(content, selection);
  if (!resolved) return content;
  const isServiceCollection = selection.collection === 'items' || selection.collection === 'services';
  const isHighlightCollection = selection.collection === 'highlights';
  const isProofCollection = selection.collection === 'proof';
  return {
    ...content,
    [selection.collection]: content[selection.collection].map((item, index) => {
      if (index !== resolved.index) return item;
      const next = { ...item, ...patch };
      if (isServiceCollection) {
        return {
          id: next.id || createContentItemId(),
          title: next.title || '',
          description: next.description || '',
          icon: next.icon || 'target',
          background: next.background || '',
          text_color: next.text_color || '',
          icon_background: next.icon_background || '',
          icon_color: next.icon_color || '',
        };
      }
      if (isHighlightCollection) {
        return {
          id: next.id || createContentItemId(),
          title: next.title || '',
          text: next.text || '',
          background: next.background || '',
          text_color: next.text_color || '',
        };
      }
      if (isProofCollection) {
        return {
          id: next.id || createContentItemId(),
          text: next.text || next.title || '',
          background: next.background || '',
          text_color: next.text_color || '',
        };
      }
      return next;
    }),
  };
}

export function removeContentItem(content = {}, selection) {
  const resolved = resolveContentItem(content, selection);
  if (!resolved) return { content, nextItemId: null };
  const nextItems = content[selection.collection].filter((_, index) => index !== resolved.index);
  const nextItem = nextItems[resolved.index] || nextItems[resolved.index - 1] || null;
  return {
    content: { ...content, [selection.collection]: nextItems },
    nextItemId: nextItem?.id || null,
  };
}

const DEFAULT_CONTENT = {
  [STOREFRONT_BLOCK_TYPES.HERO]: { heading: '', cta_label: 'Book a Free Consultation' },
  [STOREFRONT_BLOCK_TYPES.ABOUT]: { heading: 'About', eyebrow: 'About', body: '' },
  [STOREFRONT_BLOCK_TYPES.SERVICES]: { heading: 'Services', eyebrow: 'Capabilities', body: 'Personalized support designed around your next decision.' },
  [STOREFRONT_BLOCK_TYPES.TESTIMONIALS]: { heading: 'Client stories', body: 'Outcomes from people who worked with this professional.' },
  [STOREFRONT_BLOCK_TYPES.CTA]: {
    heading: 'Ready for the next step?',
    body: 'Share your goals and get a clear plan.',
    cta_label: 'Ask about availability',
    secondary_cta_label: 'Send detailed inquiry',
    helper_text: '',
  },
  [STOREFRONT_BLOCK_TYPES.MORTGAGE_CALCULATOR]: { heading: 'Affordability calculator', body: 'Estimate purchasing power before you tour homes.' },
  [STOREFRONT_BLOCK_TYPES.CLOSING_COST_ESTIMATOR]: { heading: 'Closing cost estimator', body: 'Model fees before you commit.' },
  [STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS]: { heading: 'Featured listings', eyebrow: 'Available properties', body: 'Hand-picked opportunities ready for private showings.' },
  [STOREFRONT_BLOCK_TYPES.TOP_LISTINGS]: { heading: 'Top listings', eyebrow: 'Top picks', body: 'Properties drawing the strongest interest right now.' },
  [STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS]: { heading: 'Recently sold', eyebrow: 'Recently sold', body: 'Proof of pricing strategy and market timing.' },
  [STOREFRONT_BLOCK_TYPES.PROPERTIES]: { heading: 'Properties for sale', eyebrow: 'Available now', body: '' },
  [STOREFRONT_BLOCK_TYPES.GUIDANCE]: { heading: 'What happens next', body: 'A simple guide to the process ahead.' },
  [STOREFRONT_BLOCK_TYPES.ROLE_DETAILS]: { heading: '', eyebrow: '', body: '' },
  [STOREFRONT_BLOCK_TYPES.FOOTER]: { heading: '', body: '', items: [] },
};

export const SECTION_SETTINGS = {
  variants: [
    { value: 'standard', label: 'Standard' },
    { value: 'editorial', label: 'Editorial' },
    { value: 'split', label: 'Split' },
    { value: 'feature-grid', label: 'Feature grid' },
    { value: 'lead-magnet', label: 'Lead magnet' },
    { value: 'premium', label: 'Premium' },
    { value: 'minimal', label: 'Minimal' },
  ],
  mediaPositions: [
    { value: 'none', label: 'No media' },
    { value: 'left', label: 'Media left' },
    { value: 'right', label: 'Media right' },
    { value: 'background', label: 'Background' },
  ],
  columns: [
    { value: '1', label: '1 column' },
    { value: '2', label: '2 columns' },
    { value: '3', label: '3 columns' },
    { value: '4', label: '4 columns' },
  ],
  widths: [
    { value: 'full', label: 'Full width' },
    { value: 'contained', label: 'Contained' },
    { value: 'narrow', label: 'Narrow' },
  ],
  cardStyles: [
    { value: 'flat', label: 'Flat' },
    { value: 'bordered', label: 'Bordered' },
    { value: 'elevated', label: 'Elevated' },
    { value: 'glass', label: 'Glass' },
  ],
  shadows: [
    { value: 'none', label: 'No shadow' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ],
  animations: [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide-up', label: 'Slide up' },
    { value: 'slide-left', label: 'Slide left' },
    { value: 'zoom', label: 'Zoom in' },
  ],
  animationTriggers: [
    { value: 'load', label: 'On load' },
    { value: 'scroll', label: 'On scroll' },
  ],
  animationDurations: [
    { value: 'fast', label: 'Fast' },
    { value: 'medium', label: 'Medium' },
    { value: 'slow', label: 'Slow' },
  ],
  animationIntensities: [
    { value: 'subtle', label: 'Subtle' },
    { value: 'medium', label: 'Medium' },
    { value: 'strong', label: 'Strong' },
  ],
  animationDelays: [
    { value: '0', label: 'No delay' },
    { value: '80', label: '80 ms' },
    { value: '160', label: '160 ms' },
    { value: '240', label: '240 ms' },
    { value: '320', label: '320 ms' },
    { value: '480', label: '480 ms' },
  ],
};

const DEFAULT_LAYOUT = {
  alignment: 'left',
  padding: 'medium',
  width: 'full',
  variant: 'standard',
  mediaPosition: 'none',
  columns: '3',
  cardStyle: 'bordered',
  animationType: 'slide-up',
  animationTrigger: 'scroll',
  animationDuration: 'medium',
  animationDelay: '0',
  animationIntensity: 'subtle',
};

function defaultAnimationLayoutForType(type) {
  if (type === STOREFRONT_BLOCK_TYPES.HERO) {
    return {
      animationType: 'fade',
      animationTrigger: 'load',
      animationDuration: 'slow',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  if (type === STOREFRONT_BLOCK_TYPES.FOOTER) {
    return {
      animationType: 'fade',
      animationTrigger: 'scroll',
      animationDuration: 'fast',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  if (type === STOREFRONT_BLOCK_TYPES.GUIDANCE) {
    return {
      animationType: 'slide-up',
      animationTrigger: 'scroll',
      animationDuration: 'medium',
      animationDelay: '0',
      animationIntensity: 'medium',
    };
  }
  if (
    type === STOREFRONT_BLOCK_TYPES.ABOUT
    || type === STOREFRONT_BLOCK_TYPES.CTA
    || type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS
  ) {
    return {
      animationType: 'fade',
      animationTrigger: 'scroll',
      animationDuration: 'medium',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  if (
    type === STOREFRONT_BLOCK_TYPES.SERVICES
    || type === STOREFRONT_BLOCK_TYPES.EXPERTISE
    || type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS
  ) {
    return {
      animationType: 'slide-up',
      animationTrigger: 'scroll',
      animationDuration: 'medium',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  if (
    type === STOREFRONT_BLOCK_TYPES.PROPERTIES
    || type === STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS
    || type === STOREFRONT_BLOCK_TYPES.TOP_LISTINGS
    || type === STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS
  ) {
    return {
      animationType: 'zoom',
      animationTrigger: 'scroll',
      animationDuration: 'medium',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  return {
    animationType: DEFAULT_LAYOUT.animationType,
    animationTrigger: 'scroll',
    animationDuration: DEFAULT_LAYOUT.animationDuration,
    animationDelay: DEFAULT_LAYOUT.animationDelay,
    animationIntensity: DEFAULT_LAYOUT.animationIntensity,
  };
}

export function createBlock(type) {
  const isHero = type === STOREFRONT_BLOCK_TYPES.HERO;
  const isListing = [
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
    STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
  ].includes(type);
  const animationDefaults = defaultAnimationLayoutForType(type);
  return {
    id: `${type}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`,
    type,
    data: {
      enabled: true,
      content: { ...(DEFAULT_CONTENT[type] || {}) },
      layout: {
        ...DEFAULT_LAYOUT,
        ...animationDefaults,
        // Hero cover only renders when mediaPosition !== 'none'
        mediaPosition: isHero ? 'background' : DEFAULT_LAYOUT.mediaPosition,
        cardStyle: isHero ? 'elevated' : DEFAULT_LAYOUT.cardStyle,
        columns: isListing ? '4' : DEFAULT_LAYOUT.columns,
      },
      style: { background: '', textColor: '', radius: 'default', shadow: 'none' },
    },
  };
}

export function normalizeBlock(block, index = 0) {
  const data = block?.data || {};
  const rawLayout = data.layout || {};
  const animationDefaults = defaultAnimationLayoutForType(block?.type);
  const rawContent = data.content || block?.content || {};
  const content = block?.type === STOREFRONT_BLOCK_TYPES.GUIDANCE
    ? coerceGuidanceContent(rawContent)
    : block?.type === STOREFRONT_BLOCK_TYPES.SERVICES
      ? coerceServicesContent(rawContent)
      : block?.type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS
        ? coerceRoleDetailsContent(rawContent)
        : rawContent;
  const isListing = [
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
    STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
  ].includes(block?.type);
  const defaultColumns = isListing ? '4' : DEFAULT_LAYOUT.columns;
  return {
    id: block?.id || `${block?.type || 'block'}-${index}`,
    type: block?.type || STOREFRONT_BLOCK_TYPES.ABOUT,
    data: {
      enabled: data.enabled ?? block?.enabled ?? true,
      content: withContentItemIds(content),
      layout: {
        alignment: rawLayout.alignment || DEFAULT_LAYOUT.alignment,
        padding: rawLayout.padding || DEFAULT_LAYOUT.padding,
        width: rawLayout.width || DEFAULT_LAYOUT.width,
        variant: rawLayout.variant || DEFAULT_LAYOUT.variant,
        mediaPosition: rawLayout.mediaPosition || DEFAULT_LAYOUT.mediaPosition,
        columns: String(rawLayout.columns || defaultColumns),
        cardStyle: rawLayout.cardStyle || DEFAULT_LAYOUT.cardStyle,
        animationType: rawLayout.animationType || animationDefaults.animationType,
        animationTrigger: rawLayout.animationTrigger || animationDefaults.animationTrigger,
        animationDuration: rawLayout.animationDuration || animationDefaults.animationDuration,
        animationDelay: String(rawLayout.animationDelay ?? animationDefaults.animationDelay),
        animationIntensity: rawLayout.animationIntensity || animationDefaults.animationIntensity,
      },
      style: {
        background: data.style?.background || '',
        textColor: data.style?.textColor || '',
        radius: data.style?.radius || 'default',
        shadow: data.style?.shadow || 'none',
      },
    },
  };
}

export function normalizeBlocks(blocks = []) {
  const deprecatedListingTypes = new Set([
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
    'home-valuation',
  ]);
  let normalized = blocks
    .filter((block) => !deprecatedListingTypes.has(block?.type))
    .map(normalizeBlock);

  // Prevent duplicate listing sections in agent pages:
  // if FEATURED_LISTINGS exists, suppress PROPERTIES.
  const hasFeaturedListings = normalized.some(
    (block) => block.type === STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
  );
  if (hasFeaturedListings) {
    normalized = normalized.filter(
      (block) => block.type !== STOREFRONT_BLOCK_TYPES.PROPERTIES,
    );
  }

  if (normalized.some((block) => block.type === STOREFRONT_BLOCK_TYPES.FOOTER)) return normalized;
  return [
    ...normalized,
    normalizeBlock({
      id: 'footer-1',
      type: STOREFRONT_BLOCK_TYPES.FOOTER,
      data: { enabled: true },
    }),
  ];
}

export function availableBlocksForRole(role) {
  const normalized = normalizeStorefrontRole(role);
  return [...BLOCK_LIBRARY.shared, ...(BLOCK_LIBRARY[normalized] || [])];
}

export function toRendererBlocks(blocks) {
  return normalizeBlocks(blocks).map((block) => ({
    ...block,
    enabled: block.data.enabled,
    content: block.data.content,
    layout: block.data.layout,
    style: block.data.style,
  }));
}
