export const storyWarmExperience = {
  id: 'story-warm',
  canvasClass: 'storefront-experience-story',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-story {
      width: 100%;
      max-width: none;
      background:
        radial-gradient(circle at 85% 9%, color-mix(in srgb, var(--storefront-canvas, #eff6ff) 78%, #fce7f3) 0%, transparent 25rem),
        var(--storefront-canvas, #eff6ff);
    }
    .storefront-experience-story [data-storefront-anim-item] {
      animation: storefront-story-lift 500ms ease both;
    }
    .storefront-experience-story [data-storefront-block='guidance'] .storefront-anim-body,
    .storefront-experience-story [data-storefront-block='properties'] .storefront-anim-body {
      max-width: 78rem;
      margin-inline: auto;
    }
    .storefront-experience-story [data-storefront-block='guidance'] {
      background-image: radial-gradient(circle at 8% 16%, rgba(251, 113, 133, 0.10), transparent 16rem);
    }
    @keyframes storefront-story-lift {
      from { opacity: 0; transform: translateY(12px) rotate(-0.25deg); }
      to { opacity: 1; transform: translateY(0) rotate(0); }
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
