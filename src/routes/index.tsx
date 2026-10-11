import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";
import { siteUrl } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Courseflix | Browse UTM Courses Like Netflix" },
      {
        name: "description",
        content:
          "Browse every UTM course like Netflix. Pick your major, get curated rows, save a shortlist and share it with friends.",
      },
      { property: "og:title", content: "Courseflix | Browse UTM Courses Like Netflix" },
      {
        property: "og:description",
        content:
          "Browse every UTM course like Netflix. Curated rows, bird courses, ratings and a shareable shortlist.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Courseflix" },
      { property: "og:url", content: siteUrl("/") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Courseflix | Browse UTM Courses Like Netflix" },
      {
        name: "twitter:description",
        content:
          "Browse every UTM course like Netflix. Curated rows, bird courses, ratings and a shareable shortlist.",
      },
    ],
    links: [{ rel: "canonical", href: siteUrl("/") }],
  }),
  component: HomePage,
});
