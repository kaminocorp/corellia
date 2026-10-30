// Package prompt builds the system prompt shared by the cloud runtimes:
// who the agent is, how to speak for a voice display, how to put visuals
// on screen through show_ui, the component catalog, memory and screen
// state. Runtimes own only the wire format.
package prompt

import (
	"strings"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

// Options tunes the prompt.
type Options struct {
	// IncludeShowUI adds the spec-op instructions (false for runtimes that
	// cannot call tools).
	IncludeShowUI bool
}

// System renders the stable part of the system prompt: identity, speaking
// style, the show_ui instructions, the catalog and the memory summary. It
// changes only when memory does, so a provider can cache it across turns.
// What changes every turn (the screen state, the clock) is TurnContext;
// a runtime that caches puts that next to the user's message, after the
// cached prefix, and one that cannot appends it to the system prompt.
func System(ctx runtime.Context, o Options) string {
	name := ctx.AgentName
	if name == "" {
		name = "Corellia"
	}
	var b strings.Builder
	b.WriteString("You are " + name + ", a personal assistant living on an always-on display in the user's office. ")
	b.WriteString("The user talks to you by voice or keyboard; your replies are spoken aloud through speakers and may also be shown as visuals.\n\n")
	b.WriteString("Speaking style:\n")
	b.WriteString("- Short, natural sentences a person would say out loud. Usually one to three sentences.\n")
	b.WriteString("- No markdown, bullet lists, headings or code in spoken text. Numbers and times as you would say them.\n")
	b.WriteString("- Do not describe visuals you show; just show them and say the one thing that matters.\n")
	b.WriteString("- If you need to do something with side effects (reminders, directions, deleting a memory), call the tool; it will ask the user to confirm. Tell the user it needs their confirmation.\n")
	b.WriteString("- Use tools for facts you do not know (time, weather, places). Never invent them.\n\n")
	if o.IncludeShowUI {
		b.WriteString(showUIInstructions)
		if ctx.CatalogDescription != "" {
			b.WriteString("\n")
			b.WriteString(ctx.CatalogDescription)
			b.WriteString("\n")
		}
	}
	if ctx.MemorySummary != "" {
		b.WriteString("\nWhat you remember about the user:\n")
		b.WriteString(ctx.MemorySummary)
		b.WriteString("\n")
	}
	return b.String()
}

// TurnContext renders what is true for this turn only: what is on screen
// and the current date and time, in the clock's zone (ctx.Now; the session
// sets it from CORELLIA_TZ). Kept out of System so the cached prefix does
// not change every minute (review 2026-10-30 round 4).
func TurnContext(ctx runtime.Context) string {
	var b strings.Builder
	if ctx.ScreenSummary != "" {
		b.WriteString("Currently on screen: " + ctx.ScreenSummary + "\n")
	}
	now := time.Now
	if ctx.Now != nil {
		now = ctx.Now
	}
	b.WriteString("Current date and time: " + now().Format("Monday 2 January 2006, 15:04 (MST)") + "\n")
	return b.String()
}

// Full is System followed by TurnContext, for runtimes without prompt
// caching that send one system string.
func Full(ctx runtime.Context, o Options) string {
	return System(ctx, o) + "\n" + TurnContext(ctx)
}

const showUIInstructions = `Visuals:
When something is better seen than heard (a place, a list, numbers, a schedule, a comparison, a chart), call the show_ui tool with a list of spec ops that assemble components from the catalog below. Rules:
- Ops run in order. Start with {"op":"clear"} when replacing what is on screen. End with {"op":"done"}.
- {"op":"add_node","id":"<id>","node":{"type":"<Component>","props":{...},"slots":{"<slot>":["<childId>", ...]}}} adds a node. Ids are short letters/digits. Add parents before children is fine; every referenced child must exist by the end.
- {"op":"set_data","value":{...}} stores data; a prop may be {"bind":"$.path.to.value"} instead of a literal (only for props marked bindable). Prefer literals for small values.
- {"op":"set_root","id":"<id>"} chooses the root. A root of type Overlay floats as a small glance card; Card/Stack/Grid/Split roots take a panel or the full screen.
- Keep it small: at most a dozen nodes, props that match the schema exactly, no extra props. Use "ttl_ms" on a node for things that should fade (for example 30000 for a clock).
- Markdown is the only component that takes prose; keep prose short.
`
