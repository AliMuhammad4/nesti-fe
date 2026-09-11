import { block, brand, T } from '../shared/blockFactory';
import {
  COMMERCIAL_FAQS,
  COMMERCIAL_FOOTER_ITEMS,
  COMMERCIAL_GUIDANCE_STEPS,
  COMMERCIAL_HERO_SLIDES,
  COMMERCIAL_LENDER_ITEMS,
  COMMERCIAL_PROGRAM_ITEMS,
  COMMERCIAL_RATE_ITEMS,
  COMMERCIAL_SERVICE_ITEMS,
  COMMERCIAL_WHO_WE_HELP,
  COMMERCIAL_EXPERTISE_ITEMS,
  COMMERCIAL_ALTERNATIVE_ITEMS,
} from '../../renderers/variants/broker/commercial/brokerCommercialDefaults';
import { COMMERCIAL_PALETTE as P } from '../../renderers/variants/broker/commercial/brokerCommercialPalette';

const PRIMARY = P.primary;
const ACCENT = P.accent;
const PAGE = P.page;
const FOOTER = P.footer;

const anim = (type = 'slide-up', trigger = 'scroll') => ({
  animationType: type,
  animationTrigger: trigger,
  animationDuration: 'medium',
  animationIntensity: 'subtle',
});

const mortgageBrokerCommercial = {
  id: 'mortgage_broker-commercial',
  role: 'mortgage_broker',
  experience: 'industrial-minimal',
  label: 'Commercial Mortgage',
  tagline: 'Corporate commercial financing storefront',
  description: 'Bizness-inspired commercial desk with a 3-slide hero, 19 layers, and full builder control.',
  features: [
    '3-slide commercial hero',
    'Programs & services',
    'Who we help',
    'Private & alternative lending',
    'Rates & calculator',
    'Lender network',
    'Deal CTA',
  ],
  brand: brand(PRIMARY, ACCENT, 'Manrope', 'rounded', 'bold', PAGE),
  blocks: (ctx) => [
    block(T.HERO, {
      broker_commercial_design_version: 1,
      primary_cta_label: 'Submit a deal',
      cta_label: 'Book a consultation',
      join_label: 'Join Nesti',
      slides: (() => {
        const slide = COMMERCIAL_HERO_SLIDES[0];
        const profileHeadline = String(ctx.headline || '').trim();
        const useProfileHeading = profileHeadline && profileHeadline.length <= 48;
        const profileTagline = String(ctx.tagline || '').trim();
        const useProfileBody = profileTagline && profileTagline.length <= 160;
        return COMMERCIAL_HERO_SLIDES.map((entry, index) => (
          index === 0
            ? {
                ...entry,
                heading: useProfileHeading ? profileHeadline : entry.heading,
                body: useProfileBody ? profileTagline : entry.body,
              }
            : { ...entry }
        ));
      })(),
    }, {
      bg: PRIMARY,
      color: P.white,
      padding: 'large',
      mediaPosition: 'background',
      align: 'center',
      // Fixed PublicStorefrontHeader cannot live under a transformed band.
      animationType: 'none',
    }),
    block(T.PRACTICE_SNAPSHOT, {
      eyebrow: 'Commercial snapshot',
      heading: 'Deal desk metrics that matter',
      body: 'A concise view of financing specialties, markets served, and consultation languages.',
      practice_focus_label: 'Commercial focus',
      practice_focus_subtitle: 'Asset classes supported',
      markets_label: 'Markets served',
      markets_subtitle: 'Service areas and communities',
      languages_label: 'Languages spoken',
      languages_subtitle: 'Consultation accessibility',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '3',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.WHO_WE_HELP, {
      eyebrow: 'Who we help',
      heading: 'Built for commercial operators',
      body: 'Sponsors, developers, and multi-unit investors who need clear capital options.',
      items: [...COMMERCIAL_WHO_WE_HELP],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '4',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.MORTGAGE_PROGRAMS, {
      eyebrow: 'Commercial products',
      heading: 'Programs built for income-producing deals',
      body: 'CMHC multi, conventional CRE, bridge, construction, and private pathways compared side by side.',
      items: [...COMMERCIAL_PROGRAM_ITEMS],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '3',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.SERVICES, {
      eyebrow: 'Transaction support',
      heading: 'From package to term sheet',
      body: 'Term sheets, underwriting packages, lender matching, and DSCR planning.',
      items: [...COMMERCIAL_SERVICE_ITEMS],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '4',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.ROLE_DETAILS, {
      eyebrow: 'Business & commercial',
      heading: 'Verticals we finance',
      body: 'Fast approvals, clear documentation pathways, and structures for multi-unit and commercial needs.',
      snapshot_eyebrow: 'Commercial finance snapshot',
      snapshot_heading: 'Financing structured around the asset, leverage, and timeline.',
      cta_label: 'Request a commercial review',
      highlights: [
        { id: 'highlight-dscr', title: 'DSCR and leverage reviewed before term sheet' },
        { id: 'highlight-package', title: 'Lender-ready packages for multi-unit and CRE' },
        { id: 'highlight-stack', title: 'Capital stack options across bank and specialty desks' },
      ],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '3',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.EXPERTISE, {
      eyebrow: 'Deal specialties',
      heading: 'Expertise that keeps leverage disciplined',
      body: 'DSCR, LTV, asset class, and funding timelines reviewed before you commit.',
      items: [...COMMERCIAL_EXPERTISE_ITEMS],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '3',
      cardStyle: 'elevated',
      ...anim(),
    }),
    block(T.ABOUT, {
      eyebrow: 'Your commercial desk',
      heading: `Meet ${ctx.name || 'your advisor'}`,
      body: ctx.about || 'A relationship-first mortgage advisor focused on clear next steps for commercial and multi-unit financing.',
      trust_statement: 'Advice shaped around the asset, leverage, and funding timeline.',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      ...anim(),
    }),
    block(T.GUIDANCE, {
      eyebrow: 'Case pathway',
      heading: 'Four steps from intake to funding',
      body: 'A simple commercial roadmap that keeps documents, term sheets, and timelines organized.',
      steps: [...COMMERCIAL_GUIDANCE_STEPS],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '4',
      cardStyle: 'flat',
      ...anim(),
    }),
    block(T.MORTGAGE_RATES, {
      eyebrow: 'Indicative bands',
      heading: 'Where commercial pricing starts',
      body: 'Compare common product categories, then review what fits your asset and leverage.',
      cta_label: 'Request a custom review',
      items: [...COMMERCIAL_RATE_ITEMS],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '1',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.MORTGAGE_CALCULATOR, {
      eyebrow: 'Payment starting point',
      heading: 'Model debt service early',
      body: 'Use the calculator as a planning tool—then refine with a full commercial package review.',
      cta_label: 'Talk through my numbers',
      primary_cta_label: 'Talk through my numbers',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      cardStyle: 'flat',
      ...anim(),
    }),
    block(T.LENDER_NETWORK, {
      eyebrow: 'Lender access',
      heading: 'More desks than a single branch',
      body: 'Compare products across banks, credit unions, and specialty lenders suited to commercial files.',
      items: [...COMMERCIAL_LENDER_ITEMS],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '4',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.ALTERNATIVE_LENDING, {
      eyebrow: 'Private & alternative lending',
      heading: 'Options beyond the traditional bank path',
      body: 'Explore specialty pathways for complex income, credit, investment, and short-term needs across U.S. and Canadian lenders—without assuming approval.',
      cta_label: 'Explore My Mortgage Options',
      items: [...COMMERCIAL_ALTERNATIVE_ITEMS],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '3',
      cardStyle: 'elevated',
      ...anim(),
    }),
    block(T.BROKER_COMPENSATION, {
      eyebrow: 'Transparent advice',
      heading: 'How commercial advice is compensated',
      body: 'Clear language about how advice is paid so you can focus on the right structure.',
      items: [
        { id: 'comp-lender', title: 'Lender compensation', description: 'In many cases, compensation is paid by the lender when a mortgage funds.', icon: 'building' },
        { id: 'comp-percentage', title: 'How compensation is structured', description: 'Lender compensation can vary by product, term, and lender. Details are explained before you proceed.', icon: 'percent' },
        { id: 'comp-brokerage', title: 'Brokerage or arrangement fees', description: 'Some private, alternative, or complex files may include an arrangement fee—disclosed clearly before you commit.', icon: 'briefcase' },
        { id: 'comp-private', title: 'Private mortgage fees', description: 'Private lending may involve lender fees, brokerage fees, or legal costs depending on the structure.', icon: 'home' },
      ],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '3',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.CREDENTIALS, {
      eyebrow: 'Why choose us',
      heading: 'Commercial experience you can verify',
      body: 'A transparent view of professional experience, deal activity, and credentials.',
    }, {
      bg: PRIMARY,
      color: P.white,
      padding: 'medium',
      width: 'full',
      columns: '4',
      cardStyle: 'glass',
      ...anim(),
    }),
    block(T.TESTIMONIALS, {
      eyebrow: 'Client feedback',
      heading: 'Operators who funded with clarity',
      body: 'Clear packages and lender matching help commercial clients move forward with fewer surprises.',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      columns: '3',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.FAQ, {
      eyebrow: 'Common questions',
      heading: 'Answers before you submit the package',
      body: 'Start with the questions sponsors and operators ask most about commercial financing.',
      faqs: [...COMMERCIAL_FAQS],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'medium',
      width: 'full',
      cardStyle: 'bordered',
      ...anim(),
    }),
    block(T.CTA, {
      eyebrow: "Let's start",
      heading: 'Send the package',
      body: 'Share rent roll, purchase price, and target LTV—we will compare suitable commercial options.',
      cta_label: 'Submit a deal',
      secondary_cta_label: 'Book a consultation',
    }, {
      bg: PRIMARY,
      color: P.white,
      padding: 'medium',
      width: 'full',
      ...anim('fade'),
    }),
    block(T.FOOTER, {
      role_label: 'Commercial Mortgage Advisor',
      links_heading: 'Navigate',
      contact_heading: 'Contact',
      items: [...COMMERCIAL_FOOTER_ITEMS],
    }, {
      bg: FOOTER,
      color: P.white,
      padding: 'medium',
      width: 'full',
    }),
  ],
};

export default mortgageBrokerCommercial;
