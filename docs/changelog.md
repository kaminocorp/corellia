# Changelog

Index - short one-liners:

- [0.15.9 - Phase 9: File Store + Memory/Reminder/Transcript Persistence + Memory Summary in Prompts + Proactive Scheduler (Reminders, Ambient Clock) with Hold Policy (2026-10-29)](#0159---phase-9-file-store--memoryremindertranscript-persistence--memory-summary-in-prompts--proactive-scheduler-reminders-ambient-clock-with-hold-policy-2026-10-29)
- [0.15.8 - Phase 8: Voice (STT/TTS Seams + OpenAI Audio Provider + Endpoints; Client VAD Capture, Browser Recognition Fallback, Speech Playback with Audio Level, Activation Keys, Barge-In, Mic Indicator) (2026-10-29)](#0158---phase-8-voice-stttts-seams--openai-audio-provider--endpoints-client-vad-capture-browser-recognition-fallback-speech-playback-with-audio-level-activation-keys-barge-in-mic-indicator-2026-10-29)
- [0.15.7 - Phase 7: Cloud Runtimes (Anthropic Streaming + Tool Use, OpenAI-Compatible/DeepSeek, Hermes Sidecar, DeepSeek-Harness Stub) + Runtime Selector + Runtime Spike (2026-10-29)](#0157---phase-7-cloud-runtimes-anthropic-streaming--tool-use-openai-compatibledeepseek-hermes-sidecar-deepseek-harness-stub--runtime-selector--runtime-spike-2026-10-29)
- [0.15.6 - Phase 6: Decision Layer (Rules) + Propose/Confirm Gate + Tool Registry with Built-ins (Time, Geocode, Weather, Memory, Reminders, Directions, show_ui) + Confirm Cards and Phrases (2026-10-29)](#0156---phase-6-decision-layer-rules--proposeconfirm-gate--tool-registry-with-built-ins-time-geocode-weather-memory-reminders-directions-show_ui--confirm-cards-and-phrases-2026-10-29)
- [0.15.5 - Phase 5: 3D Agent (R3F Nebula, State Machine, Audio Hook, Adaptive Resolution, Fallback, Stats Overlay) (2026-10-29)](#0155---phase-5-3d-agent-r3f-nebula-state-machine-audio-hook-adaptive-resolution-fallback-stats-overlay-2026-10-29)
- [0.15.4 - Phase 4: Component Library (15 Components) + Renderer (Bindings, Hotkeys, Decay, Placement) + Catalog Describe/Rank + Action and Screen Endpoints (2026-10-29)](#0154---phase-4-component-library-15-components--renderer-bindings-hotkeys-decay-placement--catalog-describerank--action-and-screen-endpoints-2026-10-29)
- [0.15.3 - Phase 3: AgentRuntime Seam + Local Runtime + Session with SSE Event Stream + Client Session Store (2026-10-29)](#0153---phase-3-agentruntime-seam--local-runtime--session-with-sse-event-stream--client-session-store-2026-10-29)
- [0.15.2 - Phase 2: Shared Contract (JSON Schemas + v1 Catalog + Go/TS Codegen + Validators + Reducers with Shared Fixtures) (2026-10-29)](#0152---phase-2-shared-contract-json-schemas--v1-catalog--gots-codegen--validators--reducers-with-shared-fixtures-2026-10-29)
- [0.15.1 - Phase 1: Legacy Control Plane Removed + Go Backend Skeleton (Device Token, Static Client) + Vite Client Skeleton (2026-10-29)](#0151---phase-1-legacy-control-plane-removed--go-backend-skeleton-device-token-static-client--vite-client-skeleton-2026-10-29)
- [0.15.0 - Vision Roadmap: Ten-Phase Implementation Plan + Section 11 Defaults (2026-10-29)](#0150---vision-roadmap-ten-phase-implementation-plan--section-11-defaults-2026-10-29)
- [0.14.1 - Vision: Default Client Approach (Web Client, Browser on macOS, Kiosk or Shell on the Box) (2026-10-29)](#0141---vision-default-client-approach-web-client-browser-on-macos-kiosk-or-shell-on-the-box-2026-10-29)
- [0.14.0 — Direction Reset: Personal Agent Workspace Vision + Docs Archive Cleanup (2026-10-28)](#0140--direction-reset-personal-agent-workspace-vision--docs-archive-cleanup-2026-10-28)
- [0.13.12 — Presentation Deck Restructure (4 Problem Slides + Tangle/Thesis Redesign) + Tools Inventory Grid + Carousel Icon Buttons + Layout Overflow Fixes](#01312--presentation-deck-restructure-4-problem-slides--tanglethesis-redesign--tools-inventory-grid--carousel-icon-buttons--layout-overflow-fixes-2026-04-27)
- [0.13.11 — Spawn RPG Redesign: Per-Card Nebulas + Gallery Cleanup + Three-Column Character Layout](#01311--spawn-rpg-redesign-per-card-nebulas--gallery-cleanup--three-column-character-layout-2026-04-27)
- [0.13.10 — v1.5 Pillar B Post-Review Hardening: Credential Reattachment + Adapter Revocation Policy + Frozenset Audit + 16 Misc Fixes Across BE / FE / Adapter](#01310--v15-pillar-b-post-review-hardening-credential-reattachment--adapter-revocation-policy--frozenset-audit--16-misc-fixes-across-be--fe--adapter-2026-04-27)
- [0.13.9 — Vercel Build Fix: `pnpm.packageExtensions` — Inject `zod` Peer into `@hookform/resolvers`](#0139--vercel-build-fix-pnpmpackageextensions--inject-zod-peer-into-hookformresolvers-2026-04-27)
- [0.13.8 — v1.5 Pillar B Phase 7: Fleet Inspector Tool Editor + `RestartAgentInstance` + `tool_grant_audit` + Manifest Rate-Limit (Pillar B Complete)](#0138--v15-pillar-b-phase-7-fleet-inspector-tool-editor--restartagentinstance--tool_grant_audit--manifest-rate-limit-pillar-b-complete-2026-04-27)
- [0.13.7 — README Demo Video: `capture:video` Script (Puppeteer + ffmpeg → MP4)](#0137--readme-demo-video-capturevideo-script-puppeteer--ffmpeg--mp4-2026-04-27)
- [0.13.6 — v1.5 Pillar B Operator Gate: Adapter Image Push + Migrations Applied + Tools Governance Activated](#0136--v15-pillar-b-operator-gate-adapter-image-push--migrations-applied--tools-governance-activated-2026-04-27)
- [0.13.5 — v1.5 Pillar B Phase 6: Org Tool Curation Page (`/settings/tools`)](#0135--v15-pillar-b-phase-6-org-tool-curation-page-settingstools-2026-04-27)
- [0.13.4 — v1.5 Pillar B Phase 5: `corellia_guard` Plugin (URL / Command / Path Enforcement + Manifest Poll Daemon)](#0134--v15-pillar-b-phase-5-corellia_guard-plugin-url--command--path-enforcement--manifest-poll-daemon-2026-04-27)
- [0.13.3 — v1.5 Pillar B Phase 4: Wizard TOOLS Step](#0133--v15-pillar-b-phase-4-wizard-tools-step-2026-04-27)
- [0.13.2 — v1.5 Pillar B Phase 3: Backend RPCs (ListTools / Grant / Curation)](#0132--v15-pillar-b-phase-3-backend-rpcs-listtools--grant--curation-2026-04-27)
- [0.13.1 — v1.5 Pillar B Phase 2: Manifest Plumbing (Proto + Bearer-Token Endpoint + Adapter Integration)](#0131--v15-pillar-b-phase-2-manifest-plumbing-proto--bearer-token-endpoint--adapter-integration-2026-04-27)
- [0.13.0 — v1.5 Pillar B Phase 1: Tools Governance Schema + Scope Validator + Service Foundation](#0130--v15-pillar-b-phase-1-tools-governance-schema--scope-validator--service-foundation-2026-04-27)
- [0.12.6 — Spawn Redesign Post-Phase-5 Hardening: Carousel Canvas Overlay Self-Measures + Stale `<RosterCard>` JSDoc Cleanup + `<HarnessSlide>` `isActive` Contract Note](#0126--spawn-redesign-post-phase-5-hardening-carousel-canvas-overlay-self-measures--stale-rostercard-jsdoc-cleanup--harnessslide-isactive-contract-note-2026-04-27)
- [0.12.5 — Spawn Redesign Phase 5: Compact Step-1 Confirmed Pane + design-system §33.5 / §34.5 Reconciliation](#0125--spawn-redesign-phase-5-compact-step-1-confirmed-pane--design-system-335--345-reconciliation-2026-04-27)
- [0.12.4 — Spawn Redesign Phase 4: Steps 2–5 RPG Reskin (Callsign Card / Faction × Class / Loadout / Character Sheet + READY TO LAUNCH)](#0124--spawn-redesign-phase-4-steps-25-rpg-reskin-callsign-card--faction--class--loadout--character-sheet--ready-to-launch-2026-04-27)
- [0.12.3 — Spawn Redesign Phase 3: Live `<NebulaAvatar>` Carousel Overlay + Palette Crossfade](#0123--spawn-redesign-phase-3-live-nebulaavatar-carousel-overlay--palette-crossfade-2026-04-27)
- [0.12.2 — Spawn Redesign Phase 2: `<HarnessCarousel>` + `<HarnessSlide>` + `roster-card.tsx` Deleted](#0122--spawn-redesign-phase-2-harnesscarousel--harnessslide--roster-cardtsx-deleted-2026-04-27)
- [0.12.1 — Global Type-Scale Bump: `html font-size 17px` + Chrome Label / Card Text Increases](#0121--global-type-scale-bump-html-font-size-17px--chrome-label--card-text-increases-2026-04-27)
- [0.12.0 — Spawn Redesign Phase 1: Wizard Reducer `harnessMode` + `getInitialState(mode)` + `GalleryWizardShell` + `spawn/page.tsx` Server Component](#0120--spawn-redesign-phase-1-wizard-reducer-harnessmode--getinitialstatemode--gallerywizardshell--spawnpagetsx-server-component-2026-04-27)
- [0.11.10 — `BulkUpdateDeployConfig` Correctness: `errgroup.Wait()` Error Propagation + Context-Cancellation Test (Code Assessment §2.1)](#01110--bulkupdatedeployconfig-correctness-errgroupwait-error-propagation--context-cancellation-test-code-assessment-21-2026-04-27)
- [0.11.9 — M-chat Post-Operator-Gate P1 Polish: Sidecar Stub Fail-Fast + Honest `/health` + Schema Hardening + Smoke Negative Paths + Probe-Timeout Bump + 401-Drain](#0119--m-chat-post-operator-gate-p1-polish-sidecar-stub-fail-fast--honest-health--schema-hardening--smoke-negative-paths--probe-timeout-bump--401-drain-2026-04-27)
- [0.11.8 — M-chat Phase 7 Operator-Gate Verification: GHCR Push + Migration Confirmed Applied](#0118--m-chat-phase-7-operator-gate-verification-ghcr-push--migration-confirmed-applied-2026-04-27)
- [0.11.7 — M-chat Post-Review Hardening: Inspector `chatEnabled` Lock-as-Read-Only + Chat-Panel Double-Enter Guard + ARIA + Error Remediation Hints](#0117--m-chat-post-review-hardening-inspector-chatenabled-lock-as-read-only--chat-panel-double-enter-guard--aria--error-remediation-hints-2026-04-27)
- [0.11.6 — M-chat Hermes Chat Sidecar Phase 7: Adapter Image Rebuild + GHCR Push + Migration + Smoke (M-chat Complete)](#0116--m-chat-hermes-chat-sidecar-phase-7-adapter-image-rebuild--ghcr-push--migration--smoke-m-chat-complete-2026-04-27)
- [0.11.5 — M-chat Hermes Chat Sidecar Phase 6: `Health()` HTTP Probe for Chat-Enabled Instances + List Query Widened + Fleet Gallery Chat Badge](#0115--m-chat-hermes-chat-sidecar-phase-6-health-http-probe-for-chat-enabled-instances--list-query-widened--fleet-gallery-chat-badge-2026-04-27)
- [0.11.4 — M-chat Hermes Chat Sidecar Phase 5: `ChatWithAgent` RPC + Handler + FE Chat Panel + Instance-Detail Page](#0114--m-chat-hermes-chat-sidecar-phase-5-chatwithagent-rpc--handler--fe-chat-panel--instance-detail-page-2026-04-27)
- [0.11.3 — M-chat Hermes Chat Sidecar Phase 4: `ChatWithAgent` Domain Method (GetAppSecret Interface + Bearer-Proxy + 12 New Tests)](#0113--m-chat-hermes-chat-sidecar-phase-4-chatwithagent-domain-method-getappsecret-interface--bearer-proxy--12-new-tests-2026-04-27)
- [0.11.2 — M-chat Hermes Chat Sidecar Phase 3: Backend Stack (chat_enabled Migration + DeployConfig + Services Block + Token Generation + 4 New Tests)](#0112--m-chat-hermes-chat-sidecar-phase-3-backend-stack-chat_enabled-migration--deployconfig--services-block--token-generation--4-new-tests-2026-04-27)
- [0.11.1 — M-chat Hermes Chat Sidecar Phase 2: Dockerfile + Entrypoint Two-Process Supervisor (CORELLIA_CHAT_ENABLED Gate)](#0111--m-chat-hermes-chat-sidecar-phase-2-dockerfile--entrypoint-two-process-supervisor-corellia_chat_enabled-gate-2026-04-27)
- [0.11.0 — M-chat Hermes Chat Sidecar Phase 1: Sidecar Source + Bearer Auth + LRU Session Cache + Smoke Harness](#0110--m-chat-hermes-chat-sidecar-phase-1-sidecar-source--bearer-auth--lru-session-cache--smoke-harness-2026-04-26)
- [0.10.7 — Fleet Gallery: 3-Column Grid Match with Spawn + Icon-Only Compact Row Actions (Card Footer Overflow Fix)](#0107--fleet-gallery-3-column-grid-match-with-spawn--icon-only-compact-row-actions-card-footer-overflow-fix-2026-04-27)
- [0.10.6 — Spawn Page Cosmetic Pass: Locked-Card Particle Cloud Fallback + SaaS-Standard Type Scale Bump (Wizard + Deployment Form + Label/Button Primitives)](#0106--spawn-page-cosmetic-pass-locked-card-particle-cloud-fallback--saas-standard-type-scale-bump-wizard--deployment-form--labelbutton-primitives-2026-04-27)
- [0.10.5 — Presentation Polish Phases 1–6: Beat Sheet + R3F Scene Library (5 Scenes) + 7-Slide Rewrite + Crossfade + Audio Scaffold + `?mode=record`](#0105--presentation-polish-phases-16-beat-sheet--r3f-scene-library-5-scenes--7-slide-rewrite--crossfade--audio-scaffold--moderecord-2026-04-26)
- [0.10.4 — M5 Fleet Control Hardening: Lifo Failed-First Scale-Down + Idempotent Destroy + Region-Loop Lifetime + Lease-Nonce Log + Drift All-Mismatches + Name-Match Destroy Gate + Bulk-Delta Wire Contract Doc](#0104--m5-fleet-control-pre-prod-hardening-lifo-failed-first-scale-down--idempotent-destroy--region-loop-lifetime--lease-nonce-log--drift-all-mismatches--name-match-destroy-gate--bulk-delta-wire-contract-doc--4-new-tests-2026-04-26)
- [0.10.3 — M5 Fleet Control Phase 8: Bulk Fleet Ops (Header + Per-Row Checkboxes, Sticky Selection Toolbar, "Don't Change" Bulk-Apply Modal with Dry-Run Preview)](#0103--m5-fleet-control-phase-8-bulk-fleet-ops-header--per-row-checkboxes-sticky-selection-toolbar-dont-change-bulk-apply-modal-with-dry-run-preview-2026-04-26)
- [0.10.2 — M5 Fleet Control Phase 7: Fleet Inspector + Region/Size/Replicas/Storage Columns + Per-Row Deployment / Start Buttons + Destructive-Confirm Modal](#0102--m5-fleet-control-phase-7-fleet-inspector--regionsizereplicasstorage-columns--per-row-deployment--start-buttons--destructive-confirm-modal-2026-04-26)
- [0.10.1 — M5 Fleet Control Phase 6: Spawn Wizard Step 4 Wired to `DeployConfig` + Review Placement Check Gates Deploy Button](#0101--m5-fleet-control-phase-6-spawn-wizard-step-4-wired-to-deployconfig--review-placement-check-gates-deploy-button-2026-04-26)
- [0.10.0 — M5 Fleet Control Phases 1–5: Backend Stack (Schema + 9-Field `DeployConfig` + Region Cache + Replica Loop + Lease-Aware Update + 7 New RPCs)](#0100--m5-fleet-control-phases-15-backend-stack-schema--9-field-deployconfig--region-cache--replica-loop--lease-aware-update--7-new-rpcs-2026-04-26)
- [0.9.5 — Hermes Adapter Re-Inspection: "CLI-Shaped" Framing Superseded; v0.11.0 Already Ships `AIAgent` + FastAPI Runtime; Sidecar Plan Filed](#095--hermes-adapter-re-inspection-cli-shaped-framing-superseded-v0110-already-ships-aiagent--fastapi-runtime-sidecar-plan-filed-2026-04-26)
- [0.9.4 — Spawn Wizard Review Touchups: Deterministic Deploy-Log Cleanup + `inert` on Future Steps](#094--spawn-wizard-review-touchups-deterministic-deploy-log-cleanup--inert-on-future-steps-2026-04-26)
- [0.9.3 — `/presentation` Route Skeleton: 5-Slide Deck for Hackathon Demo Video (Click-Advance, Reuses Nebula + TerminalContainer)](#093--presentation-route-skeleton-5-slide-deck-for-hackathon-demo-video-click-advance-reuses-nebula--terminalcontainer-2026-04-26)
- [0.9.2 — Spawn Page Redesign Phase 6: Cleanup + Docs Reconciliation (Modal + Shim Deleted, design-system.md §34 Reset)](#092--spawn-page-redesign-phase-6-cleanup--docs-reconciliation-modal--shim-deleted-design-systemmd-34-reset-2026-04-26)
- [0.9.1 — Spawn Page Redesign Phase 5: Wizard Fields Wired to `spawnAgent` + Streaming-Log Surface](#091--spawn-page-redesign-phase-5-wizard-fields-wired-to-spawnagent--streaming-log-surface-2026-04-26)
- [0.9.0 — Spawn Page Redesign Phases 1–4: `/agents` → `/spawn` Rename + `<NebulaAvatar>` + Roster Page + Wizard Shell](#090--spawn-page-redesign-phases-14-agents--spawn-rename--nebulaavatar--roster-page--wizard-shell-2026-04-26)
- [0.8.3 — Login Animation Cosmetic Pass: Seamless Settle + Density Bump + Pearlescent Silver Palette](#083--login-animation-cosmetic-pass-seamless-settle--density-bump--pearlescent-silver-palette-2026-04-26)
- [0.8.2 — Login Animation Phase 7: Three Live-Render Fixes (Stacking Context + Reduced-Motion Still + Particle Sizing)](#082--login-animation-phase-7-three-live-render-fixes-stacking-context--reduced-motion-still--particle-sizing-2026-04-26)
- [0.8.1 — Fleet UI Mods: Gallery View + List ↔ Gallery Toggle (localStorage-Persisted, Gallery-Default)](#081--fleet-ui-mods-gallery-view--list--gallery-toggle-localstorage-persisted-gallery-default-2026-04-26)
- [0.8.0 — Frontend Mods: Chrome Alignment + Avatar Dropdown + Logo Treatment + Destroyed-Filter](#080--frontend-mods-chrome-alignment--avatar-dropdown--logo-treatment--destroyed-filter-2026-04-26)
- [0.7.7 — `fly.toml`: `min_machines_running` 0 → 1 (Always-Warm Control Plane)](#077--flytoml-min_machines_running-0--1-always-warm-control-plane-2026-04-26)
- [0.7.6 — Env Var Rename: `FLY_API_TOKEN` → `FLY_SPAWN_TOKEN` (Stop `flyctl` Shadowing the Operator's Deploy Identity)](#076--env-var-rename-fly_api_token--fly_spawn_token-stop-flyctl-shadowing-the-operators-deploy-identity-2026-04-26)
- [0.7.5 — M4 Phase 8 Hardening: Transactional Spawn Writes + Handler-Level Sentinel Mapping Tests + v1.5 Deploy-Target-Credentials Breadcrumbs](#075--m4-phase-8-hardening-transactional-spawn-writes--handler-level-sentinel-mapping-tests--v15-deploy-target-credentials-breadcrumbs-2026-04-26)
- [0.7.4 — M3.9: Control-Plane Deploy (BE → Fly, FE → Vercel)](#074--m39-control-plane-deploy-be--fly-fe--vercel-2026-04-26)
- [0.7.3 — M4 Phase 7: Integration Smoke Pass (Local BE + Prod DB + Live Fly) + Fly Token Swap (PAT → Org-Scoped)](#073--m4-phase-7-integration-smoke-pass-local-be--prod-db--live-fly--fly-token-swap-pat--org-scoped-2026-04-26)
- [0.7.2 — UX Copy: `/agents` Nav + Page Heading Renamed to "Agents"](#072--ux-copy-agents-nav--page-heading-renamed-to-agents-2026-04-26)
- [0.7.1 — Frontend Mission-Control Implementation: Spec → Pixels](#071--frontend-mission-control-implementation-spec--pixels-2026-04-26)
- [0.7.0 — M4: Spawn Flow (Phases 1–6)](#070--m4-spawn-flow-phases-16-2026-04-26)
- [0.6.1 — Frontend Redesign Phase 5: Dark Mode Activation + Base UI Button Fixes](#061--frontend-redesign-phase-5-dark-mode-activation--base-ui-button-fixes-2026-04-26)
- [0.6.0 — Frontend Redesign Phases 1–4: Pearlescent Chrome × Halftone Substrate](#060--frontend-redesign-phases-14-pearlescent-chrome--halftone-substrate-2026-04-26)
- [0.5.2 — Dev Tooling: Procfile Rename + Overmind Port Pinning](#052--dev-tooling-procfile-rename--overmind-port-pinning-2026-04-26)
- [0.5.1 — M3.5: Deploy Target Resolver Indirection (Phases 1–4)](#051--m35-deploy-target-resolver-indirection-phases-14-2026-04-26)
- [0.5.0 — M3: Hermes Adapter Image + Fly Account Wiring (Phases 1–7) + Phase 8 Post-Review Hardening](#050--m3-hermes-adapter-image--fly-account-wiring-phases-17--phase-8-post-review-hardening-2026-04-25--2026-04-26)
- [0.4.0 — M2: Agent Catalog (`HarnessAdapter` + `AgentTemplate` + `/agents` page)](#040--m2-agent-catalog-harnessadapter--agenttemplate--agents-page-2026-04-25)
- [0.3.1 — M1 Hardening: Provider Memoization, Title Template, `middleware` → `proxy`](#031--m1-hardening-provider-memoization-title-template-middleware--proxy-2026-04-25)
- [0.3.0 — M1: Onboarding Wizard + Dashboard Shell](#030--m1-onboarding-wizard--dashboard-shell-2026-04-25)
- [0.2.6 — Auth Migration: HS256 Shared Secret → ES256 / JWKS](#026--auth-migration-hs256-shared-secret--es256--jwks-2026-04-25)
- [0.2.5 — Auth User Provisioning (Phases 1–4 + Post-Review Hardening)](#025--auth-user-provisioning-phases-14--post-review-hardening-2026-04-25)
- [0.2.4 — `DATABASE_URL` Canonicalized to Direct Connection](#024--database_url-canonicalized-to-direct-connection-2026-04-24)
- [0.2.3 — direnv for Shell-Level Env Loading](#023--direnv-for-shell-level-env-loading-2026-04-24)
- [0.2.2 — Env File Placement: Per-App](#022--env-file-placement-per-app-2026-04-24)
- [0.2.1 — Seeding Removed](#021--seeding-removed-2026-04-24)
- [0.2.0 — Frontend Scaffolding](#020--frontend-scaffolding-2026-04-24)
- [0.1.0 — Backend Scaffolding & Docs Reconciliation](#010--backend-scaffolding--docs-reconciliation-2026-04-24)

Latest on top. Each release includes detailed entries (**What / Where / Why** changes were made).

--

## 0.15.9 - Phase 9: File Store + Memory/Reminder/Transcript Persistence + Memory Summary in Prompts + Proactive Scheduler (Reminders, Ambient Clock) with Hold Policy (2026-10-29)

Roadmap Phase 9. Full notes: [`completions/phase-09-memory-persistence-proactivity.md`](completions/phase-09-memory-persistence-proactivity.md).

### Added

- **`internal/store`** (atomic JSON documents, JSONL logs), **`internal/memory`** (notes, reminders, transcript; `Summarise`), **`internal/proactive`** (scheduler: due reminders, ambient clock on the hour when idle).
- **Session**: `Proactive`/`Idle` sink with decider-driven hold (turn running or speech playing) and release; proactive cards, speech and transcript entries; memory summary in the runtime context; transcript persistence and today-only replay. `GET /api/memory`.
- `cmd/api` opens the store under `CORELLIA_DATA_DIR`, wires memory tools and the scheduler.

---

## 0.15.8 - Phase 8: Voice (STT/TTS Seams + OpenAI Audio Provider + Endpoints; Client VAD Capture, Browser Recognition Fallback, Speech Playback with Audio Level, Activation Keys, Barge-In, Mic Indicator) (2026-10-29)

Roadmap Phase 8. Full notes: [`completions/phase-08-voice.md`](completions/phase-08-voice.md).

### Added

- **Backend** `internal/voice` (`STT`/`TTS` interfaces, `None`, `OpenAI` audio provider, `Select`), endpoints `GET /api/voice/capabilities`, `POST /api/voice/stt`, `POST /api/voice/tts`; config `CORELLIA_STT`, `CORELLIA_TTS`, `CORELLIA_TTS_VOICE`, `CORELLIA_VOICE_MODE`.
- **Client** platform adapter (browser; shell stub), energy VAD, mic capture with utterance segmentation, browser `SpeechRecognition` fallback, speech player with server TTS (analyser → 3D audio level) and `speechSynthesis` backends, activation state machine (`Ctrl+Space` toggle / push-to-talk, `Ctrl+M` mute), `VoiceController` with barge-in on speech or typing, `MicIndicator`, `transcribe`/`synthesize` API calls. 13 new tests.

### Edited

- `App.tsx` mounts the voice controller and indicator; the agent shows `listening` while capturing. `.env.example` documents the voice variables.

---

## 0.15.7 - Phase 7: Cloud Runtimes (Anthropic Streaming + Tool Use, OpenAI-Compatible/DeepSeek, Hermes Sidecar, DeepSeek-Harness Stub) + Runtime Selector + Runtime Spike (2026-10-29)

Roadmap Phase 7. Full notes: [`completions/phase-07-cloud-runtimes-and-spike.md`](completions/phase-07-cloud-runtimes-and-spike.md).

### Added

- **`runtime/anthropic`**: Claude via the Anthropic Go SDK (beta Messages API): streaming text, manual tool loop over the registry, `show_ui` → spec ops, effort (`CORELLIA_EFFORT`, default low), server-side refusal fallbacks on by default, model `claude-opus-5-5` by default.
- **`runtime/openaicompat`**: streaming chat completions with function tools for any OpenAI-shaped endpoint (DeepSeek: `OPENAI_BASE_URL=https://api.deepseek.com/v1`).
- **`runtime/hermes`**: sidecar `/chat` adapter with session priming and fenced ```corellia-ui``` ops. **`runtime/deepseek`**: `NotImplemented` stub for the OpenWorld harness.
- **`runtime/prompt`** (shared system prompt) and **`runtime/toolexec`** (tool execution with proposal and op events). **`runtime/rtselect`** resolves `CORELLIA_RUNTIME` (`auto` by credentials). Config vars: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `CORELLIA_MODEL`, `CORELLIA_EFFORT`, `CORELLIA_HERMES_URL`, `CORELLIA_HERMES_TOKEN`.
- **`cmd/runtime-spike`** runs the VISION 7 script and writes a report; `docs/executing/spikes/local-2026-10-29.md` committed.
- Fixture-driven tests for all three wire formats; shared `rttest` doubles.

### Edited

- Session passes the catalog description and a screen summary to runtimes. `.env.example` documents the runtime variables.

---

## 0.15.6 - Phase 6: Decision Layer (Rules) + Propose/Confirm Gate + Tool Registry with Built-ins (Time, Geocode, Weather, Memory, Reminders, Directions, show_ui) + Confirm Cards and Phrases (2026-10-29)

Roadmap Phase 6. Full notes: [`completions/phase-06-decision-actions-tools.md`](completions/phase-06-decision-actions-tools.md).

### Added

- **`internal/tools`** registry (schema-validated calls, gated tools return proposals, `Execute` for the gate) and **`tools/builtin`**: `get_time`, `geocode`, `get_weather` (Open-Meteo), `remember`/`recall`/`forget`, `set_reminder`, `open_directions` (OSRM, straight-line fallback), `show_ui`; in-memory stores until Phase 9. Tool results may carry spec ops.
- **`internal/actions`** gate: propose, confirm (executes once), reject, expiry.
- **`internal/decision`**: `Decider` seam, `Rules` default (modality, speech sentences, auto text card, proactive hold), `Sentences`.
- **Session**: `Handle` with confirm/reject phrase detection, floating `Confirm` cards (`Enter`/`Esc`), confirm/reject/expire with status events, `tool` and `propose` action kinds with bound-arg resolution, decider-driven speech and reply cards, tool-result ops. Endpoints `POST /api/action/confirm` and `/reject`; `TurnResponse.handled`.
- **Client**: floating overlays rendered beside the root with hotkeys; confirm/reject API calls.

### Edited

- Local runtime uses the registry for time, reminders (parses `HH:MM`) and weather. `cmd/api` wires tools, gate and decider. `REDUCER.md` documents floating overlays.

---

## 0.15.5 - Phase 5: 3D Agent (R3F Nebula, State Machine, Audio Hook, Adaptive Resolution, Fallback, Stats Overlay) (2026-10-29)

Roadmap Phase 5. Full notes: [`completions/phase-05-3d-agent.md`](completions/phase-05-3d-agent.md).

### Added

- **`client/src/agent3d/`**: per-state palettes; `AgentStateMachine` easing shape, motion and colour between idle/listening/thinking/speaking/error with audio modulation while speaking; `AdaptiveResolution` (frame-time EMA → render scale with hysteresis and cooldown); `audioLevel` hook for the Phase 8 analyser; render stats; `Nebula` (lazy R3F scene, two additive point layers, 12 000 + 1 200 particles by default, uniforms from the machine every frame, DPR from the controller); `Agent3D` (WebGL2 + reduced-motion probe, SVG fallback, Suspense) and `StatsOverlay` (`?stats=1`); `?particles=N`.
- `uBrightness` uniform in the salvaged nebula fragment shaders.

### Edited

- `App.tsx` mounts the 3D agent in the Stage; the Stage's full-visual agent zone is larger.

---

## 0.15.4 - Phase 4: Component Library (15 Components) + Renderer (Bindings, Hotkeys, Decay, Placement) + Catalog Describe/Rank + Action and Screen Endpoints (2026-10-29)

Roadmap Phase 4. Full notes: [`completions/phase-04-component-library-and-renderer.md`](completions/phase-04-component-library-and-renderer.md).

### Added

- **Client components** for every catalog entry (layout: Stack, Grid, Split, Overlay; content: Card, Markdown, Stat, List, Table, Chart, Timeline, Image, Map; Confirm; Status), a safe Markdown subset parser, SVG chart geometry, MapLibre GL map over OSM raster tiles (lazy chunk, static fallback), and a registry whose test asserts parity with the catalog.
- **Renderer**: binding resolution with catalog defaults and per-node validation, slot mounting, depth cap, hotkey assignment (explicit keys kept, digits 1–9 assigned), `Stage` placement (glance / panel / full) around the agent, decay via `ttl_ms`, global keys (`Esc` cancel → escape action → clear; `Enter`; digits) that stay inert while typing.
- **Backend** `internal/catalog` (`Describe`, `Rank`, `Classify`), session `FireAction`/`ClearScreen`/`RemoveNode`, endpoints `POST /api/action`, `POST /api/screen/clear`, `POST /api/screen/remove`.
- `?gallery=1` component gallery. Store `touched` map and `applyLocal`.

### Edited

- `App.tsx` mounts the Stage; `CommandInput` reports its value; Vite chunk warning limit raised for the lazy MapLibre chunk.

---

## 0.15.3 - Phase 3: AgentRuntime Seam + Local Runtime + Session with SSE Event Stream + Client Session Store (2026-10-29)

Roadmap Phase 3. Full notes: [`completions/phase-03-session-events-local-runtime.md`](completions/phase-03-session-events-local-runtime.md).

### Added

- **`backend/internal/runtime`**: the `AgentRuntime` interface and event/tool types (the only seam to any model or harness). **`runtime/local`**: keyless scripted runtime (time with tool call, map of a city, table, chart, schedule, weather, reminder proposal, clear) emitting streamed text and valid spec ops.
- **`backend/internal/session`**: event bus (seq numbers, replay, fan-out, on-contract validation) and the session (transcript, spec, agent state, proposals, one active turn with cancel-on-new-input, validated op application, `speech` and `turn_done` events).
- **HTTP API**: `GET /api/session`, `POST /api/turn`, `POST /api/turn/cancel`, `GET /api/catalog`, `GET /api/events` (SSE with snapshot, replay via `Last-Event-ID`, heartbeats). `CORELLIA_RUNTIME` config var.
- **Client**: device-token auth helpers, turn API, session store with the shared reducer, `EventSource` stream with per-event contract validation, transcript pane, agent-state header, `Esc` cancel, `?debug=1` pane.

### Edited

- `cmd/api/main.go` wires contract, runtime, session and handlers. `httpsrv.Deps` gains `Session` and `Events`.

---

## 0.15.2 - Phase 2: Shared Contract (JSON Schemas + v1 Catalog + Go/TS Codegen + Validators + Reducers with Shared Fixtures) (2026-10-29)

Roadmap Phase 2. Full notes: [`completions/phase-02-shared-contract.md`](completions/phase-02-shared-contract.md).

### Added

- **`shared/schema/`**: `ui-spec`, `ops`, `events`, `api`, `catalog` JSON Schemas (draft 2020-12); `REDUCER.md` (normative reducer and validation semantics, error codes); `fixtures/` (reducer goldens, valid, invalid, reducer-errors, invalid-spec; 41 cases).
- **`shared/catalog/catalog.json`**: v1 catalog, 15 components (Stack, Grid, Split, Overlay, Card, Markdown, Stat, List, Table, Chart, Timeline, Image, Map, Confirm, Status) with props schemas, bindable props, slots, actions, fit hints, tags, examples.
- **Codegen**: `scripts/contracts-generate.sh` + `scripts/gen-ts-types.mjs` (`pnpm contracts:generate`); generated `backend/internal/contract/gen/*.go`, embedded copies `backend/internal/contract/embed/*.json`, `client/src/contract/gen/*.ts`; drift tests in both languages.
- **Backend** `internal/contract` (compiled validators, catalog, bound-prop rule, op decoding) and `internal/uispec` (binding paths, reducer, catalog-aware op and whole-spec validation).
- **Client** `src/contract/` (Ajv validators, paths, pure reducer, op and whole-spec checks) with the shared-fixture test.

### Edited

- `backend/go.mod` (+ santhosh-tekuri/jsonschema v6), `client/package.json` (+ ajv, ajv-formats, json-schema-to-typescript), root `package.json` (`contracts:generate`).

---

## 0.15.1 - Phase 1: Legacy Control Plane Removed + Go Backend Skeleton (Device Token, Static Client) + Vite Client Skeleton (2026-10-29)

Roadmap Phase 1. Full notes: [`completions/phase-01-restructure-and-skeletons.md`](completions/phase-01-restructure-and-skeletons.md).

### Removed

- The v1 control plane: `frontend/` (Next.js), all of `backend/internal/` (agents, adapters, Supabase auth, sqlc db, Fly deploy, generated Connect code, tools governance, orgs, users), migrations, queries, `shared/proto/`, Fly config, Dockerfile, smoke-deploy command, video capture script. `adapters/hermes/` stays. Go dependencies pruned to env, chi and godotenv.

### Added

- **Backend**: `internal/config` (new var set: `PORT`, `CORELLIA_DEVICE_TOKEN`, `CORELLIA_CLIENT_DIR`, `CORELLIA_DATA_DIR`, `CORELLIA_AGENT_NAME`, `CORELLIA_DEV_ORIGINS`; `Load` returns errors, `Validate`, `DevMode`), `internal/auth` (device-token middleware; dev mode = loopback only), `internal/httpsrv` (`/healthz`, `/api/config`, CORS for dev origins, static client with SPA fallback and immutable asset caching, 503 hint when not built), `cmd/api` (graceful shutdown, build info ldflags). 10 tests.
- **Client** (`client/`): Vite 7 + React 19 + TS 5.9 + Tailwind 4 + R3F/three (unused until Phase 5) + vitest/Testing Library + eslint flat config. Full-screen dark shell, always-focused `CommandInput` (Enter submits, Esc clears, refocus on blur and on any printable key), `/healthz` connection indicator, design tokens reduced from v1, salvaged shader sources under `src/agent3d/shaders/`. 8 tests.
- Root workspace: `package.json` scripts (`dev`, `build`, `test`, `type-check`, `lint`, `check`), `pnpm-workspace.yaml` with `allowBuilds` for esbuild (pnpm 12), new `pnpm-lock.yaml`, `Procfile` (Vite + air), `.gitignore`, `.env.example` rewritten.

### Edited

- `CLAUDE.md` rewritten for the new layout, rules and commands (interim until Phase 10). `README.md` and `docs/stack.md` carry a note that the described v1 code is removed. Roadmap progress table updated.

---

## 0.15.0 - Vision Roadmap: Ten-Phase Implementation Plan + Section 11 Defaults (2026-10-29)

**Docs-only.** First commit on `feat/vision-implementation`, the branch that carries the end-to-end implementation of [`VISION.md`](VISION.md). No code change.

### Added

- **`docs/executing/roadmap.md`**: the implementation plan. Ground truth about the repo and the dev environment (no credentials, no Postgres, no `buf`), a stated default for each of the eleven open questions in VISION.md section 11, the target repo layout, architecture rules for the new direction, and ten phases (restructure, shared contract, session + local runtime, component renderer, 3D agent, decision layer + actions + tools, cloud runtimes + spike, voice, memory + proactivity, display box + hardening + docs) each with scope, deliverables, dependencies and acceptance criteria.
- **`docs/completions/phase-00-roadmap.md`**: completion note for the roadmap step.

### Decisions recorded (defaults, each behind a seam)

JSON Schema + SSE/JSON HTTP replace protobuf/Connect; Vite static client replaces Next.js; device token + local file state replace Supabase + Postgres; `AgentRuntime` with `local`, `anthropic`, `openai-compatible` and `hermes` implementations and a `NotImplemented` DeepSeek-harness stub; decision layer in the backend with a rules default; own voice pipeline with a keyless browser path; VAD-gated mic toggled by key, off at boot; particle-nebula 3D agent with adaptive resolution; Chromium kiosk on the box.

---

## 0.14.1 - Vision: Default Client Approach (Web Client, Browser on macOS, Kiosk or Shell on the Box) (2026-10-29)

**Docs-only. Uncommitted in the working tree, pending Phil's review.** No code, build or dependency change.

Records Phil's decision on how the display client is built and run: one web-tech client, run in a browser on macOS during development and in a Chromium kiosk or a native Linux app shell on the display box.

### Edited

- **`docs/VISION.md`**
  - New **4.1 Client approach**: one TypeScript client (WebGL2, Three.js-class 3D, GL ES 3.0-compatible shaders) reusing the TS frontend stack where sensible; normal browser on macOS, no Mac build; Chromium kiosk or Tauri/Electron shell on the box (open, same code); thin platform adapter for mic/speaker, kiosk/watchdog and echo cancellation; adaptive render resolution; fully native (Rust + wgpu) considered and not chosen.
  - **3 Experience**: any modern monitor (1080p to 4K), no fixed target display.
  - **4 Architecture sketch**: diagram and display-client description point to 4.1.
  - **8 Display box**: hardware advice (x86_64 Intel N150-class mini PC, GL ES 3.0 / WebGL2 path keeps Pi 5 / RK3588 open); display is kiosk or shell; adaptive resolution in 3D rendering; echo cancellation behind the adapter.
  - **9 Existing code and defaults**: frontend row reflects reuse for the display client.
  - **11 Open questions**: Q7 notes adaptive resolution; Q8 replaced (was VM vs small computer) with "which shell on the box"; native vs web is settled.
- **`docs/changelog.md`**: this entry and its index line.

---

## 0.14.0 — Direction Reset: Personal Agent Workspace Vision + Docs Archive Cleanup (2026-10-28)

**Docs-only. All changes are uncommitted in the working tree, pending Phil's review.** No backend, frontend, proto, migration, adapter or dependency change; nothing built or run. Corellia changes direction from a vendor-neutral agent control plane to a personal agent workspace (always-on office screen, 3D agent, voice + keyboard, generated UI). The legacy control-plane code is untouched and still in the tree.

Convention note: this repo's changelog is `docs/changelog.md` (index at top, dated sections, latest first), so this entry lives here and no root `CHANGELOG.md` was created.

### Added

- **`docs/VISION.md`** — new product vision: what Corellia is now, principles, experience, architecture sketch, dynamic UI approach (component catalog, typed tree/slot layout, shared Go/TS schema, bindings and actions, incremental spec streaming, propose/confirm, validation), decision layer, the agent-runtime **open decision** (Hermes vs the OpenWorld DeepSeek harness, tradeoffs and unknowns, evaluation plan), display box, existing-code defaults, non-goals, open questions, relationship to the old direction.
- **`docs/README.md`** — index of current vs archived docs.
- **`docs/archive/README.md`** — banner stating the archive is historical and superseded by `VISION.md`, contents table, and an old-path to new-path map.

### Moved (`git mv`, history preserved, contents unchanged)

Old control-plane material to `docs/archive/`, keeping the same relative sub-structure so relative paths between archived files still resolve:

- `docs/vision.md` -> `docs/archive/vision.md`
- `docs/blueprint.md` -> `docs/archive/blueprint.md`
- `docs/blueprints/deployment-architecture.md`, `docs/blueprints/adapter-image-blueprint.md` -> `docs/archive/blueprints/`
- `docs/plans/*` (5 files) -> `docs/archive/plans/`
- `docs/completions/*` (14 files) -> `docs/archive/completions/`
- `docs/executing/*` (2 files) -> `docs/archive/executing/`
- `docs/refs/{fly-commands,governable-agent-surfaces,hermes-tool-name-audit,infra-outline,multiagent-deployment-frameworks,presentation-beat-sheet}.md` -> `docs/archive/refs/`

### Edited

- **`README.md`** — tagline and nav links updated, direction-change note added above "What it does" (body left as the description of the legacy v1), repo-layout `docs/` line, link to the blueprint rules repointed to `docs/archive/blueprint.md`.
- **`CLAUDE.md`** — direction-change note at top pointing to `docs/VISION.md` and the archive; doc-hierarchy paths and the architecture-rules citation repointed; `docs/` line in the layout block. Control-plane guidance otherwise left as is (it still describes the existing code accurately).
- **`.claude/commands/get_started.md`** — reading list now starts at `docs/VISION.md`.
- **`docs/stack.md`** — status banner (picks are defaults under the new direction), companion-docs list repointed; references to scaffolding recipes that are no longer in the tree replaced with a note.
- **`docs/blueprints/codegen-cheatsheet.md`** — blueprint refs repointed to `docs/archive/blueprint.md`; dead scaffold-completion ref dropped.
- **`docs/blueprints/login-swarm-animation.md`** — dead references to `login-animation*.md` completion/plan docs (not in the tree; in git history) replaced with a note.
- **`docs/refs/design-system.md`** — status banner (reference for the v1 frontend, not a mandate) and one `vision.md` reference repointed.
- **`docs/changelog.md`** — this entry and its index line.

### Removed

- Nothing deleted. Dead references dropped (see Edited): `frontend-scaffolding.md`, `archive/backend-scaffolding.md` (stack.md), `completions/frontend-scaffold-completion.md` (codegen-cheatsheet), `completions/login-animation*.md` and `executing/login-animation-implementation.md` (login-swarm-animation). None of these exist in the tree; all are in git history.

### Known follow-ups (not done, out of scope)

- Code comments, migrations, Dockerfiles and adapter READMEs still cite old doc paths (for example `docs/blueprint.md`, `docs/executing/...`). Use the path map in `docs/archive/README.md`. Not edited, since this change touches docs only.
- `.claude/commands/code_assessor.md` still tells the assessor to write into `docs/plans`.
- The legacy control-plane code (fleet, spawn, Fly deploy, tools governance, Supabase auth) is not removed.

---

## 0.13.12 — Presentation Deck Restructure (4 Problem Slides + Tangle/Thesis Redesign) + Tools Inventory Grid + Carousel Icon Buttons + Layout Overflow Fixes (2026-04-27)

Four related passes touching the presentation deck, the spawn tools step, the harness carousel, and a pair of layout overflow bugs. No backend, proto, migration, or sqlc changes. `pnpm -C frontend type-check` and `pnpm -C frontend lint` clean.

### Part 1 — Presentation deck restructure

The old slide 2 ("Five planes. None unify." + TangleWeb backdrop) and the removed `SlideGuardian` and `SlideAdaptive` are replaced by five new slides that tell a tighter "four-problem" story, and the thesis slide is rebuilt as a three-column "Technical Implementation" card.

**`components/presentation/deck.tsx`** — `SlideId` union and `SLIDES` array rebuilt. `SlideTangle` / `SlideGuardian` / `SlideAdaptive` removed; four new slide IDs added in order: `harness` (9 s) → `tools` (9 s) → `deploy` (9 s) → `oversight` (9 s). The `collapsing` tangle-transition prop and the `isCollapsing` derivation block are removed — the collapse animation was only meaningful when tangle was followed immediately by garage, which is no longer the case. `renderSlide` simplified accordingly (no `options` argument).

**`components/presentation/slides/slide-1-hook.tsx`** — added a headline block above the two-panel comparison: `"Manageable at one. / Chaos at 250."` in large display type, with `[ THE DEPLOYMENT PROBLEM ]` kicker. Previously the kicker floated alone with no supporting headline.

**`components/presentation/slides/slide-2-tangle.tsx`** — "Five planes. None unify." headline replaced by a four-card problem overview ("Find. Deploy. Equip. Govern. / Four problems. No unified tooling.") using a `PROBLEMS` data array and a `ProblemCard` component with staggered `tangle-in` animation. TangleWeb stays as the `-z-10` backdrop. `@keyframes tangle-in` and `prefers-reduced-motion` override injected via `<style>`. The `collapsing` prop is retained on the component signature (it is still forwarded from callers that may pass it) but has no observable effect on the new layout.

**`components/presentation/slides/slide-2a-harness.tsx`** — new. "PROBLEM 1 OF 4 — Hundreds of harnesses. No clear standard." Twelve harness nodes (LangGraph, CrewAI, AutoGen, Hermes, Swarm, Agno, SuperAGI, AutoGPT, SmolAgents, MetaGPT, Haystack, Dify) arranged on a fixed SVG viewport. Five `CONNECTED` nodes draw animated dashed lines to a central `[ ADMIN ] ?` block. Nodes fade in with staggered `setTimeout` (100 ms base, 75 ms per node). `prefers-reduced-motion` disables `harn-flow` animation via injected `<style>`.

**`components/presentation/slides/slide-2b-deploy.tsx`** — new. "PROBLEM 3 OF 4 — Pick an infra. Then try to leave." Seven deployment targets (Bare Metal, AWS, Mac mini, GCP, Hetzner, Azure, Fly.io) on a spoke layout, each with two descriptive properties. Lines to center fade in per-target. Same `setTimeout`-stagger pattern as 2a.

**`components/presentation/slides/slide-2c-tools.tsx`** — new. "PROBLEM 2 OF 4 — Skills. MCPs. Permissions. Scattered everywhere." Bidirectional flow diagram: four skill-source nodes on the left (GitHub, X/Twitter, npm, HuggingFace) and five access-gate nodes on the right (Google Drive, Dropbox, Notion, Gmail, Slack), animated in two phases — sources at 200 ms, gates at 900 ms. Opposing animated `stroke-dashoffset` directions (`tools-flow-l` / `tools-flow-r`) visualize left-to-center and center-to-right flows. Column labels (`skill sources` / `access gates`) in the bottom corners.

**`components/presentation/slides/slide-2d-oversight.tsx`** — new. "PROBLEM 4 OF 4 — Who has what? Nobody knows." Five-row fleet table with columns AGENT / OWNER / TOOLS / ACCESS / LAST AUDIT. Every TOOLS and ACCESS cell is `???`; AUDIT values range from `"never"` to `"8 months ago"` to `"unknown"`. Rows fade in sequentially (250 ms base, 200 ms per row). A closing row `"+ 245 more agents · all unknown"` fades in after the last row.

**`components/presentation/slides/slide-6-thesis.tsx`** — redesigned from "Governance-as-a-Service" three-tier stacked architecture diagram (Control Plane → API Engine → Agent Infrastructure with arrow connectors) to "Technical Implementation" three-column layout. `COLUMNS` data array: Tech Stack (catalog accent) / Today (deploy accent) / Tomorrow (adapter accent), each with sub-groups (BACKEND / FRONTEND / DATA & AUTH; HARNESS / DEPLOYMENT / GOVERNANCE). `TierBox` and `ArrowConnector` replaced by `ColumnCard` with `group → items` badge layout. Footer copy: "one proto IDL · buf generate → Go + TS · single source of truth" → "open · extensible · production-ready". Stagger delay reduced from 920 ms to 760 ms to match the shorter column count.

**`components/presentation/scenes/opus-pipeline.tsx`** — collapsed split `animation` + `animationDelay` style props into a single `animation` shorthand with delay baked in (e.g. `"opus-crystallize 600ms ease-out 150ms forwards"`). Functionally identical; eliminates the browser's need to reconcile two style properties per crystal.

**`components/presentation/scenes/policy-checkpoint.tsx`** — removed `animationDelay: active ? "0ms" : undefined` from the capsule style. The `0ms` delay is the browser default — setting it explicitly produced no change but added noise to the style object.

**`components/presentation/audio/audio-bed.tsx`** — removed the `key` prop from the `SlideCue` component signature. The `key` prop on a component is a React reconciliation hint, not a regular prop — it never reaches the component's props object. The caller was passing it to force audio remount, but the value was silently discarded. Removed to close the misleading API surface; callers that need remount behaviour must use `key` on the JSX element, not as a prop.

### Part 2 — Tools step inventory grid

The tools step previously rendered toolsets as a vertical `space-y-3` list of wide row cards. Replaced with a compact 2-column inventory grid of square tiles, matching the visual language of RPG item grids.

**`components/spawn/steps/tools-step.tsx`**:

- **Loading skeleton** — 3-item stack replaced by 6-item `grid grid-cols-2 gap-2` of `h-24` skeleton tiles.
- **Toolset grid** — `space-y-3` list replaced by `grid grid-cols-2 items-start gap-2`. Header copy "EQUIP TOOLSETS" → "INVENTORY". Footer counts shortened ("no toolsets equipped" → "nothing equipped", "1 toolset equipped" → "1 equipped", etc.).
- **`ToolsetCard` — active cards** redesigned as centered icon tiles: a `size-9` icon box (equipped: tinted, unequipped: muted), 2-line clamped `font-display` name below, a `size-1.5` dot + "equipped" / "equip" label. The old `<Button size="xs">[ ✓ EQUIPPED ]</Button>` toggle is gone; the entire tile is now a `<button>` that toggles on click. Equipped border: `border-[hsl(var(--feature-tools))]/60`; unequipped: `border-border/40`.
- **`ToolsetCard` — OAuth-locked cards** simplified to small icon-only tiles at 40% opacity with a `LockIcon` below the icon. Previously these rendered a full-width row with an explanatory paragraph.
- **`renderToolIcon(tool, className)`** — new function mapping `toolsetKey` / `displayName` / `category` to Lucide icons: `browser` → `GlobeIcon`, `clarify` → `MessageSquareIcon`, `code` → `CodeIcon`, `cron` → `Clock3Icon`, `delegat` → `NetworkIcon`, `file` → `FolderIcon`, `shell` → `TerminalIcon`, compute category → `CodeIcon`, info category → `ShieldIcon`, default → `ShieldIcon`.
- **Scope drawer** — padding tightened to `p-2.5`, `space-y-4` → `space-y-2`. Error text scaled to `font-mono text-[9px]`.
- **`CredentialField`** — input height `h-7`, text `text-[10px]`; eye-toggle buttons shrunk from `size-4` to `size-3`; label shrunk from `text-[11px]` to `text-[9px]`; env var display simplified from `[ CREDENTIAL · ENV / VAR ]` to just `ENV_VAR`. Removed the two explanatory paragraphs ("Forwarded once to the agent's secret store" and the now-resolved "STASH WIRING IN PILLAR B PHASE 4.5" warning — credential reattachment shipped in 0.13.10).
- **`ScopeFields`** — outer `space-y-4` → `space-y-2`; "no operator-configurable scope" label shrunk to `text-[9px]` and copy simplified to "no scope required"; unknown-key fallback shrunk to `text-[9px]` / "not yet wired".
- **Dead comments removed** — multi-paragraph JSDoc blocks and inline phase-deviation notes (Phase 4 deviations, plan §3 references) are gone; the deviation they documented is fully resolved as of 0.13.10.

### Part 3 — Carousel icon buttons

**`components/spawn/harness-carousel.tsx`** — previous navigation was plain `‹` / `›` text characters in unstyled `<button>` elements. Replaced with `<Button variant="outline" size="icon-lg">` from the design system, each containing a `ChevronLeftIcon` / `ChevronRightIcon` (Lucide, `size-5`). Buttons are styled with feature-catalog accent: `border-[hsl(var(--feature-catalog))]/40 bg-black/30 text-[hsl(var(--feature-catalog))] hover:bg-[hsl(var(--feature-catalog))]/10`. Disabled state falls back to plain border/muted. Scroll container moved into the center column of a `grid grid-cols-[auto_minmax(0,1fr)_auto]` three-column layout so the buttons sit flush against the card edges at any viewport width. The counter (`n / total`) moved above the grid row, centered. `min-w-0` added to the scroll container to prevent grid blowout.

**`components/spawn/harness-slide.tsx`** — avatar slot changed from fixed responsive heights (`h-48 sm:h-56 md:h-64`) to a responsive aspect-ratio box (`aspect-[5/6] min-h-[15rem] max-h-[42vh]`, `lg:aspect-[4/5] lg:min-h-[17rem] lg:max-h-[48vh]`, `xl:min-w-[18rem]`) so the portrait scales naturally with the card's column width in the new carousel grid. Active slides now render `<NebulaAvatar>` regardless of locked state (previously locked slides forced `AvatarFallback` even when active — the lock overlay already communicates unavailability visually). Spec rows: "VENDOR" → "FROM" (locked), "VENDOR" removed and "FROM · {vendor}" added (unlocked), "DEPLOY · fly.io" row removed from unlocked (deploy target is set in the wizard's DEPLOYMENT step, not pinned to the harness card).

### Part 4 — Harness vendor surface in wizard copy

**`components/spawn/wizard.tsx`**:

- `GalleryWizardShell` and the post-selection `<Wizard>` wrapper both gain a `mx-auto min-w-0 w-full max-w-[96rem]` / `max-w-[112rem] 2xl:max-w-[128rem]` constraint so the layout is centered on very wide displays rather than stretching edge-to-edge.
- `HarnessStep` confirmed-pane subtitle: `"adapter · hand-written · deploy · fly.io"` → `"from · {harness.vendor} · adapter · hand-written"`. Spec row list: `DEPLOY · fly.io` removed, `FROM · {vendor}` added before ADAPTER.
- `rpgStepSummaryRows` for the HARNESS step: `{ label: "deploy", value: "fly.io" }` → `{ label: "from", value: harness?.vendor ?? "—" }`.
- `FactionPicker` radio group: `sm:grid-cols-3` dropped to `lg:grid-cols-1` to avoid the three provider buttons collapsing to unreadable widths inside the narrower RPG right panel. Button layout gets `min-w-0`; label row uses `items-start` and `gap-2`; tagline constrained to `max-w-[20ch]`; glyph gets `shrink-0`.
- `isWideLoadoutStep` variable (`state.current === "tools" || state.current === "deployment"`) gates a narrower `RpgBody` grid on those steps: `lg:grid-cols-[160px_1fr_280px] xl:grid-cols-[180px_1fr_320px]` instead of the standard `[220px_1fr_300px]`, giving the two-column inventory and the deployment form more center space.

### Part 5 — Layout overflow fixes

**`frontend/src/app/(app)/layout.tsx`** — `min-w-0` added to the `grid-bg flex-1 p-6` content div. Without it, a wide child (e.g. the spawn wizard at `max-w-[128rem]`) could force the flex container past the sidebar inset's intended width on certain viewport sizes.

**`components/ui/sidebar.tsx`** — `min-w-0` added to `SidebarInset`. Same root cause: the `flex w-full flex-1` container did not collapse below its content's natural width, allowing overflowing children to push the layout horizontally.

**`components/spawn/scope-inputs/pattern-list-input.tsx`** — `rows={4}` → `rows={3}`; textarea and hint text scaled from `text-xs` to `text-[11px] leading-5` to match the tightened scope drawer density.

**`components/spawn/scope-inputs/working-directory.tsx`** — input gets `h-8 text-xs`; hint paragraph scaled from `text-xs` to `text-[11px] leading-5`.

--

## 0.13.11 — Spawn RPG Redesign: Per-Card Nebulas + Gallery Cleanup + Three-Column Character Layout (2026-04-27)

Two complementary visual passes on the spawn flow. The first fixes a structural oddity in the carousel: the nebula was a single canvas overlay floating outside every slide's DOM, with a static SVG permanently underneath — producing a layered "animated-sticker-on-a-poster" look instead of each card owning its own living portrait. The second redesigns the post-selection wizard into an RPG character screen: large nebula centered as the agent portrait, confirmed steps scrolling left, active configuration form on the right.

`pnpm -C frontend type-check` and `pnpm -C frontend lint` clean; no backend, proto, or migration changes.

### Part 1 — Per-card nebulas in the carousel

**Root cause.** The carousel mounted one `<NebulaAvatar>` canvas absolutely above the scroll container and measured its position via a `useLayoutEffect` probe on the first slide. Every slide rendered `<AvatarFallback>` (static SVG) at all times. The animated canvas sat on top of whichever slide was centred, blending onto its static SVG twin — visually an overlay, not an integrated portrait.

**`components/spawn/avatar-fallback.tsx`** — added `fill?: boolean` prop. When set, the SVG renders at `width="100%" height="100%"` instead of the fixed `size` square, so it fills whatever container the parent provides. `size` is now optional (callers that still pass it work unchanged).

**`components/spawn/nebula-avatar.tsx`** — added `fill?: boolean` prop that swaps the container's inline `width/height` style for `w-full h-full` Tailwind classes. Fixed the loading-state branch: previously rendered `null` while the `IntersectionObserver` hadn't fired yet (causing a one-frame blank flash on slide transition); now renders `<AvatarFallback>` during that window so the static-to-animated transition is seamless. `AvatarFallback` receives `fill` forwarded through so both layers are consistently sized.

**`components/spawn/harness-slide.tsx`** — each slide now owns its avatar outright. Avatar slot changed from content-sized (`padding + 240px AvatarFallback`) to a responsive fixed height (`h-48 sm:h-56 md:h-64`). Inside the slot: active + unlocked slides render `<NebulaAvatar fill harness={harness.key} />`, all other slides render `<AvatarFallback fill harness={harness.key} />`. Locked overlay is unchanged. Removed the `avatarSlotRef` prop (was the carousel's layout probe; no longer needed). Removed the `Ref` import. Added `NebulaAvatar` import; kept `AvatarFallback` for inactive/locked branches.

**`components/spawn/harness-carousel.tsx`** — stripped the overlay machinery entirely: removed the `overlayTopPx` state, `probeSlotRef` and `wrapperRef` refs, the `useLayoutEffect` that measured the slot offset, the `<NebulaAvatar>` overlay div, and the `useLayoutEffect` import. Removed `NebulaAvatar` and `HarnessKey` imports (no longer needed here). Removed `avatarSlotRef` from the first slide. The scroll container is now a direct child of the section instead of being nested inside a `relative` wrapper div. Since scroll-snap shows exactly one slide at a time, only one canvas is ever mounted in the carousel at once — same effective one-active-canvas constraint as the old overlay, but with each card being self-contained.

Updated the carousel comment block to document the new per-slide ownership model (decision 21 annotation revised: "scroll-snap ensures only one slide is visible at a time, so only one canvas is ever mounted in the carousel at once").

### Part 2 — Wizard RPG character layout

**`components/spawn/wizard.tsx`** — all changes are presentational; reducer logic, form validation, RPC calls, deploy flow, and step data are unchanged.

**`GalleryWizardShell` simplified.** Removed the five `pointer-events-none opacity-40 inert` step shells (IDENTITY / MODEL / TOOLS / DEPLOYMENT / REVIEW) that previously sat below the carousel. The gallery is now just a header + `<HarnessCarousel>`. Clicking `› SELECT` navigates to `/spawn/[templateId]` as before.

**`StepShell` deleted.** The old confirmed-wizard render iterated `STEPS.map(StepShell)` to produce a vertical accordion. `StepShell` is gone; the RPG layout replaces the entire stack.

**`RpgHeader` (new).** Centered title block rendered above the three-column body. Shows `[ HARNESS NAME ]` as a muted kicker, the agent callsign in large display type (or `[ DESIGNATION PENDING ]` dimmed before the identity step is confirmed), and `STEP N // LABEL` beneath. Live-updates as the operator types their callsign.

**`RpgBody` (new).** Three-column grid layout (`lg:grid-cols-[220px_1fr_300px]`). DOM order is RIGHT → CENTER → LEFT so that on mobile (block stacking) the active form appears first and the history panel appears below. On desktop, explicit `lg:col-start-*` overrides DOM order: left column gets confirmed history, center gets the large nebula, right gets the active step form. A compact 176px nebula (`h-44 w-44`) renders above the form on mobile via `lg:hidden`; the full portrait is `hidden lg:flex` (IO never fires on a `display:none` element, so at most one canvas mounts at any time).

**`RpgLeftPanel` + `RpgConfirmedEntry` + `rpgStepSummaryRows` (new).** Left column renders confirmed steps in order, each as a compact entry: step label in its accent colour, key/value rows from `rpgStepSummaryRows`, and a small `[edit]` button (except harness — locked to the URL — and the review step). `rpgStepSummaryRows` maps each step to a short summary:
- HARNESS → `harness · hermes`, `deploy · fly.io`
- IDENTITY → `callsign · <name>`
- MODEL → `faction · Anthropic`, `class · <model>`, `sigil · ••••••••<tail>`
- TOOLS → `toolsets · N equipped`
- DEPLOYMENT → `region`, `size`, `replicas`

On REVIEW, the left panel narrows to HARNESS + IDENTITY + MODEL only (the "who you are" columns from the reference layout); tools and deployment move to the right panel.

**`RpgRightPanel` (new).** Dispatches by `state.current`. For IDENTITY through DEPLOYMENT: wraps the existing `StepBody` call in a `TerminalContainer` (`STEP N // LABEL`, accent, `ACTIVE` meta). For REVIEW: renders `ReviewRightContent` instead.

**`ReviewRightContent` (new).** Owns the placement-check `useEffect` (moved from the now-unused `ReviewStep`). Renders a `TerminalContainer` titled `LOADOUT` containing a `ConfirmedSummary` of all tools + deployment rows, then `<ReadyToLaunch>` with the placement result and deploy button. The `CharacterSheet` component (which embedded its own 180px nebula) is no longer called from the wizard flow — the center portrait replaces it entirely.

**`IdentityForm` simplified.** Removed the `flex flex-col gap-5 sm:flex-row` container that held a 64px `<NebulaAvatar>` thumbnail beside the callsign input. The form is now a plain `space-y-2` stack: label → input → operator-label row → error. Removed `harness` from the function signature and its call site in `IdentityStep` (was only used to render the now-removed thumbnail). Added `HarnessKey` import for the `RpgBody` nebula typing.

**`STEP_ACCENT_CSS` constant (new).** Maps each `StepKey` to its CSS variable string (`hsl(var(--feature-catalog))` etc.) for use in `RpgConfirmedEntry` step labels without duplicating the `TerminalContainer` accent map.

## 0.13.10 — v1.5 Pillar B Post-Review Hardening: Credential Reattachment + Adapter Revocation Policy + Frozenset Audit + 16 Misc Fixes Across BE / FE / Adapter (2026-04-27)

Comprehensive remediation pass after the four-track senior review of the just-shipped v1.5 Pillar B (Phases 1–7). The review's per-layer scores were BE 9.0 / FE 9.2 / Adapter 8.0 / Cross-cutting 7.5; the cross-cutting reviewer flagged one BLOCKER (FE drops the credential value on submit and the BE has no reattachment from prior grants — silently strips credentials on every inspector save and breaks the `web` toolset entirely from the wizard) plus three HIGH adapter concerns (frozenset-vs-Hermes-vocabulary drift, infinite last-known-good on 401, untested register() single-flight). This entry rolls all 19 findings (1 BLOCKER, 3 HIGH, 13 MEDIUM, 2 LOW/NIT) into one release alongside ~50 LOC of new test coverage and the missing operator runbook entry.

`cd backend && go vet ./... && go test ./... && go build ./...` all green; `pnpm -C frontend type-check && lint && build` green; `pytest adapters/hermes/plugin/corellia_guard/tests/` is **73 / 73 passing** (49 → 73 — 24 new cases). No proto, sqlc, or migration schema change. One migration file edited (DOWN-direction comment + revert digest correction; no goose-up needed in prod).

### BLOCKER: BE credential reattachment (cross-cutting review §12)

The Phase 7 completion-note (§5 deviation 3) claimed "the BE re-runs the existing tx; the credential storage refs are reattached server-side from the prior active grants when the tool id matches." That claim was **never implemented in code** — `RevokeAllActiveToolGrants` deleted the prior rows and `InsertInstanceToolGrant` wrote whatever the FE sent (which the FE deliberately leaves empty, per Phase 4 deviation 1's "STASH WIRING IN PILLAR B PHASE 4.5" notice that 4.5 never delivered). Effect: every inspector save on a credential-bearing toolset (`web` / `image_gen` / `tts` / `homeassistant`) silently nulled `credential_storage_ref`; every wizard spawn of those toolsets failed with `ErrCredentialMissing` after Fly app creation, triggering the rollback-destroy and surfacing a generic "internal error" toast.

- **`backend/internal/tools/service.go`** — `SetInstanceGrants` reworked. Before opening the tx, calls `ListInstanceToolGrants(instanceID)` to build a `prior map[uuid.UUID]string` keyed by `tool_id` → `credential_storage_ref` (only entries with non-nil/non-empty refs). The pre-tx validation loop now resolves each grant's effective credential via `g.CredentialStorageRef ?? prior[g.ToolID]` and stores the resolved value in a parallel `resolved []string` slice. Inside the tx, inserts use `resolved[i]` instead of `g.CredentialStorageRef`, so the BE-managed ref carries forward across edits. The `ErrCredentialMissing` gate now fires only when both incoming AND prior are empty (genuine "this is a brand-new credential-bearing toolset and you haven't supplied one" — covered by inspector preflight below). Operator's mental model: "I'm still equipping the same toolset, just with new scope" — the credential is preserved.
- **`backend/internal/tools/service_test.go`** — fakeToolQueries widened: `toolByID map[uuid.UUID]db.Tool` for tests that exercise multiple tools in one call (the new reattachment path); `auditErr` injectable failure for the rollback-doesn't-revert pin (LOW finding §9 from BE review). Three new tests:
  - `TestSetInstanceGrants_ReattachesCredentialFromPriorGrant` — prior grant has `fly:<instance>:EXA_API_KEY`; FE sends empty; BE writes `fly:<instance>:EXA_API_KEY`. Locks the contract.
  - `TestSetInstanceGrants_ExplicitCredentialOverridesPrior` — explicit non-empty FE ref takes precedence over prior. Future-proofs the v1.6 in-flight credential rotation flow.
  - `TestSetInstanceGrants_NoPriorAndNoCredentialErrors` — brand-new credential-bearing toolset with neither prior nor incoming → `ErrCredentialMissing` still fires. The reattachment doesn't weaken the gate.
  - `TestSetInstanceGrants_AuditFailureDoesNotRollback` — `auditErr` set; service returns success; revoke + insert + version-bump still committed. Pins the documented "audit is logging-only" contract.

### Adapter HIGH: frozenset audit + tool-name routing fixes (Adapter review §5, §6)

- **`docs/refs/hermes-tool-name-audit.md`** — new audit log. Documents the canonical Hermes 0.x tool-name surface at the pinned digest (`sha256:d4ee57f254aabbe10e41c49533bbf3eb98e6b026463c42843a07588e45ddd338`), including which tool routes to which `corellia_guard` frozenset and why (e.g. `web_search` is intentionally pass-through because its `query` arg is not an operator-controlled URL). v1.6 forward pointer: pre-commit hook or pytest fixture that diffs the audit table against `hermes_cli/tools/*` at the live pin and fails on drift.
- **`adapters/hermes/plugin/corellia_guard/hook.py`** — three routing changes plus a defense-in-depth fail-closed safeguard:
  - **`web_search` removed from `_WEB_TOOLS`.** Its `query` argument is a search string (e.g. `"weather today"`) that the previous URL-routing matched against the operator's `*.acme.com` allowlist — every benign search failed. The toolset gate at `platform_toolsets.cli` is the safety net; if `web_search` shouldn't run at all, the operator disables `web` entirely. Pinned by `test_web_search_passes_through_plugin`.
  - **`browser_navigate` moved to its own `_BROWSER_TOOLS` frozenset** routing through `scope.for_toolset("browser")` instead of `scope.for_toolset("web")`. The `browser` catalog row has its own `url_allowlist` independent of `web`'s; routing through `web` enforced the wrong scope. Pinned by `test_browser_navigate_uses_browser_scope` (verifies a URL admitted by `web` is still blocked under `browser`).
  - **`_SHELL_SHAPED_RE` defense-in-depth.** Tool names that miss every explicit frozenset but match a shell-shape regex (`bash_exec`, `shell.run`, `invoke_command`, …) are forced through the terminal command-allowlist enforcement with a `WARNING` log. This catches the most dangerous fail-open class — Hermes renames `shell_exec` → `bash_exec` between digest pins, the explicit set misses it, the call would otherwise pass-through. Pinned by `test_shell_shaped_unknown_name_routes_to_terminal`.
  - Argument extraction: dropped `query` from the URL fallback chain in `_enforce_web` so the change above takes effect even if someone re-adds `web_search` to `_WEB_TOOLS`.

### Adapter HIGH: 401-revocation policy (Adapter review §4, §9)

The Phase 5 `_poll_loop` previously logged 401 and retried indefinitely, preserving last-known-good. That's correct posture for transient TLS / DNS blips, but a deliberate token revocation (operator killed the instance's grants) never propagated — the agent kept enforcing stale scope forever.

- **`adapters/hermes/plugin/corellia_guard/__init__.py`** — `_poll_loop` rewritten with a per-status decision tree. New constant `_AUTH_DENY_AFTER_CONSECUTIVE_401 = 3`: after three consecutive 401 responses, the daemon calls `cache.force_deny_all()` and continues polling at backoff cadence (so a re-grant restores enforcement). Threshold rationale: at backoff cap (60s) this is ~3 minutes before deny-all kicks in, slow enough to absorb a single transient blip but fast enough to satisfy "operator clicked revoke and expects it to take effect within minutes." A 403 (instance not found / explicitly revoked at the BE) flips to deny-all immediately on the first response. Successful polls clear the deny-all sticky flag via `cache.clear_force_deny()`, restoring normal behaviour without requiring a process restart. The 304-as-HTTPError quirk of urllib's default opener is handled inline so the revocation policy only runs on real errors.
- **`adapters/hermes/plugin/corellia_guard/__init__.py`** — `If-None-Match` header re-quotes bare-token ETags defensively. RFC 7232 requires quoted ETag values; the BE always emits them quoted, but if any intermediary ever strips quotes the plugin now re-applies them rather than send a non-compliant header.
- **`adapters/hermes/plugin/corellia_guard/hook.py`** — `ScopeCache` gains `_force_deny: bool` flag + `force_deny_all()` / `clear_force_deny()` methods. `get()` short-circuits to `Scope.deny_all()` when the flag is set, BEFORE the on-disk mtime check — so the override survives across reload cycles where the disk file is still permissive. The flag is sticky until explicitly cleared, preventing the "401 → mtime-unchanged → reload from disk → permissive again" failure mode.

### Adapter HIGH: register() single-flight test coverage (Adapter review §7)

- **`adapters/hermes/plugin/corellia_guard/tests/test_register_idempotent.py`** — new (~80 LOC). Three tests:
  - `test_register_double_call_spawns_one_daemon` — calls `register(ctx)` twice with monkeypatched `_start_poll_daemon`; verifies one spawn, both ctxs receive the hook, both ctxs share the same hook closure (intentional — sub-agents share the cache).
  - `test_register_concurrent_calls_spawn_one_daemon` — 8 threads racing through `register()` produce one daemon spawn, all 8 ctxs get hooks. Pins the `_REGISTER_LOCK` is doing its job.
  - `test_register_skips_daemon_when_env_missing` — with `CORELLIA_TOOL_MANIFEST_URL` / `CORELLIA_INSTANCE_TOKEN` unset, no `corellia_guard.poll` thread is constructed; hook still attaches; warning log fires. Locks the local-dev quiet path.

### Adapter MEDIUM: matcher hardening (Adapter review §1, §2, §3, §8)

- **`adapters/hermes/plugin/corellia_guard/scope.py`** — `_normalize_url_for_match` now lower-cases for scheme detection (`Https://wiki.acme.com`, `HTTP://...` and canonical `https://...` all strip correctly). Pinned by `test_url_matcher_mixed_case_scheme`. Body of URL is returned unchanged so host comparisons stay case-sensitive (matches operator intent: `*.acme.com` only matches lower-case hosts).
- **`adapters/hermes/plugin/corellia_guard/scope.py`** — `match_command` short-circuits to False on empty/None command (was: would fall through to regex loop and a permissive `.*` would match an empty command). Closes the asymmetry vs `match_url` / `match_path`.
- **`adapters/hermes/plugin/corellia_guard/scope.py`** — `match_path` docstring corrected: Python's `fnmatch` does NOT distinguish `*` from `**` (both match any chars including `/`). Operators should treat the allowlist as explicit prefix-+-glob whitelist, not rely on a single-vs-double-star distinction. Migration to `pathlib.PurePosixPath.match` is queued for v1.6 if operator confusion crops up.
- **`adapters/hermes/plugin/corellia_guard/hook.py`** — `ScopeCache._reload_locked` reworked for the stat-after-read race window. Reads `mtime_before` BEFORE the file content; if the daemon's atomic `os.replace` lands between content-read and the prior post-read stat, the new code caches the new content under the old (mtime_before) value, and the next `get()` detects the disagreement and triggers another reload. Worst case: one extra reload on a contended write. Previously the race silently masked one TTL window of stale-but-valid enforcement.
- **`adapters/hermes/plugin/corellia_guard/hook.py`** — `ScopeCache.get()` triggers reload on `mtime != self._mtime` (was: `mtime > self._mtime`). NTP corrections, file restored from backup, or any other mtime regression now reload correctly. Pinned by `test_reload_on_mtime_regression`.
- **`adapters/hermes/plugin/corellia_guard/hook.py`** — rejection messages redact URL query strings (`_redact_url`) and truncate long commands (`_redact_command`, 200-char cap). The block message round-trips through Hermes into the agent's stdout AND into the LLM's next turn (via the conversation history); without redaction, a `web_fetch(url="...?token=secret")` rejection would push the credential into the model's context. Pinned by `test_rejection_redacts_url_query_string` and `test_rejection_truncates_long_command`.

### Adapter test coverage expansion

- **`adapters/hermes/plugin/corellia_guard/tests/test_poll_daemon.py`** — new (~140 LOC). Eight cases. Exercises `_poll_once` against `unittest.mock.patch`-replaced `urllib.request.urlopen`:
  - 200 with body → `scope.json` atomically written, ETag returned.
  - 304 → existing ETag preserved, `scope.json` NOT touched.
  - 401 → propagates to caller (loop's per-status handler picks it up).
  - `_manifest_to_scope_doc` projection: valid + malformed entries; toolsets without governable shape silently dropped; missing `manifest_version` → defaults to 0.
  - `_ttl_seconds` clamping: bogus / too-low / too-high values all land within the 5–300 second envelope.
- **`adapters/hermes/plugin/corellia_guard/tests/test_scope_reload.py`** — three new cases: `test_reload_on_mtime_regression`, `test_unparseable_then_recovers` (bad JSON → fixed JSON picks up on next stat), `test_force_deny_all_takes_effect_immediately` (revocation override survives across cache reload cycles).
- **`adapters/hermes/plugin/corellia_guard/tests/test_url_matcher.py`** — `test_url_matcher_mixed_case_scheme` (parametrized over five scheme casings).
- **`adapters/hermes/plugin/corellia_guard/tests/test_hook_dispatch.py`** — five new cases (`test_web_fetch_*` × 2, `test_web_search_passes_through_plugin`, `test_browser_navigate_uses_browser_scope`, `test_shell_shaped_unknown_name_routes_to_terminal`, `test_rejection_redacts_url_query_string`, `test_rejection_truncates_long_command`). The original `test_web_search_*` cases were renamed to `test_web_fetch_*` to reflect the new routing.

### FE MEDIUM: cred-required preflight + diff stability + rollback hygiene

- **`frontend/src/components/fleet/instance-tool-editor.tsx`** — addable-toolset filter widened to exclude `requiredEnvVars.length > 0`; new `credLocked` array drives a "REQUIRES CREDENTIAL — V1.6" terminal-container with locked chips and explanatory copy ("Equip them through the spawn wizard for now"). The BE's reattachment fix means *editing scope* on an already-equipped credential-bearing grant works (the inspector's existing GrantRow renders normally for those); only *adding new* ones from the inspector is gated, where in-flight credential capture has its own UX surface scheduled for v1.6.
- **`frontend/src/components/fleet/instance-tool-editor.tsx`** — `shallowJsonEqual` rewritten as a proper recursive value-by-value comparator (arrays element-wise / order-sensitive — patterns are positional; objects key-by-key / order-insensitive). Replaces `JSON.stringify`-based diff which mis-classified key-order changes as `plugin-tick`. Bounded inputs (≤64 patterns × ≤200 chars per BE scope_validator) keep the recursive cost negligible.
- **`frontend/src/components/spawn/wizard.tsx`** — `onDeploy` rollback hardened. Catalog fetch (`fetchToolIdsByKey`) hoisted ABOVE `spawnAgent` so a catalog round-trip failure errors before any Fly resource exists, closing the post-spawn orphan window. On grant-write failure, `destroyAgentInstance` rollback failure is no longer silently swallowed: failure surfaces a `console.error` plus a streaming-log warning line ("rollback destroy failed — manual cleanup may be required") so orphan Fly apps become visible to the operator and to Sentry-class telemetry.
- **`frontend/src/components/spawn/wizard.tsx`** — three stale section comments fixed (header docstring "Five-step" → "Six-step"; `STEP 4 // DEPLOYMENT` → `STEP 5 // DEPLOYMENT`; `STEP 5 // REVIEW` → `STEP 6 // REVIEW`). Cosmetic but had been confusing readers — the runtime ordinals were already derived from `STEP_META` so behaviour was correct, the labels were drifted from the v1.5 Pillar B six-step layout.

### FE MEDIUM: regex grammar drift + Promise.allSettled

- **`frontend/src/components/spawn/scope-inputs/command-allowlist.tsx`** — `validateCommandAllowlist` extended with a string-level RE2-incompatibility check: rejects patterns containing `(?=`, `(?!`, `(?<=`, `(?<!`, or backreferences `\1..\9` with a clear "RE2 (server-side) does not support …" message. Catches the most common JS-regex-vs-Go-RE2 drift cases without a full RE2 parse (false-positives are recoverable via the BE's save error). Hint copy updated to "Go RE2 syntax — no lookahead/lookbehind, no backreferences" so operators are warned upfront.
- **`frontend/src/components/settings/org-tool-curation.tsx`** — `Promise.all` → `Promise.allSettled` on the per-adapter catalog fetch. v1.5 has one Hermes adapter so practical impact is nil, but the moment a second adapter ships, a single failed catalog fetch would have nuked the whole page. Failed adapters now render in an `ADAPTER CATALOG UNAVAILABLE` terminal-container with a per-adapter error band + retry button; healthy adapters still render. Type widened on `FetchState["ready"]` with optional `failures: SectionFailure[]`.

### BE MEDIUM: FlyDeployTarget.Restart test coverage

- **`backend/internal/deploy/fly_test.go`** — five new tests for the Phase 7 `Restart` method (which the original Phase 7 completion-note implied existed but only tested the fake plumbing on the agents-side):
  - `TestFlyDeployTarget_Restart_HappyPath` — three machines, one stopped, one starting, two started; verifies only the started ones get `AcquireLease` + `Restart` + `Wait` + `ReleaseLease`.
  - `TestFlyDeployTarget_Restart_BadExternalRef` — parse error short-circuits before any Flaps call.
  - `TestFlyDeployTarget_Restart_ListError` — Flaps unreachable on List → no Restart attempted.
  - `TestFlyDeployTarget_Restart_FlapsErrorShortCircuits` — first machine's Restart fails; loop short-circuits without touching the second machine; lease still releases via defer. Pins the "partial restart of multi-replica is a defect, not silent best-effort" intent.
  - `TestFlyDeployTarget_Restart_NoStartedMachinesIsNoop` — all-stopped fleet returns nil with zero Restart calls.

### BE LOW: audit hygiene

- **`backend/internal/tools/service.go`** — `auditAppend` failure log now includes `org_id` / `instance_id` / `tool_id` (formatted as UUID strings) alongside `actor_user_id`. Operators investigating dropped audit rows can correlate to the entity. Nullable pointers are dereferenced once and stringified to avoid `0xc0…`-shaped log output.

### Ops: env documentation + Phase 5 DOWN correction (forward-only)

- **`.env.example`** — new `CORELLIA_API_URL` entry added under a "Tools governance (v1.5 Pillar B)" section. This is the master gate that wires the manifest issuer at `main.go:79`; without it, tools governance silently disables (spawn skips manifest-token issuance, plugin daemon refuses to start). New deployers reading the committed template no longer accidentally ship without enforcement.
- **`backend/migrations/20260427200000_phase5_down_correction.sql`** — **new (forward-only)**. Migration `20260427180000` (Phase 5) ships a buggy DOWN block that reverts the `harness_adapters` row to the M-chat digest (`e31cc422…`) when — because Phases 2 + 5 deployed as one image (changelog 0.13.6) — the correct post-Phase-5 revert state is Phase 2's UP digest (`b8a6371d…`). Applied migrations are immutable (an earlier draft of this entry edited 180000's DOWN in place; that's the schema/codebase-drift hazard, reverted). The fix is a NEW forward-only migration:
  - **UP**: idempotent re-pin of the row to `b8a6371d…` (already there in production; the explicit statement self-heals any out-of-band drift and makes the desired post-correction state legible at the SQL level).
  - **DOWN**: explicitly sets the row to `b8a6371d…` (the corrected revert target). An operator running `goose down 1` from the head with this migration applied lands at the "Phase 5 reverted, Phase 2 still in effect" state without touching the immutable historical record. Continuing `goose down` past 180000 still hits the buggy DOWN and lands at `e31cc422…` — but at that point the operator has explicitly chosen the full-rollback path that 170000's DOWN delivers anyway, so the buggy intermediate is no longer load-bearing.
  - Operator action: `goose -dir backend/migrations postgres "$DATABASE_URL_DIRECT" up` is safe and effectively a no-op against the production row (already at `b8a6371d…`); the migration is in the tree to make the corrected DOWN-direction available going forward.

### Why this isn't a bigger version bump

All changes are additive or hardening — no proto change, no schema change, no FE/BE contract change. The credential reattachment is functionally a bug fix in `SetInstanceGrants`'s prior behaviour (the documented contract didn't match the implementation; the implementation was strictly worse than the documented contract; this aligns them). Operators should pull, run `cd backend && go test ./... && pytest adapters/hermes/...` to re-verify, and (optionally) push a fresh adapter image with the Phase 7 hardening — the pinned digest in production from 0.13.6 doesn't include the matcher / poll-loop fixes, so a v1.5.1 adapter image bump migration is the natural follow-on (separate operator gate, not part of this entry). Until that bump, the matcher/redaction/revocation fixes are inert in production but correct for any new spawn that pulls a freshly-built adapter image.

### Forward pointers (v1.6 candidates flagged but not addressed)

- **In-flight credential editor in the inspector** (FE review §4, MEDIUM) — the cred-required preflight gates the unsafe path; the actual editor with key rotation + "are you sure" modal is v1.6.
- **Unbounded rate-limit map growth** over process lifetime (BE review §5, LOW) — acceptable at v1.5 single-machine scale; v1.6 swap to LRU or Redis.
- **Audit reader UI at `/settings/audit`** (cross-cutting review NIT) — rows accumulate now; reader UI is v1.6.
- **Frozenset drift detection** as a CI check (Adapter review §5) — manual audit log shipped today (`docs/refs/hermes-tool-name-audit.md`); automation queued.
- **Push-on-change manifest invalidation** (Phase 7 plan §1.2 deferral) — pull-with-TTL only today; SSE / WebSocket is v1.6+.

### Test counts

- BE: `go test ./internal/tools/` adds 4 cases (37 → 41); `go test ./internal/deploy/` adds 5 (Restart suite). All packages still pass.
- Adapter: pytest 49 → 73 (+24 new cases across `test_url_matcher`, `test_hook_dispatch`, `test_scope_reload`, `test_register_idempotent` (new file), `test_poll_daemon` (new file)).
- FE: type-check / lint / build all green; no rendering test framework wired (per stack.md §13), so behavioural tests for the inspector preflight and the diff comparator land alongside the v1.6 Vitest harness.

---

## 0.13.9 — Vercel Build Fix: `pnpm.packageExtensions` — Inject `zod` Peer into `@hookform/resolvers` (2026-04-27)

Fixes a Vercel Turbopack build failure introduced by `@hookform/resolvers@5.x`, which imports `zod/v4/core` at the module level but does not declare `zod` as a peer dependency. pnpm's strict isolation therefore never symlinked zod into the resolver's sibling packages, so Turbopack could not resolve the import even though `zod@4.3.6` was installed in the workspace.

- **`package.json`** (root) — added `pnpm.packageExtensions["@hookform/resolvers"].peerDependencies = { "zod": "*" }`. This is pnpm's canonical mechanism for patching missing peer declarations in third-party packages without forking them. After `pnpm install`, the lockfile resolution key for the resolver changes from `...(react-hook-form@7.73.1...)` to `...(react-hook-form@7.73.1...)(zod@4.3.6)`, and zod is correctly linked into the resolver's node_modules.
- **`pnpm-lock.yaml`** — regenerated; `@hookform/resolvers` entry updated to include `zod@4.3.6` in its resolution key. No other dependency changes.

No product behaviour changed. `pnpm -C frontend build` is green locally and the Vercel deployment should now succeed.

---

## 0.13.8 — v1.5 Pillar B Phase 7: Fleet Inspector Tool Editor + `RestartAgentInstance` + `tool_grant_audit` + Manifest Rate-Limit (Pillar B Complete) (2026-04-27)

Closes v1.5 Pillar B. Operators can now revoke or edit tool grants on running agents from the fleet view; every grant change appends to a new `tool_grant_audit` table; the manifest endpoint is rate-limited per instance; the new `RestartAgentInstance` RPC closes the "restart required" loop for `platform_toolsets`-tier changes. `pnpm proto:generate` (RestartAgentInstance RPC + messages) and `cd backend && sqlc generate` (tool_grant_audit query) both re-run without further diff. `cd backend && go test ./... && go vet ./... && go build ./...` and `pnpm -C frontend type-check && lint && build` all green.

- **`backend/migrations/20260427190000_tool_grant_audit.sql`** — new. Append-only `tool_grant_audit` table per plan §3 Phase 7. `actor_user_id` is required; `org_id` / `instance_id` / `tool_id` are nullable FKs with `ON DELETE SET NULL` so audit rows survive orphaning. `action` is a closed CHECK enum: `org_curation_set` | `instance_grants_set` | `instance_restart` (matches the live write taxonomy after Phase 3 collapsed grant + revoke + scope-edit into one atomic `instance_grants_set` event). `before_json` / `after_json` reserved for the v1.6 reader UI; Phase 7 writes leave both NULL. Two partial indexes — `(instance_id, at DESC)` and `(org_id, at DESC)` — scoped to non-NULL keys so the v1.6 reader's per-instance / per-org timeline queries don't table-scan.
- **`backend/queries/tool_grant_audit.sql`** — new. `InsertToolGrantAudit :exec`. Generates `db.InsertToolGrantAuditParams` + `Queries.InsertToolGrantAudit`.
- **`backend/internal/tools/service.go`** — extended. `auditAppend` was a Phase 3 no-op stub; Phase 7 fills it in with the real `InsertToolGrantAudit` call. Signature widened to take `actorUserID uuid.UUID` first; existing call sites already had the actor in hand (`curatedBy` / `grantedBy`) so the rewire was mechanical. New exported `AppendInstanceRestartAudit(ctx, actor, org, instance)` — agents.Service calls it from the new `RestartInstance` path without importing tools' internal types. Audit-write failures are **logging-only**: a failed append must NOT roll back the surrounding business write. `uuidPtrToPg` helper projects nullable `*uuid.UUID` into the `pgtype.UUID` shape sqlc emits.
- **`shared/proto/corellia/v1/agents.proto`** — extended. New `rpc RestartAgentInstance(RestartAgentInstanceRequest) returns (RestartAgentInstanceResponse)` matching the existing Stop / Destroy shape. Generated Go + TS via `pnpm proto:generate`.
- **`backend/internal/deploy/{target,fly,stubs}.go`** — extended. New `DeployTarget.Restart(ctx, externalRef)` interface method. `FlyDeployTarget.Restart` lists machines, skips non-`started` ones, lease + `flaps.Restart` (new flapsClient interface method) + Wait + release per machine; partial restart of a multi-replica app is a defect surfaceable to the operator, not silent best-effort. `LocalDeployTarget` / `AWSDeployTarget` return `ErrNotImplemented` per blueprint §11.4.
- **`backend/internal/agents/{service,fleet}.go`** — extended. New private interface `toolsAuditAppender` (single method: `AppendInstanceRestartAudit`) so the audit hook plugs in without importing `*tools.Service` (mirrors `toolManifestIssuer`). New option `agents.WithToolsAuditAppender(a)` (nil = no-op). New method `RestartInstance(ctx, actorUserID, instanceID, orgID)` in `fleet.go`: loads the instance, asserts it isn't destroyed and has a Fly external ref, calls `target.Restart`, then on success calls `auditAppender.AppendInstanceRestartAudit`. Failures redact through `ErrFlyAPI`; audit only on success.
- **`backend/internal/httpsrv/agents_handler.go`** — extended. `agentsService` interface gains `RestartInstance(ctx, actor, instance, org)`. New handler `RestartAgentInstance` reads userID alongside orgID (Phase 7 needs the actor for the audit row), parses the instance UUID, calls `svc.RestartInstance`. <30 LOC per blueprint §11.9.
- **`backend/internal/httpsrv/tool_manifest_ratelimit.go`** — new. Per-instance counting-window token bucket: `60 requests / minute / instance` default. The legitimate steady-state poll rate is ≤12/min (30s default TTL with 5s lower clamp), so the cap absorbs a 5× burst above that. Operator-driven manifest changes (fleet-inspector save) trigger an ETag-mismatch poll within TTL — a handful of requests per change-event, well inside the cap. In-process state — a misbehaving adapter pinned to one Corellia instance is rate-limited by that instance only (acceptable for v1.5 single-machine control plane; horizontal scale → swap to Redis behind the same `allow(instanceID)` interface).
- **`backend/internal/httpsrv/tool_manifest.go`** — extended. `ToolManifestHandler` gains `*manifestRateLimiter`; `NewToolManifestHandler` constructs the default-tuned bucket. 429 path returns `Retry-After: 60` + `{"code":"resource_exhausted","message":"manifest poll rate exceeded"}`. Applied **after** auth so unauthenticated floods can't pollute the bucket table.
- **`backend/cmd/api/main.go`** — `agents.WithToolsAuditAppender(toolsSvc)` always wired (independent of `CORELLIA_API_URL`, since audit-row writes work whether or not the manifest endpoint is reachable).
- **`frontend/src/components/fleet/instance-tool-editor.tsx`** — new (~410 LOC). The Phase 7 fleet-view per-instance editor. Mounted as a `<Sheet>` slide-over from each fleet row's new Tools action. Fetches grants + catalog in parallel on open; renders each grant row with the wizard's scope-input components (`<UrlAllowlistInput>`, `<CommandAllowlistInput>`, `<PathAllowlistInput>`, `<WorkingDirectoryInput>`); revoke clears the row from the staged set; catalog dropdown adds a new toolset (defaulted to empty scope). **Propagation tier banner** computed from the diff: `plugin-tick` (only scope changed → applies within ~35s on next tool call); `restart-required` (any toolset added or removed → applies on next agent boot); `no-change` (Save disabled). Save is atomic via `setInstanceToolGrants`; the BE replaces the active grant set in one tx + bumps `manifest_version` for ETag invalidation; refetches canonical post-write state into the editor. **Restart now** button only renders when tier is `restart-required`; calls `restartAgentInstance` RPC.
- **`frontend/src/components/fleet/agent-row-actions.tsx`** — extended. New Tools action (Wrench icon) opens the editor. Hidden on destroyed rows and when `harnessAdapterId` is absent. Prop threaded through fleet-page → table + gallery → row-actions.
- **`frontend/src/lib/fleet-templates.ts`** — new. `useTemplateAdapterMap()` hook: single-shot fetch of `listAgentTemplates` on mount; builds `Record<templateId, harnessAdapterId>`. Best-effort — errors silently leave the map empty (Tools button hides). v2 (multi-template) refetches on visibility regain.
- **Fleet wiring** — `fleet/page.tsx`, `fleet/[id]/page.tsx`, `fleet-gallery.tsx`, `agent-card.tsx` — threaded the template-adapter map from each fleet entry-point through to `<AgentRowActions>`. No other behavioural change.
- **Tests** — `tools/service_test.go` (audit-row pin on `SetInstanceGrants` happy path + new `TestAppendInstanceRestartAudit` + `fakeToolQueries.InsertToolGrantAudit`); `agents/service_test.go` (5 RestartInstance cases: happy path, deploy-failure-no-audit, NotFound, destroyed-row-rejected, no-audit-appender-still-succeeds; `fakeAuditAppender`; `fakeDeployTarget.Restart` + `restartCount` + `restartErr`); `httpsrv/tool_manifest_test.go` (rate-limit hits 429 + Retry-After; per-instance bucket isolation); `deploy/fly_test.go` (`flapsClientFake.Restart` + `restartErr`).
- **Doc updates** — `docs/blueprint.md` §3.2 (`CORELLIA_TOOL_MANIFEST_URL` + `CORELLIA_INSTANCE_TOKEN` documented as v1.5 Pillar B reserved env vars, semantics moved from "post-v1" to live); `docs/blueprints/adapter-image-blueprint.md` §12 #6 (rewritten as "implemented in v1.5 Pillar B" with forward-pointer to completion notes); `CLAUDE.md` frontend route map (`/settings/tools` named, `/fleet`'s `<InstanceToolEditor>` slide-over named); `docs/completions/tools-governance-phase-7.md` (new — full Phase 7 narrative + 6 deviations + operator smoke list + done-checklist).

**Deviations from plan:** (1) **`Restart` lives on `DeployTarget`, not in a Fly-specific path.** Plan §3 deliverable 3 implied a Fly-only concrete method; the interface-method shape was the right cut per blueprint §11.1, with stubs returning `ErrNotImplemented`. (2) **Per-row propagation-tier label became a single banner above Save.** The tier is a property of the diff, not of the grant itself in a stable state — labeling each row would either be redundant or confusing. Mirrors `<DeploymentInspector>`'s `UpdateResult` preview banner. (3) **No credential capture in the inspector.** In-flight credential editing has its own UX surface (key rotation, "are you sure" modal) and lands in v1.6; today the inspector preserves existing credentials via the BE's atomic revoke-all-then-insert-N tx. (4) **Audit table CHECK is a closed enum (3 actions), not free-form text.** Matches the actual write taxonomy (Phase 3 collapsed grant + revoke + scope-edit into one atomic `instance_grants_set` event); future actions are a CHECK widening. (5) **No SSE / WebSocket** — pull-with-TTL only per plan §1.2 ("push-on-change deferred to v1.6+"). (6) **No bulk grant-set apply** — single-instance editing covers the v1.5 demo path; the M5 bulk-fleet-ops surface doesn't grow a tools lane.

**v1.5 Pillar B done.** Plan §7 done-definition checklist: 7/10 items pass automatically (all 7 phases shipped, `go test`, `go vet`, frontend gates, `pytest`, completion notes, walk-through readiness); 3 remain operator-gated (3-clean-runs of the §1.3 demo, adapter smoke, governance-roadmap docs update). Forward pointers (v1.6): credential editor in the inspector, audit reader UI at `/settings/audit`, `before_json` / `after_json` populated, Redis-backed rate limiter at horizontal scale, MCP / Skills / per-tool / Tool-providers governance plans (taxonomy items #2/#3/#4/#5).

---

## 0.13.7 — README Demo Video: `capture:video` Script (Puppeteer + ffmpeg → MP4) (2026-04-27)

Adds a one-command tool for generating a video of the sign-in page WebGL particle animation, suitable for embedding at the top of `README.md` as a GitHub-hosted video. No product behaviour changed; no backend, proto, or migration touched.

The animation is a 28 000-particle Three.js / R3F swarm with custom GLSL shaders and six morphing shapes (chevron → octahedron → torus → globe → network → wordmark). Because it runs in WebGL on the GPU there is no static asset to grab — the only reliable capture path is a real browser. Headless Chromium uses a software renderer that washes out the additive-blended particles; headed Chrome with full GPU WebGL is required for colour-accurate output.

Capture approach: `puppeteer-core` + system Chrome (no Chromium download) navigates to `localhost:3000/sign-in`, waits 4 s for the shape `.bin` files to load and WebGL to initialise, then screenshots as fast as CDP allows (~10–15 fps on a local machine), measures the actual elapsed fps, and hands the frame sequence to ffmpeg which encodes H.264 MP4. One morph cycle is drift (4–8 s) + morph (7 s) + hold (7 s) ≈ 18 s; the script captures 20 s to land a clean clip. The resulting `docs/assets/login-animation.mp4` is gitignored — it is uploaded to GitHub (drag into any issue/PR comment box to get a CDN URL) rather than committed as a binary.

- **`scripts/capture-login-video.mjs`** — new. ESM Node script. `findChrome()` walks three candidate paths (`Google Chrome`, `Chromium`, `Chrome Canary`) and throws with a clear message if none is found. Launches `headless: false` with `--window-size=1280,720` and `defaultViewport` set to match, so the captured frames are exactly 1280 × 720 with no OS chrome bleeding in. Navigates to `PAGE_URL` (`http://localhost:3000/sign-in`) with `waitUntil: networkidle0`. 4 s init wait, then `page.screenshot()` loop until `CAPTURE_MS` (20 000 ms) elapses; actual fps calculated from frame count ÷ elapsed ms and passed to ffmpeg so the video plays at the same rate it was captured. ffmpeg flags: `-c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart` (yuv420p for broad player compatibility; `faststart` places the moov atom at front for GitHub's inline player). Prints next-step instructions (drag-to-upload → get CDN URL → fill README placeholder) on completion.
- **`package.json`** — `"puppeteer-core": "^22.0.0"` added to `devDependencies`; `"capture:video": "node scripts/capture-login-video.mjs"` added to `scripts`. `puppeteer-core` is used over `puppeteer` to avoid the ~170 MB Chromium download — system Chrome is already present on any dev machine.
- **`.gitignore`** — `docs/assets/login-animation.mp4` excluded. The MP4 is a derived artifact and a large binary; it belongs on GitHub's CDN, not in the tree.
- **`README.md`** — commented-out `<video>` embed block added between the centered header `</div>` and the first `---` separator. Includes inline instructions: run `capture:video`, drag the output into a GitHub issue, replace `VIDEO_URL` in the tag, uncomment. The block uses `autoplay loop muted playsinline width="900"` — the attributes GitHub's Markdown renderer honours for inline video playback.

**Operator workflow (two-step, one-time):**
```
pnpm install && pnpm frontend:dev   # terminal 1 — leave running
pnpm capture:video                  # terminal 2 — Chrome opens 20s, encodes, exits
```
Then drag `docs/assets/login-animation.mp4` into any GitHub issue/PR, copy the CDN URL, replace `VIDEO_URL` in `README.md`, and uncomment the block.

---

## 0.13.6 — v1.5 Pillar B Operator Gate: Adapter Image Push + Migrations Applied + Tools Governance Activated (2026-04-27)

Completes the operator exit gates for Phases 2 and 5. Three migrations applied to production (two planned, one opportunistic). Backend config updated in both local dev and production; Fly machine rolled and confirmed healthy. Tools governance is now active end-to-end for newly spawned agents.

- **Adapter image** — Phase 5 image (`v2026-04-27-pillar-b-phase5`, multi-platform `linux/amd64,linux/arm64`) built from current `adapters/hermes/` and pushed to GHCR. Digest captured and filled into both pending migration files. Phase 2 intermediate image was skipped — Phases 2–5 were deployed together, so both adapter migrations pin the same digest.
- **`backend/migrations/20260427170000_adapter_image_ref_bump_pillar_b_phase2.sql`** — digest placeholder filled and migration applied. `harness_adapters.adapter_image_ref` for `hermes` updated to the Phase 5 image.
- **`backend/migrations/20260427180000_adapter_image_ref_bump_pillar_b_phase5.sql`** — digest placeholder filled and migration applied. Down migration revert target filled with the M-chat Phase 7 image digest (the last known-good pre-Pillar-B image, since no Phase 2 intermediate image exists).
- **`backend/migrations/20260427190000_tool_grant_audit.sql`** — applied opportunistically. File was already present in the migration tree; `goose up` picked it up alongside the two planned migrations. Creates `tool_grant_audit` (Phase 7's audit table — append-only log for curation and grant writes, indexed by `instance_id` and `org_id`). Additive and safe: the Phase 3 `auditAppend` stubs are wired at every write call site but currently no-ops; Phase 7 makes them persistent.
- **Backend config** — local dev config and production Fly secrets updated to activate tools governance. Fly performed a rolling machine update; confirmed `1/1 healthy`.

**Net effect:** New agents spawned from production now receive a manifest bearer token and manifest endpoint URL injected as Fly secrets at spawn time. The Phase 5 adapter image fetches the toolset manifest at boot, writes `$HERMES_HOME/config.yaml` and `corellia/scope.json` atomically, and enforces URL / command / path allowlists at `pre_tool_call` via `corellia_guard`. The poll daemon refreshes scope state every ~30 s, so grant changes propagate without a redeploy.

---

## 0.13.5 — v1.5 Pillar B Phase 6: Org Tool Curation Page (`/settings/tools`) (2026-04-27)

First surface in the **org-settings family**. Org-admins curate which toolsets agents in the workspace may equip when spawned; disabled toolsets disappear from the spawn-wizard TOOLS step (Phase 4 already wires the `enabledForOrg` filter — Phase 6 wires the knob that drives the flag). Pure frontend work — the three RPCs the page consumes (`listAgentTemplates`, `getOrgToolCuration`, `setOrgToolCuration`) all shipped earlier. `pnpm -C frontend type-check`, lint, build, `go test ./...`, `go vet ./...` all green. No proto, migration, sqlc, or backend changes.

- **`frontend/src/app/(app)/settings/tools/page.tsx`** — new. Server component shell, `metadata.title = "Tools — Settings — Corellia"`, renders `<OrgToolCuration>`. Mirrors `/spawn/page.tsx → <Wizard>`: the auth + org bootstrap lives in `(app)/layout.tsx`, so `useUser()` is populated by the time the client component mounts and a server-side session lookup is unnecessary.
- **`frontend/src/components/settings/org-tool-curation.tsx`** — new (~220 LOC). Three responsibilities: **role gate** (`useUser().user.role !== "admin"` → failed-accent `<TerminalContainer title="ADMIN ONLY">` with shield-alert glyph; BE's `SetOrgToolCuration` handler is the actual security boundary, this is UX); **catalog discovery** (no `ListHarnessAdapters` RPC in v1.5 — derive the in-org adapter set from `listAgentTemplates`'s `harnessAdapterId` field, dedupe, fetch curation per adapter in parallel); **save model** (per-tool optimistic UI + single-flight latch — toggle reflects locally on click, fires `setOrgToolCuration`, replaces the row with the canonical server-returned `Tool` on success, rolls back the optimistic patch + sonner-toasts the error on failure; button stays disabled mid-flight as `[ … SAVING ]`).
- **`frontend/src/components/app-sidebar.tsx`** — extended. New `Tools` entry in the `[ MODULES ]` group between `Fleet` and the existing `Settings (Soon)` placeholder, **conditional on `user.role === "admin"`**. Refactored the flat `items` array into three concatenations (`baseItems`, `adminItems`, `trailingItems`) so ordering is deterministic without a `.filter()` on a mixed list.
- **`docs/refs/design-system.md` §33.10** — new page-motif entry under `## 33. Page Motifs (per route)`. Documents the surface for future contributors: amber accent (matches the spawn-wizard TOOLS step from 0.13.3), `[ ✓ ENABLED ]` / `[ DISABLED ]` / `[ … SAVING ]` toggle vocabulary, OAuth-only rows render a disabled toggle + `lock-icon · OAUTH · v1.6` chip per blueprint §11.4, the `listAgentTemplates`-derived adapter discovery model, the relationship to /spawn's TOOLS step (org-curated-out → hidden, OAuth-only → locked), and the sidebar gating model. Reuses §33's slot rather than the §35 the plan called for — §35 was already taken before the plan was drafted, and the page-motif family is the closer fit anyway.

**Deviations from plan:** (1) **No new sidebar group; flat top-level entry.** Plan §3 Phase 6 deliverable 2 says "new 'Tools' item under Settings"; the current sidebar has no nested-sub-group primitive, and adding one for a single sub-item is more structural change than the surface warrants. The `Tools` entry sits adjacent to the `Settings (Soon)` placeholder; once the broader `/settings` family lands (workspace name, members, billing) and a second org-settings sub-route exists, a sub-group becomes worth carving. (2) **No debounce; single-flight latch instead.** Each toggle is a discrete operator intent (no fast-fire continuous input like a slider), so the failure mode "5 RPCs in flight from 5 rapid clicks" is best prevented by disabling the button while one write is in flight. Mid-flight `[ … SAVING ]` doubles as the "click-in-progress" cue. (3) **Audit row append: not wired in this phase.** Per Phase 3 completion notes, `auditAppend` no-op stubs are already planted at every BE write site; Phase 7 fills them mechanically. Phase 6 is FE-only, so the audit chain becomes live the moment Phase 7 lands. (4) **No frontend rendering tests; no backend test extension.** Phase 3's `TestListAvailableForOrg` already pins "ListTools honours curation"; the repo has no FE rendering test framework wired (per stack.md §13), so colocated tests drop in mechanically once one lands.

---

## 0.13.4 — v1.5 Pillar B Phase 5: `corellia_guard` Plugin (URL / Command / Path Enforcement + Manifest Poll Daemon) (2026-04-27)

The Phase 2 `register(ctx): pass` stub is replaced with the real enforcement implementation. Three non-native scopes — URL allowlist on `web`, command-pattern allowlist on `terminal`, path allowlist on `file` — plus the working-directory pin on `terminal` are now enforced at `pre_tool_call`. Scope state is read from `$HERMES_HOME/corellia/scope.json`; a daemon thread keeps that file fresh by ETag-aware polling of `CORELLIA_TOOL_MANIFEST_URL` on a 30 s TTL. Phase 4's `[ ENFORCEMENT IN PILLAR B PHASE 5 ]` notices removed from the wizard scope inputs. Adapter image rebuild is operator-gated. 49 pytest cases added; no proto, SQL, or Go changes. All check gates green.

- **`adapters/hermes/plugin/corellia_guard/scope.py`** — new. Pure-logic dataclasses + matchers; no Hermes imports, no I/O. `ToolsetScope` (url/command/path allowlists + working_directory; `from_dict` decays bad types to empty defaults). `Scope` (keyed by toolset_key + `manifest_version`; `Scope.deny_all()` is the fail-safe when scope.json is missing or unparseable). Four matchers: `match_url` (fnmatch globs; host-only pattern matches any path under that host; scheme-stripped before matching; default-deny on empty list or `None`), `match_command` (`re.search`; invalid regexes silently skipped; default-deny), `match_path` (fnmatch with `**`; default-deny), `match_working_dir` (prefix-on-path-boundary; trailing-slash insensitive; default-allow on empty pin per Phase 1 decision).
- **`adapters/hermes/plugin/corellia_guard/hook.py`** — new. `ScopeCache(path)` — mtime-aware reader; `os.stat` once per call, re-parses only when mtime advances; `threading.Lock` around parse-and-set; disappearing file → deny-all immediately (stale-allow is the explicitly unsafe failure mode). `make_pre_tool_call(cache)` — returns the hook callable. Tool-name routing via three curated frozensets: `_WEB_TOOLS = {"web_search", "web_fetch", "browser_navigate"}`, `_TERMINAL_TOOLS = {"shell_exec", "terminal_exec", "execute_command", "run_command"}`, `_FILE_TOOLS = {"read_file", "write_file", "edit_file", "delete_file", "list_files", "list_directory", "search_files"}`. Tool names outside all frozensets pass through (toolset-level gate at `platform_toolsets.cli` remains the safety net). Reject return shape: `{"action": "block", "message": "<reason>"}`. Argument extraction is defensive (`query`/`href` fallbacks for URL; `command`/`argv` string-or-list for terminal; `path`/`file_path`/`filename` for file; non-string values coerce to empty string → default-deny).
- **`adapters/hermes/plugin/corellia_guard/__init__.py`** — replaced (was Phase 2 `register(ctx): pass` stub). `register(ctx)` is now real. Single-flight guard (module-level `_STARTED` sentinel + `Lock`) — first call constructs `ScopeCache`, builds the hook closure, spawns the daemon; subsequent calls only re-attach the hook to the new ctx (sub-agents, future session-isolation patterns) without duplicating threads. Daemon thread: `threading.Thread(daemon=True)` polling `CORELLIA_TOOL_MANIFEST_URL` with `Bearer $CORELLIA_INSTANCE_TOKEN`; ETag-aware (`If-None-Match` on every poll after the first; 304 = no-op); on 200, `_manifest_to_scope_doc` projects the four plugin-enforced keys and rewrites `scope.json` atomically via `os.replace`; on error, exponential backoff 5 s → 60 s. TTL: 30 s default, `CORELLIA_MANIFEST_POLL_TTL` env-overridable, clamped 5 s..5 min; bogus values fall back to default with a warning. Daemon skipped when either env var is unset (local-dev quiet path; production spawn always sets both).
- **`adapters/hermes/plugin/corellia_guard/tests/`** — new. 49 pytest cases across 6 files: `test_url_matcher.py` (12 — demo case, multiple patterns, scheme normalisation, default-deny, host-only vs path-aware semantics, missing-scope deny), `test_command_matcher.py` (8 — anchored/unanchored regex, default-deny, invalid-regex skip), `test_path_matcher.py` (8 — `**` glob, exact paths, default-deny), `test_working_dir.py` (9 — default-allow on empty, exact equality, prefix admit, trailing-slash insensitivity, sibling-directory rejection), `test_scope_reload.py` (5 — initial load, mtime-advance reload, missing file → deny-all, unparseable → deny-all, disappearing mid-process → deny-all), `test_hook_dispatch.py` (9 — routing for web/terminal/file, allow + block paths, cwd outside pin → block, unknown tool → pass-through, extra kwargs forward-compat).
- **`adapters/hermes/render_config.py`** — extended. `write_scope_json(home, manifest)` writes the initial `$HERMES_HOME/corellia/scope.json` from the manifest (projects the four enforced shape keys; omits toolsets that carry none of them). Now writes scope.json **always**, even when the manifest has no toolsets — without the file the plugin reads `Scope.deny_all()` and rejects every governed call until the first poll.
- **`adapters/hermes/Dockerfile`** — comment-only: Phase 5 block above `COPY plugin/` updated to reflect the real enforcement plugin, not a stub. No structural change.
- **`frontend/src/components/spawn/scope-inputs/pattern-list-input.tsx`** — `pillarBPhase5Notice` prop and its conditional render dropped.
- **`frontend/src/components/spawn/scope-inputs/url-allowlist.tsx`, `command-allowlist.tsx`, `path-allowlist.tsx`** — `pillarBPhase5Notice` prop dropped from their `PatternListInput` calls.
- **`backend/migrations/20260427180000_adapter_image_ref_bump_pillar_b_phase5.sql`** — new, operator-gated. Fill `<IMAGE-DIGEST-PENDING>` after `docker buildx build --push adapters/hermes` + `imagetools inspect` digest capture; `adapter_image_ref_digest_pinned CHECK` rejects placeholder if run prematurely. Down migration reverts to Phase 2 image (digest also a placeholder for the operator to fill from the Phase 2 build).

**Operator exit gate (pending):** build + push Phase 5 adapter image → capture digest → fill migration → `goose up` → three live smokes: (a) URL allowlist allow + block, (b) revoke grant without redeploy (plugin picks it up within 35 s), (c) manifest endpoint down → plugin keeps enforcing last-known-good scope.

---

## 0.13.3 — v1.5 Pillar B Phase 4: Wizard TOOLS Step (2026-04-27)

Six-step spawn wizard. TOOLS inserted between MODEL and DEPLOYMENT; DEPLOYMENT shifts to step 5, REVIEW to step 6. Operator equips per-toolset, configures URL / command / path / working-directory scopes, and notes required credentials. On deploy, `setInstanceToolGrants` fires after `spawnAgent` succeeds; grant-write failure triggers single-shot rollback via `destroyAgentInstance`. `pnpm -C frontend type-check`, lint, build, `go test ./...`, `go vet ./...` all green.

- **`shared/proto/corellia/v1/agents.proto`** — `AgentTemplate.harness_adapter_id` (field 4, non-breaking add). TOOLS step calls `ListTools(harnessAdapterId)` off the existing `ListAgentTemplates` response — no second round-trip.
- **`backend/queries/agent_templates.sql`** — `ListAgentTemplates` widened to include `harness_adapter_id`. `backend/internal/db/agent_templates.sql.go` regenerated.
- **`backend/internal/agents/service.go`** — `toProtoTemplate` populates the new field.
- **`frontend/src/app/globals.css`** — `--feature-tools: 32 95% 58%` (amber) added to both light + dark blocks and `@theme`. Matches the accent-per-step pattern established in design-system.md §34.1.
- **`frontend/src/components/ui/terminal-container.tsx`** — `TerminalAccent` union and `ACCENT_BORDER` / `ACCENT_CHEVRON` records gain `"tools"` entry.
- **`frontend/src/components/spawn/scope-inputs/`** — new directory: `pattern-list-input.tsx` (shared chrome — textarea, count chip, optional enforcement-notice slot); `url-allowlist.tsx`, `command-allowlist.tsx`, `path-allowlist.tsx` (pattern-list scope shapes; command allowlist also validates each entry as a Go-compatible `RegExp`); `working-directory.tsx` (single-line; empty = default-allow per Phase 1 decision).
- **`frontend/src/components/spawn/steps/tools-step.tsx`** — new (~360 LOC). Fetches `listTools(api.tools, { harnessAdapterId })` on mount. Filters `enabled_for_org=false` rows entirely. `oauth_only` toolsets render a locked card (`[ OAUTH REQUIRED — v1.6 ]`). Scope inputs dispatched by `scopeShape` key; unknown keys render an inert dashed-border preview (forward-compatible with new catalog shapes). Confirm runs all `validate*` helpers + "credential present iff required" check. Exports `toolsetMapToGrants` and `toolsetSummaryRows` for the wizard.
- **`frontend/src/components/spawn/wizard.tsx`** — `STEPS` 5 → 6; `STEP_META.tools` ordinal 4, accent `"tools"`; DEPLOYMENT shifts to 5, REVIEW to 6. `WizardFields.toolsets: ToolsetStateMap` added; participates in existing cascading-invalidation contract unchanged. `StepBody` switch: `case "tools"` with `<ToolsStepBody>`. Review character sheet `loadoutRows` prepends `toolsetSummaryRows(...)`. `GalleryWizardShell` inert preview includes TOOLS. `onDeploy`: after `spawnAgent` success + toolsets equipped, `fetchToolIdsByKey` → `toolsetMapToGrants` → `setInstanceToolGrants`; failure triggers best-effort `destroyAgentInstance` rollback (error surfaces to the streaming-log).
- **`docs/refs/design-system.md` §34.1** — five-step layout rewritten as six-step; TOOLS slot (amber accent) inserted.
- **`CLAUDE.md`** — frontend route map names the six-step flow: HARNESS → IDENTITY → MODEL → **TOOLS** → DEPLOYMENT → REVIEW.

**Deviation:** Credential capture wired in the UI with `[ STASH WIRING IN PILLAR B PHASE 4.5 ]` notices; `ToolGrantInput.credential_storage_ref` sent empty until the BE secret-stash leg lands in Phase 4.5.

---

## 0.13.2 — v1.5 Pillar B Phase 3: Backend RPCs (ListTools / Grant / Curation) (2026-04-27)

Five Connect-go RPCs added to `ToolService`. `SetInstanceGrants` is atomic: scope validation runs pre-tx; inside the tx, revoke-all → insert × N → bump-manifest-version or full rollback. All operator-facing RPCs run under Supabase JWT. 20 new test cases (11 handler, 9 service). `go test ./...`, `go vet ./...`, `go build ./...`, `pnpm type-check`, lint, build all green.

- **`shared/proto/corellia/v1/tools.proto`** — five new RPCs: `ListTools` (catalog with `enabled_for_org` merged), `GetOrgToolCuration`, `SetOrgToolCuration` (org-admin only), `GetInstanceToolGrants`, `SetInstanceToolGrants`. New messages: `Tool`, `ToolGrant`, `ToolGrantInput`. `Tool.enabled_for_org` merges curation flag so FE needs no second round-trip. `ToolGrant.has_credential` (bool) — raw storage ref never crosses the wire (§11.6). `SetInstanceToolGrantsResponse.manifest_version` echoes post-write version for ETag-aware callers. Generated: `tools.pb.go` + `tools.connect.go` + TS equivalents.
- **`backend/queries/tools.sql`** — `GetAgentInstanceOrgGuard :one` added. Returns instance ID iff `(id, org_id)` matches; `pgx.ErrNoRows` on any mismatch — no cross-org 403/404 differential, matching M4 multi-tenancy posture.
- **`backend/internal/tools/transactor.go`** — new. `GrantsTx` interface (narrow tx surface: `RevokeAllActiveToolGrants` / `InsertInstanceToolGrant` / `BumpManifestVersion`). `Transactor` interface (`WithGrantsTx`). `PgxTransactor` production impl over `*pgxpool.Pool`; rollback errors logged at warn and dropped (consistent with `agents.PgxTransactor`).
- **`backend/internal/tools/errors.go`** — three new sentinels: `ErrInstanceNotForOrg` → `NotFound`, `ErrForbidden` → `PermissionDenied`, `ErrTransactorMissing` → `Internal`.
- **`backend/internal/tools/service.go`** — `NewService` gains options pattern (`WithTransactor`). Five new methods: `ListAvailableForOrg`, `SetOrgCuration`, `GetInstanceGrants`, `SetInstanceGrants` (scope validation pre-tx; revoke-all → insert × N → bump inside tx), plus `GrantInput` struct. `auditAppend` no-op stub planted at every write; Phase 7 fills it in mechanically.
- **`backend/internal/users/service.go`** — `CallerIdentityWithRole` added. Returns `(userID, orgID, role)` in one DB lookup for the `SetOrgToolCuration` admin gate.
- **`backend/internal/httpsrv/tools_handler.go`** — new. `ToolsHandler` implementing `ToolServiceHandler`: six methods (five Phase 3 + `GetToolManifest` stub; bearer-token plain handler in `tool_manifest.go` keeps owning that path via chi exact-route precedence). Each <30 LOC per §11.9. `SetOrgToolCuration` gate: `role == "admin"` literal (v1.5 single-role RBAC). `toolsErrToConnect` redacts unknown errors.
- **`backend/internal/httpsrv/server.go`** — `Deps.ToolsHandler` added, mounted inside `auth.Middleware` group.
- **`backend/cmd/api/main.go`** — `tools.NewService(queries, tools.WithTransactor(tools.NewPgxTransactor(pool)))`. `ToolsHandler: httpsrv.NewToolsHandler(toolsSvc, usersSvc)` added to `httpsrv.Deps`.
- **`frontend/src/lib/api/client.ts`** — `tools` Connect client added to `createApiClient()`.
- **`frontend/src/lib/api/tools.ts`** — new. Five thin RPC wrappers: `listTools`, `getOrgToolCuration`, `setOrgToolCuration`, `getInstanceToolGrants`, `setInstanceToolGrants`. Phase 4 wizard step, Phase 6 settings page, and Phase 7 fleet inspector consume them directly.
- **`backend/internal/httpsrv/tools_handler_test.go`** — new. 11 cases: happy paths, identity errors, invalid-argument paths, role gate (non-admin `SetOrgToolCuration` → `PermissionDenied`), sentinel mapping pins.
- **`backend/internal/tools/service_test.go`** — extended. `fakeTransactor` + 9 new cases: happy-path revoke+insert+bump, cross-org rejection, scope-validation-rejects-pre-tx atomicity pin, `ErrTransactorMissing`, `ErrCredentialMissing`, empty-grant-set valid, `GetInstanceGrants` org-guard, `SetOrgCuration` merged-row echo, `ListAvailableForOrg` empty-version resolution.

---

## 0.13.1 — v1.5 Pillar B Phase 2: Manifest Plumbing (Proto + Bearer-Token Endpoint + Adapter Integration) (2026-04-27)

**Migration applied to production:** `20260427160000_manifest_tokens.sql` — `agent_instance_manifest_tokens` table live. **Operator-gated:** `20260427170000_adapter_image_ref_bump_pillar_b_phase2.sql` (placeholder digest; run after GHCR image build + digest capture).

Control plane issues a per-instance bearer token at spawn time; adapter fetches its toolset grants at boot via `POST /corellia.v1.ToolService/GetToolManifest` and writes `$HERMES_HOME/config.yaml` atomically. ETag / HTTP 304 keeps re-boots cheap. Pre-Phase-2 agents (no `CORELLIA_TOOL_MANIFEST_URL` / `CORELLIA_INSTANCE_TOKEN`) skip the new entrypoint block entirely — boot path byte-equivalent to before. Adapter image rebuild is operator-gated. 6 new handler tests. `go test ./...`, `go vet ./...`, `go build ./...` green.

- **`shared/proto/corellia/v1/tools.proto`** — new. `ToolService` with `GetToolManifest` RPC. `ToolManifest`: `instance_id`, `adapter_version`, `toolsets` (`EquippedToolset[]`), `env` (always empty in Phase 2; Phase 7 populates for post-spawn credential edits), `manifest_version`. `EquippedToolset.scope` is `google.protobuf.Struct`. Generated: `tools.pb.go` + `tools.connect.go` + TS equivalents.
- **`backend/migrations/20260427160000_manifest_tokens.sql`** — `agent_instance_manifest_tokens`. PK: `agent_instance_id` (one active token per instance). `token_hash TEXT UNIQUE` (SHA-256 hex; raw token lives in Fly secrets only — §11.6). `manifest_version BIGINT DEFAULT 1`. `ON DELETE CASCADE` from `agent_instances`.
- **`backend/queries/manifest_tokens.sql`** — four queries: `InsertManifestToken`, `GetManifestTokenByHash`, `GetManifestTokenByInstance`, `BumpManifestVersion`. Generates `backend/internal/db/manifest_tokens.sql.go`.
- **`backend/internal/config/config.go`** — `CORELLIA_API_URL` optional (no `required` tag; empty = tools governance disabled, pre-Pillar-B behaviour preserved).
- **`backend/internal/tools/manifest.go`** — new. `IssueManifestToken` (32-byte `crypto/rand` → hex → store SHA-256). `AuthenticateManifestToken` (SHA-256 lookup → `ErrInvalidManifestToken` on miss). `BuildManifestForInstance` (reads grants → `ToolManifest` with `scope_json` → `*structpb.Struct`). `BumpManifestVersion` thin wrapper.
- **`backend/internal/httpsrv/tool_manifest.go`** — new. Plain `http.Handler` (not Connect-go — gives full HTTP control for ETag/304 without response-writer wrapping). Bearer-token auth. ETag = `"<manifestVersion>"`; `If-None-Match` match → 304. Stable wire types (`manifestResponseWire` etc.) independent of proto field numbering.
- **`backend/internal/httpsrv/server.go`** — `Deps.ToolManifestHandler http.Handler` mounted at `/corellia.v1.ToolService/GetToolManifest` **outside** `auth.Middleware` (bearer-token auth, not Supabase JWT). Nil = not registered.
- **`backend/internal/httpsrv/tool_manifest_test.go`** — new. 6 cases: missing token → 401, invalid token → 401, happy path → 200 + ETag + JSON body, `If-None-Match` match → 304, stale → 200 full body, build error → 500.
- **`backend/cmd/api/main.go`** — creates `tools.NewService`. If `CorelliaAPIURL != ""`: wires `WithManifestIssuer` + `NewToolManifestHandler`. Logs whether tools governance is active at startup.
- **`backend/internal/agents/service.go`** — `toolManifestIssuer` private interface + `WithManifestIssuer(issuer, baseURL)` option. In `Spawn`: issues token → injects `CORELLIA_INSTANCE_TOKEN` + `CORELLIA_TOOL_MANIFEST_URL` as Fly secrets. Failure is non-fatal (logged; agent spawns without tools governance).
- **`adapters/hermes/render_config.py`** — new (stdlib only; no pip install). Fetches manifest, installs plugin stub, writes `config.yaml` atomically via temp + rename if toolsets non-empty. Writes `.env` file if `env` map non-empty.
- **`adapters/hermes/entrypoint.sh`** — new block: if `CORELLIA_TOOL_MANIFEST_URL` + `CORELLIA_INSTANCE_TOKEN` set, runs `render_config.py` (stdout prefixed `[corellia-render-config]`; `|| true` keeps failures non-fatal).
- **`adapters/hermes/Dockerfile`** — two new `COPY`: `render_config.py → /corellia/` and `plugin/ → /corellia/plugin/`.
- **`adapters/hermes/plugin/corellia_guard/plugin.yaml`** — new stub (declares `hooks: [pre_tool_call]` for Hermes plugin discovery).
- **`adapters/hermes/plugin/corellia_guard/__init__.py`** — new stub (`register(ctx): pass`; no hooks registered; safe no-op).
- **`backend/migrations/20260427170000_adapter_image_ref_bump_pillar_b_phase2.sql`** — new, operator-gated. Fill `<IMAGE-DIGEST-PENDING>` after `docker buildx build --push adapters/hermes` + `imagetools inspect` digest capture; `adapter_image_ref_digest_pinned CHECK` will reject placeholder if run prematurely.

---

## 0.13.0 — v1.5 Pillar B Phase 1: Tools Governance Schema + Scope Validator + Service Foundation (2026-04-27)

**Migration applied to production:** `20260427150000_tools_governance.sql` — three tables + 19-row Hermes catalog seed live.

Foundation layer for v1.5 tools governance. Three DB tables, 8 sqlc queries, a pure `ValidateScope` function, 4 sentinel errors, and a `tools.Service` with 3 methods. 20 unit tests (14 scope-validator pure-logic, 6 service via fakes). No proto, frontend, or adapter changes in this phase. `go test ./internal/tools/...`, `go vet ./...`, `go build ./...` all green.

- **`adapters/hermes/catalog/toolsets.yaml`** — new. Canonical human-readable source for the Hermes toolset catalog: 19 toolsets (22 upstream minus 3 platform-restricted: `discord`, `discord_admin`, `messaging`), derived from `hermes_cli/tools_config.py` at digest `sha256:d4ee57f…ddd338` (`_config_version: 22`). `scope_shape` keys: `url_allowlist` (pattern_list), `command_allowlist` (regex_list), `path_allowlist` (pattern_list), `working_directory` (path). `spotify` flagged `oauth_only: true` (Phase 4 renders locked with v1.6 tooltip).
- **`backend/migrations/20260427150000_tools_governance.sql`** — three tables:
  - **`tools`** — PK UUID; natural key `UNIQUE (harness_adapter_id, toolset_key, adapter_version)` (digest bumps add rows without disturbing existing grant FKs). `scope_shape JSONB`, `required_env_vars TEXT[]`, `category CHECK ('info','compute','integration')`.
  - **`org_tool_curation`** — PK `(org_id, tool_id)`; absence of row = enabled. `curated_by` + `curated_at` lightweight audit.
  - **`agent_instance_tool_grants`** — partial unique index on `(agent_instance_id, tool_id) WHERE revoked_at IS NULL`. `credential_storage_ref TEXT NULL` (opaque Fly secret ref per §11.6). `ON DELETE CASCADE` from `agent_instances`.
  - Seed: 19 rows via `CROSS JOIN (VALUES …)` on `harness_adapters WHERE harness_name = 'hermes'`. `ON CONFLICT DO NOTHING` (idempotent re-run).
- **`backend/queries/tools.sql`** — new. 8 queries: `GetToolByID`, `ListToolsForHarness`, `ListOrgToolCuration`, `UpsertOrgToolCuration`, `ListInstanceToolGrants`, `InsertInstanceToolGrant`, `RevokeInstanceToolGrant`, `RevokeAllActiveToolGrants`. Generates `backend/internal/db/tools.sql.go` + model types `Tool`, `AgentInstanceToolGrant`, `OrgToolCuration`.
- **`backend/internal/tools/errors.go`** — new. Four sentinels: `ErrToolNotFound` → `NotFound`, `ErrToolNotAvailableForOrg` → `PermissionDenied`, `ErrInvalidScope` → `InvalidArgument`, `ErrCredentialMissing` → `InvalidArgument`.
- **`backend/internal/tools/scope_validator.go`** — new. `ValidateScope(scopeShape, scopeJSON json.RawMessage) error`, pure function, no DB dependency. Three field types: `pattern_list` (≤64 entries, ≤200 chars each, no empty strings; used for `url_allowlist` + `path_allowlist`), `regex_list` (≤64 entries, each must compile as Go `regexp`; used for `command_allowlist`), `path` (single string ≤200 chars; empty valid). Absent/null fields in `scopeJSON` silently skipped (default-deny enforced by Phase 5 plugin). Extra keys silently ignored (forward-compatible). Empty `scopeShape` always returns nil.
- **`backend/internal/tools/service.go`** — new. `Service` with three methods: `GetTool` (maps `pgx.ErrNoRows → ErrToolNotFound`), `ListToolsForHarness`, `ValidateScopeForTool`. Narrow `toolQueries` interface (widened in Phase 3).
- **`backend/internal/tools/service_test.go`** — new. 20 cases: 14 scope-validator (empty-shape nil for nil/`{}`/`null`; pattern_list valid / too-many / too-long / empty-string / absent-field-skipped; regex_list valid / invalid-regex / too-many / not-array; path valid / empty-valid / too-long / not-string; multiple fields; unknown-keys-ignored); 6 service via fake `toolQueries` (`GetTool` found/not-found; `ListToolsForHarness`; `ValidateScopeForTool` valid / invalid-scope / tool-not-found / empty-shape-passes).

---

## 0.12.6 — Spawn Redesign Post-Phase-5 Hardening: Carousel Canvas Overlay Self-Measures + Stale `<RosterCard>` JSDoc Cleanup + `<HarnessSlide>` `isActive` Contract Note (2026-04-27)

Post-ship hardening pass on the spawn redesign (Phases 1–5). Surfaced from a code-quality re-audit; no behaviour change for the operator. Three frontend files modified, one doc file updated. No proto, no migration, no sqlc, no backend. `pnpm -C frontend type-check` → 0 errors · `pnpm -C frontend lint` → 0 errors · `pnpm -C frontend build` → clean.

- **`frontend/src/components/spawn/harness-carousel.tsx`** — canvas overlay `top` is now measured at runtime instead of hard-coded as `top-[49px]`. Phase 3 positioned the `<NebulaAvatar>` overlay with a magic `top-[49px]` derived from `<HarnessSlide>`'s internal chrome (header `py-2 + text-sm + 1px border` ≈ 37 px + avatar-section `py-3` 12 px). That pinned the overlay to a constant defined in another file's Tailwind classes — any future change to slide header padding would silently slip the canvas off the avatar. Replaced with a `useLayoutEffect` that calls `getBoundingClientRect` on the first slide's avatar slot relative to the wrapper div and stores the offset in `overlayTopPx` state, applied as inline `style={{ top }}`. Resize listener attached for responsive cases. Overlay renders only after measurement (`overlayTopPx !== null`) to avoid a one-frame flash at `top: 0`. The first slide doubles as the layout probe (`avatarSlotRef={idx === 0 ? probeSlotRef : undefined}`); since every slide shares the same chrome, one probe is enough. `useLayoutEffect` import added.
- **`frontend/src/components/spawn/harness-slide.tsx`** — accepts an optional `avatarSlotRef?: Ref<HTMLDivElement>` and threads it onto the avatar slot div. The slide itself doesn't measure anything; the prop just exposes the slot to the carousel for measurement. JSDoc updated to make the `isActive` contract explicit (it only controls SELECT-button `tabIndex`; the carousel reads it for `aria-current` but does not vary slide chrome) — a Phase-3 deviation from plan that was load-bearing but only previously documented in `docs/completions/redesign-spawn-phase-3.md`.
- **`frontend/src/components/spawn/wizard.tsx`** — `GalleryWizardShell` JSDoc rewritten to reflect post-Phase-2 reality: deleted `<RosterCard>` references, named `<HarnessCarousel>` + `router.replace` as the active navigation path, called out the back-button-history rationale for `replace` over `push`. Phase 1's "Phase 2 will replace the grid" forward-looking comment is now obsolete — replaced with the actual current state.
- **`frontend/src/app/(app)/spawn/page.tsx`** — page-header JSDoc updated for the same reason: the `<RosterCard>` Link and "vertical grid" framing both predated Phases 2–3. Now describes the carousel + reduced-motion grid fallback and the `router.replace` flow accurately.
- **`frontend/src/lib/spawn/harnesses.ts`** — one-line JSDoc on `HarnessEntry.status` retargeted from `<RosterCard>` (deleted Phase 2) to `<HarnessSlide>`.

### Why now

- The `top-[49px]` constant was the only fragility flagged in the post-Phase-5 audit. Touching it now (vs. waiting for the first slide-chrome change to break it visually) costs three lines and removes a class of silent regression.
- Three stale JSDoc references to `<RosterCard>` had survived Phases 2–5 because the component was deleted but the prose around its old call sites wasn't re-read. They didn't break code but they sent future readers (and the next code-reviewer agent) chasing a deleted symbol.
- `<HarnessSlide>`'s `isActive` semantics — narrow by design (Phase 3 chose the fixed-overlay route, so `isActive` doesn't drive avatar swap) — were only documented in the completion notes. Inlined into the component JSDoc so anyone editing the slide reads the constraint at the point of change.

### What did NOT change

- Reducer + Zod schemas + RPC contract — byte-identical to Phase 5.
- `<DeploymentConfigForm>` + `labelOverrides` — unchanged. Fleet inspector + bulk-apply still render canonical labels.
- `<NebulaAvatar>`, `<NebulaScene>`, palette lerp — unchanged.
- `<CharacterSheet>`, `<ReadyToLaunch>` — unchanged.
- Visual output of the carousel overlay — `getBoundingClientRect` on first paint returns the same 49 px the magic constant encoded, so pixel-perfect parity with 0.12.5.
- `prefers-reduced-motion` and WebGL fallback paths — unchanged (overlay isn't mounted in either case, so the measurement never runs).

### LOC delta

- `harness-carousel.tsx` ≈ +25 (probe ref + `useLayoutEffect` + measurement-gated render).
- `harness-slide.tsx` ≈ +15 (Ref import + prop + JSDoc).
- `wizard.tsx` / `spawn/page.tsx` / `harnesses.ts` ≈ −20 / +20 (JSDoc rewrites).

Net 0.12.6: **≈ +40 LOC**, all in component bodies + JSDoc; no new dependencies.

### Verdict

Spawn redesign Phases 1–5 are now production-ready: type-check, lint, build are green; the only structural fragility is removed; stale prose is reconciled. Phase 6 (live integration smoke with real Fly token + real Hermes adapter) remains an operator task, unaffected by this hardening.

---

## 0.12.5 — Spawn Redesign Phase 5: Compact Step-1 Confirmed Pane + design-system §33.5 / §34.5 Reconciliation (2026-04-27)

Polish + cleanup pass. One file modified (`wizard.tsx`), two doc files updated (`docs/refs/design-system.md`, `docs/changelog.md`). No proto, no migration, no sqlc, no backend. `pnpm -C frontend type-check` → 0 errors · `pnpm -C frontend lint` → 0 errors · `pnpm -C frontend build` → clean.

- **`frontend/src/components/spawn/wizard.tsx`** — `HarnessStep` gains a `isConfirmed && !isCurrent` early-return branch rendering a compact horizontal row card (per redesign-spawn.md §3 note 2): 56 px `<NebulaAvatar>` + harness display name + a single inline spec line (`adapter · hand-written · deploy · fly.io`). The full 180 px portrait + description + spec table is preserved for the `isCurrent` branch (e.g. when the operator hits `[ EDIT ]` on Step 1 to swap harnesses, the full surface returns). The 56 px avatar size keeps the live nebula cheap (smaller texture, smaller mesh) on the wizard's confirmed-and-cascading-down view, where the canvas is one of three live nebulas across the wizard's lifetime (Step 1 confirmed pane → Step 2 preview → Step 5 portrait, sequenced).

- **`docs/refs/design-system.md` §33.5** — rewritten from "two-routes" framing to "one wizard mounted at two URLs":
  - `/spawn` = wizard in *gallery mode* (carousel Step 1, inert Steps 2–5).
  - `/spawn/[templateId]` = wizard in *confirmed mode* (compact Step 1, active Step 2).
  - Single `<Wizard>` component, single `getInitialState(mode)` factory.
  - Selecting a harness routes via `router.replace` (history-clean).
  - One-canvas-per-page invariant restated: carousel overlay is fixed (never inside a slide); Steps 2 + 5 each mount their own avatar, sequenced so exactly one `<canvas>` is live at any moment across the wizard's lifetime.
  - Palette + accent transitions documented (lerp formula, "shape stays shared" decision 5).
  - Vocabulary: `[ SELECT YOUR HARNESS ]` (gallery) / `[ LAUNCHPAD // CONFIGURE ]` (confirmed); locked slides render `[ LOCKED ]` overlay + `disabled` button.

- **`docs/refs/design-system.md` §34.5** (new) — gallery a11y contract:
  - Keyboard table for the carousel container (`←/→`, `Home/End`, numeric `1–6` jump, Tab order through `[prev → container → SELECT → next]`).
  - Roles + labels (`role="region" aria-label="Select your harness"`; per-slide `role="group" aria-roledescription="harness"`; `aria-current="true"` on centred slide; `aria-disabled` on locked SELECT).
  - `prefers-reduced-motion: reduce` collapses to a static `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` grid; nebula overlay not mounted; palette transitions moot.
  - WebGL ceiling: cascade drops to `<AvatarFallback>` for the gallery overlay + Step 2 preview + Step 5 portrait when `WebGL2RenderingContext` is unavailable; carousel itself has no fallback (scroll-snap + IO universally available in supported browsers).

### Cleanup audit

The plan called for "remove the now-orphaned roster grid layout helpers from `spawn/page.tsx`." Phase 1 already deleted these (`RosterCardSlot`, `RosterSkeleton`, `RosterGrid` were removed when `spawn/page.tsx` collapsed to `<Wizard initialMode="gallery" />`). Re-audited in Phase 5: nothing else lingers — `spawn/page.tsx` is a 6-line server component, `spawn/[templateId]/page.tsx` is a 6-line server component, and no other call sites import from `spawn/`-prefixed roster helpers.

`<RosterCard>` was deleted in Phase 2; `<DeployModal>` was deleted in 0.9.2; the M4 "agents catalog" redirect shim was deleted in 0.9.2. No dead code remains in the spawn surface.

### What did NOT change

- Wizard reducer + Zod schemas + RPC wiring — byte-identical to Phase 4.
- `<DeploymentConfigForm>` — unchanged from Phase 4 (still accepts `labelOverrides`; fleet inspector + bulk-apply continue to render canonical labels).
- `<HarnessCarousel>`, `<HarnessSlide>`, `<NebulaAvatar>`, `<NebulaScene>` — unchanged from Phase 3.
- §34.1 step accents, §34.2 acknowledgement pattern, §34.3 READY TO LAUNCH spec, §34.4 Spawn-N deferral note — unchanged.

### Phase 6 entry points

Live integration smoke (per the plan): `overmind start`, walk `/spawn` → carousel swipe → confirm → callsign → faction → loadout → review → deploy with a real Fly token + real Hermes adapter. Verify keyboard, touch (Safari iOS), `prefers-reduced-motion`, deep-link `/spawn/{templateId}` lands at Step 2.

---

## 0.12.4 — Spawn Redesign Phase 4: Steps 2–5 RPG Reskin (Callsign Card / Faction × Class / Loadout / Character Sheet + READY TO LAUNCH) (2026-04-27)

Frontend only. Two new files, three modified; no proto change, no migration, no sqlc, no backend change. `pnpm -C frontend type-check` → 0 errors · `pnpm -C frontend lint` → 0 errors · `pnpm -C frontend build` → clean.

Re-flavours Steps 2–5 of the spawn wizard from a vertical-form posture to an RPG character-creation register without touching reducer state, Zod schemas, RPC contract, or the shared `<DeploymentConfigForm>`'s field topology. Reskin is presentation + an additive `labelOverrides` prop on the shared form.

- **`frontend/src/components/spawn/ready-to-launch.tsx`** (new, ~55 LOC) — full-width green-bordered §34.3 panel for Step 5's commit moment. Header strip (`[ READY TO LAUNCH ]` kicker + `STAND BY FOR DEPLOY` right-side label) above the body; body holds summary copy, embedded `<PlacementBanner>`, and the deploy button. CTA: `<Button size="lg">` (`h-10 px-4 text-sm`, the largest variant in the project's button vocabulary) + `font-display uppercase tracking-widest`. Placement gating accepted as a `blocked: boolean` prop — the placement-check effect stays in `ReviewStep` where it owns the cancellation guard; the panel is presentational.

- **`frontend/src/components/spawn/character-sheet.tsx`** (new, ~120 LOC) — Step 5's portrait + 3-column stat block. Portrait: 180 px live `<NebulaAvatar>` + agent callsign in `text-3xl font-display uppercase` + harness display name as `font-mono text-xs` subtitle. Stat block: `grid-cols-1 md:grid-cols-3`, three columns with 2 px top borders coloured by inline `style={{ borderTopColor: hsl(var(<accent>)) }}` from a `--feature-*` CSS variable: IDENTITY = `--feature-secrets` (rose), INTELLIGENCE = `--feature-adapter` (violet), LOADOUT = `--feature-deploy` (blue) — same accents `STEP_META` uses for the wizard's terminal-container chrome, so Step 5 visually re-summarises the journey. Local `<dl>` chrome (not the shared `<SpecRow>`) so values can `flex-1 break-all` and wrap inside the column rather than forcing it wide.

- **`frontend/src/components/fleet/deployment-config-form.tsx`** — additive `labelOverrides?: DeploymentLabelOverrides` prop. Two new exports: `DeploymentLabelKey` union (region | size | volumeSizeGb | desiredReplicas | restartPolicy | lifecycleMode | chatEnabled) and `DeploymentLabelOverrides = Partial<Record<…, string>>`. Form root resolves each section's label via `labelFor(key, fallback)` returning `labelOverrides?.[key] ?? fallback`. Each field component (RegionField / SizeField / VolumeField / ReplicasField / RestartField / LifecycleField / ChatEnabledField) gained a `label: string` prop and threads it into its `<Label>`. **Default behaviour unchanged**: callers omitting `labelOverrides` (fleet inspector, bulk-apply modal) get the same canonical English labels as before.

- **`frontend/src/components/spawn/wizard.tsx`** — render-branch edits per step:
  - **Step 2 IDENTITY (callsign card)** — `IdentityForm` now takes `harness: HarnessEntry | undefined`. Layout: 64 px `<NebulaAvatar>` left, hero callsign input right. Hero input is a raw `<input>` (not the shared `<Input>`, which carries box-border chrome that fights the spec) with `border-0 border-b border-border/60 bg-transparent px-0 py-2 font-display text-2xl uppercase tracking-widest`; on focus the underline switches to `hsl(var(--feature-secrets))`. Rotating ghost-text placeholder via `useRotatingPlaceholder(["obi-1", "bb-9", "kessel-runner"])` — 2.4 s `setInterval` cycling the placeholder; values never become the field's value, so Zod's `min(1)` validation stays honest. Below the input: an `OPERATOR LABEL · <UPPERCASE-LIVE-NAME>` echo row + error slot. Confirmed summary row relabelled `NAME` → `CALLSIGN`.
  - **Step 3 MODEL (faction × class)** — rewritten around three new helpers: `PROVIDER_FACTIONS` data (`Record<ProviderValue, { glyph, tagline, modelExample }>` — Α / Ω / ✦; "Careful and considered." / "Generalist with reach." / "Any model, any provider."; `claude-opus-4-7` / `gpt-5` / `meta-llama/llama-4-405b-instruct`); `<FactionPicker>` (radiogroup over three button-cards, active card full opacity + `border-[hsl(var(--feature-adapter))]`, inactive cards `opacity-40` lifting on hover); `<SigilField>` (`[ PROVIDE YOUR SIGIL ]` kicker + `KeyIcon` glyph in `--feature-secrets`, masked input + show/hide pattern preserved verbatim). Class hero input mirrors Step 2's underline treatment at `text-xl tracking-wider`; placeholder + hint reflect the selected faction's `modelExample` reactively via `useWatch`. Confirmed summary rows: PROVIDER / MODEL / API KEY → FACTION / CLASS / SIGIL. Old `Field`, `ProviderField`, `ApiKeyField` helpers (~60 LOC) deleted; imports trimmed (`Label` + the `Select*` family no longer imported).
  - **Step 4 DEPLOYMENT (loadout panel)** — wraps the shared form with a `[ LOADOUT ]` kicker (`text-[hsl(var(--feature-deploy))]`), reframed intro copy ("Equip the agent. Theatre and armor lock at deploy; …"), and `LOADOUT_LABEL_OVERRIDES = { region: "[ THEATRE ]", size: "[ ARMOR ]", volumeSizeGb: "[ SUPPLY ]", desiredReplicas: "[ SQUAD ]", restartPolicy: "[ DOCTRINE ]", lifecycleMode: "[ MODE ]" }` passed as `labelOverrides`. `chatEnabled` left canonical inside the loadout. Fleet inspector + bulk-apply unchanged (omit the prop).
  - **Step 5 REVIEW** — `ReviewStep` now composes `<CharacterSheet>` + `<ReadyToLaunch>` instead of an inline `<dl>` and a small ghost button. Three `StatRow[]` arrays built locally (identityRows / intelligenceRows / loadoutRows) and handed to the sheet. The placement-check `useEffect` and its cancellation guard remain in `ReviewStep`; only rendering moved out. `<ReadyToLaunch>` renders only when `isCurrent` (the confirmed-not-current branch shows the sheet without the launch panel, matching pre-Phase-4 behaviour-on-edit). Synthesised summary string ("Deploying spins up one Fly machine in <region>…" / "Deploying spins up N Fly machines in <region>…") built once and passed as a prop.

### Deviations from plan

**`chatEnabled` carried into `DeploymentLabelKey` for type totality.** Plan named six labels for the loadout reflavour. The key was added to the union so future loadout extensions can override it without a type-level change; the wizard does not override it today (canonical "Chat" label renders inside the loadout). Zero behavioural impact on either call site.

**Hero callsign / class inputs use raw `<input>`, not `<Input>`.** Shared `<Input>` carries box-border chrome that conflicts with "hairline underline only (no box border)". Wrapping `<Input>` and stripping its border via Tailwind would fight the cascade; dropping to a raw `<input>` with the same a11y attributes is cleaner.

**`<Button size="lg">` for the deploy CTA, not a custom large size.** Project's button vocabulary defines `lg` (h-10 px-4 text-sm) as the largest variant. Plan called for "a large `› DEPLOY AGENT` CTA"; introducing a new `xl` variant for one callsite would be plan-creep.

**One-canvas-per-page invariant honoured by sequencing.** Steps 1, 2, and 5 each mount a `<NebulaAvatar>`. They are never co-mounted: Step 1's gallery canvas unmounts on harness select; Step 2's 64 px preview unmounts when the operator confirms identity (the form unmounts and the `ConfirmedSummary` renders); Step 5's 180 px portrait mounts only on Review. At any moment, exactly one `<canvas>` is live on `/spawn/[templateId]`.

### LOC delta

- New: `ready-to-launch.tsx` (~55) + `character-sheet.tsx` (~120) ≈ +175
- Modified: `wizard.tsx` (Steps 2–5 reskin + delete `Field` / `ProviderField` / `ApiKeyField`) ≈ +120 net
- Modified: `deployment-config-form.tsx` (`labelOverrides` plumbing) ≈ +20

Net Phase 4: **≈ +315 LOC**, against the plan's estimate of ~250.

### Phase 5 entry points

- `HarnessStep` confirmed-pane compact card (plan §3 note 2).
- `docs/refs/design-system.md` §33.5 reconciliation (collapse to wizard-with-gallery-step), new §34.5 (gallery a11y contract).
- Changelog entries (this version + 0.12.5).

---

## 0.12.3 — Spawn Redesign Phase 3: Live `<NebulaAvatar>` Carousel Overlay + Palette Crossfade (2026-04-27)

Frontend only (TypeScript). Three files modified; no proto change, no migration, no sqlc, no backend change. `pnpm -C frontend type-check` → 0 errors · `pnpm -C frontend lint` → 0 errors.

Adds a live nebula canvas fixed over the active carousel slide and wires palette crossfade to the active harness. The canvas is a single long-lived overlay anchored to the scroll container's wrapper div — never mounted inside a slide — so swipe gestures cause no canvas remounts.

- **`frontend/src/components/spawn/nebula-scene.tsx`** — `PrimaryCloud` gains an optional `targetPalette?: MoodPalette` prop. A `useFrame` callback lerps every palette-derived uniform toward `targetPalette` each frame using the frame-rate-independent formula `α = 1 - exp(-delta * 8)` (~87 ms half-life, visually converged at ≈400 ms at 60 fps). When `targetPalette` is omitted the lerp target falls back to `palette` and the per-frame update is a no-op — behaviour is byte-identical to before Phase 3. Uniforms lerped: `uPearl` (Vector3), `uTint0–3` (Vector3 × 4), `uTintFreq` (Vector4), `uTintIntensity` (Vector4), `uSpatialWeights` (Vector3). `CoreMotes` is unchanged (no palette uniforms). Allocation avoidance: two `useRef` scratch objects (`_s3: Vector3`, `_s4: Vector4`) are mutated in-place each frame instead of constructing `new Vector3/4(...)` on every tick. Stale-closure fix: the `targetRef` read by the `useFrame` closure is kept in sync via `useLayoutEffect` — synchronous after React's commit phase and before the next `requestAnimationFrame`/`useFrame` fires, so the ref is always current. `NebulaScene` default export forwards `targetPalette?: MoodPalette` through to `PrimaryCloud`.

- **`frontend/src/components/spawn/nebula-avatar.tsx`** — gains `targetHarness?: HarnessKey`. When defined, computes `targetPalette = paletteFor(targetHarness)` and passes it down to `<NebulaScene>`. All existing logic (reduced-motion guard, WebGL detection, lazy IO mount) is unchanged. Typical consumer: `<NebulaAvatar harness={harnesses[0].key} targetHarness={activeKey} size={240} />` — `harness` sets the initial palette at canvas construction; `targetHarness` is the lerp destination and updates on each swipe.

- **`frontend/src/components/spawn/harness-carousel.tsx`** — adds a `position: absolute` `<NebulaAvatar>` overlay anchored to the scroll container's `relative` wrapper div, not inside any slide's DOM. All six `<HarnessSlide>` components continue to render `<AvatarFallback>` as a layout placeholder. Positioning: `absolute left-1/2 -translate-x-1/2 top-[49px]` places the canvas top edge at the `<AvatarFallback>` SVG's top — `top-[49px]` = card header height (~37 px: `py-2` 16 px + `text-sm` 20 px line-height + 1 px border) + avatar-section `py-3` top padding (12 px). `pointer-events-none` on the overlay preserves click-through to the SELECT button below. The overlay passes `harness={harnesses[0].key}` as a stable initial palette (never changes across the carousel's lifetime; canvas is never remounted) and `targetHarness={activeKey as HarnessKey}` as the lerp destination, updated on every IO-confirmed slide change.

### Deviations from plan

**`prefers-reduced-motion` instant-cut mode skipped.** `HarnessCarousel` already collapses to a static grid under reduced motion, so the canvas overlay is never mounted — there is no palette transition to cut. Adding a `reduceMotion` prop to force `α = 1.0` would be unreachable in practice; deferred as a non-issue for Phase 3.

**`harness-slide.tsx` not modified.** The plan listed adding `isActive`-conditional `<NebulaAvatar>` inside each slide. The plan's own risk note supersedes this: the fixed-overlay approach avoids canvas mount/unmount on every swipe. `isActive` remains used for `tabIndex` control only (Phase 2 intent preserved).

### Phase 4 entry points

- **Peek effect** (plan §3 note 3, Phase 2 deferral): change slide wrapper from `w-full` to `w-[85%]`; add `scroll-padding-inline: 7.5%` on the container. Canvas overlay width stays 240 px — `left-1/2` centres it on the full-width container midpoint, which coincides with a symmetric 85%-width slide midpoint. Validate on Safari iOS after the change.
- **Steps 2–5 RPG reskin** (plan Phase 4): starts at `wizard.tsx` render branches and new `character-sheet.tsx` / `ready-to-launch.tsx` components; no nebula or carousel changes needed.

---

## 0.12.2 — Spawn Redesign Phase 2: `<HarnessCarousel>` + `<HarnessSlide>` + `roster-card.tsx` Deleted (2026-04-27)

Frontend only (TypeScript). Two files added, one deleted, one modified; no proto change, no migration, no sqlc, no backend change. `pnpm -C frontend type-check` → 0 errors · `pnpm -C frontend lint` → 0 errors.

Replaces the Phase 1 static roster grid inside `GalleryWizardShell` with a horizontal scroll-snap carousel. The atomic harness card is now `<HarnessSlide>`; `<RosterCard>` is deleted.

- **`frontend/src/components/spawn/harness-slide.tsx`** (new) — atomic card primitive for one harness entry. Props: `harness: HarnessEntry`, `template?: AgentTemplate` (undefined = locked), `isActive: boolean`, `onSelect: (templateId: string) => void`. Active slides expose the `› SELECT` button at `tabIndex={0}`; inactive slides set `tabIndex={-1}` so the Tab order is always exactly one button. Locked treatment: `[ LOCKED ]` overlay (absolute-positioned over the avatar area), `disabled` + `aria-disabled` on the button (rendered but inert), 70% opacity on the whole card. Spec-sheet rows mirror the old `<RosterCard>` split: available → `HARNESS / ADAPTER / DEPLOY`; locked → `VENDOR / STATUS / ETA`. No `<NebulaAvatar>` in Phase 2 — all slides use `<AvatarFallback>`. The `isActive` prop is already threaded so Phase 3 can overlay the canvas without touching the slide's internal structure.

- **`frontend/src/components/spawn/harness-carousel.tsx`** (new) — horizontal scroll-snap carousel (no new dependencies; CSS scroll-snap + `IntersectionObserver` + ~175 LOC). Key implementation decisions:
  - **Layout:** `scroll-snap-type: x mandatory` container; slide wrappers are `w-full flex-shrink-0 scroll-snap-align: center`. Full-width slides in Phase 2; peek geometry (`w-[85%]` + `scroll-padding-inline`) lands in Phase 3 alongside the nebula overlay.
  - **Active-slide tracking:** `IntersectionObserver` with `root = container` and `threshold = 0.5`. The centred slide is the sole entry ≥ 50% intersecting the container viewport; this is the source of truth rather than scroll position, which diverges on Safari iOS < 16 with certain snap configurations. `scroll-snap-stop: always` and `overscroll-behavior-x: contain` added for cross-browser safety.
  - **Navigation:** prev/next `<button>` elements (disabled at endpoints, 40% opacity); keyboard on the scroll container (`tabIndex={0}`) — `ArrowLeft / Right` move ±1, `Home / End` jump to endpoints, `1–6` jump to slide by number; dot indicators are decorative / mouse-only (`aria-hidden` on the container, `tabIndex={-1}` on each dot).
  - **a11y:** outer `<section role="region" aria-label="Select your harness">`; each slide wrapper carries `role="group" aria-roledescription="harness"` and `aria-current="true"` on the active slide. Tab order: `[prev]` → `[scroll container]` → `[active SELECT button]` → `[next]`.
  - **`prefers-reduced-motion` fallback:** inline `useReducedMotion` hook (no external dep). When true, renders the same `grid-cols-1 / md:grid-cols-2 / xl:grid-cols-3` grid as Phase 1 — all slides at once, no scroll-snap. Initial state is read via a `useState` lazy initializer (`typeof window !== "undefined" && window.matchMedia(...)`) to satisfy the project's `react-hooks/set-state-in-effect` lint rule.

- **`frontend/src/components/spawn/roster-card.tsx`** (deleted) — superseded by `<HarnessSlide>`. The Phase 1 import in `wizard.tsx` is replaced by `<HarnessCarousel>`.

- **`frontend/src/components/spawn/wizard.tsx`** (modified, three changes):
  1. `import { RosterCard }` → `import { HarnessCarousel }`.
  2. `GalleryWizardShell` gains `useState<string>` for `activeKey` and `useRouter` for `router.replace`; replaces the `<GalleryHarnessStep>` call with `<HarnessCarousel harnesses={HARNESSES} templates={templates} activeKey={activeKey} onActiveChange={setActiveKey} onSelect={...} />`. The `onSelect` callback calls `router.replace(\`/spawn/${templateId}\`)`, remounting the Wizard in `confirmed` mode with Step 1 pre-confirmed. `useState<string>` is explicit because `useState(HARNESSES[0].key)` infers the narrow `HarnessKey` union, which is incompatible with `onActiveChange: (key: string) => void`.
  3. `GalleryHarnessStep` function deleted (the Phase 1 placeholder grid; `HarnessCarousel`'s reduced-motion branch serves the same role).

### Deviations from plan

**Peek effect deferred to Phase 3.** Decision 2 calls for sub-100%-width slides so adjacent slides peek. Deferred because it couples naturally with the nebula overlay (both touch the slide-wrapper width and the canvas's absolute bounds), the static `<AvatarFallback>` peek is less compelling than the live nebula peek, and full-width slides have fewer Safari snap quirks. Phase 3 entry point: change each slide wrapper from `w-full` to `w-[85%]` and add `scroll-padding-inline: 7.5%` to the container — no other structural change needed.

### LOC delta

−167 (`roster-card.tsx`) + ~130 (`harness-slide.tsx`) + ~175 (`harness-carousel.tsx`) = **net +138**.

### Phase 3 entry points

- **`HarnessSlide`** — avatar section already `position: relative`. Phase 3 overlays a `<NebulaAvatar>` canvas as a `position: absolute` sibling inside `HarnessCarousel`, driven by `isActive`.
- **`HarnessCarousel`** — add `targetPalette` prop; wire `activeKey → debounced palette change` into the nebula overlay.
- **`nebula-scene.tsx`** — add optional `targetPalette` prop; `useFrame` lerps palette uniforms toward target at `1 - exp(-dt * 8)`.
- **Slide width** — `w-full` → `w-[85%]` on slide wrapper; add `scroll-padding-inline` on container. Validate on Safari iOS.

---

## 0.12.1 — Global Type-Scale Bump: `html font-size 17px` + Chrome Label / Card Text Increases (2026-04-27)

Frontend only. Five files touched; no proto change, no migration, no backend change. `pnpm -C frontend type-check` → 0 errors.

All text across the dashboard was reading small. Two complementary fixes:

1. **`frontend/src/app/globals.css`** — `html { font-size: 17px }` added to `@layer base`. Lifts every `rem`-based Tailwind class (`text-xs`, `text-sm`, `text-base`, …) ~6% without touching individual callsites. Nav items, form labels, wizard body text, and any other `rem`-sized element benefit automatically.

2. **Hardcoded `px` sizes bumped** (these are immune to the root-font change):
   - `app-sidebar.tsx` — `[ MODULES ]` section label and "Soon" badge: `text-[10px]` → `text-[11px]`.
   - `app-top-bar.tsx` — `[ WORKSPACE ]` / `[ UTC ]` bracket labels: `text-[10px]` → `text-[11px]`; workspace name and clock: `text-xs` → `text-sm`; avatar fallback and email: `text-[10px]` → `text-xs`; dropdown items: `text-xs` → `text-sm`.
   - `harness-slide.tsx` — card title: `text-xs` → `text-sm`; status badge: `text-[10px]` → `text-[11px]`; description: `text-xs` → `text-sm`; spec-sheet values: `text-[11px]` → `text-xs`; spec-sheet labels: `text-[10px]` → `text-[11px]`.
   - `wizard.tsx` — `[ SELECT YOUR HARNESS ]` gallery sub-label: `text-[11px]` → `text-xs`.

Net result: minimum visible text rises from 10 px → 11 px; card descriptions from 12 px → ~14 px (`text-sm` at the 17 px root); all rem-scaled chrome nudges up uniformly.

---

## 0.12.0 — Spawn Redesign Phase 1: Wizard Reducer `harnessMode` + `getInitialState(mode)` + `GalleryWizardShell` + `spawn/page.tsx` Server Component (2026-04-27)

Frontend only (TypeScript). Three files changed; no new files created. No proto change, no migration, no sqlc, no backend change. `pnpm -C frontend type-check` → 0 errors · `pnpm -C frontend lint` → 0 errors.

- **`frontend/src/app/(app)/spawn/page.tsx`** (rewritten) — converted from a `"use client"` component that fetched templates itself and rendered a standalone `<RosterGrid>` to a server component that delegates everything to `<Wizard initialMode="gallery" />`. The old header copy (`[ LAUNCHPAD ]`, `N AVAILABLE`, `M LOCKED`), loading skeleton, and `RosterCardSlot` / `RosterSkeleton` / `RosterGrid` helpers are deleted; their responsibilities move into `GalleryWizardShell` inside `wizard.tsx`.
- **`frontend/src/app/(app)/spawn/[templateId]/page.tsx`** (one-liner) — adds `initialMode="confirmed"` to `<Wizard templateId={templateId} />`. Still a server component that awaits async params; no structural change.
- **`frontend/src/components/spawn/wizard.tsx`** (extended) — five additions:
  1. **`WizardState.harnessMode`** (`"gallery" | "confirmed"`) — new field persisted in the reducer so downstream phases can interrogate harness-selection state without inspecting the URL.
  2. **`getInitialState(mode)`** — replaces the zero-arg `initialState()` factory; accepted as the `init` parameter of `useReducer`. `gallery` → `{ current: "harness", confirmed: new Set(), harnessMode: "gallery" }`; `confirmed` → `{ current: "identity", confirmed: new Set(["harness"]), harnessMode: "confirmed" }`. Both route paths call the same factory, eliminating drift between the two mount paths.
  3. **`FetchState`** gains `{ kind: "ready-gallery"; templates: AgentTemplate[] }` — gallery fetch stores all templates. An early `if (fetchState.kind === "ready-gallery")` branch in `Wizard` renders `<GalleryWizardShell>` before the confirmed-mode deploy-check and step-render logic, keeping the two modes cleanly separated.
  4. **`GalleryWizardShell`** (new) — gallery-mode page shell. Header shows `[ SELECT YOUR HARNESS ]`. Step 1 is a `<TerminalContainer meta="ACTIVE">` wrapping `<GalleryHarnessStep>`; Steps 2–5 are `pointer-events-none opacity-40 inert` `<TerminalContainer meta="PENDING">` shells so the operator sees the full wizard shape before selecting a harness.
  5. **`GalleryHarnessStep`** (new) — roster grid inside Step 1. Joins `templates` against `HARNESSES` by `name.toLowerCase() === harness.key`; renders `<RosterCard kind="active">` for matches and `<RosterCard kind="locked">` otherwise. Harness selection navigates via the existing `<Link href={/spawn/${template.id}}>` inside `<RosterCard>`, remounting the Wizard at `/spawn/[templateId]` with `initialMode="confirmed"`. `roster-card.tsx` is not deleted in Phase 1.

### Routing after Phase 1

| URL | Renders |
|-----|---------|
| `/spawn` | `[ SELECT YOUR HARNESS ]` — Step 1 active with harness cards; Steps 2–5 inert shells |
| `/spawn/{templateId}` | Step 1 pre-confirmed, Step 2 (identity form) active |

Deep-linking `/spawn/{templateId}` is unchanged in behavior: the operator lands directly at Step 2. Step 1 is now pre-confirmed (harness selection happened in the gallery) rather than requiring an explicit `› CONFIRM` click.

### Phase 2 entry points

- `GalleryWizardShell` — swap `<GalleryHarnessStep>` for `<HarnessCarousel>`; add `selectHarness(templateId)` callback wiring `router.replace` + optional reducer dispatch.
- `GalleryHarnessStep` and `roster-card.tsx` — deleted in Phase 2 once the carousel's `<HarnessSlide>` absorbs their role.
- `nebula-scene.tsx` — Phase 3: add optional `targetPalette` prop for palette crossfade on carousel swipe.

---

## 0.11.10 — `BulkUpdateDeployConfig` Correctness: `errgroup.Wait()` Error Propagation + Context-Cancellation Test (Code Assessment §2.1) (2026-04-27)

Backend only (Go). Two-line fix + one new test. No proto change, no migration, no sqlc, no FE change. `go vet ./...` + `go test ./...` green. Surfaced by the 2026-04-27 code assessment (`docs/executing/code-assessment-2026-04-27.md §2.1`); applied as a post-assessment patch and retroactively documented here.

- **`backend/internal/agents/fleet.go:497`** — `g.Wait()` return value was discarded (`_ = g.Wait()` / bare call). When the caller's context was cancelled, `sem.Acquire(gctx, 1)` returned the context error; that error propagated up through the errgroup but was silently dropped, causing `BulkUpdateDeployConfig` to return `(results, nil)` with some `results[i]` zero-valued because their `applyBulkOne` goroutines were never invoked. Fix: `if err := g.Wait(); err != nil { return results, err }`. Returning `results` alongside the error preserves any partial-progress already recorded in populated slots, so the handler layer can still render "N applied, M cancelled" from the partial slice.
- **`backend/internal/agents/service_test.go:1313`** — `TestBulkUpdateDeployConfig_ContextCancellation`: constructs a pre-cancelled context, calls `BulkUpdateDeployConfig` with three instance IDs, asserts the returned error is non-nil. Closes the regression path for the discard pattern.

### Why this matters

The bulk-apply pattern intentionally uses per-row `BulkResult.Err` so a single failed instance does not abort the batch — that design is correct and unchanged. But discarding `g.Wait()` also discarded the errgroup-level signal: context cancellation (parent timeout, client disconnect, server shutdown) returned `nil` as if the batch had completed cleanly, with silent zero-value entries for un-attempted rows. The fix makes context cancellation observable without changing the partial-failure semantics.

---

## 0.11.9 — M-chat Post-Operator-Gate P1 Polish: Sidecar Stub Fail-Fast + Honest `/health` + Schema Hardening + Smoke Negative Paths + Probe-Timeout Bump + 401-Drain (2026-04-27)

Eight P1-polish fixes from the post-0.11.8 deep-review pass. No proto change, no migration, no sqlc, no Fly push, no adapter image rebuild — but the sidecar source delta means the next adapter image rebuild (likely bundled with the next M-chat enhancement) will include these. `go vet ./... && go test ./...` green; `python3 -c 'import ast; ast.parse(...)'` + `bash -n` clean on all touched scripts.

- **`backend/migrations/20260427140000_document_hermes_adapter_digest_history.sql`** (new) — additive no-op migration that seals the digest-history conversation the prior `20260427130000_bump_hermes_adapter_for_chat.sql` left ambiguous. The applied migration's leading `<IMAGE-DIGEST-PENDING>` operator-instruction block reads as if line 39 were still unfilled, but line 39 is filled and prod applied the row on `Sun Apr 26 17:23:48 2026`. An in-place comment scrub was attempted and reverted on principle (applied migrations are immutable history; mutating one diverges fresh-environment `goose up` from the file prod recorded). The new file is purely additive: a `SELECT 1 WHERE FALSE` no-op body, with a 30-line header recording the M3 Phase 2 digest (`sha256:d152b3cb…`), the M-chat Phase 7 digest (`sha256:e31cc422…`), the buildx-imagetools capture provenance, and the prod-apply timestamp. Future readers walking migrations in chronological order see a sealed digest history at this point. Operator: `goose up` is safe (the no-op records the row; nothing in the schema or data changes). Operator gate per the 0.11.8 verification: this migration is appropriate to run against prod alongside any other deploy; it changes no state.
- **`adapters/hermes/sidecar/sidecar.py`** — five edits in one rewrite of the schema/health/boot surface:
  1. **Stub-AIAgent prod fail-fast.** New `CORELLIA_SIDECAR_ALLOW_STUB` env var (default unset → false). When `AIAGENT_AVAILABLE=False` AND `ALLOW_STUB!="true"`, the sidecar `raise SystemExit(...)` at module-import time with a diagnostic message pointing at the upstream-digest pin. Closes the silent-stub-in-prod escape valve flagged in the 8.5/10 review.
  2. **Honest `/health`.** When the upstream `from run_agent import AIAgent` failed (the new gate above would normally kill the process, but ALLOW_STUB=true smoke runs reach `/health`), `/health` now returns `{ok: false, hermes: "missing"}` instead of always `{ok: true, hermes: "ready"}`. Phase 6 BE interprets `ok=false` as `HealthStarting`, which keeps the sidecar from lying its way through a health probe. Hermes-process probing remains future work — the sidecar can verify the import seam, not the sibling Hermes process.
  3. **`session_id` regex validation.** Pydantic `Field(..., pattern=r"^[A-Za-z0-9_-]+$")` rejects path-traversal and control chars at the schema boundary; `session_id` ultimately lands as `$HERMES_HOME/sessions/<id>.sqlite`, and refusing dirty inputs at our layer is cheaper than trusting upstream's filename hygiene.
  4. **`message` `max_length=65536`.** 64 KiB cap on the chat input so a runaway POST is rejected without buffering arbitrary bytes through Starlette.
  5. **`adapters/hermes/sidecar/smoke.sh`** — adds `-e CORELLIA_SIDECAR_ALLOW_STUB=true` to the `docker run` env. The Phase 1 smoke explicitly tests the FastAPI shape, not Hermes itself; the stub branch is the legitimate test path here, and the new boot gate would otherwise refuse to boot in this scenario.
- **`adapters/hermes/smoke.sh`** — Fly-side smoke gains three negative-path probes before the happy-path `/chat` assertion: missing-bearer → 401, wrong-bearer → 401, `/tools/invoke` → 501. The happy-path assertion swaps `grep -q '"content"'` for `jq -e '.content | type == "string" and length > 0'` so a `{"detail":"missing content"}` or `{"content":""}` body fails loudly; smoke now fails up-front with an install hint if `jq` isn't available.
- **`backend/internal/agents/service.go`** — new `pollProbeTimeout = 5 * time.Second` constant; `pollHealth`'s per-probe `context.WithTimeout` switches from `pollInterval` (2s) to `pollProbeTimeout`. The 2s budget was tight enough that a cold sidecar's TLS handshake + JSON decode against an external host frequently surfaced as `HealthUnknown` and burned probe slots; 5s leaves room without overlapping probes (extra ticker fires queue and the stdlib drops them).
- **`backend/internal/agents/chat.go`** — drain `resp.Body` (`io.Copy(io.Discard, io.LimitReader(resp.Body, 1<<20))`) before the early-return on 401 and on other non-2xx, so the underlying connection can be reused from `http.Client`'s pool. Minor — only matters under sustained 401/5xx — but free.

### Verification

- `cd backend && go vet ./...` clean.
- `cd backend && go test ./...` green (agents, deploy, httpsrv, users).
- `python3 -c 'import ast; ast.parse(...)'` for `sidecar.py` clean.
- `bash -n adapters/hermes/smoke.sh` + `bash -n adapters/hermes/sidecar/smoke.sh` clean.
- `pnpm -C frontend type-check && pnpm -C frontend lint && pnpm -C frontend build` unchanged from 0.11.8 (no FE delta this version).

### Acknowledged-as-future (intentionally not in 0.11.9)

- **Hermes-process probe inside `/health`.** The sidecar can verify the AIAgent import (above); probing whether Hermes-the-process is responsive requires either an HTTP probe to Hermes's own port or a side-channel mechanism. Out of scope for this polish pass; needs a sidecar source change + adapter image rebuild + migration.
- **Boot-time `show_secrets` scope probe.** Phase 4's known risk (Fly token must permit `read_secret_values`). The 0.11.8 verification confirms the live token has the scope (otherwise no chat call would have succeeded), but a one-line boot probe in `cmd/api` would catch a future scope downgrade earlier than the first user-facing chat call. Cheap to add when the next M-chat-adjacent change touches `cmd/api`.

### Why this matters

0.11.7 closed the user-facing footguns; 0.11.8 verified the operator gate; 0.11.9 closes the smaller, deeper hygiene items the deep-review pass surfaced. M-chat is now ship-quality at the 9/10 bar: defense-in-depth on the schema (regex + max-length), honest readiness signals, no stub escape valve, proper smoke coverage, and connection-pool friendly error paths.

---

## 0.11.8 — M-chat Phase 7 Operator-Gate Verification: GHCR Push + Migration Confirmed Applied (2026-04-27)

Verification-only entry — zero code change. Closes the two ⏳ Operator-gated items from `docs/completions/hermes-chat-sidecar-phase-7.md`.

- **GHCR push confirmed.** `curl -sI https://ghcr.io/v2/hejijunhao/corellia-hermes-adapter/manifests/sha256:e31cc422c6e9c98200e1afae8abb99ef1256b12dc0b1d09802d1f878c9516441` returns `HTTP/2 401` with `www-authenticate: Bearer realm="https://ghcr.io/token", scope="repository:hejijunhao/corellia-hermes-adapter:pull"` — repository exists, manifest is reachable, image was pushed.
- **Migration applied to prod DB.** `goose status` shows `20260427130000_bump_hermes_adapter_for_chat.sql` applied at `Sun Apr 26 17:23:48 2026`. The `harness_adapters.adapter_image_ref` row for `hermes` now pins to `sha256:e31cc422…`. Newly-spawned agents from Phase 7 onward use the sidecar-capable image.
- **End-to-end Fly smoke (`./adapters/hermes/smoke.sh`):** not separately recorded in commits/changelog; the captured GHCR digest (which only `docker buildx imagetools inspect` post-push produces) and the operator's choice to apply the migration immediately after both imply the smoke ran successfully, but no log artefact survives. Re-runnable on demand.

## 0.11.7 — M-chat Post-Review Hardening: Inspector `chatEnabled` Lock-as-Read-Only + Chat-Panel Double-Enter Guard + ARIA + Error Remediation Hints (2026-04-27)

Frontend + a one-liner backend audit comment. No proto change, no migration, no sqlc, no Fly push, no adapter image rebuild. Triggered by a multi-agent code review of the M-chat milestone (0.11.0–0.11.6) that flagged one P0 + one P1 + four P2s; this entry closes them all bar two acknowledged-as-future items (Hermes-readiness gate in `/health`, `mergeMachineConfig` services-block toggle on Update). `pnpm -C frontend type-check` + `pnpm -C frontend lint` clean; `cd backend && go vet ./... && go test ./internal/agents/...` green. Phase 7 (operator gate: image push + digest fill + migration + smoke) is unaffected and runs in parallel.

- **`frontend/src/components/fleet/deployment-config-form.tsx`** (P0 fix) — `DeploymentConfigForm` gains `lockedFields?: ReadonlyArray<keyof DeploymentFormValues>`. `ChatEnabledField` accepts a `locked?: boolean` prop: when locked, the checkbox renders disabled, the label appends `(currently on)` / `(currently off)` so the value stays observable, and the prose hint swaps to "Chat enablement maps to a Fly services-block change that the live-update path doesn't apply. To toggle chat, destroy and respawn this agent with the new setting." The wizard does not pass `lockedFields`, so spawn-time editing is unchanged.
- **`frontend/src/components/fleet/deployment-inspector.tsx`** (P0 fix) — `EditPane` now passes `lockedFields={["chatEnabled"]}` to the shared form. Inline comment documents the rationale: a flipped DB column without a corresponding Fly services-block add/remove silently corrupts the running machine, violating blueprint §11.4. Operators see the current value in read-only form and are pointed at destroy + respawn.
- **`frontend/src/components/fleet/chat-panel.tsx`** (P1 + P2 fixes) — six changes in one rewrite:
  1. **Double-Enter guard (P1):** new `inFlightRef = useRef(false)` flips synchronously at the top of `handleSend` and resets in a `finally`. Two Enter presses within a single render frame previously both observed `chatState.kind === "idle"` (state-batched) and queued duplicate RPCs; the ref-based guard de-dupes immediately. The existing `disabled={chatState.kind === "sending"}` on the button still gates clicks; the ref covers the keyboard-fast-path race.
  2. **Scroll-to-bottom timing (P2):** `useEffect` now schedules `scrollIntoView` via `requestAnimationFrame` (with paired `cancelAnimationFrame` cleanup), so the scroll lands on the next paint after the new bubble has laid out — closes the one-frame race noted in review without paying the SSR-warning cost of `useLayoutEffect`.
  3. **ARIA (P2):** outer container gains `role="region"` + `aria-label="Chat conversation"`; the message list gains `role="log"` + `aria-live="polite"` + `aria-relevant="additions"` + `aria-busy={chatState.kind === "sending"}`; the typing-indicator bubble carries `aria-label="Agent is typing"`; the error block carries `role="alert"`; the textarea gains `aria-label="Chat message"`; the send button gains `aria-label="Send message"`. Brings the panel up to WCAG 2.1 Level AA chat-pattern shape.
  4. **Error remediation hints (P2):** `ChatState` now carries the `Code` from `ConnectError.from(e).code`; new `chatHint(code)` helper maps `FailedPrecondition → "Chat is disabled on this agent. Destroy and respawn with the Enable chat checkbox to use chat."`, `Unavailable → "The agent's chat sidecar isn't reachable. Check that the machine is running and try again in a moment."`, `Internal → "Server-side configuration drift. The agent may need to be respawned to refresh its sidecar token."`. Hints render in muted-foreground beneath the destructive error line, so the user always has a next-step affordance without losing the underlying message.
  5. **Session lifecycle tooltip (P2):** the `session · <8-char>` chip in the header gains a `title` attribute: `"Per-tab session. Closing this tab ends the conversation; reopening starts a fresh one."` Closes the lifecycle-semantics gap noted in review without adding chrome.
  6. Imports refreshed: `Code` added from `@connectrpc/connect`; `useRef` added (was already imported); no new dependencies.
- **`backend/internal/agents/chat.go`** (P2 audit) — line ~106: `slog.Error` call site for `GetAppSecret` failure now passes `err.Error()` (string) instead of `err` (interface); preceded by an explicit audit comment confirming that `fly-go`'s flaps client wraps HTTP API errors *without* including secret values, so the operator-side log is safe by audit. The FE path returned the generic `ErrChatUnreachable` either way; this change is defence-in-depth on the operator log surface.

### Acknowledged-as-future (intentionally not addressed in 0.11.7)

- **Hermes-readiness gate inside the sidecar's `/health`.** Today the sidecar returns `{ok: true, hermes: "ready"}` immediately on startup without probing Hermes. Phase 6 backend already interprets `{ok: false}` as `HealthStarting` and `{ok: true}` as `HealthStarted`, so the contract on the BE side is correct; the signal becomes semantically complete the moment the sidecar pings Hermes before answering. Sidecar-source change; lives outside this hardening pass.
- **`mergeMachineConfig` services-block toggle on Update.** With the inspector now locking `chatEnabled`, this is no longer a footgun — it's a missing capability. Reaching parity with the wizard (so chat can be toggled live) is a post-M-chat backend feature; until it lands, the inspector's lock + respawn affordance is the safe steady state.

### Verification

- `pnpm -C frontend type-check` → 0 errors
- `pnpm -C frontend lint` → 0 errors
- `cd backend && go vet ./...` → clean
- `cd backend && go test ./internal/agents/...` → `ok  github.com/hejijunhao/corellia/backend/internal/agents  0.335s`

### Why this matters

The M-chat code-review pass surfaced a single live-prod footgun (the inspector's free-text `chatEnabled` toggle, which would have flipped the DB column on Update without ever adding the Fly services block — every chat call against that agent would surface `ErrChatUnreachable` until destroy + respawn). 0.11.7 closes that hole + the surrounding polish gaps in one sweep so the M-chat surface lands in prod at the 9/10 quality bar the review targeted.

---

## 0.11.6 — M-chat Hermes Chat Sidecar Phase 7: Adapter Image Rebuild + GHCR Push + Migration + Smoke (M-chat Complete) (2026-04-27)

Operator-collaboration + code. One new migration (`20260427130000_bump_hermes_adapter_for_chat.sql`) with a `<IMAGE-DIGEST-PENDING>` placeholder that is filled in after the multi-arch buildx push; `smoke.sh` fully rewritten to add `--port 443:8642/tcp:http:tls`, stage `CORELLIA_CHAT_ENABLED` + `CORELLIA_SIDECAR_AUTH_TOKEN`, poll `GET /health`, and probe `POST /chat` with the per-smoke bearer token. Four doc reconciliations: `adapters/hermes/README.md` Known Limitations §1 closed out; `adapters/hermes/README.md` Smoke section updated; `docs/blueprints/adapter-image-blueprint.md` runtime-contract and smoke descriptions updated; `docs/refs/fly-commands.md` `--port` entry updated. Zero Go, TS, proto, sqlc, or existing-migration changes — this phase is infrastructure-only. The migration's `+goose Down` reverts to the pre-M-chat adapter digest (`sha256:d152b3cb…`). M-chat milestone (0.11.x) is complete upon operator running the docker buildx push, filling in the digest, and executing `goose up` + `./adapters/hermes/smoke.sh`.

- **`backend/migrations/20260427130000_bump_hermes_adapter_for_chat.sql`** (new) — `UPDATE harness_adapters SET adapter_image_ref = 'ghcr.io/hejijunhao/corellia-hermes-adapter@sha256:e31cc422c6e9c98200e1afae8abb99ef1256b12dc0b1d09802d1f878c9516441' WHERE harness_name = 'hermes'`. Inline operator instructions for the buildx push + `docker buildx imagetools inspect` digest capture. The `adapter_image_ref_digest_pinned` CHECK constraint (`LIKE '%@sha256:%'`) will reject the placeholder value intentionally — running `goose up` with the literal placeholder serves as an operator gate. `+goose Down` reverts to `sha256:d152b3cb…`.
- **`adapters/hermes/smoke.sh`** (rewritten) — removes the M3-era "no /health, no --port" header caveat (that limitation is now closed). Adds `CORELLIA_CHAT_ENABLED=true` + `CORELLIA_SIDECAR_AUTH_TOKEN=$(openssl rand -hex 32)` to the staged secrets block. Adds `--port 443:8642/tcp:http:tls` to `fly machines run`. Adds a `/health` probe loop (up to 60s, retries every 2s, asserts `{"ok":true}`). Adds a `/chat` probe (`POST /chat`, 30s timeout, bearer token from the per-smoke `SIDECAR_TOKEN`, asserts `{"content":...}`). Machine-state poll + log dump retained.
- **`adapters/hermes/README.md`** — Known Limitations §1 rewritten: "No Corellia-shaped HTTP runtime contract" struck through, replaced with summary of what M-chat Phases 1–2 built (sidecar.py, two-process entrypoint, services block). Smoke section updated to list the three probes. Pinning section gains an adapter-image history table showing M3 and M-chat digests.
- **`docs/blueprints/adapter-image-blueprint.md`** — "CLI-shaped: no /health" updated to acknowledge the M-chat sidecar fills this gap; "Runtime and Metadata are partially bridged" updated to say Runtime is now bridged for chat-enabled instances. Smoke section's "No /health poll. Hermes 0.x is CLI-shaped" replaced with the post-Phase-7 three-probe description.
- **`docs/refs/fly-commands.md`** — `--port` entry updated from "M4: not used, v1.5+" to accurate M-chat usage: `-p 443:8642/tcp:http:tls` for chat-enabled spawns; chat-disabled spawns still omit the flag.

### Operator exit gate

```sh
# 1. Build and push the M-chat adapter image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/hejijunhao/corellia-hermes-adapter:v2026-04-27-mchat \
  --push adapters/hermes

# 2. Capture the manifest-list digest
docker buildx imagetools inspect \
  ghcr.io/hejijunhao/corellia-hermes-adapter:v2026-04-27-mchat \
  | grep "Digest:" | head -1
# → Digest: sha256:<64-char-hex>

# 3. Fill in the migration and smoke.sh IMAGE line with the real digest,
#    replacing every occurrence of <IMAGE-DIGEST-PENDING>

# 4. Run the migration
goose -dir backend/migrations postgres "$DATABASE_URL_DIRECT" up

# 5. Run the smoke test
export FLY_ORG_SLUG=<your-org-slug>
export CORELLIA_SMOKE_API_KEY=sk-or-v1-<key>
./adapters/hermes/smoke.sh
```

---

## 0.11.5 — M-chat Hermes Chat Sidecar Phase 6: `Health()` HTTP Probe for Chat-Enabled Instances + List Query Widened + Fleet Gallery Chat Badge (2026-04-27)

Backend only (Go + SQL) plus a one-line FE badge and a comment fix. `Health()` signature widened across the deploy package and all six service-layer call sites; `ListAgentInstancesByOrg` widened in SQL + sqlc regen; six new deploy tests; chat badge added to `agent-card.tsx`. No proto change, no new RPC, no Fly push, no adapter image rebuild. `go vet ./...` + `go build ./...` + `go test ./...` green. `sqlc generate` clean. `pnpm -C frontend type-check` + `pnpm -C frontend lint` clean. Six new tests: `TestHealth_ChatDisabled_MachineStatePoll` (4 sub-cases), `TestHealth_ChatEnabled_HttpOkTrue`, `TestHealth_ChatEnabled_HttpOkFalse`, `TestHealth_ChatEnabled_Non200`, `TestHealth_ChatEnabled_TransportError`, `TestHealth_ChatEnabled_BadExternalRef`.

- **`backend/internal/deploy/target.go`** — `HealthHTTPClient` interface (`Do(*http.Request) (*http.Response, error)`) defined in the `deploy` package so `FlyDeployTarget` can hold it without importing `agents` — no import cycle. `*http.Client` satisfies it out of the box. `DeployTarget.Health()` signature widened to `Health(ctx context.Context, externalRef string, chatEnabled bool) (HealthStatus, error)`.
- **`backend/internal/deploy/fly.go`** — `FlyDeployTarget` struct gains `healthHTTP HealthHTTPClient`; `NewFlyDeployTarget` sets it to `&http.Client{Timeout: 10 * time.Second}` (bounded; 10s is short enough to detect a non-responsive machine within a single 2s poll interval). `Health()` refactored into three functions: `Health()` dispatches on `chatEnabled`; `machineStateHealth(ctx, externalRef)` is the pre-M-chat Fly machine-state poll extracted verbatim — chat-disabled path, byte-equivalent behavior; `httpHealthProbe(ctx, externalRef)` sends GET `https://<app>.fly.dev/health` (unauthenticated — the sidecar exempts `/health` from bearer auth per Phase 1 design; Fly health probes cannot carry a bearer token). HTTP probe response semantics: transport error → `HealthUnknown, nil` (keep polling); non-200 → `HealthFailed`; 200 + `{"ok": true}` → `HealthStarted`; 200 + `{"ok": false}` → `HealthStarting` (Hermes still booting; plan risk-7 grace period); JSON parse failure → `HealthFailed`.
- **`backend/internal/deploy/stubs.go`** — `LocalDeployTarget.Health()` and `AWSDeployTarget.Health()` signatures widened; bodies unchanged, both return `(HealthUnknown, ErrNotImplemented)` per blueprint §11.4.
- **`backend/internal/agents/service.go`** — `pollHealth` signature widened to `(instanceID uuid.UUID, target deploy.DeployTarget, externalRef string, chatEnabled bool)`; the probe closure forwards `chatEnabled` to `target.Health`. `Spawn` call site updated to `go s.pollHealth(instance.ID, deployer, result.ExternalRef, cfg.ChatEnabled)`. `toProtoInstanceListRow` gains `ChatEnabled: r.ChatEnabled` (now available after the `ListAgentInstancesByOrgRow` widening below).
- **`backend/internal/agents/fleet.go`** — six `pollHealth` call sites updated to pass `row.ChatEnabled` as the fourth argument. `row` is `db.GetAgentInstanceByIDRow` at all six sites, which has carried `ChatEnabled bool` since Phase 3's sqlc widening.
- **`backend/cmd/smoke-deploy/main.go`** — `target.Health(ctx, res.ExternalRef)` → `target.Health(ctx, res.ExternalRef, false)`. Smoke-deploy spawns chat-disabled agents; `false` preserves the machine-state poll behavior.
- **`backend/internal/agents/service_test.go`** — `fakeDeployTarget.Health` signature updated to `Health(_ context.Context, _ string, _ bool)`.
- **`backend/queries/agent_instances.sql` + sqlc regen** — `ListAgentInstancesByOrg` gains `ai.chat_enabled` in its SELECT projection. `sqlc generate` regenerated `internal/db/agent_instances.sql.go` and `internal/db/models.go`: `ListAgentInstancesByOrgRow.ChatEnabled bool` now present and scanned.
- **`backend/internal/deploy/fly_test.go`** — `httpClientFake` (`HealthHTTPClient` fake returning canned `(*http.Response, error)` pairs) + `fakeHTTPResp(status, body)` helper. Six new tests (see opening summary). `TestHealth_ChatDisabled_MachineStatePoll` sub-cases assert `healthHTTP` is nil throughout — the machine-state and HTTP-probe branches must not cross-contaminate.
- **`frontend/src/components/fleet/agent-card.tsx`** — gallery cards show a small `chat` badge (hairline border, `feature-adapter` palette tint, 9px mono) in the card header when `instance.chatEnabled` is true. Now reliable: `ListAgentInstancesByOrg` carries `chat_enabled` after the sqlc widening in this phase.
- **`frontend/src/components/fleet/deployment-inspector.tsx`** — `deploymentValuesFromInstance` comment updated: the `?? true` guard is now a TS strictness guard (the list query supplies the real value), no longer a "Phase 6 pending" note.

### Deviations from plan

- **Machine-state poll extracted into `machineStateHealth`, not inlined in `Health()`.** The original body is 30+ LOC; inlining would make `Health()` ≥60 LOC. Named helpers are individually testable — `machineStateHealth` by the chat-disabled suite, `httpHealthProbe` by the chat-enabled suite — consistent with the Phase 4 `chatURL` / `chatSidecarServices` extraction philosophy.
- **`/health` probe is unauthenticated (plan text said "with the bearer token").** Phase 1 explicitly exempts `/health` from bearer auth: Fly health probes cannot carry a token, and an authenticated `/health` would cause every probe to 401. The plan's bearer-token reference was contextual, not prescriptive for the probe request itself.
- **`healthHTTP` is a struct field, not a functional option.** Deploy tests construct `FlyDeployTarget` directly via `newFlyTargetForTest`, so a `WithHealthHTTPClient` option would have no test consumers. Direct field assignment is the simpler shape; no exported `DefaultHealthHTTPClient` name needed.

### Known pending work

- **"Requires respawn" warning in the inspector's `ChatEnabledField`.** Toggling `chat_enabled` via the inspector updates the DB column but doesn't add/remove the Fly `services` block (`mergeMachineConfig` doesn't handle that yet). Adding a client-side gate without a working backend path would be a non-functional UI element (blueprint §11.4 violation in spirit). Deferred until `mergeMachineConfig` grows the services-block toggle.
- **Hermes-readiness gate in `/health`.** The sidecar currently answers `{ok: true, hermes: "ready"}` immediately on startup without probing Hermes. Phase 6 backend correctly interprets `{ok: false}` as `HealthStarting` and `{ok: true}` as `HealthStarted`; the distinction becomes semantically accurate once Phase 7 ships a sidecar that pings Hermes before returning `ok: true`.
- **Phase 7 operator gate.** All backend + FE work for M-chat is complete (Phases 3–6). Phase 7 is the adapter image rebuild (`docker buildx build && docker push`), `goose up`, and end-to-end smoke proving the full Phases 1–7 stack against a real Fly agent with the sidecar running.

---

## 0.11.4 — M-chat Hermes Chat Sidecar Phase 5: `ChatWithAgent` RPC + Handler + FE Chat Panel + Instance-Detail Page (2026-04-27)

Proto + BE handler + FE. One new Connect RPC, two new frontend files (`chat-panel.tsx`, `fleet/[id]/page.tsx`), targeted edits across six existing files. No domain-method change — Phase 4 wired `ChatWithAgent`; this phase wires it to the Connect layer and the browser. No migration, no sqlc, no Fly push, no adapter image rebuild. `go vet ./...` + `go build ./...` + `go test ./...` green. `pnpm proto:generate` clean. `pnpm -C frontend type-check` + `pnpm -C frontend lint` clean. Six new test cases: `TestChatWithAgent_SentinelMapping` (4 table cases: `ErrChatDisabled → FailedPrecondition`, `ErrChatUnreachable → Unavailable`, `ErrChatAuth → Internal`, `ErrInstanceNotFound → NotFound`), `TestChatWithAgent_HappyPath`, `TestChatWithAgent_BadInstanceID`.

- **`shared/proto/corellia/v1/agents.proto`** — `rpc ChatWithAgent(ChatWithAgentRequest) returns (ChatWithAgentResponse)` added to `AgentsService`. `ChatWithAgentRequest { instance_id, session_id, message }` — minimal unary turn; `session_id` is client-generated per plan decision 3. `ChatWithAgentResponse { content }`. `DeployConfig.chat_enabled bool = 10` — carries the wizard's "Enable chat" checkbox on the wire; zero value is `false`, wizard default is `true` (plan decision 6). `AgentInstance.chat_enabled bool = 24` — populated on the Get path via Phase 3's `GetAgentInstanceByIDRow.ChatEnabled`; left at `false` on the List path until Phase 6 widens `ListAgentInstancesByOrg`. Both generated trees (`backend/internal/gen/` + `frontend/src/gen/`) regenerated and committed.
- **`backend/internal/httpsrv/agents_handler.go`** — `agentsService` interface gains `ChatWithAgent(ctx, instanceID, orgID uuid.UUID, sessionID, message string) (string, error)`. `(*AgentsHandler).ChatWithAgent` handler: 21 LOC, within the <30-LOC budget per blueprint §11.9 — parses instance UUID, calls `svc.ChatWithAgent`, marshals `content`. `agentsErrToConnect` gains three new cases: `ErrChatDisabled → FailedPrecondition` (operator must enable chat first), `ErrChatUnreachable → Unavailable` (sidecar down / transport failure), `ErrChatAuth → Internal` with redacted message + `slog.Error` (Corellia-side token drift; not a user error). `deployConfigFromProto` gains `ChatEnabled: p.GetChatEnabled()` so the wizard checkbox flows through to `agents.Spawn`.
- **`backend/internal/agents/service.go`** — `toProtoInstanceGetRow` gains `ChatEnabled: r.ChatEnabled` to populate field 24 on the Get path. `toProtoInstanceListRow` is unchanged — its DB row (`ListAgentInstancesByOrgRow`) doesn't carry `chat_enabled` yet; Phase 6 widens that query.
- **`backend/internal/httpsrv/agents_handler_test.go`** — `fakeAgentsSvc` gains `chatContent string`, `chatErr error`, and `ChatWithAgent`. Six new test cases across `TestChatWithAgent_SentinelMapping` (table-driven), `TestChatWithAgent_HappyPath` (content forwarded verbatim), and `TestChatWithAgent_BadInstanceID` (malformed UUID → NotFound before service call).
- **`frontend/src/lib/spawn/deployment-presets.ts`** — `DeploymentConfigValues` and `DEFAULT_DEPLOYMENT_VALUES` gain `chatEnabled: boolean` (default `true` per plan decision 6).
- **`frontend/src/components/fleet/deployment-config-form.tsx`** — `deploymentConfigSchema` and `DeploymentFormValues` gain `chatEnabled`. **`ChatEnabledField`** component: checkbox + prose hint rendered after `LifecycleField`. Consumed by both the wizard's Step 4 and the fleet inspector's edit pane — one edit picks up both surfaces (see deviation §1).
- **`frontend/src/components/spawn/wizard.tsx`** — `deployConfigFromFields` gains `chatEnabled: d.chatEnabled` so the proto `DeployConfig.chat_enabled` field is populated on every `spawnAgent` call. `deploymentSummaryRows` gains `{ label: "CHAT", value: d.chatEnabled ? "enabled" : "disabled" }` so Step 4's confirmed summary and Step 5's review row reflect the setting.
- **`frontend/src/components/fleet/deployment-inspector.tsx`** — `deploymentValuesFromInstance` gains `chatEnabled: i.chatEnabled ?? true` (fallback `true` matches the migration DEFAULT; the list query leaves the field at `false` until Phase 6, so `?? true` is the right optimistic sentinel). `deployConfigFromValues` gains `chatEnabled: v.chatEnabled`.
- **`frontend/src/components/fleet/chat-panel.tsx`** (new) — `<ChatPanel instanceId>`: message list, textarea input, "› SEND" button. `useSessionId(instanceId)` reads/writes from `sessionStorage` keyed `corellia:chat-session:<instanceId>`, generated fresh on first mount, cleared on tab close (plan Q4). Enter sends; Shift+Enter newlines. Scroll-to-bottom after each message via ref + `scrollIntoView`. Three UI states: `idle`, `sending` (animated ellipsis bubble — streaming-ready visually; replacing the unary RPC with streaming in v1.6 is a transport swap, not a UI rewrite), `error` (red message via `ConnectError.from(e)`).
- **`frontend/src/app/(app)/fleet/[id]/page.tsx`** (new) — instance-detail client component. Loads via `GetAgentInstance` RPC. Identity block in a `<TerminalContainer>`: STATUS, PROVIDER, MODEL, REGION, SIZE, REPLICAS, CREATED, CHAT labels; `<AgentRowActions>` bar below. Chat-enabled branch: `<TerminalContainer title="CHAT // HERMES" accent="adapter">` at 480px wrapping `<ChatPanel instanceId>`. Chat-disabled branch: affordance paragraph + "→ spawn a chat-enabled agent" link to `/spawn`. Breadcrumb: `← fleet / <name>`.
- **`frontend/src/app/(app)/fleet/page.tsx` + `frontend/src/components/fleet/agent-card.tsx`** — agent name is now a `<Link href={/fleet/${id}}>` in both list and gallery views, making the detail page reachable from the fleet surface (see deviation §3).

### Deviations from plan

- **`ChatEnabledField` is a plain `<input type="checkbox">`, not a shadcn `<Switch>`.** The mission-control visual register favors explicit toggles; a labeled checkbox is clearer for an opt-in capability gate. Swap to `<Switch>` is a one-liner if operator feedback calls for it.
- **`ListAgentInstancesByOrg` not widened in Phase 5.** The `/fleet/[id]` detail page loads via `GetAgentInstance` (which already returns `chat_enabled`), so the gallery and list don't need the field to render the detail link. The `?? true` fallback in `deploymentValuesFromInstance` covers the interim. Phase 6 widens the list query.
- **Fleet list: link on name only, not the whole row.** Keeps the per-row checkbox + action affordances from competing with navigation. Gallery card also links the name `<h2>` only, consistent with the compact action row occupying the footer.

### Known pending work

- **`ListAgentInstancesByOrg` widened for `chat_enabled`.** Phase 6 widens the SQL query, sqlc regeneration, and `toProtoInstanceListRow` — needed for the fleet gallery's chat badge and the `Health()` HTTP-probe switch.
- **`ChatEnabledField` in the inspector has no "requires respawn" gate.** Toggling chat off→on via the inspector updates the DB column but does not add the Fly `services` block — `mergeMachineConfig` doesn't inject it on Update. Phase 6 adds the warning / respawn prompt. The checkbox is surfaced now so operators can see the setting; applying the change safely requires the gate.
- **Live validation blocked until Phase 7.** The chat panel renders correctly and the RPC wires cleanly, but `ChatWithAgent` will return `ErrChatUnreachable` until the Phase 2 sidecar-capable adapter image is the live image. Phase 7 owns image push + migration + end-to-end smoke.

---

## 0.11.3 — M-chat Hermes Chat Sidecar Phase 4: `ChatWithAgent` Domain Method (GetAppSecret Interface + Bearer-Proxy + 12 New Tests) (2026-04-27)

Backend only (Go). One new file (`agents/chat.go`), five modified Go files across the `agents/` and `deploy/` packages. Zero proto change, zero FE change, zero migration, zero sqlc, zero Fly push, zero adapter image rebuild. `ChatWithAgent` is domain-complete — callable and fully test-green — but has no Connect handler yet; that's Phase 5. `go vet ./...` + `go build ./...` + `go test ./...` all green. Twelve new tests: `TestGetAppSecret_ReturnsValue`, `TestGetAppSecret_EmptyValueReturnsEmpty`, `TestGetAppSecret_BadExternalRef` (deploy package) and `TestChatWithAgent_HappyPath`, `TestChatWithAgent_ChatDisabled`, `TestChatWithAgent_InstanceNotFound`, `TestChatWithAgent_PendingNoExternalRef`, `TestChatWithAgent_SecretEmptyIsAuthFailure`, `TestChatWithAgent_SecretReadError`, `TestChatWithAgent_Sidecar401`, `TestChatWithAgent_TransportError`, `TestChatWithAgent_Sidecar5xx` (agents package).

- **`backend/internal/agents/chat.go`** (new, ~165 LOC) — `ChatWithAgent(ctx, instanceID, orgID, sessionID, message) (string, error)`. Call order: instance load with org-guard → `chat_enabled` gate → external-ref gate (pending instances with no Fly app surface `ErrInstanceNotFound`) → `GetAppSecret` read of `CORELLIA_SIDECAR_AUTH_TOKEN` → `chatURL(externalRef)` → bearer-attached `http.NewRequestWithContext` POST to `/chat` → `io.LimitReader(resp.Body, 1<<20)` response cap → status-mapped sentinel return. `chatURL` builds `https://<app>.fly.dev/chat` from the external ref, mirroring the existing `logsURL` helper — both live in `agents/` per the blueprint §11.1 trade-off documented in the deviations below. Bearer header is set as plain string concat (`"Bearer "+token`) to keep the token off any format-args slice. `io.LimitReader` at 1 MiB caps against a runaway sidecar response body without clipping any realistic model output. Compile-time `var _ ChatHTTPClient = (*http.Client)(nil)` catches future interface drift silently.
- **`backend/internal/deploy/target.go`** — `DeployTarget` interface gains `GetAppSecret(ctx, externalRef, key string) (string, error)`. Returns the plaintext value of an app-level secret previously set via `SetAppSecret`. Doc-comment documents the empty-but-no-error contract ("secret name registered, value not surfaced") — the shape Fly's API produces when `showSecrets` is denied; callers treat this as `ErrChatAuth` (see deviations §2).
- **`backend/internal/deploy/fly.go`** — `flapsClient` interface widened with `GetAppSecrets(ctx, app, name string, version *uint64, showSecrets bool) (*fly.AppSecret, error)` (exact upstream fly-go method signature). New `(*FlyDeployTarget).GetAppSecret` parses external ref → Fly app name, calls `flaps.GetAppSecrets(ctx, app, key, nil, true)`, returns `*sec.Value` (or `""` when `Value == nil`). Errors wrap with context but never include the secret value — the only redaction needed; the underlying flaps call keeps the value off the error path.
- **`backend/internal/deploy/stubs.go`** — `LocalDeployTarget` and `AWSDeployTarget` each gain `GetAppSecret` returning `("", ErrNotImplemented)`. Blueprint §11.4: deferred targets are real interface implementations, not missing stubs.
- **`backend/internal/deploy/fly_test.go`** — `flapsClientFake` gains `getSecretValues map[string]string`, `getSecretErr error`, and a `GetAppSecrets` method. Three new tests: `TestGetAppSecret_ReturnsValue` (value projection from fake store), `TestGetAppSecret_EmptyValueReturnsEmpty` (value-not-surfaced path), `TestGetAppSecret_BadExternalRef` (parse-failure-before-API-call invariant).
- **`backend/internal/agents/service.go`** — three new sentinels (`ErrChatDisabled`, `ErrChatUnreachable`, `ErrChatAuth`) with Phase 5 sentinel-to-Connect-code mapping documented inline. New exported `ChatHTTPClient` interface (`Do(*http.Request) (*http.Response, error)` — `*http.Client` satisfies it out of the box). New `ServiceOption` functional-option type and `WithChatHTTPClient(c ServiceOption)`. `Service` struct gains `chatHTTP ChatHTTPClient` (defaults to `&http.Client{Timeout: 60s}`). `NewService` widens to `(four required args, opts ...ServiceOption)` — existing four-arg call sites keep compiling unchanged (see deviations §3). Package constant `chatHTTPTimeout = 60 * time.Second` is visible and tunable in one place; deliberately not exposed on `ServiceOption` — overriding the timeout means overriding the whole client, which `WithChatHTTPClient` already permits.
- **`backend/internal/agents/service_test.go`** — `chatHTTPFake` (Do-shaped fake recording `lastReq` + scripted status / body / error). `fakeDeployTarget` gains `getAppSecretValues`, `getAppSecretErr`, `getAppSecretCalls`, and `GetAppSecret`. Nine new `TestChatWithAgent_*` tests covering the full domain-method contract (see opening summary for names).

### Deviations from plan

- **URL helper lives in `agents/`, not on `DeployTarget`.** Adding `(DeployTarget).ChatURL(...)` to the interface would force stubs to grow without earning their keep and prefigures the v1.5 "second deploy target with a chat surface" decision that hasn't been made. The `logsURL` precedent is established, and a future v1.5 lift of both helpers to the interface has an obvious single target. Zero cost to Phase 5.
- **Empty token surfaces as `ErrChatAuth`, not `ErrChatUnreachable`.** Fly returning a registered secret name with no value is Corellia-side drift (audit row vs. secret store), not a transient network condition. `ErrChatAuth` (→ Connect `Internal` in Phase 5) signals "Corellia-side state is wrong; retrying won't help." `ErrChatUnreachable` (→ `Unavailable`) is reserved for transport failures where a retry is reasonable.
- **`NewService` keeps four required args; chat collaborator opts in via functional option.** Avoids churn across `cmd/api/main.go` and ~25 test call sites. The variadic `...ServiceOption` shape is idiomatic Go for "required collaborators + optional per-test overrides" and costs nothing at existing call sites. Default client is production-ready; tests pass `WithChatHTTPClient(stub)` cleanly.

### Known pending work

- **Operator-side smoke** — spawn a chat-enabled agent, call `ChatWithAgent` from a one-off binary, assert non-empty content. Hard prerequisite before Phase 5 starts: the unit tests pin the service-method shape; the operator smoke is what proves `flaps.GetAppSecrets(showSecrets=true)` actually surfaces the token value at runtime against the org-scoped Fly token (changelog 0.7.6). Most likely failure mode: token scope not permitting `show_secrets=true`; workaround options (in-memory cache; column in `agent_instances`) documented in the completion notes.
- **Phase 5 Connect handler.** `ChatWithAgent` is domain-complete; the RPC handler, proto fields, FE chat panel, and instance-detail page land in Phase 5.

---

## 0.11.2 — M-chat Hermes Chat Sidecar Phase 3: Backend Stack (chat_enabled Migration + DeployConfig + Services Block + Token Generation + 4 New Tests) (2026-04-27)

Backend only (Go + SQL). One new migration, two query edits, sqlc regeneration of three files, three Go source edits, four new tests. Zero proto change, zero FE change, zero Fly push, zero adapter image rebuild. Chat-disabled spawns are byte-equivalent to the M5 wire shape throughout — every gated code path is conditioned on `cfg.ChatEnabled`. `go vet ./...` + `go build ./...` + `go test ./...` (all packages green) + `sqlc generate` clean. Four new tests pass: `TestMachineConfigFor_ChatDisabledOmitsServices`, `TestMachineConfigFor_ChatEnabledEmitsExactlyOneService`, `TestSpawn_ChatEnabled_PlumbsTokenAndSecrets`, `TestSpawn_ChatDisabled_OmitsChatPlumbing`.

- **`backend/migrations/20260427120000_chat_enabled.sql`** (new) — `ALTER TABLE agent_instances ADD COLUMN chat_enabled BOOLEAN NOT NULL DEFAULT TRUE`. DEFAULT TRUE follows plan decision 6 and the v1.5 user-facing default (chat-on). Existing M4/M5 rows backfill to TRUE on migration, but their deployed adapter image is the pre-sidecar digest — `ChatWithAgent` (Phase 4) will surface `ErrChatUnreachable` until those agents are destroy-and-respawned to the Phase 7 digest. This observable-not-destructive consistency window is documented inline in the migration. `+goose Down` drops the column.
- **`backend/queries/agent_instances.sql`** — two surgical edits: `InsertAgentInstance` widened from 8 to 9 columns (`chat_enabled` as explicit `$9` param — every BE-driven spawn carries the explicit value, no reliance on DB DEFAULT); `GetAgentInstanceByID` projection gains `ai.chat_enabled` so Phase 4's `ChatWithAgent` and Phase 6's `Health()` HTTP-probe switch can read the field without a further sqlc churn. `ListAgentInstancesByOrg` unchanged (widened in Phase 5/6 when the fleet row card needs it).
- **sqlc regeneration** (`internal/db/models.go`, `internal/db/agent_instances.sql.go`, `internal/db/querier.go`) — `db.AgentInstance.ChatEnabled bool`, `InsertAgentInstanceParams.ChatEnabled bool`, `GetAgentInstanceByIDRow.ChatEnabled bool`. `Querier` interface is unchanged: `InsertAgentInstance`'s method name stays the same; the widened struct arg absorbs the new field in place. Generated tree checked in per blueprint §11.7.
- **`backend/internal/deploy/types.go`** — `DeployConfig.ChatEnabled bool` added with a comment explaining the three-way runtime fan-out (services block in `machineConfigFor`, env vars in spawn, audit `Secret` row) and the deliberate no-`WithDefaults` treatment: Go zero is `false`; the wire/handler layer is the eventual source of truth in Phase 5.
- **`backend/internal/deploy/fly.go`** — two new package constants (`chatSidecarInternalPort = 8642`, `chatSidecarExternalPort = 443`) anchored to blueprint §3.1 and plan decisions 4/12. `machineConfigFor` widened: when `cfg.ChatEnabled`, the returned `*fly.MachineConfig` carries a single-element `Services` slice via the new `chatSidecarServices()` helper (`Protocol: "tcp"`, `InternalPort: 8642`, one `Ports` entry: `Port: 443`, handlers `["http","tls"]`); otherwise `Services` is nil (byte-equivalent to M5). `chatSidecarServices()` is a named helper so the Phase 5+ Update path can reuse it without duplicating the port/handler set.
- **`backend/internal/agents/service.go`** — four new package constants: `envKeyChatEnabled`, `envKeySidecarAuthToken`, `chatEnabledEnvValueTrue = "true"` (pinned to the literal the Phase 2 entrypoint checks — not `fmt.Sprintf("%v", true)`, which would be a fragile coupling), `chatSidecarTokenBytes = 32`. New `generateChatSidecarToken()`: 32 bytes from `crypto/rand` → 43-char `base64.RawURLEncoding` (no padding, URL-safe; below Fly's secret-value size limit by orders of magnitude). `Spawn` flow widened in three gated places: (1) pre-tx — token generated before any DB write so the audit row inside the tx and the Fly secret outside the tx reference the same value; `crypto/rand` failure returns before any write; (2) inside tx — second `InsertSecret` row records the chat-token audit (`CORELLIA_SIDECAR_AUTH_TOKEN`, opaque `storage_ref`) atomically with the model-key row and instance insert; a rollback un-records all three; (3) post-tx — `spec.Env` map gains `CORELLIA_CHAT_ENABLED="true"` and `CORELLIA_SIDECAR_AUTH_TOKEN=<token>` when chat is on, flowing through the existing `for k,v := range spec.Env { flaps.SetAppSecret }` loop unchanged. `InsertAgentInstanceParams` call site gains `ChatEnabled: cfg.ChatEnabled`.
- **`backend/internal/deploy/fly_test.go`** — 2 new tests. `TestMachineConfigFor_ChatDisabledOmitsServices`: asserts `nil` services, read-only, byte-equivalent to M5. `TestMachineConfigFor_ChatEnabledEmitsExactlyOneService`: asserts full services-block shape — `Protocol == "tcp"`, `InternalPort == 8642`, exactly one `Ports` entry, `Port == 443`, both `"http"` and `"tls"` handlers present.
- **`backend/internal/agents/service_test.go`** — 2 new tests. `TestSpawn_ChatEnabled_PlumbsTokenAndSecrets`: 2 secret rows inserted (model key + chat token); `spec.Env` carries `CORELLIA_CHAT_ENABLED="true"` + a 43-char `base64.RawURLEncoding` token that decodes to exactly 32 bytes. `TestSpawn_ChatDisabled_OmitsChatPlumbing`: 1 secret row inserted; neither chat key present in `spec.Env`.

### Known pending work

- **`goose up/down/up` round-trip against dev DB** — applies the `chat_enabled` column, backfills existing rows to TRUE, verifies down drops the column cleanly.
- **`mergeMachineConfig` does not inject the services block on Update.** An agent toggled from chat-disabled to chat-enabled via `UpdateDeployConfig` (Phase 5+) needs a destroy-and-respawn to pick up the services block. Phase 3's spawn path emits it correctly; Update path is Phase 5's concern.
- **Phase 7 adapter image push + migration** — the sidecar-capable adapter image has not yet been GHCR-pushed or recorded in the DB. Chat-enabled spawns will fail at machine-start until Phase 7 lands.

---

## 0.11.1 — M-chat Hermes Chat Sidecar Phase 2: Dockerfile + Entrypoint Two-Process Supervisor (CORELLIA_CHAT_ENABLED Gate) (2026-04-27)

Adapter-image layer only. Four existing files modified under `adapters/hermes/`; zero new files; Phase 1 sidecar files are untouched. The deployed adapter image now *can* run the chat sidecar — whether it *does* is a per-instance decision made by the BE in Phase 3. No Go, TS, migration, proto, or Fly push. Passes `sh -n adapters/hermes/entrypoint.sh` (POSIX-shell syntax check). Operator owes the `docker build && docker run` exit gate before Phase 3 is wired into the live image. `git diff --stat`: `+154 -9` across the four files.

- **`adapters/hermes/Dockerfile`** — adds one `COPY` line under the existing `USER root` block: `COPY --chmod=0755 sidecar/ /corellia/sidecar/`. Directory lands at the `/corellia/` prefix (alongside the existing `entrypoint.sh`), outside `$HERMES_HOME` — a runtime VOLUME that would shadow build-time writes. No `pip install` step: fastapi and uvicorn ship in the upstream image via the `[all]` extra (changelog 0.9.5 re-inspection; Phase 1 smoke passing against the same pinned digest is implicit verification). A venv with `--system-site-packages` would either be redundant or risk upgrading Hermes's own transitive deps — neither is acceptable. Reversible: a `RUN python -m pip install --no-deps -r /corellia/sidecar/requirements.txt` line is a one-line follow-up if Phase 5/7 surfaces a version-skew issue.
- **`adapters/hermes/.dockerignore`** — adds `sidecar/README.md` and `sidecar/smoke.sh`. Without explicit ignore patterns, `COPY sidecar/` would pull both non-runtime files into the image layer. Net runtime payload from `sidecar/` is exactly two files: `sidecar.py` + `requirements.txt`.
- **`adapters/hermes/entrypoint.sh`** — extends the existing `CORELLIA_*` translation block with a conditional two-process supervisor branch, reached only when `CORELLIA_CHAT_ENABLED=true` (literal string — default-deny; `True`, `1`, trailing-space variants all fall through to the original `exec` path). Inside the branch: `forward_term()` function fans SIGTERM/SIGINT to both `$SIDECAR_PID` and `$HERMES_PID` with `[ -n "${PID:-}" ]` guards (safe during the brief window before either child has started); `trap forward_term TERM INT`; uvicorn started in background (`--app-dir /corellia/sidecar sidecar:app --host 0.0.0.0 --port "${CORELLIA_SIDECAR_PORT:-8642}"`, `SIDECAR_PID=$!`); upstream entrypoint started in background (`HERMES_PID=$!`); `set +e` brackets the wait/teardown so a non-zero Hermes exit doesn't trip `set -e` before cleanup; `wait "$HERMES_PID"` (Hermes-as-primary — sidecar crashing does not bring the container down); `HERMES_EXIT` captured; sidecar sent SIGTERM + drained via `wait "$SIDECAR_PID" 2>/dev/null || true`; `set -e` restored; `exit "$HERMES_EXIT"`. Chat-disabled path retains the original `exec /opt/hermes/docker/entrypoint.sh "$@"` — single-child exec-replace is correct for one process.
- **`adapters/hermes/README.md`** — env-var table gains two rows: `CORELLIA_CHAT_ENABLED` (adapter-only, not forwarded to Hermes, default-deny, gates the sidecar at boot) and `CORELLIA_SIDECAR_AUTH_TOKEN` (consumed by the sidecar, required when chat is enabled, empty value → 503 fail-closed per Phase 1's `bearer_auth` middleware). New "Local sanity exec — chat-enabled image" subsection inserted above the existing Fly smoke section: covers `docker build`, `docker run -e CORELLIA_CHAT_ENABLED=true …`, `docker exec … ps -ef` two-process check, and a four-step curl sequence (health unauth → chat no-auth 401 → chat valid bearer 200 → disabled-chat single-process check). Cross-references Phase 1 sidecar smoke (`adapters/hermes/sidecar/smoke.sh`) as the cheapest source-only sidecar probe.

### Design decisions worth noting

- **PID 1 stays as the entrypoint shell with two children.** The M3 single-process `exec` replaced the shell with the child, making the child PID 1 so signals route correctly. With two children, `exec` would orphan one of them — the orphaned process would never receive SIGTERM and Fly would SIGKILL the whole container after its grace period. Staying as PID 1 with an explicit trap-and-fan-out is the only shape that makes both children drainable.
- **`wait "$HERMES_PID"` (specific PID), not bare `wait`.** Bare `wait` returns early on any child's exit — if the sidecar crashed during Hermes startup, the script would race-exit before Hermes finished booting. `wait "$HERMES_PID"` pins the wait to Hermes's lifetime: Hermes is primary, sidecar dying shows up as connection-refused on `/chat` (Phase 4's `ErrChatUnreachable`) without taking the agent offline.
- **Default-deny on `CORELLIA_CHAT_ENABLED`.** Literal `"true"` is the sole enabler. A typo on the BE side silently flips chat *off* (observable: chat panel absent in fleet view) rather than *on* (which would mean the sidecar starts without the bearer token provisioned, and every `/chat` call returns 503 — confusing).

### Known pending work

- **Operator docker gate** — `docker build -t corellia/hermes-adapter:dev adapters/hermes` + chat-enabled run, `ps -ef` two-process check, `/health` + `/chat` curl sequence, disabled-chat run confirming no `:8642` listener.
- **Hermes-readiness gate in `/health`** (`{ok: false, hermes: "starting"}`) is Phase 6's concern. Phase 2's `/health` answers immediately on sidecar startup — brief window where health returns ready while Hermes is still booting.
- **Multi-arch buildx** (`linux/amd64 + linux/arm64`) — existing M3 multi-arch build should continue to work; operator owed verification after Phase 2 image build.

---

## 0.11.0 — M-chat Hermes Chat Sidecar Phase 1: Sidecar Source + Bearer Auth + LRU Session Cache + Smoke Harness (2026-04-26)

Adapter source layer only. Four new files under a new `adapters/hermes/sidecar/` directory; zero existing files touched. The deployed adapter image and every in-flight agent are unaffected — the sidecar lives in the source tree but will not appear in any deployed machine until Phase 2's `Dockerfile` change. This phase delivers the full FastAPI service surface required by blueprint §3.1 (runtime contract: `/chat`, `/health`, `/tools/invoke`), the constant-time bearer-auth middleware, an `OrderedDict`-based LRU session cache, and a POSIX-bash smoke harness. Passes `python3 -c 'import ast; ast.parse(…)'` and `bash -n` locally. Docker-based smoke is operator-gated.

- **`adapters/hermes/sidecar/sidecar.py`** (~220 LOC) — FastAPI app. `POST /chat`: bearer-authenticated; loads or creates an `AIAgent` keyed on `session_id` from the LRU cache; returns `{content: <reply>}`. `GET /health`: deliberately unauthenticated (Fly health probes run without the token; an authenticated `/health` would either expose the token to Fly's edge or cause every probe to 401, flipping the machine unhealthy); returns `{ok: true, hermes: "ready"}`. `POST /tools/invoke`: bearer-authenticated; returns `501 {detail: "tools/invoke not implemented"}` — explicit anti-scope-creep stub per plan §5, proto reservation not yet earned. Bearer-auth middleware: `secrets.compare_digest` (constant-time, prevents timing oracles); reads `CORELLIA_SIDECAR_AUTH_TOKEN`; exempts `/health`; fails closed with `503` when the token env var is unset or empty (prevents the `compare_digest("","") == True` zero-length bypass). `AIAgent` import is `try/except`-guarded against `ImportError` and any import-time failure: inside the deployed image the upstream package is always importable; outside Docker (workstation, CI without docker) a stub class returns `[stub-aiagent] echo: <message>`, keeping the FastAPI auth/routing surface testable without a model key. Stub prefix is deliberately distinguishable from any real-model output. `_get_or_create_agent` tries `AIAgent(session_id=session_id)` (named-arg form, matching upstream `gateway/session.py` pattern per changelog 0.9.5) and falls back to `AIAgent()` on `TypeError`, insulating the sidecar against upstream constructor churn at no runtime cost. Session cache: `OrderedDict`-based LRU capped at 100 (configurable via `CORELLIA_SIDECAR_MAX_SESSIONS`), `threading.Lock`-protected (uvicorn's worker model can shift sync endpoints into a thread pool). Eviction is safe: durable session state lives in `$HERMES_HOME/sessions/<id>.sqlite`; the in-memory dict is a perf cache, never the source of truth.
- **`adapters/hermes/sidecar/requirements.txt`** — pins `fastapi==0.115.5`, `uvicorn[standard]==0.32.1`, `pydantic==2.10.3`. All three ship in the upstream image via the `[all]` extra (changelog 0.9.5), but an explicit pin declares the sidecar's dependency surface and documents the version contract for future digest bumps.
- **`adapters/hermes/sidecar/smoke.sh`** — POSIX-bash smoke harness, `chmod +x`. Boots the sidecar inside the unmodified upstream Hermes image (same pinned digest as the adapter `Dockerfile`) via `--entrypoint /bin/sh` with the sidecar directory bind-mounted read-only — no Dockerfile change needed in Phase 1. Defensively runs `pip install -q -r /corellia/sidecar/requirements.txt` before launching uvicorn so the smoke is self-checking regardless of whether pre-work dep-presence verification was run. Asserts five behaviours in sequence: `GET /health` → `200` with `{ok:true,hermes:"ready"}`; `POST /chat` without `Authorization` → `401`; `POST /chat` with wrong bearer → `401`; `POST /chat` with valid bearer → `200` with non-empty `.content`; `POST /tools/invoke` with valid bearer → `501`. `trap`-on-EXIT cleanup tears down the container on `set -e` abort. The smoke deliberately skips upstream's entrypoint (`--entrypoint /bin/sh`) and runs the sidecar process only — Phase 1's exit gate asserts the FastAPI surface shape, not a Hermes round-trip; composing two processes without modifying `entrypoint.sh` would prefigure Phase 2 design choices.
- **`adapters/hermes/sidecar/README.md`** — stub cross-referencing binding decisions and the smoke harness.

### Validation gate owed (operator)

`OPENROUTER_API_KEY=sk-or-v1-<key> ./adapters/hermes/sidecar/smoke.sh` — expected: five passing `>> [N/5] …` lines, then `>> all assertions passed`; container removed automatically on exit.

---

## 0.10.7 — Fleet Gallery: 3-Column Grid Match with Spawn + Icon-Only Compact Row Actions (Card Footer Overflow Fix) (2026-04-27)

FE-only. Two-edit cosmetic fix on the fleet gallery view triggered by a screenshot showing the row-action footer overflowing the card boundary at `sm:grid-cols-2` width (LOGS / DEPLOYMENT / STOP / DESTROY ran past the card's right edge, with `STOP` and `DESTROY` colliding visually). Two coupled changes: (1) gallery grid rebreakpointed to match the spawn page's `RosterGrid` (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`, was `sm:2 / lg:3 / xl:4` — wider cards at every breakpoint, top-end caps at 3 columns); (2) `<AgentRowActions>` gains a `compact?: boolean` prop that flips its buttons to `icon-sm` (square, label dropped, label moved to `title=` for hover tooltip + existing `aria-label` preserved for screen readers). Gallery cards pass `compact`; the list view (`fleet/page.tsx`) is untouched and keeps the labelled treatment. Zero backend, proto, schema, env, or dependency change. Type-check + lint clean.

- **`frontend/src/components/fleet/fleet-gallery.tsx`** — grid breakpoints `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` → `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`. Mirrors `RosterGrid` in `frontend/src/app/(app)/spawn/page.tsx:147` so the two roster-style surfaces share a single visual rhythm — same card width at the same viewport, same column-count progression.
- **`frontend/src/components/fleet/agent-row-actions.tsx`** — `Props` gains `compact?: boolean` (default `false`). When set, `buttonSize` resolves to `icon-sm` instead of `sm`; each of the five buttons (Logs / Deployment / Start / Stop / Destroy) renders icon-only (the label child is conditionally rendered via `{!compact && "Logs"}` etc.) and receives a matching `title={compact ? "Logs" : undefined}` for browser hover tooltips. `aria-label` is held on every branch so screen-reader output is unchanged. The `Start`, `Stop`, and `Destroy` branches gain explicit `aria-label`s (previously implicit via button text); the `Logs` and `Deployment` branches already had them.
- **`frontend/src/components/fleet/agent-card.tsx`** — gallery card footer passes `compact` through to `<AgentRowActions>`. One-line edit; no layout change beyond the button-size flip.

### Behaviour change (known)

- **Gallery card actions are now icon-only.** Hover reveals a browser-native tooltip (`title=`); accessibility label is preserved. List view is unchanged — labelled buttons remain because the row has horizontal room.
- **Gallery is now capped at 3 columns at the top breakpoint** (was 4 at `xl`). Slightly fewer cards per row at very wide viewports, traded for cards wide enough to fit the icon row + the four-line meta block (name / template / provider+model / region+size, optional replicas+storage) without crowding.

### Resolves

- **Operator screenshot (live, 2026-04-27):** `Screenshot 2026-04-27 at 00.08.44.png` — the row-action footer (LOGS · DEPLOYMENT · STOP · DESTROY) overflowing the card at `sm:grid-cols-2` width, with the `DESTROY` button text overlapping the `STOP` button's icon. Both root causes addressed (cards wider, buttons narrower).

### Notes

- **No `<Tooltip>` component dependency added.** The Base UI `<Tooltip>` primitive exists in the codebase (`components/ui/tooltip.tsx`) but is rare and currently only used inside the sidebar. Native `title=` is consistent with the rest of the fleet surface, has zero JS overhead, and renders identically in the demo recording flow.
- **`fleet/page.tsx` (list view) untouched.** The single `<AgentRowActions instance={i} onChanged={onChanged} />` call site at line 327 omits `compact`, so the default `false` keeps labelled buttons in the list — the row has the horizontal space to display them.

---

## 0.10.6 — Spawn Page Cosmetic Pass: Locked-Card Particle Cloud Fallback + SaaS-Standard Type Scale Bump (Wizard + Deployment Form + Label/Button Primitives) (2026-04-27)

FE-only cosmetic pass on the spawn page surface. Two unrelated visual fixes bundled into one patch: (1) the locked-harness roster cards no longer render as concentric placeholder ellipses — they now render as a frozen particle cloud in the same visual family as the live Hermes nebula, just static; (2) the wizard's dense `text-[10px]` / `text-[11px]` / `text-xs` vocabulary moves up one notch toward the design-system spec (`text-xs` for labels, `text-sm` for prose body), bringing legibility in line with SaaS platform standards. Zero backend, proto, schema, env, or dependency change. Type-check + lint clean.

- **`frontend/src/components/spawn/avatar-fallback.tsx`** (rewritten) — replaces the three concentric-ellipse SVG ("pearl rings") with a deterministic static particle cloud: 520 primary particles (broad Gaussian, palette-tinted, opacity falls off with radius) + 90 core motes (tight Gaussian near centre, pearl-bright). Uses the same Box-Muller Gaussian + `mulberry32` seeded PRNG pattern as the `<GalaxyOfAgents>` scene (0.10.5) for deterministic per-render output. Per-particle tints picked from `palette.tints` weighted by `palette.intensities` — matches the dominance order the live R3F shader bakes in (Hermes green leads, etc.). `mix-blend-mode: screen` on the particle group fakes the additive blending the live nebula gets from `THREE.AdditiveBlending` without a second WebGL context. Halo backdrop preserved via the existing `radialGradient` + `palette.fallbackAccentHsl`. `seedFor(harness)` is FNV-1a over the harness key, so each locked card has a stable distinct cloud across mounts. Honors decision §21 (one canvas page-wide) — pure SVG, zero GPU pressure, scales to all five locked roster cards + presentation Slide 3's `<OrbitalBay>` without budget impact.
- **`frontend/src/components/ui/label.tsx`** — Label primitive `text-[11px]` → `text-xs` (11px → 12px). The Label vocabulary is the dominant label voice across spawn / fleet / inspector / bulk-apply, so the change ripples broadly through the form-heavy admin surface in one edit. Matches design-system §13 spec which already calls for `text-xs` on terminal labels.
- **`frontend/src/components/ui/button.tsx`** — `buttonVariants` size scale rewritten:
  - `default`: `h-8 px-3 text-xs` → `h-9 px-3.5 text-sm`
  - `lg`: `h-9 px-4 text-xs` → `h-10 px-4 text-sm`
  - `sm`: `h-7 px-2.5 text-[11px]` → `h-8 px-3 text-xs`
  - `xs`: `h-6 px-2 text-[10px]` → `h-6 px-2 text-[11px]` (height held; text bumped)
  - Heights moved one row up where the larger glyph would have crowded the previous box; padding bumped on `default` and `sm` to match. Consumers using `size="sm"` (the wizard's CONFIRM CTAs) get a subtly taller, more readable button without re-tuning per call site.
- **`frontend/src/components/spawn/wizard.tsx`** — every dense size moves up one notch:
  - Eyebrow kickers (`[ LAUNCHPAD // CONFIGURE ]`, `[ LAUNCHPAD // DEPLOYING ]`, `STEP X OF 5`, `IN FLIGHT` / `ERROR`) `text-[10px]` → `text-[11px]`
  - Step-1 `HARNESS` sub-label `text-[10px]` → `text-[11px]`; agent-name display `text-sm` → `text-base`
  - Step-1 description, Step-4 deployment intro, Step-5 review intro paragraphs `text-xs` → `text-sm`
  - All `<dl>` spec sheets and `<ConfirmedSummary>` rows `font-mono text-[11px]` → `font-mono text-xs`
  - `<SpecRow>` label width unchanged (`w-24`) — only the type size changes; left column `text-[10px]` → `text-[11px]`; deferred-tag `text-[9px]` → `text-[10px]`
  - DeployLog `<pre>` body `font-mono text-[11px]` → `font-mono text-xs`
  - Field hints (model identifier hint, API-key disclaimer) `text-xs text-muted-foreground` → `text-sm text-muted-foreground`
  - WizardError + WizardNotFound branches `font-mono text-xs` → `font-mono text-sm`
  - Inline `text-sm text-destructive` error messages held (already at the new floor)
- **`frontend/src/components/fleet/deployment-config-form.tsx`** — same notch-up pass on the shared deployment form (consumed by both the wizard's Step 4 and the fleet inspector's edit pane, so this picks up two surfaces at once):
  - Size preset chips + `Custom…` toggle `font-mono text-[11px]` → `font-mono text-xs`; chip padding bumped `px-2.5 py-1` → `px-3 py-1.5` so the larger glyph breathes inside the chip.
  - Restart-policy radio labels `font-mono text-[11px]` → `font-mono text-xs`
  - All field hint paragraphs (region default, volume mount-path note, replicas-don't-share-state warning, manual-lifecycle disclaimer) `text-xs text-muted-foreground` → `text-sm text-muted-foreground`
  - All inline error messages `text-xs text-destructive` → `text-sm text-destructive`

### Visual register (preserved)

Mission-control vocabulary held: Space Mono uppercase + `tracking-wider` + hairline borders + terminal-green CTA, halftone substrate, `[ BRACKETED ]` eyebrow voice. Only the *size floor* rose — the design language is unchanged. The Button height bump (h-8 → h-9 on `default`, h-7 → h-8 on `sm`) is the one knock-on that ripples beyond text: any layout that hard-coded button-row heights to the old values may need a one-row reflow check.

### Surfaces that ride along (no per-call-site edits needed)

- Fleet inspector edit pane, bulk-apply modal "Don't change" form, and the spawn wizard's Step 4 all consume `<DeploymentConfigForm>` — they each pick up the new sizes for free.
- Fleet list / gallery, agent rows, status pills, and any other surface that uses the `Label` and `Button` primitives picks up the bumped vocabulary automatically.

### Notes

- **No design-system.md edit.** §13 already specs `text-xs` for labels and `text-sm` for table/value text — the shipped code was below spec; this brings the wizard surface up to the documented floor rather than redefining it.
- **No screenshot regression test for the locked cards.** Visual change reviewed manually against the screenshot supplied with the request; no Playwright snapshot suite exists in v1 (per blueprint §13 deferral).

---

## 0.10.5 — Presentation Polish Phases 1–6: Beat Sheet + R3F Scene Library (5 Scenes) + 7-Slide Rewrite + Crossfade + Audio Scaffold + `?mode=record` (2026-04-26)

FE-only. Six-phase polish pass on the `/presentation` hackathon demo deck. Expanded from the 5-slide 0.9.3 skeleton to a 7-slide production-ready deck with per-slide R3F/CSS scenes, 250ms crossfade, a Slide 2→3 collapse-into-hub linked transition, an audio drop-in scaffold, and a `?mode=record` auto-advance mode with deterministic seeding. All phases shipped in one session. Zero backend, proto, schema, env, or dependency change. Type-check + lint + build clean. Plan: `docs/executing/presentation-polish.md` (to be archived). Completion notes: `docs/completions/presentation-polish.md`.

- **`docs/refs/presentation-beat-sheet.md`** (new) — self-contained per-slide reference: 7-row story-arc table, three-audience legibility test, per-slide directors' notes (message / visual / motion / copy), cross-slide link inventory, Q1–Q7 defaults table. Structured so a non-author engineer can rebuild any slide from this file alone.
- **`frontend/src/lib/shaders/simplex-noise.ts`** (lifted from sign-in) — `SIMPLEX_NOISE_GLSL` (Ashima 3D simplex, MIT) now lives in `lib/shaders/`. Three callers: sign-in swarm vert shader (via a one-line re-export shim at the old path), spawn nebula shaders (import repointed), and the new galaxy scene.
- **`frontend/src/components/presentation/scenes/scene-gate.tsx`** (new) — shared gate mirroring `<NebulaAvatar>`'s branch ladder: `prefers-reduced-motion` → fallback SVG; no `WebGL2RenderingContext` → fallback; off-screen (IO) → render nothing; otherwise → R3F. `eager` prop opts a scene out of lazy-mount.
- **Five scenes built:**
  - `galaxy-of-agents.tsx` + `galaxy-of-agents-scene.tsx` (Slide 1) — R3F, 1500 particles, Gaussian sphere, camera dolly from `z=1.5` → `z=4.5` driven by the count-up. `mulberry32` seeded PRNG for record-mode determinism.
  - `tangle-web.tsx` + `tangle-web-scene.tsx` (Slide 2) — R3F, 8 nodes, 28 edges, per-frame jitter. Accepts `collapsing` prop: lerps all nodes + edges toward origin over 250ms, matching the crossfade window, so Slide 2→3 reads as one continuous visual moment.
  - `orbital-bay.tsx` (Slide 3) — pure CSS, three-layer nested transform (rotor → anchor → counter-rotate). `<NebulaAvatar>` for Hermes + 5 `<AvatarFallback>` harnesses; 80ms stagger reveal on entry.
  - `policy-checkpoint.tsx` (Slide 4) — CSS keyframes, 3 blocked-call capsules (`web_search`, `shell.exec` — Hermes-real per Q6), scan-line gradient, 14-particle deterministic radial dissolve.
  - `opus-pipeline.tsx` (Slide 5) — CSS keyframes, file-tree cascade (1.5s) → scan-beam gradient (1.5s) → crystallise (2s) → settle (2s). Real upstream repo (`github.com/nousresearch/hermes-agent` per Q5). Beam is a CSS `linear-gradient` with `mix-blend-mode: screen` + `box-shadow` halo — spirit-reuse of the nebula's glow family without a second R3F canvas.
- **Slides rewritten / renamed / created** — deck expands from 5 → 7 slides: Slide 1 (hook rewrite: kicker → `[ THE 1,247-AGENT FUTURE ]`; SVG `<NodeField>` → `<GalaxyOfAgents>`), Slide 2 (`slide-2-problem` → `slide-2-tangle`; five-grid → `<TangleWeb>`), Slide 3 (`slide-3-solution` → `slide-3-garage`; frozen circle → `<OrbitalBay>`), Slide 4 (new `slide-4-guardian.tsx` composing `<PolicyCheckpoint>`), Slide 5 (new `slide-5-opus.tsx` composing `<OpusPipeline>`), Slide 6 (new `slide-6-thesis.tsx` — pure typography, two staggered fade-ins, no kicker; stillness is intentional), Slide 7 (`slide-5-handoff` → `slide-7-handoff`; body unchanged). `slide-4-how.tsx` deleted (content split across Slides 4 + 5).
- **`frontend/src/components/presentation/deck.tsx`** (updated) — `SLIDES` const 5 → 7; `renderSlide` switch covers all 7; `1`–`7` keyboard jump; progress dots array-driven (no hard-coded `5`s). Crossfade state machine: `transitioning` + `pendingIndex` drive a 250ms opacity transition on the slide body. `isCollapsing` computed inline (`slide.id === "tangle" && transitioning && pendingIndex === garageIndex`) and threaded to `<SlideTangle>` for the Slide 2→3 linked transition. Record-mode auto-advance: `setTimeout(durationMs)` per slide; Slide 7 does not auto-advance (editor crossfades the seam to the demo half).
- **`frontend/src/components/presentation/slide-frame.tsx`** (updated) — `chromeHidden` prop collapses top callsign strip + bottom prev/dots/next + click hint (used in `?mode=record`).
- **`frontend/src/components/presentation/audio/audio-bed.tsx`** (new) — `<AudioBed bedSrc?>` (looped ambient, vol 0.18) + `<SlideCue src?>` (stinger keyed on `key={index}`, vol 0.65). Both render no `<audio>` element until `bedSrc`/`cueSrc` strings are supplied. Drop-in contract: add MP3 to `frontend/public/presentation/`, set `cueSrc` on the relevant `SLIDES` entry — no re-architecture needed.
- **`frontend/src/app/presentation/page.tsx`** (updated) — server component awaits `searchParams` (Next 15 async shape), reads `mode === "record"`, passes boolean to `<Deck recordMode>`.

### Departures from plan worth noting

- **Three of five scenes are CSS/SVG, not R3F.** Orbital Bay, Policy Checkpoint, and Opus Pipeline ship as CSS keyframe animations; R3F would have added GPU pressure and bundle weight for scenes that are essentially 2D motion. Two of five (Galaxy, TangleWeb) are R3F. Consistent with the plan's one-canvas-per-slide ceiling.
- **TangleWeb ships without 3D text labels.** Q4's "named" default is honoured in the reduced-motion SVG fallback; the live R3F path renders nodes + edges only. Kicker copy `[ TODAY ]` carries disambiguation. Adding labels via `@react-three/drei` `<Text>` is a ~15-line-per-node follow-up.
- **Slide 2→3 collapse runs in 250ms, not plan's 600ms.** Fits inside the crossfade window without a ghost-layer pass; the continuity claim still lands. Extending to 600ms requires mounting Slide 2 during Slide 3's fade-in — possible with a small deck transition-state-machine refactor.

### Pending work (handoff)

- **Three-audience review** of the live deck (technical / non-technical / strategic).
- **Per-slide internal-timing audit** — beat-sheet durations wired into `durationMs`; verify each scene completes before its slide ends (esp. Slide 5 7s scene under a 10s slide).
- **Bundle-size delta** — plan gate `≤ 80 KB gzip`; `next build` passes but gzip delta not yet measured.
- **Recording-mode determinism check** — two back-to-back `?mode=record` takes, diff'd frame-by-frame.
- **Audio assets** — voice-over, ambient bed, per-slide cues; captions/burn-in. All deferred to ops.
- **Archive plan** — `docs/executing/presentation-polish.md` → `docs/archive/` once deck is recording-ready.

---

## 0.10.4 — M5 Fleet Control Pre-Prod Hardening: Lifo Failed-First Scale-Down + Idempotent Destroy + Region-Loop Lifetime + Lease-Nonce Log + Drift All-Mismatches + Name-Match Destroy Gate + Bulk-Delta Wire Contract Doc + 4 New Tests (2026-04-26)

Pre-prod review pass on the M5 Fleet Control bundle (phases 1–8). Eight should-fix / nice-to-have items surfaced by a four-track parallel review (backend domain, deploy layer, frontend, build-gate verifier — all green at 0.10.3 head). All non-controversial defensiveness or testing-gap closures; zero functional change to the happy path. Patch version: no new product surface, no new RPC, no new schema/migration, no proto field added — one comment-only proto edit, regenerated deterministically. `go vet` + `go build` + `go test ./...` (5 packages, all `ok`) + `pnpm type-check` + `pnpm lint` + `pnpm build` (Next 16.2.4 / 11 routes) all green; 4 new Go tests pass (`PreviewUpdate` × 2, `Destroy` idempotent, `lifoTail` failed-first).

- **`backend/internal/deploy/fly.go` — `regionRefreshLoop` lifetime decoupled from caller ctx (fly.go:159).** Previously `go t.regionRefreshLoop(ctx)` inherited the boot ctx; on graceful shutdown or test cleanup the goroutine exited immediately, leaving the cache stale at the exact moment an operator might need a fresh list. Now `go t.regionRefreshLoop(context.Background())` so the loop survives until process exit per its own docstring contract ("lives for the process lifetime"). The `select { case <-ctx.Done(): return ... }` branch becomes effectively dormant — kept for forwards-compat in case a stop channel is plumbed later.
- **`backend/internal/deploy/fly.go` — `lifoTail` two-key sort: failed-first, then LIFO (fly.go:780–800).** Plan §6 risk 2 was flagged in the 0.10.0 phase-3 completion notes as a TODO. Scaling 3→1 with one failed replica used to destroy the newest *running* replica (LIFO winning over state preference); now a `failed`-state machine wins over any non-failed regardless of CreatedAt. Same secondary order (`CreatedAt` desc) for survivors, same tertiary `ID` tiebreaker. Behaviour change visible only when the fleet has at least one failed replica during a scale-down — the canonical happy-path is byte-identical.
- **`backend/internal/deploy/fly.go` — `Destroy` idempotent against `flaps.ErrFlapsNotFound` (Destroy method).** Closes the `UpdateDeployConfig`-respawn race window (fleet.go:205–208): if the Fly app is externally deleted between `PreviewUpdate` and `respawnAgent` (operator mistake, flaps API race, parallel destroy paths), `Destroy` now returns nil + a `slog.Warn("destroy on already-deleted app")` so the respawn proceeds to spawn a fresh app instead of bailing with `ErrFlyAPI`. Uses fly-go's typed sentinel via `errors.Is(err, flaps.ErrFlapsNotFound)` — no string matching. The agent_instances row is the authoritative liveness signal; the Fly app is bookkeeping that may legitimately be already-gone.
- **`backend/internal/deploy/fly.go` — `acquireLease` defensive log on nil-nonce edge case (fly.go:462–471).** When `flaps.AcquireLease` succeeds but returns a `lease.Data.Nonce == ""`, the previous code silently dropped the release closure. The lease handshake path is now "if `lease != nil && nonce == "" → slog.Warn` then proceed nonce-less" — surfaces a Fly-API shape regression instead of swallowing it. Behaviour-equivalent at runtime; new signal in logs.
- **`backend/internal/deploy/fly.go` — dead constants removed (was fly.go:21–23).** `defaultRegion = "iad"` / `defaultCPUs = 1` / `defaultMemoryMB = 512` were superseded by `DeployConfig.WithDefaults()` (decision 9 / Phase 2) and left in place during Phase 2's strictly-additive pass; deleted now. Phase-2 completion notes (0.10.0) flagged the deletion as Phase-4 work; deferred to this hardening pass to avoid mid-phase churn. Replaced by a named constant `redactFlyErrorMaxLen = 200` (was a magic 200 in `redactFlyError`) — same threshold, named for readers.
- **`backend/internal/deploy/fly.go` — `projectMachine` CreatedAt parse failure logs at `slog.Debug`.** Previously a `time.Parse` error left `CreatedAt` zero-valued without any signal; the canonical case (M4-era agents pre-volume-backfill) is expected, but a future bug (Fly returning unparseable timestamps) would silently produce zero-time across the inspector. Debug-level so it's quiet by default but greppable if drift surfaces.
- **`backend/internal/agents/fleet.go` — `DetectDrift` reports every mismatch, not just the first (fleet.go:594–629).** Three loops (`size`, `volume_size`, `volume_unattached`) used to `break` on the first mismatch; an instance with five size-mismatched machines surfaced one detail line. Now the category flag latches once (`sizeFlagged` / `volumeSizeFlagged` / `unattachedFlagged` booleans gate the `Categories` append) but every offending machine/volume contributes a `Details` line. Inspector banner gets the full diff scope without a v1.5 RPC change.
- **`backend/internal/deploy/fly_test.go` — 4 new tests, ~50 LOC.** (1) `TestPreviewUpdate_RegionChangeReturnsRespawn` asserts read-only behaviour: `AcquireLease` / `Update` / `Launch` / `Destroy` / `ReleaseLease` all called 0 times when a region delta is detected. (2) `TestPreviewUpdate_NoRegionChangeReturnsLiveApplied` covers the happy path. (3) `TestDestroy_IdempotentOnNotFound` injects `flaps.ErrFlapsNotFound` from the fake client and asserts `Destroy` returns nil with `DeleteApp` called once. (4) `TestLifoTail_FailedMachinesDestroyedFirst` builds a 3-machine fleet (old-running / mid-failed / new-running), scales to 1, asserts the destroy victims are `[mid-failed, new-running]` — failed-first wins over LIFO.
- **`frontend/src/components/fleet/deployment-inspector.tsx` — name-match gate added to `DestructiveApplyButton` (defense-in-depth).** Phase 7's destructive-confirm flow used a checkbox + `<AlertDialog>` two-step gate. The pre-prod review flagged the checkbox as below table-stakes for an action that wipes persistent state (kubectl / terraform / GitHub all require name-typing). Now the AlertDialog body renders a `<Input id="destroy-name-confirm" autoFocus>` with a `htmlFor`-associated label ("Type `<agent-name>` to confirm.") and the `<AlertDialogAction>` button is `disabled` until `typed.trim() === instanceName`. `aria-invalid` flips when the operator has typed but doesn't match, surfacing Tailwind's `aria-invalid:border-destructive` ring. Cancel + close clear the typed state via a `close()` helper so reopening starts fresh. The original checkbox stays — the two gates are complementary (read+ack the warning, then prove intent by typing the name); the name-match is the harder primary gate.
- **`shared/proto/corellia/v1/agents.proto` — `BulkConfigDelta` wire contract documented.** Added a six-line `CONTRACT` block to the message comment naming the form-level skip semantics explicitly: every field is required on the wire, the BE applies uniformly, and the FE form (`<BulkConfigDeltaForm>`) implements per-field skip by pre-filling skipped fields with the common-among-selection value. Direct callers (custom scripts, future SDKs) must compute uniform values themselves — no per-field optional sentinel exists. Closes the documentation gap flagged in the 0.10.3 plan-deviations §1: the contract was correct in shipped code but not visible to anyone reading the proto in isolation. `pnpm proto:generate` re-emits the Go + TS docstrings deterministically; no field ordering change, no breaking wire-shape edit.

### Behavior changes (known)

- **`Destroy` is now idempotent on already-deleted Fly apps.** Previously surfaced `ErrFlyAPI` (Connect `Unavailable`) to the operator; now returns success with a Warn log. The downstream effect is that `UpdateDeployConfig` region-change respawns succeed even if the old app was concurrently destroyed by another path.
- **Scale-down preferentially destroys failed replicas.** Visible only in the rare path where the fleet contains at least one `failed`-state machine during a scale-down. The canonical "scale-down a healthy fleet" path is unchanged (LIFO over CreatedAt desc).
- **Destructive update confirmation now requires name-typing.** Region-change applies (the only path that triggers `UpdateRequiresRespawn`) cannot be confirmed by clicking through alone — the AlertDialog action stays disabled until the operator types the agent name verbatim. Adds ~3 seconds of operator friction; trades against a class of accidental fleet wipes.

### Resolves

- **Pre-prod review's nine should-fix / nice-to-have items** ([code-review summary in conversation 2026-04-26](#)). Two real-teeth items (region-loop ctx lifetime; destructive-confirm name-typing) closed in this pass; the rest are defensiveness or testing-gap polish.

### Known pending work

- **Live integration smoke** (`overmind start` + the Phase 8 5-agent bulk-apply demo case) is owed per the v1 manual-smoke posture (CI gates are type-check + lint + build + go test; runtime validation is the operator's).
- **Phase 3.5 (volume lifecycle)** still queued — `EnsureVolume` / `ExtendVolume` still return `ErrNotImplemented`; volumes still don't attach on Spawn. Tracked since 0.10.0; not a blocker for the M5 demo path (single-replica always-on agents). The M5 fleet-control surface is feature-complete for its plan scope without it.
- **`respawnAgent` model API key re-supply** still v1.5 (carried over from 0.10.0 known pending work; not addressed in this hardening pass — out of scope).

---

## 0.10.3 — M5 Fleet Control Phase 8: Bulk Fleet Ops (Header + Per-Row Checkboxes, Sticky Selection Toolbar, "Don't Change" Bulk-Apply Modal with Dry-Run Preview) (2026-04-26)

FE-only. The fleet page gains a leading checkbox column (header select-all-on-page + per-row toggle), a sticky `<SelectionToolbar>` that mounts when ≥1 row is selected, and a `<BulkApplyModal>` with a five-field "Don't change" form (region / size / replicas / restart / lifecycle — no volume per decision 8.4), a `dry_run=true` preview step that classifies each candidate's `UpdateKind`, and a confirm path that wires `BulkUpdateAgentDeployConfig`. Failed rows stay selected for retry on close. Zero backend, proto, schema, env, or dependency change — Phase 4's BE surface (`BulkUpdateAgentDeployConfig`, `BulkConfigDelta`, `BulkResult`) is the integration target. Type-check + lint + build clean.

- **`frontend/src/components/fleet/bulk-config-delta-form.tsx`** (new, ~440 LOC) — per-field "DON'T CHANGE" checkbox (default checked → skip) for each of the five bulk-editable dimensions. `summarizeSelection(instances)` pre-fills uniform fields with the common value and marks divergent fields with a yellow ⚠ warning ("leaves 'don't change' preserves each agent's current value"). On submit, every non-skipped field is sent at the displayed value; the BE's `WithDefaults()` handles zero-coalescing. The skip mechanic is form-level only — `BulkConfigDelta` has no per-field optional sentinel on the wire (see "Plan deviations" §1). `useDeploymentRegions` hook + preset chips + `Custom…` toggle mirror the Phase 6/7 patterns without lifting a shared `<SizeField>` (bulk chip-disable wiring differs from the single-instance form).
- **`frontend/src/components/fleet/bulk-apply-modal.tsx`** (new, ~280 LOC) — `<Dialog>`-based with a five-state `Mode` union (`editing | previewing | preview | applying | result`). Preview renders a per-row table (agent name + `UpdateKind` badge, color-coded green/amber/red). Confirm fires `dry_run=false`; result pane re-renders the same table with per-row ✓/✗. `onComplete(failedInstanceIds)` hands failed IDs back to the fleet page, which replaces `selectedIds` atomically. Modal body keyed on `props.open ? "open" : "closed"` so each open resets to editing mode (same `key`-as-reset pattern Phase 7's inspector uses, satisfying `react-hooks/set-state-in-effect`).
- **`frontend/src/components/fleet/selection-toolbar.tsx`** (new, ~50 LOC) — sticky-bottom toolbar; surfaces when `effectiveSelectedIds.size ≥ 1`. Shows count, `› APPLY CONFIG…` button, `CLEAR` button. Selection count > 50 disables the apply button with a `title=` tooltip and shows a red `· over cap (50)` badge. Exports `BULK_APPLY_CAP = 50` so the page can gate the modal-mount predicate independently (no over-cap bulk request can ever reach the BE).
- **`frontend/src/app/(app)/fleet/page.tsx`** (updated, net +95 LOC) — `selectedIds: Set<string>` lifted to page state. Three `useCallback`-memoized handlers (`toggleOne`, `toggleAll`, `clearSelection`). `effectiveSelectedIds` is a memoized intersection of `selectedIds` ∩ visible row ids — stale ids (destroyed-and-hidden rows) drop at render time without a `setState-in-effect` GC pass. Header `<SelectAllCheckbox>` sets `.indeterminate` via ref for partial-selection state. `onBulkComplete` callback replaces `selectedIds` with the failed-id set. Toolbar and modal mount off `effectiveSelectedIds.size`.
- **`frontend/src/components/fleet/fleet-gallery.tsx`** (updated, net +5 LOC) — `selectedIds` + `onToggleOne` props passed through to `<AgentCard>`.
- **`frontend/src/components/fleet/agent-card.tsx`** (updated, net +20 LOC) — leading checkbox for non-destroyed cards; card border flips to `border-[hsl(var(--feature-deploy))]` when selected (glanceable in gallery view without a separate row-highlight rule).

### Plan deviations (known)

- **"Don't change" is form-level, not wire-level.** `BulkConfigDelta` has no per-field optional-skip sentinel — zero values are coerced by `WithDefaults()` to platform defaults, which would clobber every agent for any skipped field. The form resolves this by pre-filling skipped fields with the common-among-selection value, making a skipped-but-uniform field a true no-op for the BE. Skipped-but-divergent fields surface a yellow ⚠ warning so the operator sees the risk before submit. The Phase 8 exit-criterion demo case (5 agents, lifecycle flip only) works exactly as specified.
- **`<PlacementBanner>` extracted in Phase 7 but Phase 8 didn't re-use it.** The bulk preview renders `UpdateKind` per instance (from the dry-run response), not a placement check — `<PlacementBanner>` doesn't fit the one-banner-per-N-candidates shape. Phase 7's lift was speculative; deferring the second caller keeps the component surface tight.

---

## 0.10.2 — M5 Fleet Control Phase 7: Fleet Inspector + Region/Size/Replicas/Storage Columns + Per-Row Deployment / Start Buttons + Destructive-Confirm Modal (2026-04-26)

FE-only. The fleet list and gallery gain four new columns (Region / Size / Replicas / Storage); each row gains a `Deployment` action that opens a slide-over inspector and, for manual-lifecycle agents, a `Start` button. The inspector shows the live nine-field `DeployConfig`, lets the operator edit it via the shared `<DeploymentConfigForm>` (Phase 6), fires a `dry_run=true` preview via `UpdateAgentDeployConfig`, and applies on confirm. Region-change previews surface a destructive-confirmation modal with an explicit checkbox per resolved Q14. `<PlacementBanner>` extracted from `wizard.tsx` into a shared component. Zero backend, proto, schema, env, or dependency change. Type-check + lint + build clean.

- **`frontend/src/components/fleet/placement-banner.tsx`** (new, ~60 LOC) — shared five-state discriminated union (`idle | checking | ok | blocked | error`) extracted from `wizard.tsx`. Wizard import switched over; inline copy deleted (net −44 LOC from wizard).
- **`frontend/src/components/fleet/deployment-inspector.tsx`** (new, ~430 LOC) — `<Sheet>`-based slide-over. `<InspectorBody>` keyed on `open ? "open-${instance.id}" : "closed"` so each open starts in view mode (React `key`-as-reset, satisfying `react-hooks/set-state-in-effect`). Six-state `Mode` union:
  - **`view`** — read-only spec sheet of the nine live fields + conditional `PER-REPLICA VOLUMES` block (only when `instance.volumes.length > 0`, so M4-era agents without backfilled volumes see nothing).
  - **`edit`** — `<DeploymentConfigForm>` seeded from `deploymentValuesFromInstance`. Submit calls `runPreview`, which also enforces the volume-shrink client-side check (`if values.volumeSizeGb < instance.volumeSizeGb → toast.error`).
  - **`previewing`** — loading line during the dry-run round-trip.
  - **`preview`** — `UpdateResult`-driven confirmation: `LIVE_APPLIED` → green apply banner; `LIVE_APPLIED_WITH_RESTART` → amber restart banner; `REQUIRES_RESPAWN` → red destructive banner with explicit checkbox ("I understand this destroys the agent's memory and skills") + `<AlertDialog>` on confirm (two-step gate per Q14).
  - **`applying`** — loading line during the `dry_run=false` apply.
  - **`error`** — failure surface with `‹ back` button returning to view pane (preserves Sheet open for retry).
  - After a successful apply, `onChanged()` triggers a fleet-list refetch (same pattern Stop / Destroy use).
- **`frontend/src/components/fleet/agent-row-actions.tsx`** (updated, net +75 LOC) — `Deployment` button (always visible for non-destroyed rows) opens the inspector. `Start` button (visible when `lifecycle_mode=manual && status=stopped`) calls `StartAgentInstance` with toast feedback. Stop confirmation copy updated: "Manual-lifecycle agents can be started again from the fleet row; always-on agents are managed by Fly's auto-start."
- **`frontend/src/app/(app)/fleet/page.tsx`** (updated, net +75 LOC) — four new columns added to the list table: `Region`, `Size` (via `sizeLabel` / `describeSize`), `Replicas` (with yellow drift pip when `drift_summary` carries a `COUNT_MISMATCH`), `Storage` (replica-aware: `"5GB"` for 1 replica, `"10GB · 2×5GB"` for >1).
- **`frontend/src/components/fleet/agent-card.tsx`** (updated, net +30 LOC) — gallery card gains Region / Size + Replicas / Storage as compact text rows below the model row. Rows render conditionally so M4-era cards with zero values don't print empty `—` lines.

### Plan deviations (known)

- **Inspector resets mode via `key` prop.** The textbook `useEffect` reset trips `react-hooks/set-state-in-effect`; the `key`-on-open pattern is the codebase's established pattern since 0.8.1.
- **Volume-shrink check lives in `runPreview`, not in the zod schema.** The shared form has no `currentVolumeSizeGb` context; the submit-time toast is functionally equivalent to the field-level tooltip the plan described.
- **`<PlacementBanner>` lifted in Phase 7 but its actual second caller is Phase 8** (bulk preview). Extracted now to avoid a copy-paste across phases.

---

## 0.10.1 — M5 Fleet Control Phase 6: Spawn Wizard Step 4 Wired to `DeployConfig` + Review Placement Check Gates Deploy Button (2026-04-26)

FE-only. The spawn wizard's Step 4 (`[ COMING WITH FLEET CONTROL ]` stub rows from 0.9.1) becomes a live `<DeploymentConfigForm>` that collects the full nine-field `DeployConfig`. The widened `SpawnAgent` request from Phase 5 now carries a real `deploy_config` payload on the wire. Step 5 (Review) gains a `CheckDeploymentPlacement` red/green affordance that gates the Deploy button. Zero backend, proto, schema, env, or dependency change. Type-check + lint + build clean.

- **`frontend/src/lib/spawn/deployment-presets.ts`** (new, ~115 LOC) — eight preset chips (`shared-cpu-1x` → `performance-8x`; GPU presets hidden per Q3 / decision 3), `DEFAULT_DEPLOYMENT_VALUES` baseline (with `DEFAULT_REGION = "sin"` matching `backend/fly.toml` per resolved Q1 — plan body still read `iad`, resolved Q wins), `describeSize` helper that returns an exact preset id or an off-preset `Custom · 2x · 1.5GB` label. `REPLICA_BOUNDS` and `VOLUME_BOUNDS_GB` mirror the Go-side constants in `internal/deploy/types.go`; the migration's CHECK constraints are the safety net.
- **`frontend/src/components/fleet/deployment-config-form.tsx`** (new, ~395 LOC) — shared form extracted now (Phase 6) rather than deferred to Phase 7 to avoid a repeat of the M4 modal-vs-wizard duplication. Six field surfaces: `<RegionField>` (Select fed by a `useDeploymentRegions` hook; filters deprecated regions; write-through for custom values so the placement check is the safety net), `<SizeField>` (preset chips + Custom… toggle for direct `cpuKind`/`cpus`/`memoryMb` inputs), `<VolumeField>` (1–500 GB), `<ReplicasField>` (1–10, tooltip: "each replica gets its own volume — replicas don't share state"), `<RestartField>` (radio group; `maxRetries` input mounts conditionally when `on-failure` selected), `<LifecycleField>` (`idle-on-demand` / `suspended` rendered as disabled items with "Coming when secure agent endpoints ship" tooltip). Single `deploymentConfigSchema` (zod, ~50 LOC) mirrors Go-side bounds; `DeploymentFormValues` type exported for Phase 7 reuse.
- **`frontend/src/components/spawn/wizard.tsx`** (updated, net ~+10 LOC) — three edits: (1) `WizardFields` `lifecycle` + `replicas` flat pair replaced by nested `deployment: DeploymentFormValues`; `INITIAL_FIELDS` seeds from `DEFAULT_DEPLOYMENT_VALUES`. (2) `DeploymentStep` rewritten to mount `<DeploymentConfigForm>`; confirmed-state summary widens to six rows (REGION / SIZE / VOLUME / REPLICAS / RESTART / LIFECYCLE). (3) `ReviewStep` gains `PlacementState` discriminated union (`idle | checking | ok | blocked | error`), inline `<PlacementBanner>` (lifted to shared in Phase 7), and a `useEffect` keyed on `JSON.stringify(cfg)` that calls `CheckDeploymentPlacement` and disables `› DEPLOY AGENT` unless placement is `ok`. `onDeploy` now passes `deployConfig: deployConfigFromFields(state.fields.deployment)` on the wire (additive; the BE's `WithDefaults()` still handles callers that omit the field).

### Plan deviations (known)

- **`DEFAULT_REGION = "sin"` overrides plan body's `iad`.** Resolved Q1 in the plan's `Resolved questions` section (binding per its own preamble) sets `sin` to match `backend/fly.toml`; plan body was a pre-Q-resolution snapshot. Logged for Phase 10 docs-pass.
- **`<DeploymentConfigForm>` extracted in Phase 6, not Phase 7.** Avoids the inline-then-extract churn that produced the M4 modal-vs-wizard duplication. Costs ~30 LOC of indirection; saves Phase 7 a re-typing pass.

---

## 0.10.0 — M5 Fleet Control Phases 1–5: Backend Stack (Schema + 9-Field `DeployConfig` + Region Cache + Replica Loop + Lease-Aware Update + 7 New RPCs) (2026-04-26)

Five-phase backend stack for the M5 Fleet Control milestone. Additive across the board — M4 spawn / health / destroy paths are behaviorally unchanged. The new surface (seven Connect RPCs) is wired and callable but no FE yet consumes it; Phases 6–8 close that gap.

**Phase 1 — Schema + sqlc codegen.** `backend/migrations/20260426160000_fleet_control.sql` (`+goose Up` / `Down` transactional) adds nine columns to `agent_instances` (`region`, `cpu_kind`, `cpus`, `memory_mb`, `restart_policy`, `restart_max_retries`, `lifecycle_mode`, `desired_replicas`, `volume_size_gb` — all `NOT NULL WITH DEFAULT`) and creates the `agent_volumes` table + index. `backend/queries/agent_volumes.sql` adds five volume queries (`InsertAgentVolume`, `SetAgentVolumeMachine`, `UpdateAgentVolumeSize`, `ListAgentVolumesByInstance`, `DeleteAgentVolume`). `backend/queries/agent_instances.sql` gains four queries (`UpdateAgentDeployConfig`, `UpdateAgentReplicas`, `UpdateAgentInstanceVolumeSize`, `BulkUpdateAgentDeployConfig`). sqlc regenerates `agent_volumes.sql.go`, `agent_instances.sql.go`, `models.go` (AgentInstance +9 fields; new AgentVolume struct), and `querier.go` (+9 interface entries). Zero existing read queries widened; zero service-layer code touched.

**Phase 2 — `DeployTarget` interface widening.** `backend/internal/deploy/types.go` (new) defines `DeployConfig` (9 fields + `WithDefaults()` + `Validate()`), `Region`, `UpdateKind` enum, `PlacementResult`, `MachineState`, `VolumeRef`. `backend/internal/deploy/errors.go` (new) adds eight sentinels (`ErrInvalidRegion`, `ErrInvalidSize`, `ErrInvalidVolumeSize`, `ErrPlacementUnavailable`, `ErrLifecycleUnsupported`, `ErrMachineBusy`, `ErrVolumeShrink`, `ErrVolumeProvisionFailed`). `backend/internal/deploy/target.go` widens `DeployTarget` from 5 to 12 methods (`Update`, `Start`, `ListRegions`, `CheckPlacement`, `ListMachines`, `EnsureVolume`, `ExtendVolume` added; `Spawn` gains a `cfg DeployConfig` parameter; `SpawnResult` gains `MachineIDs []string`). `stubs.go` (`LocalDeployTarget` / `AWSDeployTarget`) and `fly.go` (`FlyDeployTarget`) each grow the seven new method stubs returning `ErrNotImplemented`. `service.go` Spawn call site passes `deploy.DeployConfig{}` (zero-value → `WithDefaults()` → byte-identical M4 behaviour). Full test suite green; compile-time interface-conformance assertions in `target_test.go` hold.

**Phase 3 — Real Fly-API compute implementations.** `backend/internal/deploy/fly.go` rewritten (~600 LOC, was ~290). Key additions: (1) `flapsClient` interface (subset of `*flaps.Client` the target reaches for; enables test injection without a live Fly API call). (2) `regionCache` type + field (`sync.RWMutex`-guarded snapshot; `NewFlyDeployTarget` fetches synchronously on boot, then refreshes on a 1 h goroutine; deprecated regions filtered at fetch time; sorted by `Code`). (3) `Spawn` rewritten as a replica loop (`for i := 0; i < cfg.DesiredReplicas; i++ { flaps.Launch(...) }`); volumes not yet mounted — Phase 3.5 gap. (4) `Update`: region-delta → immediate `UpdateRequiresRespawn` (no Fly calls); compute mutate under per-machine lease (`acquireLease` → `flaps.Update` → `flaps.Wait` → release); replica scale-up (`flaps.Launch` diff) and scale-down LIFO (`lifoTail` by `CreatedAt` desc). (5) `Start` / `Stop` wrapped in per-machine lease. (6) `ListMachines` projects to `MachineState`. (7) `CheckPlacement` via `flaps.GetPlacements`. `backend/internal/deploy/fly_test.go` (new, ~470 LOC) — 14 table-driven tests via `flapsClientFake`; no live Fly API calls in CI. All full-suite Go tests green.

**Phase 4 — Service layer.** `backend/internal/agents/fleet.go` (new, ~470 LOC) — six new `Service` methods: `UpdateDeployConfig` (load + validate + `CheckPlacement` + `PreviewUpdate` → dry-run or apply-with-respawn/live-apply branch), `StartInstance`, `ResizeReplicas`, `ResizeVolume` (per-volume `ExtendVolume` + `WithResizeVolumeTx`), `BulkUpdateDeployConfig` (`errgroup` + `semaphore.NewWeighted(3)` fan-out capped at 50), `DetectDrift` (5 drift categories). Types: `UpdateResult`, `BulkResult`, `BulkConfigDelta` (DeployConfig minus `VolumeSizeGB` per decision 8.4), `DriftReport` + `DriftCategory`. `service.go`: `SpawnInput`/`SpawnNInput` gain `DeployConfig`; `Spawn` validates + persists the nine fields inside the existing spawn tx via `UpdateAgentDeployConfig`; `agentQueries` interface widened; `ErrBulkLimit` sentinel added. `transactor.go`: `SpawnTx` gains `UpdateAgentDeployConfig`; new `ResizeVolumeTx` interface; `PgxTransactor` gains `WithResizeVolumeTx`. `target.go`: `DeployTarget` gains `PreviewUpdate` (dry-run companion to `Update`). `GetAgentInstanceByID` SQL widened to project the nine new columns. `service_test.go` extended with 19 new tests. Full suite green.

**Phase 5 — Proto IDL + Connect wire.** `shared/proto/corellia/v1/agents.proto` widened: 3 new enums (`UpdateKind`, `DriftCategory`, lifecycle enum), 9 new messages (`DeployConfig`, `Region`, `PlacementResult`, `MachineState`, `VolumeRef`, `DriftEntry`, `DriftSummary`, `UpdateResult`, `BulkResult`, `BulkConfigDelta`), `AgentInstance` widened with 11 new fields (9 deploy-config columns inlined as flat fields 13–21 + `DriftSummary` + repeated `VolumeRef`), `SpawnAgentRequest`/`SpawnNAgentsRequest` gain optional `DeployConfig deploy_config`, 7 new RPCs (`ListDeploymentRegions`, `CheckDeploymentPlacement`, `UpdateAgentDeployConfig`, `StartAgentInstance`, `ResizeAgentReplicas`, `ResizeAgentVolume`, `BulkUpdateAgentDeployConfig`). Generated trees (`backend/internal/gen/`, `frontend/src/gen/`) regenerated via `pnpm proto:generate` and committed. `agents_handler.go` extended with 7 new handlers (each <30 LOC per blueprint §11.9), 5 projection helpers, `agentsErrToConnect` widened with 9 M5-sentinel cases. `agents_handler_test.go` gains 9 new sentinel-mapping rows + 7 happy-path tests. `pnpm proto:generate` idempotent; `pnpm -C frontend type-check` clean on the regenerated TS shape.

### Behavior changes (known)

- `Spawn` now accepts and persists a `DeployConfig`. Callers that omit the field receive `WithDefaults()` coalescing (byte-identical M4 behavior). The nine new `agent_instances` columns must exist in the DB before any Spawn through the new wire path succeeds — `goose -dir migrations postgres "$DATABASE_URL_DIRECT" up` is hard-blocking from Phase 4 onward.
- `FlyDeployTarget.Spawn` now loops `cfg.DesiredReplicas` times. Zero value → 1 via `WithDefaults()`, so M4 callers still spawn exactly one machine.
- `Stop` now acquires a per-machine lease before stopping (was a direct `flaps.Stop` in M4). Transient lease contention surfaces as `ErrMachineBusy` → Connect `Aborted`.

---

## 0.9.5 — Hermes Adapter Re-Inspection: "CLI-Shaped" Framing Superseded; v0.11.0 Already Ships `AIAgent` + FastAPI Runtime; Sidecar Plan Filed (2026-04-26)

Doc-only correction triggered by an ahead-of-time feasibility probe for a planned Corellia-side chat surface against deployed Hermes agents. M3's discovery (changelog 0.5.0 §525, §549) recorded Hermes 0.x as **CLI-shaped, no `/health`, no `/chat`** and queued a v1.5 "sidecar HTTP wrapper in front of `hermes chat`" as the closure path. Re-inspection of the same pinned digest (`sha256:d4ee57f254aabbe10e41c49533bbf3eb98e6b026463c42843a07588e45ddd338` = `nousresearch/hermes-agent:v2026.4.23` = "Hermes Agent v0.11.0", which **remains the latest stable upstream release** as of this entry — verified against the GitHub releases API; v0.12.0 does not exist; the `:latest` Docker Hub tag tracks HEAD-of-main and is not stable) shows the M3 inspection was incomplete. The image already ships an importable `AIAgent` Python class (`run_agent.py`), `hermes -z`/`hermes chat -q` non-interactive modes, a FastAPI dashboard (`hermes_cli/web_server.py`, proves `fastapi`+`uvicorn` are present in the image via the `[all]` extra the upstream Dockerfile installs), SQLite-backed sessions (`hermes_state.SessionDB`) under `$HERMES_HOME/sessions/` with `--session-id` resume, and a long-running multi-session pattern (`gateway/run.py`, `gateway/session.py`) that already wires `AIAgent` into a daemon loop dispatching messages from Telegram/Slack/Discord. The actual gap is the absence of a Corellia-shaped `POST /chat` + `GET /health` bound to the Fly machine's external port — significantly smaller than "Hermes is server-less, sidecar must compensate for an entirely missing runtime." Patch version: doc-only, no source change beyond the README + changelog edits, no schema/migration, no proto change, no dependency change, no digest bump.

- **`adapters/hermes/README.md` — "Known limitations" §1 rewritten end-to-end.** New version names the four upstream surfaces M3 missed (`AIAgent`, oneshot CLI, FastAPI dashboard, sessions, gateway), explicitly identifies what *is* missing (Corellia-shaped `/chat` + `/health` bound externally), and forward-points to `docs/plans/hermes-chat-sidecar.md`. Old framing preserved by reference to the superseded entries (0.5.0 §525 + §549 + this section's prior version) per the changelog convention "When a decision contradicts an earlier one, note the supersession in the new entry rather than editing the old one."
- **`adapters/hermes/README.md` — Smoke section's `/health`-poll explanation tightened.** Was: "Hermes 0.x is a CLI-shaped agent — it does not expose `/health`." Now: "The adapter does not start any HTTP listener today, so the smoke has nothing to probe." Same concrete behaviour, accurate framing — the adapter chooses not to start the dashboard, so externally there *is* no listener; the dashboard could in principle be exposed but isn't what we'd want at `/chat` anyway.
- **`docs/plans/hermes-chat-sidecar.md` filed.** New plan doc laying out where the sidecar lives (inside the existing `adapters/hermes/` directory tree as a small Python source dir, baked into the image at build time via the existing Dockerfile's `COPY` discipline), how it's supervised alongside `hermes` (extends today's POSIX-shell `entrypoint.sh` into a two-process supervisor), how it surfaces externally (Fly machine `services` block routes `:443` → internal `:8642`, paired with a per-instance `CORELLIA_SIDECAR_AUTH_TOKEN` Fly app secret), and how it ties into the existing spawn wizard at `/spawn/[templateId]` Step 4 ("ability to chat to this agent" toggle, default-on). Plan structures the work into seven phases: (1) sidecar source + lockfile, (2) Dockerfile + entrypoint extension, (3) machine-config service block in `FlyDeployTarget`, (4) per-instance auth token plumbing, (5) Corellia-side `/chat` proxy RPC + FE chat UI, (6) `/health` probe wired into M4's `Health()`, (7) integration smoke + adapter image rebuild + GHCR push + migration to bump `adapter_image_ref` to the new digest.

### Behavior change (known)

- **None at runtime.** No Go code changed, no proto changed, no migration, no Dockerfile changed (yet — sidecar plan's Phase 2 is the first runtime-affecting change). The deployed adapter image is bit-identical to what shipped at 0.5.0.

### Resolves

- **Operator question (live, 2026-04-26):** "Is a chat sidecar even technically feasible given how Hermes is designed?" Answer: yes, and the surface is already in the image we deploy today; no upstream patch required, no digest bump required. M3's "queue this for v1.5" framing was correct; what was wrong was the implied magnitude of the gap.

### Supersedes

- **0.5.0 §525** ("Hermes 0.x is **CLI-shaped, not server-shaped** — no built-in `/health`, no `/chat`. … v1.5 follow-up: sidecar HTTP wrapper exposing `POST /chat` forwarding to `hermes chat -q "..."`"). The sidecar follow-up stands; the "Hermes is CLI-shaped" assertion is too strong for v0.11.0 and the recommended sidecar implementation strategy shifts from "shell out to `hermes chat -q`" to "import `AIAgent` in-process" — same outcome, lower per-request latency and explicit session reuse.
- **0.5.0 §549** ("v1.5 sidecar HTTP wrapper exposing `POST /chat` + own `/health`. Separate plan because it touches harness-contract design"). Plan is now filed at `docs/plans/hermes-chat-sidecar.md`.
- **`adapters/hermes/README.md` "Known limitations" §1 prior version.** Replaced; old framing preserved by reference to this changelog entry.

### Known pending work

- **The same overstated framing appears in three other places that this entry deliberately leaves untouched** to keep doc churn tight per the "live code is authoritative; this file stays still" stance: `docs/blueprints/adapter-image-blueprint.md` lines 90 + 420 + 570, `docs/refs/fly-commands.md` line 216, and the comment block in `adapters/hermes/smoke.sh` line 12. Each is accurate as a record of what M3 understood at the time; correcting them is a follow-up doc-pass when the sidecar plan reaches Phase 2 (the first phase that materially changes the adapter image) — at which point they'll be edited as part of the same PR rather than as a separate sweep.
- **Sidecar plan execution itself** — Phases 1–7 of `docs/plans/hermes-chat-sidecar.md`. Plan is written, not started.

---

## 0.9.4 — Spawn Wizard Review Touchups: Deterministic Deploy-Log Cleanup + `inert` on Future Steps (2026-04-26)

Two FE-only nits surfaced by the post-Phase-6 review of the spawn redesign (0.9.0–0.9.2). Both in `frontend/src/components/spawn/wizard.tsx`; zero backend, proto, schema, env, or dependency change. Type-check + lint clean. Patch version: no new product surface, no RPC change, no schema/migration; one new state discriminant, one DOM attribute.

- **`DeployState` gains a `succeeded` discriminant; `onDeploy` flips to it before `router.push("/fleet")`.** The synthetic-log `setInterval` (Phase 5) lives in `<DeployLog>` and cleans up via React effect when `deploy.kind !== "deploying"`. Pre-0.9.4, the cleanup ran *implicitly* on route unmount — correct today, fragile if a future change ever adds a delay between RPC success and navigation. Now the parent transitions through `succeeded` first: cleanup fires deterministically, the log stays visually mounted (no flash of wizard chrome), and the navigation lands a frame later. The `<DeployLog>` line-rendering branches off the same kind so the in-flight log freezes on the final visible state until the route swap.
- **`StepShell` future-step wrapper gets `inert={isFuture || undefined}`.** Previously `pointer-events-none opacity-40` blocked clicks but left the (invisible) ghost `[ EDIT ]` button keyboard-focusable in not-yet-confirmed steps. `inert` removes the subtree from the tab order *and* the a11y tree, matching the visual disabled state. Standard HTML attribute, well-supported across modern browsers; no polyfill, no ARIA shimming.

### Resolves

- Two `should-fix` items from the spawn-redesign review (post-0.9.2). The third recommended action — reconciling `docs/executing/fleet-control.md`'s "deploy modal" references against the wizard — also shipped in this pass; doc-only, not changelogged separately.

---

## 0.9.3 — `/presentation` Route Skeleton: 5-Slide Deck for Hackathon Demo Video (Click-Advance, Reuses Nebula + TerminalContainer) (2026-04-26)

Tangible scaffold for the ~60s narrative half of the 3-min Anthropic Opus 4.7 hackathon submission video. New public top-level route `/presentation` (sibling of `/sign-in`, no auth), discrete-slides shape per the operator's Q2 → option (b) resolution: click / Space / → advances, Shift+Space / ← goes back, `1`–`5` jump, `Home` / `End` jump to ends. Chrome (top callsign strip + bottom progress dots) stops click propagation so dot-clicks don't collide with the slide-body advance. Five slide components, one file each — copy/layout/timing locked first; 3D scene polish deferred to the design phase per the plan's "out of scope" note. All FE-only: zero backend, proto, schema, env, or dependency change. Reuses `<TerminalContainer>`, `<NebulaAvatar>`, `<AvatarFallback>`, `HARNESSES`, `<Button>` and existing feature-color + status tokens — Three.js / R3F already in the bundle from 0.6.x + 0.8.x. Type-check + lint clean. Plan: `docs/plans/presentation-plan.md`.

- **`frontend/src/app/presentation/{layout,page}.tsx`** — route entry. `metadata.title = "Presentation"` (composes via root template to `Presentation — Corellia`). Black-background `<main>` mounts the client `<Deck>`.
- **`frontend/src/components/presentation/deck.tsx`** — keyboard + click controller. Five-entry `SLIDES` const drives state; `next` / `prev` / `goto` are `useCallback`'d and stable. Whole surface is the click target (`role="button"`); inputs/textareas opt out defensively though no slide has any today.
- **`frontend/src/components/presentation/slide-frame.tsx`** — persistent chrome. Top strip shows `CORELLIA · CONTROL PLANE` + `[ NN / 05 ] · TITLE`; bottom strip carries `‹ PREV` / progress dots / `NEXT ›`. Dots are real buttons (jump-to). Click-advance hint pinned at bottom-12 in muted register.
- **`frontend/src/components/presentation/slides/slide-1-hook.tsx`** — count-up 1 → 1,247 over 2.2s with cubic-ease, against a 120-node SVG field that reveals proportionally. Pseudo-deterministic node placement (`(seed * 31) % 1000` so the field renders identically on every mount).
- **`frontend/src/components/presentation/slides/slide-2-problem.tsx`** — 5 tool labels (LangGraph / Composio / Portkey / LangSmith / Fly·AWS) light up with a 250ms stagger. `setInterval` cleared on unmount.
- **`frontend/src/components/presentation/slides/slide-3-solution.tsx`** — circular bay of the same 6 harnesses as `/spawn` (sourced from `@/lib/spawn/harnesses` — single source of truth, can't drift), arranged on a 280px-radius circle. Hermes gets the live `<NebulaAvatar size={120}>` (the page's one canvas per decision 21); the other 5 get `<AvatarFallback>`. CORELLIA hub at center with dashed connection lines drawn in SVG.
- **`frontend/src/components/presentation/slides/slide-4-how.tsx`** — split-panel `<TerminalContainer>` pair. Left (`accent="catalog"`) = stack diagram (Frontend → Wire → Domain → DeployTarget → Fly.io); right (`accent="adapter"`, `meta="OPUS 4.7"`) = adapter generation pipeline (`github → analyze → corellia.yaml + adapter image`). Caption pins the Opus 4.7 angle: tree-sitter + README + Dockerfile → validated manifest. The 20% Opus criterion lives here.
- **`frontend/src/components/presentation/slides/slide-5-handoff.tsx`** — `<NebulaAvatar harness="hermes" size={320}>` center-stage + single `<Button render={<Link href="/spawn" />}>` CTA. Q4 → real route transition (not a recorded splice), so the dark register + nebula visual language carry across the seam — the deck *becomes* the product.

### Behavior change (known)

- **`/presentation` is a public route.** No auth gate. Sibling of `/sign-in` at the top level — does not enter the `(app)` group.
- **Click anywhere on the slide advances.** Chrome (top strip, dots, prev/next buttons) stops propagation so its own clicks behave normally.
- **Slide 5's CTA performs a real client-side navigation to `/spawn`.** Demo handoff is a route transition, not a video splice.

### Known pending work

- **3D scene polish** for slides 1–4 (camera pull-back on hook, fragmenting tool labels on problem, orbiting bay on solution, repo-flying-into-Opus animation on how) — deferred to the design phase per the plan's "out of scope" §.
- **Q1 / Q3 / Q4** of `presentation-plan.md` still open (Opus angle product-vs-process, voiceover-vs-text, slide-5 transition mechanism — current scaffold lands on real-route-transition for Q4, leaves Q1 + Q3 untouched).

### Resolves

- **`docs/plans/presentation-plan.md` Q2 — discrete slides (option b).** Click / Space / arrow advance shipped end-to-end.

---

## 0.9.2 — Spawn Page Redesign Phase 6: Cleanup + Docs Reconciliation (Modal + Shim Deleted, design-system.md §34 Reset) (2026-04-26)

Closes the eight-resolved-Q `agents-ui-mods.md` plan: Phase 6 takes out the orphan code Phases 1–5 left behind and reconciles the two docs that diverged from implementation along the way. All FE-only: zero backend, proto, schema, env, or dependency change. Type-check + lint + build all green; `next build` route table no longer lists `/agents`. Patch version (not minor) per the 0.5.1 / 0.7.3 / 0.7.5 / 0.9.1 precedent for non-product structural follow-up *within* a milestone-bracketing minor: 0.9.0 booked the visual flip + new wizard route, 0.9.1 booked the functional wire-up, 0.9.2 books the cleanup. No new product surface, no new RPC, no schema/migration. Plan: `docs/executing/agents-ui-mods.md` §4 Phase 6. Completion notes: `docs/completions/agents-ui-mods-phase-6.md`.

- **`frontend/src/components/agents/deploy-modal.tsx` deleted** (492 LOC). The M4 deploy-modal — the `<Dialog>`-based spawn entry shipped in 0.7.0 — was orphan code from 0.9.0 onwards once the `/agents` → `/spawn` rename redirected the only caller. Phase 5 (0.9.1) deliberately scoped *around* the modal because the wizard's schemas had been lifted from it verbatim and the duplication was scheduled to evaporate the moment the modal was deleted. 0.9.2 deletes the modal; the duplication evaporates as planned (the wizard now owns the canonical copy of `PROVIDERS`, `sharedFields`, the API-key inline copy, and the `oneSchema` shape). The empty `frontend/src/components/agents/` directory disappears with the deletion (git tracks files, not directories — `git rm` removes the entry).
- **`frontend/src/app/(app)/agents/page.tsx` deleted** (5-line `redirect("/spawn")` shim from Phase 1, 0.9.0). Q12's resolution carved one release of redirect courtesy; 0.9.0 + 0.9.1 covered that window. From 0.9.2 onward, **`/agents` 404s** rather than 308-redirects. Acceptable because (a) the route never lived in production with users on it — the rename happened the same day the new surface shipped, (b) the redirect shim's stated lifetime was "one release" per the operator's explicit resolution, (c) internal `<Link href="/agents">` references were swept in Phase 1 (`dashboard/page.tsx` ×2 + `fleet/page.tsx` ×1) and have been pointing at `/spawn` ever since. Empty `frontend/src/app/(app)/agents/` directory disappears with the deletion.
- **`CLAUDE.md` — added six-line "Frontend route map (App Router)" subsection.** Pinned under the contract-boundary subsection. Names the two spawn routes (`/spawn` roster + `/spawn/[templateId]` wizard), notes the rename + shim removal, lists the other authenticated routes for completeness, and explicitly records that **there is no `<DeployModal>`** — the wizard is the sole spawn entry point. Surface kept minimal on purpose: CLAUDE.md is not a route catalog, this is the floor that keeps a future contributor from reaching for the deleted modal. The rest of CLAUDE.md is untouched per its own opening rule ("live code is authoritative; this file stays still") — doc churn stays tight.
- **`docs/refs/design-system.md` §33.5 + §34.1 + §34.3 + §34.4 reconciled with implementation.** Four subsections rewritten where the prescribed shape diverged from what shipped in Phases 1–5:
  - **§33.5** was a one-liner pointing at §34. Replaced with a self-contained note covering both spawn routes — the roster (`/spawn`) and the wizard (`/spawn/[templateId]`) — with the active/locked card distinction (one canvas page-wide per decision 21), the `[ AVAILABLE HARNESSES ]` vocabulary (Q10), and the `[ LOCKED ]` non-button affordance per blueprint §11.4.
  - **§34.1** had the original 6-step layout (`PICK HARNESS → NAME AGENT → PICK PROVIDER → PASTE API KEY → PICK MODEL → DEPLOY`). Replaced with the shipped 5-step layout (`HARNESS → IDENTITY → MODEL → DEPLOYMENT → REVIEW`) per decision 19. Feature-color accents per the plan's Phase-4 spec: `catalog cyan / secrets pink / adapter violet / deploy blue / running green`. Added the `ACTIVE` / `CONFIRMED` / `PENDING` text-tag note from Phase 4 — meta-slot tagging is what makes step state scannable without color, which the original §34.1 omitted.
  - **§34.3** described the M4 redirect target as `/agent/[id]`, which never shipped — M4 has always redirected to `/fleet`. Rewrote to describe the actual streaming-log surface from Phase 5: synthesized lines on a 600 ms `setInterval`, RPC fires in parallel, decorative not load-bearing for the redirect, error path flips to `failed` accent + `› BACK TO REVIEW` button. Redirect target corrected to `/fleet`.
  - **§34.4** was the Spawn-N variant (count input on Step 6, name-prefix on Step 2). Decision 11 dropped Spawn-N from the wizard scope. Renamed the section "Spawn-N (deferred)" and rewrote it to record the deferral + the deferred-decisions framing (returns later as a fleet-page action composing with M5's bulk-apply, not a wizard variant).
  - **§34.2** (the `Confirm` button pattern) is unchanged — it shipped verbatim.

### Behavior change (known)

- **`/agents` returns 404** on direct navigation. Previously 308-redirected to `/spawn`. The bookmark-courtesy lifetime was one release per Q12; 0.9.0 + 0.9.1 covered it.
- **`<DeployModal>` is gone from the codebase.** No caller imports it; no UI surfaces it. The wizard is the only spawn entry point.
- **`next build` route table** lists `/spawn` (static) + `/spawn/[templateId]` (dynamic); `/agents` is absent. `/spawn/[templateId]` is the only `ƒ` (dynamic) route in the (app) tree.
- **`type-check + lint + build`** all green.

### Stale-cache gotcha worth recording

The first `type-check` after `git rm` of `agents/page.tsx` failed with `.next/types/validator.ts(42,39): error TS2307: Cannot find module '../../src/app/(app)/agents/page.js'`. Same pattern documented in 0.9.0 Phase 1 ("the first `type-check` after the `git mv` failed because `.next/types/validator.ts` still referenced `agents/layout.js` — `rm -rf .next` before re-running"). Fix is identical: `rm -rf .next` and re-run. Recurring pattern — every route deletion needs a `.next` clear before validation.

### Resolves

- **Phase 6 of the `agents-ui-mods.md` plan.** All six phases shipped end-to-end: route rename + nebula avatar + roster page + wizard shell + functional fields + cleanup.
- **Q12's redirect-shim window** (carved in 0.9.0 as "one release only, then deleted").
- **Phase 5's "modal stays in the tree as orphan code awaiting Phase-6 deletion" deferral** (0.9.1).

### Known pending work

- **Manual UI smoke pass** owed per the 4-check Phase-6-specific list in `docs/completions/agents-ui-mods-phase-6.md` (verify `/agents` 404s; verify `deploy-modal` returns zero source hits; sidebar nav highlights correctly on `/spawn` and `/spawn/[templateId]`). Phase-5's 10-check user-flow list is *unchanged* — Phase 6 deletes orphan code, so user-visible behavior is identical.

### Supersedes

- **0.9.0 Phase 1's redirect shim** — `/agents` no longer redirects, it 404s. Q12's one-release lifetime exhausted across 0.9.0 + 0.9.1.
- **0.9.1's "modal stays in the tree as orphan code"** — the modal is gone.
- **`design-system.md` §34.1's original 6-step layout** — replaced with the shipped 5-step layout per plan decision 19.
- **`design-system.md` §34.3's `/agent/[id]` redirect target** — corrected to `/fleet`. The agent-detail route was never built; the M4 spawn flow has always landed on the fleet view.
- **`design-system.md` §34.4's "Spawn-N Variant" as a wizard mode** — replaced with the deferral note per plan decision 11.

---

## 0.9.1 — Spawn Page Redesign Phase 5: Wizard Fields Wired to `spawnAgent` + Streaming-Log Surface (2026-04-26)

Closes the spawn-redesign regression window 0.9.0 left open: the `/spawn/[templateId]` wizard goes from "navigable shell with stub bodies" to "functional spawn flow that actually deploys an agent." All FE-only: zero backend, proto, schema, env, or dependency change. Type-check + lint + build all green. Patch version (not minor) per the 0.5.1 / 0.7.3 / 0.7.5 precedent for non-product structural follow-up *within* a milestone-bracketing minor: 0.9.0 already booked the visual-identity flip + new wizard route; 0.9.1 adds no new product surface, no new RPC, no schema/migration — it just puts real fields under the Phase-4 step shell and points the deploy CTA at the same `spawnAgent` RPC the M4 modal has been calling since 0.7.0. The deploy-modal wire path is now reachable from the spawn page again, this time as a multi-step wizard. Plan: `docs/executing/agents-ui-mods.md` §4 Phase 5. Completion notes: `docs/completions/agents-ui-mods-phase-5.md`.

- **`frontend/src/components/spawn/wizard.tsx` — `<StubBody>` placeholders replaced with real react-hook-form + zod field surfaces, gaining ~500 LOC over Phase 4's shell.** Six discrete additions inside the same file (split deferred — section-rule comments organise the file cohesively at ~870 LOC):
  - **Step 2 // IDENTITY** — `identitySchema = z.object({ name: z.string().trim().min(1).max(80) })`. Single autoFocused name input. Submit handler dispatches `setField` then `confirm`. **Schema lifted verbatim from `deploy-modal.tsx`** to avoid drift between the modal (still in tree as orphan code) and the wizard.
  - **Step 3 // MODEL** — `modelSchema` carries the same `provider` / `modelName` / `apiKey` shape as the modal's `sharedFields`. Provider Select → model Input → API key Input with `EyeIcon` / `EyeOffIcon` show/hide toggle. **Inline copy preserved verbatim:** *"Forwarded once to the agent's secret store. Never written to Corellia's database."* Schema + UI shape lifted from the modal so the wire contract is identical.
  - **Step 4 // DEPLOYMENT** — first real input surface for the M5 integration shape. `deploymentSchema = { lifecycle: z.enum(["always-on","manual"]), replicas: z.number().int().min(1).max(10) }`. Both surface as live inputs (Select + numeric Input). **Crucially: neither field is sent on the wire.** The M4 `SpawnAgentRequest` proto has no fields for them; they're collected client-side and dropped at the request boundary. M5's `DeployConfig` proto is where they go on the wire (one-line addition then). The four M5-deferred knobs (`REGION` / `SIZE` / `VOLUME` / `RESTART`) stay below the inputs as `[ COMING WITH FLEET CONTROL ]` real-interface stub rows per blueprint §11.4. Replicas cap of 10 mirrors the v1 `count` cap on `manySchema` from the modal — not arbitrary.
  - **Step 5 // REVIEW** — read-only 7-row `<dl>` summary (HARNESS / NAME / PROVIDER / MODEL / API KEY / LIFECYCLE / REPLICAS). API key surfaces via `maskApiKey()` as `••••••••<last4>` — fixed 8-dot prefix regardless of true length, so the mask doesn't leak length information. `› DEPLOY AGENT` button fires the parent `<Wizard>`'s `onDeploy`.
  - **`onDeploy` calls `api.agents.spawnAgent({ templateId, name, provider: proto, modelName, modelApiKey: apiKey })`** — single-spawn only per decision 11; `spawnNAgents` stays on the wire but is unreached from this UI. Success → `router.push("/fleet")` (matches M4 modal redirect-to-fleet behaviour).
  - **Confirmed-but-not-current step bodies** render a compact `<ConfirmedSummary>` (a `<dl>` of label/value rows reading off `state.fields`) instead of the full form. Cascading invalidation contract unchanged from Phase 4: clicking `[ EDIT ]` un-confirms the target step + every step downstream; `defaultValues` re-seed from `state.fields` so re-editing preserves prior input.
- **`<DeployLog>` streaming-log surface — new component, ~50 LOC, replaces the wizard chrome during deploy.** New `DeployState` discriminated union (`{ kind: "idle" } | { kind: "deploying"; lines: string[] } | { kind: "error"; lines: string[]; message: string }`) sits alongside the Phase-4 reducer state. When non-`idle`, the `<Wizard>` early-returns to `<DeployLog>` and the entire 5-step chrome unmounts. A `setInterval` ticks every 600 ms appending lines from the module constant `SYNTHETIC_LINES` = `["› creating fly app…", "› setting secrets…", "› launching machine…", "› awaiting health-check…"]`. Lines are **decorative** per decision 14 — they don't reflect real BE lifecycle events; whichever resolves first wins (typical happy path: RPC succeeds at ~1–2s, `router.push("/fleet")` unmounts the log surface mid-stream; less-typical: all 4 lines emit and the log just stays on the last line until the RPC resolves). On RPC error: appends a `› error: <message>` line, flips to `failed` accent, renders `› BACK TO REVIEW`. Clicking it sets `deploy` back to `idle` which re-mounts the wizard with all 5 steps still confirmed (the `useReducer` state was preserved underneath — operator can `[ EDIT ]` any step and resubmit without re-typing). The `<DeployLog>` prop is typed as `Exclude<DeployState, { kind: "idle" }>` so TypeScript narrows `deploy.lines` inside the component without an `if (kind === "idle") return null` boilerplate; the parent's contract that it never renders the log with `idle` is encoded in the type.
- **Bullet on the provider→proto duplication.** The `PROVIDERS` array (`{value, label, proto}` triples) is lifted from `deploy-modal.tsx` and now exists in two files. **Deliberate: no new shared helper.** Three lines, two callers, one of which (the modal) is scheduled for deletion in Phase 6 — extracting to `lib/spawn/providers.ts` now would create a one-line abstraction that exists only between Phase 5 ship and Phase 6 ship. The duplication resolves naturally when Phase 6 deletes the modal.

### Behavior change (known)

- **`/spawn/[templateId]` is functional end-to-end.** Roster `› SELECT` → wizard 5 steps → `› DEPLOY AGENT` → fleet view, with a real Fly app spun up at the end. Same wire shape as the M4 deploy-modal.
- **The deploy-modal flow remains in the tree but is unreachable.** Nothing imports it as of 0.9.0; nothing imports it after 0.9.1. Phase 6 deletes it.
- **`lifecycle` + `replicas`** are collected and validated client-side, surfaced in the review summary, and **dropped at the request boundary**. M5's `DeployConfig` proto is the right place for them, not this plan. The wire path is byte-equivalent to the M4 modal's payload.
- **Streaming-log lines are synthetic.** A `setInterval` at 600 ms emits 4 decorative lines while the RPC fires in parallel. Real per-step BE events arrive in M5+ via streaming RPCs. The current behaviour is "decorative log + unconditional success/error branch" — the log is not load-bearing for the redirect.
- **Deploy errors don't lose wizard state.** `› BACK TO REVIEW` returns to the wizard with all 5 steps still confirmed; the operator edits whatever was wrong (typically the API key) without re-typing the rest. Refresh still wipes everything per decision 8.
- **API key still never persists outside the in-flight RPC.** The whole wizard is ephemeral; refresh wipes the key. The Step-5 review surfaces it masked (`••••••••<last4>`) so the operator can sanity-check the last few characters without unmasking.
- **`type-check + lint + build`** all green — same exit gate Phase 4 had; the runtime gates (a successful round-trip + a deliberately failed round-trip producing a streaming-log error line) are owed on the next `overmind start` boot per the v1 testing posture.

### Resolves

- **Phase 5 of the eight-resolved-Q `agents-ui-mods.md` plan.** Plan §4 Phase 5 exit criteria all met at the `type-check + lint + build` boundary; the two runtime gates (successful end-to-end deploy + deliberately failed deploy producing a streaming-log error line) are pinned for the next dev-server boot per the v1 manual-smoke posture.
- **0.9.0's `Phase 4 closes navigation; Phase 5 closes the flow` deferral.** The wizard route is now functionally complete.

---

## 0.9.0 — Spawn Page Redesign Phases 1–4: `/agents` → `/spawn` Rename + `<NebulaAvatar>` + Roster Page + Wizard Shell (2026-04-26)

The first four phases of the `/spawn` page redesign — bundled as one minor release because they form a single visual + structural shift that's only partially shippable mid-stream (Phase 3 deliberately opens a `› SELECT → 404` regression window that Phase 4 closes; releasing 1–3 alone would leave the spawn flow unreachable from the roster). Phases 5–6 (real wizard fields wired to `spawnAgent` + `deploy-modal.tsx` deletion + `/agents` shim removal + CLAUDE.md/changelog reconciliation) ship in a follow-on release. All FE-only across all four phases: zero backend, proto, schema, env, or dependency change. Type-check + lint + build all green at every phase boundary. Plan: `docs/executing/agents-ui-mods.md`. Completion notes: `docs/completions/agents-ui-mods-phase-{1,2,3,4}.md`. Minor version (not patch) because (a) the `/agents` URL is gone (308 shim only, deleted in Phase 6), (b) the spawn page's visual identity flips from "two grids of template cards" to "character roster of harnesses," (c) the spawn flow gains a brand-new wizard route, and (d) three components are deleted and four added.

- **Phase 1 — Route rename + sidebar copy + redirect shim.** `frontend/src/app/(app)/agents/{page,layout}.tsx` `git mv`'d to `frontend/src/app/(app)/spawn/{page,layout}.tsx` (blame preserved). New 5-line `agents/page.tsx` shim issues a server-side 308 to `/spawn` via `next/navigation`'s `redirect()` — no client flash, no empty-page paint. Sidebar nav item flipped `Agents → Spawn`, `href: "/agents" → "/spawn"`; the active-state predicate (`pathname === item.href || pathname?.startsWith(${item.href}/)`) resolves correctly for `/spawn` *and* the future `/spawn/[templateId]` wizard sub-route without extra wiring. Page H1 `AGENTS → SPAWN`; section tag `[ DEPLOY ] → [ LAUNCHPAD ]` (intent-as-label, mirrors 0.7.2 rationale); `metadata.title` `Agents — Corellia → Spawn — Corellia`. Internal sweep: three `<Link href="/agents">` references in `dashboard/page.tsx` (×2) + `fleet/page.tsx` (×1) repointed. **Stale-cache gotcha worth recording:** the first `type-check` after the `git mv` failed because `.next/types/validator.ts` still referenced `agents/layout.js` — `rm -rf .next` before re-running. Recurring pattern (Phase 6 deletes `agents/` outright).
- **Phase 2 — `<NebulaAvatar>` component (visual scaffold, no integration yet).** Five new files under `frontend/src/components/spawn/` and `frontend/src/lib/spawn/`. `nebula-avatar.tsx` is the public wrapper: branch ladder is RM-gate → WebGL2-gate → IO-lazy-mount-gate → live R3F canvas, with `useSyncExternalStore` for the static feature flags (eslint's `react-hooks/set-state-in-effect` blocks the textbook `useEffect` + `setState` pattern, same encounter as 0.8.1's `useFleetView` — the lesson generalised cleanly to "don't regress to the effect pattern when adding the next static feature flag"). `nebula-scene.tsx` is the inner R3F scene, dynamic-imported (`ssr: false`), composing two layers — `<PrimaryCloud>` (~2.5K particles, sigma 0.42, 3-octave noise displacement modulated by `uLowAmp`/`uMidAmp`/`uCoherence`) + `<CoreMotes>` (~500 particles, sigma 0.098 — the buzzing-core contrast against the slow-moving primary). Wisp Tendrils dropped (too soft to read at 240px). `nebula-shaders.ts` is two GLSL strings adapted from `docs/refs/elephantasm-animation.md`, downsized for a card-sized avatar; **shares `SIMPLEX_NOISE_GLSL` with sign-in via import from `@/components/sign-in/shaders/simplex-noise`** (open seam — recorded in the Phase 2 completion note: lift to `frontend/src/lib/shaders/simplex-noise.ts` when the third caller arrives, not now). `mood-palettes.ts` defines `MoodPalette` (pearl base + 4 accent tints + 4 mutually-irrational sine frequencies + 4 mix intensities + `(x, y, depth)` spatial weights + `fallbackAccentHsl`); only Hermes ships in this phase per decision 6. `avatar-fallback.tsx` is the static SVG schematic — hairline concentric ellipses + soft radial halo in the harness's accent stroke — used when reduced-motion is on, when WebGL2 isn't available, and (Phase 3 onward) for every locked card per decision 13's performance ceiling. **No new dependencies installed** — `three`, `@react-three/fiber` were already in the bundle from sign-in; decision 2's ≤200 KB gzip budget was already paid by 0.6.x. Component is dark today; Phase 3 is the first import.
- **Phase 3 — Roster page replaces today's two-grid stack.** `frontend/src/app/(app)/spawn/page.tsx` rewritten end-to-end: the `[ AVAILABLE HARNESSES ]` + `[ PLANNED HARNESSES ]` two-`TerminalContainer` stack collapses to one `[ AVAILABLE HARNESSES ]` container holding a single `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` of six cards (1 active Hermes + 5 locked) per Q10's roster framing. New `frontend/src/lib/spawn/harnesses.ts` carries the §3.5 lineup: Hermes (`available`), OpenClaw (`locked`, vendor TBD), Claude Agent SDK (`locked`, Anthropic), DeepAgents (`locked`, LangChain), SuperAGI (`locked`), OpenFang (`locked`); each entry's `key` is typed as `HarnessKey` so harness data + mood palette + avatar fallback all key off the same identifier set (adding a harness is a two-step diff: append palette, append entry). New `frontend/src/components/spawn/roster-card.tsx` is one component dispatched on a `kind` discriminant (active/locked) — replaces both deleted `agent-template-card.tsx` and `coming-soon-harness-card.tsx`; chrome shape is identical between variants, divergence is in the avatar slot (`<NebulaAvatar>` vs `<AvatarFallback>`), the spec-sheet rows (active = `HARNESS / ADAPTER / DEPLOY`, locked = `VENDOR / STATUS / ETA`), the footer affordance (active = `› SELECT` button to `/spawn/[templateId]`, locked = `[ LOCKED ]` `<span aria-disabled>`, *not* a disabled button — a span renders no cursor change at all per plan), and the outer chrome (active gets `hover:border-feature-catalog/60` lift, locked gets `opacity-70` + no hover). **Decision 21's "exactly one canvas page-wide" enforced at the data layer**: only Hermes has `status: "available"` in v1, so only the active card ever renders the live nebula. `mood-palettes.ts` widens `HarnessKey` from the literal `"hermes"` to the six-key union and ships best-guess palettes for the five locked harnesses (only used by `<AvatarFallback>`'s SVG accent stroke in v1). The `RosterCardSlot` dispatch helper is kept inline (14 lines, no behaviour beyond "find matching template, fall back to locked"). Three deletions: `agent-template-card.tsx`, `coming-soon-harness-card.tsx`, `lib/agents/coming-soon.ts`. **Planned regression window:** the active card's `› SELECT` now links to `/spawn/[templateId]` which 404s until Phase 4. The deploy-modal flow (M4's spawn UX) is unreachable from the spawn page from this commit forward; `deploy-modal.tsx` stays in the tree as orphan code until Phase 6 deletes it. The fleet view's empty-state CTA still points to the spawn flow but lands on the same broken roster→404 path during the gap.
- **Phase 4 — Wizard route + step shell closes the regression window.** New `frontend/src/app/(app)/spawn/[templateId]/page.tsx` is a ~25-LOC server component that unwraps Next 16's async `params: Promise<{ templateId: string }>` and hands it to the client `<Wizard>`. **Deliberate plan deviation:** the data fetch is client-side, not server-side. `createApiClient()` binds to `@/lib/supabase/client` (browser-only); every other authenticated route does the same; introducing a server-side Connect transport just for this one route is the abstraction the operator's standing instruction warns against. Functional outcome unchanged. New `frontend/src/components/spawn/wizard.tsx` (~330 LOC) layers three concerns: a `FetchState` reducer mirroring the parent's `loading | ready | not-found | error` shape; a `WizardState` `useReducer` (`{ current: StepKey, confirmed: ReadonlySet<StepKey>, fields: WizardFields }`) with three actions (`confirm` advances cursor + adds to set; `edit` un-confirms target *and every step downstream* per decision 9; `setField` merge-patches `fields`); and a `StepShell` × 5 render layer with each step in its own `TerminalContainer` accent-coded per the §5.4 feature-color sequence (HARNESS → catalog cyan, IDENTITY → secrets pink, MODEL → adapter violet [per plan], DEPLOYMENT → deploy blue [per plan], REVIEW → running green). Step gating has three visual states: `isCurrent` (full opacity, primary `› CONFIRM` / `› DEPLOY AGENT` button), `isConfirmed && !isCurrent` (full opacity, ghost `[ EDIT ]` button), `!isCurrent && !isConfirmed` (`pointer-events-none opacity-40` — visually present, not interactive). `meta` slot carries `ACTIVE` / `CONFIRMED` / `PENDING` text tags so state is scannable without depending on color (a11y). Step bodies in this phase: Step 1 // HARNESS is real (renders the harness's `<NebulaAvatar size={180}>` — the *one* canvas allowed on this route per decision 21 — alongside a 3-row spec strip mirroring the roster card); Steps 2 / 3 / 5 are `<StubBody>` placeholders (`[ FIELDS LAND IN PHASE 5 ]`); Step 4 is `<DeploymentStub>` showing the M4-default `LIFECYCLE: always-on` / `REPLICAS: 1` as read-only spec rows alongside four `[ COMING WITH FLEET CONTROL ]` rows for `REGION` / `SIZE` / `VOLUME` / `RESTART` per blueprint §11.4 (real interface stub, not a fake button). `WizardSkeleton` paints six telemetry-pulse blocks at the same heights they'll occupy when ready (zero layout reflow on first paint); `WizardError` and `WizardNotFound` each render a single `<TerminalContainer accent="failed">` panel; the not-found panel surfaces the requested id so a misrouted operator can see *why* the route bounced. Refresh resets to Step 1 (in-memory state per decision 8). `next build` route table now lists `/spawn/[templateId]` as `ƒ` — the (app) tree's first dynamic segment.


---

## 0.8.3 — Login Animation Cosmetic Pass: Seamless Settle + Density Bump + Pearlescent Silver Palette (2026-04-26)

Three operator-driven cosmetic fixes on the `/sign-in` swarm animation, observed in live use after 0.8.2's render-correctness pass: (1) a brief brightness flash right as the swarm settled into each shape — the morph→hold boundary; (2) the swarm read as feeble at the existing density even though the fine-grained pinprick scale was wanted; (3) the green→cyan rest/in-flight palette read as "rainbow" and slightly cheap, against the pearlescent chrome the rest of the app already targets. All three resolved in one pass. All FE-only: zero backend, proto, schema, env, or dependency change. Type-check + lint clean. Patch version (not minor): no new product surface, no new RPC, no schema/migration; one constant retuned, one alpha curve smoothed, one fragment palette swapped, six baked .bin files regenerated at the new count.

- **`frontend/src/components/sign-in/shapes.ts:1-2` — `PARTICLE_COUNT` 18000 → 28000; `PARTICLE_COUNT_MOBILE` 6000 → 9000.** ~55% denser swarm at the *same* pinprick point size (`gl_PointSize` constant from 0.8.2 unchanged). Fine-grained "molecule" feel preserved; the swarm reads as substantial rather than feeble. Mobile stride scales with the canonical count so the desktop:mobile ratio stays 3:1. Re-bake of all six shapes is mandatory after this change — the loader rejects any .bin whose byte length isn't `PARTICLE_COUNT × 3 × 4`.
- **`public/sign-in/shape-targets/{chevron,octahedron,torus,globe,network,wordmark}.bin` — all six regenerated** via `pnpm -C frontend bake-shapes`. Each grows 216 KB → 328 KB. Bake config unchanged (camera, viewport, form-rect rejection); only the per-shape sample count changes. Committed as binary artefacts per the existing convention.
- **`frontend/src/components/sign-in/shaders/swarm-vert.ts` — `vAlpha` smoothstepped across the morph→hold boundary; new `vSeed` varying.** The 0.8.2 alpha had a hard step (`morph = 0.45` → `hold = 0.32`) at the exact instant the formation arrived at peak density — read as a brightness glitch right when the eye was paying most attention. Fix: `vAlpha = mix(morphPeak, baseHold, smoothstep(0.86, 1.0, uPhaseProgress))` over the last 14% of morph, matching the existing `uCyanTint` rampDown window. Companion lift: `morphPeak` 0.45 → 0.50, `baseHold` 0.32 → 0.36 — modest, paired with the density bump so total integrated brightness rises but no individual particle saturates. New `vSeed` varying (passes `morphSeed` to the fragment) so the new palette can run a per-particle shimmer phase without re-reading the attribute.
- **`frontend/src/components/sign-in/shaders/swarm-frag.ts` — green/cyan palette replaced with pearl/platinum/silver.** Removed the brand-green rest tone (`vec3(0.133, 0.773, 0.369)`) and the cyan in-flight tone (`vec3(0.024, 0.714, 0.831)`) and the `mix(pearl, green, 0.4)` rest blend. New three-tone palette: `pearlWarm = vec3(0.96, 0.94, 0.90)`, `pearlNeutral = vec3(0.94, 0.95, 0.97)`, `platinum = vec3(0.86, 0.92, 1.00)` — none saturated, the swarm stays in the white/silver register no matter the mix. Per-particle shimmer phase `0.5 + 0.5 * sin(uTime * 0.35 + vSeed * 6.2831853)` cross-fades warm↔neutral at rest and neutral↔platinum in flight, so the swarm reads as iridescent rather than monochrome. `uCyanTint` is **kept** as the scheduler's "in-flight" channel but its semantic shifts: it no longer drives a hue swap (green→cyan), it now drives a *temperature* shift (warm pearl → cool platinum) — same scheduler ramp, more tasteful visual register. The variable name is now misleading and is a candidate rename in a follow-up; the wire contract is intentionally untouched in this entry.

### Resolves

- **Operator note (live observation, 2026-04-26)** — three asks from first sustained use of `/sign-in` post-0.8.2: (1) brightness glitch on formation, (2) feeble density / lack of strikingness, (3) cheap-feeling green-cyan rainbow gradient. All three addressed.

---

## 0.8.2 — Login Animation Phase 7: Three Live-Render Fixes (Stacking Context + Reduced-Motion Still + Particle Sizing) (2026-04-26)

First live-browser tuning pass on the `/sign-in` swarm animation, triggered by an operator session that booted the route post-Phase-6 and surfaced three independent failure modes back-to-back: (1) the canvas painted under a black rectangle and was completely invisible; (2) once visible via macOS Reduce Motion being on, the SVG fallback projected as a viewport-filling chevron; (3) once Reduce Motion was off, the live swarm rendered as fluffy overlapping clouds rather than discrete particles. All three fixed in one pass; `/sign-in` now reads as the intended swarm-of-pinpricks morphing through the shape rotation, with a quiet ambient still for reduced-motion users. All FE-only: zero backend, proto, schema, env, or dependency change. Patch version (not minor): no new product surface, no new RPC, no schema/migration; one CSS class removed, one shader formula retuned, one SVG resized. Plan: phases 0–6 already shipped; Phase 7 is the live-render gate the prior phases deferred. Completion notes: `docs/completions/login-animation-phase-7.md`. Blueprint: `docs/blueprints/login-swarm-animation.md` (new — captures the technique for future replication elsewhere in the app).

- **`frontend/src/app/sign-in/page.tsx:35` — `bg-black` removed from `<main>`.** The load-bearing fix. `<main>` is `position: relative` *without* an explicit `z-index`, so it does not establish a stacking context. The `SwarmBackground` child is `fixed inset-0 -z-10`, which therefore participates in the **root** stacking context at layer −10. Per CSS painting order, the root stacking context paints negative-z descendants *before* in-flow block backgrounds — so `<main>`'s `bg-black` was painting *over* the canvas, hiding it completely. The page background register is unchanged: `SwarmBackground`'s wrapper carries its own `bg-black` on the fixed layer underneath the canvas, shared by both the morph-engine and reduced-motion branches. The only behavioural delta is that `<main>` no longer paints a black rectangle on top of the canvas. **Why this didn't surface in Phases 0–6:** every prior phase's exit gate was `next build` + lint + typecheck; the stacking-context defect is invisible to all three. Phase 7 is the first phase that gates on a live render. Future infra-style refactors on `/sign-in` must not reintroduce `bg-*` on the `<main>` element — that re-creates the canvas-hidden bug.
- **`frontend/src/components/sign-in/reduced-motion-still.tsx` — `slice` → `meet`, chevron polygons halved, stipple sparser/dimmer, halo dimmed.** Four-part correction. (a) `preserveAspectRatio="xMidYMid slice"` → `"xMidYMid meet"`: `slice` scales the viewBox to fully *cover* the rendered rectangle and crops whichever axis is shorter — on a tall-and-narrow viewport (which the operator's screen was), the 1920×1080 viewBox got scaled up so its height matched the screen height, every viewBox unit magnified, including the chevron. `meet` scales to *fit* (no cropping); on a tall viewport the SVG renders at the width that fits, leaving vertical letterbox that's fine because the parent `<div>` is `bg-black`. (b) Chevron polygons halved (`-440 to +240` horizontal / `-440 to +440` vertical → `-220 to +120` / `-220 to +220`): silhouette now occupies ~340 viewBox units centred, not ~680×880. Quiet ambient presence rather than a hero element. (c) Stipple period 14 → 24 px, radius 1.6 → 0.9 px, opacity 1.0 → 0.45: silhouette reads as a texture suggestion, not a solid mass. (d) Halo `r=60% / alpha 0.10` → `r=55% / alpha 0.06`: subtle brand-green wash, no longer adding to the overwhelming brightness. Doc-comment rewritten to describe the new register and pin the corrections.
- **`frontend/src/components/sign-in/shaders/swarm-vert.ts` — `gl_PointSize` retuned + alpha lowered.** The shipped Phase-0 placeholder `gl_PointSize = 2.5 * uPixelRatio * (300.0 / -mvPosition.z)` resolves at the camera distance `z=6` and `devicePixelRatio=2` to `2.5 × 2 × 50 ≈ 250 px per point` — roughly 80× too large, producing the cloudy-blob appearance. Retuned to `1.0 * uPixelRatio * (8.0 / -mvPosition.z)` ≈ `2.7 px per point` at the same camera config; with the fragment shader's `exp(-d*d*8.0)` falloff that gives a soft ~3–4 px halo per particle — pinprick scale, individually resolvable, swarm-density at 18,000. Companion alpha retune: drift/hold `0.85 → 0.32`, morph `0.95 → 0.45`, hold-phase flicker amplitude `0.08 → 0.04` (proportional to the new baseline). With ~18,000 additive points overlapping, anything above ~0.4 baseline saturates the additive blend toward white before the silhouette can read. The original shader comment literally said *"the 300.0 figure is empirical and gets a tuning pass in Phase 7"* — Phase 7 is now that pass.

### Behavior change (known)

- **`/sign-in` background canvas is visible.** The R3F swarm renders behind the form and runs through the chevron / octahedron / torus / globe / network / wordmark rotation per Phase 4's scheduler.
- **Reduced-motion still is a quiet ambient texture.** macOS Reduce Motion users see a small stippled chevron centred behind the form, no longer a viewport-filling glow.
- **Particles read as a swarm.** Discrete pinpricks at ~3 px each, additive blend no longer saturates to white, silhouettes coalesce visibly during the morph phase.
- **`<main>` on `/sign-in` no longer paints its own background.** Black register comes from `SwarmBackground`'s wrapper, shared by both branches.
- **Console still logs `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`** Originates in `@react-three/fiber` itself; benign; not Corellia's to chase.

### Resolves

- **Login Animation Phase 7** of the eight-phase plan in `docs/executing/login-animation-implementation.md`. Live-render gate now met. Phase 8 (numeric tuning of cycle pacing, easing curves, color cross-fade timing, hold-phase jitter, scheduler weights, bake parameters) inherits a working baseline.

---

## 0.8.1 — Fleet UI Mods: Gallery View + List ↔ Gallery Toggle (localStorage-Persisted, Gallery-Default) (2026-04-26)

Second operator-driven UX pass on the M4 fleet surface. The `/fleet` route had one shape since 0.7.0 — a horizontal-row `FleetTable`. Operator wanted a card-per-agent gallery as the *always-available* alternative, with a visible toggle to flip between the two; gallery as the default first-paint, list one click away, the choice persisting across reloads. All FE-only: zero backend, proto, schema, env, or dependency change. Type-check + lint clean. Patch version (not minor): no new product surface, no new RPC, no schema/migration; one new render shape behind a toggle, the data layer (polling, `showDestroyed`, `visibleInstances`, `destroyedCount`, `count`, `polling`) byte-equivalent to 0.8.0. Plan: `docs/executing/fleet-ui-mods.md`. Completion notes: `docs/completions/fleet-ui-mods.md`.

- **`frontend/src/lib/fleet-format.ts` — new (~25 LOC).** `providerLabel(p: ModelProvider): string` and `formatCreated(rfc3339: string): string` extracted from `fleet/page.tsx`. The table cell and the new card now render identical provider/timestamp strings without copy-paste between component trees. Zero behaviour change at the call sites.
- **`frontend/src/lib/fleet-view-pref.ts` — new (~32 LOC).** Exposes `setFleetView(v)`, `useFleetView(): FleetView`, and the `FleetView` type. Backed by **`useSyncExternalStore`** — React's blessed primitive for syncing with external stores. Three callbacks: `subscribe(cb)` registers `cb` in a module-local `Set<() => void>`; `getSnapshot()` reads `localStorage["corellia.fleet.view"]` and returns `"gallery"` (the default) on bad/missing values or when `typeof window === "undefined"`; `getServerSnapshot()` returns the literal default `"gallery"` so SSR HTML and the very first client render agree byte-for-byte even if localStorage holds `"list"` — no hydration warning. `setFleetView(v)` writes to localStorage **and** notifies every subscriber, so the same-tab toggle press triggers an immediate re-render (the cross-tab `storage` event doesn't fire in the originating tab). **First implementation used the textbook `useState` + hydration-effect pattern**; eslint's `react-hooks/set-state-in-effect` blocks it, and the lint rule is correct in the general case — `useSyncExternalStore` is the right shape for "sync with external store" and resolves the SSR/CSR problem at the same time. Don't regress to the effect pattern when adding the next localStorage-backed preference.
- **`frontend/src/components/fleet/view-toggle.tsx` — new (~62 LOC).** Two-button segmented control with Lucide `LayoutGridIcon` (gallery) + `Rows3Icon` (list) at `size-3` left of each label. Outer wrapper is `<div role="group" aria-label="Fleet view" className="flex items-center border border-border">`; each button is a `<button type="button" aria-pressed={…}>` with the standard chrome typography (`font-display text-[10px] uppercase tracking-widest`). Active state gets `bg-muted/40 text-foreground`; inactive gets `text-muted-foreground hover:text-foreground`. Stateless — props are `{ value, onChange }`; the parent owns persistence via the hook above.
- **`frontend/src/components/fleet/agent-card.tsx` — new (~45 LOC).** One `AgentInstance` → one square-corner panel. Three regions stacked vertically: header strip (`<StatusBadge>` left, `formatCreated(createdAt)` right at `font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70`); body (name as `<h2 className="font-mono text-sm text-foreground">`, then template, then `${providerLabel} / ${modelName}` — both at `font-mono text-[11px] text-muted-foreground`); footer (`<AgentRowActions>` justified right). **`AgentRowActions` reused unmodified** — the component is presentation-agnostic since M4 (takes `instance` + `onChanged`, no parent-shape assumption), so both views share the *exact* same Stop / Destroy / Logs button stack, modal flow, error-toast surface, and refetch trigger. Zero divergence between views in user-visible behaviour. **Destroyed treatment:** whole card gets `opacity-50` when `instance.status === "destroyed"`; `StatusBadge` already line-throughs the `destroyed` label inside `status-dot.tsx`'s tone map, the card-level opacity is the additional whole-card greying. The name itself does **not** get `line-through` — it stays scannable so the operator can read what the agent was called. Hover: subtle `hover:border-border/80`; no fill swap (the dark register avoids hover surfaces).
- **`frontend/src/components/fleet/fleet-gallery.tsx` — new (~24 LOC).** Wraps the cards in the same `TerminalContainer` the table uses (`title="AGENT INSTANCES"`, `accent="running"`), so the surface chrome — bracketed title, `›` chevron, accent rule — is identical between views. Container `meta` reads **`N CARDS`** (vs the table's `N ROWS`) — chrome counts the unit being shown. Inside: `grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` — a "Deploy 5" lays out as 2×3 / 3×2 on a typical 13–15" laptop; "Deploy 10" lays out as 3 rows × 4 cols on ultrawide, 4 rows × 3 cols on a typical laptop, 5 rows × 2 cols on a small tablet, 10 rows × 1 col on phone. Cards stay readable at every breakpoint without a density toggle.
- **`frontend/src/app/(app)/fleet/page.tsx` — toggle wired in, render branch split.** Three import-level changes: `formatCreated` + `providerLabel` now come from `@/lib/fleet-format` (in-file copies deleted); `FleetGallery` + `FleetViewToggle` added; `useFleetView` + `setFleetView` from `@/lib/fleet-view-pref`. State delta is one line: `const view = useFleetView();` — no new `useState`, no `useEffect`, no `useCallback` for the change handler. The hook owns subscription, the setter owns notification, the consumer just reads. The `setFleetView` reference is module-level-stable so `<FleetViewToggle value={view} onChange={setFleetView} />` is safe as a direct prop. Header strip gains the toggle as the **leftmost** item (separated from the rest by a `·` divider) — most-used affordance, reading order is left-to-right. Render branch swaps the single `state.kind === "ready" && <FleetTable …/>` line for two parallel branches keyed on `view`. **Loading / empty / error states are unchanged** — they render regardless of `view`.

### Behavior change (known)

- **`/fleet` defaults to gallery view** for any user who hasn't toggled. Cards are the first impression; the segmented control in the header strip flips to the list (the 0.8.0 surface) in one click.
- **Gallery view persists across reloads via localStorage.** Same session-local register as `showDestroyed`. No URL persistence (`?view=gallery`) — single-line lift if audit deep-linking ever matters.
- **Destroyed agent cards render at `opacity-50`.** Greys the whole surface so the card reads as audit artefact, not active fleet member — matches 0.8.0's dashboard/fleet semantic shift.
- **Toggle is always visible** in the header strip — even during loading / empty / error. Operator can pre-set their preference before the data arrives.
- **Stop / Destroy / Logs actions behave identically** in both views. `AgentRowActions` is the same component instance type; the modal flow, error-toast surface, and refetch trigger are byte-equivalent.
- **Polling cadence unchanged** (`POLL_MS = 3000`, stops when every row is terminal). Both views consume the same `visibleInstances` array, so `showDestroyed` toggling and polling state are identical across the two surfaces.

### Resolves

- **`docs/executing/fleet-ui-mods.md`** — the operator's single ask ("gallery view per agent, toggle between list and gallery") shipped end-to-end. All eight resolved decisions in the plan's §8 are reflected in code.

---

## 0.8.0 — Frontend Mods: Chrome Alignment + Avatar Dropdown + Logo Treatment + Destroyed-Filter (2026-04-26)

Four operator-driven UX fixes from first sustained use of the M4 spawn flow, shipped in one pass. All FE-only: zero backend, proto, schema, env, or dependency change. Type-check + lint clean. Minor version (not patch) because (a) the chrome surface — top bar height, sidebar logo, avatar dropdown — changes for every signed-in user on every page, and (b) the dashboard/fleet semantic for "destroyed" rows shifts (audit artefact, not active fleet member). Plan: `docs/executing/frontend-mods.md`. Completion notes: `docs/completions/frontend-mods.md`.

- **`app-top-bar.tsx:68` — `h-12 → h-14`.** Top bar grows from 48px → 56px so its `border-b` sits at the same Y as the sidebar's CORELLIA section. Companion change in `app-sidebar.tsx`: `SidebarHeader` overridden to `h-14 p-0` (defaults are `p-2` + inner `py-2.5`, which produced a variable height ~56–60px); inner div fills via `flex h-full items-center px-4`. The two chrome strips now line up deterministically; `cn()`'s tailwind-merge resolves the override correctly.
- **`app-top-bar.tsx` — avatar dropdown gains Profile + Settings items above Sign out.** Both routed to `/settings` via `<Link>` — there's no `/profile` route in v1, and per architecture rule §11.4 *deferred features are stubbed as real interface implementations, not as fake UI buttons*; landing on the real `<ComingSoon>` placeholder is honest. Lucide `UserIcon` + `SettingsIcon` (already in the icon set; no new dep). `<DropdownMenuSeparator>` divides them from Sign out — destructive-ish action gets its own visual lane. The render-prop pattern (`<DropdownMenuItem render={<Link href=…/>}>`) keeps Next.js client-side navigation; same Base UI convention used elsewhere in the chrome.
- **`app-top-bar.tsx` — `<DropdownMenuLabel>` wrapped in `<DropdownMenuGroup>`.** Surfaced as a runtime error after the new items mounted: Base UI's `MenuPrimitive.GroupLabel` requires a `MenuPrimitive.Group` ancestor; the bare label happened to work pre-mod but the new render path tripped the context check. New `DropdownMenuGroup` import; one wrapper element.
- **`app-sidebar.tsx` — logo redesign.** Removed the `›` chevron prefix (read as a nav-item bullet, not a brand mark); CORELLIA wordmark restyled `text-base font-black uppercase tracking-[0.3em]` (was `text-sm font-bold tracking-widest`). The weight bump (700 → 900) and tracking widen (0.1em → 0.3em) is the visual delta that makes it stop reading as a label and start reading as a logo. **Collapsed-mode `C` monogram** added so the icon-mode header isn't visually empty (the `›` previously held that role).
- **`fleet/page.tsx` — hide-destroyed filter, default off.** New `showDestroyed` state + `visibleInstances` / `destroyedCount` derivations. Toggle button in the header strip alongside POLLING and N REGISTERED — renders only when `destroyedCount > 0` (zero noise for fresh workspaces). Format `[✓] SHOW DESTROYED (N)` matches the design-system terminal aesthetic. `N REGISTERED` count now reflects `visibleInstances.length`, not the raw total — toggling instantly updates both the table and the count. **Polling logic unchanged**: `polling` still derives from the unfiltered `state.instances`, so a destroyed row that gets filtered out doesn't change whether *any* row is non-terminal.
- **`dashboard/page.tsx` — FLEET TOTAL excludes `status === "destroyed"`.** One-line filter on the telemetry tile. The other three tiles (RUNNING, PENDING, FAILED) already filter by status, so no change needed. The FLEET STATUS matrix below the strip still surfaces a DESTROYED row if any exist — countable on demand, not hidden, but not headlining.

### Behavior change (known)

- **Top bar is 8px taller** across every signed-in page; content area below absorbs the delta via `flex-1`.
- **Avatar dropdown has three items** (was one). Profile + Settings both navigate to `/settings`.
- **Sidebar shows CORELLIA without a chevron prefix**, in heavier/wider type. Collapsed mode shows `C`.
- **Fleet table hides destroyed instances by default.** Toggle in the header strip surfaces them on demand; toggle is invisible when there are no destroyed instances.
- **Dashboard FLEET TOTAL drops by however many destroyed rows the org has.** RUNNING / PENDING / FAILED tiles unchanged.

### Resolves

- **`docs/executing/frontend-mods.md` items 1–4.** All four asks shipped.

---

## 0.7.7 — `fly.toml`: `min_machines_running` 0 → 1 (Always-Warm Control Plane) (2026-04-26)

One-line config change in `backend/fly.toml:15`: `min_machines_running = 0` → `1`. The control plane no longer cold-starts on the first request after idle; one machine stays warm at all times. Auto-stop + auto-start remain on for any *additional* machines a future scale-up adds — the floor is 1, not the ceiling. Trades the idle-cost savings of the previous "scale to zero" posture for predictable first-request latency (relevant now that the FE is on Vercel and the BE is the user-facing surface, not a localhost endpoint). Patch version: zero code, zero RPC, zero schema, one TOML line. Takes effect on next `fly deploy` from `backend/`; `fly scale count 1 -a corellia` reconciles the live machine state immediately if needed.

---

## 0.7.6 — Env Var Rename: `FLY_API_TOKEN` → `FLY_SPAWN_TOKEN` (Stop `flyctl` Shadowing the Operator's Deploy Identity) (2026-04-26)

Surfaced when `fly deploy` from `backend/` returned `unauthorized` against `corellia` (the control-plane app itself), despite the operator being signed in via `fly auth login`. Diagnosis: `flyctl` honors the `FLY_API_TOKEN` shell env var ahead of `fly auth login` credentials; direnv auto-loads `backend/.env` on `cd backend/`; the runtime *spawn* token (org-scoped per 0.7.3, no permissions on the `corellia` app) was therefore silently shadowing the operator's interactive identity on every `fly deploy`. The two credentials are distinct roles by design — the **runtime spawn token** the deployed backend uses to create agent apps, and the **operator's deploy identity** for releasing the control plane itself — but they collided on a single env var name. Fix is a rename: the runtime-spawn env var becomes `FLY_SPAWN_TOKEN`, a name `flyctl` does not look at, so the two roles stay in their own lanes permanently. Patch version (not minor) per the 0.5.1 / 0.5.2 / 0.7.3 precedent for non-product correctness: zero new product surface, zero RPC change, zero schema/migration change. One env-var name change, four files touched, plus the Fly secret rotation on the deployed backend.

---

## 0.7.5 — M4 Phase 8 Hardening: Transactional Spawn Writes + Handler-Level Sentinel Mapping Tests + v1.5 Deploy-Target-Credentials Breadcrumbs (2026-04-26)

Closes the three M4 Phase 8 hardening items 0.7.0 parked in *Known pending work* and re-flagged in 0.7.3, plus drops the two v1.5 deploy-target-credentials breadcrumbs that `docs/executing/deploy-target-credentials.md` flagged as "worth committing before they evaporate." Patch version (not minor) per the 0.5.1 / 0.7.3 precedent for non-product structural follow-up: zero new product surface, zero new RPC, zero schema/migration/env-var change. The Spawn write path becomes atomic, the public sentinel→Connect-code wire contract becomes test-pinned, and v1.5's per-user deploy-target work has its first two breadcrumbs in code + spec rather than in a one-off design doc.

The transactional-spawn-writes work is the only one with a real runtime effect. The handler tests are pure documentation-via-code of a contract that already held empirically. The breadcrumbs are forward-looking: they don't change v1 behavior, only what the next milestone in this area will inherit.

- **`backend/internal/agents/transactor.go` — new (~75 LOC).** Two interfaces and one production type. **`SpawnTx`** is the narrow exported view of `*db.Queries` Spawn touches *inside* the tx — `InsertAgentInstance` + `InsertSecret`, nothing else. Reads (template lookup, deploy-target lookup) and post-Fly writes (deploy-ref set) stay outside the tx via the wider `agentQueries` view, so they don't belong in `SpawnTx`. Exported (not the package-private `agentQueries`) so external implementations — production `PgxTransactor`, test fakes — can name the type in their fn signature without reaching into agents-internal types. **`Transactor`** is the lifter interface (`WithSpawnTx(ctx, fn func(SpawnTx) error) error`) — named for purpose, not a generic `WithTx`, so the call site reads as "this is a spawn-scope tx" without a comment. **`PgxTransactor`** is the production implementation: thin lifter over `pgxpool.Pool`, calls `BeginTx` → `fn(db.New(tx))` → `Commit` on success or `Rollback` on error. Pool ownership stays with `cmd/api/main.go`; the transactor borrows it per-call. Rollback errors are logged at warn and dropped — the *fn* error is what the caller is reacting to; obscuring it with a downstream rollback failure would hide the root cause. `pgx.ErrTxClosed` on rollback is silently absorbed (legitimate when the context cancellation already unwound the tx).
- **`backend/internal/agents/service.go` — `Spawn` rewritten to use `WithSpawnTx`** (decision 27 step 6, deferred at M4 ship). `Service` struct gains a `txr Transactor` field; `NewService` widens to a 4-arg constructor. The two `s.queries.Insert{AgentInstance,Secret}` calls move inside one `s.txr.WithSpawnTx(ctx, func(q SpawnTx) error { ... })` block; the Fly call (step 8) stays outside the closure per decision 27. **Pre-Phase-8 a process crash between the two inserts could leave an instance row visible without an audit row, or vice versa** — the only honest atomic shape for the paired write is one tx, and now it has one. Result of the closure (the inserted `db.AgentInstance`) is captured via a closed-over outer `var instance db.AgentInstance`. The 11-step order of decision 27 is otherwise unchanged.
- **`backend/internal/agents/service.go` — secrets-row policy pinned in code.** Comment added at the `InsertSecret` call site (now inside the tx closure): "one secrets row per *secret-shaped* CORELLIA_* env var, not per CORELLIA_* env var. Today CORELLIA_MODEL_API_KEY is the only credential the spawn flow forwards; CORELLIA_AGENT_ID / CORELLIA_MODEL_PROVIDER / CORELLIA_MODEL_NAME are configuration, not secrets, and don't get audit rows. New secret-shaped vars (e.g. CORELLIA_TOOL_AUTH_TOKEN in v1.5+) each insert their own row here." Closes the open question 0.7.0 *Known pending work* posed against decision 6.
- **`backend/cmd/api/main.go` — `agents.NewService` call updated.** One-character widen: `agents.NewService(queries, adaptersSvc, deployResolver, agents.NewPgxTransactor(pool))`. The `pool` was already in scope (constructed three lines earlier for `db.New(pool)`); no new wiring.
- **`backend/internal/agents/service_test.go` — `fakeTransactor` added; 21 `NewService` call sites updated.** The fake's `WithSpawnTx` runs the closure in-place against the test's existing `fakeQueries` — no real `BeginTx`, since the fake's "DB" is just struct fields. `replace_all` handled 19 of the 21 call sites (the `agents.NewService(q, a, r)` form from `newSpawnReadyHarness`); the two M2-holdover call sites that constructed `fakeQueries` inline were edited individually to pull the queries into a named var so the transactor can capture it. **Existing 18 sub-tests still green; no test logic changed**, only constructor arity.
- **`backend/internal/httpsrv/agents_handler.go` — `agentsService` interface introduced.** New small in-package interface mirrors the seven-method surface the handler calls on `agents.Service` (`ListAgentTemplates`, `Spawn`, `SpawnN`, `List`, `Get`, `Stop`, `Destroy`). `AgentsHandler.svc` field swaps from concrete `*agents.Service` → `agentsService`; `NewAgentsHandler`'s first parameter type changes accordingly. **`*agents.Service` satisfies `agentsService` structurally**, so `cmd/api/main.go` requires zero change. The seam is the same one `userIdentityLookup` (this file) and `organizations.userLookup` already use — *narrow private interface declared by the consumer, the producer satisfies it for free* — extended from one method to seven.
- **`backend/internal/httpsrv/agents_handler_test.go` — new (~210 LOC, 16 sub-tests).** Three top-level tests. **`TestAgentsErrToConnect_SentinelMapping`** (13 sub-cases) is the load-bearing one: table-drives every `users.Err*` and `agents.Err*` sentinel through `SpawnAgent` (the mapping is method-agnostic, so one RPC vehicle exercises the whole `agentsErrToConnect` switch) and asserts `connect.CodeOf(err)` against the expected code. The 13 cases cover all 12 sentinels in the switch's named arms (`Unauthenticated`, `PermissionDenied`, `InvalidArgument` ×4, `FailedPrecondition`, `NotFound` ×3, `Unavailable` ×2) plus the `default` arm (unknown error → `Internal`, with the raw error logged at `slog.Error` server-side — the redaction layer's contract). **`TestSpawnAgent_BadTemplateID`** and **`TestStopAgentInstance_BadID`** cover the per-handler UUID-parse fast paths that bypass the service entirely. The two paths return *different* Connect codes (template-id parse failure → `InvalidArgument` wrapping `ErrTemplateNotFound`; instance-id parse failure → `NotFound` wrapping `ErrInstanceNotFound`) — the tests *document* this inconsistency rather than fix it; if the inconsistency is wrong, that's a separate decision. **`TestListAgentInstances_HappyPath`** confirms the success-path response is shaped correctly (not just that the error path is wired).
- **`backend/internal/deploy/fly.go:33` — `// TODO(v1.5):` on `FlyCredentials`.** Existing doc-comment (which already gestured at v1.5) extended with a concrete description of the split: "v1.5's resolver loads per-target credentials from the secret store via `deploy_targets.credentials_storage_ref`; the boot-time `FLY_API_TOKEN` / `FLY_ORG_SLUG` env path becomes the operator-only fallback for the platform's own service-account (Corellia's own dogfood deploys). User-supplied targets get an org-scoped Fly macaroon via OAuth — never a PAT pasted into a form. See `docs/executing/deploy-target-credentials.md`." Resolves 0.7.3 *Known pending work* item "two breadcrumbs from `deploy-target-credentials.md` not yet committed" (this is the first of the two).
- **`docs/blueprint.md` — new architecture rule §11.6.** "**Deploy-target credentials never live in Corellia's database.** Raw credentials live in a secret store; DB rows reference them via opaque `storage_ref` (M4 decision 6, applied to deploy-target credentials the same way it applies to per-instance secrets). When v1.5 introduces user-supplied targets, the acquisition flow uses the provider's narrowest-capability mechanism — Fly OAuth → org-scoped macaroon, AWS STS → assumed-role with an external ID, etc. **Never accept PATs from users.** Paste-as-fallback is acceptable only when no narrower mechanism exists, with explicit capability scope labelled in the UI. The macaroon/role caveats define the capability contract; the adapter declares the minimum set it needs." First architecture rule appended to blueprint §11 since the original five (which §11.1–§11.5 enumerate). Resolves the second of the two `deploy-target-credentials.md` breadcrumbs. Companion mirror in `CLAUDE.md`'s architecture-rules list as #11.


---

## 0.7.4 — M3.9: Control-Plane Deploy (BE → Fly, FE → Vercel) (2026-04-26)

Closes the M3.9 milestone (`docs/plans/post-0.2.6-roadmap.md` §M3.9) — the control plane is no longer local-only. **Sequencing note:** roadmap prescribed M3.9 *before* M4; in practice M4 (0.7.0 + 0.7.3) landed first against `localhost`, and the artefacts below were created today (2026-04-26) to retire that gap. Step 1 of §5's "demoable v1" definition-of-done — *open the deployed FE in a browser* — is now reachable.

- **`backend/Dockerfile` — new.** Multi-stage build: `golang:1.26-alpine` builder → `gcr.io/distroless/static-debian12:nonroot` runtime. `CGO_ENABLED=0`, `-trimpath -ldflags="-s -w"`, port 8080, `nonroot` user. `cmd/smoke-deploy` deliberately not built into the image.
- **`backend/.dockerignore` — new.** Strips `.env*`, `.envrc`, `bin/`, `tmp/`, `*_test.go`, editor noise. Secrets stay outside the image surface.
- **`backend/fly.toml` — new.** App `corellia`, primary region `sin`, `internal_port = 8080`, `force_https = true`, `[[http_service.checks]]` against `/healthz` (already exposed outside the auth group), `auto_stop_machines = "stop"` + `auto_start_machines = true` + `min_machines_running = 0`, `shared-cpu-1x` / 512MB. Org pinned at deploy time, not in the file.
- **Vercel project rooted at `frontend/`** with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` set in the dashboard. Auto-deploys on push to `main`. No committed `vercel.json`.
- **Fly secrets** (`fly secrets set`) — `DATABASE_URL`, `SUPABASE_URL`, `FLY_API_TOKEN` (org-scoped per 0.7.3), `FLY_ORG_SLUG`, `FRONTEND_ORIGIN`. Never committed.


---

## 0.7.3 — M4 Phase 7: Integration Smoke Pass (Local BE + Prod DB + Live Fly) + Fly Token Swap (PAT → Org-Scoped) (2026-04-26)

The first end-to-end walkthrough of the M4 spawn flow against a live Fly account — the integration smoke that 0.7.0's *Known pending work* parked as Phase 7. Surfaced one real bug: the operator's Fly **Personal Access Token** in `backend/.env` succeeded against Fly's GraphQL API but returned `unauthorized` on `flaps.CreateApp` against `api.machines.dev`. The Machines API gates more strictly than GraphQL, and PATs — despite working everywhere `flyctl` is used interactively — aren't the right token *shape* for what Corellia is becoming. Two things shipped here, neither involving Go or TS code: (a) the diagnosis was written up as a problem-statement doc (`docs/executing/deploy-target-credentials.md`) framing both today's fix and the v1.5 product evolution (per-user deploy targets, secret-store-backed credentials, OAuth-acquired where the provider supports it); (b) the fix itself — swap the operator's PAT for an **org-scoped Fly token** (`fly tokens create org -o personal --name "corellia-dev" --expiry 8760h`), zero code change, byte-compatible with the v1 code path *and* the same token *shape* users will eventually supply via the v1.5 connect flow. We dogfood the production credential model from day one without writing v1.5 code. Patch version (zero code change, runtime-config + docs only).

- **`backend/.env:15` — `FLY_API_TOKEN` swapped from PAT to org-scoped token.** *Why:* PATs grant full-account power forever (equivalent to an AWS root key) and — empirically — are gated *out* of the Machines API surface that `flaps.CreateApp` / `flaps.SetAppSecret` / `flaps.Launch` need. An org-scoped token (`fly tokens create org -o <slug>`) is the **narrowest token that satisfies all six flaps endpoints** the M3 `FlyDeployTarget` exercises (`CreateApp`, `DeleteApp`, `SetAppSecret`, `Launch`, `List`, `Stop`) — provider-correct, and the same shape v1.5's connect flow will ask users to mint themselves. `FLY_ORG_SLUG=personal` was already correct; no companion change. Token written without the `FlyV1 ` prefix to match the file's existing convention; `fly-go` / `flaps-go` clients accept both forms.
- **`docs/executing/deploy-target-credentials.md` — new (66 LOC).** Problem-statement doc, pre-plan, not yet milestone-scoped. Frames three concrete problems (one credential serves all users; PAT-shaped paste UX is wrong; credentials must never live in Corellia's database) and proposes a two-track resolution: today's operator-loop fix (no code) and the v1.5 product evolution (`deploy_targets` schema extension with `owner_org_id` + `display_name` + `credentials_storage_ref`; `resolver.For(ctx, kind)` evolving to `resolver.For(ctx, deployTargetID)`; per-provider connect flow — Fly OAuth, AWS STS, paste-as-fallback). Records two breadcrumbs to commit before they evaporate: a `// TODO(v1.5):` on `FlyCredentials` in `internal/deploy/fly.go:33`, and a new `blueprint.md` section codifying "never PATs from users." **Both breadcrumbs deferred** — not in this entry; queued for the next session that touches either file.
- **Validation against live Fly account.** `fly apps list -t <new-token>` returned a non-empty result — exercises the Machines API auth path before any Corellia code path is invoked, so the token shape is confirmed *before* we trust it inside the spawn flow. Then the UI walkthrough: sign in → `/agents` → click Deploy → form fills → submit. The spawn produced a `corellia-agent-<uuid>` app under the `personal` org with one machine in `iad` running the pinned Hermes adapter image — the first end-to-end confirmation that the M4 wire connects from React form → Connect-go RPC → `agents.Service.Spawn` → `deploy.Resolver.For(ctx, "fly")` → `FlyDeployTarget.Spawn` → flaps `CreateApp` + `SetAppSecret` + `Launch` against a real Fly account. Machine ran for ~88s before Fly's native auto-stop kicked in — consistent with blueprint §8 ("Auto-stop enabled, auto-start on request"). Backend ran locally via `overmind start` against the prod Supabase DB (no separate dev project; `DATABASE_URL` unchanged).

### Behavior change (known)

- **`flaps.CreateApp` succeeds against `api.machines.dev`.** Pre-fix: `unauthorized`. Post-fix: app + machine created.
- **No code, generated code, schema, env-var-name, or dependency change.** Pure runtime-config + docs.
- **The token in `backend/.env` is now scoped to org `personal` only.** Cannot create/delete apps in any other Fly org the operator's account belongs to. This is the intended narrowing — Corellia spawns under `personal` per `FLY_ORG_SLUG`; access to other orgs the operator owns is now intentionally out-of-scope for the running backend.

### Resolves

- **0.7.0 *Known pending work*: "Phase 7 (integration smoke) — first end-to-end walkthrough against a live Fly account + real provider key."** First walkthrough complete; the `pending → running` convergence, the 3s polling cadence, and the `Deploy 5` semaphore behavior remain to be exercised explicitly in subsequent runs but the auth-gated boundary that was blocking *any* spawn is now open.
- **0.7.0 *Known pending work*: "decision 25's redaction layer (bad provider key should surface as `Unavailable` in the FE toast)."** Not directly tested in this run (the *Fly* token was the failing surface, not the *model provider* key). Still pending for an explicit malformed-key smoke.

---

## 0.7.2 — UX Copy: `/agents` Nav + Page Heading Renamed to "Agents" (2026-04-26)

Three-string copy fix. The sidebar nav item for `/agents` was labelled "Catalog" — an internal descriptor for the harness-template listing, not a user-facing concept. Post-M4, that page is where admins deploy agents; "Catalog" describes the implementation but not the user's job-to-be-done. Renamed to **"Agents"** to match the URL slug, the nav's sibling "Fleet" naming convention (noun = section), and the user's mental model ("I go to Agents to create one; I go to Fleet to see them running"). The page's H1 follows the nav label for consistency (`CATALOG` → `AGENTS`). The decorative section tag above the H1 (`[ HARNESS CATALOG ]`) flips to `[ DEPLOY ]` — it reads as intent rather than section label, signalling to the user that this page is the deploy entry point without baking a verb into the H1 or the nav. Patch version (not minor): pure copy change, zero logic delta, no API/env/DB change.

- **`app-sidebar.tsx:26` — `label: "Catalog"` → `label: "Agents"`.** *Why:* "Catalog" was the M2-era internal label; the URL has always been `/agents`. Nav label and URL slug should name the same thing. The sibling items ("Fleet", "Dashboard", "Settings") are all nouns naming sections; "Catalog" was the odd one out.
- **`agents/page.tsx:54` — `[ HARNESS CATALOG ]` → `[ DEPLOY ]`.** *Why:* The section tag sits above the H1 and reads as intent, not as the section title. "Harness Catalog" describes the listing's content; `[ DEPLOY ]` tells the user what they are here to do. The distinction matters post-M4 because the page now has a real Deploy button — the tag is no longer just label copy, it narrates the action.
- **`agents/page.tsx:57` — H1 `CATALOG` → `AGENTS`.** *Why:* Consistency with the sidebar label (both say "Agents") and the URL. The Fleet page's H1 is "FLEET"; the Agents page's H1 is now "AGENTS" — parallel structure across the two core app sections.

### Supersedes

- **M2's "Catalog" label for the `/agents` route** (`app-sidebar.tsx` first set in 0.4.0). The harness-listing framing is preserved in the `TerminalContainer` title ("AVAILABLE HARNESSES") and the coming-soon section ("COMING SOON") — the word "catalog" doesn't need to appear at the nav/H1 level to be legible as a catalog page.

---

## 0.7.1 — Frontend Mission-Control Implementation: Spec → Pixels (2026-04-26)

The frontend's visual identity finally matches the spec. **`docs/refs/design-system.md` has prescribed a Mission Control × Deep Space aesthetic since 0.2.0** — terminal green `#22c55e` as primary accent, Space Mono as the signature face, uppercase + `tracking-wider` chrome, hairline-bordered square panels, `[ BRACKETED ]` section labels, `›` chevrons, four-tier near-black depth, status-dot indicators with telemetry pulses. **None of it ever shipped.** 0.6.0 introduced a pearlescent chrome × halftone substrate direction *on top of* the unimplemented spec; 0.6.1 activated dark mode but the underlying tokens were still shadcn-stock-dark with pearl gradients glued on. Operator's verdict on first review: "looks clunky compared to Elephantasm" — confirming the doc-vs-code gap empirically.

0.7.1 closes that gap. **The spec is now the runtime.** Token system rewritten in `globals.css` (HSL channels matching §5 + §12, `--primary: 142 71% 45%` terminal green, `--background: 0 0% 0%` pure black, `--radius: 2px` square corners, `--font-display: var(--font-space-mono)`); seven shadcn primitives rewritten at the CVA layer (`button`, `card`, `input`, `label`, `badge`, plus the previously-orphan `status-dot` and `terminal-container` get first consumers); pearl deleted (`pearl-text.tsx` removed; `pearl` button variant retired; `.pearl`, `.pearl-text`, `.pearl-ring`, `.halftone-bg` utilities gone from `globals.css`); five live routes rewritten as mission-control panels (dashboard reframed from "Welcome back, Phil + 2 onboarding cards" to a four-tile telemetry strip + `[ FLEET STATUS ]` matrix; agents reframed as `[ HARNESS CATALOG ]` with cyan-accented spec-sheet cards; fleet wrapped in `[ AGENT INSTANCES ]` `TerminalContainer` with live `POLLING · N REGISTERED` indicator; sign-in becomes a `[ AUTHENTICATE ]` panel with `EMAIL` / `PASSPHRASE` fields and `› AUTHENTICATE` CTA; onboarding becomes `[ INITIAL CONFIGURATION ] / [ OPERATOR PROFILE ]` with `CALLSIGN` / `WORKSPACE` fields). Two console errors closed along the way: vestigial `nativeButton={false}` props leaking to DOM (residue from a `@base-ui-components/react` → `@base-ui/react` migration, finished off in the first turn of this milestone) and a Base UI `useButton` warning when `<Button render={<Link>}>` is used on the dashboard's catalog CTAs. Patch version (not minor) per the 0.5.1 / 0.5.2 / 0.6.1 precedent for non-product structural follow-up: zero new product surface, pure aesthetic correctness + two console-error fixes; the user-visible action surface (deploy modal, fleet table actions, onboarding flow) is byte-equivalent in *behavior*, transformed in *register*. No API change, no env var, no DB change, no migration. **Supersedes 0.6.0's pearl direction wholesale.**

The aesthetic register has shifted from "shadcn-stock-dark with pearl decoration" to "operator console with always-on monitoring." The load-bearing tells: a live `[ UTC ] HH:MM:SS` clock in the top-right (ticks every second, mono tabular-nums); `[ ONLINE ]` indicator with a 2.4s telemetry-pulse green dot on the dashboard header; `POLLING` indicator on the fleet route that pulses amber while non-terminal rows exist and stops when everything settles; the sidebar's active item gets a 12px green left-rule via `::before` pseudo + green text (no fill swap). Animation count: zero gratuitous motion (pearl drift retired); two functional motion registers — `.animate-telemetry` (2.4s opacity pulse for live-state indicators) and the live clock's per-second redraw. Both are "alive, not showy" per design-system.md §Animation Stance.

---

## 0.7.0 — M4: Spawn Flow (Phases 1–6) (2026-04-26)

Fourth product milestone — the first end-to-end agent lifecycle. Where 0.5.0 (M3) proved the Fly deploy primitive and 0.6.0 introduced the visual design language, 0.7.0 closes the loop between the UI and the wire: an admin can sign in, click Deploy, fill a form, submit, and watch the agent flip from `pending` → `running` in the fleet table. Six phases shipped vertical-slice — schema → service → proto verification → Connect handlers → deploy modal → fleet page — each a strict prerequisite for the next. **First time `agent_instances`, `secrets`, and `deploy_targets` exist as real tables.** **First time `agents.Service` owns a lifecycle (`Spawn`, `SpawnN`, `List`, `Get`, `Stop`, `Destroy`) beyond the M2 catalog reader.** **First time any Connect handler executes a write-path RPC.** **First time M3's `deploy.Resolver` has a runtime reader.** The user-visible loop — Deploy button → Fly app creation → `pending → running` convergence shown in the fleet table — is now code, not stub. Phase 7 (integration smoke) is the runtime confirmation that all six layers agree against a live Fly account; Phase 8 is the hardening pass. Plan: `docs/executing/spawn-flow.md`. Six per-phase completion docs under `docs/completions/spawn-flow-phase-{1..6}.md`.

- **Migration `20260426150000_spawn_flow.sql`** (87 LOC, one goose transaction) — three tables, two indexes, one seed row. `deploy_targets (name UNIQUE, kind CHECK IN ('fly','aws','local'), config JSONB, enabled)`. `agent_instances (name, four FKs, deploy_external_ref TEXT NULL, model_provider CHECK IN ('anthropic','openai','openrouter'), model_name, status CHECK IN ('pending','running','stopped','failed','destroyed') DEFAULT 'pending', config_overrides JSONB, last_started_at NULL, last_stopped_at NULL)`. `secrets (agent_instance_id FK ON DELETE CASCADE, key_name, storage_ref, UNIQUE(agent_instance_id, key_name))` — no `value` column; the API key is forwarded once to Fly's secret store and never written to Corellia's DB (blueprint §9 + decision 7). Two indexes on `agent_instances`: `(org_id, created_at DESC)` for the fleet view's hot read path; partial unique on `deploy_external_ref WHERE NOT NULL` for double-spawn defence. Seed row `INSERT INTO deploy_targets ('fly', 'fly', true) ON CONFLICT DO NOTHING`; `aws` and `local` are deliberately not seeded — a DB row implies the target is usable.
- **Four query files (13 new methods) and `sqlc generate`.** `agent_instances.sql` (8 queries: insert, deploy-ref setter, four named status-transition variants, list-by-org, get-by-id, reap-stale-pending). Status transitions are split into four named variants (`SetAgentInstanceRunning/Stopped/Destroyed/Failed`) rather than one polymorphic `SetStatus` — each variant pins the correct `last_started_at` / `last_stopped_at` timestamp side-effect at the SQL layer. `secrets.sql` (insert + list); `deploy_targets.sql` (get-by-name + list-enabled); `agent_templates.sql` extended with `GetAgentTemplateByID :one`. **`GetAgentInstanceByID` takes `(id, org_id)`** — single-tenant leakage requires actively passing the wrong org_id; a caller cannot omit the filter structurally. Generated: `internal/db/agent_instances.sql.go` (357 LOC), `secrets.sql.go`, `deploy_targets.sql.go`; `models.go` gains `AgentInstance`, `DeployTarget`, `Secret`; `querier.go` widens by 13 methods + compile-time `var _ Querier = (*Queries)(nil)` assertion.
- **`agents/service.go` rewritten** from the M2 51-line catalog reader to a 480-line spawn-lifecycle service. Nine error sentinels (`ErrInvalidName`, `ErrInvalidProvider`, `ErrInvalidModel`, `ErrMissingAPIKey`, `ErrSpawnLimit`, `ErrTemplateNotFound`, `ErrInstanceNotFound`, `ErrFlyAPI`, `ErrTargetUnavailable`). One wide `agentQueries` interface (12 methods — the M2 `templateQueries` + M4 instance/secret/deploy-target coverage). `Spawn` implements decision 27's eleven-step order in discrete code sections: validate → resolve template + adapter + deploy target → insert `agent_instances` row → insert `secrets` row → call `deployer.Spawn` → set `deploy_external_ref` → detach `pollHealth` goroutine. The API key flows through the `Env` map in-memory exactly once and is never logged, returned, or persisted. `SpawnN` fans out via `errgroup` + `semaphore.NewWeighted(3)` with zero-padded names (5→`alpha-1..5`; 10→`fanout-01..10`). `Stop` and `Destroy` are synchronous (1–3s fits request budget). `pollHealth` runs with a detached `context.Background()` 90s budget, 2s tick, exits on `HealthStarted` (flip to running) / `HealthFailed` (flip to failed) / deadline (flip to failed); probe errors are *warned* not exited-on.
- **`agents/service_test.go` rewritten** from 2 cases to 18 table-driven cases. Fakes: `fakeQueries` (atomic counters, scriptable returns), `fakeDeployTarget` (atomic counters, scriptable Health sequences), `fakeResolver`. Coverage: happy-path spawn + SpawnN naming + all validation sentinels + FlyAPI redaction (`errors.Is(err, ErrFlyAPI)` strict) + stop/destroy lifecycle + `TestList_Empty` + `TestProviderFromProto` bidirectional enum + `TestReapStalePending`.
- **`shared/proto/corellia/v1/agents.proto` extended** (+95 LOC) with six RPCs (`SpawnAgent`, `SpawnNAgents`, `ListAgentInstances`, `GetAgentInstance`, `StopAgentInstance`, `DestroyAgentInstance`), the `AgentInstance` message (12 fields), six request/response pairs, and `enum ModelProvider`. Two `// SECRET — never log this field` comments on the `model_api_key` field in both spawn request types — the IDL encodes the invariant so every downstream artefact (Go pb, TS bundle, future code reviewer) sees it. This work shipped in Phase 2 (absorbed forward because Phase 2's service signatures depended on the types at compile time); Phase 3 is the no-drift attestation (`pnpm proto:generate && git diff --exit-code -- backend/internal/gen frontend/src/gen` exits 0). Generated: `agents.pb.go` (+≈800 LOC delta), `corelliav1connect/agents.connect.go` (six new handler-interface methods + procedure constants), `agents_pb.ts` (525 LOC, 98 references to M4 types).
- **`agents_handler.go` rewritten** from 90 LOC (M2 catalog + 6 `CodeUnimplemented` stubs + 1 sentinel arm) to 208 LOC (6 real handlers + 9 sentinel arms + `userIdentityLookup` interface). Each handler ≤30 LOC: resolve caller identity (`CallerIdentity`) → parse UUID-shaped fields → build typed input → call service → marshal response. `agentsErrToConnect` switch maps 9 sentinels to 7 distinct Connect codes: `Unauthenticated`, `PermissionDenied`, `InvalidArgument` (name/provider/model/key validation), `FailedPrecondition` (`ErrSpawnLimit` — policy cap, not malformed input), `NotFound`, `Unavailable` (`ErrFlyAPI` redaction layer; raw error goes to `slog.Error` only), `Internal` (pgx/driver leak guard). `ErrSpawnLimit → FailedPrecondition` not `InvalidArgument`: a `count` of 11 is well-formed; the rejection is policy, not shape. `userIdentityLookup` is a single-method in-package interface (mirrors `organizations.userLookup`); fake-able in three lines without constructing the full users.Service chain.
- **`users.Service.CallerIdentity(ctx) (userID, orgID uuid.UUID, error)`** added (+13 LOC). Reuses the private `loadCurrentUser` helper — one DB lookup, both columns. Replaces the alternative of calling `CallerOrgID` + a separate `CallerUserID` (two DB lookups for two columns from the same row). Named-return signature makes positional confusion impossible at the call site. `cmd/api/main.go` passes `usersSvc` to `NewAgentsHandler` (one-character wiring change; `usersSvc` already existed for the users and organizations handlers).
- **Boot-time stale-pending sweep** (`agentsSvc.ReapStalePending`) wired in `cmd/api/main.go` between service construction and `httpsrv.New`. Returns `[]uuid.UUID` (not just a count) so the `slog.Warn` line is actionable: the operator can cross-reference reaped IDs against the crash event that preceded the boot. Empty-result case is silent.
- **`frontend/src/components/agents/deploy-modal.tsx` — new (491 LOC).** One `<DeployModal>` wrapper, two parallel form variants (`<DeployOneForm>` / `<DeployManyForm>`), three shared field subcomponents (`<Field>`, `<ProviderField>`, `<ApiKeyField>`). Two forms not one because the value types differ at the schema level (`name: string` vs `namePrefix: string + count: number`); React `key={mode}` on the wrapper guarantees remount on mode flip so no field state leaks. Zod schemas share three field defs (provider, modelName, apiKey); oneSchema adds `name min(1) max(80)`; manySchema adds `namePrefix min(1) max(60)` + `count int min(1) max(10)`. `count` field uses `register("count", { valueAsNumber: true })` + `z.number()` — not `z.coerce.number()`, which produces `unknown` input type and breaks the `Resolver<TFieldValues>` inference. Provider field uses `useWatch({ control, name: "provider" })` not `form.watch()` (React Compiler memoization, no `react-hooks/incompatible-library` warnings). API key field is `type="password"` with show-toggle; inline copy "Forwarded once to the agent's secret store. Never written to Corellia's database." is the user-facing surface of decision 7. `submitting` state lifted to the wrapper so all four close paths (outside-click, ESC, X, Cancel) are gated during an in-flight RPC. Success path: toast → `onClose()` → `router.push("/fleet")` per decision 38; no localStorage (decision 39). No `lib/api/agents.ts` wrapper file — the generated Connect TS client is itself the wrapper; the plan's prescription for this file was drafted before M2's `createApiClient()` pattern existed.
- **`frontend/src/components/agent-template-card.tsx` rewritten** (48 → 58 LOC). Two active buttons replace the single disabled `<Button>` + `<Tooltip>` with "Available in v1" copy: `<Button variant="outline" onClick={() => openWith("many")}>Deploy 5</Button>` (secondary — demo-moment affordance) + `<Button onClick={() => openWith("one")}>Deploy</Button>` (primary). Card owns its own modal state (`open`, `mode`). `<TooltipProvider>` removed from `agents/page.tsx` (now a vestigial import; per CLAUDE.md "if certain it's unused, delete").
- **`frontend/src/components/ui/dialog.tsx` — new (160 LOC, shadcn-installed).** Wrapper over `@base-ui/react/dialog`. Establishes the modal primitive that Phase 6's `alert-dialog.tsx` sits alongside.
- **`frontend/src/app/(app)/fleet/page.tsx` replaced** (18-LOC ComingSoon stub → 216-LOC real listing). Discriminated union state machine (`loading | empty | ready | error`). Two-`useEffect` lifecycle: Effect 1 fires once on mount (initial fetch); Effect 2 watches `state` and conditionally starts/stops a `setInterval` — **polling costs exactly zero once every row is terminal** (all statuses in `TERMINAL_STATUSES = new Set(['stopped','failed','destroyed'])`). `POLL_MS = 3000`. `fetchInstances` is `useCallback`-wrapped with no external dependencies; both effects depend on its stable identity to avoid re-fetch storms.
- **`frontend/src/components/fleet/status-badge.tsx` — new (50 LOC).** Maps five status strings to Badge variant + label + optional className: `pending` → secondary (muted); `running` → secondary + `bg-emerald-500/15 text-emerald-700 dark:text-emerald-400` (green per decision 31; no "success" variant in shadcn, className override is correct scope); `stopped` → outline + muted-foreground; `failed` → destructive; `destroyed` → outline + `text-muted-foreground/70 line-through` (line-through signals "audit row, not manageable"). Exports `isTerminal(status)` and `TERMINAL_STATUSES` — single source of truth for the polling predicate.
- **`frontend/src/components/fleet/agent-row-actions.tsx` — new (141 LOC).** Three conditional buttons (Logs when `logsUrl !== ""`; Stop when `status === "running"`; Destroy when `status !== "destroyed"`). One `pending: "stop" | "destroy" | null` state drives both AlertDialog open/close and the confirm action — collapsing two booleans into a tagged null encodes the "at most one action in flight" invariant at the type level. `onChanged: () => void` callback signals the parent to refetch on success (explicit prop, not context — the data flow is short and unidirectional). Confirm fires the RPC, closes on success, stays open on failure so the user can retry; Cancel uses `AlertDialog.Close` primitive (no manual onClick needed). No optimistic UI (decision 43) — 1–3s synchronous Fly call fits the request budget; rollback-on-error is more surface area than v1 warrants.
- **`frontend/src/components/ui/alert-dialog.tsx` — new (187 LOC, shadcn-installed).** Wrapper over `@base-ui/react/alert-dialog`. Sibling to `dialog.tsx`; distinct semantic ("destructive confirmation" vs "form modal") despite similar Base UI primitive.
- **Validation matrix.** `cd backend && go vet ./... && go build ./... && go test -count=1 ./...` clean across all phases: `internal/agents` 18 sub-tests (was 2 after M2); `internal/deploy` 26 sub-tests (M3.5 baseline); `internal/users` 3 sub-tests (0.2.5 baseline). `pnpm -C frontend type-check && lint && build` clean across Phases 5–6; `next build` produces 10 static routes including `/agents` (active CTAs) and `/fleet` (real listing). Proto no-drift check (`pnpm proto:generate && git diff --exit-code -- backend/internal/gen frontend/src/gen`) exits 0.

### Behavior change (known)

- **Six new Connect RPCs callable** (behind the existing `auth.Middleware` group): `SpawnAgent`, `SpawnNAgents`, `ListAgentInstances`, `GetAgentInstance`, `StopAgentInstance`, `DestroyAgentInstance`. The six `CodeUnimplemented` stubs from Phase 2 are gone.
- **`/agents` page has two active deploy buttons.** The disabled "Available in v1" tooltip card is gone; clicking Deploy or Deploy 5 opens a real form modal.
- **`/fleet` page replaces the M1 `<ComingSoon>` stub** with a live table + status badges + Stop / Destroy actions + Logs link. Polling activates while any row is in a non-terminal status, then self-cancels.
- **Boot-time stale-pending sweep runs before the HTTP server starts.** On first boot after a crash mid-spawn, orphaned `pending` rows older than 5 minutes are reaped to `failed`; their IDs are logged at `WARN` level.
- **API key security posture.** The model API key travels in-memory from the RPC request through the `CORELLIA_MODEL_API_KEY` env var in `deployer.Spawn`'s `Env` map and then into Fly's secret store. It is never written to Corellia's database, never logged, never returned in a response.
- **`internal/deploy.Resolver` gets its first runtime reader.** M3.5 (0.5.1) wired the `deploy.Resolver` field on `httpsrv.Deps` but no handler consumed it; M4's `agents.Service` is the first reader via `resolver.For(ctx, kind)`.

### Resolves

- **Blueprint §10 "RPG character creation" user flow** — the golden path (sign in → New Agent → pick harness → name → provider → API key → model → Deploy → fleet view) is now code, not description.
- **`docs/plans/post-0.2.6-roadmap.md` §M4** — all six coded phases shipped; Phase 7 (integration smoke) and Phase 8 (hardening) remain.
- **0.6.0 known-pending-work: "M4 spawn-flow Phase 4 WIP parking is unstable."** The `deploy-modal.tsx` was untracked and `agent-template-card.tsx` had a dangling import; both are now committed and consistent.
- **0.5.1 known-pending-work: "M4 (spawn flow) is unblocked structurally for resolver-based callsite design."** `agents.Service` consumes `resolver.For(ctx, kind)` from line 1 — no intermediate map-shaped layer needed.

---

## 0.6.1 — Frontend Redesign Phase 5: Dark Mode Activation + Base UI Button Fixes (2026-04-26)

Two runtime correctness bugs surfaced on first boot post-0.6.0, both blocking the Phases 1–4 redesign from rendering at all. **Fix 1 — dark mode never activated:** `globals.css` defines two token sets — `:root {}` (light, plain white) and `.dark {}` (dark pearlescent chrome). The `.dark` block is the only one that carries the pearl stops, sidebar dark tones, and dark background — but no code ever applied the `dark` class to `<html>`, so the browser silently fell through to the light theme and Phases 1–4's entire visual surface was invisible. Fix: `dark` added as a static class on the root `<html>` element in `layout.tsx`. **Fix 2 — Base UI `nativeButton` console error:** Two trigger sites — `DropdownMenuTrigger` in `app-top-bar.tsx` and `TooltipTrigger` inside `SidebarMenuButton` in `sidebar.tsx` — fired `useButton`'s `nativeButton` check on every mount. Base UI inspects the React element *type* (`Button`, `Link`) rather than the rendered DOM element (`<button>`, `<a>`), so passing a React component as the `render` prop fails the `"button"` string test even when the component renders a genuine `<button>` downstream. Fix: `nativeButton={false}` at both trigger sites. Patch version (not minor) per the 0.5.1 / 0.5.2 precedent: zero new product surface, pure correctness. Completion doc: `docs/completions/frontend-redesign-phase-5.md`.

Note on phase numbering: the 0.6.0 known-pending-work entry called Phase 5 the `design-system.md` doc rewrite. That work is now Phase 6 — the runtime correctness issues in this entry could not wait for a doc-only pass. The Phase 4 §9 hand-off items carry forward to Phase 6 unchanged, plus one addition: documenting the static-`dark`-class approach and its `next-themes` upgrade path.

- **`dark` class added to `<html>` in `layout.tsx`.** *Where:* `frontend/src/app/layout.tsx:29` — `className` string gains `dark ` as the first token (+1 string token, zero LOC delta). *Why:* Tailwind's class-based dark mode strategy (shadcn/ui's default) activates the `.dark {}` CSS block only when `dark` is present on an ancestor element. `globals.css` explicitly comments "Tuned dark-first; light mode is not a v1 product target" — the dark block is the intended runtime theme. Without the class, every `var(--background)`, `var(--sidebar)`, and pearl token resolves to the light `:root {}` values: white background, light gray sidebar, no pearl surface contrast. **The redesign was visually inert on every live route until this fix.** Adding `dark` statically is correct for v1; a future theme toggle (`next-themes`) would swap the class at runtime without touching the CSS variables themselves. The `layout.tsx` Server Component emits the class into the initial HTML shell — no flash-of-wrong-theme on page load.
- **`nativeButton={false}` on `DropdownMenuTrigger` in `app-top-bar.tsx`.** *Where:* `frontend/src/components/app-top-bar.tsx:52` — one prop added to the existing `<DropdownMenuTrigger render={<Button ...>} />` call (+1 prop, 1 LOC). *Why:* Base UI's `useButton` hook checks `typeof elementType === "button"` — a string comparison against the JSX tag. When `render={<Button>}` is passed, `elementType` is the `Button` function reference, not the literal string `"button"`, so the check fails and fires the console error even though `Button` renders a genuine `<button>` in the DOM. `nativeButton={false}` tells Base UI to inject `role="button"` + keyboard handlers itself rather than delegating to assumed native semantics. The rendered DOM element is still a real `<button>` — the prop does not downgrade accessibility, it just stops Base UI from making an assumption it cannot verify at the React element level.
- **`nativeButton={false}` on `TooltipTrigger` in `SidebarMenuButton` (`sidebar.tsx`).** *Where:* `frontend/src/components/ui/sidebar.tsx:521` — one prop added to the inline `<TooltipTrigger render={render} />` JSX (+1 prop, 1 LOC). *Why:* `SidebarMenuButton` accepts an arbitrary `render` prop and, when a `tooltip` prop is present, wraps it with `<TooltipTrigger>`. In `app-sidebar.tsx`, `render` is `<Link href={...}>` — a Next.js link that resolves to an `<a>` element, definitively not a `<button>`. `TooltipPrimitive.Trigger` defaults to `nativeButton={true}`, so every sidebar nav item with a tooltip (all four in the current nav) fired the error on mount. `nativeButton={false}` is unconditionally correct on this site: `SidebarMenuButton` is designed for arbitrary render elements; the tooltip wrapper cannot know or assume the element type in advance.

### Behavior change (known)

- **The pearlescent chrome × halftone substrate design is now visible.** All live routes render the dark token set: dark background, dark sidebar, pearl surfaces, halftone dot pattern. Phases 1–4's entire visual work becomes observable for the first time.
- **Zero console errors from Base UI `useButton` on dashboard, agents, and fleet pages.** The warning fired on every mount of `AppTopBar` (avatar dropdown trigger) and every mount of the sidebar when in tooltip-capable state.
- **No API change, no env var, no migration, no new dependency.**

### Resolves

- **0.6.0 known-pending-work item: "Phase 5 — design-system.md rewrite."** Phase 5 shipped as runtime code fixes rather than the doc rewrite; see the phase-numbering note in the opening paragraph. The design-system.md rewrite is now Phase 6.
- **0.6.0 known-pending-work item: "Visual aesthetic verdict deferred to operator review."** The verdict was deferred because the design was rendering in light mode — the pearl surfaces had no contrast against a white background. With dark mode activated, the operator-review gate is now meaningful.

---

## 0.6.0 — Frontend Redesign Phases 1–4: Pearlescent Chrome × Halftone Substrate (2026-04-26)

First product-shaped FE milestone since M2 (0.4.0) — value is visual, not functional. Replaces the shadcn-neutral OKLch grayscale identity with a **two-material design language**: a Kamino-shared monochrome **substrate** (halftone illustration + dot-grid backdrop, anchored by `frontend/public/logo.png`) and a Corellia-distinct pearlescent **chrome** (slow-drifting low-saturation OKLch gradient on heroes, primary CTAs, and focus rings). The two never overlap on the same element — body content (terminal containers, status indicators, semantic green) stays monochrome and lives between them. Plan: `docs/executing/frontend-redesign.md`. Four per-phase completion docs under `docs/completions/frontend-redesign-phase-{1..4}.md`. **Phase 5 (in-place rewrite of `docs/refs/design-system.md`) is not yet shipped** — see *Known pending work*. Minor version bump (not patch) per the 0.4.0 / 0.5.0 precedent: this is the first user-navigable visual identity for the product. Phases ladder in monotonically-increasing visibility — Phase 1 unconsumed CSS, Phase 2 unconsumed primitives, Phase 3 first visible change, Phase 4 cross-cutting chrome via one CVA edit.

- **`globals.css` gains the material vocabulary** (Phase 1, +119 / -0). Seven OKLch tokens for the pearl gradient + drift duration + fallback color; two for halftone density + opacity; one shared `@keyframes pearl-drift` driving `.pearl` / `.pearl-text` / `.pearl-ring`; `.halftone-bg` with the `::before` strategy baked in (consumers don't need their own `position: relative`); `prefers-reduced-motion` snap-to-midpoint. **Pearl is deliberately not a Tailwind color** — iridescence is a surface, not a hue; `text-pearl-300` would render dull static silver.
- **`pearl` button variant + three new primitives** (Phase 2, +182 LOC across 4 files). One CVA variant in `ui/button.tsx`; new `ui/{pearl-text,terminal-container,status-dot}.tsx`. **`<TerminalContainer>` and `<StatusDot>` ship without consumers** — available for M4's spawn-flow + fleet UI from line 1 (blueprint §11.4 stub-vs-real applied at the design-system layer). All three primitives use `React.ComponentProps<"...">` spread typing + `data-slot` attribute (the `Skeleton`/`Button` convention).
- **Logo asset wired + hero treatments** (Phase 3, ~73 LOC + 1 asset). `docs/assets/logo.png` (4.2 MB / 2048×2048) downsampled to `frontend/public/logo.png` (355 KB / 512×512) via `sips -Z 512` (`pngquant` not installed). Pearl-clipped wordmark on `/sign-in` (160px logo) + `/onboarding` ready-state (64px) + `/dashboard` H1; `halftone-bg` on all four `(app)/layout.tsx` state branches plus sign-in/onboarding `<main>`. **First visible visual change.** All routes use `next/image`; vignette uses `var(--background)` (theme-aware, per plan OQ4).
- **Focus chrome + sidebar logo + ambient backings** (Phase 4, ~16 net LOC across 7 files). One swap in `ui/button.tsx`'s base CVA — `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` → `focus-visible:pearl-ring` — cascades drifting pearl focus rings to **every** `<Button>` consumer. Sidebar's hardcoded "C" placeholder (M1 holdover) retired in favour of 28×28 `<Image src="/logo.png" />`. Coming-soon + agent-template-card icon backings flip from `bg-muted` / `bg-primary/10` to `halftone-bg`. Sign-in + onboarding submits gain `variant="pearl"` (decision 17 — pearl reserved for *commit* actions).
- **Pearl variant + pearl-ring interaction documented as accepted** (Phase 4 §2). Pearl-variant focus shows static halo only — `overflow: hidden` (gradient-spill mitigation) clips `.pearl-ring::before`'s `inset: -4px`. The variant is *already* drifting (its background); a second drifting layer on focus would be visual noise.
- **Validation matrix held clean across all four phases.** `pnpm type-check && pnpm lint && pnpm build` ✓ (10/10 static pages); `pnpm dev` boots ✓ (213ms in Phase 4); `/sign-in`, `/onboarding`, `/dashboard`, `/agents`, `/fleet` all 200; HTML probes confirm `pearl-ring`, `class="pearl ...`, `halftone-bg`, `CORELLIA` wordmark all server-render. **The pearl gradient itself is not screenshot-verified** — visual aesthetic checks deferred to operator review per plan §7.

### Behavior change (known)

- **Visible visual change at all live routes.** `/sign-in`, `/onboarding`, `/dashboard`, `/agents`, `/fleet`, `/settings` read as one product family. Sign-in is the loudest composition (logo + halftone + vignette + pearl wordmark + pearl submit + pearl focus rings); dashboard the smallest (just the H1).
- **Focus chrome is now pearl across every Button consumer** via one CVA swap. Decision 20's "every focused interactive element shimmers" is real after Phase 4.
- **No API change, no env var, no DB change, no migration.** Pure FE redesign.
- **Two new asset locations on disk.** `frontend/public/logo.png` (new, 355 KB); `docs/assets/logo.png` untouched as source-of-truth raster.

### Resolves

- **`docs/executing/frontend-redesign.md` Phases 1–4.** Phase 5 (`design-system.md` rewrite) is the only remaining checkbox.
- **Doc-vs-code drift on "brand green"** — live code already had zero green since 0.2.0; redesign formalises the monochrome reality and adds pearl as the only active register. Phase 5 will rewrite `design-system.md` §5.3 to match.
- **Plan risk-8 — "M4 reinvents primitives"** — `<TerminalContainer>` + `<StatusDot>` exist at known imports with exported types.

---

## 0.5.2 — Dev Tooling: Procfile Rename + Overmind Port Pinning (2026-04-26)

Polish-tier dev-tooling fix surfaced during a first-time-boot diagnosis on a fresh contributor environment. Two unrelated changes bundled because both block plain `overmind start` from working as documented in `stack.md` §7: (1) `Procfile.dev` renamed to `Procfile` so overmind's default discovery (`./Procfile`) works without `-f` or a pre-set `OVERMIND_PROCFILE`, (2) the Procfile itself rewritten to pin FE port 3000 and BE port 8080 explicitly, defending against overmind's auto-`PORT` injection that silently re-binds first-in-Procfile processes per the foreman/Heroku convention. **Supersedes 0.2.0**'s introduction of `Procfile.dev` as a Heroku-style namespace separator — Vercel ignores Procfile entirely, and Fly.io reads `fly.toml`'s `[processes]` block, so the suffix was guarding against a deploy collision that can't happen. No runtime change; no code outside repo-root tooling files; the diff is one `git mv` + one Procfile rewrite + four live-doc reflows. Patch version (not minor) per the 0.5.1 precedent for sub-milestone polish; thematically separate from 0.5.1's M3.5 product work.

- **`Procfile.dev` → `Procfile` (via `git mv`).** *Where:* repo root. The `.dev` suffix was a defensive holdover from Heroku's deploy convention (a plain `Procfile` is read by Heroku's build system as the production process declaration; separating dev orchestration prevented `next dev` and `air` from accidentally running in production). Corellia's deploy path is Vercel + Fly.io — neither reads Procfile — so the suffix was guarding against a collision that can't happen. Cost of keeping it: every `overmind start` needed `-f Procfile.dev` or a pre-set `OVERMIND_PROCFILE`, and `stack.md` §7 + `CLAUDE.md` §Common commands both already documented the bare command. **The rename resolves the doc-vs-file inconsistency in the direction the docs already assumed** — `git mv` preserves history so `git log --follow Procfile` traces back through the `.dev` era.
- **Procfile rewritten to pin both ports explicitly.** *Where:* `/Procfile` — was `web: pnpm -C frontend dev` + `api: cd backend && air`; now `web: pnpm -C frontend dev --port 3000` + `api: cd backend && PORT=8080 air`. *Why:* overmind injects `PORT=<base+stride>` into each process per foreman/Heroku convention (default base 5000, +100 per process), which without explicit overrides would shift FE→5000 and BE→5100. On Linux this would have produced "FE loads, can't reach BE, network errors throughout the catalog page" — the FE bakes `NEXT_PUBLIC_API_URL=http://localhost:8080` into its bundle at build time. On macOS Sequoia the failure is loud (`EADDRINUSE :::5000`) because the AirPlay Receiver squats on port 5000 by default, which is operationally lucky — surfaces at boot rather than at debug time. **Pinning the ports explicitly is idiomatic, not a workaround**: Next.js's `--port` flag wins over `process.env.PORT`, and `PORT=8080 air` exports the value into `air`'s child env so `internal/config.Load()` reads `8080` regardless of what overmind injects. The committed Procfile now matches what `FRONTEND_ORIGIN`, `NEXT_PUBLIC_API_URL`, and `internal/config.Config.PORT`'s default already assumed.
- **Live docs reflowed across four files.** `README.md` (×2: stack table + repo-layout tree), `CLAUDE.md` (Common commands code block at line 113), `docs/stack.md` (×3: stack table §1, layout tree §2, hour-zero scaffolding step §12), `docs/blueprints/toolchain-overview.md` (overmind tool description). Historical references in `docs/changelog.md` (the v0.2.0 entry's mention on line 879, plus the architecture-diagram update note around line 829) and `docs/archive/*` are deliberately untouched — the changelog convention "when a decision contradicts an earlier one, note the supersession in the new entry rather than editing the old one" applies. Future readers grepping `Procfile.dev` in those archived contexts will see it as the historical name and find the supersession via this entry.

### Behavior change (known)

- **`overmind start` from repo root now works without `-f Procfile.dev`.** The implicit assumption in `stack.md` §7 (which documented the bare command pre-fix) is now literal.
- **First-process `PORT` injected by overmind no longer changes FE bind port.** `pnpm -C frontend dev --port 3000` overrides whatever overmind sets — Next.js's CLI flag has higher precedence than `process.env.PORT`. Same shape on the BE: `PORT=8080 air` exports the value into `air`'s child env so `internal/config.Load()` reads it before overmind's injection takes effect.
- **No runtime change in production.** Vercel and Fly.io don't read Procfile; this entry touches dev orchestration only.
- **No new env vars, tools, or dependencies.** A pure repo-root tooling fix.

### Resolves

- **First-time-boot friction on macOS.** Any contributor with AirPlay Receiver enabled (default on Sequoia) would have hit `EADDRINUSE :::5000` on their first `overmind start`. Pinning the FE port removes a class-of-friction, not a single instance.
- **Doc-vs-file inconsistency in the local-dev story.** Pre-0.5.2 the docs said `overmind start`; the file required `-f Procfile.dev`. Post-0.5.2 they match — `overmind start` is literal, not aspirational.

---

## 0.5.1 — M3.5: Deploy Target Resolver Indirection (Phases 1–4) (2026-04-26)

Structural follow-up to M3's `internal/deploy/` package — **no behavior change**. Where 0.5.0 made the `DeployTarget` interface concrete (one Fly-backed `FlyDeployTarget`, two `NotImplemented` stubs, a kind-keyed `map[string]DeployTarget` exposed on `httpsrv.Deps`), 0.5.1 inserts one indirection layer between handlers and that map: a new `deploy.Resolver` interface with a today-implementation (`StaticResolver`) that wraps the same env-var-bootstrapped registry. Behavior is byte-identical at boot — same flaps client construction, same three targets registered, same `kinds=aws,fly,local` boot log — but the field on `httpsrv.Deps` is now narrower (`deploy.Resolver` instead of `map[string]DeployTarget`), the constructor accepts a struct instead of two positional strings (`FlyCredentials`), and the env vars that bootstrap it carry a `// TODO(v1.5):` retirement breadcrumb. Patch version (not minor) per the 0.3.0 → 0.3.1 M1-hardening precedent: this is structural pre-payment toward v1.5's user-configurable deploy targets, not a product feature. Plan: `docs/executing/deploy-target-resolver.md` (locked ahead of execution). Four per-phase completion docs under `docs/completions/deploy-target-resolver-phase-{1..4}.md`.

The whole milestone is +120 / -12 across 5 files (one new file, four edits) and lands in monotonically-decreasing diff sizes — Phase 1 +20/-5, Phase 2 +88/-1, Phase 3 +2/-2, Phase 4 +9/-3. Each phase's diff size measures how much of the architectural pre-payment was already in place when it landed; Phase 3's two-line diff is the load-bearing evidence that Phases 1 and 2 did their jobs. The eventual v1.5 swap (`StaticResolver` → `DBResolver`) is now a one-line type change in `cmd/api/main.go` plus deletion of the two annotated `Config` fields — zero handler updates, because no handler reaches into the underlying map.

- **`deploy.FlyCredentials struct{APIToken, OrgSlug string}` replaces the positional `(token, orgSlug)` constructor pair** (Phase 1). `NewFlyDeployTarget(ctx, FlyCredentials{...})` is the new shape; both call sites (`cmd/api/main.go:50`, `cmd/smoke-deploy/main.go:49`) updated to named-field struct literals. **The struct is shape, not capability** — exactly two fields, byte-identical to the previous arguments — but named-field literal syntax makes future additive growth (DefaultRegion, scoped tokens, MaxConcurrentSpawns) cost zero at existing call sites. No deprecation period, no shim function: a single-commit constructor break across three files. Plan-time pre-work assumed two grep hits but execution found three (`cmd/smoke-deploy` was added in M3 Phase 7, after the resolver plan was drafted); plan §risk-register entry 4 had explicitly anticipated this and the third caller was absorbed inline rather than spinning out a Phase 1.5.
- **New `deploy.Resolver` interface and `StaticResolver` implementation** (Phase 2). `Resolver` is single-method: `For(ctx context.Context, kind string) (DeployTarget, error)`. The ctx argument is unused by `StaticResolver` but required by v1.5's `DBResolver` for the row fetch + decryption call. **The interface deliberately omits `Kinds()` / `List()`** — adding a list method would be premature interface widening for a single boot-time observability call; the `slog.Info("deploy targets initialised", "kinds", "aws,fly,local", ...)` line keeps reading from the underlying map by design (Phase 3 carve-out). New file `internal/deploy/resolver.go` (63 LOC) holds the interface, the `StaticResolver` struct, the constructor, the `For` method, and a compile-time assertion (`var _ Resolver = (*StaticResolver)(nil)`) — the same pattern `target_test.go` already uses for `DeployTarget` conformance.
- **New `deploy.ErrTargetNotConfigured` sentinel, distinct from `ErrNotImplemented`** (Phase 2). Two sentinels, two semantics: `ErrNotImplemented` (in `target.go`, M3) means "this target type exists as a stub but its methods aren't built yet" — the blueprint §11.4 stub-vs-real distinction for `LocalDeployTarget` / `AWSDeployTarget`. `ErrTargetNotConfigured` (in `resolver.go`, M3.5) means "the resolver has no entry for this kind" — a different operator failure with a different M4 spawn-handler response. **Conflating them would give the spawn handler one ambiguous error to log and react to.** Test cases pin the contract via `errors.Is(err, ErrTargetNotConfigured)` rather than equality, so a future wrapping via `fmt.Errorf("...%w", ErrTargetNotConfigured)` won't break the test.
- **`httpsrv.Deps.DeployTargets` narrowed from `map[string]deploy.DeployTarget` to `deploy.Resolver`** (Phase 3). Single-line diff in `internal/httpsrv/server.go`'s `Deps` struct — field name and ordering preserved. **No handler updates needed because no handler reads the field yet** (M3 Phase 6's "wire the field, don't consume it" discipline holds); M4's spawn handler will be the first reader and will consume `resolver.For(ctx, kind)`, never `deps.DeployTargets[kind]`. The pre-work grep (`grep -rn 'DeployTargets\[' backend/internal/httpsrv/`) returned zero hits at the start of every phase 1–4, confirming the discipline survived end to end.
- **`cmd/api/main.go` constructs `*StaticResolver` at boot, between the existing map construction and `httpsrv.New(...)`** (Phase 3). One new line — `deployResolver := deploy.NewStaticResolver(deployTargets)` — sits *after* the `slog.Info("deploy targets initialised", ...)` so the boot sequence reads top-to-bottom as "build map → log map's contents → wrap map in resolver → pass resolver to handlers." The `keysOf(deployTargets)` slog still operates on the map, not the resolver, preserving Phase 8's `sort.Strings`-driven deterministic `kinds=aws,fly,local` runbook output. **The map outlives its registry role only as a transient scaffold for the slog line** — a deliberate non-orthogonality that costs one extra local-variable lifetime and avoids premature interface widening.
- **`Config.FlyAPIToken` and `FlyOrgSlug` carry a six-line block comment plus a `// TODO(v1.5):` retirement breadcrumb** (Phase 4). Comment-only edit at `internal/config/config.go:31-37` — no field rename, no env-tag change, no consumer update. **The version-tagged TODO is structurally different from a generic TODO**: scoped to a specific milestone (the v1.5 `DBResolver` swap), self-superseding (the deletion of the TODO and the deletion of the fields happen in the same commit), greppable as the canonical v1.5 punch list (`grep -rn 'TODO(v1.5)' backend/` returns this single line, and will return the v1.5 to-do list as more phases use the convention). Establishes the version-tagged-TODO convention in the codebase; future provisional state should use the same form.
- **Compile-time assertion as defense-in-depth across three sites.** The `var _ Resolver = (*StaticResolver)(nil)` line in `resolver.go` (Phase 2) is what makes the `httpsrv.Deps.DeployTargets deploy.Resolver` field at server.go:21 (Phase 3) accept a `*StaticResolver` value with no explicit conversion at the `cmd/api/main.go` callsite. **The three sites form a contract pin** that catches signature drift on `Resolver.For` at the most useful diagnostic location: changes to the interface fail at the assertion; changes to the implementation fail at the assertion; changes to the field type fail at the callsite. Same pattern M3's `target_test.go` established for `DeployTarget` (Phase 5 of M3); this milestone applies it to one additional interface.
- **Validation matrix.** `cd backend && go vet ./... && go build ./... && go test ./...` all clean — `internal/deploy` flipped from 24 sub-tests (M3 Phase 8) to 26 sub-tests (Phase 2's two new resolver cases); `internal/agents` and `internal/users` cached at their respective M2 / 0.2.5 baselines; both binaries (`cmd/api` and `cmd/smoke-deploy`) build end-to-end. `grep -rn 'DeployTargets\[' backend/` returns zero hits — the field-narrowing didn't surface any latent direct-map consumers. `grep -rn 'NewFlyDeployTarget(ctx, cfg\.' backend/` returns zero hits — the old positional constructor form is fully retired. Boot-time runtime smoke (`cd backend && air`) deferred to runbook per the M3 precedent that runtime checks are deploy-confidence gates, not merge gates.
- **Plan-as-built drift on Go API code: zero this milestone.** All five plan-prescribed Go signature changes (struct definition, interface declaration, two method bodies, two callsite swaps) landed exactly as drafted — no SDK-version drift, no fly-go API surprises, no signature reshape in execution. **The plan's structural decisions and call-site prescriptions both survived intact** because the Go surface this plan touches is internal — no third-party SDK godoc to drift against. Contrast with M3 where 3/7 phases needed signature touch-up against `fly-go` v0.5.0; the resolver plan's all-internal scope was structurally easier to land on the prescribed shape.

### Behavior change (known)

- **Zero behavior change at boot or at any HTTP route.** The boot log line is identical to M3 Phase 8 (`deploy targets initialised kinds=aws,fly,local fly_org=<slug>`). The HTTP surface is identical to M3 (`POST /corellia.v1.UsersService/GetCurrentUser`, `POST /corellia.v1.OrganizationsService/CreateOrganization`, `POST /corellia.v1.AgentsService/ListAgentTemplates`). The runtime smoke (`cmd/smoke-deploy` against real Fly) is unchanged because `cmd/smoke-deploy` doesn't go through the resolver — it constructs `*deploy.FlyDeployTarget` directly via `NewFlyDeployTarget(ctx, deploy.FlyCredentials{...})`, the same shape Phase 1 established.
- **Constructor signature break for `NewFlyDeployTarget` (Phase 1, in scope by design).** Any external caller still on the positional `(ctx, token, orgSlug)` form needs the one-line struct-literal update; no shim exists. Internally only two callers existed (`cmd/api/main.go`, `cmd/smoke-deploy/main.go`); both updated. **No external callers exist** because `internal/deploy/` is a Go-internal package — the break is contained to this repo.
- **`httpsrv.Deps.DeployTargets` field type narrowing (Phase 3, in scope by design).** Any external constructor of `httpsrv.Deps` (none in this repo today) that supplied a raw map would fail to compile. Internal callers: only `cmd/api/main.go`'s `httpsrv.New(httpsrv.Deps{...})` literal, which Phase 3 updated.
- **Live wire surface gained zero new routes.** Same as M3: no handler reads the resolver yet. M4 is the first reader.
- **Five new artefacts committed**: `backend/internal/deploy/resolver.go` (new), `backend/internal/deploy/target_test.go` (extended), `backend/internal/deploy/fly.go` (Phase 1 — `FlyCredentials` struct + constructor body), `backend/cmd/api/main.go` (Phase 1 callsite + Phase 3 resolver wiring), `backend/cmd/smoke-deploy/main.go` (Phase 1 callsite), `backend/internal/httpsrv/server.go` (Phase 3 field narrowing), `backend/internal/config/config.go` (Phase 4 annotation). Plus the four per-phase completion docs under `docs/completions/deploy-target-resolver-phase-{1..4}.md`.

### Resolves

- **`docs/executing/deploy-target-resolver.md` (M3.5 plan).** All four planned phases shipped (Phases 1–4) plus the validation-and-changelog phase (Phase 5, this entry). Plan moves to `docs/archive/` at next housekeeping (consistent with M3's plan-archival cadence after Phase 8).
- **Blueprint §11.1 — "no Fly outside `FlyDeployTarget`" — preserved unchanged.** `internal/deploy/` remains the only package importing `fly-go`; the resolver layer is purely Go-internal indirection above the deploy package, not a leak of Fly types into wider scope.
- **Blueprint §11.4 — "deferred features stub as real interfaces" — extended one level up.** M3 applied it to `DeployTarget` (`LocalDeployTarget` and `AWSDeployTarget` returning `ErrNotImplemented`); M3.5 applies it to `Resolver` itself. `StaticResolver` is the v1 real implementation; `DBResolver` is the v1.5 real implementation. Both will satisfy the same interface; the swap is one constructor line in `cmd/api/main.go`.
- **M4 (spawn flow) is unblocked structurally for resolver-based callsite design.** M4's plan can adopt `resolver.For(ctx, kind)` from line 1 instead of `deps.DeployTargets[kind]`, with no map-shaped intermediate layer to refactor away later.

### Known pending work

- **Operator runtime walkthrough.** `cd backend && air` boot smoke confirms `kinds=aws,fly,local` exactly as M3 Phase 8 + Phase 3 attest. The boot smoke is structurally guaranteed to pass because the only changes (constructor body shape, field type, comment) cannot affect runtime behavior. Static checks complete pre-merge; runtime check pre-deploy per the M3 precedent.
- **v1.5 user-config plan placeholder.** When v1.5 is drafted, the swap is: replace `deploy.NewStaticResolver(deployTargets)` in `cmd/api/main.go` with `deploy.NewDBResolver(queries, decryptor)`; delete `Config.FlyAPIToken` + `FlyOrgSlug`; delete the matching `.env.example` lines; remove the `// TODO(v1.5):` line + block comment. The `DBResolver` struct will likely live in `internal/deploy/db_resolver.go` and read from a `deploy_targets` table that doesn't yet exist (deferred to v1.5 schema work). **No interface change needed** if v1.5 stays kind-keyed; an additive `ForTarget(ctx, id uuid.UUID)` method or full interface replacement is the v1.5 plan's call.
- **No automated test exercises the boot-time wiring.** Phase 3's verification rests on the compiler + the existing 26 sub-tests; no test constructs an `httpsrv.Deps` literal. Acceptable at v1 scale; the runtime smoke is the integration test.
- **Compile-time assertion location inconsistency** — `var _ Resolver = (*StaticResolver)(nil)` lives in `resolver.go`, but `var _ DeployTarget = (*X)(nil)` lives in `target_test.go`. Same compile-time effect, different locations. Not a defect today; flagged as a candidate for unification when next touching either file. Trivial cleanup if/when it matters.
- **The plan-reference path (`docs/executing/deploy-target-resolver.md §1`) in `config.go`'s Phase 4 annotation will dangle when the plan moves to `docs/archive/`.** Mitigation: update the path in the same commit that archives the plan — a one-line edit. Same precedent M3 followed for its plan-archive moves.

### Supersedes

- **M3's `httpsrv.Deps.DeployTargets map[string]deploy.DeployTarget`** (Phase 3, M3 Phase 6's wiring decision). Field name and ordering preserved; only the type narrows. Any future reference to the M3 field type (in completion docs, plan docs, or code review comments) should treat M3 Phase 6's "kind-keyed registry" framing as the *bootstrap* shape and the resolver as the *consumer-facing* shape.
- **M3's `NewFlyDeployTarget(ctx, token, orgSlug string)` positional constructor** (Phase 1, M3 Phase 5's first concrete shape). Same constructor name, same package, struct-literal arguments. The M3 Phase 5 completion doc's signature notes are now historical — the post-Phase-1 form is what live code uses.
- **The implicit assumption (M3 Phase 6) that the boot wiring would be "wire the map, M4 will be the first reader."** Post-M3.5, the more accurate framing is "wire the resolver, M4 will be the first reader, the map exists only as a transient scaffold for the slog line." M4's spawn handler is the next consumer in either framing; the difference is purely structural.

---

## 0.5.0 — M3: Hermes Adapter Image + Fly Account Wiring (Phases 1–7) + Phase 8 Post-Review Hardening (2026-04-25 → 2026-04-26)

Second product milestone. Where 0.4.0 (M2) crossed scaffolding → product, 0.5.0 crosses *infrastructure abstraction* → real: blueprint §11.1's `DeployTarget` interface gets its first concrete implementation calling Fly's API at runtime; blueprint §3's harness contract gets its first compliant member (Hermes via the v1 hand-written adapter); blueprint §11.2's digest-pinning rule lands at the database layer for *both* `harness_adapters` digest columns. Seven phases shipped vertical-slice — adapter source → registry publish → operator smoke → DB backfill → Go package → binary wiring → Go-level smoke — followed by an off-plan Phase 8 hardening pass that closed two load-bearing gaps (`internal/deploy/` had zero functional tests; `Spawn` orphaned Fly apps on partial failure) and four polish items. The milestone exercises *all five* blueprint §11 rules non-trivially (§11.1 fly-isolation; §11.2 digest-pinning at app + DB layer; §11.3 `CORELLIA_*` env-var translation; §11.4 deferred features as real interfaces; §11.5 no upstream forks via the entrypoint shim). Plan: `docs/executing/hermes-adapter-and-fly-wiring.md`. Eight per-phase completion docs under `docs/completions/hermes-adapter-and-fly-wiring-phase-{1..8}.md`. Quality gate ended at 9/10 after Phase 8.

### Index

- **`adapters/hermes/` at repo root** — alongside `backend/`, `frontend/`, `shared/`. Five files: `Dockerfile` (29 LOC, `FROM docker.io/nousresearch/hermes-agent@sha256:d4ee57f2…` — bit-identical to M2's seeded `upstream_image_digest`), `entrypoint.sh` (109 LOC POSIX `/bin/sh` wrapper translating `CORELLIA_*` → Hermes-native names then `exec`'ing upstream), `README.md`, `.dockerignore`, `smoke.sh` (110 LOC operator harness). The Dockerfile *quotes* the database — migrations write the digest, the Dockerfile follows in the same PR.
- **Multi-arch image published at GHCR.** `ghcr.io/hejijunhao/corellia-hermes-adapter@sha256:d152b3cb…` (linux/amd64 + linux/arm64; tag `v2026-04-26-0ece98b` + `:latest`; public; anonymous pull verified after `docker logout ghcr.io`). **The manifest-list digest is non-deterministic across rebuilds** because BuildKit bakes SLSA-style provenance attestations (with build-time timestamps) into the image index. Per-arch digests are deterministic; the wrapper digest is not. The DB pins the manifest-list (operational identity); per-arch digests are the substantive identity.
- **Fly substrate pull-rehearsal succeeded** with throwaway `corellia-rehearsal-46efd119` in `iad` (~50s end-to-end). Two CLI quirks documented for Phase 3: `fly logs --no-tail` waits for at least one batch even when none exist (hangs on empty streams); the doubled-digest quirk where Fly's CLI resolves manifest-list → per-arch and *appends* without stripping (`<image>@sha256:X@sha256:X`). Both are CLI-only — Phase 5's Go path via `fly-go` + `flaps` doesn't hit either.
- **`harness_adapters.adapter_image_ref` backfilled + tightened** (migration `20260426120000_adapter_image_ref_backfill.sql`, 56 LOC, single transaction). `NOT NULL` + `CHECK (adapter_image_ref LIKE '%@sha256:%')` named `adapter_image_ref_digest_pinned`. Both rejection paths verified empirically (tag-form UPDATE + NULL UPDATE). **First time §11.2 is enforced on real data for *both* digest columns.** Defence-in-depth across DB + Go layer.
- **`AdapterImageRef *string` → `string` type-flip from the migration.** `emit_pointers_for_null_types: true` produced `*string` while nullable; post-`NOT NULL`, sqlc flips to bare `string`. Phase 5's `Spawn` sees the non-pointer type from day one — no nil-check, no `*ref` deref. **Type-driven design at the database layer**: tighten the schema to the strongest invariant, the generated types eliminate entire classes of error-handling at the call site for free.
- **`internal/deploy/` package shipped** — second cross-cutting abstraction after `db.Querier`. Three files: `target.go` (interface + types + `ErrNotImplemented`), `fly.go` (concrete `FlyDeployTarget`), `stubs.go` (`LocalDeployTarget` + `AWSDeployTarget` returning `ErrNotImplemented` from every method). `DeployTarget` interface has five methods (`Kind`/`Spawn`/`Stop`/`Destroy`/`Health`); `Logs` deferred to v1.5. **The two stubs are §11.4 encoded as Go code** — real types, not commented-out scaffolding.
- **`fly-go` SDK consolidated to flaps-only.** Plan held both `fly` (GraphQL) and `flaps`; as-built collapsed to flaps-only because `flaps.CreateAppRequest{Org: <slug>}` accepts the slug directly (no GraphQL ID resolution), `flaps.DeleteApp` is the symmetric counterpart, and one transport means one credential plumbing path. The plan's `fly-go` API surface had drifted from v0.5.0 reality in three places (constructor shape, `SetSecrets` location, `flaps.NewClientOpts.AppName`). **Plans that prescribe Go code at the call-site level age fast against a third-party SDK; plans that prescribe interface shapes age slowly.**
- **`adapters.Service.UpdateImageRef`** — symmetric write-side of M2's `Get`. New SQL query co-located in M2's `harness_adapters.sql`; domain method follows the established `pgx.ErrNoRows → ErrNotFound` redacted-error pattern from `users.UpdateName` (0.2.5) and `organizations.UpdateName` (0.3.0). Three services, one architectural pattern. No caller in M3; M4 (or an admin tool) writes after the next adapter rebuild.
- **`cmd/api/main.go` wires three deploy targets behind `map[string]deploy.DeployTarget` keyed by `Kind()`** — self-describing registry, not a hand-maintained string table. New boot log line `slog.Info("deploy targets initialised", "kinds", "aws,fly,local", "fly_org", <slug>)` between `jwks initialised` and `listening addr=:8080`: three lines, three subsystems confirmed. `cfg.FlyAPIToken` + `cfg.FlyOrgSlug` finally have a runtime reader (required-since-0.1.0). `grep -rn DeployTargets backend/internal/httpsrv/` returns exactly the field declaration — no half-finished plumbing; M4 is the first reader.
- **Third Fly-touching path: `cmd/smoke-deploy/`** (108 LOC, 11.9MB binary). The codebase had two pre-Phase-7 (shell via `flyctl`; `cmd/api`'s embedded server). The third — SDK-direct via Phase 5's wrapper — exercises `internal/deploy/` in isolation from the web server's Connect/DB/auth substrate. Three-path structure makes failure-mode triangulation possible: shell ↔ `cmd/smoke-deploy` disagreement isolates `fly.go`'s wrapper code vs `flyctl`'s CLI path.
- **Phase 8 closed two load-bearing gaps + four polish items.** (1) `target_test.go` rewrote 11 → 110 LOC with **24 functional sub-tests** across `TestValidateImageRef` (7 cases — including the `contains_sha256_but_no_@` canary against §11.2 relaxation), `TestMapFlyState` (10 cases — `unknown-future-state` policy pin: fail closed), `TestAppNameFor`, `TestParseExternalRef`. (2) `Spawn` rewritten with named-return + `defer` rollback covering every error path between `CreateApp` and `Launch`; cleanup uses fresh `context.Background()` so caller-cancellation that triggered the rollback doesn't *also* cancel the rollback. (3) `Health` errors on `>1 machine` (blueprint §8 invariant: one AgentInstance = one Fly app = one Fly machine, self-validating both ways). (4) `keysOf` sorts via `sort.Strings` so the boot log emits `kinds=aws,fly,local` deterministically — runbook contract. (5) `_ = adaptersSvc` keepalive deleted. (6) `// SAFETY:` carve-out in `cmd/smoke-deploy` documents the §11.8 deviation at the call site (smoke-only env vars side-step `internal/config/` because folding them into `Config` would put smoke plumbing on every production process's fail-fast-at-boot path).
- **Hermes runtime-contract gap with §3.1.** Hermes 0.x is **CLI-shaped, not server-shaped** — no built-in `/health`, no `/chat`. Phase 7's smoke can't probe `/health` (replaced with `state == started` poll). v1.5 follow-up: sidecar HTTP wrapper exposing `POST /chat` forwarding to `hermes chat -q "..."`. Reaction is *not* to retrofit Hermes (forbidden by §11.5) nor to abandon the contract — ship the env-var translation half (independently useful), queue the sidecar. §11.4 stance applied at the harness-contract level. Flagged in `adapters/hermes/README.md` §"Known limitations".
- **`CORELLIA_MODEL_NAME` is observability-only at the adapter today.** Hermes 0.x has no env-var hook for model selection (deprecated `LLM_MODEL` was explicitly removed). Default `anthropic/claude-opus-4.6` always wins. **Real product gap**: M4's catalog model picker is visually doing something but runtime always uses upstream default. v1.5 follow-up needs `entrypoint.sh` to write a `config.yaml` fragment or pass `--model` via parsed CLI. M4 plan needs to address this explicitly.
- **Validation matrix.** `internal/deploy` flipped non-existent → `[no tests to run]` (Phases 5–7) → `ok ... 0.165s` running 24 sub-tests (Phase 8). `internal/agents`/`internal/users` cached at M2/0.2.5 baselines, no regression. FE `type-check` + `lint` clean (no FE changes). Two binaries build end-to-end: `cmd/api` (27.7MB), `cmd/smoke-deploy` (11.9MB).

### Behavior change (known)

- **`Spawn` no longer leaves orphan Fly apps on partial failure.** Pre-Phase-8 callers needed to call `Destroy` themselves after a `Spawn` error; post-Phase-8 the cleanup happens inside `Spawn` before the error returns. Operationally: any Fly account with pre-Phase-8 orphans needs one-time manual cleanup via `flyctl apps destroy <name>`.
- **`Health` returns an error for apps with >1 machine.** Pre-existing 2-machine apps surface as `(HealthUnknown, error)` rather than silently reporting machine[0]'s state.
- **`cmd/api`'s boot log emits `kinds=aws,fly,local` deterministically.** Anyone who pinned the *exact* string `"fly,local,aws"` (the pre-sort accidental default) needs to update; substring `"fly"` matchers are unaffected.
- **Live wire surface gained zero new routes.** Phase 6 wired `httpsrv.Deps.DeployTargets` but no handler reads it in M3; M4 is the first reader.
- **First production caller of any Fly-touching code path.** Every `cmd/api` boot now constructs a real `*flaps.Client`. Note: `flaps.NewWithOptions` does *not* make a network call on construction — first failure point on a stale token is `Spawn`/`Stop`/`Destroy`/`Health`, not boot.

### Resolves

- **`docs/executing/hermes-adapter-and-fly-wiring.md` (M3 plan).** Third milestone of four. All seven planned phases shipped + off-plan Phase 8.
- **Blueprint §3 first compliant member.** Configuration sub-contract (§3.2 — `CORELLIA_*` env vars) end-to-end exercised; runtime sub-contract (§3.1) is *not* exercised because Hermes is CLI-shaped (v1.5 sidecar work).
- **Blueprint §11.2 enforcement on the *adapter* digest column.** Pre-M3 was Go-level convention only; post-M3 has a CHECK matching `upstream_image_digest`'s M2 enforcement.
- **Blueprint §11.4 first encoded as type-system-enforced.** `LocalDeployTarget` + `AWSDeployTarget` exist as real interface implementations; compile-time assertions (Phase 5) + 24 functional tests (Phase 8) make the contract enforceable.
- **`config.Config.FlyAPIToken` + `FlyOrgSlug` get their first runtime reader.** Required-since-0.1.0 placeholders that the binary loaded but never used.
- **M4 (spawn flow) unblocked structurally.** Deploy primitive is rollback-safe + tested; DB has `NOT NULL` + digest-pinning CHECK on `adapter_image_ref`; registry exposed on `httpsrv.Deps`; `adapters.Service.UpdateImageRef` ready for the operator-driven digest bump path.

### Known pending work

- **Operator runtime walkthrough** before non-localhost deploy: (1) `cd backend && air` boot smoke confirming the three log lines in order; (2) `./adapters/hermes/smoke.sh`; (3) `cd backend && go run ./cmd/smoke-deploy`. Acceptance: both smokes green, both clean up Fly apps, no leaks per `fly apps list | grep corellia`.
- **Hermes runtime-contract gap (§3.1).** v1.5 sidecar HTTP wrapper exposing `POST /chat` + own `/health`. Separate plan because it touches harness-contract design.
- **`CORELLIA_MODEL_NAME` is observability-only.** M4 plan must address explicitly — model-name plumbing through the harness is the v1 product gap.
- **No real-Fly integration test for `Spawn` rollback.** Pure-function tests cover the helpers; the rollback path needs either a real Fly token + injectable failure or a `*flaps.Client` mock. Operator-time verification documented in the runbook.
- **GHCR visibility-toggle is UI-only for user packages.** Re-creation defaults back to private. `kaminocorp` org migration makes the flip scriptable.
- **Manifest-list digest non-determinism across rebuilds.** Rebuilds without source changes shouldn't re-trigger a Phase 4 migration; the DB digest is the canonical artefact. If a rebuild *is* needed, it's a real change and a new migration is appropriate.
- **Four sites hold the digest string** — Phase 4 migration, `smoke.sh`, `cmd/smoke-deploy`'s `defaultImageRef`, Phase 2's audit block. A future bump needs coordinated edits; `tools/check-digest-coherence.sh` is a 10-LOC follow-up.
- **Cosign / Sigstore provenance verification** on both digests. v2 hardening: `cosign verify-attestation` against Nous's published key + `cosign sign` on our adapter + a `signature_verified_at` column. Today's pin is "bit-identical to what we captured," not "signed by Nous's key."
- **Post-review hardening playbook doc** if Phase-8-style passes repeat at M4/M5. v1.5 candidate.
- **No CI hooks** for `bash -n`, `goose up && down && up` round-trip, or `sqlc diff`. Each is one-line; bundle when CI is set up post-v1.
- **`appNameFor` is collision-resistant but not collision-free** (8 hex chars, birthday at ~65k agents/org). v1/v2 sizing is comfortably below the threshold; widen to 12 hex chars or salt-and-retry past ~10k agents.

### Supersedes

- **Phase 6's `_ = adaptersSvc` keepalive.** Deleted by Phase 8. M4 re-introduces import + construction when the first handler wires it.
- **Phase 6's "M4 will land the first test exercising this code path"** for `validateImageRef` / `mapFlyState` / `appNameFor`. Resolved earlier than scheduled by Phase 8.
- **Phase 7's implicit §11.8 carve-out for `cmd/smoke-deploy`.** Phase 8's `// SAFETY:` block makes the carve-out auditable; the carve-out itself is unchanged.
- **Phase 6's `kinds=fly,local,aws` runbook reference.** Phase 8's `sort.Strings` makes the log emit `kinds=aws,fly,local` deterministically; this entry updates the snippet rather than editing Phase 6's completion doc.
- **The plan's literal Go snippets across Phases 4, 5, 7.** As-built diverged in three phases (`*string → string` implications, `fly-go` SDK shapes, `cmd/smoke-deploy` constructor). Per supersession-not-edit, the plan stays as-written and this changelog records the divergences. **The plan got the architecture right in every case; only the call-site Go diverged.**

---

## 0.4.0 — M2: Agent Catalog (`HarnessAdapter` + `AgentTemplate` + `/agents` page) (2026-04-25)

First product milestone. The codebase stops being scaffolding and becomes product: a real schema (`harness_adapters` + `agent_templates`), a Hermes seed pinned by upstream image digest, the first product RPC (`AgentsService.ListAgentTemplates`), and the first product UI page (`/agents`). Six phases shipped vertical-slice — schema → sqlc → proto + TS → backend domain + handler → frontend page → tests. Three blueprint §11 rules land enforced for the first time on real data: §11.2 (digest-pinning) as a Postgres CHECK *and* a Go convention; §11.4 ("deferred features stub as real interfaces") as the live-card vs. sneak-peek-card split; §11.6 (no Supabase outside `auth/` + `db/`) survives because the new packages touch `db.Queries` only. The version bump from 0.3.x to 0.4.x is the semantic signal: 0.4.0 is the first feature an end user can navigate to. Plan: `docs/executing/agent-catalog.md` (37 locked decisions). Six per-phase completion docs under `docs/completions/agent-catalog-phase-{1..6}-completion.md`.

### Index

- **Migration `20260425170000_agent_catalog.sql`** — both tables + two seed `INSERT`s in one goose transaction. `harness_adapters` carries `CHECK (upstream_image_digest LIKE 'sha256:%')` + `CHECK (source IN ('hand_written', 'generated'))`. Down block strict-LIFO with `IF EXISTS`. Idempotent: `ON CONFLICT (harness_name) DO NOTHING` for the harness; `WHERE NOT EXISTS (...)` subquery for the template (composite-key idempotency without a unique index). **First time §11.2 is enforced on real data** — Go-level validation can be bypassed by anyone with `psql`; a CHECK cannot.
- **Hermes digest captured via `crane digest ghcr.io/nousresearch/hermes-agent:<version>`** (manifest-list digest, not `:latest`). Audit-comment block above the seed records `resolved_tag`, `digest`, `captured_at`. Three governance moves: starting from a version tag means we know which release we're pinning; manifest-list digest is the right granularity for a multi-arch orchestrator; the SQL comment makes the pin auditable.
- **Schema includes v2 plumbing without v2 callers.** `agent_templates.created_by_user_id UUID NULL REFERENCES users(id)` (NULL = system seed) and `default_config JSONB NOT NULL DEFAULT '{}'::jsonb`. Three columns deliberately deferred (decisions 6 + 9): `harness_adapters.manifest_yaml`, `harness_adapters.validation_report` (land with v2's adapter-analysis pipeline), `agent_templates.org_id` (lands with user-defined templates). `adapter_image_ref` is `TEXT NULL` in M2 — M3 backfills + tightens to `NOT NULL`; an empty-string placeholder would fail §11.2 in spirit.
- **SQL queries (new, narrow projection).** `queries/agent_templates.sql` defines `ListAgentTemplates :many` projecting exactly `id, name, description, default_config` — sqlc's row type physically cannot leak `harness_adapter_id` / `created_by_user_id` / timestamps. **Column projection is API design, not optimization.** `queries/harness_adapters.sql` defines `GetHarnessAdapterByID :one` with no M2 caller — exists so M3's `UpdateAdapterImageRef` extends rather than scaffolds the package.
- **Proto (new) `shared/proto/corellia/v1/agents.proto`.** One service, one RPC (`ListAgentTemplates`), three messages. `AgentTemplate` carries `id`, `name`, `description` only — not `default_config` (M4's deploy modal), not `harness_name` (per blueprint §2 the user never sees the word "harness"). Clean to add later, painful to retract. `ListAgentTemplatesRequest {}` empty by design — no filtering, no pagination, no per-org scoping (decision 10).
- **Two new backend domain packages.** `internal/adapters/` (one method, `Get(ctx, id)`, no runtime caller — M3 wires `UpdateImageRef`); `internal/agents/` (one method, `ListAgentTemplates`). Both mirror `users/` + `organizations/`: private query interface, sentinel `ErrNotFound`, typed-row → proto conversion. `agents.ErrNotFound` is declared but unused — pre-paid for M4's `GetAgentTemplate(id)` consumer named in the plan.
- **`internal/agents/service.go`'s `make([]*…, 0, len(rows))` is load-bearing.** Without it, sqlc's `nil` zero-rows return marshals to JSON `null` over Connect's default codec; FE's `templates.length` would crash. The non-nil empty slice marshals to `[]`. Pinned by `TestListAgentTemplates_Empty` whose assertion message names the wire-shape contract explicitly so any "cleanup" to `var out []...` produces a directed test failure rather than a silent crash on first empty-catalog deploy.
- **Transport: `httpsrv/agents_handler.go`** — implements `corelliav1connect.AgentsServiceHandler`; `agentsErrToConnect` switch with `ErrNotFound` → `CodeNotFound` and a `slog.Error` + redacted `Internal` default arm (0.2.5's post-review pattern; pgx errors don't leak across the wire). Method body 7 lines, well under §11.9's <30. `httpsrv.Deps` gains `AgentsHandler` between `OrganizationsHandler` and `AllowedOrigin`; mount goes inside the existing auth-middleware group (catalog is authenticated). `adapters.NewService` is *deliberately not* wired — M3 wires it.
- **Structural typing collapses the wiring.** `*db.Queries` satisfies all four per-service interfaces (`userQueries`, `orgQueries`, `templateQueries`, `adapterQueries`) without anyone editing it. Adding a fifth service is one `service.go` + a constructor call in `main.go`; no central registry.
- **Frontend `/agents` page** — `"use client"`, four-state union (`loading | ready | empty | error`), `useEffect`-driven fetch. Render branches: skeleton cards / live-grid + sneak-peek section / sneak-peek section only / centered error card with sneak peeks suppressed (sneak peeks complement a working catalog, not a fallback for a broken one). Replaces M1's 18-LOC `<ComingSoon>` stub. Sibling `layout.tsx` carries `metadata.title` because the page is `"use client"` (recurring App Router pattern, simplified by 0.3.1's `metadata.title.template` to bare `"Agents"`).
- **`<AgentTemplateCard>` (live)** — Bot icon in `bg-primary/10`, disabled `Deploy` button + tooltip "Available in v1". Tooltip wrapper-span uses base-ui's `render={<span tabIndex={0} />}` — *not* Radix's `<TooltipTrigger asChild>` which the plan was written against. M1 already documented this convention; M2 extends it.
- **`<ComingSoonHarnessCard>` (sneak-peek)** — same shell as the live card but **no `CardFooter`, no `Button`, no `Tooltip`** (decision 25's "nothing to click means nothing to fake" — §11.4 compliance). The `<Badge variant="secondary">Coming Soon</Badge>` sits in the header where a real-time status indicator would go in an M4 fleet card. Anyone adding a click target has to add a whole new section, a far higher bar than re-enabling a disabled button.
- **Static sneak-peek manifest `lib/agents/coming-soon.ts`** — three FE-only entries (LangGraph, CrewAI, AutoGen). Not a DB seed: a placeholder row would either NULL the `harness_adapter_id` FK or violate the `sha256:%` CHECK. When a sneak-peek graduates, the migration shape is the M2 Hermes seed; the static-array entry deletes in the same PR.
- **One new shadcn primitive: `badge.tsx`.** `base-nova` registry includes Badge — unlike `form` which 0.3.0 documented as silently skipped from the same registry. Future shadcn-add invocations need post-add file-existence verification.
- **`<TooltipProvider>` mounted at *page scope*, not globally.** Page-scope is the broadest legitimate scope today — other chrome routes don't use tooltips. Promote to `(app)/layout.tsx` when a second consumer arrives (Settings has obvious candidates).
- **Tests.** `internal/agents/service_test.go` — two cases (`_HappyPath`, `_Empty`) via external test package + `fakeQueries` satisfying the private interface (same shape as `users/service_test.go`). `internal/adapters/` deliberately untested (decision 29 — testing a getter that nothing reads is busywork).
- **Validation matrix.** Backend `go vet ./... && go build ./... && go test ./...` clean — `internal/agents` flipped from `[no test files]` to `ok ... 0.333s`. Frontend `type-check && lint && build` clean — eight static routes prerendered. `/agents` is `○ Static` even though `"use client"` because the data fetch lives in `useEffect`, post-hydration.
- **Cleanup pass.** Zero `TODO/FIXME/XXX`, zero `console.*`, zero blank-identifier import keepalives across all M2 surfaces.

### Behavior change (known)

- **Live wire surface gained one route:** `POST /corellia.v1.AgentsService/ListAgentTemplates`, mounted inside the auth-middleware group. Anonymous calls return 401.
- **`/agents` is now a real product page** — Hermes card (live, DB-backed) + three sneak-peek cards. M1's placeholder is gone *for this route only*; `/fleet` and `/settings` retain it. The dashboard's "Spawn your first agent" CTA now lands on a working catalog.
- **`<TooltipProvider>` mounted somewhere for the first time** (page-scoped). If a future route adds tooltips and forgets its own provider, base-ui tooltips silently fail to position — hoist this provider when that happens.

### Resolves

- **`docs/plans/post-0.2.6-roadmap.md` §M2** — second milestone of four. Plan moves from `executing/` to `archive/` once the runtime walkthrough completes.
- **0.3.0's broken "Spawn your first agent" CTA destination** — dashboard's primary card linked to `/agents` since M1; clicking it landed on the placeholder. Now lands on a real catalog.
- **Blueprint §11.2 first enforced on real data.** CHECK constraint at the database layer + one row of seeded data exercising it. Future migrations cannot backslide without explicit constraint-violation.
- **Blueprint §9 first product schema.** First two of v1's tables land. `agent_instances`, `secrets`, `deploy_targets` deferred to M4 ("no table exists before its first reader" — roadmap §1).

### Known pending work

- **Operator runtime walkthrough** (Phase 6's three deferred checks). Runbook captured in `docs/completions/agent-catalog-phase-6-completion.md`. Run before first non-localhost deploy.
- **Plan migration `executing/agent-catalog.md` → `archive/`** once the runtime walkthrough completes.
- **No DB-error propagation test for `agents.Service`.** M4's `GetAgentTemplate(id)` lands the first test exercising `agentsErrToConnect`'s default arm.
- **No real-DB integration test for the catalog query.** Lands at M4 alongside the spawn-flow's testcontainers-go fixture.
- **No FE component tests** — FE test infrastructure isn't set up in v1 (CLAUDE.md: "No Playwright / E2E in v1").
- **Sneak-peek copy is placeholder-quality.** Worth a copy-pass when `multiagent-deployment-frameworks.md` (or its replacement) lands.
- **`adapter_image_ref` nullability** — M3 backfills + tightens to `NOT NULL`.
- **Cosign / Sigstore provenance verification** on the pinned digest. v2 hardening per the plan's risk register §6: when Nous publishes signatures, add `cosign verify` to pre-work + a `signature_verified_at` column. Today's pin is "bit-identical to what we captured," not "signed by Nous's key."
- **`<TooltipProvider>` page-scoped, not global.** Promote to `(app)/layout.tsx` when a second consumer arrives.

### Supersedes

- **0.3.0's `<ComingSoon>` placeholder at `/agents`.** `/fleet` and `/settings` retain their M1 shape; M4 replaces `/fleet`'s.
- **Phase 6 completion doc's "0.3.0" version reference** — the doc was queued under 0.3.0 before M1 took that slot. Per the supersession-not-edit convention from 0.2.6 Phase 5, the doc is left as the historical record; this entry is the supersession that lands the work under 0.4.0.

---

## 0.3.1 — M1 Hardening: Provider Memoization, Title Template, `middleware` → `proxy` (2026-04-25)

Targeted polish pass on 0.3.0's M1 deliverables, written off the back of a thorough post-milestone code-quality review. Six small fixes — the largest is the Next 16 `middleware.ts` → `proxy.ts` migration that retires a deprecation warning surfaced (and deferred) in every M1 phase doc. No behavior change visible to the end user; the fixes close real but quiet defects (provider re-render storm) and bring the codebase into line with documented project conventions (forced-redirect uses `replace`, not `push`). Entirely frontend; zero backend, schema, or proto deltas. `pnpm -C frontend type-check && lint && build` all green; build prerendered all eight static routes with no warnings (the `middleware → proxy` deprecation line is gone — confirms the migration landed cleanly).

### Index

- **`<UserProvider>` value memoized.** `frontend/src/app/(app)/layout.tsx`. The previous shape `<UserProvider value={{ user: state.user, org: state.org }}>` allocated a new object literal on every layout render, breaking referential equality and forcing every `useUser()` consumer to re-render whenever the layout did. Today the only consumer is the dashboard, so the bug is invisible — but it would surface the moment the top bar or sidebar migrates onto context (already flagged as future work in 0.3.0's "Known pending work"). Fix extracts a `<ReadyChrome>` sub-component so `useMemo` can wrap the value; props identity is now stable across re-renders.
- **`router.push` → `router.replace` in sign-in.** `frontend/src/app/sign-in/page.tsx:26`. Sign-in is a one-shot forced navigation — pressing back after success returns to a sign-in form the user has already passed. Every other forced navigation in the codebase (wizard's three branches, layout's auth/onboarding gate, top-bar sign-out) uses `replace` per the convention recorded in `docs/completions/onboarding-wizard-phase-2.md` §"Why `router.replace` (not `router.push`)". Sign-in was the lone outlier; one-character fix brings it into line.
- **Defensive throw in `lib/supabase/client.ts`.** Phase 6 fixed the `/sign-in` prerender bug by moving the `createClient()` *call site* into `onSubmit`; the underlying trap (`process.env.NEXT_PUBLIC_SUPABASE_URL!` non-null assertion) was preserved in the helper. If anyone in M2+ reintroduces a module-scope or component-scope `createClient()` in a `"use client"` page, prerender would silently fail again. Replaced both `!` assertions with an explicit env check that throws a contextful message naming the likely cause ("you called createClient() at module or component scope in a 'use client' page — move it into an event handler or useEffect"). Closes the bug *class*, not just the symptom.
- **`metadata.title.template` consolidation.** Set `title: { default: "Corellia", template: "%s — Corellia" }` on `app/layout.tsx`; collapsed five children to bare names. `agents/page.tsx` `"Agents — Corellia"` → `"Agents"`; same shape for `fleet`, `settings`, `dashboard/layout.tsx`. The wizard's `onboarding/layout.tsx` keeps its full string via `title: { absolute: "Welcome to Corellia" }` (overrides the template — the brand is in the value already, so `"Welcome — Corellia"` would read worse). Net: one root edit + five one-line simplifications, cognitive surface drops because new pages don't have to remember the suffix. Logged as a polish-pass candidate in `docs/completions/onboarding-wizard-phase-4.md` §Findings.
- **`middleware.ts` → `proxy.ts` migration.** Next 16 deprecated the `middleware` file convention in favour of `proxy`. The deprecation warning surfaced in every M1 build (Phases 1, 6) and was deferred each time. Fix is mechanical: `git mv frontend/src/middleware.ts frontend/src/proxy.ts` plus renaming the exported function from `middleware` to `proxy`. Same matcher config, same `updateSession(request)` body. The `git mv` preserves blame history. Build output now reads `ƒ Proxy (Middleware)` cleanly with no deprecation line — that single absent line is the verification. **Note for Bun/Vercel deploys:** the convention rename is a Next 16 feature; older Next versions don't recognise `proxy.ts`. We're already on 16.2.4 (per the build banner), so this is forward-compatible.
- **Validation.** `pnpm -C frontend type-check && pnpm -C frontend lint && pnpm -C frontend build` all green after `rm -rf frontend/.next` (cache invalidation needed for the file rename to register). Build prerendered eight static routes (`/`, `/_not-found`, `/agents`, `/dashboard`, `/fleet`, `/onboarding`, `/settings`, `/sign-in`) with no warnings.

### Why each fix

#### Why memoize the provider value via a sub-component, not inline

`useMemo` is a hook — it can only run inside a function-component body. The layout's render branches (`loading`, `not-provisioned`, `error`, `ready`) early-return; placing `useMemo` at the top of the layout would run it on every render including the redirect/error paths where `user`/`org` aren't yet defined. Extracting the ready-state render to a `<ReadyChrome>` sub-component scopes the hook to the only branch where the inputs exist, stays clean against React's rules-of-hooks ESLint rule, and keeps the parent layout's branch logic flat. Net diff: +13 lines (the sub-component declaration), -3 (the inlined render block).

#### Why `replace` everywhere, not just sign-in

The codebase's documented rule (Phase 2 doc): *`replace` for forced navigation that shouldn't be reversible by back-button; `push` for user-initiated nav.* Sign-in is the canonical forced one-shot — once the redirect lands on `/dashboard`, there's no legitimate "I want to go back to the sign-in form" reason. The previous `push` was almost certainly leftover from the original 0.2.0 scaffold (the convention was tightened in Phase 2). Aligning the entry-point of the auth flow with the rest of it is consistency-as-defect-fix.

#### Why a throw in `client.ts`, not a typed Result

The helper has exactly one consumer family: components that need a Supabase browser client at user-interaction time. Threading a `Result<Client, ConfigError>` through every call site would be an order of magnitude more code for a failure mode that is purely a *configuration* error (env vars missing) — the right action is "crash loudly with a useful message," not "let every caller branch on it." Same fail-loud rationale that drove the JWKS verifier's `NoErrorReturnFirstHTTPReq=false` decision in 0.2.6 and `useUser()`'s out-of-provider throw in 0.3.0 Phase 5. Three load-bearing pieces of FE/BE infrastructure now share the convention: misconfiguration is a programming error, not a runtime branch.

#### Why `title: { absolute }` for the wizard, not the template default

The wizard's title is `"Welcome to Corellia"`. With the template applied, the bare title `"Welcome"` would render as `"Welcome — Corellia"` — grammatically valid but reads as a tagline rather than a route name. The `{ absolute: ... }` form bypasses the template specifically for this one route. Cost: one extra metadata key. Benefit: the full sentence "Welcome to Corellia" reads naturally to a first-time signed-in user, who is the entire audience for this title.

#### Why the `proxy` rename can't be skipped indefinitely

Two reasons beyond the obvious "deprecation warnings are noise":

1. **Next.js's `proxy` API is the forward path.** The convention rename is a precursor to capabilities that don't exist on the legacy `middleware` API (the deprecation message links to `nextjs.org/docs/messages/middleware-to-proxy`, which itself points at the new feature surface). Migrating now means we adopt new capabilities cleanly when we want them; deferring means a forced migration plus a feature adoption in one shot.
2. **The deferral was already two milestones long.** Phase 1's findings logged it; Phase 6's findings re-logged it; this entry retires it. Three log entries in two months is the threshold at which "deferred polish" becomes "ignored debt."

The migration's blast radius is genuinely small (two-line file, no consumers because Next.js auto-discovers the export), so doing it now is the cheap call.

### Behavior change

- **None visible.** Browser tabs render identically (`Agents — Corellia`, `Dashboard — Corellia`, etc. — same strings, just produced by template rather than per-page literals; verified by reading the build's prerender output). Sign-in success still lands on `/dashboard` (now via `replace` — the back-button-after-sign-in regression is the only observable difference, and it's a fix not a regression). Build no longer emits the `middleware → proxy` deprecation warning.
- **Internal:** `useUser()` consumers no longer re-render on every layout re-render. Today's only consumer (the dashboard) was unaffected because the layout doesn't re-render after the initial fetch resolves; the fix is debt prevention for M2+ when more components consume the context.

### Resolves

- **0.3.0 "Known pending work" → `metadata.title.template` consolidation.** Resolved as described.
- **0.3.0 / 0.1.x deprecation backlog → `middleware.ts` deprecation warning.** Resolved as described.
- **Provider re-render perf concern surfaced in the M1 post-milestone code review.** Resolved as described — `useMemo` wraps the value, sub-component extraction keeps the rules-of-hooks contract clean.
- **`router.push` → `router.replace` inconsistency in sign-in flow.** Resolved as described.
- **`lib/supabase/client.ts` defensive-throw item from Phase 6 findings.** Resolved as described.

### Known pending work

- **`<ThemeProvider>` mount + dark-mode toggle.** Still deferred. `next-themes` is in deps; CSS variables for both themes already exist in `globals.css`; `sonner.tsx` already calls `useTheme()` and degrades cleanly to light mode without a provider. Out of M1-hardening scope; separate plan when dark-mode lands.
- **`useUser()` setter / refresh path.** When a future settings page edits `user.name` or `org.name` without a redirect, the cached context will be stale until the next full layout remount. No current consumer hits this, so the fix is genuinely premature today; flagged for whichever M-milestone introduces a non-redirecting edit affordance (likely the polish-pass settings page).
- **Backend transactional atomicity for the wizard's `Promise.all` updates.** Half-success is recoverable (Phase 2 doc explains why) but ideally the two updates land in one transaction. Backend-side concern; out of FE scope.
- **Operator-side E2E sign-off on M1.** Still deferred per the Phase 6 runbook. Acceptable while we don't have prod users — the seven scenarios are FE-only and any failure would be reproducible at any time. Worth running before the first non-localhost deploy.
- **Stale `auth-*` doc reorg + uncommitted M2 (agent-catalog) scaffolding** still on master per 0.3.0's "Known pending work" — unchanged by this entry, surfaces in the next commit's `git status`.

### Supersedes

- **0.3.0 §"Known pending work" → `metadata.title.template` consolidation.** Marked as a polish-pass candidate; landed here.
- **0.2.6 §"Known pending work" → `middleware.ts` deprecation warning.** Logged twice across M1 phase docs; landed here.
- **0.2.0 frontend scaffold's `router.push` after sign-in** (the `replace`-vs-`push` rule was tightened in 0.3.0 Phase 2 but not retroactively applied to sign-in; applied here).

---

## 0.3.0 — M1: Onboarding Wizard + Dashboard Shell (2026-04-25)

First milestone of the post-0.2.6 roadmap (`docs/plans/post-0.2.6-roadmap.md` §M1). Closes the visible UX gap between "amber 'not provisioned' panel" and "blank email-only dashboard," and puts the navigation chrome in place that the rest of v1 plugs into. Entirely a frontend pass — zero backend, schema, or proto changes. The 0.2.5/0.2.6 RPCs (`UpdateCurrentUserName`, `UpdateOrganizationName`, `GetOrganization`) are now consumed by real FE callers; previously they shipped without one. Plan: `docs/executing/onboarding-wizard.md`. Six per-phase completion docs under `docs/completions/onboarding-wizard-phase-{1..6}.md`.

### Index

- **Six shadcn primitives added** — `sidebar`, `avatar`, `dropdown-menu`, `separator`, `skeleton`, plus transitive `sheet` + `tooltip` and the `useIsMobile` hook. `form` was silently skipped by the `base-nova` registry; wizard uses raw `useForm` + `register` matching the existing `sign-in/page.tsx` style.
- **`useIsMobile` rewritten** to canonical `React.useSyncExternalStore` shape — replaces the shadcn-shipped `useEffect` + synchronous `setState` pattern that trips the project's `react-hooks/set-state-in-effect` lint rule under React 19. Side-benefit: closes a latent SSR hydration mismatch (`useState<boolean | undefined>(undefined)` rendered as `false` on the server then re-rendered with the real value).
- **Root layout polish** — `metadata.title` `"Create Next App"` → `"Corellia"`, `metadata.description` `"Generated by create next app"` → `"Control plane for AI agents."`, `<Toaster richColors closeButton />` mounted at root so toasts work above the route group boundary (sign-in + onboarding need it as much as chrome routes do).
- **`/onboarding` route** (Phase 2) — standalone, chrome-less wizard. State machine `loading | ready | not-provisioned | error` plus a `submitting` flag inside `ready`. Sequential fetch (`getCurrentUser` → `getOrganization`, forced by data dependency — org ID comes from user row). `react-hook-form` + `zodResolver` with `.trim().min(1).max(80)` on both fields. Org name pre-filled from the trigger-generated default (`alice's Workspace`); user name empty (no good default). Submit fires `Promise.all([updateCurrentUserName, updateOrganizationName])`; on success, success toast + `router.replace('/dashboard')`; on `ConnectError`, error toast + form re-enabled. Already-named callers redirected to `/dashboard`; signed-out to `/sign-in`. Sibling `layout.tsx` owns `metadata.title = "Welcome to Corellia"` because the page is `"use client"`.
- **`(app)/` route group** (Phase 3) — Next.js parenthesised segment for "shared layout, no shared URL prefix." `dashboard/page.tsx` moved here via `git mv`; URL `/dashboard` unchanged. Chrome layout owns the auth/onboarding gate redirecting unprovisioned-name users to `/onboarding`, plus a four-state union (`loading | ready | not-provisioned | error`) mirroring the wizard.
- **`<AppSidebar>`** — wraps shadcn's `Sidebar` primitive. Four nav items (Dashboard / Agents / Fleet / Settings), active state via `usePathname()` plus `startsWith('${href}/')` prefix check (so future `/agents/<id>` lights up the parent). Non-ready items get `<SidebarMenuBadge>Soon</SidebarMenuBadge>` + `aria-disabled="true"`; the link is still navigable, the destination card corroborates "soon". `<SidebarMenuButton render={<Link>...</Link>} />` instead of Radix's `asChild` — `base-nova` is on `@base-ui/react` which uses a `useRender` hook + `render` prop. Same pattern as `<DropdownMenuTrigger render={<Button>}>` for the avatar trigger and `<Button render={<Link>}>` for dashboard CTAs.
- **`<AppTopBar>`** — `<SidebarTrigger>` (Cmd/Ctrl+B) + workspace name + user-menu avatar dropdown. Initials via `splitOn(/[\s.]+/)` so `Alice Smith` → `AS` and `alice.smith` → `AS`; falls back to first char of email; capped at two. Sign-out moved here from the dashboard.
- **Three placeholder pages** (Phase 4) — `/agents`, `/fleet`, `/settings` consume one reusable `<ComingSoon>`. Server components (no `"use client"`), each exporting `metadata.title = "<Name> — Corellia"` directly. ETA copy distinguishes "Available in v1" (Agents, Fleet — core M2/M4) from "Polish pass" (Settings — non-blocking).
- **`UserContext` + `useUser()`** (Phase 5) — `src/lib/api/user-context.tsx`. `<UserProvider>` wraps the entire `<SidebarProvider>` subtree on the layout's ready branch (hoisted broad so future sidebar/top-bar consumers can read user data without re-hoisting). `useUser()` throws if consumed outside the provider — fail-loud is correct because the contract is unconditional. Dashboard now reads `const { user } = useUser()` instead of fetching independently — one round-trip per cold mount of `/dashboard` instead of two.
- **Dashboard refresh** (Phase 5) — heading-with-subhead (`Welcome back, <FirstName>.` + one-line description) above a 2-card grid: primary `Spawn your first agent` → `/agents`, secondary `Fleet at a glance` → `/fleet`. First-name via `(user.name ?? "").trim().split(/\s+/)[0]`; falls through to `"Welcome back."` for empty names. Previous "Signed in as `<email>`" copy gone — chrome's avatar + email-in-dropdown covers the question.
- **Pre-existing `/sign-in` prerender failure fixed** (Phase 6) — `lib/supabase/client.ts`'s `createClient()` was called at component-scope inside `app/sign-in/page.tsx`, so Next.js's static-export pass evaluated it during prerender and threw on missing `NEXT_PUBLIC_SUPABASE_URL`. Moved into `onSubmit` so it only runs at user-interaction time. Found in Phase 1, fixed in Phase 6 — let `pnpm -C frontend build` pass cleanly for the first time this milestone.
- **Validation.** `pnpm -C frontend type-check && pnpm -C frontend lint && pnpm -C frontend build` all green at end-of-milestone. Build prerendered all eight static routes (`/`, `/_not-found`, `/agents`, `/dashboard`, `/fleet`, `/onboarding`, `/settings`, `/sign-in`). Manual seven-scenario E2E (full sign-up → onboarding → chrome navigation → sign-out loop) deferred to operator with a runbook in `docs/completions/onboarding-wizard-phase-6.md`.

### Behavior change (known)

- **Frontend looks like a product.** Sign in → onboarding wizard (if first time) → chrome with sidebar + workspace name + user menu. Three placeholder destinations corroborate the "this is the shape of v1" framing.
- **One round-trip per cold mount of any chrome route**, not one per page-component-mount. Dashboard previously fetched `getCurrentUser` independently; now layout fetches once and dispenses via context.
- **Wizard at `/onboarding` is on the auto-flow.** Users with `public.users.name IS NULL` (post-trigger but pre-naming) are auto-redirected from any chrome route to the wizard. After successful submit, `router.replace('/dashboard')` lands them on the chrome with their name in the avatar + workspace in the top bar.
- **Browser tabs distinguish by route.** `Welcome to Corellia`, `Dashboard — Corellia`, `Agents — Corellia`, etc. Root metadata still `Corellia` for any non-app route.
- **Sign-in route prerenders cleanly** for the first time in this codebase. Closes a build-time gotcha pre-dating 0.2.0.

### Resolves

- **0.2.5 / 0.2.6 "Known pending work" → FE caller for `UpdateCurrentUserName` + `UpdateOrganizationName`.** Both RPCs shipped without a UI consumer — this milestone is the consumer. Wizard fires both in parallel on submit; verified end-to-end in `pnpm -C frontend build` + the seven-scenario E2E runbook (deferred to operator).
- **`docs/plans/post-0.2.6-roadmap.md` §M1.** First milestone of four. Plan moved from `docs/plans/onboarding-wizard.md` to `docs/executing/onboarding-wizard.md` at start of work; will move to `docs/executed/` (or be archived) when operator-side E2E completes.

### Known pending work

- **Operator-side E2E verification.** Seven scenarios in the Phase 6 completion doc. Run before first non-localhost deploy. Low-risk if mismatched (FE-only — no DB writes can corrupt anything because schema is unchanged) but high-confidence-payoff if all pass.
- **`metadata.title.template` consolidation.** Three pages declare `"<Name> — Corellia"` directly; wizard declares `"Welcome to Corellia"`; dashboard declares `"Dashboard — Corellia"`. Setting `title: { default: "Corellia", template: "%s — Corellia" }` on root layout would let each page declare just `"Agents"` etc. One-line root edit, three-line simplification across pages. Polish-pass candidate.
- **`<ThemeProvider>` mount + dark-mode toggle.** `next-themes` in deps; CSS variables for both themes already exist in `globals.css`. Out of M1 scope; separate plan when the time comes.
- **`AppTopBar` migration to `useUser()`.** Currently takes three props from the layout. Trivial when the top bar grows (workspace switcher, theme toggle, role-gated nav). One-liner.
- **Edit affordance for workspace name from the chrome.** Top bar shows `state.org.name` as static text; click does nothing. Will live in `/settings` per follow-up plan.
- **`middleware.ts` deprecation warning.** Next 16's build emits `The "middleware" file convention is deprecated. Please use "proxy" instead.` Mechanical migration; bundle alongside any other middleware-touching work.
- **Pre-existing uncommitted state on master.** Doc reorg moving `auth-*` completion files from `docs/completions/` to `docs/archive/`, plus untracked `docs/executing/agent-catalog.md` (M2 draft). Surfaced during Phase 1's `git stash` build-failure investigation. None of it conflicts with M1; flagged so it shows up cleanly in next commit's `git status` rather than mistaken for M1 output.

### Supersedes

- **0.2.0 "Frontend Scaffolding"** — dashboard's "Signed in as `<email>`" placeholder copy is replaced by the named-user welcome + 2-card grid. The four-state union shape from 0.2.5 is preserved (now lives in the layout, not per-page). The amber "not provisioned" panel is no longer per-page; it lives in the chrome layout for every route under `(app)/`.

---

## 0.2.6 — Auth Migration: HS256 Shared Secret → ES256 / JWKS (2026-04-25)

Migrated backend JWT validation from the legacy HS256 / `SUPABASE_JWT_SECRET` shared-secret path scaffolded in 0.1.0 to the asymmetric ES256 / JWKS path Supabase issues today. Backend now fetches Supabase's JWKS once at boot from `$SUPABASE_URL/auth/v1/.well-known/jwks.json`, caches it in memory, refreshes hourly in the background plus immediately on any unknown `kid` (rate-limited to one refetch per 5 min), and validates incoming tokens offline against the cached P-256 public keys. `SUPABASE_JWT_SECRET` removed from `config.Config`, `.env.example`, `backend/.env`. Frontend unaffected — access token is opaque to the client. Plan: `docs/executing/auth-es256-migration.md`. Six per-phase completion docs under `docs/completions/auth-es256-migration-phase{1..6}-completion.md`.

### Index

- **New dependency.** `github.com/MicahParks/keyfunc/v3@v3.8.0` direct (canonical JWKS adapter for `golang-jwt/jwt/v5`); `github.com/MicahParks/jwkset@v0.11.0` + `golang.org/x/time@v0.9.0` indirect.
- **New file.** `backend/internal/auth/jwks.go` — `JWKSVerifier` wrapper over keyfunc's refreshable cache; `NewJWKSVerifier(ctx, jwksURL)` performs initial fetch with `NoErrorReturnFirstHTTPReq=false` (fail-loud) + 10s `HTTPTimeout` and binds the refresh goroutine to `ctx`'s lifetime.
- **Rewritten file.** `backend/internal/auth/middleware.go` — `Middleware(verifier *JWKSVerifier)` replaces `Middleware(jwtSecret string)`; ECDSA P-256 verification via `verifier.Keyfunc()`; explicit `jwt.WithValidMethods([]string{"ES256"})` whitelist closes the algorithm-confusion attack class. `AuthClaims` shape preserved (`AuthUserID uuid.UUID`, `Email string`); `FromContext` retains `*AuthClaims` pointer return so `users.Service` doesn't ripple.
- **Removed.** `Config.SupabaseJWTSecret` field, the `SUPABASE_JWT_SECRET=` line in `.env.example` + `backend/.env`, and the corresponding rows in `docs/stack.md` §8 + `CLAUDE.md` §Environment.
- **Wiring.** `httpsrv.Deps` gains `AuthVerifier *auth.JWKSVerifier` (alongside `Config`, `UsersHandler`, `OrganizationsHandler`, `AllowedOrigin` — runtime infra grouped, parsed config kept pure); `main.go` derives `jwksURL` via `strings.TrimRight(cfg.SupabaseURL, "/") + "/auth/v1/.well-known/jwks.json"`, constructs the verifier eagerly, `slog.Error`+`os.Exit(1)` on failure, emits one `slog.Info("jwks initialised", "url", jwksURL)` boot breadcrumb.
- **Doc updates.** `CLAUDE.md` §Environment + Backend-layout bullet, `docs/stack.md` §5 + §8, `docs/archive/backend-scaffolding.md` §7 (supersession blockquote). Historical docs (this changelog, completion docs, plan, archived prose) deliberately untouched.
- **Validation.** Phases 6a + 6c executed: boot smoke clean (`jwks initialised` + `listening`, ~300µs apart); algorithm-confusion forge (HS256-with-public-key) rejected at 401 by the live server. Phase 6b (interactive FE sign-in) deferred to operator with a written runbook in the Phase 6 completion doc.
- **Independent assessment.** 9/10 — solid, mergeable. Single deduction: zero Go-level test coverage of the security-critical auth path (Phase 7 follow-up; the manual Python forge in 6c proves the defence empirically but isn't CI-reproducible).
- **Stale-path docs cleanup, bundled in.** Five live-doc references to the pre-archive `docs/backend-scaffolding.md` path now point at `docs/archive/backend-scaffolding.md`: `CLAUDE.md` lines 9, 17, 44; `docs/stack.md` line 9; `docs/frontend-scaffolding.md` line 17. Flagged in the Phase 5 completion doc as out-of-scope; folded in here so the entry doesn't leave broken navigation.

### Behavior change (known)

**Breaking config change.** Operators + CI environments that previously set `SUPABASE_JWT_SECRET` must remove it; nothing reads the var any more. Go binary no longer panics at config-load if `SUPABASE_JWT_SECRET` is unset (would have, before — `caarlos0/env` honored `required`). Conversely, the binary now fails loudly at *boot* (after config-load, before listening) if `SUPABASE_URL` is missing or unreachable, with `auth: initial JWKS fetch from <url>: <err>` — same fail-fast posture, different gate.

**No request-path behavior change after a successful boot.** Valid Supabase access token validates and the request flows through to the domain layer; invalid returns 401. Wire-level error strings (`"missing bearer token"`, `"invalid token"`, `"invalid sub claim"`) unchanged. `AuthClaims` shape unchanged. Downstream services see no difference.

### Supersedes

- **0.1.0 "Auth middleware (HS256)."** The "shared secret + HMAC signature check" model is wholly retired. Rationale upgrades from "Supabase issues HS256 tokens, validate offline with the secret" to "Supabase issues ES256 tokens, validate offline with the cached public key — server-side rotations propagate within an hour without a backend restart." Post-migration posture is strictly stronger: asymmetric crypto removes the attack surface where a leak of `SUPABASE_JWT_SECRET` from operator infrastructure would have let an attacker mint arbitrary tokens — there is no symmetric secret to leak now.

### Known pending work

- **JWKS integration test (Phase 7).** Not implemented. Phase 6c's Python forge proves the defence empirically against the live server but isn't CI-reproducible. ~60–90 lines: ECDSA P-256 key-pair fixture (`crypto/ecdsa`), `httptest.Server` serving a synthetic JWKS, three table-driven cases — valid ES256 passes, HS256-signed-with-public-key rejected, expired rejected. Single deduction in the post-migration code review (9/10); land before opening to untrusted users.
- **Boot-smoke as a `cmd/api` integration test.** Build the binary, run with a mock Supabase JWKS server, assert the `jwks initialised` log line. Catches regressions at PR time. Out of scope for v1.
- **Structured logging / metrics around JWKS refresh cycles.** Currently uses keyfunc's default logger (writes to `slog.Default`'s `ErrorContext` on refresh failures only). For oncall visibility, add explicit `slog.Info` on successful refresh + a counter on refetch-rate-limit hits.
- **Key-rotation runbook.** A one-pager describing what an oncall engineer should expect when Supabase rotates server-side (TL;DR: nothing — but the runbook documents cache TTL + unknown-kid refetch behavior so the first time it happens isn't a debug session).
- **Explicit `SUPABASE_JWKS_URL` override env var.** Currently derived from `SUPABASE_URL`. If a future use case needs a non-canonical JWKS (e.g. a CI test fixture), add an optional `config.Config` field + `cmp.Or`-style fallback to the derived URL.
- **Graceful shutdown.** Pre-existing — `http.ListenAndServe` + `context.Background()` gives an abrupt exit on SIGTERM, so the keyfunc refresh goroutine never gets a clean cancellation. Not a regression from this migration; flag for a small follow-up (`signal.NotifyContext` + `srv.Shutdown(ctx)` + plumb the cancellable context to `NewJWKSVerifier`).

### Resolves

- **0.2.0 "Local bring-up unblocked once Supabase project provisioned."** With the project on ES256 (which it has been for some time — the HS256 path was structurally incompatible from day one of the new project), this migration was the missing piece for sign-in to work end-to-end against the current Supabase project. Joins 0.2.5's user-provisioning to deliver the `stack.md` §12 hour-5 milestone.

---

## 0.2.5 — Auth User Provisioning (Phases 1–4 + Post-Review Hardening) (2026-04-25)

Closes the last gap between the 0.2.0 scaffolded pipeline and a real end-to-end sign-in: a Postgres trigger pair on `auth.users` atomically creating `public.organizations` + `public.users` on signup and tearing them down on delete; the FE↔BE contract + sqlc surface for `users` (expanded) and `organizations` (new); the domain + transport + frontend layers consuming them; sentinel-based handler-boundary error mapping so the FE can distinguish "bad token" from "valid token, no provisioning row"; a discriminated-union dashboard state machine for the four resulting render states; unit tests for the service's error branching. Resolves the **0.2.1 "Behavior change"** gap (`pgx.ErrNoRows` surfaced as `Unauthenticated`) and **0.2.1 "Known pending work" → Error mapping in `users_handler.go`** + **First-admin bootstrap path**. Unblocks `stack.md` §12 hour-5 and blueprint §10 product code.

Plan: `docs/executing/auth-user-provisioning.md`. Five completion docs are the durable per-phase record: `docs/completions/auth-user-provisioning-phase-{1,2,3,4}.md` + `auth-user-provisioning-post-review-hardening.md`. This entry is the cross-phase summary.

### Index

- **Migration applied:** `backend/migrations/20260424140000_auth_user_provisioning.sql` — three atomic changes (`name TEXT NULL` column on `public.users`, `on_auth_user_created` trigger, `on_auth_user_deleted` trigger). Both functions `SECURITY DEFINER` + `SET search_path = public, pg_temp`.
- **Proto:** `users.proto` gains `UpdateCurrentUserName` + `optional string name = 5` on `User`; `organizations.proto` (new — `OrganizationsService` with `GetOrganization` + `UpdateOrganizationName`).
- **SQL queries:** `users.sql` gains `CreateUser` + `UpdateUserName` (`GetUserByAuthID` retained); `organizations.sql` (new — `GetOrganizationByID` + `UpdateOrganizationName`).
- **Generated code regenerated:** Go (`backend/internal/gen/corellia/v1/{users.pb.go, organizations.pb.go}` + `corelliav1connect/{users.connect.go, organizations.connect.go}`); Go DB layer (`backend/internal/db/{users.sql.go, organizations.sql.go, querier.go, models.go}`); TS (`frontend/src/gen/corellia/v1/{users_pb.ts, organizations_pb.ts}`). All committed.
- **Domain:** `users/service.go` rewritten — `ErrUnauthenticated` + `ErrNotProvisioned` sentinels, private `userQueries` interface (2 methods, not full 5-method `Querier`), `loadCurrentUser` helper, new `UpdateCurrentUserName` + `CallerOrgID`, `Name` mapped through to proto. `organizations/service.go` (new) — `ErrForbidden` + `ErrNotFound` sentinels, `orgQueries` + `userLookup` interfaces, `GetOrganization` + `UpdateOrganizationName`, both gated by an equality `authorize` check.
- **Transport:** `users_handler.go` rewritten with `toConnectErr` switch; `organizations_handler.go` (new) with `orgErrToConnect` switch; both <30 LOC. `server.go` mounts both inside the auth-middleware `r.Group(...)`.
- **`cmd/api/main.go`:** instantiates `organizations.Service` with `(queries, usersSvc)` (`*users.Service` satisfies `userLookup` structurally via `CallerOrgID`).
- **`auth/middleware.go`:** new exported `ContextWithClaims(ctx, AuthClaims) context.Context` — inverse of `FromContext`, closes over the same opaque `ctxKey{}`. Lets tests + admin-path handlers synthesise claims contexts without HTTP.
- **FE client:** `frontend/src/lib/api/client.ts` exposes `organizations: createConnectClient(OrganizationsService, transport)` alongside `users`.
- **FE dashboard:** `dashboard/page.tsx` rewritten — four-state discriminated union (`loading | ready | not-provisioned | error`); `ConnectError.code === Code.PermissionDenied` branches to a dedicated amber "not provisioned" panel.
- **Tests:** `users/service_test.go` (new) — three cases (`NotProvisioned`, `HappyPath`, `NoClaims`) using a `fakeQueries` that satisfies the private `userQueries` via structural typing.
- **Post-review hardening:** `default:` arm in both handler error switches now `slog.Error`s the underlying error and returns `connect.NewError(connect.CodeInternal, errors.New("internal error"))` instead of leaking raw pgx/driver text.
- **Validation:** `cd backend && go vet ./... && go build ./... && go test ./...` clean. `pnpm -C frontend type-check && pnpm -C frontend lint` clean.

### Behavior change (known)

- **First-login provisioning works without backend code.** A row landing in `auth.users` (Supabase dashboard, future signup, or admin API) atomically materialises a matching `public.organizations` + `public.users` pair. `GetCurrentUser` finds rows it previously could not. Resolves the 0.2.1 "Behavior change" gap.
- **Wire codes correctly distinguish the four auth/provisioning failure modes.** Pre: every service error became `Unauthenticated`. Post: `Unauthenticated` (no/bad token), `PermissionDenied` (valid token, no provisioning row, *or* org-cross-tenant), `NotFound` (org doesn't exist or invalid UUID), `Internal` (anything else, redacted). Dashboard's amber "not provisioned" panel is the visible payoff — pre-0.2.5 the user saw a generic auth error and was confused; post-0.2.5 they see actionable copy.
- **Internal errors no longer leak to the client.** Default arm of both handler switches replaces underlying error text with generic `"internal error"`; original logged via `slog.Error`. Operators see full detail; clients see nothing they can attack against.
- **`name` column nullable but always-set-to-non-NULL by the API.** `UpdateCurrentUserName` always passes `&name`, never `nil` — no API affordance to clear a name back to NULL. Probably fine for the wizard's needs; flagged below as polish.
- **No backfill for pre-trigger `auth.users` rows.** Triggers fire on future events only. Any pre-existing auth users without a matching `public.users` will fail `GetCurrentUser` with `PermissionDenied` indefinitely. One-shot `INSERT INTO public.users SELECT ... FROM auth.users WHERE NOT EXISTS (...)` is the fix if it becomes observable. Not currently observable (no production deploy).

### Resolves

- **0.2.1 "Behavior change."** `pgx.ErrNoRows` from `GetCurrentUser` was mapped to `connect.CodeUnauthenticated` — wrong code for "authenticated but not provisioned." Handler switch maps to `CodePermissionDenied`; FE's amber panel is the rendered result.
- **0.2.1 "Known pending work" → Error mapping in `users_handler.go`.** Implemented with sentinels + typed-switch, extended to a parallel switch in new `organizations_handler.go`.
- **0.2.1 "Known pending work" → First-admin bootstrap path.** Picked the trigger-on-`auth.users` route (plan decision 1). Every signup auto-admins their own org per Pattern A. Onboarding-wizard plan (next) lets users rename the workspace; invitation-flow plan adds Pattern C on top.
- **0.2.1 "Supersession of 0.1.0 pending item."** Local bring-up was double-blocked on `.env` *and* a provisioning path. Provisioning path now exists; only `.env` population + IPv6 reachability check remain.
- **`docs/plans/auth-user-provisioning.md` → `docs/executing/auth-user-provisioning.md`.** Plan moved at start of work; will move to `docs/executed/` (or be archived) once operator-side E2E completes.

### Known pending work

- **Operator-side trigger E2E verification (E2E-1, E2E-3 from Phase 4).** Triggers compile and are wired correctly, but runtime semantics under the Supabase auth role context have not been exercised against a live project. **Run before first non-localhost deploy.** Risk: a `SECURITY DEFINER` privilege misconfiguration would silently fail to insert and break sign-up entirely (auth.users INSERT itself rolls back on trigger exception). Low probability (standard Supabase grants this correctly), high blast radius if wrong.
- **Unit tests for `organizations.Service.authorize`.** Most security-relevant code in this pass has zero coverage (Phase 4 scoped to `users` per plan decision 13). Three cheap pinning tests using `fakeOrgQueries` + `fakeUserLookup` cover: matching org → ok; mismatched → `ErrForbidden`; malformed UUID → `ErrNotFound`. A regression that swaps `==` for `!=` in `authorize` would silently expose every org to every user — coverage on auth-adjacent code is the cheapest insurance.
- **Fold `UpdateCurrentUserName` into a single query.** Current shape is `SELECT … WHERE auth_user_id = $1` then `UPDATE … WHERE id = $1` — two round trips + small TOCTOU window. A single `UPDATE … WHERE auth_user_id = $1 RETURNING *` halves trips and removes the window. Straightforward sqlc + service simplification.
- **Input validation on `UpdateCurrentUserName` + `UpdateOrganizationName`.** Both accept any wire string: empty, multi-megabyte, control chars. Empty `""` writes a non-NULL empty value to a nullable column — diverges from "unset". Trim + min/max guards in the service should land alongside the wizard.
- **No API path to NULL out a name.** `UpdateUserName` always passes `&name`. A "clear my name" affordance (separate RPC, or `optional` on the request) is a one-way-door follow-up.
- **`CreateUser` query has `name` param but no proto plumbing.** Intentional — schema aligned so the invitation-flow plan can adopt without a regen cycle. For invitation-flow to pick up.
- **Email-sync trigger.** If `auth.users.email` changes, `public.users.email` does not update. Add a third trigger (`AFTER UPDATE OF email ON auth.users`) if drift becomes observable.
- **Onboarding-wizard plan + invitation-flow plan.** Both unblocked; both should be authored as separate `docs/plans/*.md` entries when next-round work begins.
- **Vercel + Fly deploy** (carried from 0.2.0/0.2.4). Now structurally unblocked — only remaining blocker is `.env` population + IPv6 reachability check from 0.2.4.

---

## 0.2.4 — `DATABASE_URL` Canonicalized to Direct Connection (2026-04-24)

Rewrote `DATABASE_URL`'s documented connection mode from Supabase **Session Pooler** (`*.pooler.supabase.com:5432`) to **Direct Connection** (`db.<ref>.supabase.co:5432`). Both URLs now point at the same Direct host — the split is role-and-lifecycle, not host-vs-host. Motivated by Supabase's own UI copy ("Direct Connection: ideal for applications with persistent and long-lived connections, such as those running on virtual machines or long-standing containers"), which describes a Go+Fly single-binary orchestrator exactly. Supersedes 0.1.0's "Session Pooler for app, Direct for migrations" framing and re-grounds the rationale on the missing fact: **`pgxpool` is an in-process transaction pooler**, so an external pooler on the wire is redundant.

### Index

- **Docs updated:** `CLAUDE.md` §Database connection (full rewrite with pgxpool-as-transaction-pooler rationale + ceiling math) + §Migrations heading; `docs/stack.md` §6 migrations clause + new §8 "Database URLs — both Direct Connection, split by role" subsection + `DATABASE_URL` table row; `.env.example` header comment on both URLs (example flipped to Direct); `docs/blueprints/codegen-cheatsheet.md` quick rule; `docs/completions/frontend-scaffold-completion.md` pending-work reference.
- **Code comment updated:** `backend/internal/config/config.go` — `DatabaseURL` godoc rewritten (Direct + pgxpool semantics + IPv4 fallback + Transaction Pooler red line).
- **No runtime code changed.** `pgxpool.Config` values unchanged (`MaxConns=10`, `MinConns=2`, lifetime + idle + health-check); URL shape is driver-indifferent; only the documented convention + populated value in `backend/.env` changes.
- **Session Pooler reclassified as IPv4 fallback**, not primary. Drop-in swap (different URL, same driver, same `pgxpool`); per-developer variation costs nothing and doesn't leak into committed config.
- **Transaction Pooler rule strengthened, not changed.** Reason upgrades from single-barrel ("breaks pgx") to double-barrel ("redundant *and* breaks pgx") once the in-process-equivalence framing is explicit.

### Behavior change (known)

None at runtime. No Go code touched except the `DatabaseURL` godoc. The binary reads whatever `DATABASE_URL` contains — Direct or Session Pooler — and `pgxpool` opens a pool either way. Change is documentary + conventional (what we tell a new operator to paste into `backend/.env`; what godoc + `.env.example` show as canonical). Migrations still use `DATABASE_URL_DIRECT`; the superuser-role distinction keeping it out of `config.Config` is unchanged. Pending local bring-up is unblocked (Direct is now the recommended URL), not made harder.

### Supersedes

- **0.1.0 "Two-URL DB strategy."** The line "session pooling gives IPv4 support + multiplexing + full PG feature set (prepared statements, advisory locks)" is historically accurate only for the rejected *Transaction* Pooler — Session Pooler was never actually needed for multiplexing (`pgxpool` does that) or prepared statements (Direct keeps them too). Rationale upgrade lands here.
- **0.2.0 pending-work item** naming "session-pooler `DATABASE_URL`" as a bring-up prerequisite — updated in-place in `docs/completions/frontend-scaffold-completion.md` to "Direct Connection `DATABASE_URL`."

### Known pending work

- **Local bring-up still the next blocker** (carried forward from 0.2.1/0.2.2/0.2.3). With canonical URL now Direct, verify IPv6 reachability as part of first bring-up — `dig AAAA db.<ref>.supabase.co +short` returning an IPv6 address + `psql "$DATABASE_URL" -c 'select 1'` is enough. Fall back to Session Pooler in `backend/.env` only if Direct fails; per-dev variation doesn't leak because `backend/.env` is gitignored.
- **IPv6 egress on Fly production.** Fly machines have native IPv6 and should reach Direct without config, but verify on first deploy (`fly ssh console` → `dig AAAA db.<ref>.supabase.co` → `psql`). If it fails unexpectedly, Session Pooler is the same drop-in escape hatch.
- **Supavisor session mode (not transaction) on top of Direct** worth adding when horizontal-scaling operational concerns appear — rolling-deploy connection storms, centralized connection limits across ≥10 instances, or cleaner failover routing. Not v1/v2; flag for v2+ when a second backend instance lands.

---

## 0.2.3 — direnv for Shell-Level Env Loading (2026-04-24)

Added committed `backend/.envrc` + `frontend/.envrc` (one line each — `dotenv .env` / `dotenv .env.local`) to auto-source per-app env files into the shell via `direnv` on `cd`. Resolves the `direnv` pending item from 0.2.2: `goose`, ad-hoc `go test`, and every in-directory CLI now see the same env as the Go binary, no `set -a; source; set +a` ritual. Manual sourcing retained as documented fallback.

### Index
- **Committed:** `backend/.envrc` (`dotenv .env`) + `frontend/.envrc` (`dotenv .env.local`) — one line each, zero secrets, safe to commit.
- **Gitignore fix:** `!.envrc` negation added to `frontend/.gitignore` so the default `.env*` rule (inherited from `create-next-app`) doesn't silently exclude the committed `.envrc`.
- **Docs updated:** `CLAUDE.md` §Environment (direnv recommended, manual-sourcing as fallback) + §Common commands §Migrations (`goose` examples now run from `backend/` so direnv vars are in scope); `docs/stack.md` §7 Prerequisites (direnv added) + §8 (new direnv paragraph replaces the 0.2.2 parenthetical).
- **Canonical migration command now runs from `backend/`.** Path shortened from `-dir backend/migrations` to `-dir migrations`; direnv has already exported `DATABASE_URL_DIRECT` by the time cwd is `backend/`.
- **Rationale:** direnv is the de-facto standard for per-directory env loading in Go / Rails / Node monorepos (Fly.io docs, Supabase CLI docs, 1Password CLI integration, Nix / devenv, HashiCorp Terraform). Committed `.envrc` makes onboarding one `direnv allow` per contributor per directory after first clone.

### Behavior change (known)

None at runtime — code unchanged. `godotenv/autoload` still loads `backend/.env` on Go binary start; Next.js still loads `frontend/.env.local` on `next dev` / `next build`; neither knows or cares about direnv. The only change: a developer `cd`'d into `backend/` now has `DATABASE_URL_DIRECT` + friends exported automatically, so CLI tools not reading `.env` directly (goose, sqlc, any ad-hoc command) also see those vars. Already-onboarded developers using manual sourcing keep working — direnv is purely additive.

### Resolves

- **0.2.2 pending item: "`direnv` or shell-sourcing helper for `DATABASE_URL_DIRECT`."** Picked direnv, committed the `.envrc` files, documented it as recommended across three docs, kept manual sourcing as fallback.

### Known pending work

- **CI and production untouched.** CI uses GitHub Actions secrets / platform-native injection, never `.env` or `.envrc`. Fly + Vercel inject env at runtime from dashboards. direnv is strictly a local-dev ergonomic layer; production story stays clean.
- **Secret-manager migration** (long-lead, not blocking). When team passes ~5 devs or secrets rotation becomes recurring, re-evaluate Doppler / Infisical / 1Password CLI. The direnv layer would then become a per-`.envrc` secret-fetch (`export DATABASE_URL=$(op read …)`) or be wrapped in `doppler run --`; per-app structure stays intact either way.

---

## 0.2.2 — Env File Placement: Per-App (2026-04-24)

Replaced the "single `.env` at repo root" convention with per-app files: `backend/.env` (auto-loaded by `godotenv/autoload` from the Go binary's cwd) and `frontend/.env.local` (auto-loaded by Next.js from the `frontend/` project root). Matches both loaders' defaults; the root-`.env` framing from 0.1.0 would have required symlinks or a `dotenv-cli` wrapper. Supersedes the root-`.env` story in `CLAUDE.md` §Environment, `stack.md` §8, and `.env.example` comments.

### Index
- **Committed docs:** `CLAUDE.md` §Environment + architecture diagram, `docs/stack.md` §8, `.env.example` (top comment + `--- Supabase (frontend-facing copies) ---` block) — all rewritten to describe the per-app split.
- **Gitignored files (not committed):** `backend/.env` + `frontend/.env.local` scaffolded with the relevant `.env.example` key subset; values empty for operator to populate. Covered by existing root `.gitignore` (lines 2–3: `.env`, `.env.local`) and `frontend/.gitignore` (line 34: `.env*`) — no gitignore changes.
- **Shared Supabase values duplicated by design.** Two pairs now in both files: `SUPABASE_URL` ↔ `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY` ↔ `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Rotations touch two files; accepted cost.
- **`DATABASE_URL_DIRECT`** physical home moves from a (never-created) root `.env` to `backend/.env`. 0.1.0's no-Config invariant unchanged — still absent from `config.Config`, still shell-sourced by `goose`.

### Known pending work

- **`direnv` or shell-sourcing helper for `DATABASE_URL_DIRECT`.** `goose` now needs either `set -a; source backend/.env; set +a` before the command, or a `backend/.envrc` with `dotenv .env` + `direnv allow`. Scaffolding / onboarding docs should pick one when first migration-apply happens (still blocked on populated Supabase creds — see 0.2.1 pending).
- **`.env.example` split (deferred).** Could split into `backend/.env.example` + `frontend/.env.local.example` for max locality. Kept as one repo-root file for now: simpler first-clone experience, var list still short enough that co-location isn't paying. Revisit if template grows past ~30 vars or operator confusion about "where does this value go?" shows up.

---

## 0.2.1 — Seeding Removed (2026-04-24)

Removed all backend seeding: default-org `INSERT` in the initial migration, `defaultOrgID` constant + auto-provisioning branch in `users/service.go`, now-unused `CreateUser` query + its sqlc artifacts. Supersedes 0.1.0's "seeds a default org + auto-provisions users on first login" behavior.

### Index
- Migration: default-org `INSERT` removed from `20260424120000_initial_schema.sql`.
- Query: `CreateUser` removed from `backend/queries/users.sql`; regenerated `backend/internal/db/users.sql.go` no longer contains `CreateUser` / `CreateUserParams`.
- Service: `defaultOrgID` constant + auto-provisioning branch removed from `users/service.go`; `github.com/google/uuid` import dropped.
- `go vet ./...` + `go build ./...` clean.

### Known pending work (added by 0.2.1)

- **Error mapping in `users_handler.go`.** Translate `pgx.ErrNoRows` (and a service-layer sentinel like `ErrUserNotProvisioned`) to an appropriate Connect code (likely `PermissionDenied`) so the FE can render "your account isn't provisioned — contact an admin" instead of a generic error string.
- **First-admin bootstrap path.** Replaces what seeded default-org + auto-provisioning did. Options: admin-invite flow that creates `users` rows explicitly, a separate policy migration seeding one bootstrap admin from an env var, or a one-shot CLI. Pick one when blueprint §10 admin UX is specified.
- **Supersession of 0.1.0 pending item.** 0.1.0's "Local bring-up" was blocked on populated `.env`; now also blocked on a provisioning path — signing in with a Supabase user whose `auth_user_id` isn't in `public.users` will fail.

---

## 0.2.0 — Frontend Scaffolding (2026-04-24)

FE scaffolded end-to-end through the "prove the pipeline" milestone: Next.js 16 App Router + Supabase SSR auth + Connect-ES v2 client calling the existing `GetCurrentUser` RPC. `pnpm type-check` + `pnpm lint` clean. Not yet running — needs populated `.env` + seeded Supabase test user. Codegen cheatsheet added under `docs/blueprints/`.

### Index
- Monorepo workspace plumbing: root `pnpm-workspace.yaml` + `package.json` + `Procfile.dev`.
- Frontend scaffolding §1–§13 complete: Next.js + shadcn/ui + Supabase SSR clients + Connect API client + sign-in / dashboard / session-gated root redirect.
- Tooling delta from doc: Next 16 (vs 15), Tailwind v4 (vs v3), React 19 (vs 18), Connect-ES v2 (vs v1), `sonner` (vs `toast`).
- Connect-ES v2 codegen shift: consolidated into `*_pb.ts` via `@bufbuild/protoc-gen-es` alone; no separate `protoc-gen-connect-es`.
- `buf.gen.yaml` extended with TS plugin pointing at frontend's `node_modules/.bin/protoc-gen-es`.
- `.env.example` extended with `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (gap from 0.1.0 template).
- ESLint `globalIgnores` extended with `src/gen/**` (structurally enforces blueprint §11.7 on FE).
- Post-bootstrap cleanup of `create-next-app` artifacts (nested `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `AGENTS.md`, `CLAUDE.md`).
- `docs/blueprints/codegen-cheatsheet.md` added — entry-point matrix for "I want to do X, I edit Y, I run Z."
- `docs/completions/frontend-scaffold-completion.md` authored as the durable record of deviations.

### Known deviations from `docs/frontend-scaffolding.md`

All intentional; all flagged in the completion doc. Listed here for changelog completeness:

1. **Next.js 16 + Tailwind v4 + React 19** instead of Next 15 / Tailwind v3 / React 18. Structural path diffs: no `tailwind.config.ts`, `postcss.config.mjs` (not `.js`), `globals.css` at `src/app/globals.css` not `src/styles/globals.css`.
2. **Connect-ES v2** — consolidated `*_pb.ts`, no `protoc-gen-connect-es`, `createClient` instead of `createPromiseClient`.
3. **`sonner`** replaces `toast` in newer shadcn (equivalent).
4. **No `form.tsx` shadcn primitive** — registry entry silently no-ops; deferred until spawn UX.
5. **Post-bootstrap cleanup**: removed `frontend/{pnpm-workspace.yaml,pnpm-lock.yaml,AGENTS.md,CLAUDE.md}`.

### Known pending work

- **Local bring-up (FE+BE together)** — populate root `.env`, apply migration, `overmind start`, create Supabase test user via dashboard, sign in, confirm dashboard renders the email. The actual `stack.md` §12 hour-5 milestone. Supersedes 0.1.0's "local bring-up" (same `.env` bottleneck for both halves, now with FE ready to exercise it).
- **`docs/frontend-scaffolding.md` update** — bake in the five deviations so a fresh scaffold doesn't re-hit the same forks.
- **`form.tsx` shadcn primitive** — retry when spawn UX lands (blueprint §10 "RPG character creation" uses shadcn `<Form>` + zod).
- **Vercel deploy** (doc §12) — blocked on local bring-up.
- **Product code per blueprint §10** — catalog → spawn form → fleet view → agent detail. All downstream of pipeline proof.

---

## 0.1.0 — Backend Scaffolding & Docs Reconciliation (2026-04-24)

Backend scaffolding compiling end-to-end (not yet running — blocked on Supabase creds); docs reconciled across `vision.md` / `blueprint.md` / `stack.md` / `backend-scaffolding.md`.

### Index
- Doc alignment sweep: 3 real misalignments + stale path leftovers.
- Backend scaffolding §3–§11 complete: module, deps, config, db, auth, proto, users RPC, HTTP server, air.
- Two-URL DB strategy (`DATABASE_URL` = session pooler for app, `DATABASE_URL_DIRECT` = direct for migrations).
- `pgxpool` tuning (`MaxConns=10`, `MinConns=2`, lifetime + idle + health-check).
- `sqlc` UUID override (`pgtype.UUID` → `google/uuid.UUID`) — required for service layer to compile.
- `buf.yaml` authored (doc only showed `buf.gen.yaml`, insufficient for `buf generate`).
- `users.proto` + Connect-go RPC (`GetCurrentUser`) — the "prove the pipeline" artifact.
- First migration: `organizations` + `users` + default org seed; five remaining blueprint §9 tables pending.
- `.gitignore` + `.env.example` at repo root.
- Dev tools installed: `buf` (brew), `goose` + `air` (`go install`).