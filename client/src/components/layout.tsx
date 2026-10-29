import { GAP } from "./styles";
import type { ComponentImpl } from "./types";

const ALIGN: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };

export const Stack: ComponentImpl = ({ props, slot }) => {
  const direction = props.direction === "row" ? "flex-row" : "flex-col";
  return <div className={`flex ${direction} ${GAP[String(props.gap)] ?? GAP.md} ${ALIGN[String(props.align)] ?? ALIGN.stretch} min-h-0 min-w-0`}>{slot("children")}</div>;
};

export const Grid: ComponentImpl = ({ props, slot }) => {
  const columns = Math.min(6, Math.max(1, Number(props.columns ?? 2)));
  return (
    <div className={`grid ${GAP[String(props.gap)] ?? GAP.md} min-h-0 min-w-0`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {slot("children")}
    </div>
  );
};

export const Split: ComponentImpl = ({ props, slot }) => {
  const ratio = Math.min(0.8, Math.max(0.2, Number(props.ratio ?? 0.6)));
  const row = props.direction !== "column";
  const style = row
    ? { gridTemplateColumns: `${ratio}fr ${1 - ratio}fr` }
    : { gridTemplateRows: `${ratio}fr ${1 - ratio}fr` };
  return (
    <div className="grid h-full min-h-0 min-w-0 gap-4" style={style}>
      <div className="min-h-0 min-w-0">{slot("left")}</div>
      <div className="min-h-0 min-w-0">{slot("right")}</div>
    </div>
  );
};

const POSITION: Record<string, string> = {
  top_left: "top-6 left-6",
  top_right: "top-6 right-6",
  bottom_left: "bottom-28 left-6",
  bottom_right: "bottom-28 right-6",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

export const Overlay: ComponentImpl = ({ props, slot }) => (
  <>
    {props.dim ? <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden /> : null}
    <div className={`absolute max-w-[28rem] min-w-[16rem] ${POSITION[String(props.position)] ?? POSITION.top_right}`}>{slot("content")}</div>
  </>
);
