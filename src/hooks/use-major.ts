import { useEffect, useState } from "react";

const KEY = "courseflix.major";
const EVENT = "courseflix:major";

export function useMajor() {
  const [major, setMajorState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setMajorState(localStorage.getItem(KEY));
    } catch {}
    setHydrated(true);
    const sync = () => {
      try {
        setMajorState(localStorage.getItem(KEY));
      } catch {}
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
    try {
      if (id) localStorage.setItem(KEY, id);
      else localStorage.removeItem(KEY);
      window.dispatchEvent(new Event(EVENT));
    } catch {}
  };

  return { major, setMajor, hydrated };
}
