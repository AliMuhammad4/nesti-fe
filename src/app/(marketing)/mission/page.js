import MissionPage from "@/components/public-pages/MissionPage";
import { getPublicPage } from "@/lib/publicPageContent";
import { getPublicPageMeta } from "@/lib/publicPageMeta";

export const metadata = {
  title: {
    absolute: "Mission | Nesti AI",
  },
  description:
    "Discover Nesti AI's mission to modernize real estate through AI-driven lead intelligence, automation, and smarter client experiences for professionals.",
  alternates: {
    canonical: "https://nesti.ca/mission",
  },
  openGraph: {
    title: "Mission | Nesti AI",
    description:
      "Discover Nesti AI's mission to modernize real estate through AI-driven lead intelligence, automation, and smarter client experiences for professionals.",
    url: "https://nesti.ca/mission",
  },
  twitter: {
    title: "Mission | Nesti AI",
    description:
      "Discover Nesti AI's mission to modernize real estate through AI-driven lead intelligence, automation, and smarter client experiences for professionals.",
  },
};

export default function MissionRoute() {
  const page = getPublicPage("mission");
  const meta = { ...getPublicPageMeta("mission") };
  delete meta.Icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-background-light/20 to-white">
      <MissionPage page={page} meta={meta} sections={page.sections || []} />
    </div>
  );
}
