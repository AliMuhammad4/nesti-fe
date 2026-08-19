import { notFound, redirect } from 'next/navigation';
import PublicContactPage from '@/components/storefront/PublicContactPage';
import { getPublicProfile, getPublishedStorefront } from '@/lib/publicProfileClient';

export async function generateMetadata({ params }) {
  try {
    const data = await getPublicProfile(params.slug);
    const name = data.profile?.professional_name || 'Professional';
    return {
      title: `Contact | ${name}`,
      description: `Send a private inquiry to ${name}.`,
    };
  } catch {
    return {
      title: 'Contact',
      description: 'Send a private inquiry.',
    };
  }
}

export default async function ContactPage({ params }) {
  let data;
  try {
    data = await getPublicProfile(params.slug);
  } catch {
    notFound();
  }

  const profile = data?.profile;
  if (!profile?.enabled) notFound();

  const storefrontResponse = await getPublishedStorefront(params.slug);
  const published = storefrontResponse?.storefront?.published || null;
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
      }
    : profile;

  const templateKey = storefrontProfile?.storefront_template_key || profile.storefront_template_key || '';
  if (String(templateKey).trim().toLowerCase() === 'agent-investor') {
    redirect(`/professional/${params.slug}`);
  }

  return <PublicContactPage profile={storefrontProfile} />;
}
