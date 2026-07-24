export function buildTrackedCalendlyUrl(calendlyLink, profile = {}) {
  const link = String(calendlyLink || '').trim();
  if (!link) return '';

  try {
    const url = new URL(link);
    url.searchParams.set('utm_source', 'nesti_public_profile');
    url.searchParams.set(
      'utm_campaign',
      profile.professional_user_id || profile.id || profile.slug || '',
    );
    url.searchParams.set('utm_content', 'public_profile_consultation');
    return url.toString();
  } catch {
    return link;
  }
}
