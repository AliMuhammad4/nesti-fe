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
  MORTGAGE_RATES: 'mortgage-rates',
  LENDER_NETWORK: 'lender-network',
  BROKER_COMPENSATION: 'broker-compensation',
  ALTERNATIVE_LENDING: 'alternative-lending',
  PRACTICE_AREAS: 'practice-areas',
  CREDENTIALS: 'credentials',
  WHO_WE_HELP: 'who-we-help',
  DOCUMENT_CHECKLIST: 'document-checklist',
  FEE_GUIDANCE: 'fee-guidance',
  ENGAGEMENT_SCOPE: 'engagement-scope',
  PRACTICE_SNAPSHOT: 'practice-snapshot',
  PRACTICE_LOGISTICS: 'practice-logistics',
  CONSULTATION_OPTIONS: 'consultation-options',
  SELLER_PERFORMANCE: 'seller-performance',
  SELLER_SOLD_RESULTS: 'seller-sold-results',
  SELLER_CASE_STUDY: 'seller-case-study',
  SELLER_CREDENTIALS: 'seller-credentials',
  MORTGAGE_CALCULATOR: 'mortgage-calculator',
  GUIDANCE: 'guidance',
  FAQ: 'faq',
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
  lawyer: 'lawyer-newcomer',
};

export function defaultStorefrontTemplateKey(role) {
  const normalized = normalizeStorefrontRole(role);
  return DEFAULT_STOREFRONT_TEMPLATE_BY_ROLE[normalized] || `${normalized}-classic`;
}

export function isInvestorSpecialistTemplate(templateKey) {
  return String(templateKey || '').trim().toLowerCase() === 'agent-investor';
}

export function refreshLawyerClassicBlockCopy(block) {
  const content = block?.data?.content || block?.content || {};
  const updates = {};
  const normalized = (value) => String(value || '').trim().toLowerCase();

  if (
    block?.type === STOREFRONT_BLOCK_TYPES.HERO
    && ['community expert', 'real estate expert'].includes(normalized(content.eyebrow))
  ) {
    updates.eyebrow = 'Property law · Closing counsel';
  }
  if (
    block?.type === STOREFRONT_BLOCK_TYPES.CREDENTIALS
    && normalized(content.heading) === 'your attorney'
  ) {
    updates.heading = 'Your lawyer';
  }
  if (
    block?.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS
    && !String(content.eyebrow || '').trim()
    && normalized(content.heading) === 'happy clients'
  ) {
    updates.eyebrow = 'Client feedback';
  }
  if (
    block?.type === STOREFRONT_BLOCK_TYPES.CTA
    && normalized(content.eyebrow) === 'private consultation'
  ) {
    updates.eyebrow = 'Consultation request';
  }
  if (
    block?.type === STOREFRONT_BLOCK_TYPES.FOOTER
    && normalized(content.confidentiality_text) === 'professional, confidential follow-up.'
  ) {
    updates.confidentiality_text = 'Do not send confidential information until the lawyer confirms representation.';
  }
  if (!Object.keys(updates).length) return block;

  if (block?.data) {
    return {
      ...block,
      data: {
        ...block.data,
        content: { ...content, ...updates },
      },
    };
  }
  return { ...block, content: { ...content, ...updates } };
}

export function refreshBrokerClassicBlockCopy(block) {
  const content = block?.data?.content || block?.content || {};
  const updates = {};
  const normalized = (value) => String(value || '').trim().toLowerCase();

  if (
    block?.type === STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS
    && Array.isArray(content.items)
    && content.items.some((item) => ['program-car', 'program-wedding', 'program-property'].includes(item?.id))
  ) {
    updates.items = [
      { id: 'program-first-home', title: 'First-time home buyer', description: 'Plan your down payment, affordability, and pre-approval with clear guidance.', icon: 'home' },
      { id: 'program-refinance', title: 'Refinance and renewal', description: 'Review rates, equity, and payment structure before signing new terms.', icon: 'percent' },
      { id: 'program-investor', title: 'Rental and investor', description: 'Structure financing around rental income, cash flow, and portfolio goals.', icon: 'building' },
    ];
  }
  if (
    block?.type === STOREFRONT_BLOCK_TYPES.SERVICES
    && Array.isArray(content.items)
    && content.items.some((item) => ['service-credit', 'service-personal', 'service-auto'].includes(item?.id))
  ) {
    updates.eyebrow = 'Mortgage solutions';
    updates.heading = 'Advice for every stage of your mortgage';
    updates.body = 'Explore practical financing strategies backed by clear comparisons, careful preparation, and responsive support.';
    updates.items = [
      { id: 'service-purchase', title: 'Purchase financing', description: 'Compare mortgage structures and lender options for your next home.', icon: 'home' },
      { id: 'service-preapproval', title: 'Pre-approval strategy', description: 'Clarify affordability and strengthen your position before making an offer.', icon: 'shield' },
      { id: 'service-refinance', title: 'Refinance planning', description: 'Review equity, debt consolidation, and payment-improvement opportunities.', icon: 'percent' },
      { id: 'service-renewal', title: 'Mortgage renewal', description: 'Assess the market before maturity instead of accepting the first renewal offer.', icon: 'target' },
      { id: 'service-investor', title: 'Investor mortgages', description: 'Structure financing around rental income, portfolio goals, and cash flow.', icon: 'building' },
      { id: 'service-self-employed', title: 'Self-employed solutions', description: 'Present business and income documentation through suitable lender programs.', icon: 'briefcase' },
    ];
  }
  if (
    block?.type === STOREFRONT_BLOCK_TYPES.FOOTER
    && Array.isArray(content.items)
    && !content.items.some((item) => String(item?.target || '') === '#faq')
  ) {
    const nextItems = [...content.items];
    const contactIndex = nextItems.findIndex((item) => String(item?.target || '') === '#contact');
    const faqItem = { id: 'footer-faq', label: 'FAQ', target: '#faq' };
    if (contactIndex >= 0) nextItems.splice(contactIndex, 0, faqItem);
    else nextItems.push(faqItem);
    updates.items = nextItems;
  }
  if (!Object.keys(updates).length) return block;

  if (block?.data) {
    return {
      ...block,
      data: {
        ...block.data,
        content: { ...content, ...updates },
      },
    };
  }
  return { ...block, content: { ...content, ...updates } };
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
      'closing-cost-estimator',
    ].includes(block.type))
    .filter((block) => {
      if (isInvestorSpecialistTemplate(resolvedTemplateKey) && block.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS) {
        return false;
      }
      if (!block.when) return true;
      const value = profile?.[block.when];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });

  if (resolvedTemplateKey === 'lawyer-classic') {
    visibleBlocks.forEach((block, index) => {
      visibleBlocks[index] = refreshLawyerClassicBlockCopy(block);
    });
    const hasPracticeAreas = visibleBlocks.some(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
    );
    for (let index = visibleBlocks.length - 1; index >= 0; index -= 1) {
      if (hasPracticeAreas && visibleBlocks[index].type === STOREFRONT_BLOCK_TYPES.SERVICES) {
        visibleBlocks.splice(index, 1);
      }
    }
  }

  if (resolvedTemplateKey === 'mortgage_broker-classic') {
    visibleBlocks.forEach((block, index) => {
      visibleBlocks[index] = refreshBrokerClassicBlockCopy(block);
    });
  }

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

  // Keep old published Lawyer Classic data safe until it is opened and persisted
  // by the editor migration. Marked v2 data is already user-owned and must render
  // in its saved order with its saved layout and style.
  if (resolvedTemplateKey === 'lawyer-classic') {
    const legacyGuidance = visibleBlocks.find(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE,
    );
    const legacyGuidanceContent = legacyGuidance?.data?.content
      || legacyGuidance?.content
      || {};
    const legacyFaqs = Array.isArray(legacyGuidanceContent.faqs)
      ? legacyGuidanceContent.faqs
      : [];
    const classicFaqDefaults = [
      { q: 'Is this legal advice?', a: 'No. This page starts an inquiry so the lawyer can review the matter and follow up appropriately.' },
      { q: 'Can I request a contract review?', a: 'Yes. Share the agreement, conditions, and timeline so the review request arrives with useful context.' },
      { q: 'What should I send before we speak?', a: 'The property address, agreement of purchase and sale, closing date, and any title or financing documents you already have.' },
      { q: 'When should I contact a lawyer?', a: 'As soon as an offer is being drafted or a closing date is in view — earlier contact leaves more time to resolve conditions and title issues.' },
      { q: 'What happens after I submit an inquiry?', a: 'The lawyer reviews the information, checks whether the matter is a fit, and contacts you about availability and next steps.' },
      { q: 'Can legal fees be confirmed before work begins?', a: 'Yes. Once the scope is clear, the lawyer can explain the expected legal fees, disbursements, and retainer requirements.' },
    ];
    const hasLegacyDefaultFaqs = legacyFaqs.length === 4
      && classicFaqDefaults.slice(0, 4).every(
        (item, index) => String(legacyFaqs[index]?.q || '').trim() === item.q,
      );
    const standaloneFaqs = hasLegacyDefaultFaqs
      ? [...legacyFaqs, ...classicFaqDefaults.slice(4)]
      : legacyFaqs;
    const heroIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.HERO,
    );
    const heroContent = visibleBlocks[heroIndex]?.data?.content
      || visibleBlocks[heroIndex]?.content
      || {};
    const designVersion = Number(heroContent.lawyer_classic_design_version || 0);
    if (designVersion < 2) {

    const aboutIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.ABOUT,
    );
    if (aboutIndex >= 0) {
      const about = visibleBlocks[aboutIndex];
      visibleBlocks[aboutIndex] = {
        ...about,
        data: {
          ...(about.data || {}),
          layout: {
            ...(about.data?.layout || about.layout || {}),
            width: 'full',
            padding: 'none',
          },
          style: {
            ...(about.data?.style || about.style || {}),
            background: '',
            radius: 'none',
            shadow: 'none',
          },
        },
      };
    }

    const practiceAreasIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
    );
    if (practiceAreasIndex >= 0) {
      const practiceAreas = visibleBlocks[practiceAreasIndex];
      visibleBlocks[practiceAreasIndex] = {
        ...practiceAreas,
        data: {
          ...(practiceAreas.data || {}),
          layout: {
            ...(practiceAreas.data?.layout || practiceAreas.layout || {}),
            width: 'full',
            padding: 'none',
          },
          style: {
            ...(practiceAreas.data?.style || practiceAreas.style || {}),
            background: '',
            radius: 'none',
            shadow: 'none',
          },
        },
      };
    }

    const statementIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
    );
    if (statementIndex >= 0) {
      const statement = visibleBlocks[statementIndex];
      visibleBlocks[statementIndex] = {
        ...statement,
        data: {
          ...(statement.data || {}),
          layout: {
            ...(statement.data?.layout || statement.layout || {}),
            width: 'full',
            padding: 'none',
          },
          style: {
            ...(statement.data?.style || statement.style || {}),
            background: '#24211e',
            textColor: '#ffffff',
            radius: 'none',
            shadow: 'none',
          },
        },
      };
    }

    const credentialsIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.CREDENTIALS,
    );
    if (credentialsIndex >= 0) {
      const credentials = visibleBlocks[credentialsIndex];
      visibleBlocks[credentialsIndex] = {
        ...credentials,
        data: {
          ...(credentials.data || {}),
          layout: {
            ...(credentials.data?.layout || credentials.layout || {}),
            width: 'full',
            padding: 'none',
          },
          style: {
            ...(credentials.data?.style || credentials.style || {}),
            background: '',
            radius: 'none',
            shadow: 'none',
          },
        },
      };
    }

    const guidanceIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE,
    );
    if (guidanceIndex >= 0) {
      const guidance = visibleBlocks[guidanceIndex];
      const guidanceContent = guidance.data?.content || guidance.content || {};
      const existingFaqs = Array.isArray(guidanceContent.faqs) ? guidanceContent.faqs : [];
      const legacyFaqQuestions = [
        'Is this legal advice?',
        'Can I request a contract review?',
        'What should I send before we speak?',
        'When should I contact a lawyer?',
      ];
      const shouldExpandLegacyFaqs = existingFaqs.length === legacyFaqQuestions.length
        && legacyFaqQuestions.every(
          (question, index) => String(existingFaqs[index]?.q || '').trim() === question,
        );
      visibleBlocks[guidanceIndex] = {
        ...guidance,
        data: {
          ...(guidance.data || {}),
          content: {
            ...guidanceContent,
            ...(shouldExpandLegacyFaqs
              ? {
                  faqs: [
                    ...existingFaqs,
                    { q: 'What happens after I submit an inquiry?', a: 'The lawyer reviews the information, checks whether the matter is a fit, and contacts you about availability and next steps.' },
                    { q: 'Can legal fees be confirmed before work begins?', a: 'Yes. Once the scope is clear, the lawyer can explain the expected legal fees, disbursements, and retainer requirements.' },
                  ],
                }
              : {}),
          },
          layout: {
            ...(guidance.data?.layout || guidance.layout || {}),
            width: 'full',
            padding: 'none',
          },
          style: {
            ...(guidance.data?.style || guidance.style || {}),
            background: '',
            radius: 'none',
            shadow: 'none',
          },
        },
      };
    }

    const ctaIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.CTA,
    );
    if (ctaIndex >= 0) {
      const cta = visibleBlocks[ctaIndex];
      visibleBlocks[ctaIndex] = {
        ...cta,
        data: {
          ...(cta.data || {}),
          layout: {
            ...(cta.data?.layout || cta.layout || {}),
            width: 'full',
            padding: 'none',
          },
          style: {
            ...(cta.data?.style || cta.style || {}),
            background: '#d39a52',
            textColor: '#202020',
            radius: 'none',
            shadow: 'none',
          },
        },
      };
    }

    const lawyerFooterIndex = visibleBlocks.findIndex(
      (block) => block.type === STOREFRONT_BLOCK_TYPES.FOOTER,
    );
    if (lawyerFooterIndex >= 0) {
      const footer = visibleBlocks[lawyerFooterIndex];
      const footerStyle = footer.data?.style || footer.style || {};
      const legacyFooterBackground = String(footerStyle.background || '').trim().toLowerCase();
      visibleBlocks[lawyerFooterIndex] = {
        ...footer,
        data: {
          ...(footer.data || {}),
          layout: {
            ...(footer.data?.layout || footer.layout || {}),
            width: 'full',
            padding: 'none',
          },
          style: {
            ...footerStyle,
            ...(['', '#ffffff', '#f8fafc'].includes(legacyFooterBackground)
              ? { background: '#202020', textColor: '#ffffff' }
              : {}),
            radius: 'none',
            shadow: 'none',
          },
        },
      };
    }

    const pageBackgroundBlockTypes = new Set([
      STOREFRONT_BLOCK_TYPES.ABOUT,
      STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
      STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
      STOREFRONT_BLOCK_TYPES.CREDENTIALS,
      STOREFRONT_BLOCK_TYPES.GUIDANCE,
    ]);
    const legacySectionBackgrounds = new Set([
      '',
      '#ffffff',
      '#f7f7f7',
      '#f8f8f8',
      '#f8fafc',
    ]);
    visibleBlocks.forEach((candidate, index) => {
      if (!pageBackgroundBlockTypes.has(candidate.type)) return;
      const sectionStyle = candidate.data?.style || candidate.style || {};
      const sectionBackground = String(sectionStyle.background || '').trim().toLowerCase();
      if (!legacySectionBackgrounds.has(sectionBackground)) return;
      visibleBlocks[index] = {
        ...candidate,
        data: {
          ...(candidate.data || {}),
          style: {
            ...sectionStyle,
            background: '',
          },
        },
      };
    });

    const heroLayout = visibleBlocks[heroIndex]?.data?.layout
      || visibleBlocks[heroIndex]?.layout
      || {};
    if (
      heroIndex >= 0
      && ['', 'fade'].includes(String(heroLayout.animationType || '').trim().toLowerCase())
    ) {
      const hero = visibleBlocks[heroIndex];
      visibleBlocks[heroIndex] = {
        ...hero,
        data: {
          ...(hero.data || {}),
          layout: {
            ...heroLayout,
            animationType: 'slide-left',
            animationTrigger: 'load',
            animationDuration: 'slow',
            animationIntensity: 'medium',
          },
        },
      };
    }
      const additions = [
        {
          id: 'lawyer-classic-hero-restored',
          type: STOREFRONT_BLOCK_TYPES.HERO,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Property law · Closing counsel',
              heading: profile?.headline || 'Tell us about your matter.',
              body: profile?.tagline || 'Clear legal guidance for contracts, title matters, purchases, sales, and closing day.',
              primary_cta_label: 'Submit inquiry',
              cta_label: 'Make an appointment',
              lawyer_classic_design_version: 2,
            },
            layout: {
              width: 'full',
              mediaPosition: 'background',
              animationType: 'slide-left',
              animationTrigger: 'load',
              animationDuration: 'slow',
              animationDelay: '0',
              animationIntensity: 'medium',
            },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-about-restored',
          type: STOREFRONT_BLOCK_TYPES.ABOUT,
          data: {
            enabled: true,
            content: {
              eyebrow: 'About the practice',
              heading: `About ${profile?.professional_name || 'your lawyer'}`,
              body: profile?.about || 'Practical legal counsel focused on protecting your transaction, documents, title, and closing timeline.',
            },
            layout: { width: 'full', padding: 'none', animationType: 'slide-left', animationDuration: 'slow' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-who-we-help-restored',
          type: STOREFRONT_BLOCK_TYPES.WHO_WE_HELP,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Who we help',
              heading: 'Counsel for every side of the transaction',
              body: 'Buyers, sellers, refinancers, and property owners can start with a structured inquiry.',
              items: [
                { title: 'Home buyers', description: 'Review the agreement, conditions, title, and closing timeline before you commit.' },
                { title: 'Home sellers', description: 'Clarify obligations, closing funds, discharge, and registration requirements.' },
                { title: 'Refinancing', description: 'Coordinate lender requirements, payout statements, and registration with a clear file.' },
                { title: 'Investors and transfers', description: 'Organize ownership, title, and closing questions around the property at hand.' },
              ],
            },
            layout: { width: 'full', padding: 'none', columns: '4', animationType: 'slide-up', animationDuration: 'medium' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-expertise-restored',
          type: STOREFRONT_BLOCK_TYPES.EXPERTISE,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Practice snapshot',
              heading: 'Where counsel is focused',
              body: 'A concise view of specializations, markets, and languages available for consultation.',
              process_label: 'How representation starts',
              process_heading: 'A clear path before any file is opened',
              process_body: 'This is an inquiry process, not legal advice or a promise of representation.',
            },
            layout: { width: 'full', padding: 'none', animationType: 'slide-up', animationDuration: 'medium' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-practice-areas-restored',
          type: STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Legal services',
              heading: 'Our practice areas',
              body: 'Focused legal support for real estate decisions, documents, ownership, financing, and closing.',
              items: [
                { title: 'Residential Closings', description: 'Purchase and sale guidance from agreement through registration.' },
                { title: 'Commercial Real Estate', description: 'Practical support for commercial property transactions and documents.' },
                { title: 'Contract Review', description: 'Understand key obligations, conditions, timelines, and legal risks.' },
                { title: 'Title & Ownership', description: 'Resolve title, transfer, registration, and ownership concerns.' },
                { title: 'Refinancing', description: 'Coordinate lender requirements, payout statements, and registration.' },
                { title: 'Property Disputes', description: 'Organize the facts and identify an appropriate legal next step.' },
              ],
            },
            layout: { width: 'full', padding: 'none', columns: '3', animationType: 'slide-up', animationDuration: 'medium' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-documents-restored',
          type: STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST,
          data: {
            enabled: true,
            content: {
              eyebrow: 'File preparation',
              heading: 'What to send before we speak',
              body: 'A complete file helps the lawyer understand the matter without asking you to repeat the basics.',
              helper_text: 'Send copies, not originals, until representation is confirmed.',
              items: [
                { title: 'Agreement of purchase and sale', description: 'The signed offer, amendments, and any waivers or notices already exchanged.' },
                { title: 'Identification and parties', description: 'Legal names, contact details, and how title should be taken if that is already decided.' },
                { title: 'Financing documents', description: 'Mortgage commitment, payout statement, or private lending details if they exist.' },
                { title: 'Property and title papers', description: 'Listing details, survey, status certificate, or prior title documents you already have.' },
              ],
            },
            layout: { width: 'full', padding: 'none', columns: '2', animationType: 'slide-up', animationDuration: 'medium' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-fees-restored',
          type: STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Fee transparency',
              heading: 'How legal fees are typically framed',
              body: 'Use this as orientation before a consultation. It is not a quote, retainer, or promise of representation.',
              items: [
                { title: 'Legal fee range', description: 'Professional time for review, correspondence, signing, and registration is quoted for the specific matter.' },
                { title: 'Disbursements', description: 'Title search, registration, courier, and government charges are typically billed in addition to legal fees.' },
                { title: 'Land transfer and tax', description: 'Purchase files may include land transfer tax and related provincial charges. Final amounts depend on the transaction.' },
              ],
            },
            layout: { width: 'full', padding: 'none', columns: '3', animationType: 'fade', animationDuration: 'slow' },
            style: { background: '#24211e', textColor: '#ffffff', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-statement-restored',
          type: STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Legal transaction support',
              heading: 'Clear advice before you sign or close.',
              body: 'Understand the documents, deadlines, and legal risks before the transaction moves forward.',
              cta_label: 'Discuss your matter',
              highlights: [
                { title: 'Contract questions', text: 'Capture document review, agreement, condition, amendment, or clause concerns with context.' },
                { title: 'Closing preparation', text: 'Help visitors explain where they are in the transaction and what timeline they are working toward.' },
                { title: 'Title and transfer support', text: 'Route title, refinance, transfer, and closing service needs into a clearer legal intake.' },
              ],
            },
            layout: {
              width: 'full',
              columns: '2',
              animationType: 'fade',
              animationTrigger: 'scroll',
              animationDuration: 'slow',
              animationDelay: '0',
              animationIntensity: 'subtle',
            },
            style: { background: '#24211e', textColor: '#ffffff', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-consultation-restored',
          type: STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Start the conversation',
              heading: 'Choose how you would like to begin',
              body: 'Pick the path that matches your timeline. Confidential details should wait until the lawyer confirms representation.',
              items: [
                { title: 'Send an inquiry', description: 'Share the property, documents, and closing date so the first response is useful.', cta_label: 'Submit inquiry', action: 'inquiry' },
                { title: 'Book a consultation', description: 'Request time to walk through the agreement, title issues, or closing requirements.', cta_label: 'Make an appointment', action: 'appointment' },
                { title: 'Request document review', description: 'Ask for a focused review of a contract, amendment, or closing package.', cta_label: 'Request review', action: 'inquiry' },
              ],
            },
            layout: { width: 'full', padding: 'none', columns: '3', animationType: 'slide-up', animationDuration: 'medium' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-testimonials-restored',
          type: STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Client feedback',
              heading: 'Happy clients',
              body: 'Buyers, sellers, and property owners who moved forward with confidence.',
            },
            layout: { width: 'full', animationType: 'slide-up', animationDuration: 'medium', animationIntensity: 'subtle' },
            style: { background: '', textColor: '', radius: 'default', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-credentials-restored',
          type: STOREFRONT_BLOCK_TYPES.CREDENTIALS,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Professional standing',
              heading: 'Your lawyer',
              body: 'Current practice activity and experience at a glance.',
            },
            layout: { width: 'full', padding: 'none', columns: '4', animationType: 'slide-up', animationDuration: 'medium' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-guidance-restored',
          type: STOREFRONT_BLOCK_TYPES.GUIDANCE,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Legal insights',
              heading: 'Your closing guide',
              body: 'A practical path from accepted offer to final registration and keys.',
              steps: [
                { title: 'Review the transaction', text: 'Share the property, agreement, financing, and closing timeline.' },
                { title: 'Resolve legal requirements', text: 'Identify document, title, registration, and signing requirements early.' },
                { title: 'Prepare for closing', text: 'Complete the final review, funds, signatures, and registration with clarity.' },
              ],
            },
            layout: { width: 'full', padding: 'none', columns: '3', animationType: 'slide-up', animationDuration: 'medium' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-faq-restored',
          type: STOREFRONT_BLOCK_TYPES.FAQ,
          data: {
            enabled: true,
            content: {
              eyebrow: legacyGuidanceContent.faq_label || 'Helpful questions',
              heading: legacyGuidanceContent.faq_heading || 'What clients often ask',
              body: 'Clear answers to common questions before you start.',
              faqs: standaloneFaqs.length ? standaloneFaqs : [
                { q: 'Is this legal advice?', a: 'No. This page starts an inquiry so the lawyer can review the matter and follow up appropriately.' },
                { q: 'Can I request a contract review?', a: 'Yes. Share the agreement, conditions, and timeline so the review request arrives with useful context.' },
                { q: 'What should I send before we speak?', a: 'The property address, agreement of purchase and sale, closing date, and any title or financing documents you already have.' },
                { q: 'When should I contact a lawyer?', a: 'As soon as an offer is being drafted or a closing date is in view — earlier contact leaves more time to resolve conditions and title issues.' },
                { q: 'What happens after I submit an inquiry?', a: 'The lawyer reviews the information, checks whether the matter is a fit, and contacts you about availability and next steps.' },
                { q: 'Can legal fees be confirmed before work begins?', a: 'Yes. Once the scope is clear, the lawyer can explain the expected legal fees, disbursements, and retainer requirements.' },
              ],
            },
            layout: { width: 'full', padding: 'none', columns: '2', animationType: 'slide-up', animationDuration: 'medium' },
            style: { background: '', textColor: '', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-cta-restored',
          type: STOREFRONT_BLOCK_TYPES.CTA,
          data: {
            enabled: true,
            content: {
              eyebrow: 'Consultation request',
              heading: 'If you need legal guidance, we are available.',
              body: 'Book a consultation or send the transaction details for a focused response.',
              cta_label: 'Get consultation',
              secondary_cta_label: 'Send inquiry',
            },
            layout: { width: 'full', padding: 'none', animationType: 'fade', animationDuration: 'medium' },
            style: { background: '#d39a52', textColor: '#202020', radius: 'none', shadow: 'none' },
          },
        },
        {
          id: 'lawyer-classic-footer-restored',
          type: STOREFRONT_BLOCK_TYPES.FOOTER,
          data: {
            enabled: true,
            content: {
              heading: profile?.professional_name || '',
              body: 'Real estate legal guidance for contracts, title matters, transactions, and closing.',
              items: [
                { label: 'About', target: '#about' },
                { label: 'Who we help', target: '#clients' },
                { label: 'Practice areas', target: '#services' },
                { label: 'Documents', target: '#documents' },
                { label: 'Closing guide', target: '#guidance' },
              ],
            },
            layout: {
              width: 'full',
              columns: '3',
              animationType: 'fade',
              animationTrigger: 'scroll',
              animationDuration: 'medium',
              animationDelay: '0',
              animationIntensity: 'subtle',
            },
            style: { background: '#202020', textColor: '#ffffff', radius: 'none', shadow: 'none' },
          },
        },
      ];

      additions.forEach((block) => {
        if (!source.some((candidate) => candidate?.type === block.type)) {
          visibleBlocks.push(block);
        }
      });

      // Practice areas are the canonical legal-services presentation in v2.
      // Older role presets also added a generic Services block, which otherwise
      // survives after the footer and duplicates the same offerings.
      const hasPracticeAreas = visibleBlocks.some(
        (block) => block.type === STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
      );
      if (hasPracticeAreas) {
        for (let index = visibleBlocks.length - 1; index >= 0; index -= 1) {
          if (visibleBlocks[index].type === STOREFRONT_BLOCK_TYPES.SERVICES) {
            visibleBlocks.splice(index, 1);
          }
        }
      }

      const canonicalOrder = [
        STOREFRONT_BLOCK_TYPES.HERO,
        STOREFRONT_BLOCK_TYPES.ABOUT,
        STOREFRONT_BLOCK_TYPES.WHO_WE_HELP,
        STOREFRONT_BLOCK_TYPES.EXPERTISE,
        STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
        STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST,
        STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE,
        STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
        STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS,
        STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
        STOREFRONT_BLOCK_TYPES.CREDENTIALS,
        STOREFRONT_BLOCK_TYPES.GUIDANCE,
        STOREFRONT_BLOCK_TYPES.FAQ,
        STOREFRONT_BLOCK_TYPES.CTA,
        STOREFRONT_BLOCK_TYPES.FOOTER,
      ];
      const rank = new Map(canonicalOrder.map((type, index) => [type, index]));
      visibleBlocks.sort((left, right) => (
        (rank.get(left.type) ?? canonicalOrder.length)
        - (rank.get(right.type) ?? canonicalOrder.length)
      ));

      const migratedHeroIndex = visibleBlocks.findIndex(
        (block) => block.type === STOREFRONT_BLOCK_TYPES.HERO,
      );
      if (migratedHeroIndex >= 0) {
        const hero = visibleBlocks[migratedHeroIndex];
        const migratedHeroContent = hero.data?.content || hero.content || {};
        const legacyEyebrow = String(migratedHeroContent.eyebrow || '').trim().toLowerCase();
        visibleBlocks[migratedHeroIndex] = {
          ...hero,
          data: {
            ...(hero.data || {}),
            content: {
              ...migratedHeroContent,
              ...(['community expert', 'real estate expert'].includes(legacyEyebrow)
                ? { eyebrow: 'Property law · Closing counsel' }
                : {}),
              lawyer_classic_design_version: 2,
            },
          },
        };
      }
    }

    [
      { type: STOREFRONT_BLOCK_TYPES.WHO_WE_HELP, after: STOREFRONT_BLOCK_TYPES.ABOUT, columns: '4' },
      { type: STOREFRONT_BLOCK_TYPES.EXPERTISE, after: STOREFRONT_BLOCK_TYPES.WHO_WE_HELP },
      { type: STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST, after: STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS, columns: '2' },
      {
        type: STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE,
        after: STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST,
        columns: '3',
        style: { background: '#24211e', textColor: '#ffffff' },
      },
      { type: STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS, after: STOREFRONT_BLOCK_TYPES.ROLE_DETAILS, columns: '3' },
      {
        type: STOREFRONT_BLOCK_TYPES.FAQ,
        after: STOREFRONT_BLOCK_TYPES.GUIDANCE,
        columns: '2',
        content: {
          eyebrow: legacyGuidanceContent.faq_label || 'Helpful questions',
          heading: legacyGuidanceContent.faq_heading || 'What clients often ask',
          body: 'Clear answers to common questions before you start.',
          ...(standaloneFaqs.length ? { faqs: standaloneFaqs } : {}),
        },
      },
    ].forEach(({ type, after, columns, style, content }) => {
      if (visibleBlocks.some((block) => block.type === type)) return;
      const afterIndex = visibleBlocks.findIndex((block) => block.type === after);
      visibleBlocks.splice(afterIndex >= 0 ? afterIndex + 1 : Math.max(visibleBlocks.length - 1, 1), 0, {
        id: `lawyer-classic-${type}-restored`,
        type,
        data: {
          enabled: true,
          content: content || {},
          layout: {
            width: 'full',
            padding: 'none',
            animationType: 'slide-up',
            animationDuration: 'medium',
            ...(columns ? { columns } : {}),
          },
          style: {
            background: '',
            textColor: '',
            radius: 'none',
            shadow: 'none',
            ...(style || {}),
          },
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
