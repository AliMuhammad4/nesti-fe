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
import {
  ClosingCostEstimator,
  MortgageAffordabilityCalculator,
} from '../SmartToolsBlocks';
import { STOREFRONT_BLOCK_TYPES as T } from '../storefrontPresets';
import {
  FunnelMortgageProgramsSection,
  FunnelServicesSection,
  FunnelTestimonialsSection,
  IndustrialMortgageProgramsSection,
  IndustrialServicesSection,
  IndustrialTestimonialsSection,
  LuxuryMortgageProgramsSection,
  LuxuryServicesSection,
  LuxuryTestimonialsSection,
  WarmMortgageProgramsSection,
  WarmServicesSection,
  WarmTestimonialsSection,
} from './variants/experienceSections';
import {
  FunnelAboutSection,
  FunnelHeroSection,
  IndustrialAboutSection,
  IndustrialHeroSection,
  LuxuryAboutSection,
  LuxuryHeroSection,
  WarmAboutSection,
  WarmHeroSection,
} from './variants/experienceIdentitySections';

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
    <PublicExpertiseBand profile={profile} onCTAClick={actions.onCtaClick} content={block?.data?.content || {}} />
  ),
  [T.ROLE_DETAILS]: ({ profile, block }) => (
    <PublicRoleDetailSection profile={profile} content={block?.data?.content || {}} />
  ),
  [T.ABOUT]: ({ profile }) => (
    <PublicAboutSection
      about={profile.about}
      profile={profile}
      role={profile.professional_type}
    />
  ),
  [T.TESTIMONIALS]: ({ profile }) => (
    <PublicHappyClientsSlider testimonials={profile.testimonials} profile={profile} />
  ),
  [T.SERVICES]: ({ profile, actions, block }) => (
    <PublicServices
      services={profile.services}
      professionalType={profile.professional_type}
      onServiceClick={actions.onServiceClick}
      content={block?.data?.content || {}}
    />
  ),
  [T.GUIDANCE]: ({ profile, block }) => (
    <PublicGuidanceSection profile={profile} content={block?.data?.content || {}} />
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
  [T.FOOTER]: ({ profile, block }) => (
    <PublicStorefrontFooter profile={profile} content={block?.data?.content || {}} />
  ),
};

const roleRegistry = {
  agent: {
    [T.PROPERTIES]: ({ profile, actions, block }) => (
      <AgentPropertiesSection
        profile={profile}
        onPropertyInquiry={actions.onPropertyInquiry}
        content={block?.data?.content || {}}
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
    [T.CLOSING_COST_ESTIMATOR]: () => (
      <ClosingCostEstimator />
    ),
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
  'luxury-editorial': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <LuxuryHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <LuxuryAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <LuxuryServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <LuxuryTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
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
        />
      ),
    },
    mortgage_broker: {
      [T.HERO]: ({ profile, actions, block }) => <LuxuryHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <LuxuryAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <LuxuryServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <LuxuryTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.MORTGAGE_PROGRAMS]: ({ profile, actions }) => <LuxuryMortgageProgramsSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <LuxuryHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <LuxuryAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <LuxuryServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <LuxuryTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
    },
  },
  'industrial-minimal': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <IndustrialHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <IndustrialAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <IndustrialServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <IndustrialTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
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
        />
      ),
    },
    mortgage_broker: {
      [T.HERO]: ({ profile, actions, block }) => <IndustrialHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <IndustrialAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <IndustrialServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <IndustrialTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.MORTGAGE_PROGRAMS]: ({ profile, actions }) => <IndustrialMortgageProgramsSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <IndustrialHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <IndustrialAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <IndustrialServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <IndustrialTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
    },
  },
  'story-warm': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <WarmHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <WarmAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <WarmServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <WarmTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
    },
    mortgage_broker: {
      [T.HERO]: ({ profile, actions, block }) => <WarmHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <WarmAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <WarmServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <WarmTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.MORTGAGE_PROGRAMS]: ({ profile, actions }) => <WarmMortgageProgramsSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <WarmHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <WarmAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <WarmServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <WarmTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
    },
  },
  'conversion-funnel': {
    agent: {
      [T.HERO]: ({ profile, actions, block }) => <FunnelHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <FunnelAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <FunnelServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <FunnelTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
    },
    mortgage_broker: {
      [T.HERO]: ({ profile, actions, block }) => <FunnelHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <FunnelAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <FunnelServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <FunnelTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
      [T.MORTGAGE_PROGRAMS]: ({ profile, actions }) => <FunnelMortgageProgramsSection profile={profile} actions={actions} />,
    },
    lawyer: {
      [T.HERO]: ({ profile, actions, block }) => <FunnelHeroSection profile={profile} actions={actions} block={block} />,
      [T.ABOUT]: ({ profile }) => <FunnelAboutSection profile={profile} />,
      [T.SERVICES]: ({ profile, actions }) => <FunnelServicesSection profile={profile} actions={actions} />,
      [T.TESTIMONIALS]: ({ profile }) => <FunnelTestimonialsSection profile={profile} testimonials={profile.testimonials} />,
    },
  },
};

export function createStorefrontRendererRegistry({ role = '', experience = 'classic-balanced' } = {}) {
  return {
    ...sharedRegistry,
    ...(roleRegistry[role] || {}),
    ...(experienceOverrides[experience]?.[role] || {}),
  };
}

// Backward compatibility default export-like registry snapshot.
export const storefrontBlockRegistry = createStorefrontRendererRegistry({ role: 'agent', experience: 'classic-balanced' });
