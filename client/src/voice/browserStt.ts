/**
 * Keyless fallback: the browser's SpeechRecognition (Chrome, Safari).
 * Used when the server reports no STT provider.
 *
 * Chrome fires `speechstart` once per recognition session, so with a
 * continuous session only the first utterance would barge in; interim
 * results mark the start of every utterance instead. A `network` error is
 * a blip on an always-on screen, not a reason to stop for good: recognition
 * restarts with backoff. Permission and device errors are fatal and are
 * reported as such so the mic indicator can return to off.
 */
type RecognitionCtor = new () => SpeechRecognitionLike;
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

export function browserRecognitionAvailable(): boolean {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export type BrowserSttCallbacks = {
  onText: (text: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  /** `fatal` means recognition has stopped and will not restart on its own. */
  onError?: (err: string, fatal?: boolean) => void;
};

/** Recognition errors after which a restart would only loop. */
export const FATAL = new Set(["not-allowed", "service-not-allowed", "audio-capture", "language-not-supported"]);

/** Backoff after a `network` error: first retry, then doubling up to the cap. */
export const RETRY_MIN_MS = 1000;
export const RETRY_MAX_MS = 30_000;

export class BrowserStt {
  private rec: SpeechRecognitionLike | null = null;
  private wanted = false;
  private inUtterance = false;
  private retryDelay = 0;
  private retryTimer: number | null = null;

  constructor(
    private readonly cb: BrowserSttCallbacks,
    private readonly setTimer: (fn: () => void, ms: number) => number = (fn, ms) => window.setTimeout(fn, ms),
    private readonly clearTimer: (id: number) => void = (id) => window.clearTimeout(id),
  ) {}

  get active(): boolean {
    return this.wanted;
  }

  start(): void {
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      this.cb.onError?.("speech recognition is not available in this browser", true);
      return;
    }
    this.wanted = true;
    const rec = new Ctor();
    rec.lang = navigator.language || "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      this.retryDelay = 0;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r.isFinal) {
          this.speechStart();
          continue;
        }
        const text = r[0]?.transcript.trim() ?? "";
        this.speechEnd();
        if (text) this.cb.onText(text);
      }
    };
    rec.onspeechstart = () => this.speechStart();
    rec.onspeechend = () => this.speechEnd();
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (FATAL.has(e.error)) {
        // Permission and device failures do not fix themselves: restarting
        // would spin. Report once and stay stopped.
        this.wanted = false;
        this.speechEnd();
        this.cb.onError?.(`speech recognition stopped: ${e.error}`, true);
        return;
      }
      if (e.error === "network") {
        this.retryDelay = this.retryDelay ? Math.min(RETRY_MAX_MS, this.retryDelay * 2) : RETRY_MIN_MS;
        this.cb.onError?.(`speech recognition: network error, retrying in ${Math.round(this.retryDelay / 1000)} s`);
        return;
      }
      this.cb.onError?.(e.error);
    };
    rec.onend = () => {
      this.speechEnd();
      if (!this.wanted || this.rec !== rec) return;
      // Chrome ends continuous sessions after a while; keep it alive. After
      // a network error, wait first.
      const restart = () => {
        this.retryTimer = null;
        if (!this.wanted || this.rec !== rec) return;
        try {
          rec.start();
        } catch {
          /* restarted too fast; the next end restarts it */
        }
      };
      if (this.retryDelay > 0) this.retryTimer = this.setTimer(restart, this.retryDelay);
      else restart();
    };
    this.rec = rec;
    rec.start();
  }

  stop(): void {
    this.wanted = false;
    if (this.retryTimer !== null) this.clearTimer(this.retryTimer);
    this.retryTimer = null;
    this.inUtterance = false;
    this.rec?.abort();
    this.rec = null;
  }

  private speechStart() {
    if (this.inUtterance) return;
    this.inUtterance = true;
    this.cb.onSpeechStart?.();
  }

  private speechEnd() {
    if (!this.inUtterance) return;
    this.inUtterance = false;
    this.cb.onSpeechEnd?.();
  }
}
