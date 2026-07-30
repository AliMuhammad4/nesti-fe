import { block, brand, T } from '../shared/blockFactory';

const lawyerClassic = {
  id: 'lawyer-classic',
  role: 'lawyer',
  experience: 'classic-balanced',
  label: 'Real Estate Lawyer Classic',
  tagline: 'Trusted closing centre experience',
  description: 'Estimator, practice areas, credentials, timeline guidance.',
  features: ['Cost estimator', 'Practice areas', 'Credentials', 'Secure CTA'],
  brand: brand('#172554', '#c9a227', 'Playfair Display', 'rounded', 'editorial'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Your real estate closing starts here',
      body: ctx.tagline || 'Transparent pricing, clear timelines, and expert guidance from offer to registration.',
      cta_label: 'Request a quote',
      eyebrow: 'Closing centre',
    }),
    block(T.CLOSING_COST_ESTIMATOR, { heading: 'Instant closing cost estimate', body: 'Model legal fees and transfer costs before you commit.' }),
    block(T.PRACTICE_AREAS, { heading: 'How we can help', body: 'Purchase, sale, refinance, and title matters.' }),
    block(T.GUIDANCE, { heading: 'Closing timeline', body: 'What happens between accepted offer and keys.' }),
    block(T.CREDENTIALS, { heading: 'Credentials & trust', body: 'Licensing, associations, and firm standing.' }),
    block(T.TESTIMONIALS, { heading: 'Client closings', body: 'Buyers and sellers who closed with confidence.' }),
    block(T.ABOUT, { heading: `Meet ${ctx.name}`, body: ctx.about || 'Practical legal counsel focused on clarity and timelines.' }),
    block(T.CTA, { heading: 'Book your closing consultation', body: 'Tell us transaction type, province, and closing date.', cta_label: 'Book consultation' }),
  ],
};

export default lawyerClassic;
