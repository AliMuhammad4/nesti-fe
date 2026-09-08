import { block, brand, T } from '../shared/blockFactory';
import { RENEWAL_PALETTE as P } from '../../renderers/variants/broker/renewal/brokerRenewalPalette';

/**
 * Free / default broker template (10 layers only).
 * Palette: charcoal + luminous gold — distinct from Lead navy/blue and First Home navy.
 */
const mortgageBrokerRenewal = {
  id: 'mortgage_broker-renewal',
  role: 'mortgage_broker',
  experience: 'classic-balanced',
  label: 'Renewal Expert',
  tagline: 'Renewal and refinance conversion page',
  description: 'Urgency-aware renewal funnel with guidance, proof, and clear CTAs.',
  features: [
    'Renewal focus',
    'Advisor about',
    'Programs & services',
    'Client proof',
    'FAQ & CTA',
  ],
  free: true,
  brand: brand(P.primary, P.accent, 'Manrope', 'rounded', 'minimal', P.page),
  blocks: (ctx) => [
    block(T.HERO, {
      heading: ctx.headline || 'Don’t renew on autopilot',
      body: ctx.tagline || 'Compare renewal offers, refinance options, and break costs before you sign.',
      primary_cta_label: 'Review my renewal',
      cta_label: 'Book a consultation',
      secondary_cta_label: 'Book a consultation',
      join_label: 'Join Nesti',
      eyebrow: 'Renewal specialist',
    }, {
      bg: 'transparent',
      color: P.ink,
      padding: 'large',
      mediaPosition: 'background',
      variant: 'minimal',
      width: 'full',
    }),
    block(T.PRACTICE_SNAPSHOT, {
      eyebrow: 'Advisor snapshot',
      heading: 'Renewal guidance shaped around your maturity date',
      body: 'A concise view of financing specialties, service markets, and consultation languages.',
      practice_focus_label: 'Renewal focus',
      practice_focus_subtitle: 'Financing areas supported',
      markets_label: 'Markets served',
      markets_subtitle: 'Service areas and communities',
      languages_label: 'Languages spoken',
      languages_subtitle: 'Consultation accessibility',
    }, {
      bg: 'transparent',
      color: P.ink,
      padding: 'medium',
      columns: '3',
    }),
    block(T.MORTGAGE_PROGRAMS, {
      eyebrow: 'Renewal pathways',
      heading: 'Options before your term ends',
      body: 'Renew, refinance, or switch with a clear view of payments, penalties, and timing.',
      items: [
        { id: 'program-renewal', title: 'Same-lender renewal', description: 'Review the offer against today’s market before you accept.', icon: 'target' },
        { id: 'program-refinance', title: 'Refinance', description: 'Improve rate, access equity, or reshape payments when a switch makes sense.', icon: 'percent' },
        { id: 'program-switch', title: 'Lender switch', description: 'Compare portable and switch options when another lender is stronger.', icon: 'building' },
        { id: 'program-early', title: 'Early renewal', description: 'Lock a rate ahead of maturity when the timing works for your file.', icon: 'shield' },
      ],
    }, {
      bg: 'transparent',
      color: P.ink,
      padding: 'large',
      columns: '2',
    }),
    block(T.SERVICES, {
      eyebrow: 'Renewal playbook',
      heading: 'What we review before you sign',
      body: 'Offer review, switch analysis, and timing advice so you renew with confidence.',
      items: [
        { id: 'service-offer', title: 'Offer review', description: 'Break down rate, term, penalties, and conditions on your renewal letter.', icon: 'home' },
        { id: 'service-compare', title: 'Market comparison', description: 'Compare your offer with competitive lender options for your profile.', icon: 'building' },
        { id: 'service-timing', title: 'Timing strategy', description: 'Plan early renewal, rate holds, and maturity-date next steps.', icon: 'target' },
        { id: 'service-docs', title: 'File preparation', description: 'Gather income and property documents so a switch stays smooth.', icon: 'shield' },
      ],
    }, {
      bg: 'transparent',
      color: P.ink,
      padding: 'large',
      columns: '2',
    }),
    block(T.ABOUT, {
      eyebrow: 'Your renewal advisor',
      heading: 'Clear advice before you sign another term',
      body: ctx.about || 'I help homeowners review renewal letters, compare refinance options, and choose timing with confidence—so you never renew on autopilot.',
    }, {
      bg: 'transparent',
      color: P.ink,
      padding: 'large',
      columns: '2',
    }),
    block(T.GUIDANCE, {
      eyebrow: 'What to prepare',
      heading: 'A simple checklist before maturity',
      body: 'Documents and timelines that keep renewal or refinance decisions on track.',
      steps: [
        { id: 'step-letter', title: 'Gather your renewal letter', description: 'Have the offer, rate, term, and maturity date ready to review.' },
        { id: 'step-costs', title: 'Check break costs', description: 'Understand penalties and fees before deciding to stay or switch.' },
        { id: 'step-compare', title: 'Compare options', description: 'Review renew, refinance, and switch paths side by side.' },
        { id: 'step-decide', title: 'Choose with a plan', description: 'Lock timing and next steps before your maturity date.' },
      ],
    }, {
      bg: 'transparent',
      color: P.ink,
      padding: 'large',
      columns: '2',
    }),
    block(T.TESTIMONIALS, {
      eyebrow: 'Client feedback',
      heading: 'Renewals that saved money',
      body: 'Clients who renegotiated with clearer terms and better payment comfort.',
    }, {
      bg: 'transparent',
      color: P.ink,
      padding: 'large',
      columns: '3',
    }),
    block(T.FAQ, {
      eyebrow: 'Common renewal questions',
      heading: 'Answers before your maturity date',
      body: 'Start with the questions most homeowners ask about renewals and refinancing.',
      faqs: [
        { id: 'faq-accept', q: 'Should I accept my lender’s renewal offer?', a: 'Not automatically. Compare the rate, term, penalties, and flexibility against other options first.' },
        { id: 'faq-penalty', q: 'What if I want to switch lenders?', a: 'A switch can make sense when savings outweigh break costs. We review both sides before you commit.' },
        { id: 'faq-timing', q: 'When should I start reviewing?', a: 'Most homeowners benefit from a review 3–6 months before maturity so there is time to compare and prepare.' },
        { id: 'faq-docs', q: 'What documents do I need?', a: 'Typically income proof, property details, and your current mortgage statement or renewal letter.' },
      ],
    }, {
      bg: 'transparent',
      color: P.ink,
      padding: 'large',
      columns: '1',
    }),
    block(T.CTA, {
      eyebrow: 'Ready to compare',
      heading: 'Send your renewal letter',
      body: 'We’ll compare it against better market options and outline a clear next step.',
      cta_label: 'Upload my offer',
      secondary_cta_label: 'Book a consultation',
    }, {
      bg: P.primary,
      color: P.white,
      padding: 'large',
    }),
    block(T.FOOTER, {
      heading: ctx.name || 'Mortgage advisor',
      body: ctx.tagline || 'Clear renewal and refinance guidance before you sign.',
      items: [
        { id: 'footer-programs', label: 'Programs', target: '#programs' },
        { id: 'footer-about', label: 'About', target: '#about' },
        { id: 'footer-reviews', label: 'Reviews', target: '#reviews' },
        { id: 'footer-faq', label: 'FAQ', target: '#faq' },
        { id: 'footer-contact', label: 'Contact', target: '/contact' },
      ],
    }, {
      bg: P.footer,
      color: P.white,
      padding: 'medium',
    }),
  ],
};

export default mortgageBrokerRenewal;
