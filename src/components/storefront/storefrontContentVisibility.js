function hasStoryContent(item) {
  if (!item || typeof item !== 'object') return false;
  const name = String(item.client_name || item.name || '').trim();
  const text = String(item.text || item.review || item.testimonial || '').trim();
  return Boolean(name && text);
}

function blockContent(block) {
  return block?.data?.content || block?.content || {};
}

const HASH_TARGET_BLOCK_TYPES = {
  about: ['about'],
  clients: ['who-we-help'],
  services: ['services', 'practice-areas'],
  documents: ['document-checklist'],
  fees: ['fee-guidance'],
  reviews: ['testimonials'],
  guidance: ['guidance'],
  faq: ['faq'],
  'closing-roadmap': ['expertise'],
  'buyer-protection': ['role-details'],
  'engagement-scope': ['engagement-scope'],
  'service-access': ['practice-logistics'],
  start: ['consultation-options'],
  programs: ['mortgage-programs'],
  contact: ['consultation-options', 'cta'],
};

export function isStorefrontHashTargetAvailable(profile = {}, target = '') {
  const blocks = profile?.storefront_blocks;
  if (!Array.isArray(blocks)) return true;
  const hash = String(target || '').split('#')[1]?.toLowerCase() || '';
  const blockTypes = HASH_TARGET_BLOCK_TYPES[hash];
  if (!blockTypes) return true;
  return blocks.some((block) => blockTypes.includes(block?.type) && (
    block?.data?.enabled ?? block?.enabled ?? true
  ));
}

export function publicClientStories(profile = {}) {
  // `real_clients` contains lead/inquiry records, not consented testimonials.
  // Never publish those names or inquiry summaries as social proof.
  const testimonials = Array.isArray(profile.testimonials)
    ? profile.testimonials.filter(hasStoryContent)
    : [];
  if (testimonials.length) return testimonials;

  const testimonialsBlock = (Array.isArray(profile.storefront_blocks)
    ? profile.storefront_blocks
    : []
  ).find((block) => block?.type === 'testimonials' && (
    block?.data?.enabled ?? block?.enabled ?? true
  ));
  const items = blockContent(testimonialsBlock).items;
  return Array.isArray(items) ? items.filter(hasStoryContent) : [];
}

export function hasPublicClientStories(profile = {}) {
  return publicClientStories(profile).length > 0;
}
