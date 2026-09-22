export const SITE_URL = "https://courseflix.ca";

export function siteUrl(path = "") {
  return `${SITE_URL}${path.startsWith("/") || path === "" ? path : `/${path}`}`;
}
