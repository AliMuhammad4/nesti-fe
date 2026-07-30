'use client';

import { useState } from 'react';
import AgentListingsSection from '@/components/public-profile/agent/AgentListingsSection';
import PublicChatBubble from '@/components/public-profile/PublicChatBubble';
import PublicLeadCaptureModal from '@/components/public-profile/PublicLeadCaptureModal';
import PublicStorefrontFooter from '@/components/public-profile/PublicStorefrontFooter';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import { StorefrontTheme } from './storefrontTheme';

export default function PublicPropertiesPage({ profile }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
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
      <div className="min-h-screen pt-16">
        <PublicStorefrontHeader profile={profile} absoluteHashes />

        <main className="w-full">
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
            layout={{ width: 'full', padding: 'large' }}
          />
        </main>

        <PublicStorefrontFooter profile={profile} content={footerContent} />

        <PublicLeadCaptureModal
          open={Boolean(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
          profile={profile}
          prefillProperty={selectedProperty}
        />
        {profile?.storefront_show_chatbot === false ? null : (
          <PublicChatBubble profile={profile} />
        )}
      </div>
    </StorefrontTheme>
  );
}
