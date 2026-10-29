import { describe, expect, it } from "vitest";

import { PALETTES } from "./palettes";
import { AGENT_STATES, AgentStateMachine, TARGETS } from "./state";

describe("AgentStateMachine", () => {
  it("has targets and palettes for every state", () => {
    for (const s of AGENT_STATES) {
      expect(TARGETS[s]).toBeDefined();
      expect(PALETTES[s]).toBeDefined();
    }
  });

  it("eases toward the new state's targets", () => {
    const m = new AgentStateMachine("idle");
    m.transition("thinking");
    const first = m.step(1 / 60);
    expect(first.rotY).toBeGreaterThan(TARGETS.idle.rotY);
    expect(first.rotY).toBeLessThan(TARGETS.thinking.rotY);
    for (let i = 0; i < 300; i++) m.step(1 / 60);
    const settled = m.step(1 / 60);
    expect(settled.rotY).toBeCloseTo(TARGETS.thinking.rotY, 3);
    expect(settled.palette.tints[0][0]).toBeCloseTo(PALETTES.thinking.tints[0][0], 3);
    expect(m.current).toBe("thinking");
  });

  it("ignores unknown states and clamps dt", () => {
    const m = new AgentStateMachine();
    m.transition("bogus" as never);
    expect(m.current).toBe("idle");
    const f = m.step(5); // huge dt is clamped so values stay finite
    expect(Number.isFinite(f.coherenceNow)).toBe(true);
  });

  it("lets audio modulate coherence only while speaking", () => {
    const m = new AgentStateMachine("idle");
    m.setAudioLevel(1);
    for (let i = 0; i < 60; i++) m.step(1 / 60);
    const idle = m.step(1 / 60);
    expect(idle.audio).toBeCloseTo(0, 3);
    m.transition("speaking");
    for (let i = 0; i < 120; i++) m.step(1 / 60);
    const speaking = m.step(1 / 60);
    expect(speaking.audio).toBeGreaterThan(0.9);
    expect(speaking.coherenceNow).toBeGreaterThan(speaking.coherence);
  });
});
