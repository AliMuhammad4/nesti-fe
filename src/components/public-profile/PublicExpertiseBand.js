'use client';

import { Briefcase, Check, MapPin, Sparkles } from 'lucide-react';
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

function gridClassForColumns(columns, { mobile, tablet }) {
  if (mobile) return 'grid grid-cols-1 divide-y';
  if (tablet) {
    return columns === '1' ? 'grid grid-cols-1' : 'grid sm:grid-cols-2';
  }
  return {
    1: 'grid grid-cols-1',
    2: 'grid sm:grid-cols-2',
    3: 'grid lg:grid-cols-3',
    4: 'grid sm:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid lg:grid-cols-3';
}

function sectionWidthClass(width) {
  return { narrow: 'max-w-5xl', contained: 'max-w-6xl', full: 'max-w-none' }[width || 'full'] || 'max-w-none';
}

function sectionPaddingClass(padding) {
  return { none: 'py-0', small: 'py-6', medium: 'py-10 sm:py-12', large: 'py-12 sm:py-16' }[padding || 'large'] || 'py-12 sm:py-16';
}

function radiusForStyle(radius) {
  return { none: 0, small: 12, default: 16, medium: 20, large: 28, full: 36 }[radius || 'default'] ?? 16;
}

function isDarkTone(color) {
  const lum = hexLuminance(color);
  return lum != null ? lum < 0.45 : false;
}

function ExpertiseGroup({
  title,
  subtitle,
  Icon,
  items,
  collection,
  tone = 'light',
  headingClass,
  mutedClass,
  hasCustomTextColor,
  showSideRule = false,
  ruleColor,
}) {
  const marker = tone === 'luxury'
    ? 'var(--storefront-accent)'
    : tone === 'dark'
      ? 'color-mix(in srgb, var(--storefront-accent, #1f6fbf) 78%, #ffffff)'
      : 'var(--storefront-primary, #0f766e)';
  const textClass = tone === 'luxury'
    ? 'text-[#f3ecdf]'
    : tone === 'dark'
      ? 'text-white/90'
      : 'text-[var(--storefront-heading,#0f172a)]';
  const rowHover = tone === 'luxury'
    ? 'hover:bg-white/[0.05]'
    : tone === 'dark'
      ? 'hover:bg-white/[0.06]'
      : 'hover:bg-[color-mix(in_srgb,var(--storefront-primary,#0f766e)_6%,transparent)]';
  const iconWrapStyle = tone === 'luxury'
    ? {
        background: 'color-mix(in srgb, var(--storefront-accent) 14%, transparent)',
        color: 'var(--storefront-accent)',
      }
    : tone === 'dark'
      ? {
          background: 'color-mix(in srgb, #ffffff 12%, transparent)',
          color: '#ffffff',
        }
      : {
          background: 'color-mix(in srgb, var(--storefront-primary, #0f766e) 12%, transparent)',
          color: 'var(--storefront-primary, #0f766e)',
        };

  return (
    <article
      data-storefront-anim-item="true"
      className={`min-w-0 px-5 py-6 sm:px-6 sm:py-7 ${showSideRule ? 'lg:border-l' : ''}`}
      style={showSideRule ? { borderColor: ruleColor } : undefined}
    >
      <header className="mb-4 flex items-center gap-3.5">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={iconWrapStyle}
        >
          <Icon size={17} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h3 className={`text-[15px] font-semibold tracking-tight ${headingClass}`}>
            {title}
          </h3>
          <p
            className={`mt-0.5 text-[12px] leading-4 ${mutedClass}`}
            style={hasCustomTextColor ? { opacity: 0.7 } : undefined}
          >
            {subtitle}
          </p>
        </div>
      </header>
      <ul
        data-storefront-field={`content.${collection}`}
        data-storefront-source="profile"
        data-storefront-label={`${title} items`}
        className="space-y-0.5"
      >
        {items.map((item) => (
          <li key={item}>
            <div className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors duration-200 ${rowHover}`}>
              <Check size={15} strokeWidth={2.4} className="shrink-0" style={{ color: marker }} />
              <span className={`min-w-0 text-[13.5px] font-medium leading-5 ${textClass}`}>
                {item}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function PublicExpertiseBand({
  profile,
  content = {},
  sectionStyle = {},
  layout = {},
}) {
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const professionalProfile = profile.professional_profile || {};
  const role = profile.professional_type;
  // Lists are profile-owned — builder only edits eyebrow / heading / body.
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
  const templateKey = String(profile?.storefront_template_key || '').toLowerCase();
  const isLuxuryTemplate = templateKey.includes('luxury');
  const isCommunityTemplate = templateKey === 'agent-community-expert';
  // Light section text (or dark section bg) means chips sit on a dark band.
  const onDarkBand = isDarkTone(sectionBg) || (Boolean(sectionText) && !isDarkTone(sectionText));
  const hasCustomTextColor = Boolean(sectionText);

  const headingClass = hasCustomTextColor
    ? 'text-current'
    : isLuxuryTemplate
      ? 'text-[#f5f1e8]'
      : 'text-[var(--storefront-heading,#0f172a)]';
  const mutedClass = hasCustomTextColor
    ? 'text-current'
    : isLuxuryTemplate
      ? 'text-[color:color-mix(in_srgb,var(--storefront-accent)_62%,#f5f1e8)]'
      : 'text-[var(--storefront-muted,#64748b)]';
  const ruleColor = onDarkBand
    ? 'color-mix(in srgb, currentColor 18%, transparent)'
    : 'var(--storefront-border, #e2e8f0)';
  const resolvedRuleColor = isLuxuryTemplate ? 'color-mix(in srgb, var(--storefront-accent) 46%, transparent)' : ruleColor;

  const groups = [
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

  const configuredColumns = String(layout.columns || '3');
  const cardStyle = layout.cardStyle || (isCommunityTemplate ? 'elevated' : 'elevated');
  const widthClass = sectionWidthClass(layout.width);
  const paddingClass = sectionPaddingClass(layout.padding || (isCommunityTemplate ? 'large' : 'medium'));
  const alignmentClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[layout.alignment || 'left'] || 'text-left';
  const radius = radiusForStyle(sectionStyle.radius || (isCommunityTemplate ? 'default' : 'large'));
  const cardClass = {
    flat: 'border-transparent',
    bordered: 'border',
    elevated: 'border-transparent',
    glass: 'border bg-white/[.08] backdrop-blur-sm',
  }[cardStyle] || 'border-transparent';
  const tone = isLuxuryTemplate
    ? 'luxury'
    : onDarkBand
      ? 'dark'
      : 'light';
  const groupHeadingClass = headingClass;
  const groupMutedClass = mutedClass;
  const panelBackground = 'transparent';
  const panelBorder = isCommunityTemplate || onDarkBand
    ? 'color-mix(in srgb, #ffffff 12%, transparent)'
    : resolvedRuleColor;
  const panelShadow = 'none';
  const showSideRule = !forceCompactPreview && configuredColumns !== '1';

  return (
    <section
      className={`relative overflow-hidden px-4 sm:px-8 ${paddingClass} ${isLuxuryTemplate || isCommunityTemplate ? '' : 'border-y'}`}
      style={{
        background: isCommunityTemplate ? (sectionStyle.background || undefined) : undefined,
        color: sectionText || undefined,
        borderColor: isLuxuryTemplate ? 'transparent' : resolvedRuleColor,
      }}
    >
      <div className={`relative mx-auto ${widthClass}`}>
        <div className={`relative pb-7 sm:pb-8 ${alignmentClass} ${layout.alignment === 'center' ? 'mx-auto max-w-3xl' : layout.alignment === 'right' ? 'ml-auto max-w-3xl' : 'max-w-3xl'}`}>
          {isCommunityTemplate ? (
            <p
              data-storefront-field="content.eyebrow"
              data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
              data-storefront-label="Expertise eyebrow"
              className="inline-flex rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.24em] text-primary-contrast"
            >
              {content.eyebrow || 'Community knowledge'}
            </p>
          ) : (
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
          )}
          <h2
            data-storefront-field="content.heading"
            data-storefront-source={content.heading ? 'persisted' : 'fallback'}
            data-storefront-label="Expertise heading"
            className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${isCommunityTemplate && !hasCustomTextColor ? 'text-text-heading' : headingClass}`}
          >
            {content.heading || (isCommunityTemplate ? 'The local picture' : 'Services, Expertise & Areas')}
          </h2>
          <p
            data-storefront-field="content.body"
            data-storefront-source={content.body ? 'persisted' : 'fallback'}
            data-storefront-label="Expertise description"
            className={`mt-3 text-sm leading-6 ${isCommunityTemplate && !hasCustomTextColor ? 'text-text-muted' : mutedClass}`}
            style={hasCustomTextColor ? { opacity: 0.86 } : undefined}
          >
            {content.body || (isCommunityTemplate
              ? 'A practical read on lifestyle, pricing, schools, transit, and the micro-markets shaping each move.'
              : 'A quick view of what this professional handles, where they work, and the strengths clients can expect.')}
          </p>
        </div>

        <div
          className={`relative overflow-hidden ${cardClass} ${gridClassForColumns(configuredColumns, {
            mobile: forceMobilePreview,
            tablet: forceTabletPreview,
          })}`}
          style={{
            background: cardStyle === 'flat' ? 'transparent' : panelBackground,
            borderColor: panelBorder,
            borderRadius: cardStyle === 'flat' ? 0 : radius,
            boxShadow: panelShadow,
          }}
        >
          {isCommunityTemplate ? (
            <span className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-r border-t border-accent/30" />
          ) : null}
          {groups.map((group, index) => (
            <ExpertiseGroup
              key={group.title}
              {...group}
              tone={tone}
              headingClass={groupHeadingClass}
              mutedClass={groupMutedClass}
              hasCustomTextColor={hasCustomTextColor}
              showSideRule={showSideRule && index > 0}
              ruleColor={panelBorder}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
