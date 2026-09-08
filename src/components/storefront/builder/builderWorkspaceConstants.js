export const BUILDER_PANELS = [
  { id: 'layers', label: 'Layers', iconName: 'LayoutTemplate' },
  { id: 'add', label: 'Add', iconName: 'Plus' },
  { id: 'settings', label: 'Design', iconName: 'Settings2' },
];

export const BUILDER_PREVIEW_WIDTHS = { desktop: 1280, tablet: 834, mobile: 390 };

export const SELLER_SERVICE_SUPPLEMENTAL = [
  {
    id: 'seller-service-fallback-1',
    title: 'Pre-listing prep plan',
    description: 'Repairs, staging, media, and launch sequencing to maximize first-week momentum.',
    icon: 'shield-check',
  },
  {
    id: 'seller-service-fallback-2',
    title: 'Offer decision room',
    description: 'Compare pricing strength, terms, and closing confidence before choosing an offer.',
    icon: 'target',
  },
  {
    id: 'seller-service-fallback-3',
    title: 'Closing confidence',
    description: 'Coordinate conditions, documents, and handoffs so the accepted offer reaches a clean close.',
    icon: 'handshake',
  },
];

export const SELLER_ROLE_SUPPLEMENTAL = [
  {
    id: 'seller-highlight-supp-1',
    title: 'Launch timeline control',
    text: 'Coordinate listing date, showing windows, and offer review milestones around your schedule.',
  },
  {
    id: 'seller-highlight-supp-2',
    title: 'Offer clarity framework',
    text: 'Compare price, conditions, financing strength, and closing certainty before selecting a path.',
  },
];

export const COMMUNITY_SERVICE_SUPPLEMENTAL = {
  id: 'community-service-6',
  title: 'Neighborhood timing & offer strategy',
  description: 'Know when to move, what to offer, and how local demand shapes your next step.',
  icon: 'shield',
  background: '',
  text_color: '',
  icon_background: '',
  icon_color: '',
};

export const CANONICAL_BLOCK_ORDER_TEMPLATES = new Set([
  'lawyer-classic',
  'lawyer-first-home-closing',
  'lawyer-newcomer',
  'mortgage_broker-renewal',
  'mortgage_broker-first-home',
]);
