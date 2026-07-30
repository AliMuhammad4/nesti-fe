'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

function roleLabelFor(professionalType) {
  if (professionalType === 'mortgage_broker') return 'Mortgage Broker';
  if (professionalType === 'lawyer') return 'Real Estate Lawyer';
  return 'Real Estate Agent';
}

export function buildStorefrontNavLinks(profile, { absoluteHashes = false } = {}) {
  const professionalType = profile?.professional_type;
  const slug = profile?.slug || '';
  const hashBase = absoluteHashes && slug ? `/professional/${slug}` : '';

  return [
    { href: `${hashBase}#about`, label: 'About' },
    { href: `${hashBase}#services`, label: 'Services' },
    ...(professionalType === 'agent'
      ? [{ href: `/professional/${slug}/properties`, label: 'Properties' }]
      : professionalType === 'mortgage_broker'
        ? [{ href: `${hashBase}#programs`, label: 'Programs' }]
        : []),
    { href: `${hashBase}#reviews`, label: 'Reviews' },
    { href: `${hashBase}#guide`, label: 'Guide' },
    { href: `${hashBase}#contact`, label: 'Contact' },
  ];
}

export default function PublicStorefrontHeader({
  profile,
  absoluteHashes = false,
  forceCompactPreview = false,
  forceMobilePreview = false,
  sticky = false,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const content = profile?.storefront_section_content || {};
  const showHeaderLinks = content.show_header_links !== false;
  const showHeaderProfile = Boolean(content.show_header_profile);
  const roleLabel = roleLabelFor(profile?.professional_type);
  const navLinks = buildStorefrontNavLinks(profile, { absoluteHashes });
  const navOpenClass = showHeaderLinks && mobileMenuOpen ? 'shadow-md' : '';
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
    <header className={`${positionClass} z-[1000] border-b border-border/70 bg-white/95 shadow-sm backdrop-blur ${navOpenClass}`}>
      <div className={`flex h-16 w-full items-center justify-between ${forceMobilePreview ? 'px-3' : 'px-5 sm:px-8 lg:px-12 xl:px-16'}`}>
        <Link
          href="/"
          className={`flex min-w-0 items-center rounded-lg py-1 ${forceMobilePreview ? 'max-w-[calc(100%-3.25rem)] gap-2.5' : 'gap-3'}`}
        >
          <span
            className={`flex shrink-0 items-center justify-center overflow-hidden ${
              profile?.storefront_logo_url
                ? (forceMobilePreview ? 'h-9 w-16 border-r border-slate-200 pr-2' : 'h-10 w-20 border-r border-slate-200 pr-3')
                : (forceMobilePreview ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-lg')
            }`}
          >
            {profile?.storefront_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.storefront_logo_url}
                alt={`${profile.professional_name || 'Professional'} logo`}
                className={`${forceMobilePreview ? 'max-h-8' : 'max-h-9'} w-auto max-w-full object-contain`}
              />
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
            <span className={`truncate font-bold tracking-tight text-slate-900 ${forceMobilePreview ? 'text-[18px]' : 'text-sm sm:text-[15px]'}`}>
              {profile?.storefront_logo_url ? profile.professional_name : 'Nesti AI'}
            </span>
            {!forceMobilePreview ? (
              <span className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                {profile?.storefront_logo_url ? roleLabel : 'Real Estate Intelligence'}
              </span>
            ) : null}
          </span>
        </Link>

        {showHeaderLinks && !forceCompactPreview ? (
          <nav className="hidden items-center gap-5 text-[13px] font-semibold text-text-heading lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-primary">
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        {showHeaderProfile && !forceCompactPreview ? (
          <div className="hidden items-center gap-3 lg:inline-flex">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
              {profile?.profile_photo_url ? (
                <Image
                  key={`header-${profileRenderKey}`}
                  src={profile.profile_photo_url}
                  alt={profile.professional_name || roleLabel}
                  fill
                  className="object-cover object-center"
                  style={profilePhotoStyle}
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-sm font-bold">
                  {profile?.professional_name?.charAt(0) || 'P'}
                </span>
              )}
            </span>
            <span>
              <span className="block text-base font-bold leading-tight text-text-heading">
                {profile?.professional_name || 'Nesti Professional'}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                {roleLabel}
              </span>
            </span>
          </div>
        ) : null}

        {showHeaderLinks ? (
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-text-muted transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary ${forceCompactPreview ? '' : 'lg:hidden'}`}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={20} />}
          </button>
        ) : null}
      </div>

      {showHeaderLinks && mobileMenuOpen ? (
        <div className={`border-t border-slate-100 bg-white/98 px-5 py-3 shadow-lg backdrop-blur sm:px-8 ${forceCompactPreview ? '' : 'lg:hidden'}`}>
          <nav className="grid w-full gap-1 text-sm font-medium text-text-heading">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 transition hover:bg-primary/5 hover:text-primary"
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
