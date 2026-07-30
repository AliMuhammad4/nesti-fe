'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, HelpCircle, LockKeyhole, MessageCircle, Sparkles } from 'lucide-react';
import { createContentItemId } from '@/components/storefront/builder/storefrontBuilderState';

const ROLE_GUIDANCE = {
  agent: {
    eyebrow: 'Client Guide',
    title: 'Know what happens before you start.',
    description: 'A simple guide to how buying, selling, property questions, showings, and consultations are handled on this profile.',
    processLabel: 'Guided process',
    processHeading: 'Three clear steps forward',
    faqLabel: 'Helpful questions',
    faqHeading: 'What clients often ask',
    proofChat: 'Guided chat support',
    proofHandoff: 'Organized professional handoff',
    faqFooterTitle: 'Need a more specific answer?',
    faqFooterBody: 'Use the chat bubble to share your goals and carry useful context into the conversation.',
    steps: [
      { title: 'Ask about buying or selling', text: 'Use the chat bubble to share your goal, preferred area, price range, property type, and timeline.' },
      { title: 'Explore available opportunities', text: 'Review seller properties, ask about matches, or inquire directly from a property card.' },
      { title: 'Get guided follow-up', text: 'Your details are organized into a lead profile so the agent can respond with useful next steps.' },
    ],
    faqs: [
      { q: 'Can I ask about a specific property?', a: 'Yes. Use the chat bubble or the property inquiry button so the property context is included.' },
      { q: 'Can sellers create an inquiry?', a: 'Yes. Seller questions collect address, price, condition, timeline, and motivation details.' },
      { q: 'Will I see matching properties?', a: 'For buyer inquiries, the assistant can surface available matches and help you choose a next step.' },
    ],
  },
  mortgage_broker: {
    eyebrow: 'Mortgage Guide',
    title: 'Understand the mortgage inquiry flow.',
    description: 'A quick guide to getting financing guidance, pre-approval support, affordability review, and broker follow-up.',
    processLabel: 'Guided process',
    processHeading: 'Three clear steps forward',
    faqLabel: 'Helpful questions',
    faqHeading: 'What clients often ask',
    proofChat: 'Guided chat support',
    proofHandoff: 'Organized professional handoff',
    faqFooterTitle: 'Need a more specific answer?',
    faqFooterBody: 'Use the chat bubble to share your goals and carry useful context into the conversation.',
    steps: [
      { title: 'Start with your financing goal', text: 'Ask about pre-approval, affordability, rates, refinancing, purchase budget, or programs.' },
      { title: 'Share basic financial context', text: 'The assistant can guide details like income range, credit score range, down payment, and timeline.' },
      { title: 'Receive broker follow-up', text: 'Your inquiry is routed with financing context so the broker can respond more efficiently.' },
    ],
    faqs: [
      { q: 'Can I get pre-approved here?', a: 'You can start the pre-approval inquiry and share the details needed for broker follow-up.' },
      { q: 'Can I ask about affordability?', a: 'Yes. Share your budget, income range, down payment, and timeline for a more useful review.' },
      { q: 'Is this a final mortgage approval?', a: 'No. This starts the guided inquiry and broker review process before formal underwriting.' },
    ],
  },
  lawyer: {
    eyebrow: 'Legal Guide',
    title: 'Start legal questions with more clarity.',
    description: 'A simple guide for transaction, contract, title, document, and closing-related legal inquiries.',
    processLabel: 'Guided process',
    processHeading: 'Three clear steps forward',
    faqLabel: 'Helpful questions',
    faqHeading: 'What clients often ask',
    proofChat: 'Guided chat support',
    proofHandoff: 'Organized professional handoff',
    faqFooterTitle: 'Need a more specific answer?',
    faqFooterBody: 'Use the chat bubble to share your goals and carry useful context into the conversation.',
    steps: [
      { title: 'Choose the legal topic', text: 'Ask about closing, contract review, title support, transaction issues, or consultation.' },
      { title: 'Share transaction context', text: 'The assistant helps collect stage, closing timeline, property value, mortgage status, and service needs.' },
      { title: 'Route securely for follow-up', text: 'Your request is organized so the lawyer can understand the matter before responding.' },
    ],
    faqs: [
      { q: 'Can I ask a legal question directly?', a: 'Yes. Start with the chat bubble and describe the transaction or document issue.' },
      { q: 'Can I request contract review?', a: 'Yes. The assistant gathers contract and transaction context for follow-up.' },
      { q: 'Is this legal advice?', a: 'No. This starts an inquiry so the lawyer can review and follow up appropriately.' },
    ],
  },
};

function normalizeSteps(rawSteps, fallbackSteps) {
  if (Array.isArray(rawSteps)) {
    return rawSteps
      .map((item, index) => {
        if (!item) return null;
        if (typeof item === 'string') {
          const [title = '', text = ''] = item.split('|').map((part) => part.trim());
          return { id: `fallback-step-${index}`, title, text };
        }
        return {
          id: item.id || `fallback-step-${index}`,
          title: item.title || '',
          text: item.text || '',
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }
  return (fallbackSteps || [])
    .map((item, index) => ({
      id: `fallback-step-${index}`,
      title: item.title || '',
      text: item.text || '',
    }))
    .slice(0, 8);
}

function normalizeFaqs(rawFaqs, fallbackFaqs) {
  if (Array.isArray(rawFaqs)) {
    return rawFaqs
      .map((item, index) => {
        if (!item) return null;
        if (typeof item === 'string') {
          const [q = '', a = ''] = item.split('|').map((part) => part.trim());
          return { id: `fallback-faq-${index}`, q, a };
        }
        return {
          id: item.id || `fallback-faq-${index}`,
          q: item.q || '',
          a: item.a || '',
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }
  return (fallbackFaqs || [])
    .map((item, index) => ({
      id: `fallback-faq-${index}`,
      q: item.q || '',
      a: item.a || '',
    }))
    .slice(0, 8);
}

/** Convert pipe-string or partial step/FAQ records into editable objects with stable ids. */
export function normalizeGuidanceCollection(collection, items = []) {
  const normalized = collection === 'steps'
    ? normalizeSteps(items, [])
    : collection === 'faqs'
      ? normalizeFaqs(items, [])
      : (Array.isArray(items) ? items : []);

  const seen = new Set();
  return normalized.map((item) => {
    if (!item?.id || !seen.has(item.id)) {
      if (item?.id) seen.add(item.id);
      return item;
    }
    const nextId = createContentItemId();
    seen.add(nextId);
    return { ...item, id: nextId };
  });
}

function pickGuidanceText(content, key, fallback, aliases = []) {
  if (Object.prototype.hasOwnProperty.call(content, key) && content[key] != null) {
    return String(content[key]);
  }
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(content, alias) && content[alias] != null) {
      return String(content[alias]);
    }
  }
  return fallback;
}

export function getGuidanceTextDefaults(professionalType = 'agent') {
  const base = ROLE_GUIDANCE[professionalType] || ROLE_GUIDANCE.agent;
  return {
    eyebrow: base.eyebrow,
    heading: base.title,
    body: base.description,
    process_label: base.processLabel,
    process_heading: base.processHeading,
    faq_label: base.faqLabel,
    faq_heading: base.faqHeading,
    proof_chat: base.proofChat,
    proof_handoff: base.proofHandoff,
    faq_footer_title: base.faqFooterTitle,
    faq_footer_body: base.faqFooterBody,
  };
}

export function buildGuidanceDefaults(professionalType = 'agent') {
  const text = getGuidanceTextDefaults(professionalType);
  const base = ROLE_GUIDANCE[professionalType] || ROLE_GUIDANCE.agent;
  return {
    ...text,
    steps: base.steps.map((step) => ({ ...step, id: createContentItemId() })),
    faqs: base.faqs.map((faq) => ({ ...faq, id: createContentItemId() })),
  };
}

/** Stable IDs matching normalizeSteps/normalizeFaqs fallbacks so first edit maps to the clicked item. */
export function getGuidanceCollectionFallback(professionalType = 'agent', collection) {
  const base = ROLE_GUIDANCE[professionalType] || ROLE_GUIDANCE.agent;
  if (collection === 'steps') {
    return base.steps.map((step, index) => ({
      id: `fallback-step-${index}`,
      title: step.title,
      text: step.text,
    }));
  }
  if (collection === 'faqs') {
    return base.faqs.map((faq, index) => ({
      id: `fallback-faq-${index}`,
      q: faq.q,
      a: faq.a,
    }));
  }
  return [];
}

export default function PublicGuidanceSection({ profile, content = {}, previewMode = 'desktop' }) {
  const [openFaq, setOpenFaq] = useState(0);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const forceMobilePreview = Boolean(isPreview && previewMode === 'mobile');
  const forceTabletPreview = Boolean(isPreview && previewMode === 'tablet');
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const sectionStyle = profile?.storefront_section_style || {};
  const sectionLayout = profile?.storefront_section_layout || {};
  const hiddenFields = Array.isArray(sectionLayout.hiddenFields) ? sectionLayout.hiddenFields : [];
  const isFieldHidden = (field) => hiddenFields.includes(field);
  const hiddenClass = (field) => {
    if (!isFieldHidden(field)) return '';
    // Keep clickable in the builder so hidden copy can be restored.
    return isPreview
      ? 'opacity-40 outline outline-dashed outline-slate-400/70 outline-offset-2'
      : 'hidden';
  };
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const base = ROLE_GUIDANCE[profile?.professional_type] || ROLE_GUIDANCE.agent;
  const hasPersistedSteps = Array.isArray(content.steps);
  const hasPersistedFaqs = Array.isArray(content.faqs);
  const steps = normalizeSteps(content.steps, base.steps);
  const faqs = normalizeFaqs(content.faqs, base.faqs);
  const resolved = {
    eyebrow: pickGuidanceText(content, 'eyebrow', base.eyebrow),
    title: pickGuidanceText(content, 'heading', base.title, ['title']),
    description: pickGuidanceText(content, 'body', base.description, ['description']),
    processLabel: pickGuidanceText(content, 'process_label', base.processLabel),
    processHeading: pickGuidanceText(content, 'process_heading', base.processHeading),
    faqLabel: pickGuidanceText(content, 'faq_label', base.faqLabel),
    faqHeading: pickGuidanceText(content, 'faq_heading', base.faqHeading),
    proofChat: pickGuidanceText(content, 'proof_chat', base.proofChat),
    proofHandoff: pickGuidanceText(content, 'proof_handoff', base.proofHandoff),
    faqFooterTitle: pickGuidanceText(content, 'faq_footer_title', base.faqFooterTitle),
    faqFooterBody: pickGuidanceText(content, 'faq_footer_body', base.faqFooterBody),
    steps,
    faqs,
  };

  const processCardBackground = content.process_card_background || '';
  const processCardTextColor = content.process_card_text_color || '';
  const faqCardBackground = content.faq_card_background || '';
  const faqCardTextColor = content.faq_card_text_color || '';
  const hasProcessCardText = Boolean(processCardTextColor);
  const hasFaqCardText = Boolean(faqCardTextColor);

  return (
    <div
      id="guide"
      className="w-full bg-transparent py-8 sm:py-10"
      style={{ color: sectionStyle.textColor || undefined }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl" data-storefront-anim-item="true">
          <p
            data-storefront-field="content.eyebrow"
            data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'eyebrow') ? 'persisted' : 'fallback'}
            data-storefront-label="Guide eyebrow"
            className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${hasCustomTextColor ? 'text-current/80' : 'text-primary'} ${hiddenClass('content.eyebrow')}`}
          >
            <Sparkles size={11} />
            {resolved.eyebrow}
          </p>
          <h2
            data-storefront-field="content.heading"
            data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'heading') || Object.prototype.hasOwnProperty.call(content, 'title') ? 'persisted' : 'fallback'}
            data-storefront-label="Guide heading"
            className={`mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl ${hasCustomTextColor ? 'text-current' : 'text-slate-900'} ${hiddenClass('content.heading')}`}
          >
            {resolved.title}
          </h2>
          <p
            data-storefront-field="content.body"
            data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'body') || Object.prototype.hasOwnProperty.call(content, 'description') ? 'persisted' : 'fallback'}
            data-storefront-label="Guide description"
            className={`mt-2 text-[13px] leading-5 ${hasCustomTextColor ? 'text-current/85' : 'text-slate-500'} ${hiddenClass('content.body')}`}
          >
            {resolved.description}
          </p>
        </div>

        <div className={`mt-6 grid gap-4 ${forceCompactPreview ? '' : 'lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]'}`}>
          <div
            data-storefront-field="content.process_card_background"
            data-storefront-source={content.process_card_background ? 'persisted' : 'fallback'}
            data-storefront-label="Process card"
            data-storefront-anim-item="true"
            data-storefront-anim-hover="lift"
            className={`rounded-2xl border border-slate-200/90 p-5 shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md sm:p-6 ${processCardBackground ? '' : 'bg-white'}`}
            style={{
              backgroundColor: processCardBackground || undefined,
              color: processCardTextColor || undefined,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  data-storefront-field="content.process_label"
                  data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'process_label') ? 'persisted' : 'fallback'}
                  data-storefront-label="Process label"
                  className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${hasProcessCardText ? 'text-current/75' : 'text-primary'} ${hiddenClass('content.process_label')}`}
                >
                  {resolved.processLabel}
                </p>
                <h3
                  data-storefront-field="content.process_heading"
                  data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'process_heading') ? 'persisted' : 'fallback'}
                  data-storefront-label="Process heading"
                  className={`mt-1 text-base font-semibold ${hasProcessCardText ? 'text-current' : 'text-slate-900'} ${hiddenClass('content.process_heading')}`}
                >
                  {resolved.processHeading}
                </h3>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 size={17} />
              </span>
            </div>

            <div className="mt-5 space-y-0">
              {resolved.steps.map((step, index) => {
                const isLast = index >= resolved.steps.length - 1;
                return (
                  <div
                    key={step.id || `${step.title}-${index}`}
                    data-storefront-field="content.steps"
                    data-storefront-source={hasPersistedSteps ? 'persisted' : 'fallback'}
                    data-storefront-collection="steps"
                    data-storefront-item-id={step.id}
                    data-storefront-item-index={index}
                    data-storefront-item-field="title"
                    data-storefront-label={`Step ${index + 1}`}
                    className="relative flex items-start gap-3.5 rounded-xl pb-5 last:pb-0 transition-colors duration-200 hover:bg-slate-50/80"
                  >
                    <div className="relative flex w-9 shrink-0 flex-col items-center">
                      {!isLast ? (
                        <span
                          aria-hidden
                          className="absolute left-1/2 top-9 bottom-0 w-px -translate-x-1/2 bg-slate-200"
                        />
                      ) : null}
                      <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold tracking-wide text-primary shadow-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div
                        data-storefront-field="content.steps"
                        data-storefront-source={hasPersistedSteps ? 'persisted' : 'fallback'}
                        data-storefront-collection="steps"
                        data-storefront-item-id={step.id}
                        data-storefront-item-index={index}
                        data-storefront-item-field="title"
                        data-storefront-label={`Step ${index + 1} title`}
                        className={`text-[13px] font-semibold leading-5 tracking-tight ${
                          hasProcessCardText ? 'text-current' : 'text-slate-900'
                        }`}
                      >
                        {step.title}
                      </div>
                      {step.text ? (
                        <p
                          data-storefront-field="content.steps"
                          data-storefront-source={hasPersistedSteps ? 'persisted' : 'fallback'}
                          data-storefront-collection="steps"
                          data-storefront-item-id={step.id}
                          data-storefront-item-index={index}
                          data-storefront-item-field="text"
                          data-storefront-label={`Step ${index + 1} description`}
                          className={`mt-1 text-[12px] leading-5 ${
                            hasProcessCardText ? 'text-current/90' : 'text-slate-500'
                          }`}
                        >
                          {step.text}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`mt-6 grid gap-2 border-t border-slate-200/80 pt-4 ${forceMobilePreview ? '' : 'sm:grid-cols-2'}`}>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5 backdrop-blur-[2px] transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
                <MessageCircle size={14} className="shrink-0 text-primary" />
                <span
                  data-storefront-field="content.proof_chat"
                  data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'proof_chat') ? 'persisted' : 'fallback'}
                  data-storefront-label="Proof chip: chat"
                  className={`text-[11px] font-medium ${hasProcessCardText ? 'text-current/80' : 'text-slate-600'} ${hiddenClass('content.proof_chat')}`}
                >
                  {resolved.proofChat}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5 backdrop-blur-[2px] transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
                <LockKeyhole size={14} className="shrink-0 text-primary" />
                <span
                  data-storefront-field="content.proof_handoff"
                  data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'proof_handoff') ? 'persisted' : 'fallback'}
                  data-storefront-label="Proof chip: handoff"
                  className={`text-[11px] font-medium ${hasProcessCardText ? 'text-current/80' : 'text-slate-600'} ${hiddenClass('content.proof_handoff')}`}
                >
                  {resolved.proofHandoff}
                </span>
              </div>
            </div>
          </div>

          <div
            data-storefront-field="content.faq_card_background"
            data-storefront-source={content.faq_card_background ? 'persisted' : 'fallback'}
            data-storefront-label="FAQ card"
            data-storefront-anim-item="true"
            data-storefront-anim-hover="lift"
            className={`rounded-xl border border-slate-200 p-5 shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md ${faqCardBackground ? '' : 'bg-white'}`}
            style={{
              backgroundColor: faqCardBackground || undefined,
              color: faqCardTextColor || undefined,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  data-storefront-field="content.faq_label"
                  data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'faq_label') ? 'persisted' : 'fallback'}
                  data-storefront-label="FAQ label"
                  className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${hasFaqCardText ? 'text-current/75' : 'text-primary'} ${hiddenClass('content.faq_label')}`}
                >
                  {resolved.faqLabel}
                </p>
                <h3
                  data-storefront-field="content.faq_heading"
                  data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'faq_heading') ? 'persisted' : 'fallback'}
                  data-storefront-label="FAQ heading"
                  className={`mt-1 text-base font-semibold ${hasFaqCardText ? 'text-current' : 'text-slate-900'} ${hiddenClass('content.faq_heading')}`}
                >
                  {resolved.faqHeading}
                </h3>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <HelpCircle size={17} />
              </span>
            </div>

            <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white/60">
              {resolved.faqs.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={item.id || `${item.q}-${index}`}
                    data-storefront-field="content.faqs"
                    data-storefront-source={hasPersistedFaqs ? 'persisted' : 'fallback'}
                    data-storefront-collection="faqs"
                    data-storefront-item-id={item.id}
                    data-storefront-item-index={index}
                    data-storefront-item-field="q"
                    data-storefront-label={`FAQ ${index + 1}`}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        if (isPreview) {
                          event.preventDefault();
                          return;
                        }
                        setOpenFaq(isOpen ? -1 : index);
                      }}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors duration-200 hover:bg-slate-50"
                    >
                      <span
                        data-storefront-field="content.faqs"
                        data-storefront-source={hasPersistedFaqs ? 'persisted' : 'fallback'}
                        data-storefront-collection="faqs"
                        data-storefront-item-id={item.id}
                        data-storefront-item-index={index}
                        data-storefront-item-field="q"
                        data-storefront-label={`FAQ ${index + 1} question`}
                        className={`text-[12px] font-semibold leading-5 ${hasFaqCardText ? 'text-current' : 'text-slate-800'}`}
                      >
                        {item.q}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                      />
                    </button>
                    <div className={`grid transition-all duration-200 ${isOpen || isPreview ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p
                          data-storefront-field="content.faqs"
                          data-storefront-source={hasPersistedFaqs ? 'persisted' : 'fallback'}
                          data-storefront-collection="faqs"
                          data-storefront-item-id={item.id}
                          data-storefront-item-index={index}
                          data-storefront-item-field="a"
                          data-storefront-label={`FAQ ${index + 1} answer`}
                          className={`px-4 pb-3 text-[12px] leading-5 ${hasFaqCardText ? 'text-current/85' : 'text-slate-500'}`}
                        >
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-3.5">
              <p
                data-storefront-field="content.faq_footer_title"
                data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'faq_footer_title') ? 'persisted' : 'fallback'}
                data-storefront-label="FAQ footer title"
                className={`text-[11px] font-semibold ${hasFaqCardText ? 'text-current' : 'text-slate-800'} ${hiddenClass('content.faq_footer_title')}`}
              >
                {resolved.faqFooterTitle}
              </p>
              <p
                data-storefront-field="content.faq_footer_body"
                data-storefront-source={Object.prototype.hasOwnProperty.call(content, 'faq_footer_body') ? 'persisted' : 'fallback'}
                data-storefront-label="FAQ footer body"
                className={`mt-1 text-[11px] leading-4 ${hasFaqCardText ? 'text-current/85' : 'text-slate-500'} ${hiddenClass('content.faq_footer_body')}`}
              >
                {resolved.faqFooterBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
