import { useCallback, useEffect, useRef, useState } from "react";

/** Milliseconds per word for the eagle's streamed summaries. */
export const TYPEWRITER_MS_PER_WORD = 36;
/** Extra pause after a comma and after the end of a sentence, like talking. */
const PAUSE_MS = { comma: 120, sentence: 260 };

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** When each word appears, in ms from the start. */
export function wordTimes(words: string[], msPerWord = TYPEWRITER_MS_PER_WORD) {
  const times: number[] = [];
  let t = 0;
  for (const word of words) {
    times.push(t);
    t += msPerWord;
    if (/[.!?:]["')]?$/.test(word)) t += PAUSE_MS.sentence;
    else if (/[,;]$/.test(word)) t += PAUSE_MS.comma;
  }
  return times;
}

/**
 * Reveal `text` word by word, pausing a beat at commas and full stops. A new
 * `runKey` starts over from the first word; a changed `text` with the same key
 * keeps going from where it was (say, when review stats arrive mid-stream).
 * Only the word count is state, and it changes once per new word.
 * Reduced motion shows everything at once.
 */
export function useTypewriter(text: string, runKey: unknown, msPerWord = TYPEWRITER_MS_PER_WORD) {
  const words = text.split(/\s+/).filter(Boolean);
  const total = words.length;
  const [shownWords, setShownWords] = useState(() => (prefersReducedMotion() ? Infinity : 0));
  const start = useRef(0);
  const times = useRef<number[]>([]);
  times.current = wordTimes(words, msPerWord);

  useEffect(() => {
    setShownWords(prefersReducedMotion() ? Infinity : 0);
    start.current = performance.now();
  }, [runKey]);

  const done = shownWords >= total;

  useEffect(() => {
    if (done) return;
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start.current;
      const t = times.current;
      let next = 0;
      while (next < t.length && t[next] <= elapsed) next += 1;
      setShownWords((current) => (next > current ? next : current));
      if (next < t.length) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [done, runKey, text]);

  const skip = useCallback(() => setShownWords(Infinity), []);

  return { words: done ? words : words.slice(0, shownWords), done, skip };
}
