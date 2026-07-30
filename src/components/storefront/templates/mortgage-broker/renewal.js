import { block, brand, T } from '../shared/blockFactory';

const mortgageBrokerRenewal = {
  id: 'mortgage_broker-renewal',
  role: 'mortgage_broker',
  experience: 'conversion-funnel',
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
};

export default mortgageBrokerRenewal;
