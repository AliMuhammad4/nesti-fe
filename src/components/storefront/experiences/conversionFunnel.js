export const conversionFunnelExperience = {
  id: 'conversion-funnel',
  canvasClass: 'storefront-experience-funnel',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-funnel {
      width: 100%;
      max-width: none;
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--storefront-canvas, #fff1f2) 90%, #fff7ed) 0%, var(--storefront-canvas, #fff1f2) 42rem);
    }
    .storefront-experience-funnel [data-storefront-anim-item] {
      animation: storefront-funnel-in 420ms ease both;
    }
    .storefront-experience-funnel [data-storefront-block='sold_listings'],
    .storefront-experience-funnel [data-storefront-block='guidance'] {
      border-top: 1px solid rgba(159, 18, 57, 0.14);
    }
    .storefront-experience-funnel [data-storefront-block='guidance'] .storefront-anim-body {
      max-width: 74rem;
      margin-inline: auto;
    }
    @keyframes storefront-funnel-in {
      from { opacity: 0; transform: translateX(-8px); }
      to { opacity: 1; transform: translateX(0); }
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
