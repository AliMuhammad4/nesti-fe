import { block, brand, T } from '../shared/blockFactory';

const mortgageBrokerClassic = {
  id: 'mortgage_broker-classic',
  role: 'mortgage_broker',
  experience: 'classic-balanced',
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
};

export default mortgageBrokerClassic;
