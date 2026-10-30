/**
 * Runtime validators for the shared schemas and the catalog. They are
 * precompiled by scripts/gen-validators.mjs into gen/validators.js (so no
 * `new Function` runs in the browser and the Content-Security-Policy needs
 * no 'unsafe-eval'); this module only wraps them. Mirrors
 * backend/internal/contract.
 */
import type { ErrorObject, ValidateFunction } from "ajv/dist/2020";

import { catalog, schemas } from "./schemas";
import * as compiled from "./gen/validators";
import type { ComponentDef } from "./gen/catalog";
import type { SpecOp } from "./gen/ops";
import type { UISpec } from "./gen/uispec";
import type { SessionEvent } from "./gen/events";

const validators = compiled as unknown as Record<string, ValidateFunction | undefined>;

const specValidator = compiled.validateUISpec;
const opValidator = compiled.validateOp;
const eventValidator = compiled.validateEvent;
const catalogValidator = compiled.validateCatalog;

/** Same text as Ajv's errorsText: `data<instancePath> <message>` per error. */
export function errorsText(errors: readonly ErrorObject[] | null | undefined, separator = "; "): string {
  if (!errors || errors.length === 0) return "No errors";
  return errors.map((e) => `data${e.instancePath} ${e.message ?? ""}`.trimEnd()).join(separator);
}

if (!catalogValidator(catalog)) {
  throw new Error("shared/catalog/catalog.json does not match catalog.schema.json: " + errorsText(catalogValidator.errors));
}

const propsValidators = new Map<string, ValidateFunction>();
for (const name of Object.keys(catalog.components)) {
  const fn = validators[`validateProps_${name}`];
  if (!fn) throw new Error(`no precompiled props validator for ${name}: run pnpm contracts:generate`);
  propsValidators.set(name, fn);
}

export const componentNames: readonly string[] = Object.keys(catalog.components).sort();

export function component(name: string): ComponentDef | undefined {
  return catalog.components[name];
}

export type ValidationResult = { ok: true } | { ok: false; message: string; errors: ErrorObject[] };

function result(fn: ValidateFunction, value: unknown): ValidationResult {
  if (fn(value)) return { ok: true };
  const errors = fn.errors ?? [];
  return { ok: false, message: errorsText(errors), errors };
}

export function validateSpec(value: unknown): ValidationResult {
  return result(specValidator, value);
}

export function validateOp(value: unknown): ValidationResult {
  return result(opValidator, value);
}

export function validateEvent(value: unknown): ValidationResult {
  return result(eventValidator, value);
}

export function validateApi(def: string, value: unknown): ValidationResult {
  const fn = validators[`validateApi_${def}`];
  if (!fn || !(def in (schemas.api.$defs ?? {}))) return { ok: false, message: `unknown api definition ${def}`, errors: [] };
  return result(fn, value);
}

/**
 * Validates component props. Keys in `bound` are bindings whose value is not
 * known yet: they are removed first, and a `required` failure that only
 * names bound keys is ignored (same rule as the Go side).
 */
export function validateProps(
  componentName: string,
  props: Record<string, unknown>,
  bound: ReadonlySet<string> = new Set(),
): ValidationResult {
  const fn = propsValidators.get(componentName);
  if (!fn) return { ok: false, message: `unknown component ${componentName}`, errors: [] };
  const instance: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) if (!bound.has(k)) instance[k] = v;
  if (fn(instance)) return { ok: true };
  const errors = fn.errors ?? [];
  const remaining = errors.filter((e) => {
    if (e.keyword !== "required" || e.instancePath !== "") return true;
    const missing = (e.params as { missingProperty?: string }).missingProperty ?? "";
    return !bound.has(missing);
  });
  if (remaining.length === 0) return { ok: true };
  return { ok: false, message: errorsText(remaining), errors: remaining };
}

export function isSpecOp(value: unknown): value is SpecOp {
  return validateOp(value).ok;
}

export function isUISpec(value: unknown): value is UISpec {
  return validateSpec(value).ok;
}

export function isSessionEvent(value: unknown): value is SessionEvent {
  return validateEvent(value).ok;
}
