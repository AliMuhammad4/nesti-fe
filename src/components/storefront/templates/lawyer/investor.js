import { block, brand, T } from '../shared/blockFactory';

const lawyerInvestor = {
  id: 'lawyer-investor',
  role: 'lawyer',
  experience: 'industrial-minimal',
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
};

export default lawyerInvestor;
