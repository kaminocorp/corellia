import { useSessionState } from "../session/store";

/**
 * The last few exchanges plus the reply being streamed. Ambient by design:
 * low contrast, no scrollbars, newest at the bottom next to the input.
 */
export function Transcript({ limit = 6 }: { limit?: number }) {
  const { transcript, streamingText, activeTurnId } = useSessionState((s) => ({
    transcript: s.transcript,
    streamingText: s.streamingText,
    activeTurnId: s.activeTurnId,
  }));
  const entries = transcript.slice(-limit);
  return (
    <ol className="flex flex-col gap-1.5 font-mono text-sm" aria-label="Transcript" aria-live="polite">
      {entries.map((e, i) => (
        <li key={`${e.turn_id ?? "x"}-${e.role}-${i}`} className="flex gap-3">
          <span className={"shrink-0 uppercase tracking-widest text-[0.65rem] leading-6 " + (e.role === "user" ? "text-muted-foreground" : "text-primary")}>
            {e.role === "user" ? "you" : "agent"}
          </span>
          <span className={e.role === "user" ? "text-muted-foreground" : "text-foreground"}>{e.text}</span>
        </li>
      ))}
      {activeTurnId && (
        <li className="flex gap-3">
          <span className="shrink-0 uppercase tracking-widest text-[0.65rem] leading-6 text-primary animate-telemetry">agent</span>
          <span className="text-foreground">{streamingText || "…"}</span>
        </li>
      )}
    </ol>
  );
}
