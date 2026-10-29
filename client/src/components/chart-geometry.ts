/** Pure geometry for the SVG Chart component. */
export type Point = { x: string | number; y: number };
export type Series = { name: string; points: Point[] };

export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (min === max) return [min];
  const span = max - min;
  const rough = span / Math.max(1, count);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const candidates = [1, 2, 2.5, 5, 10].map((c) => c * pow);
  const step = candidates.find((c) => c >= rough) ?? candidates[candidates.length - 1];
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

export type Scales = {
  categories: string[];
  yMin: number;
  yMax: number;
  x: (index: number, count: number) => number;
  y: (v: number) => number;
};

/** Builds scales for a plot area of width w and height h (origin top-left). */
export function buildScales(series: Series[], w: number, h: number, yMin?: number, yMax?: number): Scales {
  const categories: string[] = [];
  const seen = new Set<string>();
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  for (const s of series) {
    for (const p of s.points) {
      const key = String(p.x);
      if (!seen.has(key)) {
        seen.add(key);
        categories.push(key);
      }
      lo = Math.min(lo, p.y);
      hi = Math.max(hi, p.y);
    }
  }
  if (!Number.isFinite(lo)) {
    lo = 0;
    hi = 1;
  }
  if (yMin !== undefined) lo = Math.min(yMin, lo);
  if (yMax !== undefined) hi = Math.max(yMax, hi);
  if (yMin === undefined && lo > 0) lo = 0; // bars from zero
  if (lo === hi) hi = lo + 1;
  return {
    categories,
    yMin: lo,
    yMax: hi,
    x: (i, count) => ((i + 0.5) / Math.max(1, count)) * w,
    y: (v) => h - ((v - lo) / (hi - lo)) * h,
  };
}

export function linePath(points: Array<[number, number]>): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
}

export function areaPath(points: Array<[number, number]>, baseline: number): string {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath(points)} L${last[0].toFixed(2)} ${baseline.toFixed(2)} L${first[0].toFixed(2)} ${baseline.toFixed(2)} Z`;
}
