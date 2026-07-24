'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Globe, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { resolvePublicProfileAreas } from '@/lib/publicProfileAreas';

export default function PublicStorefrontFooter({ profile, content = {} }) {
  const socialLinks = profile.social_links || {};
  const hasSocial = Object.values(socialLinks).some(Boolean);
  const roleLabel =
    profile.professional_type === 'mortgage_broker'
      ? 'Mortgage Broker'
      : profile.professional_type === 'lawyer'
        ? 'Real Estate Lawyer'
        : 'Real Estate Agent';
  const company = profile.professional_profile?.company_name;
  const email = profile.email;
  const phone = profile.professional_profile?.phone;
  const description = content.body || profile.tagline || profile.about || 'Professional real estate services backed by guided AI support.';
  const descriptionPrefix = String(description || '').trim();
  const descriptionCities = resolvePublicProfileAreas(profile, profile.storefront_expertise_areas);
  const customLinks = Array.isArray(content.items) ? content.items.filter((item) => item?.label) : [];
  const defaultLinks = [
    { label: 'About', url: '#about' },
    { label: 'Services', url: '#services' },
    ...(profile.professional_type === 'agent' ? [{ label: 'Properties', url: '#properties' }] : []),
    ...(profile.professional_type === 'mortgage_broker' ? [{ label: 'Programs', url: '#programs' }] : []),
    { label: 'Reviews', url: '#reviews' },
    { label: 'How to connect', url: '#contact' },
  ];
  const links = customLinks.length ? customLinks : defaultLinks;

  return (
    <footer id="contact" className="border-t border-primary/10 bg-white/90 backdrop-blur">
      <div className="w-full px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.65fr_0.85fr]">
          <div>
            <div className="flex items-start gap-4">
              {profile.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={profile.professional_name}
                  width={56}
                  height={56}
                  sizes="56px"
                  className="h-14 w-14 rounded-xl object-cover object-center ring-1 ring-slate-200"
                />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-base font-bold text-primary">
                  {String(profile.professional_name || 'P').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-base font-bold text-text-heading">{content.heading || profile.professional_name}</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{roleLabel}</div>
                {company ? <div className="mt-1 text-xs text-text-muted">{company}</div> : null}
              </div>
            </div>
            {descriptionPrefix ? (
              <p className="mt-4 max-w-xl text-sm leading-6 text-text-muted">{descriptionPrefix}</p>
            ) : null}
            {descriptionCities.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {descriptionCities.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    <MapPin size={12} className="text-primary" />
                    {city}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-heading">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {links.map((link) => (
                <li key={`${link.label}-${link.target || link.url}`}>
                  <Link href={link.target || link.url || '#'} className="text-text-muted transition hover:text-primary">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-heading">Contact details</h3>
            <div className="mt-4 space-y-3 text-sm text-text-muted">
              {email ? (
                <a href={`mailto:${email}`} className="flex items-start gap-2 transition hover:text-primary">
                  <Mail size={15} className="mt-0.5 shrink-0 text-primary" />
                  <span className="break-all">{email}</span>
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} className="flex items-center gap-2 transition hover:text-primary">
                  <Phone size={15} className="shrink-0 text-primary" />
                  <span>{phone}</span>
                </a>
              ) : null}
              {!email && !phone ? (
                <div className="flex items-start gap-2">
                  <MessageCircle size={15} className="mt-0.5 shrink-0 text-primary" />
                  <span>Use chat to start an inquiry.</span>
                </div>
              ) : null}
              <div className="flex items-start gap-2">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
                <span>Professional, contextual follow-up.</span>
              </div>
            </div>
            {hasSocial && socialLinks.website ? (
              <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="mt-4 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-text-muted hover:text-primary" aria-label="Website">
                <Globe size={15} />
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {content.heading || profile.professional_name}. All rights reserved.</p>
          <Link href="/" className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-primary">
            <Image src="/logo/logo.png" alt="Nesti AI logo" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
            <span>Powered by Nesti AI</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
