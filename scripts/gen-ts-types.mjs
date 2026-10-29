// Generates TypeScript types from shared/schema/*.schema.json using
// json-schema-to-typescript (installed in client/). Invoked by
// scripts/contracts-generate.sh; not meant to be run by hand.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const [schemaDir, outDir] = process.argv.slice(2).map((p) => resolve(p));
const require = createRequire(join(resolve(schemaDir, "../../client"), "package.json"));
const { compile } = require("json-schema-to-typescript");

const files = [
  ["ui-spec.schema.json", "uispec.ts"],
  ["ops.schema.json", "ops.ts"],
  ["events.schema.json", "events.ts"],
  ["api.schema.json", "api.ts"],
  ["catalog.schema.json", "catalog.ts"],
];

mkdirSync(outDir, { recursive: true });
for (const [input, output] of files) {
  const schema = JSON.parse(readFileSync(join(schemaDir, input), "utf8"));
  const ts = await compile(schema, schema.title, {
    cwd: schemaDir,
    bannerComment:
      "/* eslint-disable */\n/**\n * Generated from shared/schema/" +
      input +
      " by scripts/contracts-generate.sh. DO NOT EDIT.\n */",
    additionalProperties: true,
    declareExternallyReferenced: true,
    strictIndexSignatures: false,
    style: { singleQuote: false, semi: true, printWidth: 110 },
  });
  writeFileSync(join(outDir, output), ts);
}
