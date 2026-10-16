import type { EagleLineEvent } from "@/lib/eagle-lines";

/**
 * What's going on in the world today, as far as a calendar can tell him: fixed
 * holidays and the rhythm of the week. No outside services, so nothing is sent
 * anywhere and nothing about UTM's own term dates is guessed at.
 */

/** A holiday today, as the line pool he draws from, or null. */
export function holidayEvent(date: Date): EagleLineEvent | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 1 && day === 1) return "holidayNewYear";
  if (month === 2 && day === 14) return "holidayValentine";
  if (month === 10 && day === 31) return "holidayHalloween";
  if (month === 12 && (day === 24 || day === 25)) return "holidayChristmas";
  if (month === 12 && day === 31) return "holidayNewYearsEve";
  return null;
}

/** The mood of this part of the week (Monday morning, Friday afternoon…), or null. */
export function weekdayEvent(date: Date): EagleLineEvent | null {
  const weekday = date.getDay(); // 0 = Sunday
  const hour = date.getHours();
  if (weekday === 1 && hour < 12) return "dayMonday";
  if (weekday === 5 && hour >= 12) return "dayFriday";
  if (weekday === 0 && hour >= 17) return "daySundayNight";
  if (weekday === 6 || (weekday === 0 && hour < 17)) return "dayWeekend";
  return null;
}
