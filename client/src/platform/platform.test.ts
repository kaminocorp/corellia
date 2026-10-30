import { describe, expect, it } from "vitest";

import { browserPlatform, detectPlatform, NotImplementedError, shellPlatform } from "./index";

describe("platform adapter", () => {
  it("detects the browser and the shell stub is NotImplemented", async () => {
    expect(detectPlatform().name).toBe("browser");
    expect(browserPlatform.isKiosk()).toBe(false);
    document.documentElement.dataset.kiosk = "1";
    expect(browserPlatform.isKiosk()).toBe(true);
    delete document.documentElement.dataset.kiosk;
    await expect(shellPlatform.getMicStream()).rejects.toBeInstanceOf(NotImplementedError);
    expect(() => shellPlatform.heartbeat()).toThrow(NotImplementedError);
  });
});
