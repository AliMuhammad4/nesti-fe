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
    block(T.SOLD_LISTINGS, { heading: 'Recent seller outcomes', body: 'A record of deliberate launches and confident negotiations.' }),
    block(T.SERVICES, { heading: 'Seller playbook', body: 'Prep, marketing, offer review, and closing coordination.' }),
    block(T.TESTIMONIALS, { heading: 'Seller reviews', body: 'Homeowners who sold with clarity and speed.' }),
    block(T.ABOUT, { heading: 'Why sellers choose this team', body: ctx.about || 'A seller-first process designed to reduce surprises and maximize net proceeds.' }),
    block(T.GUIDANCE, {
      heading: 'A smarter way to prepare your sale',
      body: 'Every phase has a purpose: protect value, create demand, and keep the process moving.',
      steps: [
        { title: 'Price the opportunity', text: 'Review local comparables, condition, and buyer demand to establish a defensible launch position.' },
        { title: 'Prepare the presentation', text: 'Prioritize the repairs, staging, photography, and story that will create the strongest first impression.' },
        { title: 'Evaluate every offer', text: 'Look beyond price at financing, conditions, timing, and the net outcome before choosing a path.' },
      ],
      faqs: [
        { q: 'How long does it take to prepare a home?', a: 'It depends on condition and timing, but a focused preparation plan keeps decisions clear.' },
        { q: 'Should I renovate before selling?', a: 'We identify improvements that are likely to support your net result and avoid unnecessary spend.' },
        { q: 'Can I sell while I am buying?', a: 'Yes. We coordinate the selling timeline with your next move and the right contingencies.' },
      ],
    }),
    block(T.CTA, { heading: 'Ready to price with confidence?', body: 'We’ll review comps, condition, and launch timing together.', cta_label: 'Book seller consult' }),
  ],
};

export default agentSellerExpert;
