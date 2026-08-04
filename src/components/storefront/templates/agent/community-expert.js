import { block, brand, T } from '../shared/blockFactory';

const agentCommunityExpert = {
  id: 'agent-community-expert',
  role: 'agent',
  experience: 'neighborhood-local',
  label: 'Community Expert',
  tagline: 'Neighborhood authority storefront',
  description: 'Local market narrative, area focus, listings, and community CTA.',
  features: ['Area authority', 'Listings', 'Local CTA', 'Warm brand'],
  brand: brand('#166534', '#f97316', 'Manrope', 'pill', 'warm'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || `Your guide to ${ctx.area || 'the neighborhood'}`,
      body: ctx.tagline || 'Schools, lifestyle, inventory, and pricing — explained by someone who lives the market.',
      cta_label: 'Ask about my area',
      eyebrow: 'Community expert',
    }),
    block(T.EXPERTISE, {
      heading: 'The local picture',
      body: 'A practical read on lifestyle, pricing, schools, transit, and the micro-markets shaping each move.',
    }),
    block(T.ROLE_DETAILS, {
      heading: 'Neighborhood intelligence',
      body: 'Street-by-street context helps you compare the places that fit how you want to live.',
    }),
    block(T.ABOUT, {
      heading: `Meet ${ctx.name}`,
      body: ctx.about || `${ctx.name} combines local market awareness with a practical, relationship-first approach to buying, selling, and relocating.`,
    }),
    block(T.PROPERTIES),
    block(T.FEATURED_LISTINGS, { heading: `Homes in ${ctx.area || 'your area'}`, body: 'Active inventory selected for this community.' }),
    block(T.GUIDANCE, {
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
    block(T.TESTIMONIALS, { heading: 'Neighbors we’ve helped', body: 'Families relocating into and within this community.' }),
    block(T.CTA, { heading: 'Talk local with someone who knows', body: `Ask ${ctx.name} about streets, schools, and timing.`, cta_label: 'Message me' }),
  ],
};

export default agentCommunityExpert;
