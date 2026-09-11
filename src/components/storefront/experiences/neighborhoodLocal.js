export const neighborhoodLocalExperience = {
  id: 'neighborhood-local',
  canvasClass: 'storefront-experience-neighborhood',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-neighborhood {
      width: 100%;
      max-width: none;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--storefront-canvas, #f5f7ff) 94%, #dbeafe) 0%, var(--storefront-canvas, #f5f7ff) 32rem);
    }

    .storefront-experience-neighborhood [data-storefront-anim-item] {
      animation: storefront-neighborhood-rise 540ms ease both;
    }

    .storefront-experience-neighborhood [data-storefront-block='expertise'],
    .storefront-experience-neighborhood [data-storefront-block='role-details'] {
      border-top: 1px solid color-mix(in srgb, var(--storefront-primary) 14%, transparent);
    }

    /* Map-like plotted texture unique to the neighborhood story. */
    .storefront-experience-neighborhood [data-storefront-block='featured-listings'],
    .storefront-experience-neighborhood [data-storefront-block='properties'] {
      background-image:
        linear-gradient(135deg, color-mix(in srgb, var(--storefront-primary) 6%, transparent), transparent 48%),
        radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--storefront-accent) 8%, transparent) 0%, transparent 14rem);
    }

    .storefront-experience-neighborhood [data-storefront-block='guidance'] .storefront-anim-body {
      max-width: 80rem;
      margin-inline: auto;
    }

    .storefront-experience-neighborhood [data-storefront-block='featured-listings'] .storefront-anim-body,
    .storefront-experience-neighborhood [data-storefront-block='seller-sold-results'] .storefront-anim-body {
      max-width: none;
      width: 100%;
      margin-inline: 0;
    }

    .storefront-experience-neighborhood [data-storefront-block='guidance'] {
      background-image: radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--storefront-accent) 10%, transparent), transparent 20rem);
    }

    .storefront-experience-neighborhood [data-storefront-block='cta'] {
      border-top: 1px solid color-mix(in srgb, var(--storefront-primary) 18%, transparent);
    }

    /* Community defaults stay scoped and intentionally avoid !important so
       saved inspector styles remain authoritative in preview and published UI. */
    [data-template-key='agent-community-expert'].storefront-experience-neighborhood {
      --community-hub-ink: var(--storefront-primary, #17152b);
      --community-hub-accent: var(--storefront-accent, #1f6fbf);
      --community-hub-canvas: var(--storefront-canvas, #f5f7fa);
      --community-hub-dark: color-mix(in srgb, var(--community-hub-ink) 72%, #061022);
      --community-hub-border: color-mix(in srgb, var(--community-hub-ink) 16%, #dbe3f5);
      color: var(--community-hub-ink);
      background-color: var(--community-hub-canvas);
      background-image: none;
    }

    [data-template-key='agent-community-expert'] [data-storefront-block='hero'] h1 {
      max-width: min(100%, 52rem);
      font-size: clamp(1.75rem, 2.8vw, 2.75rem);
      line-height: 1.12;
      letter-spacing: -.03em;
      white-space: normal;
      overflow-wrap: break-word;
      word-break: normal;
    }

    [data-template-key='agent-community-expert'] [data-storefront-block='hero'] header {
      border-bottom-color: var(--community-hub-border);
      background: rgba(255,255,255,.96);
      color: var(--community-hub-ink);
      box-shadow: 0 4px 18px rgba(23,21,43,.06);
      backdrop-filter: blur(14px);
    }

    [data-template-key='agent-community-expert'] [data-storefront-block='hero'] header a,
    [data-template-key='agent-community-expert'] [data-storefront-block='hero'] header button,
    [data-template-key='agent-community-expert'] [data-storefront-block='hero'] header span {
      color: inherit;
    }

    [data-template-key='agent-community-expert'] [data-storefront-block] h2 {
      letter-spacing: -.035em;
    }

    [data-template-key='agent-community-expert'] [data-storefront-block='guidance'] {
      background-image: radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--community-hub-accent) 10%, transparent), transparent 21rem);
    }

    [data-template-key='agent-community-expert'] [data-storefront-block='footer'] {
      border-top: 1px solid rgba(255,255,255,.1);
      background: color-mix(in srgb, var(--community-hub-ink) 82%, #061022);
      color: #f4f1ff;
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
