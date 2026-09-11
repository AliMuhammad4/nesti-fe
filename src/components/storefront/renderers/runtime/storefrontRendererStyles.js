export function previewSizeClass({ preview, previewMode }) {
  const isMobilePreview = preview && previewMode === 'mobile';
  const isTabletPreview = preview && previewMode === 'tablet';
  return isMobilePreview
    ? 'storefront-preview-mobile'
    : isTabletPreview
      ? 'storefront-preview-tablet'
      : '';
}

export const RESPONSIVE_POLISH_CSS = `
.storefront-canvas.storefront-preview-mobile {
  font-size: 93%;
}

.storefront-canvas.storefront-preview-tablet {
  font-size: 96%;
}

.storefront-canvas.storefront-preview-mobile [class*="text-4xl"] { font-size: 1.85rem !important; line-height: 1.12 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-3xl"] { font-size: 1.55rem !important; line-height: 1.18 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-2xl"] { font-size: 1.35rem !important; line-height: 1.2 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-xl"] { font-size: 1.18rem !important; line-height: 1.24 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-lg"] { font-size: 1.05rem !important; line-height: 1.3 !important; }
.storefront-canvas.storefront-preview-mobile [class*="text-base"] { font-size: 0.95rem !important; line-height: 1.45 !important; }
.storefront-canvas.storefront-preview-mobile [class~="py-16"] { padding-top: 2.9rem !important; padding-bottom: 2.9rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="py-14"] { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="py-12"] { padding-top: 2.2rem !important; padding-bottom: 2.2rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="py-10"] { padding-top: 1.95rem !important; padding-bottom: 1.95rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="gap-14"] { gap: 1.85rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="gap-12"] { gap: 1.55rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="gap-10"] { gap: 1.25rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="gap-8"] { gap: 1rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="p-6"] { padding: 1.1rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="p-5"] { padding: 0.95rem !important; }
.storefront-canvas.storefront-preview-mobile [class~="p-4"] { padding: 0.85rem !important; }

.storefront-canvas.storefront-preview-tablet [class*="text-4xl"] { font-size: 2.05rem !important; line-height: 1.14 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-3xl"] { font-size: 1.75rem !important; line-height: 1.18 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-2xl"] { font-size: 1.5rem !important; line-height: 1.22 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-xl"] { font-size: 1.28rem !important; line-height: 1.26 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-lg"] { font-size: 1.12rem !important; line-height: 1.32 !important; }
.storefront-canvas.storefront-preview-tablet [class*="text-base"] { font-size: 0.98rem !important; line-height: 1.48 !important; }
.storefront-canvas.storefront-preview-tablet [class~="py-16"] { padding-top: 3.2rem !important; padding-bottom: 3.2rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="py-14"] { padding-top: 2.8rem !important; padding-bottom: 2.8rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="py-12"] { padding-top: 2.45rem !important; padding-bottom: 2.45rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="py-10"] { padding-top: 2.2rem !important; padding-bottom: 2.2rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="gap-14"] { gap: 2.1rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="gap-12"] { gap: 1.8rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="gap-10"] { gap: 1.5rem !important; }
.storefront-canvas.storefront-preview-tablet [class~="gap-8"] { gap: 1.25rem !important; }

.storefront-canvas.storefront-preview-mobile h1,
.storefront-canvas.storefront-preview-mobile h2,
.storefront-canvas.storefront-preview-mobile h3,
.storefront-canvas.storefront-preview-mobile h4,
.storefront-canvas.storefront-preview-tablet h1,
.storefront-canvas.storefront-preview-tablet h2,
.storefront-canvas.storefront-preview-tablet h3,
.storefront-canvas.storefront-preview-tablet h4 {
  text-wrap: balance;
}

.storefront-canvas.storefront-preview-mobile p,
.storefront-canvas.storefront-preview-tablet p {
  line-height: 1.45 !important;
}

.storefront-canvas.storefront-preview-mobile .storefront-btn {
  font-size: 12px !important;
  min-height: 2.45rem;
}

.storefront-canvas.storefront-preview-tablet .storefront-btn {
  font-size: 12.5px !important;
  min-height: 2.6rem;
}

.storefront-canvas.storefront-preview-mobile [data-first-home-grid] {
  grid-template-columns: minmax(0, 1fr) !important;
}

.storefront-canvas.storefront-preview-tablet :where(
  [data-first-home-grid="about-shell"],
  [data-first-home-grid="engagement-shell"],
  [data-first-home-grid="roadmap-shell"],
  [data-first-home-grid="protection-shell"]
) {
  grid-template-columns: minmax(0, 1fr) !important;
}

.storefront-canvas.storefront-preview-tablet :where(
  [data-first-home-grid="about-details"],
  [data-first-home-grid="resources"],
  [data-first-home-grid="engagement-cards"],
  [data-first-home-grid="logistics-cards"],
  [data-first-home-grid="roadmap-steps"],
  [data-first-home-grid="protection-cards"],
  [data-first-home-grid="credentials"]
) {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}

.storefront-canvas.storefront-preview-tablet [data-first-home-grid="hero-proof"] {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
}

.storefront-canvas.storefront-preview-mobile [data-first-home-stack],
.storefront-canvas.storefront-preview-tablet [data-first-home-stack="compact"] {
  flex-direction: column !important;
  align-items: stretch !important;
}

.storefront-canvas.storefront-preview-mobile [data-first-home-hero] {
  min-height: 0 !important;
}

.storefront-canvas.storefront-preview-mobile [data-first-home-hero-content] {
  min-height: 0 !important;
  align-items: flex-start !important;
  padding-top: 5rem !important;
  padding-bottom: 3rem !important;
}

.storefront-canvas.storefront-preview-mobile [data-first-home-hero-proof] {
  position: relative !important;
  inset: auto !important;
}

.storefront-canvas.storefront-preview-mobile [data-first-home-about-media] {
  min-height: 28rem !important;
}

@media (max-width: 767px) {
  .storefront-canvas {
    font-size: 93%;
  }
  .storefront-canvas [class*="text-4xl"] { font-size: 1.85rem !important; line-height: 1.12 !important; }
  .storefront-canvas [class*="text-3xl"] { font-size: 1.55rem !important; line-height: 1.18 !important; }
  .storefront-canvas [class*="text-2xl"] { font-size: 1.35rem !important; line-height: 1.2 !important; }
  .storefront-canvas [class*="text-xl"] { font-size: 1.18rem !important; line-height: 1.24 !important; }
  .storefront-canvas [class*="text-lg"] { font-size: 1.05rem !important; line-height: 1.3 !important; }
  .storefront-canvas [class*="text-base"] { font-size: 0.95rem !important; line-height: 1.45 !important; }
  .storefront-canvas [class~="py-16"] { padding-top: 2.9rem !important; padding-bottom: 2.9rem !important; }
  .storefront-canvas [class~="py-14"] { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
  .storefront-canvas [class~="py-12"] { padding-top: 2.2rem !important; padding-bottom: 2.2rem !important; }
  .storefront-canvas [class~="py-10"] { padding-top: 1.95rem !important; padding-bottom: 1.95rem !important; }
  .storefront-canvas [class~="gap-14"] { gap: 1.85rem !important; }
  .storefront-canvas [class~="gap-12"] { gap: 1.55rem !important; }
  .storefront-canvas [class~="gap-10"] { gap: 1.25rem !important; }
  .storefront-canvas [class~="gap-8"] { gap: 1rem !important; }
  .storefront-canvas [class~="p-6"] { padding: 1.1rem !important; }
  .storefront-canvas [class~="p-5"] { padding: 0.95rem !important; }
  .storefront-canvas [class~="p-4"] { padding: 0.85rem !important; }
  .storefront-canvas h1,
  .storefront-canvas h2,
  .storefront-canvas h3,
  .storefront-canvas h4 {
    text-wrap: balance;
  }
  .storefront-canvas p {
    line-height: 1.45 !important;
  }
  .storefront-canvas .storefront-btn {
    font-size: 12px !important;
    min-height: 2.45rem;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .storefront-canvas {
    font-size: 96%;
  }
  .storefront-canvas [class*="text-4xl"] { font-size: 2.05rem !important; line-height: 1.14 !important; }
  .storefront-canvas [class*="text-3xl"] { font-size: 1.75rem !important; line-height: 1.18 !important; }
  .storefront-canvas [class*="text-2xl"] { font-size: 1.5rem !important; line-height: 1.22 !important; }
  .storefront-canvas [class*="text-xl"] { font-size: 1.28rem !important; line-height: 1.26 !important; }
  .storefront-canvas [class*="text-lg"] { font-size: 1.12rem !important; line-height: 1.32 !important; }
  .storefront-canvas [class*="text-base"] { font-size: 0.98rem !important; line-height: 1.48 !important; }
  .storefront-canvas [class~="py-16"] { padding-top: 3.2rem !important; padding-bottom: 3.2rem !important; }
  .storefront-canvas [class~="py-14"] { padding-top: 2.8rem !important; padding-bottom: 2.8rem !important; }
  .storefront-canvas [class~="py-12"] { padding-top: 2.45rem !important; padding-bottom: 2.45rem !important; }
  .storefront-canvas [class~="py-10"] { padding-top: 2.2rem !important; padding-bottom: 2.2rem !important; }
  .storefront-canvas [class~="gap-14"] { gap: 2.1rem !important; }
  .storefront-canvas [class~="gap-12"] { gap: 1.8rem !important; }
  .storefront-canvas [class~="gap-10"] { gap: 1.5rem !important; }
  .storefront-canvas [class~="gap-8"] { gap: 1.25rem !important; }
  .storefront-canvas h1,
  .storefront-canvas h2,
  .storefront-canvas h3,
  .storefront-canvas h4 {
    text-wrap: balance;
  }
  .storefront-canvas p {
    line-height: 1.48 !important;
  }
  .storefront-canvas .storefront-btn {
    font-size: 12.5px !important;
    min-height: 2.6rem;
  }
}
`;
