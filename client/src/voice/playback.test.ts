import { describe, expect, it, vi } from "vitest";

import { audioLevel } from "../agent3d/audio";
import { SpeechPlayer, type PlayBackend } from "./playback";

function fakeBackend() {
  const spoken: string[] = [];
  let resolveCurrent: (() => void) | null = null;
  const backend: PlayBackend = {
    speak: (t) =>
      new Promise<void>((resolve) => {
        spoken.push(t);
        resolveCurrent = resolve;
      }),
    stop: vi.fn(() => resolveCurrent?.()),
  };
  return { backend, spoken, finish: () => resolveCurrent?.() };
}

describe("SpeechPlayer", () => {
  it("plays pieces in order and reports speaking", async () => {
    const { backend, spoken, finish } = fakeBackend();
    const onSpeaking = vi.fn();
    const p = new SpeechPlayer(backend, { onSpeaking });
    p.enqueue("One.");
    p.enqueue("  ");
    p.enqueue("Two.");
    await Promise.resolve();
    expect(spoken).toEqual(["One."]);
    expect(p.isSpeaking).toBe(true);
    expect(onSpeaking).toHaveBeenLastCalledWith(true);
    finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(spoken).toEqual(["One.", "Two."]);
    finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(p.isSpeaking).toBe(false);
    expect(onSpeaking).toHaveBeenLastCalledWith(false);
  });

  it("stop clears the queue and the audio level (barge-in)", async () => {
    const { backend, spoken } = fakeBackend();
    const p = new SpeechPlayer(backend);
    p.enqueue("One.");
    p.enqueue("Two.");
    await Promise.resolve();
    audioLevel.value = 0.7;
    p.stop();
    expect(backend.stop).toHaveBeenCalled();
    expect(p.pending).toBe(0);
    expect(audioLevel.value).toBe(0);
    await Promise.resolve();
    await Promise.resolve();
    expect(spoken).toEqual(["One."]);
    expect(p.isSpeaking).toBe(false);
    p.enqueue("Three.");
    await Promise.resolve();
    expect(spoken).toEqual(["One.", "Three."]);
  });
});

describe("SpeechPlayer under barge-in and always-on use (review 2026-10-30, item 4)", () => {
  it("a piece still being fetched when stop() runs is dropped, not played late", async () => {
    let release: (() => void) | null = null;
    const played: string[] = [];
    const backend: PlayBackend = {
      speak: (t, signal) =>
        new Promise<void>((resolve) => {
          // "fetch" phase: resolves only when released; then it would play.
          release = () => {
            if (!signal?.aborted) played.push(t);
            resolve();
          };
        }),
      stop: vi.fn(),
    };
    const p = new SpeechPlayer(backend);
    p.enqueue("Stale.");
    await Promise.resolve();
    p.stop();
    release!();
    await Promise.resolve();
    await Promise.resolve();
    expect(played).toEqual([]);
    p.enqueue("Fresh.");
    await Promise.resolve();
    release!();
    await Promise.resolve();
    await Promise.resolve();
    expect(played).toEqual(["Fresh."]);
  });

  it("a piece that never ends is skipped after its deadline and the queue moves on", async () => {
    vi.useFakeTimers();
    try {
      const spoken: string[] = [];
      let wedge = true;
      const backend: PlayBackend = {
        speak: (t) =>
          new Promise<void>((resolve) => {
            spoken.push(t);
            if (!wedge) resolve();
          }),
        stop: vi.fn(),
      };
      const onError = vi.fn();
      const onSpeaking = vi.fn();
      const p = new SpeechPlayer(backend, { onError, onSpeaking, timeoutMs: () => 500 });
      p.enqueue("Wedged.");
      wedge = false;
      p.enqueue("Next.");
      await vi.advanceTimersByTimeAsync(499);
      expect(spoken).toEqual(["Wedged."]);
      await vi.advanceTimersByTimeAsync(2);
      expect(backend.stop).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("no end") }));
      expect(spoken).toEqual(["Wedged.", "Next."]);
      await vi.advanceTimersByTimeAsync(1);
      expect(p.isSpeaking).toBe(false);
      expect(onSpeaking).toHaveBeenLastCalledWith(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
