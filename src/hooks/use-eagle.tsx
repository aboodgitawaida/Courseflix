import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "courseflix.eagle.enabled";

const EagleContext = createContext<{ enabled: boolean; toggleEnabled: () => void }>({
  enabled: true,
  toggleEnabled: () => {},
});

/** Whether the Study Eagle mascot is shown. On by default; remembered per device. */
export function EagleProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(window.localStorage.getItem(KEY) !== "0");
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled((on) => {
      const next = !on;
      window.localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  return (
    <EagleContext.Provider value={{ enabled, toggleEnabled }}>{children}</EagleContext.Provider>
  );
}

export const useEagle = () => useContext(EagleContext);
