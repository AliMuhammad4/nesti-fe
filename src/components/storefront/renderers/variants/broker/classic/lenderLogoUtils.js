const LENDER_DOMAIN_BY_KEY = {
  rbc: 'rbcroyalbank.com',
  'royal bank': 'rbcroyalbank.com',
  'royal bank of canada': 'rbcroyalbank.com',
  td: 'td.com',
  'td bank': 'td.com',
  'toronto-dominion': 'td.com',
  scotia: 'scotiabank.com',
  scotiabank: 'scotiabank.com',
  'bank of nova scotia': 'scotiabank.com',
  bmo: 'bmo.com',
  'bank of montreal': 'bmo.com',
  cibc: 'cibc.com',
  'canadian imperial bank': 'cibc.com',
  'national bank': 'nbc.ca',
  nbc: 'nbc.ca',
  desjardins: 'desjardins.com',
  hsbc: 'hsbc.ca',
  'manulife bank': 'manulifebank.ca',
  manulife: 'manulifebank.ca',
  'first national': 'firstnational.ca',
  mcap: 'mcap.com',
  equitable: 'equitablebank.ca',
  'equitable bank': 'equitablebank.ca',
  'eq bank': 'eqbank.ca',
  'home trust': 'hometrust.ca',
  'rmg mortgages': 'rmgmortgages.com',
  'merix financial': 'merixfinancial.com',
  'street capital': 'streetcapital.ca',
  'icici bank': 'icicibank.ca',
  tangerine: 'tangerine.ca',
  simplii: 'simplii.com',
  vancity: 'vancity.com',
  'coast capital': 'coastcapitalsavings.com',
};

export function normalizeLenderDomain(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0];
}

export function resolveLenderDomain(item = {}) {
  const explicit = normalizeLenderDomain(item.domain || item.website || item.url || item.href || '');
  if (explicit) return explicit;
  const key = String(item.title || item.name || '').trim().toLowerCase();
  if (!key) return '';
  if (LENDER_DOMAIN_BY_KEY[key]) return LENDER_DOMAIN_BY_KEY[key];
  const match = Object.entries(LENDER_DOMAIN_BY_KEY).find(([name]) => (
    key.includes(name) || name.includes(key)
  ));
  return match?.[1] || '';
}

export function lenderWebsiteHref(item = {}) {
  const domain = resolveLenderDomain(item);
  if (!domain) return '';
  return `https://${domain}`;
}

export function lenderLogoDevUrl(domain) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || '';
  if (!domain) return '';
  return `https://img.logo.dev/${domain}?token=${token}&size=256&format=png&retina=true&theme=light`;
}

export function lenderInitials(title = '') {
  return String(title)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'LN';
}
