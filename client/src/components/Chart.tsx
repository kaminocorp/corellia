import { areaPath, buildScales, linePath, niceTicks, type Series } from "./chart-geometry";
import type { ComponentImpl } from "./types";

const COLORS = ["var(--color-primary)", "var(--color-accent-cyan)", "var(--color-accent-violet)", "var(--color-accent-amber)", "var(--color-accent-rose)", "var(--color-accent-blue)"];

const W = 400;
const H = 200;
const PAD = { l: 36, r: 8, t: 8, b: 24 };

/** Bar, line or area chart as responsive inline SVG. */
export const Chart: ComponentImpl = ({ props }) => {
  const series = (props.series as Series[]) ?? [];
  const kind = String(props.kind ?? "line");
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;
  const sc = buildScales(series, pw, ph, props.y_min as number | undefined, props.y_max as number | undefined);
  const ticks = niceTicks(sc.yMin, sc.yMax, 4);
  const n = sc.categories.length;
  const index = new Map(sc.categories.map((c, i) => [c, i]));
  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${kind} chart`}>
        <g transform={`translate(${PAD.l},${PAD.t})`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={0} x2={pw} y1={sc.y(t)} y2={sc.y(t)} stroke="var(--color-border)" strokeWidth={0.5} />
              <text x={-6} y={sc.y(t)} fontSize={9} textAnchor="end" dominantBaseline="middle" fill="var(--color-muted-foreground)" fontFamily="var(--font-mono)">
                {t}
              </text>
            </g>
          ))}
          {sc.categories.map((c, i) => (
            <text key={c} x={sc.x(i, n)} y={ph + 14} fontSize={9} textAnchor="middle" fill="var(--color-muted-foreground)" fontFamily="var(--font-mono)">
              {c}
            </text>
          ))}
          {series.map((s, si) => {
            const color = COLORS[si % COLORS.length];
            const pts: Array<[number, number]> = s.points.map((p) => [sc.x(index.get(String(p.x)) ?? 0, n), sc.y(p.y)]);
            if (kind === "bar") {
              const bw = (pw / Math.max(1, n)) * (0.7 / series.length);
              return (
                <g key={s.name}>
                  {s.points.map((p, i) => {
                    const cx = sc.x(index.get(String(p.x)) ?? 0, n) - (bw * series.length) / 2 + si * bw;
                    const y = sc.y(Math.max(p.y, sc.yMin));
                    const base = sc.y(Math.max(0, sc.yMin));
                    return <rect key={i} x={cx} y={Math.min(y, base)} width={bw} height={Math.abs(base - y)} fill={color} opacity={0.85} />;
                  })}
                </g>
              );
            }
            return (
              <g key={s.name}>
                {kind === "area" && <path d={areaPath(pts, ph)} fill={color} opacity={0.18} />}
                <path d={linePath(pts)} fill="none" stroke={color} strokeWidth={1.8} />
                {pts.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={2.2} fill={color} />
                ))}
              </g>
            );
          })}
        </g>
      </svg>
      {(series.length > 1 || props.y_label !== undefined) && (
        <figcaption className="mt-1 flex gap-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          {props.y_label !== undefined && <span>{String(props.y_label)}</span>}
          {series.length > 1 &&
            series.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name}
              </span>
            ))}
        </figcaption>
      )}
    </figure>
  );
};
