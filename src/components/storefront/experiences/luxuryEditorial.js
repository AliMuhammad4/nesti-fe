export const luxuryEditorialExperience = {
  id: 'luxury-editorial',
  canvasClass: 'storefront-experience-luxury',
  variantLabelClass: 'text-amber-700',
  css: `
    .storefront-experience-luxury {
      width: 100%;
      max-width: none;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--storefront-canvas, #faf7ef) 92%, #f6edcf) 0%, var(--storefront-canvas, #faf7ef) 36rem);
    }

    .storefront-experience-luxury [data-storefront-block='hero'] {
      border-bottom: 1px solid rgba(201, 162, 39, 0.18);
    }
    .storefront-experience-luxury [data-storefront-block='guidance'],
    .storefront-experience-luxury [data-storefront-block='featured_listings'] {
      position: relative;
    }
    .storefront-experience-luxury [data-storefront-block='guidance']::before,
    .storefront-experience-luxury [data-storefront-block='featured_listings']::before {
      content: '';
      position: absolute;
      inset: 1.5rem 3rem auto;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.65), transparent);
      pointer-events: none;
    }
    .storefront-experience-luxury [data-storefront-block='guidance'] .storefront-anim-body,
    .storefront-experience-luxury [data-storefront-block='featured_listings'] .storefront-anim-body {
      padding-top: 4rem;
    }
    .storefront-experience-luxury [data-storefront-anim-item] {
      animation: storefront-luxury-reveal 620ms cubic-bezier(.2,.65,.25,1) both;
    }
    @keyframes storefront-luxury-reveal {
      from { opacity: 0; transform: translateY(14px); }
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
