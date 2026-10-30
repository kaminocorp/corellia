# Independent review, round 3: is `feat/vision-implementation` a usable alpha (or beta) of VISION.md?

**Date:** 2026-10-29 (round 3, filed as `review-2026-10-30-round3`). **Commit reviewed:** `1368df5` (phase 13). **Previous reviews:** [`review-2026-10-29.md`](review-2026-10-29.md) (`16f98a0`) and [`review-2026-10-30.md`](review-2026-10-30.md) (`0c40505`, verdict: alpha). **Audience:** the owner, running the client in a browser on macOS.

**Scope:** read-only. I checked every round-2 blocking item against the code and by running things:

- `pnpm check`;
- the contract generator in a scratch copy of `HEAD`;
- the Go server over HTTP and SSE on the local runtime, on the Anthropic runtime against a scripted fake Messages API, and in token mode;
- the built client in headless Chromium, with WebGL on SwiftShader and fake media devices.

This file is the only one written in the repo.

## Verdict: **alpha, at the beta threshold**

Phase 13 did what it said. Every round-2 blocking item that can be fixed without a key or a microphone is fixed (1, 3, 4, 7 and 8). Item 5 is fixed in speech, the transcript and the status card, and I verified each fix live. CI is green on all four jobs for `1368df5`, `go test -race` included.

The owner can clone this on a Mac and use it today in Chrome:

1. `pnpm install`
2. `pnpm -C client build`
3. `cd backend && go run ./cmd/api`
4. Open `http://localhost:8080`.

Without a key it runs the local demo; with `ANTHROPIC_API_KEY` it talks to Claude. It renders, connects and stays online through failures and reloads. It speaks streamed sentences, confirms by Enter or voice, and fires reminders.

It is not yet a beta, for two kinds of reason:

- **Only the owner can do the two decisive runs:** a live model and a Mac with a microphone and speakers. Nothing in this review can stand in for them. [`owner-checklist.md`](owner-checklist.md) is the right instrument, with two corrections below.
- **Three cheap defects are still open.** One is new: the transcript draws over every full-screen visual. The other two are the rest of item 5: the always-visible error line still shows raw provider errors and routine op rejections, and a reply cut by `max_tokens` still passes as complete. Each is a small change.

Once those three are fixed and both checklist runs pass, I would call it a beta.

## Blocking for beta

### Owner only

1. **Live model run (round-2 item 2, VISION 7).** *Not verifiable here: no key.*
   - The tooling is ready:
     - `scripts/anthropic-live-check.sh` refuses to start without a key.
     - `runtime-check` prints a readable table and a diagnosis.
     - The plain check expects the word "ready", which is fair for a real model.
   - **Wire choices, narrowed using the SDK source and the Claude API reference:**
     - `claude-opus-5-5` is a valid model id, and `output_config.effort: "low"` is valid for it.
     - `server-side-fallback-2026-07-01` with `fallbacks: "default"` is the documented form for Opus 5.5.
     - Consecutive user messages are accepted and combined. That matters now that failed apologies are dropped from history; I saw four user turns in a row on the wire.
     - `Authorization: Bearer <key>` is what `anthropic-sdk-go` v2.4.0 itself sends for `WithAPIKey` (`option/requestoption.go:597-601`).
     - All of these are low risk. Only a live call proves them.
   - **Still open:** the VISION 7 decision and a committed spike report.

2. **Mac run with microphone and speakers (round-2 item 6, Phase 8 acceptance).** *Not verifiable here: no microphone, no speakers, no macOS.*
   - The races found in round 2 are fixed (see the table below).
   - Real echo, `speechSynthesis` voices, macOS input switching and Chrome's recognition service can only be judged on the Mac.
   - `CORELLIA_VOICE_BARGE_IN` still defaults to `auto`. On laptop speakers the agent may interrupt itself, and then send its own words as a turn. The checklist covers this; expect to set `off` or use push-to-talk.

### Fixable here, each small

3. **The transcript draws over every full-screen visual.** *(new; verified in Chromium at three viewports)*
   - **Cause:** in `full` placement the UI zone is `top-14 bottom-36` (`renderer/Stage.tsx:33-35`). That reserves 144 px for the footer, but the transcript grows upward with up to six entries.
   - **Measured:** the UI zone reaches below the top of the transcript by:
     - 111 px at 1440×790 (a MacBook browser window);
     - 146 px at 1920×1080;
     - 180 px at 3840×2160.
   - **Effect:** the last two or three transcript lines draw over the map tiles or the table. Over a map they are close to unreadable, and they hide part of the visual. A map, table or chart is the product's main way of answering (VISION 3, 5), so this hurts the main view, not a corner case.
   - This is the same class as round-2 item 8, which fixed overlay-on-overlay and error-line overlaps, not root-against-footer.
   - **Fix:** do one of these:
     - Size the `full` and `panel` zones from the footer's measured height.
     - Collapse the transcript to one or two lines while a full visual is on screen.
     - Add the case to the smoke test's overlap measurement.

4. **The always-visible error line still shows raw provider errors, and shows routine op rejections as failures.** *(remainder of round-2 item 5; verified in Chromium)*
   - **What is fixed:** the spoken apology, the status card and the transcript now use `describeFailure` ("The model service rejected my credentials.").
   - **What is not:** `ErrorLine` (`app/ErrorLine.tsx`) shows the newest store error as `code: message` for 12 s in every mode, not only `?debug=1`.
   - **Live results:**
     - After a 401 it showed `runtime: anthropic: POST "http://127.0.0.1:18191/v1/messages": 401 Unauthorized {"type": "error", …}`, under the plain status card.
     - After a successful `show_ui` turn in which the model sent one bad op, it showed a red `image_host_not_allowed: … Image src host "" is not in the allowed list (…)`.
     - With Claude, rejected ops are routine and the model repairs them, so the always-on screen will regularly show red errors after turns that worked.
     - The smoke test asserts the raw text (`smoke.spec.ts`, `toContainText("runtime: simulated failure")`).
   - **Fix:**
     - Outside debug, show `describeFailure`'s sentence for `runtime` errors, or nothing, since the status card already says it.
     - Drop op-rejection codes from the error line; the model already gets them in the tool result.
     - Keep the raw text for `?debug=1` and the log.

5. **A reply cut by `max_tokens` passes as a completed turn, and a `show_ui` call cut by it is lost silently.** *(new; same class as round-2 item 5's truncated stream; verified against the fake)*
   - **Where:** `runtime/anthropic/anthropic.go` now treats an empty stop reason as an error. A `max_tokens` stop still falls through `StopReason != tool_use` and returns nil.
   - **Live result:** the fake ended a half sentence with `stop_reason: "max_tokens"`. The turn ended `completed`, the fragment was spoken as the answer, and it went into the model's history.
   - **A `tool_use` block cut the same way** never runs and nobody is told. That is likely for a large `show_ui` (up to 200 ops).
   - **Why the cap matters:** the default `MaxTokens` is 4096. On Opus 5.5 thinking is always on and counts toward `max_tokens` (per the Claude API reference), so the cap is tighter than it looks.
   - **Fix:**
     - Raise the default. The SDK guidance for streaming is tens of thousands.
     - Treat `max_tokens` like a dropped stream: speak the partial, then a short reason.
     - At minimum, never drop a cut tool call silently.

## Non-blocking

### New, verified

- **`describeFailure` matches substrings anywhere in the raw error, including the JSON body** (`session/failure.go`).
  - My fake's `request_id` was `req_011CXyz4019`, which contains `401`. Every failure, whether 404, 429, 529, 500 or 400, was then spoken as "The model service rejected my credentials."
  - With a neutral id, all six status codes map correctly.
  - Real request ids are base62, so collisions are rare. But `"model:"`, `"500"` and `"api key"` can also appear in an unrelated error message.
  - **Fix:** classify by `*anthropic.Error`'s `StatusCode` via `errors.As`, and fall back to substrings only for transport errors.
- **A dropped stream's half sentence is spoken glued to the apology:** "The answer you asked for is that the Sorry, that didn't work on my side." (`session.go:398`, `stream.Flush()+" "+failureReply(…)`). End the fragment with "…" or speak it as its own piece.
- **The map turns OSM attribution off and the page sends `Referrer-Policy: no-referrer`.**
  - **Works today:** in Chromium the tiles load (I checked: 20 tiles, real map, `Referer` absent).
  - **The risk:**
    - OSM's tile policy asks for attribution and a Referer.
    - When OSM blocks a client it serves an "Access blocked" image with **HTTP 200**. I got exactly that from a curl request without a Referer.
    - The `Map` would then render the block notice as the map, and its fallback never triggers.
    - An always-on screen is a heavy, long-lived client.
  - **Fix:** show the attribution, set `referrerPolicy` for the tile source (or the page policy to `strict-origin-when-cross-origin`), and plan for a keyed tile provider.
- **Keyless voice sends office audio to Google, and the owner docs do not say so.**
  - Chrome's `webkitSpeechRecognition` is the default when no `OPENAI_API_KEY` is set.
  - Only `phase-08-voice.md` mentions it. The owner checklist has the owner run keyless with the mic open "for an afternoon" without saying so.
  - VISION 11.6 names the privacy trade-off for an always-on mic. One line in the checklist and the README closes this.
- **On a Mac browser, speech is silent after a reload until the first key press.**
  - Chrome's autoplay policy blocks `speechSynthesis` and the `AudioContext` until a user gesture.
  - A reminder that fires after a reload, with no key pressed since, shows its card but says nothing.
  - The box is covered (`--autoplay-policy=no-user-gesture-required` in `box/corellia-kiosk.sh`); the Mac is not.
  - Document "press any key after loading", or show a one-time "press a key to enable sound" hint.
- **Owner checklist corrections:**
  - Step A4 says the header "must say the model name". It shows the runtime name (`anthropic`); see `app/runtimeLabel.ts`. Change the text or the label so the owner does not read a pass as a failure.
  - `runtime-check`'s no-key diagnosis still suggests `ant auth status` "to see which credential the SDK would use". Since phase 13 sets `WithoutEnvironmentDefaults`, only `ANTHROPIC_API_KEY` in `backend/.env` counts (`cmd/runtime-check/main.go:232`).
- **Opus 5.5 returns text written between tool calls as (by default empty) thinking blocks,** per the Claude API reference. On tool turns, a lead-in like "Let me check" may never stream as speech. The first spoken word would then come after the last tool round. Worth noting when reading the spike's first-speech numbers for tool turns; `thinking.display: "updates"` exists if it matters.
- **Small wording and UI items:**
  - A reminder speaks only its bare text: "stretch", with no "Reminder:" lead-in (`decision.go:97-99`).
  - The proposal label reads "Set a reminder in 1 minutes".
  - Lower proposals render an empty key chip next to "Do it", because digits are now withheld from confirm actions.
- **Every new SSE connection replays the whole bus buffer** (up to 1000 events) when it has no `Last-Event-ID`. The client then drops them by seq. This is correct but wasteful on every reload. Now that the snapshot carries its seq, replay could start there.
- **No `packageManager` field pins pnpm 12** for corepack on a fresh Mac. The README states it; the repo does not enforce it.
- **The local demo is still the first thing a keyless owner sees, and its own greeting oversells it:**
  - It says "Ask me … a table, a chart". "Show me a table" and "show me a chart" both return "Here's Lisbon on the map".
  - "Remind me in 5 minutes" and "remind me at 9" both propose 17:00 (carried over).
  - The header says "local demo", which is honest.

### Carried over, still open (as listed in `phase-13-beta-readiness.md`)

- A cancelled turn's partial reply still goes into history.
- The directions origin is the Lisbon constant.
- No speech prefetch with server TTS.
- No registered tool has `Risk: "high"`, so the high-risk voice hold is unexercised.
- A bound `Image.src` is covered by the CSP only.
- Fit-ranking does not narrow the prompt.
- Ctrl+Space is not configurable.

## Round-2 items, re-verified at `1368df5`

| Round-2 item | State | How verified |
|---|---|---|
| 1 False "connection lost" after a `session_error` and on reload | **Fixed** | Wire event is `session_error`; `onerror` ignores `MessageEvent`s. Chromium: after a failed turn, then a reload (which replays it), the header stays `online · dev`, no banner, no page error, nothing spoken on reload. Smoke step 5 passes. |
| 2 No live model run | **Open (owner)** | See blocking 1. |
| 3 Mic live while the indicator says off | **Fixed** | Chromium with a fake device and a 600 ms `getUserMedia`: a double Ctrl+Space ends `off` with **0 live tracks**. Open gives one track. Ctrl+M twice: muted, 0 live, then listening, 1 live. Open, mute and unmute while `getUserMedia` is pending ends `listening` with exactly 1 live track. Read: generation counter, PTT blur release, fatal recognition errors force off. |
| 4 Speech queue under barge-in | **Fixed** | Chromium with instrumented `speechSynthesis`: Escape pressed after `turn_done`, with three of six sentences left, silenced at once. Nothing more was spoken, and the screen was not cleared. A first utterance that never ends was skipped after 7.6 s; the second played, and the state returned to idle. Read: `AbortSignal` checked after fetch and decode, meter cleared, utterance held. |
| 5 Raw errors; dropped stream counted as success | **Mostly fixed** | Speech, transcript and status card are plain, and all six HTTP codes map correctly. A dropped stream and a cut tool call each give `failed` with "The connection to the model dropped…". Failed replies carry `failed: true`, which survives a restart (15 of 50 restored entries flagged), and none reach the model afterwards. **Remainder:** blocking 4 (error line) and 5 (`max_tokens`). |
| 6 Mac voice run | **Open (owner)** | See blocking 2. |
| 7 CI red | **Fixed** | Run `40941916171` green: smoke, contract, backend (`-race`), client. `contracts-generate.sh` in a scratch copy of `HEAD` with the pinned `go run …@v0.24.1`: **no diff**. |
| 8 Generated UI collides with itself | **Fixed for overlays**; new root-vs-transcript case is blocking 3 | Overlays stack per anchor below the top bar; the smoke test measures the top-right stack. The error line has its own footer row: measured above the transcript, no overlap. |
| Enter auto-repeat confirms | **Fixed** | Chromium: held Enter (three keydowns with repeat) after typing sends one message; 4 pending proposals stay 4. |
| Digits on lower proposals | **Fixed as designed** | Digits sit only on Cancel actions. A lone "1" rejected a lower proposal, not confirmed it (reminder store unchanged). |
| SDK reads its own env / rule 4 | **Fixed** | `WithoutEnvironmentDefaults`; `ANTHROPIC_BASE_URL` comes through `config` (that is how I pointed the binary at the fake). |
| Dev origin default in token mode | **Fixed** | Token mode: `Origin: http://localhost:5173` with a valid token gets 403. |
| 403 from the guard shown as a token prompt | **Fixed** per code (`forbidden` status) | Read. |
| `open_directions` confirmation; `transcript.jsonl` mode | **Fixed** | Tool registry; the data dir lists `transcript.jsonl` and `reminders.json` both as `-rw-------`. |

## VISION.md, section by section (changes since round 2)

| Section | State |
|---|---|
| 2/3 Experience | **Usable at a glance**, without the false offline banner. The display renders at 1280×800, 1440×790, 1920×1080 and 3840×2160 with no page scroll. Input is focused at load, and every action has a key path. Undercut by the transcript over full visuals (blocking 3) and red error noise (blocking 4). |
| 4 Architecture | Unchanged and sound. One binary; `localhost` and `127.0.0.1` both pass the Host guard; dev mode binds IPv4 loopback only. |
| 5.1-5.4 Catalog, layout, schema, streaming | Done. Drift now means the same on every machine (pinned generator, CI green). |
| 5.5 Validation | Strong. `Iframe`, a `javascript:` image and off-allowlist hosts are rejected per op, and the model is told which ops failed and why ("Displayed 3 of 5 ops. Rejected: …"). Fit-ranking still does not narrow the prompt. |
| 5.6 Propose/confirm | Sound. A second confirm returns 404, Enter confirms only the top card, and a confirmed reminder fired on time as a card plus speech. |
| 6 Decision layer | Speech streams per sentence (six pieces 400 ms apart, matching the model's pacing). Proactive hold policy unchanged. |
| 7 Runtime | Anthropic path verified end to end against the fake, through the real binary and the browser. Open: `max_tokens` (blocking 5) and the live run and decision (blocking 1). |
| 8 Display box | Unchanged and unrun (no Docker or box here). Kiosk flags cover autoplay and the mic prompt. |
| 11.6 Activation / privacy | The indicator is now truthful in the races I could drive. The keyless path's audio destination is undisclosed to the owner (non-blocking). |

## Owner-only (cannot be verified here)

- A live Anthropic call, and with it the Bearer header, the fallback beta, real latency, first-try spec validity and cost (checklist A).
- A microphone, speakers and echo on a Mac:
  - barge-in on laptop speakers;
  - `speechSynthesis` gaps and voices;
  - Ctrl+Space against macOS input-source switching;
  - Chrome's recognition service over an afternoon (checklist B).
- OpenAI STT/TTS, Hermes, Safari, the Docker image and `box/` provisioning.
- WebGL frame rate on real hardware. Here it ran only on SwiftShader.

## What I ran

**Build and tests**

- `pnpm install --frozen-lockfile && pnpm check` exits 0:
  - type-check;
  - lint (0 errors, the two known fast-refresh warnings);
  - 26 files and **151** vitest tests;
  - `go vet` and all Go packages;
  - Playwright **5/5**.
- **Contract drift:** I ran `scripts/contracts-generate.sh` in a `git archive HEAD` copy in the scratchpad, with `node_modules` symlinked. No diff.
- **CI:** `gh run view 40941916171` shows all four jobs green.

**Live servers** (binaries and data dirs in the scratchpad)

- **Local runtime, dev mode (`:18090`):**
  - Guards:
    - `Host: evil` 403;
    - foreign `Origin` 403;
    - `Origin: null` 403;
    - `text/plain` 415;
    - whitespace turn 400;
    - `Host: localhost` and `[::1]` 200;
    - `Host: mymac.local` 403;
    - security headers and CSP present (`script-src 'self'`, no `unsafe-eval`).
  - Turns: hello, "simulate a failure", time, map, schedule, weather, reminders, the demo's table and chart phrasings.
- **Anthropic runtime against a scripted fake `POST /v1/messages` (`:18092` → `:18191`):**
  - Plain turn; six-sentence story (speech timing); cancel mid-story.
  - `show_ui` with an `Iframe` and a `javascript:` image.
  - `set_reminder`: proposal, confirm (then a second confirm gets 404), and the reminder fired after 60 s.
  - HTTP 401, 404, 429, 529, 500 and 400; a mid-stream drop; a cut tool call; `max_tokens`.
  - Request bodies and headers inspected.
  - SIGTERM, restart on the same data dir, history checked.
  - `runtime-check`: without a key (diagnosis) and against the fake (table prints).
- **Token mode (`:18094`):**
  - A 14-character token is refused at boot.
  - No token 401; wrong token 401; Bearer 200; `?token=` on `/api/events` 200.
  - The dev origin with a token 403.
  - The token is never logged.

**Browser** (Playwright 1.60 Chromium; SwiftShader WebGL; `--use-fake-device-for-media-stream`; libraries from `scripts/chromium-libs.sh`)

- Idle display at four viewports.
- Map tiles: Referer and response inspected, screenshot taken.
- Failure, then reload.
- Overlay and footer geometry, plus root-against-transcript measurement at three viewports.
- Escape after `turn_done`; a wedged utterance; held Enter; a lone digit on stacked proposals.
- The mic race with instrumented `getUserMedia`.
- Error-line text against the Anthropic fake.
- No console errors in any scenario.

**Lookups:** the `anthropic-sdk-go` v2.4.0 source in the module cache, and the Claude API reference, for the Opus 5.5 wire facts in blocking 1 and 5.

**Not done:** a 24-hour soak, Safari, real audio devices, live cloud APIs, Docker and the box scripts.

**Cleanup:** I stopped every server I started: Go on `:18090`, `:18092` and `:18094`, and the fake on `:18191`. No Chromium process is left. Besides this file, the review changed no code, configuration or docs. `pnpm check` rebuilt the git-ignored `client/dist` and `backend/bin` as it always does, and refreshed the git-ignored `client/.chromium-libs`. One public tile was fetched from `tile.openstreetmap.org` twice (with and without a Referer) to check the blocking behaviour.
