const FIRST_HOME_IMAGE_FILTERS = Object.freeze({
  editorial: 'saturate(0.92) contrast(1.04)',
  warm: 'sepia(0.16) saturate(1.08) contrast(0.98)',
  minimal: 'grayscale(0.22) saturate(0.72) brightness(1.03)',
  bold: 'saturate(1.2) contrast(1.12)',
});

export function firstHomeImageFilter(profile = {}) {
  if (profile.storefront_template_key !== 'lawyer-first-home-closing') return undefined;
  return FIRST_HOME_IMAGE_FILTERS[profile.storefront_image_style]
    || FIRST_HOME_IMAGE_FILTERS.editorial;
}

export { FIRST_HOME_IMAGE_FILTERS };
