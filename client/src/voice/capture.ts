/**
 * Microphone capture: an AnalyserNode drives the VAD at ~50 Hz; a
 * MediaRecorder runs continuously and is restarted while idle so an
 * utterance blob never carries more than ~1.5 s of leading silence. On
 * speech end the recorder stops, the blob goes to onUtterance, and the
 * recorder starts again.
 */
import { EnergyVAD, rms, type VadOptions } from "./vad";

export type CaptureCallbacks = {
  onLevel?: (level: number) => void;
  onSpeechStart?: () => void;
  onUtterance: (audio: Blob, mime: string) => void;
  onError?: (err: Error) => void;
};

export type CaptureOptions = VadOptions & {
  idleRestartMs?: number;
  tickMs?: number;
};

export function pickMime(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  if (typeof MediaRecorder === "undefined") return "";
  for (const c of candidates) if (MediaRecorder.isTypeSupported?.(c)) return c;
  return "";
}

export class MicCapture {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timer: number | null = null;
  private recorderStarted = 0;
  private inSpeech = false;
  private discardNext = false;
  private readonly vad: EnergyVAD;
  private readonly idleRestartMs: number;
  private readonly tickMs: number;
  private mime = "";
  private stream: MediaStream | null = null;

  constructor(
    private readonly cb: CaptureCallbacks,
    o: CaptureOptions = {},
  ) {
    this.vad = new EnergyVAD(o);
    this.idleRestartMs = o.idleRestartMs ?? 1500;
    this.tickMs = o.tickMs ?? 20;
  }

  get active(): boolean {
    return this.timer !== null;
  }

  start(stream: MediaStream): void {
    this.stop();
    this.stream = stream;
    this.mime = pickMime();
    this.ctx = new AudioContext();
    const src = this.ctx.createMediaStreamSource(stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    src.connect(this.analyser);
    const buf = new Float32Array(this.analyser.fftSize);
    this.startRecorder();
    this.timer = window.setInterval(() => {
      if (!this.analyser) return;
      this.analyser.getFloatTimeDomainData(buf);
      const level = rms(buf);
      this.cb.onLevel?.(level);
      const now = performance.now();
      const ev = this.vad.update(level, now);
      if (ev === "start") {
        this.inSpeech = true;
        this.cb.onSpeechStart?.();
      } else if (ev === "end") {
        this.inSpeech = false;
        this.restartRecorder(false);
      } else if (!this.inSpeech && now - this.recorderStarted > this.idleRestartMs) {
        this.restartRecorder(true);
      }
    }, this.tickMs);
  }

  /**
   * Stops capture. With `flush`, an utterance in progress is delivered
   * instead of dropped: push-to-talk releases the key while the user is
   * still finishing the sentence (review 2026-10-29).
   */
  stop(flush = false): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    const deliver = flush && this.inSpeech;
    this.inSpeech = false;
    this.vad.reset();
    if (this.recorder && this.recorder.state !== "inactive") {
      this.discardNext = !deliver;
      try {
        this.recorder.stop();
      } catch {
        /* already stopped */
      }
    }
    this.recorder = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.ctx?.close();
    this.ctx = null;
    this.analyser = null;
  }

  private startRecorder(): void {
    if (!this.stream || typeof MediaRecorder === "undefined") return;
    try {
      const rec = new MediaRecorder(this.stream, this.mime ? { mimeType: this.mime } : undefined);
      this.chunks = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      rec.onstop = () => {
        const discard = this.discardNext;
        this.discardNext = false;
        const blob = new Blob(this.chunks, { type: rec.mimeType || this.mime || "audio/webm" });
        this.chunks = [];
        if (!discard && blob.size > 0) this.cb.onUtterance(blob, blob.type);
      };
      rec.start();
      this.recorder = rec;
      this.recorderStarted = performance.now();
    } catch (e) {
      this.cb.onError?.(e instanceof Error ? e : new Error(String(e)));
    }
  }

  private restartRecorder(discard: boolean): void {
    const rec = this.recorder;
    if (rec && rec.state !== "inactive") {
      this.discardNext = discard;
      rec.stop();
    }
    this.startRecorder();
  }
}
