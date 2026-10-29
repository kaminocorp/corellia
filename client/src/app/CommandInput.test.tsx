import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommandInput } from "./CommandInput";

describe("CommandInput", () => {
  it("is focused on mount without a click", () => {
    render(<CommandInput onSubmit={() => {}} />);
    expect(screen.getByLabelText("Message")).toHaveFocus();
  });

  it("submits trimmed text on Enter and clears", () => {
    const onSubmit = vi.fn();
    render(<CommandInput onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Message") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  hello  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("hello");
    expect(input.value).toBe("");
  });

  it("ignores empty submissions and clears on Escape", () => {
    const onSubmit = vi.fn();
    render(<CommandInput onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Message") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "draft" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
  });

  it("regains focus when a printable key is pressed elsewhere", () => {
    vi.useFakeTimers();
    render(
      <>
        <button>other</button>
        <CommandInput onSubmit={() => {}} />
      </>,
    );
    const input = screen.getByLabelText("Message");
    screen.getByText("other").focus();
    vi.runAllTimers(); // blur handler refocuses on a timer
    expect(input).toHaveFocus();
    vi.useRealTimers();
  });
});
