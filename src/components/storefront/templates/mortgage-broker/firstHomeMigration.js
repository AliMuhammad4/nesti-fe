import {
  FIRST_HOME_HERO_SLIDES,
  FIRST_HOME_PROGRAM_ITEMS,
  resolveSlideImagePlacement,
} from '../../renderers/variants/broker/firstHome/brokerFirstHomeDefaults';
import { FIRST_HOME_PALETTE as P } from '../../renderers/variants/broker/firstHome/brokerFirstHomePalette';
import { hydrateBrokerTestimonialItems } from '../../renderers/variants/broker/classic/brokerTestimonialItems';

const BROKER_FIRST_HOME_DESIGN_VERSION = 13;
const BROKER_FIRST_HOME_BRAND_VERSION = 10;

export const BROKER_FIRST_HOME_BLOCK_ORDER = Object.freeze([
  'hero',
  'practice-snapshot',
  'mortgage-programs',
  'services',
  'about',
  'guidance',
  'mortgage-rates',
  'mortgage-calculator',
  'lender-network',
  'broker-compensation',
  'alternative-lending',
  'credentials',
  'testimonials',
  'faq',
  'cta',
  'footer',
]);

const FIRST_HOME_LEGACY_SECTION_BACKGROUNDS = new Set([
  '',
  'transparent',
  '#ffffff',
  '#fff',
  P.page.toLowerCase(),
  P.surface.toLowerCase(),
  '#f8fafc',
  '#eff2f6',
  '#f5f8fb',
  '#e8eef5',
  '#f7fafc',
]);

const FIRST_HOME_BRANDED_SECTIONS = new Set(['hero', 'cta', 'footer', 'credentials']);

function normalizeFirstHomeSectionStyle(type, style = {}) {
  if (FIRST_HOME_BRANDED_SECTIONS.has(type)) return style;
  const background = String(style.background || '').trim().toLowerCase();
  if (!FIRST_HOME_LEGACY_SECTION_BACKGROUNDS.has(background)) return style;
  return {
    ...style,
    background: 'transparent',
  };
}
const FIRST_HOME_BRAND = Object.freeze({
  primary_color: P.primary,
  accent_color: P.accent,
  page_background: P.page,
});

const LEGACY_PRIMARY_COLORS = new Set([
  '',
  '#075985',
  '#0f766e',
  '#1e2f5b',
  '#2a2c38',
  '#1b2d3a',
  '#15252e',
  '#0b1420',
  '#101c2c',
  '#07111c',
  '#0a1220',
  '#0f3d2e',
  '#25205f',
]);
const LEGACY_ACCENT_COLORS = new Set([
  '',
  '#fbbf24',
  '#f59e0b',
  '#4d7cff',
  '#ff9021',
  '#4f8f7a',
  '#5ec8d8',
  '#6ed7e8',
  '#8be7f4',
  '#2ba8bc',
  '#1fa8bd',
  '#14b8d4',
  '#ff8a6b',
  '#e85a3c',
  '#3ecf7a',
  '#1fa85a',
  '#a78bfa',
  '#6d4aff',
  '#7c8cff',
  '#4f5fe7',
]);
const LEGACY_PAGE_BACKGROUNDS = new Set([
  '',
  '#ffffff',
  '#fff',
  '#f5f5f5',
  '#f4f6f7',
  '#e8eef0',
  '#f5f8fb',
  '#e8eef5',
  '#f7fafc',
  '#e9f0f5',
  '#f7f8fa',
  '#eceff3',
  '#f1f8f4',
  '#f2efff',
  '#fcfbff',
  '#f2f5ff',
  '#fcfdff',
]);

const FIRST_HOME_CLASSIC_PROGRAM_IDS = new Set([
  'program-purchase',
  'program-refinance',
  'program-renewal',
  'program-investor',
  'program-commercial',
]);
const FIRST_HOME_PROGRAM_IDS = new Set(FIRST_HOME_PROGRAM_ITEMS.map((item) => item.id));
const LEGACY_LOAN_PROGRAM_IDS = new Set(['program-car', 'program-wedding', 'program-property']);

function contentOf(block) {
  return block?.data?.content || block?.content || {};
}

function brokerFirstHomeDesignVersion(blocks = []) {
  const hero = (Array.isArray(blocks) ? blocks : []).find(
    (block) => (block?.type || block?.data?.type) === 'hero',
  );
  return Number(contentOf(hero).broker_first_home_design_version) || 0;
}

function mergeFirstHomeLegacyContent(defaultBlock, existingBlock) {
  const defaultContent = defaultBlock.data?.content || {};
  const existingContent = existingBlock?.data?.content || existingBlock?.content || {};
  const content = { ...defaultContent, ...existingContent };

  if (defaultBlock.type === 'mortgage-programs') {
    const sourceItems = Array.isArray(content.items) ? content.items : [];
    const hasFirstHomePrograms = sourceItems.some((item) => FIRST_HOME_PROGRAM_IDS.has(item?.id));
    const hasClassicOnlyPrograms = sourceItems.some((item) => FIRST_HOME_CLASSIC_PROGRAM_IDS.has(item?.id));
    const hasLegacyLoanPrograms = sourceItems.some((item) => LEGACY_LOAN_PROGRAM_IDS.has(item?.id));
    if (
      !sourceItems.length
      || hasLegacyLoanPrograms
      || (hasClassicOnlyPrograms && !hasFirstHomePrograms)
    ) {
      if (Array.isArray(defaultContent.items) && defaultContent.items.length) {
        content.items = defaultContent.items;
      }
    }
  }
  if (defaultBlock.type === 'mortgage-rates') {
    delete content.disclaimer;
    const sourceItems = Array.isArray(content.items) ? content.items : [];
    if (!sourceItems.length && Array.isArray(defaultContent.items) && defaultContent.items.length) {
      content.items = defaultContent.items;
    } else if (sourceItems.length) {
      content.items = sourceItems.map((item) => {
        if (!item || typeof item !== 'object') return item;
        const rate = String(item.rate || item.value || '');
        if (/x\.xx/i.test(rate)) {
          return { ...item, rate: rate.replace(/x\.xx/gi, '—') };
        }
        return item;
      });
    }
    if (!content.cta_label && defaultContent.cta_label) {
      content.cta_label = defaultContent.cta_label;
    }
  }
  if (defaultBlock.type === 'lender-network') {
    const sourceItems = Array.isArray(existingContent.items) ? existingContent.items : [];
    const normalizedSource = sourceItems.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const domain = String(item.domain || item.website || item.url || '')
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .split('?')[0]
        .split('#')[0];
      return domain ? { ...item, domain, website: item.website || item.domain || domain } : item;
    });
    const missingDomains = normalizedSource.length > 0
      && normalizedSource.every((item) => !String(item?.domain || '').trim());
    const hasGenericPlaceholders = normalizedSource.some((item) => (
      ['lender-credit-union', 'lender-alt', 'lender-b', 'lender-private', 'lender-commercial'].includes(item?.id)
    ));
    if (!normalizedSource.length || missingDomains || hasGenericPlaceholders) {
      if (Array.isArray(defaultContent.items) && defaultContent.items.length) {
        content.items = defaultContent.items;
      }
      content.eyebrow = content.eyebrow || defaultContent.eyebrow;
      content.heading = content.heading || defaultContent.heading;
      content.body = content.body || defaultContent.body;
      content.disclaimer = content.disclaimer || defaultContent.disclaimer;
    } else {
      content.items = normalizedSource;
    }
  }
  if (defaultBlock.type === 'broker-compensation') {
    const sourceItems = Array.isArray(content.items) ? content.items : [];
    const defaultItems = Array.isArray(defaultContent.items) ? defaultContent.items : [];
    const defaultIcons = ['building', 'percent', 'briefcase', 'home'];
    if (!sourceItems.length && defaultItems.length) {
      content.items = defaultItems;
    } else if (sourceItems.length) {
      content.items = sourceItems.map((item, index) => {
        if (!item || typeof item !== 'object') return item;
        if (String(item.icon || '').trim()) return item;
        return {
          ...item,
          icon: defaultItems[index]?.icon || defaultIcons[index % defaultIcons.length],
        };
      });
    }
    if (!content.disclaimer && defaultContent.disclaimer) {
      content.disclaimer = defaultContent.disclaimer;
    }
  }
  if (defaultBlock.type === 'mortgage-calculator') {
    if (!String(content.cta_label || '').trim()) {
      content.cta_label = content.primary_cta_label
        || defaultContent.cta_label
        || 'Talk through my numbers';
    }
  }
  if (defaultBlock.type === 'services') {
    const sourceItems = Array.isArray(content.items) ? content.items : [];
    if (!sourceItems.length && Array.isArray(defaultContent.items) && defaultContent.items.length) {
      content.items = defaultContent.items;
    }
  }
  if (defaultBlock.type === 'footer') {
    if (!Array.isArray(content.items) || !content.items.length) {
      content.items = Array.isArray(defaultContent.items) && defaultContent.items.length
        ? defaultContent.items
        : [];
    }
  }
  if (defaultBlock.type === 'footer' && Array.isArray(content.items)) {
    const ensureLink = (id, label, target) => {
      if (!content.items.some((item) => String(item?.target || item?.url || '') === target)) {
        content.items.push({ id, label, target });
      }
    };
    ensureLink('footer-about', 'About', '#about');
    ensureLink('footer-services', 'Services', '#services');
    ensureLink('footer-roadmap', 'Roadmap', '#guidance');
    ensureLink('footer-rates', 'Rates', '#rates');
    ensureLink('footer-calculator', 'Calculator', '#calculator');
    ensureLink('footer-lenders', 'Lenders', '#lenders');
    ensureLink('footer-faq', 'FAQ', '#faq');
    content.items = content.items.map((item) => {
      const label = String(item?.label || '').toLowerCase();
      const target = String(item?.target || item?.url || '');
      if (target === '#contact' && /contact/.test(label) && !/appointment|consultation|book/.test(label)) {
        return { ...item, target: '/contact' };
      }
      return item;
    });
    if (!content.items.some((item) => String(item?.target || '') === '/contact')) {
      content.items.push({ id: 'footer-contact', label: 'Contact', target: '/contact' });
    }
    if (!content.items.some((item) => /appointment|consultation/i.test(String(item?.label || '')))) {
      content.items.push({ id: 'footer-booking', label: 'Book a consultation', target: '#contact' });
    }
  }

  return content;
}

function normalizeIncrementalFirstHomeBlock(existing, defaultsByType, profile = {}) {
  if (!['hero', 'footer', 'lender-network', 'mortgage-rates', 'broker-compensation', 'testimonials', 'mortgage-programs', 'mortgage-calculator', 'services'].includes(existing.type)) {
    return existing;
  }
  const defaultBlock = defaultsByType.get(existing.type);
  const content = mergeFirstHomeLegacyContent(
    defaultBlock || { type: existing.type, data: { content: {} } },
    existing,
  );
  if (existing.type === 'hero') {
    delete content.quick_links;
    delete content.phone_label;
    const defaultSlides = defaultBlock?.data?.content?.slides || FIRST_HOME_HERO_SLIDES;
    const existingSlides = existing.data?.content?.slides || [];
    content.slides = normalizeHeroSlides(existingSlides, defaultSlides);
    content.broker_first_home_design_version = BROKER_FIRST_HOME_DESIGN_VERSION;
  }
  if (existing.type === 'testimonials') {
    if (/client feedback|happy clients|what clients say/i.test(String(content.heading || ''))) {
      content.eyebrow = defaultBlock?.data?.content?.eyebrow || 'First homes financed';
      content.heading = defaultBlock?.data?.content?.heading || 'Buyers who felt ready before offer day';
      content.body = defaultBlock?.data?.content?.body
        || 'Clear guidance helps first-time buyers move forward with fewer surprises.';
    }
    if (!content.eyebrow) content.eyebrow = defaultBlock?.data?.content?.eyebrow || 'First homes financed';
    if (!content.body) {
      content.body = defaultBlock?.data?.content?.body
        || 'Clear guidance helps first-time buyers move forward with fewer surprises.';
    }
    Object.assign(content, hydrateBrokerTestimonialItems(content, [
      ...(Array.isArray(profile?.testimonials) ? profile.testimonials : []),
      ...(Array.isArray(profile?.client_feedback) ? profile.client_feedback : []),
    ]));
  }
  return {
    ...existing,
    data: {
      ...existing.data,
      content,
    },
  };
}

function normalizeSlide(slide = {}, index = 0, fallback = FIRST_HOME_HERO_SLIDES[index] || FIRST_HOME_HERO_SLIDES[0]) {
  const normalized = {
    id: String(slide?.id || fallback?.id || `slide-${index + 1}`).trim(),
    eyebrow: String(slide?.eyebrow ?? fallback?.eyebrow ?? '').trim(),
    heading: String(slide?.heading ?? slide?.title ?? fallback?.heading ?? '').trim(),
    body: String(slide?.body ?? slide?.text ?? fallback?.body ?? '').trim(),
    image_url: String(slide?.image_url || slide?.image || slide?.src || '').trim(),
  };
  const placement = resolveSlideImagePlacement({ ...fallback, ...slide });
  return {
    ...normalized,
    image_position_x: placement.x,
    image_position_y: placement.y,
    image_zoom: placement.zoom,
    image_fit: placement.fit,
    image_position: placement.image_position,
  };
}

function normalizeHeroSlides(rawSlides = [], fallbackSlides = FIRST_HOME_HERO_SLIDES) {
  const source = Array.isArray(rawSlides) ? rawSlides.filter(Boolean) : [];
  if (!source.length) {
    const fallback = fallbackSlides[0] || FIRST_HOME_HERO_SLIDES[0];
    return fallback ? [normalizeSlide(fallback, 0, fallback)] : [];
  }
  const count = Math.min(source.length, 3);
  const base = fallbackSlides.length ? fallbackSlides : FIRST_HOME_HERO_SLIDES;
  return Array.from({ length: count }, (_, index) => normalizeSlide(
    source[index] || base[index] || {},
    index,
    base[index] || base[0],
  ));
}

function normalizeBlock(block = {}, index = 0) {
  const type = block?.type || block?.data?.type || '';
  const data = block?.data || {};
  return {
    ...block,
    id: block?.id || `${type || 'broker-first-home'}-${index + 1}`,
    type,
    data: {
      ...data,
      enabled: data.enabled ?? block?.enabled ?? true,
      content: { ...(data.content || block?.content || {}) },
      layout: { ...(data.layout || block?.layout || {}) },
      style: { ...(data.style || block?.style || {}) },
    },
  };
}

function mergeWithDefault(defaultBlock, existingBlock, preservePresentation = false, profile = {}) {
  if (!existingBlock) return normalizeBlock(defaultBlock);
  const mergedContent = mergeFirstHomeLegacyContent(defaultBlock, existingBlock);
  const content = {
    ...mergedContent,
  };
  if (defaultBlock.type === 'hero') {
    delete content.quick_links;
    delete content.phone_label;
    const defaultSlides = defaultBlock.data?.content?.slides || FIRST_HOME_HERO_SLIDES;
    const existingSlides = existingBlock.data?.content?.slides
      || existingBlock.content?.slides
      || [];
    const designVersion = Number(content.broker_first_home_design_version) || 0;
    let slides = normalizeHeroSlides(
      designVersion >= 2 && existingSlides.length
        ? existingSlides
        : (existingSlides.length ? existingSlides : defaultSlides),
      defaultSlides,
    );
    // Design v5+: shorten overlong slide-0 headings that force 3-line wraps.
    if (designVersion < 5 && slides[0] && String(slides[0].heading || '').trim().length > 42) {
      slides = slides.map((slide, index) => (
        index === 0
          ? { ...slide, heading: defaultSlides[0]?.heading || FIRST_HOME_HERO_SLIDES[0].heading }
          : slide
      ));
    }
    content.slides = slides;
    // Keep shared CTAs; drop legacy single-field copy if slides carry the story.
    if (!String(content.primary_cta_label || '').trim()) {
      content.primary_cta_label = defaultBlock.data?.content?.primary_cta_label || 'Start my pre-approval';
    }
    if (!String(content.cta_label || '').trim()) {
      content.cta_label = defaultBlock.data?.content?.cta_label || 'Check my affordability';
    }
    if (!String(content.join_label || '').trim()) {
      content.join_label = defaultBlock.data?.content?.join_label || 'Join Nesti';
    }
    content.broker_first_home_design_version = BROKER_FIRST_HOME_DESIGN_VERSION;
  }
  if (defaultBlock.type === 'testimonials') {
    Object.assign(content, hydrateBrokerTestimonialItems(content, [
      ...(Array.isArray(profile?.testimonials) ? profile.testimonials : []),
      ...(Array.isArray(profile?.client_feedback) ? profile.client_feedback : []),
    ]));
  }
  return {
    ...defaultBlock,
    ...existingBlock,
    id: existingBlock.id || defaultBlock.id,
    type: defaultBlock.type,
    data: {
      ...(defaultBlock.data || {}),
      ...(existingBlock.data || {}),
      enabled: existingBlock.data?.enabled
        ?? existingBlock.enabled
        ?? defaultBlock.data?.enabled
        ?? true,
      content,
      layout: preservePresentation
        ? {
            ...(defaultBlock.data?.layout || {}),
            ...(existingBlock.data?.layout || existingBlock.layout || {}),
          }
        : { ...(defaultBlock.data?.layout || {}) },
      style: normalizeFirstHomeSectionStyle(
        defaultBlock.type,
        preservePresentation
          ? {
              ...(defaultBlock.data?.style || {}),
              ...(existingBlock.data?.style || existingBlock.style || {}),
            }
          : { ...(defaultBlock.data?.style || {}) },
      ),
    },
  };
}

export function migrateBrokerFirstHomeBlocks(blocks = [], defaults = [], profile = {}) {
  const current = (Array.isArray(blocks) ? blocks : []).map(normalizeBlock);
  const canonicalDefaults = (Array.isArray(defaults) ? defaults : [])
    .map(normalizeBlock)
    .filter((block) => BROKER_FIRST_HOME_BLOCK_ORDER.includes(block.type));
  if (!canonicalDefaults.length) {
    return current.filter((block) => BROKER_FIRST_HOME_BLOCK_ORDER.includes(block.type));
  }

  const currentByType = new Map();
  current.forEach((block) => {
    if (BROKER_FIRST_HOME_BLOCK_ORDER.includes(block.type) && !currentByType.has(block.type)) {
      currentByType.set(block.type, block);
    }
  });
  const defaultsByType = new Map(canonicalDefaults.map((block) => [block.type, block]));
  const currentDesignVersion = brokerFirstHomeDesignVersion(current);
  const alreadyMigrated = currentDesignVersion > 0;
  // Only preserve custom layout/style after the current design system is already applied.
  const preservePresentation = currentDesignVersion >= BROKER_FIRST_HOME_DESIGN_VERSION;

  if (alreadyMigrated) {
    const seenTypes = new Set();
    const migrated = current
      .filter((block) => BROKER_FIRST_HOME_BLOCK_ORDER.includes(block.type))
      .filter((block) => {
        if (seenTypes.has(block.type)) return false;
        seenTypes.add(block.type);
        return true;
      })
      .map((existing) => normalizeIncrementalFirstHomeBlock(existing, defaultsByType, profile));

    const rank = new Map(BROKER_FIRST_HOME_BLOCK_ORDER.map((type, index) => [type, index]));
    BROKER_FIRST_HOME_BLOCK_ORDER.forEach((type) => {
      if (seenTypes.has(type)) return;
      const defaultBlock = defaultsByType.get(type);
      if (!defaultBlock) return;
      const blockRank = rank.get(type);
      const insertionIndex = migrated.findIndex(
        (item) => (rank.get(item.type) ?? Number.POSITIVE_INFINITY) > blockRank,
      );
      migrated.splice(
        insertionIndex >= 0 ? insertionIndex : migrated.length,
        0,
        normalizeBlock(defaultBlock),
      );
      seenTypes.add(type);
    });
    return migrated;
  }

  return BROKER_FIRST_HOME_BLOCK_ORDER
    .map((type) => {
      const defaultBlock = defaultsByType.get(type);
      if (!defaultBlock) return null;
      return mergeWithDefault(defaultBlock, currentByType.get(type), preservePresentation, profile);
    })
    .filter(Boolean);
}

export function migrateBrokerFirstHomeBrandKit(templateKey, brandKit = {}) {
  if (templateKey !== 'mortgage_broker-first-home') return brandKit;
  const essentials = { ...(brandKit?.essentials || {}) };
  if (Number(essentials.broker_first_home_brand_version || 0) >= BROKER_FIRST_HOME_BRAND_VERSION) {
    return brandKit;
  }

  const primary = String(brandKit?.primary_color || '').trim().toLowerCase();
  const accent = String(brandKit?.accent_color || '').trim().toLowerCase();
  const page = String(brandKit?.page_background || '').trim().toLowerCase();
  essentials.broker_first_home_brand_version = BROKER_FIRST_HOME_BRAND_VERSION;

  return {
    ...brandKit,
    primary_color: LEGACY_PRIMARY_COLORS.has(primary)
      ? FIRST_HOME_BRAND.primary_color
      : (brandKit.primary_color || FIRST_HOME_BRAND.primary_color),
    accent_color: LEGACY_ACCENT_COLORS.has(accent)
      ? FIRST_HOME_BRAND.accent_color
      : (brandKit.accent_color || FIRST_HOME_BRAND.accent_color),
    page_background: LEGACY_PAGE_BACKGROUNDS.has(page)
      ? FIRST_HOME_BRAND.page_background
      : (brandKit.page_background || FIRST_HOME_BRAND.page_background),
    font_family: brandKit.font_family || brandKit.font || 'Source Sans 3',
    button_shape: brandKit.button_shape || 'rounded',
    essentials,
  };
}
