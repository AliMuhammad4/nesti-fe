export const storyWarmExperience = {
  id: 'story-warm',
  canvasClass: 'storefront-experience-story',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-story {
      width: 100%;
      max-width: none;
      background: var(--storefront-canvas, #ffffff);
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
