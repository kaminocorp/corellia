# Independent review, round 5: is `feat/vision-implementation` a deployable beta?

**Date:** 2026-10-30. **Commit reviewed:** `681651a` (phase 16). **Previous reviews:** [`review-2026-10-29.md`](review-2026-10-29.md) (`16f98a0`), [`review-2026-10-30.md`](review-2026-10-30.md) (`0c40505`, alpha), [`review-2026-10-30-round3.md`](review-2026-10-30-round3.md) (`1368df5`, alpha at the beta threshold), [`review-2026-10-30-round4.md`](review-2026-10-30-round4.md) (`6477d0f`, beta on the Mac, not yet a deployable beta).

**Question asked:** can the owner deploy it and use it with a Mac browser as one client and the display box as the other? Is it a beta, or at least an alpha?

**Scope:** read-only, except for this file. I:

- checked each round-4 blocker against the code and then by running it;
- ran `pnpm check` and the Go tests;
- built the box release with `box/release.sh`;
- ran that release binary in dev mode with the Vite dev server in front, with a Mac-like page and a box-like kiosk page open on the same backend;
- ran the Anthropic runtime against a scripted fake Messages API with `CORELLIA_TZ=Asia/Singapore`;
- ran token mode on a private interface and loaded it in headless Chromium and in full Chromium 148.

## Verdict: **alpha-ready to deploy today; beta-ready in everything that can be checked without the owner**

- **No code blocker is left on the recommended paths.** Those are the Mac on `http://localhost:8080`, and the box with `--with-backend` on `http://127.0.0.1:8080`. All three round-4 blockers are fixed. Two I re-verified live. The third (the box units) I re-checked statically, since there is no hardware here. Every round-4 non-blocking item I could exercise behaves as phase 16 says.
  - `pnpm check` is green: 162 vitest, all Go packages, 11 box checks, 8/8 Playwright.
  - CI is green for `681651a`, `go test -race` included.
- **What stands between this and a beta is the owner's three runs only:**
  - A: the live model;
  - B: the Mac microphone and speakers;
  - C: the first box provisioning.
  None of the three can be done here.
- **The setup the question names (Mac and box at the same time) works, with three rough edges** (non-blocking section, first group):
  - both clients speak every reply;
  - a Mac tab's heartbeat hides a hung kiosk from the watchdog;
  - with the box's backend in dev mode, the Mac cannot connect at all.
  
  Until those are fixed, use one display at a time, or mute the Mac tab.

**Recommendation:**

1. Provision the box as `box/README.md` row 1: `--with-backend`, loopback, no token.
2. Keep the Mac on its own backend at `http://localhost:8080` for development.
3. Run checklists A, B and C.
4. Fix the five "fix soon" items below (all small) before living with Mac and box on one backend, or before using the Docker image.

## Round-4 blockers, re-verified at `681651a`

| Round-4 item | State | How verified |
|---|---|---|
| 3 Model's clock ignores `CORELLIA_TZ` | **Fixed** | I ran the release binary with `CORELLIA_TZ=Asia/Singapore`, `TZ` unset, against my fake API. The boot log says `location=Asia/Singapore`. At 01:17 UTC, the request's turn-context block read `Current date and time: Friday 30 October 2026, 09:17 (+08)`. Transcript timestamps are written `+08:00`. The system block no longer carries the clock. Code: `session.Options.Location` (`internal/session/session.go:124-129`), passed from `cmd/api/main.go:120`. |
| 4 Voice dead over plain HTTP at a LAN address | **Fixed** | **Indicator:** I opened token mode on `http://172.17.0.1:18320/?kiosk=1&token=…` and pressed Ctrl+Space. The mic indicator says "voice needs HTTPS or localhost; this page is plain HTTP at a network address" in both headless shell and full Chromium. **Kiosk flag:** the output of `corellia-kiosk.sh` (`CORELLIA_KIOSK_PRINT=1`) adds `--unsafely-treat-insecure-origin-as-secure=http://172.17.0.1:18320`. It also does so for `http://box.local:8080/` and for an IPv6 literal. In **full Chromium 148** with that flag and a persistent `--user-data-dir`, the page reports `isSecureContext: true` with `navigator.mediaDevices` present. Ctrl+Space then gets past the gate to recognition, which fails only with `audio-capture` because headless has no capture device. The Playwright **headless shell** ignores the flag (`isSecureContext: false`); that is a property of the test browser, not of the box. **Docs:** the topology table in `box/README.md`, README, the Dockerfile comment and checklist B1 all say it. |
| 5 tty1 claimed twice; no install step | **Fixed in the files; unrun on hardware** | **Kiosk unit:** `Conflicts=getty@tty1.service`, `After=getty@tty1.service … corellia-api.service`, `TTYReset`/`TTYVHangup`, `-keeptty`. Both units are pulled in by `Wants=`, so systemd resolves the conflict in the kiosk's favour; that is what the docs say for two non-required jobs. **provision.sh:** removes the old auto-login override and writes `Xwrapper.config`. **Install:** `release.sh` built a static linux/amd64 binary with version `681651a` baked in, plus the client. I ran that binary as the box would (dev mode, `CORELLIA_CLIENT_DIR` = the release client) and drove a full session through it. `api.env` is `0600 root:root`. **Rootless Xorg:** with `--no-install-recommends`, `xserver-xorg-legacy` (which reads `Xwrapper.config`) may not be installed. Xorg then runs rootless through the logind session that `PAMName=login` + `TTYPath=/dev/tty1` creates. That is the intended path, but only C proves it. Fonts are fine: `chromium` → `libfontconfig1` → `fontconfig-config` pulls `fonts-dejavu-core`. |

Round-4 non-blocking items, re-checked:

| Item | State | How verified |
|---|---|---|
| Refusal glued to the partial and kept in history | **Fixed** | Fake stream "Sure, the first step is", " to", then `stop_reason: refusal`. The transcript entry is `"Sure, the first step is to…\n\nI can't help with that one."`, with `failed: true` and no error card. The next request's history goes from user "please refuse this" straight to user "what next"; the fragment is not sent. |
| Prompt caching never hits across turns | **Fixed, with a limit** | I replayed 15 logged requests through a prefix-match simulation (20-block lookback, `cache_control` stripped from the key). Results: three breakpoints at most; the moving breakpoint hits the tool round inside a turn; the history breakpoint hits across turns. The limit is in the non-blocking section: once the transcript has more than 20 entries, the history window slides and only system + tools hit. The static prefix (system 6.6k chars, tools 3.3k) is well above Opus 5.5's 512-token minimum. |
| No `.dockerignore` | **Fixed (static)** | Root `.dockerignore` excludes `**/.env*` except `.env.example`, plus `backend/data`, `node_modules`, `client/dist` and the Chromium libraries. `go.work` uses only `./backend`; the pnpm workspace is only `client`. So the context the Dockerfile copies is sufficient. Not built (no Docker socket). The `/data` permission defect below is new. |
| Watchdog never restarts a never-loaded kiosk | **Fixed** | `box/test.sh` covers the `-1` grace, its resets, unreachable and 503. Logic read and matches. |
| Local demo intent order | **Fixed** | Live: "what's the weather today" gives weather. "…in Lisbon tomorrow" gets the current-conditions disclaimer. "directions to the airport" says it doesn't know the place. "they said thanks" falls through to "I heard: …". |
| `stack.md` Referrer-Policy | **Fixed** | Reads `strict-origin-when-cross-origin`. |

## Blocking for beta (owner only)

1. **A. Live model** (`owner-checklist.md` A). There is no key here. The Anthropic wire shape is covered by goldens and my fake: beta header `server-side-fallback-2026-07-01`, layout, refusal, clock. What only the live run shows: auth, latency, first-try spec validity and cost. While doing it, read `usage.cache_read_input_tokens` on the second and later turns of a conversation. It should be non-zero for the system prefix, and for the history while the conversation is under about 10 exchanges.
2. **B. Mac microphone and speakers** (checklist B). Headless Chromium has no capture device and reports user activation as present. So autoplay, echo, barge-in on speakers and keyless recognition on a real Mac are unverified.
3. **C. First box provisioning** (`box/README.md`). In order:
   - Xorg on vt1 from the unit (`-keeptty`, rootless or the wrapper), and `getty@tty1` inactive;
   - `chrome://gpu` and the 30 fps test at the attached resolution;
   - speakers and mic through PulseAudio as the `corellia` user;
   - autoplay without a gesture (the kiosk flag);
   - the watchdog restarting a killed and a hung Chromium;
   - a power cut with the backend on the box (kiosk `After=corellia-api.service`).
   
   If a plain LAN backend is used, also confirm that Debian's `chromium` honours `--unsafely-treat-insecure-origin-as-secure` as Chromium 148 did here.

## Non-blocking

### Fix soon: Mac and box on one backend (new; verified)

These matter for the setup the question names. None affects a single display.

- **Every connected client speaks every reply.**
  - I had a Mac-like page (Vite dev server) and a box-like kiosk page open on one backend, with speech stubbed to record what each page said. Over 15 turns both pages spoke the same 23 pieces.
  - In one office that is two voices, slightly out of step. With both mics open, each client's echo cancellation knows only its own output, so the other's speech can be heard as a barge-in or a turn.
  - Ctrl+M mutes only the mic (`voice/activation.ts:42`). There is no per-client speaker mute.
  - Workaround: mute the Chrome tab on the Mac.
  - **Fix:** a client role, for example only `?kiosk=1` speaks when a kiosk is connected; or a `?quiet=1` parameter; or a key that mutes speech output for this client.
- **The watchdog's heartbeat is global.**
  - Every client posts `/api/heartbeat` (`app/App.tsx:108`, `session/heartbeat.ts`). The server keeps one timestamp (`httpsrv` `Heartbeat`).
  - An open Mac tab therefore keeps `client_heartbeat_age_s` fresh while the box's Chromium is hung or sitting on its error page, and the watchdog never restarts it.
  - `PlatformAdapter.heartbeat()` exists but is a no-op and unused.
  - **Fix:** post heartbeats only when `platform.isKiosk()`, or tag them (`?kiosk=1`) and have `/healthz` report the kiosk's age.
- **With the box's backend in dev mode, the Mac is refused.**
  - Dev mode serves loopback only, so `http://<box>:8080` from the Mac gets 403.
  - Both clients on the box's backend needs `CORELLIA_DEVICE_TOKEN`. The Mac also needs HTTPS for voice (`tailscale serve`); the kiosk flag helps only the box.
  - The topology table covers each display separately but never says what "both at once" takes.
  - **Fix (docs):** one row or paragraph for "Mac and box on one backend": token + `tailscale serve`; the Mac opens the `https://…ts.net` URL; mute the Mac tab until the first item is fixed.

### Fix soon: deployment hardening (new)

- **Dev mode behind a same-host proxy is open to everyone the proxy serves.** *(verified)*
  - Dev-mode auth trusts the TCP peer (`auth.isLoopback`). A reverse proxy or `tailscale serve` on the same host connects from `127.0.0.1`.
  - Against the dev-mode release binary, `GET /api/session` and `POST /api/turn` with `X-Forwarded-For: 100.64.1.9` and a `Tailscale-User-Login` header returned 200 and 202.
  - The README's HTTPS row says to set `CORELLIA_DEVICE_TOKEN`, so following the docs is safe. The risky step is the natural one: row 1 (dev mode on the box) followed later by `tailscale serve` "for voice on the Mac". That leaves the agent and its confirm gate open to the tailnet, or to the internet behind a public proxy.
  - **Fix:** in dev mode, refuse requests carrying `X-Forwarded-For`, `Forwarded`, `X-Real-IP` or `Tailscale-*` headers ("dev mode: a proxy needs CORELLIA_DEVICE_TOKEN"). Also say so next to the `tailscale serve` line in both READMEs.
- **The Docker image cannot write `/data`.** *(static read, failure simulated; not built, no Docker socket)*
  - The final stage declares `VOLUME ["/data"]` and `USER corellia` without creating `/data` first. A path that does not exist in the image is created `root:root 0755`, both for a fresh named volume and for the anonymous volume Docker makes when none is given.
  - I simulated an unwritable data dir with the release binary. It boots, `/healthz` says `ok: true`, and turns run, but every write logs `session: persist transcript … permission denied`. Transcript, memory notes and reminders would be lost on every container restart.
  - **Fix:**
    - add `RUN mkdir -p /data && chown corellia:corellia /data` before `VOLUME`;
    - have `cmd/api` probe that `CORELLIA_DATA_DIR` is writable at boot and exit, or report it in `/healthz`, instead of serving a session that silently forgets.

### Smaller (new)

- **The history cache stops hitting after about 10 exchanges.** `HistoryLimit` is 20 entries with a sliding start (`session.go:675-680`), so once the transcript is longer, every turn drops the oldest pair and the history prefix changes. In the simulation, requests 0-10 hit the history breakpoint; requests 11-14 hit only system + tools. For an always-on agent the transcript is always longer than 20, so steady state is the system prefix only. That is still the large part. Separately, the default 5-minute TTL means turns more than 5 minutes apart start cold. Cheap levers if A shows the cost matters:
  - trim the window in steps (drop 10 entries at a time) so the prefix holds for several turns;
  - consider `ttl: "1h"` on the system breakpoint.
- **`box/release/` is not gitignored.** Running `./box/release.sh` with its default output leaves a ~20 MB binary and a client build untracked in the tree. One `git add -A` away from a commit. Add it to `.gitignore`.
- **Glance cards cover the chart.** At 1440×900, after "show me a chart" then "remind me in 1 minute to stretch", the reply's text card sits over the chart's Thu-Sat data. The proposal card covers the Sat/Sun axis labels (screenshot taken during the run, not kept in the repo). Readable and dismissable, but it hides data the agent just chose to show. A full visual could push glance cards to the gutter, or into the footer zone the transcript already reserves.

### Carried over, still open (from round 4, unchanged)

- Held speech replays in full on the first gesture, however old (Mac only).
- The tile probe recognises only today's OSM block image.
- The directions origin is the Lisbon constant.
- No speech prefetch with server TTS.
- No `Risk: "high"` tool.
- A bound `Image.src` is covered by the CSP only.
- Fit-ranking does not narrow the prompt.
- Ctrl+Space is not configurable.
- Hermes has no stop reason.

## VISION.md, section by section (changes since round 4)

| Section | State |
|---|---|
| 2/3 Experience | Idle, map (with OSM attribution), weather, table, chart, schedule, proposal, failure and clock all render on the dev server and on the built server, with no console error in either page. Input focused at load. The proposal confirms with Enter; Escape dismisses. The reminder set for 1 minute fired at 01:16:27 (`source: proactive`, "Reminder: stretch"). |
| 3 No mouse | Holds. Every step above was keyboard only. |
| 4 Architecture | Unchanged. Two clients on one session work (same events, same spec), but there is no notion of which client is the display (speech, heartbeat). |
| 5 Catalog, streaming, validation | Done. `cmd/runtime-check -runtime local`: plain, tool + `show_ui` (6 ops, 0 spec errors) and cancel all pass. |
| 6 Decision layer | Speech pieces split correctly. Refusal and failure are separate pieces, and neither goes to history. |
| 7 Runtime | Anthropic request shape is right: clock in the user turn, static system block, three breakpoints. Waiting on A. |
| 8 Display box | Every file-level defect from round 4 is fixed. Waiting on C. Mac-plus-box gaps above. |
| 11.9 Auth | Token mode is correct on a private interface (401 without, 200 with; `/healthz` open for the watchdog). Dev mode behind a proxy is the gap above. |

## What I ran

**Build and tests**

- `pnpm install --frozen-lockfile && pnpm check` exits 0:
  - type-check;
  - lint (0 errors, the two known fast-refresh warnings);
  - 28 files and **162** vitest tests;
  - `go vet`, all Go packages;
  - `box/test.sh` (**11** checks);
  - Playwright **8/8**.
- `go test -count=1 ./...`: every package ok, uncached.
- `gofmt -l backend` is clean.
- CI run `40979703479` for `681651a` is green: backend (with `-race`), box, contract, client, smoke.
- `box/release.sh <scratchpad>`: static linux/amd64 `api` (version and commit `681651a`) and `client/`.

**Live servers** (release binary, scratchpad data dirs; all stopped by PID)

- **`:18300`, dev mode, local runtime, release client**, with **Vite on `:18301`** (`CORELLIA_BACKEND_URL` → `:18300`):
  - a Mac-like page on `http://localhost:18301/` and a kiosk page on `http://127.0.0.1:18300/?kiosk=1`, both online;
  - 16 steps of a session typed on the Mac page; speech recorded on both pages;
  - the dev-mode proxy probe.
- **`:18310`, Anthropic runtime → fake Messages API on `:18311`**, `CORELLIA_TZ=Asia/Singapore`: 14 turns (plain, tool round, refusal, then 10 more to pass the history window). Request bodies logged and analysed for the clock, breakpoints and prefix hits.
- **`:18320`, token mode bound to `172.17.0.1`** (a private bridge, not the public interface): the insecure-context indicator, and the kiosk flag in headless shell and in full Chromium 148.
- **`:18330`, dev mode with an unwritable data dir**: the Docker `/data` simulation.
- `cmd/runtime-check -runtime local`: three rows, all pass.

**Browser:** Playwright 1.60. Headless shell 148 with `scripts/chromium-libs.sh`. For the kiosk-flag check only, full Chromium 148, with `libcups2t64`, cairo, pango and their dependencies fetched with `apt-get download` into the scratchpad. Fake media devices; `speechSynthesis` stubbed to record utterances.

**Lookups:** prompt-caching minimums and TTL for `claude-opus-5-5` (512-token minimum; 5-minute default, `ttl: "1h"` option).

**Not done:**

- 24-hour soak;
- Safari;
- real audio devices and the autoplay block;
- live cloud APIs;
- Docker (no socket);
- `box/` on hardware;
- `tailscale serve` (it would publish on the tailnet).

**Cleanup:**

- I stopped every server I started by its PID: `:18300`, `:18301`, `:18310`, `:18311`, `:18320` and `:18330`. No process was stopped by pattern.
- Besides this file, the review changed no code, configuration or docs.
- `pnpm check` and `release.sh` rebuilt the git-ignored `client/dist` and `backend/bin` as usual. The release output went to the scratchpad, not `box/release/`.
