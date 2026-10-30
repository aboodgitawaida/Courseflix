import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";
import { jsonLd, pageHead, siteUrl } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => {
    const page = pageHead({
      title: "Courseflix | Browse UTM Courses Like Netflix",
      description:
        "Browse every UTM course like Netflix: rows built for your program, student reviews, bird courses and prerequisite paths. Save a shortlist and share it with friends.",
      path: "/",
    });
    return {
      ...page,
      scripts: [
        jsonLd({
          "@type": "WebSite",
          name: "Courseflix",
          url: siteUrl("/"),
          description:
            "Course discovery for University of Toronto Mississauga students: every course, sorted into rows for your program, with student reviews and prerequisite paths.",
          inLanguage: "en-CA",
        }),
      ],
    };
  },
  component: HomePage,
});
