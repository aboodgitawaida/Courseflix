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
import { CourseUIProvider } from "@/hooks/use-course-ui";
import { SoundProvider } from "@/hooks/use-sound";
import { ThemeProvider } from "@/hooks/use-theme";
import { CommandPalette } from "@/components/CommandPalette";
import { CoursePreviewModal } from "@/components/CoursePreviewModal";
import { CompareDrawer } from "@/components/CompareDrawer";
import { StudyEagle } from "@/components/StudyEagle";
import { ProgramPickerSheet } from "@/components/ProgramPicker";
import { MajorProfileSync } from "@/components/MajorProfileSync";
import { INTRO_HEAD_SCRIPT } from "@/lib/intro";
import { NetworkStatusBanner } from "@/components/NetworkStatusBanner";
import { MobileTabBar } from "@/components/MobileTabBar";
import { InstallPrompt } from "@/components/InstallPrompt";
import { supabase } from "@/integrations/supabase/client";
import { captureFirstTouchAttribution } from "@/lib/attribution";
import { inject as injectAnalytics } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { A11Y_ANNOUNCE_EVENT } from "@/lib/a11y";

const TERMS_NOTICE_ENABLED = false;

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden="true"
        className="mesh-blob left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 bg-brand/20"
      />
      <div className="relative max-w-xl text-center">
        <h1 className="text-outline font-mega text-[34vw] font-black leading-[0.8] md:text-[14rem]">
          404
        </h1>
        <h2 className="mt-2 font-mega text-3xl font-extrabold md:text-4xl">
          This episode{" "}
          <span className="font-serif-accent text-gradient-brand text-[1.15em]">
            doesn't exist.
          </span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="shine inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition-colors hover:bg-brand-glow"
          >
            Back to browsing
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
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Courseflix" },
      { name: "theme-color", content: "#060607" },
      { property: "og:url", content: "https://www.courseflix.ca/" },
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
      { name: "twitter:url", content: "https://www.courseflix.ca/" },
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
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter+Tight:wght@400;500;600;700;800;900&family=Unbounded:wght@500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap",
      },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/eagle-favicon-v4-32x32.png" },
      { rel: "shortcut icon", type: "image/x-icon", href: "/eagle-favicon-v4.ico" },
      { rel: "icon", type: "image/x-icon", href: "/eagle-favicon-v4.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/eagle-apple-touch-icon-v4.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "canonical", href: "https://www.courseflix.ca/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    // The intro script may add a class to <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_HEAD_SCRIPT }} />
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
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    captureFirstTouchAttribution();
    // Cookieless page-view and web-vitals tracking; no-ops outside Vercel.
    injectAnalytics();
    injectSpeedInsights();
    if (TERMS_NOTICE_ENABLED) {
      setTermsAccepted(window.localStorage.getItem("courseflix-terms-accepted") === "2026-10-01");
    } else {
      setTermsAccepted(true);
    }
  }, []);

  function acceptTerms() {
    window.localStorage.setItem("courseflix-terms-accepted", "2026-10-01");
    setTermsAccepted(true);
  }

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
            <NetworkStatusBanner />
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {announcement}
            </p>
            <Outlet />
            <CommandPalette />
            <CoursePreviewModal />
            <ProgramPickerSheet />
            <MajorProfileSync />
            <CompareDrawer />
            <StudyEagle />
            <MobileTabBar />
            <InstallPrompt />
            <Toaster position="top-center" />
            {termsAccepted === false && (
              <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
                <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="terms-notice-title"
                  className="max-h-[min(720px,90vh)] w-full max-w-lg overflow-y-auto rounded-2xl border border-brand/40 bg-surface p-6 shadow-2xl"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                    Before you continue
                  </p>
                  <h1 id="terms-notice-title" className="mt-2 font-display text-3xl font-black">
                    Welcome to Courseflix
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Please review and accept our{" "}
                    <Link to="/terms" className="font-semibold text-brand hover:underline">
                      Terms of Use
                    </Link>{" "}
                    before using the site.
                  </p>
                  <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm leading-6 text-foreground/85">
                    Course ratings shown before student reviews are predictions, not verified
                    experiences. As student reviews are submitted, review-based values replace or
                    supplement those estimates. Always confirm official course information before
                    making academic decisions.
                  </div>
                  <button
                    type="button"
                    onClick={acceptTerms}
                    className="mt-6 w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-brand-glow"
                  >
                    I agree and continue
                  </button>
                </section>
              </div>
            )}
          </CourseUIProvider>
        </SoundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
