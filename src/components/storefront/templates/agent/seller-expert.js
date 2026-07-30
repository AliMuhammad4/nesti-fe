import { block, brand, T } from '../shared/blockFactory';

const agentSellerExpert = {
  id: 'agent-seller-expert',
  role: 'agent',
  experience: 'conversion-funnel',
  label: 'Seller Expert',
  tagline: 'Conversion-focused seller landing page',
  description: 'Seller-focused funnel with staging, pricing strategy, and sold proof.',
  features: ['Pricing strategy', 'Sold proof', 'Seller services', 'Urgent CTA'],
  brand: brand('#9f1239', '#f59e0b', 'DM Sans', 'rounded', 'bold', '#fff1f2'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Sell with a pricing plan that protects value',
      body: ctx.tagline || 'Positioning, launch timing, and negotiation strategy built around your home.',
      cta_label: 'Book a seller consultation',
      eyebrow: 'Seller specialist',
    }),
    block(T.SERVICES, { heading: 'Seller playbook', body: 'Prep, marketing, offer review, and closing coordination.' }),
    block(T.TESTIMONIALS, { heading: 'Seller reviews', body: 'Homeowners who sold with clarity and speed.' }),
    block(T.ABOUT, { heading: 'Why sellers choose this team', body: ctx.about || 'A seller-first process designed to reduce surprises and maximize net proceeds.' }),
    block(T.CTA, { heading: 'Ready to price with confidence?', body: 'We’ll review comps, condition, and launch timing together.', cta_label: 'Book seller consult' }),
  ],
};

export default agentSellerExpert;
