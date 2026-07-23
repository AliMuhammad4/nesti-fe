import { notFound } from 'next/navigation';
import { getPublicProfile, getPublishedStorefront } from '@/lib/publicProfileClient';
import PublicPropertiesPage from '@/components/storefront/PublicPropertiesPage';

export async function generateMetadata({ params }) {
  try {
    const data = await getPublicProfile(params.slug);
    const name = data.profile?.professional_name || 'Professional';
    return {
      title: `Properties | ${name}`,
      description: `Browse all available properties from ${name}.`,
    };
  } catch {
    return {
      title: 'Properties',
      description: 'Browse available properties.',
    };
  }
}

export default async function PropertiesPage({ params }) {
  let data;
  try {
    data = await getPublicProfile(params.slug);
  } catch {
    notFound();
  }

  const profile = data?.profile;
  if (!profile?.enabled || profile.professional_type !== 'agent') {
    notFound();
  }

  const storefrontResponse = await getPublishedStorefront(params.slug);
  const published = storefrontResponse?.storefront?.published || null;
  const storefrontProfile = published
    ? {
        ...profile,
        storefront_theme: {
          primary: published.brandKit?.primary_color || undefined,
          accent: published.brandKit?.accent_color || undefined,
          fontFamily: published.brandKit?.font_family || undefined,
          radius: published.brandKit?.button_shape === 'pill'
            ? '999px'
            : published.brandKit?.button_shape === 'square'
              ? '2px'
              : '0.75rem',
        },
        storefront_logo_url: published.brandKit?.logo_url || '',
      }
    : profile;

  return <PublicPropertiesPage profile={storefrontProfile} />;
}
