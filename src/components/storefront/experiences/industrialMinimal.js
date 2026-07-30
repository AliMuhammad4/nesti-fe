export const industrialMinimalExperience = {
  id: 'industrial-minimal',
  canvasClass: 'storefront-experience-industrial',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-industrial {
      width: 100%;
      max-width: none;
      background-color: var(--storefront-canvas, #ffffff);
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
