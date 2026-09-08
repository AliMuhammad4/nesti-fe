import { STOREFRONT_BLOCK_TYPES, normalizeStorefrontRole } from '../storefrontPresets';
import { FIRST_HOME_ROADMAP_LIMIT } from '../storefrontLimits';
import { SERVICE_BENEFIT_FIELDS } from '../renderers/variants/broker/classic/brokerClassicServiceBenefits';

export const BLOCK_LIBRARY = {
  shared: [
    STOREFRONT_BLOCK_TYPES.HERO,
    STOREFRONT_BLOCK_TYPES.ABOUT,
    STOREFRONT_BLOCK_TYPES.SERVICES,
    STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
    STOREFRONT_BLOCK_TYPES.EXPERTISE,
    STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
    STOREFRONT_BLOCK_TYPES.GUIDANCE,
    STOREFRONT_BLOCK_TYPES.CTA,
  ],
  agent: [
    STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
  ],
  'agent-seller-expert': [
    STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE,
    STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
    STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY,
    STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS,
  ],
  'agent-luxury-advisor': [
    STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE,
    STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
    STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY,
    STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS,
  ],
  'agent-first-home': [
    STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE,
    STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
    STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY,
    STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS,
  ],
  'agent-community-expert': [
    STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE,
    STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
    STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY,
    STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS,
  ],
  mortgage_broker: [
    STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS,
    STOREFRONT_BLOCK_TYPES.MORTGAGE_RATES,
    STOREFRONT_BLOCK_TYPES.MORTGAGE_CALCULATOR,
    STOREFRONT_BLOCK_TYPES.LENDER_NETWORK,
    STOREFRONT_BLOCK_TYPES.ALTERNATIVE_LENDING,
    STOREFRONT_BLOCK_TYPES.BROKER_COMPENSATION,
    STOREFRONT_BLOCK_TYPES.PRACTICE_SNAPSHOT,
    STOREFRONT_BLOCK_TYPES.CREDENTIALS,
    STOREFRONT_BLOCK_TYPES.FAQ,
  ],
  lawyer: [
    STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
    STOREFRONT_BLOCK_TYPES.CREDENTIALS,
    STOREFRONT_BLOCK_TYPES.WHO_WE_HELP,
    STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST,
    STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE,
    STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS,
  ],
};

export const LAWYER_CLASSIC_CANONICAL_BLOCK_ORDER = [
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

export const LAWYER_FIRST_HOME_CANONICAL_BLOCK_ORDER = [
  STOREFRONT_BLOCK_TYPES.HERO,
  STOREFRONT_BLOCK_TYPES.WHO_WE_HELP,
  STOREFRONT_BLOCK_TYPES.ABOUT,
  STOREFRONT_BLOCK_TYPES.PRACTICE_SNAPSHOT,
  STOREFRONT_BLOCK_TYPES.SERVICES,
  STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
  STOREFRONT_BLOCK_TYPES.EXPERTISE,
  STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
  STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST,
  STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE,
  STOREFRONT_BLOCK_TYPES.ENGAGEMENT_SCOPE,
  STOREFRONT_BLOCK_TYPES.GUIDANCE,
  STOREFRONT_BLOCK_TYPES.CREDENTIALS,
  STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
  STOREFRONT_BLOCK_TYPES.FAQ,
  STOREFRONT_BLOCK_TYPES.PRACTICE_LOGISTICS,
  STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS,
  STOREFRONT_BLOCK_TYPES.CTA,
  STOREFRONT_BLOCK_TYPES.FOOTER,
];

export const LAWYER_INVESTOR_CANONICAL_BLOCK_ORDER = [
  STOREFRONT_BLOCK_TYPES.HERO,
  STOREFRONT_BLOCK_TYPES.ABOUT,
  STOREFRONT_BLOCK_TYPES.PRACTICE_SNAPSHOT,
  STOREFRONT_BLOCK_TYPES.SERVICES,
  STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
  STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
  STOREFRONT_BLOCK_TYPES.GUIDANCE,
  STOREFRONT_BLOCK_TYPES.CREDENTIALS,
  STOREFRONT_BLOCK_TYPES.CTA,
  STOREFRONT_BLOCK_TYPES.FOOTER,
];

export const LAWYER_NEWCOMER_CANONICAL_BLOCK_ORDER = [
  STOREFRONT_BLOCK_TYPES.HERO,
  STOREFRONT_BLOCK_TYPES.ABOUT,
  STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
  STOREFRONT_BLOCK_TYPES.SERVICES,
  STOREFRONT_BLOCK_TYPES.GUIDANCE,
  STOREFRONT_BLOCK_TYPES.CREDENTIALS,
  STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
  STOREFRONT_BLOCK_TYPES.CTA,
  STOREFRONT_BLOCK_TYPES.FOOTER,
];

export const BROKER_CLASSIC_CANONICAL_BLOCK_ORDER = [
  STOREFRONT_BLOCK_TYPES.HERO,
  STOREFRONT_BLOCK_TYPES.ABOUT,
  STOREFRONT_BLOCK_TYPES.PRACTICE_SNAPSHOT,
  STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS,
  STOREFRONT_BLOCK_TYPES.SERVICES,
  STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
  STOREFRONT_BLOCK_TYPES.BROKER_COMPENSATION,
  STOREFRONT_BLOCK_TYPES.FAQ,
  STOREFRONT_BLOCK_TYPES.CTA,
  STOREFRONT_BLOCK_TYPES.FOOTER,
];

export const BROKER_RENEWAL_CANONICAL_BLOCK_ORDER = [
  STOREFRONT_BLOCK_TYPES.HERO,
  STOREFRONT_BLOCK_TYPES.PRACTICE_SNAPSHOT,
  STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS,
  STOREFRONT_BLOCK_TYPES.SERVICES,
  STOREFRONT_BLOCK_TYPES.ABOUT,
  STOREFRONT_BLOCK_TYPES.GUIDANCE,
  STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
  STOREFRONT_BLOCK_TYPES.FAQ,
  STOREFRONT_BLOCK_TYPES.CTA,
  STOREFRONT_BLOCK_TYPES.FOOTER,
];

export const BROKER_FIRST_HOME_CANONICAL_BLOCK_ORDER = [
  STOREFRONT_BLOCK_TYPES.HERO,
  STOREFRONT_BLOCK_TYPES.PRACTICE_SNAPSHOT,
  STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS,
  STOREFRONT_BLOCK_TYPES.SERVICES,
  STOREFRONT_BLOCK_TYPES.ABOUT,
  STOREFRONT_BLOCK_TYPES.GUIDANCE,
  STOREFRONT_BLOCK_TYPES.MORTGAGE_RATES,
  STOREFRONT_BLOCK_TYPES.MORTGAGE_CALCULATOR,
  STOREFRONT_BLOCK_TYPES.LENDER_NETWORK,
  STOREFRONT_BLOCK_TYPES.BROKER_COMPENSATION,
  STOREFRONT_BLOCK_TYPES.ALTERNATIVE_LENDING,
  STOREFRONT_BLOCK_TYPES.CREDENTIALS,
  STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
  STOREFRONT_BLOCK_TYPES.FAQ,
  STOREFRONT_BLOCK_TYPES.CTA,
  STOREFRONT_BLOCK_TYPES.FOOTER,
];

function canonicalBlockOrderForTemplate(templateKey = '') {
  const key = String(templateKey || '').trim().toLowerCase();
  if (key === 'lawyer-classic') return LAWYER_CLASSIC_CANONICAL_BLOCK_ORDER;
  if (key === 'lawyer-first-home-closing') return LAWYER_FIRST_HOME_CANONICAL_BLOCK_ORDER;
  if (key === 'lawyer-investor') return LAWYER_INVESTOR_CANONICAL_BLOCK_ORDER;
  if (key === 'lawyer-newcomer') return LAWYER_NEWCOMER_CANONICAL_BLOCK_ORDER;
  if (key === 'mortgage_broker-classic') return BROKER_CLASSIC_CANONICAL_BLOCK_ORDER;
  if (key === 'mortgage_broker-renewal') return BROKER_RENEWAL_CANONICAL_BLOCK_ORDER;
  if (key === 'mortgage_broker-first-home') return BROKER_FIRST_HOME_CANONICAL_BLOCK_ORDER;
  return null;
}

const ALWAYS_SINGLETON_BLOCK_TYPES = new Set([
  STOREFRONT_BLOCK_TYPES.HERO,
  STOREFRONT_BLOCK_TYPES.FOOTER,
]);
const PROTECTED_BLOCK_TYPES = new Set([
  STOREFRONT_BLOCK_TYPES.HERO,
  STOREFRONT_BLOCK_TYPES.FOOTER,
]);

export function isSingletonBlockType(type, templateKey = '') {
  if (ALWAYS_SINGLETON_BLOCK_TYPES.has(type)) return true;
  if (String(templateKey || '').trim().toLowerCase() === 'lawyer-investor') return false;
  return Boolean(canonicalBlockOrderForTemplate(templateKey)?.includes(type));
}

export function isProtectedBlockType(type) {
  return PROTECTED_BLOCK_TYPES.has(type);
}

export function insertBlockAtTemplateRank(blocks = [], block, templateKey = '') {
  const next = [...blocks];
  const canonicalOrder = canonicalBlockOrderForTemplate(templateKey);
  if (!canonicalOrder) {
    const footerIndex = next.findIndex((item) => item.type === STOREFRONT_BLOCK_TYPES.FOOTER);
    next.splice(footerIndex >= 0 ? footerIndex : next.length, 0, block);
    return next;
  }

  const rank = new Map(canonicalOrder.map((type, index) => [type, index]));
  const blockRank = rank.get(block?.type);
  if (blockRank == null) {
    const footerIndex = next.findIndex((item) => item.type === STOREFRONT_BLOCK_TYPES.FOOTER);
    next.splice(footerIndex >= 0 ? footerIndex : next.length, 0, block);
    return next;
  }
  const insertionIndex = next.findIndex((item) => {
    const itemRank = rank.get(item?.type);
    return itemRank != null && itemRank > blockRank;
  });
  next.splice(insertionIndex >= 0 ? insertionIndex : next.length, 0, block);
  return next;
}

export function labelForBlock(type) {
  const overrides = {
    cta: 'CTA',
    faq: 'FAQ',
    'seller-performance': 'Performance',
    'seller-sold-results': 'Sold homes',
    'seller-case-study': 'Success story',
    'seller-credentials': 'Credentials',
    'featured-listings': 'Listings',
    'who-we-help': 'Who we help',
    'document-checklist': 'Documents',
    'fee-guidance': 'Legal fees',
    'engagement-scope': 'Scope',
    'practice-snapshot': 'Snapshot',
    'practice-logistics': 'Access',
    'consultation-options': 'How to start',
    'mortgage-rates': 'Mortgage rates',
    'mortgage-calculator': 'Calculator',
    'lender-network': 'Lender network',
    'broker-compensation': 'Compensation',
    'alternative-lending': 'Alternative lending',
  };
  const key = String(type || 'block').toLowerCase();
  if (overrides[key]) return overrides[key];
  return key
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function createContentItemId() {
  return `item-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
}

/** Turn pipe-strings / partial records into objects with stable ids (never random). */
export function coerceCollectionItems(collection, items = []) {
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  const uniqueId = (preferred, prefix, index) => {
    const base = preferred || `${prefix}-${index}`;
    if (!seen.has(base)) {
      seen.add(base);
      return base;
    }
    let suffix = 1;
    let next = `${base}-${suffix}`;
    while (seen.has(next)) {
      suffix += 1;
      next = `${base}-${suffix}`;
    }
    seen.add(next);
    return next;
  };

  if (collection === 'steps' || collection === 'process_steps') {
    return items
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === 'string') {
          const [title = '', text = ''] = item.split('|').map((part) => part.trim());
          return {
            id: uniqueId(`fallback-step-${index}`, 'fallback-step', index),
            title,
            text,
            icon: '',
          };
        }
        if (typeof item !== 'object') return null;
        return {
          ...item,
          id: uniqueId(item.id, 'fallback-step', index),
          title: item.title || '',
          icon: item.icon || '',
          text: item.text ?? item.description ?? '',
        };
      })
      .filter(Boolean)
      .slice(0, collection === 'process_steps' ? FIRST_HOME_ROADMAP_LIMIT : 8);
  }

  if (collection === 'faqs') {
    return items
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === 'string') {
          const [q = '', a = ''] = item.split('|').map((part) => part.trim());
          return {
            id: uniqueId(`fallback-faq-${index}`, 'fallback-faq', index),
            q,
            a,
          };
        }
        if (typeof item !== 'object') return null;
        return {
          ...item,
          id: uniqueId(item.id, 'fallback-faq', index),
          q: item.q || '',
          a: item.a || '',
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  if (collection === 'items' || collection === 'services') {
    return items
      .map((item, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        return {
          ...item,
          id: uniqueId(item.id, 'fallback-service', index),
          title: item.title ?? item.name ?? '',
          description: item.description ?? item.text ?? '',
          rate: item.rate ?? item.value ?? '',
          category: item.category ?? item.group ?? '',
          domain: item.domain ?? item.website ?? '',
          website: item.website ?? item.domain ?? '',
          icon: item.icon || '',
          background: item.background ?? item.card_background ?? '',
          text_color: item.text_color ?? item.card_text_color ?? '',
          icon_background: item.icon_background ?? '',
          icon_color: item.icon_color ?? '',
        };
      })
      .filter((item) => item && (item.title || item.label))
      .slice(0, 24);
  }

  if (collection === 'highlights') {
    return items
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === 'string') {
          const [title = '', text = ''] = item.split('|').map((part) => part.trim());
          if (!title) return null;
          return {
            id: uniqueId(`fallback-highlight-${index}`, 'fallback-highlight', index),
            title,
            text,
            icon: '',
            background: '',
            text_color: '',
          };
        }
        if (typeof item !== 'object') return null;
        const title = item.title || '';
        if (!title) return null;
        return {
            ...item,
            id: uniqueId(item.id, 'fallback-highlight', index),
            title,
            text: item.text || '',
            icon: item.icon || '',
            background: item.background || '',
            text_color: item.text_color || '',
          };
      })
      .filter(Boolean)
      .slice(0, 6);
  }

  if (collection === 'proof') {
    return items
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === 'string') {
          const text = item.trim();
          if (!text) return null;
          return {
            id: uniqueId(`fallback-proof-${index}`, 'fallback-proof', index),
            text,
            background: '',
            text_color: '',
          };
        }
        if (typeof item !== 'object') return null;
        const text = String(item.text || item.title || '').trim();
        if (!text) return null;
        return {
          ...item,
          id: uniqueId(item.id, 'fallback-proof', index),
          text,
          background: item.background || '',
          text_color: item.text_color || '',
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  return items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
    return { ...item, id: uniqueId(item.id, `item-${collection || 'row'}`, index) };
  });
}

function coerceGuidanceContent(content = {}) {
  const next = { ...content };
  if (Array.isArray(content.steps)) next.steps = coerceCollectionItems('steps', content.steps);
  if (Array.isArray(content.faqs)) next.faqs = coerceCollectionItems('faqs', content.faqs);
  // Legacy per-badge colors — brand primary is the source of truth now.
  delete next.process_badge_background;
  delete next.process_badge_color;
  return next;
}

function coerceServicesContent(content = {}) {
  const next = { ...content };
  if (Array.isArray(content.items)) next.items = coerceCollectionItems('items', content.items);
  // Nested panel colors removed — section Style background is the single surface.
  delete next.panel_background;
  delete next.panel_text_color;
  return next;
}

function coerceRoleDetailsContent(content = {}) {
  const next = { ...content };
  if (Array.isArray(content.highlights)) next.highlights = coerceCollectionItems('highlights', content.highlights);
  if (Array.isArray(content.proof)) next.proof = coerceCollectionItems('proof', content.proof);
  return next;
}

function withContentItemIds(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return withContentItemIds(item);
      return {
        ...Object.fromEntries(Object.entries(item).map(([key, child]) => [key, withContentItemIds(child)])),
        // Keep existing ids; only fill missing ones with a stable index-based id.
        id: item.id || `item-${index}`,
      };
    });
  }
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, withContentItemIds(child)]));
}

export function rekeyContentItems(content = {}) {
  const rekey = (value) => {
    if (Array.isArray(value)) return value.map(rekey);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      key === 'id' ? createContentItemId() : rekey(child),
    ]));
  };
  return rekey(content);
}

export function resolveContentItem(content = {}, selection) {
  if (!selection?.collection || !selection?.itemId) return null;
  const items = content[selection.collection];
  if (!Array.isArray(items)) return null;
  const index = items.findIndex((item) => item?.id === selection.itemId);
  return index < 0 ? null : { item: items[index], index };
}

export function updateContentItem(content = {}, selection, patch) {
  const resolved = resolveContentItem(content, selection);
  if (!resolved) return content;
  const isServiceCollection = selection.collection === 'items' || selection.collection === 'services';
  const isHighlightCollection = selection.collection === 'highlights';
  const isProofCollection = selection.collection === 'proof';
  return {
    ...content,
    [selection.collection]: content[selection.collection].map((item, index) => {
      if (index !== resolved.index) return item;
      const next = { ...item, ...patch };
      if (isServiceCollection) {
        const benefitPatch = SERVICE_BENEFIT_FIELDS.reduce((acc, key) => {
          if (next[key] != null) acc[key] = next[key];
          else if (item[key] != null) acc[key] = item[key];
          return acc;
        }, {});
        return {
          ...next,
          ...benefitPatch,
          id: next.id || createContentItemId(),
          title: next.title ?? '',
          description: next.description ?? '',
          rate: next.rate ?? '',
          category: next.category ?? '',
          domain: next.domain ?? next.website ?? '',
          website: next.website ?? next.domain ?? '',
          icon: next.icon || '',
          background: next.background ?? '',
          text_color: next.text_color ?? '',
          icon_background: next.icon_background ?? '',
          icon_color: next.icon_color ?? '',
          url: next.url ?? next.href ?? '',
        };
      }
      if (isHighlightCollection) {
        return {
          ...next,
          id: next.id || createContentItemId(),
          title: next.title ?? '',
          text: next.text ?? '',
          icon: next.icon || '',
          background: next.background ?? '',
          text_color: next.text_color ?? '',
        };
      }
      if (isProofCollection) {
        return {
          ...next,
          id: next.id || createContentItemId(),
          text: next.text ?? next.title ?? '',
          background: next.background ?? '',
          text_color: next.text_color ?? '',
        };
      }
      return next;
    }),
  };
}

export function removeContentItem(content = {}, selection) {
  const resolved = resolveContentItem(content, selection);
  if (!resolved) return { content, nextItemId: null };
  const nextItems = content[selection.collection].filter((_, index) => index !== resolved.index);
  const nextItem = nextItems[resolved.index] || nextItems[resolved.index - 1] || null;
  return {
    content: { ...content, [selection.collection]: nextItems },
    nextItemId: nextItem?.id || null,
  };
}

const DEFAULT_CONTENT = {
  [STOREFRONT_BLOCK_TYPES.HERO]: { heading: '', cta_label: 'Book a Free Consultation' },
  [STOREFRONT_BLOCK_TYPES.ABOUT]: {
    heading: 'About',
    eyebrow: 'About',
    body: '',
    seller_about_layout_version: 2,
  },
  [STOREFRONT_BLOCK_TYPES.SERVICES]: { heading: 'Services', eyebrow: 'Capabilities', body: 'Personalized support designed around your next decision.' },
  [STOREFRONT_BLOCK_TYPES.TESTIMONIALS]: { heading: 'Client stories', body: 'Outcomes from people who worked with this professional.' },
  [STOREFRONT_BLOCK_TYPES.CTA]: {
    heading: 'Ready for the next step?',
    body: 'Share your goals and get a clear plan.',
    cta_label: 'Ask about availability',
    secondary_cta_label: 'Send detailed inquiry',
    helper_text: '',
  },
  [STOREFRONT_BLOCK_TYPES.MORTGAGE_CALCULATOR]: {
    heading: 'Estimate your payment, then get options',
    eyebrow: 'Mortgage calculator',
    body: 'Use this planner to explore an illustrative payment range, then request a personalized mortgage review.',
    cta_label: 'Get My Mortgage Options',
  },
  [STOREFRONT_BLOCK_TYPES.MORTGAGE_RATES]: {
    eyebrow: 'Current rate ranges',
    heading: 'Explore starting mortgage rates',
    body: 'Compare common rate categories, then request a personalized review based on your file.',
    cta_label: 'Get My Personalized Rate',
    items: [
      { id: 'rate-5y-fixed', title: '5-Year Fixed', rate: 'Starting from —%', description: 'Popular fixed term for purchase and refinance planning.' },
      { id: 'rate-3y-fixed', title: '3-Year Fixed', rate: 'Starting from —%', description: 'Shorter fixed term when flexibility matters.' },
      { id: 'rate-variable', title: 'Variable', rate: 'Starting from —%', description: 'Variable options for borrowers comfortable with rate movement.' },
      { id: 'rate-alternative', title: 'Alternative', rate: 'Starting from —%', description: 'Solutions when A-lender criteria are not the best fit.' },
      { id: 'rate-private', title: 'Private', rate: 'Custom', description: 'Short-term and private options reviewed case by case.' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.LENDER_NETWORK]: {
    eyebrow: 'Lender network',
    heading: 'Access to Canada’s leading lenders',
    body: 'A curated network across major banks, credit unions, and alternative lenders — matched to your file, not a one-size product.',
    disclaimer: 'Lender availability varies by province, product, and borrower profile. Logos identify institutions for reference only.',
    items: [
      { id: 'lender-rbc', title: 'RBC', category: 'Major Banks', domain: 'rbcroyalbank.com', website: 'rbcroyalbank.com', description: '' },
      { id: 'lender-td', title: 'TD', category: 'Major Banks', domain: 'td.com', website: 'td.com', description: '' },
      { id: 'lender-scotia', title: 'Scotiabank', category: 'Major Banks', domain: 'scotiabank.com', website: 'scotiabank.com', description: '' },
      { id: 'lender-bmo', title: 'BMO', category: 'Major Banks', domain: 'bmo.com', website: 'bmo.com', description: '' },
      { id: 'lender-cibc', title: 'CIBC', category: 'Major Banks', domain: 'cibc.com', website: 'cibc.com', description: '' },
      { id: 'lender-national', title: 'National Bank', category: 'Major Banks', domain: 'nbc.ca', website: 'nbc.ca', description: '' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.BROKER_COMPENSATION]: {
    eyebrow: '',
    heading: 'Transparent broker compensation',
    body: 'Clear disclosures help clients understand lender compensation, brokerage fees, and private-mortgage costs.',
    disclaimer: 'Compensation structures vary by lender, product, and transaction type.',
    items: [
      { id: 'comp-lender', title: 'Lender compensation', description: 'In many cases, compensation is paid by the lender when a mortgage funds — so you may not pay a separate brokerage fee for standard A-lender solutions.', icon: 'building' },
      { id: 'comp-percentage', title: 'How compensation is typically structured', description: 'Lender compensation can vary by product, term, and lender. Your advisor can explain the structure that applies to your file before you proceed.', icon: 'percent' },
      { id: 'comp-brokerage', title: 'Brokerage or arrangement fees', description: 'Some private, alternative, or complex files may include an arrangement or brokerage fee. Any fee is disclosed clearly before you commit.', icon: 'briefcase' },
      { id: 'comp-private', title: 'Private mortgage fees', description: 'Private lending may involve lender fees, brokerage fees, or legal costs depending on the structure. Details are reviewed case by case.', icon: 'home' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.ALTERNATIVE_LENDING]: {
    eyebrow: 'Private & alternative lending',
    heading: 'Options beyond the traditional bank path',
    body: 'Help visitors explore potential solutions for complex income, credit, investment, and short-term financing needs.',
    cta_label: 'Explore My Mortgage Options',
    items: [
      { id: 'alt-self-employed', title: 'Self-employed borrowers', description: 'Present business income and documentation through suitable lender programs.', icon: 'briefcase' },
      { id: 'alt-non-traditional', title: 'Non-traditional income', description: 'Explore options when income is commission-based, contract, or otherwise non-standard.', icon: 'target' },
      { id: 'alt-credit', title: 'Credit challenges', description: 'Review alternative and private paths when A-lender credit criteria are difficult to meet.', icon: 'shield' },
      { id: 'alt-refinance', title: 'Refinance & debt consolidation', description: 'Restructure debt, access equity, or simplify payments with a clear comparison of options.', icon: 'percent' },
      { id: 'alt-investor', title: 'Investment properties', description: 'Structure financing around rental income, cash flow, and portfolio goals.', icon: 'building' },
      { id: 'alt-private', title: 'Private & short-term financing', description: 'Bridge, construction, and private mortgage options for time-sensitive or complex files.', icon: 'home' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS]: { heading: 'Featured listings', eyebrow: 'Available properties', body: 'Hand-picked opportunities ready for private showings.' },
  [STOREFRONT_BLOCK_TYPES.TOP_LISTINGS]: { heading: 'Top listings', eyebrow: 'Top picks', body: 'Properties drawing the strongest interest right now.' },
  [STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS]: { heading: 'Recently sold', eyebrow: 'Recently sold', body: 'Proof of pricing strategy and market timing.' },
  [STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE]: { heading: 'Seller performance', eyebrow: 'Performance snapshot', body: 'Verified seller results at a glance.', items: [] },
  [STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS]: {
    heading: 'Recently sold properties',
    eyebrow: 'Recent sales',
    body: 'A look at homes recently sold with a successful client outcome.',
    sold_card_layout_version: 2,
  },
  [STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY]: {
    heading: 'Seller success story',
    eyebrow: 'Case study',
    body: 'Show how strategy translated into a stronger seller outcome.',
    items: [
      { title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' },
      { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' },
      { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS]: {
    heading: 'Expertise sellers can verify',
    eyebrow: 'Credentials and recognition',
    body: 'Professional qualifications and practical strengths that support every recommendation.',
    metrics_layout_version: 2,
    items: [
      { title: 'Clients', issuer: '', source: 'total_clients' },
      { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' },
      { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' },
      { title: 'Brokerage', issuer: '', source: 'company' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.PROPERTIES]: { heading: 'Properties for sale', eyebrow: 'Available now', body: '' },
  [STOREFRONT_BLOCK_TYPES.GUIDANCE]: { heading: 'What happens next', body: 'A simple guide to the process ahead.' },
  [STOREFRONT_BLOCK_TYPES.FAQ]: {
    eyebrow: 'Helpful questions',
    heading: 'What clients often ask',
    body: 'Clear answers to common questions before you start.',
    faqs: [],
  },
  [STOREFRONT_BLOCK_TYPES.ROLE_DETAILS]: { heading: '', eyebrow: '', body: '' },
  [STOREFRONT_BLOCK_TYPES.WHO_WE_HELP]: {
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
  [STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST]: {
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
  [STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE]: {
    eyebrow: 'Fee transparency',
    heading: 'How legal fees are typically framed',
    body: 'Use this as orientation before a consultation. It is not a quote, retainer, or promise of representation.',
    items: [
      { title: 'Legal fee range', description: 'Professional time for review, correspondence, signing, and registration is quoted for the specific matter.' },
      { title: 'Disbursements', description: 'Title search, registration, courier, and government charges are typically billed in addition to legal fees.' },
      { title: 'Land transfer and tax', description: 'Purchase files may include land transfer tax and related provincial charges. Final amounts depend on the transaction.' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.PRACTICE_SNAPSHOT]: {
    eyebrow: 'Practice snapshot',
    heading: 'Where counsel is focused',
    body: 'A concise view of specializations, markets, and languages available for consultation.',
  },
  [STOREFRONT_BLOCK_TYPES.ENGAGEMENT_SCOPE]: {
    eyebrow: 'Retainer clarity',
    heading: 'Know what the legal engagement covers',
    body: 'The final scope is confirmed in writing for your transaction before legal work begins.',
    items: [
      { title: 'Standard purchase closing', description: 'Agreement intake, title review, lender coordination, signing, registration, and closing reporting.', icon: 'contract' },
      { title: 'Quoted separately when needed', description: 'Complex title issues, private financing, assignments, corporate ownership, or unusual negotiations may require added scope.', icon: 'clipboard' },
      { title: 'Confirmed before work starts', description: 'Your retainer identifies included services, exclusions, expected disbursements, and the next decision required from you.', icon: 'shield' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.PRACTICE_LOGISTICS]: {
    eyebrow: 'Service and access',
    heading: 'Practical details before you open a file',
    body: 'Confirm jurisdiction, appointment format, communication options, and response expectations before sharing confidential information.',
    items: [
      { title: 'Jurisdiction and service area', description: 'Confirm that the property and legal matter fall within the lawyer’s licensed service area.', icon: 'landmark' },
      { title: 'Signing and appointments', description: 'Ask whether signing is available virtually, in person, or through a hybrid process for your transaction.', icon: 'calendar' },
      { title: 'Languages and accessibility', description: 'Review available languages, accommodation options, and the best way to receive explanations and documents.', icon: 'message' },
      { title: 'Response expectations', description: 'Use the inquiry form for routine matters and call the office when a deadline or closing issue is time-sensitive.', icon: 'clock' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS]: {
    eyebrow: 'Start the conversation',
    heading: 'Choose how you would like to begin',
    body: 'Pick the path that matches your timeline. Confidential details should wait until the lawyer confirms representation.',
    items: [
      { title: 'Send an inquiry', description: 'Share the property, documents, and closing date so the first response is useful.', cta_label: 'Submit inquiry', action: 'inquiry' },
      { title: 'Book a consultation', description: 'Request time to walk through the agreement, title issues, or closing requirements.', cta_label: 'Make an appointment', action: 'appointment' },
      { title: 'Request document review', description: 'Ask for a focused review of a contract, amendment, or closing package.', cta_label: 'Request review', action: 'inquiry' },
    ],
  },
  [STOREFRONT_BLOCK_TYPES.FOOTER]: { heading: '', body: '', items: [] },
};

export const SECTION_SETTINGS = {
  variants: [
    { value: 'standard', label: 'Standard' },
    { value: 'editorial', label: 'Editorial' },
    { value: 'split', label: 'Split' },
    { value: 'feature-grid', label: 'Feature grid' },
    { value: 'lead-magnet', label: 'Lead magnet' },
    { value: 'premium', label: 'Premium' },
    { value: 'minimal', label: 'Minimal' },
  ],
  mediaPositions: [
    { value: 'none', label: 'No media' },
    { value: 'left', label: 'Media left' },
    { value: 'right', label: 'Media right' },
    { value: 'background', label: 'Background' },
  ],
  columns: [
    { value: '1', label: '1 column' },
    { value: '2', label: '2 columns' },
    { value: '3', label: '3 columns' },
    { value: '4', label: '4 columns' },
  ],
  widths: [
    { value: 'full', label: 'Full width' },
    { value: 'contained', label: 'Contained' },
    { value: 'narrow', label: 'Narrow' },
  ],
  cardStyles: [
    { value: 'flat', label: 'Flat' },
    { value: 'bordered', label: 'Bordered' },
    { value: 'elevated', label: 'Elevated' },
    { value: 'glass', label: 'Glass' },
  ],
  shadows: [
    { value: 'none', label: 'No shadow' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ],
  animations: [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide-up', label: 'Slide up' },
    { value: 'slide-left', label: 'Slide left' },
    { value: 'zoom', label: 'Zoom in' },
  ],
  animationTriggers: [
    { value: 'load', label: 'On load' },
    { value: 'scroll', label: 'On scroll' },
  ],
  animationDurations: [
    { value: 'fast', label: 'Fast' },
    { value: 'medium', label: 'Medium' },
    { value: 'slow', label: 'Slow' },
  ],
  animationIntensities: [
    { value: 'subtle', label: 'Subtle' },
    { value: 'medium', label: 'Medium' },
    { value: 'strong', label: 'Strong' },
  ],
  animationDelays: [
    { value: '0', label: 'No delay' },
    { value: '80', label: '80 ms' },
    { value: '160', label: '160 ms' },
    { value: '240', label: '240 ms' },
    { value: '320', label: '320 ms' },
    { value: '480', label: '480 ms' },
  ],
};

const DEFAULT_LAYOUT = {
  alignment: 'left',
  contentAlignment: 'left',
  padding: 'medium',
  width: 'full',
  variant: 'standard',
  mediaPosition: 'none',
  columns: '3',
  cardStyle: 'bordered',
  buttonLayout: 'stacked',
  animationType: 'slide-up',
  animationTrigger: 'scroll',
  animationDuration: 'medium',
  animationDelay: '0',
  animationIntensity: 'subtle',
};

function normalizeSurfaceColor(value) {
  const next = String(value || '').trim();
  if (!next || ['transparent', 'none', 'inherit', 'initial'].includes(next.toLowerCase())) return '';
  return next;
}

function defaultAnimationLayoutForType(type) {
  if (type === STOREFRONT_BLOCK_TYPES.HERO) {
    return {
      animationType: 'fade',
      animationTrigger: 'load',
      animationDuration: 'slow',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  if (type === STOREFRONT_BLOCK_TYPES.FOOTER) {
    return {
      animationType: 'fade',
      animationTrigger: 'scroll',
      animationDuration: 'fast',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  if (
    type === STOREFRONT_BLOCK_TYPES.GUIDANCE
    || type === STOREFRONT_BLOCK_TYPES.FAQ
  ) {
    return {
      animationType: 'slide-up',
      animationTrigger: 'scroll',
      animationDuration: 'medium',
      animationDelay: '0',
      animationIntensity: 'medium',
    };
  }
  if (
    type === STOREFRONT_BLOCK_TYPES.ABOUT
    || type === STOREFRONT_BLOCK_TYPES.CTA
    || type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS
    || type === STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE
    || type === STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY
    || type === STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS
  ) {
    return {
      animationType: 'fade',
      animationTrigger: 'scroll',
      animationDuration: 'medium',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  if (
    type === STOREFRONT_BLOCK_TYPES.SERVICES
    || type === STOREFRONT_BLOCK_TYPES.EXPERTISE
    || type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS
    || type === STOREFRONT_BLOCK_TYPES.WHO_WE_HELP
    || type === STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST
    || type === STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE
    || type === STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS
    || type === STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS
  ) {
    return {
      animationType: 'slide-up',
      animationTrigger: 'scroll',
      animationDuration: 'medium',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  if (
    type === STOREFRONT_BLOCK_TYPES.PROPERTIES
    || type === STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS
    || type === STOREFRONT_BLOCK_TYPES.TOP_LISTINGS
    || type === STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS
    || type === STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS
  ) {
    return {
      animationType: 'zoom',
      animationTrigger: 'scroll',
      animationDuration: 'medium',
      animationDelay: '0',
      animationIntensity: 'subtle',
    };
  }
  return {
    animationType: DEFAULT_LAYOUT.animationType,
    animationTrigger: 'scroll',
    animationDuration: DEFAULT_LAYOUT.animationDuration,
    animationDelay: DEFAULT_LAYOUT.animationDelay,
    animationIntensity: DEFAULT_LAYOUT.animationIntensity,
  };
}

export function createBlock(type) {
  const isHero = type === STOREFRONT_BLOCK_TYPES.HERO;
  const isListing = [
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
    STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
  ].includes(type);
  const usesFourColumns = isListing
    || type === STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE
    || type === STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS;
  const animationDefaults = defaultAnimationLayoutForType(type);
  return {
    id: `${type}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`,
    type,
    data: {
      enabled: true,
      content: { ...(DEFAULT_CONTENT[type] || {}) },
      layout: {
        ...DEFAULT_LAYOUT,
        ...animationDefaults,
        // Hero cover only renders when mediaPosition !== 'none'
        mediaPosition: isHero ? 'background' : DEFAULT_LAYOUT.mediaPosition,
        cardStyle: isHero ? 'elevated' : DEFAULT_LAYOUT.cardStyle,
        columns: usesFourColumns ? '4' : DEFAULT_LAYOUT.columns,
      },
      style: { background: '', textColor: '', radius: 'default', shadow: 'none' },
    },
  };
}

export function normalizeBlock(block, index = 0) {
  const data = block?.data || {};
  const rawLayout = {
    ...(block?.layout || {}),
    ...(data.layout || {}),
  };
  const rawStyle = {
    ...(block?.style || {}),
    ...(data.style || {}),
  };
  const animationDefaults = defaultAnimationLayoutForType(block?.type);
  const rawContent = data.content || block?.content || {};
  const content = block?.type === STOREFRONT_BLOCK_TYPES.GUIDANCE
    || block?.type === STOREFRONT_BLOCK_TYPES.FAQ
    ? coerceGuidanceContent(rawContent)
    : block?.type === STOREFRONT_BLOCK_TYPES.SERVICES
      || block?.type === STOREFRONT_BLOCK_TYPES.WHO_WE_HELP
      || block?.type === STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST
      || block?.type === STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE
      || block?.type === STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS
      || block?.type === STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS
      ? coerceServicesContent(rawContent)
      : block?.type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS
        ? coerceRoleDetailsContent(rawContent)
        : rawContent;
  const isListing = [
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
    STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SELLER_SOLD_RESULTS,
  ].includes(block?.type);
  const defaultColumns = isListing
    || block?.type === STOREFRONT_BLOCK_TYPES.SELLER_PERFORMANCE
    || block?.type === STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS
    ? '4'
    : DEFAULT_LAYOUT.columns;
  const defaultMediaPosition = block?.type === STOREFRONT_BLOCK_TYPES.HERO
    ? 'background'
    : DEFAULT_LAYOUT.mediaPosition;
  return {
    id: block?.id || `${block?.type || 'block'}-${index}`,
    type: block?.type || STOREFRONT_BLOCK_TYPES.ABOUT,
    data: {
      enabled: data.enabled ?? block?.enabled ?? true,
      content: withContentItemIds(content),
      layout: {
        alignment: rawLayout.alignment || DEFAULT_LAYOUT.alignment,
        contentAlignment: rawLayout.contentAlignment || DEFAULT_LAYOUT.contentAlignment,
        padding: rawLayout.padding || DEFAULT_LAYOUT.padding,
        width: rawLayout.width || DEFAULT_LAYOUT.width,
        variant: rawLayout.variant || DEFAULT_LAYOUT.variant,
        mediaPosition: rawLayout.mediaPosition || defaultMediaPosition,
        columns: String(rawLayout.columns || defaultColumns),
        cardStyle: rawLayout.cardStyle || DEFAULT_LAYOUT.cardStyle,
        buttonLayout: ['inline', 'stacked'].includes(rawLayout.buttonLayout)
          ? rawLayout.buttonLayout
          : DEFAULT_LAYOUT.buttonLayout,
        animationType: rawLayout.animationType || animationDefaults.animationType,
        animationTrigger: rawLayout.animationTrigger || animationDefaults.animationTrigger,
        animationDuration: rawLayout.animationDuration || animationDefaults.animationDuration,
        animationDelay: String(rawLayout.animationDelay ?? animationDefaults.animationDelay),
        animationIntensity: rawLayout.animationIntensity || animationDefaults.animationIntensity,
      },
      style: {
        background: normalizeSurfaceColor(rawStyle.background),
        textColor: normalizeSurfaceColor(rawStyle.textColor),
        radius: rawStyle.radius || 'default',
        shadow: rawStyle.shadow || 'none',
      },
    },
  };
}

export function normalizeBlocks(blocks = []) {
  const deprecatedBlockTypes = new Set([
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
    'home-valuation',
    'closing-cost-estimator',
  ]);
  let normalized = blocks
    .filter((block) => !deprecatedBlockTypes.has(block?.type))
    .map(normalizeBlock);

  // Prevent duplicate listing sections in agent pages:
  // if FEATURED_LISTINGS exists, suppress PROPERTIES.
  const hasFeaturedListings = normalized.some(
    (block) => block.type === STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
  );
  if (hasFeaturedListings) {
    normalized = normalized.filter(
      (block) => block.type !== STOREFRONT_BLOCK_TYPES.PROPERTIES,
    );
  }

  if (normalized.some((block) => block.type === STOREFRONT_BLOCK_TYPES.FOOTER)) return normalized;
  return [
    ...normalized,
    normalizeBlock({
      id: 'footer-1',
      type: STOREFRONT_BLOCK_TYPES.FOOTER,
      data: { enabled: true },
    }),
  ];
}

export function availableBlocksForRole(role, templateKey = '') {
  const normalized = normalizeStorefrontRole(role);
  const normalizedTemplateKey = String(templateKey || '').trim().toLowerCase();
  const canonicalOrder = canonicalBlockOrderForTemplate(normalizedTemplateKey);
  if (canonicalOrder) return [...canonicalOrder];
  const types = [
    ...BLOCK_LIBRARY.shared,
    ...(BLOCK_LIBRARY[normalized] || []),
    ...(BLOCK_LIBRARY[templateKey] || []),
  ];
  const uniqueTypes = [...new Set(types)];
  if (normalizedTemplateKey !== 'agent-investor') return uniqueTypes;
  return uniqueTypes.filter((type) => type !== STOREFRONT_BLOCK_TYPES.TESTIMONIALS);
}

export function toRendererBlocks(blocks) {
  return normalizeBlocks(blocks).map((block) => ({
    ...block,
    enabled: block.data.enabled,
    content: block.data.content,
    layout: block.data.layout,
    style: block.data.style,
  }));
}
