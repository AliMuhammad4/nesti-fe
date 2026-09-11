'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Gem,
  Home,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { getRoleDetailsDefaults } from '@/components/public-profile/PublicRoleDetailSection';
import {
  getServiceIconComponent,
  resolveServiceIconKey,
} from '@/components/storefront/builder/storefrontServiceIcons';

const SELLER_ROLE_SUPPLEMENTAL_HIGHLIGHTS = [
  {
    id: 'seller-highlight-supp-1',
    title: 'Launch timeline control',
    text: 'Coordinate listing date, showing windows, and offer review milestones around your schedule.',
  },
  {
    id: 'seller-highlight-supp-2',
    title: 'Offer clarity framework',
    text: 'Compare price, conditions, financing strength, and closing certainty before selecting a path.',
  },
];

function normalizeHighlights(content, profile) {
  const fallback = getRoleDetailsDefaults(profile?.professional_type).highlights || [];
  const source = Array.isArray(content.highlights) ? content.highlights : fallback;
  return source.map((item, index) => ({
    id: item?.id || `role-highlight-${index}`,
    title: typeof item === 'string' ? item.split('|')[0] : item?.title,
    text: typeof item === 'string' ? item.split('|')[1] : item?.text,
    icon: item?.icon || '',
    background: item?.background || '',
    textColor: item?.text_color || '',
  })).filter((item) => item.title);
}

function normalizeProof(content, profile) {
  const fallback = getRoleDetailsDefaults(profile?.professional_type).proof || [];
  const source = Array.isArray(content.proof) ? content.proof : fallback;
  return source.map((item, index) => ({
    id: item?.id || `role-proof-${index}`,
    text: typeof item === 'string' ? item : item?.text || item?.title,
    background: item?.background || '',
    textColor: item?.text_color || '',
  })).filter((item) => item.text);
}

function values(profile, block) {
  const content = block?.data?.content || profile?.storefront_section_content || {};
  const defaults = getRoleDetailsDefaults(profile?.professional_type);
  return {
    content,
    style: block?.data?.style || profile?.storefront_section_style || {},
    layout: block?.data?.layout || profile?.storefront_section_layout || {},
    eyebrow: content.eyebrow || defaults.eyebrow,
    heading: content.heading || content.title || defaults.title,
    body: content.body || content.description || defaults.description,
    highlights: normalizeHighlights(content, profile),
    proof: normalizeProof(content, profile),
  };
}

function fieldProps(field, source, label) {
  return {
    'data-storefront-field': `content.${field}`,
    'data-storefront-source': source ? 'persisted' : 'fallback',
    'data-storefront-label': label,
  };
}

function itemProps(collection, item, index, itemField, persisted) {
  return {
    'data-storefront-field': `content.${collection}`,
    'data-storefront-source': persisted ? 'persisted' : 'fallback',
    'data-storefront-collection': collection,
    'data-storefront-item-id': item.id,
    'data-storefront-item-index': index,
    'data-storefront-item-field': itemField,
    'data-storefront-label': `${collection === 'proof' ? 'Proof' : 'Highlight'} ${index + 1}`,
  };
}

function shellStyle(data) {
  const radius = { none: 0, small: 12, default: 16, medium: 20, large: 32, full: 40 }[data.style.radius || 'large'];
  const shadow = {
    none: 'none',
    small: '0 8px 24px rgba(15,23,42,.07)',
    medium: '0 18px 48px rgba(15,23,42,.10)',
    large: '0 24px 70px rgba(15,23,42,.13)',
  }[data.style.shadow || 'small'];
  return {
    background: data.content.panel_background || 'var(--storefront-surface, #fff)',
    color: data.content.panel_text_color || data.style.textColor || undefined,
    borderRadius: radius,
    boxShadow: shadow,
  };
}

function communityShadow(value) {
  return {
    none: 'none',
    small: '0 8px 24px rgba(15,23,42,.10)',
    medium: '0 18px 48px rgba(15,23,42,.14)',
    large: '0 28px 70px rgba(15,23,42,.18)',
  }[value] || 'none';
}

function ClassicRoleDetails({ profile, block }) {
  const data = values(profile, block);
  const persistedHighlights = Array.isArray(data.content.highlights);
  const persistedProof = Array.isArray(data.content.proof);
  return (
    <section className="px-4 py-7 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl overflow-hidden border border-primary/15" style={shellStyle(data)}>
        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-primary/15 bg-primary/[0.055] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="text-[9px] font-bold uppercase tracking-[.2em] text-primary">{data.eyebrow}</p>
            <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-2.5 text-xl font-bold leading-snug tracking-tight text-text-heading">{data.heading}</h2>
            <p {...fieldProps('body', data.content.body, 'Role details description')} className="mt-2.5 text-[13px] leading-5 text-text-muted">{data.body}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {data.proof.map((item, index) => (
                <span key={item.id} {...itemProps('proof', item, index, 'text', persistedProof)} className="rounded-full border border-primary/15 bg-white px-2.5 py-1 text-[10px] font-semibold text-text-heading" style={{ background: item.background || undefined, color: item.textColor || undefined }}>{item.text}</span>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-200 p-5 sm:p-6">
            {data.highlights.map((item, index) => (
              <article key={item.id} {...itemProps('highlights', item, index, 'title', persistedHighlights)} className="grid gap-2.5 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2.25rem_1fr]">
                <span className="text-lg font-light text-primary/60">0{index + 1}</span>
                <div><h3 className="text-[13px] font-bold text-text-heading">{item.title}</h3><p className="mt-1 text-[11px] leading-[1.15rem] text-text-muted">{item.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LuxuryRoleDetails({ profile, block }) {
  const data = values(profile, block);
  const persistedHighlights = Array.isArray(data.content.highlights);
  const persistedProof = Array.isArray(data.content.proof);
  const panelText = data.content.panel_text_color || data.style.textColor || '#f5f5f4';
  const widthClass = {
    narrow: 'max-w-5xl',
    contained: 'max-w-6xl',
    full: 'w-full max-w-none',
  }[data.layout.width || 'full'] || 'w-full max-w-none';
  const sectionHorizontalClass = (data.layout.width || 'full') === 'full'
    ? 'px-2 sm:px-4 lg:px-6 xl:px-8'
    : 'px-4 sm:px-8';
  const paddingClass = {
    small: 'py-4',
    medium: 'py-5 sm:py-6',
    large: 'py-8 sm:py-10',
  }[data.layout.padding || 'medium'];
  return (
    <section className={`${sectionHorizontalClass} ${paddingClass}`}>
      <div
        className={`mx-auto overflow-hidden text-left ${widthClass}`}
        style={{
          ...shellStyle(data),
          background: data.content.panel_background || '#0c0a09',
          color: panelText,
        }}
      >
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="p-6 text-left sm:p-8">
            <div className="flex items-center gap-2.5">
              <Gem size={19} className="shrink-0 text-accent" />
              <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="text-[9px] font-bold uppercase tracking-[.28em] text-accent">{data.eyebrow}</p>
            </div>
            <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-3 max-w-lg font-serif text-xl leading-tight sm:text-2xl" style={{ color: panelText }}>{data.heading}</h2>
            <p {...fieldProps('body', data.content.body, 'Role details description')} className="mt-4 max-w-lg text-[12px] leading-6" style={{ color: panelText, opacity: 0.78 }}>{data.body}</p>
            <div className="mt-5 flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {data.proof.map((item, index) => (
                <span
                  key={item.id}
                  {...itemProps('proof', item, index, 'text', persistedProof)}
                  className="shrink-0 whitespace-nowrap bg-accent/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-accent"
                  style={{ background: item.background || undefined, color: item.textColor || undefined }}
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 bg-black/20 p-4 sm:p-5">
            {data.highlights.map((item, index) => (
              <article
                key={item.id}
                {...itemProps('highlights', item, index, 'title', persistedHighlights)}
                className="grid bg-white/[0.045] p-4 text-left sm:grid-cols-[2.5rem_1fr] sm:gap-4"
                style={{ background: item.background || undefined, color: item.textColor || panelText }}
              >
                <p className="font-serif text-lg text-accent">0{index + 1}</p>
                <div>
                  <h3 className="text-[13px] font-semibold" style={{ color: item.textColor || panelText }}>{item.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-5" style={{ color: item.textColor || panelText, opacity: 0.7 }}>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FirstHomeRoleDetails({ profile, block }) {
  const data = values(profile, block);
  const persistedHighlights = Array.isArray(data.content.highlights);
  const persistedProof = Array.isArray(data.content.proof);
  return (
    <section className="px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl" style={shellStyle(data)}>
        <div className="space-y-6">
          <div className="mx-auto max-w-5xl text-center">
            <span className="mx-auto block h-px w-16 bg-accent" />
            <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="mt-5 text-[10px] font-semibold uppercase tracking-[.22em] text-accent">{data.eyebrow}</p>
            <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-3 text-[2.15rem] font-bold leading-[1.04] tracking-[-0.03em] text-[#102f1b] sm:text-[2.55rem] lg:whitespace-nowrap">{data.heading}</h2>
            <p {...fieldProps('body', data.content.body, 'Role details description')} className="mx-auto mt-4 max-w-2xl text-[12.5px] leading-6 text-[#102f1b]/60">{data.body}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {data.highlights.map((item, index) => (
              <article key={item.id} {...itemProps('highlights', item, index, 'title', persistedHighlights)} className="relative rounded bg-white px-5 py-7 shadow-[0_14px_38px_rgba(11,61,32,.07)] ring-1 ring-[#5bd36d]/20 sm:px-6 sm:py-8">
                <h3 className="text-base font-semibold text-[#102f1b]">{item.title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#102f1b]/58">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-[#5bd36d]/24 pt-6 text-center">
          {data.proof.map((item, index) => (
            <span key={item.id} {...itemProps('proof', item, index, 'text', persistedProof)} className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#102f1b]/70">
              <CheckCircle2 size={13} className="text-accent" />
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SellerRoleDetails({ profile, block }) {
  const data = values(profile, block);
  const forceMobilePreview = Boolean(
    profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'mobile',
  );
  const forceTabletPreview = Boolean(
    profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'tablet',
  );
  const persistedHighlights = Array.isArray(data.content.highlights);
  const persistedProof = Array.isArray(data.content.proof);
  const [expandedHighlights, setExpandedHighlights] = useState({});
  const [expandableHighlights, setExpandableHighlights] = useState({});
  const highlightTextRefs = useRef({});
  const icons = [Home, TrendingUp, ShieldCheck];
  const enrichedHighlights = useMemo(() => {
    const highlights = normalizeHighlights(data.content, {
      professional_type: profile?.professional_type,
    });
    return highlights.length >= 5
      ? highlights
      : [
          ...highlights,
          ...SELLER_ROLE_SUPPLEMENTAL_HIGHLIGHTS.slice(0, 5 - highlights.length),
        ];
  }, [data.content, profile?.professional_type]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const next = {};
      enrichedHighlights.forEach((item, index) => {
        const itemId = item.id || `seller-highlight-${index}`;
        const node = highlightTextRefs.current[itemId];
        next[itemId] = Boolean(node && node.scrollHeight > node.clientHeight + 1);
      });
      setExpandableHighlights((current) => {
        const keys = Object.keys(next);
        const unchanged = keys.length === Object.keys(current).length
          && keys.every((key) => current[key] === next[key]);
        return unchanged ? current : next;
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [enrichedHighlights]);
  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-seller-role-readmore-button="true"]')) {
        return;
      }
      setExpandedHighlights({});
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);
  return (
    <section className="w-full px-5 py-9 sm:px-8 lg:px-12 2xl:px-16">
      <div className="w-full max-w-none bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-9" style={shellStyle(data)}>
        <div className="grid gap-6">
          <div>
            <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="text-[10px] font-bold uppercase tracking-[.22em] text-primary">{data.eyebrow}</p>
            <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-2 text-2xl font-bold tracking-tight text-text-heading">{data.heading}</h2>
            <p {...fieldProps('body', data.content.body, 'Role details description')} className="mt-3 max-w-3xl text-[13px] leading-6 text-text-muted">{data.body}</p>
            <div className="mt-7 grid gap-3">
              {enrichedHighlights.map((item, index) => {
                const Icon = icons[index % icons.length];
                const cardId = item.id || `seller-highlight-${index}`;
                const isExpanded = Boolean(expandedHighlights[cardId]);
                const canExpand = Boolean(expandableHighlights[cardId]);
                return (
                  <article
                    key={item.id}
                    {...itemProps('highlights', item, index, 'title', persistedHighlights)}
                    className={`group rounded-xl bg-slate-50/70 p-4 shadow-[0_6px_18px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_22px_rgba(15,23,42,0.09)] ${isExpanded ? 'h-auto min-h-[126px]' : 'h-[126px]'}`}
                    style={{ background: item.background || undefined, color: item.textColor || undefined }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon size={16} />
                      </span>
                      <h3 className="text-sm font-bold text-text-heading" style={{ color: item.textColor || undefined }}>{item.title}</h3>
                    </div>
                    <p
                      ref={(node) => {
                        if (node) highlightTextRefs.current[cardId] = node;
                        else delete highlightTextRefs.current[cardId];
                      }}
                      className={`${isExpanded ? '' : 'line-clamp-2'} text-xs leading-5 text-text-muted`}
                      style={{ color: item.textColor || undefined }}
                    >
                      {item.text}
                    </p>
                    {canExpand ? (
                      <button
                        type="button"
                        data-seller-role-readmore-button="true"
                        onClick={() => setExpandedHighlights((prev) => ({ ...prev, [cardId]: !prev[cardId] }))}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary"
                      >
                        {isExpanded ? 'Read less' : 'Read more'}
                        <ChevronRight size={12} className={`transition ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
          <aside className="rounded-2xl bg-[#0b1220] p-5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-accent">Launch readiness</p>
            <div className={`mt-4 grid gap-2 ${forceMobilePreview ? 'grid-cols-1' : forceTabletPreview ? 'grid-cols-2' : 'sm:grid-cols-3'}`}>
              {data.proof.map((item, index) => (
                <div
                  key={item.id}
                  {...itemProps('proof', item, index, 'text', persistedProof)}
                  className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.09]"
                  style={{ background: item.background || undefined, color: item.textColor || undefined }}
                >
                  <CheckCircle2 size={14} className="text-accent" />
                  {item.text}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CommunityRoleDetails({ profile, block }) {
  const data = values(profile, block);
  const persistedHighlights = Array.isArray(data.content.highlights);
  const forceMobilePreview = profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'mobile';
  const forceTabletPreview = profile?.storefront_builder_preview && profile?.storefront_preview_mode === 'tablet';
  const widthClass = {
    narrow: 'mx-auto max-w-5xl',
    contained: 'mx-auto max-w-6xl',
    full: 'w-full max-w-none',
  }[data.layout.width || 'full'] || 'w-full max-w-none';
  const paddingClass = {
    none: 'py-0',
    small: 'py-5',
    medium: 'py-8 sm:py-10',
    large: 'py-12 sm:py-16',
  }[data.layout.padding || 'none'] || 'py-0';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[data.layout.alignment || 'left'] || 'text-left';
  const columns = String(data.layout.columns || '3');
  const gridClass = forceMobilePreview
    ? 'grid-cols-1'
    : forceTabletPreview
      ? 'grid-cols-2'
      : ({ 1: 'grid-cols-1', 2: 'sm:grid-cols-2', 3: 'md:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[columns] || 'md:grid-cols-3');
  const panelText = data.content.panel_text_color || data.style.textColor || '#ffffff';
  const cardStyle = data.layout.cardStyle || 'glass';
  const cardClass = {
    flat: 'border-transparent bg-transparent',
    bordered: 'border-white/20 bg-transparent',
    elevated: 'border-transparent bg-white/[.08]',
    glass: 'border-white/15 bg-white/[.07] backdrop-blur-sm',
  }[cardStyle] || 'border-white/15 bg-white/[.07] backdrop-blur-sm';
  const radius = { none: 0, small: 12, default: 16, medium: 20, large: 28, full: 36 }[data.style.radius || 'default'] ?? 16;
  const shadow = communityShadow(data.style.shadow || 'none');
  return (
    <section className={`w-full px-0 ${paddingClass}`}>
      <div
        className={`relative overflow-hidden border-y ${widthClass} ${alignmentClass}`}
        style={{
          background: data.content.panel_background || data.style.background || 'color-mix(in srgb, var(--storefront-primary, #17152b) 72%, #061022)',
          color: panelText,
          borderColor: data.style.borderColor || 'color-mix(in srgb, var(--storefront-accent, #1f6fbf) 24%, transparent)',
          borderRadius: radius,
          boxShadow: shadow,
        }}
      >
        <div className="relative border-b border-white/10 p-6 sm:p-9">
          <div>
            <div className="max-w-5xl">
              <div>
                <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="text-[10px] font-bold uppercase tracking-[.24em] text-white">{data.eyebrow}</p>
                <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-1 text-2xl font-bold tracking-[-.03em] text-current sm:text-3xl">{data.heading}</h2>
              </div>
              <p {...fieldProps('body', data.content.body, 'Role details description')} className="mt-4 max-w-none text-[13px] leading-6 text-current opacity-80">{data.body}</p>
            </div>
          </div>
        </div>
        <div className={`relative grid gap-4 p-5 sm:p-7 ${gridClass}`}>
          <span className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[4.15rem] hidden h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent md:block" />
          {data.highlights.map((item, index) => {
            const ItemIcon = getServiceIconComponent(resolveServiceIconKey(item.icon, index)) || MapPin;
            return <article
              key={item.id}
              className={`group relative min-h-[12rem] overflow-hidden border p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50 sm:p-7 ${cardClass}`}
              style={{
                borderRadius: radius,
                boxShadow: cardStyle === 'flat' ? 'none' : shadow,
                background: item.background || undefined,
                color: item.textColor || item.text_color || panelText,
              }}
            >
              <span className="pointer-events-none absolute right-0 top-0 h-12 w-12 border-r border-t border-accent/30" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white/90"
                  >
                    <ItemIcon size={15} />
                  </span>
                  <h3
                    {...itemProps('highlights', item, index, 'title', persistedHighlights)}
                    className="text-sm font-bold leading-5 text-current"
                  >
                    {item.title}
                  </h3>
                </div>
              </div>
              <p {...itemProps('highlights', item, index, 'text', persistedHighlights)} className="mt-5 text-xs leading-5 text-current opacity-75">{item.text}</p>
              <span className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}

function InvestorRoleDetails({ profile, block }) {
  const data = values(profile, block);
  const persistedHighlights = Array.isArray(data.content.highlights);
  const persistedProof = Array.isArray(data.content.proof);
  return (
    <section className="px-4 py-9 sm:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden border border-slate-200" style={shellStyle(data)}>
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
          <div className="border-b border-slate-200 p-7 sm:p-9 lg:border-b-0 lg:border-r">
            <BarChart3 size={22} className="text-slate-700" />
            <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="mt-7 text-[10px] font-bold uppercase tracking-[.24em] text-slate-500">{data.eyebrow}</p>
            <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-text-heading">{data.heading}</h2>
            <p {...fieldProps('body', data.content.body, 'Role details description')} className="mt-4 max-w-xl text-sm leading-6 text-text-muted">{data.body}</p>
          </div>
          <div className="divide-y divide-slate-200 bg-slate-50/60 p-5 sm:p-7">
            {data.highlights.map((item, index) => (
              <article key={item.id} {...itemProps('highlights', item, index, 'title', persistedHighlights)} className="py-4 first:pt-0 last:pb-0">
                <span className="text-2xl font-light text-slate-400">0{index + 1}</span>
                <h3 className="mt-1 text-sm font-bold text-text-heading">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const ClassicRoleDetailsSection = ClassicRoleDetails;
export const LuxuryRoleDetailsSection = LuxuryRoleDetails;
export const FirstHomeRoleDetailsSection = FirstHomeRoleDetails;
export const SellerRoleDetailsSection = SellerRoleDetails;
export const CommunityRoleDetailsSection = CommunityRoleDetails;
export const InvestorRoleDetailsSection = InvestorRoleDetails;
