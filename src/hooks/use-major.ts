import { useEffect, useState } from "react";

const KEY = "courseflix.major";

export function useMajor() {
  const [major, setMajorState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setMajorState(localStorage.getItem(KEY));
    } catch {}
    setHydrated(true);
  }, []);

  const setMajor = (id: string | null) => {
    setMajorState(id);
    try {
      if (id) localStorage.setItem(KEY, id);
      else localStorage.removeItem(KEY);
    } catch {}
  };

  return { major, setMajor, hydrated };
}
