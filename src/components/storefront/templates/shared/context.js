export function buildTemplateContext(profile = {}) {
  const essentials = profile.brand_kit?.essentials
    || profile.storefront_brand_kit?.essentials
    || profile.storefront_essentials
    || {};
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
    essentials,
    company: profile.professional_profile?.company_name || profile.company_name || '',
  };
}
