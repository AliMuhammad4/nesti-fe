export const industrialMinimalExperience = {
  id: 'industrial-minimal',
  canvasClass: 'storefront-experience-industrial',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-industrial {
      width: 100%;
      max-width: none;
      background:
        radial-gradient(ellipse at 80% 6%, color-mix(in srgb, var(--storefront-canvas, #f8fafc) 85%, #e2e8f0) 0%, transparent 28rem),
        var(--storefront-canvas, #f8fafc);
    }

    .storefront-experience-industrial [data-storefront-anim-item] {
      animation: storefront-industrial-slide 480ms cubic-bezier(.22,.61,.36,1) both;
    }

    .storefront-experience-industrial [data-storefront-block='hero'] {
      border-bottom: 2px solid color-mix(in srgb, var(--storefront-primary) 22%, transparent);
    }

    .storefront-experience-industrial [data-storefront-block='about'] {
      border-top: 1px solid rgba(30, 41, 59, 0.10);
      border-bottom: 1px solid rgba(30, 41, 59, 0.10);
    }

    .storefront-experience-industrial [data-storefront-block='services'] .storefront-anim-body,
    .storefront-experience-industrial [data-storefront-block='guidance'] .storefront-anim-body,
    .storefront-experience-industrial [data-storefront-block='featured-listings'] .storefront-anim-body {
      max-width: 86rem;
      margin-inline: auto;
    }

    [data-template-key='mortgage_broker-commercial'] .storefront-anim-body,
    [data-template-key='mortgage_broker-commercial'] [data-storefront-block] .storefront-anim-body,
    .storefront-experience-industrial[data-template-key='mortgage_broker-commercial'] [data-storefront-block='services'] .storefront-anim-body,
    .storefront-experience-industrial[data-template-key='mortgage_broker-commercial'] [data-storefront-block='guidance'] .storefront-anim-body,
    .storefront-experience-industrial[data-template-key='mortgage_broker-commercial'] [data-storefront-block='featured-listings'] .storefront-anim-body {
      max-width: none !important;
      width: 100%;
      margin-inline: 0;
    }

    .storefront-experience-industrial [data-storefront-block='services'] {
      background-image: linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 4%, transparent) 0%, transparent 45%);
    }

    .storefront-experience-industrial [data-storefront-block='guidance'] {
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(30, 41, 59, 0.03) 4px, rgba(30, 41, 59, 0.03) 5px);
    }

    .storefront-experience-industrial [data-storefront-block='cta'] {
      border-top: 2px solid color-mix(in srgb, var(--storefront-primary) 18%, transparent);
    }

    .storefront-experience-industrial [data-storefront-block='testimonials'] {
      background-image: linear-gradient(180deg, color-mix(in srgb, var(--storefront-primary) 5%, transparent), transparent 60%);
    }

    @keyframes storefront-industrial-slide {
      from { opacity: 0; transform: translateX(-10px); }
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
