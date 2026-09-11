import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import { LAWYER_EXPERTISE_PROCESS_LIMIT } from '../../storefrontLimits';

export const LAWYER_CLASSIC_ITEM_CARD_TYPES = [
  T.PRACTICE_AREAS,
  T.WHO_WE_HELP,
  T.DOCUMENT_CHECKLIST,
  T.FEE_GUIDANCE,
  T.ENGAGEMENT_SCOPE,
  T.PRACTICE_LOGISTICS,
  T.CONSULTATION_OPTIONS,
];

export const LAWYER_CLASSIC_LAYOUT_BASE_TYPES = [
  T.SERVICES,
  T.GUIDANCE,
  T.FAQ,
  T.EXPERTISE,
  T.TESTIMONIALS,
  T.ABOUT,
  T.CREDENTIALS,
  T.ROLE_DETAILS,
  T.PRACTICE_SNAPSHOT,
  T.CTA,
  T.FOOTER,
];

export const COLUMN_SUPPORT_BASE_TYPES = [
  T.SERVICES,
  T.TESTIMONIALS,
  T.PROPERTIES,
  T.FEATURED_LISTINGS,
  T.TOP_LISTINGS,
  T.SOLD_LISTINGS,
  T.MORTGAGE_PROGRAMS,
  T.PRACTICE_AREAS,
  T.CREDENTIALS,
  T.ROLE_DETAILS,
  T.SELLER_PERFORMANCE,
  T.SELLER_SOLD_RESULTS,
  T.SELLER_CASE_STUDY,
  T.SELLER_CREDENTIALS,
];

export const COLUMN_SUPPORT_LAWYER_OR_COMMUNITY_TYPES = [T.GUIDANCE, T.FAQ, T.EXPERTISE];

export const COLUMN_SUPPORT_TAIL_TYPES = [
  T.WHO_WE_HELP,
  T.DOCUMENT_CHECKLIST,
  T.FEE_GUIDANCE,
  T.ENGAGEMENT_SCOPE,
  T.PRACTICE_LOGISTICS,
  T.CONSULTATION_OPTIONS,
];

export const LAYERED_LAWYER_COLUMN_EXCEPTIONS = [
  T.SERVICES,
  T.GUIDANCE,
  T.FAQ,
  T.TESTIMONIALS,
  T.ROLE_DETAILS,
];

export const SELLER_CUSTOM_BLOCK_TYPES = [
  T.ROLE_DETAILS,
  T.ABOUT,
  T.SERVICES,
  T.SELLER_PERFORMANCE,
  T.SELLER_CASE_STUDY,
  T.SELLER_CREDENTIALS,
  T.GUIDANCE,
  T.CTA,
  T.FOOTER,
];

export const SELLER_CARD_STYLE_TYPES = [
  T.ABOUT,
  T.FEATURED_LISTINGS,
  T.SELLER_SOLD_RESULTS,
  T.SELLER_PERFORMANCE,
  T.SELLER_CASE_STUDY,
  T.SELLER_CREDENTIALS,
];

export const SELLER_RADIUS_SHADOW_TYPES = [
  T.ABOUT,
  T.ROLE_DETAILS,
  T.FEATURED_LISTINGS,
  T.SELLER_SOLD_RESULTS,
  T.SELLER_CASE_STUDY,
  T.SELLER_CREDENTIALS,
  T.TESTIMONIALS,
];

export const LISTING_BLOCK_TYPES = [
  T.FEATURED_LISTINGS,
  T.TOP_LISTINGS,
  T.SOLD_LISTINGS,
  T.SELLER_SOLD_RESULTS,
  T.PROPERTIES,
];

export const SELLER_ALIGNMENT_TYPES = [
  T.ABOUT,
  T.ROLE_DETAILS,
  T.FEATURED_LISTINGS,
  T.SELLER_SOLD_RESULTS,
  T.SELLER_PERFORMANCE,
  T.SELLER_CASE_STUDY,
  T.SELLER_CREDENTIALS,
  T.TESTIMONIALS,
];

export const PROCESS_CARD_FIELDS = new Set([
  'content.process_card_background',
  'content.process_card_text_color',
  'content.process_label',
  'content.process_heading',
  'content.proof_chat',
  'content.proof_handoff',
]);

export const FAQ_CARD_FIELDS = new Set([
  'content.faq_card_background',
  'content.faq_card_text_color',
  'content.faq_label',
  'content.faq_heading',
  'content.faq_footer_title',
  'content.faq_footer_body',
]);

export const SERVICES_CARD_STYLE_FIELDS = new Set([
  'content.icon_background',
  'content.icon_color',
]);

export const SUPPLEMENTAL_SERVICE = {
  agent: {
    title: 'Portfolio Growth Strategy',
    description: 'Build a practical acquisition and diversification plan around your long-term property goals.',
  },
  mortgage_broker: {
    title: 'Financing Strategy Review',
    description: 'Review borrowing options and structure a financing path aligned with your next property goal.',
  },
  lawyer: {
    title: 'Property Advisory',
    description: 'Get clear legal guidance for complex property decisions before moving forward.',
  },
};

export const COMMUNITY_SERVICE_FALLBACK = {
  id: 'community-service-6',
  title: 'Neighborhood timing & offer strategy',
  description: 'Know when to move, what to offer, and how local demand shapes your next step.',
  icon: 'shield',
  background: '',
  text_color: '',
  icon_background: '',
  icon_color: '',
};

export const HERO_PROOF_FIELDS = [
  ['proof_one_title', 'proof_one_body', 'Plain-language advice'],
  ['proof_two_title', 'proof_two_body', 'Transparent planning'],
  ['proof_three_title', 'proof_three_body', 'Closing-day ready'],
];

export const EXPERTISE_PROCESS_LIMIT = LAWYER_EXPERTISE_PROCESS_LIMIT;
export const SERVICE_CARD_LIMIT = 6;
export const ROLE_HIGHLIGHT_LIMIT = 6;
export const ROLE_PROOF_LIMIT = 8;
