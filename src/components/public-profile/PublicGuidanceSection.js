'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, HelpCircle, LockKeyhole, MessageCircle, Sparkles } from 'lucide-react';

const ROLE_GUIDANCE = {
  agent: {
    eyebrow: 'Client Guide',
    title: 'Know what happens before you start.',
    description: 'A simple guide to how buying, selling, property questions, showings, and consultations are handled on this profile.',
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

export default function PublicGuidanceSection({ profile, content = {} }) {
  const [openFaq, setOpenFaq] = useState(0);
  const base = ROLE_GUIDANCE[profile?.professional_type] || ROLE_GUIDANCE.agent;
  const steps = Array.isArray(content.steps) && content.steps.length
    ? content.steps
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') {
          const [title = '', text = ''] = item.split('|').map((part) => part.trim());
          return title ? { title, text } : null;
        }
        return item.title ? { title: item.title, text: item.text || '' } : null;
      })
      .filter(Boolean)
    : base.steps;
  const faqs = Array.isArray(content.faqs) && content.faqs.length
    ? content.faqs
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') {
          const [q = '', a = ''] = item.split('|').map((part) => part.trim());
          return q ? { q, a } : null;
        }
        return item.q ? { q: item.q, a: item.a || '' } : null;
      })
      .filter(Boolean)
    : base.faqs;
  const resolved = {
    ...base,
    eyebrow: content.eyebrow || base.eyebrow,
    title: content.heading || content.title || base.title,
    description: content.body || content.description || base.description,
    steps,
    faqs,
  };

  return (
    <section id="guide" className="bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles size={11} />
            {resolved.eyebrow}
          </p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {resolved.title}
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-slate-500">{resolved.description}</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Guided process</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">Three clear steps forward</h3>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 size={17} />
              </span>
            </div>

            <div className="mt-5">
              {resolved.steps.map((step, index) => (
                <div key={step.title} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < resolved.steps.length - 1 ? (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-slate-200" />
                  ) : null}
                  <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/15 bg-primary/10 text-[11px] font-bold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="pt-0.5">
                    <div className="text-sm font-semibold text-slate-900">
                      {step.title}
                    </div>
                    <p className="mt-1 text-[12px] leading-5 text-slate-500">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                <MessageCircle size={14} className="shrink-0 text-primary" />
                <span className="text-[11px] font-medium text-slate-600">Guided chat support</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                <LockKeyhole size={14} className="shrink-0 text-primary" />
                <span className="text-[11px] font-medium text-slate-600">Organized professional handoff</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Helpful questions</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">What clients often ask</h3>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <HelpCircle size={17} />
              </span>
            </div>

            <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {resolved.faqs.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={item.q} className="bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                    >
                      <span className="text-[12px] font-semibold leading-5 text-slate-800">{item.q}</span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                      />
                    </button>
                    <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="px-4 pb-3 text-[12px] leading-5 text-slate-500">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-3.5">
              <p className="text-[11px] font-semibold text-slate-800">Need a more specific answer?</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">
                Use the chat bubble to share your goals and carry useful context into the conversation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

