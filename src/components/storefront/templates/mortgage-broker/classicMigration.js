const BROKER_CLASSIC_DESIGN_VERSION = 16;
const BROKER_CLASSIC_BRAND_VERSION = 1;
const PYLON_BRAND = Object.freeze({
  primary_color: '#0c2139',
  accent_color: '#008fd5',
  page_background: '#ffffff',
});
const LEGACY_PRIMARY_COLORS = new Set(['', '#0f766e', '#1e2f5b']);
const LEGACY_ACCENT_COLORS = new Set(['', '#f59e0b', '#4d7cff']);

const BROKER_CLASSIC_BLOCK_ORDER = Object.freeze([
  'hero',
  'about',
  'practice-snapshot',
  'mortgage-programs',
  'services',
  'role-details',
  'broker-compensation',
  'faq',
  'cta',
  'footer',
]);
const BROKER_CLASSIC_REMOVED_FOOTER_TARGETS = new Set([
  '#rates',
  '#calculator',
  '#lenders',
  '#reviews',
  '#guidance',
  '#credentials',
]);

function contentOf(block = {}) {
  return block?.data?.content || block?.content || {};
}

function normalizeBlock(block = {}, index = 0) {
  const type = block?.type || block?.data?.type || '';
  const data = block?.data || {};
  return {
    ...block,
    id: block?.id || `${type || 'broker-block'}-${index + 1}`,
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

function mergeLegacyContent(defaultBlock, existingBlock) {
  const defaultContent = contentOf(defaultBlock);
  const existingContent = contentOf(existingBlock);
  const content = { ...defaultContent, ...existingContent };

  if (defaultBlock.type === 'hero') {
    const firstSlide = Array.isArray(existingContent.slides)
      ? existingContent.slides[0]
      : null;
    if (firstSlide && typeof firstSlide === 'object') {
      content.heading = existingContent.heading || firstSlide.title || content.heading;
      content.eyebrow = existingContent.eyebrow || firstSlide.description || content.eyebrow;
      content.body = existingContent.body || firstSlide.text || content.body;
      content.primary_cta_label = existingContent.primary_cta_label
        || firstSlide.cta_label
        || content.primary_cta_label;
    }
    delete content.slides;
    delete content.quick_links;
    delete content.phone_label;
    content.broker_design_version = BROKER_CLASSIC_DESIGN_VERSION;
  }
  if (defaultBlock.type === 'mortgage-programs') {
    const hasLegacyPrograms = Array.isArray(existingContent.items)
      && existingContent.items.some((item) => ['program-car', 'program-wedding', 'program-property'].includes(item?.id));
    if (hasLegacyPrograms) content.items = defaultContent.items;
  }
  if (defaultBlock.type === 'about') {
    delete content.badges;
  }
  if (defaultBlock.type === 'services') {
    const hasLegacyServices = Array.isArray(existingContent.items)
      && existingContent.items.some((item) => ['service-credit', 'service-personal', 'service-auto'].includes(item?.id));
    if (hasLegacyServices) {
      content.eyebrow = defaultContent.eyebrow;
      content.heading = defaultContent.heading;
      content.body = defaultContent.body;
      content.items = defaultContent.items;
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
      content.items = defaultContent.items;
      content.eyebrow = content.eyebrow || defaultContent.eyebrow;
      content.heading = content.heading || defaultContent.heading;
      content.body = content.body || defaultContent.body;
      content.disclaimer = content.disclaimer || defaultContent.disclaimer;
    } else {
      content.items = normalizedSource;
    }
  }
  if (defaultBlock.type === 'credentials') {
    delete content.metrics;
  }
  if (defaultBlock.type === 'footer' && Array.isArray(content.items)) {
    content.items = content.items.filter(
      (item) => !BROKER_CLASSIC_REMOVED_FOOTER_TARGETS.has(
        String(item?.target || item?.url || '').toLowerCase(),
      ),
    );
    const ensureLink = (id, label, target) => {
      if (!content.items.some((item) => String(item?.target || '') === target)) {
        content.items.push({ id, label, target });
      }
    };
    ensureLink('footer-programs', 'Programs', '#programs');
    ensureLink('footer-services', 'Services', '#services');
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
      content.items.push({ id: 'footer-contact', label: 'Contact us', target: '/contact' });
    }
    if (!content.items.some((item) => /appointment|consultation/i.test(String(item?.label || '')))) {
      content.items.push({ id: 'footer-booking', label: 'Book an appointment', target: '#contact' });
    }
    if (content.disclaimer === 'Mortgage terms and approvals remain subject to lender qualification and final review.') {
      content.disclaimer = 'Professional, contextual follow-up.';
    }
  }

  return content;
}

function mergeWithDefault(defaultBlock, existingBlock) {
  if (!existingBlock) return normalizeBlock(defaultBlock);
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
      content: mergeLegacyContent(defaultBlock, existingBlock),
      layout: { ...(defaultBlock.data?.layout || {}), ...(existingBlock.data?.layout || {}) },
      style: { ...(defaultBlock.data?.style || {}), ...(existingBlock.data?.style || {}) },
    },
  };
}

function brokerClassicDesignVersion(blocks = []) {
  const hero = (Array.isArray(blocks) ? blocks : []).find(
    (block) => (block?.type || block?.data?.type) === 'hero',
  );
  return Number(contentOf(hero).broker_design_version) || 0;
}

export function migrateBrokerClassicBlocks(blocks = [], defaults = []) {
  const current = (Array.isArray(blocks) ? blocks : [])
    .map(normalizeBlock);
  const canonicalDefaults = (Array.isArray(defaults) ? defaults : [])
    .map(normalizeBlock)
    .filter((block) => BROKER_CLASSIC_BLOCK_ORDER.includes(block.type));
  const defaultsByType = new Map(
    canonicalDefaults.map((block) => [block.type, block]),
  );

  if (!canonicalDefaults.length) {
    return current.filter((block) => BROKER_CLASSIC_BLOCK_ORDER.includes(block.type));
  }

  const firstCurrentByType = new Map();
  current.forEach((block) => {
    if (
      BROKER_CLASSIC_BLOCK_ORDER.includes(block.type)
      && !firstCurrentByType.has(block.type)
    ) {
      firstCurrentByType.set(block.type, block);
    }
  });

  const alreadyMigrated = brokerClassicDesignVersion(current) > 0;

  if (alreadyMigrated) {
    const seenTypes = new Set();
    const migrated = current
      .filter((block) => BROKER_CLASSIC_BLOCK_ORDER.includes(block.type))
      .filter((block) => {
        if (seenTypes.has(block.type)) return false;
        seenTypes.add(block.type);
        return true;
      })
      .map((existing) => {
        if (!['hero', 'about', 'credentials', 'footer', 'lender-network', 'mortgage-rates', 'broker-compensation', 'testimonials'].includes(existing.type)) return existing;
        const content = { ...existing.data.content };
        if (existing.type === 'hero') {
          delete content.slides;
          delete content.quick_links;
          delete content.phone_label;
          content.broker_design_version = BROKER_CLASSIC_DESIGN_VERSION;
        }
        if (existing.type === 'testimonials') {
          const defaultBlock = defaultsByType.get('testimonials');
          if (/client feedback|happy clients|what clients say/i.test(String(content.heading || ''))) {
            content.eyebrow = defaultBlock?.data?.content?.eyebrow || 'Customers testimonials';
            content.heading = defaultBlock?.data?.content?.heading || 'Customers testimonials';
            content.body = defaultBlock?.data?.content?.body
              || 'Real clients sharing how clear guidance and fast service made financing easier.';
          }
          if (!content.eyebrow) content.eyebrow = defaultBlock?.data?.content?.eyebrow || 'Customers testimonials';
          if (!content.body) {
            content.body = defaultBlock?.data?.content?.body
              || 'Real clients sharing how clear guidance and fast service made financing easier.';
          }
          if (Array.isArray(content.items) && content.items.length) {
            const staleIds = new Set(['testimonial-1', 'testimonial-2', 'testimonial-3']);
            const isStale = (item) => {
              const id = String(item?.id || '').trim();
              if (staleIds.has(id)) return true;
              const name = String(item?.client_name || item?.name || '').trim().toLowerCase();
              const text = String(item?.text || item?.description || '').trim().toLowerCase();
              return (
                (name === 'verified client' && text.includes('quick loan approval'))
                || (name === 'repeat client' && text.includes('flexible repayment'))
                || (name === 'business owner' && text.includes('secured a business loan'))
              );
            };
            content.items = content.items.filter((item) => !isStale(item));
          }
        }
        if (existing.type === 'about') delete content.badges;
        if (existing.type === 'credentials') delete content.metrics;
        if (existing.type === 'broker-compensation') {
          delete content.eyebrow;
          const defaultBlock = defaultsByType.get('broker-compensation');
          const defaultItems = defaultBlock?.data?.content?.items || [];
          const sourceItems = Array.isArray(content.items) ? content.items : [];
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
        }
        if (existing.type === 'mortgage-rates') {
          delete content.disclaimer;
          const defaultBlock = defaultsByType.get('mortgage-rates');
          const defaultItems = defaultBlock?.data?.content?.items || [];
          const sourceItems = Array.isArray(content.items) ? content.items : [];
          if (!sourceItems.length && defaultItems.length) {
            content.items = defaultItems;
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
          if (!content.cta_label && defaultBlock?.data?.content?.cta_label) {
            content.cta_label = defaultBlock.data.content.cta_label;
          }
        }
        if (existing.type === 'lender-network') {
          const sourceItems = Array.isArray(content.items) ? content.items : [];
          const defaultBlock = defaultsByType.get('lender-network');
          const defaultItems = defaultBlock?.data?.content?.items || [];
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
          if (defaultItems.length && (!normalizedSource.length || missingDomains || hasGenericPlaceholders)) {
            content.items = defaultItems;
            content.eyebrow = content.eyebrow || defaultBlock.data.content.eyebrow;
            content.heading = content.heading || defaultBlock.data.content.heading;
            content.body = content.body || defaultBlock.data.content.body;
            content.disclaimer = content.disclaimer || defaultBlock.data.content.disclaimer;
          } else if (normalizedSource.length) {
            content.items = normalizedSource;
          }
          if (/showcase the banks/i.test(String(content.body || ''))) {
            content.body = defaultBlock?.data?.content?.body || content.body;
            content.heading = defaultBlock?.data?.content?.heading || content.heading;
            content.eyebrow = defaultBlock?.data?.content?.eyebrow || content.eyebrow;
          }
        }
        if (existing.type === 'footer' && Array.isArray(content.items)) {
          content.items = content.items.filter(
            (item) => !BROKER_CLASSIC_REMOVED_FOOTER_TARGETS.has(
              String(item?.target || item?.url || '').toLowerCase(),
            ),
          );
          const ensureLink = (id, label, target) => {
            if (!content.items.some((item) => String(item?.target || '') === target)) {
              content.items.push({ id, label, target });
            }
          };
          ensureLink('footer-programs', 'Programs', '#programs');
          ensureLink('footer-services', 'Services', '#services');
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
            content.items.push({ id: 'footer-contact', label: 'Contact us', target: '/contact' });
          }
          if (!content.items.some((item) => /appointment|consultation/i.test(String(item?.label || '')))) {
            content.items.push({ id: 'footer-booking', label: 'Book an appointment', target: '#contact' });
          }
          if (content.disclaimer === 'Mortgage terms and approvals remain subject to lender qualification and final review.') {
            content.disclaimer = 'Professional, contextual follow-up.';
          }
        }
        return {
          ...existing,
          data: {
            ...existing.data,
            content,
          },
        };
      });

    const rank = new Map(BROKER_CLASSIC_BLOCK_ORDER.map((type, index) => [type, index]));
    BROKER_CLASSIC_BLOCK_ORDER.forEach((type) => {
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

  return BROKER_CLASSIC_BLOCK_ORDER
    .map((type) => {
      const defaultBlock = defaultsByType.get(type);
      if (!defaultBlock) return null;
      return mergeWithDefault(defaultBlock, firstCurrentByType.get(type));
    })
    .filter(Boolean);
}

export function migrateBrokerClassicBrandKit(templateKey, brandKit = {}) {
  if (templateKey !== 'mortgage_broker-classic') return brandKit;
  const essentials = { ...(brandKit?.essentials || {}) };
  if (Number(essentials.broker_classic_brand_version || 0) >= BROKER_CLASSIC_BRAND_VERSION) {
    return brandKit;
  }

  const primary = String(brandKit?.primary_color || '').trim().toLowerCase();
  const accent = String(brandKit?.accent_color || '').trim().toLowerCase();
  essentials.broker_classic_brand_version = BROKER_CLASSIC_BRAND_VERSION;

  return {
    ...brandKit,
    primary_color: LEGACY_PRIMARY_COLORS.has(primary)
      ? PYLON_BRAND.primary_color
      : brandKit.primary_color,
    accent_color: LEGACY_ACCENT_COLORS.has(accent)
      ? PYLON_BRAND.accent_color
      : brandKit.accent_color,
    page_background: brandKit.page_background || PYLON_BRAND.page_background,
    font_family: brandKit.font_family || brandKit.font || 'Manrope',
    button_shape: brandKit.button_shape || 'rounded',
    essentials,
  };
}
