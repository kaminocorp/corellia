import { describe, expect, it, vi } from "vitest";

import type { SessionEvent } from "../contract";
import type { CaptureCallbacks } from "./capture";
import { VoiceController, type VoiceDeps } from "./controller";
import type { PlayBackend } from "./playback";

function deps(over: Partial<VoiceDeps> = {}) {
  let captureCb: CaptureCallbacks | null = null;
  const capture = { start: vi.fn(), stop: vi.fn() };
  const backend: PlayBackend & { spoken: string[] } = { spoken: [], speak: async (t) => void backend.spoken.push(t), stop: vi.fn() };
  const d: VoiceDeps = {
    getMicStream: vi.fn(async () => ({}) as MediaStream),
    transcribe: vi.fn(async () => ({ text: "what time is it" })),
    synthesize: vi.fn(async () => new ArrayBuffer(0)),
    sendTurn: vi.fn(async () => ({})),
    cancelTurn: vi.fn(async () => ({})),
    fetchCapabilities: vi.fn(async () => ({ stt: "openai", tts: "openai", mode: "toggle" as const })),
    createCapture: (cb) => {
      captureCb = cb;
      return capture;
    },
    browserRecognition: () => false,
    createBrowserStt: () => ({ start: vi.fn(), stop: vi.fn() }),
    browserSynth: () => null,
    serverSynth: () => backend,
    ...over,
  };
  return { d, capture, backend, cb: () => captureCb! };
}

const ctrlSpace = () => new KeyboardEvent("keydown", { code: "Space", ctrlKey: true });
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("VoiceController", () => {
  it("opens the mic on Ctrl+Space, turns utterances into voice turns, and barges in", async () => {
    const { d, capture, backend, cb } = deps();
    const c = new VoiceController(d);
    await c.init();
    expect(c.getStatus()).toMatchObject({ stt: "openai", tts: "openai", mic: "off" });
    c.handleKeyDown(ctrlSpace());
    await flush();
    expect(d.getMicStream).toHaveBeenCalled();
    expect(capture.start).toHaveBeenCalled();
    expect(c.getStatus().mic).toBe("listening");

    // Agent is speaking a reply; the user starts talking: barge-in.
    c.setActiveTurn("t1");
    c.onStreamEvent({ type: "speech", seq: 1, ts: "x", text: "Long reply." } as SessionEvent);
    await flush();
    expect(backend.spoken).toEqual(["Long reply."]);
    cb().onSpeechStart?.();
    expect(backend.stop).toHaveBeenCalled();
    expect(d.cancelTurn).toHaveBeenCalled();
    expect(c.getStatus().mic).toBe("capturing");

    await cb().onUtterance(new Blob(["x"]), "audio/webm");
    await flush();
    expect(d.transcribe).toHaveBeenCalled();
    expect(d.sendTurn).toHaveBeenCalledWith("what time is it");
    expect(c.getStatus().mic).toBe("listening");

    c.handleKeyDown(ctrlSpace());
    await flush();
    expect(capture.stop).toHaveBeenCalled();
    expect(c.getStatus().mic).toBe("off");
  });

  it("uses browser recognition when the server has no STT", async () => {
    const stt = { start: vi.fn(), stop: vi.fn() };
    const { d } = deps({
      fetchCapabilities: async () => ({ stt: "none", tts: "none", mode: "toggle" as const }),
      browserRecognition: () => true,
      createBrowserStt: () => stt,
    });
    const c = new VoiceController(d);
    await c.init();
    await c.toggle();
    expect(stt.start).toHaveBeenCalled();
    expect(d.getMicStream).not.toHaveBeenCalled();
    await c.toggle();
    expect(stt.stop).toHaveBeenCalled();
  });

  it("reports mic errors and returns to off", async () => {
    const { d } = deps({ getMicStream: async () => { throw new Error("denied"); } });
    const c = new VoiceController(d);
    await c.init();
    await c.toggle();
    expect(c.getStatus()).toMatchObject({ mic: "off", error: "denied" });
  });

  it("stops playback when a new turn starts or the turn is cancelled", async () => {
    const { d, backend } = deps();
    const c = new VoiceController(d);
    await c.init();
    c.onStreamEvent({ type: "speech", seq: 1, ts: "x", text: "A." } as SessionEvent);
    c.onStreamEvent({ type: "turn_started", seq: 2, ts: "x", turn_id: "t2", text: "q", source: "keyboard" } as SessionEvent);
    expect(backend.stop).toHaveBeenCalledTimes(1);
    c.onStreamEvent({ type: "turn_done", seq: 3, ts: "x", turn_id: "t2", status: "cancelled" } as SessionEvent);
    expect(backend.stop).toHaveBeenCalledTimes(2);
  });
});
