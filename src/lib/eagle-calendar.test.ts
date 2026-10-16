import { describe, expect, it } from "vitest";
import { holidayEvent, weekdayEvent } from "./eagle-calendar";

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h, 0, 0);

describe("holidays", () => {
  it("knows the fixed ones", () => {
    expect(holidayEvent(at(2026, 1, 1))).toBe("holidayNewYear");
    expect(holidayEvent(at(2026, 2, 14))).toBe("holidayValentine");
    expect(holidayEvent(at(2026, 10, 31))).toBe("holidayHalloween");
    expect(holidayEvent(at(2026, 12, 24))).toBe("holidayChristmas");
    expect(holidayEvent(at(2026, 12, 25))).toBe("holidayChristmas");
    expect(holidayEvent(at(2026, 12, 31))).toBe("holidayNewYearsEve");
  });

  it("is quiet on an ordinary day", () => {
    expect(holidayEvent(at(2026, 3, 9))).toBeNull();
    expect(holidayEvent(at(2026, 12, 26))).toBeNull();
  });
});

describe("week rhythm", () => {
  it("has a mood for Monday morning, Friday afternoon, Sunday night and the weekend", () => {
    expect(weekdayEvent(at(2026, 10, 12, 9))).toBe("dayMonday"); // Mon
    expect(weekdayEvent(at(2026, 10, 16, 15))).toBe("dayFriday"); // Fri
    expect(weekdayEvent(at(2026, 10, 18, 20))).toBe("daySundayNight"); // Sun
    expect(weekdayEvent(at(2026, 10, 17, 10))).toBe("dayWeekend"); // Sat
    expect(weekdayEvent(at(2026, 10, 18, 10))).toBe("dayWeekend"); // Sun morning
  });

  it("says nothing the rest of the week", () => {
    expect(weekdayEvent(at(2026, 10, 12, 15))).toBeNull(); // Mon afternoon
    expect(weekdayEvent(at(2026, 10, 16, 9))).toBeNull(); // Fri morning
    expect(weekdayEvent(at(2026, 10, 14, 12))).toBeNull(); // Wed
  });
});
