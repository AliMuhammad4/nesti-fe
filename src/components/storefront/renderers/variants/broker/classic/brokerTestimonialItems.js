const PLACEHOLDER_COPY = [
  { name: 'verified client', snippet: 'quick loan approval' },
  { name: 'repeat client', snippet: 'flexible repayment' },
  { name: 'business owner', snippet: 'secured a business loan' },
];

function reviewName(item = {}) {
  return String(item.client_name || item.name || item.title || '').trim();
}

function reviewText(item = {}) {
  return String(item.text || item.description || item.review || item.testimonial || '').trim();
}

export function isBrokerPlaceholderTestimonial(item = {}) {
  const name = reviewName(item).toLowerCase();
  const text = reviewText(item).toLowerCase();
  return PLACEHOLDER_COPY.some((entry) => name === entry.name && text.includes(entry.snippet));
}

export function hasBrokerReviewContent(item) {
  return Boolean(reviewName(item) && reviewText(item) && !isBrokerPlaceholderTestimonial(item));
}

export function curatedBrokerTestimonials(content = {}, profileTestimonials = []) {
  const persisted = Array.isArray(content.items) ? content.items : [];
  const validPersisted = persisted.filter(hasBrokerReviewContent);
  if (validPersisted.length) return validPersisted;
  return (Array.isArray(profileTestimonials) ? profileTestimonials : []).filter(hasBrokerReviewContent);
}

export function hydrateBrokerTestimonialItems(content = {}, profileTestimonials = []) {
  const next = { ...content };
  const curated = curatedBrokerTestimonials(next, profileTestimonials);
  if (curated.length) {
    next.items = curated.map((item, index) => ({
      ...item,
      id: item.id || item._id || `profile-testimonial-${index}`,
      client_name: reviewName(item),
      text: reviewText(item),
      role: item.role || 'Verified client',
      rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
    }));
    return next;
  }
  if (Array.isArray(next.items)) {
    next.items = next.items.filter(hasBrokerReviewContent);
  }
  return next;
}
