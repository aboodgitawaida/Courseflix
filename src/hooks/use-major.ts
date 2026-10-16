import { useEffect, useState } from "react";

const KEY = "courseflix.major";
const EVENT = "courseflix:major";

/** Saves the selected program outside React (e.g. from a toast action). */
export function saveMajor(id: string | null) {
  try {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Keep the current in-memory preference when storage is unavailable.
  }
}

/** The saved program without subscribing to changes. */
export function readMajor(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function useMajor() {
  const [major, setMajorState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setMajorState(localStorage.getItem(KEY));
    } catch {
      // Local storage is optional; the picker remains usable in restricted contexts.
    }
    setHydrated(true);
    const sync = () => {
      try {
        setMajorState(localStorage.getItem(KEY));
      } catch {
        // Keep the current in-memory preference when storage is unavailable.
      }
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMajor = (id: string | null) => {
    setMajorState(id);
    saveMajor(id);
  };

  return { major, setMajor, hydrated };
}
