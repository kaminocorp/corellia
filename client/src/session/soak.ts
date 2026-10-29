import { sendTurn } from "./api";

const SCRIPT = ["what time is it", "show me a map of Lisbon", "make a table of stock", "temperature trend", "schedule", "weather", "clear"];

/**
 * `?soak=1`: sends a scripted turn every few seconds forever, for leak
 * checks and the 24 h stability test (VISION 7, step 5). Watch memory in
 * the browser task manager and `?stats=1` for frame-time drift.
 */
export function startSoak(intervalMs = 8_000, send: (text: string) => Promise<unknown> = (t) => sendTurn(t, "keyboard")): () => void {
  let i = 0;
  const tick = () => {
    send(SCRIPT[i % SCRIPT.length]).catch(() => {});
    i++;
  };
  tick();
  const id = window.setInterval(tick, intervalMs);
  return () => window.clearInterval(id);
}
