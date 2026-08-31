const INVESTOR_DESIGN_VERSION = 11;

const INVESTOR_BLOCK_ORDER = Object.freeze([
  'hero',
  'about',
  'practice-snapshot',
  'services',
  'role-details',
  'practice-areas',
  'guidance',
  'credentials',
  'cta',
  'footer',
]);

const LEGACY_COPY = Object.freeze({
  hero: {
    heading: 'Transaction counsel for active investors',
    body: 'Purchases, refinances, assignments, and portfolio title work.',
    cta_label: 'Start investor intake',
    eyebrow: 'Investor legal desk',
  },
  'practice-areas': {
    heading: 'Investor workstreams',
    body: 'Acquisitions, refinancing, and entity transfers.',
  },
  credentials: {
    heading: 'Trusted on volume files',
    body: 'Process discipline for repeat investors.',
  },
  cta: {
    heading: 'Send the next deal',
    body: 'Share APS, entity, and target closing.',
    cta_label: 'Open file',
  },
});

const LEGACY_PRESENTATION = Object.freeze({
  hero: {
    layout: { alignment: 'left', padding: 'large', width: 'full', variant: 'minimal', mediaPosition: 'none', columns: '2', cardStyle: 'bordered' },
    style: { background: ['#f5f3ff', '#1d2740', '#183c34'], textColor: ['', '#ffffff'], radius: 'none', shadow: 'none' },
  },
  about: {
    style: { background: ['#f5f3ee', '#f4f0e8', '#f3f6f7'], textColor: ['#1d2740', '#183c34', '#20252b'] },
  },
  services: {
    style: { background: '#ffffff', textColor: ['#1d2740', '#183c34'] },
  },
  'role-details': {
    style: {
      background: ['#1d2740', '#183c34', '#20252b', '#f3f6f7'],
      textColor: ['#ffffff', '#20252b'],
    },
  },
  'practice-areas': {
    layout: { alignment: 'left', padding: 'medium', width: 'full', variant: 'minimal', mediaPosition: 'none', columns: '2', cardStyle: 'bordered' },
    style: { background: ['#ffffff', '#f5f3ee', '#f4f0e8', '#f3f6f7'], textColor: ['', '#1d2740', '#183c34', '#20252b'], radius: 'none', shadow: 'none' },
  },
  guidance: {
    style: { background: '#ffffff', textColor: ['#1d2740', '#183c34'] },
  },
  credentials: {
    layout: { alignment: 'left', padding: 'medium', width: 'full', variant: 'minimal', mediaPosition: 'none', columns: ['2', '3', 2, 3], cardStyle: 'bordered' },
    style: { background: ['#f5f3ff', '#1d2740', '#183c34', '#20252b'], textColor: ['', '#ffffff'], radius: 'none', shadow: 'none' },
  },
  cta: {
    layout: { alignment: 'left', padding: 'medium', width: 'full', variant: 'minimal', mediaPosition: 'none', columns: '2', cardStyle: 'bordered' },
    style: {
      background: ['#ffffff', '#b9915e', '#d07a45', '#00a7c4'],
      textColor: ['', '#172033', '#102a25', '#0e2025'],
      radius: 'none',
      shadow: 'none',
    },
  },
  footer: {
    style: { background: ['#121a2b', '#102a25'], textColor: '#ffffff' },
  },
});

function blockContent(block = {}) {
  return block?.data?.content || block?.content || {};
}

function blockLayout(block = {}) {
  return block?.data?.layout || block?.layout || {};
}

function blockStyle(block = {}) {
  return block?.data?.style || block?.style || {};
}

const LEGACY_FOOTER_TARGETS = Object.freeze({
  '#buyer-toolkit': '#services',
});

function normalizeInvestorBlock(block = {}, index = 0) {
  const data = block?.data || {};
  const type = block?.type || data.type || '';
  const content = { ...(data.content || block?.content || {}) };
  if (type === 'footer' && Array.isArray(content.items)) {
    content.items = content.items.map((item) => {
      const isPracticeLink = /practice/i.test(`${item?.id || ''} ${item?.label || ''} ${item?.title || ''}`);
      const target = item?.target === '#services' && isPracticeLink
        ? '#practice-areas'
        : LEGACY_FOOTER_TARGETS[item?.target];
      return target ? { ...item, target } : item;
    });
  }
  return {
    ...block,
    id: block?.id || `${type || 'investor-block'}-${index + 1}`,
    type,
    data: {
      ...data,
      enabled: data.enabled ?? block?.enabled ?? true,
      content,
      layout: { ...(data.layout || block?.layout || {}) },
      style: { ...(data.style || block?.style || {}) },
    },
  };
}

function repairDuplicateBlockIds(blocks = []) {
  const seen = new Set();
  return blocks.map((block, index) => {
    const base = String(block?.id || `${block?.type || 'investor-block'}-${index + 1}`)
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '-') || `investor-block-${index + 1}`;
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

function replaceLegacyValues(existing = {}, legacy = {}, defaults = {}) {
  const next = { ...defaults, ...existing };
  Object.entries(legacy || {}).forEach(([key, value]) => {
    const legacyValues = Array.isArray(value) ? value : [value];
    if (legacyValues.includes(existing[key]) && defaults[key] !== undefined) {
      next[key] = defaults[key];
    }
  });
  return next;
}

function mergeWithDefault(existing, defaultBlock) {
  const defaultContent = blockContent(defaultBlock);
  const existingContent = blockContent(existing);
  const legacyCopy = LEGACY_COPY[existing.type] || {};
  const legacyPresentation = LEGACY_PRESENTATION[existing.type] || {};
  const content = replaceLegacyValues(existingContent, legacyCopy, defaultContent);
  const layout = replaceLegacyValues(
    blockLayout(existing),
    legacyPresentation.layout,
    blockLayout(defaultBlock),
  );
  const style = replaceLegacyValues(
    blockStyle(existing),
    legacyPresentation.style,
    blockStyle(defaultBlock),
  );
  content.investor_design_version = INVESTOR_DESIGN_VERSION;

  return {
    ...defaultBlock,
    ...existing,
    id: existing.id || defaultBlock.id,
    type: defaultBlock.type,
    data: {
      ...(defaultBlock.data || {}),
      ...(existing.data || {}),
      enabled: existing.data?.enabled ?? existing.enabled ?? defaultBlock.data?.enabled ?? true,
      content,
      layout,
      style,
    },
  };
}

export function lawyerInvestorDesignVersion(blocks = []) {
  const versions = (Array.isArray(blocks) ? blocks : [])
    .map((block) => Number(blockContent(block).investor_design_version))
    .filter((version) => Number.isFinite(version) && version >= 0);
  if (versions.length) return Math.max(...versions);
  const hasHero = (Array.isArray(blocks) ? blocks : []).some((block) => block?.type === 'hero');
  return Array.isArray(blocks) && blocks.length && !hasHero ? 6 : 0;
}

export function migrateLawyerInvestorBlocks(blocks = [], defaults = []) {
  const current = (Array.isArray(blocks) ? blocks : [])
    .map(normalizeInvestorBlock)
    .filter((block) => block && INVESTOR_BLOCK_ORDER.includes(block.type));
  const canonical = (Array.isArray(defaults) ? defaults : [])
    .map(normalizeInvestorBlock)
    .filter((block) => block && INVESTOR_BLOCK_ORDER.includes(block.type));
  if (!canonical.length) return repairDuplicateBlockIds(current);
  const currentVersion = lawyerInvestorDesignVersion(current);
  if (currentVersion >= INVESTOR_DESIGN_VERSION) return repairDuplicateBlockIds(current);

  const defaultsByType = new Map(canonical.map((block) => [block.type, block]));
  if (currentVersion >= 10) {
    return repairDuplicateBlockIds(current.map((block) => ({
      ...block,
      data: {
        ...block.data,
        content: {
          ...block.data.content,
          investor_design_version: INVESTOR_DESIGN_VERSION,
        },
      },
    })));
  }
  if (currentVersion >= 6) {
    const upgraded = current.map((block) => {
      const defaultBlock = defaultsByType.get(block.type);
      return defaultBlock ? mergeWithDefault(block, defaultBlock) : block;
    });
    if (!upgraded.some((block) => block.type === 'practice-snapshot')) {
      const snapshot = defaultsByType.get('practice-snapshot');
      if (snapshot) {
        const aboutIndex = upgraded.map((block) => block.type).lastIndexOf('about');
        upgraded.splice(aboutIndex >= 0 ? aboutIndex + 1 : 1, 0, snapshot);
      }
    }
    return repairDuplicateBlockIds(upgraded);
  }

  const firstByType = new Map();
  const extras = [];
  current.forEach((block) => {
    if (INVESTOR_BLOCK_ORDER.includes(block.type) && !firstByType.has(block.type)) {
      firstByType.set(block.type, block);
    } else {
      extras.push(defaultsByType.get(block.type)
        ? mergeWithDefault(block, defaultsByType.get(block.type))
        : block);
    }
  });

  const upgraded = INVESTOR_BLOCK_ORDER.map((type) => {
    const defaultBlock = defaultsByType.get(type);
    const existing = firstByType.get(type);
    if (!defaultBlock) return existing;
    if (!existing) {
      if (type !== 'hero') return defaultBlock;
      return mergeWithDefault(defaultBlock, defaultBlock);
    }
    return mergeWithDefault(existing, defaultBlock);
  }).filter(Boolean);

  const footerIndex = upgraded.findIndex((block) => block.type === 'footer');
  if (footerIndex < 0) return repairDuplicateBlockIds([...upgraded, ...extras]);
  return repairDuplicateBlockIds([
    ...upgraded.slice(0, footerIndex),
    ...extras,
    ...upgraded.slice(footerIndex),
  ]);
}

export { INVESTOR_BLOCK_ORDER, INVESTOR_DESIGN_VERSION };
