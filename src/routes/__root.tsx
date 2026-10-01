import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { BrandIntro } from "@/components/BrandIntro";
import { CourseUIProvider } from "@/hooks/use-course-ui";
import { SoundProvider } from "@/hooks/use-sound";
import { ThemeProvider } from "@/hooks/use-theme";
import { CommandPalette } from "@/components/CommandPalette";
import { CoursePreviewModal } from "@/components/CoursePreviewModal";
import { CompareDrawer } from "@/components/CompareDrawer";
import { StudyEagle } from "@/components/StudyEagle";
import { NetworkStatusBanner } from "@/components/NetworkStatusBanner";
import { supabase } from "@/integrations/supabase/client";
import { captureFirstTouchAttribution } from "@/lib/attribution";
import { A11Y_ANNOUNCE_EVENT } from "@/lib/a11y";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { title: "CourseFlix | Browse & Discover UTM Courses Like Netflix" },
      {
        name: "description",
        content:
          "Browse every UTM course like Netflix. Pick your major, get curated rows, save a shortlist, and share it with friends.",
      },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b0b0b" },
      { property: "og:url", content: "https://courseflix.ca/" },
      { property: "og:title", content: "CourseFlix | Browse & Discover UTM Courses Like Netflix" },
      {
        property: "og:description",
        content:
          "Browse every UTM course like Netflix. Pick your major, get curated rows, save a shortlist, and share it with friends.",
      },
      { property: "og:site_name", content: "Courseflix" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.courseflix.ca/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://courseflix.ca/" },
      { name: "twitter:title", content: "CourseFlix | Browse & Discover UTM Courses Like Netflix" },
      {
        name: "twitter:description",
        content:
          "Browse every UTM course like Netflix. Pick your major, get curated rows, save a shortlist, and share it with friends.",
      },
      { name: "twitter:image", content: "https://www.courseflix.ca/og-image.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap",
      },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/eagle-favicon-v3-32x32.png" },
      { rel: "shortcut icon", type: "image/x-icon", href: "/eagle-favicon-v3.ico" },
      { rel: "icon", type: "image/x-icon", href: "/eagle-favicon-v3.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/eagle-apple-touch-icon-v3.png" },
      { rel: "canonical", href: "https://courseflix.ca/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    captureFirstTouchAttribution();
  }, []);

  useEffect(() => {
    const onAnnouncement = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      if (typeof message === "string") setAnnouncement(message);
    };
    window.addEventListener(A11Y_ANNOUNCE_EVENT, onAnnouncement);
    return () => window.removeEventListener(A11Y_ANNOUNCE_EVENT, onAnnouncement);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SoundProvider>
          <CourseUIProvider>
            <BrandIntro />
            <NetworkStatusBanner />
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {announcement}
            </p>
            <Outlet />
            <CommandPalette />
            <CoursePreviewModal />
            <CompareDrawer />
            <StudyEagle />
            <Toaster position="top-center" />
          </CourseUIProvider>
        </SoundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
