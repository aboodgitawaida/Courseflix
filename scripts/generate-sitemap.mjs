// Regenerates public/sitemap.xml from the course catalog so search engines can
// find every course page. Run after updating src/lib/utm-catalog.ts:
//   npm run sitemap
import { readFileSync, writeFileSync } from "node:fs";

const SITE_URL = "https://www.courseflix.ca";
const catalog = readFileSync(new URL("../src/lib/utm-catalog.ts", import.meta.url), "utf8");
const codes = [
  ...new Set([...catalog.matchAll(/^\s*\["([A-Z]{3}\d{3}[HY]\d)"/gm)].map((m) => m[1])),
];

const pages = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/list", changefreq: "weekly", priority: "0.8" },
  { path: "/help", changefreq: "monthly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
  ...codes.map((code) => ({ path: `/course/${code}`, changefreq: "weekly", priority: "0.7" })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) =>
      `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`Wrote ${pages.length} URLs to public/sitemap.xml`);
