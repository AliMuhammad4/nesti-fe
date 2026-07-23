'use client';

import { Building, DollarSign, FileText, Handshake, Home, KeyRound } from 'lucide-react';

const iconMap = {
  home: <Home size={32} />,
  dollar: <DollarSign size={32} />,
  contract: <FileText size={32} />,
  handshake: <Handshake size={32} />,
  building: <Building size={32} />,
  key: <KeyRound size={32} />,
};

const fallbackServices = {
  agent: [
    { icon: 'home', title: 'Buyer Search Strategy', description: 'Clarify budget, preferred areas, home features, timeline, and viewing readiness before shortlisting the right properties.', cta_text: 'Ask about buying' },
    { icon: 'building', title: 'Seller Positioning', description: 'Share property details, expected price, selling timeline, and motivation so the agent can follow up with a clearer strategy.', cta_text: 'Ask about selling' },
    { icon: 'key', title: 'Showings & Consultations', description: 'Ask about a listing, request a showing, or start a guided consultation request through the profile assistant.', cta_text: 'Start inquiry' },
  ],
  mortgage_broker: [
    { icon: 'dollar', title: 'Pre-Approval Readiness', description: 'Start with income range, credit status, down payment, purchase timeline, and documents needed for next steps.', cta_text: 'Start pre-approval' },
    { icon: 'building', title: 'Affordability Planning', description: 'Ask about price range, monthly comfort level, loan options, refinance goals, and financing tradeoffs.', cta_text: 'Ask a question' },
    { icon: 'handshake', title: 'Broker Follow-Up', description: 'Send a complete inquiry so the broker can respond with relevant guidance instead of starting from scratch.', cta_text: 'Start inquiry' },
  ],
  lawyer: [
    { icon: 'contract', title: 'Contract & Document Review', description: 'Ask about purchase agreements, clauses, conditions, amendments, and transaction documents before follow-up.', cta_text: 'Ask about contracts' },
    { icon: 'key', title: 'Closing Support', description: 'Share closing timelines, transaction stage, mortgage status, and service needs so legal next steps are clearer.', cta_text: 'Ask about closing' },
    { icon: 'handshake', title: 'Title & Transaction Guidance', description: 'Start an organized inquiry for title concerns, legal risks, document questions, or consultation support.', cta_text: 'Start inquiry' },
  ],
};

export default function PublicServices({ services = [], professionalType, onServiceClick, content = {} }) {
  const displayServices = services?.length ? services : (fallbackServices[professionalType] || fallbackServices.agent);
  const title = content.heading
    || (professionalType === 'agent'
      ? 'Real estate guidance built around your next move'
      : professionalType === 'mortgage_broker'
        ? 'Mortgage guidance from first question to next step'
        : 'Legal support for clearer real estate decisions');
  const description = content.body
    || (professionalType === 'agent'
      ? 'Personalized real estate services designed to help you achieve your goals.'
      : professionalType === 'mortgage_broker'
        ? 'Comprehensive mortgage solutions tailored to your financial needs.'
        : 'Expert legal services for all your real estate transactions.');

  return (
    <section id="services" className="bg-transparent py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl text-center mx-auto">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Services
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {displayServices.map((service, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-xl border border-slate-200/90 bg-white p-5 transition duration-200 hover:border-slate-300 hover:shadow-md group"
              onClick={() => onServiceClick?.(service)}
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg bg-slate-50 text-primary transition-transform group-hover:scale-105">
                  {service.icon && iconMap[service.icon] ? (
                    iconMap[service.icon]
                  ) : (
                    <Handshake size={28} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-6 text-text-muted">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

