import { useSessionState } from "../session/store";

/** `?debug=1`: the current spec, errors and recent events as JSON. */
export function DebugPane() {
  const { spec, errors, recentEvents, lastSeq, capabilities } = useSessionState((s) => ({
    spec: s.spec,
    errors: s.errors,
    recentEvents: s.recentEvents,
    lastSeq: s.lastSeq,
    capabilities: s.capabilities,
  }));
  return (
    <aside className="absolute top-12 right-4 bottom-24 w-[28rem] overflow-auto border border-border bg-card/80 p-3 font-mono text-[0.7rem] text-muted-foreground backdrop-blur">
      <div className="mb-2 text-foreground">
        debug · seq {lastSeq} · runtime {capabilities?.runtime ?? "?"}
      </div>
      <div className="mb-1 uppercase tracking-widest">spec</div>
      <pre className="mb-3 whitespace-pre-wrap break-all">{JSON.stringify(spec, null, 1)}</pre>
      {errors.length > 0 && (
        <>
          <div className="mb-1 uppercase tracking-widest text-destructive">errors</div>
          <ul className="mb-3">
            {errors.slice(-8).map((e, i) => (
              <li key={i}>
                {e.code}: {e.message}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="mb-1 uppercase tracking-widest">events</div>
      <ul>
        {recentEvents.slice(-25).map((e) => (
          <li key={e.seq}>
            {e.seq} {e.type}
            {"delta" in e ? ` ${JSON.stringify(e.delta)}` : ""}
            {"op" in e ? ` ${(e.op as { op: string }).op}` : ""}
            {"code" in e ? ` ${e.code}` : ""}
          </li>
        ))}
      </ul>
    </aside>
  );
}
