import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import {
  RENEWAL_BRAND,
  RENEWAL_PALETTE as P,
} from '../../renderers/variants/broker/renewal/brokerRenewalPalette';

export const BROKER_RENEWAL_BLOCK_ORDER = Object.freeze([
  T.HERO,
  T.PRACTICE_SNAPSHOT,
  T.MORTGAGE_PROGRAMS,
  T.SERVICES,
  T.ABOUT,
  T.GUIDANCE,
  T.TESTIMONIALS,
  T.FAQ,
  T.CTA,
  T.FOOTER,
]);

const BROKER_RENEWAL_BRAND_VERSION = 2;

/** Prior teal, wine/copper, and accidental Lead/First Home blues. */
const LEGACY_PRIMARY_COLORS = new Set([
  '',
  '#155e75',
  '#0f3d4a',
  '#0f766e',
  '#0c2139',
  '#102a43',
  '#008fd5',
  '#3d2430',
  '#1f1218',
  '#4a2536',
]);
const LEGACY_ACCENT_COLORS = new Set([
  '',
  '#2dd4bf',
  '#14b8a6',
  '#5eead4',
  '#008fd5',
  '#1b4b73',
  '#f59e0b',
  '#c9782c',
  '#e8b86d',
]);
const LEGACY_PAGE_BACKGROUNDS = new Set([
  '',
  '#f8fafc',
  '#ffffff',
  '#f7f9fb',
  '#f6f4f5',
  '#efeaed',
]);
const LEGACY_BAND_BACKGROUNDS = new Set([
  '#155e75',
  '#0f3d4a',
  '#0f766e',
  '#14b8a6',
  '#2dd4bf',
  '#3d2430',
  '#1f1218',
  '#4a2536',
  '#0e1116',
  '#07090c',
  '#f8fafc',
  '#f1f2f4',
  '#e6e8ec',
  '#efeaed',
  '#f6f4f5',
  '#ffffff',
  '#fff',
]);
const LEGACY_TEXT_COLORS = new Set([
  '#155e75',
  '#0f3d4a',
  '#0f766e',
  '#3d2430',
  '#1f1218',
  '#c9782c',
]);

const CLASSIC_SERVICE_TITLE_RE = /pre-approval planning|program comparison|renewal optimization/i;
const CLASSIC_PROGRAM_TITLE_RE = /first.?time buyer|investor financing|self.?employed|new to canada|purchase financing|refinance solutions/i;
const CLASSIC_GUIDANCE_TITLE_RE = /share your goals|prepare documents|compare options|receive broker|get pre.?approved/i;
const CLASSIC_FAQ_RE = /can i get pre.?approved|is this a final mortgage|what documents do i need for pre.?approval|how long does pre.?approval/i;
const STALE_FOOTER_TARGET_RE = /#(rates|calculator|mortgage-calculator)/i;

function remapRenewalStyle(type, style = {}) {
  const next = { ...style };
  const background = String(next.background || '').trim().toLowerCase();
  const textColor = String(next.textColor || '').trim().toLowerCase();

  if (type === 'footer') {
    next.background = P.footer;
    next.textColor = P.white;
    return next;
  }
  if (type === 'cta') {
    if (!background || LEGACY_BAND_BACKGROUNDS.has(background)) {
      next.background = P.primary;
    }
    if (!textColor || LEGACY_TEXT_COLORS.has(textColor)) {
      next.textColor = P.white;
    }
    return next;
  }
  // Default content/hero bands to transparent so Design → Page background shows.
  // Keep intentional custom colors the broker set in Style.
  if (!background || LEGACY_BAND_BACKGROUNDS.has(background)) {
    next.background = 'transparent';
  }
  if (!textColor || LEGACY_TEXT_COLORS.has(textColor) || textColor === '#ffffff') {
    next.textColor = P.ink;
  }
  return next;
}

function normalizeBlock(block = {}, index = 0) {
  const type = block?.type || block?.data?.type || '';
  const data = block?.data || {};
  const existingLayout = { ...(data.layout || block?.layout || {}) };
  const layout = {
    ...existingLayout,
    width: 'full',
  };
  if (type === 'hero') {
    layout.variant = 'minimal';
    const media = String(existingLayout.mediaPosition || '').toLowerCase();
    if (!media || media === 'right' || media === 'cover' || media === 'portrait') {
      layout.mediaPosition = 'background';
    }
    layout.padding = layout.padding || 'large';
  }
  const style = remapRenewalStyle(type, { ...(data.style || block?.style || {}) });
  return {
    ...block,
    id: block?.id || `${type || 'broker-renewal'}-${index + 1}`,
    type,
    data: {
      ...data,
      enabled: data.enabled ?? block?.enabled ?? true,
      content: { ...(data.content || block?.content || {}) },
      layout,
      style,
    },
  };
}

function withDefaultCollection(block, defaultBlock, collectionKey) {
  if (!defaultBlock) return block;
  const defaultItems = defaultBlock.data?.content?.[collectionKey];
  if (!Array.isArray(defaultItems)) return block;
  return normalizeBlock({
    ...block,
    data: {
      ...block.data,
      content: {
        ...(block.data?.content || {}),
        [collectionKey]: defaultItems.map((item) => ({ ...item })),
      },
    },
  });
}

function withDefaultContent(block, defaultBlock) {
  if (!defaultBlock) return block;
  return normalizeBlock({
    ...defaultBlock,
    id: block.id || defaultBlock.id,
  });
}

function collectionLooksStale(items, field, pattern) {
  if (!Array.isArray(items) || !items.length) return true;
  return items.some((item) => pattern.test(String(item?.[field] || item?.q || '')));
}

function hydrateHeroContent(content = {}, defaultContent = {}) {
  const next = { ...content };
  const defaultPrimary = defaultContent.primary_cta_label || 'Review my renewal';
  const defaultSecondary = defaultContent.cta_label
    || defaultContent.secondary_cta_label
    || 'Book a consultation';
  if (!String(next.primary_cta_label || '').trim()) {
    next.primary_cta_label = defaultPrimary;
  }
  const primary = String(next.primary_cta_label || '').trim().toLowerCase();
  const secondary = String(next.cta_label || '').trim();
  if (!secondary || secondary.toLowerCase() === primary) {
    next.cta_label = defaultSecondary;
  }
  if (!String(next.secondary_cta_label || '').trim()
    || String(next.secondary_cta_label || '').trim().toLowerCase() === primary) {
    next.secondary_cta_label = next.cta_label;
  }
  if (!String(next.join_label || '').trim()) {
    next.join_label = defaultContent.join_label || 'Join Nesti';
  }
  if (!String(next.heading || '').trim() && defaultContent.heading) {
    next.heading = defaultContent.heading;
  }
  if (!String(next.body || '').trim() && defaultContent.body) {
    next.body = defaultContent.body;
  }
  if (!String(next.eyebrow || '').trim() && defaultContent.eyebrow) {
    next.eyebrow = defaultContent.eyebrow;
  }
  return next;
}

function sanitizeFooterItems(items, defaultItems) {
  const source = Array.isArray(items) ? items : [];
  const cleaned = source.filter((item) => {
    const target = String(item?.target || item?.url || '');
    const label = String(item?.label || '');
    return !STALE_FOOTER_TARGET_RE.test(target)
      && !/^(rates|calculator)$/i.test(label.trim());
  });
  if (!cleaned.length && Array.isArray(defaultItems) && defaultItems.length) {
    return defaultItems.map((item) => ({ ...item }));
  }
  return cleaned;
}

/**
 * Keep renewal drafts on the free 10-layer contract.
 * Calculator was removed — swap any leftover calculator block for About.
 */
export function migrateBrokerRenewalBlocks(blocks = [], defaults = []) {
  const current = (Array.isArray(blocks) ? blocks : []).map(normalizeBlock);
  const canonicalDefaults = (Array.isArray(defaults) ? defaults : [])
    .map(normalizeBlock)
    .filter((block) => BROKER_RENEWAL_BLOCK_ORDER.includes(block.type));
  const defaultsByType = new Map(canonicalDefaults.map((block) => [block.type, block]));
  const currentByType = new Map();

  current.forEach((block) => {
    let type = block.type;
    if (type === T.MORTGAGE_CALCULATOR) type = T.ABOUT;
    if (!BROKER_RENEWAL_BLOCK_ORDER.includes(type) || currentByType.has(type)) return;
    if (block.type === T.MORTGAGE_CALCULATOR) {
      currentByType.set(T.ABOUT, withDefaultContent(block, defaultsByType.get(T.ABOUT)));
      return;
    }

    if (type === T.SERVICES) {
      const items = Array.isArray(block.data?.content?.items) ? block.data.content.items : [];
      if (collectionLooksStale(items, 'title', CLASSIC_SERVICE_TITLE_RE)) {
        currentByType.set(T.SERVICES, withDefaultCollection(block, defaultsByType.get(T.SERVICES), 'items'));
        return;
      }
    }

    if (type === T.MORTGAGE_PROGRAMS) {
      const items = Array.isArray(block.data?.content?.items) ? block.data.content.items : [];
      if (collectionLooksStale(items, 'title', CLASSIC_PROGRAM_TITLE_RE)) {
        currentByType.set(
          T.MORTGAGE_PROGRAMS,
          withDefaultCollection(block, defaultsByType.get(T.MORTGAGE_PROGRAMS), 'items'),
        );
        return;
      }
    }

    if (type === T.GUIDANCE) {
      const steps = Array.isArray(block.data?.content?.steps) ? block.data.content.steps : [];
      if (collectionLooksStale(steps, 'title', CLASSIC_GUIDANCE_TITLE_RE)) {
        currentByType.set(T.GUIDANCE, withDefaultCollection(block, defaultsByType.get(T.GUIDANCE), 'steps'));
        return;
      }
    }

    if (type === T.FAQ) {
      const faqs = Array.isArray(block.data?.content?.faqs) ? block.data.content.faqs : [];
      if (collectionLooksStale(faqs, 'q', CLASSIC_FAQ_RE)) {
        currentByType.set(T.FAQ, withDefaultCollection(block, defaultsByType.get(T.FAQ), 'faqs'));
        return;
      }
    }

    if (type === T.HERO) {
      const defaultContent = defaultsByType.get(T.HERO)?.data?.content || {};
      currentByType.set(type, normalizeBlock({
        ...block,
        data: {
          ...block.data,
          content: hydrateHeroContent(block.data?.content || {}, defaultContent),
        },
      }));
      return;
    }

    if (type === T.CTA) {
      const defaultContent = defaultsByType.get(T.CTA)?.data?.content || {};
      const content = { ...(block.data?.content || {}) };
      if (!String(content.cta_label || '').trim()) {
        content.cta_label = defaultContent.cta_label || 'Upload my offer';
      }
      if (!String(content.secondary_cta_label || '').trim()) {
        content.secondary_cta_label = defaultContent.secondary_cta_label || 'Book a consultation';
      }
      currentByType.set(type, normalizeBlock({
        ...block,
        data: {
          ...block.data,
          content,
        },
      }));
      return;
    }

    if (type === T.FOOTER) {
      const defaultItems = defaultsByType.get(T.FOOTER)?.data?.content?.items || [];
      const content = {
        ...(block.data?.content || {}),
        items: sanitizeFooterItems(block.data?.content?.items, defaultItems),
      };
      currentByType.set(type, normalizeBlock({
        ...block,
        data: {
          ...block.data,
          content,
        },
      }));
      return;
    }

    currentByType.set(type, block);
  });

  return BROKER_RENEWAL_BLOCK_ORDER
    .map((type) => currentByType.get(type) || defaultsByType.get(type) || null)
    .filter(Boolean);
}

export function migrateBrokerRenewalBrandKit(templateKey, brandKit = {}) {
  if (templateKey !== 'mortgage_broker-renewal') return brandKit;
  const essentials = { ...(brandKit?.essentials || {}) };
  if (Number(essentials.broker_renewal_brand_version || 0) >= BROKER_RENEWAL_BRAND_VERSION) {
    return brandKit;
  }

  const primary = String(brandKit?.primary_color || '').trim().toLowerCase();
  const accent = String(brandKit?.accent_color || '').trim().toLowerCase();
  const page = String(brandKit?.page_background || '').trim().toLowerCase();
  essentials.broker_renewal_brand_version = BROKER_RENEWAL_BRAND_VERSION;

  return {
    ...brandKit,
    primary_color: LEGACY_PRIMARY_COLORS.has(primary)
      ? RENEWAL_BRAND.primary_color
      : (brandKit.primary_color || RENEWAL_BRAND.primary_color),
    accent_color: LEGACY_ACCENT_COLORS.has(accent)
      ? RENEWAL_BRAND.accent_color
      : (brandKit.accent_color || RENEWAL_BRAND.accent_color),
    page_background: LEGACY_PAGE_BACKGROUNDS.has(page)
      ? RENEWAL_BRAND.page_background
      : (brandKit.page_background || RENEWAL_BRAND.page_background),
    font_family: brandKit.font_family || brandKit.font || RENEWAL_BRAND.font_family,
    font: brandKit.font || brandKit.font_family || RENEWAL_BRAND.font_family,
    button_shape: brandKit.button_shape || 'rounded',
    essentials,
  };
}
