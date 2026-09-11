export function resolvePublicCalendlySource(profile = {}) {
  return profile?.professional_profile?.calendly_link
    || profile?.professional_profile?.calendly_url
    || profile?.calendly_link
    || profile?.calendly_url
    || profile?.storefront_essentials?.professional?.calendly_link
    || profile?.storefront_essentials?.calendly_link
    || '';
}

export function buildTrackedCalendlyUrl(calendlyLink, profile = {}) {
  let link = String(calendlyLink || '').trim();
  if (!link) return '';
  if (/^(?:www\.)?calendly\.com\//i.test(link)) link = `https://${link}`;

  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== 'https:'
      || (hostname !== 'calendly.com' && !hostname.endsWith('.calendly.com'))
    ) {
      return '';
    }
    url.searchParams.set('utm_source', 'nesti_public_profile');
    url.searchParams.set(
      'utm_campaign',
      profile.professional_user_id || profile.id || profile.slug || '',
    );
    url.searchParams.set('utm_content', 'public_profile_consultation');
    return url.toString();
  } catch {
    return '';
  }
}
