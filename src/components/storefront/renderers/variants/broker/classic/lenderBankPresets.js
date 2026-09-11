export const LENDER_BANK_CUSTOM_KEY = 'custom';

export const LENDER_BANK_PRESETS = Object.freeze([
  { id: 'rbc', title: 'RBC', domain: 'rbcroyalbank.com', category: 'Major Banks', region: 'Canada' },
  { id: 'td', title: 'TD', domain: 'td.com', category: 'Major Banks', region: 'Canada' },
  { id: 'scotiabank', title: 'Scotiabank', domain: 'scotiabank.com', category: 'Major Banks', region: 'Canada' },
  { id: 'bmo', title: 'BMO', domain: 'bmo.com', category: 'Major Banks', region: 'Canada' },
  { id: 'cibc', title: 'CIBC', domain: 'cibc.com', category: 'Major Banks', region: 'Canada' },
  { id: 'national-bank', title: 'National Bank', domain: 'nbc.ca', category: 'Major Banks', region: 'Canada' },
  { id: 'desjardins', title: 'Desjardins', domain: 'desjardins.com', category: 'Credit Unions', region: 'Canada' },
  { id: 'tangerine', title: 'Tangerine', domain: 'tangerine.ca', category: 'Digital Banks', region: 'Canada' },
  { id: 'simplii', title: 'Simplii Financial', domain: 'simplii.com', category: 'Digital Banks', region: 'Canada' },
  { id: 'vancity', title: 'Vancity', domain: 'vancity.com', category: 'Credit Unions', region: 'Canada' },
  { id: 'hsbc', title: 'HSBC', domain: 'hsbc.ca', category: 'Major Banks', region: 'Canada' },
  { id: 'manulife', title: 'Manulife Bank', domain: 'manulifebank.ca', category: 'Alternative Lenders', region: 'Canada' },
  { id: 'chase', title: 'Chase', domain: 'chase.com', category: 'Major Banks', region: 'United States' },
  { id: 'wells-fargo', title: 'Wells Fargo', domain: 'wellsfargo.com', category: 'Major Banks', region: 'United States' },
  { id: 'bank-of-america', title: 'Bank of America', domain: 'bankofamerica.com', category: 'Major Banks', region: 'United States' },
  { id: 'citibank', title: 'Citibank', domain: 'citibank.com', category: 'Major Banks', region: 'United States' },
  { id: 'us-bank', title: 'U.S. Bank', domain: 'usbank.com', category: 'Major Banks', region: 'United States' },
]);

export function matchLenderPreset(item = {}) {
  const presetKey = String(item.preset_key || '').trim();
  if (presetKey && presetKey !== LENDER_BANK_CUSTOM_KEY) {
    return LENDER_BANK_PRESETS.find((preset) => preset.id === presetKey) || null;
  }

  const title = String(item.title || item.name || '').trim().toLowerCase();
  const domain = String(item.domain || item.website || item.url || item.href || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  if (domain) {
    const byDomain = LENDER_BANK_PRESETS.find((preset) => preset.domain === domain);
    if (byDomain) return byDomain;
  }

  if (title) {
    const byTitle = LENDER_BANK_PRESETS.find((preset) => (
      preset.title.toLowerCase() === title
      || title.includes(preset.title.toLowerCase())
      || preset.title.toLowerCase().includes(title)
    ));
    if (byTitle) return byTitle;
  }

  return null;
}

export function resolveLenderPresetKey(item = {}) {
  const explicit = String(item.preset_key || '').trim();
  if (explicit) return explicit;
  return matchLenderPreset(item)?.id || LENDER_BANK_CUSTOM_KEY;
}

export function applyLenderPreset(presetKey = '') {
  if (presetKey === LENDER_BANK_CUSTOM_KEY) {
    return {
      preset_key: LENDER_BANK_CUSTOM_KEY,
      title: '',
      domain: '',
      website: '',
      description: '',
    };
  }

  const preset = LENDER_BANK_PRESETS.find((entry) => entry.id === presetKey);
  if (!preset) return {};

  return {
    preset_key: preset.id,
    title: preset.title,
    domain: preset.domain,
    website: preset.domain,
    category: preset.category,
    description: '',
  };
}

export function lenderBankSelectOptions() {
  const canada = LENDER_BANK_PRESETS.filter((preset) => preset.region === 'Canada');
  const unitedStates = LENDER_BANK_PRESETS.filter((preset) => preset.region === 'United States');

  return [
    ...canada.map((preset) => ({
      value: preset.id,
      label: `${preset.title} · Canada`,
    })),
    ...unitedStates.map((preset) => ({
      value: preset.id,
      label: `${preset.title} · US`,
    })),
    { value: LENDER_BANK_CUSTOM_KEY, label: 'Custom bank' },
  ];
}
