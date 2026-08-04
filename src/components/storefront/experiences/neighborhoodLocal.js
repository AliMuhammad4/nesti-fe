export const neighborhoodLocalExperience = {
  id: 'neighborhood-local',
  canvasClass: 'storefront-experience-neighborhood',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-neighborhood {
      width: 100%;
      max-width: none;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--storefront-canvas, #f7fbf6) 94%, #d9f4df) 0%, var(--storefront-canvas, #f7fbf6) 32rem);
    }
    .storefront-experience-neighborhood [data-storefront-anim-item] {
      animation: storefront-neighborhood-rise 540ms ease both;
    }
    .storefront-experience-neighborhood [data-storefront-block='expertise'],
    .storefront-experience-neighborhood [data-storefront-block='role_details'] {
      border-top: 1px solid rgba(22, 101, 52, 0.12);
    }
    .storefront-experience-neighborhood [data-storefront-block='featured_listings'] {
      background-image: linear-gradient(135deg, rgba(22, 101, 52, 0.055), transparent 48%);
    }
    .storefront-experience-neighborhood [data-storefront-block='guidance'] .storefront-anim-body {
      max-width: 80rem;
      margin-inline: auto;
    }
    @keyframes storefront-neighborhood-rise {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
