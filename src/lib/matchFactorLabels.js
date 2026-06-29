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

export const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'french', label: 'French' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'other', label: 'Other' },
];

export const WORKING_STYLE_OPTIONS = [
  { value: 'educational_advisor', label: 'Educational Advisor - I guide clients through every step' },
  { value: 'fast_deal_closer', label: 'Fast Deal Closer - I move quickly to close deals' },
  { value: 'data_driven', label: 'Data-Driven - I rely on market data and analytics' },
  { value: 'relationship_focused', label: 'Relationship-Focused - I build long-term connections' },
  { value: 'investor_oriented', label: 'Investor-Oriented - I specialize in investment properties' },
];

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-Level (3-5 years)' },
  { value: 'senior', label: 'Senior (6-10 years)' },
  { value: 'elite', label: 'Elite (10+ years)' },
];
