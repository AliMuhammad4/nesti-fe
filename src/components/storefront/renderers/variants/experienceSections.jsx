import { Building2, CheckCircle2, ChevronRight, Gem, Handshake, Home, MapPin, Percent, Quote, ShieldCheck, Star, Target, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const SELLER_SUPPLEMENTAL_SERVICE_ITEMS = [
  {
    id: 'seller-service-fallback-1',
    title: 'Pre-listing prep plan',
    description: 'Repairs, staging, media, and launch sequencing to maximize first-week momentum.',
    icon: 'shield-check',
  },
  {
    id: 'seller-service-fallback-2',
    title: 'Offer decision room',
    description: 'Compare pricing strength, terms, and closing confidence before choosing an offer.',
    icon: 'target',
  },
  {
    id: 'seller-service-fallback-3',
    title: 'Closing confidence',
    description: 'Coordinate conditions, documents, and handoffs so the accepted offer reaches a clean close.',
    icon: 'handshake',
  },
];

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
  const fromBuilder = (testimonials || [])
    .filter((item) => item?.client_name && item?.text)
    .map((item, index) => ({ id: item.id || `testimonial-${index}`, name: item.client_name, text: item.text, rating: item.rating || 5 }));
  if (fromBuilder.length) return fromBuilder.slice(0, 6);
  const fromLeads = (profile?.real_clients || [])
    .filter((item) => item?.client_name && item?.text)
    .map((item, index) => ({ id: item.id || `client-feedback-${index}`, name: item.client_name, text: item.text, rating: item.rating || 5 }));
  const merged = fromLeads;
  if (merged.length) return merged.slice(0, 6);
  return [
    { id: 'fallback-client-1', name: 'Verified Client', text: 'Clear communication, excellent guidance, and smooth execution from start to finish.', rating: 5 },
    { id: 'fallback-client-2', name: 'Repeat Client', text: 'Professional, responsive, and highly organized throughout the full process.', rating: 5 },
    { id: 'fallback-client-3', name: 'Referral Partner', text: 'Trusted advice with practical next steps at every stage.', rating: 5 },
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

function SectionHeader({ eyebrow, heading, body, tone = 'primary', align = 'center', editable = false, content = {} }) {
  const eyebrowClass = tone === 'gold' ? 'text-amber-600' : tone === 'dark' ? 'text-slate-500' : 'text-primary';
  const alignment = align === 'left' ? 'text-left' : 'text-center';
  const fieldProps = (field, label) => editable
    ? {
        'data-storefront-field': `content.${field}`,
        'data-storefront-source': content[field] ? 'persisted' : 'fallback',
        'data-storefront-label': label,
      }
    : {};
  return (
    <div className={`${alignment} ${align === 'left' ? '' : 'mx-auto max-w-3xl'}`}>
      {eyebrow ? <p {...fieldProps('eyebrow', 'Section eyebrow')} className={`text-[10px] font-bold uppercase tracking-[0.24em] ${eyebrowClass}`}>{eyebrow}</p> : null}
      {heading ? <h2 {...fieldProps('heading', 'Section heading')} className="mt-2 text-2xl font-bold tracking-tight text-text-heading sm:text-3xl">{heading}</h2> : null}
      {body ? <p {...fieldProps('body', 'Section description')} className="mt-2 text-sm leading-6 text-text-muted">{body}</p> : null}
    </div>
  );
}

function luxurySurface(value, fallback) {
  const stored = String(value || '').trim();
  const normalized = stored.toLowerCase().replace(/\s+/g, '');
  const legacyLight = ['#faf7ef', '#f8f2e4', '#fffaf1'].includes(normalized)
    || ['250,247,239', '248,242,228', '255,250,241'].some((rgb) => normalized.includes(rgb));
  // Early Luxury Advisor drafts mixed teal/green primaries into section shells.
  const legacyTeal = ['#0f766e', '#0c5c4c', '#0d9488', '#115e59', '#134e4a'].includes(normalized)
    || ['15,118,110', '12,92,76', '13,148,136'].some((rgb) => normalized.includes(rgb))
    || /color-mix\(insrgb,var\(--storefront-primary\)/.test(normalized);
  return !stored || legacyLight || legacyTeal ? fallback : stored;
}

/**
 * Single source of truth for Luxury Advisor builder controls.
 *
 * Testimonials/CTA/Programs previously read only background + textColor, so
 * padding, width, alignment, radius, shadow, columns, cardStyle and variant were
 * silent no-ops in the builder. Resolving them here keeps every luxury section
 * responding to the same inspector fields.
 */
function luxuryChrome(profile, { defaultAlignment = 'center', defaultColumns = '3', defaultRadius = 'large', defaultShadow = 'medium', surfaceFallback = '#141210' } = {}) {
  const content = profile?.storefront_section_content || {};
  const layout = profile?.storefront_section_layout || {};
  const style = profile?.storefront_section_style || {};
  const previewMode = profile?.storefront_preview_mode;
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const forceMobile = isPreview && previewMode === 'mobile';
  const forceTablet = isPreview && previewMode === 'tablet';

  const width = layout.width || 'full';
  const alignment = layout.alignment || defaultAlignment;
  const variant = layout.variant || 'standard';
  const columns = String(layout.columns || defaultColumns);

  const gridClass = forceMobile
    ? 'grid-cols-1'
    : forceTablet
      ? 'grid-cols-2'
      : ({
          1: 'grid-cols-1',
          2: 'sm:grid-cols-2',
          3: 'sm:grid-cols-2 lg:grid-cols-3',
          4: 'sm:grid-cols-2 lg:grid-cols-4',
        }[columns] || 'sm:grid-cols-2 lg:grid-cols-3');

  return {
    content,
    layout,
    style,
    alignment,
    variant,
    columns,
    gridClass,
    alignmentClass: { left: 'text-left', center: 'text-center', right: 'text-right' }[alignment] || 'text-center',
    ruleAlignClass: alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : '',
    widthClass: { narrow: 'max-w-5xl', contained: 'max-w-6xl', full: 'w-full max-w-none' }[width] || 'w-full max-w-none',
    horizontalClass: width === 'full' ? 'px-2 sm:px-4 lg:px-6 xl:px-8' : 'px-4 sm:px-8',
    paddingClass: { none: 'py-0', small: 'py-5', medium: 'py-8 sm:py-11', large: 'py-11 sm:py-14' }[layout.padding || 'medium'] || 'py-8 sm:py-11',
    radius: { none: 0, small: 16, default: 28, medium: 28, large: 36, full: 44 }[style.radius || defaultRadius] ?? 36,
    shadow: {
      none: 'none',
      small: '0 10px 28px rgba(0,0,0,.18)',
      medium: '0 24px 60px rgba(0,0,0,.28)',
      large: '0 30px 80px rgba(0,0,0,.35)',
    }[style.shadow || defaultShadow] || '0 24px 60px rgba(0,0,0,.28)',
    panelText: style.textColor || '#f5f1e8',
    surface: luxurySurface(style.background, surfaceFallback),
    // `flat` intentionally drops the outer shell shadow, matching Services.
    cardStyle: layout.cardStyle || 'bordered',
    cardStyleClass: {
      flat: 'border-transparent bg-transparent hover:bg-white/[0.03]',
      bordered: 'border-accent/20 bg-[#181512] hover:border-accent/35 hover:bg-[#1e1a16] hover:shadow-[0_18px_44px_rgba(0,0,0,.42)]',
      elevated: 'border-transparent bg-[#1c1916] shadow-[0_18px_40px_rgba(0,0,0,.28)] hover:bg-[#221e19] hover:shadow-[0_26px_60px_rgba(0,0,0,.5)]',
      glass: 'border-accent/24 bg-white/[0.06] backdrop-blur-md hover:border-accent/30 hover:bg-white/[0.09]',
    }[layout.cardStyle || 'bordered'] || 'border-accent/20 bg-[#181512] hover:border-accent/35 hover:bg-[#1e1a16] hover:shadow-[0_18px_44px_rgba(0,0,0,.42)]',
  };
}

/** Editable section header shared by the luxury sections. */
function LuxurySectionHeader({ chrome, copy, fallbackEyebrow }) {
  const { content, alignmentClass, ruleAlignClass, panelText, alignment } = chrome;
  return (
    <header className={`px-7 pb-2 pt-10 sm:px-12 sm:pt-14 ${alignmentClass}`}>
      <p
        data-storefront-field="content.eyebrow"
        data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
        data-storefront-label="Section eyebrow"
        className="text-[10px] font-semibold uppercase tracking-[0.32em] text-accent"
      >
        {copy.eyebrow || fallbackEyebrow}
      </p>
      <span className={`mt-3 block h-px w-16 bg-accent/65 ${ruleAlignClass}`} aria-hidden="true" />
      <h2
        data-storefront-field="content.heading"
        data-storefront-source={content.heading ? 'persisted' : 'fallback'}
        data-storefront-label="Section heading"
        className="mt-6 font-serif text-[1.85rem] font-normal leading-[1.12] tracking-[-0.01em] sm:text-[2.45rem]"
        style={{ color: panelText }}
      >
        {copy.heading}
      </h2>
      {copy.body ? (
        <p
          data-storefront-field="content.body"
          data-storefront-source={content.body ? 'persisted' : 'fallback'}
          data-storefront-label="Section description"
          className={`mt-4 max-w-2xl text-[14px] leading-7 ${alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''}`}
          style={{ color: panelText, opacity: 0.68 }}
        >
          {copy.body}
        </p>
      ) : null}
    </header>
  );
}

export function LuxuryServicesSection({ profile }) {
  const content = profile.storefront_section_content || {};
  const customItems = content.items;
  const resolvedItems = serviceItems(
    profile.services,
    profile.professional_type,
    customItems,
  );
  // A 5-item list leaves a lone card on the last row of a 2/3-column grid.
  // Classic already fills to six; mirror that here with luxury-appropriate copy.
  const items = (!Array.isArray(customItems) || !customItems.length) && resolvedItems.length === 5
    ? [
        ...resolvedItems,
        {
          id: 'luxury-service-6',
          title: 'Portfolio & Legacy Planning',
          description: 'Long-horizon strategy for holdings, acquisitions, and the timing behind each decision.',
          icon: resolveServiceIconKey(undefined, 5),
          background: '',
          text_color: '',
          icon_background: '',
          icon_color: '',
        },
      ]
    : resolvedItems;
  const copy = sectionCopy(profile, { eyebrow: 'What I offer', heading: 'Concierge services' });
  const hasPersistedItems = Array.isArray(customItems);
  const chrome = luxuryChrome(profile, { defaultColumns: '3', defaultRadius: 'large', defaultShadow: 'medium' });
  const sectionBorderColor = chrome.style?.borderColor || 'color-mix(in srgb, var(--storefront-accent) 34%, transparent)';
  const iconBackground = content.icon_background || 'color-mix(in srgb, var(--storefront-accent) 14%, transparent)';
  const iconColor = content.icon_color || 'var(--storefront-accent)';
  return (
    <section id="services" className={`${chrome.horizontalClass} ${chrome.paddingClass}`}>
      <div
        className={`mx-auto overflow-hidden border border-accent/25 ${chrome.widthClass}`}
        style={{
          background: chrome.surface,
          color: chrome.panelText,
          borderColor: sectionBorderColor,
          borderRadius: chrome.radius,
          boxShadow: chrome.cardStyle === 'flat' ? 'none' : chrome.shadow,
        }}
      >
        <header className={`border-b border-accent/25 px-7 pb-6 pt-10 sm:px-12 sm:pb-7 sm:pt-12 ${chrome.alignmentClass}`} style={{ borderColor: sectionBorderColor }}>
          <p
            data-storefront-field="content.eyebrow"
            data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
            data-storefront-label="Services eyebrow"
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-accent"
          >
            {copy.eyebrow || 'Capabilities'}
          </p>
          <span className={`mt-3 block h-px w-16 bg-accent/65 ${chrome.ruleAlignClass}`} aria-hidden="true" />
          <h2
            data-storefront-field="content.heading"
            data-storefront-source={content.heading ? 'persisted' : 'fallback'}
            data-storefront-label="Services heading"
            className="mt-6 font-serif text-[1.85rem] font-normal leading-[1.12] tracking-[-0.01em] sm:text-[2.45rem]"
            style={{ color: chrome.panelText }}
          >
            {copy.heading}
          </h2>
          {copy.body ? (
            <p
              data-storefront-field="content.body"
              data-storefront-source={content.body ? 'persisted' : 'fallback'}
              data-storefront-label="Services description"
              className={`mt-4 max-w-3xl text-[14px] leading-7 ${chrome.alignment === 'center' ? 'mx-auto' : chrome.alignment === 'right' ? 'ml-auto' : ''}`}
              style={{ color: chrome.panelText, opacity: 0.68 }}
            >
              {copy.body}
            </p>
          ) : null}
        </header>

        <div className={`grid gap-4 p-5 sm:gap-5 sm:p-8 lg:gap-6 lg:p-12 ${chrome.gridClass}`}>
          {items.map((service, index) => {
            const itemId = service.id || `fallback-service-${index}`;
            const IconComponent = getServiceIconComponent(resolveServiceIconKey(service.icon, index)) || Gem;
            const cardText = service.text_color || chrome.panelText;
            return (
              <article
                key={itemId}
                data-storefront-anim-item="true"
                data-storefront-anim-hover="lift"
                data-storefront-field="content.items"
                data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                data-storefront-collection="items"
                data-storefront-item-id={itemId}
                data-storefront-item-index={index}
                data-storefront-item-field="title"
                data-storefront-label={`Service ${index + 1}`}
                className={`group relative isolate flex min-h-[14rem] flex-col overflow-hidden rounded-[1.25rem] border p-6 transition-[transform,border-color,background-color,box-shadow] duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5 sm:p-7 ${chrome.alignmentClass} ${chrome.cardStyleClass}`}
                style={{
                  background: service.background || undefined,
                  color: cardText,
                  animationDelay: `${index * 95}ms`,
                  '--storefront-child-stagger': `${index * 95}ms`,
                }}
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--storefront-accent), transparent)' }}
                  aria-hidden="true"
                />
                {/* Keep a single stable <div> root inside <article> so SSR/client trees match. */}
                <div className="relative flex min-h-0 flex-1 flex-col">
                {/* Corner wash only. A top-edge sweep used to live here, but it is
                    positioned against this padded content box rather than the card,
                    so it drew a hairline straight through the icon/title row. */}
                <span
                  className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full opacity-0 transition-opacity duration-[700ms] group-hover:opacity-100"
                  style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--storefront-accent) 10%, transparent), transparent 70%)' }}
                  aria-hidden="true"
                />

                {/* Icon sits inline with the title on one row; the index numeral was
                    dropped so the eye lands on the service name first. */}
                <div className={`flex items-center gap-4 ${chrome.alignment === 'center' ? 'justify-center' : chrome.alignment === 'right' ? 'flex-row-reverse justify-start text-right' : 'justify-start'}`}>
                  <span
                    className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition-[transform,border-color,background-color] duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-0.5"
                    style={{
                      background: service.icon_background || iconBackground,
                      color: service.icon_color || iconColor,
                      borderColor: 'color-mix(in srgb, var(--storefront-accent) 28%, transparent)',
                    }}
                  >
                    <IconComponent size={19} strokeWidth={1.6} />
                    {/* A single thin ring settling in on hover reads as craft; an inset
                        glow at 40% just muddied the icon. */}
                    <span
                      className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-[600ms] group-hover:opacity-100"
                      style={{ boxShadow: '0 0 0 1px color-mix(in srgb, var(--storefront-accent) 45%, transparent)' }}
                      aria-hidden="true"
                    />
                  </span>
                  <h3
                    data-storefront-field="content.items"
                    data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                    data-storefront-collection="items"
                    data-storefront-item-id={itemId}
                    data-storefront-item-index={index}
                    data-storefront-item-field="title"
                    data-storefront-label={`Service ${index + 1}`}
                    className="min-w-0 font-serif text-[1.2rem] font-medium leading-snug tracking-[-0.01em] transition-colors duration-500 sm:text-[1.28rem]"
                    style={{ color: cardText }}
                  >
                    {service.title}
                  </h3>
                  {chrome.alignment !== 'center' ? (
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/45">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  ) : null}
                </div>
                <p
                  data-storefront-field="content.items"
                  data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                  data-storefront-collection="items"
                  data-storefront-item-id={itemId}
                  data-storefront-item-index={index}
                  data-storefront-item-field="description"
                  data-storefront-label={`Service ${index + 1} description`}
                  className="mt-4 text-[13px] leading-6"
                  style={{ color: cardText, opacity: 0.66 }}
                >
                  {service.description}
                </p>
                {/* mt-auto pins the footer to the card bottom so rows align even when
                    descriptions differ in length. */}
                <div className="mt-auto pt-7">
                  <span
                    className={`block h-px w-8 bg-accent/30 transition-all duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:w-16 group-hover:bg-accent/70 ${chrome.ruleAlignClass}`}
                    aria-hidden="true"
                  />
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-accent/50 transition-colors duration-[600ms] group-hover:text-accent">
                    Learn more
                    <ChevronRight size={12} className="transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1" />
                  </span>
                </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ClassicServicesSection({ profile }) {
  const content = profile.storefront_section_content || {};
  const customItems = content.items;
  const resolvedItems = serviceItems(profile.services, profile.professional_type, customItems);
  const items = resolvedItems.length === 5
    ? [
        ...resolvedItems,
        {
          id: 'classic-service-6',
          title: 'Portfolio Growth Strategy',
          description: 'Build a practical plan around long-term property goals, timing, and next-step opportunities.',
        },
      ]
    : resolvedItems;
  const copy = sectionCopy(profile, { eyebrow: 'Full-service representation', heading: 'The pillars of your move' });
  return (
    <section id="services" className="px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeader {...copy} tone="dark" align="left" editable content={content} />
        <div className="mt-6 grid overflow-hidden border border-slate-200 md:grid-cols-3">
          {items.map((service, index) => (
            <article
              key={service.id || index}
              data-storefront-anim-item="true"
              className={`border-b border-slate-200 p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${service.text_color ? '[&_h3]:!text-current [&_p]:!text-current' : ''}`}
              style={{ background: service.background || undefined, color: service.text_color || undefined }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">0{index + 1}</p>
              <h3 data-storefront-field="content.items" data-storefront-source={Array.isArray(customItems) ? 'persisted' : 'fallback'} data-storefront-collection="items" data-storefront-item-id={service.id || `fallback-service-${index}`} data-storefront-item-index={index} data-storefront-item-field="title" data-storefront-label={`Service ${index + 1}`} className="mt-6 text-lg font-bold text-text-heading">{service.title}</h3>
              <p data-storefront-field="content.items" data-storefront-source={Array.isArray(customItems) ? 'persisted' : 'fallback'} data-storefront-collection="items" data-storefront-item-id={service.id || `fallback-service-${index}`} data-storefront-item-index={index} data-storefront-item-field="description" data-storefront-label={`Service ${index + 1} description`} className="mt-3 text-sm leading-6 text-text-muted">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustrialServicesSection({ profile }) {
  const content = profile.storefront_section_content || {};
  const customItems = content.items;
  const resolvedItems = serviceItems(profile.services, profile.professional_type, customItems);
  const isFirstHomeTemplate = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase() === 'agent-first-home';
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
  const firstHomeSupplementalService = {
    id: 'first-home-service-6',
    title: 'Closing readiness support',
    description: 'Stay prepared through final walkthroughs, paperwork checks, and move-in planning.',
    icon: 'shield',
  };
  const shouldAppendSixth = resolvedItems.length === 5 && (!customItems?.length || isFirstHomeTemplate);
  const items = shouldAppendSixth
    ? [...resolvedItems, isFirstHomeTemplate
      ? firstHomeSupplementalService
      : {
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
  const resolvedItems = serviceItems(
    profile.services,
    profile.professional_type,
    customItems,
  );
  const isFirstHomeTemplate = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase() === 'agent-first-home';
  const sectionLayout = profile?.storefront_section_layout || {};
  const sectionStyle = profile?.storefront_section_style || {};
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const items = isFirstHomeTemplate && resolvedItems.length === 5
    ? [
        ...resolvedItems,
        {
          id: 'first-home-service-6',
          title: 'Closing readiness support',
          description: 'Stay prepared through final walkthroughs, paperwork checks, and move-in planning.',
          icon: 'shield',
        },
      ]
    : resolvedItems;
  const copy = sectionCopy(profile, { eyebrow: 'How we help', heading: 'Support built around you' });
  const hasPersistedItems = Array.isArray(customItems);
  if (isFirstHomeTemplate) {
    const sectionPaddingClass = {
      small: forceCompactPreview ? 'px-2 py-4' : 'px-0 py-4 sm:py-6',
      medium: forceCompactPreview ? 'px-2 py-6' : 'px-0 py-6 sm:py-8',
      large: forceCompactPreview ? 'px-2 py-9' : 'px-0 py-9 sm:py-12',
    }[sectionLayout.padding || 'medium'];
    const widthClass = 'w-full max-w-none';
    const columns = String(sectionLayout.columns || '3');
    const gridColumnsClass = {
      1: 'grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-2 lg:grid-cols-3',
      4: 'md:grid-cols-2 lg:grid-cols-4',
    }[columns] || 'md:grid-cols-2 lg:grid-cols-3';
    const previewGridColumnsClass = forceMobilePreview
      ? 'grid-cols-1'
      : forceTabletPreview
        ? 'sm:grid-cols-2'
        : gridColumnsClass;
    const cardVisualClass = sectionLayout.cardStyle === 'glass'
      ? 'border border-white/70 bg-white/70 backdrop-blur'
      : sectionLayout.cardStyle === 'elevated'
        ? 'border border-transparent bg-white'
        : sectionLayout.cardStyle === 'flat'
          ? 'border border-transparent bg-white/95'
          : 'border border-[#5bd36d]/20 bg-white';
    const cardRadius = {
      none: '0px',
      small: '10px',
      default: '16px',
      medium: '20px',
      large: '28px',
    }[sectionStyle.radius || 'large'] || '28px';
    const cardShadow = {
      none: 'none',
      small: '0 8px 20px rgba(11,61,32,.07)',
      medium: '0 14px 36px rgba(11,61,32,.1)',
      large: '0 22px 54px rgba(11,61,32,.16)',
    }[sectionStyle.shadow || 'small'] || '0 8px 20px rgba(11,61,32,.07)';
    const headerAlign = sectionLayout.alignment || 'center';
    return (
      <section id="services" className={sectionPaddingClass} style={{ color: sectionStyle.textColor || undefined }}>
        <div className={widthClass}>
          <SectionHeader
            {...copy}
            align={headerAlign}
            editable
            content={profile.storefront_section_content || {}}
          />
          <div className={`mt-8 grid auto-rows-fr gap-4 ${previewGridColumnsClass}`}>
            {items.map((service, index) => {
              const itemId = service.id || `fallback-service-${index}`;
              const FallbackIcon = [Target, Home, Handshake, MapPin, Percent, ShieldCheck][index % 6];
              const IconComponent = getServiceIconComponent(resolveServiceIconKey(service?.icon, index)) || FallbackIcon;
              const useCurrentText = Boolean(service.text_color || sectionStyle.textColor);
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
                  className={`text-left transition duration-300 hover:shadow-lg ${cardVisualClass}`}
                  style={{
                    borderRadius: cardRadius,
                    boxShadow: cardShadow,
                    backgroundColor: service.background || undefined,
                    color: service.text_color || undefined,
                  }}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <IconComponent size={17} />
                      </span>
                      <p className={`text-base font-bold ${useCurrentText ? 'text-current' : 'text-text-heading'}`} style={useCurrentText ? { opacity: 0.96 } : undefined}>{service.title}</p>
                    </div>
                    <p className={`mt-1.5 text-sm leading-6 ${useCurrentText ? 'text-current' : 'text-text-muted'}`} style={useCurrentText ? { opacity: 0.86 } : undefined}>{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
  // Warm layout: alternating rows for non-first-home warm templates.
  return (
    <section id="services" className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <SectionHeader {...copy} editable content={profile.storefront_section_content || {}} />
        <div className="mt-10 space-y-5">
          {items.map((service, index) => {
            const itemId = service.id || `fallback-service-${index}`;
            const FallbackIcon = [Target, Home, Handshake, MapPin, Percent, ShieldCheck][index % 6];
            const IconComponent = getServiceIconComponent(resolveServiceIconKey(service?.icon, index)) || FallbackIcon;
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
                className="flex items-start gap-5 rounded-[1.75rem] bg-white/85 p-6 ring-1 ring-sky-100 text-left transition duration-300 hover:shadow-lg sm:gap-7"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <IconComponent size={17} />
                    </span>
                    <p className="text-base font-bold text-text-heading">{service.title}</p>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-text-muted">{service.description}</p>
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
  const sectionContent = profile.storefront_section_content || {};
  const sectionLayout = profile.storefront_section_layout || {};
  const customItems = sectionContent.items;
  const templateKey = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase();
  const isSellerExpertTemplate = templateKey === 'agent-seller-expert';
  const items = useMemo(() => serviceItems(
    profile.services,
    profile.professional_type,
    customItems,
  ), [customItems, profile.professional_type, profile.services]);
  const copy = sectionCopy(profile, { eyebrow: 'Choose your path', heading: 'Start with the right service' });
  const hasPersistedItems = Array.isArray(customItems);
  const [expandedSellerCards, setExpandedSellerCards] = useState({});
  const [sellerExpandableCards, setSellerExpandableCards] = useState({});
  const sellerDescriptionRefs = useRef({});
  const sellerItems = useMemo(() => (
    isSellerExpertTemplate && items.length < 6
      ? [...items, ...SELLER_SUPPLEMENTAL_SERVICE_ITEMS.slice(0, 6 - items.length)]
      : items
  ), [isSellerExpertTemplate, items]);
  const sellerGridClass = profile?.storefront_builder_preview
    && profile?.storefront_preview_mode === 'mobile'
    ? 'grid-cols-1'
    : profile?.storefront_builder_preview
      && profile?.storefront_preview_mode === 'tablet'
      ? 'grid-cols-2'
      : ({
          1: 'md:grid-cols-1',
          2: 'md:grid-cols-2',
          3: 'md:grid-cols-3',
          4: 'md:grid-cols-4',
        }[Number(sectionLayout.columns) || 3] || 'md:grid-cols-3');
  useEffect(() => {
    if (!isSellerExpertTemplate) return;
    const frame = window.requestAnimationFrame(() => {
      const next = {};
      sellerItems.forEach((service, index) => {
        const itemId = service.id || `fallback-service-${index}`;
        const node = sellerDescriptionRefs.current[itemId];
        next[itemId] = Boolean(node && node.scrollHeight > node.clientHeight + 1);
      });
      setSellerExpandableCards((current) => {
        const keys = Object.keys(next);
        const unchanged = keys.length === Object.keys(current).length
          && keys.every((key) => current[key] === next[key]);
        return unchanged ? current : next;
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isSellerExpertTemplate, sellerItems]);
  useEffect(() => {
    if (!isSellerExpertTemplate) return;
    const handlePointerDown = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-seller-readmore-button="true"]')) {
        return;
      }
      setExpandedSellerCards({});
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isSellerExpertTemplate]);
  if (isSellerExpertTemplate) {
    return (
      <section id="services" className="w-full px-5 py-10 sm:px-8 sm:py-12 lg:px-12 2xl:px-16">
        <div className="w-full max-w-none">
          <SectionHeader {...copy} align="left" editable content={profile.storefront_section_content || {}} />
          <div className={`mt-8 grid items-start gap-4 ${sellerGridClass}`}>
            {sellerItems.map((service, index) => {
              const itemId = service.id || `fallback-service-${index}`;
              const FallbackIcon = [Target, TrendingUp, Building2, Home, ShieldCheck, Handshake][index % 6];
              const IconComponent = getServiceIconComponent(resolveServiceIconKey(service?.icon, index)) || FallbackIcon;
              const description = String(service.description || '').trim();
              const isExpanded = Boolean(expandedSellerCards[itemId]);
              const canExpand = Boolean(sellerExpandableCards[itemId]);
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
                  className={`group relative self-start overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1324] px-5 py-[1.125rem] text-left text-white shadow-[0_16px_34px_rgba(2,6,23,0.28)] transition duration-300 hover:-translate-y-1 hover:border-accent/55 hover:shadow-[0_22px_44px_rgba(2,6,23,0.34)] ${isExpanded ? 'h-auto min-h-[188px]' : 'h-[188px]'}`}
                  style={{ background: service.background || undefined, color: service.text_color || undefined }}
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
                  <div className="flex h-full flex-col justify-start">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-accent ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
                        style={{
                          background: service.icon_background || sectionContent.icon_background || undefined,
                          color: service.icon_color || sectionContent.icon_color || undefined,
                        }}
                      >
                        <IconComponent size={16} />
                      </span>
                      <p className="text-[15px] font-semibold leading-tight text-white" style={{ color: service.text_color || undefined }}>{service.title}</p>
                    </div>
                    <p
                      ref={(node) => {
                        if (node) sellerDescriptionRefs.current[itemId] = node;
                        else delete sellerDescriptionRefs.current[itemId];
                      }}
                      className={`${isExpanded ? '' : 'line-clamp-2'} text-[12px] leading-6 text-slate-200/80`}
                      style={{ color: service.text_color || undefined }}
                    >
                      {description}
                    </p>
                    {canExpand ? (
                      <button
                        type="button"
                        data-seller-readmore-button="true"
                        onClick={() => setExpandedSellerCards((prev) => ({ ...prev, [itemId]: !prev[itemId] }))}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent"
                      >
                        {isExpanded ? 'Read less' : 'Read more'}
                        <ChevronRight size={12} className={`transition ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
  // Funnel layout: numbered stepper rail with a connector spine — reads as a
  // sequence to advance through, not a menu of equal cards.
  return (
    <section id="services" className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeader {...copy} align="left" editable content={profile.storefront_section_content || {}} />
        <div className="relative mt-9 pl-10">
          <div className="absolute bottom-4 left-[19px] top-4 w-0.5 bg-gradient-to-b from-rose-300 via-rose-200 to-transparent" />
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
                className="group relative mb-3 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-sm transition duration-300 last:mb-0 hover:border-primary/40 hover:shadow-lg"
              >
                <span className="absolute -left-10 top-5 grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold ring-4 ring-white" style={{ color: 'var(--storefront-primary-contrast, #fff)' }}>
                  {index + 1}
                </span>
                <p className="text-base font-bold text-text-heading">{service.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-text-muted">{service.description}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Advance this step
                  <ChevronRight size={13} className="transition group-hover:translate-x-0.5" />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function NeighborhoodServicesSection({ profile }) {
  const customItems = profile.storefront_section_content?.items;
  const resolvedItems = serviceItems(profile.services, profile.professional_type, customItems);
  // Fill the 3-column grid to the builder max (6) when exactly five services exist.
  // Keep this id stable so builder selection/edit can materialize the same card.
  const communitySupplemental = {
    id: 'community-service-6',
    title: 'Neighborhood timing & offer strategy',
    description: 'Know when to move, what to offer, and how local demand shapes your next step.',
    icon: 'shield',
    background: '',
    text_color: '',
    icon_background: '',
    icon_color: '',
  };
  const items = resolvedItems.length === 5
    ? [...resolvedItems, communitySupplemental]
    : resolvedItems;
  const copy = sectionCopy(profile, { eyebrow: 'Local atlas', heading: 'Context that makes an area feel like home' });
  const hasPersistedItems = Array.isArray(customItems);
  const content = profile.storefront_section_content || {};
  const layout = profile.storefront_section_layout || {};
  const sectionStyle = profile.storefront_section_style || {};
  const forceMobilePreview = profile.storefront_builder_preview && profile.storefront_preview_mode === 'mobile';
  const forceTabletPreview = profile.storefront_builder_preview && profile.storefront_preview_mode === 'tablet';
  const columns = String(layout.columns || '3');
  const gridClass = forceMobilePreview
    ? 'grid-cols-1'
    : forceTabletPreview
      ? 'grid-cols-2'
      : ({ 1: 'grid-cols-1', 2: 'sm:grid-cols-2', 3: 'md:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[columns] || 'md:grid-cols-3');
  const widthClass = { narrow: 'mx-auto max-w-5xl', contained: 'mx-auto max-w-6xl', full: 'w-full max-w-none' }[layout.width || 'full'] || 'w-full max-w-none';
  const paddingClass = { none: 'py-0', small: 'py-5', medium: 'py-8 sm:py-10', large: 'py-12 sm:py-16' }[layout.padding || 'none'] || 'py-0';
  const alignmentClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[layout.alignment || 'left'] || 'text-left';
  const radius = { none: 0, small: 12, default: 16, medium: 20, large: 28, full: 36 }[sectionStyle.radius || 'default'] ?? 16;
  const shadow = {
    none: 'none',
    small: '0 8px 24px rgba(15,23,42,.10)',
    medium: '0 18px 48px rgba(15,23,42,.14)',
    large: '0 28px 70px rgba(15,23,42,.18)',
  }[sectionStyle.shadow || 'none'] || 'none';
  const panelText = sectionStyle.textColor || '#ffffff';
  const cardClass = {
    flat: 'border-transparent bg-transparent',
    bordered: 'border-white/20 bg-transparent',
    elevated: 'border-transparent bg-white/[.08]',
    glass: 'border-white/15 bg-white/[.07] backdrop-blur-sm',
  }[layout.cardStyle || 'glass'] || 'border-white/15 bg-white/[.07] backdrop-blur-sm';
  const fieldProps = (field, label) => ({
    'data-storefront-field': `content.${field}`,
    'data-storefront-source': content[field] ? 'persisted' : 'fallback',
    'data-storefront-label': label,
  });
  return (
    <section id="services" className={`w-full ${paddingClass}`}>
      <div
        className={`relative overflow-hidden border-y ${widthClass} ${alignmentClass}`}
        style={{
          background: sectionStyle.background || 'color-mix(in srgb, var(--storefront-primary, #17152b) 72%, #061022)',
          color: panelText,
          borderColor: sectionStyle.borderColor || 'color-mix(in srgb, var(--storefront-accent, #1f6fbf) 24%, transparent)',
          borderRadius: radius,
          boxShadow: shadow,
        }}
      >
        <div className="relative border-b border-white/10 p-6 sm:p-9">
          <div className="max-w-3xl">
            <div>
              <p {...fieldProps('eyebrow', 'Services eyebrow')} className="text-[10px] font-bold uppercase tracking-[.24em] text-white">{copy.eyebrow}</p>
              <h2 {...fieldProps('heading', 'Services heading')} className="mt-1 text-2xl font-bold tracking-[-.03em] text-current sm:text-3xl">{copy.heading}</h2>
            </div>
          </div>
          {copy.body ? (
            <p {...fieldProps('body', 'Services description')} className="mt-4 max-w-2xl text-[13px] leading-6 text-current opacity-80">{copy.body}</p>
          ) : null}
        </div>
        <div className={`relative grid gap-4 p-5 sm:p-7 ${gridClass}`}>
          <span className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[4.15rem] hidden h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent md:block" />
          {items.map((service, index) => {
            const itemId = service.id || `fallback-service-${index}`;
            const isSupplementalPad = itemId === 'community-service-6'
              && (!Array.isArray(customItems) || !customItems.some((item) => item?.id === itemId));
            const IconComponent = getServiceIconComponent(resolveServiceIconKey(service.icon, index)) || MapPin;
            const source = isSupplementalPad ? 'fallback' : (hasPersistedItems ? 'persisted' : 'fallback');
            const cardText = service.text_color || '#ffffff';
            return (
              <article
                key={itemId}
                data-storefront-anim-item="true"
                className={`group relative min-h-[12rem] overflow-hidden border p-6 transition duration-300 hover:-translate-y-1 sm:p-7 ${cardClass}`}
                style={{
                  background: service.background || undefined,
                  color: cardText,
                  borderColor: 'color-mix(in srgb, var(--storefront-accent, #1f6fbf) 25%, transparent)',
                  borderRadius: radius,
                  boxShadow: layout.cardStyle === 'flat' ? 'none' : shadow,
                }}
              >
                <span className="pointer-events-none absolute right-0 top-0 h-12 w-12 border-r border-t border-accent/30" />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/25 text-white"
                      style={{
                        background: service.icon_background || 'rgba(255,255,255,.1)',
                        color: service.icon_color || '#ffffff',
                      }}
                    >
                      <IconComponent size={15} />
                    </span>
                    <h3
                      data-storefront-field="content.items"
                      data-storefront-source={source}
                      data-storefront-collection="items"
                      data-storefront-item-id={itemId}
                      data-storefront-item-index={index}
                      data-storefront-item-field="title"
                      data-storefront-label={`Service ${index + 1}`}
                      className="text-sm font-bold leading-5 text-current"
                    >
                      {service.title}
                    </h3>
                  </div>
                </div>
                <p
                  data-storefront-field="content.items"
                  data-storefront-source={source}
                  data-storefront-collection="items"
                  data-storefront-item-id={itemId}
                  data-storefront-item-index={index}
                  data-storefront-item-field="description"
                  data-storefront-label={`Service ${index + 1} description`}
                  className="mt-5 text-xs leading-5 text-current opacity-75"
                >
                  {service.description}
                </p>
                <span className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LuxuryTestimonialsSection({ profile, testimonials }) {
  const content = profile.storefront_section_content || {};
  const legacyHeading = /^(client confidence|trusted relationships)$/i.test(String(content.heading || '').trim());
  const legacyBody = /privacy and precision/i.test(String(content.body || ''));
  const copy = {
    eyebrow: content.eyebrow || 'Client stories',
    heading: (!content.heading || legacyHeading) ? 'Stories of refined living' : content.heading,
    body: (!content.body || legacyBody) ? 'Trusted by clients worldwide' : content.body,
  };
  // Delegates to the shared feedback section so live reviews and the
  // "Leave feedback" submission flow keep working; that component now reads the
  // builder layout/style controls itself.
  const chrome = luxuryChrome(profile, { defaultColumns: '3', defaultRadius: 'large', defaultShadow: 'medium' });
  return (
    <IndustrialClientFeedbackSection
      profile={profile}
      testimonials={testimonials}
      copy={copy}
      variant="luxury"
      sectionId="reviews"
      className={chrome.horizontalClass}
    />
  );
}

export function ClassicTestimonialsSection({ profile, testimonials }) {
  const copy = sectionCopy(profile, { eyebrow: 'Client outcomes', heading: 'Relationships built around results' });
  return <IndustrialClientFeedbackSection profile={profile} testimonials={testimonials} copy={copy} />;
}

export function IndustrialTestimonialsSection({ profile }) {
  const copy = sectionCopy(profile, { eyebrow: 'Verified outcomes', heading: 'Performance signals' });
  return <IndustrialClientFeedbackSection profile={profile} testimonials={profile.client_feedback || []} copy={copy} />;
}

export function WarmTestimonialsSection({ profile, testimonials }) {
  const isFirstHomeTemplate = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase() === 'agent-first-home';
  const copy = sectionCopy(profile, { eyebrow: 'Success stories', heading: 'What clients say' });
  if (isFirstHomeTemplate) {
    return (
      <IndustrialClientFeedbackSection
        profile={profile}
        testimonials={testimonials}
        copy={copy}
        sectionId="reviews"
      />
    );
  }
  const items = testimonialItems(testimonials, profile);
  return (
    <section id="reviews" className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-8">
        <SectionHeader {...copy} editable content={profile.storefront_section_content || {}} />
        <div className="mt-7 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article key={`${item.name}-${index}`} data-storefront-anim-item="true" data-storefront-field="content.items" data-storefront-source={profile.storefront_section_content?.items ? 'persisted' : 'fallback'} data-storefront-collection="items" data-storefront-item-id={item.id} data-storefront-item-index={index} data-storefront-item-field="text" data-storefront-label={`Client story ${index + 1}`} className="relative rounded-[1.5rem] bg-sky-50 p-5 before:absolute before:-bottom-2 before:left-8 before:h-4 before:w-4 before:rotate-45 before:bg-sky-50">
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
  const copy = sectionCopy(profile, { eyebrow: 'Social proof', heading: 'Results clients remember' });
  return (
    <IndustrialClientFeedbackSection
      profile={profile}
      testimonials={testimonials}
      copy={copy}
      sectionId="reviews"
      variant="seller"
    />
  );
}

export function NeighborhoodTestimonialsSection({ profile, testimonials }) {
  const copy = sectionCopy(profile, { eyebrow: 'Neighbor stories', heading: 'Moves made with local confidence' });
  return (
    <IndustrialClientFeedbackSection
      profile={profile}
      testimonials={testimonials}
      copy={copy}
      sectionId="reviews"
    />
  );
}

export function LuxuryMortgageProgramsSection({ profile, actions }) {
  const items = programItems(profile.mortgage_programs);
  const copy = sectionCopy(profile, { eyebrow: 'Capital strategies', heading: 'Mortgage solutions' });
  if (!items.length) return null;
  return (
    <section id="programs" className="px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeader {...copy} tone="gold" editable content={profile.storefront_section_content || {}} />
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
        <SectionHeader {...copy} tone="dark" align="left" editable content={profile.storefront_section_content || {}} />
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
        <SectionHeader {...copy} editable content={profile.storefront_section_content || {}} />
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
        <SectionHeader {...copy} editable content={profile.storefront_section_content || {}} />
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
