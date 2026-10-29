# Phase 7: Cloud runtimes and the runtime spike

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.7. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 7.

## Summary

Real inference now sits behind the `AgentRuntime` seam: a Claude runtime (Messages API, streaming, tool use, `show_ui` → spec ops, server-side refusal fallbacks), an OpenAI-compatible runtime (any chat-completions endpoint, which covers DeepSeek models directly), a Hermes sidecar adapter, and a `NotImplemented` stub for the OpenWorld DeepSeek harness. `CORELLIA_RUNTIME=auto` picks by available credentials and falls back to the keyless local runtime. A `runtime-spike` command runs the VISION 7 ten-turn script and writes a Markdown report; the local run is committed. Cloud runtimes are verified against recorded wire-format fixtures, not live services (no credentials here).

## What was built

- `internal/runtime/prompt`: `System(ctx, Options)` renders the shared system prompt: voice-first speaking style, confirmation and tool rules, `show_ui` op instructions, the catalog description, memory, screen summary, current time.
- `internal/runtime/toolexec`: `Run` executes one tool call for a cloud runtime: emits `tool_call`, turns `ErrRequiresConfirm` into a `proposal` event and a "waiting for confirmation" result, forwards result ops as `spec_op` events (the session validates and applies them), emits `tool_result`, and returns the content (plus structured data) the model sees.
- `internal/runtime/anthropic`: Claude via the Anthropic Go SDK v2 beta Messages API. Streaming (`NewStreaming` + `Accumulate`), text deltas as they arrive, a manual tool loop (up to 8 rounds) over the registry's definitions (JSON Schema properties/required/extra fields mapped to `BetaToolInputSchemaParam`), history mapped to user/assistant turns, system prompt with a cache breakpoint, `output_config.effort` (default `low` for voice latency), server-side refusal fallbacks on by default (`fallbacks: "default"` + beta `server-side-fallback-2026-07-01`), `refusal` stop reason spoken as a short decline, HTTP errors as fatal events, cancellation through the context. Model default `claude-opus-5-5`, overridable with `CORELLIA_MODEL`.
- `internal/runtime/openaicompat`: raw HTTP chat completions with `stream: true` and function tools; SSE parsing, tool-call argument assembly across chunks, tool loop, assistant/tool message history, errors surfaced. Defaults: base `https://api.openai.com/v1`, model `gpt-4o-mini`, or `deepseek-chat` when the base URL is DeepSeek.
- `internal/runtime/hermes`: adapter over the sidecar's `POST /chat` (bearer token, per-screen session id). Primes the sidecar session once with the system prompt, then sends turns; a fenced ```` ```corellia-ui ```` JSON array in the reply is emitted as spec ops (best effort). Non-streaming; no tools.
- `internal/runtime/deepseek`: `Runtime.Start` returns `ErrNotImplemented` (roadmap rule 7); DeepSeek models are reachable through `openaicompat`.
- `internal/runtime/rtselect`: `Select(cfg)` resolves `auto` and named runtimes; a named runtime without credentials fails loudly. `config` gained `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `CORELLIA_MODEL`, `CORELLIA_EFFORT` (validated), `CORELLIA_HERMES_URL`, `CORELLIA_HERMES_TOKEN`. `cmd/api` uses the selector.
- `internal/session`: the runtime context now carries the catalog description (computed once) and a screen summary.
- `cmd/runtime-spike`: runs the ten-turn script through a real session (tools, gate), measures time to first token, time to first op, total time, ops accepted vs rejected, cancel latency, and writes `docs/executing/spikes/<runtime>-<date>.md`.
- Tests: Anthropic (full tool loop with `show_ui` and `get_time` over a fake SSE server checking request bodies, betas, effort, tool definitions, tool results; gated tool → proposal; refusal; HTTP error; cancel mid-stream), OpenAI-compatible (split tool-call arguments, two calls, history shape, 429), Hermes (priming, fenced ops, auth header, 502), selector, prompt, stub; `rttest` fake tools shared by them.

## Design decisions

- **One prompt, one tool executor, three wire formats.** Everything a runtime does besides speaking the provider's protocol lives in `prompt` and `toolexec`, so the three cloud runtimes differ only in transport and the spike compares like with like.
- **Claude through the SDK, per the `claude-api` skill.** Beta Messages API because refusal fallbacks live there; `claude-opus-5-5` default; effort `low` by default because this is a voice assistant where latency matters more than depth (`CORELLIA_EFFORT` raises it). Thinking is left adaptive by omission.
- **`show_ui` is a tool, ops are events.** Models emit UI the same way they call any tool; the session validates every op exactly as it does for the local runtime, so first-try validity is measurable per runtime.
- **OpenAI-compatible without an SDK.** The wire format is small and stable, and it keeps the DeepSeek path dependency-free.
- **Hermes stays what it is.** The sidecar is non-streaming and tool-less today (VISION 7 table); the adapter makes it usable behind the seam and the fenced-block convention makes visuals possible without changing the image. Verified only against a fake sidecar.
- **Auto-selection by credentials.** A box with no keys runs the local runtime; adding `ANTHROPIC_API_KEY` switches it without a config change.

## Files changed

Added: `backend/internal/runtime/{prompt,toolexec,anthropic,openaicompat,hermes,deepseek,rtselect,rttest}/*`, `backend/cmd/runtime-spike/main.go`, `docs/executing/spikes/local-2026-10-29.md`. Edited: `backend/internal/config/config.go` (+test), `backend/cmd/api/main.go`, `backend/internal/session/session.go`, `backend/go.mod`/`go.sum` (+ anthropic-sdk-go v2.4.0), `.env.example`, docs.

## How to run

```bash
# Claude
ANTHROPIC_API_KEY=... CORELLIA_RUNTIME=auto go run ./cmd/api
# DeepSeek
OPENAI_BASE_URL=https://api.deepseek.com/v1 OPENAI_API_KEY=... go run ./cmd/api
# Hermes sidecar
CORELLIA_RUNTIME=hermes CORELLIA_HERMES_URL=http://host:8787 CORELLIA_HERMES_TOKEN=... go run ./cmd/api
# Spike
cd backend && go run ./cmd/runtime-spike -runtime local      # or anthropic | openai | hermes
```

## How to test

`go test ./...` (new: anthropic 4, openaicompat 3, hermes 2, rtselect 7 cases, prompt 1, deepseek 1). Verified here: all green. Local spike report committed: 100% of 37 ops accepted, mean first token 248 ms (the weather turn waits on Open-Meteo), cancel latency 0 ms.

## Known gaps

- **No live cloud run.** No credentials exist in this environment; the Anthropic and OpenAI-compatible runtimes are exercised only against recorded fixtures that follow the documented wire formats. The first live run should be the spike (`-runtime anthropic`), whose report will show first-try spec validity.
- Hermes is verified against a fake sidecar only; the real image cannot be built here (no Docker socket).
- The DeepSeek harness remains a stub pending code-boundary terms.
- Tool definitions are sent without `strict: true` (some built-in schemas use `anyOf`); first-try validity relies on the model.
- Soak and barge-in measurements from VISION 7 are not part of the spike yet (voice arrives in Phase 8).
