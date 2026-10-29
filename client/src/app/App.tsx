import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { CommandInput, type CommandInputHandle } from "./CommandInput";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { DebugPane } from "./DebugPane";
import { ErrorLine } from "./ErrorLine";
import { MicIndicator } from "./MicIndicator";
import { OfflineBanner } from "./OfflineBanner";
import { runtimeLabel } from "./runtimeLabel";
import { TokenPrompt } from "./TokenPrompt";
import { Transcript } from "./Transcript";
import { Agent3D, AgentFallback, StatsOverlay } from "../agent3d/Agent3D";
import { ErrorBoundary } from "./ErrorBoundary";
import { Gallery } from "../gallery/Gallery";
import { FOOTER_HEIGHT_VAR, Stage } from "../renderer/Stage";
import { assignHotkeys, placement } from "../renderer/resolve";
import { useDecay } from "../renderer/useDecay";
import { useGlobalKeys, type GlobalKeyHandlers } from "../renderer/useGlobalKeys";
import { cancelTurn, clearScreen, fireAction, removeNode, sendTurn } from "../session/api";
import { setDeviceToken } from "../session/auth";
import { fetchHealth } from "../session/health";
import { startHeartbeat } from "../session/heartbeat";
import { startSoak } from "../session/soak";
import { sessionStore, useSessionState } from "../session/store";
import { SessionStream } from "../session/stream";
import { useVoice } from "../voice/useVoice";

/**
 * The display shell: the Stage (agent focal area + generated UI), the
 * transcript and the always-focused input. `?debug=1` adds the debug pane,
 * `?gallery=1` shows every component from its catalog example.
 */
export function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  if (params.get("gallery") === "1") return <Gallery />;
  const particles = Number(params.get("particles")) || undefined;
  return <Display debug={params.get("debug") === "1"} stats={params.get("stats") === "1"} soak={params.get("soak") === "1"} particles={particles} />;
}

/** Keyboard scrolling of the generated UI (review 2026-10-29: long content was clipped). */
function scrollUIZone(dir: "up" | "down" | "page_up" | "page_down"): boolean {
  const zone = document.querySelector<HTMLElement>('[data-testid="ui-zone"]');
  if (!zone || zone.scrollHeight <= zone.clientHeight) return false;
  const page = Math.max(120, zone.clientHeight * 0.8);
  const delta = { up: -120, down: 120, page_up: -page, page_down: page }[dir];
  zone.scrollBy({ top: delta, behavior: "smooth" });
  return true;
}

/**
 * Publishes the footer's extent from the bottom edge of the display (its
 * height plus its offset) as a CSS variable on the display root, so the
 * Stage can end its panel and full zones above the transcript, however
 * many lines it holds and whatever the viewport (review 2026-10-30 round
 * 3, item 3). jsdom has no ResizeObserver; the Stage then uses its
 * fallback.
 */
function useFooterHeight(root: React.RefObject<HTMLElement | null>, footer: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = footer.current;
    const target = root.current;
    if (!el || !target) return;
    const publish = () => target.style.setProperty(FOOTER_HEIGHT_VAR, `${Math.max(0, target.clientHeight - el.offsetTop)}px`);
    publish();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    ro.observe(target);
    return () => ro.disconnect();
  }, [root, footer]);
}

function Display({ debug, stats, soak, particles }: { debug: boolean; stats: boolean; soak: boolean; particles?: number }) {
  const [devMode, setDevMode] = useState(false);
  const inputValue = useRef("");
  const inputRef = useRef<CommandInputHandle>(null);
  const rootRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  useFooterHeight(rootRef, footerRef);
  const streamRef = useRef<SessionStream | null>(null);
  // Selectors may return fresh objects: useSessionState caches by state
  // version and shallow-compares, so the snapshot stays stable.
  const { connection, agentName, agentState, activeTurnId, spec, touched, runtime } = useSessionState((s) => ({
    connection: s.connection,
    agentName: s.agentName,
    agentState: s.agentState,
    activeTurnId: s.activeTurnId,
    spec: s.spec,
    touched: s.touched,
    runtime: s.capabilities?.runtime,
  }));

  const voice = useVoice(activeTurnId);
  const controller = voice.controller;

  // Voice capabilities are fetched at init; a page that loaded before the
  // backend was up (or before a token was entered) learns about the server's
  // STT/TTS and barge-in setting when the stream comes online.
  useEffect(() => {
    if (connection === "online") void controller.refreshCapabilities();
  }, [controller, connection]);

  useEffect(() => {
    const stream = new SessionStream(sessionStore, { onEvent: (ev) => controller.onStreamEvent(ev) });
    streamRef.current = stream;
    stream.connect();
    void fetchHealth().then((h) => setDevMode(h?.dev_mode ?? false));
    const stopHeartbeat = startHeartbeat();
    const stopSoak = soak ? startSoak() : () => {};
    return () => {
      stream.disconnect();
      streamRef.current = null;
      stopHeartbeat();
      stopSoak();
    };
  }, [controller, soak]);

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
      inputValue: () => inputValue.current,
      clearInput: () => inputRef.current?.clear(),
      hotkeys,
      fire,
      scroll: (dir) => scrollUIZone(dir),
      // Escape: silence first, then cancel the running turn, else (in
      // useGlobalKeys) the escape-bound action or a clear. Most speech plays
      // after turn_done, when nothing else would have stopped it (review
      // 2026-10-30, item 4).
      cancel: () => {
        const wasSpeaking = controller.player.isSpeaking;
        controller.stopSpeaking();
        if (activeTurnId) {
          cancelTurn().catch(() => {});
          return true;
        }
        return wasSpeaking;
      },
      clear: () => {
        if (spec.root) clearScreen().catch(report("clear_failed"));
      },
    }),
    [hotkeys, fire, activeTurnId, spec.root, controller],
  );
  useGlobalKeys(keyHandlers);

  const onSubmit = (text: string) => {
    sendTurn(text, "keyboard").catch(report("send_failed"));
  };
  const onToken = (token: string) => {
    setDeviceToken(token);
    streamRef.current?.connect();
  };

  // The server goes idle at turn_done while speech still plays; the scene
  // keeps speaking (and reacting to the audio level) until playback ends.
  const sceneState = voice.status.mic === "capturing" ? "listening" : voice.status.speaking && agentState === "idle" ? "speaking" : agentState;
  // While a panel or full visual is up, the transcript keeps only the
  // latest exchange: the visual is the answer, and a tall transcript would
  // push the zone above it into a strip.
  const mode = placement(spec);
  const transcriptLimit = mode === "panel" || mode === "full" ? 2 : 6;

  return (
    <main ref={rootRef} className="relative h-full w-full overflow-hidden">
      <Stage
        spec={spec}
        fire={fire}
        onInvalid={(id, msg) => sessionStore.addError("render_invalid", `${id}: ${msg}`)}
        agent={
          // A lost WebGL context (GPU process crash, sleep/wake) or a failed
          // scene chunk must not blank the page: fall back to the static agent.
          <ErrorBoundary label="3D agent" resetKey={sceneState} fallback={<AgentFallback state={sceneState} />} onError={(e) => sessionStore.addError("agent3d", e.message)}>
            <Agent3D state={sceneState} particles={particles} />
          </ErrorBoundary>
        }
      />

      <header className="absolute top-4 left-5 flex items-center gap-4 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        <span>{agentName}</span>
        <ConnectionIndicator status={connection} devMode={devMode} />
        <span data-testid="agent-state" className={agentState === "idle" ? "" : "text-foreground"}>
          {agentState}
        </span>
        {runtime && <span data-testid="runtime">{runtimeLabel(runtime)}</span>}
      </header>
      <div className="absolute top-4 right-5">
        <MicIndicator status={voice.status} />
      </div>
      <OfflineBanner status={connection} />
      {connection === "unauthorized" && <TokenPrompt onSubmit={onToken} />}

      <footer ref={footerRef} className="absolute bottom-6 left-1/2 w-full max-w-3xl -translate-x-1/2 px-6" data-testid="footer">
        <ErrorLine debug={debug} />
        <div className="mb-4">
          <Transcript limit={transcriptLimit} />
        </div>
        <CommandInput
          ref={inputRef}
          onSubmit={onSubmit}
          onValueChange={(v) => {
            if (inputValue.current === "" && v !== "") controller.stopSpeaking();
            inputValue.current = v;
          }}
        />
      </footer>

      {debug && <DebugPane />}
      {stats && <StatsOverlay />}
    </main>
  );
}
