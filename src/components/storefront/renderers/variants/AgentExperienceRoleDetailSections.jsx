'use client';

import {
  ArrowRight,
  CheckCircle2,
  Gem,
  HeartHandshake,
  Home,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { getRoleDetailsDefaults } from '@/components/public-profile/PublicRoleDetailSection';

function normalizeHighlights(content, profile) {
  const fallback = getRoleDetailsDefaults(profile?.professional_type).highlights || [];
  const source = Array.isArray(content.highlights) ? content.highlights : fallback;
  return source.map((item, index) => ({
    id: item?.id || `role-highlight-${index}`,
    title: typeof item === 'string' ? item.split('|')[0] : item?.title,
    text: typeof item === 'string' ? item.split('|')[1] : item?.text,
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
  return (
    <section className="px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden border border-amber-300/30 bg-stone-950 text-stone-50" style={{ ...shellStyle(data), background: data.content.panel_background || '#0c0a09' }}>
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="p-7 sm:p-10">
            <Gem size={22} className="text-amber-300" />
            <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="mt-7 text-[10px] font-bold uppercase tracking-[.28em] text-amber-300">{data.eyebrow}</p>
            <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-3 max-w-xl font-serif text-2xl leading-tight sm:text-3xl">{data.heading}</h2>
            <p {...fieldProps('body', data.content.body, 'Role details description')} className="mt-4 max-w-xl text-[13px] leading-6 text-stone-300">{data.body}</p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5">
              {data.proof.map((item, index) => <span key={item.id} {...itemProps('proof', item, index, 'text', persistedProof)} className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-200">{item.text}</span>)}
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-7 sm:p-10 lg:border-l lg:border-t-0">
            {data.highlights.map((item, index) => (
              <article key={item.id} {...itemProps('highlights', item, index, 'title', persistedHighlights)} className="border-b border-white/10 py-6 first:pt-0 last:border-0 last:pb-0">
                <p className="font-serif text-2xl text-amber-300/60">0{index + 1}</p>
                <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-stone-400">{item.text}</p>
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
    <section className="px-4 py-9 sm:px-8">
      <div className="mx-auto max-w-7xl border border-sky-100 p-6 sm:p-9" style={shellStyle(data)}>
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-sky-100 text-sky-700"><HeartHandshake size={20} /></span>
          <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="mt-4 text-[10px] font-bold uppercase tracking-[.22em] text-sky-700">{data.eyebrow}</p>
          <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-2 text-2xl font-bold tracking-tight text-text-heading">{data.heading}</h2>
          <p {...fieldProps('body', data.content.body, 'Role details description')} className="mx-auto mt-3 max-w-2xl text-[13px] leading-6 text-text-muted">{data.body}</p>
        </div>
        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-6 hidden h-px bg-sky-200 md:block" />
          {data.highlights.map((item, index) => (
            <article key={item.id} {...itemProps('highlights', item, index, 'title', persistedHighlights)} className="relative rounded-2xl border border-sky-100 bg-sky-50/60 p-5 text-center">
              <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-sky-600 text-sm font-bold text-white shadow-sm">{index + 1}</span>
              <h3 className="mt-4 text-sm font-bold text-text-heading">{item.title}</h3><p className="mt-2 text-xs leading-5 text-text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">{data.proof.map((item, index) => <span key={item.id} {...itemProps('proof', item, index, 'text', persistedProof)} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700"><CheckCircle2 size={12} />{item.text}</span>)}</div>
      </div>
    </section>
  );
}

function SellerRoleDetails({ profile, block }) {
  const data = values(profile, block);
  const persistedHighlights = Array.isArray(data.content.highlights);
  const persistedProof = Array.isArray(data.content.proof);
  const icons = [Home, TrendingUp, ShieldCheck];
  return (
    <section className="px-4 py-9 sm:px-8">
      <div className="mx-auto max-w-7xl border border-rose-100 p-6 sm:p-9" style={shellStyle(data)}>
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
          <div>
            <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="text-[10px] font-bold uppercase tracking-[.22em] text-rose-700">{data.eyebrow}</p>
            <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-2 text-2xl font-bold tracking-tight text-text-heading">{data.heading}</h2>
            <p {...fieldProps('body', data.content.body, 'Role details description')} className="mt-3 max-w-3xl text-[13px] leading-6 text-text-muted">{data.body}</p>
            <div className="mt-7 grid gap-3">
              {data.highlights.map((item, index) => {
                const Icon = icons[index % icons.length];
                return <article key={item.id} {...itemProps('highlights', item, index, 'title', persistedHighlights)} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[2.5rem_1fr_auto] sm:items-center"><span className="grid h-10 w-10 place-items-center rounded-lg bg-rose-50 text-rose-700"><Icon size={17} /></span><div><h3 className="text-sm font-bold text-text-heading">{item.title}</h3><p className="mt-1 text-xs leading-5 text-text-muted">{item.text}</p></div><ArrowRight size={16} className="hidden text-rose-400 sm:block" /></article>;
              })}
            </div>
          </div>
          <aside className="rounded-2xl bg-rose-950 p-5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-rose-200">Launch readiness</p>
            <div className="mt-5 space-y-3">{data.proof.map((item, index) => <div key={item.id} {...itemProps('proof', item, index, 'text', persistedProof)} className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs font-semibold last:border-0"><CheckCircle2 size={14} className="text-amber-300" />{item.text}</div>)}</div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CommunityRoleDetails({ profile, block }) {
  const data = values(profile, block);
  const persistedHighlights = Array.isArray(data.content.highlights);
  const persistedProof = Array.isArray(data.content.proof);
  return (
    <section className="px-4 py-9 sm:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden border border-emerald-100" style={shellStyle(data)}>
        <div className="grid lg:grid-cols-[.8fr_1.2fr]">
          <div className="bg-emerald-950 p-7 text-white sm:p-9">
            <MapPin size={22} className="text-emerald-300" />
            <p {...fieldProps('eyebrow', data.content.eyebrow, 'Role details eyebrow')} className="mt-7 text-[10px] font-bold uppercase tracking-[.24em] text-emerald-300">{data.eyebrow}</p>
            <h2 {...fieldProps('heading', data.content.heading, 'Role details heading')} className="mt-3 text-2xl font-bold tracking-tight">{data.heading}</h2>
            <p {...fieldProps('body', data.content.body, 'Role details description')} className="mt-4 text-[13px] leading-6 text-emerald-50/75">{data.body}</p>
            <div className="mt-6 flex flex-wrap gap-2">{data.proof.map((item, index) => <span key={item.id} {...itemProps('proof', item, index, 'text', persistedProof)} className="rounded-full border border-emerald-300/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-100">{item.text}</span>)}</div>
          </div>
          <div className="grid gap-4 p-6 sm:p-9 md:grid-cols-2">
            {data.highlights.map((item, index) => (
              <article key={item.id} {...itemProps('highlights', item, index, 'title', persistedHighlights)} className={`relative rounded-2xl border border-emerald-100 bg-white p-5 ${index === 0 ? 'md:col-span-2' : ''}`}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700"><MapPin size={16} /></span>
                <h3 className="mt-4 text-sm font-bold text-text-heading">{item.title}</h3><p className="mt-2 text-xs leading-5 text-text-muted">{item.text}</p>
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
