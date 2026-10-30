// Precompiles the Ajv validators for shared/schema/*.schema.json and every
// component's props schema into one ES module, so the client never calls
// `new Function` at runtime and the Content-Security-Policy can drop
// 'unsafe-eval'. Invoked by scripts/contracts-generate.sh; the drift test in
// client/src/contract/validators.test.ts regenerates and compares.
//
//   node scripts/gen-validators.mjs <shared dir> <out file>
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const [sharedDir, outFile] = process.argv.slice(2).map((p) => resolve(p));
const require = createRequire(join(resolve(sharedDir, "../client"), "package.json"));
const Ajv2020 = require("ajv/dist/2020").default;
const addFormats = require("ajv-formats").default;
const standaloneCode = require("ajv/dist/standalone").default;

const read = (p) => JSON.parse(readFileSync(join(sharedDir, p), "utf8"));
const schemas = {
  uiSpec: read("schema/ui-spec.schema.json"),
  ops: read("schema/ops.schema.json"),
  events: read("schema/events.schema.json"),
  api: read("schema/api.schema.json"),
  catalog: read("schema/catalog.schema.json"),
};
const catalog = read("catalog/catalog.json");

// Same options as the runtime instance had, plus source generation.
const ajv = new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true, code: { source: true, esm: true, lines: true } });
addFormats(ajv);
for (const s of Object.values(schemas)) ajv.addSchema(s);

export const PROPS_ID = "https://corellia.dev/catalog/props/";
const exportsMap = {
  validateUISpec: schemas.uiSpec.$id,
  validateOp: schemas.ops.$id,
  validateEvent: schemas.events.$id,
  validateCatalog: schemas.catalog.$id,
};
// The API schema is a bag of $defs; each one is a named export.
for (const def of Object.keys(schemas.api.$defs ?? {})) exportsMap[`validateApi_${def}`] = `${schemas.api.$id}#/$defs/${def}`;
for (const [name, def] of Object.entries(catalog.components)) {
  const id = `${PROPS_ID}${name}.json`;
  ajv.addSchema({ $id: id, ...def.props });
  exportsMap[`validateProps_${name}`] = id;
}

// Every export must resolve before standaloneCode runs (it compiles lazily).
for (const id of Object.values(exportsMap)) {
  if (!ajv.getSchema(id)) throw new Error(`cannot compile ${id}`);
}

let code = standaloneCode(ajv, exportsMap);
// Ajv emits require() for its runtime helpers even in ESM mode. The module
// is imported by the browser bundle, so those become imports of the small
// hand-written runtime next to the generated file (same algorithms).
code = code
  .replace(/require\("ajv\/dist\/runtime\/(\w+)"\)\.default/g, (_, name) => `rt.${name}`)
  .replace(/require\("ajv-formats\/dist\/formats"\)\.fullFormats\[("[^"]+")\]/g, (_, name) => `rt.formats[${name}]`);
const leftover = code.match(/require\([^)]*\)/);
if (leftover) throw new Error(`generated validators still contain ${leftover[0]}: add it to client/src/contract/validatorRuntime.ts`);
code = code.replace(/^"use strict";/, '"use strict";\nimport * as rt from "../validatorRuntime";');
const banner = `/* eslint-disable */\n// Generated from shared/schema and shared/catalog by scripts/contracts-generate.sh\n// (scripts/gen-validators.mjs, Ajv ${require("ajv/package.json").version}). DO NOT EDIT.\n// Precompiled so the client runs under a Content-Security-Policy without 'unsafe-eval'.\n`;
code = banner + code + "\n";

// A declaration file so TypeScript sees typed validators.
const names = Object.keys(exportsMap);
const dts = [
  "/* eslint-disable */",
  "// Generated alongside validators.js by scripts/gen-validators.mjs. DO NOT EDIT.",
  'import type { ValidateFunction } from "ajv/dist/2020";',
  ...names.map((n) => `export declare const ${n}: ValidateFunction;`),
  "",
].join("\n");

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, code);
writeFileSync(outFile.replace(/\.js$/, ".d.ts"), dts);
