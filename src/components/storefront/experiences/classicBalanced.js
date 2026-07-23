export const classicBalancedExperience = {
  id: 'classic-balanced',
  canvasClass: 'storefront-experience-classic',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-classic {
      background: #ffffff;
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
