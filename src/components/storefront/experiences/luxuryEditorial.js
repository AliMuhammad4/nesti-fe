export const luxuryEditorialExperience = {
  id: 'luxury-editorial',
  canvasClass: 'storefront-experience-luxury',
  variantLabelClass: 'text-amber-700',
  css: `
    .storefront-experience-luxury {
      width: 100%;
      max-width: none;
      background:
        radial-gradient(circle at 84% 12%, color-mix(in srgb, var(--storefront-accent) 7%, transparent), transparent 27rem),
        linear-gradient(180deg, #0d0c0b 0%, #171513 52%, #0d0c0b 100%);
    }

    [data-template-key='agent-luxury-advisor'].storefront-experience-luxury {
      color: #f5f1e8;
      --luxury-ink: #0d0c0b;
      --luxury-surface: #171513;
      --luxury-ivory: #f5f1e8;
      --luxury-muted: rgba(245, 241, 232, 0.64);
      --luxury-rule: color-mix(in srgb, var(--storefront-accent) 42%, transparent);
    }

    [data-template-key='agent-luxury-advisor'] [data-storefront-block] {
      position: relative;
    }

    [data-template-key='agent-luxury-advisor'] [data-storefront-block]:not([data-storefront-block='hero']):not([data-storefront-block='footer']):not([data-storefront-block='testimonials'])::before {
      content: '';
      position: absolute;
      inset: 0 max(1rem, 4vw) auto;
      height: 1px;
      background: linear-gradient(90deg, var(--luxury-rule), transparent 72%);
      pointer-events: none;
    }

    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] {
      border-bottom: 1px solid var(--luxury-rule);
      --luxury-chrome: #f5f1e8;
    }

    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] header {
      border-color: rgba(255,255,255,.13);
      background: rgba(13,12,11,.55);
      color: var(--luxury-ivory);
      box-shadow: none;
      backdrop-filter: blur(14px);
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] header a,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] header nav,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] header span {
      color: inherit;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] header > div > a > span:first-child {
      border-color: rgba(255,255,255,.18);
      border-radius: 0;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] header > div > a > span:last-child > span:first-child {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: .06em;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] header button {
      border-color: rgba(255,255,255,.28);
      border-radius: .65rem;
      color: var(--luxury-ivory);
      background: rgba(255,255,255,.06);
    }

    /* Desktop split geometry lives in AgentExperienceHeroSections
       (LUXURY_HERO_LAYOUT_CSS). Keep motion/filters here only. */
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-image {
      transform-origin: 50% 30%;
      animation: storefront-luxury-hero-kenburns 18s ease-out both;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-image img {
      filter: grayscale(0.35) contrast(1.03) brightness(1.02);
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-scan {
      background: linear-gradient(90deg, transparent, rgba(228,215,195,.55), transparent);
      animation: storefront-luxury-hero-scan 2.4s cubic-bezier(.2,.65,.25,1) .15s both;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-label {
      animation: storefront-luxury-hero-rise 720ms cubic-bezier(.16,1,.3,1) both;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-rule {
      animation: storefront-luxury-hero-rule 720ms cubic-bezier(.16,1,.3,1) .1s both;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-title {
      animation: storefront-luxury-hero-rise 820ms cubic-bezier(.16,1,.3,1) .16s both;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-body {
      animation: storefront-luxury-hero-rise 820ms cubic-bezier(.16,1,.3,1) .28s both;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-actions {
      animation: storefront-luxury-hero-rise 820ms cubic-bezier(.16,1,.3,1) .4s both;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-meta {
      animation: storefront-luxury-hero-rise 820ms cubic-bezier(.16,1,.3,1) .52s both;
    }
    @keyframes storefront-luxury-hero-kenburns {
      from { transform: scale(1.04); }
      to { transform: scale(1); }
    }
    @keyframes storefront-luxury-hero-scan {
      from { transform: translateY(0); opacity: 0; }
      20% { opacity: .9; }
      to { transform: translateY(55vh); opacity: 0; }
    }
    @keyframes storefront-luxury-hero-rise {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes storefront-luxury-hero-rule {
      from { opacity: 0; transform: scaleX(0); }
      to { opacity: 1; transform: scaleX(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-image,
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-scan,
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-label,
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-rule,
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-title,
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-body,
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-actions,
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-meta {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='hero'] .storefront-luxury-hero-image img {
        filter: grayscale(0.45) contrast(1.04) brightness(1);
      }
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='featured-listings'] img {
      filter: grayscale(0.28) contrast(1.04) saturate(0.9);
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='featured-listings'] button[style*='255, 253, 248'],
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='featured-listings'] button[style*='fffdf8'] {
      background-color: #141210 !important;
      border-color: rgba(255,255,255,.1) !important;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='featured-listings'] .storefront-listings-grid > button {
      border-radius: 1.75rem;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='testimonials'] {
      background: transparent;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='about'] aside img {
      filter: grayscale(.82) contrast(1.04);
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='services'] {
      color: var(--luxury-ivory);
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='services'] .storefront-anim-body {
      overflow: visible;
    }

    /* Borderless luxury pass: remove heavy outlines from section shells/cards. */
    [data-template-key='agent-luxury-advisor'] [data-storefront-block]:not([data-storefront-block='hero']):not([data-storefront-block='footer'])::before {
      display: none !important;
    }
    [data-template-key='agent-luxury-advisor'] section#about .border,
    [data-template-key='agent-luxury-advisor'] section#services .border,
    [data-template-key='agent-luxury-advisor'] section#properties .border,
    [data-template-key='agent-luxury-advisor'] section#testimonials .border,
    [data-template-key='agent-luxury-advisor'] section#guidance .border,
    [data-template-key='agent-luxury-advisor'] section#contact .border,
    [data-template-key='agent-luxury-advisor'] section#about [class*='border-'],
    [data-template-key='agent-luxury-advisor'] section#services [class*='border-'],
    [data-template-key='agent-luxury-advisor'] section#properties [class*='border-'],
    [data-template-key='agent-luxury-advisor'] section#testimonials [class*='border-'],
    [data-template-key='agent-luxury-advisor'] section#guidance [class*='border-'],
    [data-template-key='agent-luxury-advisor'] section#contact [class*='border-'] {
      border-color: transparent !important;
    }

    [data-template-key='agent-luxury-advisor'] [data-storefront-block='guidance'] h2,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='guidance'] h3,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='guidance'] p,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='guidance'] button,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='guidance'] button span {
      color: inherit;
    }

    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] footer {
      border-color: var(--luxury-rule);
      background: #0a0908;
      color: var(--luxury-ivory);
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] footer h3,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] footer a,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] footer p,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] footer span,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] footer div,
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] footer button {
      border-color: rgba(255,255,255,.12);
      color: inherit;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] footer img {
      border-radius: 0;
      filter: grayscale(1);
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='footer'] [data-storefront-anim-item] {
      animation-name: storefront-luxury-reveal;
      animation-duration: 700ms;
    }

    .storefront-experience-luxury [data-storefront-anim-item] {
      animation: storefront-luxury-reveal 720ms cubic-bezier(.2,.65,.25,1) both;
      animation-delay: var(--storefront-child-stagger, 0ms);
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='services'] [data-storefront-anim-item] {
      animation-name: storefront-luxury-card-rise;
      animation-duration: 780ms;
    }
    [data-template-key='agent-luxury-advisor'] [data-storefront-block='services'] [data-storefront-anim-item]:hover {
      box-shadow: 0 22px 48px rgba(0,0,0,.32);
    }
    @keyframes storefront-luxury-reveal {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes storefront-luxury-card-rise {
      from { opacity: 0; transform: translateY(28px) scale(.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .storefront-experience-luxury [data-storefront-anim-item],
      [data-template-key='agent-luxury-advisor'] [data-storefront-block='services'] [data-storefront-anim-item] {
        animation: none !important;
      }
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
