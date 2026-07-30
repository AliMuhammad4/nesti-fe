'use client';

import { Handshake } from 'lucide-react';
import {
  getServiceIconComponent,
  resolveServiceIconKey,
} from '@/components/storefront/builder/storefrontServiceIcons';

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

export default function PublicServices({
  services = [],
  professionalType,
  content = {},
  sectionStyle = {},
  layout = {},
  preview = false,
  previewMode = 'desktop',
}) {
  const forceMobilePreview = Boolean(preview && previewMode === 'mobile');
  const forceTabletPreview = Boolean(preview && previewMode === 'tablet');
  const hasCustomServices = Object.prototype.hasOwnProperty.call(content, 'items');
  const displayServices = (hasCustomServices
    ? content.items
    : (services?.length ? services : (fallbackServices[professionalType] || fallbackServices.agent))
  ).map((service, index) => ({
    ...service,
    id: service?.id || `fallback-service-${index}`,
    title: service?.title || service?.name || '',
    description: service?.description || service?.text || '',
    icon: resolveServiceIconKey(service?.icon, index),
    background: service?.background || '',
    text_color: service?.text_color || '',
    icon_background: service?.icon_background || '',
    icon_color: service?.icon_color || '',
  })).filter((service) => service.title);
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
  const eyebrow = (content.eyebrow || '').trim() || 'Services';
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const iconBackground = content.icon_background || '';
  const iconColor = content.icon_color || '';
  const columns = String(layout.columns || '3');
  const gridClass = forceMobilePreview
    ? 'grid-cols-1'
    : forceTabletPreview
      ? 'sm:grid-cols-2'
      : {
    1: 'md:grid-cols-1 lg:grid-cols-1',
    2: 'md:grid-cols-2 lg:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
      }[columns] || 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section
      id="services"
      className="bg-transparent py-12 sm:py-14"
      style={{ color: sectionStyle.textColor || undefined }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl text-center mx-auto">
          <p
            data-storefront-field="content.eyebrow"
            data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
            data-storefront-label="Services eyebrow"
            className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
              hasCustomTextColor ? 'text-current' : 'text-slate-500'
            }`}
            style={hasCustomTextColor ? { opacity: 0.72 } : undefined}
          >
            {eyebrow}
          </p>
          <h2
            data-storefront-field="content.heading"
            data-storefront-source={content.heading ? 'persisted' : 'fallback'}
            data-storefront-label="Services heading"
            className={`text-2xl font-bold tracking-tight sm:text-3xl ${
              hasCustomTextColor ? 'text-current' : 'text-slate-900'
            }`}
          >
            {title}
          </h2>
          <p
            data-storefront-field="content.body"
            data-storefront-source={content.body ? 'persisted' : 'fallback'}
            data-storefront-label="Services description"
            className={`mt-3 text-sm leading-6 ${
              hasCustomTextColor ? 'text-current' : 'text-slate-500'
            }`}
            style={hasCustomTextColor ? { opacity: 0.86 } : undefined}
          >
            {description}
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-4 ${gridClass} md:gap-5`}>
          {displayServices.map((service, index) => {
            const IconComponent = getServiceIconComponent(service.icon);
            const hasCardText = Boolean(service.text_color);
            const serviceIconBackground = service.icon_background || iconBackground;
            const serviceIconColor = service.icon_color || iconColor;
            return (
              <div
                key={service.id || index}
                data-storefront-anim-item="true"
                data-storefront-field="content.items"
                data-storefront-source={hasCustomServices ? 'persisted' : 'fallback'}
                data-storefront-collection="items"
                data-storefront-item-id={service.id}
                data-storefront-item-index={index}
                data-storefront-item-field="title"
                data-storefront-label={`Service ${index + 1}`}
                className="rounded-xl border border-slate-200/90 p-5 transition duration-200 group hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                style={{
                  backgroundColor: service.background || '#ffffff',
                  ...(service.text_color ? { color: service.text_color } : {}),
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105 ${
                      serviceIconBackground || serviceIconColor ? '' : 'bg-primary/10 text-primary'
                    }`}
                    style={{
                      ...(serviceIconBackground ? { backgroundColor: serviceIconBackground } : {}),
                      ...(serviceIconColor ? { color: serviceIconColor } : {}),
                    }}
                  >
                    {IconComponent ? <IconComponent size={28} /> : <Handshake size={28} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      data-storefront-field="content.items"
                      data-storefront-source={hasCustomServices ? 'persisted' : 'fallback'}
                      data-storefront-collection="items"
                      data-storefront-item-id={service.id}
                      data-storefront-item-field="title"
                      data-storefront-label={`Service ${index + 1} title`}
                      className={`text-base font-semibold mb-1.5 ${hasCardText || hasCustomTextColor ? 'text-current' : 'text-slate-900'}`}
                    >
                      {service.title}
                    </h3>
                    <p
                      data-storefront-field="content.items"
                      data-storefront-source={hasCustomServices ? 'persisted' : 'fallback'}
                      data-storefront-collection="items"
                      data-storefront-item-id={service.id}
                      data-storefront-item-field="description"
                      data-storefront-label={`Service ${index + 1} description`}
                      className={`text-sm leading-6 ${hasCardText || hasCustomTextColor ? 'text-current' : 'text-text-muted'}`}
                      style={hasCardText || hasCustomTextColor ? { opacity: 0.86 } : undefined}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
