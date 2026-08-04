export const classicBalancedExperience = {
  id: 'classic-balanced',
  canvasClass: 'storefront-experience-classic',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-classic {
      width: 100%;
      max-width: none;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--storefront-canvas, #ffffff) 96%, #e6f7f2) 0%, var(--storefront-canvas, #ffffff) 28rem);
    }
    .storefront-experience-classic [data-storefront-anim-item] {
      animation: storefront-classic-enter 460ms ease both;
    }
    .storefront-experience-classic [data-storefront-block='expertise'],
    .storefront-experience-classic [data-storefront-block='role_details'] {
      border-top: 1px solid rgba(15, 118, 110, 0.12);
      border-bottom: 1px solid rgba(15, 118, 110, 0.12);
    }
    .storefront-experience-classic [data-storefront-block='featured_listings'] .storefront-anim-body,
    .storefront-experience-classic [data-storefront-block='properties'] .storefront-anim-body {
      max-width: 92rem;
      margin-inline: auto;
    }
    @keyframes storefront-classic-enter {
      from { opacity: 0; transform: translateY(8px); }
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
