import { block, brand, T } from '../shared/blockFactory';

const mortgageBrokerCommercial = {
  id: 'mortgage_broker-commercial',
  role: 'mortgage_broker',
  experience: 'industrial-minimal',
  label: 'Commercial Mortgage',
  tagline: 'Commercial and multi-unit financing page',
  description: 'Bold commercial tone with programs and deal CTA.',
  features: ['Commercial programs', 'Deal CTA', 'Calc', 'Bold brand'],
  brand: brand('#111827', '#fb923c', 'Manrope', 'square', 'bold'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Commercial financing built for operators',
      body: ctx.tagline || 'Multi-unit, mixed-use, and business-purpose lending pathways.',
      cta_label: 'Submit a deal',
      eyebrow: 'Commercial desk',
    }),
    block(T.MORTGAGE_PROGRAMS, { heading: 'Commercial products', body: 'CMHC multi, conventional, bridge, and private options.' }),
    block(T.SERVICES, { heading: 'Transaction support', body: 'Term sheets, underwriting packages, and lender matching.' }),
    block(T.MORTGAGE_CALCULATOR, { heading: 'Quick payment model', body: 'Estimate debt service for preliminary analysis.' }),
    block(T.CTA, { heading: 'Send the package', body: 'Share rent roll, purchase price, and target LTV.', cta_label: 'Start commercial file' }),
  ],
};

export default mortgageBrokerCommercial;
