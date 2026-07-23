'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';

const ROLE_CONTENT = {
  agent: {
    eyebrow: 'How to connect',
    title: 'Work with a trusted real estate professional.',
    description:
      'Use the chat assistant for questions about buying, selling, investing, property availability, or booking a consultation with this agent.',
    steps: [
      { label: 'Intent', title: 'Choose your real estate goal', description: 'Tell the assistant if you want to buy, sell, invest, ask about a listing, or book a consultation.' },
      { label: 'Area', title: 'Share your preferred area', description: 'Add your target city, neighborhood, property location, or the area where you need guidance.' },
      { label: 'Budget', title: 'Clarify budget and price range', description: 'For buyers, share your budget. For sellers, share your expected price or current property value.' },
      { label: 'Needs', title: 'Explain your property needs', description: 'Mention bedrooms, property type, must-have features, timeline, motivation, or seller details.' },
      { label: 'Contact', title: 'Send a complete request', description: 'The assistant organizes your answers and connects the full inquiry to the agent for follow-up.' },
      { label: 'Booking', title: 'Book a consultation', description: 'Ask the assistant to help route a consultation request to the agent.' },
    ],
  },
  mortgage_broker: {
    eyebrow: 'How to connect',
    title: 'Get mortgage guidance from a trusted broker.',
    description:
      'Use the chat assistant for questions about pre-approval, affordability, refinancing, rates, documents, or booking a mortgage consultation.',
    steps: [
      { label: 'Intent', title: 'Choose your need', description: 'Pre-approval, affordability, refinance, rates, or mortgage advice.' },
      { label: 'Info', title: 'Share basics', description: 'Budget, income range, credit status, timeline, and financing goal.' },
      { label: 'Contact', title: 'Get connected', description: 'The assistant connects your request to the broker for follow-up.' },
      { label: 'Booking', title: 'Book a consultation', description: 'Ask the assistant to help route a mortgage consultation request to the broker.' },
    ],
  },
  lawyer: {
    eyebrow: 'How to connect',
    title: 'Get legal support for your real estate transaction.',
    description:
      'Use the chat assistant for questions about closings, contracts, title review, legal documents, or booking a legal consultation.',
    steps: [
      { label: 'Intent', title: 'Select legal help', description: 'Closing, contract review, title support, or transaction guidance.' },
      { label: 'Info', title: 'Add case context', description: 'Transaction stage, timeline, property value, and legal needs.' },
      { label: 'Contact', title: 'Get connected', description: 'The assistant sends your inquiry to the lawyer with clear details.' },
      { label: 'Booking', title: 'Book a consultation', description: 'Ask the assistant to help route a legal consultation request to the lawyer.' },
    ],
  },
};

export default function PublicCTA({ profile, onDirectLeadClick, content = {} }) {
  const base = ROLE_CONTENT[profile.professional_type] || ROLE_CONTENT.agent;
  const steps = Array.isArray(content.steps) && content.steps.length
    ? content.steps
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') {
          const [title = '', description = ''] = item.split('|').map((part) => part.trim());
          return title ? { label: title, title, description } : null;
        }
        const title = item.title || item.label || '';
        return title ? { label: item.label || title, title, description: item.description || item.text || '' } : null;
      })
      .filter(Boolean)
    : base.steps;
  const resolved = {
    ...base,
    eyebrow: content.eyebrow || base.eyebrow,
    title: content.heading || content.title || base.title,
    description: content.body || content.description || base.description,
    steps,
  };

  return (
    <section id="contact" className="bg-transparent py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {resolved.eyebrow}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
                {resolved.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                {resolved.description}
              </p>
            </div>
            <button
              type="button"
              onClick={onDirectLeadClick}
              className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Submit inquiry
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {resolved.steps.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                    {index + 1}
                  </span>
                  <CheckCircle2 size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                </div>
                <p className="mt-2 pl-8 text-[12px] leading-5 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

