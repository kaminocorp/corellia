import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CommandInput } from "./CommandInput";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { DebugPane } from "./DebugPane";
import { Transcript } from "./Transcript";
import { Gallery } from "../gallery/Gallery";
import { Stage } from "../renderer/Stage";
import { assignHotkeys } from "../renderer/resolve";
import { useDecay } from "../renderer/useDecay";
import { useGlobalKeys, type GlobalKeyHandlers } from "../renderer/useGlobalKeys";
import { cancelTurn, clearScreen, fireAction, removeNode, sendTurn } from "../session/api";
import { fetchHealth } from "../session/health";
import { sessionStore, useSessionState } from "../session/store";
import { SessionStream } from "../session/stream";

/**
 * The display shell: the Stage (agent focal area + generated UI), the
 * transcript and the always-focused input. `?debug=1` adds the debug pane,
 * `?gallery=1` shows every component from its catalog example.
 */
export function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  if (params.get("gallery") === "1") return <Gallery />;
  return <Display debug={params.get("debug") === "1"} />;
}

function Display({ debug }: { debug: boolean }) {
  const [devMode, setDevMode] = useState(false);
  const inputValue = useRef("");
  const { connection, agentName, agentState, activeTurnId, spec, touched } = useSessionState((s) => ({
    connection: s.connection,
    agentName: s.agentName,
    agentState: s.agentState,
    activeTurnId: s.activeTurnId,
    spec: s.spec,
    touched: s.touched,
  }));

  useEffect(() => {
    const stream = new SessionStream(sessionStore);
    stream.connect();
    void fetchHealth().then((h) => setDevMode(h?.dev_mode ?? false));
    return () => stream.disconnect();
  }, []);

  const report = (code: string) => (e: Error) => sessionStore.addError(code, e.message);
  const fire = useCallback((actionId: string, nodeId: string) => {
    fireAction(actionId, nodeId).catch(report("action_failed"));
  }, []);
  const expire = useCallback((id: string) => {
    sessionStore.applyLocal({ op: "remove_node", id });
    removeNode(id).catch(() => {});
  }, []);
  useDecay(spec, touched, expire);

  const hotkeys = useMemo(() => assignHotkeys(spec), [spec]);
  const keyHandlers = useMemo<GlobalKeyHandlers>(
    () => ({
      inputEmpty: () => inputValue.current === "",
      hotkeys,
      fire,
      cancel: () => {
        if (!activeTurnId) return false;
        cancelTurn().catch(() => {});
        return true;
      },
      clear: () => {
        if (spec.root) clearScreen().catch(report("clear_failed"));
      },
    }),
    [hotkeys, fire, activeTurnId, spec.root],
  );
  useGlobalKeys(keyHandlers);

  const onSubmit = (text: string) => {
    sendTurn(text, "keyboard").catch(report("send_failed"));
  };

  return (
    <main className="relative h-full w-full overflow-hidden">
      <Stage
        spec={spec}
        fire={fire}
        onInvalid={(id, msg) => sessionStore.addError("render_invalid", `${id}: ${msg}`)}
        agent={
          <div
            className="h-40 w-40 rounded-full border border-border transition-all duration-700"
            style={{ opacity: agentState === "idle" ? 0.5 : 1, boxShadow: `0 0 80px var(--color-state-${agentState}) inset` }}
          />
        }
      />

      <header className="absolute top-4 left-5 flex items-center gap-4 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        <span>{agentName}</span>
        <ConnectionIndicator status={connection} devMode={devMode} />
        <span data-testid="agent-state" className={agentState === "idle" ? "" : "text-foreground"}>
          {agentState}
        </span>
      </header>

      <footer className="absolute bottom-6 left-1/2 w-full max-w-3xl -translate-x-1/2 px-6">
        <div className="mb-4">
          <Transcript />
        </div>
        <CommandInput onSubmit={onSubmit} onValueChange={(v) => (inputValue.current = v)} />
      </footer>

      {debug && <DebugPane />}
    </main>
  );
}
