import {
  getServiceIconComponent,
  resolveServiceIconKey,
} from '@/components/storefront/builder/storefrontServiceIcons';

export function blockContent(block) {
  return block?.data?.content || block?.content || {};
}

export function isLightHexColor(value) {
  const match = String(value || '').trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return false;
  const red = Number.parseInt(match[1].slice(0, 2), 16);
  const green = Number.parseInt(match[1].slice(2, 4), 16);
  const blue = Number.parseInt(match[1].slice(4, 6), 16);
  return ((red * 299) + (green * 587) + (blue * 114)) / 1000 > 180;
}

export function lawyerClassicBandColors(sectionStyle = {}, {
  emptyBackgrounds = ['', '#202020', '#24211e'],
  themeBackground = 'var(--storefront-primary, #202020)',
  themeText = 'var(--storefront-primary-contrast, #ffffff)',
  fallbackDark = '#202020',
} = {}) {
  const requestedBackground = String(sectionStyle.background || '').trim();
  const requestedTextColor = String(sectionStyle.textColor || '').trim();
  const usesTheme = emptyBackgrounds.includes(requestedBackground.toLowerCase());
  const unreadable = isLightHexColor(requestedBackground)
    && (!requestedTextColor || isLightHexColor(requestedTextColor));
  const background = usesTheme
    ? themeBackground
    : unreadable
      ? fallbackDark
      : requestedBackground;
  const color = usesTheme
    ? themeText
    : unreadable
      ? '#ffffff'
      : requestedTextColor || (isLightHexColor(background) ? '#202020' : '#ffffff');
  return {
    background,
    color,
    requestedBackground,
    requestedTextColor,
    usesTheme,
  };
}

export function resolveProfessionalIdentity(profile) {
  return {
    name: profile?.professional_profile?.full_name
      || profile?.professional_name
      || 'Legal professional',
    role: profile?.professional_profile?.role_title || 'Real Estate Lawyer',
    company: profile?.professional_profile?.company_name
      || profile?.storefront_brand_kit?.business_name
      || profile?.brand_kit?.business_name
      || '',
  };
}

export function uniqueNamedList(value, fallback = []) {
  const seen = new Set();
  const source = Array.isArray(value)
    ? value
    : String(value || '').split(/[,|]/);
  const unique = source
    .map((item) => {
      if (item == null) return '';
      if (typeof item === 'string') return item.trim();
      return String(item.title || item.name || item.label || '').trim();
    })
    .filter((item) => {
      const key = item.toLocaleLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
  return unique.length ? unique : fallback;
}

export function lawyerClassicGridClass(columns, itemCount) {
  const requested = Number.parseInt(String(columns), 10);
  const cols = [1, 2, 3, 4].includes(requested) ? requested : 3;
  const count = Number(itemCount) || 0;
  const byCount = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 xl:grid-cols-4',
  };
  if (count > 0 && count < cols) return byCount[count] || 'grid-cols-1';
  if (count === 4 && cols === 3) return 'md:grid-cols-2';
  if (count === 5 && cols === 4) return 'sm:grid-cols-2 lg:grid-cols-3';
  return byCount[cols] || 'md:grid-cols-2 lg:grid-cols-3';
}

export const LAWYER_CLASSIC_PROCESS_DEFAULTS = [
  { title: 'Inquiry', text: 'Share the transaction, documents, and closing timeline.' },
  { title: 'Scope', text: 'We confirm the legal work that is actually in play.' },
  { title: 'Documents', text: 'Review agreements, title issues, and signing requirements.' },
  { title: 'Closing', text: 'Coordinate funds, signatures, and registration with clarity.' },
];

export function lawyerClassicPaddingClass(padding) {
  return {
    none: 'py-12',
    small: 'py-12 sm:py-14',
    medium: 'py-16 sm:py-20',
    large: 'py-20 sm:py-24',
  }[String(padding || 'medium')] || 'py-16 sm:py-20';
}

export function lawyerClassicSectionStyle(block) {
  return block?.data?.style || block?.style || {};
}

export function lawyerClassicHasColor(value) {
  return Boolean(String(value || '').trim());
}

export function lawyerClassicResolvedPaddingClass(padding, fallbackClass = 'py-16 sm:py-20') {
  const key = String(padding || '').trim();
  if (!key || key === 'none') return fallbackClass;
  return lawyerClassicPaddingClass(key);
}

export function lawyerClassicToneClass(customColor, fallbackClass) {
  return lawyerClassicHasColor(customColor) ? 'text-current' : fallbackClass;
}

export function lawyerClassicItemSurface(item = {}) {
  return {
    ...(lawyerClassicHasColor(item.background) ? { background: item.background } : {}),
    ...(lawyerClassicHasColor(item.text_color) ? { color: item.text_color } : {}),
  };
}

export function resolveLawyerClassicItems(content, fallback = [], limit = 6) {
  const hasPersisted = Object.prototype.hasOwnProperty.call(content, 'items')
    && Array.isArray(content.items);
  return (hasPersisted ? content.items : fallback)
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const [title = '', description = ''] = item.split('|').map((part) => part.trim());
        return title ? { id: `item-${index}`, title, description } : null;
      }
      const title = String(item.title || item.label || '').trim();
      if (!title) return null;
      return {
        id: item.id || `item-${index}`,
        title,
        description: item.description || item.text || '',
        cta_label: item.cta_label || '',
        action: item.action || 'inquiry',
        background: item.background || '',
        text_color: item.text_color || '',
        icon: item.icon || '',
      };
    })
    .filter(Boolean)
    .slice(0, limit);
}

export const LAWYER_CLASSIC_ICON_DEFAULTS = {
  'role-details': ['contract', 'shield', 'landmark', 'scale', 'file', 'gavel'],
  'who-we-help': ['home', 'building', 'landmark', 'briefcase', 'users', 'scale'],
  'practice-areas': ['building', 'home', 'contract', 'landmark', 'gavel', 'briefcase'],
  'fee-guidance': ['scale', 'dollar', 'clipboard', 'landmark'],
  'consultation-options': ['message', 'calendar', 'contract', 'handshake'],
  guidance: ['notebook', 'contract', 'shield', 'scale', 'landmark', 'gavel'],
};

export function lawyerClassicIconDefault(blockType, index = 0) {
  const keys = LAWYER_CLASSIC_ICON_DEFAULTS[blockType] || ['scale', 'shield', 'home', 'building', 'landmark', 'gavel'];
  return keys[index % keys.length];
}

export function resolveLawyerClassicIcon(item, index, fallbackKeys = []) {
  const fallback = fallbackKeys[index % Math.max(fallbackKeys.length, 1)]
    || lawyerClassicIconDefault('', index);
  const key = String(item?.icon || '').trim() || fallback;
  return getServiceIconComponent(resolveServiceIconKey(key, index));
}
