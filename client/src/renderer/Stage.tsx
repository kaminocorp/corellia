import type { ReactNode } from "react";

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
 * Lays out the agent and the generated UI. The root's fit decides the
 * zone: glance overlays float in a corner over the scene, panels take
 * the right side with the agent shifting left, full visuals take most of
 * the screen with the agent tucked into a corner.
 */
export function Stage({ spec, agent, fire, onInvalid }: Props) {
  const mode = placement(spec);
  const agentClass = {
    none: "inset-0",
    glance: "inset-0",
    panel: "top-0 bottom-0 left-0 w-[38%]",
    full: "left-4 bottom-28 h-40 w-40",
  }[mode];
  const uiClass = {
    none: "hidden",
    glance: "inset-0 pointer-events-none",
    panel: "top-16 bottom-36 left-[40%] right-6",
    full: "top-14 bottom-36 left-6 right-6",
  }[mode];
  return (
    <div className="absolute inset-0" data-placement={mode}>
      <div className={`absolute flex items-center justify-center transition-all duration-700 ease-out ${agentClass}`} aria-hidden>
        {agent}
      </div>
      <div className={`absolute overflow-hidden transition-all duration-500 ${uiClass}`} data-testid="ui-zone">
        <Renderer spec={spec} fire={fire} onInvalid={onInvalid} />
      </div>
    </div>
  );
}
