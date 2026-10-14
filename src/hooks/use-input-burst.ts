import { useEffect, useState } from "react";

/** Keystrokes or clicks within BURST_WINDOW_MS that count as cramming. */
export const BURST_COUNT = 8;
export const BURST_WINDOW_MS = 3_000;
/** How long after the last input the burst ends. */
export const BURST_IDLE_MS = 4_000;

/** Clicks and keys on the eagle itself (pets, chat) are not studying. */
const IGNORE = ".study-eagle, .study-eagle-tuck, .study-eagle-panel";

/**
 * True while the user is typing or clicking fast: BURST_COUNT inputs within
 * BURST_WINDOW_MS starts it, BURST_IDLE_MS without input ends it. Input times
 * live in a ref'd ring buffer, so this re-renders only when the burst starts or
 * ends, never per keystroke.
 */
export function useInputBurst(enabled: boolean) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }
    const times = new Array<number>(BURST_COUNT).fill(-Infinity);
    let next = 0;
    let on = false;
    let idleTimer = 0;

    const onInput = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (
          event.repeat ||
          ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(event.key)
        ) {
          return;
        }
      }
      if ((event.target as Element | null)?.closest?.(IGNORE)) return;
      const now = performance.now();
      times[next] = now;
      next = (next + 1) % BURST_COUNT;
      // The oldest of the last BURST_COUNT inputs is the next slot to overwrite.
      if (!on && now - times[next] <= BURST_WINDOW_MS) {
        on = true;
        setActive(true);
      }
      if (on) {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          on = false;
          times.fill(-Infinity);
          setActive(false);
        }, BURST_IDLE_MS);
      }
    };

    window.addEventListener("keydown", onInput, { capture: true, passive: true });
    window.addEventListener("pointerdown", onInput, { capture: true, passive: true });
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("keydown", onInput, { capture: true });
      window.removeEventListener("pointerdown", onInput, { capture: true });
    };
  }, [enabled]);

  return active;
}
