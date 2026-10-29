import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { startHeartbeat } from "../session/heartbeat";
import { startSoak } from "../session/soak";
import { ErrorBoundary } from "./ErrorBoundary";
import { OfflineBanner } from "./OfflineBanner";

function Boom(): never {
  throw new Error("kaboom");
}

describe("hardening", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("ErrorBoundary contains a render failure and reports it", () => {
    const onError = vi.fn();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary onError={onError} label="ui">
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("ui: kaboom");
    expect(onError).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("OfflineBanner shows only when not online", () => {
    const { rerender } = render(<OfflineBanner status="online" />);
    expect(screen.queryByRole("status")).toBeNull();
    rerender(<OfflineBanner status="reconnecting" />);
    expect(screen.getByRole("status")).toHaveTextContent("reconnecting");
    rerender(<OfflineBanner status="offline" />);
    expect(screen.getByRole("status")).toHaveTextContent("unreachable");
  });

  it("heartbeat posts immediately and on the interval until stopped", () => {
    const f = vi.fn(async () => new Response("{}"));
    const stop = startHeartbeat(1000, f as unknown as typeof fetch);
    expect(f).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2500);
    expect(f).toHaveBeenCalledTimes(3);
    stop();
    vi.advanceTimersByTime(5000);
    expect(f).toHaveBeenCalledTimes(3);
  });

  it("soak cycles the script", () => {
    const send = vi.fn<(text: string) => Promise<unknown>>(async () => ({}));
    const stop = startSoak(100, send);
    vi.advanceTimersByTime(650);
    expect(send).toHaveBeenCalledTimes(7);
    expect(send.mock.calls[0][0]).toBe("what time is it");
    stop();
  });
});
