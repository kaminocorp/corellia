# Independent review, round 4: is `feat/vision-implementation` a usable beta the owner can deploy?

**Date:** 2026-10-30. **Commit reviewed:** `6477d0f` (phase 15). **Previous reviews:**

- [`review-2026-10-29.md`](review-2026-10-29.md) (`16f98a0`);
- [`review-2026-10-30.md`](review-2026-10-30.md) (`0c40505`, alpha);
- [`review-2026-10-30-round3.md`](review-2026-10-30-round3.md) (`1368df5`, alpha at the beta threshold).

**Question asked:** not only "does it work in Chrome on the Mac", but "can the owner deploy it and give feedback". So this round adds the deployment paths to the earlier scope:

- the display box (`box/`);
- the Docker image (`backend/Dockerfile`);
- a backend reached over the LAN.

**Scope:** read-only. I checked every round-3 item against the code and by running things:

- `pnpm check`;
- the Go server on the local runtime in dev mode and in token mode, the second bound to a private (non-loopback) interface;
- the Anthropic runtime, through the real binary, against a scripted fake Messages API;
- the built client in headless Chromium (SwiftShader WebGL, fake media devices).

This file is the only one written in the repo.

## Verdict: **a beta on the Mac (localhost); not yet a deployable beta**

**On the Mac it is a beta, pending the owner's live-model run.** Phases 14 and 15 fixed all three round-3 blockers and every small item. I re-verified each one live (table below). CI is green for `6477d0f`, `go test -race` included. On the Mac it works as the README says:

1. `pnpm install`
2. `pnpm -C client build`
3. `cd backend && go run ./cmd/api`
4. Open `http://localhost:8080`.

That Mac run is a usable beta as soon as the owner's live-model run (checklist A) passes. I found nothing in that path that blocks feedback.

**Deployed, it is not there yet.** Three defects sit on the deployment path, and each is cheap:

- **The model is told the wrong time** whenever `CORELLIA_TZ` differs from the process zone. That is the configuration the Docker docs recommend. *Verified.*
- **Voice cannot work** when the display reaches the backend over plain HTTP at a LAN address. The box README offers that topology without a caveat. *Verified.*
- **The box provisioning has the getty and the kiosk both claiming tty1**, and nothing says how to install the binary and client it expects. *Static read; not run, no hardware.*

**Recommendation:**

- Fix the first two, and the tty1 ordering, before the first box provisioning.
- Until then, deploy on the box itself with `--with-backend` and leave `CORELLIA_TZ` empty (the box's system zone is used). That topology avoids both verified defects today.

## Blocking for beta

### Owner only (carried, unchanged)

1. **Live model run (checklist A, VISION 7).**
   - *Not verifiable here: no key.*
   - **What I could check:** I re-checked the wire choices against the Claude API reference for `claude-opus-5-5`:
     - `max_tokens: 64000` is valid (128K output cap, streaming);
     - `output_config.effort: "low"` is valid;
     - `fallbacks: "default"` with `server-side-fallback-2026-07-01` is the documented form;
     - thinking is always on and counts toward `max_tokens`, which the code comment states correctly.
   - Thinking blocks are round-tripped only within one turn's tool loop (`message.ToParam()`). Cross-turn history is plain text. So dropping failed and cancelled entries from history (phase 15) cannot trip the preserved-thinking history-editing check.
   - **What only the live run proves:** auth, latency, first-try spec validity and cost.
2. **Mac run with microphone and speakers (checklist B).**
   - *Not verifiable here.*
   - Headless Chromium reports user activation as already present, so I could not reproduce Chrome's autoplay block either. The "press any key for sound" path (phase 14) is covered by unit tests only.

### Fixable here, each small

3. **The model's clock ignores `CORELLIA_TZ`.** *(new; verified through the binary)*
   - **Cause:**
     - `cmd/api/main.go:51` resolves `loc` from `CORELLIA_TZ`.
     - It passes `loc` to the tools (`builtin.Options.Location`, line 101) and to the scheduler (line 125).
     - It does not pass `loc` to the session, so the session's `Now` defaults to `time.Now` (`internal/session/session.go:118-119`).
     - The system prompt prints `now().Format(... (MST))` in the process zone (`internal/runtime/prompt/prompt.go:52-56`).
   - **Repro:**
     1. Run the binary with `CORELLIA_TZ=Asia/Singapore` and no `TZ`, against a fake Messages API.
     2. Send "hello".
     3. The request's system prompt ends `Current date and time: Thursday 29 October 2026, 23:59 (UTC)`. It was Friday 07:59 in Singapore. The boot log says `time zone location=Asia/Singapore`, so the setting was read.
   - **Effect:**
     - Asked "what time is it" or "what day is it", the model answers from the prompt: off by the zone offset, and here a day wrong.
     - Meanwhile `get_time`, the clock card and `set_reminder`'s `HH:MM` use the configured zone. The agent can therefore contradict itself.
     - A reminder the model expresses as RFC3339 ("tomorrow at 9", computed from a UTC "now") fires at the wrong hour.
   - **Who hits it:**
     - Docker, following the image's own comment and `.env.example` ("Set TZ (or CORELLIA_TZ)… set one of them in Docker"). The `CORELLIA_TZ` half of that advice is the broken one.
     - Any host where the owner sets `CORELLIA_TZ` to a zone other than the system's.
     - A Mac with `CORELLIA_TZ` empty is unaffected.
   - **Fix:** pass `Now: func() time.Time { return time.Now().In(loc) }` to `session.New`, or set `time.Local = loc` once at boot. Add a test that the prompt's clock follows `CORELLIA_TZ`.

4. **Voice is dead when the display reaches the backend over plain HTTP at a non-loopback address.** *(new; verified in Chromium)*
   - **Cause:** browsers expose `getUserMedia`, and grant microphone permission, only in a secure context. `http://localhost` and `http://127.0.0.1` count; `http://192.168.x.y:8080` does not.
     - The server STT path calls `navigator.mediaDevices.getUserMedia` (`client/src/platform/index.ts:26`).
     - The keyless path uses `webkitSpeechRecognition`, which needs the same microphone permission.
   - **Repro:**
     1. Start token mode bound to a private interface (`CORELLIA_BIND=172.17.0.1`).
     2. Open `http://172.17.0.1:18194/?kiosk=1&token=…` in Chromium.
     3. The page reports `isSecureContext: false` and `navigator.mediaDevices` undefined.
     4. The same build on `http://127.0.0.1` reports `true` and defined.
     5. Chromium also logs that the page's Cross-Origin-Opener-Policy header was ignored because the origin is untrustworthy.
     6. With server STT, Ctrl+Space fails with "microphone access is not available". Keyless, real Chrome will refuse recognition. Headless kept saying "listening" because it has no recognition service, which is misleading, not a pass.
   - **Where the docs lead the owner into it:**
     - `box/README.md` says the backend "can run on the box itself or on any host the box can reach" and shows `http://<backend>:8080/?kiosk=1&token=…`.
     - The Docker image is built to be "reached over the bridge network". A Mac browser on `localhost:8080` is fine; the box or another machine on the LAN is not.
     - Nothing says HTTPS or localhost is required.
   - **Fix:** do one or more of these:
     - Document the constraint in `box/README.md`, the Dockerfile comment and the README.
     - For an off-box backend, require HTTPS: a reverse proxy, or `tailscale serve`, since the machine already has a tailnet address. Alternatively, add `--unsafely-treat-insecure-origin-as-secure=$CORELLIA_URL` to `corellia-kiosk.sh`; it works with the `--user-data-dir` already passed.
     - Have the mic indicator say "voice needs HTTPS or localhost" when `!window.isSecureContext`, instead of a generic error.

5. **The box provisioning has two services claiming tty1, and no install step for the binary.** *(new; static read, not run: no hardware)*
   - **tty1:**
     - `provision.sh` installs an autologin override for `getty@tty1` (enabled by default on Debian). That gives the `corellia` user a bash shell on tty1, with nothing in `.bash_profile`.
     - It also enables `corellia-kiosk.service`, which runs `startx … -- :0 vt1` with `TTYPath=/dev/tty1`.
     - Nothing orders them or makes them conflict. On every getty respawn, agetty's `vhangup()` on tty1 can take the X server down with it.
   - **Fix:**
     - Either drop the autologin override and add `Conflicts=getty@tty1.service` / `After=getty@tty1.service` to the kiosk unit,
     - or keep the autologin and start X from `.bash_profile` instead of a unit.
     - Rootless Xorg started from a unit usually also wants `-keeptty`. Check that on the first provisioning.
   - **Install:**
     - `--with-backend` "expects the binary at `/opt/corellia/api` and the client at `/opt/corellia/client`". Nothing says how to get them there; for example: `GOOS=linux GOARCH=amd64 go build -o api ./cmd/api` on the Mac, `pnpm -C client build`, then `scp` both.
     - The `api.env` it writes is created with the default umask (usually `0644`), and the owner will add `ANTHROPIC_API_KEY` to it. systemd reads it as root, so `chmod 600` costs nothing.
   - **What works today:** I verified that a dev-mode backend serves the on-box kiosk URL. `http://127.0.0.1:8080/?kiosk=1&token=…` connects as `online · dev`, and the page strips the token. So `--with-backend` without a token is a valid on-box setup.

## Non-blocking

### New, verified

- **A refusal is glued to the partial reply and kept in history.**
  - Against the fake, a stream of "Sure, the first step is", " to" followed by `stop_reason: "refusal"` became "Sure, the first step is toI can't help with that one." That string was spoken, shown and stored as a normal agent entry, so the next turn sends it to the model.
  - Cause: `internal/runtime/anthropic/anthropic.go:218-220`.
  - With fallbacks on, most refusals are re-served by the fallback model, so this should be rare. When it happens it reads as a defect.
  - **Fix:**
    - Ellipsize and separate the fragment, as phase 14 does for `max_tokens`.
    - Mark the entry so `historyLocked` skips it.
- **Prompt caching never hits across turns.**
  - The only cache breakpoint is at the end of the system block.
  - That block ends with the current date and time to the minute, and the screen summary (`prompt.go:49-56`). The fake saw both change between consecutive turns.
  - Tools and the static instructions are therefore re-billed on every turn. The history has no breakpoint at all.
  - Cache hits happen only between tool rounds inside one turn, in the same minute.
  - For an always-on agent this is the cheapest cost lever:
    - put a breakpoint after the static part;
    - move the clock and the screen state into the last user message or a mid-conversation system message;
    - add a breakpoint on the history.
- **No `.dockerignore`.**
  - `COPY backend backend` copies `backend/.env` (the owner's API keys) and `backend/data` (transcript, notes) into the build context and an intermediate layer.
  - `COPY client client` copies the host's `client/node_modules` (macOS symlinks) and `client/.chromium-libs` over the container's install.
  - The final image only takes `/out/api` and `client/dist`, so nothing leaks into it. The context is still large and holds secrets.
  - Not built here (no Docker socket).
- **The watchdog never restarts a kiosk that never loaded.**
  - Suppose Chromium starts before the backend answers, for example an off-box backend after a power cut. Chromium then shows its own error page. The page has no Corellia code, so it never posts a heartbeat.
  - `/healthz` then reports `client_heartbeat_age_s: -1`. `corellia-watchdog.sh` treats `-1` as "give the kiosk time to boot", forever.
  - Restart the kiosk when `-1` persists for longer than N minutes. Order `corellia-kiosk.service` `After=corellia-api.service` when both are on the box.
- **The local demo's intent order still surprises:**
  - "what's the weather today" shows the schedule: "today" matches the schedule intent before the weather intent.
  - "what's the weather in Lisbon tomorrow" reports current conditions.
  - "directions to the airport" shows "Here's Lisbon on the map".
  - The greeting matches substrings: "hey" fires inside "they", "hi " inside "sushi place".
  - The header says "local demo", so this is honest. It is still the first thing a keyless owner sees.
- **Doc drift:** `docs/stack.md:32` still says `Referrer-Policy: no-referrer`. Since phase 14 it is `strict-origin-when-cross-origin` (`internal/httpsrv/guards.go:184`).

### Carried over, still open

- Held speech replays in full on the first gesture, however old (Mac only; the box has autoplay).
- The tile probe recognises only today's OSM block image; a keyed tile provider is the lasting fix.
- The directions origin is the Lisbon constant.
- No speech prefetch with server TTS.
- No `Risk: "high"` tool.
- A bound `Image.src` is covered by the CSP only.
- Fit-ranking does not narrow the prompt.
- Ctrl+Space is not configurable.
- Hermes has no stop reason, so a cut reply is not classified.

## Round-3 items, re-verified at `6477d0f`

| Round-3 item | State | How verified |
|---|---|---|
| 3 Transcript over full visuals | **Fixed** | Chromium 1440×790, a 14-turn session: in every panel and full layout (map, table, chart, schedule) the UI zone ends above the footer, for example zone bottom 647 px against footer top 655 px with a map. With a visual up the transcript keeps two entries. The 1080p table screenshot is clean. The smoke test measures 1440×790, 1920×1080 and 3840×2160. |
| 4 Error line shows raw and routine errors | **Fixed** | After "simulate a failure" the error line is absent, and the status card says "That didn't work: A simulated failure, as requested." `?debug=1` shows the raw error (smoke step). |
| 5 `max_tokens` passes as complete | **Fixed** | Fake, `stop_reason: max_tokens`: the transcript shows "…keeps going and…", a blank line, then "Sorry, that didn't work on my side. My reply was cut off before it finished." The entry has `failed: true`. The next request's history omits it: six messages, two consecutive user turns. |
| Failure classification by status | **Fixed** per code and tests | `runtime.StatusError` via `errors.As`; `TestDescribeFailure` covers the round-3 request id. Not re-driven live. |
| Glued half sentence (failure path) | **Fixed** | Local "simulate a failure" speaks three separate pieces. The refusal path still glues; see Non-blocking. |
| OSM attribution, Referer, block probe | **Fixed** | "© OpenStreetMap contributors" visible on the map; header set in `guards.go:184`; probe covered by `mapTiles.test.ts`. |
| Keyless voice discloses Google | **Fixed** | README and checklist B2. |
| "Reminder:" lead-in, "1 minute" | **Fixed** | Spoken and shown as "Reminder: stretch" when it fired. The proposal reads "Set a reminder in 1 minute". |
| Empty key cap on lower proposals | **Fixed** per test | `Renderer.test.tsx`. |
| SSE replay from the snapshot seq | **Fixed, and safe across restarts** | With curl, a new connection gets the snapshot and then only new events. I also tested whether a stale `Last-Event-ID` silences a restarted server: on a fresh server (seq 0), `Last-Event-ID: 5000` still streamed all 23 events of the next turn, because `Bus.Subscribe` filters only the replay, not live events. In Chromium, restarting the backend under an open page gave reconnect, `online`, and the next turn answered and persisted. |
| Cancelled replies out of history | **Fixed** per test | `TestNewTurnCancelsRunningOne`. |
| `finish_reason: length` (OpenAI-compatible) | **Fixed** per test | `TestFinishReasonLengthIsTruncation`. |
| Local demo: table, chart, reminder phrasings | **Fixed** | "show me a table" gives a table and "show me a chart" a chart. "remind me in 1 minute to stretch" proposed the right time, Enter confirmed it, and it fired about 60 s later. |
| `packageManager` pin | **Fixed** | `pnpm@12.16.1`; CI reads it. |

## VISION.md, section by section (changes since round 3)

| Section | State |
|---|---|
| 2/3 Experience | **Good at a glance.** Idle, map, table, chart, schedule, proposal, failure and reminder all render cleanly at 1440×790 and 1920×1080. There is no console error in any scenario. |
| 3 No mouse | **Holds.** The input is focused at load and after: a map, a numbered key, Escape, a forced `blur()`, and two Tabs. Typing always lands in the input. |
| 4 Architecture | Unchanged. Off-box topologies need HTTPS for voice (blocking 4). |
| 5 Catalog, streaming, validation | Done, as in round 3. |
| 5.6 Propose/confirm | Sound. "1" on the map card proposes directions and Escape cancels it. Enter on an empty input confirms the reminder. |
| 6 Decision layer | Speech pieces and the reminder lead-in are right. Proactive reminders fire on time. |
| 7 Runtime | Anthropic path verified through the binary against the fake: plain turn, refusal, `max_tokens`. The prompt clock is wrong under `CORELLIA_TZ` (blocking 3). Caching is ineffective across turns (non-blocking). |
| 8 Display box | Unrun. Defects on the path: tty1 and the install step (blocking 5), insecure-context voice off-box (blocking 4), and the watchdog `-1` gap. |
| 11.9 Auth | Token mode works on a private interface. The token is carried in the kiosk URL once and stripped from it. |

## What I ran

**Build and tests**

- `pnpm install --frozen-lockfile && pnpm check` exits 0:
  - type-check;
  - lint (0 errors, the two known fast-refresh warnings);
  - 28 files and **161** vitest tests;
  - `go vet` and all **22** Go packages;
  - Playwright **8/8**.
- `gofmt -l backend` is clean.
- **Race tests:** `go test -race` cannot run here (no cgo). CI run `40965232102` for `6477d0f` is green on all jobs, race included.

**Live servers** (scratchpad binary and data dirs; all stopped)

- **Local, dev mode (`127.0.0.1:18190`):**
  - A 14-turn session in Chromium;
  - a reminder fired on a freshly loaded page;
  - focus probes;
  - the kiosk URL with `?token=`.
- **Local, token mode (`172.17.0.1:18194`, a private bridge address, not the public interface):** the insecure-context probe.
- **Local, dev mode (`:18196`):** a backend restart under an open page, and curl SSE with and without a stale `Last-Event-ID`.
- **Anthropic runtime against a scripted fake `POST /v1/messages` (`:18192` → `:18291`):**
  - plain turn, refusal after partial text, `max_tokens`;
  - request bodies and the beta header logged;
  - a rerun with `CORELLIA_TZ=Asia/Singapore` for the clock.

**Browser:** Playwright 1.60 Chromium headless shell, SwiftShader, `--use-fake-device-for-media-stream`, libraries from `scripts/chromium-libs.sh`.

**Lookups:** the Claude API reference, for the Opus 5.5 wire facts in blocking 1.

**Not done:**

- a 24-hour soak;
- Safari;
- real audio devices and the autoplay block;
- live cloud APIs;
- Docker (no socket);
- the `box/` scripts on hardware.

**Cleanup:**

- I stopped every server I started: `:18190`, `:18192`, `:18194`, `:18196` and the fake on `:18291`.
- Besides this file, the review changed no code, configuration or docs.
- `pnpm check` rebuilt the git-ignored `client/dist` and `backend/bin` as usual.
