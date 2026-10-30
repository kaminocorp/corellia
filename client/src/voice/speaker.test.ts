import { describe, expect, it } from "vitest";

import { kioskIsConnected, readSpeakerPreference, resolveSpeaker, SPEAKER_STORAGE_KEY, toggledPreference, writeSpeakerPreference } from "./speaker";

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, v),
  };
}

describe("speaker policy (phase 17: one voice for a Mac and the box on one backend)", () => {
  it("the kiosk always speaks; a browser yields to a connected kiosk; an explicit choice wins", () => {
    expect(resolveSpeaker({ isKiosk: true, preference: null, kioskConnected: true })).toBe("on");
    expect(resolveSpeaker({ isKiosk: false, preference: null, kioskConnected: false })).toBe("on");
    expect(resolveSpeaker({ isKiosk: false, preference: null, kioskConnected: true })).toBe("display");
    expect(resolveSpeaker({ isKiosk: false, preference: "on", kioskConnected: true })).toBe("on");
    expect(resolveSpeaker({ isKiosk: false, preference: "off", kioskConnected: false })).toBe("off");
    expect(resolveSpeaker({ isKiosk: true, preference: "off", kioskConnected: false })).toBe("off");
  });

  it("a kiosk counts as connected while its heartbeat is younger than the watchdog's threshold", () => {
    expect(kioskIsConnected(-1)).toBe(false);
    expect(kioskIsConnected(0)).toBe(true);
    expect(kioskIsConnected(89)).toBe(true);
    expect(kioskIsConnected(90)).toBe(false);
  });

  it("?quiet= sets and remembers the preference; otherwise the remembered one applies", () => {
    const st = memoryStorage();
    expect(readSpeakerPreference(new URLSearchParams(""), st)).toBeNull();
    expect(readSpeakerPreference(new URLSearchParams("quiet=1"), st)).toBe("off");
    expect(st.getItem(SPEAKER_STORAGE_KEY)).toBe("off");
    expect(readSpeakerPreference(new URLSearchParams(""), st)).toBe("off");
    expect(readSpeakerPreference(new URLSearchParams("quiet=0"), st)).toBe("on");
    expect(readSpeakerPreference(new URLSearchParams(""), st)).toBe("on");
    writeSpeakerPreference(st, null);
    expect(readSpeakerPreference(new URLSearchParams(""), st)).toBeNull();
    expect(readSpeakerPreference(new URLSearchParams("quiet=1"), null)).toBe("off");
  });

  it("Ctrl+Shift+M flips from the current state, so a display-silenced browser comes on", () => {
    expect(toggledPreference("on")).toBe("off");
    expect(toggledPreference("off")).toBe("on");
    expect(toggledPreference("display")).toBe("on");
  });
});
