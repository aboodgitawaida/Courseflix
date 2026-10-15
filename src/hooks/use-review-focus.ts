import { useEffect, useState } from "react";

/** Review text boxes the eagle writes along with (see RatingSection and the reviews page). */
const REVIEW_BOX = "[data-eagle-review]";

/**
 * True while a review text box has focus. Listens for focus moving in and out
 * of the page instead of wiring every form, and only re-renders on change.
 */
export function useReviewFocus(enabled: boolean) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setFocused(false);
      return;
    }
    const update = () =>
      setFocused(!!(document.activeElement as Element | null)?.closest?.(REVIEW_BOX));
    update();
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, [enabled]);

  return focused;
}
