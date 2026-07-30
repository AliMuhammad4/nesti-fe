import { Building2, CheckCircle2, ChevronRight, Handshake, Home, Percent, Quote, ShieldCheck, Star, Target } from 'lucide-react';
import IndustrialClientFeedbackSection from './IndustrialClientFeedbackSection';
import IndustrialServiceCard from './IndustrialServiceCard';
import { getServiceIconComponent, resolveServiceIconKey } from '@/components/storefront/builder/storefrontServiceIcons';

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

function serviceItems(services = [], role = 'agent', customItems = []) {
  const source = Array.isArray(customItems) && customItems.length
    ? customItems
    : services?.length
      ? services
      : FALLBACK_SERVICES[role] || FALLBACK_SERVICES.agent;
  return source
    .map((item, index) => ({
      ...item,
      id: item?.id || `fallback-service-${index}`,
      title: item?.title || item?.name || '',
      description: item?.description || item?.text || '',
      icon: resolveServiceIconKey(item?.icon, index),
      background: item?.background || item?.card_background || '',
      text_color: item?.text_color || item?.card_text_color || '',
      icon_background: item?.icon_background || '',
      icon_color: item?.icon_color || '',
    }))
    .filter((item) => item.title)
    .slice(0, 6);
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

export function LuxuryServicesSection({ profile }) {
  const customItems = profile.storefront_section_content?.items;
  const items = serviceItems(
    profile.services,
    profile.professional_type,
    customItems,
  );
  const copy = sectionCopy(profile, { eyebrow: 'Private advisory', heading: 'Concierge services' });
  const hasPersistedItems = Array.isArray(customItems);
  return (
    <section id="services" className="px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionHeader {...copy} tone="gold" />
        <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => {
            const itemId = service.id || `fallback-service-${index}`;
            return (
              <div
                key={itemId}
                data-storefront-anim-item="true"
                data-storefront-field="content.items"
                data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                data-storefront-collection="items"
                data-storefront-item-id={itemId}
                data-storefront-item-index={index}
                data-storefront-item-field="title"
                data-storefront-label={`Service ${index + 1}`}
                className="h-full rounded-2xl border border-amber-200/60 bg-white/95 p-5 text-left shadow-[0_14px_36px_rgba(60,45,10,0.07)] transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_20px_45px_rgba(60,45,10,0.12)]"
              >
                <div className="mb-3 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">Private Advisory</div>
                <h3 className="text-base font-semibold text-text-heading">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function IndustrialServicesSection({ profile }) {
  const content = profile.storefront_section_content || {};
  const customItems = content.items;
  const resolvedItems = serviceItems(profile.services, profile.professional_type, customItems);
  const sectionStyle = profile.storefront_section_style || {};
  const sectionLayout = profile.storefront_section_layout || {};
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
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
  const items = !customItems?.length && resolvedItems.length === 5
    ? [...resolvedItems, {
        ...(supplementalService[profile.professional_type] || supplementalService.agent),
        id: 'fallback-service-5',
        icon: 'shield',
      }]
    : resolvedItems;
  const copy = sectionCopy(profile, { eyebrow: 'Capabilities', heading: 'Service modules' });
  const hasPersistedItems = Array.isArray(customItems);
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const iconBackground = content.icon_background || '';
  const iconColor = content.icon_color || '';
  const columns = String(sectionLayout.columns || '3');
  const sectionPaddingClass = {
    small: 'px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6',
    medium: 'px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-12 xl:px-16',
    large: 'px-6 pb-9 pt-9 sm:px-10 sm:pb-12 sm:pt-12 lg:px-14 xl:px-20',
  }[sectionLayout.padding || 'medium'];
  const compactSectionPaddingClass = {
    small: 'px-4 pb-4 pt-4',
    medium: 'px-5 pb-6 pt-6',
    large: 'px-6 pb-9 pt-9',
  }[sectionLayout.padding || 'medium'];
  const gridColumnsClass = {
    1: 'md:grid-cols-1 lg:grid-cols-1',
    2: 'md:grid-cols-2 lg:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'md:grid-cols-2 lg:grid-cols-3';
  const previewGridColumnsClass = forceMobilePreview
    ? 'grid-cols-1'
    : forceTabletPreview
      ? 'sm:grid-cols-2'
      : gridColumnsClass;
  const headerAlignClass = sectionLayout.alignment === 'center'
    ? 'mx-auto text-center'
    : sectionLayout.alignment === 'right'
      ? 'ml-auto text-right'
      : 'text-left';
  const sectionRadius = {
    none: '0px',
    default: '12px',
    large: '20px',
  }[sectionStyle.radius || 'default'];
  const shadowByDepth = {
    none: 'none',
    small: '0 8px 24px rgba(15,23,42,0.10)',
    medium: '0 14px 36px rgba(15,23,42,0.14)',
    large: '0 22px 56px rgba(15,23,42,0.18)',
  }[sectionStyle.shadow || 'none'];
  const cardVisualClass = sectionLayout.cardStyle === 'glass'
    ? 'border border-white/70 bg-white/70 backdrop-blur'
    : sectionLayout.cardStyle === 'elevated'
      ? 'border border-transparent bg-white'
      : sectionLayout.cardStyle === 'flat'
        ? 'border border-transparent bg-white/95'
        : 'border border-slate-200/90 bg-white';
  const cardShadow = sectionLayout.cardStyle === 'flat' ? 'none' : shadowByDepth;
  const capabilityIcons = [Target, Building2, Home, Percent, Handshake, ShieldCheck];
  return (
    <section
      id="services"
      className={`w-full ${forceCompactPreview ? compactSectionPaddingClass : sectionPaddingClass}`}
      style={{ color: sectionStyle.textColor || undefined }}
    >
      <div className="w-full">
        <div className={`max-w-2xl ${headerAlignClass}`}>
          <p
            data-storefront-field="content.eyebrow"
            data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
            data-storefront-label="Services eyebrow"
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
              hasCustomTextColor ? 'text-current' : 'text-primary'
            }`}
            style={hasCustomTextColor ? { opacity: 0.78 } : undefined}
          >
            {copy.eyebrow || 'Capabilities'}
          </p>
          <h2
            data-storefront-field="content.heading"
            data-storefront-source={content.heading ? 'persisted' : 'fallback'}
            data-storefront-label="Services heading"
            className={`mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl ${
              hasCustomTextColor ? 'text-current' : 'text-slate-900'
            }`}
          >
            {copy.heading}
          </h2>
          {copy.body ? (
            <p
              data-storefront-field="content.body"
              data-storefront-source={content.body ? 'persisted' : 'fallback'}
              data-storefront-label="Services description"
              className={`mt-2 text-[13px] leading-5 ${
                hasCustomTextColor ? 'text-current' : 'text-slate-500'
              }`}
              style={hasCustomTextColor ? { opacity: 0.86 } : undefined}
            >
              {copy.body}
            </p>
          ) : null}
        </div>

        <div className={`mt-8 grid auto-rows-fr gap-4 ${previewGridColumnsClass}`}>
          {items.map((service, index) => {
            const FallbackIcon = capabilityIcons[index % capabilityIcons.length];
            const itemId = service.id || `fallback-service-${index}`;
            const iconKey = resolveServiceIconKey(service?.icon, index);
            const IconComponent = getServiceIconComponent(iconKey) || FallbackIcon;
            const serviceIconBackground = service.icon_background || iconBackground;
            const serviceIconColor = service.icon_color || iconColor;
            return (
              <IndustrialServiceCard
                key={itemId}
                service={service}
                index={index}
                itemId={itemId}
                IconComponent={IconComponent}
                cardVisualClass={cardVisualClass}
                sectionRadius={sectionRadius}
                cardShadow={cardShadow}
                hasCustomTextColor={hasCustomTextColor}
                hasPersistedItems={hasPersistedItems}
                cardBackground={service.background || ''}
                cardTextColor={service.text_color || ''}
                iconBackground={serviceIconBackground}
                iconColor={serviceIconColor}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WarmServicesSection({ profile }) {
  const customItems = profile.storefront_section_content?.items;
  const items = serviceItems(
    profile.services,
    profile.professional_type,
    customItems,
  );
  const copy = sectionCopy(profile, { eyebrow: 'How we help', heading: 'Support built around you' });
  const hasPersistedItems = Array.isArray(customItems);
  return (
    <section id="services" className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-8">
        <SectionHeader {...copy} />
        <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => {
            const itemId = service.id || `fallback-service-${index}`;
            return (
              <div
                key={itemId}
                data-storefront-anim-item="true"
                data-storefront-field="content.items"
                data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                data-storefront-collection="items"
                data-storefront-item-id={itemId}
                data-storefront-item-index={index}
                data-storefront-item-field="title"
                data-storefront-label={`Service ${index + 1}`}
                className="flex h-full items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-lg"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-text-heading">{service.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FunnelServicesSection({ profile }) {
  const customItems = profile.storefront_section_content?.items;
  const items = serviceItems(
    profile.services,
    profile.professional_type,
    customItems,
  );
  const copy = sectionCopy(profile, { eyebrow: 'Choose your path', heading: 'Start with the right service' });
  const hasPersistedItems = Array.isArray(customItems);
  return (
    <section id="services" className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeader {...copy} />
        <div className="mt-7 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => {
            const itemId = service.id || `fallback-service-${index}`;
            return (
              <div
                key={itemId}
                data-storefront-anim-item="true"
                data-storefront-field="content.items"
                data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                data-storefront-collection="items"
                data-storefront-item-id={itemId}
                data-storefront-item-index={index}
                data-storefront-item-field="title"
                data-storefront-label={`Service ${index + 1}`}
                className="group h-full rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-text-heading">{service.title}</p>
                  <ChevronRight size={15} className="text-primary transition group-hover:translate-x-0.5" />
                </div>
                <p className="mt-1.5 text-sm text-text-muted">{service.description}</p>
              </div>
            );
          })}
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
            <article key={`${item.name}-${index}`} data-storefront-anim-item="true" className="rounded-2xl border border-amber-200/70 bg-white/95 p-5 shadow-sm">
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
            <article key={`${item.name}-${index}`} data-storefront-anim-item="true" className="rounded-2xl bg-slate-50 p-4">
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
          <article key={`${item.name}-${index}`} data-storefront-anim-item="true" className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
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
            <button key={`${program.name}-${index}`} type="button" data-storefront-anim-item="true" onClick={() => actions.onCtaClick?.('mortgage_program')} className="rounded-2xl border border-amber-200/70 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5">
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
            <button key={`${program.name}-${index}`} type="button" data-storefront-anim-item="true" onClick={() => actions.onCtaClick?.('mortgage_program')} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left">
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
            <button key={`${program.name}-${index}`} type="button" data-storefront-anim-item="true" onClick={() => actions.onCtaClick?.('mortgage_program')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-primary/30 hover:bg-white">
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
            <button key={`${program.name}-${index}`} type="button" data-storefront-anim-item="true" onClick={() => actions.onCtaClick?.('mortgage_program')} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md">
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
