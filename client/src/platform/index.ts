/**
 * The platform adapter (VISION 4.1): everything that differs between a
 * normal browser and a native shell on the box lives behind this
 * interface. The browser implementation is the only real one; the shell
 * implementation is a NotImplemented stub (roadmap rule 7).
 */
export type PlatformAdapter = {
  readonly name: "browser" | "shell";
  /** Opens the microphone with echo cancellation and noise suppression. */
  getMicStream(): Promise<MediaStream>;
  /** True when running full-screen on the display box. */
  isKiosk(): boolean;
  /** Heartbeat hook for the box watchdog (Phase 10). */
  heartbeat(): void;
};

export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`${what} is not implemented on this platform`);
  }
}

export const browserPlatform: PlatformAdapter = {
  name: "browser",
  async getMicStream() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("microphone access is not available");
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      video: false,
    });
  },
  isKiosk() {
    return document.documentElement.dataset.kiosk === "1";
  },
  heartbeat() {},
};

/** Native Linux shell (Tauri/Electron): deferred, see roadmap question 8. */
export const shellPlatform: PlatformAdapter = {
  name: "shell",
  async getMicStream() {
    throw new NotImplementedError("shell microphone access");
  },
  isKiosk() {
    return true;
  },
  heartbeat() {
    throw new NotImplementedError("shell watchdog heartbeat");
  },
};

export function detectPlatform(): PlatformAdapter {
  const w = window as unknown as { __TAURI__?: unknown; corelliaShell?: unknown };
  return w.__TAURI__ || w.corelliaShell ? shellPlatform : browserPlatform;
}
