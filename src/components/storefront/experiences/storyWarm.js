export const storyWarmExperience = {
  id: 'story-warm',
  canvasClass: 'storefront-experience-story',
  variantLabelClass: 'text-primary',
  css: `
    .storefront-experience-story {
      width: 100%;
      max-width: none;
      background:
        radial-gradient(circle at 85% 9%, color-mix(in srgb, var(--storefront-canvas, #eff6ff) 74%, #fce7f3) 0%, transparent 25rem),
        var(--storefront-canvas, #eff6ff);
    }

    .storefront-experience-story [data-storefront-anim-item] {
      animation: storefront-story-lift 500ms ease both;
    }

    .storefront-experience-story [data-storefront-block='guidance'] .storefront-anim-body,
    .storefront-experience-story [data-storefront-block='properties'] .storefront-anim-body,
    .storefront-experience-story [data-storefront-block='services'] .storefront-anim-body {
      max-width: 78rem;
      margin-inline: auto;
    }

    /* Soft, encouraging blooms rather than hard rules — the warm story tone. */
    .storefront-experience-story [data-storefront-block='guidance'] {
      background-image: radial-gradient(circle at 8% 16%, color-mix(in srgb, var(--storefront-accent) 12%, transparent), transparent 16rem);
    }

    .storefront-experience-story [data-storefront-block='services'] {
      background-image: radial-gradient(circle at 92% 80%, color-mix(in srgb, var(--storefront-primary) 8%, transparent), transparent 18rem);
    }

    .storefront-experience-story [data-storefront-block='testimonials'] {
      background-image: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--storefront-accent) 9%, transparent), transparent 22rem);
    }

    .storefront-experience-story [data-storefront-block='cta'] {
      background-image: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--storefront-primary) 10%, transparent), transparent 24rem);
    }

    [data-template-key='lawyer-newcomer'].storefront-experience-story {
      background: transparent;
    }

    [data-template-key='lawyer-newcomer'].storefront-experience-story [data-storefront-block] {
      background-image: none;
    }

    /* GreenVilla-inspired system, isolated to First Home Specialist. */
    [data-template-key='agent-first-home'].storefront-experience-story {
      background: #ffffff;
      color: #111111;
    }

    [data-template-key='agent-first-home'] header {
      border-color: rgba(11,61,32,.08) !important;
      background: rgba(255,255,255,.96) !important;
      color: #0b3d20 !important;
      box-shadow: 0 10px 35px rgba(11,61,32,.06) !important;
      backdrop-filter: blur(14px) saturate(1.1);
    }

    [data-template-key='agent-first-home'] header a,
    [data-template-key='agent-first-home'] header nav,
    [data-template-key='agent-first-home'] header [class*='text-slate'],
    [data-template-key='agent-first-home'] header [class*='text-text'] {
      color: #153b25 !important;
    }

    [data-template-key='agent-first-home'] header a:hover {
      color: var(--storefront-accent) !important;
    }

    [data-template-key='agent-first-home'] header button {
      border-radius: 4px !important;
      border-color: color-mix(in srgb, var(--storefront-accent) 42%, transparent) !important;
      color: #0b3d20 !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='hero'] .storefront-first-home-cover {
      filter: saturate(.88) contrast(1.04) brightness(.78);
      transition: transform 1.4s cubic-bezier(.2,.7,.2,1), filter .6s ease;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='hero']:hover .storefront-first-home-cover {
      filter: saturate(.94) contrast(1.05) brightness(.82);
      transform: scale(1.015);
    }

    [data-template-key='agent-first-home'] .storefront-first-home-hero-eyebrow,
    [data-template-key='agent-first-home'] .storefront-first-home-hero-eyebrow *,
    [data-template-key='agent-first-home'] .storefront-first-home-hero-copy > [data-storefront-field='content.eyebrow'],
    [data-template-key='agent-first-home'] .storefront-first-home-hero-copy > [data-storefront-field='content.eyebrow'] * {
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      fill: currentColor !important;
      stroke: currentColor !important;
    }

    [data-template-key='agent-first-home'] .storefront-first-home-hero-copy {
      text-align: center !important;
      align-items: center !important;
      margin-inline: auto !important;
      position: relative;
      z-index: 1;
    }

    [data-template-key='agent-first-home'] .storefront-first-home-hero-copy h1,
    [data-template-key='agent-first-home'] .storefront-first-home-hero-copy [data-storefront-field='content.heading'] {
      max-width: none !important;
      white-space: nowrap !important;
      text-wrap: nowrap !important;
    }

    [data-template-key='agent-first-home'] .storefront-first-home-hero-plate {
      position: relative;
      isolation: isolate;
      width: 100%;
      max-width: 58rem;
      margin-inline: auto;
      padding: 1.25rem 0.5rem 1.5rem;
      animation: storefront-first-home-hero-rise 720ms cubic-bezier(.2,.7,.2,1) both;
    }

    [data-template-key='agent-first-home'] .storefront-first-home-hero-plate::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 48%;
      width: min(100%, 46rem);
      height: min(100%, 28rem);
      transform: translate(-50%, -50%);
      pointer-events: none;
      border-radius: 999px;
      background: radial-gradient(ellipse at center, rgba(4, 25, 13, 0.42) 0%, rgba(4, 25, 13, 0.18) 48%, transparent 72%);
      filter: blur(2px);
      z-index: 0;
    }

    @keyframes storefront-first-home-hero-rise {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }

    [data-template-key='agent-first-home'] .storefront-first-home-hero-eyebrow {
      background: rgba(255, 255, 255, 0.14) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2) !important;
      backdrop-filter: blur(14px) saturate(1.15);
      padding: 0.45rem 1rem !important;
      border-radius: 999px !important;
      letter-spacing: 0.2em !important;
      font-size: 10px !important;
      font-weight: 700 !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='hero'] button {
      border-radius: 999px !important;
      transition: transform .28s ease, box-shadow .28s ease, background-color .28s ease, border-color .28s ease !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block]:not([data-storefront-block='hero']) p[class*='uppercase'] {
      color: var(--storefront-accent) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block] section,
    [data-template-key='agent-first-home'] [data-storefront-block] article,
    [data-template-key='agent-first-home'] [data-storefront-block]:not([data-storefront-block='hero']) button {
      border-radius: 4px;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='guidance'],
    [data-template-key='agent-first-home'] [data-storefront-block='services'],
    [data-template-key='agent-first-home'] [data-storefront-block='testimonials'],
    [data-template-key='agent-first-home'] [data-storefront-block='about'],
    [data-template-key='agent-first-home'] [data-storefront-block='cta'] {
      position: relative;
      overflow: hidden;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='guidance'] .text-text-heading,
    [data-template-key='agent-first-home'] [data-storefront-block='guidance'] button span,
    [data-template-key='agent-first-home'] [data-storefront-block='services'] .text-text-heading,
    [data-template-key='agent-first-home'] [data-storefront-block='services'] h2,
    [data-template-key='agent-first-home'] [data-storefront-block='services'] [data-storefront-anim-item] p,
    [data-template-key='agent-first-home'] [data-storefront-block='testimonials'] h2,
    [data-template-key='agent-first-home'] [data-storefront-block='testimonials'] h3,
    [data-template-key='agent-first-home'] [data-storefront-block='cta'] h2,
    [data-template-key='agent-first-home'] [data-storefront-block='cta'] h3 {
      color: #102f1b !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='guidance'] .text-text-muted,
    [data-template-key='agent-first-home'] [data-storefront-block='services'] .text-text-muted,
    [data-template-key='agent-first-home'] [data-storefront-block='testimonials'] .text-text-muted,
    [data-template-key='agent-first-home'] [data-storefront-block='cta'] p:not([class*='uppercase']) {
      color: rgba(16,47,27,.62) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='services'] [data-storefront-anim-item] {
      margin: 0 !important;
      color: #102f1b;
      text-align: left !important;
      transition: transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s ease !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='services'] [data-storefront-anim-item]:hover {
      transform: translateY(-5px);
      box-shadow: 0 22px 52px rgba(11,61,32,.14) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='services'] [data-storefront-anim-item] > span {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50% !important;
      background: color-mix(in srgb, var(--storefront-accent) 18%, white) !important;
      color: #0b3d20 !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='featured-listings'] .storefront-listings-grid > button {
      border-radius: 3px !important;
      border-color: rgba(11,61,32,.1) !important;
      box-shadow: 0 12px 36px rgba(11,61,32,.08) !important;
      transition: transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s ease;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='featured-listings'] .storefront-listings-grid > button:hover {
      transform: translateY(-5px);
      box-shadow: 0 24px 54px rgba(11,61,32,.16) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='featured-listings'] img {
      filter: saturate(.9) contrast(1.02);
    }

    [data-template-key='agent-first-home'] [data-storefront-block='testimonials'] section > div,
    [data-template-key='agent-first-home'] [data-storefront-block='cta'] section > div,
    [data-template-key='agent-first-home'] [data-storefront-block='about'] section > div {
      background: transparent !important;
      box-shadow: none !important;
      --tw-ring-color: transparent !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='testimonials'] article {
      background: #ffffff !important;
      box-shadow: 0 14px 40px rgba(11,61,32,.08) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='testimonials'] article::before {
      display: none;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='testimonials'] article p {
      color: rgba(16,47,27,.72) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='about'] h2 {
      font-size: clamp(1.9rem, 3.9vw, 2.75rem);
      font-weight: 600;
      letter-spacing: -.03em;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='cta'] .storefront-first-home-cta-button {
      background: #0b3d20 !important;
      color: #ffffff !important;
      padding-inline: 1.75rem;
      font-size: .72rem;
      font-weight: 700;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='footer'] footer {
      background: #082b17 !important;
      color: rgba(255,255,255,.78) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='footer'] footer h3,
    [data-template-key='agent-first-home'] [data-storefront-block='footer'] footer a,
    [data-template-key='agent-first-home'] [data-storefront-block='footer'] footer p,
    [data-template-key='agent-first-home'] [data-storefront-block='footer'] footer span {
      color: rgba(255,255,255,.78) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-block='footer'] footer a:hover {
      color: var(--storefront-accent) !important;
    }

    [data-template-key='agent-first-home'] [data-storefront-anim-item] {
      animation: storefront-first-home-reveal 650ms cubic-bezier(.2,.7,.2,1) both;
    }

    @keyframes storefront-first-home-reveal {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 767px) {
      [data-template-key='agent-first-home'] [data-storefront-block='services'] section > div > div:last-child {
        grid-template-columns: 1fr;
      }

      [data-template-key='agent-first-home'] .storefront-first-home-hero-plate {
        padding-block: 0.5rem;
      }

      [data-template-key='agent-first-home'] .storefront-first-home-hero-copy {
        padding-block: 2.25rem !important;
        padding-inline: 1.1rem !important;
      }
    }

    [data-template-key='agent-first-home'].storefront-preview-mobile .storefront-first-home-hero,
    [data-template-key='agent-first-home'].storefront-preview-mobile .storefront-first-home-hero > div:first-child > div {
      min-height: 32rem !important;
    }

    [data-template-key='agent-first-home'].storefront-preview-tablet .storefront-first-home-hero,
    [data-template-key='agent-first-home'].storefront-preview-tablet .storefront-first-home-hero > div:first-child > div {
      min-height: 38rem !important;
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
