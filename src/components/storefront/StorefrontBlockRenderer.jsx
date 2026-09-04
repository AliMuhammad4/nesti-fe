'use client';

import {
  normalizeStorefrontRole,
  STOREFRONT_BLOCK_TYPES,
} from './storefrontPresets';
import {
  experienceCanvasClass,
  getStorefrontExperienceCss,
  resolveTemplateExperience,
} from './storefrontExperience';
import {
  createStorefrontRendererRegistry,
  storefrontBlockRegistry,
} from './renderers/createStorefrontRendererRegistry';
import { getStorefrontTemplate } from './templates';
import { StorefrontTheme } from './storefrontTheme';
import StorefrontInlineStyle from './StorefrontInlineStyle';
import StorefrontRenderedBlock from './renderers/runtime/StorefrontRenderedBlock';
import { resolveStorefrontRendererTheme } from './renderers/runtime/resolveStorefrontRendererTheme';
import { previewSizeClass, RESPONSIVE_POLISH_CSS } from './renderers/runtime/storefrontRendererStyles';
import { buildSelectedElementCss } from './renderers/runtime/storefrontInlineEditing';
import { useResolvedStorefrontBlocks } from './renderers/runtime/useResolvedStorefrontBlocks';
import { useStorefrontBlockAnimations } from './renderers/runtime/useStorefrontBlockAnimations';
import './storefrontAnimations.css';

export { storefrontBlockRegistry };

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
  previewMode = 'desktop',
  scrollRootRef,
  selectedBlockId,
  selectedElement,
  onBlockSelect,
  onElementSelect,
  onInlineContentInput,
  onInlineContentChange,
}) {
  const { templateRef, resolvedBlocks } = useResolvedStorefrontBlocks({
    profile,
        blocks,
    templateKey,
  });
  const { canvasRef, isHydrated, animatedVisibleById } = useStorefrontBlockAnimations({
    blocks: resolvedBlocks,
    scrollRootRef,
    preview,
    previewMode,
  });
  if (!profile) return null;
  const experience = resolveTemplateExperience(templateRef) || 'classic-balanced';
  // Profiles can store aliases such as realtor/real_estate_agent; renderer
  // overrides are registered under canonical storefront roles (agent, etc.).
  const role = normalizeStorefrontRole(profile.professional_type) || 'agent';
  const blockRegistry = createStorefrontRendererRegistry({
    role,
    experience,
    templateKey: templateRef,
  });
  const expertiseBlock = resolvedBlocks.find(
    (block) => block.type === STOREFRONT_BLOCK_TYPES.EXPERTISE,
  );
  const storefrontExpertiseAreas = expertiseBlock?.data?.content?.areas
    || expertiseBlock?.content?.areas
    || [];
  const experienceClass = experienceCanvasClass(experience);
  const templateBrand = getStorefrontTemplate(templateRef)?.brand || {};
  const templateThemeVersion = templateRef === 'lawyer-first-home-closing'
    ? (
      profile?.storefront_essentials?.lawyer_first_home_brand_version
      ?? profile?.storefront_brand_kit?.essentials?.lawyer_first_home_brand_version
      ?? profile?.brand_kit?.essentials?.lawyer_first_home_brand_version
      ?? 0
    )
    : 0;
  const resolvedTheme = resolveStorefrontRendererTheme({
    templateKey: templateRef,
    explicitTheme: theme,
    profileTheme: profile.storefront_theme,
    templateBrand,
    templateThemeVersion,
  });
  const selectedElementCss = buildSelectedElementCss({ preview, selectedElement });
  const featuredListingDesign = resolvedBlocks.find(
    (candidate) => candidate.type === STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
  ) || null;

  return (
    <StorefrontTheme
      theme={resolvedTheme}
      className={className}
    >
      {/* Injected via createElement so Turbopack does not rewrite these as styled-jsx. */}
      <StorefrontInlineStyle css={getStorefrontExperienceCss()} />
      <StorefrontInlineStyle css={RESPONSIVE_POLISH_CSS} />
      {isHydrated && selectedElementCss ? <StorefrontInlineStyle css={selectedElementCss} /> : null}
      <div
        ref={canvasRef}
        className={`${experienceClass} storefront-canvas ${previewSizeClass({ preview, previewMode })}`.trim()}
        data-template-key={templateRef}
        data-template-experience={experience}
        data-preview={preview ? 'true' : 'false'}
        data-preview-mode={previewMode}
      >
        {resolvedBlocks.map((block, index) => (
          <StorefrontRenderedBlock
            key={block.id}
            block={block}
            index={index}
            blockOccurrence={resolvedBlocks
              .slice(0, index)
              .filter((candidate) => candidate.type === block.type)
              .length}
            Block={blockRegistry[block.type]}
            profile={profile}
            actions={actions}
            templateKey={templateRef}
            preview={preview}
            previewMode={previewMode}
            selectedBlockId={selectedBlockId}
            selectedElement={selectedElement}
            onBlockSelect={onBlockSelect}
            onElementSelect={onElementSelect}
            onInlineContentInput={onInlineContentInput}
            onInlineContentChange={onInlineContentChange}
            featuredListingDesign={featuredListingDesign}
            expertiseAreas={storefrontExpertiseAreas}
            resolvedTheme={resolvedTheme}
            animatedVisibleById={animatedVisibleById}
          />
        ))}
      </div>
    </StorefrontTheme>
  );
}
