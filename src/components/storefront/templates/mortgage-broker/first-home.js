import { block, brand, T } from '../shared/blockFactory';

const mortgageBrokerFirstHome = {
  id: 'mortgage_broker-first-home',
  role: 'mortgage_broker',
  experience: 'story-warm',
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
};

export default mortgageBrokerFirstHome;
