import { describe, expect, it } from "vitest";
import { ambient, request, settle, type EagleContext } from "./eagle-state";

const idle: EagleContext = { reading: false, grinding: false };
const preview: EagleContext = { reading: true, grinding: false };
const typing: EagleContext = { reading: false, grinding: true };

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

  it("drops grinding while he's being petted", () => {
    expect(request("petting", "grinding")).toBeNull();
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
    expect(ambient("reading", { reading: true, grinding: true })).toBe("grinding");
    expect(ambient("grinding", preview)).toBe("openingBook");
    expect(ambient("reading", idle)).toBe("awake");
    expect(ambient("grinding", idle)).toBe("awake");
    expect(ambient("sleeping", typing)).toBeNull(); // waking is a request, not ambient
    expect(ambient("awake", idle)).toBeNull();
  });
});
