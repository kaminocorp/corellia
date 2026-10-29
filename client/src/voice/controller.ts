/**
 * VoiceController wires capture, recognition, playback and activation
 * together outside React: keys change the activation state, which opens or
 * closes the mic; utterances become voice turns; speech events play; speech
 * start or typing is barge-in. The hook in useVoice.ts only subscribes.
 */
import type { SessionEvent } from "../contract";
import { Activation, type ActivationChange, type MicState } from "./activation";
import { BrowserStt, browserRecognitionAvailable } from "./browserStt";
import { MicCapture, type CaptureCallbacks } from "./capture";
import { fetchVoiceCapabilities, type VoiceCapabilities } from "./capabilities";
import { BrowserSynthBackend, ServerTtsBackend, SpeechPlayer, type PlayBackend } from "./playback";

export type VoiceStatus = {
  mic: MicState;
  mode: "toggle" | "ptt";
  stt: string;
  tts: string;
  speaking: boolean;
  error: string | null;
};

export type Capture = { start(stream: MediaStream): void; stop(): void };

export type VoiceDeps = {
  getMicStream: () => Promise<MediaStream>;
  transcribe: (audio: Blob, mime: string) => Promise<{ text: string }>;
  synthesize: (text: string) => Promise<ArrayBuffer>;
  sendTurn: (text: string) => Promise<unknown>;
  cancelTurn: () => Promise<unknown>;
  fetchCapabilities: () => Promise<VoiceCapabilities>;
  createCapture: (cb: CaptureCallbacks) => Capture;
  browserRecognition: () => boolean;
  createBrowserStt: (cb: ConstructorParameters<typeof BrowserStt>[0]) => { start(): void; stop(): void };
  browserSynth: () => PlayBackend | null;
  serverSynth: (fetchAudio: (text: string) => Promise<ArrayBuffer>) => PlayBackend;
};

const silent: PlayBackend = { speak: async () => {}, stop: () => {} };

export class VoiceController {
  private status: VoiceStatus = { mic: "off", mode: "toggle", stt: "none", tts: "none", speaking: false, error: null };
  private listeners = new Set<() => void>();
  private readonly activation = new Activation("toggle");
  readonly player: SpeechPlayer;
  private capture: Capture | null = null;
  private stt: { start(): void; stop(): void } | null = null;
  private caps: VoiceCapabilities = { stt: "none", tts: "none", mode: "toggle" };
  private activeTurnId: string | null = null;
  private disposed = false;

  constructor(private readonly deps: VoiceDeps) {
    this.player = new SpeechPlayer(silent, {
      onSpeaking: (speaking) => this.patch({ speaking }),
      onError: (e) => this.patch({ error: e.message }),
    });
  }

  getStatus = (): VoiceStatus => this.status;

  subscribe = (l: () => void): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private patch(p: Partial<VoiceStatus>) {
    this.status = { ...this.status, ...p };
    for (const l of this.listeners) l();
  }

  async init(): Promise<void> {
    // React StrictMode (Vite dev) runs the effect twice: dispose, then init
    // again on the same instance. A disposed controller comes back to life.
    this.disposed = false;
    const c = await this.deps.fetchCapabilities();
    if (this.disposed) return;
    this.caps = c;
    this.activation.mode = c.mode;
    if (c.tts !== "none") this.player.setBackend(this.deps.serverSynth(this.deps.synthesize));
    else this.player.setBackend(this.deps.browserSynth() ?? silent);
    this.patch({ mode: c.mode, stt: c.stt, tts: c.tts });
  }

  setActiveTurn(id: string | null): void {
    this.activeTurnId = id;
  }

  /** Stream events: speech plays; a new or cancelled turn cuts playback. */
  onStreamEvent(ev: SessionEvent): void {
    if (ev.type === "speech") this.player.enqueue(ev.text);
    else if (ev.type === "turn_started" || (ev.type === "turn_done" && ev.status === "cancelled")) this.player.stop();
  }

  /** Barge-in: the user started speaking. Playback stops and the running turn is cancelled. */
  bargeIn(): void {
    this.player.stop();
    if (this.activeTurnId) this.deps.cancelTurn().catch(() => {});
  }

  /** Typing: playback stops, but the running turn continues (a follow-up is not an interruption). */
  stopSpeaking(): void {
    this.player.stop();
  }

  handleKeyDown(e: KeyboardEvent): void {
    this.player.prime();
    const change = this.activation.keydown(e);
    if (change || (e.ctrlKey && (e.code === "Space" || e.key.toLowerCase() === "m"))) e.preventDefault();
    void this.apply(change);
  }

  handleKeyUp(e: KeyboardEvent): void {
    void this.apply(this.activation.keyup(e));
  }

  /** Attaches key listeners; returns the detach function. */
  attach(target: Window): () => void {
    const down = (e: KeyboardEvent) => this.handleKeyDown(e);
    const up = (e: KeyboardEvent) => this.handleKeyUp(e);
    target.addEventListener("keydown", down);
    target.addEventListener("keyup", up);
    return () => {
      target.removeEventListener("keydown", down);
      target.removeEventListener("keyup", up);
    };
  }

  toggle(): Promise<void> {
    return this.apply(this.activation.keydown({ key: "", code: "Space", ctrlKey: true, metaKey: false, repeat: false }));
  }

  private submitVoice(text: string) {
    this.deps.sendTurn(text).catch((e: Error) => this.patch({ error: e.message }));
  }

  private async apply(change: ActivationChange | null): Promise<void> {
    if (!change) return;
    this.patch({ mic: change.to });
    const wasOpen = change.from === "listening" || change.from === "capturing";
    const nowOpen = change.to === "listening" || change.to === "capturing";
    if (nowOpen && !wasOpen) await this.openMic();
    else if (wasOpen && !nowOpen) this.closeMic();
  }

  private async openMic(): Promise<void> {
    try {
      if (this.caps.stt === "none" && this.deps.browserRecognition()) {
        const stt = this.deps.createBrowserStt({
          onText: (t) => this.submitVoice(t),
          onSpeechStart: () => {
            this.bargeIn();
            void this.apply(this.activation.setCapturing(true));
          },
          onSpeechEnd: () => void this.apply(this.activation.setCapturing(false)),
          onError: (e) => this.patch({ error: e }),
        });
        this.stt = stt;
        stt.start();
      } else {
        const stream = await this.deps.getMicStream();
        const cap = this.deps.createCapture({
          onSpeechStart: () => {
            this.bargeIn();
            void this.apply(this.activation.setCapturing(true));
          },
          onUtterance: async (blob, mime) => {
            void this.apply(this.activation.setCapturing(false));
            if (this.caps.stt === "none") {
              this.patch({ error: "no speech recognition available; configure a server STT provider" });
              return;
            }
            try {
              const t = await this.deps.transcribe(blob, mime);
              if (t.text) this.submitVoice(t.text);
            } catch (e) {
              this.patch({ error: e instanceof Error ? e.message : String(e) });
            }
          },
          onError: (e) => this.patch({ error: e.message }),
        });
        this.capture = cap;
        cap.start(stream);
      }
      this.patch({ error: null });
    } catch (e) {
      this.closeMic();
      this.activation.state = "off";
      this.patch({ mic: "off", error: e instanceof Error ? e.message : String(e) });
    }
  }

  private closeMic(): void {
    this.capture?.stop();
    this.capture = null;
    this.stt?.stop();
    this.stt = null;
  }

  dispose(): void {
    this.disposed = true;
    this.closeMic();
    this.player.stop();
  }
}

/** Production dependencies. */
export function defaultDeps(api: Pick<VoiceDeps, "getMicStream" | "transcribe" | "synthesize" | "sendTurn" | "cancelTurn">): VoiceDeps {
  return {
    ...api,
    fetchCapabilities: () => fetchVoiceCapabilities(),
    createCapture: (cb) => new MicCapture(cb),
    browserRecognition: browserRecognitionAvailable,
    createBrowserStt: (cb) => new BrowserStt(cb),
    browserSynth: () => (BrowserSynthBackend.available() ? new BrowserSynthBackend() : null),
    serverSynth: (fetchAudio) => new ServerTtsBackend(fetchAudio),
  };
}
