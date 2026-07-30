export const classicBalancedExperience = {
  id: 'classic-balanced',
  canvasClass: 'storefront-experience-classic',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-classic {
      width: 100%;
      max-width: none;
      background: var(--storefront-canvas, #ffffff);
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
