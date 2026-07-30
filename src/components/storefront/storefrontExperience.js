import {
  allExperienceCss,
  experienceIdFromTemplateKey,
  getStorefrontExperience,
} from './experiences';

const EXPLICIT_SHADOW = {
  none: 'none',
  small: '0 10px 26px rgba(15, 23, 42, 0.09)',
  medium: '0 18px 46px rgba(15, 23, 42, 0.12)',
  large: '0 30px 80px rgba(15, 23, 42, 0.16)',
};

export const STOREFRONT_EXPERIENCE_CSS = `
  ${allExperienceCss()}

  .storefront-canvas {
    width: 100%;
    max-width: none;
    background: var(--storefront-canvas, #ffffff);
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .storefront-public-band {
    width: 100%;
    max-width: none;
    overflow: visible;
  }

  .storefront-canvas > .storefront-public-band[data-storefront-block='footer'] {
    margin-top: auto;
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
    grid-template-columns: repeat(var(--storefront-section-columns, 4), minmax(0, 1fr)) !important;
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

  /* Builder device preview: frame is scaled, so viewport media queries do not apply. */
  .storefront-canvas.storefront-preview-tablet .storefront-listings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .storefront-canvas.storefront-preview-mobile .storefront-listings-grid {
    grid-template-columns: minmax(0, 1fr) !important;
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
  const variant = layout.variant || 'standard';
  const experienceFrame = getStorefrontExperience(experience).frame?.(type, index) || {};
  const chosenShadow = EXPLICIT_SHADOW[style.shadow] ?? (variant === 'minimal' ? 'none' : undefined);

  return {
    position: 'relative',
    ...experienceFrame,
    // Full-bleed section band. Content width is controlled by sectionInnerClass.
    width: '100%',
    maxWidth: 'none',
    margin: 0,
    border: 'none',
    borderRadius: 0,
    boxShadow: chosenShadow === 'none' ? 'none' : undefined,
    backdropFilter: undefined,
    backgroundImage: undefined,
  };
}

export function sectionInnerClass(layout = {}) {
  const variant = layout.variant || 'standard';
  const mediaPosition = layout.mediaPosition || 'none';
  const widthClass = {
    full: 'w-full max-w-none',
    contained: 'w-full max-w-7xl',
    narrow: 'w-full max-w-5xl',
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
  return `mx-auto ${widthClass} px-0 ${variantClass} ${mediaClass}`.trim();
}
