import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { initialState, sessionStore } from "../session/store";
import { ErrorLine } from "./ErrorLine";
import { plainWords } from "./errorWords";

/**
 * The always-visible error line shows plain words for the client's own
 * failures and nothing for a failed turn or a rejected op, which have
 * their own places (review 2026-10-30 round 3, item 4). The raw text is
 * for ?debug=1.
 */
describe("ErrorLine", () => {
  beforeEach(() => {
    act(() => {
      Object.assign(sessionStore, { state: initialState() });
    });
  });

  it("maps codes to plain words and leaves the rest to the debug pane", () => {
    const at = (code: string, message: string) => plainWords({ code, message, ts: "" });
    expect(at("send_failed", "HTTP 503")).toMatch(/didn't send/);
    expect(at("send_failed", "HTTP 503")).not.toContain("503");
    expect(at("runtime", 'POST "http://x/v1/messages": 401 {"type":"error"}')).toBeNull();
    expect(at("runtime_start", "runtime anthropic needs ANTHROPIC_API_KEY")).toBeNull();
    expect(at("image_host_not_allowed", 'Image src host "" is not in the allowed list')).toBeNull();
    expect(at("invalid_op", "unknown node")).toBeNull();
    expect(at("render_invalid", "n1: bad props")).toBeNull();
  });

  it("shows nothing for a rejected op after a turn that worked, and the raw text in debug mode", () => {
    const { rerender } = render(<ErrorLine />);
    act(() => sessionStore.addError("image_host_not_allowed", 'Image src host "" is not in the allowed list (upload.wikimedia.org)'));
    expect(screen.queryByTestId("error-line")).toBeNull();
    act(() => sessionStore.addError("send_failed", "HTTP 503: upstream"));
    expect(screen.getByTestId("error-line")).toHaveTextContent("That didn't send.");
    expect(screen.getByTestId("error-line")).not.toHaveTextContent("503");
    rerender(<ErrorLine debug />);
    expect(screen.getByTestId("error-line")).toHaveTextContent("send_failed: HTTP 503: upstream");
    act(() => sessionStore.addError("runtime", 'POST "http://x/v1/messages": 401 Unauthorized {"type":"error"}'));
    expect(screen.getByTestId("error-line")).toHaveTextContent("runtime: POST");
    rerender(<ErrorLine />);
    expect(screen.queryByTestId("error-line")).toBeNull();
  });
});
