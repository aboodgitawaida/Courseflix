import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";

// Cloudflare Turnstile on the email sign-in and sign-up form, so one script can't
// create thousands of fake accounts. Google sign-in doesn't need it.
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "dark" | "light" | "auto";
      size?: "normal" | "flexible" | "compact";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing"));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * Renders the check and reports a fresh token, or null when it expires or fails.
 * Tokens work once: remount it (change its `key`) after every sign-in attempt.
 */
export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const siteKey = TURNSTILE_SITE_KEY;
    if (!siteKey) return;
    let cancelled = false;
    let widgetId: string | undefined;
    loadTurnstile()
      .then((api) => {
        const container = containerRef.current;
        if (cancelled || !container) return;
        widgetId = api.render(container, {
          sitekey: siteKey,
          theme: document.documentElement.classList.contains("light") ? "light" : "dark",
          size: "flexible",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widgetId !== undefined) window.turnstile?.remove(widgetId);
    };
  }, []);

  return <div ref={containerRef} className="min-h-[65px]" />;
}
