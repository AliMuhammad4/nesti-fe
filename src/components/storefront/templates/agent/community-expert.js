import { block, brand, T } from '../shared/blockFactory';

const agentCommunityExpert = {
  id: 'agent-community-expert',
  role: 'agent',
  experience: 'neighborhood-local',
  label: 'Community Expert',
  tagline: 'Neighborhood authority storefront',
  description: 'Local market narrative, area focus, listings, and community CTA.',
  features: ['Area authority', 'Listings', 'Local CTA', 'Warm brand'],
  brand: brand('#17152b', '#1f6fbf', 'Manrope', 'pill', 'editorial', '#f5f7fa'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || `Your guide to ${ctx.area || 'the neighborhood'}`,
      body: ctx.tagline || 'Schools, lifestyle, inventory, and pricing — explained by someone who lives the market.',
      primary_cta_label: 'Send detailed inquiry',
      cta_label: 'Book an appointment',
      eyebrow: 'Community expert',
      community_hub_layout_version: 2,
      community_theme_surface_version: 2,
    }, { padding: 'large', variant: 'premium' }),
    block(T.FEATURED_LISTINGS, {
      eyebrow: 'Featured homes',
      heading: `Discover properties in ${ctx.area || 'your area'}`,
      body: 'Explore active homes selected with neighborhood fit, value, and everyday lifestyle in mind.',
    }, { columns: '3', variant: 'feature-grid', cardStyle: 'elevated' }),
    block(T.ROLE_DETAILS, {
      eyebrow: 'Local intelligence',
      heading: 'A clearer way to understand the neighborhood',
      body: 'Street-by-street context helps you compare lifestyle, pricing, schools, transit, and the places that fit how you want to live.',
    }),
    block(T.ABOUT, {
      heading: `Meet ${ctx.name}`,
      body: ctx.about || `${ctx.name} combines local market awareness with a practical, relationship-first approach to buying, selling, and relocating.`,
    }),
    block(T.SERVICES, {
      eyebrow: 'How I can help',
      heading: 'Local support, from search to move-in',
      body: 'Area comparisons, relocation planning, pricing context, and a clear plan for your next move.',
    }),
    block(T.EXPERTISE, {
      eyebrow: 'Community knowledge',
      heading: 'The local picture',
      body: 'A practical read on lifestyle, pricing, schools, transit, and the micro-markets shaping each move.',
    }),
    block(T.SELLER_PERFORMANCE, {
      eyebrow: 'Local market snapshot',
      heading: 'Useful context for your next local move',
      body: 'Recent outcomes, active opportunities, service coverage, and client feedback in one clear view.',
      shared_proof_layout_version: 1,
      shared_proof_performance_version: 2,
      items: [
        { label: 'Homes sold', value: '', source: 'closed_seller_leads' },
        { label: 'Experience', value: ctx.essentials.years_experience || '', source: 'years_experience' },
        { label: 'Client rating', value: '', source: 'rating' },
        { label: 'Available options', value: '', source: 'available_seller_leads' },
      ],
    }, { columns: '4', variant: 'premium', cardStyle: 'glass' }),
    block(T.SELLER_SOLD_RESULTS, {
      eyebrow: 'Recent local outcomes',
      heading: 'Homes successfully sold',
      body: 'Recent local outcomes that add useful pricing and timing context to your next move.',
      shared_proof_layout_version: 1,
      sold_card_layout_version: 2,
    }, { columns: '3', variant: 'feature-grid' }),
    block(T.SELLER_CASE_STUDY, {
      eyebrow: 'A neighborhood move story',
      heading: 'Local context at every decision',
      body: 'A clear approach connects lifestyle fit, market context, and execution into one confident move.',
      shared_proof_layout_version: 1,
      shared_proof_case_study_version: 2,
      items: [
        { title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' },
        { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' },
        { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' },
      ],
    }, { columns: '3', variant: 'editorial', cardStyle: 'glass' }),
    block(T.SELLER_CREDENTIALS, {
      eyebrow: 'Local credentials',
      heading: 'Knowledge grounded in the community',
      body: 'Professional experience and local perspective that support every neighborhood recommendation.',
      metrics_layout_version: 2,
      shared_proof_layout_version: 1,
      shared_proof_metrics_version: 2,
      items: [
        { title: 'Clients', issuer: '', source: 'total_clients' },
        { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' },
        { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' },
        { title: 'Brokerage', issuer: ctx.company || '', source: 'company' },
      ],
    }, { columns: '4', variant: 'premium', cardStyle: 'glass' }),
    block(T.TESTIMONIALS, {
      eyebrow: 'Community stories',
      heading: 'We listen and help our community move forward',
      body: 'Real experiences from people buying, selling, and relocating in the neighborhoods they call home.',
    }),
    block(T.GUIDANCE, {
      eyebrow: 'A simple local process',
      heading: 'Your local move, mapped out',
      body: 'Useful neighborhood context before you spend a weekend touring homes.',
      steps: [
        { title: 'Choose your fit', text: 'Compare lifestyle, commute, schools, amenities, and property styles across the areas on your list.' },
        { title: 'Watch the local market', text: 'Understand inventory, recent sales, and timing so your decisions are grounded in current conditions.' },
        { title: 'Make a confident move', text: 'Tour with purpose, build an offer plan, and coordinate your next step with local context in hand.' },
      ],
      faqs: [
        { q: 'Which streets should I consider?', a: 'Share your priorities and you will receive a focused shortlist with practical trade-offs for each area.' },
        { q: 'Can you help if I am relocating?', a: 'Yes. The process starts with lifestyle and commute needs, then narrows to communities that fit.' },
        { q: 'Do you work with sellers too?', a: 'Yes. Local pricing, buyer demand, and launch timing are reviewed before preparing a listing strategy.' },
      ],
    }),
    block(T.CTA, {
      eyebrow: 'Start your local move',
      heading: 'Talk local with someone who knows',
      body: `Ask ${ctx.name} about streets, schools, properties, and timing.`,
      cta_label: 'Send detailed inquiry',
    }),
    block(T.FOOTER, {}),
  ],
};

export default agentCommunityExpert;
