'use client';

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  FileCheck2,
  Check,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Radar,
  ShieldCheck,
  Users,
} from 'lucide-react';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import { buildTrackedCalendlyUrl, resolvePublicCalendlySource } from '@/lib/publicProfileLinks';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../shared/ResilientStorefrontImage';
import {
  blockContent,
  hasReadableHexContrast,
  lawyerClassicGridClass,
  lawyerClassicPaddingClass,
  lawyerClassicResolvedPaddingClass,
  lawyerContentSource,
  lawyerContentValue,
  isLightHexColor,
  resolveLawyerClassicIcon,
  resolveProfessionalIdentity,
  uniqueNamedList,
} from '../shared/lawyerSectionUtils';
import { resolveLawyerStandingItems } from '../classic/lawyerCredentialMetrics';
import { resolvePublicProfileAreas } from '@/lib/publicProfileAreas';
import { resolveFirstHomeLanguages } from '../firstHome/firstHomeLanguages';

const PANEL_CLIP = 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)';

function investorCardStyleClass(cardStyle, dark = false) {
  if (cardStyle === 'flat') {
    return dark ? 'border-transparent shadow-none' : 'border-transparent bg-transparent shadow-none';
  }
  if (cardStyle === 'elevated') {
    return dark
      ? 'border-white/10 shadow-[0_22px_60px_rgba(13,25,30,.22)]'
      : 'border-transparent shadow-[0_20px_50px_rgba(15,23,42,.14)]';
  }
  if (cardStyle === 'glass') {
    return dark
      ? 'border-white/20 bg-white/[0.08] shadow-[0_22px_60px_rgba(4,15,20,.26)] backdrop-blur-xl'
      : 'border-white/80 bg-white/60 shadow-[0_18px_50px_rgba(15,23,42,.1)] backdrop-blur-xl';
  }
  return dark ? 'border-white/10' : 'border-slate-300/80';
}

function investorKpiGridClass(columns) {
  return {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  }[Number(columns) || 4];
}

function investorAnchorId(block, canonicalId) {
  const occurrence = Number(block?.runtime?.typeOccurrence || 0);
  if (occurrence === 0) return canonicalId;
  const safeId = String(block?.id || occurrence + 1).replace(/[^a-zA-Z0-9_-]/g, '-');
  return `${canonicalId}-${safeId}`;
}

function investorReadableColor(background, requestedColor) {
  if (hasReadableHexContrast(requestedColor, background)) return requestedColor;
  return isLightHexColor(background) ? '#111827' : '#ffffff';
}

function investorFooterLinkProps(item, absoluteHashes = false, slug = '') {
  const raw = String(item?.target || item?.url || item?.href || '').trim();
  if (raw.startsWith('#')) {
    return { href: absoluteHashes && slug ? `/professional/${slug}${raw}` : raw };
  }
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    return { href: raw || '#' };
  }
  try {
    const url = new URL(raw);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      return {
        href: raw,
        ...(url.protocol === 'http:' || url.protocol === 'https:'
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {}),
      };
    }
  } catch {
    // Invalid or unsafe destinations remain inert in the public footer.
  }
  return {
    href: '#',
    'aria-disabled': 'true',
    tabIndex: -1,
    onClick: (event) => event.preventDefault(),
  };
}

function sectionPresentation(block, fallbackBackground, fallbackColor, fallbackColumns = '3') {
  const style = block?.data?.style || block?.style || {};
  const layout = block?.data?.layout || block?.layout || {};
  const background = style.background || fallbackBackground;
  const requestedColor = style.textColor || fallbackColor;
  const color = hasReadableHexContrast(requestedColor, background)
    ? requestedColor
    : isLightHexColor(background) ? '#111827' : '#ffffff';
  return {
    background,
    color,
    padding: layout.padding || 'large',
    columns: layout.columns || fallbackColumns,
    alignment: ['left', 'center', 'right'].includes(layout.alignment) ? layout.alignment : 'left',
    cardStyle: layout.cardStyle || 'bordered',
    mediaPosition: layout.mediaPosition || 'portrait',
  };
}

function InvestorSectionHeading({
  content,
  eyebrow,
  heading,
  body,
  dark = false,
  nowrap = false,
}) {
  return (
    <div data-storefront-anim-item="true">
      <div className="max-w-4xl">
        <EditableText
          as="p"
          field="content.eyebrow"
          label="Section eyebrow"
          source={lawyerContentSource(content, 'eyebrow')}
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent"
        >
          {lawyerContentValue(content, 'eyebrow', eyebrow)}
        </EditableText>
        <EditableText
          as="h2"
          field="content.heading"
          label="Section heading"
          source={lawyerContentSource(content, 'heading')}
          className={`mt-4 max-w-none text-3xl font-semibold uppercase leading-[1.12] tracking-[-0.02em] ${
            dark ? 'text-white' : 'text-current'
          }`}
        >
          {lawyerContentValue(content, 'heading', heading)}
        </EditableText>
        <EditableText
          as="p"
          field="content.body"
          label="Section supporting copy"
          source={lawyerContentSource(content, 'body')}
          className={`mt-5 max-w-none text-sm leading-7 ${nowrap ? 'lg:whitespace-nowrap lg:text-[13px]' : ''} ${
            dark ? 'text-white/65' : 'text-current opacity-65'
          }`}
        >
          {lawyerContentValue(content, 'body', body)}
        </EditableText>
      </div>
    </div>
  );
}

function normalizedItems(content, fallback, key = 'items', limit = 6) {
  const hasPersisted = Object.prototype.hasOwnProperty.call(content, key)
    && Array.isArray(content[key]);
  const source = hasPersisted ? content[key] : fallback;
  return {
    hasPersisted,
    items: source
      .map((item, index) => (
        typeof item === 'string'
          ? { id: `${key}-${index}`, title: item, description: '' }
          : {
              ...item,
              id: item?.id || `${key}-${index}`,
              description: item?.description ?? item?.text ?? '',
            }
      ))
      .filter((item) => item?.title || item?.label)
      .slice(0, limit),
  };
}

function investorCalendlyUrl(profile) {
  return buildTrackedCalendlyUrl(resolvePublicCalendlySource(profile), profile);
}

export function LawyerInvestorHero({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const presentation = sectionPresentation(block, '#20252b', '#ffffff');
  const portrait = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  const cover = profile?.cover_photo_url
    || profile?.storefront_cover_fallback_url
    || profile?.storefront_brand_kit?.cover_url
    || '';
  const primaryLabel = lawyerContentValue(content, 'primary_cta_label', 'Start investor intake');
  const secondaryLabel = lawyerContentValue(content, 'cta_label', 'Book a strategy call');
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const mediaMode = ['portrait', 'cover', 'none'].includes(presentation.mediaPosition)
    ? presentation.mediaPosition
    : 'portrait';
  const showMedia = mediaMode !== 'none';
  const mediaSource = mediaMode === 'cover' ? cover : portrait;
  const heroTextColor = content.hero_card_text_color || presentation.color;
  const primaryButtonBackground = content.primary_button_background || '#00a7c4';
  const primaryButtonColor = investorReadableColor(
    primaryButtonBackground,
    content.primary_button_text_color || '#ffffff',
  );
  const secondaryButtonBackground = content.secondary_button_background || 'rgba(255,255,255,0.04)';
  const secondaryButtonColor = content.secondary_button_text_color || '#ffffff';

  return (
    <div
      className="group relative min-h-[46rem] overflow-hidden pt-16"
      style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}
    >
      <PublicStorefrontHeader
        profile={profile}
        forceCompactPreview={isPreview && profile.storefront_preview_mode !== 'desktop'}
        forceMobilePreview={isPreview && profile.storefront_preview_mode === 'mobile'}
      />
      <div className="investor-grid-motion pointer-events-none absolute inset-0 top-16 opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl transition duration-1000 group-hover:scale-125 group-hover:bg-accent/20" />
      <div className="pointer-events-none absolute left-[42%] top-1/3 h-2 w-2 animate-ping rounded-full bg-accent/70" />
      <div data-investor-layout-grid="hero" className={`relative grid min-h-[42rem] w-full items-stretch ${showMedia ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]' : ''}`}>
        <div className="relative flex items-center px-6 py-16 sm:px-10 lg:px-16 xl:px-20">
          <div className="max-w-3xl" data-storefront-anim-item="true">
            <div className="mb-9 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              <span className="h-px w-12 bg-accent" />
              Investor legal operating system
            </div>
            <EditableText
              field="content.eyebrow"
              label="Hero eyebrow"
              source={lawyerContentSource(content, 'eyebrow')}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent"
            >
              {lawyerContentValue(content, 'eyebrow', 'Investor transaction counsel')}
            </EditableText>
            <EditableText
              as="h1"
              field="content.heading"
              label="Hero heading"
              source={lawyerContentSource(content, 'heading')}
              className="mt-6 max-w-3xl text-4xl font-semibold uppercase leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-6xl"
              style={{ color: heroTextColor }}
            >
              {lawyerContentValue(content, 'heading', 'Transaction counsel for active investors')}
            </EditableText>
            <EditableText
              as="p"
              field="content.body"
              label="Hero description"
              source={lawyerContentSource(content, 'body')}
              className="mt-7 max-w-2xl text-base leading-8 opacity-65 sm:text-lg"
              style={{ color: heroTextColor }}
            >
              {lawyerContentValue(content, 'body', 'Structured legal support for acquisitions, refinances, assignments, ownership changes, and portfolio title work.')}
            </EditableText>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={actions.onDirectLeadClick}
                data-storefront-field="content.primary_cta_label"
                data-storefront-source={lawyerContentSource(content, 'primary_cta_label')}
                data-storefront-label="Primary hero button"
                data-investor-color-override="true"
                className={`${primaryLabel ? 'inline-flex' : 'hidden'} storefront-btn min-h-14 items-center gap-3 bg-accent px-7 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(0,167,196,.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#008da6] hover:shadow-[0_18px_40px_rgba(0,167,196,.35)]`}
                style={{ clipPath: PANEL_CLIP, '--investor-override-bg': primaryButtonBackground, '--investor-override-color': primaryButtonColor }}
              >
                <MessageSquareText size={17} />
                {primaryLabel}
              </button>
              <button
                type="button"
                onClick={() => actions.onCtaClick?.('book_consultation')}
                data-storefront-field="content.cta_label"
                data-storefront-source={lawyerContentSource(content, 'cta_label')}
                data-storefront-label="Strategy call button"
                data-investor-color-override="true"
                className={`${secondaryLabel ? 'inline-flex' : 'hidden'} storefront-btn min-h-14 items-center gap-3 border border-white/25 px-7 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-accent hover:brightness-110`}
                style={{ '--investor-override-bg': secondaryButtonBackground, '--investor-override-color': secondaryButtonColor }}
              >
                <CalendarDays size={17} />
                {secondaryLabel}
              </button>
            </div>
          </div>
        </div>
        {showMedia ? <div
          className="relative min-h-[24rem] overflow-hidden border-l border-white/10 bg-[#12171c] sm:min-h-[30rem] lg:min-h-full"
          data-storefront-field={mediaMode === 'cover' ? 'brandKit.cover_url' : 'brandKit.profile_photo_url'}
          data-storefront-source="profile"
          data-storefront-label="Investor hero image"
          data-storefront-media-kind={mediaMode}
        >
          {mediaSource ? (
            <ResilientStorefrontImage
              profile={profile}
              candidates={mediaMode === 'cover'
                ? [{ src: cover, kind: 'cover' }]
                : [{ src: portrait, kind: 'profile' }]}
              alt={identity.name}
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover grayscale-[0.35] contrast-110 transition duration-1000 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
              fallback={<div className="absolute inset-0 bg-[#12171c]" />}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[#12171c] text-9xl font-semibold text-accent/50">
              {identity.name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,#12171c_100%)]" />
          <div className="absolute inset-x-7 bottom-7 border border-white/15 bg-black/35 p-5 backdrop-blur-md transition duration-500 group-hover:-translate-y-1 group-hover:border-accent/50 group-hover:bg-black/50" style={{ clipPath: PANEL_CLIP }}>
            <p className="text-xl font-semibold text-white">{identity.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/50">{identity.role}</p>
          </div>
        </div> : null}
      </div>
      <style jsx>{`
        @keyframes investor-grid-drift {
          from {
            background-position: 0 0, 0 0;
          }
          to {
            background-position: 48px 48px, 48px 48px;
          }
        }

        .investor-grid-motion {
          animation: investor-grid-drift 12s linear infinite;
          will-change: background-position;
        }

        @media (prefers-reduced-motion: reduce) {
          .investor-grid-motion {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export function LawyerInvestorAbout({ profile, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const presentation = sectionPresentation(block, 'transparent', '#20252b');
  const photo = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  return (
    <div
      id={investorAnchorId(block, 'about')}
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicResolvedPaddingClass(presentation.padding, 'py-20')}`}
      style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}
    >
      <div data-investor-layout-grid="about" className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.72fr_1.28fr]">
        <div
          className="relative min-h-[24rem] overflow-hidden bg-[#20252b]"
          style={{ clipPath: PANEL_CLIP }}
          data-storefront-field="brandKit.profile_photo_url"
          data-storefront-source="profile"
          data-storefront-label="About profile image"
          data-storefront-media-kind="profile"
        >
          {photo ? (
            <ResilientStorefrontImage
              profile={profile}
              candidates={[{ src: photo, kind: 'profile' }]}
              alt={identity.name}
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-cover grayscale-[0.45]"
              fallback={<div className="absolute inset-0 bg-[#20252b]" />}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12171c] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <EditableText field="content.image_name" label="Profile name" source={lawyerContentSource(content, 'image_name')} className="text-xl font-semibold text-white">
              {lawyerContentValue(content, 'image_name', identity.name)}
            </EditableText>
            <EditableText field="content.image_role" label="Profile role" source={lawyerContentSource(content, 'image_role')} className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              {lawyerContentValue(content, 'image_role', identity.role)}
            </EditableText>
          </div>
        </div>
        <div className="grid content-center border border-slate-300/70 bg-white/55 p-7 sm:p-10 lg:p-14" style={{ clipPath: PANEL_CLIP }}>
          <InvestorSectionHeading
            content={content}
            eyebrow="Investor-focused legal practice"
            heading={`Legal clarity with ${identity.name}`}
            body={profile?.about || 'A disciplined legal process for repeat transactions, ownership structures, title work, and closing execution.'}
            index="01"
          />
        </div>
      </div>
    </div>
  );
}

export function LawyerInvestorPracticeSnapshot({ profile, block }) {
  const content = blockContent(block);
  const presentation = sectionPresentation(block, 'transparent', '#20252b', '3');
  const professional = profile?.professional_profile || {};
  const specializations = uniqueNamedList([
    ...(Array.isArray(professional.specializations) ? professional.specializations : []),
    ...(Array.isArray(professional.core_specialization_tags) ? professional.core_specialization_tags : []),
    ...(Array.isArray(professional.specialty_strength_tags) ? professional.specialty_strength_tags : []),
  ], []);
  const markets = uniqueNamedList([
    ...resolvePublicProfileAreas(profile),
    ...(Array.isArray(professional.service_area_cities) ? professional.service_area_cities : []),
    ...(Array.isArray(professional.service_area_regions) ? professional.service_area_regions : []),
  ], []);
  const languages = resolveFirstHomeLanguages(profile, professional);
  const groups = [
    {
      key: 'practice_focus',
      title: lawyerContentValue(content, 'practice_focus_label', 'Investor practice focus'),
      subtitle: lawyerContentValue(content, 'practice_focus_subtitle', 'Where counsel is concentrated'),
      Icon: BriefcaseBusiness,
      profileField: 'profile.professional_profile.specializations',
      items: specializations.length ? specializations : ['Not provided'],
    },
    {
      key: 'markets',
      title: lawyerContentValue(content, 'markets_label', 'Markets served'),
      subtitle: lawyerContentValue(content, 'markets_subtitle', 'Locations and transaction contexts'),
      Icon: MapPin,
      profileField: 'profile.professional_profile.service_area_cities',
      items: markets.length ? markets : ['Not provided'],
    },
    {
      key: 'languages',
      title: lawyerContentValue(content, 'languages_label', 'Languages spoken'),
      subtitle: lawyerContentValue(content, 'languages_subtitle', 'Consultation accessibility'),
      Icon: MessageSquareText,
      profileField: 'profile.professional_profile.languages_spoken',
      items: languages.length ? languages : ['Not provided'],
    },
  ];

  return (
    <div
      id={investorAnchorId(block, 'practice-snapshot')}
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}
    >
      <div className="mx-auto max-w-7xl">
        <InvestorSectionHeading
          content={content}
          eyebrow="Investor practice snapshot"
          heading="A practice built for active portfolios"
          body="A concise view of transaction focus, service markets, and consultation languages."
        />
        <div data-investor-layout-grid="cards" className={`mt-10 grid gap-4 ${lawyerClassicGridClass(presentation.columns, groups.length, true)}`}>
          {groups.map(({ key, title, subtitle, Icon, items, profileField }) => (
            <article
              key={key}
              data-storefront-anim-item="true"
              className={`group relative min-h-64 overflow-hidden border bg-white/80 p-6 transition duration-500 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_20px_55px_rgba(0,127,149,.12)] ${investorCardStyleClass(presentation.cardStyle)}`}
              style={{ clipPath: PANEL_CLIP }}
            >
              <header className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-accent/35 bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-[#071b20]">
                  <Icon size={19} strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <EditableText
                    as="h3"
                    field={`content.${key}_label`}
                    label={`${title} title`}
                    source={lawyerContentSource(content, `${key}_label`)}
                    className="text-sm font-semibold uppercase leading-snug tracking-[0.01em]"
                  >
                    {title}
                  </EditableText>
                  <EditableText
                    as="p"
                    field={`content.${key}_subtitle`}
                    label={`${title} subtitle`}
                    source={lawyerContentSource(content, `${key}_subtitle`)}
                    className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] opacity-45"
                  >
                    {subtitle}
                  </EditableText>
                </div>
              </header>
              <ul className="mt-6 space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6" data-storefront-field={profileField} data-storefront-source="profile">
                    <Check size={15} className="mt-1 shrink-0 text-accent" strokeWidth={2.4} />
                    <span className="opacity-70">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function InvestorCardSection({
  profile,
  block,
  type,
  index,
  fallback,
  eyebrow,
  heading,
  body,
}) {
  const content = blockContent(block);
  const presentation = sectionPresentation(block, 'transparent', '#20252b');
  const { items, hasPersisted } = normalizedItems(content, fallback);
  const isServices = type === 'services';
  const iconKeys = type === 'practice'
    ? ['building', 'contract', 'dollar', 'file', 'landmark', 'shield']
    : ['contract', 'dollar', 'building', 'landmark', 'shield', 'briefcase'];
  return (
    <div
      id={investorAnchorId(block, type === 'practice' ? 'practice-areas' : 'services')}
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}
    >
      <div className="relative mx-auto max-w-7xl">
        <InvestorSectionHeading content={content} eyebrow={eyebrow} heading={heading} body={body} index={index} />
        {isServices ? (
          <div className="mt-9 inline-flex items-center gap-3 border border-accent/25 bg-accent/[0.06] px-4 py-2.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <EditableText
              field="content.resource_label"
              label="Workstream label"
              source={lawyerContentSource(content, 'resource_label')}
              className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-current"
            >
              {lawyerContentValue(content, 'resource_label', 'Transaction workstreams')}
            </EditableText>
          </div>
        ) : null}
        <div data-investor-layout-grid="cards" className={`mt-8 grid auto-rows-fr ${isServices ? 'gap-4' : 'gap-3'} ${lawyerClassicGridClass(presentation.columns, items.length, true)}`}>
          {items.map((item, itemIndex) => {
            const Icon = resolveLawyerClassicIcon(item, itemIndex, iconKeys);
            return (
              <article
                key={item.id}
                data-storefront-anim-item="true"
                data-storefront-collection="items"
                data-storefront-item-id={item.id}
                data-storefront-item-index={itemIndex}
                data-storefront-item-field="title"
                data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                className={`group relative min-h-52 overflow-hidden p-6 transition duration-500 ${investorCardStyleClass(presentation.cardStyle, isServices)} ${
                  isServices
                    ? 'border border-white/10 bg-[#182126] text-white shadow-[0_18px_55px_rgba(13,25,30,.12)] hover:-translate-y-2 hover:border-accent/60 hover:shadow-[0_24px_70px_rgba(0,127,149,.24)]'
                    : 'border border-slate-300/80 bg-white/80 text-current hover:-translate-y-1 hover:border-accent hover:shadow-[0_20px_50px_rgba(0,167,196,.12)]'
                }`}
                style={{
                  clipPath: PANEL_CLIP,
                  backgroundColor: item.background || (isServices ? '#182126' : undefined),
                  color: item.text_color || (isServices ? '#ffffff' : undefined),
                }}
              >
                {isServices ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,167,196,.12),transparent_42%)] opacity-60 transition duration-500 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 border-r border-t border-accent/20 transition duration-500 group-hover:h-28 group-hover:w-28 group-hover:border-accent/50" />
                  </>
                ) : null}
                <div className="relative flex items-start gap-4">
                  <span
                    data-storefront-anim-item="true"
                    data-investor-color-override={(item.icon_background || content.icon_background || item.icon_color || content.icon_color) ? 'true' : undefined}
                    className={`grid h-11 w-11 shrink-0 place-items-center border border-accent/35 bg-accent/10 text-accent transition duration-500 ${
                    isServices ? 'group-hover:rotate-3 group-hover:border-accent group-hover:bg-accent group-hover:text-[#071b20]' : ''
                    }`}
                    style={{
                      '--investor-override-bg': item.icon_background || content.icon_background || undefined,
                      '--investor-override-color': item.icon_color || content.icon_color || undefined,
                    }}
                  >
                    <Icon size={19} strokeWidth={1.7} />
                  </span>
                  <EditableText
                    as="h3"
                    field={`content.items.${itemIndex}.title`}
                    label={`Card ${itemIndex + 1} title`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={itemIndex}
                    itemField="title"
                    className="min-w-0 flex-1 self-center text-base font-semibold uppercase leading-tight tracking-[-0.01em] text-current"
                  >
                    {item.title}
                  </EditableText>
                </div>
                <EditableText
                  as="p"
                  field={`content.items.${itemIndex}.description`}
                  label={`Card ${itemIndex + 1} description`}
                  source={hasPersisted ? 'persisted' : 'fallback'}
                  collection="items"
                  itemId={item.id}
                  itemIndex={itemIndex}
                  itemField="description"
                  className={`relative mt-6 text-sm leading-6 text-current ${isServices ? 'opacity-70' : 'opacity-60'}`}
                  data-storefront-anim-item="true"
                >
                  {item.description}
                </EditableText>
                {!isServices ? (
                  <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-accent transition duration-500 group-hover:scale-x-100" />
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LawyerInvestorServices({ profile, block }) {
  return (
    <InvestorCardSection
      profile={profile}
      block={block}
      type="services"
      index="02"
      eyebrow="Investor legal services"
      heading="Support across the transaction lifecycle"
      body="Choose the workstream that matches the deal, ownership structure, financing, and closing timeline."
      fallback={[]}
    />
  );
}

export function LawyerInvestorRoleDetails({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const presentation = sectionPresentation(block, 'transparent', '#20252b');
  const { items, hasPersisted } = normalizedItems(content, [], 'highlights', 6);
  const ctaLabel = lawyerContentValue(content, 'cta_label', 'Discuss the transaction');
  return (
    <div
      id={investorAnchorId(block, 'buyer-protection')}
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}
    >
      <div className="relative mx-auto max-w-7xl">
        <InvestorSectionHeading
          content={content}
          eyebrow="Transaction safeguards"
          heading="Protect the structure, timing, and exit"
          body="Surface ownership, financing, title, and closing requirements before they become expensive delays."
          index="03"
        />
        <div data-investor-layout-grid="cards" className={`mt-10 grid gap-4 ${lawyerClassicGridClass(presentation.columns, items.length, true)}`}>
          {items.map((item, itemIndex) => {
            const Icon = resolveLawyerClassicIcon(item, itemIndex, ['building', 'contract', 'shield']);
            return (
              <article
                key={item.id}
                data-storefront-collection="highlights"
                data-storefront-item-id={item.id}
                data-storefront-item-index={itemIndex}
                data-storefront-item-field="title"
                data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                data-storefront-anim-item="true"
                className={`group relative min-h-48 overflow-hidden border bg-white p-6 text-[#20252b] transition duration-500 hover:-translate-y-1.5 hover:border-accent/45 hover:shadow-[0_22px_60px_rgba(0,127,149,.15)] ${investorCardStyleClass(presentation.cardStyle)}`}
                style={{
                  clipPath: PANEL_CLIP,
                  backgroundColor: item.background || content.panel_background || '#ffffff',
                  color: item.text_color || content.panel_text_color || '#20252b',
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,167,196,.08),transparent_42%)] opacity-45 transition duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute right-0 top-0 h-14 w-14 border-r border-t border-accent/20 transition duration-500 group-hover:h-20 group-hover:w-20 group-hover:border-accent/55" />
                <div className="relative flex items-center gap-3">
                  <span
                    data-storefront-anim-item="true"
                    data-investor-color-override={(item.icon_background || item.icon_color) ? 'true' : undefined}
                    className="grid h-11 w-11 shrink-0 place-items-center border border-accent/30 bg-accent/10 text-accent transition duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-[#071b20]"
                    style={{ '--investor-override-bg': item.icon_background || undefined, '--investor-override-color': item.icon_color || undefined }}
                  >
                    <Icon size={19} className="transition duration-500 group-hover:text-[#071b20]" />
                  </span>
                  <EditableText as="h3" field="content.highlights" label={`Safeguard ${itemIndex + 1} title`} source={hasPersisted ? 'persisted' : 'fallback'} collection="highlights" itemId={item.id} itemIndex={itemIndex} itemField="title" className="text-sm font-semibold uppercase leading-snug tracking-[0.02em] text-current [text-wrap:balance]">
                    {item.title}
                  </EditableText>
                </div>
                <EditableText as="p" field="content.highlights" label={`Safeguard ${itemIndex + 1} description`} source={hasPersisted ? 'persisted' : 'fallback'} collection="highlights" itemId={item.id} itemIndex={itemIndex} itemField="text" className="relative mt-6 text-sm leading-6 text-current opacity-65">
                  {item.description}
                </EditableText>
              </article>
            );
          })}
        </div>
        <button
          type="button"
          onClick={actions.onDirectLeadClick}
          data-storefront-field="content.cta_label"
          data-storefront-source={lawyerContentSource(content, 'cta_label')}
          data-storefront-anim-item="true"
          className={`${ctaLabel ? 'inline-flex' : 'hidden'} mt-10 min-h-12 items-center gap-3 border border-accent/70 bg-accent/[0.06] px-6 text-xs font-bold uppercase tracking-[0.16em] text-accent transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_14px_35px_rgba(0,167,196,.2)]`}
          style={{ backgroundColor: content.cta_background || undefined, color: content.cta_text_color || undefined }}
        >
          <Radar size={17} />
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

export function LawyerInvestorPracticeAreas({ profile, block }) {
  return (
    <InvestorCardSection
      profile={profile}
      block={block}
      type="practice"
      index="04"
      eyebrow="Investor workstreams"
      heading="Focused real estate legal support"
      body="A practical scope for active investors, ownership groups, and repeat transaction files."
      fallback={(profile?.practice_areas || []).map((title) => ({ title, description: '' }))}
    />
  );
}

export function LawyerInvestorGuidance({ block }) {
  const content = blockContent(block);
  const presentation = sectionPresentation(block, 'transparent', '#20252b');
  const { items, hasPersisted } = normalizedItems(content, [], 'steps', 6);
  return (
    <div
      id={investorAnchorId(block, 'guidance')}
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}
    >
      <div className="mx-auto max-w-7xl">
        <InvestorSectionHeading
          content={content}
          eyebrow="Organized investor intake"
          heading="Move each file through a clear legal process"
          body="Prepare the transaction facts early so legal review can focus on risks, requirements, and the next decision."
          index="05"
        />
        <div data-investor-layout-grid="cards" className={`mt-12 grid gap-4 ${lawyerClassicGridClass(presentation.columns, items.length, true)}`}>
          {items.map((item, itemIndex) => {
            const StepIcon = resolveLawyerClassicIcon(
              item,
              itemIndex,
              ['message', 'briefcase', 'shield', 'file'],
            );
            return (
              <article
              key={item.id}
              data-storefront-collection="steps"
              data-storefront-item-id={item.id}
              data-storefront-item-index={itemIndex}
              data-storefront-item-field="title"
              data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
              data-storefront-anim-item="true"
              className={`group relative min-h-48 overflow-hidden border bg-white/75 p-6 transition duration-500 hover:-translate-y-1.5 hover:border-accent/45 hover:bg-white hover:shadow-[0_20px_55px_rgba(0,127,149,.13)] ${investorCardStyleClass(presentation.cardStyle)}`}
              style={{
                clipPath: PANEL_CLIP,
                backgroundColor: item.background || content.process_card_background || undefined,
                color: item.text_color || content.process_card_text_color || undefined,
              }}
            >
              <div className="pointer-events-none absolute right-0 top-0 h-14 w-14 border-r border-t border-accent/15 transition duration-500 group-hover:h-20 group-hover:w-20 group-hover:border-accent/45" />
              <div className="relative flex items-center gap-4">
                <span
                  data-storefront-anim-item="true"
                  data-investor-color-override={(item.icon_background || item.icon_color) ? 'true' : undefined}
                  className="grid h-11 w-11 shrink-0 place-items-center bg-accent text-white shadow-[0_8px_22px_rgba(0,167,196,.18)] transition duration-500 group-hover:scale-105 group-hover:brightness-110"
                  style={{ '--investor-override-bg': item.icon_background || undefined, '--investor-override-color': item.icon_color || undefined }}
                >
                  <StepIcon size={18} strokeWidth={1.8} />
                </span>
                <EditableText as="h3" field="content.steps" label={`Step ${itemIndex + 1} title`} source={hasPersisted ? 'persisted' : 'fallback'} collection="steps" itemId={item.id} itemIndex={itemIndex} itemField="title" className="text-base font-semibold uppercase leading-tight [text-wrap:balance]">
                  {item.title}
                </EditableText>
              </div>
              <EditableText as="p" field="content.steps" label={`Step ${itemIndex + 1} description`} source={hasPersisted ? 'persisted' : 'fallback'} collection="steps" itemId={item.id} itemIndex={itemIndex} itemField="text" className="relative mt-6 text-sm leading-6 text-current opacity-65">
                {item.description}
              </EditableText>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LawyerInvestorCredentials({ profile, block }) {
  const content = blockContent(block);
  const presentation = sectionPresentation(block, 'transparent', '#20252b', '4');
  const standingItems = resolveLawyerStandingItems(profile);
  const icons = {
    pipeline: CircleDollarSign,
    experience: CalendarDays,
    clients: Users,
    cases: FileCheck2,
  };
  const metricProfileFields = {
    pipeline: 'profile.professional_credential_metrics.active_pipeline_value',
    experience: 'profile.professional_profile.experience',
    clients: 'profile.professional_credential_metrics.total_clients',
    cases: 'profile.professional_credential_metrics.closed_cases',
  };
  const isVerified = profile?.credentials_verified === true
    || profile?.professional_profile?.credentials_verified === true;
  const hiddenMetrics = new Set(Array.isArray(content.hidden_metrics) ? content.hidden_metrics : []);
  const metricOrder = Array.isArray(content.metric_order) ? content.metric_order : [];
  const orderByKind = new Map(metricOrder.map((kind, index) => [kind, index]));
  const items = standingItems
    .filter((item) => !hiddenMetrics.has(item.kind))
    .sort((a, b) => (
      (orderByKind.get(a.kind) ?? 99) - (orderByKind.get(b.kind) ?? 99)
    ))
    .map((item) => ({
      ...item,
      title: content.metric_labels?.[item.kind] || item.title,
    }));
  const cardBackground = content.card_background || '#20252b';
  const cardTextColor = investorReadableColor(
    cardBackground,
    content.card_text_color || '#ffffff',
  );
  return (
    <div
      id={investorAnchorId(block, 'professional-standing')}
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <InvestorSectionHeading
            content={content}
            eyebrow="Professional standing"
            heading="Investor practice at a glance"
            body="Current practice activity and experience for repeat transaction clients."
            index="06"
          />
          {isVerified ? (
            <EditableText field="content.verification_label" label="Verification label" source={lawyerContentSource(content, 'verification_label')} className="inline-flex w-fit items-center gap-2 border border-accent/50 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
              <ShieldCheck size={16} />
              {lawyerContentValue(content, 'verification_label', 'Verified legal profile')}
            </EditableText>
          ) : null}
        </div>
        <div data-investor-layout-grid="cards" className={`mt-12 grid gap-4 ${investorKpiGridClass(presentation.columns)}`}>
          {items.map((item, itemIndex) => {
            const Icon = content.metric_icons?.[item.kind]
              ? resolveLawyerClassicIcon({ icon: content.metric_icons[item.kind] }, itemIndex)
              : (icons[item.kind] || BriefcaseBusiness);
            return (
              <article
                key={item.id}
                data-storefront-metric={item.kind}
                data-storefront-anim-item="true"
                className={`group relative min-h-44 overflow-hidden border p-6 transition hover:-translate-y-1 hover:border-accent/45 hover:brightness-110 ${investorCardStyleClass(presentation.cardStyle, true)}`}
                style={{
                  clipPath: PANEL_CLIP,
                  backgroundColor: cardBackground,
                  color: cardTextColor,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center border border-accent/30 bg-accent/10 text-accent">
                    <Icon size={18} />
                  </span>
                  <EditableText as="h3" field={`content.metric_labels.${item.kind}`} label={`${item.title} label`} source={content.metric_labels?.[item.kind] ? 'persisted' : 'fallback'} className="text-[11px] font-bold uppercase leading-tight tracking-[0.16em] text-current opacity-60">
                    {item.title}
                  </EditableText>
                </div>
                <p
                  className="mt-7 text-2xl font-semibold tracking-[-0.03em] text-current"
                  data-storefront-field={metricProfileFields[item.kind]}
                  data-storefront-source="profile"
                  data-storefront-label={`${item.title} value`}
                >
                  {item.value}
                </p>
                <div className="absolute bottom-0 left-0 h-0.5 w-16 bg-accent" />
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LawyerInvestorCta({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const presentation = sectionPresentation(block, '#007f95', '#ffffff');
  const primary = lawyerContentValue(content, 'cta_label', 'Start investor intake');
  const secondary = lawyerContentValue(content, 'secondary_cta_label', 'Book a strategy call');
  const primaryButtonBackground = content.primary_button_background || '#12171c';
  const primaryButtonColor = investorReadableColor(
    primaryButtonBackground,
    content.primary_button_text_color || '#ffffff',
  );
  const secondaryButtonBackground = content.secondary_button_background || 'transparent';
  const secondaryButtonColor = investorReadableColor(
    secondaryButtonBackground,
    content.secondary_button_text_color || '#ffffff',
  );
  const calendlyUrl = investorCalendlyUrl(profile);
  const openCalendar = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      actions.onAppointmentClick?.();
      return;
    }
    actions.onCtaClick?.('book_consultation');
  };
  return (
    <div id={investorAnchorId(block, 'contact')} className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(presentation.padding)}`} style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}>
      <div className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[48px] border-black/[0.06]" />
      <div data-investor-layout-grid="cta" className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <EditableText field="content.eyebrow" label="CTA eyebrow" source={lawyerContentSource(content, 'eyebrow')} className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">
            {lawyerContentValue(content, 'eyebrow', 'Next transaction')}
          </EditableText>
          <EditableText as="h2" field="content.heading" label="CTA heading" source={lawyerContentSource(content, 'heading')} className="mt-5 max-w-4xl text-3xl font-semibold uppercase leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-5xl">
            {lawyerContentValue(content, 'heading', 'Bring the next deal into focus')}
          </EditableText>
          <EditableText as="p" field="content.body" label="CTA supporting copy" source={lawyerContentSource(content, 'body')} className="mt-6 max-w-2xl text-base font-medium leading-7 opacity-80">
            {lawyerContentValue(content, 'body', 'Share the property, agreement, entity, financing, and target closing date for a structured response.')}
          </EditableText>
          <EditableText as="p" field="content.helper_text" label="CTA helper text" source={lawyerContentSource(content, 'helper_text')} className="mt-4 max-w-2xl text-xs leading-5 opacity-65">
            {lawyerContentValue(content, 'helper_text', '')}
          </EditableText>
        </div>
        <div className={`flex gap-3 ${(block?.data?.layout || block?.layout || {}).buttonLayout === 'inline' ? 'flex-row flex-wrap' : 'flex-col'}`}>
          <button type="button" onClick={actions.onDirectLeadClick} data-storefront-field="content.cta_label" data-storefront-source={lawyerContentSource(content, 'cta_label')} data-storefront-anim-item="true" className={`${primary ? 'inline-flex' : 'hidden'} storefront-btn min-h-14 items-center justify-between gap-8 px-7 text-xs font-bold uppercase tracking-[0.16em] transition hover:-translate-y-0.5 hover:brightness-110`} style={{ clipPath: PANEL_CLIP, backgroundColor: primaryButtonBackground, color: primaryButtonColor }}>
            {primary}
            <ArrowUpRight size={18} className="text-accent" />
          </button>
          <button type="button" onClick={openCalendar} data-storefront-field="content.secondary_cta_label" data-storefront-source={lawyerContentSource(content, 'secondary_cta_label')} data-storefront-anim-item="true" className={`${secondary ? 'inline-flex' : 'hidden'} storefront-btn min-h-14 items-center justify-between gap-8 border border-white/55 px-7 text-xs font-bold uppercase tracking-[0.16em] transition hover:-translate-y-0.5 hover:brightness-110`} style={{ backgroundColor: secondaryButtonBackground, color: secondaryButtonColor }}>
            {secondary}
            <CalendarDays size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LawyerInvestorFooter({ profile, actions = {}, block, absoluteHashes = false }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const requestedPresentation = sectionPresentation(block, '#12171c', '#ffffff');
  const hasTextOverride = Boolean((block?.data?.style || block?.style || {}).textColor);
  const presentation = isLightHexColor(requestedPresentation.background) && !hasTextOverride
    ? { ...requestedPresentation, color: '#20252b' }
    : requestedPresentation;
  const { items, hasPersisted } = normalizedItems(content, [], 'items', 8);
  const email = profile?.email
    || profile?.user?.email
    || profile?.user_id?.email
    || profile?.professional_profile?.email
    || profile?.storefront_essentials?.email
    || '';
  const phone = profile?.phone || profile?.professional_profile?.phone || '';
  const calendlyUrl = investorCalendlyUrl(profile);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const photo = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  const footerName = lawyerContentValue(content, 'heading', identity.name || identity.company);
  const initials = String(footerName || identity.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <footer
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicResolvedPaddingClass(presentation.padding, 'py-16')}`}
      style={{ backgroundColor: presentation.background, color: presentation.color, textAlign: presentation.alignment }}
    >
      <div className="mx-auto max-w-7xl">
        <div data-investor-layout-grid="footer" className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_.65fr_.9fr] lg:gap-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-4">
              <div
                className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-white/20 bg-white/5 text-lg font-semibold text-accent"
                data-storefront-field="brandKit.profile_photo_url"
                data-storefront-source="profile"
                data-storefront-label="Footer profile image"
              >
                {photo ? (
                  <ResilientStorefrontImage
                    profile={profile}
                    candidates={[{ src: photo, kind: 'profile' }]}
                    alt={footerName}
                    sizes="64px"
                    className="object-cover"
                    fallback={<span>{initials}</span>}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div>
                <EditableText as="h2" field="content.heading" label="Footer heading" source={lawyerContentSource(content, 'heading')} className="text-xl font-semibold tracking-[-0.025em] text-current">
                  {footerName}
                </EditableText>
                <EditableText field="content.role_label" label="Footer role label" source={lawyerContentSource(content, 'role_label')} className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  {lawyerContentValue(content, 'role_label', identity.role || 'Investor transaction counsel')}
                </EditableText>
                {identity.company && identity.company !== footerName ? (
                  <p className="mt-1.5 text-xs text-current opacity-50">{identity.company}</p>
                ) : null}
              </div>
            </div>
            <EditableText as="p" field="content.body" label="Footer description" source={lawyerContentSource(content, 'body')} className="mt-6 max-w-lg text-sm leading-7 text-current opacity-65">
              {lawyerContentValue(content, 'body', 'Disciplined legal support for acquisitions, refinancing, ownership changes, title work, and repeat closings.')}
            </EditableText>
          </div>

          <nav>
            <EditableText field="content.resource_heading" label="Footer navigation heading" source={lawyerContentSource(content, 'resource_heading')} className="text-xs font-bold uppercase tracking-[0.16em] text-current">
              {lawyerContentValue(content, 'resource_heading', 'Explore')}
            </EditableText>
            <div className="mt-4 h-px w-10 bg-accent/70" />
            {items.length ? (
              <ul className="mt-5 space-y-3">
                {items.map((item, itemIndex) => (
                  <li key={item.id}>
                    <a
                      {...investorFooterLinkProps(item, absoluteHashes, profile?.slug)}
                      data-storefront-field="content.items"
                      data-storefront-collection="items"
                      data-storefront-item-id={item.id}
                      data-storefront-item-index={itemIndex}
                      data-storefront-item-field="label"
                      data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                      data-storefront-anim-item="true"
                      className="inline-flex items-center gap-2 text-sm text-current opacity-65 transition hover:text-accent hover:opacity-100"
                    >
                      {item.label || item.title}
                      <ArrowUpRight size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </nav>

          <div>
            <EditableText field="content.contact_heading" label="Footer contact heading" source={lawyerContentSource(content, 'contact_heading')} className="text-xs font-bold uppercase tracking-[0.16em] text-current">
              {lawyerContentValue(content, 'contact_heading', 'Contact details')}
            </EditableText>
            <div className="mt-4 h-px w-10 bg-accent/70" />
            <div className="mt-5 space-y-4 text-sm text-current opacity-65">
              {content.show_email !== false && email ? <a href={`mailto:${email}`} className="flex items-center gap-3 break-all transition hover:text-accent"><Mail size={16} className="shrink-0 text-accent" />{email}</a> : null}
              {content.show_phone !== false && phone ? <a href={`tel:${phone}`} className="flex items-center gap-3 transition hover:text-accent"><Phone size={16} className="shrink-0 text-accent" />{phone}</a> : null}
              {content.show_booking !== false && calendlyUrl ? (
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => actions.onAppointmentClick?.()}
                  data-storefront-anim-item="true"
                  className="storefront-btn mt-6 inline-flex min-h-11 items-center gap-3 border border-accent/60 px-4 text-xs font-bold uppercase tracking-[0.14em] text-current transition hover:bg-accent hover:text-[#10252b]"
                >
                  <CalendarDays size={16} />
                  Book an appointment
                </a>
              ) : null}
              {(content.show_email === false || !email)
                && (content.show_phone === false || !phone)
                && (content.show_booking === false || !calendlyUrl)
                && isPreview
                ? <p className="text-current opacity-45">Add contact details to your public profile.</p>
                : null}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-current/10 pt-6 text-[10px] leading-5 text-current opacity-40 sm:flex-row sm:items-center">
          <EditableText field="content.disclaimer" label="Footer disclaimer" source={lawyerContentSource(content, 'disclaimer')}>
            {lawyerContentValue(content, 'disclaimer', 'Do not send confidential information until the lawyer confirms representation.')}
          </EditableText>
          <span className="shrink-0 uppercase tracking-[0.12em]">© {new Date().getFullYear()} {identity.name || footerName}</span>
        </div>
      </div>
    </footer>
  );
}
