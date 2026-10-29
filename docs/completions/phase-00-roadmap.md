# Phase 0: Roadmap

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.0.

## Summary

Read the repository and `docs/VISION.md`, surveyed the environment, and wrote [`docs/executing/roadmap.md`](../executing/roadmap.md): ten implementation phases with scope, deliverables, dependencies and acceptance criteria, plus a stated default for every open question in VISION.md section 11. No product code changed.

## What was built

- `docs/executing/roadmap.md`: ground truth, section-11 defaults, target layout, architecture rules for the new direction, phases 1 to 10, versioning conventions, risks, progress table.
- This note.

## Design decisions

The decisions are the section-11 table in the roadmap. The ones with the largest blast radius:

- JSON Schema replaces protobuf/Connect for the contract; SSE plus JSON HTTP replaces Connect streaming. Driven by VISION 5.3's default and by `buf` not being available in the dev environment.
- The legacy control-plane code (fleet, spawn, Fly deploy, Supabase auth, Postgres) is removed in Phase 1 rather than carried. Nothing is deployed; git history and `docs/archive/` keep the record.
- A keyless `local` runtime and browser-native voice fallbacks are first-class so the product is demonstrable in a browser on macOS with no credentials, which is the state of this environment.
- Vite static client replaces Next.js. A kiosk wants a static bundle; the Go binary serves it.

## Files changed

- Added `docs/executing/roadmap.md`, `docs/completions/phase-00-roadmap.md`.
- Edited `docs/changelog.md` (entry 0.15.0).

## How to run and test

Nothing to run. Baseline check performed before any change: `cd backend && go build ./... && go vet ./... && go test ./...` all green on `master` at `7f6583b`.

## Known gaps

- The environment has no API keys, no Postgres, no Docker socket, no `buf`/`sqlc`/`goose`. Every phase's acceptance criteria are written so they can be met here; cloud-only behaviour is marked as unverified in the relevant completion notes.
- The Jev logic (VISION 6) and the OpenWorld voice pipeline (VISION 4) are not reviewable from here. The plan gives each a seam and a default rather than a reconstruction.
