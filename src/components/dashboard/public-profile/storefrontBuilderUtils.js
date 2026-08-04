import { normalizeBlocks } from '@/components/storefront/builder/storefrontBuilderState';
import { getStorefrontTemplate } from '@/components/storefront/templates';

export function blockLayoutStyleSignature(blocks = []) {
  return JSON.stringify(
    normalizeBlocks(blocks).map((block) => ({
      type: block?.type || '',
      enabled: block?.data?.enabled ?? true,
      layout: block?.data?.layout || {},
      style: block?.data?.style || {},
    })),
  );
}

export function normalizeHexForCompare(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withHash = raw.startsWith('#') ? raw : `#${raw}`;
  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : withHash.toLowerCase();
}

export function buildStorefrontDraft(editorData) {
  const templateMeta = getStorefrontTemplate(editorData.template_key);
  return {
    template: {
      id: editorData.template_key,
      name: templateMeta?.label || editorData.template_key,
      version: '2',
    },
    brandKit: {
      logo_url: editorData.brand_kit.logo_url || null,
      logo_dark_url: editorData.brand_kit.logo_dark_url || null,
      cover_url: editorData.brand_kit.cover_url || null,
      profile_photo_url: editorData.brand_kit.profile_photo_url || null,
      logo_size: Number(editorData.brand_kit.logo_size) || 40,
      cover_position_x: Number(editorData.brand_kit.cover_position_x ?? 50),
      cover_position_y: Number(editorData.brand_kit.cover_position_y ?? 50),
      cover_zoom: Math.max(1, Number(editorData.brand_kit.cover_zoom ?? 1)),
      profile_position_x: Number(editorData.brand_kit.profile_position_x ?? 50),
      profile_position_y: Number(editorData.brand_kit.profile_position_y ?? 25),
      profile_zoom: Number(editorData.brand_kit.profile_zoom ?? 1),
      primary_color: editorData.brand_kit.primary_color || null,
      secondary_color: editorData.brand_kit.accent_color || null,
      accent_color: editorData.brand_kit.accent_color || null,
      page_background: editorData.brand_kit.page_background || null,
      font_family: editorData.brand_kit.font || null,
      button_shape: editorData.brand_kit.button_shape || null,
      business_name: editorData.brand_kit.business_name || null,
      image_style: editorData.brand_kit.image_style || null,
      essentials: editorData.brand_kit.essentials || {},
      show_chatbot: editorData.brand_kit.show_chatbot !== false,
    },
    blocks: normalizeBlocks(editorData.blocks).map((block) => ({
      id: block.id,
      type: block.type,
      data: block.data,
    })),
  };
}

export function draftSignature(draft) {
  try {
    return JSON.stringify(draft);
  } catch {
    return `${Date.now()}`;
  }
}

export function sanitizeAiGenerationBrandKit(brandKit = {}) {
  return {
    business_name: brandKit.business_name || '',
    logo_url: brandKit.logo_url || '',
    logo_dark_url: brandKit.logo_dark_url || '',
    cover_url: brandKit.cover_url || '',
    profile_photo_url: brandKit.profile_photo_url || '',
    logo_size: Number(brandKit.logo_size) || 40,
    cover_position_x: Number(brandKit.cover_position_x ?? 50),
    cover_position_y: Number(brandKit.cover_position_y ?? 50),
    cover_zoom: Math.max(1, Number(brandKit.cover_zoom ?? 1)),
    profile_position_x: Number(brandKit.profile_position_x ?? 50),
    profile_position_y: Number(brandKit.profile_position_y ?? 25),
    profile_zoom: Number(brandKit.profile_zoom ?? 1),
    primary_color: brandKit.primary_color || '#0f766e',
    accent_color: brandKit.accent_color || '#f59e0b',
    page_background: brandKit.page_background || '#ffffff',
    font: brandKit.font || 'Manrope',
    button_shape: brandKit.button_shape || 'rounded',
    image_style: brandKit.image_style || 'editorial',
    show_chatbot: brandKit.show_chatbot !== false,
    essentials: brandKit.essentials || {},
  };
}
