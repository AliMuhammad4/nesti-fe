import TermsPage from "@/components/public-pages/TermsPage";
import { getPublicPage } from "@/lib/publicPageContent";
import { getPublicPageMeta } from "@/lib/publicPageMeta";

export const metadata = {
  title: {
    absolute: "Terms of Use | Nesti AI",
  },
  description:
    "Review Nesti AI's terms of use covering platform access, subscriptions, and user responsibilities for real estate professionals.",
  alternates: {
    canonical: "https://nesti.ca/terms-of-use",
  },
  openGraph: {
    title: "Terms of Use | Nesti AI",
    description:
      "Review Nesti AI's terms of use covering platform access, subscriptions, and user responsibilities for real estate professionals.",
    url: "https://nesti.ca/terms-of-use",
  },
  twitter: {
    title: "Terms of Use | Nesti AI",
    description:
      "Review Nesti AI's terms of use covering platform access, subscriptions, and user responsibilities for real estate professionals.",
  },
};

export default function TermsOfUseRoute() {
  const page = getPublicPage("terms");
  const meta = { ...getPublicPageMeta("terms") };
  delete meta.Icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-background-light/20 to-white">
      <TermsPage page={page} meta={meta} sections={page.sections || []} />
    </div>
  );
}
