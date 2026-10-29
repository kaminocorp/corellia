/**
 * Keyless fallback: the browser's SpeechRecognition (Chrome, Safari).
 * Used when the server reports no STT provider.
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
  onError?: (err: string) => void;
};

export class BrowserStt {
  private rec: SpeechRecognitionLike | null = null;
  private wanted = false;

  constructor(private readonly cb: BrowserSttCallbacks) {}

  get active(): boolean {
    return this.wanted;
  }

  start(): void {
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      this.cb.onError?.("speech recognition is not available in this browser");
      return;
    }
    this.wanted = true;
    const rec = new Ctor();
    rec.lang = navigator.language || "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal && r[0]) {
          const text = r[0].transcript.trim();
          if (text) this.cb.onText(text);
        }
      }
    };
    rec.onspeechstart = () => this.cb.onSpeechStart?.();
    rec.onspeechend = () => this.cb.onSpeechEnd?.();
    rec.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") this.cb.onError?.(e.error);
    };
    rec.onend = () => {
      // Chrome ends continuous sessions after a while; keep it alive.
      if (this.wanted) {
        try {
          rec.start();
        } catch {
          /* restarted too fast; the next end restarts it */
        }
      }
    };
    this.rec = rec;
    rec.start();
  }

  stop(): void {
    this.wanted = false;
    this.rec?.abort();
    this.rec = null;
  }
}
