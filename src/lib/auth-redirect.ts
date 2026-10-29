const ORIGIN = "https://courseflix.invalid";

const isUnsafeChar = (ch: string) =>
  ch === "\\" || ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127;

/**
 * The page to return to after signing in. Only same-site paths are allowed, so a
 * crafted `?redirect=` link can't send someone to another site. Browsers strip tabs
 * and newlines from URLs ("/\t/evil.com" becomes "//evil.com"), so control
 * characters are rejected, and the path must still resolve to this site.
 */
export function safeAuthRedirect(path?: string) {
  if (!path || !path.startsWith("/") || [...path].some(isUnsafeChar)) return "/";
  try {
    return new URL(path, ORIGIN).origin === ORIGIN ? path : "/";
  } catch {
    return "/";
  }
}
