# Redesign Spawn — Phase 4 Completion Notes

**Plan:** `docs/executing/redesign-spawn.md`
**Phase:** 4 — Steps 2–5 RPG reskin
**Status:** complete
**Date:** 2026-04-27
**Verification:** `pnpm type-check` → 0 errors · `pnpm lint` → 0 errors · `pnpm build` → clean

---

## What changed

Frontend only. Two new files, three modified, no proto/migration/sqlc/backend
delta. Reducer, Zod schemas, `spawnAgent` RPC contract, and
`<DeploymentConfigForm>` field topology are all unchanged — the reskin is
visual presentation + an additive `labelOverrides` prop on the shared form.

### New: `frontend/src/components/spawn/ready-to-launch.tsx`

Full-width green-bordered §34.3 panel for Step 5's commit moment. ~55 LOC.

**Structure:** outer container with `border-[hsl(var(--status-running))]/50`
+ `bg-[hsl(var(--status-running))]/5`. Header strip (`[ READY TO LAUNCH ]`
kicker on the left, `STAND BY FOR DEPLOY` on the right) above the body. Body
holds the summary copy, the embedded `<PlacementBanner>`, and the deploy
button.

**CTA:** `<Button size="lg">` (h-10 px-4 text-sm — the one rung up from the
sm-default the rest of the wizard uses) with `font-display uppercase
tracking-widest`. The plan called for "large" — `lg` is the largest size
defined in the project's button vocabulary, which matches the §34.3 spec
without growing a new size variant.

**Placement gating:** the panel accepts `placement: PlacementState` and a
`blocked: boolean` flag from the parent (Step 5 computes it from the
placement state). The button is disabled while the check is pending,
blocked, or errored — no logic moved into the panel itself, so the
placement-check effect stays in `ReviewStep` where it owns the cancellation
guard.

### New: `frontend/src/components/spawn/character-sheet.tsx`

Step 5's portrait + 3-column stat block. ~120 LOC. Two helpers (`Portrait`,
`StatColumn`) plus the exported `CharacterSheet` and a `StatRow` type the
wizard composes.

**Portrait:** 180px live `<NebulaAvatar>` (the *second* canvas mounted
during a wizard session — Step 1's gallery canvas is unmounted by the time
the operator reaches Step 5, so the one-canvas-page-wide invariant
(decision 21) holds across the wizard's lifetime). Agent callsign in
`text-3xl font-display uppercase`, harness display name in `font-mono text-xs`
as a subtitle. Layout: `flex-col` on mobile, `flex-row` on `sm+`.

**Stat block:** `grid-cols-1 md:grid-cols-3`. Each column is a
`<StatColumn>` with a 2px top border and a kicker, both coloured by an
inline `style={{ borderTopColor / color: hsl(var(<accent>)) }}` derived from
a `--feature-*` CSS variable name passed in by the wizard. The three
accents follow the plan's mapping:

| Column | Accent var | Hue |
|--------|------------|-----|
| `IDENTITY` | `--feature-secrets` | rose |
| `INTELLIGENCE` | `--feature-adapter` | violet |
| `LOADOUT` | `--feature-deploy` | blue |

These are the same `feature-*` colours `STEP_META` uses for
`<TerminalContainer>` accents in the wizard — Step 5's columns echo Steps
2–4's accent assignments, so the review screen visually re-summarises the
journey.

The stat-row chrome is a local `<dl>` (label + value pair). Pulled out of
the shared `<SpecRow>` because column layout wants `flex-1 break-all` on the
value cell so long model identifiers (`meta-llama/llama-4-405b-instruct`)
and Fly tokens wrap inside the column rather than pushing it wide.

### Modified: `frontend/src/components/fleet/deployment-config-form.tsx`

**Additive `labelOverrides` prop.** Two new exports:

```ts
export type DeploymentLabelKey =
  | "region" | "size" | "volumeSizeGb" | "desiredReplicas"
  | "restartPolicy" | "lifecycleMode" | "chatEnabled";
export type DeploymentLabelOverrides = Partial<Record<DeploymentLabelKey, string>>;
```

The form root resolves each section's label via a tiny
`labelFor(key, fallback)` helper that returns
`labelOverrides?.[key] ?? fallback`. Every field component (`RegionField`,
`SizeField`, `VolumeField`, `ReplicasField`, `RestartField`,
`LifecycleField`, `ChatEnabledField`) gained a `label: string` prop and
threads it into its `<Label>`. **Default behaviour unchanged**: callers that
omit `labelOverrides` (fleet inspector, bulk-apply modal) get exactly the
canonical labels they got before, since the helper falls through to the
hard-coded English string.

**`chatEnabled` included in the key union but kept canonical.** The plan's
§4 named six fields for loadout reflavour (THEATRE / ARMOR / SUPPLY / SQUAD
/ DOCTRINE / MODE). `chatEnabled` was added to `DeploymentLabelKey` for
completeness — the field still surfaces in the form — but the wizard's
`LOADOUT_LABEL_OVERRIDES` does not override it, so the canonical "Chat"
label renders in the loadout. This keeps the type total without taking a
position on what the loadout metaphor for chat would even be.

### Modified: `frontend/src/components/spawn/wizard.tsx`

#### Step 2 — IDENTITY (callsign card)

`IdentityForm` now takes `harness: HarnessEntry | undefined` (threaded from
`StepBodyProps` via `IdentityStep`). Layout: `flex-col` on mobile,
`flex-row sm:items-center` on `sm+`. Left: 64px `<NebulaAvatar>` in a
`bg-black/40 p-1.5` slot — same chrome treatment as Step 1's portrait, just
smaller. Right: a `[ ASSIGN CALLSIGN ]` kicker, the hero input itself, an
`OPERATOR LABEL · <UPPERCASE-LIVE-NAME-OR-DASH>` echo row, and the error
message slot.

**Hero input:** raw `<input>` (not `<Input>` — wanted no box border) with
`border-0 border-b border-border/60 bg-transparent px-0 py-2 font-display
text-2xl uppercase tracking-widest`. On focus the bottom border switches to
`hsl(var(--feature-secrets))` matching Step 2's accent.

**Rotating ghost text:** `useRotatingPlaceholder(["obi-1", "bb-9", "kessel-runner"])`.
Internally a 2.4s `setInterval` advancing an index modulo the array length;
the index is the placeholder. Cleared on unmount. Pure cosmetic — the values
never become the field's actual value because the underlying `register("name")`
keeps Zod's `min(1)` validation honest. Plan §Q4 was unresolved (themed vs
generic placeholder); shipping themed per the plan's pick.

**Confirmed summary row** relabelled `NAME` → `CALLSIGN` to match the
review screen's vocabulary.

#### Step 3 — MODEL (faction × class)

`ModelForm` rewritten around three new presentational helpers:
`PROVIDER_FACTIONS` data, `<FactionPicker>`, and `<SigilField>`.

**`PROVIDER_FACTIONS`** — a `Record<ProviderValue, { glyph, tagline,
modelExample }>` keyed by the existing `ProviderValue` union. Glyphs are
single Unicode characters (Α / Ω / ✦) so they render in the project's
display font without a new icon dep. Taglines are the plan's verbatim
philosophy blurbs ("Careful and considered.", "Generalist with reach.",
"Any model, any provider."). `modelExample` drives both the input
placeholder and the hint text below.

**`<FactionPicker>`** — `role="radiogroup"` over three `<button role="radio"
aria-checked>` cards in a `grid-cols-1 sm:grid-cols-3`. Active card: full
opacity, `border-[hsl(var(--feature-adapter))]` + `bg-…/10`. Inactive cards:
`opacity-40` (per plan §4) lifting to `opacity-100` on hover. Provider value
is set via `form.setValue("provider", v, { shouldValidate: true })` — same
contract the old `ProviderField` had.

**Class hero input** — same hairline-underline treatment as Step 2's
callsign, but at `text-xl tracking-wider` (slightly tighter, since model
identifiers are longer than callsigns). Placeholder + hint reflect the
selected faction's `modelExample` reactively via `useWatch` on `provider`.
Replacing the example as the operator switches faction is what makes the
"class" framing hold together — pick OpenRouter and the example flips to
`meta-llama/llama-4-405b-instruct` immediately.

**`<SigilField>`** — `[ PROVIDE YOUR SIGIL ]` kicker prefixed by a small
`KeyIcon` (lucide), `text-[hsl(var(--feature-secrets))]`. The masked-input
+ show/hide pattern, the `autoComplete="off"`, and the disclaimer copy
("Forwarded once to the agent's secret store. Never written to Corellia's
database.") are preserved verbatim from the old `<ApiKeyField>` — the
schema is unchanged, the security contract is unchanged.

**Confirmed summary rows** relabelled PROVIDER / MODEL / API KEY → FACTION
/ CLASS / SIGIL. Aligns with the review screen's INTELLIGENCE column.

**Deletions:** old `Field`, `ProviderField`, `ApiKeyField` helpers (~60
LOC) are deleted now that nothing in the wizard's render tree calls them.
Imports trimmed: `Label` and the `Select*` family no longer imported.

#### Step 4 — DEPLOYMENT (loadout panel)

The shared `<DeploymentConfigForm>` is unchanged. The wizard wraps it with:
1. A `[ LOADOUT ]` kicker in `text-[hsl(var(--feature-deploy))]`.
2. Replacement intro copy ("Equip the agent. Theatre and armor lock at
   deploy; squad, doctrine, and mode adjust live from the fleet page.
   Theatre change destroys and respawns the agent.").
3. A `LOADOUT_LABEL_OVERRIDES` const passed as `labelOverrides`:

```ts
const LOADOUT_LABEL_OVERRIDES: DeploymentLabelOverrides = {
  region: "[ THEATRE ]",
  size: "[ ARMOR ]",
  volumeSizeGb: "[ SUPPLY ]",
  desiredReplicas: "[ SQUAD ]",
  restartPolicy: "[ DOCTRINE ]",
  lifecycleMode: "[ MODE ]",
};
```

Plan §Q5 was unresolved between full label rename and kicker-only reflavour.
Shipping the full rename per the plan's pick. The fleet inspector and
bulk-apply modal don't pass `labelOverrides`, so they continue to render
the canonical labels ("Region", "Size", …) — operators returning to edit
deployment knobs in the inspector see the unambiguous English vocabulary.

#### Step 5 — REVIEW (character sheet + READY TO LAUNCH)

`ReviewStep` now composes `<CharacterSheet>` + `<ReadyToLaunch>` instead of
rendering an inline `<dl>` and a small ghost button. Three `StatRow[]`
arrays are built locally and handed to the sheet:

- **identityRows** — HARNESS + CALLSIGN
- **intelligenceRows** — FACTION + CLASS + SIGIL
- **loadoutRows** — `deploymentSummaryRows(cfg)` (existing helper, unchanged)

The placement-check `useEffect` and its cancellation guard stay in
`ReviewStep` — only the rendering moves out. `<ReadyToLaunch>` renders
only when `isCurrent` (the confirmed-but-not-current branch shows the
character sheet without the launch panel, same as the old layout's
behaviour-on-edit).

The synthesised `summary` string ("Deploying spins up one Fly machine in
…" / "Deploying spins up N Fly machines in …") is built once in
`ReviewStep` and passed as a prop, so the panel itself stays presentational.

---

## What did NOT change

- **Reducer + Zod schemas + RPC wiring** — `WizardState`, `WizardAction`,
  `getInitialState`, the three Zod schemas, `spawnAgent` request shape, and
  the placement-check call site are byte-identical to before Phase 4.
- **`<DeploymentConfigForm>` field topology** — region / size / volume /
  replicas / restart / lifecycle / chat sections render in the same order,
  with the same components, the same validation, and the same defaults.
  Only the `<Label>` text is plumbed.
- **Fleet inspector + bulk-apply** — neither passes `labelOverrides`, so
  both surfaces render canonical English labels exactly as before.
- **Step 1 (HARNESS)** — confirmed-pane layout is unchanged. Plan §3 note 2
  (compact horizontal card on edit) is Phase 5 work.
- **Streaming `<DeployLog>` surface** — untouched.
- **Reduced-motion behaviour** — Step 1's carousel still falls back to the
  static grid; the new Step 2 / Step 5 `<NebulaAvatar>` instances inherit
  the existing `<NebulaAvatar>` cascade (which already drops to
  `<AvatarFallback>` under `prefers-reduced-motion`).

---

## Deviations from plan

**`chatEnabled` carried into `DeploymentLabelKey` for type totality.** The
plan named six labels for the loadout reflavour. `chatEnabled` was added
to the key union so a future loadout extension can override it without a
type-level change; the wizard does not override it today (canonical "Chat"
label renders inside the loadout). Zero behavioural impact on either call
site.

**Hero callsign / class inputs use raw `<input>`, not `<Input>`.** The
shared `<Input>` component carries box-border chrome that conflicts with
the plan's "hairline underline only (no box border)" spec. Wrapping
`<Input>` and stripping its border via Tailwind would fight the cascade;
dropping to a raw `<input>` with the same a11y attributes is cleaner.

**`<Button size="lg">` for the deploy CTA, not a custom large size.** The
project's button vocabulary defines `lg` (h-10 px-4 text-sm) as the
largest variant. The plan called for "a large `› DEPLOY AGENT` CTA";
introducing a new `xl` variant for one callsite would be plan-creep. `lg`
+ `font-display uppercase tracking-widest` reads as the heaviest CTA in
the surface without a vocabulary expansion.

**One-canvas-per-page invariant honoured by sequencing.** Steps 1, 2, and
5 each mount a `<NebulaAvatar>`. They are never co-mounted: Step 1's
gallery canvas unmounts on harness select; Step 2's 64px preview unmounts
when the operator confirms identity (the form unmounts and the
ConfirmedSummary renders); Step 5's 180px portrait mounts only on Review.
At any moment, exactly one `<canvas>` is live on `/spawn/[templateId]`.

---

## Phase 5 entry points

- **Step 1 confirmed-pane compact horizontal card** (plan §3 note 2):
  rewrite the `HarnessStep` confirmed-and-not-current branch from the
  current 180px-avatar block to a compact ~100px-avatar row card.
- **`docs/refs/design-system.md` reconciliation** (plan §4 Phase 5): §33.5
  collapses to "the spawn surface is the wizard; Step 1 is the harness
  gallery"; §34.3 cited by the new `<ReadyToLaunch>` panel.
- **Roster grid layout helpers in `spawn/page.tsx`** — already removed in
  Phase 1 (the page is now a thin wrapper around `<Wizard initialMode="gallery" />`).
  Phase 5 cleanup verifies nothing else lingers.
- **Changelog entry** — Phase 4 ships under a new `0.12.x` (or higher)
  version bump in `docs/changelog.md`.

---

## LOC delta

- New: `ready-to-launch.tsx` (~55) + `character-sheet.tsx` (~120) ≈ +175
- Modified: `wizard.tsx` (Steps 2–5 reskin + delete `Field` /
  `ProviderField` / `ApiKeyField`) ≈ +120 net (~+180 added, ~−60 deleted)
- Modified: `deployment-config-form.tsx` (`labelOverrides` plumbing) ≈ +20

Net Phase 4: **≈ +315 LOC**, against the plan's estimate of ~250.
