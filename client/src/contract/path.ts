/**
 * Binding paths: `$`, `$.a`, `$.a.b[2].c`. Mirrors backend/internal/uispec/path.go.
 */
export type Segment = { key: string } | { index: number };

/**
 * A bound prop value. The schema (`ui-spec.schema.json#/$defs/Binding`) is
 * the source of truth and validates it; this structural type exists
 * because the generator folds `Binding | literal` into `unknown`.
 */
export type Binding = { bind: string };

const PATH_RE = /^\$((?:\.[A-Za-z_][A-Za-z0-9_]*|\[[0-9]+\])*)$/;
const SEG_RE = /\.([A-Za-z_][A-Za-z0-9_]*)|\[([0-9]+)\]/g;

export class PathError extends Error {
  constructor(
    public readonly code: "invalid_op" | "path_not_settable",
    message: string,
  ) {
    super(message);
  }
}

export function parsePath(path: string): Segment[] {
  const m = PATH_RE.exec(path);
  if (!m) throw new PathError("invalid_op", `invalid binding path ${JSON.stringify(path)}`);
  const out: Segment[] = [];
  for (const sm of m[1].matchAll(SEG_RE)) {
    if (sm[1] !== undefined) out.push({ key: sm[1] });
    else out.push({ index: Number(sm[2]) });
  }
  return out;
}

export function isValidPath(path: string): boolean {
  return PATH_RE.test(path);
}

type Json = unknown;

const isObject = (v: unknown): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Resolve never throws: `[value, true]` or `[undefined, false]`. */
export function resolve(data: Record<string, Json>, path: string): [Json, boolean] {
  let segs: Segment[];
  try {
    segs = parsePath(path);
  } catch {
    return [undefined, false];
  }
  let cur: Json = data;
  for (const s of segs) {
    if ("index" in s) {
      if (!Array.isArray(cur) || s.index < 0 || s.index >= cur.length) return [undefined, false];
      cur = cur[s.index];
      continue;
    }
    if (!isObject(cur) || !(s.key in cur)) return [undefined, false];
    cur = cur[s.key];
  }
  return [cur, true];
}

/**
 * Set `value` at `path`, returning a new root (structural sharing: only the
 * containers on the path are copied). `$` replaces the root (object
 * required). Missing keys create objects; an index must be inside an
 * existing array or equal to its length (append).
 */
export function setPath(data: Record<string, Json>, path: string, value: Json): Record<string, Json> {
  const segs = parsePath(path);
  if (segs.length === 0) {
    if (!isObject(value)) throw new PathError("invalid_op", "set_data at $ requires an object value");
    return { ...value };
  }
  const write = (container: Json, i: number): Json => {
    const s = segs[i];
    const last = i === segs.length - 1;
    if ("index" in s) {
      if (!Array.isArray(container) || s.index < 0 || s.index > container.length) {
        throw new PathError("path_not_settable", `${path}: index ${s.index} not settable`);
      }
      const copy = container.slice();
      if (s.index === container.length) {
        if (!last) throw new PathError("path_not_settable", "cannot append and descend in one path");
        copy.push(value);
        return copy;
      }
      copy[s.index] = last ? value : write(copy[s.index] ?? {}, i + 1);
      return copy;
    }
    if (!isObject(container)) {
      throw new PathError("path_not_settable", `${path}: ${JSON.stringify(s.key)} is not inside an object`);
    }
    const copy: Record<string, Json> = { ...container };
    if (last) {
      copy[s.key] = value;
      return copy;
    }
    let next = container[s.key];
    if (next === undefined || next === null) {
      if ("index" in segs[i + 1]) {
        throw new PathError("path_not_settable", `${path}: cannot create an array at ${JSON.stringify(s.key)}`);
      }
      next = {};
    }
    copy[s.key] = write(next, i + 1);
    return copy;
  };
  return write(data, 0) as Record<string, Json>;
}

/** `{bind: path}` with exactly one key and a well-formed path. */
export function isBinding(v: unknown): v is Binding {
  if (!isObject(v)) return false;
  const keys = Object.keys(v);
  return keys.length === 1 && keys[0] === "bind" && typeof v.bind === "string" && PATH_RE.test(v.bind);
}

/** Resolves every binding in props; unresolved keys are dropped and listed (sorted). */
export function resolveProps(
  props: Record<string, unknown>,
  data: Record<string, Json>,
): { resolved: Record<string, unknown>; unresolved: string[] } {
  const resolved: Record<string, unknown> = {};
  const unresolved: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (isBinding(v)) {
      const [val, ok] = resolve(data, v.bind);
      if (!ok) unresolved.push(k);
      else resolved[k] = val;
    } else {
      resolved[k] = v;
    }
  }
  unresolved.sort();
  return { resolved, unresolved };
}
