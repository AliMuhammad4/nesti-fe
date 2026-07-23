const DEFAULT_THEME = {
  primary: '#34C759',
  primaryContrast: '#FFFFFF',
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
    canvas: '#F8FAFC',
    heading: '#0F172A',
  },
  navy: {
    ...DEFAULT_THEME,
    primary: '#1D4ED8',
    canvas: '#F7F9FF',
    heading: '#172554',
  },
};

const COLOR_KEYS = new Set([
  'primary',
  'primaryContrast',
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

/**
 * Resolves an optional profile theme without requiring a new API field.
 * Existing PublicProfile payloads receive the evergreen preset unchanged.
 */
export function resolveStorefrontTheme(theme = {}) {
  const preset =
    STOREFRONT_THEME_PRESETS[theme?.preset] || STOREFRONT_THEME_PRESETS.evergreen;

  return Object.entries(theme || {}).reduce((resolved, [key, value]) => {
    if (COLOR_KEYS.has(key) && isSafeColor(value)) {
      resolved[key] = value.trim();
    }

    if (key === 'radius' && isSafeRadius(value)) {
      resolved.radius = value.trim();
    }

    if (key === 'fontFamily' && typeof value === 'string' && value.trim().length <= 80) {
      resolved.fontFamily = value.trim();
    }

    return resolved;
  }, { ...preset });
}

export function storefrontThemeVariables(theme) {
  const resolved = resolveStorefrontTheme(theme);

  return {
    '--storefront-primary': resolved.primary,
    '--storefront-primary-contrast': resolved.primaryContrast,
    '--storefront-canvas': resolved.canvas,
    '--storefront-surface': resolved.surface,
    '--storefront-heading': resolved.heading,
    '--storefront-body': resolved.body,
    '--storefront-muted': resolved.muted,
    '--storefront-border': resolved.border,
    '--storefront-radius': resolved.radius,
    '--storefront-font': resolved.fontFamily === 'Playfair Display'
      ? '"Playfair Display", Georgia, "Times New Roman", serif'
      : resolved.fontFamily === 'DM Sans'
        ? '"DM Sans", Inter, ui-sans-serif, system-ui, sans-serif'
        : resolved.fontFamily === 'Inter'
          ? 'Inter, ui-sans-serif, system-ui, sans-serif'
          : 'Manrope, Inter, ui-sans-serif, system-ui, sans-serif',
  };
}

export function StorefrontTheme({ children, className = '', theme }) {
  const resolved = resolveStorefrontTheme(theme);
  const variables = storefrontThemeVariables(resolved);
  const scopedCss = `
    .nesti-storefront .text-primary { color: ${resolved.primary} !important; }
    .nesti-storefront .text-primary\\/40 { color: color-mix(in srgb, ${resolved.primary} 40%, transparent) !important; }
    .nesti-storefront .bg-primary { background-color: ${resolved.primary} !important; }
    .nesti-storefront .bg-primary\\/5 { background-color: color-mix(in srgb, ${resolved.primary} 5%, transparent) !important; }
    .nesti-storefront .bg-primary\\/10 { background-color: color-mix(in srgb, ${resolved.primary} 10%, transparent) !important; }
    .nesti-storefront .bg-primary\\/15 { background-color: color-mix(in srgb, ${resolved.primary} 15%, transparent) !important; }
    .nesti-storefront .border-primary { border-color: ${resolved.primary} !important; }
    .nesti-storefront .border-primary\\/15 { border-color: color-mix(in srgb, ${resolved.primary} 15%, transparent) !important; }
    .nesti-storefront .border-primary\\/30 { border-color: color-mix(in srgb, ${resolved.primary} 30%, transparent) !important; }
    .nesti-storefront .border-primary\\/40 { border-color: color-mix(in srgb, ${resolved.primary} 40%, transparent) !important; }
    .nesti-storefront .ring-primary { --tw-ring-color: ${resolved.primary} !important; }
    .nesti-storefront .ring-primary\\/10 { --tw-ring-color: color-mix(in srgb, ${resolved.primary} 10%, transparent) !important; }
    .nesti-storefront .ring-primary\\/15 { --tw-ring-color: color-mix(in srgb, ${resolved.primary} 15%, transparent) !important; }
    .nesti-storefront .from-primary { --tw-gradient-from: ${resolved.primary} var(--tw-gradient-from-position) !important; }
    .nesti-storefront .to-primary { --tw-gradient-to: ${resolved.primary} var(--tw-gradient-to-position) !important; }
    .nesti-storefront .hover\\:bg-primary-dark:hover { background-color: color-mix(in srgb, ${resolved.primary} 88%, black) !important; }
    .nesti-storefront .hover\\:border-primary\\/30:hover { border-color: color-mix(in srgb, ${resolved.primary} 30%, transparent) !important; }
    .nesti-storefront .hover\\:border-primary\\/40:hover { border-color: color-mix(in srgb, ${resolved.primary} 40%, transparent) !important; }
  `;

  return (
    <div
      className={`nesti-storefront bg-[var(--storefront-canvas)] text-[var(--storefront-body)] antialiased ${className}`.trim()}
      style={{ ...variables, fontFamily: 'var(--storefront-font)' }}
    >
      <style>{scopedCss}</style>
      {children}
    </div>
  );
}
