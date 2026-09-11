import FaqPage from "@/components/public-pages/FaqPage";
import { getPublicPage } from "@/lib/publicPageContent";
import { getPublicPageMeta } from "@/lib/publicPageMeta";

export const metadata = {
  title: {
    absolute: "FAQs - Frequently Asked Questions | Nesti AI",
  },
  description:
    "Get answers to common questions about Nesti AI's pricing, features, onboarding, and support for real estate professionals.",
  alternates: {
    canonical: "https://nesti.ca/faq",
  },
  openGraph: {
    title: "FAQs - Frequently Asked Questions | Nesti AI",
    description:
      "Get answers to common questions about Nesti AI's pricing, features, onboarding, and support for real estate professionals.",
    url: "https://nesti.ca/faq",
  },
  twitter: {
    title: "FAQs - Frequently Asked Questions | Nesti AI",
    description:
      "Get answers to common questions about Nesti AI's pricing, features, onboarding, and support for real estate professionals.",
  },
};

export default function FaqRoute() {
  const page = getPublicPage("faq");
  const meta = { ...getPublicPageMeta("faq") };
  delete meta.Icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-background-light/20 to-white">
      <FaqPage page={page} meta={meta} sections={page.sections || []} />
    </div>
  );
}
