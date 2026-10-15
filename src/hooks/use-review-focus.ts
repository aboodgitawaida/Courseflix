import { useEffect, useState } from "react";

/** Rating forms the eagle writes along with (see RatingSection and the reviews page). */
const REVIEW_FORM = "[data-eagle-review]";

/**
 * True while the user is rating a course: from the moment they click or tab
 * into a rating form (stars, sliders, prof, comment) until they click or tab
 * somewhere else, or the form closes. Clicks count as well as focus because
 * Safari doesn't focus buttons (the stars) on click. Only re-renders on change.
 */
export function useReviewFocus(enabled: boolean) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }
    let form: Element | null = null;
    let closedCheck = 0;
    const set = (next: Element | null) => {
      form = next;
      setActive(!!next);
      window.clearInterval(closedCheck);
      // The form unmounts on save or cancel without any event reaching us.
      if (next) {
        closedCheck = window.setInterval(() => {
          if (form && !form.isConnected) set(null);
        }, 1_000);
      }
    };
    const onEvent = (event: Event) =>
      set((event.target as Element | null)?.closest?.(REVIEW_FORM) ?? null);
    set(document.activeElement?.closest?.(REVIEW_FORM) ?? null);
    document.addEventListener("focusin", onEvent);
    document.addEventListener("pointerdown", onEvent, { passive: true });
    return () => {
      window.clearInterval(closedCheck);
      document.removeEventListener("focusin", onEvent);
      document.removeEventListener("pointerdown", onEvent);
    };
  }, [enabled]);

  return active;
}
