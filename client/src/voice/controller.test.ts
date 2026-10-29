import { describe, expect, it, vi } from "vitest";

import type { SessionEvent } from "../contract";
import type { CaptureCallbacks } from "./capture";
import type { VoiceCapabilities } from "./capabilities";
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

describe("VoiceController review items (Phase 12)", () => {
  it("with barge-in off, speech during playback neither interrupts nor becomes a turn", async () => {
    const { d, backend, cb } = deps({ fetchCapabilities: async () => ({ stt: "openai", tts: "openai", mode: "toggle" as const, barge_in: "off" as const }) });
    const c = new VoiceController(d);
    await c.init();
    c.handleKeyDown(ctrlSpace());
    await flush();
    c.setActiveTurn("t1");
    let release: () => void = () => {};
    backend.speak = () => new Promise<void>((r) => (release = r));
    c.onStreamEvent({ type: "speech", seq: 1, ts: "x", text: "Talking." } as SessionEvent);
    await flush();
    expect(c.getStatus().speaking).toBe(true);
    cb().onSpeechStart?.();
    expect(backend.stop).not.toHaveBeenCalled();
    expect(d.cancelTurn).not.toHaveBeenCalled();
    await cb().onUtterance(new Blob(["x"]), "audio/webm");
    await flush();
    expect(d.transcribe).not.toHaveBeenCalled();
    expect(d.sendTurn).not.toHaveBeenCalled();
    // Once the agent is quiet, speech is a turn again.
    release();
    await flush();
    expect(c.getStatus().speaking).toBe(false);
    cb().onSpeechStart?.();
    await cb().onUtterance(new Blob(["x"]), "audio/webm");
    await flush();
    expect(d.sendTurn).toHaveBeenCalledWith("what time is it");
  });

  it("push-to-talk delivers the utterance in flight at key-up", async () => {
    const { d, capture, cb } = deps({ fetchCapabilities: async () => ({ stt: "openai", tts: "openai", mode: "ptt" as const }) });
    const c = new VoiceController(d);
    await c.init();
    c.handleKeyDown(ctrlSpace());
    await flush();
    expect(c.getStatus().mic).toBe("listening");
    cb().onSpeechStart?.();
    expect(c.getStatus().mic).toBe("capturing");
    c.handleKeyUp(new KeyboardEvent("keyup", { code: "Space" }));
    await flush();
    expect(capture.stop).toHaveBeenCalledWith(true);
    expect(c.getStatus().mic).toBe("off");
  });
});

describe("VoiceController review items (2026-10-30)", () => {
  it("a close while getUserMedia is pending wins: the stream is released and nothing captures", async () => {
    let resolveStream: (s: MediaStream) => void = () => {};
    const tracks = [{ stop: vi.fn() }];
    const { d, capture } = deps({ getMicStream: () => new Promise<MediaStream>((r) => (resolveStream = r)) });
    const c = new VoiceController(d);
    await c.init();
    c.handleKeyDown(ctrlSpace()); // open: awaits the permission prompt
    await flush();
    expect(c.getStatus().mic).toBe("listening");
    c.handleKeyDown(ctrlSpace()); // close before the prompt resolves
    await flush();
    expect(c.getStatus().mic).toBe("off");
    resolveStream({ getTracks: () => tracks } as unknown as MediaStream);
    await flush();
    expect(capture.start).not.toHaveBeenCalled();
    expect(tracks[0].stop).toHaveBeenCalled();
    expect(c.getStatus().mic).toBe("off");
    // A later open still works and uses exactly one capture.
    c.handleKeyDown(ctrlSpace());
    await flush();
    resolveStream({ getTracks: () => tracks } as unknown as MediaStream);
    await flush();
    expect(capture.start).toHaveBeenCalledTimes(1);
    expect(c.getStatus().mic).toBe("listening");
  });

  it("push-to-talk releases the mic when the window loses focus", async () => {
    const { d, capture } = deps({ fetchCapabilities: async () => ({ stt: "openai", tts: "openai", mode: "ptt" as const }) });
    const c = new VoiceController(d);
    await c.init();
    const detach = c.attach(window);
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", ctrlKey: true }));
    await flush();
    expect(c.getStatus().mic).toBe("listening");
    window.dispatchEvent(new Event("blur"));
    await flush();
    expect(capture.stop).toHaveBeenCalled();
    expect(c.getStatus().mic).toBe("off");
    detach();
  });

  it("a fatal recognition error turns the indicator off", async () => {
    let sttCb: ConstructorParameters<typeof import("./browserStt").BrowserStt>[0] | null = null;
    const { d } = deps({
      fetchCapabilities: async () => ({ stt: "none", tts: "none", mode: "toggle" as const }),
      browserRecognition: () => true,
      createBrowserStt: (cb) => {
        sttCb = cb;
        return { start: vi.fn(), stop: vi.fn() };
      },
    });
    const c = new VoiceController(d);
    await c.init();
    await c.toggle();
    expect(c.getStatus().mic).toBe("listening");
    sttCb!.onError?.("speech recognition: network error, retrying in 1 s");
    expect(c.getStatus().mic).toBe("listening");
    sttCb!.onError?.("speech recognition stopped: not-allowed", true);
    expect(c.getStatus()).toMatchObject({ mic: "off", error: "speech recognition stopped: not-allowed" });
  });

  it("refreshCapabilities applies a change without cutting speech when TTS is unchanged", async () => {
    let caps: VoiceCapabilities = { stt: "none", tts: "openai", mode: "toggle", barge_in: "auto" };
    const { d, backend } = deps({ fetchCapabilities: async () => caps });
    const c = new VoiceController(d);
    await c.init();
    expect(c.getStatus().stt).toBe("none");
    caps = { ...caps, stt: "openai", barge_in: "off" };
    await c.refreshCapabilities();
    expect(c.getStatus().stt).toBe("openai");
    expect(backend.stop).not.toHaveBeenCalled();
  });
});
