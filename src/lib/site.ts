export const SITE_URL = "https://www.courseflix.ca";
export const SITE_NAME = "Courseflix";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
/** The course count the site advertises (shown as "2,600+"). */
export const ADVERTISED_COURSE_COUNT = 2600;

export function siteUrl(path = "") {
  return `${SITE_URL}${path.startsWith("/") || path === "" ? path : `/${path}`}`;
}

/** Search snippets cut off around 160 characters; end on a whole word instead. */
export function metaDescription(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

type PageHeadOptions = {
  /** Page name, e.g. "Help centre". "— Courseflix" is added unless it is already there. */
  title: string;
  description: string;
  /** Path for the canonical link and og:url. Leave out for pages that differ per person. */
  path?: string;
  /** Pages that are personal, empty for signed-out visitors, or one-off links stay out of search. */
  index?: boolean;
  type?: "website" | "article";
};

/**
 * One consistent set of tags per page: title, description, the link-preview tags used
 * by iMessage, Discord, LinkedIn and X, a canonical URL and the search-indexing rule.
 * Tags a page leaves out fall back to the defaults in __root.tsx (image, site name).
 */
export function pageHead({
  title,
  description,
  path,
  index = true,
  type = "website",
}: PageHeadOptions) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const summary = metaDescription(description);
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: summary },
      { name: "robots", content: index ? "index, follow" : "noindex, follow" },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: summary },
      { property: "og:type", content: type },
      ...(path ? [{ property: "og:url", content: siteUrl(path) }] : []),
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: summary },
    ],
    links: path && index ? [{ rel: "canonical", href: siteUrl(path) }] : [],
  };
}

/** A JSON-LD block for the page head (structured data for search engines). */
export function jsonLd(data: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    // "<" is escaped so a course title can never close the script tag early.
    children: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(
      /</g,
      "\\u003c",
    ),
  };
}
