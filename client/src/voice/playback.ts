/**
 * Speech playback: a queue of sentence-sized pieces played in order. The
 * server backend fetches audio from /api/voice/tts and plays it through an
 * AnalyserNode that feeds the 3D agent's audio level; the browser backend
 * uses speechSynthesis with a synthetic level. stop() is barge-in.
 *
 * Two things keep the queue honest on an always-on screen (review
 * 2026-10-30, item 4): every piece gets an AbortSignal that stop() fires, so
 * a piece whose audio is still being fetched is dropped instead of playing
 * late over the next one; and every piece has a deadline, so an utterance
 * whose `onend` never fires (Chrome collects utterances held only by their
 * handlers) cannot leave the agent "speaking" forever.
 */
import { setAudioLevel } from "../agent3d/audio";

export type PlayBackend = {
  /** Plays one piece; resolves when it finishes or is stopped. `signal` aborts it after any await. */
  speak(text: string, signal?: AbortSignal): Promise<void>;
  stop(): void;
  /** Called from a user gesture so autoplay policy lets later speech through. */
  prime?(): void;
};

export type PlayerCallbacks = {
  onSpeaking?: (speaking: boolean) => void;
  onError?: (err: Error) => void;
  /** Deadline for one piece (default pieceTimeoutMs). */
  timeoutMs?: (text: string) => number;
};

/** Generous: a fetch round-trip plus speech at well under half the usual rate. */
export function pieceTimeoutMs(text: string): number {
  return 4000 + text.length * 150;
}

export class SpeechPlayer {
  private queue: string[] = [];
  private playing = false;
  private generation = 0;
  private current: AbortController | null = null;

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

  /** Barge-in: drop everything queued and cut the current piece, fetched or playing. */
  stop(): void {
    this.generation++;
    this.queue = [];
    this.current?.abort();
    this.current = null;
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
      const ac = new AbortController();
      this.current = ac;
      try {
        await this.speakOne(piece, ac);
      } catch (e) {
        this.cb.onError?.(e instanceof Error ? e : new Error(String(e)));
      }
      if (this.current === ac) this.current = null;
    }
    if (gen === this.generation) {
      this.playing = false;
      setAudioLevel(0);
      this.cb.onSpeaking?.(false);
    }
  }

  /** One piece against its deadline; a wedged piece is cut and the queue moves on. */
  private speakOne(piece: string, ac: AbortController): Promise<void> {
    const ms = (this.cb.timeoutMs ?? pieceTimeoutMs)(piece);
    return new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        ac.abort();
        this.backend.stop();
        this.cb.onError?.(new Error(`speech piece gave no end after ${ms} ms; skipped`));
        resolve();
      }, ms);
      this.backend.speak(piece, ac.signal).then(
        () => {
          window.clearTimeout(timer);
          resolve();
        },
        (e: unknown) => {
          window.clearTimeout(timer);
          reject(e instanceof Error ? e : new Error(String(e)));
        },
      );
    });
  }
}

/** Server TTS through an AudioContext with level metering. */
export class ServerTtsBackend implements PlayBackend {
  private ctx: AudioContext | null = null;
  private current: AudioBufferSourceNode | null = null;
  private meter: number | null = null;

  constructor(private readonly fetchAudio: (text: string, signal?: AbortSignal) => Promise<ArrayBuffer>) {}

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

  async speak(text: string, signal?: AbortSignal): Promise<void> {
    const data = await this.fetchAudio(text, signal);
    // stop() during the fetch: the stale sentence must not play over the
    // next one, and its meter must not be left running.
    if (signal?.aborted) return;
    const ctx = this.context();
    const buffer = await ctx.decodeAudioData(data.slice(0));
    if (signal?.aborted) return;
    return new Promise<void>((resolve) => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      const buf = new Float32Array(analyser.fftSize);
      this.clearMeter();
      this.meter = window.setInterval(() => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        setAudioLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4));
      }, 33);
      const onAbort = () => {
        try {
          src.stop();
        } catch {
          /* not started */
        }
      };
      signal?.addEventListener("abort", onAbort, { once: true });
      src.onended = () => {
        signal?.removeEventListener("abort", onAbort);
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
  /** Held so the browser cannot collect the utterance (and its onend) mid-sentence. */
  private current: SpeechSynthesisUtterance | null = null;

  static available(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  }

  speak(text: string, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve) => {
      if (signal?.aborted) {
        resolve();
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      let t = 0;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        signal?.removeEventListener("abort", onAbort);
        if (this.meter !== null) window.clearInterval(this.meter);
        this.meter = null;
        if (this.current === u) this.current = null;
        this.resolveCurrent = null;
        setAudioLevel(0);
        resolve();
      };
      const onAbort = () => {
        window.speechSynthesis.cancel();
        finish();
      };
      signal?.addEventListener("abort", onAbort, { once: true });
      this.current = u;
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
