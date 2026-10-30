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

  it("ErrorBoundary recovers only when resetKey changes", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary label="ui" resetKey={1}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(
      <ErrorBoundary label="ui" resetKey={1}>
        <span>fine now</span>
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument(); // children identity alone is no signal
    rerender(
      <ErrorBoundary label="ui" resetKey={2}>
        <span>fine now</span>
      </ErrorBoundary>,
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("fine now")).toBeInTheDocument();
    spy.mockRestore();
  });

  it("OfflineBanner shows only when not online", () => {
    const { rerender } = render(<OfflineBanner status="online" />);
    expect(screen.queryByRole("status")).toBeNull();
    rerender(<OfflineBanner status="reconnecting" />);
    expect(screen.getByRole("status")).toHaveTextContent("reconnecting");
    rerender(<OfflineBanner status="offline" />);
    expect(screen.getByRole("status")).toHaveTextContent("unreachable");
    rerender(<OfflineBanner status="unauthorized" />);
    expect(screen.getByRole("status")).toHaveTextContent("token rejected");
    rerender(<OfflineBanner status="forbidden" />);
    expect(screen.getByRole("status")).toHaveTextContent("request refused");
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

  it("heartbeat is tagged with the client kind and reports the kiosk age and store health back (phase 17)", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ ok: true, kiosk_heartbeat_age_s: 12, store_ok: false }), { headers: { "Content-Type": "application/json" } }));
    const onStatus = vi.fn();
    const stop = startHeartbeat({ intervalMs: 1000, client: "kiosk", onStatus, fetchImpl: f as unknown as typeof fetch });
    const calls = (fn: typeof f) => fn.mock.calls as unknown as [string, RequestInit][];
    const init = calls(f)[0]![1];
    expect(JSON.parse(init.body as string)).toEqual({ client: "kiosk" });
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    await vi.advanceTimersByTimeAsync(0);
    expect(onStatus).toHaveBeenCalledWith({ kioskAgeS: 12, storeOk: false });
    stop();
    // The default is a browser; an answer without the fields means no kiosk and a healthy store.
    const g = vi.fn(async () => new Response("{}", { headers: { "Content-Type": "application/json" } }));
    const onStatus2 = vi.fn();
    const stop2 = startHeartbeat({ intervalMs: 1000, onStatus: onStatus2, fetchImpl: g as unknown as typeof fetch });
    expect(JSON.parse(calls(g)[0]![1].body as string)).toEqual({ client: "browser" });
    await vi.advanceTimersByTimeAsync(0);
    expect(onStatus2).toHaveBeenCalledWith({ kioskAgeS: -1, storeOk: true });
    stop2();
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
