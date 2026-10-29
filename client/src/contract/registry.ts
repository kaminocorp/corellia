/**
 * Runtime validators compiled from the shared schemas with Ajv. Mirrors
 * backend/internal/contract. Compiled once at module load.
 */
import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import { catalog, schemas } from "./schemas";
import type { ComponentDef } from "./gen/catalog";
import type { SpecOp } from "./gen/ops";
import type { UISpec } from "./gen/uispec";
import type { SessionEvent } from "./gen/events";

const ajv = new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true });
addFormats(ajv);
for (const s of Object.values(schemas)) ajv.addSchema(s as object);

const specValidator = ajv.getSchema(schemas.uiSpec.$id)!;
const opValidator = ajv.getSchema(schemas.ops.$id)!;
const eventValidator = ajv.getSchema(schemas.events.$id)!;
const catalogValidator = ajv.getSchema(schemas.catalog.$id)!;

if (!catalogValidator(catalog)) {
  throw new Error("shared/catalog/catalog.json does not match catalog.schema.json: " + ajv.errorsText(catalogValidator.errors));
}

const propsValidators = new Map<string, ValidateFunction>();
for (const [name, def] of Object.entries(catalog.components)) {
  propsValidators.set(name, ajv.compile(def.props as object));
}

export const componentNames: readonly string[] = Object.keys(catalog.components).sort();

export function component(name: string): ComponentDef | undefined {
  return catalog.components[name];
}

export type ValidationResult = { ok: true } | { ok: false; message: string; errors: ErrorObject[] };

function result(fn: ValidateFunction, value: unknown): ValidationResult {
  if (fn(value)) return { ok: true };
  const errors = fn.errors ?? [];
  return { ok: false, message: ajv.errorsText(errors, { separator: "; " }), errors };
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
  const fn = ajv.getSchema(`${schemas.api.$id}#/$defs/${def}`);
  if (!fn) return { ok: false, message: `unknown api definition ${def}`, errors: [] };
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
  return { ok: false, message: ajv.errorsText(remaining, { separator: "; " }), errors: remaining };
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
