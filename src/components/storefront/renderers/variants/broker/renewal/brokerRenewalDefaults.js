import { STOREFRONT_BLOCK_TYPES as T } from '../../../../storefrontPresets';

export const RENEWAL_PROGRAM_ITEMS = Object.freeze([
  { id: 'program-renewal', title: 'Same-lender renewal', description: 'Review the offer against today’s market before you accept.', icon: 'target' },
  { id: 'program-refinance', title: 'Refinance', description: 'Improve rate, access equity, or reshape payments when a switch makes sense.', icon: 'percent' },
  { id: 'program-switch', title: 'Lender switch', description: 'Compare portable and switch options when another lender is stronger.', icon: 'building' },
  { id: 'program-early', title: 'Early renewal', description: 'Lock a rate ahead of maturity when the timing works for your file.', icon: 'shield' },
]);

export const RENEWAL_SERVICE_ITEMS = Object.freeze([
  { id: 'service-offer', title: 'Offer review', description: 'Break down rate, term, penalties, and conditions on your renewal letter.', icon: 'home' },
  { id: 'service-compare', title: 'Market comparison', description: 'Compare your offer with competitive lender options for your profile.', icon: 'building' },
  { id: 'service-timing', title: 'Timing strategy', description: 'Plan early renewal, rate holds, and maturity-date next steps.', icon: 'target' },
  { id: 'service-docs', title: 'File preparation', description: 'Gather income and property documents so a switch stays smooth.', icon: 'shield' },
]);

export const RENEWAL_GUIDANCE_STEPS = Object.freeze([
  { id: 'step-letter', title: 'Gather your renewal letter', description: 'Have the offer, rate, term, and maturity date ready to review.' },
  { id: 'step-costs', title: 'Check break costs', description: 'Understand penalties and fees before deciding to stay or switch.' },
  { id: 'step-compare', title: 'Compare options', description: 'Review renew, refinance, and switch paths side by side.' },
  { id: 'step-decide', title: 'Choose with a plan', description: 'Lock timing and next steps before your maturity date.' },
]);

export const RENEWAL_FAQS = Object.freeze([
  { id: 'faq-accept', q: 'Should I accept my lender’s renewal offer?', a: 'Not automatically. Compare the rate, term, penalties, and flexibility against other options first.' },
  { id: 'faq-penalty', q: 'What if I want to switch lenders?', a: 'A switch can make sense when savings outweigh break costs. We review both sides before you commit.' },
  { id: 'faq-timing', q: 'When should I start reviewing?', a: 'Most homeowners benefit from a review 3–6 months before maturity so there is time to compare and prepare.' },
  { id: 'faq-docs', q: 'What documents do I need?', a: 'Typically income proof, property details, and your current mortgage statement or renewal letter.' },
]);

export const RENEWAL_FOOTER_ITEMS = Object.freeze([
  { id: 'footer-programs', label: 'Programs', target: '#programs' },
  { id: 'footer-about', label: 'About', target: '#about' },
  { id: 'footer-reviews', label: 'Reviews', target: '#reviews' },
  { id: 'footer-faq', label: 'FAQ', target: '#faq' },
  { id: 'footer-contact', label: 'Contact', target: '/contact' },
]);

export function brokerRenewalCollectionFallback(blockType, collection = 'items') {
  if (blockType === T.MORTGAGE_PROGRAMS && collection === 'items') return [...RENEWAL_PROGRAM_ITEMS];
  if (blockType === T.SERVICES && (collection === 'items' || collection === 'services')) {
    return [...RENEWAL_SERVICE_ITEMS];
  }
  if (blockType === T.GUIDANCE && collection === 'steps') return [...RENEWAL_GUIDANCE_STEPS];
  if (blockType === T.FAQ && collection === 'faqs') return [...RENEWAL_FAQS];
  if (blockType === T.FOOTER && collection === 'items') return [...RENEWAL_FOOTER_ITEMS];
  return null;
}
