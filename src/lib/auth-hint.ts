export const AUTH_HINT_KEY = "courseflix.auth.hint";
export const AUTH_HINT_CLASS = "auth-hint";
export const RETURNING_CLASS = "returning";
export const APP_READY_CLASS = "app-ready";

/**
 * Server HTML is always built as if for a first-time, signed-out visitor, so for
 * returning visitors (saved program or auth hint) the page would visibly change once
 * the client restores their session and program. This marks them as returning so CSS
 * can keep the page hidden until <AppReadyGate> reports the app is ready; the timer
 * reveals it regardless if anything stalls, so the page can never stay hidden.
 */
export const RETURNING_HEAD_SCRIPT = (majorKey: string) =>
  `try{var l=localStorage;if(l.getItem("${AUTH_HINT_KEY}")||l.getItem("${majorKey}")){var e=document.documentElement;e.classList.add("${RETURNING_CLASS}");setTimeout(function(){e.classList.add("${APP_READY_CLASS}")},1500)}}catch(e){}`;

/** What we remember about the signed-in user so the first paint can show them. */
export type AuthHint = { u: string; a: string; n: string };

/**
 * Runs in <head> before first paint. The server can't know who is signed in, so the
 * top bar's HTML contains both a "Sign in" button and an account skeleton; this marks
 * <html> when a previous visit left a hint, and CSS then shows the skeleton (with the
 * remembered avatar and name) instead of the button. Anything unexpected is ignored.
 */
export const AUTH_HINT_HEAD_SCRIPT = `try{var h=JSON.parse(localStorage.getItem("${AUTH_HINT_KEY}")||"null"),a=h&&h.a;if(typeof a==="string"&&(a.indexOf("data:image/")===0||a.charAt(0)==="/")){var r=document.documentElement;r.classList.add("${AUTH_HINT_CLASS}");r.style.setProperty("--auth-avatar","url("+JSON.stringify(a)+")");r.style.setProperty("--auth-name",JSON.stringify(String(h.n||"").slice(0,40)))}}catch(e){}`;

export function readAuthHint(userId?: string): AuthHint | null {
  try {
    const raw = window.localStorage.getItem(AUTH_HINT_KEY);
    const hint = raw ? (JSON.parse(raw) as Partial<AuthHint>) : null;
    if (!hint || typeof hint.a !== "string" || typeof hint.u !== "string") return null;
    if (userId && hint.u !== userId) return null;
    return { u: hint.u, a: hint.a, n: typeof hint.n === "string" ? hint.n : "" };
  } catch {
    return null;
  }
}

export function writeAuthHint(hint: AuthHint) {
  try {
    const prev = readAuthHint();
    if (prev && prev.u === hint.u && prev.a === hint.a && prev.n === hint.n) return;
    window.localStorage.setItem(AUTH_HINT_KEY, JSON.stringify(hint));
  } catch {
    // Storage can be blocked; the hint is only an optimisation.
  }
}

export function clearAuthHint() {
  try {
    window.localStorage.removeItem(AUTH_HINT_KEY);
  } catch {
    // ignore
  }
}
