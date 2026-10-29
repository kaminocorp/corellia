import { useEffect, useMemo, useState } from "react";

import { CommandInput } from "./CommandInput";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { DebugPane } from "./DebugPane";
import { Transcript } from "./Transcript";
import { cancelTurn, sendTurn } from "../session/api";
import { fetchHealth } from "../session/health";
import { sessionStore, useSessionState } from "../session/store";
import { SessionStream } from "../session/stream";

/**
 * The display shell. Phase 3: header (name, connection, agent state), a
 * placeholder focal area, the transcript and the always-focused input.
 * Later phases mount the 3D agent and the generated-UI renderer here.
 */
export function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const debug = params.get("debug") === "1";
  const [devMode, setDevMode] = useState(false);
  const { connection, agentName, agentState, activeTurnId } = useSessionState((s) => ({
    connection: s.connection,
    agentName: s.agentName,
    agentState: s.agentState,
    activeTurnId: s.activeTurnId,
  }));

  useEffect(() => {
    const stream = new SessionStream(sessionStore);
    stream.connect();
    void fetchHealth().then((h) => setDevMode(h?.dev_mode ?? false));
    return () => stream.disconnect();
  }, []);

  const onSubmit = (text: string) => {
    sendTurn(text, "keyboard").catch((e: Error) => sessionStore.addError("send_failed", e.message));
  };
  const onCancel = () => {
    if (activeTurnId) cancelTurn().catch(() => {});
  };

  return (
    <main className="relative flex h-full w-full flex-col items-center justify-center">
      <header className="absolute top-4 left-5 flex items-center gap-4 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        <span>{agentName}</span>
        <ConnectionIndicator status={connection} devMode={devMode} />
        <span data-testid="agent-state" className={agentState === "idle" ? "" : "text-foreground"}>
          {agentState}
        </span>
      </header>

      <section className="flex flex-col items-center gap-6" aria-hidden>
        <div
          className="h-40 w-40 rounded-full border border-border transition-opacity duration-500"
          style={{
            opacity: agentState === "idle" ? 0.5 : 1,
            boxShadow: `0 0 80px var(--color-state-${agentState}) inset`,
          }}
        />
      </section>

      <footer className="absolute bottom-6 w-full max-w-3xl px-6">
        <div className="mb-4">
          <Transcript />
        </div>
        <CommandInput onSubmit={onSubmit} onEscapeEmpty={onCancel} />
      </footer>

      {debug && <DebugPane />}
    </main>
  );
}
