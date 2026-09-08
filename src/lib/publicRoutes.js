export const PUBLIC_MARKETING_ROUTES = [
  "/about",
  "/mission",
  "/blog",
  "/faq",
  "/contact",
  "/pricing",
  "/features",
  "/docs",
  "/documentation",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/terms-of-use",
  "/refund-policy",
];

export const PUBLIC_AUTH_ROUTES = [
  "/log-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/verify-reset-otp",
  "/reset-password",
];

export function normalizePathname(pathname) {
  if (!pathname) return "/";
  const path = String(pathname).trim();
  const q = path.indexOf("?");
  const h = path.indexOf("#");
  const cut = Math.min(
    q === -1 ? Infinity : q,
    h === -1 ? Infinity : h
  );
  const clean = (cut === Infinity ? path : path.slice(0, cut)).trim();
  if (!clean || clean === "/") return "/";
  return clean.replace(/\/+$/, "");
}

export function isPublicMarketingRoute(pathname) {
  const clean = normalizePathname(pathname);

  // Check exact matches for marketing pages
  if (PUBLIC_MARKETING_ROUTES.includes(clean)) return true;

  // Check pattern matches for marketing and public content
  if (clean.startsWith("/blog/")) return true;
  if (clean.startsWith("/docs/")) return true;
  if (clean.startsWith("/documentation/")) return true;
  if (clean.startsWith("/features/")) return true;

  // Check public storefronts and intake links
  if (clean.startsWith("/professional/")) return true;
  if (clean.startsWith("/p/")) return true;
  if (clean.startsWith("/chatbot/")) return true;
  if (clean.startsWith("/invite/")) return true;

  // Public auth pages are never private workspace pages
  if (PUBLIC_AUTH_ROUTES.includes(clean)) return true;

  return false;
}

