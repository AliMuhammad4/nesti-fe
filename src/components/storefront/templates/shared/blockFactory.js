import { STOREFRONT_BLOCK_TYPES } from '../../storefrontPresets';

export const T = STOREFRONT_BLOCK_TYPES;

export function block(type, content = {}, extras = {}) {
  return {
    type,
    data: {
      enabled: true,
      content,
      layout: {
        alignment: extras.align || 'left',
        padding: extras.padding || 'medium',
        width: 'full',
        variant: extras.variant || '',
        mediaPosition: extras.mediaPosition || '',
        columns: String(extras.columns || ''),
        cardStyle: extras.cardStyle || '',
      },
      style: {
        background: extras.bg || '',
        textColor: extras.color || '',
        radius: extras.radius || 'default',
        shadow: extras.shadow || 'none',
      },
    },
  };
}

export function brand(
  primary,
  accent,
  font,
  button_shape = 'rounded',
  image_style = 'editorial',
  page_background = '#ffffff',
) {
  return {
    primary_color: primary,
    accent_color: accent,
    font,
    button_shape,
    image_style,
    page_background,
  };
}
