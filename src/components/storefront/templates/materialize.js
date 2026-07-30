import { createBlock, normalizeBlocks } from '../builder/storefrontBuilderState';
import { buildTemplateContext } from './shared/context';
import { T } from './shared/blockFactory';
import { getStorefrontTemplate } from './registry';
import { listingCardThemeFromTemplate, visualTreatmentForTemplate } from './visualTreatments';

export { buildTemplateContext };

export function materializeTemplate(templateKey, profile = {}, existingBrandKit = {}) {
  const template = getStorefrontTemplate(templateKey);
  if (!template) return null;
  const ctx = buildTemplateContext(profile);
  const listingCardTheme = listingCardThemeFromTemplate(template.id);
  const listingTypes = new Set([T.PROPERTIES, T.FEATURED_LISTINGS, T.TOP_LISTINGS, T.SOLD_LISTINGS]);
  const rawBlocks = template.blocks(ctx).map((entry, index) => {
    const created = createBlock(entry.type);
    const visual = visualTreatmentForTemplate(template.id, entry.type, index);
    const isListing = listingTypes.has(entry.type);
    return {
      ...created,
      id: `${entry.type}-${index + 1}`,
      data: {
        ...created.data,
        ...entry.data,
        content: {
          ...created.data.content,
          ...(isListing ? {
            card_background: listingCardTheme.card_background,
            card_text_color: listingCardTheme.card_text_color,
          } : {}),
          ...(entry.data?.content || {}),
        },
        layout: {
          ...created.data.layout,
          ...(entry.data?.layout || {}),
          alignment: visual.align,
          padding: visual.padding,
          width: visual.width,
          variant: visual.variant,
          mediaPosition: visual.mediaPosition,
          columns: visual.columns,
          cardStyle: isListing ? (listingCardTheme.cardStyle || visual.cardStyle) : visual.cardStyle,
        },
        style: {
          ...created.data.style,
          background: entry.data?.style?.background || '',
          radius: visual.radius,
          shadow: visual.shadow,
          ...(entry.data?.style || {}),
        },
      },
    };
  });

  return {
    template_key: template.id,
    brand_kit: {
      ...existingBrandKit,
      ...template.brand,
      page_background: template.brand.page_background || existingBrandKit.page_background || '#ffffff',
      business_name: existingBrandKit.business_name || profile.professional_profile?.company_name || '',
      logo_url: existingBrandKit.logo_url || '',
      cover_url: existingBrandKit.cover_url || '',
      profile_photo_url: existingBrandKit.profile_photo_url || '',
    },
    blocks: normalizeBlocks(rawBlocks),
  };
}

export function seedBlockContentFromProfile(blocks = [], profile = {}, templateKey = '') {
  const ctx = buildTemplateContext(profile);
  return normalizeBlocks(blocks).map((block, index) => {
    const originalLayout = blocks[index]?.data?.layout || {};
    const originalStyle = blocks[index]?.data?.style || {};
    const content = { ...block.data.content };
    const visual = visualTreatmentForTemplate(templateKey, block.type, index);
    if (block.type === T.HERO) {
      if (!content.heading) content.heading = ctx.headline || `Work with ${ctx.name}`;
      if (!content.body) content.body = ctx.tagline || '';
      if (!content.cta_label) content.cta_label = 'Book a consultation';
    }
    if (block.type === T.ABOUT) {
      if (!content.heading) content.heading = `About ${ctx.name}`;
      if (!content.body) content.body = ctx.about || '';
    }
    if (block.type === T.CTA) {
      if (!content.heading) content.heading = 'Ready to talk?';
      if (!content.cta_label) content.cta_label = 'Start a conversation';
    }
    return {
      ...block,
      data: {
        ...block.data,
        content,
        layout: {
          ...block.data.layout,
          alignment: originalLayout.alignment || visual.align,
          padding: originalLayout.padding || visual.padding,
          width: originalLayout.width || visual.width,
          variant: originalLayout.variant || visual.variant,
          mediaPosition: originalLayout.mediaPosition || visual.mediaPosition,
          columns: String(originalLayout.columns || visual.columns),
          cardStyle: originalLayout.cardStyle || visual.cardStyle,
          animationType: originalLayout.animationType || block.data.layout.animationType,
          animationTrigger: originalLayout.animationTrigger || block.data.layout.animationTrigger,
          animationDuration: originalLayout.animationDuration || block.data.layout.animationDuration,
          animationDelay: originalLayout.animationDelay ?? block.data.layout.animationDelay,
          animationIntensity: originalLayout.animationIntensity || block.data.layout.animationIntensity,
        },
        style: {
          ...block.data.style,
          background: originalStyle.background || '',
          radius: originalStyle.radius || visual.radius,
          shadow: originalStyle.shadow || visual.shadow,
        },
      },
    };
  });
}
