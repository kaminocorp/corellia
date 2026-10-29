import { describe, expect, it } from "vitest";

import { Activation } from "./activation";

const key = (over: Partial<{ key: string; code: string; ctrlKey: boolean; metaKey: boolean; repeat: boolean }>) => ({
  key: "",
  code: "",
  ctrlKey: false,
  metaKey: false,
  repeat: false,
  ...over,
});

describe("Activation", () => {
  it("toggles with Ctrl+Space and tracks capturing", () => {
    const a = new Activation("toggle");
    expect(a.keydown(key({ code: "Space" }))).toBeNull(); // no modifier
    expect(a.keydown(key({ code: "Space", ctrlKey: true }))).toEqual({ from: "off", to: "listening" });
    expect(a.keydown(key({ code: "Space", ctrlKey: true, repeat: true }))).toBeNull();
    expect(a.setCapturing(true)).toEqual({ from: "listening", to: "capturing" });
    expect(a.setCapturing(false)).toEqual({ from: "capturing", to: "listening" });
    expect(a.keydown(key({ code: "Space", metaKey: true }))).toBeNull(); // Cmd+Space is Spotlight on macOS
    expect(a.keydown(key({ code: "Space", ctrlKey: true }))).toEqual({ from: "listening", to: "off" });
    expect(a.open).toBe(false);
  });

  it("mutes and restores", () => {
    const a = new Activation("toggle");
    a.keydown(key({ code: "Space", ctrlKey: true }));
    expect(a.keydown(key({ key: "m", ctrlKey: true }))).toEqual({ from: "listening", to: "muted" });
    expect(a.keydown(key({ code: "Space", ctrlKey: true }))).toBeNull(); // space ignored while muted
    expect(a.keydown(key({ key: "M", ctrlKey: true }))).toEqual({ from: "muted", to: "listening" });
  });

  it("push-to-talk opens on keydown and closes on keyup", () => {
    const a = new Activation("ptt");
    expect(a.keydown(key({ code: "Space", ctrlKey: true }))).toEqual({ from: "off", to: "listening" });
    expect(a.keyup({ code: "Space" })).toEqual({ from: "listening", to: "off" });
    expect(a.keyup({ code: "Space" })).toBeNull();
  });
});
