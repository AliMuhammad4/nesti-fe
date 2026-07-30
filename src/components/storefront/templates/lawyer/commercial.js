import { block, brand, T } from '../shared/blockFactory';

const lawyerCommercial = {
  id: 'lawyer-commercial',
  role: 'lawyer',
  experience: 'industrial-minimal',
  label: 'Commercial Real Estate Law',
  tagline: 'Commercial transaction counsel page',
  description: 'Bold commercial practice areas and deal intake CTA.',
  features: ['Commercial areas', 'Credentials', 'Deal CTA', 'Bold brand'],
  brand: brand('#111827', '#b45309', 'Manrope', 'square', 'bold'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Commercial closings with operational clarity',
      body: ctx.tagline || 'Leases, acquisitions, refinancing, and title work for business properties.',
      cta_label: 'Open a commercial file',
      eyebrow: 'Commercial counsel',
    }),
    block(T.PRACTICE_AREAS, { heading: 'Commercial mandates', body: 'Purchase, sale, lease, and financing counsel.' }),
    block(T.CREDENTIALS, { heading: 'Firm credentials', body: 'Experience across sophisticated real estate matters.' }),
    block(T.SERVICES, { heading: 'Engagement model', body: 'Scoped retainers with clear milestones.' }),
    block(T.CTA, { heading: 'Send the term sheet', body: 'We’ll outline diligence and closing steps.', cta_label: 'Request engagement' }),
  ],
};

export default lawyerCommercial;
