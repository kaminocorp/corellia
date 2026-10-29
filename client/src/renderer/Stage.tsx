import type { ReactNode } from "react";

import { ErrorBoundary } from "../app/ErrorBoundary";
import type { UISpec } from "../contract";
import { placement } from "./resolve";
import { Renderer } from "./Renderer";

type Props = {
  spec: UISpec;
  agent: ReactNode;
  fire: (actionId: string, nodeId: string) => void;
  onInvalid?: (nodeId: string, message: string) => void;
};

/**
 * The footer's measured extent from the bottom edge (the error line, the
 * transcript, the input and the footer's own offset), set on the display
 * root by App as a CSS variable. The panel and full zones end above it, so
 * a map, table or chart never shares pixels with the transcript whatever
 * the viewport (review 2026-10-30 round 3, item 3: the fixed `bottom-36`
 * left 111-180 px of overlap). The fallback is the old fixed footer for a
 * page that has not measured yet.
 */
export const FOOTER_HEIGHT_VAR = "--footer-h";
const ABOVE_FOOTER = `calc(var(${FOOTER_HEIGHT_VAR}, 9rem) + 0.5rem)`;

/**
 * Lays out the agent and the generated UI. The root's fit decides the
 * zone: glance overlays float in a corner over the scene, panels take
 * the right side with the agent shifting left, full visuals take most of
 * the screen with the agent tucked into a corner. The zone scrolls (by
 * keyboard: arrows and PageUp/PageDown while the input is empty) instead
 * of clipping long content.
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
  const uiStyle = mode === "panel" || mode === "full" ? { bottom: ABOVE_FOOTER } : undefined;
  return (
    <div className="absolute inset-0" data-placement={mode}>
      <div className={`absolute flex items-center justify-center transition-all duration-700 ease-out ${agentClass}`} style={agentStyle} aria-hidden>
        {agent}
      </div>
      <div
        className={`absolute overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all duration-500 ${uiClass}`}
        style={uiStyle}
        data-testid="ui-zone"
      >
        <ErrorBoundary label="generated UI failed to render" resetKey={spec} onError={(e) => onInvalid?.("render", e.message)}>
          <Renderer spec={spec} fire={fire} onInvalid={onInvalid} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
