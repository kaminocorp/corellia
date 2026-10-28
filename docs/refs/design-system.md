# Corellia Design System

> **Status (2026-10-28):** documents the visual language of the existing v1 frontend (control-plane UI). The visual language for the personal agent workspace ([`../VISION.md`](../VISION.md)) is not decided; treat this as reference, not a mandate.

> **Mission Control × Deep Space — for agent fleets**
> Corellia's design language: a Kamino-family sister product with its own
> identity rooted in technical retro-futurism, systems-engineering visual
> grammar, and the mission-control ethos of "operators watching systems
> work."

**Version**: 1.0 (Corellia)
**Derived from**: the original `design-direction.md` (aesthetic intent) +
`design-refs.md` (Kamino design system, sourced from Elephantasm's
frontend), now retired in favour of this single document.
**Source of truth**: this document. Updates to Corellia's visual language
land here.

---

## Table of Contents

### Part I — Aesthetic Direction
1. [Design Philosophy](#1-design-philosophy)
2. [Three Pillars](#2-three-pillars)
3. [What This Is Not](#3-what-this-is-not)
4. [Corellia's Place in the Kamino Family](#4-corellias-place-in-the-kamino-family)

### Part II — Foundations
5. [Color System](#5-color-system)
6. [Typography](#6-typography)
7. [Spacing & Sizing](#7-spacing--sizing)
8. [Border Radius](#8-border-radius)
9. [Elevation & Shadows](#9-elevation--shadows)
10. [Opacity Scale](#10-opacity-scale)
11. [Z-Index Layers](#11-z-index-layers)

### Part III — Theme Tokens
12. [CSS Custom Properties](#12-css-custom-properties)

### Part IV — Component Library
13. [Buttons](#13-buttons)
14. [Inputs & Forms](#14-inputs--forms)
15. [Cards & Containers](#15-cards--containers)
16. [Terminal Container (signature)](#16-terminal-container-signature)
17. [Glassmorphic Card](#17-glassmorphic-card)
18. [Modals & Dialogs](#18-modals--dialogs)
19. [Tables](#19-tables)
20. [Tooltips & Popovers](#20-tooltips--popovers)
21. [Status Indicators](#21-status-indicators)
22. [Progress Bars](#22-progress-bars)
23. [Loading States](#23-loading-states)
24. [Empty States](#24-empty-states)
25. [Error States](#25-error-states)

### Part V — Patterns
26. [Navigation & Information Architecture](#26-navigation--information-architecture)
27. [Iconography & Symbols](#27-iconography--symbols)
28. [Animation & Motion](#28-animation--motion)
29. [Backgrounds & Atmospherics](#29-backgrounds--atmospherics)
30. [Scrollbars](#30-scrollbars)
31. [Responsive Design](#31-responsive-design)
32. [Accessibility](#32-accessibility)

### Part VI — Corellia-Specific
33. [Page Motifs (per route)](#33-page-motifs-per-route)
34. [The RPG Character Creation Flow](#34-the-rpg-character-creation-flow)
35. [Status Vocabulary for Agents](#35-status-vocabulary-for-agents)

### Part VII — Adoption
36. [Quick-Start Checklist](#36-quick-start-checklist)
37. [Anti-Patterns](#37-anti-patterns)

---

# Part I — Aesthetic Direction

## 1. Design Philosophy

### Core: Mission Control × Deep Space (Corellia's variant)

The Kamino family shares a **Terminal × Deep Space** aesthetic. Corellia
sharpens that into a more specific stance:

- **Mission Control, not skyline.** Operators watching systems work, not
  consumers strolling neon streets. Radar screens, HUD overlays, telemetry
  panels, status matrices. The quiet authority of NASA control rooms and
  early NORAD displays.
- **Schematics, not spectacle.** Wireframe geometry, vector line work,
  scientific-illustration conventions, technical readouts. The visual
  vocabulary of people who **build and monitor complex systems**.
- **Spec sheets, not posters.** When the user picks a harness, the catalog
  reads like an engineering datasheet — fields, bounds, digests, resource
  footprints — not a marketing card.

Corellia's product is the agent control plane. Its visual product is the
**control room for a fleet of those agents.** Every screen should reinforce
the user's identity as an admin orchestrating systems, not a consumer
scrolling content.

### Five Principles (Kamino-shared)

1. **Functional Minimalism** — every visual element serves a purpose. No
   decorative flourishes. Information hierarchy is deliberate.
2. **Terminal as Interface Metaphor** — terminal windows as container
   pattern, `[ BRACKETS ]` as section identifiers, `>` chevrons as the
   universal action/status indicator.
3. **Dark-First, High Contrast** — pure black (`#000000`) primary
   background, light text on dark surfaces (WCAG AA compliant), strategic
   opacity for layering depth.
4. **Subtle, Not Flashy** — animations enhance, never distract.
   Glassmorphic effects are restrained (low opacity). Hover states are
   gentle 200ms transitions.
5. **Color as Information Architecture** — each domain area gets a
   dedicated accent color. Color carries meaning (where you are), not
   decoration.

### Animation Stance: Alive, Not Showy

The site should **feel like a live system**. Continuous ambient motion —
not gratuitous, but the quiet hum of a monitoring dashboard that's always
on. Pulse lighting on status dots, slow nebula drift in backgrounds,
subtle gradient shifts on hover. The kind of motion that communicates
"there's something running here" without distracting from the task.

---

## 2. Three Pillars

### Pillar 1 — Mission-Control Cyberpunk

The control room rather than the skyline. Radar screens, HUD overlays,
monitoring dashboards, technical readouts. Quiet authority over complex
systems.

Corellia-specific applications:
- **Fleet view** is a literal status matrix — agent rows, status columns,
  pulse-dot indicators
- **Agent detail page** reads as a telemetry panel — readouts, config
  fields, deploy state, log tail
- **Spawn flow** is mission preparation — checklists, configuration
  acknowledgements, "READY TO LAUNCH" gating

### Pillar 2 — Analog-Digital Hybrid Futurism

The tension between pre-digital engineering precision and early computing
aesthetics. 1970s–90s aerospace diagrams, CRT phosphor glow, vector
graphics, scientific illustration mixed with modern design sensibility.

Corellia-specific applications:
- **Harness catalog cards** look like spec sheets — name, version, digest,
  resource footprint, supported tools — laid out as engineering datasheets
- **Adapter detail** visualises the Docker layer stack as a schematic
  (upstream image → adapter overlay → digest pin)
- **Deploy target detail** is an infrastructure topology diagram, not a
  marketing card

### Pillar 3 — Systems-Engineering Visual Language

Dashboards, networks, data flows, system architectures rendered as visual
artefacts. The vocabulary of people who build interconnected systems.

Corellia-specific applications:
- **Fleet view** can render as a network topology when an org grows past
  N agents (post-v1)
- **Audit log** (post-v1) is a chronological data stream, not a chat
  transcript
- **Permissions/IAM** (post-v1) is a matrix, not a settings list

---

## 3. What This Is Not

- **Not neon-city cyberpunk.** No rain-slicked streets, no Blade Runner
  pastiche, no katakana decoration.
- **Not nostalgic synthwave.** No sunset gradients, no VHS tracking lines,
  no retro pop culture nods.
- **Not generic "dark mode tech."** Not just black background + blue
  accents. The mission-control vocabulary is specific.
- **Not maximalist.** Complexity feels organised, not chaotic. A fleet
  view of 200 agents must remain scannable, not become a wall of light.
- **Not consumer-app cheerful.** No emoji-filled empty states, no
  illustrated "well done!" confirmations, no rounded-pastel everything.

---

## 4. Corellia's Place in the Kamino Family

Corellia is one of several Kamino sister products (Elephantasm, Parsec,
Photon, Trajan, Heimdall, Kessel, CorpoVault, etc.). The shared design
system means a user moving between Kamino products immediately recognises
the family. Corellia's distinctness comes from **what colors mean** and
**what page motifs render**, not from rebuilding the design system.

### What Corellia keeps identical to the Kamino family

1. **Font stack** — Geist Sans + Geist Mono + Space Mono
2. **Brand green** — `#22c55e` for primary actions, chevrons, focus rings
3. **Dark-first background hierarchy** — `#000 → #0a0a0a → #1f2937 → #374151`
4. **Terminal container pattern** — `border-2 border-gray-600 bg-black/80`
   with `[ BRACKET HEADERS ]` and `>` chevrons
5. **CSS custom property set** — full HSL token system from shadcn/ui
6. **Typography rules** — Space Mono for UI chrome, Geist Sans for
   content, uppercase + `tracking-wider` for labels
7. **Glassmorphic treatment** — `backdrop-blur`, `bg-white/5`,
   `border-white/10` for elevated surfaces
8. **Transition timing** — 200ms ease-in-out for interactive transitions
9. **shadcn/ui base** — New York style, neutral base color
10. **Scrollbar styling** — green-tinted custom scrollbars

### What Corellia customises

1. **Feature color map** — see §5; Corellia's domains (Agents, Catalog,
   Adapters, Deploy Targets, Secrets, Audit, IAM) get their own
   assignments from the same Tailwind palette
2. **Page motifs** — see §33; Catalog reads as spec sheets, Fleet as
   radar/status matrix, Spawn flow as RPG character creation
3. **Background atmospherics** — Corellia leans on **starfield + nebula
   drift** (consistent with archive/vision.md's "operators of complex systems"
   framing); Catalog and Spawn flow may layer faint **schematic grid
   overlays** as ambient texture
4. **Status vocabulary** — see §35; agent lifecycle states have specific
   visual treatments not present in sister products

---

# Part II — Foundations

## 5. Color System

### 5.1 Base Palette (Neutrals)

```
#000000  ── Pure black       Page backgrounds
#0a0a0a  ── Near-black       Card/panel backgrounds (hsl(0 0% 3.9%))
#111827  ── Gray 900         Subtle borders, deep backgrounds
#1f2937  ── Gray 800         Elevated backgrounds, empty states
#27272a  ── Zinc 800         Dark mode borders (--border)
#374151  ── Gray 700         Secondary borders
#4b5563  ── Gray 600         Active borders, terminal borders (primary)
#6b7280  ── Gray 500         Muted text, captions
#9ca3af  ── Gray 400         Secondary text, body copy
#d1d5db  ── Gray 300         Primary text, descriptions
#e5e7eb  ── Gray 200         Headings
#f3f4f6  ── Gray 100         Bright text, emphasis
#fafafa  ── Gray 50          Maximum brightness text
```

### 5.2 Background Hierarchy (4 tiers)

Depth is created through layered backgrounds, not shadows alone:

```
Tier 1  #000000              Page/root background
Tier 2  #0a0a0a              Cards, modals, panels
Tier 3  #1f2937 / #27272a    Elevated elements, hover states
Tier 4  #374151 / zinc-700   Maximum elevation, active states
```

Transparency variants:

```
bg-black/80     ── Terminal containers (signature)
bg-black/50     ── Input fields
bg-black/40     ── Subtle overlays, rail backgrounds
bg-white/5      ── Glassmorphic container fills
bg-white/10     ── Glassmorphic borders, track fills
bg-white/[0.02] ── Barely-there gradient endpoints
```

### 5.3 Brand Green (Primary Accent — Kamino-shared)

Green is the universal Kamino brand color. Active, success, primary
action, brand identity.

```
#dcfce7  ── green-100    Light tint backgrounds
#86efac  ── green-300    Bright highlights
#4ade80  ── green-400    Glow effects, bright accents (status pulses)
#22c55e  ── green-500    PRIMARY — status, chevrons, focus rings
#16a34a  ── green-600    Button hover states
#15803d  ── green-700    Button default backgrounds
#166534  ── green-800    Dark tint
#0c4521  ── green-950    Banner backgrounds
```

### 5.4 Corellia Feature Color Map

Each Corellia domain gets a dedicated accent color drawn from the same
Tailwind palette as sister products. Color is the primary wayfinding
mechanism.

| Section          | Role             | Color   | Hex       | Tailwind Class | Used For |
|------------------|------------------|---------|-----------|----------------|----------|
| **Agents**       | Entity (primary) | Green   | `#22c55e` | `green-500`    | Fleet view, individual agent pages, "running" status |
| **Catalog**      | Discovery        | Cyan    | `#06b6d4` | `cyan-500`     | Harness browse, "spawn new" entry point |
| **Adapters**     | Technical entity | Violet  | `#a78bfa` | `violet-400`   | HarnessAdapter detail, digest pinning, image refs |
| **Deploy Targets** | Infrastructure | Blue    | `#60a5fa` | `blue-400`     | Fly/AWS/Local target detail, infrastructure topology |
| **Secrets**      | Sensitive        | Rose    | `#fb7185` | `rose-400`     | Per-instance secrets, API key handling, redacted views |
| **Audit Log**    | Tool (post-v1)   | Emerald | `#34d399` | `emerald-400`  | Chronological event stream, who-did-what-when |
| **IAM/Permissions** | Tool (post-v1)| Amber   | `#fbbf24` | `amber-400`    | Permission matrix, role assignment, policy scoping |
| **Skills**       | Tool (post-v1)   | Teal    | `#2dd4bf` | `teal-400`     | Skills registry browse + assignment |
| **Memory**       | Tool (post-v1)   | Purple  | `#c084fc` | `purple-400`   | Memory provider config, conversation history |
| **Observability** | Tool (post-v1)  | Orange  | `#fb923c` | `orange-400`   | Metrics, traces, logs, dashboards |

**Rule of thumb for picking a section color** (when adding a new domain):
draw from Tailwind 400 or 500 shades; pick something perceptually distinct
from existing Corellia + sister-product assignments; avoid red-adjacent
hues (red is reserved for destructive/error).

### 5.5 Pattern for Applying Feature Colors

```
Active nav:     text-{color}  bg-{color}/10  border-b-2 border-{color}
Nav hover:      hover:text-{color}
Section header: text-{color}
Accent glow:    shadow-[0_0_12px_rgba({r},{g},{b},0.15)]
Tinted bg:      bg-{color}/5  or  bg-{color}/10
```

Full-strength color is for **text and borders only**. Backgrounds always
use opacity-modified variants (`/5`, `/10`, `/20`).

### 5.6 Alert Colors

```
#ef4444  ── red-500     Errors, destructive actions
#f87171  ── red-400     Error text on dark backgrounds
rgba(127, 29, 29, 0.3) ── Red background tint
```

### 5.7 Glassmorphic Overlays (White Opacity)

```
rgba(255, 255, 255, 0.02)  ── Barely-there gradient endpoints
rgba(255, 255, 255, 0.05)  ── Container background fills
rgba(255, 255, 255, 0.10)  ── Borders, track fills
rgba(255, 255, 255, 0.20)  ── Hover borders
rgba(255, 255, 255, 0.30)  ── Strong accents
```

---

## 6. Typography

### 6.1 Font Stack

| Font | CSS Variable | Role | Weights |
|------|-------------|------|---------|
| **Geist Sans** | `--font-geist-sans` | Default body text, UI elements | 400, 500, 600, 700 |
| **Geist Mono** | `--font-geist-mono` | Code blocks, data values, digests, IDs | 400, 700 |
| **Space Mono** | `--font-space-mono` | Terminal headers, labels, buttons — the "signature" font | 400, 700 |

```css
font-family: var(--font-geist-sans);   /* Body default */
font-family: var(--font-geist-mono);   /* Code/data */
font-family: var(--font-space-mono);   /* Terminal aesthetic */
```

**Rule:** Space Mono defines the brand feel. Use it for all headers,
labels, buttons, navigation, and status text. Geist Sans for body
paragraphs and long-form content. Geist Mono for code, data values
(SHA digests, UUIDs, durations), and technical output.

For Corellia specifically, **digests, app names, Fly IDs, and any
content-addressed reference** must always render in Geist Mono — this is
the visual cue that the value is byte-significant, not display text.

### 6.2 Type Scale

| Token | Size | Use |
|-------|------|-----|
| `text-xs` | 12px (0.75rem) | Labels, captions, terminal headers, buttons |
| `text-sm` | 14px (0.875rem) | Body text, descriptions, secondary content |
| `text-base` | 16px (1rem) | Large body, subsection headings |
| `text-lg` | 18px (1.125rem) | Section titles |
| `text-xl` | 20px (1.25rem) | Page subtitles |
| `text-2xl` | 24px (1.5rem) | Page titles |
| `text-4xl` | 36px (2.25rem) | Hero titles (mobile) |
| `text-5xl` | 48px (3rem) | Hero titles (desktop) |

### 6.3 Type Patterns

```css
/* Terminal header (signature pattern) */
font-mono tracking-wider uppercase text-xs text-gray-500

/* Terminal label */
text-xs font-semibold uppercase tracking-wider text-gray-500 font-mono

/* Page heading */
text-2xl font-bold text-gray-200 tracking-tight

/* Body text */
text-sm text-gray-400

/* Caption / metadata */
text-xs text-gray-500

/* Hero title */
text-4xl sm:text-5xl font-bold uppercase tracking-widest text-gray-100

/* Digest / data value (Corellia-specific) */
font-mono text-xs text-gray-300 break-all
```

### 6.4 Letter Spacing

| Class | Value | Use |
|-------|-------|-----|
| `tracking-tight` | -0.015em | Page headings, large text |
| `tracking-normal` | 0 | Body text |
| `tracking-wide` | 0.025em | Subheadings |
| `tracking-wider` | 0.05em | Terminal labels, buttons (primary) |
| `tracking-widest` | 0.1em | Hero titles |

### 6.5 Typography Rules

1. **Always uppercase** for: buttons, labels, terminal headers,
   navigation, status text
2. **Wide letter-spacing** (`tracking-wider` minimum) for all uppercase
   text
3. **No italics** — italic text breaks the terminal aesthetic
4. **Font hierarchy**: Space Mono for UI chrome, Geist Sans for content,
   Geist Mono for data
5. **Digests and IDs in Geist Mono, full string visible** — never
   truncate a SHA digest with `…` in primary surfaces; truncate only in
   table cells where space forces it (and provide tooltip with full value)

---

## 7. Spacing & Sizing

Base unit: **4px** (Tailwind's `1` = 0.25rem = 4px).

### 7.1 Spacing Scale

```
1    = 0.25rem   (4px)     Tight gaps
1.5  = 0.375rem  (6px)     Compact gaps
2    = 0.5rem    (8px)     Standard gap (most common)
3    = 0.75rem   (12px)    Component internal spacing
4    = 1rem      (16px)    Standard padding
5    = 1.25rem   (20px)    Comfortable padding
6    = 1.5rem    (24px)    Card/modal padding
8    = 2rem      (32px)    Section padding (mobile)
12   = 3rem      (48px)    Section padding (desktop)
16   = 4rem      (64px)    Page vertical spacing
20   = 5rem      (80px)    Hero spacing
```

### 7.2 Common Patterns

```css
/* Terminal title bar */
px-3 py-2          /* or px-4 py-2 */

/* Terminal content area */
px-4 py-4

/* Card / modal content */
p-6                /* 24px all sides */

/* Page container */
px-4 py-8                    /* Mobile */
sm:px-8 sm:py-12             /* Desktop */

/* Between form fields */
space-y-4

/* Between section components */
space-y-8

/* Flex/grid gaps */
gap-2  (8px)       /* Most common */
gap-3  (12px)      /* Comfortable */
gap-4  (16px)      /* Spacious */
gap-6  (24px)      /* Between sections */
```

### 7.3 Container Widths

```
max-w-md   = 28rem   (448px)    Modals (narrow)
max-w-lg   = 32rem   (512px)    Forms
max-w-xl   = 36rem   (576px)    Modals (standard)
max-w-2xl  = 42rem   (672px)    Content columns
max-w-4xl  = 56rem   (896px)    Content pages, large modals
max-w-5xl  = 64rem   (1024px)   Wide content
max-w-6xl  = 72rem   (1152px)   Dashboard layouts
max-w-7xl  = 80rem   (1280px)   Full-width pages (Fleet view default)
```

### 7.4 Icon & Spinner Sizes

```
size={16}   Small (inline, captions)
size={18}   Medium (close buttons, nav)
size={24}   Large (mobile menu, hero)

w-3 h-3     Spinner inline with text
w-4 h-4     Spinner small loading states
w-8 h-8     Spinner full-screen loaders
```

---

## 8. Border Radius

The system uses rounded corners for shadcn/ui components, with size
indicating element importance. **Terminal containers use no border-radius**
— square corners are the signature terminal look.

```
rounded-sm   = 2px (0.125rem)     Small elements, tags
rounded      = 4px (0.25rem)      Grid cells, minor elements
rounded-md   = 6px (0.375rem)     Inputs, buttons, selects, textareas
rounded-lg   = 8px (0.5rem)       Containers, panels, rails
rounded-xl   = 12px (0.75rem)     Cards (primary shape)
rounded-full = 9999px             Avatars, badges, status dots, pills
```

CSS variables:

```css
--radius:    0.5rem   /* 8px — base */
--radius-lg: 0.75rem  /* calc(var(--radius) + 2px) */
--radius-md: 0.5rem   /* var(--radius) */
--radius-sm: 0.25rem  /* calc(var(--radius) - 2px) */
```

Rules:
- Terminal containers: **no border-radius** (signature)
- shadcn/ui components: default radius values
- Status dots and avatars: always `rounded-full`
- The two systems coexist: terminal patterns are square, component-library
  patterns are rounded

---

## 9. Elevation & Shadows

Shadows used sparingly. Depth comes primarily from background tiers and
borders.

```css
/* Standard elevation */
shadow       0 1px 2px 0 rgba(0, 0, 0, 0.05)            Cards, containers

/* Low elevation */
shadow-sm    0 1px 2px 0 rgba(0, 0, 0, 0.05)            Inputs, buttons

/* High elevation */
shadow-lg    0 10px 15px -3px rgba(0, 0, 0, 0.1)        Elevated panels

/* Maximum elevation */
shadow-xl    0 20px 25px -5px rgba(0, 0, 0, 0.1)        Modals
shadow-2xl   0 25px 50px -12px rgba(0, 0, 0, 0.25)      Overlays

/* Brand glow effects */
shadow-[0_0_12px_rgba(34,197,94,0.15)]                  Green glow (brand)
shadow-[0_0_12px_rgba(34,211,238,0.15)]                 Cyan glow (catalog)
shadow-[0_0_12px_rgba(167,139,250,0.15)]                Violet glow (adapter)

/* Terminal container shadow (signature glass effect) */
box-shadow: 0 0 12px rgba(0,0,0,0.45),
            0 1px 0 rgba(255,255,255,0.04) inset;
```

### Border Widths

```
border    = 1px    Glassmorphic cards, subtle separation
border-2  = 2px    Terminal containers (signature pattern)
```

---

## 10. Opacity Scale

Opacity modifiers on colors are a primary tool for hierarchy without
multiplying the palette.

```
/5     5%     Minimal tint (barely visible)
/10    10%    Subtle highlight (active nav background, feature tint)
/20    20%    Visible background (hover states)
/30    30%    Strong background (scrollbar thumbs)
/40    40%    Prominent overlay (image overlays)
/50    50%    Significant opacity (borders, strong tints)
/60    60%    High contrast
/70    70%    Near-opaque overlays
/80    80%    Terminal containers, modal backdrops
/90    90%    Near-opaque
```

Key patterns:
- `bg-{color}/10` — Active state background tint
- `bg-{color}/5` — Subtle section tint
- `bg-black/80` — Terminal container fill
- `bg-black/40` — Image / background overlay
- `border-{color}/50` — Tinted borders

---

## 11. Z-Index Layers

```
-z-10    Background layers (particle fields, starfields, schematic grids)
z-0      Default content
z-10     Overlaid content, page content above backgrounds
z-40     Modal backdrops
z-50     Modals, fixed headers, navigation, popovers
```

---

# Part III — Theme Tokens

## 12. CSS Custom Properties

The design system uses HSL-based CSS custom properties (from shadcn/ui)
for theme-aware components.

**Important**: values are stored as raw HSL channels without `hsl()`
wrapper, so they can be composed with opacity:
`hsl(var(--primary) / 0.5)`.

### Dark Mode (Primary — `@media (prefers-color-scheme: dark)`)

```css
--background:             0 0% 3.9%;      /* #0a0a0a  Near-black */
--foreground:             0 0% 98%;       /* #fafafa  Off-white */
--card:                   0 0% 3.9%;      /* #0a0a0a */
--card-foreground:        0 0% 98%;       /* #fafafa */
--popover:                0 0% 3.9%;      /* #0a0a0a */
--popover-foreground:     0 0% 98%;       /* #fafafa */
--primary:                0 0% 98%;       /* #fafafa */
--primary-foreground:     0 0% 9%;        /* #171717 */
--secondary:              0 0% 14.9%;     /* #262626 */
--secondary-foreground:   0 0% 98%;       /* #fafafa */
--muted:                  0 0% 14.9%;     /* #262626 */
--muted-foreground:       0 0% 63.9%;     /* #a3a3a3 */
--accent:                 0 0% 14.9%;     /* #262626 */
--accent-foreground:      0 0% 98%;       /* #fafafa */
--destructive:            0 62.8% 30.6%;  /* #7f1d1d */
--destructive-foreground: 0 0% 98%;       /* #fafafa */
--border:                 0 0% 14.9%;     /* #262626 */
--input:                  0 0% 14.9%;     /* #262626 */
--ring:                   0 0% 83.1%;     /* #d4d4d8 */
```

### Light Mode (`:root` default)

```css
--background:             0 0% 100%;      /* #ffffff */
--foreground:             0 0% 3.9%;      /* #0a0a0a */
--card:                   0 0% 100%;      /* #ffffff */
--card-foreground:        0 0% 3.9%;      /* #0a0a0a */
--primary:                0 0% 9%;        /* #171717 */
--primary-foreground:     0 0% 98%;       /* #fafafa */
--secondary:              0 0% 96.1%;     /* #f5f5f5 */
--secondary-foreground:   0 0% 9%;        /* #171717 */
--muted:                  0 0% 96.1%;     /* #f5f5f5 */
--muted-foreground:       0 0% 45.1%;     /* #737373 */
--accent:                 0 0% 96.1%;     /* #f5f5f5 */
--accent-foreground:      0 0% 9%;        /* #171717 */
--destructive:            0 84.2% 60.2%;  /* #ef4444 */
--destructive-foreground: 0 0% 98%;       /* #fafafa */
--border:                 0 0% 89.8%;     /* #e5e5e5 */
--input:                  0 0% 89.8%;     /* #e5e5e5 */
--ring:                   0 0% 3.9%;      /* #0a0a0a */
```

### Derived Variables

```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);

--color-background: hsl(var(--background));
--color-foreground: hsl(var(--foreground));
--color-card:       hsl(var(--card));
--color-primary:    hsl(var(--primary));

--radius-lg: calc(var(--radius) + 2px);   /* 0.75rem */
--radius-md: var(--radius);                /* 0.5rem */
--radius-sm: calc(var(--radius) - 2px);    /* 0.25rem */
```

> **Note**: Corellia is dark-first. Light mode tokens are present for
> shadcn/ui completeness but not a v1 product target.

---

# Part IV — Component Library

## Foundation: shadcn/ui

The component layer is built on [shadcn/ui](https://ui.shadcn.com/) (New
York style, neutral base color):

```json
{
  "style": "new-york",
  "rsc": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

shadcn/ui primitives provide accessibility + base behaviour; the terminal
aesthetic is layered on top via Tailwind classes.

---

## 13. Buttons

### 13.1 Primary Button (Terminal Green)

```tsx
<button className="
  px-4 py-2
  text-xs font-semibold tracking-wider uppercase
  bg-green-700 hover:bg-green-600
  text-white border border-green-600
  transition-all font-mono
">
  > Spawn Agent
</button>
```

- Default: `bg-green-700`, `border-green-600`
- Hover: `bg-green-600` (lighter)
- Disabled: `opacity-50 cursor-not-allowed`

### 13.2 Secondary Button (Outline)

```tsx
<button className="
  px-4 py-2
  text-xs font-semibold tracking-wider uppercase
  text-gray-300 bg-transparent
  border border-gray-600
  hover:border-gray-500 hover:bg-white/5
  transition-all font-mono
">
  > Cancel
</button>
```

### 13.3 Destructive Button (Red on Hover)

Reserved for genuinely destructive Corellia actions: **Destroy Agent**,
**Delete Template**, **Revoke API Key**.

```tsx
<button className="
  px-3 py-1.5
  text-xs font-semibold tracking-wider uppercase
  text-gray-300 border border-gray-700
  hover:border-red-500 hover:text-red-500 hover:bg-red-500/10
  transition-all font-mono
">
  Destroy
</button>
```

### 13.4 shadcn/ui Button Variants (component-library contexts)

| Variant | Classes |
|---------|---------|
| `default` | `bg-primary text-primary-foreground shadow hover:bg-primary/90` |
| `destructive` | `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90` |
| `outline` | `border border-input bg-background shadow-sm hover:bg-accent` |
| `secondary` | `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline` |

Sizes: `default` (h-9, px-4 py-2), `sm` (h-8, px-3 text-xs), `lg`
(h-10, px-8), `icon` (h-9 w-9).

---

## 14. Inputs & Forms

### 14.1 Text Input

```tsx
<input className="
  bg-black/50 border border-gray-600
  text-gray-100 font-mono text-sm
  placeholder:text-gray-600
  focus:border-green-500 focus:outline-none
  px-3 py-2 rounded-md
  transition-colors
" />
```

### 14.2 shadcn/ui Input

```
h-9 rounded-md border border-input bg-transparent
px-3 py-1 text-base shadow-sm
focus-visible:ring-1 focus-visible:ring-ring
```

### 14.3 Labels

```tsx
<label className="
  text-gray-300 text-xs uppercase tracking-wider font-mono
">
  Agent Name
</label>
```

### 14.4 Select

```
rounded-md border border-input bg-transparent
px-3 py-2 text-sm
focus:ring-1 focus:ring-ring shadow-sm
```

### 14.5 Switch

```
h-5 w-9 rounded-full shadow-sm
Thumb: h-4 w-4 rounded-full
Transition: data-[state=checked]:translate-x-4
```

### 14.6 Textarea

```
rounded-md border border-input bg-transparent
px-3 py-2 min-h-[60px]
focus-visible:ring-1 focus-visible:ring-ring
```

### 14.7 Secrets Field (Corellia-specific)

API keys and secrets need a redacted-by-default treatment. Match the
input shape but mask on render and require explicit reveal.

```tsx
<div className="relative">
  <input
    type={revealed ? "text" : "password"}
    className="
      bg-black/50 border border-rose-400/50
      text-gray-100 font-mono text-sm
      px-3 py-2 pr-10 rounded-md
      focus:border-rose-400 focus:outline-none
    "
  />
  <button
    aria-label={revealed ? "Hide secret" : "Reveal secret"}
    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-rose-400"
  >
    {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
</div>
```

Rose border (`border-rose-400/50`) signals "sensitive" without going full
red (which is reserved for destructive/error).

---

## 15. Cards & Containers

### shadcn/ui Card

```tsx
<Card>           {/* rounded-xl border bg-card text-card-foreground shadow */}
  <CardHeader>   {/* flex flex-col space-y-1.5 p-6 */}
    <CardTitle>  {/* font-semibold leading-none tracking-tight */}
    <CardDescription> {/* text-sm text-muted-foreground */}
  </CardHeader>
  <CardContent>  {/* p-6 pt-0 */}
  <CardFooter>   {/* flex items-center p-6 pt-0 */}
</Card>
```

Use shadcn cards for **public-facing** surfaces (sign-in, marketing, docs).
Use the **terminal container** (§16) for primary product surfaces (fleet
view, agent detail, catalog).

---

## 16. Terminal Container (signature)

The signature pattern. Square corners, 2px borders, title bar with
brackets.

```tsx
<div className="border-2 border-gray-600 bg-black/80 backdrop-blur-sm">
  {/* Title Bar */}
  <div className="border-b-2 border-gray-600 px-3 py-2">
    <div className="text-xs text-gray-500 tracking-wider uppercase font-mono">
      [ FLEET ]
    </div>
  </div>

  {/* Content */}
  <div className="px-4 py-4">
    {/* ... */}
  </div>
</div>
```

**Characteristics:**
- `border-2 border-gray-600` — 2px solid border
- `bg-black/80` — semi-transparent black fill
- `backdrop-blur-sm` — glassmorphic blur (4px)
- **No border-radius** — square corners are the terminal signature
- Title uses `[ BRACKET SYNTAX ]` in uppercase

**Corellia title conventions:**

```
[ FLEET ]                  Fleet view container
[ CATALOG ]                Harness catalog
[ AGENT // <name> ]        Agent detail page
[ ADAPTER // <name> ]      Adapter detail
[ DEPLOY TARGET // FLY ]   Deploy target detail
[ SECRETS ]                Per-agent secrets panel
[ SPAWN AGENT ]            Spawn flow container
[ AUDIT LOG ]              Audit log (post-v1)
```

The `//` separator denotes scope/identifier, mirroring the Hermes adapter
image ref convention (`<image>@sha256:<digest>`) — a structural marker
rather than decoration.

---

## 17. Glassmorphic Card

Used on **public-facing** pages (landing, docs, marketing).

```tsx
<div className="
  border border-white/10
  bg-gradient-to-br from-white/5 to-white/[0.02]
  backdrop-blur-xl
  hover:border-white/20
  transition-all
">
  {/* Optional header */}
  <div className="border-b border-white/10 px-4 py-3 bg-white/5">
    {/* ... */}
  </div>

  {/* Content */}
  <div className="p-6">
    {/* ... */}
  </div>
</div>
```

**Characteristics:**
- 1px border at 10% white opacity
- Subtle gradient fill (5% → 2% white)
- Extra blur (`backdrop-blur-xl`)
- Hover brightens border to 20%

---

## 18. Modals & Dialogs

```tsx
{/* Backdrop */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">

  {/* Modal */}
  <div className="
    relative w-full max-w-4xl max-h-[90vh] overflow-hidden
    border border-white/20
    bg-gradient-to-br from-black/95 to-black/90
    backdrop-blur-xl shadow-2xl
  ">

    {/* Sticky Header */}
    <div className="
      sticky top-0 z-10
      border-b border-white/10
      px-6 py-4
      bg-black/80 backdrop-blur-sm
      flex items-center justify-between
    ">
      <div className="text-xs text-gray-400 tracking-wider uppercase font-mono">
        Modal Title
      </div>
      <button
        aria-label="Close"
        className="
          p-2 text-gray-400
          hover:text-white hover:bg-white/10
          transition-all
          border border-white/10 hover:border-white/20
        "
      >
        <X size={18} />
      </button>
    </div>

    {/* Scrollable Body */}
    <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-6">
      {/* Content */}
    </div>
  </div>
</div>
```

**Backdrop CSS:**

```css
.modal-backdrop {
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.8);
}
```

---

## 19. Tables

Terminal-style tables with zebra striping. **Fleet view is the canonical
table consumer** in Corellia.

```tsx
<table className="w-full text-sm font-mono">
  <thead>
    <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
      <th className="px-3 py-2 text-left">Name</th>
      <th className="px-3 py-2 text-left">Status</th>
      <th className="px-3 py-2 text-left">Provider</th>
      <th className="px-3 py-2 text-left">Spawned</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-800 even:bg-white/[0.02] hover:bg-white/5 transition-colors">
      <td className="px-3 py-2 text-gray-300">alice-hermes-01</td>
      <td className="px-3 py-2">
        <span className="inline-flex items-center gap-2 text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          RUNNING
        </span>
      </td>
      <td className="px-3 py-2 text-gray-400">openrouter</td>
      <td className="px-3 py-2 text-gray-500">3m ago</td>
    </tr>
  </tbody>
</table>
```

**Corellia table rules:**
- Status column uses §21 status indicators (pulse dot + state label)
- Digests / IDs are Geist Mono, truncated with tooltip when needed
- Row click navigates to detail page (no separate "view" button column)
- Bulk-action affordances appear in the table's header bar (post-v1)

---

## 20. Tooltips & Popovers

```
rounded-md px-3 py-1.5 text-xs
animate-in fade-in-0 zoom-in-95
```

Use tooltips for full-string reveal of truncated digests, machine IDs,
timestamps. Use popovers for inline actions (e.g., "destroy this agent")
that warrant a confirmation step.

---

## 21. Status Indicators

### 21.1 Active Status

```tsx
<div className="text-sm text-gray-400 font-mono">
  <span className="text-green-500">&gt;</span> ACTIVE
</div>
```

### 21.2 Pulsing Dot

```tsx
<span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
```

### 21.3 Compiling / Spawning Status

```tsx
<div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
  SPAWNING
</div>
```

### 21.4 Corellia Agent Status Vocabulary

See §35 for the full lifecycle state mapping.

---

## 22. Progress Bars

```tsx
<div className="flex items-center gap-3">
  <div className="flex-1 h-2 bg-white/10 overflow-hidden backdrop-blur-sm">
    <div
      className="h-full bg-gradient-to-r from-green-400/60 to-green-500/40"
      style={{ width: '48%' }}
    />
  </div>
  <span className="text-gray-300 text-sm font-semibold font-mono">48%</span>
</div>
```

- Track: `bg-white/10` (subtle)
- Fill: green gradient (`from-green-400/60 to-green-500/40`)
- Label: monospace with percentage

For **spawn-N-agents** progress (the demo moment from blueprint §10),
use a determinate progress bar above the per-agent table; each row gets
its own pulse-dot status indicator.

---

## 23. Loading States

### 23.1 Spinner

```tsx
<div className="w-4 h-4 border-2 border-gray-700 border-t-green-500 rounded-full animate-spin" />
```

### 23.2 Full-Screen Loading

```tsx
<div className="min-h-screen px-4 py-8 flex items-center justify-center">
  <div className="border-2 border-gray-600 bg-black/80 backdrop-blur-sm px-6 py-4">
    <div className="flex items-center gap-3 text-sm font-mono">
      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-green-500">&gt;</span>
      <span className="text-gray-400">Loading fleet...</span>
    </div>
  </div>
</div>
```

---

## 24. Empty States

```tsx
<div className="border-2 border-gray-600 bg-black/80 backdrop-blur-sm">
  <div className="border-b-2 border-gray-600 px-3 py-2">
    <div className="text-xs text-gray-500 tracking-wider uppercase font-mono">
      [ FLEET ]
    </div>
  </div>
  <div className="px-4 py-4 text-xs font-mono space-y-2">
    <div className="text-gray-600">
      <span className="text-green-500">&gt;</span> No agents spawned yet.
    </div>
    <div className="text-gray-700 text-xs">
      Visit <span className="text-cyan-400">/catalog</span> to spawn your
      first agent from the Hermes harness.
    </div>
  </div>
</div>
```

**Corellia empty-state copy rules:**
- Lead with the state in declarative terms ("No agents spawned yet")
- Follow with a concrete next step (route + action), not generic
  encouragement
- No illustrations — the terminal aesthetic carries the tone
- Use feature color (`text-cyan-400` for catalog link) to reinforce
  navigation

---

## 25. Error States

```tsx
<div className="border-2 border-red-500/50 bg-black/80 backdrop-blur-sm px-6 py-6">
  <div className="space-y-3 text-sm font-mono">
    <div className="text-red-500">
      <span>&gt;</span> Failed to spawn agent
    </div>
    <div className="text-gray-500">{error.message}</div>
    <button className="
      px-4 py-2
      border-2 border-green-500 bg-green-500/10
      text-green-500 hover:bg-green-500/20
      transition-colors font-mono text-xs uppercase tracking-wider
    ">
      &gt; Retry
    </button>
  </div>
</div>
```

**Corellia error-state rules:**
- Surface the error message verbatim from the BE — never paraphrase
  ("network error" hides root cause); the admin persona wants signal
- Distinguish **operator errors** (config wrong, retry possible) from
  **system errors** (Fly outage, contact infra) via the action presented
- For deploy failures, link to the relevant Fly app in a follow-up line:
  `> Inspect: fly logs -a corellia-agent-<uuid>`

---

# Part V — Patterns

## 26. Navigation & Information Architecture

### 26.1 Corellia v1 Navigation Structure

Two groups, separated visually:

**Operations** (the working surfaces)
- Fleet
- Catalog
- Spawn

**Configuration** (the meta surfaces)
- Adapters
- Deploy Targets
- Secrets

**Post-v1 additions**
- Audit Log
- IAM
- Skills
- Memory

### 26.2 Active State Pattern

```tsx
{/* Active */}
className="text-{color} bg-{color}/10 border-b-2 border-{color}"

{/* Inactive */}
className="text-gray-400 hover:text-{color} transition-colors"
```

Each section uses its feature color from §5.4. The active state combines:
- Colored text (full-strength)
- 10% opacity background tint
- 2px bottom border in the section color

### 26.3 Nav Bar

```tsx
<header className="
  fixed top-0 left-0 right-0 z-50
  bg-black/80 backdrop-blur-sm
  border-b border-gray-900
">
  <div className="px-4 sm:px-8 py-4">
    {/* Logo + nav items */}
  </div>
</header>
```

### 26.4 Mobile

Hamburger menu at `md:` breakpoint (768px):

```tsx
{/* Desktop nav */}
<nav className="hidden md:flex items-center gap-8">{/* ... */}</nav>

{/* Mobile trigger */}
<button className="md:hidden" aria-label="Toggle menu">
  <Menu size={24} />
</button>
```

Corellia is admin-tooling — desktop is the primary target; mobile is
"check status while away from desk," not "spawn agents on the train."

---

## 27. Iconography & Symbols

### 27.1 Icon Library: Lucide React

All icons from [Lucide](https://lucide.dev/).

```tsx
<Icon size={18} className="text-gray-400 hover:text-gray-200 transition-colors" />
```

Rules:
- Consistent stroke width (Lucide defaults)
- Always pair with hover state
- Icon-only buttons must have `aria-label`

### 27.2 Brand Symbols

#### Green Chevron (`>`)

The universal Kamino brand indicator. Used before status text, button
labels, list items, empty-state messages.

```tsx
<span className="text-green-500">&gt;</span>
```

#### Square Brackets (`[ ]`)

Terminal title bar identifier. Always uppercase. Always Space Mono.

```
[ FLEET ]
[ CATALOG ]
[ AGENT // alice-hermes-01 ]
```

#### Status Dots

```tsx
{/* Active */}
<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />

{/* Inactive */}
<span className="w-2 h-2 bg-gray-600 rounded-full" />
```

#### Corellia-Specific Symbols

- **`@`** for content-addressed references — when displaying digests,
  always use the canonical `<image>@sha256:<digest>` shape; never split
- **`//`** as scope separator in titles (`[ AGENT // alice-hermes-01 ]`)
- **`#`** for IDs in compact contexts (`Agent #a8c3...`)

---

## 28. Animation & Motion

### 28.1 Principles

1. **Fast feedback** — UI transitions are 200ms
2. **Smooth ambient** — background animations are slow (5–60s)
3. **Ease-in-out everywhere** — the default easing curve
4. **Respect motion preferences** — complex animations should be
   disableable via `prefers-reduced-motion`

### 28.2 Transition Durations

| Duration | Use |
|----------|-----|
| 200ms | Button hovers, nav highlights, color transitions (most common) |
| 300ms | Rail/panel hover effects, layout transitions |
| 500ms | Node label changes, emphasis transitions |
| 700ms | Nebula pulses, ambient effects |

### 28.3 CSS Transitions

```css
/* Most common — color changes */
transition-colors duration-200

/* General UI feedback */
transition-all duration-200

/* Hover scale effects */
transition-transform duration-200

/* Fade effects */
transition-opacity duration-200
```

### 28.4 Framer Motion Patterns

```tsx
/* Standard entrance */
initial={{ opacity: 0, y: -20, scale: 0.8 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, scale: 0.8 }}
transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}

/* Staggered children */
transition={{ delay: index * 0.05 }}

/* Layout animations */
<AnimatePresence mode="popLayout">
```

For **fleet-row enter/exit** (agent spawned, agent destroyed), use
staggered entrance with 50ms per-row delay — the cascade reinforces
"systems coming online" without being showy.

### 28.5 CSS Keyframes

#### Typewriter (landing / sign-in hero)

```css
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: #f3f4f6; }
}

.typewriter {
  overflow: hidden;
  border-right: 3px solid #f3f4f6;
  white-space: nowrap;
  letter-spacing: 0.15em;
  animation:
    typing 3.5s steps(29, end) forwards,
    blink-caret 0.75s step-end 3.5s 3;
}
```

**Mobile**: typewriter disabled below 640px — text displays immediately
and wraps naturally.

#### Background Animations

```css
/* Starfield twinkle (6s cycle) */
@keyframes twinkleStars {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* Slow star twinkle variant */
@keyframes twinkleStarsSlow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}

/* Nebula drift (60s cycle) */
@keyframes driftNebula {
  0% { transform: translate(0, 0); }
  50% { transform: translate(30px, -20px); }
  100% { transform: translate(0, 0); }
}

/* Particle field twinkle (5s cycle) */
@keyframes twinkle {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

/* Schematic grid breathe (Corellia-specific, 8s cycle) */
@keyframes gridBreathe {
  0%, 100% { opacity: 0.04; }
  50%      { opacity: 0.07; }
}
```

#### Interactive Animations

```css
/* Spinner */
animate-spin     /* 1s linear infinite rotation */

/* Pulse (status dots) */
animate-pulse    /* 2s cubic-bezier(0.4, 0, 0.6, 1) infinite */
```

---

## 29. Backgrounds & Atmospherics

### 29.1 Particle Field (Dashboard / Fleet)

Simple white dots at very low opacity with gentle twinkle:

```css
.particle-field {
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
    radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.1) 1px, transparent 1px),
    /* 6+ more at varied positions */;
  background-size: 200px 200px, 300px 300px, 400px 400px;
  animation: twinkle 5s ease-in-out infinite;
}
```

### 29.2 Deep Space Starfield (Public Pages)

Multi-layered with nebulae + stars on fixed positioning (parallax):

```css
.deep-space-bg {
  background-color: #000000;
}

/* Layer 1: Nebula clouds */
.deep-space-bg::before {
  position: fixed;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(30, 60, 100, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(60, 30, 80, 0.02) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(20, 80, 60, 0.025) 0%, transparent 50%);
  animation: driftNebula 60s ease-in-out infinite;
}

/* Layer 2: Star points */
.deep-space-bg::after {
  position: fixed;
  background-image:
    radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 0.8) 0.5px, transparent 1px),
    radial-gradient(circle at 75% 15%, rgba(255, 255, 255, 0.7) 0.5px, transparent 1px),
    /* 18+ more stars */;
  animation: twinkleStars 6s ease-in-out infinite;
}
```

### 29.3 Schematic Grid (Corellia-specific)

A barely-visible engineering grid for **Catalog** and **Spawn** pages —
reinforces the spec-sheet / blueprint aesthetic without competing with
content.

```css
.schematic-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: gridBreathe 8s ease-in-out infinite;
}
```

Apply on `-z-10` so content sits cleanly above. Combine with the deep
space starfield for layered depth on hero sections.

### 29.4 Nebula Glow Effects

Layered radial gradients for ambient atmosphere:

```css
background:
  radial-gradient(ellipse at center,
    rgba(59, 130, 246, 0.12) 0%,
    rgba(59, 130, 246, 0.08) 30%,
    transparent 60%);
```

Color combos: blue `(59, 130, 246)`, cyan `(34, 211, 238)`, indigo
`(99, 102, 241)` at 5–15% opacity.

### 29.5 Per-Page Background Strategy

| Surface | Background |
|---------|-----------|
| Sign-in / public landing | Deep space starfield (§29.2) |
| Fleet view | Particle field (§29.1), faint |
| Catalog | Schematic grid (§29.3) |
| Agent detail | Particle field (§29.1) |
| Adapter / Deploy Target detail | Schematic grid (§29.3) |
| Spawn flow | Schematic grid (§29.3) + green nebula glow on the active step |
| Modals | None — modal backdrop blur is the entire effect |

---

## 30. Scrollbars

```css
/* Green scrollbar (default) */
.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(34, 197, 94, 0.3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 197, 94, 0.5);
}

/* Cyan scrollbar (catalog / discovery surfaces) */
.catalog-scrollbar {
  scrollbar-color: rgba(6, 182, 212, 0.3) rgba(39, 39, 42, 0.5);
  scrollbar-width: thin;
}

/* Thin gray scrollbar */
.scrollbar-thin {
  scrollbar-color: #4b5563 transparent;
  scrollbar-width: thin;
}

/* Hidden scrollbar (still scrollable) */
.scrollbar-hide { scrollbar-width: none; }
```

---

## 31. Responsive Design

### 31.1 Breakpoints

```
sm:   640px    Tablet portrait
md:   768px    Tablet landscape / small laptop
lg:  1024px    Desktop
xl:  1280px    Large desktop
2xl: 1536px    Extra-large desktop
```

### 31.2 Mobile-First Approach

```tsx
className="
  text-xl              /* Mobile */
  sm:text-2xl          /* Tablet */
  md:text-4xl          /* Desktop */
"
```

### 31.3 Common Responsive Patterns

```tsx
/* Navigation: hamburger below md */
<nav className="hidden md:flex items-center gap-8">{/* Desktop */}</nav>
<button className="md:hidden" aria-label="Toggle menu">{/* Mobile */}</button>

/* Padding */
className="px-4 py-8 sm:px-8 sm:py-12"

/* Grid columns */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

/* Typography scaling */
className="text-2xl tracking-tight sm:text-3xl sm:tracking-wide"
```

### 31.4 Mobile Rules

1. **Disable complex animations** below 640px (typewriter, particle
   field, schematic grid)
2. **Allow text wrapping** — remove `whitespace-nowrap`
3. **Touch targets** minimum 44px tall
4. **Horizontal scroll** for fleet / data tables on small screens
5. **Sidebar collapse** — sidebars become bottom sheets or hidden panels

---

## 32. Accessibility

### 32.1 Color Contrast (WCAG AA)

| Element | Color on Black | Ratio | Pass |
|---------|---------------|-------|------|
| Body text | `#9ca3af` | 4.95:1 | AA |
| Headings | `#f3f4f6` | 18.3:1 | AAA |
| Green accent | `#22c55e` | 7.8:1 | AAA |
| Cyan (catalog) | `#06b6d4` | 6.4:1 | AA |
| Violet (adapters) | `#a78bfa` | 7.1:1 | AAA |
| Rose (secrets) | `#fb7185` | 5.5:1 | AA |
| Muted text | `#6b7280` | 3.4:1 | AA Large |

When adding a new feature color, verify ratio ≥ 4.5:1 on `#000000`.

### 32.2 Focus States

Always visible. Never remove focus outlines without replacement.

```css
/* Button focus */
button:focus-visible {
  outline: 2px solid #22c55e;
  outline-offset: 2px;
}

/* Input focus */
input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

/* shadcn/ui ring */
focus-visible:ring-1 focus-visible:ring-ring
```

### 32.3 Keyboard Navigation

- **Tab order**: logical flow (top to bottom, left to right)
- **Escape**: closes modals
- **Enter / Space**: activates buttons
- **Arrow keys**: navigate within fleet table rows (post-v1 nice-to-have)

### 32.4 ARIA

```tsx
{/* Icon-only buttons */}
<button aria-label="Close"><X /></button>
<button aria-label="Toggle menu"><Menu /></button>
<button aria-label="Reveal secret"><Eye /></button>

{/* Status updates */}
<div role="status" aria-live="polite">
  Agent spawned successfully
</div>

{/* Destructive confirmations */}
<button aria-describedby="destroy-warning">Destroy</button>
```

### 32.5 Semantic HTML

Use `<header>`, `<nav>`, `<main>`, `<button>`. Avoid div-as-button.
Provide alt text for images. Use `sr-only` for visually hidden labels.

### 32.6 Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  .deep-space-bg::before,
  .deep-space-bg::after,
  .particle-field,
  .schematic-grid,
  .typewriter {
    animation: none;
  }
}
```

Status pulse dots and spinners remain animated even with reduced
motion — they convey functional state, not decoration.

---

# Part VI — Corellia-Specific

## 33. Page Motifs (per route)

Each Corellia route develops its own visual motif from the same design
vocabulary. Sister products do this for their domains (Parsec → orbital
mechanics, Photon → waveforms); Corellia's domain is **agent control
plane**, so the motifs lean toward spec sheets, status matrices, and
infrastructure topologies.

### 33.1 `/dashboard` — The Quiet Mission Control

- **Atmosphere**: particle field (faint) + deep space starfield
- **Motif**: minimal status board — agent count, last activity, recent
  audit events (post-v1)
- **Color**: green dominant (Agents); cyan accent for the catalog
  call-to-action
- **Hero**: a single terminal container with `[ STATUS ]` showing fleet
  health summary

### 33.2 `/agents` (Catalog) — Spec Sheets

- **Atmosphere**: schematic grid background (§29.3)
- **Motif**: each harness rendered as an **engineering datasheet** —
  name, version, upstream digest (Geist Mono), adapter image ref,
  resource footprint, supported tools, "Coming soon" stubs grayed out
  per blueprint §10
- **Color**: cyan dominant (Catalog feature color); green accent on the
  active "Spawn" CTA
- **Layout**: card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
  where each card is a terminal container with `[ HARNESS // hermes ]`
- **Notable detail**: the digest is always **fully visible**, never
  truncated — this is governance signaling (blueprint §11.2 "pin by
  digest, never by mutable tag" rendered visually)

### 33.3 `/fleet` — The Status Matrix

- **Atmosphere**: particle field (faint)
- **Motif**: tabular status board — one row per AgentInstance with
  pulsing status dots (§35), last-activity timestamps, model provider,
  deploy target
- **Color**: green dominant (Agents); status colors per row state
- **Layout**: full-width terminal container `[ FLEET ]`, table inside
- **Demo moment** (blueprint §10): "Spawn N" action shows the table fill
  in real-time as each Fly app boots — staggered row entrance, per-row
  pulse-dot transition from "PENDING" → "SPAWNING" → "RUNNING"

### 33.4 `/agent/[id]` — Telemetry Panel

- **Atmosphere**: particle field
- **Motif**: HUD-style readout — the agent's name, status, model, deploy
  target, secrets count, last activity, log tail (post-v1: live tail)
- **Color**: green dominant (Agent entity); rose accent on the secrets
  panel; blue accent on the deploy target ref
- **Layout**: stacked terminal containers — `[ AGENT // <name> ]`,
  `[ CONFIG ]`, `[ SECRETS ]`, `[ DEPLOY TARGET // FLY ]`, `[ LOGS ]`

### 33.5 `/spawn` — RPG Character Creation (the showcase)

The spawn surface is **a single wizard mounted at two URLs**:

- **`/spawn`** — wizard in *gallery mode*. Step 1 is a horizontal
  scroll-snap **harness carousel** (`<HarnessCarousel>`); Steps 2–5 are
  visible as `opacity-40 inert` shells (`PENDING` meta tag) so the
  operator sees the full shape of the flow before selecting a harness.
- **`/spawn/[templateId]`** — wizard in *confirmed mode*. Step 1 is
  pre-confirmed and renders as a compact horizontal card (~56 px avatar
  + name + spec rows); Step 2 is active. Bookmark-friendly entry point.

Both URLs mount the same client `<Wizard>` component — `getInitialState(mode)`
is the single factory that decides which step is current and which are
confirmed. There is **no separate roster page**. Selecting a harness
from the gallery routes to the per-template URL via `router.replace`,
which remounts the wizard in confirmed mode (history-clean, no
back-button trap).

**One `<canvas>` page-wide, always.** The carousel's nebula is a
fixed `position: absolute` overlay anchored to the scroll container's
wrapper div — never inside a slide — so swipe gestures cause no canvas
remounts. Every slide renders the static SVG fallback
(`<AvatarFallback>`); the canvas overlays whichever slide is centred.
Inside the wizard, Steps 2 and 5 each mount their own
`<NebulaAvatar>` (64 px preview beside the callsign input; 180 px
portrait on the review character sheet); these are sequenced — Step
1's gallery canvas unmounts before Step 2's preview mounts, and Step
5's portrait mounts only on the review screen — so exactly one
`<canvas>` is live at any moment across the wizard's lifetime.

**Palette + accent transitions.** Swiping between harnesses lerps the
nebula's palette uniforms toward the new harness's `MoodPalette`
inside the existing `useFrame` loop (`α = 1 - exp(-dt * 8)` —
frame-rate-independent, ~87 ms half-life, ~400 ms to visual
convergence). Shape stays shared across harnesses; only palette,
intensities, frequencies, and spatial weights shift. This honours
agents-ui-mods.md decision 5: shape says "this is a Corellia-spawnable
harness," palette says which one.

**Vocabulary.** Gallery header reads `[ SELECT YOUR HARNESS ]`;
confirmed-mode header reverts to `[ LAUNCHPAD // CONFIGURE ]`. Locked
slides render a `[ LOCKED ]` overlay + `disabled` SELECT button (not
hidden) — visible per blueprint §11.4 (deferred features stub as real
interface implementations).

### 33.6 `/adapters/[id]` — Docker Schematic

- **Atmosphere**: schematic grid
- **Motif**: visualise the adapter as a **layered Docker schematic** —
  upstream image (with its digest) → adapter overlay (entrypoint shim) →
  final adapter image ref (with its own digest); both digests rendered
  in Geist Mono
- **Color**: violet dominant (Adapters)
- **Notable detail**: the M3 milestone is what made this real — the
  digest pinning is enforced at the DB layer; the page should make that
  visual: "this adapter pins this upstream by digest"

### 33.7 `/deploy-targets/[id]` — Infrastructure Topology

- **Atmosphere**: schematic grid
- **Motif**: a topology diagram of the deploy target — "Fly.io" shows
  org, regions, app count; AWS/Local stubs show "Coming soon" panels
  (blueprint §11.4 — real interface implementations, not fake buttons)
- **Color**: blue dominant (Deploy Targets)

### 33.8 `/audit` (post-v1) — Chronological Stream

- **Atmosphere**: particle field
- **Motif**: reverse-chronological event log; each event rendered in
  monospace as `[timestamp] [actor] [action] [target]`
- **Color**: emerald dominant (Audit)

### 33.9 `/iam` (post-v1) — Permission Matrix

- **Atmosphere**: schematic grid
- **Motif**: actor × resource grid; cells filled with permission glyphs
- **Color**: amber dominant (IAM)

### 33.10 `/settings/tools` — Org Tool Curation (v1.5 Pillar B Phase 6)

The first surface in the **org-settings family** — operator-facing
admin knobs that shape what other operators in the workspace can do.
Org-admin gated; non-admins see a `[ ADMIN ONLY ]` failed-accent
terminal with a "ask an admin" hint instead of the catalog grid.

- **Atmosphere**: grid background (default app chrome)
- **Motif**: a single section per harness adapter, framed as
  `[ HARNESS <adapter_version> ]` (`accent="tools"` — amber, the
  feature color introduced in 0.13.3 for the spawn-wizard TOOLS
  step). Inside, one row per toolset with display name, category
  pill, scope-shape preview (read-only — `scope: url_allowlist ·
  command_allowlist`), and required-credential hint.
- **Color**: amber dominant (Tools); failed-red on the admin-only
  guard.
- **Toggle vocabulary**: per-row `[ ✓ ENABLED ]` / `[ DISABLED ]`
  Button — `default` variant when enabled, `outline` when disabled.
  Mid-flight saves render `[ … SAVING ]`. OAuth-only toolsets render
  a disabled toggle plus a `lock-icon · OAUTH · v1.6` chip rather
  than a fake clickable affordance (blueprint §11.4).
- **Save model**: optimistic UI + per-tool single-flight latch. Toggle
  reflects locally on click, fires `setOrgToolCuration`, rolls back
  with a sonner error toast on failure. No "save" button — every
  toggle is its own commit, mirroring how org-curation rows are
  individually addressable on the BE.
- **Discovery**: the catalog scope is per-harness-adapter. The page
  derives the in-org adapter set from `listAgentTemplates` (each
  template carries `harnessAdapterId`); v1.5 ships one Hermes adapter
  so the usual case is a single section. When v2 introduces a second
  adapter, the page will render two sections without code change.
- **Wiring back to /spawn**: disabled toolsets are filtered out of the
  spawn wizard's TOOLS step (Phase 4 already wires the
  `enabledForOrg` filter at the row level). Locked-row rendering on
  /spawn is reserved for OAuth-only toolsets — org-curated-out rows
  are hidden entirely (no "why can't I equip this?" UX gap).
- **Sidebar surface**: a top-level `Tools` entry appears in the
  `[ MODULES ]` group only when `useUser().user.role === "admin"`.
  Non-admins navigating directly to `/settings/tools` see the
  `[ ADMIN ONLY ]` notice; the BE's `SetOrgToolCuration` handler is
  the actual security boundary (`PermissionDenied` for non-admin
  callers).

---

## 34. The RPG Character Creation Flow

Blueprint §10 names the spawn flow "RPG character creation." The visual
treatment should reinforce this — building a thing with intent, not
filling out a form.

### 34.1 Structure

Six steps, each in its own terminal container, only one active at a
time. The shipped step list (per `agents-ui-mods.md` decision 19 +
v1.5 Pillar B Phase 4) collapses provider + key + model into a single
`MODEL` panel, inserts a `TOOLS` panel for per-toolset equipping +
scope capture, and ends with a deployment-posture step that absorbs
M5's knobs:

```
[ STEP 1 // HARNESS ]        ── catalog cyan accent
[ STEP 2 // IDENTITY ]       ── secrets pink accent
[ STEP 3 // MODEL ]          ── adapter violet accent
[ STEP 4 // TOOLS ]          ── tools amber accent (`--feature-tools`)
[ STEP 5 // DEPLOYMENT ]     ── deploy blue accent
[ STEP 6 // REVIEW ]         ── running green primary CTA
```

The active step's container glows with the step's accent color via the
shadow pattern from §9. Inactive-but-confirmed steps stay at full
opacity with a ghost `[ EDIT ]` button; pending steps render at
`opacity-40 pointer-events-none` — visually present but not yet
reachable. Each step also surfaces an `ACTIVE` / `CONFIRMED` /
`PENDING` text tag in its `meta` slot so state is scannable without
relying on color alone.

### 34.2 Acknowledgement Pattern

Each step ends with a "ready" acknowledgement before the next step
unlocks — a deliberately tactile feel, mirroring mission-prep
checklists:

```tsx
<button className="
  px-4 py-2
  text-xs font-semibold tracking-wider uppercase
  bg-{step-color}-700 hover:bg-{step-color}-600
  text-white border border-{step-color}-600
  transition-all font-mono
">
  > Confirm
</button>
```

### 34.3 Final Step — Deploy

The "Deploy" CTA should feel like committing to launch. Use the primary
green button at large size with the chevron and a "READY TO LAUNCH"
gating label:

```tsx
<div className="border-2 border-green-500 bg-green-500/5 p-6">
  <div className="text-xs text-green-500 tracking-wider uppercase font-mono mb-3">
    READY TO LAUNCH
  </div>
  <button className="
    w-full px-6 py-3
    text-sm font-semibold tracking-widest uppercase
    bg-green-700 hover:bg-green-600
    text-white border-2 border-green-500
    transition-all font-mono
    shadow-[0_0_24px_rgba(34,197,94,0.25)]
  ">
    > Deploy Agent
  </button>
</div>
```

After click, the wizard chrome unmounts and is replaced by a fixed-
height streaming-log panel. v1 ships **synthesized** lines — a
client-side `setInterval` at 600 ms emitting four decorative steps
(`creating fly app… / setting secrets… / launching machine… / awaiting
health-check…`) while the `spawnAgent` RPC fires in parallel. Real
per-step BE events arrive in M5+ via streaming RPCs; until then the
log is informational, not load-bearing for the redirect. On RPC
success: redirect to **`/fleet`** (matches M4 behavior — the new agent
appears in the fleet table as it transitions `pending → running`). On
RPC error: the log flips to its `failed` accent, appends `› error:
<message>`, and offers `› BACK TO REVIEW` which re-mounts the wizard
with all six steps still confirmed and editable.

### 34.4 Spawn-N (deferred)

Blueprint §10's "Deploy N" demo moment is **not** part of the v1
wizard — `agents-ui-mods.md` decision 11 carved single-spawn-only.
`spawnNAgents` stays on the wire (M4 already shipped it) but is
unreached from this UI. If a fan-out shortcut is needed it returns
later as a fleet-page action (e.g. "duplicate this agent ×N"),
composing with M5's bulk-apply pattern rather than as a wizard
variant.

### 34.5 Gallery a11y contract

The Step 1 carousel is the only added kinetic surface in the wizard;
its accessibility contract is explicit so the kinetics never become a
keyboard or assistive-tech tax.

**Keyboard (carousel container, `tabIndex=0`):**

| Key | Action |
|-----|--------|
| `←` / `→` | Move ±1 slide |
| `Home` / `End` | Jump to first / last slide |
| `1`–`6` | Jump to slide by ordinal |
| `Tab` | `[prev arrow] → [scroll container] → [active SELECT button] → [next arrow]` |

Non-active SELECT buttons are `tabIndex=-1` so the Tab order through
the carousel is always exactly one button. Dot indicators are
decorative (`aria-hidden`, `tabIndex=-1`) — the arrow buttons + arrow
keys cover keyboard navigation redundantly.

**Roles + labels:**

- Outer: `<section role="region" aria-label="Select your harness">`.
- Each slide: `role="group" aria-roledescription="harness"`; the
  centred slide carries `aria-current="true"`.
- Locked slides: `aria-disabled="true"` on the SELECT button so AT
  announces "Locked — coming soon" rather than a dead control.

**`prefers-reduced-motion: reduce`** collapses the carousel to a
`grid-cols-1 md:grid-cols-2 xl:grid-cols-3` static grid of all six
harness slides. The nebula overlay is not mounted in this mode — the
canvas is the only motion surface, and reduced-motion users see
`<AvatarFallback>` everywhere. Palette transitions are therefore moot
under reduced motion (no canvas to lerp); this is the floor.

**WebGL ceiling.** When `WebGL2RenderingContext` is unavailable, the
nebula cascade in `<NebulaAvatar>` drops to `<AvatarFallback>` at all
sizes (gallery overlay, Step 2 preview, Step 5 portrait). The wizard
remains fully functional; the visual loses the live shimmer. No
fallback for the carousel itself — `scroll-snap` and
`IntersectionObserver` are universally available in supported
browsers.

---

## 35. Status Vocabulary for Agents

Mapping from `AgentInstance.status` (DB column) to visual treatment.

| DB Status | Label | Color | Dot |
|-----------|-------|-------|-----|
| `pending` | `PENDING` | `gray-500` | static gray dot |
| `spawning` (transient) | `SPAWNING` | `green-400` | pulsing green dot |
| `running` | `RUNNING` | `green-400` | pulsing green dot |
| `stopped` | `STOPPED` | `gray-400` | static gray dot |
| `failed` | `FAILED` | `red-500` | static red dot |
| `destroyed` | `DESTROYED` | `gray-600` | empty hollow circle |

```tsx
{/* Running */}
<span className="inline-flex items-center gap-2 text-green-400 font-mono text-xs uppercase tracking-wider">
  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
  Running
</span>

{/* Failed */}
<span className="inline-flex items-center gap-2 text-red-500 font-mono text-xs uppercase tracking-wider">
  <span className="w-2 h-2 bg-red-500 rounded-full" />
  Failed
</span>

{/* Destroyed */}
<span className="inline-flex items-center gap-2 text-gray-600 font-mono text-xs uppercase tracking-wider">
  <span className="w-2 h-2 border border-gray-600 rounded-full" />
  Destroyed
</span>
```

The pulse animation is reserved for **transitional** and **active live**
states (`spawning`, `running`) — terminal states (`stopped`, `failed`,
`destroyed`) are static. The animation itself is informational: motion
means "this thing is alive."

---

# Part VII — Adoption

## 36. Quick-Start Checklist

For new Corellia FE pages or sister-product pages adopting this system:

- [ ] Install fonts: Geist Sans, Geist Mono, Space Mono (via
  `next/font/google`)
- [ ] Copy CSS custom properties from §12 into `globals.css`
- [ ] Install shadcn/ui with `style: "new-york"`,
  `baseColor: "neutral"`, `cssVariables: true`
- [ ] Copy scrollbar classes (`.custom-scrollbar`, `.catalog-scrollbar`,
  `.scrollbar-thin`, `.scrollbar-hide`)
- [ ] Copy `.modal-backdrop`, `.particle-field`, `.deep-space-bg`,
  `.schematic-grid` classes
- [ ] Apply terminal container pattern (§16) for primary panels;
  `[ BRACKET HEADERS ]` always uppercase Space Mono
- [ ] Apply correct feature color (§5.4) per route — Agents=green,
  Catalog=cyan, Adapters=violet, Deploy Targets=blue, Secrets=rose
- [ ] Use green `#22c55e` for primary CTAs, focus rings, chevrons,
  active states, brand accents
- [ ] All uppercase labels use `tracking-wider` and `font-mono`
  (Space Mono)
- [ ] Digests / IDs render in Geist Mono, full string visible
- [ ] Status indicators use the pulse-dot pattern (§35) — pulse for
  active/transitional, static for terminal states
- [ ] Test WCAG AA contrast (≥ 4.5:1 on `#000000`) for all text
- [ ] Implement responsive nav with `md:` breakpoint hamburger
- [ ] Apply `prefers-reduced-motion` overrides for atmospheric
  animations

---

## 37. Anti-Patterns

Things to actively avoid:

- **Bright/saturated backgrounds** — backgrounds are always black /
  near-black; color comes from text and borders
- **Rounded terminal containers** — terminal boxes are always
  square-cornered; only shadcn/ui components use border-radius
- **Serif fonts** — never; the aesthetic is strictly mono + geometric
  sans
- **Heavy shadows** — depth comes from background tiers and borders, not
  drop shadows
- **Color as background fill at full strength** — feature colors at low
  opacity (`/10`, `/20`) for backgrounds; full-strength color is for
  text and borders only
- **Decorative animation** — every animation must serve a purpose
  (feedback, status, ambient atmosphere)
- **Truncating digests in primary surfaces** — full digest visible in
  detail pages; truncate only in space-constrained tables (with
  tooltip)
- **Generic "tech" imagery** — no abstract "AI brain" graphics, no
  glowing orbs, no neon circuit-board patterns; use schematic / topology
  / spec-sheet vocabulary instead
- **Cheerful empty states** — no emoji, no illustrated mascots, no
  "Great job!" success messages; the terminal aesthetic carries the
  tone with declarative state + concrete next step
- **Loading spinners as the primary loading state** for slow operations
  — use a streaming log of what's happening (mission-control framing:
  the operator sees what the system is doing, not just that it's busy)
- **Form fields without monospace digests / IDs** — anything
  byte-significant must be Geist Mono so it visually distinguishes from
  display text
- **Inventing new colors** — pick from the Tailwind 400/500 palette;
  check it doesn't collide with existing Corellia or sister-product
  feature colors
- **Faking deferred features with disabled buttons** — blueprint §11.4
  applies to UI too: "Coming soon" stubs are real grayed-out cards with
  the same shape as live ones, not disabled buttons

---

*This document supersedes the now-retired `design-direction.md` and
`design-refs.md`. Updates land here.*
