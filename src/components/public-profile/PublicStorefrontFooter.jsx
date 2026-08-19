'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Globe, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';
import { isInvestorSpecialistTemplate } from '@/components/storefront/storefrontPresets';

function hexLuminance(hex) {
  const value = String(hex || '').trim();
  if (!/^#[0-9a-f]{6}$/i.test(value)) return null;
  const channels = [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)]
    .map((part) => parseInt(part, 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function resolveProfilePlacement(profile) {
  const position = profile?.storefront_profile_position || {};
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const x = clamp(position.x ?? profile?.profile_position_x ?? profile?.storefront_essentials?.profile_position_x, 0, 100, 50);
  const y = clamp(position.y ?? profile?.profile_position_y ?? profile?.storefront_essentials?.profile_position_y, 0, 100, 25);
  const zoom = clamp(profile?.storefront_profile_zoom ?? profile?.profile_zoom ?? profile?.storefront_essentials?.profile_zoom, 1, 3, 1);
  return {
    x,
    y,
    zoom,
    style: {
      objectPosition: `${x}% ${y}%`,
      transform: `scale(${zoom})`,
      transformOrigin: `${x}% ${y}%`,
    },
  };
}

export default function PublicStorefrontFooter({
  profile,
  content = {},
  sectionStyle = {},
  onAppointmentClick,
  onCtaClick,
  onDirectLeadClick,
}) {
  const profilePhotoCandidates = [
    profile?.profile_photo_url,
    profile?.storefront_profile_fallback_url,
    profile?.storefront_essentials?.profile_photo_url,
    profile?.storefront_essentials?.profile,
  ].filter((value, index, items) => value && items.indexOf(value) === index);
  const profilePhotoSignature = profilePhotoCandidates.join('|');
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0);
  useEffect(() => {
    setProfilePhotoIndex(0);
  }, [profilePhotoSignature]);
  const footerProfilePhoto = profilePhotoCandidates[profilePhotoIndex] || '';
  const profilePlacement = resolveProfilePlacement(profile);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const isLuxury = profile?.storefront_template_key === 'agent-luxury-advisor';
  const isFirstHome = profile?.storefront_template_key === 'agent-first-home';
  const isSellerExpert = profile?.storefront_template_key === 'agent-seller-expert';
  const isCommunity = profile?.storefront_template_key === 'agent-community-expert';
  const isInvestor = isInvestorSpecialistTemplate(profile?.storefront_template_key);
  const socialLinks = profile.social_links || {};
  const hasSocial = Object.values(socialLinks).some(Boolean);
  const roleLabel =
    profile.professional_type === 'mortgage_broker'
      ? 'Mortgage Broker'
      : profile.professional_type === 'lawyer'
        ? 'Real Estate Lawyer'
        : 'Real Estate Agent';
  const email = profile.email;
  const phone = profile.professional_profile?.phone;
  const description = content.body || profile.tagline || profile.about || 'Professional real estate services backed by guided AI support.';
  const descriptionPrefix = String(description || '').trim();
  const companyLabel = String(
    profile.professional_profile?.company_name
    || profile.storefront_brand_kit?.business_name
    || profile.brand_kit?.business_name
    || ''
  ).trim();
  const personName = String(
    profile.professional_profile?.full_name
    || profile.professional_name
    || ''
  ).trim();
  const personNameIsCompany = Boolean(
    personName
    && companyLabel
    && personName.toLowerCase() === companyLabel.toLowerCase()
  );
  const resolvedPersonName = personNameIsCompany ? '' : personName;
  const rawHeading = String(content.heading || '').trim();
  const headingIsCompany = Boolean(
    rawHeading
    && companyLabel
    && rawHeading.toLowerCase() === companyLabel.toLowerCase()
  );
  const footerHeading = resolvedPersonName || (!headingIsCompany ? rawHeading : '') || personName;
  const showCompanyLine = Boolean(
    companyLabel
    && companyLabel.toLowerCase() !== footerHeading.toLowerCase()
  );
  const customLinks = Array.isArray(content.items) ? content.items.filter((item) => item?.label) : [];
  // Same Calendly source as PublicHero / PublicCTA.
  const calendlySource = profile?.professional_profile?.calendly_link
    || profile?.professional?.calendly_link
    || profile?.calendly_link
    || profile?.storefront_essentials?.calendly_link
    || profile?.storefront_essentials?.professional_profile?.calendly_link
    || profile?.storefront_essentials?.professional?.calendly_link
    || '';
  const calendlyUrl = buildTrackedCalendlyUrl(calendlySource, profile);
  const handleConnect = (event) => {
    if (calendlyUrl) {
      event?.preventDefault?.();
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      onAppointmentClick?.();
      return;
    }
    if (onCtaClick) {
      event?.preventDefault?.();
      onCtaClick('book_consultation');
    }
  };
  const defaultLinks = [
    { label: 'About', url: '#about' },
    { label: 'Services', url: '#services' },
    ...(profile.professional_type === 'agent' ? [{ label: 'Properties', url: `/professional/${profile.slug}/properties` }] : []),
    ...(profile.professional_type === 'mortgage_broker' ? [{ label: 'Programs', url: '#programs' }] : []),
    ...(isInvestor ? [] : [{ label: 'Reviews', url: '#reviews' }]),
    ...(isInvestor
      ? []
      : [{
          label: calendlyUrl ? 'Book an appointment' : 'Contact',
          url: calendlyUrl || (profile.slug ? `/professional/${profile.slug}/contact` : '#contact'),
          action: calendlyUrl ? 'connect' : undefined,
        }]),
  ];
  const links = (customLinks.length ? customLinks : defaultLinks).filter((link) => {
    if (!isInvestor) return true;
    const label = String(link.label || '').toLowerCase();
    const url = String(link.url || '').toLowerCase();
    if (label === 'reviews' || label === 'contact') return false;
    if (url.includes('#reviews') || url.includes('/contact')) return false;
    return true;
  });
  const backgroundHex = String(sectionStyle.background || '').trim();
  const hasSectionTextOverride = Boolean(String(sectionStyle.textColor || '').trim());
  const onDark = isLuxury || (() => {
    const lum = hexLuminance(backgroundHex);
    return lum != null ? lum < 0.34 : false;
  })();
  const communityOnDark = isCommunity
    ? (backgroundHex ? (hexLuminance(backgroundHex) ?? 0) < 0.34 : true)
    : false;
  const footerOnDark = isFirstHome || communityOnDark || onDark;
  const headingClass = hasSectionTextOverride ? 'text-current' : footerOnDark ? 'text-white' : 'text-text-heading';
  const bodyClass = hasSectionTextOverride ? 'text-current opacity-85' : isFirstHome ? 'text-white/86' : footerOnDark ? 'text-white/82' : 'text-text-muted';
  const subtleClass = hasSectionTextOverride ? 'text-current opacity-70' : isFirstHome ? 'text-white/74' : footerOnDark ? 'text-white/70' : 'text-text-muted';
  const dividerClass = footerOnDark ? 'border-white/15' : 'border-slate-200';
  const socialClass = footerOnDark
    ? 'border-white/20 bg-white/10 text-white/75 hover:text-white'
    : 'border-slate-200 bg-white text-text-muted hover:text-primary';
  const roleLabelClass = isLuxury || isFirstHome || isCommunity
    ? 'text-accent'
    : hasSectionTextOverride
      ? 'text-current'
      : 'text-primary';
  const poweredClass = isLuxury
    ? 'text-white/70 hover:text-white border border-white/15 px-2.5 py-1.5'
    : isCommunity
      ? 'text-accent hover:text-white bg-white/5 border border-white/15 px-2.5 py-1.5 rounded-full'
    : footerOnDark
      ? 'text-emerald-300 hover:text-emerald-200 bg-white/5 border border-white/15 px-2.5 py-1.5 rounded-full'
      : 'text-primary';
  const poweredLogoClass = footerOnDark
    ? 'h-7 w-7 rounded-lg object-cover ring-1 ring-white/20'
    : 'h-7 w-7 rounded-lg object-cover';

  return (
    <footer
      id="contact"
      className={`border-t bg-transparent ${isLuxury ? 'border-white/10' : 'border-primary/10'}`}
      style={isCommunity ? {
        background: sectionStyle.background
          || 'color-mix(in srgb, var(--storefront-primary, #17152b) 82%, #061022)',
        color: sectionStyle.textColor || '#f4f1ff',
      } : undefined}
    >
      <div className={`w-full px-5 py-8 ${forceCompactPreview ? '' : 'sm:px-8 sm:py-10 lg:px-12 xl:px-16'} ${isLuxury ? 'sm:py-12' : ''}`}>
        <div className={`grid items-center gap-8 ${forceMobilePreview ? 'grid-cols-1' : forceTabletPreview ? 'sm:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-[1.1fr_0.65fr_0.85fr]'}`}>
          <div
            className={`${forceMobilePreview ? '' : 'md:col-span-2 lg:col-span-1'} flex h-full flex-col justify-center`}
            data-storefront-anim-item="true"
            style={isLuxury ? { '--storefront-child-stagger': '0ms' } : undefined}
          >
            <div className="flex items-center gap-4">
              {footerProfilePhoto ? (
                <div className={`relative h-14 w-14 shrink-0 overflow-hidden ${isLuxury ? 'rounded-none ring-1 ring-white/20' : 'rounded-xl ring-1 ring-slate-200'}`}>
                  <Image
                    key={`${footerProfilePhoto}-${profilePlacement.x}-${profilePlacement.y}-${profilePlacement.zoom}`}
                    src={footerProfilePhoto}
                    alt={profile.professional_name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    style={profilePlacement.style}
                    onError={() => setProfilePhotoIndex((current) => current + 1)}
                  />
                </div>
              ) : (
                <div className={`grid h-14 w-14 place-items-center text-base font-bold ${isLuxury ? 'rounded-none border border-white/20 bg-white/5 text-accent' : 'rounded-xl bg-primary/10 text-primary'}`}>
                  {String(profile.professional_name || 'P').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                </div>
              )}
              <div>
                <div
                  data-storefront-field="content.heading"
                  data-storefront-source={content.heading ? 'persisted' : 'fallback'}
                  data-storefront-label="Footer heading"
                  className={`text-base font-bold ${isLuxury ? 'font-serif text-lg font-medium tracking-wide' : ''} ${headingClass}`}
                >
                  {footerHeading}
                </div>
                <div
                  className={`mt-1 text-[11px] font-bold uppercase tracking-[0.18em] ${roleLabelClass}`}
                  style={hasSectionTextOverride && !isLuxury ? { opacity: 0.92 } : undefined}
                >
                  {roleLabel}
                </div>
                {showCompanyLine ? (
                  <div className={`mt-1 text-xs ${isLuxury ? 'font-serif' : ''} ${subtleClass}`}>{companyLabel}</div>
                ) : null}
              </div>
            </div>
            {descriptionPrefix ? (
              <p
                data-storefront-field="content.body"
                data-storefront-source={content.body ? 'persisted' : 'fallback'}
                data-storefront-label="Footer description"
                className={`mt-4 max-w-xl text-sm leading-6 ${isLuxury ? 'font-serif text-[13px] leading-7 opacity-75' : ''} ${bodyClass}`}
              >
                {descriptionPrefix}
              </p>
            ) : null}
          </div>

          <div
            data-storefront-anim-item="true"
            style={isLuxury ? { '--storefront-child-stagger': '80ms' } : undefined}
          >
            <h3 className={`text-sm font-bold ${isLuxury ? 'font-serif text-base font-medium' : ''} ${headingClass}`}>Explore</h3>
            {isLuxury ? <div className="mt-3 h-px w-10 bg-accent/60" aria-hidden="true" /> : null}
            <ul className={`mt-4 space-y-2 text-sm ${isLuxury ? 'space-y-3' : ''}`}>
              {links.map((link) => {
                const isConnect = link.action === 'connect' || /book an appointment|how to connect/i.test(String(link.label || ''));
                if (isConnect && (calendlyUrl || onCtaClick)) {
                  return (
                    <li
                      key={`${link.label}-${link.target || link.url}`}
                      data-storefront-field="content.items"
                      data-storefront-source={customLinks.length ? 'persisted' : 'fallback'}
                      data-storefront-collection="items"
                      data-storefront-item-id={link.id || `footer-link-${link.label}`}
                      data-storefront-item-index={links.indexOf(link)}
                      data-storefront-item-field="label"
                      data-storefront-label={`Footer link ${links.indexOf(link) + 1}`}
                    >
                      <button
                        type="button"
                        onClick={handleConnect}
                        className={`${bodyClass} text-left transition ${isLuxury || isFirstHome || isCommunity || footerOnDark ? 'hover:text-accent' : 'hover:text-primary'}`}
                      >
                        {link.label}
                      </button>
                    </li>
                  );
                }
                return (
                  <li
                    key={`${link.label}-${link.target || link.url}`}
                    data-storefront-field="content.items"
                    data-storefront-source={customLinks.length ? 'persisted' : 'fallback'}
                    data-storefront-collection="items"
                    data-storefront-item-id={link.id || `footer-link-${link.label}`}
                    data-storefront-item-index={links.indexOf(link)}
                    data-storefront-item-field="label"
                    data-storefront-label={`Footer link ${links.indexOf(link) + 1}`}
                  >
                    <Link
                      href={link.target || link.url || '#'}
                      className={`${bodyClass} transition ${isLuxury || isFirstHome || isCommunity || footerOnDark ? 'hover:text-accent' : 'hover:text-primary'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            data-storefront-anim-item="true"
            style={isLuxury ? { '--storefront-child-stagger': '160ms' } : undefined}
          >
            <h3 className={`text-sm font-bold ${isLuxury ? 'font-serif text-base font-medium' : ''} ${headingClass}`}>
              {isLuxury ? 'Get in touch' : 'Contact details'}
            </h3>
            {isLuxury ? <div className="mt-3 h-px w-10 bg-accent/60" aria-hidden="true" /> : null}
            <div className={`mt-4 space-y-3 text-sm ${bodyClass}`}>
              {email ? (
                <a href={`mailto:${email}`} className={`flex items-start gap-2 transition ${isLuxury || isCommunity || footerOnDark ? 'hover:text-accent' : 'hover:text-primary'}`}>
                  <Mail size={15} className="mt-0.5 shrink-0" style={{ color: 'currentColor', opacity: 0.9 }} />
                  <span className="break-all">{email}</span>
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} className={`flex items-center gap-2 transition ${isLuxury || isCommunity || footerOnDark ? 'hover:text-accent' : 'hover:text-primary'}`}>
                  <Phone size={15} className="shrink-0" style={{ color: 'currentColor', opacity: 0.9 }} />
                  <span>{phone}</span>
                </a>
              ) : null}
              {!email && !phone ? (
                <div className="flex items-start gap-2">
                  <MessageCircle size={15} className="mt-0.5 shrink-0" style={{ color: 'currentColor', opacity: 0.9 }} />
                  <span>Use chat to start an inquiry.</span>
                </div>
              ) : null}
              <div className="flex items-start gap-2">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" style={{ color: 'currentColor', opacity: 0.9 }} />
                <span>Professional, contextual follow-up.</span>
              </div>
            </div>
            {((isLuxury && calendlyUrl) || isFirstHome || isSellerExpert || isCommunity) ? (
              <button
                type="button"
                onClick={handleConnect}
                className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                  isLuxury
                    ? 'border border-white/30 text-white hover:border-accent hover:text-accent'
                    : isSellerExpert
                      ? 'rounded-md bg-accent text-white shadow-[0_12px_28px_rgba(6,182,212,.18)] hover:-translate-y-0.5 hover:brightness-110'
                      : isCommunity
                        ? 'bg-accent text-accent-contrast shadow-[0_12px_28px_rgba(0,0,0,.22)] hover:-translate-y-0.5 hover:brightness-110'
                    : 'rounded-md bg-accent text-white shadow-[0_12px_28px_rgba(0,0,0,.22)] hover:-translate-y-0.5'
                }`}
                style={isCommunity ? { borderRadius: 'var(--storefront-radius, 0.75rem)' } : undefined}
              >
                <CalendarDays size={14} />
                Book an appointment
              </button>
            ) : isLuxury ? (
              <Link
                href={profile.slug ? `/professional/${profile.slug}/contact` : '#contact'}
                className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                  isLuxury
                    ? 'border border-white/30 text-white hover:border-accent hover:text-accent'
                    : 'rounded-md bg-accent text-white shadow-[0_12px_28px_rgba(0,0,0,.22)] hover:-translate-y-0.5'
                }`}
              >
                <MessageCircle size={14} />
                Submit inquiry
              </Link>
            ) : null}
            {hasSocial && socialLinks.website ? (
              <a
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 grid h-8 w-8 place-items-center border ${isLuxury ? 'rounded-none' : 'rounded-full'} ${socialClass}`}
                aria-label="Website"
              >
                <Globe size={15} />
              </a>
            ) : null}
          </div>
        </div>

        <div className={`mt-5 flex flex-col gap-2.5 border-t pt-4 text-xs ${subtleClass} sm:mt-8 sm:flex-row sm:items-center sm:justify-between ${dividerClass}`}>
          <p suppressHydrationWarning>© {new Date().getFullYear()} {footerHeading || 'Professional'}. All rights reserved.</p>
          <Link href="/" className={`inline-flex items-center gap-2 font-bold uppercase tracking-wider transition ${poweredClass}`}>
            <Image src="/logo/logo.png" alt="Nesti AI logo" width={28} height={28} className={poweredLogoClass} />
            <span>Powered by Nesti AI</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
