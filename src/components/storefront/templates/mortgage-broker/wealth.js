import { block, brand, T } from '../shared/blockFactory';

const mortgageBrokerWealth = {
  id: 'mortgage_broker-wealth',
  role: 'mortgage_broker',
  experience: 'luxury-editorial',
  label: 'Wealth Strategist',
  tagline: 'Portfolio and leverage strategy page',
  description: 'Premium advisory framing for investors and high-equity clients.',
  features: ['Wealth tone', 'Programs', 'Calc', 'Premium CTA'],
  brand: brand('#312e81', '#d4af37', 'Playfair Display', 'square', 'editorial'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Structure leverage around your wealth goals',
      body: ctx.tagline || 'Investment financing, HELOC strategy, and multi-property structuring.',
      cta_label: 'Book a strategy session',
      eyebrow: 'Wealth mortgage desk',
    }),
    block(T.MORTGAGE_PROGRAMS, { heading: 'Capital strategies', body: 'Investment, HELOC, commercial, and private pathways.' }),
    block(T.MORTGAGE_CALCULATOR, { heading: 'Scenario modeller', body: 'Stress purchase price and payment outcomes.' }),
    block(T.SERVICES, { heading: 'Advisory scope', body: 'Portfolio reviews and refinancing windows.' }),
    block(T.TESTIMONIALS, { heading: 'Strategic clients', body: 'Investors who optimized structure and cash flow.' }),
    block(T.CTA, { heading: 'Design your next move', body: 'Share assets, income, and target leverage.', cta_label: 'Request advisory call' }),
  ],
};

export default mortgageBrokerWealth;
