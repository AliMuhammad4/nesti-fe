import { STOREFRONT_BLOCK_TYPES } from '../../storefrontPresets';

export function buildStorefrontBlockProfile({
  profile,
  block,
  templateKey,
  preview,
  previewMode,
  featuredListingDesign,
  expertiseAreas,
}) {
  const content = block.data?.content || block.content || {};
  const contentItems = Array.isArray(content.items) ? content.items : [];
  return {
    ...profile,
    storefront_template_key: templateKey,
    storefront_builder_preview: preview,
    storefront_preview_mode: previewMode,
    storefront_section_content: content,
    storefront_section_layout: block.data?.layout || block.layout || {},
    storefront_section_style: block.data?.style || block.style || {},
    storefront_featured_listing_design: featuredListingDesign,
    storefront_expertise_areas: expertiseAreas,
    ...(block.type === STOREFRONT_BLOCK_TYPES.HERO
      ? {
          headline: content.heading || profile.headline,
          tagline: content.body || profile.tagline,
          hero_eyebrow: content.eyebrow || profile.hero_eyebrow,
          hero_cta_label: content.cta_label || profile.hero_cta_label,
          hero_cta_url: content.cta_url || profile.hero_cta_url,
          hero_trust_items: contentItems.length ? contentItems : profile.hero_trust_items,
        }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.ABOUT && content.body ? { about: content.body } : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.SERVICES && contentItems.length
      ? { services: contentItems }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS && contentItems.length
      ? { testimonials: contentItems }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS && contentItems.length
      ? { mortgage_programs: contentItems }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.PROPERTIES && contentItems.length
      ? { custom_properties: contentItems }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS && contentItems.length
      ? { featured_listings: contentItems }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.TOP_LISTINGS && contentItems.length
      ? { top_listings: contentItems }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS && contentItems.length
      ? { sold_listings: contentItems }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS && contentItems.length
      ? {
          practice_areas: contentItems
            .map((item) => (typeof item === 'string' ? item : item?.title || ''))
            .filter(Boolean),
        }
      : {}),
    ...(block.type === STOREFRONT_BLOCK_TYPES.CREDENTIALS && contentItems.length
      ? {
          credentials: contentItems
            .map((item) => (
              typeof item === 'string'
                ? { title: item, issuer: '', year: '' }
                : {
                    title: item?.title || '',
                    issuer: item?.issuer || '',
                    year: item?.year || '',
                    description: item?.description || item?.details || '',
                  }
            ))
            .filter((item) => item.title),
        }
      : {}),
  };
}
