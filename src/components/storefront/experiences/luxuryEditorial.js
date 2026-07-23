export const luxuryEditorialExperience = {
  id: 'luxury-editorial',
  canvasClass: 'storefront-experience-luxury',
  variantLabelClass: 'text-amber-700',
  css: `
    .storefront-experience-luxury {
      background: #ffffff;
    }

    .storefront-experience-luxury [data-storefront-block='hero'] {
      border-bottom: 1px solid rgba(201, 162, 39, 0.18);
    }

    [data-preview='true'] .storefront-experience-luxury {
      background: linear-gradient(180deg, #faf8f2 0%, #ffffff 40%);
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
