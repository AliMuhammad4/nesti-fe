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

/** Relative luminance 0–1 for #rgb / #rrggbb. */
function hexLuminance(hex) {
  const raw = String(hex || '').trim().replace('#', '');
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const full = raw.length === 3
    ? raw.split('').map((ch) => `${ch}${ch}`).join('')
    : raw;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function isDarkTone(color) {
  const lum = hexLuminance(color);
  return lum != null ? lum < 0.45 : false;
}

export default function PublicExpertiseBand({ profile, content = {}, sectionStyle = {} }) {
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const professionalProfile = profile.professional_profile || {};
  const role = profile.professional_type;
  // Chips are profile-owned — builder only edits eyebrow / heading / body.
  const services = uniqueItems([
    ...(profile.services || []).map((service) => service?.title),
    ...(profile.practice_areas || []),
    ...fallbackServices(role),
  ]);
  const expertise = uniqueItems([
    ...normalizeList(professionalProfile.specializations),
    ...normalizeList(professionalProfile.certificates),
    ...normalizeList(professionalProfile.awards),
    ...normalizeList(professionalProfile.preferred_clients),
  ]);
  const areas = resolvePublicProfileAreas(profile);

  const sectionText = sectionStyle.textColor || '';
  const sectionBg = sectionStyle.background || '';
  // Light section text (or dark section bg) means chips sit on a dark band.
  const onDarkBand = isDarkTone(sectionBg) || (Boolean(sectionText) && !isDarkTone(sectionText));
  const hasCustomTextColor = Boolean(sectionText);

  const headingClass = hasCustomTextColor ? 'text-current' : 'text-[var(--storefront-heading,#0f172a)]';
  const mutedClass = hasCustomTextColor ? 'text-current' : 'text-[var(--storefront-muted,#64748b)]';
  const ruleColor = onDarkBand
    ? 'color-mix(in srgb, currentColor 18%, transparent)'
    : 'var(--storefront-border, #e2e8f0)';

  const columns = [
    {
      title: 'Services',
      subtitle: 'What clients can request',
      Icon: Briefcase,
      items: services,
      collection: 'services',
    },
    {
      title: 'Expertise',
      subtitle: 'Professional strengths',
      Icon: Sparkles,
      items: expertise.length ? expertise : ['Client-focused advice', 'Clear communication', 'Premium guidance'],
      collection: 'expertise',
    },
    {
      title: 'Areas',
      subtitle: 'Markets and locations served',
      Icon: MapPin,
      items: areas.length ? areas : ['Local market support', 'Remote consultation available'],
      collection: 'areas',
    },
  ];

  return (
    <section
      className="relative overflow-hidden border-y bg-transparent"
      style={{
        color: sectionText || undefined,
        borderColor: ruleColor,
      }}
    >
      <div className={`relative w-full px-5 py-8 ${forceCompactPreview ? '' : 'sm:px-8 sm:py-10 lg:px-12 xl:px-14'}`}>
        <div className="mb-6 sm:mb-7">
          <div className="max-w-5xl">
            <div
              data-storefront-field="content.eyebrow"
              data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
              data-storefront-label="Expertise eyebrow"
              className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] ${mutedClass}`}
              style={hasCustomTextColor ? { opacity: 0.72 } : undefined}
            >
              <Sparkles size={12} />
              {content.eyebrow || 'Professional Snapshot'}
            </div>
            <h2
              data-storefront-field="content.heading"
              data-storefront-source={content.heading ? 'persisted' : 'fallback'}
              data-storefront-label="Expertise heading"
              className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${headingClass}`}
            >
              {content.heading || 'Services, Expertise & Areas'}
            </h2>
            <p
              data-storefront-field="content.body"
              data-storefront-source={content.body ? 'persisted' : 'fallback'}
              data-storefront-label="Expertise description"
              className={`mt-3 max-w-none text-sm leading-6 lg:whitespace-nowrap ${mutedClass}`}
              style={hasCustomTextColor ? { opacity: 0.86 } : undefined}
            >
              {content.body || 'A quick view of what this professional handles, where they work, and the strengths clients can expect.'}
            </p>
          </div>
        </div>

        <div
          className={`grid gap-6 border-y py-6 ${forceMobilePreview ? 'grid-cols-1' : forceTabletPreview ? 'sm:grid-cols-2' : 'lg:grid-cols-3 lg:gap-0'}`}
          style={{ borderColor: ruleColor }}
        >
          {columns.map(({ title, subtitle, Icon, items, collection }, index) => (
            <div
              key={title}
              data-storefront-anim-item="true"
              className={`min-w-0 ${forceCompactPreview ? '' : `lg:px-8 ${index === 0 ? 'lg:pl-0' : 'lg:border-l'} ${index === columns.length - 1 ? 'lg:pr-0' : ''}`}`}
              style={!forceCompactPreview && index > 0 ? { borderColor: ruleColor } : undefined}
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: onDarkBand
                      ? 'color-mix(in srgb, #ffffff 12%, transparent)'
                      : 'color-mix(in srgb, var(--storefront-primary, #0f766e) 10%, transparent)',
                    color: onDarkBand
                      ? 'currentColor'
                      : 'var(--storefront-primary, #0f766e)',
                    boxShadow: onDarkBand
                      ? 'inset 0 0 0 1px color-mix(in srgb, #ffffff 16%, transparent)'
                      : 'inset 0 0 0 1px color-mix(in srgb, var(--storefront-primary, #0f766e) 16%, transparent)',
                  }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className={`text-[15px] font-bold leading-5 tracking-tight ${headingClass}`}>
                    {title}
                  </h3>
                  <p
                    className={`mt-1 text-[11px] leading-4 ${mutedClass}`}
                    style={hasCustomTextColor ? { opacity: 0.72 } : undefined}
                  >
                    {subtitle}
                  </p>
                </div>
              </div>

              <div
                data-storefront-field={`content.${collection}`}
                data-storefront-source="profile"
                data-storefront-label={`${title} chips`}
                className="mt-5 flex flex-wrap gap-2"
              >
                {items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex max-w-full items-center rounded-full px-3 py-1.5 text-[11px] font-semibold leading-none tracking-tight"
                    style={{
                      // Chips keep their own contrast — never inherit section text color.
                      background: onDarkBand
                        ? 'color-mix(in srgb, #ffffff 94%, var(--storefront-primary, #0f766e))'
                        : 'color-mix(in srgb, var(--storefront-primary, #0f766e) 7%, #ffffff)',
                      color: '#0f172a',
                      boxShadow: onDarkBand
                        ? '0 1px 2px rgba(15,23,42,0.12)'
                        : 'inset 0 0 0 1px color-mix(in srgb, var(--storefront-primary, #0f766e) 12%, #e2e8f0)',
                    }}
                  >
                    <span className="truncate">{item}</span>
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
