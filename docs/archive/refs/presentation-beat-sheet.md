# Presentation Beat Sheet — `/presentation`

Single-source-of-truth reference for the 60-second narrative half of the
hackathon submission video. Self-contained — readable without
`docs/executing/presentation-polish.md` open.

When the deck is recorded into the submission video, this document is
what an editor reads to confirm the cut. When a non-author engineer
extends a slide, this document is what they read to keep the beats
intact. The plan describes *how* the deck is built; this beat sheet
describes *what each beat is for*.

---

## Story arc — 7 slides over 60 seconds

| #  | Window      | Slide        | One-line message                                     |
|----|-------------|--------------|------------------------------------------------------|
| 1  | 0:00 ─ 0:08 | HOOK         | "The future is a thousand agents per company."      |
| 2  | 0:08 ─ 0:18 | TANGLE       | "Today, governing them is a mess."                   |
| 3  | 0:18 ─ 0:28 | GARAGE       | "Corellia is one place. Any harness."                |
| 4  | 0:28 ─ 0:38 | GUARDIAN     | "Per-agent scopes. Revoke without restart."          |
| 5  | 0:38 ─ 0:48 | OPUS LOOP    | "Any agent on GitHub. Adapter by Opus 4.7."          |
| 6  | 0:48 ─ 0:55 | THESIS       | "Deployment is a commodity. Governance is the product." |
| 7  | 0:55 ─ 1:00 | HANDOFF      | "Let's spawn one." → `/spawn`                        |

**Tension-then-release rhythm.** Slides 1–2 build the problem; 3–5
build the answer; 6 is the strategic mic-drop; 7 hands off to the demo.

---

## Three-audience legibility test

Every slide must pass all three simultaneously:

| Audience                     | What they need                              | Pass test                                                                  |
|------------------------------|---------------------------------------------|----------------------------------------------------------------------------|
| **Anthropic CEO / GP**       | Market thesis · leverage · why now · why us | Could a non-technical investor describe Corellia in one sentence after this slide? |
| **AI research engineer**     | Technical correctness · novel architecture  | Does the technical claim hold up to a skeptical second look? Anything overstated? |
| **Non-technical viewer**     | What does it *do for someone*; is it real   | Could a domain non-expert picture themselves (or their team) using it?    |

A slide passing one and failing the other two is rewritten, not patched.
**Visual carries the message; copy is captioning.** Viewers feel decks,
they don't read them.

---

## Per-slide directors' notes

### Slide 1 · HOOK · "1,247"

**Message:** the future of work has a thousand agents per company, and
that future is already arriving.

**Visual:** a Three.js galaxy of agents. A single point of light at
screen-center; the camera dollies back as ~1,247 particles materialise
one-by-one in 3D space. Final frame: galaxy from outside, slowly
rotating, viewer at rest.

**Motion:** 2.2s count-up overlaid on the materialisation; particles
spawn at the rate of the count, easing-cubic. Camera distance scales
linearly with count.

**Copy:** `[ THE 1,247-AGENT FUTURE ]` (kicker) · `1,247` (count,
oversized) · `agents · one company · this year` (subline). No paragraph
block.

**Audience pass:** non-technical (the number *is* the message), CEO
(scale = market). Research engineer treats it as setup, not technical
claim.

**Director's note:** the count-up is a beat anchor. If the visual lags
or skips, the slide misfires. Determinism is part of the design — the
count timeline drives the camera distance, not vice versa.

---

### Slide 2 · TANGLE · "Today this looks like a mess."

**Message:** the current toolchain doesn't unify; it sprawls.

**Visual:** chaotic 3D web. Eight tool labels (LangGraph, Composio,
Portkey, LangSmith, Fly, AWS, AgentOps, LiteLLM) drift in 3D as
semi-transparent panels. ~80 dashed lines tangle between them —
many-to-many, no center, deliberately ugly. The structure jitters
faintly (strain).

**Motion:** lines draw in over 2s in a rapid scribble; once drawn, the
structure pulses with low-amplitude noise. On exit, the tangle
collapses inward to a single point — which becomes Slide 3's hub.

**Copy:** `[ TODAY ]` · `Five planes. None unify.` (single sentence,
top-anchored). No tool-name lighting sequence — the tangle *is* the
message.

**Audience pass:** non-technical (visual chaos = problem), CEO (no
incumbent owns this), research engineer (recognises the tools without
us editorialising).

**Director's note:** the chaos must read as "fragmented landscape," not
"broken UI." The kicker copy `[ TODAY ]` disambiguates. If a viewer
reads "the deck is broken," the slide fails — three-audience review
gate.

---

### Slide 3 · GARAGE · "Pick a harness. Like picking a car."

**Message:** Corellia unifies that mess into one place; harnesses are
pluggable.

**Visual:** orbiting bay of 6 harnesses around the CORELLIA hub.
`<NebulaAvatar>` for Hermes (lit, ~140px); five `<AvatarFallback>` SVG
schematics for the locked harnesses (dimmed, ~100px). Hub is a luminous
monolith at center.

**Motion:** the bay slowly rotates (~30s/turn — perceptible, not
distracting). Connection lines from hub to each harness draw in
sequence on enter (left-to-right, 80ms stagger). Hermes pulses faintly
(alive). The other five drift quietly.

**Copy:** `[ THE GARAGE ]` · `One control plane.` (large) · `Any
harness. Any provider.` (subline, muted). Bottom caption: `pick a
harness like picking a car`.

**Audience pass:** non-technical (the metaphor lands instantly), CEO
(multi-vendor positioning visible), research engineer (sees the harness
contract architecturally).

**Director's note:** **the diagram is no longer frozen.** The 0.9.3
scaffold rendered a static circle; the redesigned version is alive. If
the bay stops rotating, the slide regresses to scaffold quality.

---

### Slide 4 · GUARDIAN · "Per-agent scopes. Revoke without restart."

**Message:** the substantive product claim — Corellia governs *what
each agent can do*, not just deploys them.

**Visual:** tool-call inspection visualised as a checkpoint. Horizontal
flow: agent (left) → checkpoint icon (center, the `corellia_guard`
plugin) → tool target (right). Three sample requests stream through:

- `web_search("wiki.acme.com")` → ✓ allowed (cyan, passes through)
- `shell.exec("rm -rf /")` → ✗ blocked (red, dissolves at the checkpoint)
- `web_search("evil.com")` → ✗ blocked (red, dissolves)

**Motion:** each request appears as a small text capsule that slides
left-to-right, pauses at the checkpoint for ~150ms while a hairline
scan-line crosses it, then either passes (cyan) or dissolves into
pixels (failed-red). 3-call sequence over ~6s.

**Copy:** `[ THE GUARDIAN ]` · `Per-agent scopes.` (large) · `Revoke
without restart.` (subline). Bottom caption: `every tool call passes
through a policy you wrote.`

**Audience pass:** research engineer (the technically novel part — the
in-Hermes plugin, `pre_tool_call`, scope.json hot-reload), CEO
(governance = enterprise sale), non-technical (green/red metaphor
needs no decoding).

**Director's note:** Hermes-real call examples (`shell.exec`,
`web_search`) per Q6. The research engineer recognises them; the
non-technical viewer doesn't lose anything.

---

### Slide 5 · OPUS LOOP · "Any agent on GitHub."

**Message:** Corellia integrates *any* harness from a public repo;
Opus 4.7 reads the repo and writes the adapter.

**Visual:** the Anthropic angle, rendered as visual magic. Three-stage
scene:

1. A GitHub URL appears (`github.com/nousresearch/hermes-agent` per Q5).
   The URL "unfolds" into a 3D file tree (animated tree-sitter parse —
   small file glyphs cascading downward).
2. A horizontal scan beam labelled `OPUS 4.7` sweeps across the tree,
   top-to-bottom. Each file glyph dims as it's read. ~1.5s sweep.
3. Two artefacts crystallise on the right: `corellia.yaml` and
   `adapter image` — both materialise from particles condensing into
   rectangular cards.

**Motion:** stages 1→2→3 in 7s total. Tree cascade (1.5s), scan sweep
(1.5s), crystallisation (2s), settle (2s). The scan beam reuses the
nebula shader family (Q7 — visual-language continuity).

**Copy:** `[ OPUS IN THE LOOP ]` · `Any agent on GitHub.` (large) ·
`Adapter generated by Opus 4.7.` (subline, accent-violet). Bottom
caption: `tree-sitter + readme + dockerfile → validated manifest.`

**Audience pass:** research engineer (programmatic adapter generation
is real per `blueprint.md` §4), CEO (the Anthropic-angle hackathon
judge sees themselves in the product), non-technical (input → magic →
output is universally legible).

**Director's note:** real repo URL per Q5. The "any agent on GitHub"
claim is concrete only when the URL is concrete.

---

### Slide 6 · THESIS · "Deployment is a commodity. Governance is the product."

**Message:** the strategic mic-drop. Why this is the right wedge.

**Visual:** black screen. White text. **Nothing else.** Two lines,
large, centered. `Deployment is a commodity.` (top, slightly muted).
`Governance is the product.` (bottom, full-bright).

**Motion:** line one fades in over 0.6s, holds 1s, then line two fades
in over 0.6s. Both hold for ~4s. **Stillness is the design choice** —
every other slide moves; this one doesn't, and the contrast lands the
line.

**Copy:** as above. No kicker, no subline.

**Audience pass:** CEO (the framing they'd want to repeat), research
engineer (recognises Stripe/Linear-style positioning), non-technical
(short, concrete).

**Director's note:** if this slide feels self-important rather than
confident in review, cut it. Stillness + brevity is the only hedge —
there's no animation to redeem it.

---

### Slide 7 · HANDOFF · "Let's spawn one."

**Message:** the deck *becomes* the product. Demo follows.

**Visual:** Hermes `<NebulaAvatar size={320}>` center-stage; single CTA
below.

**Motion:** the nebula is already alive (continuous shader animation).
On entry, the kicker + headline crossfade in over 0.8s; the CTA button
lifts in 0.3s later.

**Copy:** `[ HANDOFF ]` · `Let's spawn one.` (huge, centred) · `›
ENTER THE CONTROL PLANE` (button, routes to `/spawn`) · `(live demo
follows)` (footnote).

**Audience pass:** universal — the product picks up where the deck
leaves off.

**Director's note:** the nebula here is the *same* visual as Slide 1's
galaxy resolved to a single point of light. The story arc has unity
because the visual does. Phase-4 transitions land this link.

---

## Cross-slide links

- **Slide 1 ↔ Slide 7.** The galaxy of 1,247 agents resolves to a
  single Hermes nebula. Same visual family; same shader chunks.
- **Slide 2 → Slide 3.** The tangle collapses inward to a point that
  becomes Slide 3's CORELLIA hub. Single moment of cohesion across
  slides.
- **Slide 5 scan beam ↔ `<NebulaAvatar>`.** Same simplex-noise + tint
  family. Q7 reuse decision; visual-language continuity.

---

## Recording-mode notes

- The deck plays at click-advance pace by default. `/presentation?mode=record`
  hides chrome (top strip, dots, prev/next), auto-advances on the
  60-second timeline above, and seeds randomness deterministically so
  two recordings produce frame-equivalent video.
- Voice-over records *to* this timeline, not the other way around.
  Phase 5 voice records after Phase 4 motion is locked.
- The Slide 7 → `/spawn` seam is a real route transition. In the live
  deck this is a feature; in the recorded video the editor crossfades
  the seam so the two halves read as one piece.

---

## Open decisions reference

Pulled from `docs/executing/presentation-polish.md` §5 with current
defaults; treat this table as the contract until the plan ratifies a
change.

| # | Decision                                                 | Default                                                       |
|---|----------------------------------------------------------|---------------------------------------------------------------|
| 1 | 7 slides vs 6 (cut Thesis) vs 8                          | **7** — Thesis stays                                          |
| 2 | Auto-advance vs manual click during recording            | **Auto** with `mode=record`; click-advance is default         |
| 3 | Voice-over: operator vs synth vs none                    | Operator if available; synth fallback; none acceptable        |
| 4 | Slide 2 tool labels: named vs unbranded                  | **Named** — recognisability trumps neutrality                 |
| 5 | Slide 5 GitHub URL: real vs placeholder                  | **Real** (`github.com/nousresearch/hermes-agent`)             |
| 6 | Slide 4 blocked-call examples: Hermes-real vs hypothetical | **Hermes-real** (`shell.exec`, `web_search`)                 |
| 7 | Reuse `<NebulaAvatar>` shader for Slide 5 scan beam      | **Reuse** — visual-language continuity                        |
