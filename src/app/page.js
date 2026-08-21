import HeroSection from "@/components/sections/HeroSection";
import NestiStorySection from "@/components/sections/NestiStorySection";
import AIAssistantsSection from "@/components/sections/AIAssistantsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import WebsiteBuilderSection from "@/components/sections/WebsiteBuilderSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import NoBrainerSection from "@/components/sections/NoBrainerSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CEOFeaturesSection from "@/components/sections/CEOFeaturesSection";
import OnboardingSection from "@/components/sections/OnboardingSection";
import { PageCta } from "@/components/public-pages/shared/PublicPageShared";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary/[0.08] to-white">
      <HeroSection />
      <CEOFeaturesSection />
      <FeaturesSection />
      <NestiStorySection />
      <NoBrainerSection />
      <AIAssistantsSection />
      <WebsiteBuilderSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <OnboardingSection />
      <PageCta
        compact
        transparentSection
        compactHeading="Your website, CRM, follow-up and network in one platform. Start free."
      />
    </div>
  );
}
