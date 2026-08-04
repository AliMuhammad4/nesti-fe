import { block, brand, T } from '../shared/blockFactory';

const agentLuxuryAdvisor = {
  id: 'agent-luxury-advisor',
  role: 'agent',
  experience: 'luxury-editorial',
  label: 'Luxury Advisor',
  tagline: 'Editorial presentation for premium listings',
  description: 'Dark refined palette, showcase listings, private consultation framing.',
  features: ['Luxury showcase', 'Private CTA', 'Sold prestige', 'Concierge tone'],
  brand: brand('#1c1917', '#c9a227', 'Playfair Display', 'square', 'editorial', '#faf7ef'),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || `Discreet representation for ${ctx.area || 'discerning clients'}`,
      body: ctx.tagline || 'Confidential advisory for estate homes, waterfront, and architectural residences.',
      cta_label: 'Request a private consultation',
      eyebrow: 'Luxury advisory',
    }, { padding: 'large' }),
    block(T.FEATURED_LISTINGS, { heading: 'Signature properties', body: 'Curated inventory presented with discretion.' }),
    block(T.ABOUT, { heading: 'A quieter standard of service', body: ctx.about || 'White-glove representation with market intelligence and off-market access.' }),
    block(T.SERVICES, { heading: 'Concierge services', body: 'Acquisition strategy, staging direction, and global buyer outreach.' }),
    block(T.TESTIMONIALS, { heading: 'Client confidence', body: 'Trusted by families who value privacy and precision.' }),
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
  ],
};

export default agentLuxuryAdvisor;
