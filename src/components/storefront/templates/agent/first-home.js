import { block, brand, T } from '../shared/blockFactory';

const agentFirstHome = {
  id: 'agent-first-home',
  role: 'agent',
  experience: 'story-warm',
  label: 'First Home Specialist',
  tagline: 'Fresh guidance for finding a place to call your own',
  description: 'A bright, property-first experience with practical education, curated homes, and clear next steps.',
  features: ['Buyer education', 'Property search', 'Step-by-step guide', 'Friendly CTA'],
  brand: brand('#0b3d20', '#3aa66a', 'DM Sans', 'square', 'editorial', '#ffffff'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Find the perfect place to live your next chapter',
      body: ctx.tagline || `${ctx.name} helps first-time buyers compare neighborhoods, budgets, and offers with confidence.`,
      primary_cta_label: 'Submit inquiry',
      cta_label: 'View properties',
      eyebrow: 'First-time buyer guidance',
    }),
    block(T.GUIDANCE, {
      heading: 'A simpler path to your first home',
      body: 'Friendly, practical guidance from your first question to the day you receive the keys.',
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
    block(T.ROLE_DETAILS, {
      heading: 'Everything you need to buy with confidence',
      body: 'Understand your budget, shortlist neighborhoods, and approach every viewing with a practical plan.',
    }),
    block(T.SERVICES, { heading: 'Support made for first-time buyers', body: 'Budget mapping, neighborhood tours, and clear offer coaching.' }),
    block(T.FEATURED_LISTINGS, {
      heading: 'Latest properties',
      body: 'Explore approachable homes and compare the details that matter most.',
    }, { columns: '3', variant: 'feature-grid' }),
    block(T.TESTIMONIALS, { heading: 'Buyers who started here', body: 'Stories from people who bought their first place with clarity.' }),
    block(T.ABOUT, { heading: `Hi, I'm ${ctx.name}`, body: ctx.about || 'Patient, practical guidance for people buying their first home.' }),
    block(T.CTA, { heading: 'Let’s map your first offer', body: 'Bring your budget and timeline — we’ll outline the next three steps.', cta_label: 'Talk with me' }),
    block(T.SELLER_PERFORMANCE, {
      eyebrow: 'A helpful starting point',
      heading: 'Clear guidance, backed by real context',
      body: 'A quick view of available homes, local coverage, client feedback, and professional experience.',
      shared_proof_performance_version: 2,
      items: [
        { label: 'Homes sold', value: '', source: 'closed_seller_leads' },
        { label: 'Experience', value: ctx.essentials.years_experience || '', source: 'years_experience' },
        { label: 'Client rating', value: '', source: 'rating' },
        { label: 'Available options', value: '', source: 'available_seller_leads' },
      ],
    }, { columns: '4', variant: 'premium', cardStyle: 'elevated' }),
    block(T.SELLER_SOLD_RESULTS, {
      eyebrow: 'Recent market outcomes',
      heading: 'Recently sold homes',
      body: 'Use recent local outcomes as practical context while planning your own search and offer.',
      sold_card_layout_version: 2,
    }, { columns: '3', variant: 'feature-grid' }),
    block(T.SELLER_CASE_STUDY, {
      eyebrow: 'Your first-home plan',
      heading: 'From first questions to confident keys',
      body: 'A practical sequence that keeps every decision understandable and connected to your budget.',
      shared_proof_case_study_version: 2,
      items: [
        { title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' },
        { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' },
        { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' },
      ],
    }, { columns: '3', variant: 'editorial', cardStyle: 'elevated' }),
    block(T.SELLER_CREDENTIALS, {
      eyebrow: 'Support you can trust',
      heading: 'Practical experience for a major first step',
      body: 'Professional background and communication strengths that make the process easier to understand.',
      metrics_layout_version: 2,
      shared_proof_metrics_version: 2,
      items: [
        { title: 'Clients', issuer: '', source: 'total_clients' },
        { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' },
        { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' },
        { title: 'Brokerage', issuer: ctx.company || '', source: 'company' },
      ],
    }, { columns: '4', variant: 'premium', cardStyle: 'elevated' }),
  ],
};

export default agentFirstHome;
