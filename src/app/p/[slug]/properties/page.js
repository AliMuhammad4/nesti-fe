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
  const heroBlock = (published?.blocks || []).find((block) => (block?.type || block?.data?.type) === 'hero');
  const heroContent = heroBlock?.data?.content || heroBlock?.content || {};
  const storefrontProfile = published
    ? {
        ...profile,
        storefront_theme: {
          primary: published.brandKit?.primary_color || undefined,
          accent: published.brandKit?.accent_color || undefined,
          canvas: published.brandKit?.page_background || undefined,
          fontFamily: published.brandKit?.font_family || undefined,
          radius: published.brandKit?.button_shape === 'pill'
            ? '999px'
            : published.brandKit?.button_shape === 'square'
              ? '2px'
              : '0.75rem',
        },
        storefront_logo_url: published.brandKit?.logo_url || '',
        storefront_logo_size: published.brandKit?.logo_size || 40,
        storefront_template_key: published.template?.id || '',
        cover_photo_url: published.brandKit?.cover_url || profile.cover_photo_url,
        profile_photo_url: published.brandKit?.profile_photo_url || profile.profile_photo_url,
        storefront_cover_position: {
          x: Number(published.brandKit?.cover_position_x ?? 50),
          y: Number(published.brandKit?.cover_position_y ?? 50),
        },
        storefront_cover_zoom: Math.max(1, Number(published.brandKit?.cover_zoom ?? 1)),
        storefront_profile_position: {
          x: Number(published.brandKit?.profile_position_x ?? 50),
          y: Number(published.brandKit?.profile_position_y ?? 25),
        },
        storefront_profile_zoom: Number(published.brandKit?.profile_zoom ?? 1),
        storefront_show_chatbot: published.brandKit?.show_chatbot !== false,
        storefront_section_content: heroContent,
      }
    : profile;

  return <PublicPropertiesPage profile={storefrontProfile} />;
}
