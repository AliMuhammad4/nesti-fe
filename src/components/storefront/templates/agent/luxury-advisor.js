import { block, brand, T } from '../shared/blockFactory';

const agentLuxuryAdvisor = {
  id: 'agent-luxury-advisor',
  role: 'agent',
  experience: 'luxury-editorial',
  label: 'Luxury Advisor',
  tagline: 'Editorial presentation for premium listings',
  description: 'Dark refined palette, showcase listings, private consultation framing.',
  features: ['Luxury showcase', 'Private CTA', 'Sold prestige', 'Concierge tone'],
  brand: brand('#1c1917', '#c9b08a', 'Playfair Display', 'square', 'editorial', '#11100f'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || `Discreet representation for ${ctx.area || 'discerning clients'}`,
      body: ctx.tagline || 'Confidential advisory for estate homes, waterfront, and architectural residences.',
      cta_label: 'Request a private consultation',
      eyebrow: 'Luxury advisory',
    }, { padding: 'large' }),
    block(T.FEATURED_LISTINGS, {
      heading: 'Featured properties',
    }),
    block(T.ROLE_DETAILS, {
      heading: 'Representation with uncommon discretion',
      body: 'A considered advisory relationship for clients balancing privacy, timing, architecture, and long-term value.',
    }),
    block(T.ABOUT, { heading: 'A quieter standard of service', body: ctx.about || 'White-glove representation with market intelligence and off-market access.' }),
    block(
      T.SERVICES,
      {
        eyebrow: 'What I offer',
        heading: 'Concierge services',
        body: 'Acquisition strategy, staging direction, and global buyer outreach.',
      },
      {
        align: 'center',
        padding: 'large',
        radius: 'large',
        shadow: 'medium',
        columns: 3,
        cardStyle: 'bordered',
        animationType: 'fade',
        animationTrigger: 'scroll',
        animationDuration: 'medium',
        animationIntensity: 'medium',
      },
    ),
    block(T.TESTIMONIALS, {
      eyebrow: 'Client stories',
      heading: 'Stories of refined living',
      body: 'Trusted by clients worldwide',
    }),
    block(T.GUIDANCE, {
      heading: 'A private advisory process',
      body: 'Thoughtful representation for clients making consequential property decisions.',
      steps: [
        { title: 'Private discovery', text: 'Define your brief, timing, privacy needs, and the qualities that make a property exceptional to you.' },
        { title: 'Curated access', text: 'Review on-market and discreet opportunities through a tailored lens, without unnecessary noise.' },
        { title: 'Measured execution', text: 'Move through diligence, negotiation, and closing with calm coordination and clear communication.' },
      ],
      faqs: [
        { q: 'Do you handle off-market opportunities?', a: 'Yes. When appropriate, private network access and quiet outreach are part of the advisory process.' },
        { q: 'Can you advise on a sale before we are ready to list?', a: 'Yes. Preparation, presentation, and timing can be planned well before a launch.' },
        { q: 'Is every consultation confidential?', a: 'Yes. Privacy and discretion shape every client conversation.' },
      ],
    }),
    block(T.CTA, { heading: 'Begin a private conversation', body: 'Share your timing and objectives for a tailored advisory call.', cta_label: 'Arrange a meeting' }),
    block(T.SELLER_PERFORMANCE, {
      eyebrow: 'Advisory record',
      heading: 'Experience measured with discretion',
      body: 'A concise view of recent outcomes, client confidence, and market experience.',
      shared_proof_performance_version: 2,
      items: [
        { label: 'Homes sold', value: '', source: 'closed_seller_leads' },
        { label: 'Experience', value: ctx.essentials.years_experience || '', source: 'years_experience' },
        { label: 'Client rating', value: '', source: 'rating' },
        { label: 'Available options', value: '', source: 'available_seller_leads' },
      ],
    }, { columns: '4', variant: 'premium', cardStyle: 'bordered' }),
    block(T.SELLER_SOLD_RESULTS, {
      eyebrow: 'Recent distinctions',
      heading: 'Notable recent sales',
      body: 'A considered selection of properties represented through to a successful close.',
      sold_card_layout_version: 2,
    }, { columns: '2', variant: 'feature-grid' }),
    block(T.SELLER_CASE_STUDY, {
      eyebrow: 'Advisory in practice',
      heading: 'A composed path from brief to result',
      body: 'Each engagement balances privacy, presentation, and negotiation around the client’s priorities.',
      shared_proof_case_study_version: 2,
      items: [
        { title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' },
        { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' },
        { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' },
      ],
    }, { columns: '3', variant: 'editorial', cardStyle: 'bordered' }),
    block(T.SELLER_CREDENTIALS, {
      eyebrow: 'Credentials and recognition',
      heading: 'A standard clients can verify',
      body: 'Professional standing, global perspective, and trusted representation for consequential property decisions.',
      metrics_layout_version: 2,
      shared_proof_metrics_version: 2,
      items: [
        { title: 'Clients', issuer: '', source: 'total_clients' },
        { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' },
        { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' },
        { title: 'Brokerage', issuer: ctx.company || '', source: 'company' },
      ],
    }, { columns: '4', variant: 'premium', cardStyle: 'bordered' }),
  ],
};

export default agentLuxuryAdvisor;
