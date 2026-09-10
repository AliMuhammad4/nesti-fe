import PrivacyPage from "@/components/public-pages/PrivacyPage";
import { getPublicPage } from "@/lib/publicPageContent";
import { getPublicPageMeta } from "@/lib/publicPageMeta";

export const metadata = {
  title: {
    absolute: "Privacy Policy | Nesti AI",
  },
  description:
    "Read Nesti AI's privacy policy to learn how we collect, use, and protect your personal data as a real estate professional or client.",
  alternates: {
    canonical: "https://nesti.ca/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Nesti AI",
    description:
      "Read Nesti AI's privacy policy to learn how we collect, use, and protect your personal data as a real estate professional or client.",
    url: "https://nesti.ca/privacy-policy",
  },
  twitter: {
    title: "Privacy Policy | Nesti AI",
    description:
      "Read Nesti AI's privacy policy to learn how we collect, use, and protect your personal data as a real estate professional or client.",
  },
};

export default function PrivacyPolicyRoute() {
  const page = getPublicPage("privacy");
  const meta = { ...getPublicPageMeta("privacy") };
  delete meta.Icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-background-light/20 to-white">
      <PrivacyPage page={page} meta={meta} sections={page.sections || []} />
    </div>
  );
}
