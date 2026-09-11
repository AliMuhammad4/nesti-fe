'use client';

import {
  Award,
  BadgeDollarSign,
  BarChart3,
  Building2,
  CircleDollarSign,
  Languages,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { formatProfileBusinessField } from '@/lib/profileFieldDisplay';
import {
  getServiceIconComponent,
  resolveServiceIconKey,
} from '@/components/storefront/builder/storefrontServiceIcons';

const metricIcons = [Trophy, BarChart3, Sparkles, MapPinned];
const sellerPerformanceMetrics = [
  { label: 'Homes sold', source: 'closed_seller_leads' },
  { label: 'Experience', source: 'years_experience' },
  { label: 'Client rating', source: 'rating' },
  { label: 'Available options', source: 'available_seller_leads' },
];
const credentialIcons = {
  credentials: ShieldCheck,
  specialty: Target,
  languages: Languages,
  company: Building2,
  total_clients: Users,
  active_pipeline_value: CircleDollarSign,
  total_sold_home_value: BadgeDollarSign,
};
const responsiveGridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function gridColumnsClass(value, fallback = '4') {
  return responsiveGridColumns[String(value || fallback)] || responsiveGridColumns[fallback];
}

function storefrontGridColumnsClass(profile, value, fallback = '4') {
  if (profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'mobile') {
    return 'grid-cols-1';
  }
  if (profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'tablet') {
    return 'grid-cols-2';
  }
  return gridColumnsClass(value, fallback);
}

function performanceCardClass(cardStyle = 'bordered') {
  const styles = {
    flat: 'bg-white/[0.045]',
    bordered: 'bg-white/[0.055] ring-1 ring-white/[0.06]',
    elevated: 'bg-white/[0.065] shadow-[0_16px_34px_rgba(0,0,0,.2)]',
    glass: 'bg-white/[0.07] backdrop-blur-md ring-1 ring-white/[0.08]',
  };
  return styles[cardStyle] || styles.bordered;
}

function caseStudyCardClass(cardStyle = 'bordered') {
  const styles = {
    flat: 'bg-slate-50',
    bordered: 'bg-slate-50 ring-1 ring-slate-200/70',
    elevated: 'bg-white shadow-[0_16px_36px_rgba(15,23,42,.1)]',
    glass: 'bg-white/70 backdrop-blur-md ring-1 ring-white/80 shadow-[0_14px_34px_rgba(15,23,42,.08)]',
  };
  return styles[cardStyle] || styles.bordered;
}

function credentialCardClass(cardStyle = 'bordered') {
  const styles = {
    flat: 'bg-white/65',
    bordered: 'bg-white ring-1 ring-slate-200/80',
    elevated: 'bg-white shadow-[0_14px_34px_rgba(15,23,42,.1)]',
    glass: 'bg-white/70 backdrop-blur-md ring-1 ring-white/80 shadow-[0_12px_30px_rgba(15,23,42,.08)]',
  };
  return styles[cardStyle] || styles.bordered;
}

function caseStudyRadiusClass(radius = 'default') {
  return {
    none: 'rounded-none',
    large: 'rounded-[1.75rem]',
    default: 'rounded-2xl',
  }[radius] || 'rounded-2xl';
}

function caseStudyShadowValue(shadow = 'none') {
  return {
    none: '',
    small: '0 8px 20px rgba(15,23,42,.07)',
    medium: '0 14px 32px rgba(15,23,42,.1)',
    large: '0 22px 48px rgba(15,23,42,.14)',
  }[shadow] || '';
}

function profileEssentials(profile = {}) {
  return profile.brand_kit?.essentials
    || profile.storefront_brand_kit?.essentials
    || profile.storefront_essentials
    || {};
}

function feedbackRating(profile = {}) {
  const backendAverage = Number(profile.client_rating_average);
  if (
    profile.client_rating_average !== null
    && profile.client_rating_average !== undefined
    && Number.isFinite(backendAverage)
    && backendAverage > 0
  ) {
    return `${Number.isInteger(backendAverage) ? backendAverage : backendAverage.toFixed(1)}/5`;
  }
  const feedback = Array.isArray(profile.testimonials) ? profile.testimonials : [];
  const ratings = feedback
    .map((item) => Number(item?.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  if (!ratings.length) return '';
  const average = ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
  return `${Number.isInteger(average) ? average : average.toFixed(1)}/5`;
}

function resolveMetricValue(item = {}, profile = {}) {
  const essentials = profileEssentials(profile);
  if (item.source === 'years_experience') {
    const experience = item.value
      || profile.professional_profile?.experience
      || profile.professional_profile?.experience_level
      || essentials.years_experience
      || '';
    return formatProfileBusinessField('Experience', experience);
  }
  if (String(item.value || '').trim()) return item.value;
  if (['sold_count', 'closed_seller_leads'].includes(item.source)) {
    const closedSellerLeads = Number(profile.closed_seller_leads_count);
    return Number.isFinite(closedSellerLeads) && closedSellerLeads >= 0
      ? String(closedSellerLeads)
      : '';
  }
  if (item.source === 'rating') return feedbackRating(profile);
  if (['available_seller_leads', 'service_areas'].includes(item.source)) {
    const availableSellerLeads = Number(profile.available_seller_leads_count);
    return Number.isFinite(availableSellerLeads) && availableSellerLeads >= 0
      ? String(availableSellerLeads)
      : '';
  }
  return '';
}

function resolveCredentialValue(item = {}, profile = {}) {
  if (String(item.issuer || item.value || '').trim()) return item.issuer || item.value;
  const sellerMetrics = profile.seller_credential_metrics;
  if (sellerMetrics && item.source === 'total_clients') {
    const count = Number(sellerMetrics.total_clients);
    return Number.isFinite(count)
      ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(count)
      : '';
  }
  if (sellerMetrics && ['active_pipeline_value', 'total_sold_home_value'].includes(item.source)) {
    const amount = Number(sellerMetrics[item.source]);
    if (!Number.isFinite(amount)) return '';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: sellerMetrics.currency || 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount);
    } catch {
      return `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(amount)}`;
    }
  }
  const essentials = profileEssentials(profile);
  if (item.source === 'company') {
    return profile.professional_profile?.company_name || profile.company_name || '';
  }
  return essentials[item.source] || '';
}

function normalizeSellerCredentialItem(item = {}) {
  if (
    item.source === 'total_clients'
    && String(item.title || '').trim().toLowerCase() === 'total seller clients'
  ) {
    return { ...item, title: 'Clients' };
  }
  if (String(item.issuer || item.value || '').trim()) return item;
  const legacyMetricMap = {
    'professional credentials:credentials': {
      title: 'Clients',
      source: 'total_clients',
    },
    'market specialty:specialty': {
      title: 'Active pipeline value',
      source: 'active_pipeline_value',
    },
    'languages:languages': {
      title: 'Sold property value',
      source: 'total_sold_home_value',
    },
  };
  const key = `${String(item.title || '').trim().toLowerCase()}:${String(item.source || '').trim().toLowerCase()}`;
  return legacyMetricMap[key] ? { ...item, ...legacyMetricMap[key] } : item;
}

function SellerSectionHeader({
  eyebrow,
  heading,
  body,
  inverse = false,
  alignment = 'center',
  useInheritedColor = false,
  content = {},
}) {
  const alignmentClass = alignment === 'right'
    ? 'ml-auto text-right'
    : alignment === 'left'
      ? 'mr-auto text-left'
      : 'mx-auto text-center';
  const bodyAlignmentClass = alignment === 'right'
    ? 'ml-auto'
    : alignment === 'left'
      ? 'mr-auto'
      : 'mx-auto';
  return (
    <div className={`max-w-3xl ${alignmentClass}`}>
      {eyebrow ? (
        <p
          data-storefront-field="content.eyebrow"
          data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
          data-storefront-label="Section eyebrow"
          className={`text-[11px] font-bold uppercase tracking-[0.2em] ${inverse ? 'text-accent' : 'text-primary'}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        data-storefront-field="content.heading"
        data-storefront-source={content.heading ? 'persisted' : 'fallback'}
        data-storefront-label="Section heading"
        className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${inverse ? 'text-white' : useInheritedColor ? 'text-current' : 'text-slate-950'}`}
      >
        {heading}
      </h2>
      {body ? (
        <p
          data-storefront-field="content.body"
          data-storefront-source={content.body ? 'persisted' : 'fallback'}
          data-storefront-label="Section description"
          className={`${bodyAlignmentClass} mt-3 max-w-2xl text-sm leading-6 ${inverse ? 'text-slate-300' : useInheritedColor ? 'text-current' : 'text-slate-600'}`}
          style={useInheritedColor ? { opacity: 0.78 } : undefined}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function SellerPerformanceSection({ profile = {}, block = {} }) {
  const content = block?.data?.content || {};
  const configuredItems = Array.isArray(content.items) ? content.items : [];
  const items = sellerPerformanceMetrics.map((fallback, index) => {
    const configured = configuredItems.find((item) => item?.source === fallback.source)
      || configuredItems[index];
    return configured
      ? { ...fallback, ...configured, source: configured.source || fallback.source }
      : fallback;
  });
  const columnsClass = storefrontGridColumnsClass(profile, block?.data?.layout?.columns, '4');
  const cardClass = performanceCardClass(block?.data?.layout?.cardStyle);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#020617] via-[#0b1222] to-[#111827] px-5 py-8 shadow-[0_24px_60px_rgba(2,6,23,.24)] sm:px-8 sm:py-10 lg:px-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
      <SellerSectionHeader
        eyebrow={content.eyebrow}
        heading={content.heading || 'Seller performance'}
        body={content.body}
        inverse
        alignment={block?.data?.layout?.alignment || 'center'}
        content={content}
      />
      <div className={`relative mt-7 grid gap-3 ${columnsClass}`}>
        {items.map((item, index) => {
          const Icon = metricIcons[index % metricIcons.length];
          const value = resolveMetricValue(item, profile) || '—';
          const experienceParts = item.source === 'years_experience'
            ? String(value).match(/^(.*?)\s*(\([^)]*\))$/)
            : null;
          return (
            <article
              key={item.id || `${item.label}-${index}`}
              data-storefront-anim-item="true"
              className={`group rounded-2xl p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.06)] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08] ${cardClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">
                    {experienceParts ? experienceParts[1] : value}
                    {experienceParts ? (
                      <span className="mt-0.5 block text-sm font-semibold tracking-normal text-slate-300">
                        {experienceParts[2]}
                      </span>
                    ) : null}
                  </p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent transition group-hover:scale-110">
                  <Icon size={17} />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function SellerCaseStudySection({ profile = {}, block = {} }) {
  const content = block?.data?.content || {};
  const items = (Array.isArray(content.items) ? content.items : []).slice(0, 6);
  const columnsClass = storefrontGridColumnsClass(profile, block?.data?.layout?.columns, '3');
  const cardClass = caseStudyCardClass(block?.data?.layout?.cardStyle);
  const radiusClass = caseStudyRadiusClass(block?.data?.style?.radius);
  const shadowValue = caseStudyShadowValue(block?.data?.style?.shadow);
  const defaultIcons = ['target', 'sparkles', 'shield'];

  return (
    <div className="relative isolate w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <SellerSectionHeader
        eyebrow={content.eyebrow}
        heading={content.heading || 'Seller success story'}
        body={content.body}
        alignment={block?.data?.layout?.alignment || 'center'}
        useInheritedColor={Boolean(block?.data?.style?.textColor)}
        content={content}
      />
      <div className={`mt-8 grid auto-rows-fr gap-4 lg:gap-5 ${columnsClass}`}>
        {items.map((item, index) => {
          const itemId = item.id || `seller-story-${index}`;
          const iconKey = resolveServiceIconKey(item.icon || defaultIcons[index % defaultIcons.length], index);
          const Icon = getServiceIconComponent(iconKey);
          const description = item.description || item.text || '';
          return (
            <article
              key={itemId}
              data-storefront-anim-item="true"
              data-storefront-field="content.items"
              data-storefront-source="persisted"
              data-storefront-collection="items"
              data-storefront-item-id={itemId}
              data-storefront-item-index={index}
              data-storefront-item-field="title"
              data-storefront-label={`Success story card ${index + 1}`}
              className={`group relative flex min-h-[9.5rem] min-w-0 flex-col overflow-hidden p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,.11)] sm:p-6 ${radiusClass} ${cardClass}`}
              style={{
                ...(item.background ? { backgroundColor: item.background } : {}),
                ...(item.text_color ? { color: item.text_color } : {}),
                ...(shadowValue ? { boxShadow: shadowValue } : {}),
              }}
            >
              <div className="relative z-10 flex items-center gap-3.5">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-[0_8px_20px_rgba(15,23,42,.16)] transition group-hover:rotate-3 group-hover:scale-105"
                  style={{
                    ...(item.icon_background || content.icon_background
                      ? { backgroundColor: item.icon_background || content.icon_background }
                      : {}),
                    ...(item.icon_color || content.icon_color
                      ? { color: item.icon_color || content.icon_color }
                      : {}),
                  }}
                >
                  <Icon size={19} />
                </span>
                <h3
                  data-storefront-field="content.items"
                  data-storefront-source="persisted"
                  data-storefront-collection="items"
                  data-storefront-item-id={itemId}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  data-storefront-label={`Success story title ${index + 1}`}
                  className={`min-w-0 text-[15px] font-bold leading-5 ${item.text_color ? 'text-current' : 'text-slate-950'}`}
                >
                  {item.title}
                </h3>
              </div>
              <p
                data-storefront-field="content.items"
                data-storefront-source="persisted"
                data-storefront-collection="items"
                data-storefront-item-id={itemId}
                data-storefront-item-index={index}
                data-storefront-item-field="description"
                data-storefront-label={`Success story description ${index + 1}`}
                className={`relative z-10 mt-4 flex-1 text-sm leading-6 ${item.text_color ? 'text-current' : 'text-slate-600'}`}
                style={item.text_color ? { opacity: 0.82 } : undefined}
              >
                {description}
              </p>
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-accent/[0.06] blur-2xl transition group-hover:bg-accent/[0.1]" />
              <span className="absolute bottom-0 left-0 h-0.5 w-12 bg-accent/70 transition-all duration-300 group-hover:w-full" />
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function SellerCredentialsSection({ profile = {}, block = {} }) {
  const content = block?.data?.content || {};
  const layout = block?.data?.layout || {};
  const style = block?.data?.style || {};
  const configured = Array.isArray(content.items)
    ? content.items.map(normalizeSellerCredentialItem)
    : [];
  const items = configured
    .map((item) => ({ ...item, resolvedValue: resolveCredentialValue(item, profile) }))
    .filter((item) => String(item.resolvedValue || '').trim())
    .slice(0, 6);
  const columns = Number(content.metrics_layout_version || 0) >= 2
    ? layout.columns
    : '4';
  const columnsClass = storefrontGridColumnsClass(profile, columns, '4');
  const cardClass = credentialCardClass(layout.cardStyle);
  const radiusClass = caseStudyRadiusClass(style.radius);
  const shadowValue = caseStudyShadowValue(style.shadow);
  const hasCustomTextColor = Boolean(style.textColor);

  return (
    <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <SellerSectionHeader
        eyebrow={content.eyebrow}
        heading={content.heading || 'Credentials and recognition'}
        body={content.body}
        alignment={layout.alignment || 'center'}
        useInheritedColor={hasCustomTextColor}
        content={content}
      />
      <div className={`mt-8 grid auto-rows-fr gap-4 ${columnsClass}`}>
        {(items.length ? items : [{ title: 'Professional details', resolvedValue: 'Available on request', source: 'credentials' }])
          .map((item, index) => {
            const Icon = credentialIcons[item.source] || Award;
            return (
              <article
                key={item.id || `${item.title}-${index}`}
                data-storefront-anim-item="true"
                className={`group relative flex min-h-40 flex-col overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,23,42,.14)] sm:p-6 ${radiusClass} ${cardClass}`}
                style={{
                  ...(shadowValue ? { boxShadow: shadowValue } : {}),
                  ...(hasCustomTextColor ? { color: style.textColor } : {}),
                }}
              >
                <div className="relative z-10 flex items-center gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/12 text-primary shadow-[0_8px_20px_rgba(15,23,42,.08)] transition group-hover:scale-110">
                    <Icon size={20} strokeWidth={2.1} />
                  </span>
                  <p className={`text-xs font-extrabold uppercase tracking-[0.13em] ${hasCustomTextColor ? 'text-current' : 'text-slate-600'}`}>
                    {item.title}
                  </p>
                </div>
                <p className={`relative z-10 mt-auto pt-6 text-2xl font-extrabold leading-none tracking-tight sm:text-[1.7rem] ${hasCustomTextColor ? 'text-current' : 'text-slate-950'}`}>{item.resolvedValue}</p>
                <span aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-10 h-28 w-28 rounded-full bg-accent/[0.07] blur-2xl transition group-hover:bg-accent/[0.12]" />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-accent to-transparent opacity-75" />
              </article>
            );
          })}
      </div>
    </div>
  );
}
