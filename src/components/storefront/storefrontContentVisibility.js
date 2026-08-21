function hasStoryContent(item) {
  if (!item || typeof item !== 'object') return false;
  const name = String(item.client_name || item.name || '').trim();
  const text = String(item.text || item.review || item.testimonial || '').trim();
  return Boolean(name && text);
}

function blockContent(block) {
  return block?.data?.content || block?.content || {};
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
