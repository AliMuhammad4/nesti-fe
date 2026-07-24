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
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
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
  return String(type || 'block')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const DEFAULT_CONTENT = {
  [STOREFRONT_BLOCK_TYPES.HERO]: { heading: '', cta_label: 'Book a Free Consultation' },
  [STOREFRONT_BLOCK_TYPES.ABOUT]: { heading: 'About', body: '' },
  [STOREFRONT_BLOCK_TYPES.SERVICES]: { heading: 'Services', body: 'Personalized support designed around your next decision.' },
  [STOREFRONT_BLOCK_TYPES.TESTIMONIALS]: { heading: 'Client stories', body: 'Outcomes from people who worked with this professional.' },
  [STOREFRONT_BLOCK_TYPES.CTA]: { heading: 'Ready for the next step?', body: 'Share your goals and get a clear plan.', cta_label: 'Start a conversation' },
  [STOREFRONT_BLOCK_TYPES.MORTGAGE_CALCULATOR]: { heading: 'Affordability calculator', body: 'Estimate purchasing power before you tour homes.' },
  [STOREFRONT_BLOCK_TYPES.CLOSING_COST_ESTIMATOR]: { heading: 'Closing cost estimator', body: 'Model fees before you commit.' },
  [STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS]: { heading: 'Featured listings', body: 'Hand-picked opportunities ready for private showings.' },
  [STOREFRONT_BLOCK_TYPES.TOP_LISTINGS]: { heading: 'Top listings', body: 'Properties drawing the strongest interest right now.' },
  [STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS]: { heading: 'Recently sold', body: 'Proof of pricing strategy and market timing.' },
  [STOREFRONT_BLOCK_TYPES.GUIDANCE]: { heading: 'What happens next', body: 'A simple guide to the process ahead.' },
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
};

const DEFAULT_LAYOUT = {
  alignment: 'left',
  padding: 'medium',
  width: 'full',
  hiddenOn: [],
  variant: 'standard',
  mediaPosition: 'none',
  columns: '3',
  cardStyle: 'bordered',
};

export function createBlock(type) {
  const isHero = type === STOREFRONT_BLOCK_TYPES.HERO;
  return {
    id: `${type}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`,
    type,
    data: {
      enabled: true,
      content: { ...(DEFAULT_CONTENT[type] || {}) },
      layout: {
        ...DEFAULT_LAYOUT,
        // Hero cover only renders when mediaPosition !== 'none'
        mediaPosition: isHero ? 'background' : DEFAULT_LAYOUT.mediaPosition,
        cardStyle: isHero ? 'elevated' : DEFAULT_LAYOUT.cardStyle,
      },
      style: { background: '', textColor: '', radius: 'default', shadow: 'none' },
    },
  };
}

export function normalizeBlock(block, index = 0) {
  const data = block?.data || {};
  return {
    id: block?.id || `${block?.type || 'block'}-${index}`,
    type: block?.type || STOREFRONT_BLOCK_TYPES.ABOUT,
    data: {
      enabled: data.enabled ?? block?.enabled ?? true,
      content: data.content || block?.content || {},
      layout: {
        alignment: data.layout?.alignment || DEFAULT_LAYOUT.alignment,
        padding: data.layout?.padding || DEFAULT_LAYOUT.padding,
        width: data.layout?.width || DEFAULT_LAYOUT.width,
        hiddenOn: Array.isArray(data.layout?.hiddenOn) ? data.layout.hiddenOn : [],
        variant: data.layout?.variant || DEFAULT_LAYOUT.variant,
        mediaPosition: data.layout?.mediaPosition || DEFAULT_LAYOUT.mediaPosition,
        columns: String(data.layout?.columns || DEFAULT_LAYOUT.columns),
        cardStyle: data.layout?.cardStyle || DEFAULT_LAYOUT.cardStyle,
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
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
    'home-valuation',
  ]);
  const normalized = blocks
    .filter((block) => !deprecatedListingTypes.has(block?.type))
    .map(normalizeBlock);
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
