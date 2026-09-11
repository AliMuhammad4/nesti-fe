'use client';

import {
  Award,
  BadgeDollarSign,
  BarChart3,
  Building2,
  CircleDollarSign,
  Home,
  Languages,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { formatProfileBusinessField } from '@/lib/profileFieldDisplay';
import {
  getServiceIconComponent,
  resolveServiceIconKey,
} from '@/components/storefront/builder/storefrontServiceIcons';

const gridClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const presentationClasses = {
  luxury: {
    root: 'bg-[#11100f] text-[#f5f1e8]',
    eyebrow: 'text-accent',
    heading: 'font-serif text-[#f5f1e8]',
    body: 'text-[#d6cec0]',
    card: 'rounded-none border border-[#c9b08a]/20 bg-[#171513] shadow-none',
    label: 'text-[#c9b08a]',
    value: 'font-serif text-[#f5f1e8]',
    icon: 'rounded-none border border-[#c9b08a]/30 bg-transparent text-[#c9b08a]',
    rule: 'bg-[#c9b08a]/70',
  },
  firstHome: {
    root: 'bg-[#f4faf5] text-slate-950',
    eyebrow: 'text-[#0b3d20]',
    heading: 'text-slate-950',
    body: 'text-slate-600',
    card: 'rounded border border-emerald-900/10 bg-white shadow-[0_12px_30px_rgba(11,61,32,.08)]',
    label: 'text-[#0b3d20]',
    value: 'text-slate-950',
    icon: 'rounded bg-[#e7f8e9] text-[#0b3d20]',
    rule: 'bg-[#5bd36d]',
  },
  community: {
    root: 'bg-transparent text-text-heading',
    eyebrow: 'text-accent',
    heading: 'text-text-heading',
    body: 'text-text-muted',
    card: 'rounded-2xl border border-primary/10 bg-white shadow-[0_12px_32px_rgba(15,23,42,.08)]',
    label: 'text-accent',
    value: 'text-slate-900',
    icon: 'rounded-xl bg-accent/10 text-accent',
    rule: 'bg-accent',
  },
};

const metricIcons = [Trophy, Home, Star, MapPinned];
const credentialIcons = {
  company: Building2,
  credentials: ShieldCheck,
  awards: Award,
  languages: Languages,
  total_clients: Users,
  active_pipeline_value: CircleDollarSign,
  total_sold_home_value: BadgeDollarSign,
  specialty: Target,
  years_experience: BarChart3,
};

function columnsClass(profile, value, fallback = '4') {
  if (profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'mobile') {
    return gridClasses[1];
  }
  if (profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'tablet') {
    return gridClasses[2];
  }
  return gridClasses[Number(value || fallback)] || gridClasses[Number(fallback)];
}

function radiusClass(value, presentation) {
  if (value === 'none') return 'rounded-none';
  if (value === 'large') return 'rounded-[1.75rem]';
  if (presentation === 'luxury') return 'rounded-none';
  if (presentation === 'community') return 'rounded-[1.5rem]';
  return 'rounded';
}

function shadowValue(value) {
  return {
    none: '',
    small: '0 8px 20px rgba(15,23,42,.07)',
    medium: '0 14px 32px rgba(15,23,42,.1)',
    large: '0 22px 48px rgba(15,23,42,.14)',
  }[value] || '';
}

function cardStyleClass(value) {
  return {
    flat: '!border-transparent !shadow-none',
    bordered: 'border',
    elevated: 'shadow-[0_18px_40px_rgba(15,23,42,.12)]',
    glass: 'backdrop-blur-md',
  }[value] || '';
}

function sectionStyle(block) {
  const style = block.data?.style || {};
  return {
    ...(style.background ? { background: style.background } : {}),
    ...(style.textColor ? { color: style.textColor } : {}),
  };
}

function feedbackRating(profile) {
  const backendAverage = Number(profile.client_rating_average);
  if (Number.isFinite(backendAverage) && backendAverage > 0) {
    return `${Number.isInteger(backendAverage) ? backendAverage : backendAverage.toFixed(1)}/5`;
  }
  const ratings = (Array.isArray(profile.testimonials) ? profile.testimonials : [])
    .map((item) => Number(item?.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  if (!ratings.length) return '';
  const average = ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
  return `${Number.isInteger(average) ? average : average.toFixed(1)}/5`;
}

function serviceAreas(profile) {
  const professional = profile.professional_profile || {};
  const values = [
    ...(professional.target_neighborhoods || []),
    ...(professional.service_areas || []),
    ...(professional.service_area_cities || []),
    ...(professional.service_area_regions || []),
    ...(profile.target_neighborhoods || []),
    ...(profile.service_areas || []),
  ].filter(Boolean);
  return new Set(values.map((value) => String(value).trim().toLowerCase()).filter(Boolean)).size;
}

function activeListings(profile) {
  const candidates = [
    profile.featured_listings,
    profile.active_properties,
    profile.properties,
  ];
  const first = candidates.find((items) => Array.isArray(items));
  return first?.length || 0;
}

function compactCurrency(amount, currency = 'USD') {
  if (!Number.isFinite(Number(amount))) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(Number(amount));
  } catch {
    return `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(amount))}`;
  }
}

function metricValue(item, profile) {
  if (String(item.value || '').trim()) return item.value;
  const professional = profile.professional_profile || {};
  const sellerMetrics = profile.seller_credential_metrics || {};
  if (item.source === 'rating') return feedbackRating(profile);
  if (item.source === 'years_experience') {
    return formatProfileBusinessField(
      'Experience',
      professional.experience
        || professional.experience_level
        || profile.storefront_essentials?.years_experience
        || '',
    );
  }
  if (item.source === 'closed_seller_leads') {
    const value = Number(profile.closed_seller_leads_count);
    return Number.isFinite(value) ? String(value) : '';
  }
  if (item.source === 'available_seller_leads') {
    const value = Number(profile.available_seller_leads_count);
    return Number.isFinite(value) ? String(value) : '';
  }
  if (item.source === 'total_sold_home_value') {
    return compactCurrency(sellerMetrics.total_sold_home_value, sellerMetrics.currency);
  }
  if (item.source === 'active_listings') return String(activeListings(profile));
  if (item.source === 'service_areas') return String(serviceAreas(profile));
  return '';
}

function firstListValue(values, fallback = '') {
  if (!Array.isArray(values) || !values.length) return fallback;
  const labels = values
    .map((item) => (typeof item === 'string' ? item : item?.name || item?.title || item?.label))
    .filter(Boolean);
  if (!labels.length) return fallback;
  return labels.slice(0, 2).join(', ');
}

function credentialValue(item, profile) {
  if (String(item.issuer || item.value || '').trim()) return item.issuer || item.value;
  const professional = profile.professional_profile || {};
  const sellerMetrics = profile.seller_credential_metrics || {};
  if (item.source === 'total_clients') {
    const count = Number(sellerMetrics.total_clients);
    return Number.isFinite(count)
      ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(count)
      : '';
  }
  if (['active_pipeline_value', 'total_sold_home_value'].includes(item.source)) {
    return compactCurrency(sellerMetrics[item.source], sellerMetrics.currency);
  }
  if (item.source === 'company') return professional.company_name || profile.company_name || '';
  if (item.source === 'credentials') {
    return firstListValue(professional.certificates || profile.credentials, 'Available on request');
  }
  if (item.source === 'awards') return firstListValue(professional.awards, 'Professional recognition');
  if (item.source === 'languages') {
    return firstListValue(professional.languages_spoken || profile.languages_spoken, 'Client-focused communication');
  }
  if (item.source === 'specialty') {
    return firstListValue(
      professional.specializations
        || profile.core_specialization_tags
        || profile.specialty_strength_tags,
      'Residential guidance',
    );
  }
  if (item.source === 'years_experience') return metricValue(item, profile);
  return '';
}

function normalizedPerformanceItems(items = []) {
  const sourceKey = items.map((item) => item?.source).join('|');
  const canonicalItems = [
    { label: 'Homes sold', value: '', source: 'closed_seller_leads' },
    { label: 'Experience', value: '', source: 'years_experience' },
    { label: 'Client rating', value: '', source: 'rating' },
    { label: 'Available options', value: '', source: 'available_seller_leads' },
  ];
  const canonicalSourceKey = canonicalItems.map((item) => item.source).join('|');
  if (sourceKey === canonicalSourceKey) {
    return items.map((item) => ({ ...item, value: '' }));
  }
  return canonicalItems.map((item, index) => ({
    ...(items[index] || {}),
    ...item,
  }));
}

function normalizedCredentialItems(items = [], profile = {}) {
  const sourceKey = items.map((item) => item?.source).join('|');
  const canonicalItems = [
    { title: 'Clients', issuer: '', value: '', source: 'total_clients' },
    { title: 'Active pipeline value', issuer: '', value: '', source: 'active_pipeline_value' },
    { title: 'Sold property value', issuer: '', value: '', source: 'total_sold_home_value' },
    {
      title: 'Brokerage',
      issuer: profile?.professional_profile?.company_name || profile?.company_name || '',
      value: '',
      source: 'company',
    },
  ];
  const canonicalSourceKey = canonicalItems.map((item) => item.source).join('|');
  if (sourceKey === canonicalSourceKey) {
    return items.map((item, index) => ({
      ...item,
      ...(index === 0 && String(item.title || '').trim().toLowerCase() === 'total clients'
        ? { title: 'Clients' }
        : {}),
      issuer: canonicalItems[index]?.issuer || '',
      value: '',
    }));
  }
  return canonicalItems.map((item, index) => ({
    ...(items[index] || {}),
    ...item,
  }));
}

function normalizedCaseStudyItems(items = []) {
  const titleKey = items.map((item) => item?.title).join('|');
  const templateDefaultTitles = new Set([
    'The private brief|The tailored strategy|The considered result',
    'Build readiness|Search with context|Offer with confidence',
    'Find the right fit|Read the micro-market|Move with confidence',
  ]);
  if (!templateDefaultTitles.has(titleKey)) return items;
  const canonicalItems = [
    { title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' },
    { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' },
    { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' },
  ];
  return canonicalItems.map((item, index) => ({
    ...(items[index] || {}),
    ...item,
  }));
}

function Header({ content, layout, classes, presentation }) {
  const alignment = layout.alignment || 'center';
  const alignmentClass = alignment === 'left'
    ? 'mr-auto text-left'
    : alignment === 'right'
      ? 'ml-auto text-right'
      : 'mx-auto text-center';
  return (
    <header className={`max-w-3xl ${alignmentClass}`}>
      {content.eyebrow ? (
        <p
          data-storefront-field="content.eyebrow"
          data-storefront-source="persisted"
          data-storefront-label="Section eyebrow"
          className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
            presentation === 'community'
              ? 'inline-flex rounded-md bg-primary px-2.5 py-1 text-primary-contrast'
              : classes.eyebrow
          }`}
        >
          {content.eyebrow}
        </p>
      ) : null}
      <h2
        data-storefront-field="content.heading"
        data-storefront-source="persisted"
        data-storefront-label="Section heading"
        className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${classes.heading}`}
      >
        {content.heading}
      </h2>
      {content.body ? (
        <p
          data-storefront-field="content.body"
          data-storefront-source="persisted"
          data-storefront-label="Section description"
          className={`mt-3 text-sm leading-6 ${classes.body}`}
        >
          {content.body}
        </p>
      ) : null}
    </header>
  );
}

export function AgentPerformanceSection({ profile = {}, block = {}, presentation = 'firstHome' }) {
  const content = block.data?.content || {};
  const layout = block.data?.layout || {};
  const classes = presentationClasses[presentation] || presentationClasses.firstHome;
  const style = block.data?.style || {};
  const items = normalizedPerformanceItems(
    Array.isArray(content.items) ? content.items.slice(0, 4) : [],
  );
  if (presentation === 'community') {
    const widthClass = { narrow: 'max-w-5xl', contained: 'max-w-6xl', full: 'max-w-none' }[layout.width || 'full'] || 'max-w-none';
    const paddingClass = { none: 'py-0', small: 'py-6', medium: 'py-10 sm:py-12', large: 'py-12 sm:py-16' }[layout.padding || 'large'] || 'py-12 sm:py-16';
    const alignClass = { left: 'text-left', center: 'mx-auto text-center', right: 'ml-auto text-right' }[layout.alignment || 'left'] || 'text-left';
    return (
      <div className={`w-full px-5 sm:px-8 lg:px-12 ${paddingClass}`} style={sectionStyle(block)}>
        <div className={`mx-auto ${widthClass}`}>
          <div className={`max-w-3xl ${alignClass}`}>
            <div>
              {content.eyebrow ? (
                <p
                  data-storefront-field="content.eyebrow"
                  data-storefront-source="persisted"
                  data-storefront-label="Section eyebrow"
                  className="inline-flex rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.24em] text-primary-contrast"
                >
                  {content.eyebrow}
                </p>
              ) : null}
              <h2
                data-storefront-field="content.heading"
                data-storefront-source="persisted"
                data-storefront-label="Section heading"
                className={`mt-2 text-2xl font-bold tracking-[-.03em] sm:text-3xl ${style.textColor ? 'text-current' : 'text-text-heading'}`}
              >
                {content.heading}
              </h2>
            </div>
          </div>
          {content.body ? (
            <p
              data-storefront-field="content.body"
              data-storefront-source="persisted"
              data-storefront-label="Section description"
              className={`mt-4 max-w-2xl text-[13px] leading-6 ${style.textColor ? 'text-current opacity-75' : 'text-text-muted'} ${layout.alignment === 'center' ? 'mx-auto' : layout.alignment === 'right' ? 'ml-auto' : ''}`}
            >
              {content.body}
            </p>
          ) : null}

          <div className={`mt-8 grid gap-4 ${columnsClass(profile, layout.columns, '4')}`}>
            {items.map((item, index) => {
              const Icon = metricIcons[index % metricIcons.length];
              const itemId = item.id || `fallback-service-${index}`;
              return (
                <article
                  key={itemId}
                  data-storefront-anim-item="true"
                  className={`group relative min-h-[9.5rem] overflow-hidden border p-5 text-white transition duration-300 hover:-translate-y-1 ${cardStyleClass(layout.cardStyle)} ${radiusClass(style.radius, presentation)}`}
                  style={{
                    background: 'color-mix(in srgb, var(--storefront-primary, #17152b) 74%, #061022)',
                    borderColor: 'color-mix(in srgb, var(--storefront-accent, #1f6fbf) 24%, transparent)',
                    boxShadow: shadowValue(style.shadow || 'medium'),
                  }}
                >
                  <span className="pointer-events-none absolute left-5 top-0 h-0.5 w-12 bg-accent/80" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        data-storefront-field="content.items"
                        data-storefront-source="persisted"
                        data-storefront-collection="items"
                        data-storefront-item-id={itemId}
                        data-storefront-item-index={index}
                        data-storefront-item-field="label"
                        data-storefront-label={`Metric label ${index + 1}`}
                        className="text-[9px] font-extrabold uppercase tracking-[.18em] text-white"
                      >
                        {item.label}
                      </p>
                      <p className="mt-6 text-xl font-extrabold leading-tight tracking-[-.03em] text-white sm:text-2xl">
                        {metricValue(item, profile) || '—'}
                      </p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/10 text-white">
                      <Icon size={17} />
                    </span>
                  </div>
                  <span className="absolute inset-x-5 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`w-full px-5 py-10 sm:px-8 lg:px-12 ${classes.root}`} style={sectionStyle(block)}>
      <Header content={content} layout={layout} classes={classes} presentation={presentation} />
      <div className={`mt-8 grid gap-4 ${columnsClass(profile, layout.columns, '4')}`}>
        {items.map((item, index) => {
          const Icon = metricIcons[index % metricIcons.length];
          const itemId = item.id || `fallback-service-${index}`;
          return (
            <article
              key={itemId}
              data-storefront-anim-item="true"
              className={`relative min-h-36 overflow-hidden p-5 ${classes.card} ${cardStyleClass(layout.cardStyle)} ${radiusClass(style.radius, presentation)}`}
              style={shadowValue(style.shadow) ? { boxShadow: shadowValue(style.shadow) } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    data-storefront-field="content.items"
                    data-storefront-source="persisted"
                    data-storefront-collection="items"
                    data-storefront-item-id={itemId}
                    data-storefront-item-index={index}
                    data-storefront-item-field="label"
                    data-storefront-label={`Metric label ${index + 1}`}
                    className={`text-[10px] font-extrabold uppercase tracking-[0.15em] ${classes.label}`}
                  >
                    {item.label}
                  </p>
                  <p className={`mt-4 text-2xl font-extrabold tracking-tight ${classes.value}`}>{metricValue(item, profile) || '—'}</p>
                </div>
                <span className={`grid h-10 w-10 shrink-0 place-items-center ${classes.icon}`}><Icon size={18} /></span>
              </div>
              <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 ${classes.rule}`} />
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function AgentCaseStudySection({ profile = {}, block = {}, presentation = 'firstHome' }) {
  const content = block.data?.content || {};
  const layout = block.data?.layout || {};
  const classes = presentationClasses[presentation] || presentationClasses.firstHome;
  const style = block.data?.style || {};
  const items = normalizedCaseStudyItems(
    Array.isArray(content.items) ? content.items.slice(0, 6) : [],
  );
  return (
    <div className={`w-full px-5 py-10 sm:px-8 lg:px-12 ${classes.root}`} style={sectionStyle(block)}>
      <Header content={content} layout={layout} classes={classes} presentation={presentation} />
      <div className={`mt-8 grid gap-4 ${columnsClass(profile, layout.columns, '3')}`}>
        {items.map((item, index) => {
          const itemId = item.id || `proof-story-${index}`;
          const Icon = getServiceIconComponent(resolveServiceIconKey(item.icon, index)) || Sparkles;
          return (
            <article
              key={itemId}
              data-storefront-anim-item="true"
              className={`relative flex min-h-44 flex-col overflow-hidden p-5 ${classes.card} ${cardStyleClass(layout.cardStyle)} ${radiusClass(style.radius, presentation)}`}
              style={{
                ...(item.background ? { background: item.background } : {}),
                ...(item.text_color ? { color: item.text_color } : {}),
                ...(shadowValue(style.shadow) ? { boxShadow: shadowValue(style.shadow) } : {}),
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center ${classes.icon}`}
                  style={{
                    ...(item.icon_background ? { background: item.icon_background } : {}),
                    ...(item.icon_color ? { color: item.icon_color } : {}),
                  }}
                >
                  <Icon size={18} />
                </span>
                <h3
                  data-storefront-field="content.items"
                  data-storefront-source="persisted"
                  data-storefront-collection="items"
                  data-storefront-item-id={itemId}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  data-storefront-label={`Story title ${index + 1}`}
                  className={`text-base font-bold ${classes.value}`}
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
                data-storefront-label={`Story description ${index + 1}`}
                className={`mt-4 text-sm leading-6 ${classes.body}`}
              >
                {item.description || item.text}
              </p>
              <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 ${classes.rule}`} />
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function AgentCredentialsSection({ profile = {}, block = {}, presentation = 'firstHome' }) {
  const content = block.data?.content || {};
  const layout = block.data?.layout || {};
  const classes = presentationClasses[presentation] || presentationClasses.firstHome;
  const style = block.data?.style || {};
  const items = normalizedCredentialItems(
    Array.isArray(content.items) ? content.items : [],
    profile,
  )
    .map((item) => ({ ...item, resolvedValue: credentialValue(item, profile) }))
    .filter((item) => item.resolvedValue)
    .slice(0, 6);
  if (presentation === 'community') {
    const widthClass = { narrow: 'max-w-5xl', contained: 'max-w-6xl', full: 'max-w-none' }[layout.width || 'full'] || 'max-w-none';
    const paddingClass = { none: 'py-0', small: 'py-6', medium: 'py-10 sm:py-12', large: 'py-12 sm:py-16' }[layout.padding || 'large'] || 'py-12 sm:py-16';
    const alignClass = { left: 'text-left', center: 'mx-auto text-center', right: 'ml-auto text-right' }[layout.alignment || 'left'] || 'text-left';
    return (
      <div className={`w-full px-5 sm:px-8 lg:px-12 ${paddingClass}`} style={sectionStyle(block)}>
        <div className={`mx-auto ${widthClass}`}>
          <div className={`max-w-3xl ${alignClass}`}>
            <div>
              {content.eyebrow ? (
                <p
                  data-storefront-field="content.eyebrow"
                  data-storefront-source="persisted"
                  data-storefront-label="Section eyebrow"
                  className="inline-flex rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.24em] text-primary-contrast"
                >
                  {content.eyebrow}
                </p>
              ) : null}
              <h2
                data-storefront-field="content.heading"
                data-storefront-source="persisted"
                data-storefront-label="Section heading"
                className={`mt-2 text-2xl font-bold tracking-[-.03em] sm:text-3xl ${style.textColor ? 'text-current' : 'text-text-heading'}`}
              >
                {content.heading}
              </h2>
            </div>
          </div>
          {content.body ? (
            <p
              data-storefront-field="content.body"
              data-storefront-source="persisted"
              data-storefront-label="Section description"
              className={`mt-4 max-w-2xl text-[13px] leading-6 ${style.textColor ? 'text-current opacity-75' : 'text-text-muted'} ${layout.alignment === 'center' ? 'mx-auto' : layout.alignment === 'right' ? 'ml-auto' : ''}`}
            >
              {content.body}
            </p>
          ) : null}

          <div className={`mt-8 grid gap-4 ${columnsClass(profile, layout.columns, '4')}`}>
            {items.map((item, index) => {
              const Icon = credentialIcons[item.source] || Award;
              const itemId = item.id || `fallback-service-${index}`;
              return (
                <article
                  key={itemId}
                  data-storefront-anim-item="true"
                  className={`group relative min-h-[9.5rem] overflow-hidden border p-5 text-white transition duration-300 hover:-translate-y-1 ${cardStyleClass(layout.cardStyle)} ${radiusClass(style.radius, presentation)}`}
                  style={{
                    background: 'color-mix(in srgb, var(--storefront-primary, #17152b) 74%, #061022)',
                    borderColor: 'color-mix(in srgb, var(--storefront-accent, #1f6fbf) 24%, transparent)',
                    boxShadow: shadowValue(style.shadow || 'medium'),
                  }}
                >
                  <span className="pointer-events-none absolute left-5 top-0 h-0.5 w-12 bg-accent/80" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        data-storefront-field="content.items"
                        data-storefront-source="persisted"
                        data-storefront-collection="items"
                        data-storefront-item-id={itemId}
                        data-storefront-item-index={index}
                        data-storefront-item-field="title"
                        data-storefront-label={`Credential label ${index + 1}`}
                        className="text-[9px] font-extrabold uppercase tracking-[.18em] text-white"
                      >
                        {item.title}
                      </p>
                      <p className="mt-6 text-xl font-extrabold leading-tight tracking-[-.02em] text-white sm:text-2xl">
                        {item.resolvedValue}
                      </p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/10 text-white">
                      <Icon size={17} />
                    </span>
                  </div>
                  <span className="absolute inset-x-5 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`w-full px-5 py-10 sm:px-8 lg:px-12 ${classes.root}`} style={sectionStyle(block)}>
      <Header content={content} layout={layout} classes={classes} presentation={presentation} />
      <div className={`mt-8 grid gap-4 ${columnsClass(profile, layout.columns, '4')}`}>
        {items.map((item, index) => {
          const Icon = credentialIcons[item.source] || Award;
          const itemId = item.id || `fallback-service-${index}`;
          return (
            <article
              key={itemId}
              data-storefront-anim-item="true"
              className={`relative flex min-h-40 flex-col overflow-hidden p-5 ${classes.card} ${cardStyleClass(layout.cardStyle)} ${radiusClass(style.radius, presentation)}`}
              style={shadowValue(style.shadow) ? { boxShadow: shadowValue(style.shadow) } : undefined}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center ${classes.icon}`}><Icon size={18} /></span>
                <p
                  data-storefront-field="content.items"
                  data-storefront-source="persisted"
                  data-storefront-collection="items"
                  data-storefront-item-id={itemId}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  data-storefront-label={`Credential label ${index + 1}`}
                  className={`text-[10px] font-extrabold uppercase tracking-[0.14em] ${classes.label}`}
                >
                  {item.title}
                </p>
              </div>
              <p className={`mt-auto pt-6 text-xl font-bold leading-tight ${classes.value}`}>{item.resolvedValue}</p>
              <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 ${classes.rule}`} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
