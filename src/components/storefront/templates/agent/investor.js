import { block, brand, T } from '../shared/blockFactory';

const agentInvestor = {
  id: 'agent-investor',
  role: 'agent',
  experience: 'industrial-minimal',
  label: 'Investor Specialist',
  tagline: 'Deal-flow oriented investor storefront',
  description: 'Listings, ROI framing, market proof, and fast inquiry CTAs.',
  features: ['Deal pipeline', 'Sold comps', 'Investor CTA', 'Analytics tone'],
  brand: brand('#172554', '#22c55e', 'Manrope', 'rounded', 'minimal', '#f8fafc'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Investment inventory with clear numbers',
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
        { title: 'Define your criteria', text: 'Share your target markets, property type, budget, yield goals, and preferred hold period.' },
        { title: 'Review opportunities', text: 'Compare available properties with practical context around fit, risk, and potential.' },
        { title: 'Plan the next move', text: 'Organize questions, request details, and move into a focused consultation with useful context.' },
      ],
      faqs: [
        { q: 'Can I ask about a specific opportunity?', a: 'Yes. Open a property card or use the chat assistant to carry the listing context into your inquiry.' },
        { q: 'Can first-time investors use this page?', a: 'Yes. The guided flow helps clarify budget, goals, financing readiness, and next steps.' },
        { q: 'How do I request a portfolio review?', a: 'Use the consultation option and share the property and investment context.' },
      ],
    }),
    block(T.ABOUT, {
      heading: `About ${ctx.name}`,
      body: ctx.about || `${ctx.name} provides investment-focused real estate guidance across acquisitions, property evaluation, and portfolio decisions.`,
    }),
    block(T.TESTIMONIALS, { heading: 'Investor partners', body: 'Operators and first-time investors who rely on this desk.' }),
    block(T.CTA, { heading: 'Get the next brief', body: 'Tell us your target yield, markets, and hold period.', cta_label: 'Join the deal list' }),
  ],
};

export default agentInvestor;
