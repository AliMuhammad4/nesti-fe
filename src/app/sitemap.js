import fs from 'fs';
import path from 'path';

function getPageLastModified(relativePaths, fallbackDate = '2026-08-20') {
  try {
    let latestMtime = null;
    const paths = Array.isArray(relativePaths) ? relativePaths : [relativePaths];
    for (const relPath of paths) {
      const fullPath = path.join(process.cwd(), relPath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (!latestMtime || stats.mtime > latestMtime) {
          latestMtime = stats.mtime;
        }
      }
    }
    if (latestMtime) {
      return latestMtime.toISOString().split('T')[0];
    }
  } catch {
    // fallback if filesystem access fails
  }
  return fallbackDate;
}

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nesti.ca';

  const routes = [
    {
      path: '',
      files: [
        'src/app/(marketing)/page.js',
        'src/components/public-pages/LandingPage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
    {
      path: '/about',
      files: [
        'src/app/(marketing)/about/page.js',
        'src/components/public-pages/AboutPage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
    {
      path: '/mission',
      files: [
        'src/app/(marketing)/mission/page.js',
        'src/components/public-pages/MissionPage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
    {
      path: '/blog',
      files: [
        'src/app/(marketing)/blog/page.js',
        'src/components/public-pages/BlogPage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
    {
      path: '/faq',
      files: [
        'src/app/(marketing)/faq/page.js',
        'src/components/public-pages/FaqPage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
    {
      path: '/contact',
      files: [
        'src/app/(marketing)/contact/page.js',
        'src/components/public-pages/ContactPage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
    {
      path: '/privacy-policy',
      files: [
        'src/app/(marketing)/privacy-policy/page.js',
        'src/components/public-pages/PrivacyPolicyPage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
    {
      path: '/terms-of-use',
      files: [
        'src/app/(marketing)/terms-of-use/page.js',
        'src/components/public-pages/TermsOfUsePage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
    {
      path: '/refund-policy',
      files: [
        'src/app/(marketing)/refund-policy/page.js',
        'src/components/public-pages/RefundPolicyPage.js',
        'src/lib/publicPageContent.js',
      ],
      fallbackDate: '2026-08-20',
    },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: getPageLastModified(route.files, route.fallbackDate),
  }));
}