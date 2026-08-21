import { STOREFRONT_BLOCK_TYPES } from '../../storefrontPresets';
import { visualTreatmentForTemplate } from '../../templates/visualTreatments';
import {
  LISTING_BLOCK_TYPES,
  TEMPLATE_NEUTRAL_BANDS,
  resolveSectionBandBackground,
} from './storefrontSectionBands';

const LAWYER_CLASSIC_THEME_PRIMARY_HEX = new Set(['#24211e', '#202020', '#262626']);
const LAWYER_CLASSIC_THEME_ACCENT_HEX = new Set(['#d39a52']);
const LAWYER_CLASSIC_PRIMARY_BAND_TYPES = new Set([
  STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
  STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE,
  STOREFRONT_BLOCK_TYPES.CREDENTIALS,
  STOREFRONT_BLOCK_TYPES.FOOTER,
]);
const LAWYER_CLASSIC_ACCENT_BAND_TYPES = new Set([
  STOREFRONT_BLOCK_TYPES.CTA,
]);

export function resolveStorefrontBlockPresentation({
  block,
  index,
  templateKey,
  resolvedTheme,
  preview,
  previewMode,
  animatedVisibleById,
}) {
  const layout = block.data?.layout || block.layout || {};
  const style = block.data?.style || block.style || {};
  const isHero = block.type === STOREFRONT_BLOCK_TYPES.HERO;
  const isListing = LISTING_BLOCK_TYPES.has(block.type);
  const isMobilePreview = preview && previewMode === 'mobile';
  const isTabletPreview = preview && previewMode === 'tablet';
  const isLuxuryHero = templateKey === 'agent-luxury-advisor'
    && block.type === STOREFRONT_BLOCK_TYPES.HERO;
  const isLuxuryServices = templateKey === 'agent-luxury-advisor'
    && block.type === STOREFRONT_BLOCK_TYPES.SERVICES;
  const isLuxuryFooter = templateKey === 'agent-luxury-advisor'
    && block.type === STOREFRONT_BLOCK_TYPES.FOOTER;
  const isFirstHomeServices = templateKey === 'agent-first-home'
    && block.type === STOREFRONT_BLOCK_TYPES.SERVICES;
  const isSellerExpertTemplate = templateKey === 'agent-seller-expert';
  const bandLayout = {
    ...layout,
    columns: isListing
      ? (
          isMobilePreview
            ? '1'
            : isTabletPreview
              ? '2'
              : (layout.columns || '4')
        )
      : (layout.columns || '3'),
    ...(isHero ? { width: 'full', padding: 'none', cardStyle: 'flat' } : {}),
    ...(isFirstHomeServices ? { width: 'full' } : {}),
    ...(isSellerExpertTemplate ? { width: 'full' } : {}),
    ...(templateKey === 'lawyer-classic' && !isHero ? { width: 'full', variant: 'standard' } : {}),
    ...((isLuxuryHero || isLuxuryServices || isLuxuryFooter)
      && (!layout.animationType || layout.animationType === 'none' || isLuxuryHero)
      ? {
          animationType: 'none',
        }
      : {}),
  };

  const resolvedAlignment = templateKey === 'lawyer-classic'
    ? (['left', 'center', 'right'].includes(bandLayout.alignment) ? bandLayout.alignment : 'left')
    : bandLayout.alignment;
  const variant = bandLayout.variant || 'standard';
  const columns = String(bandLayout.columns || (isListing ? '4' : '3'));
  let storedBackground = String(style.background || '').trim();
  if (templateKey === 'lawyer-classic' && !isHero) {
    const hex = storedBackground.toLowerCase();
    const usesThemePrimary = LAWYER_CLASSIC_THEME_PRIMARY_HEX.has(hex)
      || (!storedBackground && LAWYER_CLASSIC_PRIMARY_BAND_TYPES.has(block.type));
    const usesThemeAccent = LAWYER_CLASSIC_THEME_ACCENT_HEX.has(hex)
      || (!storedBackground && LAWYER_CLASSIC_ACCENT_BAND_TYPES.has(block.type));
    if (usesThemePrimary && resolvedTheme?.primary) {
      storedBackground = resolvedTheme.primary;
    } else if (usesThemeAccent && resolvedTheme?.accent) {
      storedBackground = resolvedTheme.accent;
    }
  }
  if (
    templateKey === 'agent-first-home'
    && [
      '#2b221c', '#f8f6f2', '#173740', '#f4efe7',
      '#dcecea', '#e6f2f0', '#f7f3ec', '#edf2f7', '#e8f3f1', '#fcefe8',
      '#edf5ff', '#fff4ea', '#eff6ff',
    ].includes(storedBackground.toLowerCase())
  ) {
    storedBackground = visualTreatmentForTemplate(templateKey, block.type, index).bg || storedBackground;
  }
  const useTemplateBand = !storedBackground
    || TEMPLATE_NEUTRAL_BANDS.has(storedBackground.toLowerCase());
  const sectionBackground = resolveSectionBandBackground({
    isHero,
    styleBackground: useTemplateBand ? '' : storedBackground,
    pageCanvas: resolvedTheme.canvas,
    blockType: block.type,
    index,
  });
  const animationType = String(bandLayout.animationType || 'none');
  const animationEnabled = animationType !== 'none' && animationType !== '';
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
  const sectionTextOverrideClass = style.textColor && !isHero
    ? (
        templateKey === 'lawyer-classic'
          ? '[&_h1]:!text-current [&_h2]:!text-current [&_h3]:!text-current [&_h4]:!text-current [&_.text-primary]:!text-current [&_.text-slate-500]:!text-current [&_.text-slate-600]:!text-current [&_.text-primary-contrast]:!text-current'
          : '[&_h1]:!text-current [&_h2]:!text-current [&_h3]:!text-current [&_h4]:!text-current [&_p]:!text-current [&_.text-text-heading]:!text-current [&_.text-text-body]:!text-current [&_.text-text-muted]:!text-current'
      )
    : '';

  return {
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
  };
}
