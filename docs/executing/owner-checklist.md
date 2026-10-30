# Owner checklist: the two runs only you can do

**Why this exists.** Everything in Corellia that can be verified without an API key or a microphone has been (Phases 13 and 14, [`review-2026-10-30.md`](review-2026-10-30.md) and [`review-2026-10-30-round3.md`](review-2026-10-30-round3.md)). Two things cannot: a live model (review item 2) and voice on a real Mac (item 6). This is the whole list, in order, with what to record. Budget: about an hour. Do it on the Mac you will use, in Chrome.

Before either run:

```bash
git pull                      # feat/vision-implementation
pnpm install
pnpm check                    # must be green locally before you trust anything below
```

---

## A. Live model (review item 2, VISION 7 decision)

1. **Key.** Put `ANTHROPIC_API_KEY=...` in `backend/.env` (template: [`../../.env.example`](../../.env.example)). It is the only credential the runtime reads: the SDK's own environment and `ant auth` profiles are ignored. Leave `CORELLIA_MODEL`, `CORELLIA_EFFORT`, `CORELLIA_MAX_TOKENS` and `CORELLIA_ANTHROPIC_FALLBACKS` at their defaults for the first run.
2. **Live check.**
   ```bash
   scripts/anthropic-live-check.sh --check-only
   ```
   Expected: a three-row table, all `pass` (plain turn, tool turn with `get_time` and `show_ui`, cancel within 5 s). On a failure the last line is a diagnosis naming the setting to change; fix it and run again. The two wire choices the goldens could not confirm offline are what this proves: the SDK's `Authorization: Bearer` header and the `server-side-fallback-2026-07-01` beta with `fallbacks: "default"`. If the beta is the thing rejected, set `CORELLIA_ANTHROPIC_FALLBACKS=false` and note it below.
3. **Spike.**
   ```bash
   scripts/anthropic-live-check.sh
   ```
   Writes `docs/executing/spikes/anthropic-<date>.md`. Read the table: first token, first speech, first op, first-try spec validity. On tool turns, read first speech with care: Opus 5.5 returns text written between tool calls as thinking blocks, which the runtime does not speak, so the first spoken word of a tool turn can come after the last tool round; a plain turn's number is the one to compare with the 2 s criterion.
4. **Use it.**
   ```bash
   pnpm -C client build && cd backend && go run ./cmd/api
   ```
   Open http://localhost:8080. The header must say **anthropic** (the runtime name; `app/runtimeLabel.ts`), not **local demo**. Try: "what's the weather in Lisbon tomorrow", "show me a table of the planets", "remind me in 2 minutes to stretch" (confirm with Enter; the reminder must fire as a card and speech), "clear". Then break one turn on purpose (switch the Wi-Fi off, or put a wrong key in `backend/.env` and restart): the apology must be one short sentence ("I can't reach the model service." or "The model service rejected my credentials."), the header must stay **online**, the red error line under the transcript must stay empty (the raw provider error is in the server log and in `?debug=1`), and the next turn after the fix must work. ("Simulate a failure" is a local-runtime intent only.) If a long answer ends with "…" and "My reply was cut off before it finished", raise `CORELLIA_MAX_TOKENS` (default 64000; thinking counts toward it) and note it below.
5. **Record.** Commit the spike report. In [`roadmap.md`](roadmap.md) section 1, fill the VISION 7 line: which runtime is the default and why (latency, spec validity, cost), and whether fallbacks stay on. One paragraph is enough.

Pass criteria: the check table is all `pass`; the spike reports first speech under 2 s at `CORELLIA_EFFORT=low`; a day of normal use produces no apology you cannot explain from the server log.

---

## B. Mac run with microphone and speakers (review item 6, Phase 8 acceptance)

Do this twice: once with headphones, once on the laptop speakers.

1. **Input source.** System Settings → Keyboard → Keyboard Shortcuts → Input Sources: if "Select the previous input source" is bound to Ctrl+Space, unbind it (or Corellia's mic key will fight it). Chrome must have microphone permission for `localhost`. Open the page as `http://localhost:8080`, not as the Mac's LAN address: the microphone exists only in a secure context (HTTPS, or http on localhost), and the mic indicator says **voice needs HTTPS or localhost** otherwise.
2. **Keyless first** (browser recognition and `speechSynthesis`; no `OPENAI_API_KEY`). **Privacy:** keyless recognition is Chrome's `webkitSpeechRecognition`, which sends the microphone audio to Google's speech service while the mic is open; with `OPENAI_API_KEY` it goes to OpenAI instead. Nothing stays on the Mac either way (VISION 11.6). Decide which you accept before leaving the mic open for an afternoon (step 5).
   - **Sound after a reload.** Chrome plays no speech until the first key press or click on the page. If a reminder fires before that, its card shows and the mic indicator says **press any key for sound**; the held speech plays on that key press. The display box has autoplay enabled in its kiosk flags and does not need this.
   - Ctrl+Space: the indicator goes to **listening**, Chrome shows the mic dot. Say "what time is it". The indicator shows **hearing you** while you talk, the turn runs, the answer is spoken.
   - Say "remind me in 2 minutes to stretch", then "do it": the proposal confirms by voice.
   - While the agent is speaking a long answer ("tell me a story in six sentences"), start talking: speech stops within a word and the turn is cancelled. If the agent's own voice from the speakers triggers that, set `CORELLIA_VOICE_BARGE_IN=off` and repeat: now only typing and Escape interrupt.
   - Press Escape while the agent is speaking after the turn finished: silence at once (Phase 13).
   - Ctrl+Space again: **mic off**, Chrome's mic dot goes away. Tap Ctrl+Space twice quickly: it must end **off** with no Chrome mic dot (the Phase 13 race fix).
   - Ctrl+M mutes and unmutes.
   - Cmd+Tab away and back: recognition keeps working, or the indicator says why it stopped.
3. **With server audio** (`OPENAI_API_KEY` set, `CORELLIA_STT=auto`, `CORELLIA_TTS=auto`): repeat step 2. Note the gap between sentences (server TTS fetches each piece; prefetch is a known follow-up) and the time from the end of your sentence to the first spoken word.
4. **Push-to-talk** (`CORELLIA_VOICE_MODE=ptt`): hold Ctrl+Space, speak, release mid-sentence: the sentence still arrives. Hold the key and Cmd+Tab away: the mic closes (Phase 13 blur handler).
5. **Leave it on** for an afternoon with the mic open. It must not wedge in **speaking**, must not record while saying **mic off**, and must not take a cough as a command more than you can live with (if it does, raise the VAD threshold in `client/src/voice/vad.ts` or use push-to-talk).

Record in the Phase 8 completion note's acceptance line: speech start latency (keyless and server), whether barge-in worked on speakers, the `speechSynthesis` gap between streamed pieces, and which defaults you changed (`CORELLIA_VOICE_BARGE_IN`, `CORELLIA_VOICE_MODE`). If a default should change for everyone, change it in `backend/internal/config` and `.env.example` in the same commit.

---

## When both are done

The build is a beta: update the status line at the top of [`roadmap.md`](roadmap.md), add the two results to [`../changelog.md`](../changelog.md), and push the branch. Anything either run exposes becomes the next phase's list.

While doing A, also read `usage.cache_read_input_tokens` on the second and later turns: non-zero for the system prefix every time, and for the history on most turns (the window now moves once per ten transcript entries, not every turn). If turns are usually more than five minutes apart and the cost matters, set `CORELLIA_CACHE_TTL=1h`.

When the box and the Mac share one backend (box/README.md, last topology row), check once that only the box speaks and that the Mac's indicator says **sound on the display**; `Ctrl+Shift+M` on the Mac should make it speak and `Ctrl+Shift+M` again silence it.
