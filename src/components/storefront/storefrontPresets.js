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
  SELLER_PERFORMANCE: 'seller-performance',
  SELLER_SOLD_RESULTS: 'seller-sold-results',
  SELLER_CASE_STUDY: 'seller-case-study',
  SELLER_CREDENTIALS: 'seller-credentials',
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

export const DEFAULT_STOREFRONT_TEMPLATE_BY_ROLE = {
  agent: 'agent-investor',
  mortgage_broker: 'mortgage_broker-classic',
  lawyer: 'lawyer-classic',
};

export function defaultStorefrontTemplateKey(role) {
  const normalized = normalizeStorefrontRole(role);
  return DEFAULT_STOREFRONT_TEMPLATE_BY_ROLE[normalized] || `${normalized}-classic`;
}

export function isInvestorSpecialistTemplate(templateKey) {
  return String(templateKey || '').trim().toLowerCase() === 'agent-investor';
}

/**
 * Returns a fresh, role-aware block list. Consumers can pass a persisted
 * `storefront_blocks` array later; profiles without it retain their current layout.
 */
export function resolveStorefrontBlocks(
  profile,
  blocks = profile?.storefront_blocks,
  templateKey = profile?.storefront_template_key,
) {
  const role = normalizeStorefrontRole(profile?.professional_type);
  const resolvedTemplateKey = templateKey || profile?.storefront_template_key || '';
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
      if (isInvestorSpecialistTemplate(resolvedTemplateKey) && block.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS) {
        return false;
      }
      if (!block.when) return true;
      const value = profile?.[block.when];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });

  const sharedProofTypes = [
    STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE,
    STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
    STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY,
    STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS,
  ];
  if (
    ['agent-luxury-advisor', 'agent-first-home', 'agent-community-expert']
      .includes(resolvedTemplateKey)
    && visibleBlocks.some((block) => (
      sharedProofTypes.includes(block.type)
      && Number(block?.data?.content?.shared_proof_layout_version || 0) < 1
    ))
  ) {
    const proofByType = new Map(
      visibleBlocks
        .filter((block) => sharedProofTypes.includes(block.type))
        .map((block) => [block.type, block]),
    );
    for (let index = visibleBlocks.length - 1; index >= 0; index -= 1) {
      if (sharedProofTypes.includes(visibleBlocks[index].type)) visibleBlocks.splice(index, 1);
    }
    const footerIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.FOOTER,
    );
    visibleBlocks.splice(
      footerIndex >= 0 ? footerIndex : visibleBlocks.length,
      0,
      ...sharedProofTypes
        .map((type) => proofByType.get(type))
        .filter(Boolean),
    );
  }

  if (['agent-luxury-advisor', 'agent-first-home', 'agent-community-expert'].includes(resolvedTemplateKey)) {
    const performanceIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE,
    );
    const performanceBlock = visibleBlocks[performanceIndex];
    const performanceContent = performanceBlock?.data?.content || {};
    const existingPerformanceItems = Array.isArray(performanceContent.items)
      ? performanceContent.items
      : [];
    if (
      performanceBlock
      && Number(performanceContent.shared_proof_performance_version || 0) < 2
    ) {
      const canonicalItems = [
        { label: 'Homes sold', value: '', source: 'closed_seller_leads' },
        { label: 'Experience', value: '', source: 'years_experience' },
        { label: 'Client rating', value: '', source: 'rating' },
        { label: 'Available options', value: '', source: 'available_seller_leads' },
      ];
      visibleBlocks[performanceIndex] = {
        ...performanceBlock,
        data: {
          ...(performanceBlock.data || {}),
          content: {
            ...performanceContent,
            shared_proof_performance_version: 2,
            items: canonicalItems.map((item, index) => ({
              ...(existingPerformanceItems[index] || {}),
              ...item,
            })),
          },
        },
      };
    }
  }

  if (['agent-luxury-advisor', 'agent-first-home', 'agent-community-expert'].includes(resolvedTemplateKey)) {
    const credentialsIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS,
    );
    const credentialsBlock = visibleBlocks[credentialsIndex];
    const content = credentialsBlock?.data?.content || {};
    const existingCredentialItems = Array.isArray(content.items) ? content.items : [];
    if (
      credentialsBlock
      && Number(content.shared_proof_metrics_version || 0) < 2
    ) {
      const canonicalItems = [
        { title: 'Clients', issuer: '', value: '', source: 'total_clients' },
        { title: 'Active pipeline value', issuer: '', value: '', source: 'active_pipeline_value' },
        { title: 'Sold property value', issuer: '', value: '', source: 'total_sold_home_value' },
        {
          title: 'Brokerage',
          issuer: profile?.professional_profile?.company_name || profile?.company_name || '',
          value: '',
          source: 'company',
        },
      ];
      visibleBlocks[credentialsIndex] = {
        ...credentialsBlock,
        data: {
          ...(credentialsBlock.data || {}),
          content: {
            ...content,
            shared_proof_metrics_version: 2,
            items: canonicalItems.map((item, index) => ({
              ...(existingCredentialItems[index] || {}),
              ...item,
            })),
          },
        },
      };
    }
  }

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

  // Seller proof layers were added after the original Seller Expert release.
  // Restore only blocks that do not exist in the published source; an explicitly
  // disabled block remains hidden until the professional enables it again.
  if (profile?.storefront_template_key === 'agent-seller-expert') {
    const essentials = profile?.brand_kit?.essentials
      || profile?.storefront_brand_kit?.essentials
      || profile?.storefront_essentials
      || {};
    const sellerProofBlocks = [
      {
        id: 'seller-performance-restored',
        type: STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE,
        anchor: STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
        data: {
          enabled: true,
          content: {
            eyebrow: 'Performance snapshot',
            heading: 'Proof behind the seller strategy',
            body: 'Verified profile and client data at a glance, presented without the sales noise.',
            items: [
              { label: 'Homes sold', value: '', detail: 'Closed seller results', source: 'closed_seller_leads' },
              { label: 'Experience', value: essentials.years_experience || '', detail: 'Local market guidance', source: 'years_experience' },
              { label: 'Client rating', value: '', detail: 'From verified feedback', source: 'rating' },
              { label: 'Available options', value: '', detail: 'Active seller leads not closed yet', source: 'available_seller_leads' },
            ],
          },
          layout: { width: 'full', columns: '4', variant: 'premium' },
        },
      },
      {
        id: 'seller-sold-results-restored',
        type: STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
        anchor: STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
        data: {
          enabled: true,
          content: {
            eyebrow: 'Recent sales',
            heading: 'Recently sold properties',
            body: 'A look at homes recently sold with a successful client outcome.',
            sold_card_layout_version: 2,
          },
          layout: { width: 'full', columns: '4', variant: 'feature-grid' },
        },
      },
      {
        id: 'seller-case-study-restored',
        type: STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY,
        anchor: STOREFRONT_BLOCK_TYPES.SERVICES,
        data: {
          enabled: true,
          content: {
            eyebrow: 'Seller success story',
            heading: 'A launch plan built around the right signals',
            body: 'A clear seller narrative connects preparation, market positioning, and offer decisions into one measurable strategy.',
            items: [
              { title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' },
              { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' },
              { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' },
            ],
          },
          layout: { width: 'full', columns: '3', variant: 'editorial' },
        },
      },
      {
        id: 'seller-credentials-restored',
        type: STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS,
        anchor: STOREFRONT_BLOCK_TYPES.ABOUT,
        data: {
          enabled: true,
          content: {
            eyebrow: 'Credentials and recognition',
            heading: 'Expertise sellers can verify',
            body: 'Professional qualifications and practical strengths that support every recommendation.',
            metrics_layout_version: 2,
            items: [
              { title: 'Clients', issuer: '', source: 'total_clients' },
              { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' },
              { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' },
              { title: 'Brokerage', issuer: profile?.professional_profile?.company_name || profile?.company_name || '', source: 'company' },
            ],
          },
          layout: { width: 'full', columns: '4', variant: 'premium' },
        },
      },
    ];

    sellerProofBlocks.forEach(({ anchor, ...proofBlock }) => {
      if (source.some((block) => block?.type === proofBlock.type)) return;
      const anchorIndex = visibleBlocks.findIndex((block) => block.type === anchor);
      visibleBlocks.splice(anchorIndex >= 0 ? anchorIndex + 1 : visibleBlocks.length, 0, proofBlock);
    });
  }

  const sharedProofTemplate = resolvedTemplateKey;
  if (['agent-luxury-advisor', 'agent-first-home', 'agent-community-expert'].includes(sharedProofTemplate)) {
    const professional = profile?.professional_profile || {};
    const essentials = profile?.brand_kit?.essentials
      || profile?.storefront_brand_kit?.essentials
      || profile?.storefront_essentials
      || {};
    const common = {
      'agent-luxury-advisor': {
        performance: {
          anchor: STOREFRONT_BLOCK_TYPES.CTA,
          content: {
            eyebrow: 'Advisory record',
            heading: 'Experience measured with discretion',
            body: 'A concise view of recent outcomes, client confidence, and market experience.',
            shared_proof_performance_version: 2,
            items: [
              { label: 'Homes sold', value: '', source: 'closed_seller_leads' },
              { label: 'Experience', value: essentials.years_experience || '', source: 'years_experience' },
              { label: 'Client rating', value: '', source: 'rating' },
              { label: 'Available options', value: '', source: 'available_seller_leads' },
            ],
          },
          layout: { columns: '4', cardStyle: 'bordered' },
        },
        sold: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE, content: { eyebrow: 'Recent distinctions', heading: 'Notable recent sales', body: 'A considered selection of properties represented through to a successful close.', sold_card_layout_version: 2 }, layout: { columns: '2' } },
        story: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS, content: { eyebrow: 'Advisory in practice', heading: 'A composed path from brief to result', body: 'Each engagement balances privacy, presentation, and negotiation around the client’s priorities.', shared_proof_case_study_version: 2, items: [{ title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' }, { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' }, { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' }] }, layout: { columns: '3', cardStyle: 'bordered' } },
        credentials: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY, content: { eyebrow: 'Credentials and recognition', heading: 'A standard clients can verify', body: 'Professional standing, global perspective, and trusted representation for consequential property decisions.', metrics_layout_version: 2, shared_proof_metrics_version: 2, items: [{ title: 'Clients', issuer: '', source: 'total_clients' }, { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' }, { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' }, { title: 'Brokerage', issuer: professional.company_name || profile?.company_name || '', source: 'company' }] }, layout: { columns: '4', cardStyle: 'bordered' } },
      },
      'agent-first-home': {
        performance: { anchor: STOREFRONT_BLOCK_TYPES.CTA, content: { eyebrow: 'A helpful starting point', heading: 'Clear guidance, backed by real context', body: 'A quick view of available homes, local coverage, client feedback, and professional experience.', shared_proof_performance_version: 2, items: [{ label: 'Homes sold', value: '', source: 'closed_seller_leads' }, { label: 'Experience', value: essentials.years_experience || '', source: 'years_experience' }, { label: 'Client rating', value: '', source: 'rating' }, { label: 'Available options', value: '', source: 'available_seller_leads' }] }, layout: { columns: '4', cardStyle: 'elevated' } },
        sold: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE, content: { eyebrow: 'Recent market outcomes', heading: 'Recently sold homes', body: 'Use recent local outcomes as practical context while planning your own search and offer.', sold_card_layout_version: 2 }, layout: { columns: '3' } },
        story: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS, content: { eyebrow: 'Your first-home plan', heading: 'From first questions to confident keys', body: 'A practical sequence that keeps every decision understandable and connected to your budget.', shared_proof_case_study_version: 2, items: [{ title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' }, { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' }, { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' }] }, layout: { columns: '3', cardStyle: 'elevated' } },
        credentials: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY, content: { eyebrow: 'Support you can trust', heading: 'Practical experience for a major first step', body: 'Professional background and communication strengths that make the process easier to understand.', metrics_layout_version: 2, shared_proof_metrics_version: 2, items: [{ title: 'Clients', issuer: '', source: 'total_clients' }, { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' }, { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' }, { title: 'Brokerage', issuer: professional.company_name || profile?.company_name || '', source: 'company' }] }, layout: { columns: '4', cardStyle: 'elevated' } },
      },
      'agent-community-expert': {
        performance: { anchor: STOREFRONT_BLOCK_TYPES.CTA, content: { eyebrow: 'Local market snapshot', heading: 'Useful context for your next local move', body: 'Recent outcomes, active opportunities, service coverage, and client feedback in one clear view.', shared_proof_performance_version: 2, items: [{ label: 'Homes sold', value: '', source: 'closed_seller_leads' }, { label: 'Experience', value: essentials.years_experience || '', source: 'years_experience' }, { label: 'Client rating', value: '', source: 'rating' }, { label: 'Available options', value: '', source: 'available_seller_leads' }] }, layout: { columns: '4', cardStyle: 'glass' } },
        sold: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE, content: { eyebrow: 'Around the neighborhood', heading: 'Recently sold homes', body: 'Recent local outcomes that add useful pricing and timing context to your next move.', sold_card_layout_version: 2 }, layout: { columns: '3' } },
        story: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS, content: { eyebrow: 'A neighborhood move story', heading: 'Local context at every decision', body: 'A clear approach connects lifestyle fit, market context, and execution into one confident move.', shared_proof_case_study_version: 2, items: [{ title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' }, { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' }, { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' }] }, layout: { columns: '3', cardStyle: 'glass' } },
        credentials: { anchor: STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY, content: { eyebrow: 'Local credentials', heading: 'Knowledge grounded in the community', body: 'Professional experience and local perspective that support every neighborhood recommendation.', metrics_layout_version: 2, shared_proof_metrics_version: 2, items: [{ title: 'Clients', issuer: '', source: 'total_clients' }, { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' }, { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' }, { title: 'Brokerage', issuer: professional.company_name || profile?.company_name || '', source: 'company' }] }, layout: { columns: '4', cardStyle: 'glass' } },
      },
    }[sharedProofTemplate];
    const proofEntries = [
      [STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE, common.performance],
      [STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS, common.sold],
      [STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY, common.story],
      [STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS, common.credentials],
    ];
    proofEntries.forEach(([type, config]) => {
      if (source.some((block) => block?.type === type)) return;
      const anchorIndex = visibleBlocks.findIndex((block) => block.type === config.anchor);
      visibleBlocks.splice(anchorIndex >= 0 ? anchorIndex + 1 : visibleBlocks.length, 0, {
        id: `${type}-restored`,
        type,
        data: {
          enabled: true,
          content: config.content,
          layout: { width: 'full', variant: 'premium', ...config.layout },
        },
      });
    });
  }

  return visibleBlocks
    .map((block, index) => ({
      id: block.id || `${block.type}-${index}`,
      ...block,
    }));
}
