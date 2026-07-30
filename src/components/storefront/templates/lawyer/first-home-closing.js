import { block, brand, T } from '../shared/blockFactory';

const lawyerFirstHomeClosing = {
  id: 'lawyer-first-home-closing',
  role: 'lawyer',
  experience: 'story-warm',
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
};

export default lawyerFirstHomeClosing;
