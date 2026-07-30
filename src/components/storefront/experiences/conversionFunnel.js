export const conversionFunnelExperience = {
  id: 'conversion-funnel',
  canvasClass: 'storefront-experience-funnel',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-funnel {
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
