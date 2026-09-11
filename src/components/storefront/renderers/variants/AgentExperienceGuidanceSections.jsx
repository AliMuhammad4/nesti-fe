'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, ChevronDown, Compass, Gem, HeartHandshake, MapPin, TrendingUp } from 'lucide-react';

const VARIANTS = {
  classic: { icon: Compass, eyebrow: 'Your move, organized', heading: 'A trusted process from first call to closing', tone: 'border-primary/30 bg-white', accent: 'text-primary', pill: 'bg-primary/10 text-primary', iconPill: 'bg-accent/10 text-accent' },
  luxury: { icon: Gem, eyebrow: 'Private client journey', heading: 'A considered process, tailored to your brief', tone: 'border-amber-200 bg-[#fffaf1]', accent: 'text-amber-700', pill: 'bg-amber-100 text-amber-800' },
  firstHome: { icon: HeartHandshake, eyebrow: 'First-home roadmap', heading: 'Simple answers for every new step', tone: 'border-sky-200 bg-white', accent: 'text-sky-700', pill: 'bg-sky-50 text-sky-700' },
  seller: { icon: TrendingUp, eyebrow: 'Seller launch plan', heading: 'From preparation to the right offer', tone: 'border-rose-200 bg-white', accent: 'text-rose-700', pill: 'bg-rose-50 text-rose-700' },
  community: { icon: MapPin, eyebrow: 'Local move guide', heading: 'A neighborhood-first plan for your move', tone: 'border-sky-200 bg-white', accent: 'text-sky-600', pill: 'bg-sky-50 text-sky-700' },
  investor: { icon: BarChart3, eyebrow: 'Underwriting process', heading: 'From criteria to closed acquisition', tone: 'border-slate-300 bg-white', accent: 'text-slate-700', pill: 'bg-slate-100 text-slate-800' },
};

function normalizeSteps(items = []) {
  return (items || []).map((item, index) => ({
    ...(typeof item === 'object' && item ? item : {}),
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
  const builderSelection = profile?.storefront_builder_selection;
  const selectedFaqIndex = (() => {
    if (!profile?.storefront_builder_preview || builderSelection?.collection !== 'faqs') return -1;
    if (builderSelection.itemId) {
      const byId = faqs.findIndex((faq) => faq.id === builderSelection.itemId);
      if (byId >= 0) return byId;
    }
    const byIndex = Number(builderSelection.itemIndex);
    return Number.isInteger(byIndex) && byIndex >= 0 && byIndex < faqs.length ? byIndex : -1;
  })();

  // Builder click-capture selects FAQ fields without firing accordion toggles.
  // Keep the selected FAQ expanded so question + answer stay visible while editing.
  useEffect(() => {
    if (selectedFaqIndex < 0) return;
    setOpen(selectedFaqIndex);
  }, [selectedFaqIndex]);
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
                  const expanded = open === index || selectedFaqIndex === index;
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

  // Shared builder-edit markers so every layout below stays inspectable.
  const stepProps = (step, index, field) => ({
    'data-storefront-field': 'content.steps',
    'data-storefront-source': hasPersistedSteps ? 'persisted' : 'fallback',
    'data-storefront-collection': 'steps',
    'data-storefront-item-id': step.id,
    'data-storefront-item-index': index,
    'data-storefront-item-field': field,
    'data-storefront-label': `Guidance step ${index + 1}${field === 'text' ? ' detail' : ''}`,
  });
  const faqProps = (faq, index, field) => ({
    'data-storefront-field': 'content.faqs',
    'data-storefront-source': hasPersistedFaqs ? 'persisted' : 'fallback',
    'data-storefront-collection': 'faqs',
    'data-storefront-item-id': faq.id,
    'data-storefront-item-index': index,
    'data-storefront-item-field': field,
    'data-storefront-label': `FAQ ${index + 1}${field === 'a' ? ' answer' : ''}`,
  });
  const headProps = (field, label) => ({
    'data-storefront-field': `content.${field}`,
    'data-storefront-source': content[field] ? 'persisted' : 'fallback',
    'data-storefront-label': label,
  });
  const eyebrow = content.eyebrow || design.eyebrow;

  const accordion = (itemClass, itemStyle) => faqs.map((faq, index) => {
    const expanded = open === index || selectedFaqIndex === index;
    return (
      <button key={faq.id} type="button" onClick={() => setOpen(expanded ? -1 : index)} className={itemClass} style={itemStyle}>
        <span {...faqProps(faq, index, 'q')} className="flex items-center justify-between gap-4 text-sm font-semibold text-text-heading">
          {faq.q}
          <ChevronDown size={15} className={`shrink-0 transition ${expanded ? 'rotate-180' : ''}`} />
        </span>
        {expanded ? (
          <span {...faqProps(faq, index, 'a')} className="mt-2 block pr-5 text-xs leading-5 text-text-muted">{faq.a}</span>
        ) : null}
      </button>
    );
  });

  // LUXURY — centered editorial column, serif headings, hairline gold rules.
  if (variant === 'luxury') {
    const luxuryBorder = 'color-mix(in srgb, var(--storefront-accent) 56%, transparent)';
    const luxuryDivider = 'color-mix(in srgb, var(--storefront-accent) 42%, transparent)';
    const luxuryCardBorder = 'color-mix(in srgb, var(--storefront-accent) 50%, transparent)';
    return (
      <section id="guidance" className="px-2 py-4 sm:px-4 sm:py-5 lg:px-6 xl:px-8">
        <div className="mx-auto w-full max-w-none overflow-hidden rounded-[1.25rem] border border-[#8a6f4c]/30 bg-[radial-gradient(circle_at_top,rgba(176,141,96,0.1),rgba(10,9,8,0.96)_36%),linear-gradient(160deg,rgba(22,20,18,0.97),rgba(10,9,8,0.98))] shadow-[0_16px_44px_rgba(0,0,0,0.38)]" style={{ borderColor: luxuryBorder }}>
          <div className="relative border-b border-[#8a6f4c]/28 px-4 py-5 text-center sm:px-6 sm:py-6 lg:px-8" style={{ borderBottomColor: luxuryDivider }}>
            <div className="pointer-events-none absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
            <span className="relative mx-auto inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/45 bg-black/35 text-accent">
              <Icon size={12} />
            </span>
            <p {...headProps('eyebrow', 'Guidance eyebrow')} className="mt-3 text-[8px] font-bold uppercase tracking-[0.24em] text-accent/90">{eyebrow}</p>
            <h2 {...headProps('heading', 'Guidance heading')} className="mt-2 font-serif text-[1.8rem] leading-tight tracking-tight text-[#f5f1e8] sm:text-[2rem]">{heading}</h2>
            <p {...headProps('body', 'Guidance description')} className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#e8e0d0]/76">{body}</p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.18fr_0.82fr]">
            <div className="px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <article
                    key={step.id}
                    data-storefront-anim-item="true"
                    className="group relative grid gap-2.5 overflow-hidden rounded-lg border border-[#8a6f4c]/30 bg-white/[0.015] p-2.5 transition duration-300 hover:border-[#8a6f4c]/50 hover:bg-white/[0.03] sm:grid-cols-[3.1rem_1fr_auto] sm:items-start sm:gap-3 sm:p-3"
                    style={{ borderColor: luxuryCardBorder }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <p className="font-serif text-xl leading-none tabular-nums text-accent/72 sm:pt-0.5">{String(index + 1).padStart(2, '0')}</p>
                    <div>
                      <h3 {...stepProps(step, index, 'title')} className="font-serif text-lg leading-tight text-[#f7f3ea]">{step.title}</h3>
                      <p {...stepProps(step, index, 'text')} className="mt-1 text-[12px] leading-5 text-[#ede5d8]/74">{step.text}</p>
                    </div>
                    <ArrowRight size={14} className="hidden shrink-0 text-accent/60 transition group-hover:translate-x-0.5 group-hover:text-accent sm:block" />
                  </article>
                ))}
              </div>
            </div>

            <div className="border-t border-[#8a6f4c]/26 bg-black/18 px-3 py-3 sm:px-5 sm:py-4 lg:border-l lg:border-t-0 lg:px-5 lg:py-5" style={{ borderTopColor: luxuryDivider, borderLeftColor: luxuryDivider }}>
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-accent/90">Questions, answered</p>
              <div className="mt-3 space-y-1.5">
                {accordion('w-full rounded-md border border-[#8a6f4c]/28 bg-black/28 px-3 py-2 text-left transition hover:border-[#8a6f4c]/45 hover:bg-black/35', { borderColor: luxuryCardBorder })}
              </div>
              <div className="mt-3 rounded-md border border-[#8a6f4c]/28 bg-white/[0.025] px-3 py-2 text-[10px] font-semibold text-[#ede5d8]/80" style={{ borderColor: luxuryCardBorder }}>
                Your questions stay connected to your next conversation.
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // FIRST HOME — bright GreenVilla-inspired buyer roadmap.
  if (variant === 'firstHome') {
    return (
      <section id="guidance" className="w-full px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:px-16">
        <div className="w-full max-w-none">
          <div className="mx-auto max-w-4xl text-center">
            <span className="mx-auto block h-px w-16 bg-accent" />
            <p {...headProps('eyebrow', 'Guidance eyebrow')} className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
            <h2 {...headProps('heading', 'Guidance heading')} className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#102f1b] sm:text-5xl">{heading}</h2>
            <p {...headProps('body', 'Guidance description')} className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#102f1b]/62 sm:text-base">{body}</p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.id} data-storefront-anim-item="true" className="relative rounded bg-white px-6 py-8 text-left shadow-[0_16px_42px_rgba(11,61,32,.08)] ring-1 ring-[#5bd36d]/25 transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(11,61,32,.14)] sm:px-8 sm:py-10">
                <h3 {...stepProps(step, index, 'title')} className="text-lg font-semibold text-[#102f1b]">{step.title}</h3>
                <p {...stepProps(step, index, 'text')} className="mt-3 text-xs leading-6 text-[#102f1b]/58">{step.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 w-full border-t border-[#5bd36d]/30 pt-8">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">Common first-home questions</p>
            <div className="mt-5 space-y-2">
              {accordion('w-full rounded border-0 bg-white px-5 py-4 text-left text-[#102f1b] shadow-[0_8px_24px_rgba(11,61,32,.06)] ring-1 ring-[#5bd36d]/20 transition hover:bg-[#f7fcf8]')}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SELLER — descending funnel: each stage narrows toward the offer.
  if (variant === 'seller') {
    const forceMobilePreview = Boolean(
      profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'mobile',
    );
    const forceTabletPreview = Boolean(
      profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'tablet',
    );
    return (
      <section id="guidance" className="w-full px-5 py-12 sm:px-8 sm:py-14 lg:px-12 2xl:px-16">
        <div className="w-full max-w-none">
          <div className="mx-auto max-w-4xl text-center">
            <p {...headProps('eyebrow', 'Guidance eyebrow')} className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
            <h2 {...headProps('heading', 'Guidance heading')} className="mt-2 text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">{heading}</h2>
            <p {...headProps('body', 'Guidance description')} className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-text-muted">{body}</p>
          </div>

          <div className={`mt-10 grid gap-4 ${forceMobilePreview ? 'grid-cols-1' : forceTabletPreview ? 'grid-cols-2' : 'md:grid-cols-3'}`}>
            {steps.map((step, index) => (
              <article
                key={step.id}
                data-storefront-anim-item="true"
                className="rounded-2xl border border-primary/15 bg-white p-6 shadow-[0_12px_30px_rgba(15,118,110,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TrendingUp size={16} />
                  </span>
                  <h3 {...stepProps(step, index, 'title')} className="text-base font-bold text-text-heading">{step.title}</h3>
                </div>
                <p {...stepProps(step, index, 'text')} className="mt-2 text-sm leading-6 text-text-muted">{step.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 w-full rounded-2xl border border-primary/15 bg-white p-6 shadow-[0_10px_26px_rgba(15,118,110,0.07)] sm:p-8">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Seller FAQs</p>
            <div className="mt-5 grid w-full gap-2">
              {faqs.map((faq, index) => {
                const expanded = open === index || selectedFaqIndex === index;
                return (
                  <button key={faq.id} type="button" onClick={() => setOpen(expanded ? -1 : index)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-primary/40">
                    <span {...faqProps(faq, index, 'q')} className="flex items-center justify-between gap-4 text-sm font-semibold text-text-heading">
                      {faq.q}
                      <ChevronDown size={15} className={`shrink-0 text-primary transition ${expanded ? 'rotate-180' : ''}`} />
                    </span>
                    {expanded ? <span {...faqProps(faq, index, 'a')} className="mt-2 block pr-5 text-xs leading-5 text-text-muted">{faq.a}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // COMMUNITY — pinned map cards on a tinted board.
  if (variant === 'community') {
    const layout = block?.data?.layout || profile?.storefront_section_layout || {};
    const style = block?.data?.style || profile?.storefront_section_style || {};
    const forceMobilePreview = profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'mobile';
    const forceTabletPreview = profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'tablet';
    const columns = String(layout.columns || '3');
    const gridClass = forceMobilePreview
      ? 'grid-cols-1'
      : forceTabletPreview
        ? 'grid-cols-2'
        : ({ 1: 'grid-cols-1', 2: 'sm:grid-cols-2', 3: 'md:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[columns] || 'md:grid-cols-3');
    const widthClass = { narrow: 'max-w-5xl', contained: 'max-w-6xl', full: 'max-w-none' }[layout.width || 'contained'] || 'max-w-6xl';
    const paddingClass = { none: 'py-0', small: 'py-6', medium: 'py-10 sm:py-12', large: 'py-12 sm:py-14' }[layout.padding || 'medium'] || 'py-10 sm:py-12';
    const alignmentClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[layout.alignment || 'left'] || 'text-left';
    const radius = { none: 0, small: 12, default: 20, medium: 24, large: 32, full: 40 }[style.radius || 'large'] ?? 32;
    const shadow = {
      none: 'none',
      small: '0 8px 24px rgba(15,23,42,.08)',
      medium: '0 18px 48px rgba(15,23,42,.12)',
      large: '0 22px 55px rgba(15,23,42,.16)',
    }[style.shadow || 'medium'] || '0 18px 48px rgba(15,23,42,.12)';
    const cardClass = {
      flat: 'border-transparent shadow-none',
      bordered: 'border-primary/15 bg-white',
      elevated: 'border-transparent bg-white shadow-[0_16px_34px_rgba(15,23,42,.1)]',
      glass: 'border-white/60 bg-white/75 backdrop-blur-md',
    }[layout.cardStyle || 'bordered'] || 'border-primary/15 bg-white';
    return (
      <section id="guidance" className={`px-4 sm:px-8 ${paddingClass}`} style={{ color: style.textColor || undefined }}>
        <div
          className={`mx-auto overflow-hidden border ${widthClass}`}
          style={{
            background: style.background || 'var(--storefront-canvas, #ffffff)',
            borderColor: style.borderColor || 'color-mix(in srgb, var(--storefront-primary, #17152b) 14%, #dbe3f5)',
            borderRadius: radius,
            boxShadow: shadow,
          }}
        >
          <div
            className={`grid gap-6 border-b p-7 sm:p-9 ${forceMobilePreview ? 'grid-cols-1' : forceTabletPreview ? 'grid-cols-1' : 'lg:grid-cols-[1fr_1.2fr] lg:items-end'} ${alignmentClass}`}
            style={{
              background: 'color-mix(in srgb, var(--storefront-canvas, #ffffff) 94%, var(--storefront-primary, #172554))',
              borderColor: 'color-mix(in srgb, var(--storefront-primary, #172554) 14%, transparent)',
            }}
          >
            <div>
              <p {...headProps('eyebrow', 'Guidance eyebrow')} className="inline-flex rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary-contrast">{eyebrow}</p>
              <h2 {...headProps('heading', 'Guidance heading')} className={`mt-3 text-3xl font-bold tracking-[-.03em] ${style.textColor ? 'text-current' : 'text-text-heading'}`}>{heading}</h2>
            </div>
            <p {...headProps('body', 'Guidance description')} className={`max-w-xl text-sm leading-6 ${style.textColor ? 'text-current opacity-75' : 'text-text-muted'}`}>{body}</p>
          </div>

          <div className={`grid gap-4 p-6 sm:p-9 ${gridClass}`}>
            {steps.map((step, index) => (
              <article
                key={step.id}
                data-storefront-anim-item="true"
                className={`group relative border p-5 transition duration-300 hover:-translate-y-1 ${cardClass}`}
                style={{ background: step.background || undefined, color: step.text_color || undefined, borderRadius: Math.min(radius, 20) }}
              >
                <h3 {...stepProps(step, index, 'title')} className={`text-sm font-bold ${step.text_color ? 'text-current' : 'text-slate-900'}`}>{step.title}</h3>
                <p {...stepProps(step, index, 'text')} className={`mt-2 text-xs leading-5 ${step.text_color ? 'text-current opacity-75' : 'text-slate-600'}`}>{step.text}</p>
                <span className="absolute inset-x-5 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
              </article>
            ))}
          </div>

          <div
            className="border-t p-6 sm:p-9"
            style={{
              background: 'color-mix(in srgb, var(--storefront-canvas, #ffffff) 92%, var(--storefront-primary, #172554))',
              borderColor: 'color-mix(in srgb, var(--storefront-primary, #172554) 12%, transparent)',
            }}
          >
            <p
              {...headProps('faq_label', 'FAQ label')}
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent"
            >
              {content.faq_label || 'Ask a local'}
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {accordion('w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-primary/25 hover:shadow-md')}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // INVESTOR — dense underwriting ledger.
  if (variant === 'investor') {
    return (
      <section id="guidance" className="px-4 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl border border-slate-200 bg-white">
          <div className="border-b-2 border-slate-900 p-6 sm:p-8">
            <Icon size={20} className="text-slate-700" />
            <p {...headProps('eyebrow', 'Guidance eyebrow')} className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
            <h2 {...headProps('heading', 'Guidance heading')} className="mt-2 text-2xl font-bold uppercase tracking-[0.04em] text-text-heading sm:text-3xl">{heading}</h2>
            <p {...headProps('body', 'Guidance description')} className="mt-3 max-w-3xl text-sm leading-6 text-text-muted">{body}</p>
          </div>

          <div className="divide-y divide-slate-200">
            {steps.map((step, index) => (
              <article key={step.id} data-storefront-anim-item="true" className="grid gap-3 p-5 sm:grid-cols-[4rem_14rem_1fr] sm:items-baseline sm:gap-6 sm:p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                <h3 {...stepProps(step, index, 'title')} className="text-sm font-bold uppercase tracking-[0.04em] text-text-heading">{step.title}</h3>
                <p {...stepProps(step, index, 'text')} className="text-xs leading-6 text-text-muted">{step.text}</p>
              </article>
            ))}
          </div>

          <div className="border-t-2 border-slate-900 p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Diligence notes</p>
            <div className="mt-4 space-y-1.5">
              {accordion('w-full border border-slate-200 bg-slate-50/60 px-4 py-3 text-left')}
            </div>
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
            <p {...headProps('eyebrow', 'Guidance eyebrow')} className={`mt-5 text-[10px] font-bold uppercase tracking-[0.24em] ${design.accent}`}>{eyebrow}</p>
            <h2 {...headProps('heading', 'Guidance heading')} className="mt-3 text-3xl font-bold tracking-tight text-text-heading">{heading}</h2>
            <p {...headProps('body', 'Guidance description')} className="mt-4 text-sm leading-6 text-text-muted">{body}</p>
            <div className="mt-7 space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} data-storefront-anim-item="true" className="flex gap-3">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${design.pill}`}>0{index + 1}</span>
                  <div>
                    <h3 {...stepProps(step, index, 'title')} className="text-sm font-bold text-text-heading">{step.title}</h3>
                    <p {...stepProps(step, index, 'text')} className="mt-1 text-xs leading-5 text-text-muted">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 sm:p-7">
            <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${design.accent}`}>Questions, answered</p>
            <div className="mt-4 space-y-2">
              {accordion('w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left')}
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
export function InvestorGuidanceSection(props) { return <Guidance {...props} variant="investor" />; }
