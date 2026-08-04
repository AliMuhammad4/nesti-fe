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
    block(T.GUIDANCE, {
      heading: 'Your first-home roadmap',
      body: 'A calm, practical path from your first question to the day you get the keys.',
      steps: [
        { title: 'Get financially ready', text: 'Clarify a comfortable budget, save for closing costs, and prepare for pre-approval.' },
        { title: 'Learn the options', text: 'Compare homes and neighborhoods with straightforward explanations, not pressure.' },
        { title: 'Write a confident offer', text: 'Understand conditions, timelines, and negotiation before committing to your first purchase.' },
      ],
      faqs: [
        { q: 'Do I need pre-approval before we talk?', a: 'No. We can start with your goals and outline the right financial next step.' },
        { q: 'How much should I budget beyond the down payment?', a: 'We will walk through closing costs, moving costs, and a comfortable monthly range.' },
        { q: 'Will I be rushed into an offer?', a: 'No. The process is built around clarity, education, and your timing.' },
      ],
    }),
    block(T.SERVICES, { heading: 'Built for first-time buyers', body: 'Budget mapping, neighborhood tours, and offer coaching.' }),
    block(T.PROPERTIES),
    block(T.TESTIMONIALS, { heading: 'Buyers who started here', body: 'Stories from people who bought their first place with clarity.' }),
    block(T.ABOUT, { heading: `Hi, I'm ${ctx.name}`, body: ctx.about || 'Patient, practical guidance for people buying their first home.' }),
    block(T.CTA, { heading: 'Let’s map your first offer', body: 'Bring your budget and timeline — we’ll outline the next three steps.', cta_label: 'Talk with me' }),
  ],
};

export default agentFirstHome;
