/**
 * Mic activation state (roadmap question 6): off at boot; Ctrl+Space
 * toggles an open, VAD-gated mic (toggle mode) or holds it open (ptt
 * mode); Ctrl+M mutes. Pure state machine; the hook wires DOM events.
 */
export type MicState = "off" | "listening" | "capturing" | "muted";
export type ActivationMode = "toggle" | "ptt";

export type ActivationChange = { from: MicState; to: MicState };

export class Activation {
  state: MicState = "off";
  private beforeMute: MicState = "off";

  constructor(public mode: ActivationMode = "toggle") {}

  private set(to: MicState): ActivationChange | null {
    if (to === this.state) return null;
    const from = this.state;
    this.state = to;
    return { from, to };
  }

  /** Returns the transition caused by a key event, or null. */
  keydown(e: { key: string; code: string; ctrlKey: boolean; metaKey: boolean; repeat: boolean }): ActivationChange | null {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod || e.repeat) return null;
    if (e.code === "Space") {
      if (this.state === "muted") return null;
      if (this.mode === "ptt") return this.set("listening");
      return this.set(this.state === "off" ? "listening" : "off");
    }
    if (e.key.toLowerCase() === "m") return this.toggleMute();
    return null;
  }

  keyup(e: { code: string }): ActivationChange | null {
    if (this.mode === "ptt" && e.code === "Space" && this.state !== "muted" && this.state !== "off") return this.set("off");
    return null;
  }

  toggleMute(): ActivationChange | null {
    if (this.state === "muted") return this.set(this.beforeMute === "capturing" ? "listening" : this.beforeMute);
    this.beforeMute = this.state;
    return this.set("muted");
  }

  /** The VAD reports speech start/end while listening. */
  setCapturing(on: boolean): ActivationChange | null {
    if (on && this.state === "listening") return this.set("capturing");
    if (!on && this.state === "capturing") return this.set("listening");
    return null;
  }

  /** The mic should be open (stream held) in these states. */
  get open(): boolean {
    return this.state === "listening" || this.state === "capturing";
  }
}
