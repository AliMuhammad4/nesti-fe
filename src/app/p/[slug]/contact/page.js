import { notFound, redirect } from 'next/navigation';
import PublicContactPage from '@/components/storefront/PublicContactPage';
import { getPublicProfile, getPublishedStorefront } from '@/lib/publicProfileClient';
import {
  canonicalPublishedStorefrontBlocks,
  resolvePublishedStorefrontBrandKit,
} from '@/lib/publishedStorefront';

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
  const templateKey = published?.template?.id || profile.storefront_template_key || '';
  const publishedBrandKit = resolvePublishedStorefrontBrandKit(
    templateKey,
    published?.brandKit || {},
  );
  const publishedBlocks = canonicalPublishedStorefrontBlocks({
    templateKey,
    blocks: published?.blocks || [],
    profile,
    brandKit: publishedBrandKit,
  });
  const resolvedCoverPhoto = publishedBrandKit.cover_url || profile.cover_photo_url || '';
  const resolvedProfilePhoto = publishedBrandKit.profile_photo_url || profile.profile_photo_url || '';
  const storefrontProfile = published
    ? {
        ...profile,
        storefront_blocks: publishedBlocks,
        storefront_theme: {
          primary: publishedBrandKit.primary_color || undefined,
          accent: publishedBrandKit.accent_color || undefined,
          canvas: publishedBrandKit.page_background || undefined,
          fontFamily: publishedBrandKit.font || publishedBrandKit.font_family || undefined,
          radius: publishedBrandKit.button_shape === 'pill'
            ? '999px'
            : publishedBrandKit.button_shape === 'square'
              ? '2px'
              : '0.75rem',
        },
        storefront_brand_kit: publishedBrandKit,
        storefront_logo_url: publishedBrandKit.logo_url || '',
        storefront_logo_dark_url: publishedBrandKit.logo_dark_url || '',
        storefront_logo_size: publishedBrandKit.logo_size || 40,
        storefront_image_style: publishedBrandKit.image_style || '',
        storefront_essentials: publishedBrandKit.essentials || {},
        storefront_template_key: templateKey,
        cover_photo_url: resolvedCoverPhoto,
        profile_photo_url: resolvedProfilePhoto,
        storefront_profile_fallback_url: profile.profile_photo_url || '',
        storefront_cover_position: {
          x: Number(publishedBrandKit.cover_position_x ?? 50),
          y: Number(publishedBrandKit.cover_position_y ?? 50),
        },
        storefront_cover_zoom: Math.max(1, Number(publishedBrandKit.cover_zoom ?? 1)),
        storefront_profile_position: {
          x: Number(publishedBrandKit.profile_position_x ?? 50),
          y: Number(publishedBrandKit.profile_position_y ?? 25),
        },
        storefront_profile_zoom: Number(publishedBrandKit.profile_zoom ?? 1),
        storefront_show_chatbot: publishedBrandKit.show_chatbot !== false,
      }
    : profile;

  const resolvedTemplateKey = storefrontProfile?.storefront_template_key || profile.storefront_template_key || '';
  if (String(resolvedTemplateKey).trim().toLowerCase() === 'agent-investor') {
    redirect(`/professional/${params.slug}`);
  }

  return <PublicContactPage profile={storefrontProfile} />;
}
