const FIRST_HOME_DESIGN_VERSION = 7;

const LEGACY_SECTION_BACKGROUNDS = new Set([
  '#eff6ff',
  '#ffffff',
  '#101a2b',
  '#c8a878',
]);

function contentFor(block = {}) {
  return block?.data?.content || block?.content || {};
}

export function lawyerFirstHomeDesignVersion(blocks = []) {
  const hero = (Array.isArray(blocks) ? blocks : []).find((block) => block?.type === 'hero');
  return Number(contentFor(hero).first_home_design_version || 0);
}

function markCurrentDesignVersion(block) {
  if (block?.type !== 'hero') return block;
  if (block.data) {
    return {
      ...block,
      data: {
        ...block.data,
        content: {
          ...(block.data.content || block.content || {}),
          first_home_design_version: FIRST_HOME_DESIGN_VERSION,
        },
      },
    };
  }
  return {
    ...block,
    content: {
      ...(block.content || {}),
      first_home_design_version: FIRST_HOME_DESIGN_VERSION,
    },
  };
}

function addNewLayersWithoutResetting(current, canonical) {
  const credentialDefaults = canonical.find((block) => block?.type === 'credentials');
  const defaultCredentialItems = credentialDefaults?.data?.content?.items
    || credentialDefaults?.content?.items
    || [];
  const defaultCredentialContent = contentFor(credentialDefaults);
  const legacyCredentialTitles = [
    'Dedicated first-home focus',
    'Plain-language updates',
    'Secure file coordination',
    'Offer-to-keys continuity',
  ];
  const next = current.map((block) => {
    const marked = markCurrentDesignVersion(block);
    if (marked?.type !== 'credentials' || !defaultCredentialItems.length) return marked;
    const existingContent = contentFor(marked);
    const hasExplicitItems = Object.prototype.hasOwnProperty.call(existingContent, 'items')
      && Array.isArray(existingContent.items);
    const existingItems = Array.isArray(existingContent.items) ? existingContent.items : [];
    const usesLegacyCredentialDefaults = existingItems.length === legacyCredentialTitles.length
      && legacyCredentialTitles.every(
        (title, index) => String(existingItems[index]?.title || '').trim() === title,
      );
    if ((hasExplicitItems && !existingItems.length)
      || (existingItems.length && !usesLegacyCredentialDefaults)) return marked;
    const contentUpdates = {
      ...existingContent,
      items: defaultCredentialItems,
      ...(existingContent.heading === 'A legal experience built around clarity'
        ? { heading: defaultCredentialContent.heading }
        : {}),
      ...(existingContent.body === 'Practical safeguards and consistent communication support every stage of your first closing.'
        ? { body: defaultCredentialContent.body }
        : {}),
    };
    if (marked.data) {
      return {
        ...marked,
        data: {
          ...marked.data,
          content: contentUpdates,
        },
      };
    }
    return {
      ...marked,
      content: contentUpdates,
    };
  });
  // Missing blocks may have been intentionally deleted. Without persisted
  // tombstones there is no safe way to distinguish deletion from an older
  // template, so upgrades preserve the user's existing block set.
  return next;
}

export function migrateLawyerFirstHomeBlocks(blocks = [], defaults = []) {
  const current = Array.isArray(blocks)
    ? blocks.filter((block) => block && block.type !== 'closing-cost-estimator')
      .map((block) => {
        if (block.type !== 'hero') return block;
        const content = contentFor(block);
        const usesRetiredEstimatorCta = /^estimate(?: my)? closing costs$/i.test(
          String(content.cta_label || '').trim(),
        );
        if (!usesRetiredEstimatorCta) return block;
        const nextContent = { ...content, cta_label: 'Book a consultation' };
        if (block.data) {
          return {
            ...block,
            data: {
              ...block.data,
              content: nextContent,
            },
          };
        }
        return { ...block, content: nextContent };
      })
    : [];
  const canonical = Array.isArray(defaults) ? defaults.filter(Boolean) : [];
  const currentVersion = lawyerFirstHomeDesignVersion(current);
  if (!canonical.length || currentVersion >= FIRST_HOME_DESIGN_VERSION) {
    return current;
  }
  if (currentVersion >= 3) return addNewLayersWithoutResetting(current, canonical);

  const defaultsByType = new Map(
    canonical.filter((block) => block?.type).map((block) => [block.type, block]),
  );
  const migrated = current.map((existing) => {
    const defaultBlock = defaultsByType.get(existing.type);
    if (!defaultBlock) return markCurrentDesignVersion(existing);

    const defaultData = defaultBlock.data || {};
    const existingData = existing.data || {};
    const existingLayout = {
      ...(existing.layout || {}),
      ...(existingData.layout || {}),
    };
    const existingStyle = {
      ...(existing.style || {}),
      ...(existingData.style || {}),
    };
    const background = String(existingStyle.background || '').trim().toLowerCase();
    const keepCustomBackground = background && !LEGACY_SECTION_BACKGROUNDS.has(background);

    return {
      ...defaultBlock,
      ...existing,
      id: existing.id || defaultBlock.id,
      type: defaultBlock.type,
      data: {
        ...defaultData,
        ...existingData,
        enabled: existingData.enabled ?? existing.enabled ?? defaultData.enabled ?? true,
        content: {
          ...(defaultData.content || {}),
          ...(existingData.content || existing.content || {}),
          ...(defaultBlock.type === 'hero'
            ? { first_home_design_version: FIRST_HOME_DESIGN_VERSION }
            : {}),
        },
        layout: {
          ...(defaultData.layout || {}),
          ...existingLayout,
        },
        style: {
          ...(defaultData.style || {}),
          ...existingStyle,
          ...(!keepCustomBackground && background
            ? { background: defaultData.style?.background || '' }
            : {}),
        },
      },
    };
  });
  return migrated;
}

export { FIRST_HOME_DESIGN_VERSION };
