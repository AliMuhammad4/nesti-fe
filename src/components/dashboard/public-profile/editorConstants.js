import { STOREFRONT_TEMPLATE_PRESETS } from '@/components/storefront/storefrontPresets';
import { listTemplateGroups } from '@/components/storefront/templates';

export const editorInputClass =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10';

/** Derived from the template registry — single source of truth for template keys/names. */
export const TEMPLATE_GROUPS = listTemplateGroups();

export const ESSENTIAL_QUESTIONS = [
  { key: 'ideal_client', label: 'Who is your ideal client?', placeholder: 'First-time homebuyers' },
  { key: 'service_area', label: 'Primary service area', placeholder: 'Toronto & GTA' },
  { key: 'specialty', label: 'Your specialty', placeholder: 'Condo resales' },
  { key: 'value_proposition', label: 'Why choose you?', placeholder: 'Straightforward, local guidance' },
  { key: 'years_experience', label: 'Years of experience', placeholder: '10+ years' },
  { key: 'credentials', label: 'Key credentials', placeholder: 'RECO licensed' },
  { key: 'languages', label: 'Languages spoken', placeholder: 'English, Urdu' },
  { key: 'consultation_cta', label: 'Preferred call to action', placeholder: 'Book a free consultation' },
  { key: 'availability', label: 'Availability', placeholder: 'Evenings and weekends' },
  { key: 'personal_note', label: 'Personal note', placeholder: 'What matters most to you?' },
];

export function normalizeRole(role) {
  return Object.hasOwn(STOREFRONT_TEMPLATE_PRESETS, role) ? role : 'agent';
}

export function blockLabel(type) {
  return String(type || 'block')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
