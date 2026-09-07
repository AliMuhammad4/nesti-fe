import {
  hasReadableHexContrast,
  isLightHexColor,
  lawyerContentValue,
} from '../../lawyer/shared/lawyerSectionUtils';
import {
  cardSurfaceStyle,
  resolveSectionSurfaceChrome,
  shellSurfaceStyle,
} from '../../../runtime/storefrontSectionChrome';

export { cardSurfaceStyle, shellSurfaceStyle };
export const BROKER_ACCENT = 'var(--storefront-accent, #008fd5)';
export const BROKER_INK = 'var(--storefront-primary, #0c2139)';

export function brokerContentValue(content, key, fallback = '') {
  return lawyerContentValue(content, key, fallback);
}

export function sectionPresentation(
  block,
  fallbackBackground = '#ffffff',
  fallbackColor = BROKER_INK,
  fallbackColumns = '3',
) {
  const style = block?.data?.style || block?.style || {};
  const layout = block?.data?.layout || block?.layout || {};
  const background = style.background || fallbackBackground;
  const requestedColor = style.textColor || fallbackColor;
  const isTransparent = !background || String(background).toLowerCase() === 'transparent';
  const color = isTransparent
    ? requestedColor
    : hasReadableHexContrast(requestedColor, background)
      ? requestedColor
      : isLightHexColor(background) ? BROKER_INK : '#ffffff';
  const chrome = resolveSectionSurfaceChrome(style, layout);
  const headingAlignment = ['left', 'center', 'right'].includes(layout.alignment)
    ? layout.alignment
    : 'left';
  const contentAlignment = ['left', 'center', 'right'].includes(layout.contentAlignment)
    ? layout.contentAlignment
    : 'left';
  return {
    background,
    color,
    padding: layout.padding || 'large',
    columns: layout.columns || fallbackColumns,
    alignment: headingAlignment,
    headingAlignment,
    contentAlignment,
    cardStyle: layout.cardStyle || 'bordered',
    mediaPosition: layout.mediaPosition || 'background',
    ...chrome,
  };
}

const LEGACY_BROKER_SECTION_BACKGROUNDS = new Set([
  '',
  'transparent',
  '#fff',
  '#ffffff',
  '#f8fafc',
  '#eff2f6',
  '#eef3f7',
  '#f7f9fb',
  '#0c2139',
  '#008fd5',
]);

export function transparentSectionPresentation(
  block,
  fallbackColor = BROKER_INK,
  fallbackColumns = '3',
) {
  const presentation = sectionPresentation(block, 'transparent', fallbackColor, fallbackColumns);
  const style = block?.data?.style || block?.style || {};
  const configuredBackground = String(style.background || '').trim().toLowerCase();
  if (!LEGACY_BROKER_SECTION_BACKGROUNDS.has(configuredBackground)) return presentation;
  return {
    ...presentation,
    background: 'transparent',
    color: fallbackColor,
  };
}

export function normalizedItems(content, fallback, key = 'items', limit = 8) {
  const hasPersisted = Object.prototype.hasOwnProperty.call(content, key)
    && Array.isArray(content[key]);
  const source = hasPersisted ? content[key] : fallback;
  return {
    hasPersisted,
    items: source
      .map((item, index) => (
        typeof item === 'string'
          ? { id: `${key}-${index}`, title: item, description: '' }
          : {
              ...item,
              id: item?.id || `${key}-${index}`,
              label: item?.label || item?.title || '',
              title: item?.title || item?.label || '',
              description: item?.description ?? item?.text ?? '',
            }
      ))
      .filter((item) => item?.title || item?.label)
      .slice(0, limit),
  };
}

export function brokerPhone(profile, content) {
  return String(
    content.phone
    || profile?.phone
    || profile?.professional_profile?.phone
    || '',
  ).trim();
}

export function brokerAlignmentClass(alignment) {
  return {
    center: 'text-center',
    right: 'text-right',
    left: 'text-left',
  }[alignment] || 'text-left';
}

export function brokerAlignmentMarginClass(alignment) {
  if (alignment === 'center') return 'mx-auto';
  if (alignment === 'right') return 'ml-auto';
  return '';
}

export function brokerContentRegionClass(alignment) {
  return brokerAlignmentClass(alignment);
}

export function brokerContentBadgeMarginClass(alignment) {
  if (alignment === 'center') return 'mx-auto';
  if (alignment === 'right') return 'ml-auto';
  return '';
}

export function brokerFlexContentAlignClass(alignment) {
  return {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[alignment] || 'items-start text-left';
}

export function brokerIconTone(content = {}, item = {}, defaults = {}) {
  const background = String(item?.icon_background || content?.icon_background || defaults.background || '').trim();
  const color = String(item?.icon_color || content?.icon_color || defaults.color || '').trim();
  return {
    background,
    color,
    hasCustom: Boolean(background || color),
  };
}

export function brokerIconSurfaceProps(content = {}, item = {}, presentation = {}, defaults = {}) {
  const tone = brokerIconTone(content, item, defaults);
  const backgroundClass = defaults.backgroundClass || 'bg-[color:var(--storefront-accent,#008fd5)]';
  const colorClass = defaults.colorClass || 'text-white';
  return {
    className: `grid shrink-0 place-items-center ${tone.hasCustom ? '' : `${backgroundClass} ${colorClass}`}`.trim(),
    style: {
      borderRadius: presentation.controlRadius,
      ...(tone.background ? { backgroundColor: tone.background } : {}),
      ...(tone.color ? { color: tone.color } : {}),
    },
  };
}

const DARK_SURFACE_CLASS = {
  glass: 'border border-white/20 bg-white/10 backdrop-blur-xl',
  elevated: 'border border-transparent bg-white/[0.08]',
  flat: 'border border-white/10 bg-white/[0.055]',
  bordered: 'border border-white/15 bg-white/[0.06]',
};

export function brokerDarkSurfaceClass(presentation = {}) {
  return DARK_SURFACE_CLASS[presentation.cardStyle] || DARK_SURFACE_CLASS.bordered;
}

export function brokerHighlightCardStyle(item = {}, presentation = {}) {
  const background = String(item?.background || '').trim();
  const color = String(item?.text_color || '').trim();
  return {
    hasCustom: Boolean(background || color),
    style: {
      ...cardSurfaceStyle(presentation),
      ...(background ? { backgroundColor: background } : {}),
      ...(color ? { color } : {}),
    },
  };
}

export function brokerSectionPaddingClass(padding) {
  return {
    none: 'py-8 sm:py-10',
    small: 'py-10 sm:py-12',
    medium: 'py-12 sm:py-14',
    large: 'py-14 sm:py-16',
  }[String(padding || 'medium')] || 'py-12 sm:py-14';
}

export function brokerResolvedPaddingClass(
  padding,
  fallbackClass = 'py-14 sm:py-16',
) {
  const key = String(padding || '').trim();
  return !key || key === 'none' ? fallbackClass : brokerSectionPaddingClass(key);
}
