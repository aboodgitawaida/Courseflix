import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

export type HomeSection = "browse" | "creator";

/**
 * Scroll-spy for the home page: the page is one line, Browse is its start and Creator takes over once
 * the #creator section's top crosses 40% of the viewport. Always "browse" off the home page.
 */
export function useHomeSection(): HomeSection {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [section, setSection] = useState<HomeSection>("browse");

  useEffect(() => {
    if (pathname !== "/") {
      setSection("browse");
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = document.getElementById("creator");
      const top = el?.getBoundingClientRect().top ?? Infinity;
      setSection(top < window.innerHeight * 0.4 ? "creator" : "browse");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return section;
}

/** Smooth-scrolls to a point on the home page, navigating there first when needed. */
export function useGoToHomeSection() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  return useCallback(
    (section: HomeSection, e?: React.MouseEvent) => {
      if (section === "browse") {
        // Off the home page a normal navigation already lands at the top.
        if (pathname !== "/") return;
        e?.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      e?.preventDefault();
      // The section mounts after the major hydrates, so retry briefly until it exists.
      const go = (tries = 0) => {
        const el = document.getElementById("creator");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else if (tries < 20) window.setTimeout(() => go(tries + 1), 100);
      };
      if (pathname === "/") go();
      else void navigate({ to: "/" }).then(() => go());
    },
    [pathname, navigate],
  );
}
