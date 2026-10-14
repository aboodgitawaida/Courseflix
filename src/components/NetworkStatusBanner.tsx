import { useEffect, useState } from "react";

export function NetworkStatusBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!window.navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[var(--z-toast)] border-b border-amber-400/30 bg-amber-950/95 px-4 py-2 text-center text-xs font-medium text-amber-100 backdrop-blur-xl"
    >
      You’re offline. Changes may not save until your connection returns.
    </div>
  );
}
