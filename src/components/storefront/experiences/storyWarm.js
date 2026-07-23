export const storyWarmExperience = {
  id: 'story-warm',
  canvasClass: 'storefront-experience-story',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-story {
      background: #ffffff;
    }

    [data-preview='true'] .storefront-experience-story {
      background: linear-gradient(180deg, #fffaf5 0%, #ffffff 36%);
    }
  `,
  frame() {
    return {
      margin: 0,
      border: 'none',
      borderRadius: 0,
      boxShadow: 'none',
    };
  },
};
