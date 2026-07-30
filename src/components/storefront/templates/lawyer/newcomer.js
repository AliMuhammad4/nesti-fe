import { block, brand, T } from '../shared/blockFactory';

const lawyerNewcomer = {
  id: 'lawyer-newcomer',
  role: 'lawyer',
  experience: 'story-warm',
  label: 'Newcomer Home Specialist',
  tagline: 'Newcomer-friendly closing experience',
  description: 'Warm guidance, estimator, and multilingual-ready CTA.',
  features: ['Newcomer focus', 'Estimator', 'FAQ', 'Warm CTA'],
  brand: brand('#0f766e', '#fb923c', 'DM Sans', 'pill', 'warm'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Closing support for newcomers',
      body: ctx.tagline || 'Plain-language guidance on Canadian purchase closings, costs, and documents.',
      cta_label: 'Ask about my closing',
      eyebrow: 'Newcomer specialist',
    }),
    block(T.CLOSING_COST_ESTIMATOR, { heading: 'Understand Canadian closing costs', body: 'A transparent estimate before you finalize financing.' }),
    block(T.GUIDANCE, { heading: 'Newcomer closing guide', body: 'ID, funds, insurance, and signing day expectations.' }),
    block(T.PRACTICE_AREAS, { heading: 'Purchase support', body: 'Residential closings for new-to-Canada buyers.' }),
    block(T.TESTIMONIALS, { heading: 'Families we helped settle', body: 'Newcomers who closed with less stress.' }),
    block(T.CTA, { heading: 'We’re ready when you are', body: 'Share your offer and preferred language for follow-up.', cta_label: 'Start consultation' }),
  ],
};

export default lawyerNewcomer;
