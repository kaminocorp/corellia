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
