import { block, brand, T } from '../shared/blockFactory';

const agentCommunityExpert = {
  id: 'agent-community-expert',
  role: 'agent',
  experience: 'story-warm',
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
    block(T.EXPERTISE),
    block(T.ROLE_DETAILS),
    block(T.PROPERTIES),
    block(T.FEATURED_LISTINGS, { heading: `Homes in ${ctx.area || 'your area'}`, body: 'Active inventory selected for this community.' }),
    block(T.GUIDANCE, { heading: 'Local buying & selling guide', body: 'What newcomers and move-up buyers ask most.' }),
    block(T.TESTIMONIALS, { heading: 'Neighbors we’ve helped', body: 'Families relocating into and within this community.' }),
    block(T.CTA, { heading: 'Talk local with someone who knows', body: `Ask ${ctx.name} about streets, schools, and timing.`, cta_label: 'Message me' }),
  ],
};

export default agentCommunityExpert;
