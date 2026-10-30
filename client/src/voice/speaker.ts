/**
 * Which client speaks (phase 17). With a Mac browser and the display box on
 * one backend, every connected page used to play every reply: two voices,
 * slightly out of step, each a barge-in for the other's microphone (review
 * 2026-10-30 round 5). The rule: the kiosk always speaks; a browser speaks
 * unless a kiosk is connected to the same backend, in which case the
 * display is the voice; `?quiet=1` or `?quiet=0` and Ctrl+Shift+M override
 * for this browser, and the choice is remembered per browser.
 */

export type SpeakerPreference = "on" | "off" | null;
/** `display`: silent here because the kiosk speaks. */
export type SpeakerState = "on" | "off" | "display";

export const SPEAKER_STORAGE_KEY = "corellia.speaker";
/** A kiosk heartbeat younger than this counts as connected (the watchdog's own stale threshold). */
export const KIOSK_FRESH_S = 90;

export function resolveSpeaker(input: { isKiosk: boolean; preference: SpeakerPreference; kioskConnected: boolean }): SpeakerState {
  if (input.preference === "off") return "off";
  if (input.preference === "on" || input.isKiosk) return "on";
  return input.kioskConnected ? "display" : "on";
}

export function kioskIsConnected(kioskAgeS: number): boolean {
  return kioskAgeS >= 0 && kioskAgeS < KIOSK_FRESH_S;
}

/** The URL wins over the remembered choice; the URL's choice is remembered too. */
export function readSpeakerPreference(params: URLSearchParams, storage: Storage | null): SpeakerPreference {
  const q = params.get("quiet");
  if (q === "1") {
    writeSpeakerPreference(storage, "off");
    return "off";
  }
  if (q === "0") {
    writeSpeakerPreference(storage, "on");
    return "on";
  }
  try {
    const v = storage?.getItem(SPEAKER_STORAGE_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

export function writeSpeakerPreference(storage: Storage | null, pref: SpeakerPreference): void {
  try {
    if (pref === null) storage?.removeItem(SPEAKER_STORAGE_KEY);
    else storage?.setItem(SPEAKER_STORAGE_KEY, pref);
  } catch {
    // Private windows and blocked storage: the choice lasts for this page only.
  }
}

/** Ctrl+Shift+M: an explicit on/off from whatever the current state is. */
export function toggledPreference(current: SpeakerState): SpeakerPreference {
  return current === "on" ? "off" : "on";
}
