export const SITE_CONFIG = {
  name: "Courseflix",
  url: "https://courseflix.ca",
  ogImage: "https://courseflix.ca/og-image.svg",
} as const;

export const siteUrl = (path = "") => `${SITE_CONFIG.url}${path}`;
