'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, Menu, UserPlus, X } from 'lucide-react';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';

const ROLE_HERO = {
  agent: {
    eyebrow: 'Local Market Partner',
    fallbackHeadline: (name) => `Move smarter with ${name}`,
    fallbackTagline:
      'Get guided support for buying, selling, pricing, showings, and consultation requests in one organized experience.',
    cardSubtitle: 'Local Real Estate Agent',
  },
  mortgage_broker: {
    eyebrow: 'Mortgage Strategy Partner',
    fallbackHeadline: (name) => `Plan your financing with ${name}`,
    fallbackTagline:
      'Start a guided mortgage inquiry for pre-approval, affordability, refinancing, and document readiness.',
    cardSubtitle: 'Mortgage Planning Specialist',
  },
  lawyer: {
    eyebrow: 'Real Estate Legal Partner',
    fallbackHeadline: (name) => `Close with clarity beside ${name}`,
    fallbackTagline:
      'Ask about contracts, title matters, closing timelines, and legal transaction support before your next step.',
    cardSubtitle: 'Real Estate Legal Advisor',
  },
};

export default function PublicHero({
  profile,
  onCTAClick,
  onDirectLeadClick,
  onAppointmentClick,
  block,
  flushTop = false,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const professionalType = profile.professional_type;
  const sectionLayout = block?.data?.layout || block?.layout || {};
  const heroVariant = sectionLayout.variant || 'standard';
  const isPremium = heroVariant === 'premium';
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const coverPosition = profile.storefront_cover_position || {};
  const coverX = clamp(coverPosition.x, 0, 100, 50);
  const coverY = clamp(coverPosition.y, 0, 100, 50);
  const coverZoom = clamp(profile.storefront_cover_zoom, 1, 3, 1);
  const profilePosition = profile.storefront_profile_position || {};
  const profileX = clamp(profilePosition.x, 0, 100, 50);
  const profileY = clamp(profilePosition.y, 0, 100, 25);
  const profileZoom = clamp(profile.storefront_profile_zoom, 1, 3, 1);
  const coverPhotoStyle = {
    objectPosition: `${coverX}% ${coverY}%`,
    transform: `scale(${coverZoom})`,
    transformOrigin: `${coverX}% ${coverY}%`,
  };
  const profilePhotoStyle = {
    objectPosition: `${profileX}% ${profileY}%`,
    transform: `scale(${profileZoom})`,
    transformOrigin: `${profileX}% ${profileY}%`,
  };
  const coverRenderKey = `${profile.cover_photo_url}-${coverX}-${coverY}-${coverZoom}`;
  const profileRenderKey = `${profile.profile_photo_url}-${profileX}-${profileY}-${profileZoom}`;
  const heroContent = ROLE_HERO[professionalType] || ROLE_HERO.agent;
  const professionalProfile = profile.professional_profile || {};
  const companyName = professionalProfile.company_name || '';
  const roleLabel =
    professionalType === 'mortgage_broker'
      ? 'Mortgage Broker'
      : professionalType === 'lawyer'
        ? 'Real Estate Lawyer'
        : 'Real Estate Agent';
  const inviteShareUrl = String(profile.invite_link?.share_url || '').trim();
  const calendlyLink = profile.professional_profile?.calendly_link || '';
  const trackedCalendlyLink = buildTrackedCalendlyUrl(calendlyLink, profile);
  const handleConsultationClick = () => {
    if (trackedCalendlyLink) {
      window.open(trackedCalendlyLink, '_blank', 'noopener,noreferrer');
      onAppointmentClick?.();
      return;
    }
    onCTAClick?.('book_consultation');
  };
  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    ...(professionalType === 'agent'
      ? [{ href: '#properties', label: 'Properties' }]
      : professionalType === 'mortgage_broker'
        ? [{ href: '#programs', label: 'Programs' }]
        : []),
    { href: '#reviews', label: 'Reviews' },
    { href: '#guide', label: 'Guide' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <section className={`relative overflow-hidden bg-white ${flushTop ? '' : 'pt-16'}`}>
      <header className="fixed inset-x-0 top-0 z-[1000] border-b border-border/70 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-lg py-1"
          >
            <span
              className={`flex h-10 shrink-0 items-center justify-center overflow-hidden ${
                profile.storefront_logo_url
                  ? 'w-20 border-r border-slate-200 pr-3'
                  : 'w-10 rounded-lg'
              }`}
            >
              {profile.storefront_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.storefront_logo_url}
                  alt={`${profile.professional_name || 'Professional'} logo`}
                  className="max-h-9 w-auto max-w-full object-contain"
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
              <span className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-[15px]">
                {profile.storefront_logo_url ? profile.professional_name : 'Nesti AI'}
              </span>
              <span className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                {profile.storefront_logo_url ? roleLabel : 'Real Estate Intelligence'}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-[13px] font-semibold text-text-heading lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-primary">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:inline-flex">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
              {profile.profile_photo_url ? (
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
                  {profile.professional_name?.charAt(0) || 'P'}
                </span>
              )}
            </span>
            <span>
              <span className="block text-base font-bold leading-tight text-text-heading">
                {profile.professional_name || 'Nesti Professional'}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                {roleLabel}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-text-muted transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary lg:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white/98 px-5 py-3 shadow-lg backdrop-blur sm:px-8 lg:hidden">
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
        )}
      </header>

      <div className="relative border-b border-slate-200 bg-white">
        {/* Cover spans the contained col-12 canvas (not viewport full-bleed). */}
        <div className="relative h-44 w-full overflow-hidden sm:h-56 lg:h-64">
          {profile.cover_photo_url ? (
            <Image
              key={coverRenderKey}
              src={profile.cover_photo_url}
              alt={`${profile.professional_name || 'Professional'} cover`}
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover object-center"
              style={coverPhotoStyle}
              priority
            />
          ) : (
            <div className={`absolute inset-0 ${isPremium ? 'bg-gradient-to-r from-slate-900 via-slate-700 to-primary/80' : 'bg-gradient-to-r from-primary/30 via-slate-200 to-primary/20'}`} />
          )}
        </div>

        <div className="relative px-4 pb-5 sm:px-6 lg:px-8">
          <div className="relative -mt-14 flex items-start gap-4 sm:-mt-16 sm:gap-5">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[4px] border-white bg-slate-100 shadow-md sm:h-36 sm:w-36">
                {profile.profile_photo_url ? (
                  <Image
                    key={`hero-${profileRenderKey}`}
                    src={profile.profile_photo_url}
                    alt={profile.professional_name || roleLabel}
                    fill
                    sizes="144px"
                    className="object-cover object-top"
                    style={profilePhotoStyle}
                    priority
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-4xl font-bold text-primary">
                    {profile.professional_name?.charAt(0) || 'P'}
                  </div>
                )}
              </div>

            <div className="relative mt-16 min-w-0 flex-1 sm:mt-[4.5rem] lg:pr-52">
              <div className="flex min-w-0 items-center gap-4">
                <h1 className="shrink-0 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {profile.professional_name || 'Professional'}
                </h1>
              </div>
              <p className="mt-1 text-sm font-medium leading-5 text-slate-700">
                {profile.headline || heroContent.fallbackHeadline(profile.professional_name || 'this professional')}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onDirectLeadClick}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3.5 text-[11px] font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-primary-dark hover:shadow-md"
                  >
                    Submit inquiry
                  </button>
                  <button
                    type="button"
                    onClick={handleConsultationClick}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 text-[11px] font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-slate-50"
                  >
                    {profile.hero_cta_label || 'Book a Free Consultation'}
                  </button>
                  {inviteShareUrl ? (
                    <a
                      href={inviteShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-slate-50"
                    >
                      <UserPlus size={12} />
                      Join Nesti
                    </a>
                  ) : null}
              </div>

              {companyName ? (
                <>
                  <span className="absolute right-0 top-1/2 hidden max-w-48 -translate-y-1/2 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-800 shadow-sm lg:inline-flex">
                    <Building2 size={15} className="shrink-0 text-primary" />
                    <span className="truncate">{companyName}</span>
                  </span>
                  <span className="mt-2.5 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm lg:hidden">
                    <Building2 size={13} className="shrink-0 text-primary" />
                    <span className="truncate">{companyName}</span>
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

