import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const DISMISS_KEY = "courseflix.install.dismissed";
const VISITS_KEY = "courseflix.visits";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable in privacy-restricted browsers.
  }
}

/** Nudges returning phone users to add Courseflix to their home screen. */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"android" | "ios" | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || read(DISMISS_KEY)) return;

    const visits = Number(read(VISITS_KEY) ?? "0") + 1;
    write(VISITS_KEY, String(visits));
    if (visits < 2) return;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    const isMobile = window.matchMedia?.("(max-width: 1023px)").matches;
    if (isIOS && isMobile) {
      const t = window.setTimeout(() => setMode("ios"), 4000);
      return () => window.clearTimeout(t);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (isMobile) setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    write(DISMISS_KEY, "1");
    setMode(null);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
    dismiss();
  }

  if (!mode) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Courseflix"
      className="above-tabbar glass fixed inset-x-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-3xl bg-background/90 p-3 pl-4 shadow-2xl shadow-black/60 animate-fade-in-up lg:hidden"
    >
      <img src="/icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Get the Courseflix app</p>
        {mode === "ios" ? (
          <p className="text-xs text-muted-foreground">
            Tap <Share className="inline h-3.5 w-3.5 align-[-2px]" /> then “Add to Home Screen”.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Opens full-screen, right from your home screen.
          </p>
        )}
      </div>
      {mode === "android" && (
        <button
          type="button"
          onClick={() => void install()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          <Download className="h-3.5 w-3.5" /> Install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
