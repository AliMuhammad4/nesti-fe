import { STOREFRONT_BLOCK_TYPES, normalizeStorefrontRole } from '../storefrontPresets';
import { createBlock, normalizeBlocks } from './storefrontBuilderState';

const T = STOREFRONT_BLOCK_TYPES;

function block(type, content = {}, extras = {}) {
  return {
    type,
    data: {
      enabled: true,
      content,
      layout: {
        alignment: extras.align || 'left',
        padding: extras.padding || 'medium',
        width: 'full',
        hiddenOn: [],
        variant: extras.variant || '',
        mediaPosition: extras.mediaPosition || '',
        columns: String(extras.columns || ''),
        cardStyle: extras.cardStyle || '',
      },
      style: { background: extras.bg || '', textColor: extras.color || '', radius: extras.radius || 'default', shadow: extras.shadow || 'none' },
    },
  };
}

function brand(primary, accent, font, button_shape = 'rounded', image_style = 'editorial') {
  return { primary_color: primary, accent_color: accent, font, button_shape, image_style };
}

/**
 * Specialty templates: each one owns a distinct block stack, copy, and brand kit.
 * Selecting a template replaces page structure (with confirmation), not just colors.
 */
export const STOREFRONT_TEMPLATES = {
  'agent-classic': {
    id: 'agent-classic',
    role: 'agent',
    label: 'Realtor Classic',
    tagline: 'Full-service buyer & seller storefront',
    description: 'Hero, listings, valuation lead magnet, social proof, and consultation CTA.',
    features: ['Home valuation', 'Featured listings', 'Sold proof', 'Inquiry CTA'],
    brand: brand('#0f766e', '#f59e0b', 'Manrope', 'rounded', 'editorial'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || `Move smarter with ${ctx.name}`,
        body: ctx.tagline || 'Guided buying, selling, pricing, and consultation support in one polished experience.',
        cta_label: 'Book a free consultation',
        eyebrow: 'Local market partner',
      }),
      block(T.EXPERTISE),
      block(T.ROLE_DETAILS),
      block(T.ABOUT, { heading: `Meet ${ctx.name}`, body: ctx.about || 'A relationship-first advisor focused on clear next steps for buyers and sellers.' }),
      block(T.PROPERTIES),
      block(T.HOME_VALUATION, { heading: 'What could your home be worth?', body: 'Request a personalized local market review — no pressure, just clarity.' }),
      block(T.TESTIMONIALS, { heading: 'Client outcomes', body: 'Recent wins from buyers, sellers, and relocating families.' }),
      block(T.FEATURED_LISTINGS, { heading: 'Featured opportunities', body: 'Hand-picked listings ready for private showings.' }),
      block(T.SERVICES, { heading: 'How we work together', body: 'Search strategy, pricing guidance, and closing coordination.' }),
      block(T.GUIDANCE),
      block(T.CTA, { heading: 'Ready for your next move?', body: 'Share your goals and get a clear plan within one business day.', cta_label: 'Start a conversation' }),
    ],
  },
  'agent-luxury-advisor': {
    id: 'agent-luxury-advisor',
    role: 'agent',
    label: 'Luxury Advisor',
    tagline: 'Editorial presentation for premium listings',
    description: 'Dark refined palette, showcase listings, private consultation framing.',
    features: ['Luxury showcase', 'Private CTA', 'Sold prestige', 'Concierge tone'],
    brand: brand('#1c1917', '#c9a227', 'Playfair Display', 'square', 'editorial'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || `Discreet representation for ${ctx.area || 'discerning clients'}`,
        body: ctx.tagline || 'Confidential advisory for estate homes, waterfront, and architectural residences.',
        cta_label: 'Request a private consultation',
        eyebrow: 'Luxury advisory',
      }, { padding: 'large' }),
      block(T.FEATURED_LISTINGS, { heading: 'Signature properties', body: 'Curated inventory presented with discretion.' }),
      block(T.ABOUT, { heading: 'A quieter standard of service', body: ctx.about || 'White-glove representation with market intelligence and off-market access.' }),
      block(T.SERVICES, { heading: 'Concierge services', body: 'Acquisition strategy, staging direction, and global buyer outreach.' }),
      block(T.TESTIMONIALS, { heading: 'Client confidence', body: 'Trusted by families who value privacy and precision.' }),
      block(T.HOME_VALUATION, { heading: 'Confidential valuation', body: 'Receive a private market assessment for your residence.' }),
      block(T.CTA, { heading: 'Begin a private conversation', body: 'Share your timing and objectives for a tailored advisory call.', cta_label: 'Arrange a meeting' }),
    ],
  },
  'agent-first-home': {
    id: 'agent-first-home',
    role: 'agent',
    label: 'First Home Specialist',
    tagline: 'Warm guidance for first-time buyers',
    description: 'Education-first layout with valuation, guides, and low-pressure CTAs.',
    features: ['Buyer education', 'Valuation tool', 'Step-by-step guide', 'Friendly CTA'],
    brand: brand('#1d4ed8', '#fb7185', 'DM Sans', 'pill', 'warm'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || `Your first home, without the overwhelm`,
        body: ctx.tagline || `${ctx.name} helps first-time buyers compare neighborhoods, budgets, and offers with confidence.`,
        cta_label: 'Book a buyer consult',
        eyebrow: 'First-home specialist',
      }),
      block(T.GUIDANCE, { heading: 'What happens next', body: 'A simple path from pre-approval to keys.' }),
      block(T.SERVICES, { heading: 'Built for first-time buyers', body: 'Budget mapping, neighborhood tours, and offer coaching.' }),
      block(T.HOME_VALUATION, { heading: 'Curious what you can afford nearby?', body: 'Share a target area and get a realistic starting range.' }),
      block(T.PROPERTIES),
      block(T.TESTIMONIALS, { heading: 'Buyers who started here', body: 'Stories from people who bought their first place with clarity.' }),
      block(T.ABOUT, { heading: `Hi, I'm ${ctx.name}`, body: ctx.about || 'Patient, practical guidance for people buying their first home.' }),
      block(T.CTA, { heading: 'Let’s map your first offer', body: 'Bring your budget and timeline — we’ll outline the next three steps.', cta_label: 'Talk with me' }),
    ],
  },
  'agent-investor': {
    id: 'agent-investor',
    role: 'agent',
    label: 'Investor Specialist',
    tagline: 'Deal-flow oriented investor storefront',
    description: 'Listings, ROI framing, market proof, and fast inquiry CTAs.',
    features: ['Deal pipeline', 'Sold comps', 'Investor CTA', 'Analytics tone'],
    brand: brand('#172554', '#22c55e', 'Manrope', 'rounded', 'minimal'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || `Investment inventory with clear numbers`,
        body: ctx.tagline || 'Underwrite opportunities faster with comps, cash-flow framing, and private deal alerts.',
        cta_label: 'Request deal brief',
        eyebrow: 'Investor desk',
      }),
      block(T.FEATURED_LISTINGS, { heading: 'Active opportunities', body: 'Current inventory screened for investor criteria.' }),
      block(T.SERVICES, { heading: 'Investor services', body: 'Acquisition, repositioning, and portfolio expansion support.' }),
      block(T.GUIDANCE, {
        heading: 'Your investor journey',
        body: 'A clear path from defining your criteria to reviewing opportunities and planning the next move.',
        steps: [
          'Define your criteria|Share your target markets, property type, budget, yield goals, and preferred hold period.',
          'Review opportunities|Compare available properties with practical context around fit, risk, and potential.',
          'Plan the next move|Organize questions, request details, and move into a focused consultation with useful context.',
        ],
        faqs: [
          'Can I ask about a specific opportunity?|Yes. Open a property card or use the chat assistant to carry the listing context into your inquiry.',
          'Can first-time investors use this page?|Yes. The guided flow helps clarify budget, goals, financing readiness, and next steps.',
          'How do I request a portfolio review?|Use the valuation or consultation options and share the property and investment context.',
        ],
      }),
      block(T.ABOUT, {
        heading: `About ${ctx.name}`,
        body: ctx.about || `${ctx.name} provides investment-focused real estate guidance across acquisitions, property evaluation, and portfolio decisions.`,
      }),
      block(T.HOME_VALUATION, { heading: 'Portfolio check-in', body: 'Request a quick mark-to-market review on a property you hold.' }),
      block(T.TESTIMONIALS, { heading: 'Investor partners', body: 'Operators and first-time investors who rely on this desk.' }),
      block(T.CTA, { heading: 'Get the next brief', body: 'Tell us your target yield, markets, and hold period.', cta_label: 'Join the deal list' }),
    ],
  },
  'agent-seller-expert': {
    id: 'agent-seller-expert',
    role: 'agent',
    label: 'Seller Expert',
    tagline: 'Conversion-focused seller landing page',
    description: 'Valuation-first funnel with staging, pricing, and sold proof.',
    features: ['Valuation lead', 'Sold proof', 'Seller services', 'Urgent CTA'],
    brand: brand('#9f1239', '#f59e0b', 'DM Sans', 'rounded', 'bold'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || `Sell with a pricing plan that protects value`,
        body: ctx.tagline || 'Positioning, launch timing, and negotiation strategy built around your home.',
        cta_label: 'Get my home valuation',
        eyebrow: 'Seller specialist',
      }),
      block(T.HOME_VALUATION, { heading: 'Start with your number', body: 'Enter your address for a personalized seller consultation.' }),
      block(T.SERVICES, { heading: 'Seller playbook', body: 'Prep, marketing, offer review, and closing coordination.' }),
      block(T.TESTIMONIALS, { heading: 'Seller reviews', body: 'Homeowners who sold with clarity and speed.' }),
      block(T.ABOUT, { heading: 'Why sellers choose this team', body: ctx.about || 'A seller-first process designed to reduce surprises and maximize net proceeds.' }),
      block(T.CTA, { heading: 'Ready to price with confidence?', body: 'We’ll review comps, condition, and launch timing together.', cta_label: 'Book seller consult' }),
    ],
  },
  'agent-community-expert': {
    id: 'agent-community-expert',
    role: 'agent',
    label: 'Community Expert',
    tagline: 'Neighborhood authority storefront',
    description: 'Local market narrative, area focus, listings, and community CTA.',
    features: ['Area authority', 'Listings', 'Local CTA', 'Warm brand'],
    brand: brand('#166534', '#f97316', 'Manrope', 'pill', 'warm'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || `Your guide to ${ctx.area || 'the neighborhood'}`,
        body: ctx.tagline || 'Schools, lifestyle, inventory, and pricing — explained by someone who lives the market.',
        cta_label: 'Ask about my area',
        eyebrow: 'Community expert',
      }),
      block(T.EXPERTISE),
      block(T.ROLE_DETAILS),
      block(T.PROPERTIES),
      block(T.FEATURED_LISTINGS, { heading: `Homes in ${ctx.area || 'your area'}`, body: 'Active inventory selected for this community.' }),
      block(T.GUIDANCE, { heading: 'Local buying & selling guide', body: 'What newcomers and move-up buyers ask most.' }),
      block(T.TESTIMONIALS, { heading: 'Neighbors we’ve helped', body: 'Families relocating into and within this community.' }),
      block(T.HOME_VALUATION, { heading: 'Local home value check', body: 'Get a neighborhood-calibrated estimate conversation.' }),
      block(T.CTA, { heading: 'Talk local with someone who knows', body: `Ask ${ctx.name} about streets, schools, and timing.`, cta_label: 'Message me' }),
    ],
  },

  'mortgage_broker-classic': {
    id: 'mortgage_broker-classic',
    role: 'mortgage_broker',
    label: 'Mortgage Advisor',
    tagline: 'Full mortgage hub with calculator',
    description: 'Affordability tool, programs, education, and strategy CTA.',
    features: ['Affordability calc', 'Programs', 'Learning hub', 'Strategy call'],
    brand: brand('#0f172a', '#38bdf8', 'Manrope', 'rounded', 'minimal'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'Find the right mortgage with confidence',
        body: ctx.tagline || 'Compare options, check affordability, and book a free strategy call — all in one place.',
        cta_label: 'Book a free consultation',
        eyebrow: 'Mortgage hub',
      }),
      block(T.MORTGAGE_CALCULATOR, { heading: 'Affordability calculator', body: 'Estimate purchasing power before you tour homes.' }),
      block(T.MORTGAGE_PROGRAMS, { heading: 'Mortgage paths we structure', body: 'Fixed, variable, refinance, and self-employed options.' }),
      block(T.SERVICES, { heading: 'Advisory services', body: 'Pre-approval, renewals, refinancing, and product comparison.' }),
      block(T.GUIDANCE, { heading: 'Mortgage learning centre', body: 'Clear answers on rates, documents, and timelines.' }),
      block(T.TESTIMONIALS, { heading: 'Client savings stories', body: 'Real families who optimized payments and terms.' }),
      block(T.ABOUT, { heading: `Work with ${ctx.name}`, body: ctx.about || 'Independent advice focused on fit — not just the headline rate.' }),
      block(T.CTA, { heading: 'Book a strategy call', body: 'Bring income, debts, and goals — leave with a clearer plan.', cta_label: 'Schedule now' }),
    ],
  },
  'mortgage_broker-first-home': {
    id: 'mortgage_broker-first-home',
    role: 'mortgage_broker',
    label: 'First Home Specialist',
    tagline: 'First-time buyer financing funnel',
    description: 'Calculator-first page with education and soft CTA.',
    features: ['Calc first', 'Buyer education', 'Soft CTA', 'Warm palette'],
    brand: brand('#075985', '#fbbf24', 'DM Sans', 'pill', 'warm'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'First mortgage, explained simply',
        body: ctx.tagline || 'Down payment, stress test, and pre-approval — made understandable.',
        cta_label: 'Check my affordability',
        eyebrow: 'First-home financing',
      }),
      block(T.MORTGAGE_CALCULATOR, { heading: 'See what you may qualify for', body: 'A starting estimate before you speak with a lender.' }),
      block(T.GUIDANCE, { heading: 'First-time buyer checklist', body: 'Documents, timelines, and common surprises.' }),
      block(T.SERVICES, { heading: 'How we help first buyers', body: 'Pre-approval coaching and product comparison.' }),
      block(T.TESTIMONIALS, { heading: 'First homes financed', body: 'Buyers who felt ready before offer day.' }),
      block(T.CTA, { heading: 'Ready for pre-approval?', body: 'We’ll review numbers and next steps together.', cta_label: 'Start pre-approval' }),
    ],
  },
  'mortgage_broker-wealth': {
    id: 'mortgage_broker-wealth',
    role: 'mortgage_broker',
    label: 'Wealth Strategist',
    tagline: 'Portfolio and leverage strategy page',
    description: 'Premium advisory framing for investors and high-equity clients.',
    features: ['Wealth tone', 'Programs', 'Calc', 'Premium CTA'],
    brand: brand('#312e81', '#d4af37', 'Playfair Display', 'square', 'editorial'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'Structure leverage around your wealth goals',
        body: ctx.tagline || 'Investment financing, HELOC strategy, and multi-property structuring.',
        cta_label: 'Book a strategy session',
        eyebrow: 'Wealth mortgage desk',
      }),
      block(T.MORTGAGE_PROGRAMS, { heading: 'Capital strategies', body: 'Investment, HELOC, commercial, and private pathways.' }),
      block(T.MORTGAGE_CALCULATOR, { heading: 'Scenario modeller', body: 'Stress purchase price and payment outcomes.' }),
      block(T.SERVICES, { heading: 'Advisory scope', body: 'Portfolio reviews and refinancing windows.' }),
      block(T.TESTIMONIALS, { heading: 'Strategic clients', body: 'Investors who optimized structure and cash flow.' }),
      block(T.CTA, { heading: 'Design your next move', body: 'Share assets, income, and target leverage.', cta_label: 'Request advisory call' }),
    ],
  },
  'mortgage_broker-renewal': {
    id: 'mortgage_broker-renewal',
    role: 'mortgage_broker',
    label: 'Renewal Expert',
    tagline: 'Renewal and refinance conversion page',
    description: 'Urgency-aware renewal funnel with calculator and CTA.',
    features: ['Renewal focus', 'Rate alert CTA', 'Calc', 'Proof'],
    brand: brand('#155e75', '#2dd4bf', 'Inter', 'rounded', 'minimal'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'Don’t renew on autopilot',
        body: ctx.tagline || 'Compare renewal offers, refinance options, and break costs before you sign.',
        cta_label: 'Review my renewal',
        eyebrow: 'Renewal specialist',
      }),
      block(T.MORTGAGE_CALCULATOR, { heading: 'Payment comparison', body: 'Model current vs. new payment scenarios.' }),
      block(T.SERVICES, { heading: 'Renewal playbook', body: 'Offer review, switch analysis, and timing advice.' }),
      block(T.GUIDANCE, { heading: 'What to prepare', body: 'Documents and timelines before your maturity date.' }),
      block(T.TESTIMONIALS, { heading: 'Renewals that saved money', body: 'Clients who renegotiated with better terms.' }),
      block(T.CTA, { heading: 'Send your renewal letter', body: 'We’ll compare it against better market options.', cta_label: 'Upload my offer' }),
    ],
  },
  'mortgage_broker-commercial': {
    id: 'mortgage_broker-commercial',
    role: 'mortgage_broker',
    label: 'Commercial Mortgage',
    tagline: 'Commercial and multi-unit financing page',
    description: 'Bold commercial tone with programs and deal CTA.',
    features: ['Commercial programs', 'Deal CTA', 'Calc', 'Bold brand'],
    brand: brand('#111827', '#fb923c', 'Manrope', 'square', 'bold'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'Commercial financing built for operators',
        body: ctx.tagline || 'Multi-unit, mixed-use, and business-purpose lending pathways.',
        cta_label: 'Submit a deal',
        eyebrow: 'Commercial desk',
      }),
      block(T.MORTGAGE_PROGRAMS, { heading: 'Commercial products', body: 'CMHC multi, conventional, bridge, and private options.' }),
      block(T.SERVICES, { heading: 'Transaction support', body: 'Term sheets, underwriting packages, and lender matching.' }),
      block(T.MORTGAGE_CALCULATOR, { heading: 'Quick payment model', body: 'Estimate debt service for preliminary analysis.' }),
      block(T.CTA, { heading: 'Send the package', body: 'Share rent roll, purchase price, and target LTV.', cta_label: 'Start commercial file' }),
    ],
  },

  'lawyer-classic': {
    id: 'lawyer-classic',
    role: 'lawyer',
    label: 'Real Estate Lawyer Classic',
    tagline: 'Trusted closing centre experience',
    description: 'Estimator, practice areas, credentials, timeline guidance.',
    features: ['Cost estimator', 'Practice areas', 'Credentials', 'Secure CTA'],
    brand: brand('#172554', '#c9a227', 'Playfair Display', 'rounded', 'editorial'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'Your real estate closing starts here',
        body: ctx.tagline || 'Transparent pricing, clear timelines, and expert guidance from offer to registration.',
        cta_label: 'Request a quote',
        eyebrow: 'Closing centre',
      }),
      block(T.CLOSING_COST_ESTIMATOR, { heading: 'Instant closing cost estimate', body: 'Model legal fees and transfer costs before you commit.' }),
      block(T.PRACTICE_AREAS, { heading: 'How we can help', body: 'Purchase, sale, refinance, and title matters.' }),
      block(T.GUIDANCE, { heading: 'Closing timeline', body: 'What happens between accepted offer and keys.' }),
      block(T.CREDENTIALS, { heading: 'Credentials & trust', body: 'Licensing, associations, and firm standing.' }),
      block(T.TESTIMONIALS, { heading: 'Client closings', body: 'Buyers and sellers who closed with confidence.' }),
      block(T.ABOUT, { heading: `Meet ${ctx.name}`, body: ctx.about || 'Practical legal counsel focused on clarity and timelines.' }),
      block(T.CTA, { heading: 'Book your closing consultation', body: 'Tell us transaction type, province, and closing date.', cta_label: 'Book consultation' }),
    ],
  },
  'lawyer-first-home-closing': {
    id: 'lawyer-first-home-closing',
    role: 'lawyer',
    label: 'First Home Closing Expert',
    tagline: 'First-time buyer closing funnel',
    description: 'Estimator-led page with plain-language guidance.',
    features: ['Estimator', 'Buyer FAQ', 'Warm CTA', 'Education'],
    brand: brand('#1e3a8a', '#60a5fa', 'DM Sans', 'pill', 'warm'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'First closing, without legal jargon',
        body: ctx.tagline || 'Understand costs, documents, and signing day before stress builds.',
        cta_label: 'Estimate my closing costs',
        eyebrow: 'First-home closings',
      }),
      block(T.CLOSING_COST_ESTIMATOR, { heading: 'Know your closing number', body: 'A practical estimate for first-time purchases.' }),
      block(T.GUIDANCE, { heading: 'What first buyers ask us', body: 'Title insurance, deposits, and signing logistics.' }),
      block(T.PRACTICE_AREAS, { heading: 'Purchase closings', body: 'Residential purchase support from APS to keys.' }),
      block(T.CTA, { heading: 'Talk through your offer', body: 'Share your APS and target closing date.', cta_label: 'Start my file' }),
    ],
  },
  'lawyer-commercial': {
    id: 'lawyer-commercial',
    role: 'lawyer',
    label: 'Commercial Real Estate Law',
    tagline: 'Commercial transaction counsel page',
    description: 'Bold commercial practice areas and deal intake CTA.',
    features: ['Commercial areas', 'Credentials', 'Deal CTA', 'Bold brand'],
    brand: brand('#111827', '#b45309', 'Manrope', 'square', 'bold'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'Commercial closings with operational clarity',
        body: ctx.tagline || 'Leases, acquisitions, refinancing, and title work for business properties.',
        cta_label: 'Open a commercial file',
        eyebrow: 'Commercial counsel',
      }),
      block(T.PRACTICE_AREAS, { heading: 'Commercial mandates', body: 'Purchase, sale, lease, and financing counsel.' }),
      block(T.CREDENTIALS, { heading: 'Firm credentials', body: 'Experience across sophisticated real estate matters.' }),
      block(T.SERVICES, { heading: 'Engagement model', body: 'Scoped retainers with clear milestones.' }),
      block(T.CTA, { heading: 'Send the term sheet', body: 'We’ll outline diligence and closing steps.', cta_label: 'Request engagement' }),
    ],
  },
  'lawyer-investor': {
    id: 'lawyer-investor',
    role: 'lawyer',
    label: 'Investor Transaction Lawyer',
    tagline: 'Investor transaction and title desk',
    description: 'Estimator + practice areas for multi-property clients.',
    features: ['Investor focus', 'Estimator', 'Credentials', 'Fast CTA'],
    brand: brand('#312e81', '#a78bfa', 'Inter', 'rounded', 'minimal'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'Transaction counsel for active investors',
        body: ctx.tagline || 'Purchases, refinances, assignments, and portfolio title work.',
        cta_label: 'Start investor intake',
        eyebrow: 'Investor legal desk',
      }),
      block(T.CLOSING_COST_ESTIMATOR, { heading: 'Model closing costs', body: 'Estimate costs across purchase price and province.' }),
      block(T.PRACTICE_AREAS, { heading: 'Investor workstreams', body: 'Acquisitions, refinancing, and entity transfers.' }),
      block(T.CREDENTIALS, { heading: 'Trusted on volume files', body: 'Process discipline for repeat investors.' }),
      block(T.CTA, { heading: 'Send the next deal', body: 'Share APS, entity, and target closing.', cta_label: 'Open file' }),
    ],
  },
  'lawyer-newcomer': {
    id: 'lawyer-newcomer',
    role: 'lawyer',
    label: 'Newcomer Home Specialist',
    tagline: 'Newcomer-friendly closing experience',
    description: 'Warm guidance, estimator, and multilingual-ready CTA.',
    features: ['Newcomer focus', 'Estimator', 'FAQ', 'Warm CTA'],
    brand: brand('#0f766e', '#fb923c', 'DM Sans', 'pill', 'warm'),
    blocks: (ctx) => [
      block(T.HERO, {
        heading: ctx.headline || 'Closing support for newcomers',
        body: ctx.tagline || 'Plain-language guidance on Canadian purchase closings, costs, and documents.',
        cta_label: 'Ask about my closing',
        eyebrow: 'Newcomer specialist',
      }),
      block(T.CLOSING_COST_ESTIMATOR, { heading: 'Understand Canadian closing costs', body: 'A transparent estimate before you finalize financing.' }),
      block(T.GUIDANCE, { heading: 'Newcomer closing guide', body: 'ID, funds, insurance, and signing day expectations.' }),
      block(T.PRACTICE_AREAS, { heading: 'Purchase support', body: 'Residential closings for new-to-Canada buyers.' }),
      block(T.TESTIMONIALS, { heading: 'Families we helped settle', body: 'Newcomers who closed with less stress.' }),
      block(T.CTA, { heading: 'We’re ready when you are', body: 'Share your offer and preferred language for follow-up.', cta_label: 'Start consultation' }),
    ],
  },
};

export function listTemplatesForRole(role) {
  const normalized = normalizeStorefrontRole(role);
  return Object.values(STOREFRONT_TEMPLATES).filter((template) => template.role === normalized);
}

export function getStorefrontTemplate(templateKey) {
  return STOREFRONT_TEMPLATES[templateKey] || null;
}

export function buildTemplateContext(profile = {}) {
  const name = profile.professional_name
    || profile.full_name
    || [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    || 'your advisor';
  const area = profile.brand_kit?.essentials?.service_area
    || profile.service_areas?.[0]
    || profile.city
    || '';
  return {
    name,
    area,
    headline: profile.headline || '',
    tagline: profile.tagline || '',
    about: typeof profile.about === 'string' ? profile.about : '',
  };
}

function visualTreatmentForTemplate(templateId, type, index) {
  const isHero = type === T.HERO;
  const isListing = [T.PROPERTIES, T.FEATURED_LISTINGS, T.TOP_LISTINGS, T.SOLD_LISTINGS].includes(type);
  const isTool = [T.HOME_VALUATION, T.MORTGAGE_CALCULATOR, T.CLOSING_COST_ESTIMATOR].includes(type);
  const palette = {
    'agent-luxury-advisor': {
      bg: index % 2 === 0 ? '#faf7ef' : '#ffffff',
      align: isHero ? 'left' : 'center',
      padding: isHero ? 'large' : 'large',
      radius: index % 2 === 0 ? 'large' : 'default',
      variant: isHero ? 'premium' : isListing ? 'editorial' : 'split',
      cardStyle: 'elevated',
      columns: isListing ? '4' : '2',
      mediaPosition: isHero ? 'background' : 'right',
      width: 'full',
      shadow: 'large',
    },
    'agent-first-home': {
      bg: index % 2 === 0 ? '#eff6ff' : '#fff7ed',
      align: isHero || index < 3 ? 'center' : 'left',
      padding: 'medium',
      radius: 'large',
      variant: isHero ? 'feature-grid' : isTool ? 'lead-magnet' : 'standard',
      cardStyle: 'glass',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: 'contained',
      shadow: 'medium',
    },
    'agent-investor': {
      bg: index % 2 === 0 ? '#ffffff' : '#f8fafc',
      align: 'left',
      padding: index <= 2 ? 'large' : 'medium',
      radius: 'none',
      variant: isListing ? 'feature-grid' : 'minimal',
      cardStyle: 'bordered',
      columns: isListing ? '4' : '2',
      mediaPosition: 'none',
      width: isListing ? 'full' : 'full',
      shadow: 'none',
    },
    'agent-seller-expert': {
      bg: index % 2 === 0 ? '#fff1f2' : '#fffbeb',
      align: isHero || type === T.HOME_VALUATION ? 'center' : 'left',
      padding: type === T.HOME_VALUATION ? 'large' : 'medium',
      radius: 'large',
      variant: isTool ? 'lead-magnet' : isHero ? 'split' : 'standard',
      cardStyle: 'elevated',
      columns: '2',
      mediaPosition: isHero ? 'right' : 'none',
      width: isTool ? 'narrow' : 'contained',
      shadow: 'medium',
    },
    'agent-community-expert': {
      bg: index % 2 === 0 ? '#f0fdf4' : '#fff7ed',
      align: index <= 1 ? 'center' : 'left',
      padding: 'medium',
      radius: 'large',
      variant: isHero ? 'editorial' : 'feature-grid',
      cardStyle: 'glass',
      columns: '3',
      mediaPosition: isHero ? 'background' : 'none',
      width: 'contained',
      shadow: 'medium',
    },
    'mortgage_broker-classic': {
      bg: index % 2 === 0 ? '#f8fafc' : '#ffffff',
      align: isHero ? 'left' : 'center',
      padding: isTool ? 'large' : 'medium',
      radius: isTool ? 'large' : 'default',
      variant: isHero ? 'split' : isTool ? 'lead-magnet' : 'feature-grid',
      cardStyle: isTool ? 'elevated' : 'bordered',
      columns: '3',
      mediaPosition: isHero ? 'right' : 'none',
      width: isTool ? 'narrow' : 'contained',
      shadow: isTool ? 'large' : 'small',
    },
    'mortgage_broker-first-home': {
      bg: index % 2 === 0 ? '#eff6ff' : '#fff7ed',
      align: isHero || isTool ? 'center' : 'left',
      padding: isHero || isTool ? 'large' : 'medium',
      radius: 'large',
      variant: isHero ? 'editorial' : isTool ? 'lead-magnet' : 'standard',
      cardStyle: 'glass',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: isTool ? 'narrow' : 'contained',
      shadow: 'medium',
    },
    'mortgage_broker-wealth': {
      bg: index % 2 === 0 ? '#f5f3ff' : '#fff7ed',
      align: isHero ? 'center' : 'left',
      padding: 'large',
      radius: 'default',
      variant: 'premium',
      cardStyle: 'elevated',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'right',
      width: 'contained',
      shadow: 'large',
    },
    'mortgage_broker-renewal': {
      bg: index % 2 === 0 ? '#ecfeff' : '#ffffff',
      align: isHero ? 'center' : 'left',
      padding: isHero || isTool ? 'large' : 'medium',
      radius: 'large',
      variant: isHero ? 'lead-magnet' : isTool ? 'split' : 'standard',
      cardStyle: 'elevated',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: isHero || isTool ? 'narrow' : 'contained',
      shadow: 'medium',
    },
    'mortgage_broker-commercial': {
      bg: index % 2 === 0 ? '#f8fafc' : '#fef3c7',
      align: 'left',
      padding: 'large',
      radius: 'none',
      variant: 'minimal',
      cardStyle: 'bordered',
      columns: '3',
      mediaPosition: 'none',
      width: 'full',
      shadow: 'none',
    },
    'lawyer-classic': {
      bg: index % 2 === 0 ? '#f8fafc' : '#ffffff',
      align: isHero ? 'left' : 'center',
      padding: isHero || isTool ? 'large' : 'medium',
      radius: 'default',
      variant: isHero ? 'split' : isTool ? 'lead-magnet' : 'editorial',
      cardStyle: isTool ? 'elevated' : 'bordered',
      columns: '2',
      mediaPosition: isHero ? 'right' : 'none',
      width: isTool ? 'narrow' : 'contained',
      shadow: isTool ? 'large' : 'small',
    },
    'lawyer-first-home-closing': {
      bg: index % 2 === 0 ? '#eff6ff' : '#ffffff',
      align: isHero || isTool ? 'center' : 'left',
      padding: isHero || isTool ? 'large' : 'medium',
      radius: 'large',
      variant: isHero ? 'editorial' : isTool ? 'lead-magnet' : 'standard',
      cardStyle: 'glass',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: isTool ? 'narrow' : 'contained',
      shadow: 'medium',
    },
    'lawyer-commercial': {
      bg: index % 2 === 0 ? '#f8fafc' : '#fef3c7',
      align: 'left',
      padding: 'large',
      radius: 'none',
      variant: 'minimal',
      cardStyle: 'bordered',
      columns: '2',
      mediaPosition: 'none',
      width: 'full',
      shadow: 'none',
    },
    'lawyer-investor': {
      bg: index % 2 === 0 ? '#f5f3ff' : '#ffffff',
      align: 'left',
      padding: isHero ? 'large' : 'medium',
      radius: 'none',
      variant: isTool ? 'lead-magnet' : 'minimal',
      cardStyle: 'bordered',
      columns: '2',
      mediaPosition: 'none',
      width: isTool ? 'narrow' : 'full',
      shadow: 'none',
    },
    'lawyer-newcomer': {
      bg: index % 2 === 0 ? '#f0fdf4' : '#fff7ed',
      align: isHero || isTool ? 'center' : 'left',
      padding: 'medium',
      radius: 'large',
      variant: isHero ? 'feature-grid' : isTool ? 'lead-magnet' : 'standard',
      cardStyle: 'glass',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: 'contained',
      shadow: 'medium',
    },
  }[templateId];

  if (palette) return palette;

  return {
    bg: index % 2 === 0 ? '#ffffff' : '#f8fafc',
    align: isHero ? 'left' : 'left',
    padding: isHero ? 'large' : 'medium',
    radius: 'default',
    variant: isHero ? 'standard' : isTool ? 'lead-magnet' : 'standard',
    cardStyle: 'bordered',
    columns: '3',
    mediaPosition: isHero ? 'background' : 'none',
    width: isTool ? 'narrow' : 'full',
    shadow: 'small',
  };
}

export function materializeTemplate(templateKey, profile = {}, existingBrandKit = {}) {
  const template = getStorefrontTemplate(templateKey);
  if (!template) return null;
  const ctx = buildTemplateContext(profile);
  const rawBlocks = template.blocks(ctx).map((entry, index) => {
    const created = createBlock(entry.type);
    const visual = visualTreatmentForTemplate(template.id, entry.type, index);
    return {
      ...created,
      id: `${entry.type}-${index + 1}`,
      data: {
        ...created.data,
        ...entry.data,
        content: { ...created.data.content, ...(entry.data?.content || {}) },
        layout: {
          ...created.data.layout,
          ...(entry.data?.layout || {}),
          alignment: visual.align,
          padding: visual.padding,
          width: visual.width,
          variant: visual.variant,
          mediaPosition: visual.mediaPosition,
          columns: visual.columns,
          cardStyle: visual.cardStyle,
        },
        style: {
          ...created.data.style,
          background: visual.bg,
          radius: visual.radius,
          shadow: visual.shadow,
          ...(entry.data?.style || {}),
        },
      },
    };
  });

  return {
    template_key: template.id,
    brand_kit: {
      ...existingBrandKit,
      ...template.brand,
      business_name: existingBrandKit.business_name || profile.professional_profile?.company_name || '',
      logo_url: existingBrandKit.logo_url || '',
    },
    blocks: normalizeBlocks(rawBlocks),
  };
}

export function seedBlockContentFromProfile(blocks = [], profile = {}, templateKey = '') {
  const ctx = buildTemplateContext(profile);
  return normalizeBlocks(blocks).map((block, index) => {
    const originalLayout = blocks[index]?.data?.layout || {};
    const originalStyle = blocks[index]?.data?.style || {};
    const content = { ...block.data.content };
    const visual = visualTreatmentForTemplate(templateKey, block.type, index);
    if (block.type === T.HERO) {
      if (!content.heading) content.heading = ctx.headline || `Work with ${ctx.name}`;
      if (!content.body) content.body = ctx.tagline || '';
      if (!content.cta_label) content.cta_label = 'Book a consultation';
    }
    if (block.type === T.ABOUT) {
      if (!content.heading) content.heading = `About ${ctx.name}`;
      if (!content.body) content.body = ctx.about || '';
    }
    if (block.type === T.CTA) {
      if (!content.heading) content.heading = 'Ready to talk?';
      if (!content.cta_label) content.cta_label = 'Start a conversation';
    }
    return {
      ...block,
      data: {
        ...block.data,
        content,
        layout: {
          ...block.data.layout,
          alignment: originalLayout.alignment || visual.align,
          padding: originalLayout.padding || visual.padding,
          width: originalLayout.width || visual.width,
          variant: originalLayout.variant || visual.variant,
          mediaPosition: originalLayout.mediaPosition || visual.mediaPosition,
          columns: String(originalLayout.columns || visual.columns),
          cardStyle: originalLayout.cardStyle || visual.cardStyle,
        },
        style: {
          ...block.data.style,
          background: originalStyle.background || visual.bg,
          radius: originalStyle.radius || visual.radius,
          shadow: originalStyle.shadow || visual.shadow,
        },
      },
    };
  });
}
