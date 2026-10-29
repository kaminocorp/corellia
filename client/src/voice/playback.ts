/**
 * Speech playback: a queue of sentence-sized pieces played in order. The
 * server backend fetches audio from /api/voice/tts and plays it through an
 * AnalyserNode that feeds the 3D agent's audio level; the browser backend
 * uses speechSynthesis with a synthetic level. stop() is barge-in.
 */
import { setAudioLevel } from "../agent3d/audio";

export type PlayBackend = {
  /** Plays one piece; resolves when it finishes or is stopped. */
  speak(text: string): Promise<void>;
  stop(): void;
  /** Called from a user gesture so autoplay policy lets later speech through. */
  prime?(): void;
};

export type PlayerCallbacks = { onSpeaking?: (speaking: boolean) => void; onError?: (err: Error) => void };

export class SpeechPlayer {
  private queue: string[] = [];
  private playing = false;
  private generation = 0;

  constructor(
    private backend: PlayBackend,
    private readonly cb: PlayerCallbacks = {},
  ) {}

  setBackend(b: PlayBackend): void {
    this.stop();
    this.backend = b;
  }

  /** Forwarded from the first key press; cheap to call repeatedly. */
  prime(): void {
    this.backend.prime?.();
  }

  get isSpeaking(): boolean {
    return this.playing;
  }

  get pending(): number {
    return this.queue.length;
  }

  enqueue(text: string): void {
    const t = text.trim();
    if (!t) return;
    this.queue.push(t);
    void this.drain();
  }

  /** Barge-in: drop everything queued and cut the current piece. */
  stop(): void {
    this.generation++;
    this.queue = [];
    this.backend.stop();
    setAudioLevel(0);
    if (this.playing) {
      this.playing = false;
      this.cb.onSpeaking?.(false);
    }
  }

  private async drain(): Promise<void> {
    if (this.playing) return;
    this.playing = true;
    this.cb.onSpeaking?.(true);
    const gen = this.generation;
    while (this.queue.length && gen === this.generation) {
      const piece = this.queue.shift()!;
      try {
        await this.backend.speak(piece);
      } catch (e) {
        this.cb.onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    }
    if (gen === this.generation) {
      this.playing = false;
      setAudioLevel(0);
      this.cb.onSpeaking?.(false);
    }
  }
}

/** Server TTS through an AudioContext with level metering. */
export class ServerTtsBackend implements PlayBackend {
  private ctx: AudioContext | null = null;
  private current: AudioBufferSourceNode | null = null;
  private meter: number | null = null;

  constructor(private readonly fetchAudio: (text: string) => Promise<ArrayBuffer>) {}

  private context(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Chrome keeps an AudioContext created outside a gesture suspended; create and resume it on the first key press. */
  prime(): void {
    try {
      this.context();
    } catch {
      /* no AudioContext (tests) */
    }
  }

  async speak(text: string): Promise<void> {
    const data = await this.fetchAudio(text);
    const ctx = this.context();
    const buffer = await ctx.decodeAudioData(data.slice(0));
    return new Promise<void>((resolve) => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      const buf = new Float32Array(analyser.fftSize);
      this.meter = window.setInterval(() => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        setAudioLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4));
      }, 33);
      src.onended = () => {
        this.clearMeter();
        if (this.current === src) this.current = null;
        resolve();
      };
      this.current = src;
      src.start();
    });
  }

  stop(): void {
    this.clearMeter();
    try {
      this.current?.stop();
    } catch {
      /* not started */
    }
    this.current = null;
  }

  private clearMeter() {
    if (this.meter !== null) window.clearInterval(this.meter);
    this.meter = null;
    setAudioLevel(0);
  }
}

/** Keyless fallback: speechSynthesis with a synthetic level envelope. */
export class BrowserSynthBackend implements PlayBackend {
  private meter: number | null = null;
  private resolveCurrent: (() => void) | null = null;

  static available(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  }

  speak(text: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      let t = 0;
      const finish = () => {
        if (this.meter !== null) window.clearInterval(this.meter);
        this.meter = null;
        this.resolveCurrent = null;
        setAudioLevel(0);
        resolve();
      };
      this.resolveCurrent = finish;
      u.onstart = () => {
        this.meter = window.setInterval(() => {
          t += 0.033;
          setAudioLevel(0.35 + 0.25 * Math.abs(Math.sin(t * 9)) + 0.15 * Math.abs(Math.sin(t * 2.3)));
        }, 33);
      };
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
    });
  }

  stop(): void {
    window.speechSynthesis.cancel();
    this.resolveCurrent?.();
  }
}
