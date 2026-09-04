'use client';

import Image from 'next/image';
import { ArrowUpRight, CalendarDays, Mail, Phone, ShieldCheck } from 'lucide-react';
import { buildTrackedCalendlyUrl, resolvePublicCalendlySource } from '@/lib/publicProfileLinks';
import { isStorefrontHashTargetAvailable } from '@/components/storefront/storefrontContentVisibility';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../../lawyer/shared/ResilientStorefrontImage';
import {
  blockContent,
  lawyerContentSource,
  resolveProfessionalIdentity,
} from '../../lawyer/shared/lawyerSectionUtils';
import {
  BROKER_INK,
  brokerContentValue,
  brokerPhone,
  brokerResolvedPaddingClass,
  normalizedItems,
  sectionPresentation,
} from './brokerSectionUtils';
import { BROKER_CLASSIC_FOOTER_ITEMS } from './brokerClassicDefaults';

function safeFooterTarget(value) {
  const target = String(value || '').trim();
  if (!target || /[\u0000-\u001f\u007f\\]/.test(target)) return '';
  if (/^#[a-z][\w:.-]*$/i.test(target)) return target;
  if (/^\/(?!\/)/.test(target)) return target;
  return '';
}

function resolveFooterHref(target, { absoluteHashes = false, slug = '' } = {}) {
  const safeTarget = String(target || '').trim();
  if (!safeTarget) return '#';
  if (safeTarget === '/contact' && slug) {
    return absoluteHashes
      ? `/p/${encodeURIComponent(slug)}/contact`
      : `/professional/${encodeURIComponent(slug)}/contact`;
  }
  if (absoluteHashes && slug && safeTarget.startsWith('#')) {
    return `/p/${encodeURIComponent(slug)}${safeTarget}`;
  }
  return safeTarget;
}

export function BrokerClassicFooter({
  profile,
  actions = {},
  block,
  absoluteHashes = false,
}) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const presentation = sectionPresentation(block, BROKER_INK, '#ffffff');
  const { items: rawItems, hasPersisted } = normalizedItems(content, BROKER_CLASSIC_FOOTER_ITEMS, 'items', 8);
  const items = rawItems
    .map((item) => ({ ...item, safeTarget: safeFooterTarget(item.target || item.url) }))
    .filter((item) => {
      if (!item.safeTarget) return false;
      if (item.safeTarget === '/contact') return Boolean(profile?.slug);
      return isStorefrontHashTargetAvailable(profile, item.safeTarget);
    })
    .slice(0, 8);
  const bookingItem = rawItems.find((item) => (item.target || item.url) === '#contact');
  const bookingLabel = bookingItem?.label || bookingItem?.title || 'Book an appointment';
  const email = profile?.email || profile?.professional_profile?.email || '';
  const phone = brokerPhone(profile, content);
  const company = profile?.professional_profile?.company_name || identity.company || '';
  const persistedFooterName = brokerContentValue(content, 'heading', identity.name);
  const footerName = persistedFooterName === company ? identity.name : persistedFooterName;
  const roleLabel = brokerContentValue(content, 'role_label', 'Mortgage Advisor');
  const photo = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  const calendlyUrl = buildTrackedCalendlyUrl(resolvePublicCalendlySource(profile), profile);
  const openCalendar = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      actions.onAppointmentClick?.();
      return;
    }
    if (profile?.slug) {
      window.location.assign(
        absoluteHashes
          ? `/p/${encodeURIComponent(profile.slug)}/contact`
          : `/professional/${encodeURIComponent(profile.slug)}/contact`,
      );
      return;
    }
    actions.onCtaClick?.('book_consultation');
  };

  return (
    <footer className={`px-4 sm:px-8 lg:px-12 ${brokerResolvedPaddingClass(presentation.padding)}`} style={{ backgroundColor: presentation.background, color: presentation.color }}>
      <div className="grid w-full max-w-none gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_.7fr_1.05fr] lg:gap-16">
        <div className="max-w-xl" data-storefront-anim-item="true">
          <div className="flex items-center gap-4">
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden border border-white/20 bg-white/[0.05]"
              data-storefront-field="brandKit.profile_photo_url"
              data-storefront-source="profile"
              data-storefront-label="Footer advisor photo"
            >
              {photo ? (
                <ResilientStorefrontImage
                  profile={profile}
                  candidates={[{ src: photo, kind: 'profile' }]}
                  alt={footerName}
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-lg font-bold text-[color:var(--storefront-accent,#008fd5)]">
                  {String(footerName || 'MA').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <EditableText as="h2" field="content.heading" label="Footer heading" source={lawyerContentSource(content, 'heading')} className="text-lg font-bold text-white">
                {footerName}
              </EditableText>
              <EditableText as="p" field="content.role_label" label="Footer role label" source={lawyerContentSource(content, 'role_label')} className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--storefront-accent,#008fd5)]">
                {roleLabel}
              </EditableText>
              {company && company !== footerName ? <p className="mt-1 text-xs text-white/50">{company}</p> : null}
            </div>
          </div>
          <EditableText as="p" field="content.body" label="Footer description" source={lawyerContentSource(content, 'body')} className="mt-6 max-w-md text-sm leading-7 text-white/60">
            {brokerContentValue(content, 'body', 'Trusted mortgage guidance with transparent options, lender access, and responsive support.')}
          </EditableText>
        </div>
        <nav data-storefront-anim-item="true">
          <EditableText field="content.links_heading" label="Footer navigation heading" source={lawyerContentSource(content, 'links_heading')} className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            {brokerContentValue(content, 'links_heading', 'Explore')}
          </EditableText>
          <div className="mt-4 h-px w-10 bg-[color:var(--storefront-accent,#008fd5)]/70" />
          <ul className="mt-5 space-y-3">
            {items.map((item, index) => {
              const href = resolveFooterHref(item.safeTarget, {
                absoluteHashes,
                slug: profile?.slug,
              });
              return (
                <li key={item.id}>
                  <a
                    href={href}
                    data-storefront-field="content.items"
                    data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                    data-storefront-label={`Footer link ${index + 1}`}
                    data-storefront-collection="items"
                    data-storefront-item-id={item.id}
                    data-storefront-item-index={index}
                    data-storefront-item-field="label"
                    className="text-sm text-white/65 transition hover:text-[color:var(--storefront-accent,#008fd5)]"
                  >
                    {item.label || item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div data-storefront-anim-item="true">
          <EditableText field="content.contact_heading" label="Footer contact heading" source={lawyerContentSource(content, 'contact_heading')} className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            {brokerContentValue(content, 'contact_heading', 'Contact')}
          </EditableText>
          <div className="mt-4 h-px w-10 bg-[color:var(--storefront-accent,#008fd5)]/70" />
          <div className="mt-5 space-y-4 text-sm text-white/65">
            {email && content.show_email !== false ? <a href={`mailto:${email}`} className="flex items-start gap-3 transition hover:text-[color:var(--storefront-accent,#008fd5)]"><Mail size={16} className="mt-0.5 shrink-0 text-[color:var(--storefront-accent,#008fd5)]" /><span className="break-all">{email}</span></a> : null}
            {phone && content.show_phone !== false ? <a href={`tel:${phone}`} className="flex items-center gap-3 transition hover:text-[color:var(--storefront-accent,#008fd5)]"><Phone size={16} className="shrink-0 text-[color:var(--storefront-accent,#008fd5)]" />{phone}</a> : null}
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[color:var(--storefront-accent,#008fd5)]" />
              <EditableText as="p" field="content.disclaimer" label="Footer follow-up note" source={lawyerContentSource(content, 'disclaimer')}>
                {brokerContentValue(content, 'disclaimer', 'Professional, contextual follow-up.')}
              </EditableText>
            </div>
          </div>
          {content.show_booking !== false ? (
            <button
              type="button"
              onClick={openCalendar}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 bg-white/[0.04] px-5 text-xs font-semibold tracking-wide text-white transition hover:border-[color:var(--storefront-accent,#008fd5)] hover:text-[color:var(--storefront-accent,#008fd5)]"
            >
              <CalendarDays size={15} />
              {bookingLabel}
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-10 flex w-full max-w-none flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <p suppressHydrationWarning>© {new Date().getFullYear()} {footerName}. All rights reserved.</p>
        <a href="/" className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.12em] transition hover:text-[color:var(--storefront-accent,#008fd5)]">
          <Image src="/logo/logo.png" alt="Nesti AI logo" width={24} height={24} className="rounded-md" />
          <span>Powered by Nesti AI</span>
          <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}
