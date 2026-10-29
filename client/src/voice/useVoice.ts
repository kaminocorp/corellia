import { useEffect, useMemo, useSyncExternalStore } from "react";

import { detectPlatform } from "../platform";
import { cancelTurn, sendTurn, synthesize, transcribe } from "../session/api";
import { defaultDeps, VoiceController } from "./controller";

export type { VoiceStatus } from "./controller";

/** Creates the controller once, keeps it informed of the active turn, and exposes its status. */
export function useVoice(activeTurnId: string | null) {
  const controller = useMemo(
    () =>
      new VoiceController(
        defaultDeps({
          getMicStream: () => detectPlatform().getMicStream(),
          transcribe,
          synthesize,
          sendTurn: (text) => sendTurn(text, "voice"),
          cancelTurn: () => cancelTurn(),
        }),
      ),
    [],
  );
  useEffect(() => {
    controller.setActiveTurn(activeTurnId);
  }, [controller, activeTurnId]);
  useEffect(() => {
    void controller.init();
    const detach = controller.attach(window);
    return () => {
      detach();
      controller.dispose();
    };
  }, [controller]);
  const status = useSyncExternalStore(controller.subscribe, controller.getStatus, controller.getStatus);
  return { status, controller };
}
