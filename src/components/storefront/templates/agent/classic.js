import { block, brand, T } from '../shared/blockFactory';

const agentClassic = {
  id: 'agent-classic',
  role: 'agent',
  experience: 'classic-balanced',
  label: 'Realtor Classic',
  tagline: 'Full-service buyer & seller storefront',
  description: 'Hero, listings, social proof, services, and consultation CTA.',
  features: ['Featured listings', 'Buyer and seller support', 'Sold proof', 'Inquiry CTA'],
  brand: brand('#0f766e', '#f59e0b', 'Manrope', 'rounded', 'editorial'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || `Move smarter with ${ctx.name}`,
      body: ctx.tagline || 'Guided buying, selling, pricing, and consultation support in one polished experience.',
      cta_label: 'Book a free consultation',
      eyebrow: 'Local market partner',
    }),
    block(T.EXPERTISE),
    block(T.ROLE_DETAILS),
    block(T.ABOUT, { heading: `Meet ${ctx.name}`, body: ctx.about || 'A relationship-first advisor focused on clear next steps for buyers and sellers.' }),
    block(T.PROPERTIES),
    block(T.TESTIMONIALS, { heading: 'Client outcomes', body: 'Recent wins from buyers, sellers, and relocating families.' }),
    block(T.FEATURED_LISTINGS, { heading: 'Featured opportunities', body: 'Hand-picked listings ready for private showings.' }),
    block(T.SERVICES, { heading: 'How we work together', body: 'Search strategy, pricing guidance, and closing coordination.' }),
    block(T.GUIDANCE),
    block(T.CTA, { heading: 'Ready for your next move?', body: 'Share your goals and get a clear plan within one business day.', cta_label: 'Start a conversation' }),
  ],
};

export default agentClassic;
