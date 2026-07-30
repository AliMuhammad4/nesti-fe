export const luxuryEditorialExperience = {
  id: 'luxury-editorial',
  canvasClass: 'storefront-experience-luxury',
  variantLabelClass: 'text-amber-700',
  css: `
    .storefront-experience-luxury {
      width: 100%;
      max-width: none;
      background: var(--storefront-canvas, #ffffff);
    }

    .storefront-experience-luxury [data-storefront-block='hero'] {
      border-bottom: 1px solid rgba(201, 162, 39, 0.18);
    }
  `,
  frame() {
    return {
      margin: 0,
      border: 'none',
      boxShadow: 'none',
    };
  },
};
