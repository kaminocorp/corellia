# Phase 8: Voice

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.8. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 8.

## Summary

Corellia now listens and speaks. The client captures the microphone through the platform adapter, segments utterances with an energy VAD, sends them to the server's STT (or uses the browser's own recognition when none is configured), plays the decider's sentence-sized `speech` events through server TTS (or `speechSynthesis`), feeds the playback level to the 3D agent, and barges in (stops playback, cancels the running turn) when the user starts speaking or typing. Activation is `Ctrl+Space` (toggle, or hold in push-to-talk mode), `Ctrl+M` mutes, and the mic state is always visible. The backend gained STT/TTS provider seams with an OpenAI audio provider and a `none` provider, plus the voice endpoints. Keyless in Chrome on macOS the whole loop works through browser APIs; cloud providers are verified against fakes only.

## What was built

### Backend

- `internal/voice`: `STT` / `TTS` interfaces, `Transcript`, `Audio`, `None` (returns `ErrUnavailable`), `OpenAI` (multipart `/audio/transcriptions` with `gpt-4o-mini-transcribe`, JSON `/audio/speech` with `gpt-4o-mini-tts`, voice and format options, streaming body), `Select(cfg)` (`auto` → OpenAI when `OPENAI_API_KEY` is set and the base URL is not DeepSeek, else none), `Capabilities`.
- `internal/httpsrv`: `GET /api/voice/capabilities`, `POST /api/voice/stt` (raw `audio/*` body, 8 MiB cap, `?lang=`), `POST /api/voice/tts` (`{text, voice}` → audio stream); 501 when the provider is `none`.
- `config`: `CORELLIA_STT`, `CORELLIA_TTS` (`auto|none|openai`), `CORELLIA_TTS_VOICE`, `CORELLIA_VOICE_MODE` (`toggle|ptt`), validated. Session capabilities carry the provider names. `cmd/api` wires it.

### Client

- `platform/`: `PlatformAdapter` (`getMicStream` with echo cancellation, noise suppression and AGC; `isKiosk`; `heartbeat`), `browserPlatform`, `shellPlatform` stub throwing `NotImplementedError`, `detectPlatform`.
- `voice/vad.ts`: `EnergyVAD` (adaptive noise floor, gate = max(threshold, floor × ratio), minimum speech run, silence hangover, maximum utterance), `rms`.
- `voice/capture.ts`: `MicCapture` (AnalyserNode at 50 Hz → VAD; MediaRecorder kept running and restarted while idle so an utterance carries ≤ 1.5 s of leading silence; on speech end the blob goes to `onUtterance`; `pickMime` prefers webm/opus).
- `voice/browserStt.ts`: `BrowserStt` over `SpeechRecognition` / `webkitSpeechRecognition` (continuous, final results only, auto-restart, speech start/end hooks).
- `voice/playback.ts`: `SpeechPlayer` (ordered queue, one piece at a time, `stop()` = barge-in, speaking callbacks), `ServerTtsBackend` (fetch → `decodeAudioData` → `AudioBufferSourceNode` with an analyser writing `audioLevel`), `BrowserSynthBackend` (`speechSynthesis` with a synthetic level envelope).
- `voice/activation.ts`: `Activation` state machine (off / listening / capturing / muted; toggle and ptt modes; `Ctrl+Space`, `Ctrl+M`).
- `voice/controller.ts`: `VoiceController` (capabilities → backends; keys → activation → open/close mic; utterance → transcribe → voice turn; speech start / typing → barge-in with turn cancel; stream `speech` events → player; new or cancelled turn → stop; injectable deps). `voice/useVoice.ts`: thin hook (`useSyncExternalStore`).
- `app/MicIndicator.tsx` (state dot, label, key hint, speaking, browser-recognition and error notes) mounted top-right; the 3D agent shows `listening` while capturing; typing into an empty input barges in.
- `session/api.ts`: `transcribe`, `synthesize`.
- Tests (+13): VAD segmentation, floor adaptation and cap; activation modes and mute; player ordering and barge-in; controller (open mic, utterance → turn, barge-in cancels, browser-recognition path, mic error, stop on turn start/cancel); platform stub.

## Design decisions

- **Own pipeline, two backends per direction.** Nothing from OpenWorld; the server seams are one file per vendor, the client picks browser APIs when the server reports `none`, so development needs no keys and the box can use cloud STT/TTS by setting one variable.
- **Sentence-level speech from the decider.** The session already emits `speech` per sentence, so audio starts before the reply ends and barge-in can cut between sentences.
- **Barge-in is one method.** Speech start (VAD or recognition), typing into an empty input, a new turn and a cancelled turn all go through `player.stop()`; the first two also cancel the running turn.
- **Off at boot, visible always.** The mic opens only on `Ctrl+Space` (privacy, roadmap question 6); the indicator is part of the header, not a transient toast.
- **Controller outside React.** The imperative audio lifecycle lives in a class with injected dependencies; the hook only subscribes. This is also what makes it testable in jsdom, which has no audio APIs.
- **Recorder restart instead of ring buffers.** MediaRecorder chunks are not splittable mid-stream; restarting while idle bounds leading silence without decoding audio in JS.
- **OpenAI audio defaults.** `gpt-4o-mini-transcribe` and `gpt-4o-mini-tts` / `alloy` / mp3 are defaults, overridable in `voice.OpenAI`; a DeepSeek base URL does not enable them.

## Files changed

Added: `backend/internal/voice/{voice,openai,select}.go` (+test), `backend/internal/httpsrv/voice_handler.go` (+test), `client/src/platform/index.ts` (+test), `client/src/voice/{vad,capture,browserStt,playback,activation,capabilities,controller,useVoice}.ts` (+tests), `client/src/app/MicIndicator.tsx`. Edited: `backend/internal/config/config.go` (+test), `backend/internal/httpsrv/server.go`, `backend/cmd/api/main.go`, `client/src/session/api.ts`, `client/src/app/App.tsx`, `.env.example`, docs.

## How to run

```bash
pnpm -C client build && cd backend && go run ./cmd/api
```

In Chrome on macOS: press `Ctrl+Space`; the header shows "listening · browser recognition"; say "what time is it"; the reply streams and is spoken by `speechSynthesis` while the nebula pulses; start talking (or typing) mid-sentence and playback stops. With `OPENAI_API_KEY` set, the server transcribes and synthesises instead (`/api/voice/capabilities` reports `openai`). `CORELLIA_VOICE_MODE=ptt` makes `Ctrl+Space` push-to-talk.

## How to test

`go test ./...` (new: voice 2, httpsrv voice 2, config cases). `pnpm -C client test` (116 tests). Verified here: all green; type-check, lint (0 errors), build.

## Known gaps

- **No microphone, speaker or browser here.** Capture, recognition and synthesis are verified by unit tests with fakes and by reasoning about the browser APIs; the first run on macOS is the acceptance test. The OpenAI audio endpoints are exercised against a fake server only.
- Echo cancellation relies on the browser's `getUserMedia` constraints; the box may need tuning (VAD threshold is a constant for now, `?vad=` tuning flag is a candidate).
- Browser recognition in Chrome sends audio to Google; it is the keyless dev path, not the intended box path.
- Wake word remains deferred; `Ctrl+Space` is the only activation.
- The `audio_url` field on `speech` events is unused (the client fetches TTS per piece).
