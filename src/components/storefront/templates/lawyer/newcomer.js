import { block, brand, T } from '../shared/blockFactory';
import {
  NEWCOMER_BRAND_DEFAULTS,
  NEWCOMER_DESIGN_VERSION,
} from './newcomerMigration';

const version = { newcomer_design_version: NEWCOMER_DESIGN_VERSION };

const lawyerNewcomer = {
  id: 'lawyer-newcomer',
  role: 'lawyer',
  experience: 'story-warm',
  label: 'Newcomer Home Specialist',
  tagline: 'Newcomer-friendly closing experience',
  description: 'Warm, plain-language guidance and a multilingual-ready path to closing.',
  features: ['Newcomer focus', 'Plain-language guidance', 'Client stories', 'Warm CTA'],
  free: true,
  brand: brand(
    NEWCOMER_BRAND_DEFAULTS.primary_color,
    NEWCOMER_BRAND_DEFAULTS.accent_color,
    'DM Sans',
    'pill',
    'warm',
    NEWCOMER_BRAND_DEFAULTS.page_background,
  ),
  blocks: (ctx) => [
    block(T.HERO, {
      ...version,
      heading: ctx.headline || 'Closing support for newcomers',
      body: ctx.tagline || 'Plain-language guidance on Canadian purchase closings, costs, and documents.',
      cta_label: 'Ask about my closing',
      eyebrow: 'Newcomer specialist',
    }),
    block(T.ABOUT, {
      ...version,
      eyebrow: 'A welcoming legal experience',
      heading: 'Clear answers in an unfamiliar process',
      body: ctx.about || 'Buying a home in a new country brings unfamiliar documents, deadlines, and costs. We explain each legal step in plain language so your family can move forward with confidence.',
    }),
    block(T.PRACTICE_AREAS, {
      ...version,
      eyebrow: 'Newcomer-focused support',
      heading: 'Purchase support',
      body: 'Residential closing guidance for buyers who are new to Canada.',
      items: [
        { id: 'newcomer-practice-purchase', title: 'Home purchases', description: 'Review the agreement, title, financing requirements, and closing documents with a clear explanation of what comes next.', icon: 'home' },
        { id: 'newcomer-practice-first-home', title: 'First Canadian home', description: 'Understand the legal process, key deadlines, closing funds, and responsibilities involved in your first purchase here.', icon: 'key' },
        { id: 'newcomer-practice-family', title: 'Family transitions', description: 'Coordinate ownership, signing, and closing details when family members, travel, or settlement timelines are involved.', icon: 'users' },
      ],
    }),
    block(T.SERVICES, {
      ...version,
      eyebrow: 'How we help',
      heading: 'Support from accepted offer to keys',
      body: 'A warm, organized legal process designed to make every requirement easier to understand.',
      items: [
        { id: 'newcomer-service-review', title: 'Agreement and title review', description: 'Identify the parties, property, conditions, title details, and legal obligations connected to the purchase.', icon: 'contract' },
        { id: 'newcomer-service-funds', title: 'Closing costs and funds', description: 'Explain legal fees, adjustments, land transfer tax, and when certified closing funds are needed.', icon: 'dollar' },
        { id: 'newcomer-service-signing', title: 'Documents and signing', description: 'Prepare you for identification, insurance, lender instructions, signing, registration, and key release.', icon: 'file' },
        { id: 'newcomer-service-language', title: 'Communication planning', description: 'Confirm your preferred language and the safest way to coordinate explanations, documents, and deadlines.', icon: 'message' },
      ],
    }),
    block(T.GUIDANCE, {
      ...version,
      eyebrow: 'Your closing journey',
      heading: 'Newcomer closing guide',
      body: 'ID, funds, insurance, and signing-day expectations explained one step at a time.',
      steps: [
        { id: 'newcomer-step-share', title: 'Share your offer', text: 'Send the signed agreement, amendments, contact details, and expected closing date.', icon: 'notebook' },
        { id: 'newcomer-step-prepare', title: 'Prepare the file', text: 'Confirm identification, financing, insurance, ownership names, and the source of closing funds.', icon: 'clipboard' },
        { id: 'newcomer-step-explain', title: 'Review and explain', text: 'Walk through title, adjustments, documents, costs, and any questions in clear language.', icon: 'message' },
        { id: 'newcomer-step-close', title: 'Sign and close', text: 'Complete signing, registration, funding, key release, and final reporting for your new home.', icon: 'key' },
      ],
    }),
    block(T.CREDENTIALS, {
      ...version,
      eyebrow: 'Professional standing',
      heading: 'A lawyer you can verify',
      body: 'Review current practice activity and experience before choosing support for your closing.',
    }, { columns: '4' }),
    block(T.TESTIMONIALS, {
      ...version,
      eyebrow: 'Client stories',
      heading: 'Families we helped settle',
      body: 'Newcomers who reached closing day with clearer expectations and less stress.',
    }),
    block(T.CTA, {
      ...version,
      eyebrow: 'A warm first conversation',
      heading: 'We’re ready when you are',
      body: 'Share your offer and preferred language for follow-up.',
      cta_label: 'Start consultation',
    }),
    block(T.FOOTER, {
      ...version,
      eyebrow: 'Newcomer home specialist',
      heading: ctx.company || ctx.name,
      body: 'Plain-language legal guidance for a confident Canadian home closing.',
      disclaimer: 'Do not send confidential information until the lawyer confirms representation.',
      items: [
        { id: 'newcomer-footer-about', label: 'About', target: '#about' },
        { id: 'newcomer-footer-practice', label: 'Practice areas', target: '#practice-areas' },
        { id: 'newcomer-footer-services', label: 'Services', target: '#services' },
        { id: 'newcomer-footer-guidance', label: 'Closing guide', target: '#guidance' },
        { id: 'newcomer-footer-contact', label: 'Start consultation', target: '/contact' },
      ],
    }),
  ],
};

export default lawyerNewcomer;
export { NEWCOMER_DESIGN_VERSION };
