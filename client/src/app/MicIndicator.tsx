import type { VoiceStatus } from "../voice/controller";

const LABEL: Record<VoiceStatus["mic"], string> = { off: "mic off", listening: "listening", capturing: "hearing you", muted: "muted" };
const DOT: Record<VoiceStatus["mic"], string> = {
  off: "bg-muted-foreground",
  listening: "bg-state-listening animate-telemetry",
  capturing: "bg-state-listening",
  muted: "bg-destructive",
};

/** Always-visible microphone state (VISION 8: a visible mic-state indicator). */
export function MicIndicator({ status }: { status: VoiceStatus }) {
  const hint = status.mode === "ptt" ? "hold Ctrl+Space" : "Ctrl+Space";
  return (
    <div className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase" data-testid="mic" data-state={status.mic}>
      <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${DOT[status.mic]}`} />
      <span>{LABEL[status.mic]}</span>
      <span className="text-[0.6rem] opacity-70">{hint}</span>
      {status.speaking && <span className="text-primary">· speaking</span>}
      {status.speaker === "off" && (
        <span data-testid="speaker" data-state="off">
          · sound off <span className="text-[0.6rem] opacity-70">Ctrl+Shift+M</span>
        </span>
      )}
      {status.speaker === "display" && (
        <span data-testid="speaker" data-state="display">
          · sound on the display <span className="text-[0.6rem] opacity-70">Ctrl+Shift+M</span>
        </span>
      )}
      {status.sound === "blocked" && (
        <span className="text-primary normal-case tracking-normal" data-testid="sound-hint">
          · press any key for sound
        </span>
      )}
      {status.stt === "none" && status.mic !== "off" && <span className="text-[0.6rem] opacity-70">· browser recognition</span>}
      {status.error && <span className="normal-case tracking-normal text-destructive">· {status.error}</span>}
    </div>
  );
}
