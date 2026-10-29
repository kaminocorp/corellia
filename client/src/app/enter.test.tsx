import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ResolvedAction } from "../components/types";
import { useGlobalKeys, type GlobalKeyHandlers } from "../renderer/useGlobalKeys";
import { CommandInput } from "./CommandInput";

/**
 * Regression for review 2026-10-29 item 3: pressing Enter to send a
 * message must not also confirm the pending proposal whose card is bound
 * to Enter. Enter on an empty input still reaches the card.
 */
function Harness({ fire }: { fire: (id: string, node: string) => void }) {
  const value = useRef("");
  const confirm: ResolvedAction = { id: "yes", label: "Do it", hotkey: "enter", slot: "confirm", nodeId: "card" };
  const h: GlobalKeyHandlers = {
    inputEmpty: () => value.current === "",
    hotkeys: new Map([["yes", confirm]]),
    fire,
    cancel: () => false,
    clear: () => {},
  };
  useGlobalKeys(h);
  return <CommandInput onSubmit={() => {}} onValueChange={(v) => (value.current = v)} />;
}

describe("Enter with a pending proposal", () => {
  it("sends the message without confirming, and confirms only on an empty input", () => {
    const fire = vi.fn();
    render(<Harness fire={fire} />);
    const input = screen.getByLabelText("Message");
    fireEvent.change(input, { target: { value: "what's the weather" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(fire).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(fire).toHaveBeenCalledWith("yes", "card");
    expect(fire).toHaveBeenCalledTimes(1);
  });
});
