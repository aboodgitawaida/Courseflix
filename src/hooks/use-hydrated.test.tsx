// @vitest-environment jsdom

import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { useHydrated } from "./use-hydrated";

function Probe() {
  return <span>{useHydrated() ? "browser" : "server"}</span>;
}

describe("useHydrated", () => {
  it("is false on the server", () => {
    expect(renderToString(<Probe />)).toContain("server");
  });

  it("hydrates without a mismatch, then flips to true", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Probe />);
    const onRecoverableError = vi.fn();

    await act(async () => {
      hydrateRoot(container, <Probe />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toBe("browser");
  });
});
