import { PROFESSIONAL_WORKING_STYLE_OPTIONS, STANDARD_LANGUAGE_OPTIONS } from "./matchingTaxonomy";

export const MATCH_FACTOR_LABELS = {
  client_type: 'Client Type',
  price_range: 'Price Range',
  property_type: 'Property Type',
  service_area: 'Service Area',
  timeline: 'Timeline',
  language: 'Language Preference',
  experience: 'Experience Level',
  loan_type: 'Loan Type',
  credit_range: 'Credit Score Range',
  income: 'Income Range',
  loan_size: 'Loan Size',
  transaction_type: 'Transaction Type',
  property_value: 'Property Value',
};

export function formatMatchFactor(factor) {
  return MATCH_FACTOR_LABELS[factor] || factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export const LANGUAGE_OPTIONS = STANDARD_LANGUAGE_OPTIONS;

export const WORKING_STYLE_OPTIONS = [
  ...PROFESSIONAL_WORKING_STYLE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-Level (3-5 years)' },
  { value: 'senior', label: 'Senior (6-10 years)' },
  { value: 'elite', label: 'Elite (10+ years)' },
];
