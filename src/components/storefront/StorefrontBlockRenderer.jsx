'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { resolveStorefrontBlocks, STOREFRONT_BLOCK_TYPES } from './storefrontPresets';
import {
  experienceCanvasClass,
  resolveTemplateExperience,
  sectionInnerClass,
  STOREFRONT_EXPERIENCE_CSS,
} from './storefrontExperience';
import {
  createStorefrontRendererRegistry,
  storefrontBlockRegistry,
} from './renderers/createStorefrontRendererRegistry';
import { getStorefrontTemplate } from './templates';
import { normalizeBlock } from './builder/storefrontBuilderState';
import { StorefrontTheme } from './storefrontTheme';
import './storefrontAnimations.css';
export { storefrontBlockRegistry };

const LISTING_BLOCK_TYPES = new Set([
  STOREFRONT_BLOCK_TYPES.PROPERTIES,
  STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
  STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
  STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
]);

function markAnimatedChildren(root, blocks) {
  if (!root) return;
  blocks.forEach((block) => {
    const sectionNode = root.querySelector(`[data-storefront-block-id="${block.id}"]`);
    if (!sectionNode) return;
    const animBody = sectionNode.querySelector('.storefront-anim-body');
    if (!animBody) return;
    sectionNode.querySelectorAll('[data-storefront-anim-item="true"]').forEach((node) => {
      node.style.removeProperty('--storefront-child-stagger');
    });
    // Only stagger explicitly marked children — article/li/.storefront-card were
    // assigned stagger vars but never animated (CSS requires the data attribute).
    const childCandidates = animBody.querySelectorAll('[data-storefront-anim-item="true"]');
    childCandidates.forEach((node, idx) => {
      if (idx >= 12) return;
      node.style.setProperty('--storefront-child-stagger', `${Math.min(idx * 55, 440)}ms`);
    });
  });
}

function scheduleAnimationReveal(callback) {
  let raf1 = 0;
  let raf2 = 0;
  let timer = 0;
  raf1 = window.requestAnimationFrame(() => {
    raf2 = window.requestAnimationFrame(() => {
      timer = window.setTimeout(callback, 32);
    });
  });
  return () => {
    window.cancelAnimationFrame(raf1);
    window.cancelAnimationFrame(raf2);
    window.clearTimeout(timer);
  };
}

/** Soft alternating bands for public pages — no tinted inset cards. */
function publicBandBackground(blockType, index, pageBackground) {
  if (blockType === STOREFRONT_BLOCK_TYPES.HERO) return undefined;
  if (pageBackground) return pageBackground;
  if (LISTING_BLOCK_TYPES.has(blockType)) return '#ffffff';
  if (blockType === STOREFRONT_BLOCK_TYPES.FOOTER) return '#f8fafc';
  return index % 2 === 0 ? '#ffffff' : '#f8fafc';
}

/** Template-baked light bands that should yield to brand page background. */
const TEMPLATE_NEUTRAL_BANDS = new Set([
  '#fff',
  '#ffffff',
  '#f8fafc',
  '#fafafa',
  '#f9fafb',
  '#f1f5f9',
  '#faf7ef',
  '#eff6ff',
  '#fff7ed',
  '#fff1f2',
  '#fffbeb',
  '#f0fdf4',
  '#ecfeff',
  '#f8fafc',
]);

function resolveSectionBandBackground({ isHero, styleBackground, pageCanvas, blockType, index }) {
  if (isHero) return undefined;
  const page = String(pageCanvas || '').trim();
  const section = String(styleBackground || '').trim();
  const normalized = section.toLowerCase();
  // Brand page background is the section band fill.
  // Only keep a section Style color when it is an intentional non-neutral override.
  const isNeutral = !section || TEMPLATE_NEUTRAL_BANDS.has(normalized);
  if (page && isNeutral) return page;
  if (section && !isNeutral) return section;
  return page || publicBandBackground(blockType, index, page || undefined);
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
  previewMode = 'desktop',
  scrollRootRef,
  selectedBlockId,
  selectedElement,
  onBlockSelect,
  onElementSelect,
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [animatedVisibleById, setAnimatedVisibleById] = useState({});
  const canvasRef = useRef(null);
  useEffect(() => setIsHydrated(true), []);
  const resolvedBlocks = useMemo(
    () => (profile
      ? resolveStorefrontBlocks(profile, blocks).map((block, index) => normalizeBlock(block, index))
      : []),
    // Depend on fields that affect block resolution, not profile object identity.
    // Builder recreates preview profile objects often (e.g. show_chatbot), which must not
    // rebuild blocks or restart entrance animations.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional stable field deps
    [
      blocks,
      profile?.professional_type,
      profile?.storefront_template_key,
      profile?.professional_name,
      profile?.about,
      profile?.storefront_blocks,
    ],
  );
  const animationConfigSignature = useMemo(
    () => JSON.stringify(
      resolvedBlocks.map((block) => {
        const layout = block?.data?.layout || block?.layout || {};
        return [
          block?.id || '',
          String(layout.animationType || 'none'),
          String(layout.animationTrigger || 'load'),
          String(layout.animationDuration || 'medium'),
          String(layout.animationDelay ?? '0'),
          String(layout.animationIntensity || 'medium'),
        ];
      }),
    ),
    [resolvedBlocks],
  );

  useLayoutEffect(() => {
    if (!isHydrated || !resolvedBlocks.length) return;
    markAnimatedChildren(canvasRef.current, resolvedBlocks);
    // Re-stamp stagger when visibility map changes so late-mounted cards still cascade.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolvedBlocks read with signature/visibility
  }, [isHydrated, animationConfigSignature, animatedVisibleById]);

  useEffect(() => {
    if (!isHydrated || !resolvedBlocks.length) return undefined;
    const root = canvasRef.current;
    if (!root) return undefined;

    const alwaysVisible = {};
    const loadIds = [];
    const scrollIds = [];

    resolvedBlocks.forEach((block, index) => {
      const layout = block?.data?.layout || block?.layout || {};
      const animationType = layout.animationType || 'none';
      if (animationType === 'none') {
        alwaysVisible[block.id] = true;
        return;
      }
      const trigger = layout.animationTrigger || 'load';
      const isHero = block.type === STOREFRONT_BLOCK_TYPES.HERO;
      // Below-fold sections with the legacy "load" default finished animating off-screen,
      // so they looked static when scrolled into view. Reveal them on scroll instead.
      const revealOnScroll = trigger === 'scroll' || (!isHero && trigger === 'load' && index > 0);
      if (revealOnScroll) {
        scrollIds.push(block.id);
      } else {
        loadIds.push(block.id);
      }
    });

    setAnimatedVisibleById({
      ...alwaysVisible,
      ...Object.fromEntries(loadIds.map((id) => [id, false])),
      ...Object.fromEntries(scrollIds.map((id) => [id, false])),
    });

    const revealIds = (ids) => {
      if (!ids.length) return;
      setAnimatedVisibleById((prev) => {
        let changed = false;
        const next = { ...prev };
        ids.forEach((id) => {
          if (next[id]) return;
          next[id] = true;
          changed = true;
        });
        return changed ? next : prev;
      });
    };

    const cancelReveal = scheduleAnimationReveal(() => revealIds(loadIds));

    let scrollObserverTimer = 0;
    let safetyTimer = 0;
    let observer = null;

    const isNodeInView = (node) => {
      if (!node) return false;
      const rect = node.getBoundingClientRect();
      const rootEl = scrollRootRef?.current;
      if (rootEl) {
        const rootRect = rootEl.getBoundingClientRect();
        return rect.bottom > rootRect.top + 8 && rect.top < rootRect.bottom - 8;
      }
      return rect.bottom > 8 && rect.top < window.innerHeight - 8;
    };

    if (scrollIds.length) {
      const scrollRoot = scrollRootRef?.current || null;
      observer = new IntersectionObserver((entries) => {
        const visibleIds = entries
          .filter((entry) => entry.isIntersecting || entry.intersectionRatio > 0)
          .map((entry) => entry.target.getAttribute('data-storefront-block-id'))
          .filter(Boolean);
        revealIds(visibleIds);
      }, {
        threshold: [0, 0.01, 0.08],
        root: scrollRoot,
        rootMargin: scrollRoot ? '0px 0px 18% 0px' : '0px 0px 20% 0px',
      });

      const revealInViewScrollIds = () => {
        scrollIds.forEach((id) => {
          const node = root.querySelector(`[data-storefront-block-id="${id}"]`);
          if (node && isNodeInView(node)) revealIds([id]);
        });
      };

      scrollObserverTimer = window.setTimeout(() => {
        scrollIds.forEach((id) => {
          const node = root.querySelector(`[data-storefront-block-id="${id}"]`);
          if (!node) return;
          observer.observe(node);
        });
        // Wait two frames so opacity:0 paints before keyframe entrance starts.
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            revealInViewScrollIds();
          });
        });
      }, 48);

      // CSS-scaled builder canvases can make IntersectionObserver miss targets.
      // Scroll/resize polling keeps every section revealing when it enters view.
      const scrollTarget = scrollRoot || window;
      scrollTarget.addEventListener('scroll', revealInViewScrollIds, { passive: true });
      window.addEventListener('resize', revealInViewScrollIds);

      safetyTimer = window.setTimeout(() => {
        scrollIds.forEach((id) => {
          const node = root.querySelector(`[data-storefront-block-id="${id}"]`);
          if (!node || isNodeInView(node)) revealIds([id]);
        });
      }, 2200);

      const loadSafetyTimer = window.setTimeout(() => revealIds(loadIds), 1600);

      return () => {
        cancelReveal();
        window.clearTimeout(scrollObserverTimer);
        window.clearTimeout(safetyTimer);
        window.clearTimeout(loadSafetyTimer);
        observer?.disconnect();
        scrollTarget.removeEventListener('scroll', revealInViewScrollIds);
        window.removeEventListener('resize', revealInViewScrollIds);
      };
    }

    const loadSafetyTimer = window.setTimeout(() => revealIds(loadIds), 1600);

    return () => {
      cancelReveal();
      window.clearTimeout(scrollObserverTimer);
      window.clearTimeout(safetyTimer);
      window.clearTimeout(loadSafetyTimer);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid restarting on profile/block array identity churn
  }, [isHydrated, animationConfigSignature, previewMode, preview]);
  if (!profile) return null;
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
    accent: templateBrand.accent_color,
    fontFamily: templateBrand.font,
    radius: templateBrand.button_shape === 'pill'
      ? '999px'
      : templateBrand.button_shape === 'square'
        ? '2px'
        : '0.75rem',
    ...definedThemeValues,
  };
  const isMobilePreview = preview && previewMode === 'mobile';
  const isTabletPreview = preview && previewMode === 'tablet';
  const previewSizeClass = isMobilePreview
    ? 'storefront-preview-mobile'
    : isTabletPreview
      ? 'storefront-preview-tablet'
      : '';
  const responsivePolishCss = `
.storefront-canvas.storefront-preview-mobile {
  font-size: 93%;
}

.storefront-canvas.storefront-preview-tablet {
  font-size: 96%;
}

.storefront-canvas.storefront-preview-mobile [class*="text-4xl"] { font-size: 1.85rem !important; line-height: 1.12 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-3xl"] { font-size: 1.55rem !important; line-height: 1.18 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-2xl"] { font-size: 1.35rem !important; line-height: 1.2 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-xl"] { font-size: 1.18rem !important; line-height: 1.24 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-lg"] { font-size: 1.05rem !important; line-height: 1.3 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-base"] { font-size: 0.95rem !important; line-height: 1.45 !important; }
.storefront-canvas.storefront-preview-mobile [class~="py-16"] { padding-top: 2.9rem !important; padding-bottom: 2.9rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="py-14"] { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="py-12"] { padding-top: 2.2rem !important; padding-bottom: 2.2rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="py-10"] { padding-top: 1.95rem !important; padding-bottom: 1.95rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="gap-14"] { gap: 1.85rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="gap-12"] { gap: 1.55rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="gap-10"] { gap: 1.25rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="gap-8"] { gap: 1rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="p-6"] { padding: 1.1rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="p-5"] { padding: 0.95rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="p-4"] { padding: 0.85rem !important; }

.storefront-canvas.storefront-preview-tablet [class*="text-4xl"] { font-size: 2.05rem !important; line-height: 1.14 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-3xl"] { font-size: 1.75rem !important; line-height: 1.18 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-2xl"] { font-size: 1.5rem !important; line-height: 1.22 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-xl"] { font-size: 1.28rem !important; line-height: 1.26 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-lg"] { font-size: 1.12rem !important; line-height: 1.32 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-base"] { font-size: 0.98rem !important; line-height: 1.48 !important; }
.storefront-canvas.storefront-preview-tablet [class~="py-16"] { padding-top: 3.2rem !important; padding-bottom: 3.2rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="py-14"] { padding-top: 2.8rem !important; padding-bottom: 2.8rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="py-12"] { padding-top: 2.45rem !important; padding-bottom: 2.45rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="py-10"] { padding-top: 2.2rem !important; padding-bottom: 2.2rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="gap-14"] { gap: 2.1rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="gap-12"] { gap: 1.8rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="gap-10"] { gap: 1.5rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="gap-8"] { gap: 1.25rem !important; }

.storefront-canvas.storefront-preview-mobile h1,
.storefront-canvas.storefront-preview-mobile h2,
.storefront-canvas.storefront-preview-mobile h3,
.storefront-canvas.storefront-preview-mobile h4,
.storefront-canvas.storefront-preview-tablet h1,
.storefront-canvas.storefront-preview-tablet h2,
.storefront-canvas.storefront-preview-tablet h3,
.storefront-canvas.storefront-preview-tablet h4 {
  text-wrap: balance;
}

.storefront-canvas.storefront-preview-mobile p,
.storefront-canvas.storefront-preview-tablet p {
  line-height: 1.45 !important;
}

.storefront-canvas.storefront-preview-mobile .storefront-btn {
  font-size: 12px !important;
  min-height: 2.45rem;
}

.storefront-canvas.storefront-preview-tablet .storefront-btn {
  font-size: 12.5px !important;
  min-height: 2.6rem;
}

@media (max-width: 767px) {
  .storefront-canvas {
    font-size: 93%;
  }
  .storefront-canvas [class*="text-4xl"] { font-size: 1.85rem !important; line-height: 1.12 !important; }
  .storefront-canvas [class*="text-3xl"] { font-size: 1.55rem !important; line-height: 1.18 !important; }
  .storefront-canvas [class*="text-2xl"] { font-size: 1.35rem !important; line-height: 1.2 !important; }
  .storefront-canvas [class*="text-xl"] { font-size: 1.18rem !important; line-height: 1.24 !important; }
  .storefront-canvas [class*="text-lg"] { font-size: 1.05rem !important; line-height: 1.3 !important; }
  .storefront-canvas [class*="text-base"] { font-size: 0.95rem !important; line-height: 1.45 !important; }
  .storefront-canvas [class~="py-16"] { padding-top: 2.9rem !important; padding-bottom: 2.9rem !important; }
  .storefront-canvas [class~="py-14"] { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
  .storefront-canvas [class~="py-12"] { padding-top: 2.2rem !important; padding-bottom: 2.2rem !important; }
  .storefront-canvas [class~="py-10"] { padding-top: 1.95rem !important; padding-bottom: 1.95rem !important; }
  .storefront-canvas [class~="gap-14"] { gap: 1.85rem !important; }
  .storefront-canvas [class~="gap-12"] { gap: 1.55rem !important; }
  .storefront-canvas [class~="gap-10"] { gap: 1.25rem !important; }
  .storefront-canvas [class~="gap-8"] { gap: 1rem !important; }
  .storefront-canvas [class~="p-6"] { padding: 1.1rem !important; }
  .storefront-canvas [class~="p-5"] { padding: 0.95rem !important; }
  .storefront-canvas [class~="p-4"] { padding: 0.85rem !important; }
  .storefront-canvas h1,
  .storefront-canvas h2,
  .storefront-canvas h3,
  .storefront-canvas h4 {
    text-wrap: balance;
  }
  .storefront-canvas p {
    line-height: 1.45 !important;
  }
  .storefront-canvas .storefront-btn {
    font-size: 12px !important;
    min-height: 2.45rem;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .storefront-canvas {
    font-size: 96%;
  }
  .storefront-canvas [class*="text-4xl"] { font-size: 2.05rem !important; line-height: 1.14 !important; }
  .storefront-canvas [class*="text-3xl"] { font-size: 1.75rem !important; line-height: 1.18 !important; }
  .storefront-canvas [class*="text-2xl"] { font-size: 1.5rem !important; line-height: 1.22 !important; }
  .storefront-canvas [class*="text-xl"] { font-size: 1.28rem !important; line-height: 1.26 !important; }
  .storefront-canvas [class*="text-lg"] { font-size: 1.12rem !important; line-height: 1.32 !important; }
  .storefront-canvas [class*="text-base"] { font-size: 0.98rem !important; line-height: 1.48 !important; }
  .storefront-canvas [class~="py-16"] { padding-top: 3.2rem !important; padding-bottom: 3.2rem !important; }
  .storefront-canvas [class~="py-14"] { padding-top: 2.8rem !important; padding-bottom: 2.8rem !important; }
  .storefront-canvas [class~="py-12"] { padding-top: 2.45rem !important; padding-bottom: 2.45rem !important; }
  .storefront-canvas [class~="py-10"] { padding-top: 2.2rem !important; padding-bottom: 2.2rem !important; }
  .storefront-canvas [class~="gap-14"] { gap: 2.1rem !important; }
  .storefront-canvas [class~="gap-12"] { gap: 1.8rem !important; }
  .storefront-canvas [class~="gap-10"] { gap: 1.5rem !important; }
  .storefront-canvas [class~="gap-8"] { gap: 1.25rem !important; }
  .storefront-canvas h1,
  .storefront-canvas h2,
  .storefront-canvas h3,
  .storefront-canvas h4 {
    text-wrap: balance;
  }
  .storefront-canvas p {
    line-height: 1.48 !important;
  }
  .storefront-canvas .storefront-btn {
    font-size: 12.5px !important;
    min-height: 2.6rem;
  }
}
`;
  const selectedElementCss = preview && selectedElement?.blockId && selectedElement?.field
    ? [
      `[data-storefront-block-id="${selectedElement.blockId}"]`,
      `[data-storefront-field="${selectedElement.field}"]`,
      selectedElement.itemId
        ? `[data-storefront-item-id="${selectedElement.itemId}"]`
        : (selectedElement.itemIndex != null && selectedElement.itemIndex !== ''
          ? `[data-storefront-item-index="${selectedElement.itemIndex}"]`
          : ''),
      selectedElement.itemField ? `[data-storefront-item-field="${selectedElement.itemField}"]` : '',
      selectedElement.instance !== undefined ? `[data-storefront-instance="${selectedElement.instance}"]` : '',
      '{outline:2px solid var(--color-primary, #0f766e);outline-offset:3px;border-radius:4px;}',
    ].join('')
    : '';

  return (
    <StorefrontTheme theme={resolvedTheme} className={className}>
      <style jsx global>{STOREFRONT_EXPERIENCE_CSS}</style>
      {isHydrated ? <style>{responsivePolishCss}</style> : null}
      {isHydrated && selectedElementCss ? <style>{selectedElementCss}</style> : null}
      <div
        ref={canvasRef}
        className={`${experienceClass} storefront-canvas ${previewSizeClass}`.trim()}
        data-template-key={templateRef}
        data-preview={preview ? 'true' : 'false'}
        data-preview-mode={previewMode}
      >
        {resolvedBlocks.map((block, index) => {
        const Block = blockRegistry[block.type];

        if (!Block) return null;

        const content = block.data?.content || block.content || {};
        const contentItems = Array.isArray(content.items) ? content.items : [];
        const blockProfile = {
          ...profile,
          storefront_builder_preview: preview,
          storefront_preview_mode: previewMode,
          storefront_section_content: content,
          storefront_section_layout: block.data?.layout || block.layout || {},
          storefront_section_style: block.data?.style || block.style || {},
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
        // Always render full-bleed section bands in builder and on the public page
        // so layout stays consistent. Content width is handled by the inner wrapper.
        const bandLayout = {
          ...layout,
          columns: isListing
            ? (isMobilePreview ? '1' : isTabletPreview ? '2' : (layout.columns || '4'))
            : (layout.columns || '3'),
          ...(isHero ? { width: 'full', padding: 'none', cardStyle: 'flat' } : {}),
        };

        const variant = bandLayout.variant || 'standard';
        const columns = String(bandLayout.columns || (isListing ? '4' : '3'));
        const sectionBackground = resolveSectionBandBackground({
          isHero,
          styleBackground: style.background,
          pageCanvas: resolvedTheme.canvas,
          blockType: block.type,
          index,
        });
        const animationType = String(bandLayout.animationType || 'none');
        // Treat empty/"none" as disabled; everything else animates (including legacy defaults).
        const animationEnabled = animationType !== 'none' && animationType !== '';
        // Stay visible until the effect explicitly hides a block for entrance.
        const animationVisible = !animationEnabled || animatedVisibleById[block.id] !== false;
        const animationDuration = {
          fast: 280,
          medium: 500,
          slow: 780,
        }[String(bandLayout.animationDuration || 'medium')] || 500;
        const rawAnimationDelay = Math.max(0, Number.parseInt(bandLayout.animationDelay ?? '0', 10) || 0);
        const animationDelay = (String(bandLayout.animationTrigger || 'load') === 'load' && rawAnimationDelay === 0)
          ? Math.min(index * 80, 560)
          : rawAnimationDelay;
        const intensity = String(bandLayout.animationIntensity || 'medium');
        const animationDistance = intensity === 'strong' ? 32 : intensity === 'subtle' ? 12 : 20;
        const animationScale = animationType === 'zoom'
          ? (intensity === 'strong' ? 0.9 : intensity === 'subtle' ? 0.98 : 0.95)
          : 1;
        const animationBlur = intensity === 'strong' ? 2 : intensity === 'subtle' ? 0 : 1;

        return (
          <section
            key={block.id}
            data-storefront-block={block.type}
            data-storefront-block-id={block.id}
            data-anim-enabled={animationEnabled ? 'true' : 'false'}
            data-anim-visible={animationVisible ? 'true' : 'false'}
            data-anim-type={animationType}
            data-anim-trigger={String(bandLayout.animationTrigger || 'load')}
            data-section-variant={variant}
            data-section-columns={columns}
            onClick={(event) => {
              if (!preview) return;
              const target = event.target.closest?.('[data-storefront-field]');
              if (target) {
                event.preventDefault();
                event.stopPropagation();
                const collection = target.dataset.storefrontCollection;
                const itemId = target.dataset.storefrontItemId;
                const itemIndexRaw = target.dataset.storefrontItemIndex;
                onElementSelect?.({
                  blockId: block.id,
                  kind: itemId || itemIndexRaw != null ? 'item' : 'field',
                  field: target.dataset.storefrontField,
                  source: target.dataset.storefrontSource || 'persisted',
                  collection: collection || undefined,
                  itemId: itemId || undefined,
                  itemIndex: itemIndexRaw != null && itemIndexRaw !== '' ? Number(itemIndexRaw) : undefined,
                  itemField: target.dataset.storefrontItemField || undefined,
                  instance: target.dataset.storefrontInstance || undefined,
                  label: target.dataset.storefrontLabel || target.dataset.storefrontField,
                });
                return;
              }
              onBlockSelect?.(block.id);
            }}
            className={[
              'storefront-public-band relative w-full max-w-none',
              preview
                ? `z-[1] cursor-pointer ${selectedBlockId === block.id ? 'outline outline-2 outline-primary outline-offset-[-2px]' : 'hover:outline hover:outline-1 hover:outline-primary/40 hover:outline-offset-[-1px]'}`
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
              backgroundImage: 'none',
              overflow: 'visible',
              backgroundColor: sectionBackground,
              ...(style.textColor && !isHero ? { color: style.textColor } : {}),
              ...(bandLayout.alignment && !isHero ? { textAlign: bandLayout.alignment } : {}),
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
              className={`storefront-anim-body ${sectionInnerClass(bandLayout)} ${variant === 'split' && !isHero && !isListing ? 'storefront-split-layout' : ''} ${!isHero && variant === 'editorial' ? 'storefront-section--editorial' : ''} ${!isHero && variant === 'premium' ? 'storefront-section--premium' : ''} ${!isHero && variant === 'lead-magnet' ? 'storefront-section--lead-magnet' : ''}`.trim()}
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
