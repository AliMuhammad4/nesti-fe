import { STOREFRONT_BLOCK_TYPES } from './storefrontPresets';
import {
  allExperienceCss,
  experienceIdFromTemplateKey,
  getStorefrontExperience,
} from './experiences';

const CARD_STYLE_SHADOW = {
  flat: 'none',
  bordered: 'inset 0 0 0 1px rgba(15, 23, 42, 0.08)',
  elevated: '0 24px 70px rgba(15, 23, 42, 0.12)',
  glass: 'inset 0 0 0 1px rgba(255, 255, 255, 0.62), 0 24px 80px rgba(15, 23, 42, 0.11)',
};

const EXPLICIT_SHADOW = {
  none: 'none',
  small: '0 10px 26px rgba(15, 23, 42, 0.09)',
  medium: '0 18px 46px rgba(15, 23, 42, 0.12)',
  large: '0 30px 80px rgba(15, 23, 42, 0.16)',
};

export const STOREFRONT_EXPERIENCE_CSS = `
  ${allExperienceCss()}

  .storefront-canvas {
    background: #ffffff;
  }

  .storefront-page-col12 {
    isolation: isolate;
  }

  .storefront-page-col12 .storefront-canvas,
  .storefront-page-col12 [class*='storefront-experience-'] {
    background: transparent !important;
    background-image: none !important;
    padding-bottom: 0 !important;
  }

  .storefront-public-band {
    overflow: hidden;
  }

  .storefront-section--premium > * {
    position: relative;
    z-index: 1;
  }

  .storefront-section--editorial h1,
  .storefront-section--editorial h2 {
    letter-spacing: -0.03em;
  }

  .storefront-section--split > .storefront-split-layout {
    display: grid;
    gap: clamp(1.5rem, 4vw, 3rem);
  }

  @media (min-width: 900px) {
    .storefront-section--split > .storefront-split-layout {
      grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
      align-items: center;
    }
  }

  .storefront-section--feature-grid [class*='grid']:not(.storefront-listings-grid) {
    grid-template-columns: repeat(var(--storefront-section-columns, 3), minmax(0, 1fr));
  }

  .storefront-listings-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }

  @media (max-width: 1023px) {
    .storefront-listings-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 639px) {
    .storefront-listings-grid {
      grid-template-columns: minmax(0, 1fr) !important;
    }
  }

  .storefront-section--lead-magnet form,
  .storefront-section--lead-magnet [class*='rounded'] {
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  }

  .storefront-section--minimal {
    border-radius: 0 !important;
  }

  .is-media-background {
    isolation: isolate;
    position: relative;
  }
`;

export function resolveTemplateExperience(templateKey = '') {
  return experienceIdFromTemplateKey(templateKey);
}

export function experienceCanvasClass(experience) {
  return getStorefrontExperience(experience).canvasClass;
}

export function experienceVariantLabelClass(experience) {
  return getStorefrontExperience(experience).variantLabelClass || 'text-primary';
}

export function sectionFrameStyle(layout = {}, style = {}, type, experience = 'classic-balanced', index = 0) {
  const cardStyle = layout.cardStyle || 'bordered';
  const variant = layout.variant || 'standard';
  const baseShadow = CARD_STYLE_SHADOW[cardStyle] || CARD_STYLE_SHADOW.bordered;

  const framedVariant = variant !== 'standard' && variant !== 'minimal';
  const frameByVariant = {
    editorial: { maxWidth: '1180px', margin: '1.5rem auto', border: '1px solid rgba(15, 23, 42, 0.08)' },
    split: { maxWidth: '1200px', margin: '1.75rem auto', border: '1px solid rgba(15, 23, 42, 0.08)' },
    'feature-grid': { maxWidth: '1240px', margin: '1.25rem auto' },
    'lead-magnet': { maxWidth: '1080px', margin: '2rem auto', border: '1px solid rgba(15, 23, 42, 0.08)' },
    premium: { maxWidth: '1220px', margin: type === STOREFRONT_BLOCK_TYPES.HERO ? '0 auto 2rem' : '2rem auto', border: '1px solid rgba(201, 162, 39, 0.22)' },
  }[variant] || {};

  const experienceFrame = getStorefrontExperience(experience).frame?.(type, index) || {};

  const chosenShadow = EXPLICIT_SHADOW[style.shadow] ?? (variant === 'minimal' ? 'none' : baseShadow);

  return {
    position: 'relative',
    ...(framedVariant ? frameByVariant : {}),
    ...(framedVariant ? { width: '100%' } : {}),
    ...experienceFrame,
    // Every block owns a full-width canvas band. Layout width only constrains
    // the inner content, matching the hero section and modern page builders.
    width: '100%',
    maxWidth: 'none',
    marginLeft: 0,
    marginRight: 0,
    boxShadow: chosenShadow,
    backdropFilter: cardStyle === 'glass' ? 'blur(16px)' : undefined,
    backgroundImage: variant === 'premium'
      ? 'radial-gradient(circle at top right, rgba(255,255,255,0.9), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.18), transparent)'
      : variant === 'lead-magnet'
        ? 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.16))'
        : undefined,
  };
}

export function sectionInnerClass(layout = {}) {
  const variant = layout.variant || 'standard';
  const mediaPosition = layout.mediaPosition || 'none';
  const widthClass = {
    full: 'max-w-none',
    contained: 'max-w-7xl',
    narrow: 'max-w-5xl',
  }[layout.width || 'full'];
  const variantClass = {
    standard: '',
    editorial: 'storefront-section--editorial',
    split: 'storefront-section--split',
    'feature-grid': 'storefront-section--feature-grid',
    'lead-magnet': 'storefront-section--lead-magnet',
    premium: 'storefront-section--premium',
    minimal: 'storefront-section--minimal',
  }[variant] || '';
  const mediaClass = mediaPosition === 'background' ? 'is-media-background' : mediaPosition === 'left' ? 'is-media-left' : mediaPosition === 'right' ? 'is-media-right' : '';
  return `mx-auto ${widthClass} ${variantClass} ${mediaClass}`.trim();
}
