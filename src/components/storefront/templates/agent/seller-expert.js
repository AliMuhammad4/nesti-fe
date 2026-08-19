import { block, brand, T } from '../shared/blockFactory';

const agentSellerExpert = {
  id: 'agent-seller-expert',
  role: 'agent',
  experience: 'conversion-funnel',
  label: 'Seller Expert',
  tagline: 'Modern seller growth template',
  description: 'A clean, product-style seller template focused on clarity, trust, and conversion.',
  features: ['Seller intake', 'Market positioning', 'Proof-driven trust', 'Direct CTA'],
  brand: brand('#0f172a', '#06b6d4', 'DM Sans', 'rounded', 'bold', '#f8fafc'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'A smarter way to launch and sell your property',
      body: ctx.tagline || 'From pricing to negotiation, every move is mapped with clear data and practical guidance.',
      cta_label: 'Start seller intake',
      eyebrow: 'Seller growth platform',
    }),
    block(T.ROLE_DETAILS, {
      heading: 'Everything you need for a confident seller launch',
      body: 'Each recommendation is tied to demand signals, pricing discipline, timeline fit, and your target net result.',
    }),
    block(T.SELLER_PERFORMANCE, {
      eyebrow: 'Performance snapshot',
      heading: 'Proof behind the seller strategy',
      body: 'Verified profile and client data at a glance, presented without the sales noise.',
      items: [
        { label: 'Homes sold', value: '', detail: 'Closed seller results', source: 'closed_seller_leads' },
        { label: 'Experience', value: ctx.essentials.years_experience || '', detail: 'Local market guidance', source: 'years_experience' },
        { label: 'Client rating', value: '', detail: 'From verified feedback', source: 'rating' },
        { label: 'Available options', value: '', detail: 'Active seller leads not closed yet', source: 'available_seller_leads' },
      ],
    }, { columns: '4', variant: 'premium' }),
    block(T.FEATURED_LISTINGS, {
      heading: 'Latest seller listings',
      body: 'Presentation-ready homes launched with strong positioning and buyer-focused storytelling.',
      eyebrow: 'Available properties',
    }, { columns: '3', variant: 'feature-grid' }),
    block(T.SELLER_SOLD_RESULTS, {
      heading: 'Recently sold properties',
      body: 'A look at homes recently sold with a successful client outcome.',
      eyebrow: 'Recent sales',
      sold_card_layout_version: 2,
    }, { columns: '4', variant: 'feature-grid' }),
    block(T.SERVICES, { heading: 'Support made for modern sellers', body: 'Intake, pricing strategy, launch marketing, and offer handling in one guided flow.' }),
    block(T.SELLER_CASE_STUDY, {
      eyebrow: 'Seller success story',
      heading: 'A launch plan built around the right signals',
      body: 'A clear seller narrative connects preparation, market positioning, and offer decisions into one measurable strategy.',
      items: [
        { title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' },
        { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' },
        { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' },
      ],
    }, { columns: '3', variant: 'editorial' }),
    block(T.TESTIMONIALS, { heading: 'Seller outcomes', body: 'Clients who sold faster with better clarity and confidence.' }),
    block(T.ABOUT, {
      heading: 'Why sellers trust this process',
      body: ctx.about || 'A practical seller system built to reduce friction and protect your final result.',
      seller_about_layout_version: 2,
    }),
    block(T.SELLER_CREDENTIALS, {
      eyebrow: 'Credentials and recognition',
      heading: 'Expertise sellers can verify',
      body: 'Professional qualifications and practical strengths that support every recommendation.',
      metrics_layout_version: 2,
      items: [
        { title: 'Clients', issuer: '', source: 'total_clients' },
        { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' },
        { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' },
        { title: 'Brokerage', issuer: ctx.company || '', source: 'company' },
      ],
    }, { columns: '4', variant: 'premium' }),
    block(T.GUIDANCE, {
      heading: 'A clear seller roadmap from listing to close',
      body: 'Each phase has a purpose: attract qualified demand, evaluate offers clearly, and close with confidence.',
      steps: [
        { title: 'Seller-ready intake', text: 'Capture property details, goals, and timing so strategy starts with clear context.' },
        { title: 'Market positioning', text: 'Align pricing, story, and media with local demand patterns and buyer behavior.' },
        { title: 'Offer-to-close flow', text: 'Compare offers with financing and conditions, then move toward a clean close.' },
      ],
      faqs: [
        { q: 'How quickly can a home be launch-ready?', a: 'With a focused checklist, most homes can move from planning to launch quickly and clearly.' },
        { q: 'Should I invest in upgrades before listing?', a: 'Only the upgrades tied to measurable demand lift and net return are prioritized.' },
        { q: 'Can my sale timeline sync with a purchase?', a: 'Yes. The plan coordinates conditions and timing so both moves stay aligned.' },
      ],
    }),
    block(T.CTA, { heading: 'Ready to launch your sale with confidence?', body: 'Share your details and get a tailored seller action plan.', cta_label: 'Continue' }),
  ],
};

export default agentSellerExpert;
