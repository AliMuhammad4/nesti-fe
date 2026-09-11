import { useMemo } from 'react';

export function buildBuilderPreviewProfile({
  profile,
  normalized,
  templateKey,
  brandKit,
  embedToken,
  accessToken,
  media,
  selectedElement,
}) {
  return {
    ...profile,
    professional_name: profile?.professional_name,
    storefront_template_key: templateKey,
    storefront_blocks: normalized,
    embed_token: embedToken || profile?.embed_token,
    storefront_builder_access_token: accessToken,
    storefront_builder_selection: selectedElement,
    storefront_logo_url: brandKit.logo_url || profile?.storefront_logo_url,
    storefront_logo_dark_url: brandKit.logo_dark_url || '',
    storefront_logo_size: Number(brandKit.logo_size) || profile?.storefront_logo_size || 40,
    storefront_image_style: brandKit.image_style || 'editorial',
    cover_photo_url: media?.cover || brandKit.cover_url || profile?.cover_photo_url || profile?.cover_image,
    profile_photo_url: media?.profile || brandKit.profile_photo_url || profile?.profile_photo_url,
    storefront_profile_fallback_url: profile?.profile_photo_url || '',
    storefront_cover_position: {
      x: Number(brandKit.cover_position_x ?? 50),
      y: Number(brandKit.cover_position_y ?? 50),
    },
    storefront_cover_zoom: Math.max(1, Number(brandKit.cover_zoom ?? 1)),
    storefront_profile_position: {
      x: Number(brandKit.profile_position_x ?? 50),
      y: Number(brandKit.profile_position_y ?? 25),
    },
    storefront_profile_zoom: Number(brandKit.profile_zoom ?? 1),
    storefront_essentials: brandKit.essentials || {},
    storefront_brand_kit: brandKit,
    brand_kit: brandKit,
    storefront_theme: {
      primary: brandKit.primary_color,
      accent: brandKit.accent_color,
      canvas: brandKit.page_background || '#ffffff',
      fontFamily: brandKit.font || 'Manrope',
      radius: brandKit.button_shape === 'pill' ? '999px' : brandKit.button_shape === 'square' ? '2px' : '0.75rem',
    },
  };
}

export function useBuilderPreviewProfile(args) {
  return useMemo(
    () => buildBuilderPreviewProfile(args),
    [
      args.profile,
      args.normalized,
      args.templateKey,
      args.brandKit,
      args.embedToken,
      args.accessToken,
      args.media?.cover,
      args.media?.profile,
      args.selectedElement,
    ],
  );
}
