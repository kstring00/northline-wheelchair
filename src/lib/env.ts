/**
 * Launch switch. Keep NEXT_PUBLIC_SITE_LIVE unset/"false" until launch day.
 * While false: robots.txt blocks everything, every page is noindex/nofollow,
 * and the sitemap is not advertised.
 */
export const isSiteLive = process.env.NEXT_PUBLIC_SITE_LIVE === "true";
