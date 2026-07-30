import { block, brand, T } from '../shared/blockFactory';

const agentFirstHome = {
  id: 'agent-first-home',
  role: 'agent',
  experience: 'story-warm',
  label: 'First Home Specialist',
  tagline: 'Warm guidance for first-time buyers',
  description: 'Education-first layout with guides, listings, and low-pressure CTAs.',
  features: ['Buyer education', 'Property search', 'Step-by-step guide', 'Friendly CTA'],
  brand: brand('#1d4ed8', '#fb7185', 'DM Sans', 'pill', 'warm', '#eff6ff'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Your first home, without the overwhelm',
      body: ctx.tagline || `${ctx.name} helps first-time buyers compare neighborhoods, budgets, and offers with confidence.`,
      cta_label: 'Book a buyer consult',
      eyebrow: 'First-home specialist',
    }),
    block(T.GUIDANCE, { heading: 'What happens next', body: 'A simple path from pre-approval to keys.' }),
    block(T.SERVICES, { heading: 'Built for first-time buyers', body: 'Budget mapping, neighborhood tours, and offer coaching.' }),
    block(T.PROPERTIES),
    block(T.TESTIMONIALS, { heading: 'Buyers who started here', body: 'Stories from people who bought their first place with clarity.' }),
    block(T.ABOUT, { heading: `Hi, I'm ${ctx.name}`, body: ctx.about || 'Patient, practical guidance for people buying their first home.' }),
    block(T.CTA, { heading: 'Let’s map your first offer', body: 'Bring your budget and timeline — we’ll outline the next three steps.', cta_label: 'Talk with me' }),
  ],
};

export default agentFirstHome;
