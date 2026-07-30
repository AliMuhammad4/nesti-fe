export function buildTemplateContext(profile = {}) {
  const name = profile.professional_name
    || profile.full_name
    || [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    || 'your advisor';
  const area = profile.brand_kit?.essentials?.service_area
    || profile.service_areas?.[0]
    || profile.city
    || '';
  return {
    name,
    area,
    headline: profile.headline || '',
    tagline: profile.tagline || '',
    about: typeof profile.about === 'string' ? profile.about : '',
  };
}
