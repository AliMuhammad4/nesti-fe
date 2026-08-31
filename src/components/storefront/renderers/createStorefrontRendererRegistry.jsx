import PublicAboutSection from '@/components/public-profile/PublicAboutSection';
import PublicCTA from '@/components/public-profile/PublicCTA';
import PublicExpertiseBand from '@/components/public-profile/PublicExpertiseBand';
import PublicGuidanceSection from '@/components/public-profile/PublicGuidanceSection';
import PublicHappyClientsSlider from '@/components/public-profile/PublicHappyClientsSlider';
import PublicHero from '@/components/public-profile/PublicHero';
import PublicRoleDetailSection from '@/components/public-profile/PublicRoleDetailSection';
import PublicServices from '@/components/public-profile/PublicServices';
import PublicStorefrontFooter from '@/components/public-profile/PublicStorefrontFooter';
import AgentListingsSection from '@/components/public-profile/agent/AgentListingsSection';
import AgentPropertiesSection from '@/components/public-profile/agent/AgentPropertiesSection';
import LawyerCredentialsSection from '@/components/public-profile/lawyer/LawyerCredentialsSection';
import LawyerPracticeAreasSection from '@/components/public-profile/lawyer/LawyerPracticeAreasSection';
import BrokerProgramsSection from '@/components/public-profile/mortgage-broker/BrokerProgramsSection';
import { MortgageAffordabilityCalculator } from '../SmartToolsBlocks';
import { STOREFRONT_BLOCK_TYPES as T } from '../storefrontPresets';
import {
  ClassicServicesSection,
  ClassicTestimonialsSection,
  FunnelMortgageProgramsSection,
  FunnelServicesSection,
  FunnelTestimonialsSection,
  IndustrialMortgageProgramsSection,
  IndustrialServicesSection,
  IndustrialTestimonialsSection,
  LuxuryMortgageProgramsSection,
  LuxuryServicesSection,
  LuxuryTestimonialsSection,
  NeighborhoodServicesSection,
  NeighborhoodTestimonialsSection,
  WarmMortgageProgramsSection,
  WarmServicesSection,
  WarmTestimonialsSection,
} from './variants/experienceSections';
import {
  ClassicAboutSection,
  ClassicCtaSection,
  ClassicHeroSection,
  FunnelAboutSection,
  FunnelCtaSection,
  FunnelHeroSection,
  IndustrialAboutSection,
  IndustrialCtaSection,
  IndustrialHeroSection,
  LuxuryAboutSection,
  LuxuryHeroSection,
  LuxuryCtaSection,
  NeighborhoodAboutSection,
  NeighborhoodCtaSection,
  NeighborhoodHeroSection,
  WarmAboutSection,
  WarmCtaSection,
  WarmHeroSection,
} from './variants/experienceIdentitySections';
import {
  ClassicExperienceHero,
  CommunityExperienceHero,
  FirstHomeExperienceHero,
  LuxuryExperienceHero,
  SellerExperienceHero,
} from './variants/AgentExperienceHeroSections';
import {
  ClassicGuidanceSection,
  CommunityGuidanceSection,
  FirstHomeGuidanceSection,
  InvestorGuidanceSection,
  LuxuryGuidanceSection,
  SellerGuidanceSection,
} from './variants/AgentExperienceGuidanceSections';
import {
  ClassicRoleDetailsSection,
  CommunityRoleDetailsSection,
  FirstHomeRoleDetailsSection,
  InvestorRoleDetailsSection,
  LuxuryRoleDetailsSection,
  SellerRoleDetailsSection,
} from './variants/AgentExperienceRoleDetailSections';
import {
  SellerCaseStudySection,
  SellerCredentialsSection,
  SellerPerformanceSection,
} from './variants/SellerExpertProofSections';
import {
  AgentCaseStudySection,
  AgentCredentialsSection,
  AgentPerformanceSection,
} from './variants/AgentProofSections';
import {
  LawyerClassicAbout,
  LawyerClassicConsultationOptions,
  LawyerClassicCredentials,
  LawyerClassicCta,
  LawyerClassicDocumentChecklist,
  LawyerClassicExpertise,
  LawyerClassicFaq,
  LawyerClassicFeeGuidance,
  LawyerClassicFooter,
  LawyerClassicGuidance,
  LawyerClassicHero,
  LawyerClassicPracticeAreas,
  LawyerClassicStatement,
  LawyerClassicTestimonials,
  LawyerClassicWhoWeHelp,
} from './variants/LawyerClassicSections';
import {
  LawyerFirstHomeAbout,
  LawyerFirstHomeEngagementScope,
  LawyerFirstHomeHero,
  LawyerFirstHomePracticeLogistics,
  LawyerFirstHomePracticeSnapshot,
  LawyerFirstHomeProtection,
  LawyerFirstHomeRoadmap,
  LawyerFirstHomeResources,
} from './variants/lawyer/firstHome';
import {
  LawyerInvestorAbout,
  LawyerInvestorCredentials,
  LawyerInvestorCta,
  LawyerInvestorFooter,
  LawyerInvestorGuidance,
  LawyerInvestorHero,
  LawyerInvestorPracticeSnapshot,
  LawyerInvestorPracticeAreas,
  LawyerInvestorRoleDetails,
  LawyerInvestorServices,
} from './variants/lawyer/investor';
import {
  LawyerNewcomerAbout,
  LawyerNewcomerCredentials,
  LawyerNewcomerCta,
  LawyerNewcomerFooter,
  LawyerNewcomerGuidance,
  LawyerNewcomerPracticeAreas,
  LawyerNewcomerServices,
  LawyerNewcomerTestimonials,
} from './variants/lawyer/newcomer';

function listingBlockProps(block, profile = {}) {
  return {
    content: block?.data?.content || {},
    layout: block?.data?.layout || {},
    sectionStyle: block?.data?.style || profile?.storefront_section_style || {},
  };
}

function sellerSoldListingBlockProps(block, profile = {}) {
  const sold = listingBlockProps(block, profile);
  const featuredBlock = profile.storefront_featured_listing_design;
  if (!featuredBlock) return sold;
  const featured = listingBlockProps(featuredBlock, profile);
  const useFeaturedColumns = Number(sold.content.sold_card_layout_version || 0) < 2;
  const hasCustomSoldCardDesign = Boolean(
    sold.content.card_background
    || sold.content.card_text_color
    || (sold.layout.cardStyle && sold.layout.cardStyle !== 'bordered')
    || (sold.sectionStyle.radius && sold.sectionStyle.radius !== 'default')
    || (sold.sectionStyle.shadow && sold.sectionStyle.shadow !== 'none'),
  );
  if (hasCustomSoldCardDesign) return sold;
  return {
    content: {
      ...sold.content,
      card_background: featured.content.card_background || '',
      card_text_color: featured.content.card_text_color || '',
    },
    layout: {
      ...sold.layout,
      ...(useFeaturedColumns ? { columns: featured.layout.columns || '4' } : {}),
      cardStyle: featured.layout.cardStyle || sold.layout.cardStyle,
    },
    sectionStyle: {
      ...sold.sectionStyle,
      radius: featured.sectionStyle.radius || sold.sectionStyle.radius,
      shadow: featured.sectionStyle.shadow || sold.sectionStyle.shadow,
    },
  };
}

function proofPresentationFromProfile(profile = {}) {
  if (profile.storefront_template_key === 'agent-luxury-advisor') return 'luxury';
  if (profile.storefront_template_key === 'agent-community-expert') return 'community';
  return 'firstHome';
}

const sharedRegistry = {
  [T.HERO]: ({ profile, actions, block }) => (
    <PublicHero
      profile={profile}
      onCTAClick={actions.onCtaClick}
      onDirectLeadClick={actions.onDirectLeadClick}
      onAppointmentClick={actions.onAppointmentClick}
      block={block}
      flushTop
    />
  ),
  [T.EXPERTISE]: ({ profile, actions, block }) => (
    <PublicExpertiseBand
      profile={profile}
      onCTAClick={actions.onCtaClick}
      content={block?.data?.content || {}}
      sectionStyle={block?.data?.style || profile?.storefront_section_style || {}}
      layout={block?.data?.layout || profile?.storefront_section_layout || {}}
    />
  ),
  [T.ROLE_DETAILS]: ({ profile, block }) => (
    <PublicRoleDetailSection
      profile={profile}
      content={block?.data?.content || {}}
      sectionStyle={block?.data?.style || profile?.storefront_section_style || {}}
      layout={block?.data?.layout || profile?.storefront_section_layout || {}}
      preview={profile.storefront_builder_preview}
      previewMode={profile.storefront_preview_mode}
    />
  ),
  [T.ABOUT]: ({ profile }) => (
    <PublicAboutSection
      about={profile.about}
      profile={profile}
      role={profile.professional_type}
    />
  ),
  [T.TESTIMONIALS]: ({ profile, block }) => (
    <PublicHappyClientsSlider
      testimonials={profile.testimonials}
      profile={profile}
      content={block?.data?.content || {}}
    />
  ),
  [T.SERVICES]: ({ profile, block }) => (
    <PublicServices
      services={profile.services}
      professionalType={profile.professional_type}
      content={block?.data?.content || {}}
      sectionStyle={block?.data?.style || profile?.storefront_section_style || {}}
      layout={block?.data?.layout || profile?.storefront_section_layout || {}}
      preview={profile.storefront_builder_preview}
      previewMode={profile.storefront_preview_mode}
    />
  ),
  [T.GUIDANCE]: ({ profile, block }) => (
    <PublicGuidanceSection
      profile={profile}
      content={block?.data?.content || {}}
      previewMode={profile.storefront_preview_mode}
    />
  ),
  [T.CTA]: ({ profile, actions, block }) => (
    <PublicCTA
      profile={profile}
      onDirectLeadClick={actions.onDirectLeadClick}
      onCtaClick={actions.onCtaClick}
      onAppointmentClick={actions.onAppointmentClick}
      content={block?.data?.content || {}}
    />
  ),
  [T.FOOTER]: ({ profile, block, actions }) => (
    <PublicStorefrontFooter
      profile={profile}
      content={block?.data?.content || {}}
      sectionStyle={block?.data?.style || profile?.storefront_section_style || {}}
      onAppointmentClick={actions.onAppointmentClick}
      onCtaClick={actions.onCtaClick}
      onDirectLeadClick={actions.onDirectLeadClick}
    />
  ),
};

const roleRegistry = {
  agent: {
    [T.SELLER_PERFORMANCE]: ({ profile, block }) => (
      <AgentPerformanceSection profile={profile} block={block} presentation={proofPresentationFromProfile(profile)} />
    ),
    [T.SELLER_CASE_STUDY]: ({ profile, block }) => (
      <AgentCaseStudySection profile={profile} block={block} presentation={proofPresentationFromProfile(profile)} />
    ),
    [T.SELLER_CREDENTIALS]: ({ profile, block }) => (
      <AgentCredentialsSection profile={profile} block={block} presentation={proofPresentationFromProfile(profile)} />
    ),
    [T.SELLER_SOLD_RESULTS]: ({ profile, block }) => (
      <AgentListingsSection
        profile={profile}
        title={block?.data?.content?.heading || 'Recently sold homes'}
        description={block?.data?.content?.body || ''}
        listings={profile.recent_closed_seller_leads}
        type="sold"
        profileSlug={profile.slug}
        preview={profile.storefront_builder_preview}
        builderAccessToken={profile.storefront_builder_access_token}
        presentation={proofPresentationFromProfile(profile)}
        {...listingBlockProps(block, profile)}
      />
    ),
    [T.PROPERTIES]: ({ profile, actions, block }) => (
      <AgentPropertiesSection
        profile={profile}
        onPropertyInquiry={actions.onPropertyInquiry}
        {...listingBlockProps(block, profile)}
      />
    ),
    [T.FEATURED_LISTINGS]: ({ profile, actions, block }) => (
      <AgentListingsSection
        profile={profile}
        title={block?.data?.content?.heading || 'Featured Listings'}
        description={block?.data?.content?.body || ''}
        listings={profile.featured_listings}
        type="featured"
        profileSlug={profile.slug}
        preview={profile.storefront_builder_preview}
        builderAccessToken={profile.storefront_builder_access_token}
        onPropertyInquiry={actions.onPropertyInquiry}
        {...listingBlockProps(block, profile)}
      />
    ),
    [T.TOP_LISTINGS]: ({ profile, block }) => (
      <AgentListingsSection
        title={block?.data?.content?.heading || 'Top Listings'}
        description={block?.data?.content?.body || ''}
        listings={profile.top_listings}
        type="top"
        profileSlug={profile.slug}
        preview={profile.storefront_builder_preview}
        builderAccessToken={profile.storefront_builder_access_token}
        {...listingBlockProps(block, profile)}
      />
    ),
    [T.SOLD_LISTINGS]: ({ profile, block }) => (
      <AgentListingsSection
        title={block?.data?.content?.heading || 'Recently Sold'}
        description={block?.data?.content?.body || ''}
        listings={profile.sold_listings}
        type="sold"
        profileSlug={profile.slug}
        preview={profile.storefront_builder_preview}
        builderAccessToken={profile.storefront_builder_access_token}
        {...listingBlockProps(block, profile)}
      />
    ),
  },
  mortgage_broker: {
    [T.MORTGAGE_CALCULATOR]: () => (
      <MortgageAffordabilityCalculator />
    ),
    [T.MORTGAGE_PROGRAMS]: ({ profile, actions, block }) => (
      <BrokerProgramsSection
        programs={profile.mortgage_programs}
        onProgramClick={actions.onCtaClick}
        content={block?.data?.content || {}}
      />
    ),
  },
  lawyer: {
    [T.PRACTICE_AREAS]: ({ profile, actions, block }) => (
      <LawyerPracticeAreasSection
        practiceAreas={profile.practice_areas}
        onAreaClick={actions.onCtaClick}
        content={block?.data?.content || {}}
      />
    ),
    [T.CREDENTIALS]: ({ profile, block }) => (
      <LawyerCredentialsSection credentials={profile.credentials} content={block?.data?.content || {}} />
    ),
  },
};

const experienceOverrides = {
  'classic-balanced': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <ClassicExperienceHero profile={profile} actions={actions} block={block} />,
      [T.ROLE_DETAILS]: ({ profile, block }) => <ClassicRoleDetailsSection profile={profile} block={block} />,
      [T.ABOUT]: ({ profile }) => <ClassicAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <ClassicServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <ClassicTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.GUIDANCE]: ({ profile, block }) => <ClassicGuidanceSection profile={profile} block={block} />,
      [T.CTA]: ({ profile, actions }) => <ClassicCtaSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <LawyerClassicHero profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile, block }) => <LawyerClassicAbout profile={profile} block={block} />,
      [T.WHO_WE_HELP]: ({ profile, block }) => <LawyerClassicWhoWeHelp profile={profile} block={block} />,
      [T.EXPERTISE]: ({ profile, block }) => <LawyerClassicExpertise profile={profile} block={block} />,
      [T.PRACTICE_AREAS]: ({ profile, actions, block }) => <LawyerClassicPracticeAreas profile={profile} actions={actions} block={block} />,
      [T.DOCUMENT_CHECKLIST]: ({ profile, block }) => <LawyerClassicDocumentChecklist profile={profile} block={block} />,
      [T.FEE_GUIDANCE]: ({ profile, block }) => <LawyerClassicFeeGuidance profile={profile} block={block} />,
      [T.ROLE_DETAILS]: ({ profile, actions, block }) => <LawyerClassicStatement profile={profile} actions={actions} block={block} />,
      [T.CONSULTATION_OPTIONS]: ({ profile, actions, block }) => <LawyerClassicConsultationOptions profile={profile} actions={actions} block={block} />,
      [T.TESTIMONIALS]: ({ profile, block }) => (
        <LawyerClassicTestimonials
          profile={profile}
          testimonials={block?.data?.content?.items || profile.testimonials}
          block={block}
        />
      ),
      [T.CREDENTIALS]: ({ profile, block }) => <LawyerClassicCredentials profile={profile} block={block} />,
      [T.GUIDANCE]: ({ profile, block }) => <LawyerClassicGuidance profile={profile} block={block} />,
      [T.FAQ]: ({ profile, block }) => <LawyerClassicFaq profile={profile} block={block} />,
      [T.CTA]: ({ profile, actions, block }) => <LawyerClassicCta profile={profile} actions={actions} block={block} />,
      [T.FOOTER]: ({ profile, block }) => <LawyerClassicFooter profile={profile} block={block} />,
    },
  },
  'luxury-editorial': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <LuxuryExperienceHero profile={profile} actions={actions} block={block} />,
      [T.ROLE_DETAILS]: ({ profile, block }) => <LuxuryRoleDetailsSection profile={profile} block={block} />,
      [T.ABOUT]: ({ profile }) => <LuxuryAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <LuxuryServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile, block }) => <LuxuryTestimonialsSection profile={profile} testimonials={block?.data?.content?.items || profile.testimonials} />,
      [T.GUIDANCE]: ({ profile, block }) => <LuxuryGuidanceSection profile={profile} block={block} />,
      [T.CTA]: ({ profile, actions }) => <LuxuryCtaSection profile={profile} actions={actions} />,
      [T.SELLER_PERFORMANCE]: ({ profile, block }) => <AgentPerformanceSection profile={profile} block={block} presentation="luxury" />,
      [T.SELLER_CASE_STUDY]: ({ profile, block }) => <AgentCaseStudySection profile={profile} block={block} presentation="luxury" />,
      [T.SELLER_CREDENTIALS]: ({ profile, block }) => <AgentCredentialsSection profile={profile} block={block} presentation="luxury" />,
      [T.FEATURED_LISTINGS]: ({ profile, actions, block }) => (
        <AgentListingsSection
          profile={profile}
          title={block?.data?.content?.heading || 'Signature Properties'}
          description={block?.data?.content?.body || ''}
          listings={profile.featured_listings}
          type="featured"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          onPropertyInquiry={actions.onPropertyInquiry}
          presentation="luxury"
          {...listingBlockProps(block, profile)}
        />
      ),
      [T.SOLD_LISTINGS]: ({ profile, block }) => (
        <AgentListingsSection
          title={block?.data?.content?.heading || 'Recent Placements'}
          description={block?.data?.content?.body || ''}
          listings={profile.sold_listings}
          type="sold"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          {...listingBlockProps(block, profile)}
        />
      ),
      [T.SELLER_SOLD_RESULTS]: ({ profile, block }) => (
        <AgentListingsSection
          profile={profile}
          title={block?.data?.content?.heading || 'Notable recent sales'}
          description={block?.data?.content?.body || ''}
          listings={profile.recent_closed_seller_leads}
          type="sold"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          presentation="luxury"
          {...listingBlockProps(block, profile)}
        />
      ),
    },
    mortgage_broker: {
      [T.HERO]: ({ profile, actions, block }) => <LuxuryHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <LuxuryAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <LuxuryServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <LuxuryTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.CTA]: ({ profile, actions }) => <LuxuryCtaSection profile={profile} actions={actions} />,
      [T.MORTGAGE_PROGRAMS]: ({ profile, actions }) => <LuxuryMortgageProgramsSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <LuxuryHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <LuxuryAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <LuxuryServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <LuxuryTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.CTA]: ({ profile, actions }) => <LuxuryCtaSection profile={profile} actions={actions} />,
    },
  },
  'industrial-minimal': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <IndustrialHeroSection profile={profile} actions={actions} block={block} />,
      [T.ROLE_DETAILS]: ({ profile, block }) => <InvestorRoleDetailsSection profile={profile} block={block} />,
      [T.ABOUT]: ({ profile, block }) => <IndustrialAboutSection profile={profile} content={block?.data?.content || {}} block={block} />,
      [T.SERVICES]: ({ profile }) => <IndustrialServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <IndustrialTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.GUIDANCE]: ({ profile, block }) => <InvestorGuidanceSection profile={profile} block={block} />,
      [T.CTA]: ({ profile, actions }) => <IndustrialCtaSection profile={profile} actions={actions} />,
      [T.FEATURED_LISTINGS]: ({ profile, actions, block }) => (
        <AgentListingsSection
          profile={profile}
          title={block?.data?.content?.heading || 'Active Opportunities'}
          description={block?.data?.content?.body || ''}
          listings={profile.featured_listings}
          type="featured"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          onPropertyInquiry={actions.onPropertyInquiry}
          {...listingBlockProps(block, profile)}
        />
      ),
      [T.SOLD_LISTINGS]: ({ profile, block }) => (
        <AgentListingsSection
          title={block?.data?.content?.heading || 'Closed Transactions'}
          description={block?.data?.content?.body || ''}
          listings={profile.sold_listings}
          type="sold"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          {...listingBlockProps(block, profile)}
        />
      ),
    },
    mortgage_broker: {
      [T.HERO]: ({ profile, actions, block }) => <IndustrialHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile, block }) => <IndustrialAboutSection profile={profile} content={block?.data?.content || {}} block={block} />,
      [T.SERVICES]: ({ profile }) => <IndustrialServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <IndustrialTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.CTA]: ({ profile, actions }) => <IndustrialCtaSection profile={profile} actions={actions} />,
      [T.MORTGAGE_PROGRAMS]: ({ profile, actions }) => <IndustrialMortgageProgramsSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <IndustrialHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile, block }) => <IndustrialAboutSection profile={profile} content={block?.data?.content || {}} block={block} />,
      [T.SERVICES]: ({ profile }) => <IndustrialServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <IndustrialTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.CTA]: ({ profile, actions }) => <IndustrialCtaSection profile={profile} actions={actions} />,
    },
  },
  'story-warm': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <FirstHomeExperienceHero profile={profile} actions={actions} block={block} />,
      [T.ROLE_DETAILS]: ({ profile, block }) => <FirstHomeRoleDetailsSection profile={profile} block={block} />,
      [T.ABOUT]: ({ profile }) => <WarmAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <WarmServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile, block }) => <WarmTestimonialsSection profile={profile} testimonials={block?.data?.content?.items || profile.testimonials} />,
      [T.GUIDANCE]: ({ profile, block }) => <FirstHomeGuidanceSection profile={profile} block={block} />,
      [T.CTA]: ({ profile, actions }) => <WarmCtaSection profile={profile} actions={actions} />,
      [T.SELLER_PERFORMANCE]: ({ profile, block }) => <AgentPerformanceSection profile={profile} block={block} presentation="firstHome" />,
      [T.SELLER_CASE_STUDY]: ({ profile, block }) => <AgentCaseStudySection profile={profile} block={block} presentation="firstHome" />,
      [T.SELLER_CREDENTIALS]: ({ profile, block }) => <AgentCredentialsSection profile={profile} block={block} presentation="firstHome" />,
      [T.FEATURED_LISTINGS]: ({ profile, actions, block }) => (
        <AgentListingsSection
          profile={profile}
          title={block?.data?.content?.heading || 'A simple place to start'}
          description={block?.data?.content?.body || ''}
          listings={profile.featured_listings}
          type="featured"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          onPropertyInquiry={actions.onPropertyInquiry}
          presentation="firstHome"
          {...listingBlockProps(block, profile)}
        />
      ),
      [T.SELLER_SOLD_RESULTS]: ({ profile, block }) => (
        <AgentListingsSection
          profile={profile}
          title={block?.data?.content?.heading || 'Recently sold homes'}
          description={block?.data?.content?.body || ''}
          listings={profile.recent_closed_seller_leads}
          type="sold"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          presentation="firstHome"
          {...listingBlockProps(block, profile)}
        />
      ),
    },
    mortgage_broker: {
      [T.HERO]: ({ profile, actions, block }) => <WarmHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <WarmAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <WarmServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <WarmTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.CTA]: ({ profile, actions }) => <WarmCtaSection profile={profile} actions={actions} />,
      [T.MORTGAGE_PROGRAMS]: ({ profile, actions }) => <WarmMortgageProgramsSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <WarmHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <WarmAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <WarmServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <WarmTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.CTA]: ({ profile, actions }) => <WarmCtaSection profile={profile} actions={actions} />,
    },
  },
  'conversion-funnel': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <SellerExperienceHero profile={profile} actions={actions} block={block} />,
      [T.ROLE_DETAILS]: ({ profile, block }) => <SellerRoleDetailsSection profile={profile} block={block} />,
      [T.SELLER_PERFORMANCE]: ({ profile, block }) => <SellerPerformanceSection profile={profile} block={block} />,
      [T.ABOUT]: ({ profile, block }) => <FunnelAboutSection profile={profile} block={block} />,
      [T.SERVICES]: ({ profile }) => <FunnelServicesSection profile={profile} />,
      [T.SELLER_CASE_STUDY]: ({ profile, block }) => <SellerCaseStudySection profile={profile} block={block} />,
      [T.TESTIMONIALS]: ({ profile, block }) => <FunnelTestimonialsSection profile={profile} testimonials={block?.data?.content?.items || profile.testimonials} />,
      [T.SELLER_CREDENTIALS]: ({ profile, block }) => <SellerCredentialsSection profile={profile} block={block} />,
      [T.GUIDANCE]: ({ profile, block }) => <SellerGuidanceSection profile={profile} block={block} />,
      [T.CTA]: ({ profile, actions }) => <FunnelCtaSection profile={profile} actions={actions} />,
      [T.FEATURED_LISTINGS]: ({ profile, actions, block }) => (
        <AgentListingsSection
          profile={profile}
          title={block?.data?.content?.heading || 'Market-ready homes'}
          description={block?.data?.content?.body || ''}
          listings={profile.featured_listings}
          type="featured"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          onPropertyInquiry={actions.onPropertyInquiry}
          presentation="seller"
          {...listingBlockProps(block, profile)}
        />
      ),
      [T.SELLER_SOLD_RESULTS]: ({ profile, block }) => (
        <AgentListingsSection
          profile={profile}
          title={['Recently sold results', 'Recently closed seller leads'].includes(block?.data?.content?.heading)
            ? 'Recently sold properties'
            : (block?.data?.content?.heading || 'Recently sold properties')}
          description={[
            'A live view of completed sales from the connected property inventory.',
            'Recent seller opportunities successfully moved to closed-won.',
          ].includes(block?.data?.content?.body)
            ? 'A look at homes recently sold with a successful client outcome.'
            : (block?.data?.content?.body || '')}
          listings={profile.recent_closed_seller_leads}
          type="sold"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          presentation="seller"
          {...sellerSoldListingBlockProps(block, profile)}
          content={{
            ...sellerSoldListingBlockProps(block, profile).content,
            ...(['Track record', 'Successful seller outcomes'].includes(block?.data?.content?.eyebrow)
              ? { eyebrow: 'Recent sales' }
              : {}),
          }}
        />
      ),
    },
    mortgage_broker: {
      [T.HERO]: ({ profile, actions, block }) => <FunnelHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <FunnelAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <FunnelServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <FunnelTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.CTA]: ({ profile, actions }) => <FunnelCtaSection profile={profile} actions={actions} />,
      [T.MORTGAGE_PROGRAMS]: ({ profile, actions }) => <FunnelMortgageProgramsSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <FunnelHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <FunnelAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <FunnelServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile }) => <FunnelTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.CTA]: ({ profile, actions }) => <FunnelCtaSection profile={profile} actions={actions} />,
    },
  },
  'neighborhood-local': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <CommunityExperienceHero profile={profile} actions={actions} block={block} />,
      [T.ROLE_DETAILS]: ({ profile, block }) => <CommunityRoleDetailsSection profile={profile} block={block} />,
      [T.ABOUT]: ({ profile }) => <NeighborhoodAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile }) => <NeighborhoodServicesSection profile={profile} />,
      [T.TESTIMONIALS]: ({ profile, block }) => <NeighborhoodTestimonialsSection profile={profile} testimonials={block?.data?.content?.items || profile.testimonials} />,
      [T.GUIDANCE]: ({ profile, block }) => <CommunityGuidanceSection profile={profile} block={block} />,
      [T.CTA]: ({ profile, actions }) => <NeighborhoodCtaSection profile={profile} actions={actions} />,
      [T.SELLER_PERFORMANCE]: ({ profile, block }) => <AgentPerformanceSection profile={profile} block={block} presentation="community" />,
      [T.SELLER_CASE_STUDY]: ({ profile, block }) => <AgentCaseStudySection profile={profile} block={block} presentation="community" />,
      [T.SELLER_CREDENTIALS]: ({ profile, block }) => <AgentCredentialsSection profile={profile} block={block} presentation="community" />,
      [T.FEATURED_LISTINGS]: ({ profile, actions, block }) => (
        <AgentListingsSection
          profile={profile}
          title={block?.data?.content?.heading || 'Homes in your area'}
          description={block?.data?.content?.body || ''}
          listings={profile.featured_listings}
          type="featured"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          onPropertyInquiry={actions.onPropertyInquiry}
          presentation="community"
          {...listingBlockProps(block, profile)}
        />
      ),
      [T.SELLER_SOLD_RESULTS]: ({ profile, block }) => (
        <AgentListingsSection
          profile={profile}
          title={block?.data?.content?.heading || 'Recently sold homes'}
          description={block?.data?.content?.body || ''}
          listings={profile.recent_closed_seller_leads}
          type="sold"
          profileSlug={profile.slug}
          preview={profile.storefront_builder_preview}
          builderAccessToken={profile.storefront_builder_access_token}
          presentation="community"
          {...listingBlockProps(block, profile)}
        />
      ),
    },
  },
};

const templateOverrides = {
  'lawyer-newcomer': {
    [T.ABOUT]: ({ profile, block }) => <LawyerNewcomerAbout profile={profile} block={block} />,
    [T.PRACTICE_AREAS]: ({ profile, block }) => <LawyerNewcomerPracticeAreas profile={profile} block={block} />,
    [T.SERVICES]: ({ profile, block }) => <LawyerNewcomerServices profile={profile} block={block} />,
    [T.GUIDANCE]: ({ profile, block }) => <LawyerNewcomerGuidance profile={profile} block={block} />,
    [T.CREDENTIALS]: ({ profile, block }) => <LawyerNewcomerCredentials profile={profile} block={block} />,
    [T.TESTIMONIALS]: ({ profile, block }) => <LawyerNewcomerTestimonials profile={profile} block={block} />,
    [T.CTA]: ({ profile, actions, block }) => <LawyerNewcomerCta profile={profile} actions={actions} block={block} />,
    [T.FOOTER]: ({ profile, actions, block }) => <LawyerNewcomerFooter profile={profile} actions={actions} block={block} />,
  },
  'lawyer-investor': {
    [T.HERO]: ({ profile, actions, block }) => <LawyerInvestorHero profile={profile} actions={actions} block={block} />,
    [T.ABOUT]: ({ profile, block }) => <LawyerInvestorAbout profile={profile} block={block} />,
    [T.PRACTICE_SNAPSHOT]: ({ profile, block }) => <LawyerInvestorPracticeSnapshot profile={profile} block={block} />,
    [T.SERVICES]: ({ profile, block }) => <LawyerInvestorServices profile={profile} block={block} />,
    [T.ROLE_DETAILS]: ({ profile, actions, block }) => <LawyerInvestorRoleDetails profile={profile} actions={actions} block={block} />,
    [T.PRACTICE_AREAS]: ({ profile, block }) => <LawyerInvestorPracticeAreas profile={profile} block={block} />,
    [T.GUIDANCE]: ({ profile, block }) => <LawyerInvestorGuidance profile={profile} block={block} />,
    [T.CREDENTIALS]: ({ profile, block }) => <LawyerInvestorCredentials profile={profile} block={block} />,
    [T.CTA]: ({ profile, actions, block }) => <LawyerInvestorCta profile={profile} actions={actions} block={block} />,
    [T.FOOTER]: ({ profile, actions, block }) => <LawyerInvestorFooter profile={profile} actions={actions} block={block} />,
  },
  'lawyer-first-home-closing': {
    [T.HERO]: ({ profile, actions, block }) => <LawyerFirstHomeHero profile={profile} actions={actions} block={block} />,
    [T.ABOUT]: ({ profile, block }) => <LawyerFirstHomeAbout profile={profile} block={block} />,
    [T.PRACTICE_SNAPSHOT]: ({ profile, block }) => <LawyerFirstHomePracticeSnapshot profile={profile} block={block} />,
    [T.SERVICES]: ({ profile, block }) => <LawyerFirstHomeResources profile={profile} block={block} />,
    [T.ROLE_DETAILS]: ({ actions, block }) => <LawyerFirstHomeProtection actions={actions} block={block} />,
    [T.WHO_WE_HELP]: ({ profile, block }) => <LawyerClassicWhoWeHelp profile={profile} block={block} />,
    [T.EXPERTISE]: ({ block }) => <LawyerFirstHomeRoadmap block={block} />,
    [T.PRACTICE_AREAS]: ({ profile, actions, block }) => <LawyerClassicPracticeAreas profile={profile} actions={actions} block={block} />,
    [T.DOCUMENT_CHECKLIST]: ({ profile, block }) => <LawyerClassicDocumentChecklist profile={profile} block={block} />,
    [T.FEE_GUIDANCE]: ({ profile, block }) => <LawyerClassicFeeGuidance profile={profile} block={block} />,
    [T.ENGAGEMENT_SCOPE]: ({ block }) => <LawyerFirstHomeEngagementScope block={block} />,
    [T.PRACTICE_LOGISTICS]: ({ block }) => <LawyerFirstHomePracticeLogistics block={block} />,
    [T.CONSULTATION_OPTIONS]: ({ profile, actions, block }) => <LawyerClassicConsultationOptions profile={profile} actions={actions} block={block} />,
    [T.TESTIMONIALS]: ({ profile, block }) => (
      <LawyerClassicTestimonials
        profile={profile}
        testimonials={block?.data?.content?.items || profile.testimonials}
        block={block}
      />
    ),
    [T.CREDENTIALS]: ({ profile, block }) => <LawyerClassicCredentials profile={profile} block={block} />,
    [T.GUIDANCE]: ({ profile, block }) => <LawyerClassicGuidance profile={profile} block={block} />,
    [T.FAQ]: ({ profile, block }) => <LawyerClassicFaq profile={profile} block={block} />,
    [T.CTA]: ({ profile, actions, block }) => <LawyerClassicCta profile={profile} actions={actions} block={block} />,
    [T.FOOTER]: ({ profile, block }) => <LawyerClassicFooter profile={profile} block={block} />,
  },
};

export function createStorefrontRendererRegistry({
  role = '',
  experience = 'classic-balanced',
  templateKey = '',
} = {}) {
  return {
    ...sharedRegistry,
    ...(roleRegistry[role] || {}),
    ...(experienceOverrides[experience]?.[role] || {}),
    ...(templateOverrides[templateKey] || {}),
  };
}

// Backward compatibility default export-like registry snapshot.
export const storefrontBlockRegistry = createStorefrontRendererRegistry({ role: 'agent', experience: 'classic-balanced' });
