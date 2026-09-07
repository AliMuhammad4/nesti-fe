import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import { normalizeBlocks } from './storefrontBuilderState';

export function appendUniqueItems(items, supplemental, limit) {
  if (items.length >= limit) return items;
  return [
    ...items,
    ...supplemental.filter((candidate) => (
      !items.some((item) => (
        item?.id === candidate.id
        || String(item?.title || '').trim().toLowerCase() === candidate.title.toLowerCase()
      ))
    )),
  ].slice(0, limit);
}

export function pinBoundaryBlocks(blocks = [], templateKey = '') {
  const key = String(templateKey).trim().toLowerCase();
  if (!['lawyer-investor', 'mortgage_broker-classic', 'mortgage_broker-first-home', 'lawyer-classic'].includes(key)) {
    return blocks;
  }
  const hero = blocks.find((block) => block.type === STOREFRONT_BLOCK_TYPES.HERO);
  const footer = blocks.find((block) => block.type === STOREFRONT_BLOCK_TYPES.FOOTER);
  const middle = blocks.filter((block) => (
    block.type !== STOREFRONT_BLOCK_TYPES.HERO
    && block.type !== STOREFRONT_BLOCK_TYPES.FOOTER
  ));
  return [
    ...(hero ? [hero] : []),
    ...middle,
    ...(footer ? [footer] : []),
  ];
}

export function normalizeHexForCompare(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withHash = raw.startsWith('#') ? raw : `#${raw}`;
  const shortMatch = /^#[0-9a-fA-F]{3}$/.test(withHash);
  if (shortMatch) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : withHash.toLowerCase();
}

export function blockLayoutStyleSignature(blocks = []) {
  return JSON.stringify(
    normalizeBlocks(blocks).map((block) => ({
      type: block?.type || '',
      enabled: block?.data?.enabled ?? true,
      layout: block?.data?.layout || {},
      style: block?.data?.style || {},
      content: block?.data?.content || {},
    })),
  );
}
