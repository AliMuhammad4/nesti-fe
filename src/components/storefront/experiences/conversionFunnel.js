export const conversionFunnelExperience = {
  id: 'conversion-funnel',
  canvasClass: 'storefront-experience-funnel',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-funnel {
      background: #ffffff;
    }

    [data-preview='true'] .storefront-experience-funnel {
      background: linear-gradient(180deg, #f8fffd 0%, #ffffff 36%);
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
