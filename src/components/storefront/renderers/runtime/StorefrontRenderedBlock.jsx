'use client';

import { STOREFRONT_BLOCK_TYPES } from '../../storefrontPresets';
import { sectionInnerClass } from '../../storefrontExperience';
import { hasPublicClientStories } from '../../storefrontContentVisibility';
import { buildStorefrontBlockProfile } from './buildStorefrontBlockProfile';
import { resolveStorefrontBlockPresentation } from './resolveStorefrontBlockPresentation';
import { createInlineEditingHandlers } from './storefrontInlineEditing';

export default function StorefrontRenderedBlock({
  block,
  index,
  blockOccurrence = 0,
  Block,
  profile,
  actions = {},
  templateKey,
  preview = false,
  previewMode = 'desktop',
  selectedBlockId,
  selectedElement,
  onBlockSelect,
  onElementSelect,
  onInlineContentInput,
  onInlineContentChange,
  featuredListingDesign,
  expertiseAreas,
  resolvedTheme,
  animatedVisibleById,
}) {
  if (!Block) return null;

  const content = block.data?.content || block.content || {};
  const contentItems = Array.isArray(content.items) ? content.items : [];
  if (
    block.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS
    && !preview
    && !['lawyer-classic', 'lawyer-first-home-closing', 'lawyer-newcomer'].includes(templateKey)
    && !hasPublicClientStories({
      ...profile,
      testimonials: contentItems.length ? contentItems : profile.testimonials,
    })
  ) {
    return null;
  }

  const blockProfile = buildStorefrontBlockProfile({
    profile,
    block,
    templateKey,
    preview,
    previewMode,
    featuredListingDesign,
    expertiseAreas,
  });
  const presentation = resolveStorefrontBlockPresentation({
    block,
    index,
    templateKey,
    resolvedTheme,
    preview,
    previewMode,
    animatedVisibleById,
  });
  const {
    style,
    isHero,
    isListing,
    bandLayout,
    resolvedAlignment,
    variant,
    columns,
    sectionBackground,
    animationType,
    animationEnabled,
    animationVisible,
    animationDuration,
    animationDelay,
    animationDistance,
    animationScale,
    animationBlur,
    sectionTextOverrideClass,
  } = presentation;
  const sectionLayout = templateKey === 'lawyer-first-home-closing'
    ? { ...bandLayout, width: 'full' }
    : bandLayout;
  const editingHandlers = createInlineEditingHandlers({
    preview,
    block,
    onBlockSelect,
    onElementSelect,
    onInlineContentInput,
    onInlineContentChange,
  });

  return (
    <section
      data-storefront-block={block.type}
      data-storefront-block-id={block.id}
      data-anim-enabled={animationEnabled ? 'true' : 'false'}
      data-anim-visible={animationVisible ? 'true' : 'false'}
      data-anim-type={animationType}
      data-anim-trigger={String(bandLayout.animationTrigger || 'load')}
      data-section-variant={variant}
      data-section-columns={columns}
      onClickCapture={editingHandlers.onClickCapture}
      onClick={editingHandlers.onClick}
      onKeyDown={editingHandlers.onKeyDown}
      onInput={editingHandlers.onInput}
      onBlur={editingHandlers.onBlur}
      className={[
        'storefront-public-band relative w-full max-w-none',
        sectionTextOverrideClass,
        preview
          ? `z-[1] cursor-pointer ${
              templateKey === 'lawyer-classic' && isHero
                ? ''
                : selectedBlockId === block.id
                  ? 'outline outline-2 outline-primary outline-offset-[-2px]'
                  : 'hover:outline hover:outline-1 hover:outline-primary/40 hover:outline-offset-[-1px]'
            }`
          : '',
      ].filter(Boolean).join(' ') || undefined}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 'none',
        margin: 0,
        padding: 0,
        border: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        ...(templateKey === 'lawyer-newcomer' ? {} : { backgroundImage: 'none' }),
        overflow: 'visible',
        backgroundColor: sectionBackground,
        ...(style.textColor && !isHero ? { color: style.textColor } : {}),
        ...(resolvedAlignment && !isHero ? { textAlign: resolvedAlignment } : {}),
        '--storefront-anim-duration': `${animationDuration}ms`,
        '--storefront-anim-delay': `${animationDelay}ms`,
        '--storefront-anim-distance': `${animationDistance}px`,
        '--storefront-anim-scale': String(animationScale),
        '--storefront-anim-blur': `${animationBlur}px`,
      }}
    >
      {preview && selectedBlockId === block.id ? (
        <span className="absolute left-2 top-2 z-[20] rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
          {selectedElement && selectedElement.kind !== 'block'
            ? selectedElement.label || block.type
            : block.type}
        </span>
      ) : null}
      <div
        className={`storefront-anim-body ${sectionInnerClass(sectionLayout)} ${
          templateKey !== 'lawyer-classic' && variant === 'split' && !isHero && !isListing ? 'storefront-split-layout' : ''
        } ${templateKey !== 'lawyer-classic' && !isHero && variant === 'editorial' ? 'storefront-section--editorial' : ''} ${
          templateKey !== 'lawyer-classic' && !isHero && variant === 'premium' ? 'storefront-section--premium' : ''
        } ${templateKey !== 'lawyer-classic' && !isHero && variant === 'lead-magnet' ? 'storefront-section--lead-magnet' : ''}`.trim()}
        style={{
          '--storefront-section-columns': columns,
          ...(templateKey === 'lawyer-newcomer' && isHero ? { isolation: 'auto' } : {}),
        }}
      >
        <Block
          profile={blockProfile}
          actions={actions}
          block={{
            ...block,
            runtime: {
              ...(block.runtime || {}),
              typeOccurrence: blockOccurrence,
            },
          }}
        />
      </div>
    </section>
  );
}
