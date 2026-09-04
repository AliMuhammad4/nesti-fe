'use client';

import Image from 'next/image';
import { ArrowUpRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import {
  hasPublicClientStories,
  isStorefrontHashTargetAvailable,
} from '@/components/storefront/storefrontContentVisibility';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../shared/ResilientStorefrontImage';
import {
  blockContent,
  lawyerClassicBandColors,
  lawyerClassicResolvedPaddingClass,
  resolveProfessionalIdentity,
} from '../shared/lawyerSectionUtils';

function safeFooterTarget(value) {
  const target = String(value || '').trim();
  if (!target || /[\u0000-\u001f\u007f\\]/.test(target)) return '';
  if (/^#[a-z][\w:.-]*$/i.test(target)) return target;
  if (/^\/(?!\/)/.test(target)) return target;
  try {
    const parsed = new URL(target);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)
      ? target
      : '';
  } catch {
    return '';
  }
}

export function LawyerClassicFooter({ profile, block, absoluteHashes = false }) {
  const content = blockContent(block);
  const sectionStyle = block?.data?.style || block?.style || {};
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const isLawyerFirstHome = profile?.storefront_template_key === 'lawyer-first-home-closing';
  const isLawyerInvestor = profile?.storefront_template_key === 'lawyer-investor';
  const usesCuratedLinks = isLawyerFirstHome || isLawyerInvestor;
  const profileHref = profile?.slug ? `/p/${encodeURIComponent(profile.slug)}` : '';
  const showReviews = isLawyerFirstHome || isPreview || hasPublicClientStories(profile);
  const hasPersistedLinks = Object.prototype.hasOwnProperty.call(content, 'items')
    && Array.isArray(content.items);
  const defaultLinks = [
    { label: 'About', url: '#about' },
    { label: 'Who we help', url: '#clients' },
    { label: 'Practice areas', url: '#services' },
    { label: 'Documents', url: '#documents' },
    { label: 'Client feedback', url: '#reviews' },
    { label: 'Closing guide', url: '#guidance' },
    { label: 'Contact', url: '/contact' },
  ];
  const sourceLinks = hasPersistedLinks ? [...content.items] : defaultLinks;
  const ensureFooterLink = (links, { label, target }) => {
    const hasLink = links.some((link) => {
      const href = String(link?.target || link?.url || '').toLowerCase();
      return href === target || String(link?.label || '').toLowerCase() === label.toLowerCase();
    });
    if (hasLink) return links;
    const aboutIndex = links.findIndex((link) => String(link?.target || link?.url || '').toLowerCase() === '#about');
    const next = [...links];
    next.splice(aboutIndex >= 0 ? aboutIndex + 1 : 0, 0, { label, target });
    return next;
  };
  const requiredLinks = usesCuratedLinks
    ? sourceLinks
    : ensureFooterLink(
      ensureFooterLink(
        ensureFooterLink(
          ensureFooterLink(sourceLinks, { label: 'Who we help', target: '#clients' }),
          { label: 'Documents', target: '#documents' },
        ),
        { label: 'Client feedback', target: '#reviews' },
      ),
      { label: 'Contact', target: '/contact' },
    );
  const links = requiredLinks
    .filter((link) => link && typeof link === 'object' && link.label)
    .map((link) => ({
      ...link,
      safeTarget: safeFooterTarget(link.target || link.url),
    }))
    .map((link) => {
      let target = link.safeTarget;
      if (target === '/contact' && profileHref) {
        target = `${profileHref}/contact`;
      } else if (absoluteHashes && profileHref && target.startsWith('#')) {
        target = `${profileHref}${target}`;
      }
      return { ...link, safeTarget: target };
    })
    .filter((link) => link.safeTarget && (
      showReviews || !link.safeTarget.toLowerCase().includes('#reviews')
    ))
    .filter((link) => {
      if (String(link.safeTarget || '').includes('/contact')) return Boolean(profile?.slug);
      return isStorefrontHashTargetAvailable(profile, link.safeTarget);
    })
    .slice(0, 8);
  const photo = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  const identity = resolveProfessionalIdentity(profile);
  const name = String(content.heading || identity.name || '')
    .trim()
    .replace(/[.\s]+$/, '');
  const company = identity.company;
  const email = profile?.email;
  const phone = profile?.professional_profile?.phone;
  const padding = block?.data?.layout?.padding || block?.layout?.padding;
  const band = lawyerClassicBandColors(sectionStyle);
  const footerBackground = band.background;
  const footerTextColor = band.color;

  return (
    <footer
      className={`w-full max-w-none px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicResolvedPaddingClass(padding, 'py-14')}`}
      style={{
        backgroundColor: footerBackground,
        color: footerTextColor,
      }}
    >
      <div className="grid w-full max-w-none gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_.65fr_.9fr] lg:gap-16">
        <div className="max-w-xl" data-storefront-anim-item="true">
          <div className="flex items-center gap-4">
            {photo ? (
              <div
                className="relative h-16 w-16 shrink-0 overflow-hidden border border-white/20"
                data-storefront-field="brandKit.profile_photo_url"
                data-storefront-source="profile"
                data-storefront-label="Footer profile image"
              >
                <ResilientStorefrontImage
                  profile={profile}
                  candidates={[{ src: photo, kind: 'profile' }]}
                  alt={name}
                  sizes="64px"
                  className="object-cover"
                  fallback={(
                    <div className="grid h-full w-full place-items-center bg-white/5 text-lg font-semibold text-accent">
                      {String(name).split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                    </div>
                  )}
                />
              </div>
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center border border-accent/[0.45] bg-white/5 text-lg font-semibold text-accent">
                {String(name).split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
              </div>
            )}
            <div>
              <EditableText
                field="content.heading"
                label="Footer heading"
                source={content.heading ? 'persisted' : 'fallback'}
                className="text-lg font-semibold text-current"
              >
                {name}
              </EditableText>
              <EditableText
                as="p"
                field="content.role_label"
                label="Footer role label"
                source={content.role_label ? 'persisted' : 'fallback'}
                className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent"
              >
                {content.role_label || identity.role}
              </EditableText>
              {company ? <p className="mt-1.5 text-xs text-current opacity-[0.55]">{company}</p> : null}
            </div>
          </div>
          <EditableText
            as="p"
            field="content.body"
            label="Footer description"
            source={content.body ? 'persisted' : 'fallback'}
            className="mt-6 max-w-lg text-sm leading-7 text-current opacity-[0.62]"
          >
            {content.body || 'Real estate legal guidance for contracts, title matters, transactions, and closing.'}
          </EditableText>
        </div>

        <nav data-storefront-anim-item="true">
          <EditableText
            as="h3"
            field="content.links_heading"
            label="Footer navigation heading"
            source={content.links_heading ? 'persisted' : 'fallback'}
            className="text-xs font-bold uppercase tracking-[0.16em] text-current"
          >
            {content.links_heading || 'Explore'}
          </EditableText>
          <div className="mt-4 h-px w-10 bg-accent/70" />
          {links.length ? (
          <ul className="mt-5 space-y-3">
            {links.map((link, index) => (
              <li key={link.id || `${link.label}-${index}`}>
                <a
                  href={link.safeTarget}
                  target={/^https?:\/\//i.test(link.safeTarget) ? '_blank' : undefined}
                  rel={/^https?:\/\//i.test(link.safeTarget) ? 'noopener noreferrer' : undefined}
                  data-storefront-field="content.items"
                  data-storefront-source={hasPersistedLinks ? 'persisted' : 'fallback'}
                  data-storefront-collection="items"
                  data-storefront-item-id={link.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="label"
                  data-storefront-label={`Footer link ${index + 1}`}
                  className="text-sm text-current opacity-[0.62] transition hover:text-accent hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          ) : isPreview ? (
            <p className="mt-5 text-xs text-current opacity-50">Add footer links in the Content panel.</p>
          ) : null}
        </nav>

        <div data-storefront-anim-item="true">
          <EditableText
            as="h3"
            field="content.contact_heading"
            label="Footer contact heading"
            source={content.contact_heading ? 'persisted' : 'fallback'}
            className="text-xs font-bold uppercase tracking-[0.16em] text-current"
          >
            {content.contact_heading || 'Contact details'}
          </EditableText>
          <div className="mt-4 h-px w-10 bg-accent/70" />
          <div className="mt-5 space-y-4 text-sm text-current opacity-[0.62]">
            {email ? (
              <a href={`mailto:${email}`} className="flex items-start gap-3 transition hover:text-accent">
                <Mail size={16} className="mt-0.5 shrink-0 text-accent" />
                <span className="break-all">{email}</span>
              </a>
            ) : null}
            {phone ? (
              <a href={`tel:${phone}`} className="flex items-center gap-3 transition hover:text-accent">
                <Phone size={16} className="shrink-0 text-accent" />
                <span>{phone}</span>
              </a>
            ) : null}
            <EditableText
              as="p"
              field="content.confidentiality_text"
              label="Footer confidentiality text"
              source={content.confidentiality_text ? 'persisted' : 'fallback'}
              className="flex items-start gap-3"
            >
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>
                {content.confidentiality_text
                  || 'Do not send confidential information until the lawyer confirms representation.'}
              </span>
            </EditableText>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-current opacity-[0.45] lg:flex-row lg:items-center lg:justify-between">
        <p suppressHydrationWarning>© {new Date().getFullYear()} {name}. All rights reserved.</p>
        {!isLawyerFirstHome ? (
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal information">
            <a href="/privacy" className="transition hover:text-accent">Privacy</a>
            <a href="/terms" className="transition hover:text-accent">Terms</a>
          </nav>
        ) : null}
        <a href="/" className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.12em] text-current transition hover:text-accent">
          <Image src="/logo/logo.png" alt="Nesti AI logo" width={26} height={26} className="rounded-md" />
          <span>Powered by Nesti AI</span>
          <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}
