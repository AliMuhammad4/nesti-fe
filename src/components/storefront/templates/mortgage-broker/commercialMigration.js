import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import {
  COMMERCIAL_HERO_SLIDES,
  commitCommercialHeroSlides,
} from '../../renderers/variants/broker/commercial/brokerCommercialDefaults';
import {
  COMMERCIAL_BRAND,
  COMMERCIAL_PALETTE as P,
} from '../../renderers/variants/broker/commercial/brokerCommercialPalette';

export const BROKER_COMMERCIAL_BLOCK_ORDER = Object.freeze([
  T.HERO,
  T.PRACTICE_SNAPSHOT,
  T.WHO_WE_HELP,
  T.MORTGAGE_PROGRAMS,
  T.SERVICES,
  T.ROLE_DETAILS,
  T.EXPERTISE,
  T.ABOUT,
  T.GUIDANCE,
  T.MORTGAGE_RATES,
  T.MORTGAGE_CALCULATOR,
  T.LENDER_NETWORK,
  T.ALTERNATIVE_LENDING,
  T.BROKER_COMPENSATION,
  T.CREDENTIALS,
  T.TESTIMONIALS,
  T.FAQ,
  T.CTA,
  T.FOOTER,
]);

const BROKER_COMMERCIAL_BRAND_VERSION = 4;
const BROKER_COMMERCIAL_DESIGN_VERSION = 1;

const LEGACY_PRIMARY_COLORS = new Set([
  '',
  '#111827',
  '#0c2139',
  '#102a43',
  '#008fd5',
  '#155e75',
  '#0e1116',
  '#0b1f3a',
  '#071528',
]);
const LEGACY_ACCENT_COLORS = new Set([
  '',
  '#fb923c',
  '#f59e0b',
  '#008fd5',
  '#1b4b73',
  '#e2b457',
  '#14b8a6',
  '#d4a017',
  '#b8860b',
  '#c4783a',
  '#9a5a2a',
  '#6b9bb0',
  '#3f7388',
]);
const LEGACY_PAGE_BACKGROUNDS = new Set([
  '',
  '#ffffff',
  '#fff',
  '#f8fafc',
  '#fef3c7',
  '#f1f2f4',
  '#f7f9fb',
  '#f4f6f8',
]);
const LEGACY_BAND_BACKGROUNDS = new Set([
  '',
  'transparent',
  '#ffffff',
  '#fff',
  '#f8fafc',
  '#fef3c7',
  '#f4f6f8',
  '#e8edf2',
  '#111827',
  '#fb923c',
  '#0b1f3a',
  '#071528',
  P.page.toLowerCase(),
  P.surface.toLowerCase(),
]);

const BRANDED_SECTIONS = new Set(['hero', 'cta', 'footer', 'credentials']);

function remapStyle(type, style = {}) {
  const next = { ...style };
  const background = String(next.background || '').trim().toLowerCase();
  const textColor = String(next.textColor || '').trim().toLowerCase();

  if (type === 'footer') {
    next.background = P.footer;
    next.textColor = P.white;
    return next;
  }
  if (type === 'cta' || type === 'credentials') {
    if (!background || LEGACY_BAND_BACKGROUNDS.has(background) || background === '#111827') {
      next.background = P.primary;
    }
    if (!textColor || textColor === '#ffffff' || textColor === '#0c2139') {
      next.textColor = P.white;
    }
    return next;
  }
  if (BRANDED_SECTIONS.has(type)) return next;
  if (!background || LEGACY_BAND_BACKGROUNDS.has(background)) {
    next.background = 'transparent';
  }
  if (!textColor || textColor === '#ffffff' || textColor === '#fb923c') {
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
    layout.mediaPosition = layout.mediaPosition || 'background';
    layout.padding = layout.padding || 'large';
    layout.alignment = layout.alignment || 'center';
  } else if (!layout.padding || layout.padding === 'large') {
    layout.padding = 'medium';
  }
  const style = remapStyle(type, { ...(data.style || block?.style || {}) });
  return {
    ...block,
    id: block?.id || `${type || 'broker-commercial'}-${index + 1}`,
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

function hydrateHeroContent(content = {}, defaultContent = {}) {
  const next = { ...content };
  if (!String(next.primary_cta_label || '').trim()) {
    next.primary_cta_label = defaultContent.primary_cta_label || 'Submit a deal';
  }
  if (!String(next.cta_label || '').trim()) {
    next.cta_label = defaultContent.cta_label || 'Book a consultation';
  }
  if (!String(next.join_label || '').trim()) {
    next.join_label = defaultContent.join_label || 'Join Nesti';
  }
  const defaultSlides = Array.isArray(defaultContent.slides) && defaultContent.slides.length
    ? defaultContent.slides
    : COMMERCIAL_HERO_SLIDES;
  next.slides = commitCommercialHeroSlides(
    Array.isArray(next.slides) && next.slides.length ? next.slides : defaultSlides,
  );
  next.broker_commercial_design_version = BROKER_COMMERCIAL_DESIGN_VERSION;
  return next;
}

export function migrateBrokerCommercialBlocks(blocks = [], defaults = []) {
  const current = (Array.isArray(blocks) ? blocks : []).map(normalizeBlock);
  const canonicalDefaults = (Array.isArray(defaults) ? defaults : [])
    .map(normalizeBlock)
    .filter((block) => BROKER_COMMERCIAL_BLOCK_ORDER.includes(block.type));
  const defaultsByType = new Map(canonicalDefaults.map((block) => [block.type, block]));
  const currentByType = new Map();

  current.forEach((block) => {
    const type = block.type;
    if (!BROKER_COMMERCIAL_BLOCK_ORDER.includes(type) || currentByType.has(type)) return;

    if (type === T.HERO) {
      const defaultBlock = defaultsByType.get(T.HERO);
      const content = hydrateHeroContent(
        block.data?.content || {},
        defaultBlock?.data?.content || {},
      );
      currentByType.set(T.HERO, normalizeBlock({
        ...block,
        data: { ...block.data, content },
      }));
      return;
    }

    if ([T.MORTGAGE_PROGRAMS, T.SERVICES, T.WHO_WE_HELP, T.LENDER_NETWORK].includes(type)) {
      const defaultBlock = defaultsByType.get(type);
      const items = Array.isArray(block.data?.content?.items) ? block.data.content.items : [];
      const nextBlock = !items.length
        ? withDefaultCollection(block, defaultBlock, 'items')
        : block;
      const nextLayout = {
        ...(nextBlock.data?.layout || {}),
        columns: nextBlock.data?.layout?.columns || defaultBlock?.data?.layout?.columns || '3',
        cardStyle: nextBlock.data?.layout?.cardStyle || defaultBlock?.data?.layout?.cardStyle || 'bordered',
      };
      currentByType.set(type, normalizeBlock({
        ...nextBlock,
        data: {
          ...nextBlock.data,
          content: {
            ...(nextBlock.data?.content || {}),
            ...(type === T.LENDER_NETWORK ? { disclaimer: '' } : {}),
          },
          layout: nextLayout,
        },
      }));
      return;
    }

    if (type === T.MORTGAGE_RATES) {
      const defaultBlock = defaultsByType.get(T.MORTGAGE_RATES);
      const items = Array.isArray(block.data?.content?.items) ? block.data.content.items : [];
      const nextContent = {
        ...(block.data?.content || {}),
        items: items.length
          ? items
          : (Array.isArray(defaultBlock?.data?.content?.items)
            ? defaultBlock.data.content.items.map((item) => ({ ...item }))
            : []),
        cta_label: block.data?.content?.cta_label
          || defaultBlock?.data?.content?.cta_label
          || 'Request a custom review',
        eyebrow: block.data?.content?.eyebrow || defaultBlock?.data?.content?.eyebrow || '',
        heading: block.data?.content?.heading || defaultBlock?.data?.content?.heading || '',
        body: block.data?.content?.body || defaultBlock?.data?.content?.body || '',
      };
      currentByType.set(T.MORTGAGE_RATES, normalizeBlock({
        ...block,
        data: {
          ...block.data,
          content: nextContent,
          layout: {
            ...(block.data?.layout || {}),
            columns: block.data?.layout?.columns || defaultBlock?.data?.layout?.columns || '1',
            cardStyle: block.data?.layout?.cardStyle || defaultBlock?.data?.layout?.cardStyle || 'bordered',
          },
        },
      }));
      return;
    }

    if (type === T.ROLE_DETAILS) {
      const defaultBlock = defaultsByType.get(T.ROLE_DETAILS);
      const highlights = Array.isArray(block.data?.content?.highlights) ? block.data.content.highlights : [];
      const defaultHighlights = Array.isArray(defaultBlock?.data?.content?.highlights)
        ? defaultBlock.data.content.highlights
        : [];
      const nextContent = {
        ...(block.data?.content || {}),
        highlights: highlights.length
          ? highlights
          : defaultHighlights.map((item) => ({ ...item })),
        cta_label: block.data?.content?.cta_label
          || defaultBlock?.data?.content?.cta_label
          || 'Request a commercial review',
        snapshot_eyebrow: block.data?.content?.snapshot_eyebrow
          || defaultBlock?.data?.content?.snapshot_eyebrow
          || '',
        snapshot_heading: block.data?.content?.snapshot_heading
          || defaultBlock?.data?.content?.snapshot_heading
          || '',
        eyebrow: block.data?.content?.eyebrow || defaultBlock?.data?.content?.eyebrow || '',
        heading: block.data?.content?.heading || defaultBlock?.data?.content?.heading || '',
        body: block.data?.content?.body || defaultBlock?.data?.content?.body || '',
      };
      currentByType.set(T.ROLE_DETAILS, normalizeBlock({
        ...block,
        data: {
          ...block.data,
          content: nextContent,
          layout: {
            ...(block.data?.layout || {}),
            columns: block.data?.layout?.columns || defaultBlock?.data?.layout?.columns || '3',
            cardStyle: block.data?.layout?.cardStyle || defaultBlock?.data?.layout?.cardStyle || 'bordered',
          },
        },
      }));
      return;
    }

    if (type === T.CTA || type === T.TESTIMONIALS) {
      const defaultBlock = defaultsByType.get(type);
      const content = { ...(block.data?.content || {}) };
      const eyebrow = String(content.eyebrow || '').trim();
      if (/^lets start$/i.test(eyebrow)) content.eyebrow = "Let's start";
      if (/^clients feedback$/i.test(eyebrow)) content.eyebrow = 'Client feedback';
      if (!content.eyebrow) content.eyebrow = defaultBlock?.data?.content?.eyebrow || content.eyebrow;
      if (!content.heading) content.heading = defaultBlock?.data?.content?.heading || content.heading;
      if (!content.body) content.body = defaultBlock?.data?.content?.body || content.body;
      currentByType.set(type, normalizeBlock({
        ...block,
        data: {
          ...block.data,
          content,
        },
      }));
      return;
    }

    if (type === T.ALTERNATIVE_LENDING) {
      const defaultBlock = defaultsByType.get(T.ALTERNATIVE_LENDING);
      const defaultItems = Array.isArray(defaultBlock?.data?.content?.items)
        ? defaultBlock.data.content.items
        : [];
      const items = Array.isArray(block.data?.content?.items) ? block.data.content.items : [];
      let nextItems = items;
      if (!nextItems.length && defaultItems.length) {
        nextItems = defaultItems.map((item) => ({ ...item }));
      } else if (nextItems.length > 0 && nextItems.length < 8 && defaultItems.length) {
        // Upgrade short legacy seeds toward the full commercial category set.
        const seen = new Set(nextItems.map((item) => String(item?.id || item?.title || '').toLowerCase()));
        nextItems = [...nextItems];
        defaultItems.forEach((item) => {
          if (nextItems.length >= 12) return;
          const key = String(item?.id || item?.title || '').toLowerCase();
          if (!key || seen.has(key)) return;
          nextItems.push({ ...item });
          seen.add(key);
        });
      }
      const nextContent = {
        ...(block.data?.content || {}),
        items: nextItems.slice(0, 12),
        cta_label: block.data?.content?.cta_label || defaultBlock?.data?.content?.cta_label || 'Explore My Mortgage Options',
        disclaimer: '',
        eyebrow: block.data?.content?.eyebrow || defaultBlock?.data?.content?.eyebrow || '',
        heading: block.data?.content?.heading || defaultBlock?.data?.content?.heading || '',
        body: block.data?.content?.body || defaultBlock?.data?.content?.body || '',
      };
      const nextLayout = {
        ...(block.data?.layout || {}),
        columns: block.data?.layout?.columns || defaultBlock?.data?.layout?.columns || '3',
        cardStyle: block.data?.layout?.cardStyle || defaultBlock?.data?.layout?.cardStyle || 'elevated',
      };
      currentByType.set(T.ALTERNATIVE_LENDING, normalizeBlock({
        ...block,
        data: {
          ...block.data,
          content: nextContent,
          layout: nextLayout,
        },
      }));
      return;
    }

    if (type === T.EXPERTISE) {
      const defaultBlock = defaultsByType.get(T.EXPERTISE);
      const defaultItems = Array.isArray(defaultBlock?.data?.content?.items)
        ? defaultBlock.data.content.items
        : [];
      const items = Array.isArray(block.data?.content?.items) ? block.data.content.items : [];
      let nextItems = items;
      if (!nextItems.length && defaultItems.length) {
        nextItems = defaultItems.map((item) => ({ ...item }));
      } else if (nextItems.length < 6 && defaultItems.length) {
        const seen = new Set(nextItems.map((item) => String(item?.id || item?.title || '').toLowerCase()));
        nextItems = [...nextItems];
        defaultItems.forEach((item) => {
          if (nextItems.length >= 6) return;
          const key = String(item?.id || item?.title || '').toLowerCase();
          if (!key || seen.has(key)) return;
          nextItems.push({ ...item });
          seen.add(key);
        });
      }
      const nextLayout = {
        ...(block.data?.layout || {}),
        columns: block.data?.layout?.columns || defaultBlock?.data?.layout?.columns || '3',
        cardStyle: block.data?.layout?.cardStyle || defaultBlock?.data?.layout?.cardStyle || 'elevated',
      };
      currentByType.set(T.EXPERTISE, normalizeBlock({
        ...block,
        data: {
          ...block.data,
          content: {
            ...(block.data?.content || {}),
            items: nextItems.slice(0, 6),
          },
          layout: nextLayout,
        },
      }));
      return;
    }

    if (type === T.BROKER_COMPENSATION) {
      const defaultBlock = defaultsByType.get(T.BROKER_COMPENSATION);
      const items = Array.isArray(block.data?.content?.items) ? block.data.content.items : [];
      const nextBlock = !items.length
        ? withDefaultCollection(block, defaultBlock, 'items')
        : block;
      currentByType.set(T.BROKER_COMPENSATION, normalizeBlock({
        ...nextBlock,
        data: {
          ...nextBlock.data,
          content: {
            ...(nextBlock.data?.content || {}),
            disclaimer: '',
          },
          layout: {
            ...(nextBlock.data?.layout || {}),
            columns: nextBlock.data?.layout?.columns || defaultBlock?.data?.layout?.columns || '3',
            cardStyle: nextBlock.data?.layout?.cardStyle || defaultBlock?.data?.layout?.cardStyle || 'bordered',
          },
        },
      }));
      return;
    }

    if (type === T.GUIDANCE) {
      const defaultBlock = defaultsByType.get(T.GUIDANCE);
      const steps = Array.isArray(block.data?.content?.steps) ? block.data.content.steps : [];
      const nextBlock = !steps.length
        ? withDefaultCollection(block, defaultBlock, 'steps')
        : block;
      currentByType.set(T.GUIDANCE, normalizeBlock({
        ...nextBlock,
        data: {
          ...nextBlock.data,
          layout: {
            ...(nextBlock.data?.layout || {}),
            columns: nextBlock.data?.layout?.columns || defaultBlock?.data?.layout?.columns || '4',
            cardStyle: nextBlock.data?.layout?.cardStyle || defaultBlock?.data?.layout?.cardStyle || 'flat',
          },
        },
      }));
      return;
    }

    if (type === T.FAQ) {
      const faqs = Array.isArray(block.data?.content?.faqs) ? block.data.content.faqs : [];
      if (!faqs.length) {
        currentByType.set(T.FAQ, withDefaultCollection(block, defaultsByType.get(T.FAQ), 'faqs'));
        return;
      }
    }

    if (type === T.FOOTER) {
      const items = Array.isArray(block.data?.content?.items) ? block.data.content.items : [];
      if (!items.length) {
        currentByType.set(T.FOOTER, withDefaultCollection(block, defaultsByType.get(T.FOOTER), 'items'));
        return;
      }
    }

    currentByType.set(type, block);
  });

  return BROKER_COMMERCIAL_BLOCK_ORDER.map((type, index) => {
    const existing = currentByType.get(type);
    const defaultBlock = defaultsByType.get(type);
    if (existing) return normalizeBlock(existing, index);
    if (defaultBlock) return normalizeBlock(withDefaultContent({ id: `${type}-commercial` }, defaultBlock), index);
    return normalizeBlock({ id: `${type}-commercial`, type, data: { content: {}, layout: {}, style: {} } }, index);
  });
}

export function migrateBrokerCommercialBrandKit(templateKey, brandKit = {}) {
  if (templateKey !== 'mortgage_broker-commercial') return brandKit;
  const essentials = brandKit?.essentials || {};
  const version = Number(essentials.broker_commercial_brand_version || 0);
  const primary = String(brandKit.primary_color || '').trim().toLowerCase();
  const accent = String(brandKit.accent_color || '').trim().toLowerCase();
  const page = String(brandKit.page_background || '').trim().toLowerCase();
  const needsRemap = version < BROKER_COMMERCIAL_BRAND_VERSION
    || LEGACY_PRIMARY_COLORS.has(primary)
    || LEGACY_ACCENT_COLORS.has(accent)
    || LEGACY_PAGE_BACKGROUNDS.has(page);

  if (!needsRemap && version >= BROKER_COMMERCIAL_BRAND_VERSION) return brandKit;

  return {
    ...brandKit,
    primary_color: needsRemap && LEGACY_PRIMARY_COLORS.has(primary)
      ? COMMERCIAL_BRAND.primary_color
      : (brandKit.primary_color || COMMERCIAL_BRAND.primary_color),
    accent_color: needsRemap && LEGACY_ACCENT_COLORS.has(accent)
      ? COMMERCIAL_BRAND.accent_color
      : (brandKit.accent_color || COMMERCIAL_BRAND.accent_color),
    page_background: needsRemap && LEGACY_PAGE_BACKGROUNDS.has(page)
      ? COMMERCIAL_BRAND.page_background
      : (brandKit.page_background || COMMERCIAL_BRAND.page_background),
    font: brandKit.font || 'Manrope',
    button_shape: brandKit.button_shape || 'rounded',
    image_style: brandKit.image_style || 'bold',
    essentials: {
      ...essentials,
      broker_commercial_brand_version: BROKER_COMMERCIAL_BRAND_VERSION,
    },
  };
}
