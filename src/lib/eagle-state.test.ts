import { describe, expect, it } from "vitest";
import {
  MODE_DURATION_MS,
  PET_SPAM_COUNT,
  PET_WARN_COUNT,
  PET_SPAM_WINDOW_MS,
  ambient,
  isPetSpam,
  isPetWarning,
  recentPets,
  request,
  settle,
  type EagleContext,
} from "./eagle-state";

const idle: EagleContext = {
  reading: false,
  searching: false,
  grinding: false,
  comparing: false,
  writing: false,
  mapping: false,
};
const preview: EagleContext = {
  reading: true,
  searching: false,
  grinding: false,
  comparing: false,
  writing: false,
  mapping: false,
};
const typing: EagleContext = {
  reading: false,
  searching: false,
  grinding: true,
  comparing: false,
  writing: false,
  mapping: false,
};
const search: EagleContext = {
  reading: false,
  searching: true,
  grinding: false,
  comparing: false,
  writing: false,
  mapping: false,
};

describe("eagle state machine", () => {
  it("lets a pet interrupt ambient and scripted states", () => {
    expect(request("awake", "petting")?.mode).toBe("petting");
    expect(request("reading", "petting")?.mode).toBe("petting");
    expect(request("grinding", "petting")?.mode).toBe("petting");
  });

  it("never cuts a celebration short", () => {
    expect(request("celebrating", "petting")).toBeNull();
    expect(request("celebrating", "grinding")).toBeNull();
    expect(request("petting", "celebrating")?.mode).toBe("celebrating");
    expect(request("celebrating", "celebrating")?.mode).toBe("celebrating"); // restarts
  });

  it("treats the achievement trophy like a celebration", () => {
    expect(request("trophy", "petting")).toBeNull();
    expect(request("trophy", "grinding")).toBeNull();
    expect(request("petting", "trophy")?.mode).toBe("trophy");
    expect(request("awake", "trophy")?.mode).toBe("trophy");
    expect(request("sleeping", "trophy")).toEqual({ mode: "wakingUp", queued: "trophy" });
    expect(request("startled", "trophy")).toEqual({ mode: "startled", queued: "trophy" });
    expect(settle("trophy", idle)).toBe("awake");
    expect(settle("trophy", typing)).toBe("grinding");
    expect(settle("wakingUp", idle, "trophy")).toBe("trophy");
    expect(MODE_DURATION_MS.trophy).toBe(2_000);
  });

  it("drops grinding while he's being petted", () => {
    expect(request("petting", "grinding")).toBeNull();
  });

  it("ignores pets while annoyed, but a celebration can still cut in", () => {
    expect(request("petting", "annoyed")?.mode).toBe("annoyed");
    expect(request("awake", "annoyed")?.mode).toBe("annoyed");
    expect(request("annoyed", "petting")).toBeNull();
    expect(request("annoyed", "trophy")?.mode).toBe("trophy");
    expect(request("annoyed", "celebrating")?.mode).toBe("celebrating");
    expect(settle("annoyed", idle)).toBe("awake");
    expect(settle("annoyed", typing)).toBe("grinding");
    expect(MODE_DURATION_MS.annoyed).toBe(1_200);
  });

  it("wakes up first, and a pet only wakes him", () => {
    expect(request("sleeping", "petting")).toEqual({ mode: "startled" });
    expect(request("sleeping", "wakingUp")).toEqual({ mode: "wakingUp" });
    expect(request("fallingAsleep", "celebrating")).toEqual({
      mode: "wakingUp",
      queued: "celebrating",
    });
    expect(request("sleeping", "grinding")).toEqual({ mode: "wakingUp", queued: "grinding" });
  });

  it("queues a celebration that arrives mid-wake-up", () => {
    expect(request("startled", "celebrating")).toEqual({
      mode: "startled",
      queued: "celebrating",
    });
    expect(request("wakingUp", "celebrating")).toEqual({
      mode: "wakingUp",
      queued: "celebrating",
    });
  });

  it("settles back into whatever the context calls for", () => {
    expect(settle("petting", idle)).toBe("awake");
    expect(settle("petting", preview)).toBe("openingBook");
    expect(settle("celebrating", typing)).toBe("grinding");
    expect(settle("wakingUp", idle, "celebrating")).toBe("celebrating");
    expect(settle("fallingAsleep", preview)).toBe("sleeping");
    expect(settle("openingBook", preview)).toBe("reading");
  });

  it("starts and stops reading and grinding from idle", () => {
    expect(ambient("awake", preview)).toBe("openingBook");
    expect(ambient("awake", typing)).toBe("grinding");
    expect(
      ambient("reading", {
        reading: true,
        searching: false,
        grinding: true,
        comparing: false,
        writing: false,
        mapping: false,
      }),
    ).toBe("closingBook");
    expect(ambient("grinding", preview)).toBe("closingNotepad");
    expect(ambient("reading", idle)).toBe("closingBook");
    expect(ambient("grinding", idle)).toBe("closingNotepad");
    expect(ambient("sleeping", typing)).toBeNull(); // waking is a request, not ambient
    expect(ambient("awake", idle)).toBeNull();
  });

  it("searches through the magnifying glass while search is open", () => {
    expect(ambient("awake", search)).toBe("openingGlass");
    expect(settle("openingGlass", search)).toBe("searching");
    // typing in the search box is searching, not cramming
    expect(ambient("searching", { ...search, grinding: true })).toBeNull();
    expect(ambient("searching", idle)).toBe("closingGlass");
    expect(ambient("reading", { ...preview, searching: true })).toBe("closingBook");
    expect(settle("openingGlass", idle)).toBe("awake"); // search closed mid-animation
  });

  it("weighs courses on a scale while two or more are being compared", () => {
    const compare = { ...idle, comparing: true };
    expect(ambient("awake", compare)).toBe("openingScale");
    expect(settle("openingScale", compare)).toBe("weighing");
    expect(ambient("weighing", idle)).toBe("closingScale");
    // a preview or search opened from the drawer takes over, and he comes back after
    expect(ambient("weighing", { ...compare, reading: true })).toBe("closingScale");
    expect(ambient("reading", compare)).toBe("closingBook");
  });

  it("writes with a quill while the review box has focus", () => {
    const writing = { ...idle, writing: true };
    expect(ambient("awake", writing)).toBe("openingQuill");
    expect(settle("openingQuill", writing)).toBe("writing");
    // typing a review is writing, not cramming
    expect(ambient("writing", { ...writing, grinding: true })).toBeNull();
    expect(ambient("writing", { ...preview })).toBe("closingQuill");
    expect(ambient("writing", idle)).toBe("closingQuill");
  });

  it("powers up into gold without being cut short by a pet", () => {
    expect(request("awake", "golden")?.mode).toBe("golden");
    expect(request("reading", "golden")?.mode).toBe("golden");
    expect(request("golden", "petting")).toBeNull();
    expect(request("golden", "celebrating")?.mode).toBe("celebrating");
    // asleep: wakes up first, then powers up
    expect(request("sleeping", "golden")).toEqual({ mode: "wakingUp", queued: "golden" });
    expect(settle("wakingUp", idle, "golden")).toBe("golden");
    expect(settle("golden", idle)).toBe("awake");
    expect(settle("golden", preview)).toBe("openingBook");
    expect(MODE_DURATION_MS.golden).toBe(2_000);
  });

  it("studies a map while the prerequisite map is on screen", () => {
    const map = { ...idle, mapping: true };
    expect(ambient("awake", map)).toBe("openingMap");
    expect(settle("openingMap", map)).toBe("mapping");
    expect(ambient("mapping", map)).toBeNull();
    expect(ambient("mapping", idle)).toBe("closingMap");
    expect(settle("closingMap", idle)).toBe("awake");
    // the map wins over the book (a course page also counts as reading) ...
    expect(ambient("awake", { ...map, reading: true })).toBe("openingMap");
    expect(ambient("reading", { ...map, reading: true })).toBe("closingBook");
    expect(settle("closingBook", { ...map, reading: true })).toBe("openingMap");
    // ... but searching and writing a review still win over the map
    expect(ambient("awake", { ...map, searching: true })).toBe("openingGlass");
    expect(ambient("awake", { ...map, writing: true })).toBe("openingQuill");
    // scrolling past the map puts it away and goes back to the book
    expect(ambient("mapping", { ...idle, reading: true })).toBe("closingMap");
    expect(settle("closingMap", { ...idle, reading: true })).toBe("openingBook");
  });

  it("puts a prop away before going idle or taking out the next one", () => {
    expect(ambient("reading", idle)).toBe("closingBook");
    expect(settle("closingBook", idle)).toBe("awake");
    // from the compare scale straight to a preview: scale away, then the book out
    expect(ambient("weighing", { ...idle, comparing: true, reading: true })).toBe("closingScale");
    expect(settle("closingScale", { ...idle, comparing: true, reading: true })).toBe("openingBook");
    // a prop taken out mid-put-away is just taken out again afterwards
    expect(ambient("closingBook", preview)).toBeNull();
    expect(settle("closingBook", preview)).toBe("openingBook");
    // still wanted: nothing changes
    expect(ambient("reading", preview)).toBeNull();
    expect(ambient("openingBook", preview)).toBeNull();
    expect(ambient("grinding", typing)).toBeNull();
  });
});

describe("pet spam", () => {
  it("only counts pets inside the window", () => {
    let times: number[] = [];
    for (let i = 0; i < PET_SPAM_COUNT - 1; i++) times = recentPets(times, i * 500);
    expect(isPetSpam(times)).toBe(false);
    expect(isPetSpam(recentPets(times, (PET_SPAM_COUNT - 1) * 500))).toBe(true);
  });

  it("forgets slow petting", () => {
    let times: number[] = [];
    for (let i = 0; i < 30; i++) times = recentPets(times, i * (PET_SPAM_WINDOW_MS / 2 + 1_000));
    expect(isPetSpam(times)).toBe(false);
  });

  it("warns on the way to being annoyed, then stops warning", () => {
    let times: number[] = [];
    const states: boolean[] = [];
    for (let i = 0; i < PET_SPAM_COUNT; i++) {
      times = recentPets(times, i * 300);
      states.push(isPetWarning(times));
    }
    expect(states.slice(0, PET_WARN_COUNT - 1).every((x) => !x)).toBe(true);
    expect(states[PET_WARN_COUNT - 1]).toBe(true);
    expect(states[PET_SPAM_COUNT - 1]).toBe(false); // the sulk takes over
  });
});
