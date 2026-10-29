import { describe, expect, it } from "vitest";

import { EnergyVAD, rms } from "./vad";

function run(vad: EnergyVAD, levels: number[], stepMs = 20) {
  const events: Array<[number, string]> = [];
  levels.forEach((l, i) => {
    const ev = vad.update(l, i * stepMs);
    if (ev) events.push([i * stepMs, ev]);
  });
  return events;
}

describe("EnergyVAD", () => {
  it("needs a minimum speech run and a silence hangover", () => {
    const vad = new EnergyVAD({ threshold: 0.02, minSpeechMs: 100, hangoverMs: 200 });
    const quiet = Array(10).fill(0.001);
    const blip = [0.1, 0.1]; // 40 ms: too short
    const speech = Array(10).fill(0.1); // 200 ms
    const events = run(vad, [...quiet, ...blip, ...quiet, ...speech, ...Array(15).fill(0.001)]);
    expect(events.map((e) => e[1])).toEqual(["start", "end"]);
    expect(events[0][0]).toBe((10 + 2 + 10 + 5) * 20); // start fires once the run reaches 100 ms
    expect(events[1][0] - events[0][0]).toBeGreaterThanOrEqual(200);
  });

  it("adapts the floor to steady noise and caps utterance length", () => {
    const vad = new EnergyVAD({ threshold: 0.05, floorRatio: 2.5, minSpeechMs: 40, hangoverMs: 100, maxUtteranceMs: 300 });
    run(vad, Array(200).fill(0.03)); // steady noise below the gate raises the floor
    expect(vad.gate).toBeGreaterThan(0.06);
    const events = run(vad, Array(40).fill(0.5));
    expect(events.slice(0, 2).map((e) => e[1])).toEqual(["start", "end"]); // ended by the 300 ms cap, then restarts
    expect(events[1][0] - events[0][0]).toBeLessThanOrEqual(320);
  });

  it("computes rms", () => {
    expect(rms(new Float32Array([0.5, -0.5, 0.5, -0.5]))).toBeCloseTo(0.5);
    expect(rms(new Float32Array())).toBe(0);
  });
});
