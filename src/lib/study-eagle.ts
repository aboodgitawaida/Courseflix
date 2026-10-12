/**
 * Ask the Study Eagle to celebrate: a wing-flap and a short line in its status
 * bubble. Safe to call anywhere; it does nothing on the server or when the
 * eagle is turned off (nothing is listening).
 */
export function celebrateEagle(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("study-eagle-celebrate", { detail: { message } }));
}
