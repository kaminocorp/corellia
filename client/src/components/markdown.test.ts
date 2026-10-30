import { describe, expect, it } from "vitest";

import { parseInline, parseMarkdown } from "./markdown";

describe("markdown", () => {
  it("parses inline emphasis and code", () => {
    expect(parseInline("a **b** c `d` *e* _f_")).toEqual([
      { kind: "text", text: "a " },
      { kind: "bold", text: "b" },
      { kind: "text", text: " c " },
      { kind: "code", text: "d" },
      { kind: "text", text: " " },
      { kind: "italic", text: "e" },
      { kind: "text", text: " " },
      { kind: "italic", text: "f" },
    ]);
  });
  it("parses blocks", () => {
    const blocks = parseMarkdown("# Title\n\npara one\nstill one\n\n- a\n- b\n\n1. x\n2) y\n\n<b>no html</b>");
    expect(blocks.map((b) => b.kind)).toEqual(["heading", "paragraph", "list", "list", "paragraph"]);
    expect(blocks[1]).toEqual({ kind: "paragraph", inlines: [{ kind: "text", text: "para one still one" }] });
    expect(blocks[2]).toMatchObject({ ordered: false, items: [[{ kind: "text", text: "a" }], [{ kind: "text", text: "b" }]] });
    expect(blocks[3]).toMatchObject({ ordered: true });
    expect(blocks[4]).toEqual({ kind: "paragraph", inlines: [{ kind: "text", text: "<b>no html</b>" }] });
  });
});
