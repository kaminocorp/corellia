import { Fragment, type ReactNode } from "react";

import { parseMarkdown, type Inline } from "./markdown";
import { ActionBar, Label, Panel } from "./primitives";
import type { ComponentImpl } from "./types";

export const Card: ComponentImpl = ({ props, slot, actions, fire }) => (
  <Panel accent={String(props.accent ?? "none")} className="flex min-h-0 flex-col">
    {props.title !== undefined && <h2 className="font-mono text-lg tracking-wide text-foreground">{String(props.title)}</h2>}
    {props.subtitle !== undefined && <p className="mb-2 text-sm text-muted-foreground">{String(props.subtitle)}</p>}
    <div className="flex min-h-0 flex-col gap-3">{slot("body")}</div>
    <ActionBar actions={actions} fire={fire} />
  </Panel>
);

function renderInlines(inlines: Inline[]): ReactNode {
  return inlines.map((inl, i) => {
    switch (inl.kind) {
      case "bold":
        return <strong key={i}>{inl.text}</strong>;
      case "italic":
        return <em key={i}>{inl.text}</em>;
      case "code":
        return (
          <code key={i} className="bg-muted px-1 font-mono text-[0.9em]">
            {inl.text}
          </code>
        );
      default:
        return <Fragment key={i}>{inl.text}</Fragment>;
    }
  });
}

const SIZE: Record<string, string> = { sm: "text-sm", md: "text-base", lg: "text-xl" };

export const Markdown: ComponentImpl = ({ props }) => {
  const blocks = parseMarkdown(String(props.text ?? ""));
  return (
    <div className={`flex flex-col gap-2 leading-relaxed ${SIZE[String(props.size)] ?? SIZE.md}`}>
      {blocks.map((b, i) => {
        if (b.kind === "heading") {
          const Tag = (`h${b.level + 1}`) as "h2" | "h3" | "h4";
          return (
            <Tag key={i} className="font-mono tracking-wide text-foreground">
              {renderInlines(b.inlines)}
            </Tag>
          );
        }
        if (b.kind === "list") {
          const Tag = b.ordered ? "ol" : "ul";
          return (
            <Tag key={i} className={`ml-5 ${b.ordered ? "list-decimal" : "list-disc"}`}>
              {b.items.map((it, j) => (
                <li key={j}>{renderInlines(it)}</li>
              ))}
            </Tag>
          );
        }
        return <p key={i}>{renderInlines(b.inlines)}</p>;
      })}
    </div>
  );
};

const TREND: Record<string, string> = { up: "↑", down: "↓", flat: "→" };

export const Stat: ComponentImpl = ({ props }) => (
  <Panel className="min-w-[12rem]">
    <Label>{String(props.label ?? "")}</Label>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="font-mono text-5xl text-foreground">{String(props.value ?? "")}</span>
      {props.unit !== undefined && <span className="text-xl text-muted-foreground">{String(props.unit)}</span>}
    </div>
    {(props.delta !== undefined || props.trend !== undefined) && (
      <div className="mt-1 text-sm text-muted-foreground">
        {props.trend !== undefined && <span className="mr-1 text-primary">{TREND[String(props.trend)] ?? ""}</span>}
        {props.delta !== undefined && String(props.delta)}
      </div>
    )}
  </Panel>
);

const ICON: Record<string, string> = { dot: "·", check: "✓", clock: "◷", pin: "⌖", alert: "!", star: "★" };

type ListItem = { title: string; subtitle?: string; icon?: string; done?: boolean };

export const List: ComponentImpl = ({ props }) => {
  const items = (props.items as ListItem[]) ?? [];
  const Tag = props.ordered ? "ol" : "ul";
  return (
    <Tag className="flex flex-col gap-2">
      {items.map((it, i) => (
        <li key={i} className={`flex gap-3 ${it.done ? "text-muted-foreground line-through" : ""}`}>
          <span className="w-5 shrink-0 text-center font-mono text-primary">{props.ordered ? i + 1 : (ICON[it.icon ?? "dot"] ?? "·")}</span>
          <span>
            <span className="text-foreground">{it.title}</span>
            {it.subtitle && <span className="block text-sm text-muted-foreground">{it.subtitle}</span>}
          </span>
        </li>
      ))}
    </Tag>
  );
};

type Column = { key: string; label: string; align?: "left" | "right" | "center" };

export const Table: ComponentImpl = ({ props }) => {
  const columns = (props.columns as Column[]) ?? [];
  const rows = (props.rows as Record<string, unknown>[]) ?? [];
  const align = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");
  return (
    <table className="w-full border-collapse font-mono text-sm">
      {props.caption !== undefined && <caption className="mb-2 text-left text-muted-foreground">{String(props.caption)}</caption>}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} className={`border-b border-border py-1 pr-3 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground ${align(c.align)}`}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border/50">
            {columns.map((c) => (
              <td key={c.key} className={`py-1.5 pr-3 ${align(c.align)}`}>
                {r[c.key] === null || r[c.key] === undefined ? "" : String(r[c.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

type TimelineItem = { time: string; title: string; detail?: string; state?: "past" | "current" | "upcoming" };

export const Timeline: ComponentImpl = ({ props }) => {
  const items = (props.items as TimelineItem[]) ?? [];
  return (
    <ol className="flex flex-col">
      {items.map((it, i) => {
        const state = it.state ?? "upcoming";
        const dot = state === "current" ? "bg-primary animate-telemetry" : state === "past" ? "bg-muted-foreground" : "border border-muted-foreground";
        return (
          <li key={i} className={`flex gap-4 py-1.5 ${state === "past" ? "text-muted-foreground" : "text-foreground"}`}>
            <span className="w-14 shrink-0 font-mono text-sm">{it.time}</span>
            <span className="relative flex w-3 shrink-0 justify-center">
              <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dot}`} />
              {i < items.length - 1 && <span className="absolute top-4 bottom-[-0.9rem] w-px bg-border" />}
            </span>
            <span>
              <span className={state === "current" ? "text-primary" : ""}>{it.title}</span>
              {it.detail && <span className="block text-sm text-muted-foreground">{it.detail}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export const Image: ComponentImpl = ({ props }) => (
  <img
    src={String(props.src)}
    alt={String(props.alt ?? "")}
    loading="lazy"
    decoding="async"
    referrerPolicy="no-referrer"
    className={`h-full w-full ${props.fit === "cover" ? "object-cover" : "object-contain"}`}
  />
);

const LEVEL: Record<string, string> = { info: "text-foreground", ok: "text-primary", warn: "text-accent-amber", error: "text-destructive" };

export const Status: ComponentImpl = ({ props }) => (
  <Panel className="flex items-center gap-3">
    <span className={`h-2 w-2 shrink-0 rounded-full ${props.level === "error" ? "bg-destructive" : props.level === "warn" ? "bg-accent-amber" : props.level === "ok" ? "bg-primary" : "bg-muted-foreground"}`} />
    <span className={`font-mono text-sm ${LEVEL[String(props.level)] ?? LEVEL.info}`}>{String(props.text ?? "")}</span>
  </Panel>
);

const RISK: Record<string, string> = { low: "text-muted-foreground", medium: "text-accent-amber", high: "text-destructive" };

export const Confirm: ComponentImpl = ({ props, actions, fire }) => (
  <Panel accent="primary">
    <Label>Confirm</Label>
    <h2 className="mt-1 font-mono text-lg text-foreground">{String(props.title ?? "")}</h2>
    {props.detail !== undefined && <p className="mt-1 text-sm text-muted-foreground">{String(props.detail)}</p>}
    <div className={`mt-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] ${RISK[String(props.risk)] ?? RISK.low}`}>risk {String(props.risk ?? "low")}</div>
    <ActionBar actions={actions} fire={fire} />
  </Panel>
);
