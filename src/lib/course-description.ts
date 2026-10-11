import { useEffect, useState } from "react";

// Course descriptions are ~65% of the catalog's size, so they live in their own
// chunk and load only where a description is shown.
type Descriptions = Record<string, string>;

let cache: Descriptions | undefined;
let pending: Promise<Descriptions> | undefined;

export function loadDescriptions(): Promise<Descriptions> {
  if (cache) return Promise.resolve(cache);
  pending ??= import("./course-descriptions")
    .then((m) => (cache = m.DESCRIPTIONS))
    .catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
  return pending;
}

/** Descriptions if they have already loaded, without triggering a load. */
export function peekDescriptions(): Descriptions | undefined {
  return cache;
}

/**
 * Descriptions once loaded. Starts undefined on every first render so server
 * and client markup match during hydration.
 */
export function useDescriptions(enabled = true): Descriptions | undefined {
  const [descriptions, setDescriptions] = useState<Descriptions | undefined>(undefined);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadDescriptions()
      .then((loaded) => {
        if (live) setDescriptions(loaded);
      })
      .catch(() => {
        // Descriptions are supplementary; the UI works without them.
      });
    return () => {
      live = false;
    };
  }, [enabled]);
  return descriptions;
}

export function useCourseDescription(code: string | undefined): string | undefined {
  const descriptions = useDescriptions(Boolean(code));
  return code ? descriptions?.[code] : undefined;
}
