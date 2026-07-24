'use client';

import { Briefcase, MapPin, Sparkles } from 'lucide-react';
import { resolvePublicProfileAreas } from '@/lib/publicProfileAreas';

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  return String(value || '')
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueItems(items) {
  const seen = new Set();
  return items
    .filter(Boolean)
    .filter((item) => {
      const key = String(item).trim().toLocaleLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function fallbackServices(role) {
  if (role === 'mortgage_broker') {
    return ['Pre-approval guidance', 'Mortgage strategy', 'Credit readiness'];
  }
  if (role === 'lawyer') {
    return ['Purchase closings', 'Contract review', 'Secure transaction guidance'];
  }
  return ['Buying guidance', 'Selling strategy', 'Market consultation'];
}

export default function PublicExpertiseBand({ profile, content = {} }) {
  const professionalProfile = profile.professional_profile || {};
  const role = profile.professional_type;
  const customServices = uniqueItems(normalizeList(content.services));
  const customExpertise = uniqueItems(normalizeList(content.expertise));
  const services = uniqueItems([
    ...customServices,
    ...(profile.services || []).map((service) => service?.title),
    ...(profile.practice_areas || []),
    ...fallbackServices(role),
  ]);
  const expertise = uniqueItems([
    ...customExpertise,
    ...normalizeList(professionalProfile.specializations),
    ...normalizeList(professionalProfile.certificates),
    ...normalizeList(professionalProfile.awards),
    ...normalizeList(professionalProfile.preferred_clients),
  ]);
  const areas = resolvePublicProfileAreas(profile, content.areas);

  const columns = [
    {
      title: 'Services',
      subtitle: 'What clients can request',
      Icon: Briefcase,
      items: services,
    },
    {
      title: 'Expertise',
      subtitle: 'Professional strengths',
      Icon: Sparkles,
      items: expertise.length ? expertise : ['Client-focused advice', 'Clear communication', 'Premium guidance'],
    },
    {
      title: 'Areas',
      subtitle: 'Markets and locations served',
      Icon: MapPin,
      items: areas.length ? areas : ['Local market support', 'Remote consultation available'],
    },
  ];

  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-white">
      <div className="relative w-full px-5 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="mb-9">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              <Sparkles size={12} />
              {content.eyebrow || 'Professional Snapshot'}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-text-heading sm:text-3xl">
              {content.heading || 'Services, Expertise & Areas'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
              {content.body || 'A quick view of what this professional handles, where they work, and the strengths clients can expect.'}
            </p>
          </div>
        </div>

        <div className="grid gap-9 border-y border-slate-200 py-8 lg:grid-cols-3 lg:gap-0">
          {columns.map(({ title, subtitle, Icon, items }, index) => (
            <div
              key={title}
              className={`relative min-w-0 lg:px-8 ${index === 0 ? 'lg:pl-0' : 'lg:border-l lg:border-slate-200'} ${index === columns.length - 1 ? 'lg:pr-0' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                    <Icon size={19} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-text-heading">{title}</h3>
                    <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




