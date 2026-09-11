export function resolveStorefrontRendererTheme({
  templateKey,
  explicitTheme,
  profileTheme,
  templateBrand = {},
  templateThemeVersion = 0,
} = {}) {
  const definedThemeValues = Object.fromEntries(
    Object.entries(explicitTheme || profileTheme || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
  const investorPrimary = String(definedThemeValues.primary || '').trim().toLowerCase();
  const investorAccent = String(definedThemeValues.accent || '').trim().toLowerCase();
  const usesLegacyLawyerInvestorPalette = templateKey === 'lawyer-investor'
    && (
      (investorPrimary === '#312e81' && investorAccent === '#a78bfa')
      || (investorPrimary === '#1d2740' && investorAccent === '#b9915e')
      || (investorPrimary === '#183c34' && investorAccent === '#d07a45')
    );
  if (usesLegacyLawyerInvestorPalette) {
    definedThemeValues.primary = templateBrand.primary_color || '#20252b';
    definedThemeValues.accent = templateBrand.accent_color || '#00a7c4';
    if (['#ffffff', '#f5f3ee', '#f4f0e8'].includes(
      String(definedThemeValues.canvas || '').trim().toLowerCase(),
    )) {
      definedThemeValues.canvas = templateBrand.page_background || '#f3f6f7';
    }
    if (['999px', '0.75rem', '1rem'].includes(
      String(definedThemeValues.radius || '').trim().toLowerCase(),
    )) {
      definedThemeValues.radius = '2px';
    }
  }
  if (
    templateKey === 'agent-luxury-advisor'
    && String(definedThemeValues.canvas || '').trim().toLowerCase() === '#faf7ef'
  ) {
    definedThemeValues.canvas = templateBrand.page_background || '#11100f';
  }
  if (
    templateKey === 'agent-luxury-advisor'
    && String(definedThemeValues.accent || '').trim().toLowerCase() === '#c9a227'
  ) {
    definedThemeValues.accent = templateBrand.accent_color || '#c9b08a';
  }
  if (
    templateKey === 'agent-luxury-advisor'
    && ['#0f766e', '#0d9488', '#115e59'].includes(String(definedThemeValues.primary || '').trim().toLowerCase())
  ) {
    definedThemeValues.primary = templateBrand.primary_color || '#1c1917';
  }
  if (
    templateKey === 'agent-first-home'
    && ['#1d4ed8', '#2b221c', '#173740', '#2f7d78'].includes(String(definedThemeValues.primary || '').trim().toLowerCase())
  ) {
    definedThemeValues.primary = templateBrand.primary_color || '#0b3d20';
  }
  if (
    templateKey === 'agent-first-home'
    && ['#f59e0b', '#fb7185', '#c78960', '#e58b5b', '#ed8b62'].includes(String(definedThemeValues.accent || '').trim().toLowerCase())
  ) {
    definedThemeValues.accent = templateBrand.accent_color || '#5bd36d';
  }
  if (
    templateKey === 'agent-first-home'
    && ['#eff6ff', '#f8f6f2', '#f4efe7', '#f7f3ec'].includes(String(definedThemeValues.canvas || '').trim().toLowerCase())
  ) {
    definedThemeValues.canvas = templateBrand.page_background || '#ffffff';
  }
  if (
    templateKey === 'agent-seller-expert'
    && ['#9f1239', '#be123c', '#881337', '#0f766e'].includes(String(definedThemeValues.primary || '').trim().toLowerCase())
  ) {
    definedThemeValues.primary = templateBrand.primary_color || '#0f172a';
  }
  if (
    templateKey === 'agent-seller-expert'
    && ['#f59e0b', '#fb7185', '#c9a227', '#22c55e'].includes(String(definedThemeValues.accent || '').trim().toLowerCase())
  ) {
    definedThemeValues.accent = templateBrand.accent_color || '#06b6d4';
  }
  if (
    templateKey === 'agent-seller-expert'
    && ['#fff1f2', '#fff0f3', '#fff7e7', '#f5fbf8'].includes(String(definedThemeValues.canvas || '').trim().toLowerCase())
  ) {
    definedThemeValues.canvas = templateBrand.page_background || '#f8fafc';
  }
  if (
    templateKey === 'agent-community-expert'
    && ['#8b5cf6', '#7c3aed', '#6366f1', '#a78bfa'].includes(String(definedThemeValues.accent || '').trim().toLowerCase())
  ) {
    definedThemeValues.accent = templateBrand.accent_color || '#1f6fbf';
  }
  if (
    templateKey === 'agent-community-expert'
    && ['#f8f7fc', '#f5f7ff'].includes(String(definedThemeValues.canvas || '').trim().toLowerCase())
  ) {
    definedThemeValues.canvas = templateBrand.page_background || '#f5f7fa';
  }
  const shouldMigrateLawyerFirstHomeTheme = templateKey === 'lawyer-first-home-closing'
    && Number(templateThemeVersion || 0) < 4;
  if (
    templateKey === 'lawyer-first-home-closing'
    && ['playfair display', 'open sans'].includes(
      String(definedThemeValues.fontFamily || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.fontFamily = templateBrand.font || 'Cormorant Garamond';
  }
  if (
    shouldMigrateLawyerFirstHomeTheme
    && ['#1e3a8a', '#101a2b', '#34c759'].includes(
      String(definedThemeValues.primary || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.primary = templateBrand.primary_color || '#1f2839';
  }
  if (
    shouldMigrateLawyerFirstHomeTheme
    && ['#60a5fa', '#c8a878', '#f59e0b'].includes(
      String(definedThemeValues.accent || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.accent = templateBrand.accent_color || '#b69d74';
  }
  if (
    shouldMigrateLawyerFirstHomeTheme
    && ['#ffffff', '#eff6ff', '#f7f4ee'].includes(
      String(definedThemeValues.canvas || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.canvas = templateBrand.page_background || '#f6f3ed';
  }
  if (
    shouldMigrateLawyerFirstHomeTheme
    && ['dm sans', 'inter', 'playfair display', 'open sans'].includes(
      String(definedThemeValues.fontFamily || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.fontFamily = templateBrand.font || 'Cormorant Garamond';
  }
  if (
    shouldMigrateLawyerFirstHomeTheme
    && ['999px', '0.75rem', '1rem'].includes(
      String(definedThemeValues.radius || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.radius = '2px';
  }
  if (
    templateKey === 'lawyer-classic'
    && ['#172554', '#1e3a8a', '#0f766e', '#34c759'].includes(
      String(definedThemeValues.primary || '').trim().toLowerCase(),
    )
    && !['#172554', '#1e3a8a', '#0f766e', '#34c759'].includes(
      String(templateBrand.primary_color || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.primary = templateBrand.primary_color || '#202020';
  }
  if (
    templateKey === 'lawyer-classic'
    && ['#c9a227', '#d4af37', '#f59e0b'].includes(
      String(definedThemeValues.accent || '').trim().toLowerCase(),
    )
    && !['#c9a227', '#d4af37', '#f59e0b'].includes(
      String(templateBrand.accent_color || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.accent = templateBrand.accent_color || '#d39a52';
  }
  if (
    templateKey === 'lawyer-classic'
    && ['playfair display', 'manrope'].includes(
      String(definedThemeValues.fontFamily || '').trim().toLowerCase(),
    )
    && !['playfair display', 'manrope'].includes(
      String(templateBrand.font || '').trim().toLowerCase(),
    )
  ) {
    definedThemeValues.fontFamily = templateBrand.font || 'Inter';
  }
  if (
    templateKey === 'lawyer-classic'
    && ['0.75rem', '1rem'].includes(String(definedThemeValues.radius || '').trim().toLowerCase())
  ) {
    definedThemeValues.radius = '2px';
  }
  if (
    templateKey === 'lawyer-classic'
    && !String(definedThemeValues.canvas || '').trim()
  ) {
    definedThemeValues.canvas = templateBrand.page_background || '#ffffff';
  }
  const resolvedTheme = {
    primary: templateBrand.primary_color,
    accent: templateBrand.accent_color,
    canvas: templateBrand.page_background,
    fontFamily: templateBrand.font,
    radius: templateBrand.button_shape === 'pill'
      ? '999px'
      : templateBrand.button_shape === 'square'
        ? '2px'
        : '0.75rem',
    ...definedThemeValues,
  };
  return resolvedTheme;
}
