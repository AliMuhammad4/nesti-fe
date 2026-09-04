export function serviceBenefits(item = {}) {
  const identity = `${item.id || ''} ${item.title || item.label || ''}`.toLowerCase();
  if (/pre.?approval/.test(identity)) {
    return ['Affordability and debt review', 'Personal document checklist', 'Offer-ready approval plan'];
  }
  if (/refinance/.test(identity)) {
    return ['Equity and penalty review', 'Debt consolidation options', 'Payment savings comparison'];
  }
  if (/renewal/.test(identity)) {
    return ['Current market rate check', 'Term and payment comparison', 'Lender negotiation support'];
  }
  if (/invest|rental/.test(identity)) {
    return ['Rental income assessment', 'Portfolio lending strategy', 'Cash-flow focused structure'];
  }
  if (/self.?employ|business owner/.test(identity)) {
    return ['Income document strategy', 'Flexible lender programs', 'Business financial review'];
  }
  if (/purchase|home|buyer/.test(identity)) {
    return ['Down payment planning', 'Fixed and variable comparison', 'Closing-cost preparation'];
  }
  const title = item.title || item.label || 'Mortgage';
  return [`${title} strategy review`, 'Suitable lender comparison', 'Clear application milestones'];
}

export const SERVICE_BENEFIT_FIELDS = ['benefit_0', 'benefit_1', 'benefit_2'];

export function serviceBenefitsMaterialized(item = {}) {
  return SERVICE_BENEFIT_FIELDS.some(
    (key) => Object.prototype.hasOwnProperty.call(item, key),
  );
}

export function serviceBenefitsPersisted(item = {}) {
  return serviceBenefitsMaterialized(item);
}

export function resolveServiceBenefits(item = {}) {
  const fallback = serviceBenefits(item);
  if (serviceBenefitsMaterialized(item)) {
    return SERVICE_BENEFIT_FIELDS.map((key) => String(item[key] ?? ''));
  }
  return fallback;
}

export function withServiceBenefitPatch(item = {}, itemField = '', value = '') {
  if (!/^benefit_[0-2]$/.test(itemField)) {
    return { [itemField]: value };
  }
  const next = { ...item };
  if (!serviceBenefitsMaterialized(item)) {
    resolveServiceBenefits(item).forEach((benefit, index) => {
      next[`benefit_${index}`] = benefit;
    });
  }
  next[itemField] = value;
  return {
    benefit_0: next.benefit_0 ?? '',
    benefit_1: next.benefit_1 ?? '',
    benefit_2: next.benefit_2 ?? '',
  };
}
