import { T } from './shared/blockFactory';
import { getStorefrontTemplate } from './registry';

export function visualTreatmentForTemplate(templateId, type, index) {
  const isHero = type === T.HERO;
  const isListing = [
    T.PROPERTIES,
    T.FEATURED_LISTINGS,
    T.TOP_LISTINGS,
    T.SOLD_LISTINGS,
    T.SELLER_SOLD_RESULTS,
  ].includes(type);
  const isTool = type === T.MORTGAGE_CALCULATOR;
  const palette = {
    'agent-classic': {
      bg: index % 2 === 0 ? '#f7fcfa' : '#eef7f4',
      align: isHero ? 'left' : 'left',
      padding: isHero ? 'large' : 'medium',
      radius: 'none',
      variant: isHero ? 'standard' : isListing ? 'feature-grid' : 'editorial',
      cardStyle: 'bordered',
      columns: isListing ? '4' : '3',
      mediaPosition: isHero ? 'background' : 'none',
      width: 'full',
      shadow: 'small',
    },
    'agent-luxury-advisor': {
      bg: index % 2 === 0 ? '#0d0c0b' : '#11100f',
      align: 'left',
      padding: isHero ? 'large' : 'medium',
      radius: isListing ? 'large' : 'none',
      variant: isHero ? 'premium' : isListing ? 'editorial' : 'split',
      cardStyle: 'bordered',
      columns: isListing ? '2' : '2',
      mediaPosition: isHero ? 'background' : 'right',
      width: 'full',
      shadow: isListing ? 'medium' : 'none',
    },
    'agent-first-home': {
      bg: index % 2 === 0 ? '#ffffff' : '#f4faf5',
      align: isHero || index < 2 ? 'center' : 'left',
      padding: isHero ? 'large' : 'medium',
      radius: 'none',
      variant: isHero ? 'premium' : isTool ? 'lead-magnet' : isListing ? 'feature-grid' : 'editorial',
      cardStyle: 'bordered',
      columns: isListing ? '3' : '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: 'full',
      shadow: 'none',
    },
    'agent-investor': {
      bg: index % 2 === 0 ? '#ffffff' : '#f8fafc',
      align: 'left',
      padding: index <= 2 ? 'large' : 'medium',
      radius: 'none',
      variant: isListing ? 'feature-grid' : 'minimal',
      cardStyle: 'bordered',
      columns: isListing ? '4' : '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: isListing ? 'full' : 'full',
      shadow: 'none',
    },
    'agent-seller-expert': {
      bg: index % 2 === 0 ? '#f8fafc' : '#ffffff',
      align: isHero ? 'left' : 'left',
      padding: isHero ? 'large' : 'medium',
      radius: 'default',
      variant: isTool ? 'lead-magnet' : isHero ? 'split' : isListing ? 'feature-grid' : 'editorial',
      cardStyle: 'bordered',
      columns: isListing ? '3' : '3',
      mediaPosition: isHero ? 'right' : 'none',
      width: 'full',
      shadow: 'small',
    },
    'agent-community-expert': {
      bg: '',
      align: isHero ? 'left' : 'left',
      padding: isHero ? 'large' : 'medium',
      radius: 'large',
      variant: isHero ? 'editorial' : isListing ? 'feature-grid' : 'split',
      cardStyle: isListing ? 'elevated' : 'glass',
      columns: isListing ? '3' : '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: isListing ? 'full' : 'contained',
      shadow: 'medium',
    },
    'mortgage_broker-classic': {
      bg: [T.HERO, T.FOOTER].includes(type)
        ? '#0c2139'
        : '',
      align: 'left',
      padding: 'large',
      radius: 'none',
      variant: isHero ? 'editorial' : isTool ? 'lead-magnet' : 'standard',
      cardStyle: 'bordered',
      columns: type === T.CREDENTIALS
        ? '4'
        : type === T.LENDER_NETWORK
          ? '4'
        : type === T.FAQ || type === T.MORTGAGE_RATES || type === T.MORTGAGE_CALCULATOR
          ? '1'
        : [T.MORTGAGE_PROGRAMS, T.GUIDANCE, T.TESTIMONIALS, T.ALTERNATIVE_LENDING].includes(type)
          ? '3'
          : '2',
      mediaPosition: isHero ? 'right' : 'none',
      width: 'full',
      shadow: 'none',
    },
    'mortgage_broker-first-home': {
      bg: type === T.HERO
        ? '#102A43'
        : type === T.FOOTER
          ? '#081A2D'
          : type === T.CTA
            ? '#102A43'
            : index % 2 === 0 ? '#EEF3F7' : '#F7F9FB',
      align: 'left',
      padding: 'large',
      radius: 'default',
      variant: isHero ? 'premium' : isTool ? 'lead-magnet' : 'standard',
      cardStyle: isTool ? 'elevated' : type === T.GUIDANCE ? 'flat' : 'bordered',
      columns: type === T.PRACTICE_SNAPSHOT || type === T.BROKER_COMPENSATION || type === T.TESTIMONIALS
        ? '3'
        : type === T.SERVICES || type === T.GUIDANCE || type === T.MORTGAGE_PROGRAMS || type === T.CREDENTIALS
          ? '4'
          : '1',
      mediaPosition: isHero ? 'right' : 'none',
      width: 'full',
      shadow: isTool ? 'medium' : 'none',
    },
    'mortgage_broker-wealth': {
      bg: index % 2 === 0 ? '#f5f3ff' : '#fff7ed',
      align: isHero ? 'center' : 'left',
      padding: 'large',
      radius: 'default',
      variant: 'premium',
      cardStyle: 'elevated',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'right',
      width: 'contained',
      shadow: 'large',
    },
    'mortgage_broker-renewal': {
      bg: index % 2 === 0 ? '#ecfeff' : '#ffffff',
      align: isHero ? 'center' : 'left',
      padding: isHero || isTool ? 'large' : 'medium',
      radius: 'large',
      variant: isHero ? 'lead-magnet' : isTool ? 'split' : 'standard',
      cardStyle: 'elevated',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: isHero || isTool ? 'narrow' : 'contained',
      shadow: 'medium',
    },
    'mortgage_broker-commercial': {
      bg: index % 2 === 0 ? '#f8fafc' : '#fef3c7',
      align: 'left',
      padding: 'large',
      radius: 'none',
      variant: 'minimal',
      cardStyle: 'bordered',
      columns: '3',
      mediaPosition: 'none',
      width: 'full',
      shadow: 'none',
    },
    'lawyer-classic': {
      bg: '',
      align: 'left',
      padding: isHero ? 'none' : isTool ? 'large' : 'medium',
      radius: 'none',
      variant: isHero ? 'premium' : isTool ? 'lead-magnet' : 'editorial',
      cardStyle: isTool ? 'elevated' : 'bordered',
      columns: type === T.PRACTICE_AREAS || type === T.WHO_WE_HELP
        ? (type === T.WHO_WE_HELP ? '4' : '3')
        : type === T.DOCUMENT_CHECKLIST
          ? '2'
          : type === T.FEE_GUIDANCE || type === T.CONSULTATION_OPTIONS
            ? '3'
            : '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: isTool ? 'narrow' : 'full',
      shadow: isTool ? 'large' : 'none',
    },
    'lawyer-first-home-closing': {
      bg: '',
      align: 'left',
      padding: isHero || isTool ? 'large' : 'medium',
      radius: 'none',
      variant: isHero ? 'premium' : isTool ? 'lead-magnet' : 'editorial',
      cardStyle: isTool ? 'elevated' : 'bordered',
      columns: type === T.PRACTICE_AREAS || type === T.WHO_WE_HELP
        ? '3'
        : type === T.DOCUMENT_CHECKLIST || type === T.FAQ
          ? '2'
          : type === T.FEE_GUIDANCE || type === T.CONSULTATION_OPTIONS
            ? '3'
            : type === T.CREDENTIALS
              ? '4'
              : '3',
      mediaPosition: isHero ? 'background' : 'none',
      width: isTool ? 'narrow' : 'full',
      shadow: isTool ? 'large' : 'none',
    },
    'lawyer-investor': {
      bg: [T.HERO, T.FOOTER].includes(type)
        ? '#20252b'
        : (type === T.CTA ? '#007f95' : ''),
      align: 'left',
      padding: 'large',
      radius: 'none',
      variant: isHero ? 'editorial' : 'minimal',
      cardStyle: 'bordered',
      columns: [T.PRACTICE_AREAS, T.ROLE_DETAILS].includes(type)
        ? '3'
        : ([T.GUIDANCE, T.CREDENTIALS].includes(type) ? '4' : '2'),
      mediaPosition: isHero ? 'portrait' : 'none',
      width: 'full',
      shadow: 'none',
    },
    'lawyer-newcomer': {
      bg: '',
      align: isHero || isTool ? 'center' : 'left',
      padding: 'medium',
      radius: 'large',
      variant: isHero ? 'feature-grid' : isTool ? 'lead-magnet' : 'standard',
      cardStyle: 'glass',
      columns: '2',
      mediaPosition: isHero ? 'background' : 'none',
      width: 'contained',
      shadow: 'medium',
    },
  }[templateId];

  if (palette) return palette;

  return {
    bg: index % 2 === 0 ? '#ffffff' : '#f8fafc',
    align: isHero ? 'left' : 'left',
    padding: isHero ? 'large' : 'medium',
    radius: 'default',
    variant: isHero ? 'standard' : isTool ? 'lead-magnet' : 'standard',
    cardStyle: 'bordered',
    columns: '3',
    mediaPosition: isHero ? 'background' : 'none',
    width: isTool ? 'narrow' : 'full',
    shadow: 'small',
  };
}

/** Theme-aware default surfaces for property listing cards. */
export function listingCardThemeFromTemplate(templateKey = '') {
  const template = getStorefrontTemplate(templateKey);
  const brand = template?.brand || {};
  const byTemplate = {
    'agent-luxury-advisor': { card_background: '#171513', card_text_color: '#f5f1e8', cardStyle: 'bordered' },
    'agent-first-home': { card_background: '#ffffff', card_text_color: '#111111', cardStyle: 'bordered' },
    'agent-investor': { card_background: '#ffffff', card_text_color: '', cardStyle: 'bordered' },
    'agent-seller-expert': { card_background: '#ffffff', card_text_color: '', cardStyle: 'elevated' },
    'agent-community-expert': { card_background: '#ffffff', card_text_color: '', cardStyle: 'glass' },
    'agent-classic': { card_background: '#ffffff', card_text_color: '', cardStyle: 'bordered' },
  };
  const preset = byTemplate[templateKey] || {
    card_background: '#ffffff',
    card_text_color: '',
    cardStyle: 'bordered',
  };
  return {
    ...preset,
    card_background: preset.card_background || brand.page_background || '#ffffff',
  };
}
