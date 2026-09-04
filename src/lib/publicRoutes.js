export const PUBLIC_MARKETING_ROUTES = [
  "/about",
  "/mission",
  "/blog",
  "/faq",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/terms-of-use",
  "/refund-policy",
];

export function isPublicMarketingRoute(pathname) {
  return PUBLIC_MARKETING_ROUTES.includes(String(pathname || ""));
}
