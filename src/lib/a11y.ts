export const A11Y_ANNOUNCE_EVENT = "courseflix:a11y-announce";

export function announce(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(A11Y_ANNOUNCE_EVENT, { detail: message }));
}
