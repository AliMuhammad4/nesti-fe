'use client';

import { useState } from 'react';
import AgentListingsSection from '@/components/public-profile/agent/AgentListingsSection';
import PublicChatBubble from '@/components/public-profile/PublicChatBubble';
import PublicLeadCaptureModal from '@/components/public-profile/PublicLeadCaptureModal';
import PublicStorefrontFooter from '@/components/public-profile/PublicStorefrontFooter';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import StorefrontInlineStyle from './StorefrontInlineStyle';
import { StorefrontTheme } from './storefrontTheme';
import { STOREFRONT_BLOCK_TYPES, isInvestorSpecialistTemplate } from './storefrontPresets';
import {
  experienceCanvasClass,
  getStorefrontExperienceCss,
  resolveTemplateExperience,
} from './storefrontExperience';

function resolveListingsPresentation(templateKey = '') {
  const key = String(templateKey || '').toLowerCase();
  if (key.includes('luxury')) return 'luxury';
  if (key.includes('first-home')) return 'firstHome';
  if (key.includes('seller')) return 'seller';
  if (key.includes('community')) return 'community';
  if (key.includes('investor')) return 'investor';
  return 'standard';
}

function resolveSectionVariant(templateKey = '') {
  const key = String(templateKey || '').toLowerCase();
  if (key.includes('luxury')) return 'luxury';
  if (key.includes('first-home')) return 'firstHome';
  if (key.includes('seller')) return 'seller';
  if (key.includes('community')) return 'community';
  if (key.includes('investor')) return 'investor';
  return undefined;
}

export default function PublicPropertiesPage({ profile, listings = [] }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const profileHref = `/professional/${profile.slug}`;
  const storefrontBlocks = Array.isArray(profile?.storefront_blocks) ? profile.storefront_blocks : [];
  const heroBlock = storefrontBlocks.find((block) => block?.type === STOREFRONT_BLOCK_TYPES.HERO) || {};
  const listingsBlock = storefrontBlocks.find((block) => block?.type === STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS)
    || storefrontBlocks.find((block) => block?.type === STOREFRONT_BLOCK_TYPES.PROPERTIES)
    || {};
  const footerBlock = storefrontBlocks.find((block) => block?.type === STOREFRONT_BLOCK_TYPES.FOOTER) || {};
  const heroContent = heroBlock?.data?.content || {};
  const heroStyle = heroBlock?.data?.style || {};
  const footerBlockContent = footerBlock?.data?.content || {};
  const footerBlockStyle = footerBlock?.data?.style || {};
  const listingsContent = listingsBlock?.data?.content || {};
  const listingsLayout = listingsBlock?.data?.layout || {};
  const listingsStyle = listingsBlock?.data?.style || profile?.storefront_section_style || {};
  const templateKey = profile?.storefront_template_key || '';
  const isInvestor = isInvestorSpecialistTemplate(templateKey);
  const experience = resolveTemplateExperience(templateKey);
  const experienceClass = experienceCanvasClass(experience);
  const presentation = resolveListingsPresentation(templateKey);
  const headerVariant = resolveSectionVariant(templateKey);
  const listingsTitle = listingsContent.heading || (presentation === 'luxury' ? 'Featured properties' : 'All available properties');
  const listingsDescription = listingsContent.body || (presentation === 'luxury' ? '' : `Explore the complete property inventory from ${profile.professional_name}.`);
  const headerProfile = {
    ...profile,
    storefront_section_content: heroContent,
    storefront_section_style: heroStyle,
  };
  const footerContent = {
    ...footerBlockContent,
    items: Array.isArray(footerBlockContent?.items) && footerBlockContent.items.length
      ? footerBlockContent.items
      : [
          { label: 'Profile', url: profileHref },
          { label: 'Services', url: `${profileHref}#services` },
          { label: 'Properties', url: `${profileHref}#properties` },
          ...(isInvestor ? [] : [
            { label: 'Reviews', url: `${profileHref}#reviews` },
            { label: 'Contact', url: `${profileHref}/contact` },
          ]),
        ],
  };

  return (
    <StorefrontTheme theme={profile.storefront_theme}>
      <StorefrontInlineStyle css={getStorefrontExperienceCss()} />
      <div
        className={`${experienceClass} storefront-canvas min-h-screen`}
        data-template-key={templateKey}
        data-preview="false"
        data-preview-mode="desktop"
      >
        <div data-storefront-block={STOREFRONT_BLOCK_TYPES.HERO}>
          <PublicStorefrontHeader profile={headerProfile} absoluteHashes variant={headerVariant} />
        </div>

        <main className="w-full flex-1 pt-16">
          <div data-storefront-block={STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS}>
            <AgentListingsSection
              profile={profile}
              title={listingsTitle}
              description={listingsDescription}
              listings={listings}
              type="featured"
              profileSlug={profile.slug}
              onPropertyInquiry={setSelectedProperty}
              showAll
              showViewAll={false}
              presentation={presentation}
              content={listingsContent}
              sectionStyle={listingsStyle}
              layout={{
                ...listingsLayout,
                width: 'full',
                padding: listingsLayout.padding || 'large',
              }}
            />
          </div>
        </main>

        <div data-storefront-block={STOREFRONT_BLOCK_TYPES.FOOTER}>
          <PublicStorefrontFooter profile={profile} content={footerContent} sectionStyle={footerBlockStyle} />
        </div>

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
