import { useEffect, useRef } from "react";
import {
  AWAY_BACK_AFTER_MS,
  LATE_LONG_AFTER_MIN,
  MANY_PREVIEWS,
  arrival,
  canSpeak,
  lateness,
  loadMemory,
  nextBreakMilestone,
  recordSpoken,
  recordVisit,
  saveMemory,
  type Arrival,
} from "@/lib/eagle-companion";
import { pickEagleLine, takeLateNightLine } from "@/lib/study-eagle";

type Options = {
  /** The eagle is on and showing (not turned off, not tucked away on a phone). */
  active: boolean;
  /** True while he shouldn't interrupt: chat open, dragging, asleep, mid-reaction. */
  isBusy: () => boolean;
  /** Show a line in his status bubble. */
  say: (line: string) => void;
};

const ARRIVAL_DELAY_MS = 4_000;
const CHECK_EVERY_MS = 60_000;

function welcomeLine(a: NonNullable<Arrival>): string | null {
  switch (a.kind) {
    case "first":
      return pickEagleLine("welcomeFirst");
    case "later":
      return pickEagleLine("welcomeLater");
    case "tomorrow":
      return pickEagleLine("welcomeTomorrow");
    case "streak":
      return pickEagleLine("welcomeStreak", { days: a.days });
    case "fewDays":
      return pickEagleLine("welcomeFewDays", { days: a.days });
    case "longAway":
      return pickEagleLine("welcomeLongAway", { days: a.days });
  }
}

/**
 * The Study Eagle as a companion: he greets you according to when you were last
 * here, notices late nights and long sessions, and welcomes you back to the tab.
 * Unprompted lines are capped per day and spaced out (see eagle-companion.ts).
 * Returns noteBrowse, which the eagle calls for every course preview you open; he
 * mentions it at the next quiet moment, once the chat panel is closed.
 */
export function useEagleCompanion({ active, isBusy, say }: Options) {
  const options = useRef({ isBusy, say });
  options.current = { isBusy, say };
  const previews = useRef(new Set<string>());
  const previewsSaid = useRef(false);
  const lateLongSaid = useRef(false);
  const breaksSaid = useRef<number[]>([]);
  const startedAt = useRef(Date.now());

  /** Say a line if the cap, the gap and what he's doing allow it. */
  function speak(pick: () => string | null): boolean {
    if (options.current.isBusy()) return false;
    const now = new Date();
    const memory = loadMemory();
    if (!canSpeak(memory, now)) return false;
    const line = pick();
    if (!line) return false;
    options.current.say(line);
    saveMemory(recordSpoken(loadMemory(), now));
    return true;
  }

  // Arrival: late nights first, otherwise a greeting for how long you were away.
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      const now = new Date();
      const memory = loadMemory();
      const visit = arrival(memory, now);
      saveMemory(recordVisit(memory, now));
      const late = lateness(now.getHours());
      if (late === "late") {
        speak(takeLateNightLine);
        return;
      }
      if (late === "gettingLate") {
        speak(() => pickEagleLine("gettingLate"));
        return;
      }
      if (visit) speak(() => welcomeLine(visit));
    }, ARRIVAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  // Every minute: still up late, or a long stretch without a break.
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      const minutes = (Date.now() - startedAt.current) / 60_000;
      if (
        !lateLongSaid.current &&
        lateness(new Date().getHours()) === "late" &&
        minutes >= LATE_LONG_AFTER_MIN
      ) {
        lateLongSaid.current = speak(() => pickEagleLine("lateLong"));
        return;
      }
      if (!previewsSaid.current && previews.current.size >= MANY_PREVIEWS) {
        previewsSaid.current = speak(() =>
          pickEagleLine("manyPreviews", { count: previews.current.size }),
        );
        if (previewsSaid.current) return;
      }
      const milestone = nextBreakMilestone(minutes, breaksSaid.current);
      if (milestone !== null && speak(() => pickEagleLine("breakNudge"))) {
        breaksSaid.current = [...breaksSaid.current, milestone];
      }
    }, CHECK_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [active]);

  // Back to the tab after a while away.
  useEffect(() => {
    if (!active) return;
    let hiddenAt: number | null = null;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      if (away >= AWAY_BACK_AFTER_MS) speak(() => pickEagleLine("awayBack"));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [active]);

  return {
    /** A course preview was opened. After a lot of them he comments, once per sitting. */
    noteBrowse(code: string) {
      previews.current.add(code);
    },
  };
}
