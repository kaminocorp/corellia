import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Agent3D, canRender3D } from "./Agent3D";
import { gaussianSphere } from "./Nebula";

describe("Agent3D", () => {
  it("falls back to the static silhouette without WebGL2 (jsdom)", () => {
    expect(canRender3D()).toBe(false);
    render(<Agent3D state="thinking" />);
    expect(screen.getByTestId("agent-fallback")).toHaveAttribute("aria-label", "agent thinking");
  });

  it("samples a Gaussian sphere deterministically", () => {
    let seed = 1;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pts = gaussianSphere(100, 0.4, rand);
    expect(pts).toHaveLength(300);
    const radii = Array.from({ length: 100 }, (_, i) => Math.hypot(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]));
    const mean = radii.reduce((a, b) => a + b, 0) / radii.length;
    expect(mean).toBeGreaterThan(0.2);
    expect(mean).toBeLessThan(0.8);
  });
});
