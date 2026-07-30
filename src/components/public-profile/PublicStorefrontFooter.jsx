'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Globe, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { resolvePublicProfileAreas } from '@/lib/publicProfileAreas';

function hexLuminance(hex) {
  const value = String(hex || '').trim();
  if (!/^#[0-9a-f]{6}$/i.test(value)) return null;
  const channels = [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)]
    .map((part) => parseInt(part, 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export default function PublicStorefrontFooter({ profile, content = {}, sectionStyle = {} }) {
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
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
    ...(profile.professional_type === 'agent' ? [{ label: 'Properties', url: `/professional/${profile.slug}/properties` }] : []),
    ...(profile.professional_type === 'mortgage_broker' ? [{ label: 'Programs', url: '#programs' }] : []),
    { label: 'Reviews', url: '#reviews' },
    { label: 'How to connect', url: '#contact' },
  ];
  const links = customLinks.length ? customLinks : defaultLinks;
  const backgroundHex = String(sectionStyle.background || '').trim();
  const hasSectionTextOverride = Boolean(String(sectionStyle.textColor || '').trim());
  const onDark = (() => {
    const lum = hexLuminance(backgroundHex);
    return lum != null ? lum < 0.34 : false;
  })();
  const headingClass = onDark ? 'text-white' : 'text-text-heading';
  const bodyClass = onDark ? 'text-white/82' : 'text-text-muted';
  const subtleClass = onDark ? 'text-white/70' : 'text-text-muted';
  const chipClass = onDark
    ? 'border-white/15 bg-white/10 text-white/88'
    : 'border-slate-200 bg-slate-50 text-slate-700';
  const dividerClass = onDark ? 'border-white/15' : 'border-slate-200';
  const socialClass = onDark
    ? 'border-white/20 bg-white/10 text-white/75 hover:text-white'
    : 'border-slate-200 bg-white text-text-muted hover:text-primary';
  const roleLabelClass = hasSectionTextOverride
    ? 'text-current'
    : 'text-primary';
  const poweredClass = onDark
    ? 'text-emerald-300 hover:text-emerald-200 bg-white/5 border border-white/15 px-2.5 py-1.5 rounded-full'
    : 'text-primary';
  const poweredLogoClass = onDark
    ? 'h-7 w-7 rounded-lg object-cover ring-1 ring-white/20'
    : 'h-7 w-7 rounded-lg object-cover';

  return (
    <footer id="contact" className="border-t border-primary/10 bg-transparent">
      <div className={`w-full px-5 py-8 ${forceCompactPreview ? '' : 'sm:px-8 sm:py-10 lg:px-12 xl:px-16'}`}>
        <div className={`grid gap-8 ${forceMobilePreview ? 'grid-cols-1' : forceTabletPreview ? 'sm:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-[1.1fr_0.65fr_0.85fr]'}`}>
          <div className={forceMobilePreview ? '' : 'md:col-span-2 lg:col-span-1'} data-storefront-anim-item="true">
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
                <div className={`text-base font-bold ${headingClass}`}>{content.heading || profile.professional_name}</div>
                <div className={`mt-1 text-[11px] font-bold uppercase tracking-[0.18em] ${roleLabelClass}`} style={hasSectionTextOverride ? { opacity: 0.92 } : undefined}>{roleLabel}</div>
                {company ? <div className={`mt-1 text-xs ${subtleClass}`}>{company}</div> : null}
              </div>
            </div>
            {descriptionPrefix ? (
              <p className={`mt-4 max-w-xl text-sm leading-6 ${bodyClass}`}>{descriptionPrefix}</p>
            ) : null}
            {descriptionCities.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {descriptionCities.map((city) => (
                  <span
                    key={city}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${chipClass}`}
                  >
                    <MapPin size={12} className="shrink-0" style={{ color: 'currentColor', opacity: 0.9 }} />
                    {city}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div data-storefront-anim-item="true">
            <h3 className={`text-sm font-bold ${headingClass}`}>Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {links.map((link) => (
                <li key={`${link.label}-${link.target || link.url}`}>
                  <Link href={link.target || link.url || '#'} className={`${bodyClass} transition hover:text-primary`}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-storefront-anim-item="true">
            <h3 className={`text-sm font-bold ${headingClass}`}>Contact details</h3>
            <div className={`mt-4 space-y-3 text-sm ${bodyClass}`}>
              {email ? (
                <a href={`mailto:${email}`} className="flex items-start gap-2 transition hover:text-primary">
                  <Mail size={15} className="mt-0.5 shrink-0" style={{ color: 'currentColor', opacity: 0.9 }} />
                  <span className="break-all">{email}</span>
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} className="flex items-center gap-2 transition hover:text-primary">
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
            {hasSocial && socialLinks.website ? (
              <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className={`mt-4 grid h-8 w-8 place-items-center rounded-full border ${socialClass}`} aria-label="Website">
                <Globe size={15} />
              </a>
            ) : null}
          </div>
        </div>

        <div className={`mt-5 flex flex-col gap-2.5 border-t pt-4 text-xs ${subtleClass} sm:mt-8 sm:flex-row sm:items-center sm:justify-between ${dividerClass}`}>
          <p>© {new Date().getFullYear()} {content.heading || profile.professional_name}. All rights reserved.</p>
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
