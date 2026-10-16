import { describe, expect, it } from "vitest";
import {
  BIG_SHORTLIST,
  achievementsEvent,
  countPhrase,
  friendsEvent,
  shortlistEvent,
  whoPhrase,
} from "./eagle-reactions";

describe("achievements shelf", () => {
  it("fits the reaction to how much is on it", () => {
    const base = { signedIn: true, total: 10 };
    expect(achievementsEvent({ ...base, signedIn: false, unlocked: 0 })).toBe(
      "achievementsSignedOut",
    );
    expect(achievementsEvent({ ...base, unlocked: 0 })).toBe("achievementsNone");
    expect(achievementsEvent({ ...base, unlocked: 2 })).toBe("achievementsFew");
    expect(achievementsEvent({ ...base, unlocked: 5 })).toBe("achievementsMany");
    expect(achievementsEvent({ ...base, unlocked: 9 })).toBe("achievementsMany");
    expect(achievementsEvent({ ...base, unlocked: 10 })).toBe("achievementsAll");
  });
});

describe("shortlist", () => {
  it("only speaks up for an empty or a very long list", () => {
    expect(shortlistEvent(0)).toBe("shortlistEmpty");
    expect(shortlistEvent(1)).toBeNull();
    expect(shortlistEvent(BIG_SHORTLIST - 1)).toBeNull();
    expect(shortlistEvent(BIG_SHORTLIST)).toBe("shortlistBig");
  });
});

describe("friends", () => {
  it("puts waiting requests first, then nudges an empty list", () => {
    expect(friendsEvent({ friends: 0, incoming: 2 })).toBe("friendsRequests");
    expect(friendsEvent({ friends: 4, incoming: 1 })).toBe("friendsRequests");
    expect(friendsEvent({ friends: 0, incoming: 0 })).toBe("friendsNone");
    expect(friendsEvent({ friends: 3, incoming: 0 })).toBeNull();
  });
});

describe("phrases", () => {
  it("pluralises counts", () => {
    expect(countPhrase(1, "friend request")).toBe("1 friend request");
    expect(countPhrase(3, "friend request")).toBe("3 friend requests");
    expect(countPhrase(2, "new notification")).toBe("2 new notifications");
  });

  it("names one friend, two, or several", () => {
    expect(whoPhrase(["Sam"])).toBe("Sam");
    expect(whoPhrase(["Sam", "Ali"])).toBe("Sam and Ali");
    expect(whoPhrase(["Sam", "Ali", "Noor", "Eli"])).toBe("Sam and 3 other friends");
  });
});
