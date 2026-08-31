function text(value) {
  return String(value ?? '').trim();
}

export function newcomerCollection(content = {}, key, fallback = [], limit = 6) {
  const hasPersisted = Object.prototype.hasOwnProperty.call(content, key)
    && Array.isArray(content[key]);
  const source = hasPersisted ? content[key] : (Array.isArray(fallback) ? fallback : []);
  const items = source
    .map((item, index) => {
      if (typeof item === 'string') {
        const [title = '', description = ''] = item.split('|').map((part) => part.trim());
        return title ? { id: `${key}-${index}`, title, description } : null;
      }
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
      const title = text(item.title || item.name || item.label);
      if (!title && key !== 'items') return null;
      return {
        ...item,
        id: item.id || `${key}-${index}`,
        title,
        description: text(item.description ?? item.text),
      };
    })
    .filter(Boolean)
    .slice(0, limit);
  return { hasPersisted, items };
}

export function realNewcomerTestimonials(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item, index) => ({
      ...item,
      id: item.id || item._id || `testimonial-${index}`,
      client_name: text(item.client_name || item.name),
      text: text(item.text || item.review || item.testimonial),
      rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
    }))
    .filter((item) => item.client_name && item.text)
    .slice(0, 8);
}

export function newcomerFooterLinkProps(item = {}, {
  absoluteHashes = false,
  slug = '',
} = {}) {
  const raw = text(item.target || item.url || item.href);
  if (raw.startsWith('#')) {
    return { href: absoluteHashes && slug ? `/professional/${slug}${raw}` : raw };
  }
  if (raw.startsWith('/') && !raw.startsWith('//')) return { href: raw };
  try {
    const url = new URL(raw);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      return {
        href: raw,
        ...(url.protocol === 'http:' || url.protocol === 'https:'
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {}),
      };
    }
  } catch {
    // Unsafe and malformed destinations remain inert.
  }
  return {
    href: '#',
    'aria-disabled': 'true',
    tabIndex: -1,
  };
}
