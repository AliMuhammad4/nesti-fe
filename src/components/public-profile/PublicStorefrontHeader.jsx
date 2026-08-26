'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Scale, X } from 'lucide-react';
import { isInvestorSpecialistTemplate } from '@/components/storefront/storefrontPresets';
import {
  hasPublicClientStories,
  isStorefrontHashTargetAvailable,
} from '@/components/storefront/storefrontContentVisibility';

function roleLabelFor(professionalType) {
  if (professionalType === 'mortgage_broker') return 'Mortgage Broker';
  if (professionalType === 'lawyer') return 'Real Estate Lawyer';
  return 'Real Estate Agent';
}

export function buildStorefrontNavLinks(profile, { absoluteHashes = false } = {}) {
  const professionalType = profile?.professional_type;
  const slug = profile?.slug || '';
  const hashBase = absoluteHashes && slug ? `/professional/${slug}` : '';
  const isInvestor = isInvestorSpecialistTemplate(profile?.storefront_template_key);
  const isLawyerClassic = String(profile?.storefront_template_key || '').toLowerCase() === 'lawyer-classic';
  const isLawyerFirstHome = String(profile?.storefront_template_key || '').toLowerCase() === 'lawyer-first-home-closing';
  const showReviews = Boolean(profile?.storefront_builder_preview)
    || hasPublicClientStories(profile);
  const availableLinks = (links) => links.filter(
    (link) => isStorefrontHashTargetAvailable(profile, link.href),
  );

  if (isLawyerClassic || isLawyerFirstHome) {
    return availableLinks([
      { href: `${hashBase}#about`, label: 'About' },
      { href: `${hashBase}#clients`, label: isLawyerFirstHome ? 'First-home support' : 'Who we help' },
      { href: `${hashBase}#services`, label: 'Practice areas' },
      { href: `${hashBase}#documents`, label: 'Documents' },
      { href: `${hashBase}#guidance`, label: isLawyerFirstHome ? 'Closing guide' : 'Guide' },
      ...(slug
        ? [{ href: `/professional/${slug}/contact`, label: 'Contact' }]
        : [{ href: `${hashBase}#contact`, label: 'Contact' }]),
    ]);
  }

  return availableLinks([
    { href: `${hashBase}#about`, label: 'About' },
    { href: `${hashBase}#services`, label: 'Services' },
    ...(professionalType === 'agent'
      ? [{ href: `/professional/${slug}/properties`, label: 'Properties' }]
      : professionalType === 'mortgage_broker'
        ? [{ href: `${hashBase}#programs`, label: 'Programs' }]
        : []),
    ...(isInvestor || !showReviews ? [] : [{ href: `${hashBase}#reviews`, label: 'Reviews' }]),
    { href: `${hashBase}#guidance`, label: 'Guide' },
    ...(isInvestor ? [] : [{ href: slug ? `/professional/${slug}/contact` : `${hashBase}#contact`, label: 'Contact' }]),
  ]);
}

export default function PublicStorefrontHeader({
  profile,
  absoluteHashes = false,
  forceCompactPreview = false,
  forceMobilePreview = false,
  sticky = false,
  variant,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const content = profile?.storefront_section_content || {};
  const showHeaderLinks = content.show_header_links !== false;
  const showHeaderProfile = Boolean(content.show_header_profile);
  const roleLabel = roleLabelFor(profile?.professional_type);
  const navLinks = buildStorefrontNavLinks(profile, { absoluteHashes });
  const brandHref = profile?.slug ? `/professional/${profile.slug}` : '/';
  const isLuxury = variant === 'luxury'
    || profile?.storefront_template_key === 'agent-luxury-advisor';
  const isFirstHomeEditorial = variant === 'firstHome'
    || profile?.storefront_template_key === 'agent-first-home';
  const isLawyerClassic = String(profile?.storefront_template_key || '').toLowerCase() === 'lawyer-classic';
  const isLawyerFirstHome = variant === 'lawyerFirstHome'
    || String(profile?.storefront_template_key || '').toLowerCase() === 'lawyer-first-home-closing';
  const isDarkEditorial = isLuxury || isLawyerFirstHome;
  const hasBrandLogo = Boolean(profile?.storefront_logo_url || profile?.storefront_logo_dark_url);
  const hasDedicatedDarkLogo = Boolean(profile?.storefront_logo_dark_url);
  const logoChipModeRaw = String(profile?.storefront_essentials?.logo_chip_mode || 'auto').toLowerCase();
  const logoChipMode = ['auto', 'strong', 'soft', 'off'].includes(logoChipModeRaw) ? logoChipModeRaw : 'auto';
  const needsLuxuryLogoBoost = isLuxury && hasBrandLogo && (logoChipMode === 'strong' || (logoChipMode === 'auto' && !hasDedicatedDarkLogo));
  const useSoftLuxuryLogoChip = isLuxury && hasBrandLogo && !needsLuxuryLogoBoost && logoChipMode !== 'off';
  const applyLuxuryLogoChip = needsLuxuryLogoBoost || useSoftLuxuryLogoChip;
  const useLawyerLogoTile = isLawyerFirstHome && hasBrandLogo && logoChipMode !== 'off';
  const luxuryLogoChipStyle = needsLuxuryLogoBoost
    ? {
        backgroundColor: 'color-mix(in srgb, var(--storefront-accent) 18%, #ffffff)',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--storefront-accent) 52%, #ffffff)',
      }
    : useSoftLuxuryLogoChip
      ? {
          backgroundColor: 'color-mix(in srgb, var(--storefront-accent) 10%, transparent)',
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #ffffff 24%, transparent)',
        }
      : undefined;
  const resolvedLogoUrl = isLawyerFirstHome
    ? (profile?.storefront_logo_url || profile?.storefront_logo_dark_url || '')
    : isLuxury || isFirstHomeEditorial
      ? (profile?.storefront_logo_dark_url || profile?.storefront_logo_url || '')
      : (profile?.storefront_logo_url || profile?.storefront_logo_dark_url || '');
  const navOpenClass = showHeaderLinks && mobileMenuOpen
    ? (isDarkEditorial ? 'shadow-[0_12px_30px_rgba(0,0,0,.35)]' : 'shadow-md')
    : '';
  const positionClass = sticky ? 'sticky top-0' : 'fixed inset-x-0 top-0';
  const profilePosition = profile?.storefront_profile_position || {};
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const profileX = clamp(profilePosition.x, 0, 100, 50);
  const profileY = clamp(profilePosition.y, 0, 100, 25);
  const profileZoom = clamp(profile?.storefront_profile_zoom, 1, 3, 1);
  const profilePhotoStyle = {
    objectPosition: `${profileX}% ${profileY}%`,
    transform: `scale(${profileZoom})`,
    transformOrigin: `${profileX}% ${profileY}%`,
  };
  const profileRenderKey = `${profile?.profile_photo_url}-${profileX}-${profileY}-${profileZoom}`;

  return (
    <header
      className={`${positionClass} z-[1000] backdrop-blur ${navOpenClass} ${
        isLawyerFirstHome
          ? 'border-b border-white/10 bg-primary/90 text-primary-contrast shadow-none'
          : isLuxury
            ? 'border-b border-white/15 bg-[rgba(13,12,11,0.78)] text-[#f5f1e8] shadow-none'
          : isLawyerClassic
            ? 'border-0 bg-white/95 shadow-none'
            : 'border-b border-border/70 bg-white/95 shadow-sm'
      }`}
    >
      <div className={`flex h-16 w-full items-center justify-between ${forceMobilePreview ? 'px-3' : 'px-5 sm:px-8 lg:px-12 xl:px-16'}`}>
        <Link
          href={brandHref}
          className={`flex min-w-0 items-center py-1 ${forceMobilePreview ? 'max-w-[calc(100%-3.25rem)] gap-2.5' : 'gap-3'} ${isDarkEditorial ? 'rounded-none' : 'rounded-lg'}`}
        >
          <span
            className={`flex shrink-0 items-center justify-center overflow-hidden ${
              hasBrandLogo
                ? (useLawyerLogoTile
                  ? `${forceMobilePreview ? 'h-9 w-20' : 'h-10 w-24'} border border-accent/35 bg-[#f8f5ee] px-2 py-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,.45)]`
                  : forceMobilePreview
                    ? `h-9 w-20 border-r pr-2 ${isDarkEditorial ? 'border-white/20' : 'border-slate-200'}`
                    : `h-10 w-24 border-r pr-3 ${isDarkEditorial ? 'border-white/20' : 'border-slate-200'}`)
                : (forceMobilePreview
                  ? `h-9 w-9 ${isDarkEditorial ? 'rounded-none' : 'rounded-lg'}`
                  : `h-10 w-10 ${isDarkEditorial ? 'rounded-none' : 'rounded-lg'}`)
            }`}
          >
            {hasBrandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedLogoUrl}
                alt={`${profile.professional_name || 'Professional'} logo`}
                className={`${forceMobilePreview ? 'max-h-8' : 'max-h-9'} w-auto max-w-full rounded-sm object-contain ${
                  applyLuxuryLogoChip
                    ? (needsLuxuryLogoBoost ? 'p-1.5' : 'p-1')
                    : ''
                }`}
                style={luxuryLogoChipStyle}
              />
            ) : isLawyerFirstHome ? (
              <span className="grid h-10 w-10 place-items-center border border-accent/60 text-accent">
                <Scale size={21} strokeWidth={1.5} aria-hidden="true" />
              </span>
            ) : (
              <Image
                src="/logo/logo.png"
                alt="Nesti AI logo"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
            )}
          </span>
          <span className="flex min-h-10 min-w-0 flex-col justify-center leading-tight">
            <span className={`truncate tracking-tight ${
              isDarkEditorial
                ? `font-serif font-medium tracking-[0.06em] text-[#f5f1e8] ${forceMobilePreview ? 'text-[16px]' : 'text-sm sm:text-[15px]'}`
                : `font-bold text-slate-900 ${forceMobilePreview ? 'text-[18px]' : 'text-sm sm:text-[15px]'}`
            }`}
            >
              {hasBrandLogo || isLawyerFirstHome
                ? (profile.professional_name || 'Nesti Legal')
                : 'Nesti AI'}
            </span>
            {!forceMobilePreview ? (
              <span className={`mt-1 truncate text-[10px] font-medium uppercase tracking-[0.12em] ${
                isDarkEditorial ? 'text-white/55' : 'text-slate-500'
              }`}
              >
                {hasBrandLogo || isLawyerFirstHome ? roleLabel : 'Real Estate Intelligence'}
              </span>
            ) : null}
          </span>
        </Link>

        {showHeaderLinks && !forceCompactPreview ? (
          <nav className={`hidden items-center gap-5 text-[13px] font-semibold lg:flex ${
            isDarkEditorial ? 'text-[#f5f1e8]/65' : 'text-text-heading'
          }`}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={isDarkEditorial ? 'transition hover:text-[#f5f1e8]' : 'hover:text-primary'}
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        {showHeaderProfile && !forceCompactPreview ? (
          <div className="hidden items-center gap-3 lg:inline-flex">
            <span className={`relative h-10 w-10 overflow-hidden shadow-sm ${
              isDarkEditorial
                ? 'rounded-none border border-white/20 bg-white/10 text-[#f5f1e8]'
                : 'rounded-xl border border-primary/20 bg-primary/10 text-primary'
            }`}
            >
              {profile?.profile_photo_url ? (
                <Image
                  key={`header-${profileRenderKey}`}
                  src={profile.profile_photo_url}
                  alt={profile.professional_name || roleLabel}
                  fill
                  className={`object-cover object-center ${isLuxury ? 'grayscale' : ''}`}
                  style={profilePhotoStyle}
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-sm font-bold">
                  {profile?.professional_name?.charAt(0) || 'P'}
                </span>
              )}
            </span>
            <span>
              <span className={`block text-base font-bold leading-tight ${isDarkEditorial ? 'font-serif font-medium text-[#f5f1e8]' : 'text-text-heading'}`}>
                {profile?.professional_name || 'Nesti Professional'}
              </span>
              <span className={`block text-[10px] font-semibold uppercase tracking-[0.24em] ${isDarkEditorial ? 'text-white/55' : 'text-text-muted'}`}>
                {roleLabel}
              </span>
            </span>
          </div>
        ) : null}

        {showHeaderLinks ? (
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`grid h-10 w-10 place-items-center transition ${
              isDarkEditorial
                ? 'rounded-lg border border-white/25 bg-white/5 text-[#f5f1e8] hover:border-white/45 hover:bg-white/10'
                : 'rounded-xl border border-slate-200 text-text-muted hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
            } ${forceCompactPreview ? '' : 'lg:hidden'}`}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={20} />}
          </button>
        ) : null}
      </div>

      {showHeaderLinks && mobileMenuOpen ? (
        <div className={`border-t px-5 py-3 shadow-lg backdrop-blur sm:px-8 ${
          isLawyerFirstHome
            ? 'border-white/10 bg-primary/95'
            : isDarkEditorial
              ? 'border-white/10 bg-[rgba(13,12,11,0.96)]'
            : 'border-slate-100 bg-white/98'
        } ${forceCompactPreview ? '' : 'lg:hidden'}`}
        >
          <nav className={`grid w-full gap-1 text-sm font-medium ${isDarkEditorial ? 'text-[#f5f1e8]' : 'text-text-heading'}`}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2 transition ${
                  isDarkEditorial ? 'hover:bg-white/8 hover:text-white' : 'hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
