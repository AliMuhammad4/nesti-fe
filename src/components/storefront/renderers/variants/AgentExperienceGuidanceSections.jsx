'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, Compass, Gem, HeartHandshake, MapPin, TrendingUp } from 'lucide-react';

const VARIANTS = {
  classic: { icon: Compass, eyebrow: 'Your move, organized', heading: 'A trusted process from first call to closing', tone: 'border-primary/30 bg-white', accent: 'text-primary', pill: 'bg-primary/10 text-primary', iconPill: 'bg-accent/10 text-accent' },
  luxury: { icon: Gem, eyebrow: 'Private client journey', heading: 'A considered process, tailored to your brief', tone: 'border-amber-200 bg-[#fffaf1]', accent: 'text-amber-700', pill: 'bg-amber-100 text-amber-800' },
  firstHome: { icon: HeartHandshake, eyebrow: 'First-home roadmap', heading: 'Simple answers for every new step', tone: 'border-sky-200 bg-white', accent: 'text-sky-700', pill: 'bg-sky-50 text-sky-700' },
  seller: { icon: TrendingUp, eyebrow: 'Seller launch plan', heading: 'From preparation to the right offer', tone: 'border-rose-200 bg-white', accent: 'text-rose-700', pill: 'bg-rose-50 text-rose-700' },
  community: { icon: MapPin, eyebrow: 'Local move guide', heading: 'A neighborhood-first plan for your move', tone: 'border-emerald-200 bg-white', accent: 'text-emerald-700', pill: 'bg-emerald-50 text-emerald-700' },
};

function normalizeSteps(items = []) {
  return (items || []).map((item, index) => ({
    id: item?.id || `step-${index}`,
    title: typeof item === 'string' ? item.split('|')[0] : item?.title,
    text: typeof item === 'string' ? item.split('|')[1] : item?.text,
  })).filter((item) => item.title);
}

function normalizeFaqs(items = []) {
  return (items || []).map((item, index) => ({
    id: item?.id || `faq-${index}`,
    q: typeof item === 'string' ? item.split('|')[0] : item?.q,
    a: typeof item === 'string' ? item.split('|')[1] : item?.a,
  })).filter((item) => item.q);
}

function Guidance({ profile, block, variant }) {
  const [open, setOpen] = useState(0);
  const content = block?.data?.content || profile?.storefront_section_content || {};
  const design = VARIANTS[variant];
  const Icon = design.icon;
  const steps = normalizeSteps(content.steps);
  const faqs = normalizeFaqs(content.faqs);
  const heading = content.heading || design.heading;
  const body = content.body || 'A clear, supportive path with the context you need for a confident next step.';
  const hasPersistedSteps = Array.isArray(content.steps);
  const hasPersistedFaqs = Array.isArray(content.faqs);
  if (variant === 'classic') {
    const processLabel = content.process_label || 'Your advisory plan';
    const processHeading = content.process_heading || 'Three clear steps forward';
    const proofChat = content.proof_chat || 'Guided client support';
    const proofHandoff = content.proof_handoff || 'Organized professional follow-up';
    const faqLabel = content.faq_label || 'Client briefing';
    const faqHeading = content.faq_heading || 'Questions, answered clearly';
    const faqFooterTitle = content.faq_footer_title || 'Need a more specific answer?';
    const faqFooterBody = content.faq_footer_body || 'Share your goals so the next conversation starts with useful context.';
    const processStyle = {
      background: content.process_card_background || undefined,
      color: content.process_card_text_color || undefined,
    };
    const faqStyle = {
      background: content.faq_card_background || undefined,
      color: content.faq_card_text_color || undefined,
    };
    const editable = (field, persisted, label) => ({
      'data-storefront-field': `content.${field}`,
      'data-storefront-source': persisted ? 'persisted' : 'fallback',
      'data-storefront-label': label,
    });
    return (
      <section id="guidance" className="px-4 py-7 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] border border-primary/20 bg-white">
          <header className="grid gap-5 border-b border-primary/15 bg-primary/[0.045] px-5 py-5 sm:px-7 lg:grid-cols-[1fr_1.25fr] lg:items-end">
            <div>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon size={17} /></div>
              <p {...editable('eyebrow', content.eyebrow, 'Guidance eyebrow')} className="mt-3 text-[9px] font-bold uppercase tracking-[0.22em] text-primary">{content.eyebrow || design.eyebrow}</p>
              <h2 {...editable('heading', content.heading, 'Guidance heading')} className="mt-2 text-xl font-bold leading-snug tracking-tight text-text-heading sm:text-2xl">{heading}</h2>
            </div>
            <p {...editable('body', content.body, 'Guidance description')} className="max-w-2xl text-[13px] leading-6 text-text-muted lg:justify-self-end">{body}</p>
          </header>

          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            <article
              className={`border-b border-primary/15 p-5 sm:p-7 lg:border-b-0 lg:border-r ${content.process_card_text_color ? '[&_h3]:!text-current [&_h4]:!text-current [&_p]:!text-current [&_span]:!text-current' : ''}`}
              style={processStyle}
              {...editable('process_card_background', content.process_card_background, 'Process panel')}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p {...editable('process_label', content.process_label, 'Process label')} className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">{processLabel}</p>
                  <h3 {...editable('process_heading', content.process_heading, 'Process heading')} className="mt-1.5 text-base font-bold text-text-heading">{processHeading}</h3>
                </div>
                <span className="text-[10px] font-semibold text-text-muted">{String(steps.length).padStart(2, '0')} stages</span>
              </div>

              <div className="relative mt-5">
                <div className="absolute bottom-3 left-[13px] top-3 w-px bg-primary/15" />
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id} data-storefront-anim-item="true" className="relative grid grid-cols-[1.75rem_1fr] gap-3">
                      <span
                        className="relative z-10 grid h-7 w-7 place-items-center rounded-full bg-primary text-[9px] font-bold"
                        style={{
                          background: content.process_badge_background || undefined,
                          color: content.process_badge_color || 'var(--storefront-primary-contrast, #fff)',
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="pb-1">
                        <h4 data-storefront-field="content.steps" data-storefront-source={hasPersistedSteps ? 'persisted' : 'fallback'} data-storefront-collection="steps" data-storefront-item-id={step.id} data-storefront-item-index={index} data-storefront-item-field="title" data-storefront-label={`Guidance step ${index + 1}`} className="text-[13px] font-bold text-text-heading">{step.title}</h4>
                        <p data-storefront-field="content.steps" data-storefront-source={hasPersistedSteps ? 'persisted' : 'fallback'} data-storefront-collection="steps" data-storefront-item-id={step.id} data-storefront-item-index={index} data-storefront-item-field="text" data-storefront-label={`Guidance step ${index + 1} detail`} className="mt-1 text-[11px] leading-[1.15rem] text-text-muted">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <span {...editable('proof_chat', content.proof_chat, 'First process proof')} className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2 text-[10px] font-semibold text-text-heading"><CheckCircle2 size={12} className="text-primary" />{proofChat}</span>
                <span {...editable('proof_handoff', content.proof_handoff, 'Second process proof')} className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2 text-[10px] font-semibold text-text-heading"><CheckCircle2 size={12} className="text-primary" />{proofHandoff}</span>
              </div>
            </article>

            <article
              className={`bg-slate-50/50 p-5 sm:p-7 ${content.faq_card_text_color ? '[&_h3]:!text-current [&_p]:!text-current [&_span]:!text-current' : ''}`}
              style={faqStyle}
              {...editable('faq_card_background', content.faq_card_background, 'FAQ panel')}
            >
              <p {...editable('faq_label', content.faq_label, 'FAQ label')} className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">{faqLabel}</p>
              <h3 {...editable('faq_heading', content.faq_heading, 'FAQ heading')} className="mt-1.5 text-base font-bold text-text-heading">{faqHeading}</h3>
              <div className="mt-4 space-y-2">
                {faqs.map((faq, index) => {
                  const expanded = open === index;
                  return (
                    <button key={faq.id} type="button" onClick={() => setOpen(expanded ? -1 : index)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_3px_12px_rgba(15,23,42,0.035)]">
                      <span data-storefront-field="content.faqs" data-storefront-source={hasPersistedFaqs ? 'persisted' : 'fallback'} data-storefront-collection="faqs" data-storefront-item-id={faq.id} data-storefront-item-index={index} data-storefront-item-field="q" data-storefront-label={`FAQ ${index + 1}`} className="flex items-center justify-between gap-4 text-[12px] font-semibold text-text-heading">{faq.q}<ChevronDown size={14} className={`shrink-0 text-primary transition ${expanded ? 'rotate-180' : ''}`} /></span>
                      {expanded ? <span data-storefront-field="content.faqs" data-storefront-source={hasPersistedFaqs ? 'persisted' : 'fallback'} data-storefront-collection="faqs" data-storefront-item-id={faq.id} data-storefront-item-index={index} data-storefront-item-field="a" data-storefront-label={`FAQ ${index + 1} answer`} className="mt-2 block pr-5 text-[11px] leading-[1.15rem] text-text-muted">{faq.a}</span> : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.06] p-3">
                <p {...editable('faq_footer_title', content.faq_footer_title, 'FAQ footer title')} className="text-[11px] font-bold text-text-heading">{faqFooterTitle}</p>
                <p {...editable('faq_footer_body', content.faq_footer_body, 'FAQ footer description')} className="mt-1 flex items-center justify-between gap-3 text-[10px] leading-4 text-text-muted">{faqFooterBody}<ArrowRight size={13} className="shrink-0 text-primary" /></p>
              </div>
            </article>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="guidance" className="px-4 py-8 sm:px-8 sm:py-10">
      <div className={`mx-auto max-w-7xl overflow-hidden rounded-[2rem] border ${design.tone}`}>
        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-inherit p-6 sm:p-7 lg:border-b-0 lg:border-r">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${design.iconPill || design.pill}`}><Icon size={19} /></div>
            <p data-storefront-field="content.eyebrow" data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'} data-storefront-label="Guidance eyebrow" className={`mt-5 text-[10px] font-bold uppercase tracking-[0.24em] ${design.accent}`}>{content.eyebrow || design.eyebrow}</p>
            <h2 data-storefront-field="content.heading" data-storefront-source={content.heading ? 'persisted' : 'fallback'} data-storefront-label="Guidance heading" className="mt-3 text-3xl font-bold tracking-tight text-text-heading">{heading}</h2>
            <p data-storefront-field="content.body" data-storefront-source={content.body ? 'persisted' : 'fallback'} data-storefront-label="Guidance description" className="mt-4 text-sm leading-6 text-text-muted">{body}</p>
            <div className="mt-7 space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} data-storefront-anim-item="true" className="flex gap-3">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${design.pill}`}>0{index + 1}</span>
                  <div>
                    <h3 data-storefront-field="content.steps" data-storefront-source={hasPersistedSteps ? 'persisted' : 'fallback'} data-storefront-collection="steps" data-storefront-item-id={step.id} data-storefront-item-index={index} data-storefront-item-field="title" data-storefront-label={`Guidance step ${index + 1}`} className="text-sm font-bold text-text-heading">{step.title}</h3>
                    <p data-storefront-field="content.steps" data-storefront-source={hasPersistedSteps ? 'persisted' : 'fallback'} data-storefront-collection="steps" data-storefront-item-id={step.id} data-storefront-item-index={index} data-storefront-item-field="text" data-storefront-label={`Guidance step ${index + 1} detail`} className="mt-1 text-xs leading-5 text-text-muted">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 sm:p-7">
            <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${design.accent}`}>Questions, answered</p>
            <div className="mt-4 space-y-2">
              {faqs.map((faq, index) => {
                const expanded = open === index;
                return (
                  <button key={faq.id} type="button" onClick={() => setOpen(expanded ? -1 : index)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
                    <span data-storefront-field="content.faqs" data-storefront-source={hasPersistedFaqs ? 'persisted' : 'fallback'} data-storefront-collection="faqs" data-storefront-item-id={faq.id} data-storefront-item-index={index} data-storefront-item-field="q" data-storefront-label={`FAQ ${index + 1}`} className="flex items-center justify-between gap-4 text-sm font-semibold text-text-heading">{faq.q}<ChevronDown size={15} className={`shrink-0 transition ${expanded ? 'rotate-180' : ''}`} /></span>
                    {expanded ? <span data-storefront-field="content.faqs" data-storefront-source={hasPersistedFaqs ? 'persisted' : 'fallback'} data-storefront-collection="faqs" data-storefront-item-id={faq.id} data-storefront-item-index={index} data-storefront-item-field="a" data-storefront-label={`FAQ ${index + 1} answer`} className="mt-2 block pr-5 text-xs leading-5 text-text-muted">{faq.a}</span> : null}
                  </button>
                );
              })}
            </div>
            <div className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${design.pill}`}><CheckCircle2 size={14} />Your questions stay connected to your next conversation <ArrowRight size={13} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ClassicGuidanceSection(props) { return <Guidance {...props} variant="classic" />; }
export function LuxuryGuidanceSection(props) { return <Guidance {...props} variant="luxury" />; }
export function FirstHomeGuidanceSection(props) { return <Guidance {...props} variant="firstHome" />; }
export function SellerGuidanceSection(props) { return <Guidance {...props} variant="seller" />; }
export function CommunityGuidanceSection(props) { return <Guidance {...props} variant="community" />; }
