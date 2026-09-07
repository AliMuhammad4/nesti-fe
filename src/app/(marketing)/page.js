import HeroSection from "@/components/sections/HeroSection";
import FeaturedProfessionalsSection from "@/components/sections/FeaturedProfessionalsSection";
import AIAssistantsSection from "@/components/sections/AIAssistantsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import NoBrainerSection from "@/components/sections/NoBrainerSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CEOFeaturesSection from "@/components/sections/CEOFeaturesSection";
import OnboardingSection from "@/components/sections/OnboardingSection";
import { PageCta } from "@/components/public-pages/shared/PublicPageShared";

export const metadata = {
  title: "Nesti AI - AI Intelligence Platform for Real Estate",
  description:
    "Transform your real estate business with AI intelligence. Guided nurture, client matching, and automated workflows for agents, mortgage brokers, and lawyers across Canada.",
  alternates: {
    canonical: "https://nesti.ca",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://nesti.ca/#organization",
      "name": "Nesti AI",
      "url": "https://nesti.ca",
      "logo": "https://nesti.ca/logo/logo.png",
      "description":
        "AI intelligence platform modernizing real estate infrastructure for agents, brokers, and clients.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-416-565-4791",
        "contactType": "customer service",
        "areaServed": "CA",
        "availableLanguage": ["English", "French"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://nesti.ca/#website",
      "url": "https://nesti.ca",
      "name": "Nesti AI",
      "publisher": { "@id": "https://nesti.ca/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "name": "Nesti AI Platform",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "CAD",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary/[0.08] to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeroSection />
      <CEOFeaturesSection />
      <AIAssistantsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <NoBrainerSection />
      <PricingSection />
      <TestimonialsSection />
      <OnboardingSection />
      <PageCta
        compact
        transparentSection
        compactHeading="Stop Burning Hours on Admin Work. Start Your Free Trial Today."
      />
    </div>
  );
}
