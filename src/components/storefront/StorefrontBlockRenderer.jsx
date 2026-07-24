'use client';

import { resolveStorefrontBlocks, STOREFRONT_BLOCK_TYPES } from './storefrontPresets';
import {
  experienceCanvasClass,
  resolveTemplateExperience,
  sectionFrameStyle,
  sectionInnerClass,
  STOREFRONT_EXPERIENCE_CSS,
} from './storefrontExperience';
import {
  createStorefrontRendererRegistry,
  storefrontBlockRegistry,
} from './renderers/createStorefrontRendererRegistry';
import { getStorefrontTemplate } from './builder/storefrontTemplates';
import { StorefrontTheme } from './storefrontTheme';
export { storefrontBlockRegistry };

const LISTING_BLOCK_TYPES = new Set([
  STOREFRONT_BLOCK_TYPES.PROPERTIES,
  STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
  STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
  STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
]);

/** Soft alternating bands for public pages — no tinted inset cards. */
function publicBandBackground(blockType, index) {
  if (blockType === STOREFRONT_BLOCK_TYPES.HERO) return undefined;
  if (LISTING_BLOCK_TYPES.has(blockType)) return '#ffffff';
  if (blockType === STOREFRONT_BLOCK_TYPES.FOOTER) return '#f8fafc';
  return index % 2 === 0 ? '#ffffff' : '#f8fafc';
}

/**
 * Renders the current public-profile sections from a role preset or an optional
 * persisted block list. It deliberately owns no API or editor behavior.
 */
export default function StorefrontBlockRenderer({
  profile,
  blocks,
  templateKey,
  theme,
  actions = {},
  className,
  preview = false,
  selectedBlockId,
  onBlockSelect,
}) {
  if (!profile) return null;

  const resolvedBlocks = resolveStorefrontBlocks(profile, blocks);
  const templateRef = templateKey || profile.storefront_template_key || '';
  const experience = resolveTemplateExperience(templateRef);
  const role = profile.professional_type || 'agent';
  const blockRegistry = createStorefrontRendererRegistry({ role, experience });
  const expertiseBlock = resolvedBlocks.find(
    (block) => block.type === STOREFRONT_BLOCK_TYPES.EXPERTISE,
  );
  const storefrontExpertiseAreas = expertiseBlock?.data?.content?.areas
    || expertiseBlock?.content?.areas
    || [];
  const experienceClass = experienceCanvasClass(experience);
  const templateBrand = getStorefrontTemplate(templateRef)?.brand || {};
  const explicitTheme = theme || profile.storefront_theme || {};
  const definedThemeValues = Object.fromEntries(
    Object.entries(explicitTheme).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
  const resolvedTheme = {
    primary: templateBrand.primary_color,
    fontFamily: templateBrand.font,
    radius: templateBrand.button_shape === 'pill'
      ? '999px'
      : templateBrand.button_shape === 'square'
        ? '2px'
        : '0.75rem',
    ...definedThemeValues,
  };

  return (
    <StorefrontTheme theme={resolvedTheme} className={className}>
      <style jsx global>{STOREFRONT_EXPERIENCE_CSS}</style>
      <div className={`${experienceClass} storefront-canvas`.trim()} data-template-key={templateRef} data-preview={preview ? 'true' : 'false'}>
        {resolvedBlocks.map((block, index) => {
        const Block = blockRegistry[block.type];

        if (!Block) return null;

        const content = block.data?.content || block.content || {};
        const contentItems = Array.isArray(content.items) ? content.items : [];
        const blockProfile = {
          ...profile,
          storefront_builder_preview: preview,
          storefront_section_content: content,
          storefront_expertise_areas: storefrontExpertiseAreas,
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
                        }
                  ))
                  .filter((item) => item.title),
              }
            : {}),
        };
        const layout = block.data?.layout || block.layout || {};
        const style = block.data?.style || block.style || {};
        const isHero = block.type === STOREFRONT_BLOCK_TYPES.HERO;
        const isListing = LISTING_BLOCK_TYPES.has(block.type);
        const isFooter = block.type === STOREFRONT_BLOCK_TYPES.FOOTER;
        const useFlatBand = !preview || isHero || isListing || isFooter;

        const flatLayout = useFlatBand
          ? {
              ...layout,
              width: 'full',
              padding: 'none',
              columns: isListing ? '4' : (layout.columns || '3'),
              // Keep content rhythm classes, but never use inset card variants publicly.
              variant: ['split', 'editorial', 'premium', 'lead-magnet'].includes(layout.variant)
                ? layout.variant
                : 'standard',
            }
          : layout;

        const padding = { none: 0, small: '0.25rem', medium: '0.5rem', large: '1rem' }[flatLayout.padding] || undefined;
        const radius = { none: 0, default: '0.75rem', large: '1.5rem' }[style.radius] || undefined;
        const variant = flatLayout.variant || 'standard';
        const columns = String(isListing ? '4' : (flatLayout.columns || '3'));

        const frameStyle = useFlatBand
          ? {
              position: 'relative',
              width: '100%',
              maxWidth: 'none',
              margin: 0,
              boxShadow: 'none',
              borderRadius: 0,
              padding: 0,
              border: 'none',
              backgroundImage: 'none',
              overflow: 'visible',
            }
          : sectionFrameStyle(flatLayout, style, block.type, experience, index);

        const publicBg = useFlatBand ? publicBandBackground(block.type, index) : undefined;

        return (
          <section
            key={block.id}
            data-storefront-block={block.type}
            data-section-variant={variant}
            data-section-columns={columns}
            onClick={() => {
              if (preview) onBlockSelect?.(block.id);
            }}
            className={[
              preview
                ? `relative z-[1] cursor-pointer ${selectedBlockId === block.id ? 'outline outline-2 outline-primary outline-offset-[-2px]' : 'hover:outline hover:outline-1 hover:outline-primary/40 hover:outline-offset-[-1px]'}`
                : '',
              useFlatBand && !isHero ? 'storefront-public-band' : '',
            ].filter(Boolean).join(' ') || undefined}
            style={{
              ...frameStyle,
              ...(useFlatBand
                ? {
                    padding: 0,
                    borderRadius: 0,
                    boxShadow: 'none',
                    border: 'none',
                    borderTop: !isHero && index > 0 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',
                    margin: 0,
                    maxWidth: 'none',
                    width: '100%',
                    backgroundImage: 'none',
                    backgroundColor: publicBg,
                    ...(style.textColor ? { color: style.textColor } : {}),
                    ...(flatLayout.alignment && !isHero ? { textAlign: flatLayout.alignment } : {}),
                  }
                : {
                    ...(style.background && !isHero ? { backgroundColor: style.background } : {}),
                    ...(style.textColor ? { color: style.textColor } : {}),
                    ...(!isFooter && !isHero && padding ? { padding } : {}),
                    ...(!isFooter && !isHero && radius ? { borderRadius: radius, overflow: 'hidden' } : {}),
                    ...(flatLayout.alignment && !isHero ? { textAlign: flatLayout.alignment } : {}),
                  }),
            }}
          >
            {preview && selectedBlockId === block.id ? <span className="absolute left-2 top-2 z-[20] rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">{block.type}</span> : null}
            <div
              className={`${useFlatBand ? 'mx-auto max-w-none' : sectionInnerClass(flatLayout)} ${variant === 'split' && !isHero && !isListing ? 'storefront-split-layout' : ''} ${variant === 'editorial' ? 'storefront-section--editorial' : ''} ${variant === 'premium' ? 'storefront-section--premium' : ''} ${variant === 'lead-magnet' ? 'storefront-section--lead-magnet' : ''}`.trim()}
              style={{ '--storefront-section-columns': columns }}
            >
              <Block profile={blockProfile} actions={actions} block={block} />
            </div>
          </section>
        );
      })}
      </div>
    </StorefrontTheme>
  );
}
