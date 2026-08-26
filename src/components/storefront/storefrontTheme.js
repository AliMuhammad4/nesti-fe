import { createElement } from 'react';

const DEFAULT_THEME = {
  primary: '#34C759',
  accent: '#f59e0b',
  primaryContrast: '#FFFFFF',
  accentContrast: '#111827',
  canvasContrast: '#111827',
  canvas: '#F8FAFC',
  surface: '#FFFFFF',
  heading: '#1E293B',
  body: '#475569',
  muted: '#64748B',
  border: '#E2E8F0',
  radius: '1rem',
  fontFamily: 'Manrope',
};

export const STOREFRONT_THEME_PRESETS = {
  evergreen: DEFAULT_THEME,
  slate: {
    ...DEFAULT_THEME,
    primary: '#0F766E',
    accent: '#f59e0b',
    canvas: '#F8FAFC',
    heading: '#0F172A',
  },
  navy: {
    ...DEFAULT_THEME,
    primary: '#1D4ED8',
    accent: '#22c55e',
    canvas: '#F7F9FF',
    heading: '#172554',
  },
};

const COLOR_KEYS = new Set([
  'primary',
  'accent',
  'primaryContrast',
  'accentContrast',
  'canvasContrast',
  'canvas',
  'surface',
  'heading',
  'body',
  'muted',
  'border',
]);

const isSafeColor = (value) =>
  typeof value === 'string' &&
  /^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s,.%]+\)|hsla?\([\d\s,.%]+\))$/.test(value.trim());

const isSafeRadius = (value) =>
  typeof value === 'string' && /^\d+(\.\d+)?(px|rem|em|%)$/.test(value.trim());

function contrastForHex(value, fallback = '#FFFFFF') {
  const match = String(value || '').trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) return fallback;
  const hex = match[1].length === 3
    ? match[1].split('').map((part) => `${part}${part}`).join('')
    : match[1];
  const channels = [0, 2, 4].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
  return luminance > 0.42 ? '#111827' : '#FFFFFF';
}

/**
 * Resolves an optional profile theme without requiring a new API field.
 * Existing PublicProfile payloads receive the evergreen preset unchanged.
 */
export function resolveStorefrontTheme(theme = {}) {
  const preset =
    STOREFRONT_THEME_PRESETS[theme?.preset] || STOREFRONT_THEME_PRESETS.evergreen;

  const resolved = Object.entries(theme || {}).reduce((current, [key, value]) => {
    if (COLOR_KEYS.has(key) && isSafeColor(value)) {
      current[key] = value.trim();
    }

    if (key === 'radius' && isSafeRadius(value)) {
      current.radius = value.trim();
    }

    if (key === 'fontFamily' && typeof value === 'string' && value.trim().length <= 80) {
      current.fontFamily = value.trim();
    }

    return current;
  }, { ...preset });
  if (!theme?.primaryContrast) {
    resolved.primaryContrast = contrastForHex(resolved.primary, resolved.primaryContrast);
  }
  if (!theme?.accentContrast) {
    resolved.accentContrast = contrastForHex(resolved.accent, resolved.accentContrast);
  }
  if (!theme?.canvasContrast) {
    resolved.canvasContrast = contrastForHex(resolved.canvas, resolved.canvasContrast);
  }
  if (theme?.canvas && !theme?.heading) {
    const darkCanvas = resolved.canvasContrast === '#FFFFFF';
    resolved.heading = darkCanvas ? '#FFFFFF' : '#111827';
    resolved.body = darkCanvas ? '#E5E7EB' : '#475569';
    resolved.muted = darkCanvas ? '#CBD5E1' : '#64748B';
    resolved.border = darkCanvas ? '#475569' : '#E2E8F0';
  }
  return resolved;
}

export function storefrontThemeVariables(theme) {
  const resolved = resolveStorefrontTheme(theme);

  return {
    '--storefront-primary': resolved.primary,
    '--storefront-accent': resolved.accent,
    '--storefront-primary-contrast': resolved.primaryContrast,
    '--storefront-accent-contrast': resolved.accentContrast,
    '--storefront-canvas-contrast': resolved.canvasContrast,
    '--storefront-canvas': resolved.canvas,
    '--storefront-surface': resolved.surface,
    '--storefront-heading': resolved.heading,
    '--storefront-body': resolved.body,
    '--storefront-muted': resolved.muted,
    '--storefront-border': resolved.border,
    '--storefront-radius': resolved.radius,
    '--storefront-font': resolved.fontFamily === 'Playfair Display'
      ? '"Playfair Display", Georgia, "Times New Roman", serif'
      : resolved.fontFamily === 'Cormorant Garamond'
        ? 'var(--font-first-home-heading, "Cormorant Garamond"), "Palatino Linotype", Palatino, Georgia, serif'
        : resolved.fontFamily === 'Source Sans 3'
          ? 'var(--font-first-home-body, "Source Sans 3"), Inter, ui-sans-serif, system-ui, sans-serif'
      : resolved.fontFamily === 'DM Sans'
        ? '"DM Sans", Inter, ui-sans-serif, system-ui, sans-serif'
        : resolved.fontFamily === 'Inter'
          ? 'Inter, ui-sans-serif, system-ui, sans-serif'
          : 'Manrope, Inter, ui-sans-serif, system-ui, sans-serif',
  };
}

/**
 * Tailwind cannot resolve `primary`/`accent` opacity utilities at build time
 * because those colours are runtime theme values. Generating the full opacity
 * ladder here means a new `border-accent/25` in a template can never silently
 * render colourless.
 */
const OPACITY_STEPS = [4, 5, 8, 10, 15, 20, 25, 30, 35, 40, 50, 60, 65, 70, 80, 90];

function colorUtilityCss(name, color) {
  const mix = (step) => `color-mix(in srgb, ${color} ${step}%, transparent)`;
  const rules = [
    `.nesti-storefront .text-${name} { color: ${color} !important; }`,
    `.nesti-storefront .bg-${name} { background-color: ${color} !important; }`,
    `.nesti-storefront .border-${name} { border-color: ${color} !important; }`,
    `.nesti-storefront .ring-${name} { --tw-ring-color: ${color} !important; }`,
    `.nesti-storefront .divide-${name} > :not([hidden]) ~ :not([hidden]) { border-color: ${color} !important; }`,
    `.nesti-storefront .from-${name} { --tw-gradient-from: ${color} var(--tw-gradient-from-position) !important; }`,
    `.nesti-storefront .via-${name} { --tw-gradient-to: rgba(0,0,0,0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), ${color} var(--tw-gradient-via-position), var(--tw-gradient-to) !important; }`,
    `.nesti-storefront .to-${name} { --tw-gradient-to: ${color} var(--tw-gradient-to-position) !important; }`,
    `.nesti-storefront .hover\\:text-${name}:hover { color: ${color} !important; }`,
    `.nesti-storefront .hover\\:bg-${name}:hover { background-color: ${color} !important; }`,
    `.nesti-storefront .hover\\:border-${name}:hover { border-color: ${color} !important; }`,
  ];

  OPACITY_STEPS.forEach((step) => {
    rules.push(
      `.nesti-storefront .text-${name}\\/${step} { color: ${mix(step)} !important; }`,
      `.nesti-storefront .bg-${name}\\/${step} { background-color: ${mix(step)} !important; }`,
      `.nesti-storefront .border-${name}\\/${step} { border-color: ${mix(step)} !important; }`,
      `.nesti-storefront .ring-${name}\\/${step} { --tw-ring-color: ${mix(step)} !important; }`,
      `.nesti-storefront .divide-${name}\\/${step} > :not([hidden]) ~ :not([hidden]) { border-color: ${mix(step)} !important; }`,
      `.nesti-storefront .from-${name}\\/${step} { --tw-gradient-from: ${mix(step)} var(--tw-gradient-from-position) !important; }`,
      `.nesti-storefront .via-${name}\\/${step} { --tw-gradient-to: rgba(0,0,0,0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), ${mix(step)} var(--tw-gradient-via-position), var(--tw-gradient-to) !important; }`,
      `.nesti-storefront .to-${name}\\/${step} { --tw-gradient-to: ${mix(step)} var(--tw-gradient-to-position) !important; }`,
      `.nesti-storefront .hover\\:text-${name}\\/${step}:hover { color: ${mix(step)} !important; }`,
      `.nesti-storefront .hover\\:bg-${name}\\/${step}:hover { background-color: ${mix(step)} !important; }`,
      `.nesti-storefront .hover\\:border-${name}\\/${step}:hover { border-color: ${mix(step)} !important; }`,
    );
  });

  return rules.join('\n    ');
}

export function StorefrontTheme({ children, className = '', theme }) {
  const resolved = resolveStorefrontTheme(theme);
  const variables = storefrontThemeVariables(resolved);
  const scopedCss = [
    colorUtilityCss('primary', resolved.primary),
    colorUtilityCss('accent', resolved.accent),
    `.nesti-storefront .text-primary-contrast { color: ${resolved.primaryContrast} !important; }`,
    `.nesti-storefront .text-accent-contrast { color: ${resolved.accentContrast} !important; }`,
    `.nesti-storefront .text-canvas-contrast { color: ${resolved.canvasContrast} !important; }`,
    `.nesti-storefront .hover\\:bg-primary-dark:hover { background-color: color-mix(in srgb, ${resolved.primary} 88%, black) !important; }`,
    '.nesti-storefront .storefront-btn,',
    '.nesti-storefront a.storefront-btn,',
    '.nesti-storefront button.bg-primary,',
    '.nesti-storefront a.bg-primary {',
    '  border-radius: var(--storefront-radius) !important;',
    '}',
  ].join('\n');

  return (
    <div
      className={`nesti-storefront w-full max-w-none bg-[var(--storefront-canvas)] text-[var(--storefront-body)] antialiased ${className}`.trim()}
      style={{ ...variables, fontFamily: 'var(--storefront-font)' }}
      suppressHydrationWarning
    >
      {/* Injected via createElement so Turbopack does not rewrite this as styled-jsx.
          Browsers normalize <style> text nodes during parse, so keep dangerouslySetInnerHTML. */}
      {createElement('style', {
        dangerouslySetInnerHTML: { __html: scopedCss },
        suppressHydrationWarning: true,
      })}
      {children}
    </div>
  );
}
