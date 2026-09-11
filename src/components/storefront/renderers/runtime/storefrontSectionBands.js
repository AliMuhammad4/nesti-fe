import { STOREFRONT_BLOCK_TYPES } from '../../storefrontPresets';

export const LISTING_BLOCK_TYPES = new Set([
  STOREFRONT_BLOCK_TYPES.PROPERTIES,
  STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
  STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
  STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
  STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
]);

export function isListingBlock(type) {
  return LISTING_BLOCK_TYPES.has(type);
}

export function publicBandBackground(blockType, index, pageBackground) {
  if (blockType === STOREFRONT_BLOCK_TYPES.HERO) return undefined;
  if (pageBackground) return pageBackground;
  if (LISTING_BLOCK_TYPES.has(blockType)) return '#ffffff';
  if (blockType === STOREFRONT_BLOCK_TYPES.FOOTER) return '#f8fafc';
  return index % 2 === 0 ? '#ffffff' : '#f8fafc';
}

export const TEMPLATE_NEUTRAL_BANDS = new Set([
  'transparent',
  '#fff',
  '#ffffff',
  '#f8fafc',
  '#fafafa',
  '#f9fafb',
  '#f1f5f9',
  '#f1f2f4',
  '#e6e8ec',
  '#efeaed',
  '#f6f4f5',
  '#faf7ef',
  '#f8f2e4',
  '#fffaf1',
  '#eff6ff',
  '#fff7ed',
  '#fff1f2',
  '#fffbeb',
  '#f0fdf4',
  '#ecfeff',
  '#f8fafc',
]);

export function resolveSectionBandBackground({ isHero, styleBackground, pageCanvas, blockType, index }) {
  if (isHero) return undefined;
  const page = String(pageCanvas || '').trim();
  const section = String(styleBackground || '').trim();
  const normalized = section.toLowerCase();
  const isNeutral = !section || TEMPLATE_NEUTRAL_BANDS.has(normalized);
  if (page && isNeutral) return page;
  if (section && !isNeutral) return section;
  return page || publicBandBackground(blockType, index, page || undefined);
}
