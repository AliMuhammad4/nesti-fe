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
    block(T.EXPERTISE, {
      heading: 'Advice for every side of the move',
      body: 'A full-service plan that brings market context, negotiation support, and reliable coordination into one relationship.',
    }),
    block(T.ROLE_DETAILS, {
      heading: 'A steady process, from first call to closing',
      body: 'Clear priorities, practical market guidance, and an organized path forward for buyers and sellers.',
    }),
    block(T.ABOUT, { heading: `Meet ${ctx.name}`, body: ctx.about || 'A relationship-first advisor focused on clear next steps for buyers and sellers.' }),
    block(T.PROPERTIES),
    block(T.TESTIMONIALS, { heading: 'Client outcomes', body: 'Recent wins from buyers, sellers, and relocating families.' }),
    block(T.FEATURED_LISTINGS, { heading: 'Featured opportunities', body: 'Hand-picked listings ready for private showings.' }),
    block(T.SERVICES, { heading: 'How we work together', body: 'Search strategy, pricing guidance, and closing coordination.' }),
    block(T.GUIDANCE, {
      heading: 'Your next move, made simple',
      body: 'A clear, relationship-first framework for buying, selling, or doing both.',
      steps: [
        { title: 'Set the direction', text: 'Start with your timing, budget, property goals, and the decisions that matter most.' },
        { title: 'Build the strategy', text: 'Use local data and a focused search or launch plan to make each step count.' },
        { title: 'Move with confidence', text: 'Review options, negotiate with context, and stay supported through closing.' },
      ],
      faqs: [
        { q: 'Can you help me buy and sell at the same time?', a: 'Yes. We coordinate timing, pricing, and contingencies around the full transition.' },
        { q: 'How do I know what my home is worth?', a: 'You will receive a practical pricing view based on condition, local demand, and recent comparable sales.' },
        { q: 'When should I start?', a: 'A conversation early in your timeline gives you more options and a calmer plan.' },
      ],
    }),
    block(T.CTA, { heading: 'Ready for your next move?', body: 'Share your goals and get a clear plan within one business day.', cta_label: 'Start a conversation' }),
  ],
};

export default agentClassic;
