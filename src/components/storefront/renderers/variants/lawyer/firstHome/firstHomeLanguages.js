import { STANDARD_LANGUAGE_OPTIONS } from '@/lib/matchingTaxonomy';

const LANGUAGE_LABELS = new Map(
  STANDARD_LANGUAGE_OPTIONS
    .filter((option) => option.value !== 'other')
    .flatMap((option) => [
      [option.value.toLowerCase(), option.label],
      [option.label.toLowerCase(), option.label],
    ]),
);

function languageBags(profile = {}, professional = {}) {
  return [
    professional.languages_spoken,
    professional.languagesSpoken,
    profile.languages_spoken,
    profile.languagesSpoken,
    profile.storefront_essentials?.languages_spoken,
  ];
}

function asLanguageLabel(item) {
  if (item == null) return '';
  const raw = typeof item === 'object'
    ? item.value || item.label || item.name || ''
    : item;
  const value = String(raw || '').trim();
  if (!value || /^other$/i.test(value)) return '';
  return LANGUAGE_LABELS.get(value.toLowerCase()) || value;
}

export function resolveFirstHomeLanguages(profile = {}, professional = {}) {
  const languages = languageBags(profile, professional)
    .flatMap((list) => (Array.isArray(list) ? list : []))
    .map(asLanguageLabel)
    .filter(Boolean);
  const otherLanguage = String(
    professional.other_language_text
      || professional.otherLanguageText
      || profile.other_language_text
      || profile.otherLanguageText
      || '',
  ).trim();
  if (
    otherLanguage.length >= 2
    && !/\b(lorem|ipsum|quibusdam|placeholder|asdf)\b/i.test(otherLanguage)
  ) {
    languages.push(otherLanguage);
  }
  return [...new Set(languages)].slice(0, 6);
}

export function isFirstHomeLanguageCard(item = {}) {
  const source = String(item.source || '').toLowerCase();
  const title = String(item.title || '').toLowerCase();
  return source === 'languages' || title.includes('language');
}
