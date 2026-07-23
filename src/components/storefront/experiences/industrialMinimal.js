export const industrialMinimalExperience = {
  id: 'industrial-minimal',
  canvasClass: 'storefront-experience-industrial',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-industrial {
      background-color: #ffffff;
    }

    /* Keep builder preview subtle; public pages use the col-12 shell. */
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
