export const STOREFRONT_BLOCK_TYPES = {
  HERO: 'hero',
  EXPERTISE: 'expertise',
  ROLE_DETAILS: 'role-details',
  ABOUT: 'about',
  PROPERTIES: 'properties',
  TESTIMONIALS: 'testimonials',
  SERVICES: 'services',
  FEATURED_LISTINGS: 'featured-listings',
  TOP_LISTINGS: 'top-listings',
  SOLD_LISTINGS: 'sold-listings',
  MORTGAGE_PROGRAMS: 'mortgage-programs',
  PRACTICE_AREAS: 'practice-areas',
  CREDENTIALS: 'credentials',
  MORTGAGE_CALCULATOR: 'mortgage-calculator',
  CLOSING_COST_ESTIMATOR: 'closing-cost-estimator',
  GUIDANCE: 'guidance',
  CTA: 'cta',
  FOOTER: 'footer',
};

const sharedBlocks = [
  { type: STOREFRONT_BLOCK_TYPES.HERO },
  { type: STOREFRONT_BLOCK_TYPES.EXPERTISE },
  { type: STOREFRONT_BLOCK_TYPES.ROLE_DETAILS },
  { type: STOREFRONT_BLOCK_TYPES.ABOUT, when: 'about' },
  { type: STOREFRONT_BLOCK_TYPES.TESTIMONIALS, when: 'testimonials' },
  { type: STOREFRONT_BLOCK_TYPES.SERVICES },
  { type: STOREFRONT_BLOCK_TYPES.GUIDANCE },
  { type: STOREFRONT_BLOCK_TYPES.CTA },
  { type: STOREFRONT_BLOCK_TYPES.FOOTER },
];

export const STOREFRONT_TEMPLATE_PRESETS = {
  agent: [
    ...sharedBlocks.slice(0, 4),
    { type: STOREFRONT_BLOCK_TYPES.PROPERTIES },
    sharedBlocks[4],
    sharedBlocks[5],
    { type: STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS, when: 'featured_listings' },
    ...sharedBlocks.slice(6),
  ],
  mortgage_broker: [
    ...sharedBlocks.slice(0, 4),
    { type: STOREFRONT_BLOCK_TYPES.MORTGAGE_CALCULATOR },
    sharedBlocks[4],
    sharedBlocks[5],
    { type: STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS, when: 'mortgage_programs' },
    ...sharedBlocks.slice(6),
  ],
  lawyer: [
    ...sharedBlocks.slice(0, 4),
    { type: STOREFRONT_BLOCK_TYPES.CLOSING_COST_ESTIMATOR },
    sharedBlocks[4],
    { type: STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS, when: 'practice_areas' },
    sharedBlocks[5],
    { type: STOREFRONT_BLOCK_TYPES.CREDENTIALS, when: 'credentials' },
    ...sharedBlocks.slice(6),
  ],
};

export function normalizeStorefrontRole(role) {
  return Object.hasOwn(STOREFRONT_TEMPLATE_PRESETS, role) ? role : 'agent';
}

/**
 * Returns a fresh, role-aware block list. Consumers can pass a persisted
 * `storefront_blocks` array later; profiles without it retain their current layout.
 */
export function resolveStorefrontBlocks(profile, blocks = profile?.storefront_blocks) {
  const role = normalizeStorefrontRole(profile?.professional_type);
  const source = Array.isArray(blocks) && blocks.length
    ? blocks
    : STOREFRONT_TEMPLATE_PRESETS[role];

  const visibleBlocks = source
    .filter((block) => block && typeof block.type === 'string' && block.enabled !== false)
    .filter((block) => ![
      STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
      STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
      'home-valuation',
    ].includes(block.type))
    .filter((block) => {
      if (!block.when) return true;
      const value = profile?.[block.when];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });

  // Early investor drafts were published without an About block. Restore it
  // at render time so existing pages match the corrected template as well.
  if (
    profile?.storefront_template_key === 'agent-investor'
    && !visibleBlocks.some((block) => block.type === STOREFRONT_BLOCK_TYPES.ABOUT)
  ) {
    const professionalName = profile?.professional_name || 'This professional';
    const serviceIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.SERVICES,
    );
    const aboutBlock = {
      id: 'about-restored',
      type: STOREFRONT_BLOCK_TYPES.ABOUT,
      data: {
        enabled: true,
        content: {
          heading: `About ${professionalName}`,
          body: profile?.about
            || `${professionalName} provides investment-focused real estate guidance across acquisitions, property evaluation, and portfolio decisions.`,
        },
      },
    };
    visibleBlocks.splice(serviceIndex >= 0 ? serviceIndex + 1 : 1, 0, aboutBlock);
  }

  // Restore the client guide for investor storefronts published before this
  // block was added to the template.
  if (
    profile?.storefront_template_key === 'agent-investor'
    && !visibleBlocks.some((block) => block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE)
  ) {
    const serviceIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.SERVICES,
    );
    const guidanceBlock = {
      id: 'guidance-restored',
      type: STOREFRONT_BLOCK_TYPES.GUIDANCE,
      data: {
        enabled: true,
        content: {
          heading: 'Your investor journey',
          body: 'A clear path from defining your criteria to reviewing opportunities and planning the next move.',
          steps: [
            { title: 'Define your criteria', text: 'Share your target markets, property type, budget, yield goals, and preferred hold period.' },
            { title: 'Review opportunities', text: 'Compare available properties with practical context around fit, risk, and potential.' },
            { title: 'Plan the next move', text: 'Organize questions, request details, and move into a focused consultation with useful context.' },
          ],
          faqs: [
            { q: 'Can I ask about a specific opportunity?', a: 'Yes. Open a property card or use the chat assistant to carry the listing context into your inquiry.' },
            { q: 'Can first-time investors use this page?', a: 'Yes. The guided flow helps clarify budget, goals, financing readiness, and next steps.' },
            { q: 'How do I request a portfolio review?', a: 'Use the valuation or consultation options and share the property and investment context.' },
          ],
        },
      },
    };
    visibleBlocks.splice(serviceIndex >= 0 ? serviceIndex + 1 : 1, 0, guidanceBlock);
  }

  return visibleBlocks
    .map((block, index) => ({
      id: block.id || `${block.type}-${index}`,
      ...block,
    }));
}
