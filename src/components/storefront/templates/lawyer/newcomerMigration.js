const NEWCOMER_DESIGN_VERSION = 6;
const NEWCOMER_BRAND_VERSION = 5;

const NEWCOMER_BRAND_DEFAULTS = Object.freeze({
  primary_color: '#4b3a2f',
  accent_color: '#416f82',
  page_background: '#faf6f0',
});

const NEWCOMER_BLOCK_ORDER = Object.freeze([
  'hero',
  'about',
  'practice-areas',
  'services',
  'guidance',
  'credentials',
  'testimonials',
  'cta',
  'footer',
]);

const LEGACY_DEFAULT_BLOCK_IDS = Object.freeze({
  hero: 'hero-1',
  guidance: 'guidance-2',
  'practice-areas': 'practice-areas-3',
  testimonials: 'testimonials-4',
  cta: 'cta-5',
});

function blockContent(block = {}) {
  return block?.data?.content || block?.content || {};
}

function normalizeNewcomerBlock(block = {}, index = 0) {
  const data = block?.data || {};
  const type = block?.type || data.type || '';
  return {
    ...block,
    id: block?.id || `${type || 'newcomer-block'}-${index + 1}`,
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

function repairDuplicateBlockIds(blocks = []) {
  const seen = new Set();
  return blocks.map((block, index) => {
    const authoredId = typeof block?.id === 'string' && block.id.trim()
      ? block.id
      : '';
    const base = authoredId || `${block?.type || 'newcomer-block'}-${index + 1}`;
    let id = base;
    let suffix = 2;
    while (seen.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    seen.add(id);
    return id === block.id ? block : { ...block, id };
  });
}

function markCurrentDesignVersion(block) {
  return {
    ...block,
    data: {
      ...(block.data || {}),
      content: {
        ...blockContent(block),
        newcomer_design_version: NEWCOMER_DESIGN_VERSION,
      },
    },
  };
}

function mergeLegacyBlockContent(block, fallback) {
  const existingContent = blockContent(block);
  const fallbackContent = blockContent(fallback);
  const isGenericEmptyAbout = block.type === 'about'
    && String(existingContent.heading || '').trim().toLowerCase() === 'about'
    && !String(existingContent.body || '').trim()
    && Number(existingContent.seller_about_layout_version || 0) > 0;
  const content = {
    ...fallbackContent,
    ...existingContent,
  };
  if (isGenericEmptyAbout) {
    content.eyebrow = fallbackContent.eyebrow;
    content.heading = fallbackContent.heading;
    content.body = fallbackContent.body;
  }
  const style = { ...(block?.data?.style || block?.style || {}) };
  const layout = {
    ...(fallback?.data?.layout || fallback?.layout || {}),
    ...(block?.data?.layout || block?.layout || {}),
  };
  if (
    block.type === 'credentials'
    && ['', '2', '3'].includes(String(layout.columns || ''))
  ) {
    layout.columns = '4';
  }
  if (['#f0fdf4', '#fff7ed', '#0f766e', '#134e4a'].includes(
    String(style.background || '').trim().toLowerCase(),
  )) {
    style.background = '';
  }
  if (['#134e4a', '#0f766e'].includes(String(style.textColor || '').trim().toLowerCase())) {
    style.textColor = '';
  }
  return markCurrentDesignVersion({
    ...block,
    data: {
      ...(block.data || {}),
      content,
      layout,
      style,
    },
  });
}

export function lawyerNewcomerDesignVersion(blocks = []) {
  const versions = (Array.isArray(blocks) ? blocks : [])
    .map((block) => Number(blockContent(block).newcomer_design_version))
    .filter((version) => Number.isFinite(version) && version >= 0);
  return versions.length ? Math.max(...versions) : 0;
}

function insertMissingCanonicalBlocks(current, canonical) {
  const next = [...current];
  const existingTypes = new Set(next.map((block) => block.type));

  canonical.forEach((defaultBlock, defaultIndex) => {
    if (existingTypes.has(defaultBlock.type)) return;
    const followingTypes = new Set(
      canonical.slice(defaultIndex + 1).map((block) => block.type),
    );
    const insertAt = next.findIndex((block) => followingTypes.has(block.type));
    next.splice(insertAt >= 0 ? insertAt : next.length, 0, markCurrentDesignVersion(defaultBlock));
    existingTypes.add(defaultBlock.type);
  });

  return next;
}

function isLegacyDefaultScaffold(blocks = []) {
  return Object.entries(LEGACY_DEFAULT_BLOCK_IDS).every(([type, id]) => (
    blocks.some((block) => block.type === type && block.id === id)
  ));
}

function canonicalBlockOrder(blocks = []) {
  return [...blocks].sort((a, b) => (
    NEWCOMER_BLOCK_ORDER.indexOf(a.type) - NEWCOMER_BLOCK_ORDER.indexOf(b.type)
  ));
}

export function migrateLawyerNewcomerBlocks(blocks = [], defaults = []) {
  const supportedTypes = new Set(NEWCOMER_BLOCK_ORDER);
  const current = (Array.isArray(blocks) ? blocks : [])
    .filter(Boolean)
    .map(normalizeNewcomerBlock)
    .filter((block) => supportedTypes.has(block.type));
  const canonical = (Array.isArray(defaults) ? defaults : [])
    .filter(Boolean)
    .map(normalizeNewcomerBlock)
    .filter((block) => supportedTypes.has(block.type));

  if (lawyerNewcomerDesignVersion(current) >= NEWCOMER_DESIGN_VERSION) {
    return repairDuplicateBlockIds(current);
  }

  const defaultsByType = new Map(canonical.map((block) => [block.type, block]));
  const upgraded = current.map((block) => (
    defaultsByType.has(block.type)
      ? mergeLegacyBlockContent(block, defaultsByType.get(block.type))
      : markCurrentDesignVersion(block)
  ));
  const completed = canonical.length
    ? insertMissingCanonicalBlocks(upgraded, canonical)
    : upgraded;
  const repaired = repairDuplicateBlockIds(completed);
  return isLegacyDefaultScaffold(current) ? canonicalBlockOrder(repaired) : repaired;
}

export function migrateLawyerNewcomerBrandKit(templateKey, input = {}) {
  if (templateKey !== 'lawyer-newcomer') return input;
  const essentials = input?.essentials || {};
  if (Number(essentials.lawyer_newcomer_brand_version || 0) >= NEWCOMER_BRAND_VERSION) {
    return input;
  }

  const normalized = (value) => String(value || '').trim().toLowerCase();
  const legacyValues = {
    primary_color: new Set(['', '#0f766e', '#22324d', '#5a2747', '#493f73']),
    accent_color: new Set(['', '#fb923c', '#f59e0b', '#c79a52', '#e07a5f', '#8ea4ff', '#7ea7b8']),
    page_background: new Set(['', '#ffffff', '#f7f4ed', '#fff6f2', '#f7f7ff']),
  };
  const migrated = {
    ...input,
    essentials: {
      ...essentials,
      lawyer_newcomer_brand_version: NEWCOMER_BRAND_VERSION,
    },
  };
  Object.entries(legacyValues).forEach(([key, values]) => {
    if (values.has(normalized(input?.[key]))) migrated[key] = NEWCOMER_BRAND_DEFAULTS[key];
  });
  return migrated;
}

export {
  NEWCOMER_BLOCK_ORDER,
  NEWCOMER_BRAND_DEFAULTS,
  NEWCOMER_BRAND_VERSION,
  NEWCOMER_DESIGN_VERSION,
};
