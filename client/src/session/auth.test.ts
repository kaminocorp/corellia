import { afterEach, describe, expect, it } from "vitest";

import { authHeaders, deviceToken, resetDeviceTokenCache, withToken } from "./auth";

describe("device token", () => {
  afterEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    resetDeviceTokenCache();
  });

  it("is absent by default", () => {
    expect(deviceToken()).toBeNull();
    expect(authHeaders()).toEqual({});
    expect(withToken("/api/events")).toBe("/api/events");
  });

  it("is taken from the URL once and persisted", () => {
    window.history.replaceState({}, "", "/?token=abc123");
    expect(deviceToken()).toBe("abc123");
    expect(authHeaders()).toEqual({ Authorization: "Bearer abc123" });
    expect(withToken("/api/events?x=1")).toBe("/api/events?x=1&token=abc123");
    window.history.replaceState({}, "", "/");
    resetDeviceTokenCache();
    expect(deviceToken()).toBe("abc123");
  });
});
