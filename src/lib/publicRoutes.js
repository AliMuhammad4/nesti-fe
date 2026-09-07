export const PUBLIC_MARKETING_ROUTES = [
  "/",
  "/about",
  "/mission",
  "/blog",
  "/faq",
  "/contact",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/terms-of-use",
  "/refund-policy",
];

export function isPublicMarketingRoute(pathname) {
  const path = String(pathname || "");
  // Check exact matches
  if (PUBLIC_MARKETING_ROUTES.includes(path)) return true;
  // Check pattern matches for dynamic routes
  if (path.startsWith("/blog/")) return true;
  if (path.startsWith("/professional/")) return true;
  if (path.startsWith("/p/")) return true;
  return false;
}
