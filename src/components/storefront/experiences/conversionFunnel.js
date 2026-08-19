export const conversionFunnelExperience = {
  id: 'conversion-funnel',
  canvasClass: 'storefront-experience-funnel',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-funnel {
      width: 100%;
      max-width: none;
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--storefront-canvas, #fff1f2) 88%, #fff7ed) 0%, var(--storefront-canvas, #fff1f2) 42rem);
    }

    .storefront-experience-funnel [data-storefront-anim-item] {
      animation: storefront-funnel-in 420ms ease both;
    }

    /* Funnel rhythm: each step down the page gets a firmer top rule. */
    .storefront-experience-funnel [data-storefront-block='sold-listings'],
    .storefront-experience-funnel [data-storefront-block='seller-sold-results'],
    .storefront-experience-funnel [data-storefront-block='guidance'],
    .storefront-experience-funnel [data-storefront-block='services'] {
      border-top: 1px solid color-mix(in srgb, var(--storefront-primary) 16%, transparent);
    }

    .storefront-experience-funnel [data-storefront-block='guidance'] .storefront-anim-body,
    .storefront-experience-funnel [data-storefront-block='services'] .storefront-anim-body {
      max-width: 74rem;
      margin-inline: auto;
    }

    /* Seller Expert: modern clean SaaS-like treatment (scoped only here). */
    [data-template-key='agent-seller-expert'].storefront-experience-funnel {
      background: var(--storefront-canvas, #f8fafc);
      color: #0f172a;
    }

    [data-template-key='agent-seller-expert'].storefront-experience-funnel
    [data-storefront-block='guidance'] .storefront-anim-body,
    [data-template-key='agent-seller-expert'].storefront-experience-funnel
    [data-storefront-block='services'] .storefront-anim-body {
      max-width: none;
      margin-inline: 0;
    }

    [data-template-key='agent-seller-expert'].storefront-experience-funnel
    [data-storefront-block='about'] .storefront-anim-body {
      width: 100%;
      max-width: none !important;
      margin-inline: 0;
    }

    [data-template-key='agent-seller-expert'].storefront-experience-funnel [data-storefront-block='sold-listings'],
    [data-template-key='agent-seller-expert'].storefront-experience-funnel [data-storefront-block='seller-sold-results'],
    [data-template-key='agent-seller-expert'].storefront-experience-funnel [data-storefront-block='guidance'],
    [data-template-key='agent-seller-expert'].storefront-experience-funnel [data-storefront-block='services'],
    [data-template-key='agent-seller-expert'].storefront-experience-funnel [data-storefront-block='cta'] {
      border-top-color: color-mix(in srgb, var(--storefront-primary) 14%, transparent);
    }

    .storefront-experience-funnel [data-storefront-block='sold-listings'],
    .storefront-experience-funnel [data-storefront-block='seller-sold-results'] {
      background-image: linear-gradient(180deg, color-mix(in srgb, var(--storefront-accent) 8%, transparent), transparent 55%);
    }

    .storefront-experience-funnel [data-storefront-block='testimonials'] {
      background-image: linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 6%, transparent) 0%, transparent 50%);
    }

    /* Terminal CTA gets the strongest emphasis in the funnel. */
    .storefront-experience-funnel [data-storefront-block='cta'] {
      border-top: 2px solid color-mix(in srgb, var(--storefront-primary) 26%, transparent);
      background-image: linear-gradient(180deg, color-mix(in srgb, var(--storefront-accent) 10%, transparent), transparent 70%);
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
