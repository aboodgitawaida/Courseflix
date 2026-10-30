import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true afterwards (and straight away on
 * client-side navigations). Use it to hold back data that the server could not have
 * rendered, so the first browser render matches the server HTML.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
