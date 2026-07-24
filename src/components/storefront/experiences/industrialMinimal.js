export const industrialMinimalExperience = {
  id: 'industrial-minimal',
  canvasClass: 'storefront-experience-industrial',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-industrial {
      background-color: #ffffff;
    }

    /* Keep the builder preview subtle while the public page stays full-width. */
    [data-preview='true'] .storefront-experience-industrial {
      background-color: #f8fafc;
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
