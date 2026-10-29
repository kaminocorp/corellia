import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regenerates the TS types and the precompiled validators into a temp dir
 * and compares with the committed output, so a schema or catalog change
 * without `scripts/contracts-generate.sh` fails here (the Go side has the
 * same test for its output).
 */
describe("generated TS types are fresh", () => {
  it("matches scripts/contracts-generate.sh output", () => {
    const root = resolve(__dirname, "../../..");
    const out = mkdtempSync(join(tmpdir(), "corellia-gen-"));
    execFileSync("node", [join(root, "scripts/gen-ts-types.mjs"), join(root, "shared/schema"), out], { stdio: "pipe" });
    execFileSync("node", [join(root, "scripts/gen-validators.mjs"), join(root, "shared"), join(out, "validators.js")], { stdio: "pipe" });
    const committed = resolve(__dirname, "gen");
    const files = readdirSync(out).sort();
    expect(files).toEqual(readdirSync(committed).sort());
    for (const f of files) {
      expect(readFileSync(join(out, f), "utf8"), `${f} is stale: run scripts/contracts-generate.sh`).toBe(
        readFileSync(join(committed, f), "utf8"),
      );
    }
  });
});
