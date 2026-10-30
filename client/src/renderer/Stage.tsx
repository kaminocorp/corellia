import type { ReactNode } from "react";

import { ErrorBoundary } from "../app/ErrorBoundary";
import { GUTTER_INSET } from "../components/overlayStack";
import type { UISpec } from "../contract";
import { ABOVE_FOOTER, FOOTER_HEIGHT_VAR } from "./footer";
import { needsGutter, placement } from "./resolve";
import { Renderer } from "./Renderer";

export { FOOTER_HEIGHT_VAR };

type Props = {
  spec: UISpec;
  agent: ReactNode;
  fire: (actionId: string, nodeId: string) => void;
  onInvalid?: (nodeId: string, message: string) => void;
};

/**
 * Lays out the agent and the generated UI. The root's fit decides the
 * zone: glance overlays float in a corner over the scene, panels take
 * the right side with the agent shifting left, full visuals take most of
 * the screen with the agent tucked into a corner. The zone scrolls (by
 * keyboard: arrows and PageUp/PageDown while the input is empty) instead
 * of clipping long content. Floating overlays (reply, status, confirm and
 * reminder cards, a glance root) render in their own layer over the whole
 * stage, not inside the zone, so their anchors are the screen's corners
 * and the gutter beside a full visual is really beside it (review
 * 2026-10-30 round 5).
 */
export function Stage({ spec, agent, fire, onInvalid }: Props) {
  const mode = placement(spec);
  const agentClass = {
    none: "inset-0",
    glance: "inset-0",
    panel: "top-0 bottom-0 left-0 w-[38%]",
    full: "left-2 h-56 w-56",
  }[mode];
  const agentStyle = mode === "full" ? { bottom: ABOVE_FOOTER } : undefined;
  const uiClass = {
    none: "inset-0 pointer-events-none",
    glance: "inset-0 pointer-events-none",
    panel: "top-16 left-[40%] right-6",
    full: "top-14 left-6 right-6",
  }[mode];
  // A full visual gives up a column on the right while floating cards are
  // up, so a reply or a reminder never covers its data (review 2026-10-30
  // round 5); the cards render in that column (overlayAnchor "gutter").
  const gutter = needsGutter(spec, mode);
  const uiStyle = mode === "panel" || mode === "full" ? { bottom: ABOVE_FOOTER, ...(gutter ? { right: GUTTER_INSET } : {}) } : undefined;
  return (
    <div className="absolute inset-0" data-placement={mode} data-gutter={gutter ? "1" : undefined}>
      <div className={`absolute flex items-center justify-center transition-all duration-700 ease-out ${agentClass}`} style={agentStyle} aria-hidden>
        {agent}
      </div>
      <div
        className={`absolute overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all duration-500 ${uiClass}`}
        style={uiStyle}
        data-testid="ui-zone"
      >
        <ErrorBoundary label="generated UI failed to render" resetKey={spec} onError={(e) => onInvalid?.("render", e.message)}>
          <Renderer spec={spec} fire={fire} onInvalid={onInvalid} layer="root" />
        </ErrorBoundary>
      </div>
      <div className="pointer-events-none absolute inset-0" data-testid="overlay-layer">
        <ErrorBoundary label="overlay failed to render" resetKey={spec} onError={(e) => onInvalid?.("render", e.message)}>
          <Renderer spec={spec} fire={fire} onInvalid={onInvalid} layer="overlays" />
        </ErrorBoundary>
      </div>
    </div>
  );
}
