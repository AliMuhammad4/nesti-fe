import { block, brand, T } from '../shared/blockFactory';
import {
  FIRST_HOME_HERO_SLIDES,
  FIRST_HOME_LENDER_ITEMS,
} from '../../renderers/variants/broker/firstHome/brokerFirstHomeDefaults';
import { FIRST_HOME_PALETTE as P } from '../../renderers/variants/broker/firstHome/brokerFirstHomePalette';

const PRIMARY = P.primary;
const ACCENT = P.accent;
const PAGE = P.page;
const FOOTER = P.footer;

const mortgageBrokerFirstHome = {
  id: 'mortgage_broker-first-home',
  role: 'mortgage_broker',
  experience: 'classic-balanced',
  label: 'First Home Specialist',
  tagline: 'A clear first-home financing journey',
  description: 'A guided first-home storefront with affordability tools, buyer education, proof, and focused conversion paths.',
  features: ['First-buyer roadmap', 'Affordability calculator', 'Rate & lender access', 'Buyer education', 'Trust-first conversion'],
  brand: brand(PRIMARY, ACCENT, 'Source Sans 3', 'rounded', 'minimal', PAGE),
  blocks: (ctx) => [
    block(T.HERO, {
      broker_first_home_design_version: 13,
      primary_cta_label: 'Start my pre-approval',
      cta_label: 'Check my affordability',
      join_label: 'Join Nesti',
      slides: (() => {
        const slide = FIRST_HOME_HERO_SLIDES[0];
        const profileHeadline = String(ctx.headline || '').trim();
        const useProfileHeading = profileHeadline && profileHeadline.length <= 42;
        const profileTagline = String(ctx.tagline || '').trim();
        const useProfileBody = profileTagline && profileTagline.length <= 140;
        return [{
          ...slide,
          heading: useProfileHeading ? profileHeadline : slide.heading,
          body: useProfileBody ? profileTagline : slide.body,
        }];
      })(),
    }, {
      bg: PRIMARY,
      color: P.white,
      padding: 'large',
      mediaPosition: 'right',
      align: 'left',
      animationType: 'fade',
      animationTrigger: 'load',
      animationDuration: 'slow',
      animationIntensity: 'subtle',
    }),
    block(T.PRACTICE_SNAPSHOT, {
      eyebrow: 'Advisor snapshot',
      heading: 'First-home guidance shaped around your needs',
      body: 'A concise view of financing specialties, service markets, and consultation languages.',
      practice_focus_label: 'First-home focus',
      practice_focus_subtitle: 'Financing areas supported',
      markets_label: 'Markets served',
      markets_subtitle: 'Service areas and communities',
      languages_label: 'Languages spoken',
      languages_subtitle: 'Consultation accessibility',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '3',
      cardStyle: 'bordered',
    }),
    block(T.MORTGAGE_PROGRAMS, {
      eyebrow: 'First-home programs',
      heading: 'Programs that fit first-time buyers',
      body: 'Explore common paths used by first-home clients—and choose the structure that fits your timeline.',
      items: [
        { id: 'program-high-ratio', title: 'High-ratio insured', description: 'For buyers putting less than 20% down—mortgage default insurance and lender rules explained early.', icon: 'home' },
        { id: 'program-conventional', title: 'Conventional first purchase', description: 'Paths with 20%+ down payment, standard qualification, and flexible amortization options.', icon: 'building' },
        { id: 'program-new-build', title: 'New construction', description: 'Builder deposits, progress draws, and occupancy timelines reviewed before you commit.', icon: 'shield' },
        { id: 'program-incentives', title: 'First-time buyer incentives', description: 'Federal and provincial programs reviewed for eligibility, documentation, and timing.', icon: 'percent' },
        { id: 'program-preapproval', title: 'Pre-approval pathway', description: 'Structured file preparation so you know your range and conditions before shopping.', icon: 'target' },
        { id: 'program-gifted-down', title: 'Gifted down payment', description: 'Lender requirements and documentation when family helps fund your first purchase.', icon: 'briefcase' },
      ],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '4',
      cardStyle: 'bordered',
    }),
    block(T.SERVICES, {
      eyebrow: 'First-home essentials',
      heading: 'Support for every decision that matters',
      body: 'Practical guidance for affordability, pre-approval, down payment, and product choice.',
      items: [
        { id: 'service-affordability', title: 'Affordability planning', description: 'Estimate a comfortable price range using your income, debts, down payment, and ownership costs.', icon: 'calculator' },
        { id: 'service-preapproval', title: 'Pre-approval strategy', description: 'Build a stronger file and understand the conditions behind your pre-approval.', icon: 'shield' },
        { id: 'service-down-payment', title: 'Down-payment guidance', description: 'Review eligible sources, minimum requirements, insurance rules, and documentation.', icon: 'home' },
        { id: 'service-product', title: 'Mortgage comparison', description: 'Compare rates, terms, penalties, and flexibility—not only the advertised number.', icon: 'percent' },
      ],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '4',
      cardStyle: 'bordered',
    }),
    block(T.ABOUT, {
      eyebrow: 'A team you can trust',
      heading: `Meet ${ctx.name || 'your advisor'}`,
      body: ctx.about || 'A relationship-first mortgage advisor focused on clear next steps for first-time buyers.',
      trust_statement: 'Advice shaped around your budget, timeline, and long-term comfort.',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
    }),
    block(T.GUIDANCE, {
      eyebrow: 'Your first-home roadmap',
      heading: 'Four steps from curiosity to closing',
      body: 'A simple path that keeps your numbers, documents, and decisions organized.',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '4',
      cardStyle: 'flat',
    }),
    block(T.MORTGAGE_RATES, {
      eyebrow: 'Current rate snapshot',
      heading: 'See where first-home rates start today',
      body: 'Compare common product categories, then review what fits your file and timeline.',
      cta_label: 'Get my personalized rate',
      items: [
        { id: 'rate-5y-fixed', title: '5-Year Fixed', rate: 'Starting from —%', description: 'A common choice when you want payment stability through your first ownership years.' },
        { id: 'rate-3y-fixed', title: '3-Year Fixed', rate: 'Starting from —%', description: 'Shorter fixed term when you expect income or plans to change sooner.' },
        { id: 'rate-variable', title: 'Variable', rate: 'Starting from —%', description: 'Flexible options when you are comfortable with rate movement.' },
        { id: 'rate-high-ratio', title: 'High-ratio insured', rate: 'Custom review', description: 'For buyers putting less than 20% down with mortgage default insurance.' },
      ],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '1',
      cardStyle: 'bordered',
    }),
    block(T.MORTGAGE_CALCULATOR, {
      eyebrow: 'Affordability starting point',
      heading: 'Estimate your comfort zone',
      body: 'Use the calculator as a planning tool—then refine with a full pre-approval conversation.',
      cta_label: 'Talk through my numbers',
      primary_cta_label: 'Talk through my numbers',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      cardStyle: 'flat',
    }),
    block(T.LENDER_NETWORK, {
      eyebrow: 'Lender access',
      heading: 'More options than a single branch',
      body: 'Compare products across banks, credit unions, and specialty lenders suited to first-time buyers.',
      items: FIRST_HOME_LENDER_ITEMS,
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '4',
      cardStyle: 'bordered',
    }),
    block(T.BROKER_COMPENSATION, {
      eyebrow: 'Transparent advice',
      heading: 'How mortgage advice is compensated',
      body: 'Clear language about how advice is paid so you can focus on the right product fit.',
      disclaimer: 'Compensation structures vary by lender, product, and transaction type. This section is informational and does not replace a written disclosure for your specific mortgage.',
      items: [
        { id: 'comp-lender', title: 'Lender compensation', description: 'In many cases, compensation is paid by the lender when a mortgage funds — so you may not pay a separate brokerage fee for standard A-lender solutions.', icon: 'building' },
        { id: 'comp-percentage', title: 'How compensation is typically structured', description: 'Lender compensation can vary by product, term, and lender. Your advisor can explain the structure that applies to your file before you proceed.', icon: 'percent' },
        { id: 'comp-brokerage', title: 'Brokerage or arrangement fees', description: 'Some private, alternative, or complex files may include an arrangement or brokerage fee. Any fee is disclosed clearly before you commit.', icon: 'briefcase' },
        { id: 'comp-private', title: 'Private mortgage fees', description: 'Private lending may involve lender fees, brokerage fees, or legal costs depending on the structure. Details are reviewed case by case.', icon: 'home' },
      ],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '3',
      cardStyle: 'bordered',
    }),
    block(T.ALTERNATIVE_LENDING, {
      eyebrow: 'When the path is not standard',
      heading: 'Support for less straightforward first purchases',
      body: 'Self-employed income, credit rebuilding, gifted down payments, and other situations reviewed case by case.',
      cta_label: 'Review my options',
      items: [
        { id: 'alt-self-employed', title: 'Self-employed income', description: 'Review business income documentation and lender programs that fit non-salary pay.', icon: 'briefcase' },
        { id: 'alt-gifted-down', title: 'Gifted down payment', description: 'Understand documentation and lender rules when part of your down payment is gifted.', icon: 'home' },
        { id: 'alt-credit', title: 'Credit rebuilding', description: 'Explore realistic paths when your score is still developing or recovering.', icon: 'shield' },
        { id: 'alt-non-traditional', title: 'Non-traditional income', description: 'Commission, contract, or variable income reviewed with suitable lender options.', icon: 'target' },
      ],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '2',
      cardStyle: 'bordered',
    }),
    block(T.CREDENTIALS, {
      eyebrow: 'Professional standing',
      heading: 'Mortgage experience you can verify',
      body: 'A transparent view of professional experience, client activity, and credentials.',
    }, {
      bg: P.primary,
      color: P.white,
      padding: 'large',
      columns: '4',
      cardStyle: 'glass',
    }),
    block(T.TESTIMONIALS, {
      eyebrow: 'First homes financed',
      heading: 'Buyers who felt ready before offer day',
      body: 'Clear guidance helps first-time buyers move forward with fewer surprises.',
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '3',
      cardStyle: 'bordered',
    }),
    block(T.FAQ, {
      eyebrow: 'Helpful first-home questions',
      heading: 'Answers before you take the next step',
      body: 'Start with the questions most first-time buyers ask about qualification, down payment, and approval.',
      faqs: [
        { id: 'faq-down-payment', q: 'How much down payment do I need for my first home?', a: 'The minimum depends on the purchase price and mortgage structure. Your full down payment must also be documented, so we review both the amount and its source early.' },
        { id: 'faq-preapproval', q: 'Does a pre-approval guarantee my mortgage?', a: 'No. A pre-approval is an important planning step, but final approval still depends on the property, updated documents, lender conditions, and any material changes to your finances.' },
        { id: 'faq-budget', q: 'How is my affordable purchase price calculated?', a: 'Lenders consider income, existing debts, credit, down payment, property costs, interest-rate qualification rules, and the mortgage product being considered.' },
        { id: 'faq-credit', q: 'Should I wait if my credit is not perfect?', a: 'Not necessarily. An early review can identify realistic options and give you a clear plan to strengthen your application before you buy.' },
        { id: 'faq-costs', q: 'What costs should I plan for beyond the down payment?', a: 'Plan for legal fees, appraisal or inspection costs, adjustments, moving expenses, property taxes, insurance, and a cash buffer after closing.' },
      ],
    }, {
      bg: 'transparent',
      color: PRIMARY,
      padding: 'large',
      columns: '1',
      cardStyle: 'bordered',
    }),
    block(T.CTA, {
      eyebrow: 'Your plan starts here',
      heading: 'Talk to a first-home mortgage expert',
      body: 'Share where you are today and get a practical next step for your budget, pre-approval, or purchase timeline.',
      cta_label: 'Start my pre-approval',
      secondary_cta_label: 'Book a consultation',
    }, {
      bg: P.primary,
      color: P.white,
      padding: 'large',
    }),
    block(T.FOOTER, {
      heading: ctx.name,
      role_label: 'First-Home Mortgage Advisor',
      body: 'Clear mortgage guidance for first-time buyers—from affordability and pre-approval to financing your first home.',
      links_heading: 'Explore',
      contact_heading: 'Contact',
      disclaimer: 'Estimates are informational and subject to lender qualification and approval.',
      items: [
        { id: 'footer-about', label: 'About', target: '#about' },
        { id: 'footer-services', label: 'Services', target: '#services' },
        { id: 'footer-roadmap', label: 'Roadmap', target: '#guidance' },
        { id: 'footer-rates', label: 'Rates', target: '#rates' },
        { id: 'footer-calculator', label: 'Calculator', target: '#calculator' },
        { id: 'footer-lenders', label: 'Lenders', target: '#lenders' },
        { id: 'footer-faq', label: 'FAQ', target: '#faq' },
        { id: 'footer-contact', label: 'Contact', target: '/contact' },
        { id: 'footer-booking', label: 'Book a consultation', target: '#contact' },
      ],
    }, {
      bg: FOOTER,
      color: P.white,
      padding: 'large',
    }),
  ],
};

export default mortgageBrokerFirstHome;
