'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import AgentListingsSection from '@/components/public-profile/agent/AgentListingsSection';
import PublicChatBubble from '@/components/public-profile/PublicChatBubble';
import PublicLeadCaptureModal from '@/components/public-profile/PublicLeadCaptureModal';
import PublicStorefrontFooter from '@/components/public-profile/PublicStorefrontFooter';
import { StorefrontTheme } from './storefrontTheme';

export default function PublicPropertiesPage({ profile }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const companyName = profile.professional_profile?.company_name || '';
  const profileHref = `/professional/${profile.slug}`;
  const footerContent = {
    items: [
      { label: 'Profile', url: profileHref },
      { label: 'Services', url: `${profileHref}#services` },
      { label: 'Properties', url: `${profileHref}#properties` },
      { label: 'Reviews', url: `${profileHref}#reviews` },
      { label: 'How to connect', url: `${profileHref}#contact` },
    ],
  };

  return (
    <StorefrontTheme theme={profile.storefront_theme}>
      <div className="min-h-screen bg-slate-100">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg">
                {profile.storefront_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.storefront_logo_url}
                    alt={`${profile.professional_name || 'Professional'} logo`}
                    className="h-9 w-9 object-contain"
                  />
                ) : (
                  <Image
                    src="/logo/logo.png"
                    alt="Nesti AI logo"
                    width={36}
                    height={36}
                    className="h-9 w-9 object-cover"
                  />
                )}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-bold text-slate-900">
                  {profile.storefront_logo_url ? profile.professional_name : 'Nesti AI'}
                </span>
                <span className="block truncate text-[10px] font-medium text-slate-500">
                  {profile.storefront_logo_url ? 'Real Estate Agent' : 'Real Estate Intelligence'}
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-1 md:flex">
              <Link href={`${profileHref}#about`} className="inline-flex h-8 items-center rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-white hover:text-primary">
                About
              </Link>
              <Link href={`${profileHref}#services`} className="inline-flex h-8 items-center rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-white hover:text-primary">
                Services
              </Link>
              <Link href="#properties" className="inline-flex h-8 items-center rounded-lg bg-white px-2.5 text-[11px] font-bold text-primary shadow-sm ring-1 ring-slate-200/80">
                Properties
              </Link>
              <Link href={`${profileHref}#reviews`} className="inline-flex h-8 items-center rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-white hover:text-primary">
                Reviews
              </Link>
              <Link href={`${profileHref}#contact`} className="inline-flex h-8 items-center rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-white hover:text-primary">
                Contact
              </Link>
            </nav>
            <span className="md:hidden" aria-hidden />

            <div className="flex min-w-0 items-center justify-end gap-2.5">
              {profile.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={profile.professional_name || 'Professional'}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : null}
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-bold text-slate-900">
                  {profile.professional_name}
                </p>
                {companyName ? (
                  <p className="flex items-center justify-end gap-1 truncate text-[11px] text-slate-500">
                    <Building2 size={11} />
                    {companyName}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 sm:py-8 lg:px-6">
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80">
            <AgentListingsSection
              profile={profile}
              title="All available properties"
              description={`Explore the complete property inventory from ${profile.professional_name}.`}
              listings={[]}
              type="featured"
              profileSlug={profile.slug}
              onPropertyInquiry={setSelectedProperty}
              showAll
              showViewAll={false}
            />
          </div>
        </main>

        <div className="mx-auto w-full max-w-6xl px-3 pb-10 sm:px-5 lg:px-6">
          <div className="overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80">
            <PublicStorefrontFooter profile={profile} content={footerContent} />
          </div>
        </div>

        <PublicLeadCaptureModal
          open={Boolean(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
          profile={profile}
          prefillProperty={selectedProperty}
        />
        <PublicChatBubble profile={profile} />
      </div>
    </StorefrontTheme>
  );
}
