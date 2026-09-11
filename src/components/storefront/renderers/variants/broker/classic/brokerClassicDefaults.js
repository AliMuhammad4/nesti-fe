import { STOREFRONT_BLOCK_TYPES as T } from '../../../../storefrontPresets';

/** Canonical defaults — keep in sync with templates/mortgage-broker/classic.js */

export const BROKER_CLASSIC_HERO_DEFAULTS = {
  primary_cta_label: 'Find My Mortgage Options',
  cta_label: 'Get My Personalized Rate',
  join_label: 'Join Nesti',
};

export const BROKER_CLASSIC_PROGRAM_ITEMS = [
  { id: 'program-first-home', title: 'First-time home buyer', description: 'Plan your down payment, affordability, and pre-approval with clear guidance.', icon: 'home' },
  { id: 'program-purchase', title: 'Purchase mortgage', description: 'Compare structures and lender options before you make an offer.', icon: 'building' },
  { id: 'program-refinance', title: 'Refinance', description: 'Review rates, equity access, and payment improvement opportunities.', icon: 'percent' },
  { id: 'program-renewal', title: 'Renewal', description: 'Assess the market before maturity instead of accepting the first renewal offer.', icon: 'target' },
  { id: 'program-investor', title: 'Investment property', description: 'Structure financing around rental income, cash flow, and portfolio goals.', icon: 'briefcase' },
  { id: 'program-commercial', title: 'Commercial mortgage', description: 'Explore financing paths for multi-unit and commercial opportunities.', icon: 'shield' },
];

export const BROKER_CLASSIC_SERVICE_ITEMS = [
  { id: 'service-purchase', title: 'Purchase financing', description: 'Compare mortgage structures and lender options for your next home.', icon: 'home' },
  { id: 'service-preapproval', title: 'Pre-approval strategy', description: 'Clarify affordability and strengthen your position before making an offer.', icon: 'shield' },
  { id: 'service-refinance', title: 'Refinance planning', description: 'Review equity, debt consolidation, and payment-improvement opportunities.', icon: 'percent' },
  { id: 'service-renewal', title: 'Mortgage renewal', description: 'Assess the market before maturity instead of accepting the first renewal offer.', icon: 'target' },
  { id: 'service-investor', title: 'Investor mortgages', description: 'Structure financing around rental income, portfolio goals, and cash flow.', icon: 'building' },
  { id: 'service-self-employed', title: 'Self-employed solutions', description: 'Present business and income documentation through suitable lender programs.', icon: 'briefcase' },
];

export const BROKER_CLASSIC_ROLE_HIGHLIGHTS = [
  { id: 'highlight-rates', title: 'Competitive rate shopping across lenders' },
  { id: 'highlight-success', title: 'Clear documentation and file preparation' },
  { id: 'highlight-flex', title: 'Flexible structures for complex income' },
];

export const BROKER_CLASSIC_ROLE_SNAPSHOT_DEFAULTS = {
  snapshot_eyebrow: 'Business finance snapshot',
  snapshot_heading: 'Financing structured around your next stage of growth.',
};

export const BROKER_CLASSIC_COMPENSATION_ITEMS = [
  {
    id: 'comp-lender',
    title: 'Lender compensation',
    description: 'In many cases, compensation is paid by the lender when a mortgage funds — so you may not pay a separate brokerage fee for standard A-lender solutions.',
    icon: 'building',
  },
  {
    id: 'comp-percentage',
    title: 'How compensation is typically structured',
    description: 'Lender compensation can vary by product, term, and lender. Your advisor can explain the structure that applies to your file before you proceed.',
    icon: 'percent',
  },
  {
    id: 'comp-brokerage',
    title: 'Brokerage or arrangement fees',
    description: 'Some private, alternative, or complex files may include an arrangement or brokerage fee. Any fee is disclosed clearly before you commit.',
    icon: 'briefcase',
  },
  {
    id: 'comp-private',
    title: 'Private mortgage fees',
    description: 'Private lending may involve lender fees, brokerage fees, or legal costs depending on the structure. Details are reviewed case by case.',
    icon: 'home',
  },
];

export const BROKER_CLASSIC_FAQS = [
  {
    id: 'faq-approval',
    q: 'How long does mortgage approval usually take?',
    a: 'Timelines vary by lender and file complexity, but a well-prepared application can often move from first review to approval within a few business days.',
  },
  {
    id: 'faq-documents',
    q: 'What documents should I prepare first?',
    a: 'Income proof, identification, down-payment source, credit consent, and property details (or a target purchase range) help keep the process moving.',
  },
  {
    id: 'faq-preapproval',
    q: 'Can I get pre-approved before making an offer?',
    a: 'Yes. Pre-approval clarifies affordability and strengthens your position before you submit an offer on a home.',
  },
  {
    id: 'faq-scope',
    q: 'Do you only help with purchases?',
    a: 'No. Support typically covers purchases, refinances, renewals, investor financing, and alternative or private options depending on your goals and lender fit.',
  },
  {
    id: 'faq-qualify',
    q: 'What information helps qualify my inquiry?',
    a: 'Sharing your goal (purchase, refinance, renew, invest), estimated price or mortgage amount, down payment, employment, income range, credit range, property type, location, and timeline helps your advisor prepare better options.',
  },
  {
    id: 'faq-commitment',
    q: 'Will this consultation lock me into a lender?',
    a: 'No. The first conversation is about fit, options, and next steps. You stay in control of whether to proceed.',
  },
  {
    id: 'faq-next',
    q: 'What happens after I submit an inquiry?',
    a: 'Your details are reviewed, clarifying questions may follow if needed, and you receive a clear path for consultation or application support.',
  },
];

export const BROKER_CLASSIC_FOOTER_ITEMS = [
  { id: 'footer-about', label: 'About', target: '#about' },
  { id: 'footer-programs', label: 'Programs', target: '#programs' },
  { id: 'footer-services', label: 'Services', target: '#services' },
  { id: 'footer-faq', label: 'FAQ', target: '#faq' },
  { id: 'footer-contact', label: 'Contact us', target: '/contact' },
  { id: 'footer-booking', label: 'Book an appointment', target: '#contact' },
];

export function brokerClassicCollectionFallback(blockType, collection) {
  if (blockType === T.MORTGAGE_PROGRAMS && collection === 'items') {
    return BROKER_CLASSIC_PROGRAM_ITEMS;
  }
  if (blockType === T.SERVICES && (collection === 'items' || collection === 'services')) {
    return BROKER_CLASSIC_SERVICE_ITEMS;
  }
  if (blockType === T.BROKER_COMPENSATION && collection === 'items') {
    return BROKER_CLASSIC_COMPENSATION_ITEMS;
  }
  if (blockType === T.ROLE_DETAILS && collection === 'highlights') {
    return BROKER_CLASSIC_ROLE_HIGHLIGHTS;
  }
  if (blockType === T.FAQ && collection === 'faqs') {
    return BROKER_CLASSIC_FAQS;
  }
  if (blockType === T.FOOTER && collection === 'items') {
    return BROKER_CLASSIC_FOOTER_ITEMS;
  }
  return null;
}
