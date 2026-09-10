import { STOREFRONT_BLOCK_TYPES as T } from '../../../../storefrontPresets';
import { LENDER_BANK_PRESETS } from '../classic/lenderBankPresets';

export const COMMERCIAL_HERO_SLIDE_MIN = 1;
export const COMMERCIAL_HERO_SLIDE_MAX = 3;

export const COMMERCIAL_HERO_SLIDES = Object.freeze([
  {
    id: 'slide-deal-desk',
    eyebrow: 'Deal desk',
    heading: 'Financing built for operators and sponsors',
    body: 'Multi-unit, mixed-use, and business-purpose lending pathways with clear underwriting packages.',
    image_url: '',
  },
  {
    id: 'slide-multi-unit',
    eyebrow: 'Multi-unit & CRE',
    heading: 'Structure the right capital stack early',
    body: 'Compare CMHC multi, conventional CRE, and bridge options before you commit to a purchase or refinance.',
    image_url: '',
  },
  {
    id: 'slide-bridge',
    eyebrow: 'Speed when it matters',
    heading: 'Bridge and private pathways for timing gaps',
    body: 'Align term sheets, lender requirements, and funding timelines so deals stay on track.',
    image_url: '',
  },
]);

export function resolveSlideImagePlacement(slide = {}) {
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const position = slide.image_position && typeof slide.image_position === 'object'
    ? slide.image_position
    : {};
  const x = clamp(slide.image_position_x ?? position.x, 0, 100, 50);
  const y = clamp(slide.image_position_y ?? position.y, 0, 100, 50);
  const zoom = clamp(slide.image_zoom ?? position.zoom, 1, 3, 1);
  return {
    x,
    y,
    zoom,
    fit: 'cover',
    image_position: { x, y, zoom },
  };
}

export function commitCommercialHeroSlides(raw = [], options = {}) {
  const { fallbackCover = '' } = options;
  const source = Array.isArray(raw) ? raw.filter(Boolean) : [];
  if (!source.length) {
    return normalizeCommercialHeroSlides([], { fallbackCover });
  }
  const count = Math.min(Math.max(source.length, COMMERCIAL_HERO_SLIDE_MIN), COMMERCIAL_HERO_SLIDE_MAX);
  return Array.from({ length: count }, (_, index) => {
    const fallback = COMMERCIAL_HERO_SLIDES[index] || COMMERCIAL_HERO_SLIDES[0];
    const slide = source[index] || {};
    const merged = { ...fallback, ...slide };
    const image = String(merged.image_url || merged.image || merged.src || '').trim();
    const placement = resolveSlideImagePlacement(merged);
    return {
      id: String(merged.id || fallback.id || `slide-${index + 1}`),
      eyebrow: String(merged.eyebrow ?? fallback.eyebrow ?? '').trim(),
      heading: String(merged.heading ?? merged.title ?? fallback.heading ?? '').trim(),
      body: String(merged.body ?? merged.text ?? fallback.body ?? '').trim(),
      image_url: image || (index === 0 ? fallbackCover : ''),
      image_position_x: placement.x,
      image_position_y: placement.y,
      image_zoom: placement.zoom,
      image_fit: placement.fit,
      image_position: placement.image_position,
    };
  });
}

export function normalizeCommercialHeroSlides(raw = [], options = {}) {
  const { fallbackCover = '' } = options;
  const source = Array.isArray(raw) ? raw.filter(Boolean) : [];
  const count = source.length > 0
    ? Math.min(source.length, COMMERCIAL_HERO_SLIDE_MAX)
    : COMMERCIAL_HERO_SLIDE_MIN;

  return Array.from({ length: count }, (_, index) => {
    const fallback = COMMERCIAL_HERO_SLIDES[index] || COMMERCIAL_HERO_SLIDES[0];
    const slide = source[index] || fallback;
    const image = String(slide.image_url || slide.image || slide.src || '').trim();
    const placement = resolveSlideImagePlacement(slide);
    return {
      id: String(slide.id || fallback.id || `slide-${index + 1}`),
      eyebrow: String(slide.eyebrow ?? fallback.eyebrow ?? '').trim(),
      heading: String(slide.heading ?? slide.title ?? fallback.heading ?? '').trim(),
      body: String(slide.body ?? slide.text ?? fallback.body ?? '').trim(),
      image_url: image || (index === 0 ? fallbackCover : ''),
      image_position_x: placement.x,
      image_position_y: placement.y,
      image_zoom: placement.zoom,
      image_fit: placement.fit,
      image_position: placement.image_position,
    };
  });
}

export const COMMERCIAL_PROGRAM_ITEMS = Object.freeze([
  { id: 'program-cmhc-multi', title: 'CMHC multi-unit', description: 'Insured multi-residential pathways with clear documentation and leverage expectations.', icon: 'building' },
  { id: 'program-conventional-cre', title: 'Conventional CRE', description: 'Bank and credit-union options for income-producing and owner-occupied commercial assets.', icon: 'home' },
  { id: 'program-bridge', title: 'Bridge financing', description: 'Short-term capital for acquisitions, renovations, and timing gaps between exits.', icon: 'target' },
  { id: 'program-construction', title: 'Construction & draw', description: 'Progress draws, budgets, and lender conditions reviewed before shovel-ready commitment.', icon: 'shield' },
  { id: 'program-private', title: 'Private & alternative', description: 'Specialty and private lenders when A-lender criteria are not the best fit.', icon: 'briefcase' },
  { id: 'program-refinance', title: 'Refinance & equity', description: 'Reposition debt, access equity, or refinance maturity with a structured comparison.', icon: 'percent' },
]);

export const COMMERCIAL_SERVICE_ITEMS = Object.freeze([
  { id: 'service-term-sheet', title: 'Term sheet review', description: 'Break down rate, term, covenants, fees, and conditions before you accept an offer.', icon: 'shield' },
  { id: 'service-underwriting', title: 'Underwriting package', description: 'Organize rent rolls, financials, appraisals, and borrower docs for lender-ready files.', icon: 'briefcase' },
  { id: 'service-matching', title: 'Lender matching', description: 'Match asset class, leverage, and timeline to suitable bank, credit union, and specialty desks.', icon: 'building' },
  { id: 'service-dscr', title: 'DSCR & leverage planning', description: 'Stress-test coverage, LTV, and debt service so the structure fits the asset.', icon: 'calculator' },
]);

export const COMMERCIAL_WHO_WE_HELP = Object.freeze([
  { id: 'help-operators', title: 'Operators', description: 'Hands-on owners scaling multi-unit and mixed-use portfolios with clear next steps.', icon: 'building' },
  { id: 'help-sponsors', title: 'Sponsors', description: 'Capital stack clarity for acquisitions, renovations, and partnership structures.', icon: 'briefcase' },
  { id: 'help-developers', title: 'Developers', description: 'Construction, land, and takeout pathways with documented draw and covenant expectations.', icon: 'target' },
  { id: 'help-investors', title: 'Multi-unit investors', description: 'Refinance, purchase, and reposition strategies for income-producing residential assets.', icon: 'home' },
]);

export const COMMERCIAL_RATE_ITEMS = Object.freeze([
  { id: 'rate-multi', title: 'Multi-residential', rate: 'Custom review', description: 'Insured and conventional multi-unit structures reviewed case by case.' },
  { id: 'rate-cre', title: 'Conventional CRE', rate: 'Starting from —%', description: 'Income-producing and owner-occupied commercial assets.' },
  { id: 'rate-bridge', title: 'Bridge', rate: 'Custom review', description: 'Short-term capital with a clear exit path.' },
  { id: 'rate-private', title: 'Private / alternative', rate: 'Custom', description: 'Specialty options when A-lender criteria are not the best fit.' },
]);

export const COMMERCIAL_ROLE_HIGHLIGHTS = Object.freeze([
  { id: 'highlight-dscr', title: 'DSCR and leverage reviewed before term sheet' },
  { id: 'highlight-package', title: 'Lender-ready packages for multi-unit and CRE' },
  { id: 'highlight-stack', title: 'Capital stack options across bank and specialty desks' },
]);

export const COMMERCIAL_ROLE_SNAPSHOT_DEFAULTS = Object.freeze({
  snapshot_eyebrow: 'Commercial finance snapshot',
  snapshot_heading: 'Financing structured around the asset, leverage, and timeline.',
});

export const COMMERCIAL_EXPERTISE_ITEMS = Object.freeze([
  { id: 'exp-dscr', title: 'DSCR analysis', description: 'Coverage and stress scenarios for income-producing assets before you lock a structure.', icon: 'percent' },
  { id: 'exp-ltv', title: 'LTV strategy', description: 'Leverage targets aligned to asset quality, location, and lender appetite.', icon: 'target' },
  { id: 'exp-asset', title: 'Asset-class focus', description: 'Multi-res, mixed-use, retail, office, and light industrial pathways.', icon: 'building' },
  { id: 'exp-timing', title: 'Funding timelines', description: 'Conditions, appraisals, and closing calendars kept on track.', icon: 'shield' },
  { id: 'exp-covenant', title: 'Covenant & structure', description: 'Term sheet covenants, fees, and recourse reviewed before acceptance.', icon: 'briefcase' },
  { id: 'exp-exit', title: 'Exit & refinance paths', description: 'Takeout, refinance, and reposition options mapped against the hold plan.', icon: 'calculator' },
]);

/** Private & alternative pathways — US/CA-neutral, explore-only (no approval promises). Max 12. */
export const COMMERCIAL_ALTERNATIVE_ITEMS = Object.freeze([
  {
    id: 'alt-self-employed',
    title: 'Self-employed borrowers',
    description: 'Compare documentation pathways for business owners using bank statements, T1/corporate returns, or stated-income-style specialty programs where available.',
    icon: 'briefcase',
  },
  {
    id: 'alt-non-traditional',
    title: 'Non-traditional income',
    description: 'Explore options when income is commission, contract, gig, rental, or otherwise non-salary—structured for lender review, not guaranteed outcomes.',
    icon: 'target',
  },
  {
    id: 'alt-credit',
    title: 'Credit challenges',
    description: 'Review alternative and private desks when A-lender credit thresholds are difficult to meet, with clear trade-offs on rate, term, and conditions.',
    icon: 'shield',
  },
  {
    id: 'alt-refinance',
    title: 'Refinancing',
    description: 'Compare rate/term refinances, cash-out, and maturity takeouts for residential or commercial assets across bank and specialty lenders.',
    icon: 'percent',
  },
  {
    id: 'alt-debt-consolidation',
    title: 'Debt consolidation',
    description: 'Explore whether consolidating higher-cost debt into a mortgage or HELOC structure improves cash flow—subject to underwriting and equity.',
    icon: 'calculator',
  },
  {
    id: 'alt-investment',
    title: 'Investment properties',
    description: 'Structure purchase and refinance options around rental income, DSCR, and portfolio goals in the U.S. and Canada.',
    icon: 'building',
  },
  {
    id: 'alt-construction',
    title: 'Construction financing',
    description: 'Review construction and progress-draw facilities, budgets, and conditions before shovel-ready commitment.',
    icon: 'home',
  },
  {
    id: 'alt-bridge',
    title: 'Bridge financing',
    description: 'Short-term capital for timing gaps between purchase, renovation, sale, or takeout—paired with a documented exit plan.',
    icon: 'target',
  },
  {
    id: 'alt-short-term',
    title: 'Short-term financing',
    description: 'Compare short-duration facilities when closing windows, renovations, or interim funding require flexibility.',
    icon: 'shield',
  },
  {
    id: 'alt-private',
    title: 'Private mortgages',
    description: 'Private and specialty mortgage options when conventional criteria, timelines, or property types need a different structure.',
    icon: 'briefcase',
  },
  {
    id: 'alt-commercial',
    title: 'Commercial mortgages',
    description: 'Income-producing and owner-occupied commercial pathways—multi-unit, mixed-use, retail, office, and light industrial.',
    icon: 'building',
  },
]);

export const COMMERCIAL_GUIDANCE_STEPS = Object.freeze([
  { id: 'step-intake', title: 'Deal intake', description: 'Share asset details, purchase price or refinance goal, and target leverage.' },
  { id: 'step-package', title: 'Build the package', description: 'Assemble rent roll, financials, appraisal inputs, and borrower documentation.' },
  { id: 'step-terms', title: 'Compare term sheets', description: 'Review rate, covenants, fees, and conditions across suitable lenders.' },
  { id: 'step-fund', title: 'Fund with clarity', description: 'Lock conditions, timelines, and next steps through funding day.' },
]);

export const COMMERCIAL_FAQS = Object.freeze([
  { id: 'faq-docs', q: 'What documents do I need for a commercial file?', a: 'Typically rent rolls or leases, financial statements, purchase agreement or mortgage statement, appraisal inputs, and borrower identity/corporate docs.' },
  { id: 'faq-ltv', q: 'How is leverage decided?', a: 'LTV depends on asset class, income quality, location, and lender program. We compare realistic leverage before you commit.' },
  { id: 'faq-bridge', q: 'When does bridge financing make sense?', a: 'When timing, renovations, or exit plans do not fit standard A-lender terms—and the exit path is clear.' },
  { id: 'faq-timeline', q: 'How long does commercial funding take?', a: 'Timelines vary by complexity. Clean packages with appraisals and financials move faster than incomplete files.' },
]);

export const COMMERCIAL_FOOTER_ITEMS = Object.freeze([
  { id: 'footer-programs', label: 'Programs', target: '#programs' },
  { id: 'footer-services', label: 'Services', target: '#services' },
  { id: 'footer-alt-lending', label: 'Alternative lending', target: '#alternative-lending' },
  { id: 'footer-about', label: 'About', target: '#about' },
  { id: 'footer-lenders', label: 'Lenders', target: '#lenders' },
  { id: 'footer-reviews', label: 'Reviews', target: '#reviews' },
  { id: 'footer-faq', label: 'FAQ', target: '#faq' },
  { id: 'footer-contact', label: 'Contact', target: '/contact' },
]);

export const COMMERCIAL_LENDER_ITEMS = Object.freeze(
  LENDER_BANK_PRESETS.slice(0, 8).map((bank) => ({
    id: `lender-${bank.id || bank.domain || bank.title}`,
    title: bank.title,
    category: bank.category || 'Major Banks',
    domain: bank.domain || '',
    website: bank.website || bank.domain || '',
    description: '',
  })),
);

export function brokerCommercialCollectionFallback(blockType, collection = 'items') {
  if (blockType === T.MORTGAGE_PROGRAMS && collection === 'items') return [...COMMERCIAL_PROGRAM_ITEMS];
  if (blockType === T.SERVICES && (collection === 'items' || collection === 'services')) {
    return [...COMMERCIAL_SERVICE_ITEMS];
  }
  if (blockType === T.WHO_WE_HELP && collection === 'items') return [...COMMERCIAL_WHO_WE_HELP];
  if (blockType === T.EXPERTISE && collection === 'items') return [...COMMERCIAL_EXPERTISE_ITEMS];
  if (blockType === T.ALTERNATIVE_LENDING && collection === 'items') return [...COMMERCIAL_ALTERNATIVE_ITEMS];
  if (blockType === T.GUIDANCE && collection === 'steps') return [...COMMERCIAL_GUIDANCE_STEPS];
  if (blockType === T.FAQ && collection === 'faqs') return [...COMMERCIAL_FAQS];
  if (blockType === T.LENDER_NETWORK && collection === 'items') return [...COMMERCIAL_LENDER_ITEMS];
  if (blockType === T.MORTGAGE_RATES && collection === 'items') return [...COMMERCIAL_RATE_ITEMS];
  if (blockType === T.FOOTER && collection === 'items') return [...COMMERCIAL_FOOTER_ITEMS];
  if (blockType === T.HERO && collection === 'slides') return [...COMMERCIAL_HERO_SLIDES];
  return null;
}
