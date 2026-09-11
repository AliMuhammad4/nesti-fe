import BlogPage from "@/components/public-pages/BlogPage";
import { getPublicPage } from "@/lib/publicPageContent";
import { getPublicPageMeta } from "@/lib/publicPageMeta";

export const metadata = {
  title: {
    absolute: "Our Blog - Insights | Nesti AI",
  },
  description:
    "Explore the Nesti blogs for AI, market trends, and growth strategies built for real estate agents, lawyers, and mortgage brokers.",
  alternates: {
    canonical: "https://nesti.ca/blog",
  },
  openGraph: {
    title: "Our Blog - Insights | Nesti AI",
    description:
      "Explore the Nesti blogs for AI, market trends, and growth strategies built for real estate agents, lawyers, and mortgage brokers.",
    url: "https://nesti.ca/blog",
  },
  twitter: {
    title: "Our Blog - Insights | Nesti AI",
    description:
      "Explore the Nesti blogs for AI, market trends, and growth strategies built for real estate agents, lawyers, and mortgage brokers.",
  },
};

export default function BlogRoute() {
  const page = getPublicPage("blog");
  const meta = { ...getPublicPageMeta("blog") };
  delete meta.Icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-background-light/20 to-white">
      <BlogPage page={page} meta={meta} sections={page.sections || []} />
    </div>
  );
}
