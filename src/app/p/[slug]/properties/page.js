import { notFound } from 'next/navigation';
import {
  getPublicProfileShell,
  getPublishedStorefront,
  getSellerProperties,
} from '@/lib/publicProfileClient';
import PublicPropertiesPageClient from '@/components/storefront/PublicPropertiesPageClient';

export async function generateMetadata({ params }) {
  try {
    const data = await getPublicProfileShell(params.slug);
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
  let storefrontResponse;
  let propertiesResponse;
  try {
    [data, storefrontResponse, propertiesResponse] = await Promise.all([
      getPublicProfileShell(params.slug),
      getPublishedStorefront(params.slug),
      getSellerProperties(params.slug),
    ]);
  } catch {
    notFound();
  }

  const profile = data?.profile;
  if (!profile?.enabled || profile.professional_type !== 'agent') {
    notFound();
  }

  const published = storefrontResponse?.storefront?.published || null;
  const properties = (propertiesResponse?.properties || []).map((property) => ({
    ...property,
    _id: property._id || property.id,
    price: property.price || property.expected_price,
    photos: property.photos?.length ? property.photos : property.images || [],
    square_feet: property.square_feet || property.square_footage,
    status: property.status || 'available',
  }));
  const publishedBlocks = (published?.blocks || []).map((block) => ({
    ...block,
    type: block?.type || block?.data?.type,
    enabled: block?.data?.enabled ?? block?.enabled ?? true,
    data: {
      ...(block?.data || {}),
      content: block?.data?.content || block?.content || {},
      layout: block?.data?.layout || block?.layout || {},
      style: block?.data?.style || block?.style || {},
    },
  }));
  const heroBlock = (published?.blocks || []).find((block) => (block?.type || block?.data?.type) === 'hero');
  const heroContent = heroBlock?.data?.content || heroBlock?.content || {};
  const resolvedCoverPhoto = published?.brandKit?.cover_url || profile.cover_photo_url || '';
  const resolvedProfilePhoto = published?.brandKit?.profile_photo_url || profile.profile_photo_url || '';
  const storefrontProfile = published
    ? {
        ...profile,
        storefront_blocks: publishedBlocks,
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
        storefront_logo_dark_url: published.brandKit?.logo_dark_url || '',
        storefront_logo_size: published.brandKit?.logo_size || 40,
        storefront_image_style: published.brandKit?.image_style || '',
        storefront_essentials: published.brandKit?.essentials || {},
        storefront_template_key: published.template?.id || '',
        cover_photo_url: resolvedCoverPhoto,
        profile_photo_url: resolvedProfilePhoto,
        storefront_profile_fallback_url: profile.profile_photo_url || '',
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

  return <PublicPropertiesPageClient profile={storefrontProfile} listings={properties} />;
}
