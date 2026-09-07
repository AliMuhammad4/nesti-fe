export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nesti.ca';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mission`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  let dynamicRoutes = [];
  try {
    const res = await fetch(`${apiBaseUrl}/api/public/professionals?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const professionals = Array.isArray(data?.professionals) ? data.professionals : [];
      dynamicRoutes = professionals
        .filter((p) => p?.has_public_profile && p?.slug)
        .map((p) => ({
          url: `${baseUrl}/professional/${encodeURIComponent(p.slug)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch {
    // Graceful fallback to static routes if API is not reachable at build time
    dynamicRoutes = [];
  }

  return [...staticRoutes, ...dynamicRoutes];
}