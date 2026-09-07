import { LENDER_BANK_PRESETS } from '../classic/lenderBankPresets';

export const FIRST_HOME_HERO_SLIDE_MIN = 1;
export const FIRST_HOME_HERO_SLIDE_MAX = 3;

export const FIRST_HOME_HERO_SLIDES = Object.freeze([
  {
    id: 'slide-plan',
    eyebrow: 'Clarity before commitment',
    heading: 'A clear path to your first home',
    body: 'Understand affordability, down payment, and pre-approval—so every next step feels informed.',
    image_url: '',
  },
  {
    id: 'slide-preapproval',
    eyebrow: 'Pre-approval, explained',
    heading: 'Know your range before you shop',
    body: 'Strengthen your file, compare suitable options, and move forward with conditions you understand.',
    image_url: '',
  },
  {
    id: 'slide-closing',
    eyebrow: 'From offer to closing',
    heading: 'Steady guidance through the finish',
    body: 'Stay aligned on lender requirements, timelines, and decisions until the keys are in hand.',
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
  const zoom = clamp(slide.image_zoom ?? position.zoom, 0.6, 3, 1);
  const fit = slide.image_fit === 'contain' ? 'contain' : 'cover';
  return {
    x,
    y,
    zoom,
    fit,
    image_position: { x, y, zoom },
  };
}

export function commitFirstHomeHeroSlides(raw = [], options = {}) {
  const { fallbackCover = '' } = options;
  const source = Array.isArray(raw) ? raw.filter(Boolean) : [];
  if (!source.length) {
    return normalizeFirstHomeHeroSlides([], { fallbackCover });
  }
  const count = Math.min(Math.max(source.length, FIRST_HOME_HERO_SLIDE_MIN), FIRST_HOME_HERO_SLIDE_MAX);
  return Array.from({ length: count }, (_, index) => {
    const fallback = FIRST_HOME_HERO_SLIDES[index] || FIRST_HOME_HERO_SLIDES[0];
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

export function normalizeFirstHomeHeroSlides(raw = [], options = {}) {
  const { fallbackCover = '' } = options;
  const source = Array.isArray(raw) ? raw.filter(Boolean) : [];
  const count = source.length > 0
    ? Math.min(source.length, FIRST_HOME_HERO_SLIDE_MAX)
    : FIRST_HOME_HERO_SLIDE_MIN;

  return Array.from({ length: count }, (_, index) => {
    const fallback = FIRST_HOME_HERO_SLIDES[index] || FIRST_HOME_HERO_SLIDES[0];
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

export const FIRST_HOME_PROGRAM_ITEMS = Object.freeze([
  { id: 'program-high-ratio', title: 'High-ratio insured', description: 'For buyers putting less than 20% down—mortgage default insurance and lender rules explained early.', icon: 'home' },
  { id: 'program-conventional', title: 'Conventional first purchase', description: 'Paths with 20%+ down payment, standard qualification, and flexible amortization options.', icon: 'building' },
  { id: 'program-new-build', title: 'New construction', description: 'Builder deposits, progress draws, and occupancy timelines reviewed before you commit.', icon: 'shield' },
  { id: 'program-incentives', title: 'First-time buyer incentives', description: 'Federal and provincial programs reviewed for eligibility, documentation, and timing.', icon: 'percent' },
  { id: 'program-preapproval', title: 'Pre-approval pathway', description: 'Structured file preparation so you know your range and conditions before shopping.', icon: 'target' },
  { id: 'program-gifted-down', title: 'Gifted down payment', description: 'Lender requirements and documentation when family helps fund your first purchase.', icon: 'briefcase' },
]);

export const FIRST_HOME_SERVICES = Object.freeze([
  { id: 'service-affordability', title: 'Affordability planning', description: 'Estimate a comfortable price range using your income, debts, down payment, and ownership costs.', icon: 'calculator' },
  { id: 'service-preapproval', title: 'Pre-approval strategy', description: 'Build a stronger file and understand the conditions behind your pre-approval.', icon: 'shield' },
  { id: 'service-down-payment', title: 'Down-payment guidance', description: 'Review eligible sources, minimum requirements, insurance rules, and documentation.', icon: 'home' },
  { id: 'service-product', title: 'Mortgage comparison', description: 'Compare rates, terms, penalties, and flexibility—not only the advertised number.', icon: 'percent' },
]);

export const FIRST_HOME_GUIDANCE_STEPS = Object.freeze([
  { id: 'step-explore', title: 'Explore your numbers', description: 'Review income, debts, savings, and a realistic monthly comfort zone.', icon: 'search' },
  { id: 'step-prepare', title: 'Prepare your file', description: 'Gather documents, confirm your down payment, and address approval risks early.', icon: 'file' },
  { id: 'step-approve', title: 'Secure pre-approval', description: 'Compare suitable lender options and understand the conditions before shopping.', icon: 'shield' },
  { id: 'step-home', title: 'Move toward your home', description: 'Coordinate financing, appraisal, and lender requirements through closing.', icon: 'key' },
]);

export const FIRST_HOME_FAQS = Object.freeze([
  { id: 'faq-down-payment', q: 'How much down payment do I need for my first home?', a: 'The minimum depends on the purchase price and mortgage structure. Your full down payment must also be documented, so we review both the amount and its source early.' },
  { id: 'faq-preapproval', q: 'Does a pre-approval guarantee my mortgage?', a: 'No. Final approval still depends on the property, updated documents, lender conditions, and any material changes to your finances.' },
  { id: 'faq-budget', q: 'How is my affordable purchase price calculated?', a: 'Lenders consider income, existing debts, credit, down payment, property costs, interest-rate qualification rules, and the mortgage product.' },
  { id: 'faq-credit', q: 'Should I wait if my credit is not perfect?', a: 'Not necessarily. An early review can identify realistic options and give you a plan to strengthen your application.' },
  { id: 'faq-costs', q: 'What costs should I plan for beyond the down payment?', a: 'Plan for legal fees, appraisal or inspection costs, adjustments, moving expenses, property taxes, insurance, and a cash buffer.' },
]);

export const FIRST_HOME_FOOTER_ITEMS = Object.freeze([
  { id: 'footer-about', label: 'About', target: '#about' },
  { id: 'footer-services', label: 'Services', target: '#services' },
  { id: 'footer-roadmap', label: 'Roadmap', target: '#guidance' },
  { id: 'footer-rates', label: 'Rates', target: '#rates' },
  { id: 'footer-calculator', label: 'Calculator', target: '#calculator' },
  { id: 'footer-lenders', label: 'Lenders', target: '#lenders' },
  { id: 'footer-faq', label: 'FAQ', target: '#faq' },
  { id: 'footer-contact', label: 'Contact', target: '/contact' },
  { id: 'footer-booking', label: 'Book a consultation', target: '#contact' },
]);

export const FIRST_HOME_RATE_ITEMS = Object.freeze([
  { id: 'rate-5y-fixed', title: '5-Year Fixed', rate: 'Starting from —%', description: 'A common choice when you want payment stability through your first ownership years.' },
  { id: 'rate-3y-fixed', title: '3-Year Fixed', rate: 'Starting from —%', description: 'Shorter fixed term when you expect income or plans to change sooner.' },
  { id: 'rate-variable', title: 'Variable', rate: 'Starting from —%', description: 'Flexible options when you are comfortable with rate movement.' },
  { id: 'rate-high-ratio', title: 'High-ratio insured', rate: 'Custom review', description: 'For buyers putting less than 20% down with mortgage default insurance.' },
]);

export const FIRST_HOME_LENDER_ITEMS = Object.freeze(
  LENDER_BANK_PRESETS.slice(0, 12).map((preset) => ({
    id: `lender-${preset.id}`,
    title: preset.title,
    category: preset.category,
    domain: preset.domain,
    preset_key: preset.id,
    description: '',
  })),
);

export const FIRST_HOME_ALTERNATIVE_ITEMS = Object.freeze([
  { id: 'alt-self-employed', title: 'Self-employed income', description: 'Review business income documentation and lender programs that fit non-salary pay.', icon: 'briefcase' },
  { id: 'alt-gifted-down', title: 'Gifted down payment', description: 'Understand documentation and lender rules when part of your down payment is gifted.', icon: 'home' },
  { id: 'alt-credit', title: 'Credit rebuilding', description: 'Explore realistic paths when your score is still developing or recovering.', icon: 'shield' },
  { id: 'alt-non-traditional', title: 'Non-traditional income', description: 'Commission, contract, or variable income reviewed with suitable lender options.', icon: 'target' },
]);

export function brokerFirstHomeCollectionFallback(blockType, collection) {
  if (blockType === 'hero' && collection === 'slides') return FIRST_HOME_HERO_SLIDES;
  if (blockType === 'mortgage-programs' && collection === 'items') return FIRST_HOME_PROGRAM_ITEMS;
  if (blockType === 'services' && collection === 'items') return FIRST_HOME_SERVICES;
  if (blockType === 'guidance' && (collection === 'steps' || collection === 'items')) return FIRST_HOME_GUIDANCE_STEPS;
  if (blockType === 'mortgage-rates' && collection === 'items') return FIRST_HOME_RATE_ITEMS;
  if (blockType === 'lender-network' && collection === 'items') return FIRST_HOME_LENDER_ITEMS;
  if (blockType === 'alternative-lending' && collection === 'items') return FIRST_HOME_ALTERNATIVE_ITEMS;
  if (blockType === 'faq' && collection === 'faqs') return FIRST_HOME_FAQS;
  if (blockType === 'footer' && collection === 'items') return FIRST_HOME_FOOTER_ITEMS;
  return [];
}
