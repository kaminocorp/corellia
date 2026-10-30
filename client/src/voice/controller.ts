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
import type { SpeakerState } from "./speaker";

export type VoiceStatus = {
  mic: MicState;
  mode: "toggle" | "ptt";
  stt: string;
  tts: string;
  speaking: boolean;
  /** blocked: the browser refused to play until a key press or click (speech is held). */
  sound: "ready" | "blocked";
  /** Whether this client plays speech: on, off (Ctrl+Shift+M, ?quiet=1) or display (the kiosk speaks instead). */
  speaker: SpeakerState;
  error: string | null;
};

export type Capture = { start(stream: MediaStream): void; stop(flush?: boolean): void };

export type VoiceDeps = {
  getMicStream: () => Promise<MediaStream>;
  transcribe: (audio: Blob, mime: string) => Promise<{ text: string }>;
  synthesize: (text: string, signal?: AbortSignal) => Promise<ArrayBuffer>;
  sendTurn: (text: string) => Promise<unknown>;
  cancelTurn: () => Promise<unknown>;
  fetchCapabilities: () => Promise<VoiceCapabilities>;
  createCapture: (cb: CaptureCallbacks) => Capture;
  browserRecognition: () => boolean;
  createBrowserStt: (cb: ConstructorParameters<typeof BrowserStt>[0]) => { start(): void; stop(): void };
  browserSynth: () => PlayBackend | null;
  serverSynth: (fetchAudio: (text: string, signal?: AbortSignal) => Promise<ArrayBuffer>) => PlayBackend;
  /**
   * Whether the page is a secure context (HTTPS, or http on localhost). The
   * browser exposes the microphone, for getUserMedia and for its own
   * recognition alike, only in one; a display that opens the backend as
   * http://192.168.x.y:8080 has no voice, and the indicator must say why
   * (review 2026-10-30 round 4, item 4).
   */
  secureContext: () => boolean;
  /** Ctrl+Shift+M: the app flips the speaker preference for this client (voice/speaker.ts). */
  toggleSpeaker?: () => void;
};

/** What the mic indicator says when the page cannot have a microphone at all. */
export const INSECURE_CONTEXT_ERROR = "voice needs HTTPS or localhost; this page is plain HTTP at a network address";

const silent: PlayBackend = { speak: async () => {}, stop: () => {} };

export class VoiceController {
  private status: VoiceStatus = { mic: "off", mode: "toggle", stt: "none", tts: "none", speaking: false, sound: "ready", speaker: "on", error: null };
  private listeners = new Set<() => void>();
  private readonly activation = new Activation("toggle");
  readonly player: SpeechPlayer;
  private capture: Capture | null = null;
  private stt: { start(): void; stop(): void } | null = null;
  private caps: VoiceCapabilities = { stt: "none", tts: "none", mode: "toggle", barge_in: "auto" };
  private activeTurnId: string | null = null;
  private disposed = false;
  /** Speech that began while the agent was talking with barge-in off: its text is dropped. */
  private ignoreUtterance = false;
  /**
   * Bumped on every open and close. openMic awaits getUserMedia; a close
   * in the meantime (a short push-to-talk tap, a second Ctrl+Space while
   * the permission prompt is open) must win, or the mic would record while
   * the indicator says off (review 2026-10-30, item 3).
   */
  private micGen = 0;
  /** What Ctrl+Shift+M does; set by the app (useVoice), falls back to deps.toggleSpeaker. */
  private speakerToggle: (() => void) | undefined;

  constructor(private readonly deps: VoiceDeps) {
    this.player = new SpeechPlayer(silent, {
      onSpeaking: (speaking) => this.patch({ speaking }),
      onError: (e) => this.patch({ error: e.message }),
      onBlocked: (blocked) => this.patch({ sound: blocked ? "blocked" : "ready" }),
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
    let c: VoiceCapabilities;
    try {
      c = await this.deps.fetchCapabilities();
    } catch (e) {
      // The backend is not up yet: the browser fallbacks apply until
      // refreshCapabilities runs when the stream comes online.
      this.patch({ error: e instanceof Error ? e.message : String(e) });
      this.player.setBackend(this.deps.browserSynth() ?? silent);
      return;
    }
    if (this.disposed) return;
    this.applyCapabilities(c, true);
  }

  /**
   * Re-reads the server's voice capabilities (on reconnect). Only a change
   * is applied, and the playback backend is swapped only when the TTS
   * provider changed, so a routine reconnect does not cut speech.
   */
  async refreshCapabilities(): Promise<void> {
    let c: VoiceCapabilities;
    try {
      c = await this.deps.fetchCapabilities();
    } catch {
      return;
    }
    if (this.disposed) return;
    if (JSON.stringify(c) === JSON.stringify(this.caps)) return;
    this.applyCapabilities(c, c.tts !== this.caps.tts);
  }

  private applyCapabilities(c: VoiceCapabilities, swapBackend: boolean) {
    this.caps = c;
    this.activation.mode = c.mode;
    if (swapBackend) {
      if (c.tts !== "none") this.player.setBackend(this.deps.serverSynth(this.deps.synthesize));
      else this.player.setBackend(this.deps.browserSynth() ?? silent);
    }
    this.patch({ mode: c.mode, stt: c.stt, tts: c.tts, error: null });
  }

  setActiveTurn(id: string | null): void {
    this.activeTurnId = id;
  }

  /** Registers the Ctrl+Shift+M handler (the app owns the speaker preference). */
  setSpeakerToggle(fn: (() => void) | undefined): void {
    this.speakerToggle = fn;
  }

  /**
   * Sets whether this client plays speech. Anything queued or playing stops
   * when the speaker goes quiet; the transcript still shows the words.
   */
  setSpeaker(state: SpeakerState): void {
    if (state === this.status.speaker) return;
    if (state !== "on") this.player.stop();
    this.patch({ speaker: state });
  }

  /** Stream events: speech plays (on this client, if it is the speaker); a new or cancelled turn cuts playback. */
  onStreamEvent(ev: SessionEvent): void {
    if (ev.type === "speech") {
      if (this.status.speaker === "on") this.player.enqueue(ev.text);
    } else if (ev.type === "turn_started" || (ev.type === "turn_done" && ev.status === "cancelled")) this.player.stop();
  }

  /** Barge-in: the user started speaking. Playback stops and the running turn is cancelled. */
  bargeIn(): void {
    this.player.stop();
    if (this.activeTurnId) this.deps.cancelTurn().catch(() => {});
  }

  /**
   * Speech start from the mic. With CORELLIA_VOICE_BARGE_IN=off, speech
   * detected while the agent is talking is taken for the agent's own voice
   * on the speakers (laptops without headphones) and ignored, text
   * included; typing and Escape still interrupt.
   */
  private onSpeechStart(): void {
    if (this.caps.barge_in === "off" && this.player.isSpeaking) {
      this.ignoreUtterance = true;
      return;
    }
    this.ignoreUtterance = false;
    this.bargeIn();
    void this.apply(this.activation.setCapturing(true));
  }

  /** True once per utterance that began during playback with barge-in off. */
  private dropUtterance(): boolean {
    const drop = this.ignoreUtterance;
    this.ignoreUtterance = false;
    return drop;
  }

  /** Typing: playback stops, but the running turn continues (a follow-up is not an interruption). */
  stopSpeaking(): void {
    this.player.stop();
  }

  handleKeyDown(e: KeyboardEvent): void {
    this.player.prime();
    if (e.ctrlKey && e.shiftKey && !e.metaKey && !e.repeat && e.key.toLowerCase() === "m") {
      e.preventDefault();
      (this.speakerToggle ?? this.deps.toggleSpeaker)?.();
      return;
    }
    const change = this.activation.keydown(e);
    if (change || (e.ctrlKey && (e.code === "Space" || e.key.toLowerCase() === "m"))) e.preventDefault();
    void this.apply(change);
  }

  handleKeyUp(e: KeyboardEvent): void {
    void this.apply(this.activation.keyup(e));
  }

  /** Push-to-talk and the window loses focus (Cmd+Tab while holding the key): the key-up never arrives, so release here. */
  handleBlur(): void {
    if (this.caps.mode === "ptt") void this.apply(this.activation.keyup({ code: "Space" }));
  }

  /** A click or tap is a user gesture too: it unlocks sound like a key press. */
  handlePointerDown(): void {
    this.player.prime();
  }

  /** Attaches key, pointer and blur listeners; returns the detach function. */
  attach(target: Window): () => void {
    const down = (e: KeyboardEvent) => this.handleKeyDown(e);
    const up = (e: KeyboardEvent) => this.handleKeyUp(e);
    const pointer = () => this.handlePointerDown();
    const blur = () => this.handleBlur();
    target.addEventListener("keydown", down);
    target.addEventListener("keyup", up);
    target.addEventListener("pointerdown", pointer);
    target.addEventListener("blur", blur);
    return () => {
      target.removeEventListener("keydown", down);
      target.removeEventListener("keyup", up);
      target.removeEventListener("pointerdown", pointer);
      target.removeEventListener("blur", blur);
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
    // Push-to-talk: the key goes up while the sentence is still being
    // finished; deliver what was captured instead of dropping it.
    else if (wasOpen && !nowOpen) this.closeMic(this.caps.mode === "ptt" && change.from === "capturing");
  }

  private async openMic(): Promise<void> {
    const gen = ++this.micGen;
    if (!this.deps.secureContext()) {
      this.forceOff();
      this.patch({ error: INSECURE_CONTEXT_ERROR });
      return;
    }
    try {
      if (this.caps.stt === "none" && this.deps.browserRecognition()) {
        const stt = this.deps.createBrowserStt({
          onText: (t) => {
            if (!this.dropUtterance()) this.submitVoice(t);
          },
          onSpeechStart: () => this.onSpeechStart(),
          onSpeechEnd: () => void this.apply(this.activation.setCapturing(false)),
          onError: (e, fatal) => {
            this.patch({ error: e });
            // Recognition is gone for good: the indicator must not keep
            // saying "listening".
            if (fatal) this.forceOff();
          },
        });
        this.stt = stt;
        stt.start();
      } else {
        const stream = await this.deps.getMicStream();
        if (gen !== this.micGen || !this.activation.open) {
          // Closed while the permission prompt was open: release the device.
          stream.getTracks?.().forEach((t) => t.stop());
          return;
        }
        const cap = this.deps.createCapture({
          onSpeechStart: () => this.onSpeechStart(),
          onUtterance: async (blob, mime) => {
            void this.apply(this.activation.setCapturing(false));
            if (this.dropUtterance()) return;
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
      if (gen !== this.micGen) return; // already closed meanwhile
      this.forceOff();
      this.patch({ error: e instanceof Error ? e.message : String(e) });
    }
  }

  /** Closes the mic and resets activation to off (a failure, not a key). */
  private forceOff(): void {
    this.closeMic();
    this.activation.state = "off";
    this.patch({ mic: "off" });
  }

  private closeMic(flush = false): void {
    this.micGen++;
    this.capture?.stop(flush);
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
    secureContext: () => window.isSecureContext !== false,
  };
}
