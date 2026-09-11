/**
 * Shared section chrome resolution for builder controls (radius, shadow, card style).
 * Matches the industrial / warm experience sections so inspector values behave the same.
 */
const DEPTH_SHADOW = {
  small: '0 8px 24px rgba(15,23,42,0.10)',
  medium: '0 14px 36px rgba(15,23,42,0.14)',
  large: '0 22px 56px rgba(15,23,42,0.18)',
};

const DEFAULT_CARD_SHADOW = {
  flat: 'none',
  bordered: '0 8px 24px rgba(15,23,42,0.06)',
  elevated: '0 14px 36px rgba(15,23,42,0.14)',
  glass: '0 18px 50px rgba(15,23,42,0.10)',
};

const CARD_VISUAL_CLASS = {
  glass: 'border border-white/80 bg-white/70 backdrop-blur-xl',
  elevated: 'border border-transparent bg-white',
  flat: 'border border-slate-200/80 bg-white',
  bordered: 'border border-slate-200/90 bg-white',
};

export function resolveSectionSurfaceChrome(style = {}, layout = {}) {
  const cardRadius = {
    none: '0px',
    default: '12px',
    large: '20px',
  }[style.radius || 'default'];

  const shellRadius = {
    none: '0px',
    default: '20px',
    large: '28px',
  }[style.radius || 'default'];

  const controlRadius = {
    none: '0px',
    default: '8px',
    large: '12px',
  }[style.radius || 'default'];

  const configuredShadow = style.shadow || 'none';
  const depthShadow = configuredShadow !== 'none' ? DEPTH_SHADOW[configuredShadow] : null;
  const cardStyle = layout.cardStyle || 'bordered';
  const cardVisualClass = CARD_VISUAL_CLASS[cardStyle] || CARD_VISUAL_CLASS.bordered;
  const cardShadow = cardStyle === 'flat'
    ? 'none'
    : depthShadow || DEFAULT_CARD_SHADOW[cardStyle] || DEFAULT_CARD_SHADOW.bordered;
  const shellShadow = depthShadow || (cardStyle === 'flat' ? 'none' : cardShadow);

  return {
    cardRadius,
    shellRadius,
    controlRadius,
    cardShadow,
    shellShadow,
    cardVisualClass,
    cardStyle,
  };
}

export function cardSurfaceStyle(chrome, extra = {}) {
  return {
    borderRadius: chrome.cardRadius,
    boxShadow: chrome.cardShadow,
    ...extra,
  };
}

export function shellSurfaceStyle(chrome, extra = {}) {
  return {
    borderRadius: chrome.shellRadius,
    boxShadow: chrome.shellShadow,
    ...extra,
  };
}
