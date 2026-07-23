import { Building2, CheckCircle2, ChevronRight, Handshake, Home, Percent, Quote, ShieldCheck, Star, Target } from 'lucide-react';
import IndustrialClientFeedbackSection from './IndustrialClientFeedbackSection';

const FALLBACK_SERVICES = {
  agent: [
    { title: 'Buyer Strategy', description: 'Neighborhood guidance, viewing strategy, and offer planning.' },
    { title: 'Seller Positioning', description: 'Pricing, staging, launch timing, and negotiation support.' },
    { title: 'Closing Coordination', description: 'From accepted offer to keys with clear communication.' },
  ],
  mortgage_broker: [
    { title: 'Pre-Approval Planning', description: 'Income, debt, and down payment strategy before shopping.' },
    { title: 'Program Comparison', description: 'Fixed, variable, refinance, and investor pathways.' },
    { title: 'Renewal Optimization', description: 'Review terms and improve payment structure before maturity.' },
  ],
  lawyer: [
    { title: 'Agreement Review', description: 'Plain-language review of purchase and sale documents.' },
    { title: 'Closing Support', description: 'Title, registration, lender coordination, and completion.' },
    { title: 'Transaction Counsel', description: 'Guidance for purchase, sale, refinance, and transfer matters.' },
  ],
};

function serviceItems(services = [], role = 'agent') {
  return (services?.length ? services : FALLBACK_SERVICES[role] || FALLBACK_SERVICES.agent).slice(0, 6);
}

function testimonialItems(testimonials = [], profile) {
  const fromLeads = (profile?.real_clients || [])
    .filter((item) => item?.client_name && item?.text)
    .map((item) => ({ name: item.client_name, text: item.text, rating: item.rating || 5 }));
  const fromTestimonials = (testimonials || [])
    .filter((item) => item?.client_name && item?.text)
    .map((item) => ({ name: item.client_name, text: item.text, rating: item.rating || 5 }));
  const merged = fromLeads.length ? fromLeads : fromTestimonials;
  if (merged.length) return merged.slice(0, 6);
  return [
    { name: 'Verified Client', text: 'Clear communication, excellent guidance, and smooth execution from start to finish.', rating: 5 },
    { name: 'Repeat Client', text: 'Professional, responsive, and highly organized throughout the full process.', rating: 5 },
    { name: 'Referral Partner', text: 'Trusted advice with practical next steps at every stage.', rating: 5 },
  ];
}

function programItems(programs = []) {
  return (programs || []).slice(0, 6);
}

function sectionCopy(profile, defaults = {}) {
  const content = profile?.storefront_section_content || {};
  return {
    eyebrow: content.eyebrow || defaults.eyebrow || '',
    heading: content.heading || defaults.heading || '',
    body: content.body || defaults.body || '',
  };
}

function SectionHeader({ eyebrow, heading, body, tone = 'primary', align = 'center' }) {
  const eyebrowClass = tone === 'gold' ? 'text-amber-600' : tone === 'dark' ? 'text-slate-500' : 'text-primary';
  const alignment = align === 'left' ? 'text-left' : 'text-center';
  return (
    <div className={`${alignment} ${align === 'left' ? '' : 'mx-auto max-w-3xl'}`}>
      {eyebrow ? <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${eyebrowClass}`}>{eyebrow}</p> : null}
      {heading ? <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-heading sm:text-3xl">{heading}</h2> : null}
      {body ? <p className="mt-2 text-sm leading-6 text-text-muted">{body}</p> : null}
    </div>
  );
}

export function LuxuryServicesSection({ profile, actions }) {
  const items = serviceItems(profile.services, profile.professional_type);
  const copy = sectionCopy(profile, { eyebrow: 'Private advisory', heading: 'Concierge services' });
  return (
    <section id="services" className="px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionHeader {...copy} tone="gold" />
        <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => (
            <button
              key={`${service.title}-${index}`}
              type="button"
              onClick={() => actions.onServiceClick?.(service)}
              className="h-full rounded-2xl border border-amber-200/60 bg-white/95 p-5 text-left shadow-[0_14px_36px_rgba(60,45,10,0.07)] transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_20px_45px_rgba(60,45,10,0.12)]"
            >
              <div className="mb-3 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">Private Advisory</div>
              <h3 className="text-base font-semibold text-text-heading">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">{service.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustrialServicesSection({ profile, actions }) {
  const resolvedItems = serviceItems(profile.services, profile.professional_type);
  const supplementalService = {
    agent: {
      title: 'Portfolio Growth Strategy',
      description: 'Build a practical acquisition and diversification plan around your long-term property goals.',
    },
    mortgage_broker: {
      title: 'Financing Strategy Review',
      description: 'Review borrowing options and structure a financing path aligned with your next property goal.',
    },
    lawyer: {
      title: 'Property Advisory',
      description: 'Get clear legal guidance for complex property decisions before moving forward.',
    },
  };
  const items = resolvedItems.length === 5
    ? [...resolvedItems, supplementalService[profile.professional_type] || supplementalService.agent]
    : resolvedItems;
  const copy = sectionCopy(profile, { eyebrow: 'Capabilities', heading: 'Service modules' });
  const capabilityIcons = [Target, Building2, Home, Percent, Handshake, ShieldCheck];
  return (
    <section id="services" className="px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          {copy.eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {copy.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {copy.heading}
          </h2>
          {copy.body ? (
            <p className="mt-2 text-[13px] leading-5 text-slate-500">
              {copy.body}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid auto-rows-fr gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => {
            const Icon = capabilityIcons[index % capabilityIcons.length];
            return (
              <button
                key={`${service.title}-${index}`}
                type="button"
                onClick={() => actions.onServiceClick?.(service)}
                className="group flex h-full flex-col rounded-xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={15} />
                  </span>
                  <h3 className="min-w-0 text-[13px] font-semibold leading-4 text-slate-900">
                    {service.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-[12px] leading-5 text-slate-500">
                  {service.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WarmServicesSection({ profile, actions }) {
  const items = serviceItems(profile.services, profile.professional_type);
  const copy = sectionCopy(profile, { eyebrow: 'How we help', heading: 'Support built around you' });
  return (
    <section id="services" className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-8">
        <SectionHeader {...copy} />
        <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => (
            <button
              key={`${service.title}-${index}`}
              type="button"
              onClick={() => actions.onServiceClick?.(service)}
              className="flex h-full items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-lg"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-text-heading">{service.title}</p>
                <p className="mt-1 text-sm text-text-muted">{service.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FunnelServicesSection({ profile, actions }) {
  const items = serviceItems(profile.services, profile.professional_type);
  const copy = sectionCopy(profile, { eyebrow: 'Choose your path', heading: 'Start with the right service' });
  return (
    <section id="services" className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeader {...copy} />
        <div className="mt-7 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => (
            <button
              key={`${service.title}-${index}`}
              type="button"
              onClick={() => actions.onServiceClick?.(service)}
              className="group h-full rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-heading">{service.title}</p>
                <ChevronRight size={15} className="text-primary transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1.5 text-sm text-text-muted">{service.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LuxuryTestimonialsSection({ profile, testimonials }) {
  const items = testimonialItems(testimonials, profile);
  const copy = sectionCopy(profile, { eyebrow: 'Client confidence', heading: 'Trusted relationships' });
  return (
    <section id="reviews" className="px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionHeader {...copy} tone="gold" />
        <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article key={`${item.name}-${index}`} className="rounded-2xl border border-amber-200/70 bg-white/95 p-5 shadow-sm">
              <Quote size={16} className="text-amber-600" />
              <p className="mt-3 text-sm leading-6 text-text-body">&ldquo;{item.text}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-text-heading">{item.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustrialTestimonialsSection({ profile }) {
  const copy = sectionCopy(profile, { eyebrow: 'Verified outcomes', heading: 'Performance signals' });
  return <IndustrialClientFeedbackSection profile={profile} testimonials={profile.client_feedback || []} copy={copy} />;
}

export function WarmTestimonialsSection({ profile, testimonials }) {
  const items = testimonialItems(testimonials, profile);
  const copy = sectionCopy(profile, { eyebrow: 'Success stories', heading: 'What clients say' });
  return (
    <section id="reviews" className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-8">
        <SectionHeader {...copy} />
        <div className="mt-7 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article key={`${item.name}-${index}`} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} className={i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                ))}
              </div>
              <p className="text-sm leading-6 text-text-body">&ldquo;{item.text}&rdquo;</p>
              <p className="mt-3 text-sm font-semibold text-text-heading">{item.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FunnelTestimonialsSection({ profile, testimonials }) {
  const items = testimonialItems(testimonials, profile);
  const copy = sectionCopy(profile, { eyebrow: 'Social proof', heading: 'Results clients remember' });
  return (
    <section id="reviews" className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeader {...copy} />
        <div className="mt-7 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
          <article key={`${item.name}-${index}`} className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-sm leading-6 text-text-body">&ldquo;{item.text}&rdquo;</p>
            <p className="mt-2 text-sm font-semibold text-text-heading">{item.name}</p>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}

export function LuxuryMortgageProgramsSection({ profile, actions }) {
  const items = programItems(profile.mortgage_programs);
  const copy = sectionCopy(profile, { eyebrow: 'Capital strategies', heading: 'Mortgage solutions' });
  if (!items.length) return null;
  return (
    <section id="programs" className="px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeader {...copy} tone="gold" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((program, index) => (
            <button key={`${program.name}-${index}`} type="button" onClick={() => actions.onCtaClick?.('mortgage_program')} className="rounded-2xl border border-amber-200/70 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5">
              <ShieldCheck size={17} className="text-amber-600" />
              <p className="mt-2 text-sm font-semibold text-text-heading">{program.name}</p>
              <p className="mt-1 text-sm text-text-muted">{program.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustrialMortgageProgramsSection({ profile, actions }) {
  const items = programItems(profile.mortgage_programs);
  const copy = sectionCopy(profile, { eyebrow: 'Products', heading: 'Program matrix' });
  if (!items.length) return null;
  return (
    <section id="programs" className="px-4 py-10">
      <div className="mx-auto max-w-6xl border border-slate-200 bg-white p-6">
        <SectionHeader {...copy} tone="dark" align="left" />
        <div className="mt-4 grid gap-2">
          {items.map((program, index) => (
            <button key={`${program.name}-${index}`} type="button" onClick={() => actions.onCtaClick?.('mortgage_program')} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left">
              <span className="text-sm font-semibold text-text-heading">{program.name}</span>
              <ChevronRight size={14} className="text-slate-500" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WarmMortgageProgramsSection({ profile, actions }) {
  const items = programItems(profile.mortgage_programs);
  const copy = sectionCopy(profile, { eyebrow: 'Explore options', heading: 'Mortgage paths for your goals' });
  if (!items.length) return null;
  return (
    <section id="programs" className="px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <SectionHeader {...copy} />
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((program, index) => (
            <button key={`${program.name}-${index}`} type="button" onClick={() => actions.onCtaClick?.('mortgage_program')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-primary/30 hover:bg-white">
              <Home size={16} className="text-primary" />
              <p className="mt-2 text-sm font-semibold text-text-heading">{program.name}</p>
              <p className="mt-1 text-sm text-text-muted">{program.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FunnelMortgageProgramsSection({ profile, actions }) {
  const items = programItems(profile.mortgage_programs);
  const copy = sectionCopy(profile, { eyebrow: 'Compare options', heading: 'Pick a program to continue' });
  if (!items.length) return null;
  return (
    <section id="programs" className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeader {...copy} />
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((program, index) => (
            <button key={`${program.name}-${index}`} type="button" onClick={() => actions.onCtaClick?.('mortgage_program')} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-text-heading">{program.name}</span>
                <ChevronRight size={15} className="text-primary transition group-hover:translate-x-0.5" />
              </div>
              {program.min_credit_score ? <p className="mt-1 text-xs text-text-muted">Min credit score: {program.min_credit_score}</p> : null}
              {program.down_payment_min ? <p className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted"><Percent size={12} /> Down payment: {program.down_payment_min}</p> : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
