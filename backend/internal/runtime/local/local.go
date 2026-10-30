// Package local is a deterministic, keyless AgentRuntime used for all
// development and tests. It recognises a handful of intents and answers
// with streamed text plus valid spec ops, exercising every event kind the
// session handles. It is the fallback when no cloud runtime is configured.
package local

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
)

// Runtime is the local scripted runtime.
type Runtime struct {
	// Delay between streamed text chunks. Zero in tests.
	Delay time.Duration
	// Now is the wall clock; defaults to time.Now.
	Now func() time.Time
}

// New returns a local runtime with a short streaming delay so the client
// visibly streams.
func New() *Runtime { return &Runtime{Delay: 25 * time.Millisecond} }

func (r *Runtime) Name() string { return "local" }

func (r *Runtime) Capabilities() runtime.Capabilities {
	return runtime.Capabilities{Streaming: true, UIOps: true, Tools: true, Cancel: true}
}

func (r *Runtime) now(t runtime.Turn) time.Time {
	if t.Context.Now != nil {
		return t.Context.Now()
	}
	if r.Now != nil {
		return r.Now()
	}
	return time.Now()
}

// Start answers the turn on a goroutine.
func (r *Runtime) Start(ctx context.Context, turn runtime.Turn) (<-chan runtime.Event, error) {
	out := make(chan runtime.Event, 64)
	go func() {
		defer close(out)
		e := &emitter{ctx: ctx, out: out, delay: r.Delay}
		r.answer(ctx, e, turn)
		if ctx.Err() == nil {
			e.send(runtime.Event{Kind: runtime.EventDone})
		}
	}()
	return out, nil
}

// emitter serialises sends and respects cancellation.
type emitter struct {
	ctx   context.Context
	out   chan<- runtime.Event
	delay time.Duration
	n     int
}

func (e *emitter) send(ev runtime.Event) bool {
	select {
	case <-e.ctx.Done():
		return false
	case e.out <- ev:
		return true
	}
}

func (e *emitter) text(s string) bool {
	words := strings.SplitAfter(s, " ")
	for _, w := range words {
		if w == "" {
			continue
		}
		if !e.send(runtime.Event{Kind: runtime.EventTextDelta, Text: w}) {
			return false
		}
		if e.delay > 0 {
			select {
			case <-e.ctx.Done():
				return false
			case <-time.After(e.delay):
			}
		}
	}
	return true
}

func (e *emitter) op(v any) bool {
	raw, err := json.Marshal(v)
	if err != nil {
		return e.send(runtime.Event{Kind: runtime.EventError, Err: err})
	}
	return e.send(runtime.Event{Kind: runtime.EventSpecOp, Op: raw})
}

func (e *emitter) ops(vs ...any) bool {
	for _, v := range vs {
		if !e.op(v) {
			return false
		}
	}
	return true
}

func (e *emitter) nextID(prefix string) string {
	e.n++
	return fmt.Sprintf("%s%d", prefix, e.n)
}

type m = map[string]any

func node(typ string, props m, extra ...m) m {
	n := m{"type": typ, "props": props}
	for _, x := range extra {
		for k, v := range x {
			n[k] = v
		}
	}
	return n
}

func bind(path string) m { return m{"bind": path} }

// answer routes the turn to a scenario.
func (r *Runtime) answer(ctx context.Context, e *emitter, turn runtime.Turn) {
	text := strings.ToLower(strings.TrimSpace(turn.Text))
	switch {
	case text == "":
		e.text("I did not catch that.")
	case strings.Contains(text, "clear") || strings.Contains(text, "dismiss"):
		e.op(m{"op": "clear"})
		e.text("Cleared.")
	// Whole words only: "hey" is inside "they" and "hi" inside "sushi"
	// (review 2026-10-30 round 4).
	case greetRe.MatchString(text):
		e.text(fmt.Sprintf("Hello. I'm %s, running on the local runtime. Ask me the time, for a map of a city, a table, a chart, or your schedule.", name(turn)))
	case hasAny(text, "what time", "the time", "what's the time", "time is it"):
		r.timeScenario(ctx, e, turn)
	// The specific subjects come before the map: "show me a table" is a
	// table, not Lisbon (review 2026-10-30 round 3).
	case hasAny(text, "table", "inventory", "stock"):
		r.tableScenario(e)
	case hasAny(text, "chart", "trend", "graph", "temperature this week"):
		r.chartScenario(e)
	case hasAny(text, "remind me", "reminder"):
		r.reminderScenario(e, turn)
	// Weather before the schedule: "what's the weather today" is weather,
	// not the day's agenda (review 2026-10-30 round 4).
	case hasAny(text, "weather"):
		r.weatherScenario(e, turn, text)
	case hasAny(text, "schedule", "today", "calendar", "agenda"):
		r.scheduleScenario(e, turn)
	case hasAny(text, "map of", "where is", "show me ", "directions"):
		r.mapScenario(e, text)
	case hasAny(text, "simulate a failure", "fail on purpose"):
		// What a broken turn looks like, without a cloud runtime: a partial
		// reply, then a fatal error. The session turns it into a spoken
		// apology, a status card and a `session_error` event; the browser
		// smoke test drives this to prove the header stays online.
		e.text("Let me try that. ")
		e.send(runtime.Event{Kind: runtime.EventError, Err: errSimulated, Fatal: true})
	default:
		e.text(fmt.Sprintf("I heard: \"%s\". The local runtime only knows a few scripted replies; connect a cloud runtime for real answers.", strings.TrimSpace(turn.Text)))
	}
}

// errSimulated is the local runtime's on-demand failure.
var errSimulated = errors.New("simulated failure (local demo): the user asked for one")

func name(t runtime.Turn) string {
	if t.Context.AgentName != "" {
		return t.Context.AgentName
	}
	return "Corellia"
}

var greetRe = regexp.MustCompile(`\b(hello|hi|hey|good morning|good evening)\b`)

// futureRe matches a weather question about a time the demo cannot answer
// (the local runtime has current conditions only).
var futureRe = regexp.MustCompile(`\b(tomorrow|tonight|this week|next week|weekend|forecast|later|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b`)

func hasAny(s string, subs ...string) bool {
	for _, sub := range subs {
		if strings.Contains(s, sub) {
			return true
		}
	}
	return false
}

func (r *Runtime) timeScenario(ctx context.Context, e *emitter, turn runtime.Turn) {
	now := r.now(turn)
	callID := e.nextID("call")
	e.send(runtime.Event{Kind: runtime.EventToolCall, CallID: callID, Tool: "get_time", Args: m{}})
	content := now.Format("15:04 on Monday 2 January 2006")
	if turn.Context.Tools != nil {
		if res, err := turn.Context.Tools.Call(ctx, "get_time", m{}); err == nil && res.Content != "" {
			content = res.Content
		}
	}
	e.send(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: "get_time", Result: &runtime.ToolResult{Content: content}})
	e.ops(
		m{"op": "clear"},
		m{"op": "set_data", "value": m{"clock": m{"time": now.Format("15:04"), "date": now.Format("Mon 2 Jan")}}},
		m{"op": "add_node", "id": "glance", "node": node("Overlay", m{"position": "top_right"}, m{"slots": m{"content": []string{"clock"}}})},
		m{"op": "add_node", "id": "clock", "node": node("Stat", m{"label": bind("$.clock.date"), "value": bind("$.clock.time")}, m{"ttl_ms": 30000})},
		m{"op": "set_root", "id": "glance"},
		m{"op": "done"},
	)
	e.text(fmt.Sprintf("It's %s.", content))
}

var gazetteer = map[string][2]float64{
	"lisbon": {38.7223, -9.1393}, "singapore": {1.3521, 103.8198}, "berlin": {52.52, 13.405},
	"london": {51.5074, -0.1278}, "tokyo": {35.6762, 139.6503}, "new york": {40.7128, -74.006},
	"paris": {48.8566, 2.3522}, "porto": {41.1579, -8.6291}, "madrid": {40.4168, -3.7038},
	"amsterdam": {52.3676, 4.9041}, "zurich": {47.3769, 8.5417}, "sydney": {-33.8688, 151.2093},
}

// knownPlace finds a gazetteer city in the text.
func knownPlace(text string) (string, [2]float64, bool) {
	for key, c := range gazetteer {
		if strings.Contains(text, key) {
			return strings.ToUpper(key[:1]) + key[1:], c, true
		}
	}
	return "", [2]float64{}, false
}

func (r *Runtime) mapScenario(e *emitter, text string) {
	place, coords, known := knownPlace(text)
	if !known {
		place, coords = "Lisbon", gazetteer["lisbon"]
	}
	e.ops(
		m{"op": "clear"},
		m{"op": "set_data", "value": m{"place": m{"name": place, "coords": []float64{coords[0], coords[1]}}}},
		m{"op": "add_node", "id": "split", "node": node("Split", m{"ratio": 0.62}, m{"slots": m{"left": []string{"map"}, "right": []string{"card"}}})},
		m{"op": "add_node", "id": "map", "node": node("Map", m{"center": bind("$.place.coords"), "zoom": 11, "markers": []m{{"position": []float64{coords[0], coords[1]}, "label": place}}})},
		m{"op": "add_node", "id": "card", "node": node("Card", m{"title": bind("$.place.name"), "subtitle": "From the local gazetteer", "accent": "cyan"},
			m{"slots": m{"body": []string{"text"}}, "actions": m{"primary": m{"id": "nav", "label": "Navigate"}}})},
		m{"op": "add_node", "id": "text", "node": node("Markdown", m{"text": fmt.Sprintf("**%s** at %.4f, %.4f.\n\nSay *clear* to dismiss.", place, coords[0], coords[1])})},
		m{"op": "set_action", "id": "nav", "action": m{"kind": "propose", "tool": "open_directions", "args": m{"to": bind("$.place.coords")}, "risk": "low"}},
		m{"op": "set_root", "id": "split"},
		m{"op": "done"},
	)
	switch {
	case known:
		e.text(fmt.Sprintf("Here's %s on the map.", place))
	case strings.Contains(text, "directions"):
		// "directions to the airport": the demo cannot route to a place it
		// does not know; say so instead of announcing Lisbon as the answer
		// (review 2026-10-30 round 4).
		e.text("I don't know that place on the local runtime. Here's Lisbon on the map; Navigate proposes directions to it.")
	default:
		e.text("I don't know that place on the local runtime, so here's Lisbon on the map.")
	}
}

func (r *Runtime) tableScenario(e *emitter) {
	e.ops(
		m{"op": "clear"},
		m{"op": "add_node", "id": "card", "node": node("Card", m{"title": "Workshop stock", "accent": "amber"}, m{"slots": m{"body": []string{"table"}}})},
		m{"op": "add_node", "id": "table", "node": node("Table", m{
			"columns": []m{{"key": "item", "label": "Item"}, {"key": "qty", "label": "Qty", "align": "right"}, {"key": "status", "label": "Status"}},
			"rows":    bind("$.stock"),
		})},
		m{"op": "set_data", "value": m{"stock": []m{
			{"item": "M4 bolts", "qty": 120, "status": "ok"},
			{"item": "Filament PLA", "qty": 3, "status": "low"},
			{"item": "Solder", "qty": 1, "status": "reorder"},
		}}},
		m{"op": "set_root", "id": "card"},
		m{"op": "done"},
	)
	e.text("Here's the stock table. Filament is running low.")
}

func (r *Runtime) chartScenario(e *emitter) {
	pts := []m{}
	for i, d := range []string{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"} {
		pts = append(pts, m{"x": d, "y": 17 + float64((i*3)%5)})
	}
	e.ops(
		m{"op": "clear"},
		m{"op": "add_node", "id": "card", "node": node("Card", m{"title": "Temperature this week", "accent": "blue"}, m{"slots": m{"body": []string{"chart"}}})},
		m{"op": "add_node", "id": "chart", "node": node("Chart", m{"kind": "line", "series": []m{{"name": "°C", "points": pts}}, "y_label": "°C"})},
		m{"op": "set_root", "id": "card"},
		m{"op": "done"},
	)
	e.text("Mild all week, peaking midweek.")
}

func (r *Runtime) scheduleScenario(e *emitter, turn runtime.Turn) {
	now := r.now(turn)
	items := []m{
		{"time": "09:00", "title": "Standup", "state": "past"},
		{"time": "11:00", "title": "Design review", "detail": "Dynamic UI catalog", "state": "current"},
		{"time": "15:30", "title": "Call with Ana", "state": "upcoming"},
	}
	e.ops(
		m{"op": "clear"},
		m{"op": "add_node", "id": "card", "node": node("Card", m{"title": now.Format("Monday 2 January"), "subtitle": "Sample schedule from the local runtime"}, m{"slots": m{"body": []string{"tl"}}})},
		m{"op": "add_node", "id": "tl", "node": node("Timeline", m{"items": items})},
		m{"op": "set_root", "id": "card"},
		m{"op": "done"},
	)
	e.text("Three things today: standup, the design review at eleven, and a call with Ana at half past three.")
}

var (
	// "at 17:00", "at 9", "at 9:30pm", "at 7 am"
	atRe = regexp.MustCompile(`(?i)\bat\s+([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)?\b`)
	// "in 5 minutes", "in an hour", "in 2 hours", "in 1 hour 30 minutes"
	inRe = regexp.MustCompile(`(?i)\bin\s+(\d+|an?)\s+(minutes?|mins?|hours?|hrs?)\b(?:\s+(?:and\s+)?(\d+)\s+(?:minutes?|mins?))?`)
	// The reminder's own words: what follows "to" ("remind me at 9 to stretch").
	toRe = regexp.MustCompile(`(?i)\bto\s+(.+)$`)
)

// reminderWhen reads the time out of a reminder phrase: a clock time as
// "HH:MM", or a number of minutes from now. Neither means 17:00, the demo's
// default (review 2026-10-30 round 3: "remind me in 5 minutes" and "remind
// me at 9" both proposed 17:00).
func reminderWhen(text string) (at string, inMinutes int) {
	if mm := inRe.FindStringSubmatch(text); mm != nil {
		n := 1
		if mm[1] != "a" && mm[1] != "an" {
			fmt.Sscan(mm[1], &n)
		}
		if strings.HasPrefix(strings.ToLower(mm[2]), "h") {
			n *= 60
			if mm[3] != "" {
				extra := 0
				fmt.Sscan(mm[3], &extra)
				n += extra
			}
		}
		if n >= 1 {
			return "", n
		}
	}
	if mm := atRe.FindStringSubmatch(text); mm != nil {
		h := 0
		fmt.Sscan(mm[1], &h)
		minute := "00"
		if mm[2] != "" {
			minute = mm[2]
		}
		switch strings.ToLower(mm[3]) {
		case "pm":
			if h < 12 {
				h += 12
			}
		case "am":
			if h == 12 {
				h = 0
			}
		}
		return fmt.Sprintf("%02d:%s", h, minute), 0
	}
	return "17:00", 0
}

// reminderText keeps the reminder's subject: "stretch" from "remind me in
// 5 minutes to stretch", "call Ana" from "remind me to call Ana at 17:00".
// Without a "to", the whole phrase minus its time.
func reminderText(text string) string {
	text = strings.TrimSpace(text)
	if mm := toRe.FindStringSubmatch(text); mm != nil && strings.TrimSpace(mm[1]) != "" {
		text = mm[1]
	}
	for _, re := range []*regexp.Regexp{inRe, atRe} {
		text = re.ReplaceAllString(text, " ")
	}
	text = strings.Join(strings.Fields(text), " ")
	return strings.TrimRight(text, " ,.")
}

func (r *Runtime) reminderScenario(e *emitter, turn runtime.Turn) {
	at, mins := reminderWhen(turn.Text)
	args := m{"text": reminderText(turn.Text)}
	when := "for " + at
	if mins > 0 {
		args["in_minutes"] = float64(mins)
		when = "in " + builtin.Duration(float64(mins))
	} else {
		args["at"] = at
	}
	p := &runtime.Proposal{ID: e.nextID("p"), Tool: "set_reminder", Args: args, Label: "Set a reminder " + when, Risk: "low"}
	if turn.Context.Tools != nil {
		callID := e.nextID("call")
		e.send(runtime.Event{Kind: runtime.EventToolCall, CallID: callID, Tool: "set_reminder", Args: args})
		res, err := turn.Context.Tools.Call(e.ctx, "set_reminder", args)
		if errors.Is(err, runtime.ErrRequiresConfirm) && res.Proposal != nil {
			p = res.Proposal
		}
		e.send(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: "set_reminder", Result: &runtime.ToolResult{Content: res.Content}})
	}
	e.send(runtime.Event{Kind: runtime.EventProposal, Proposal: p})
	e.text(fmt.Sprintf("I can set that reminder %s. Say \"do it\" or press Enter to confirm.", when))
}

func (r *Runtime) weatherScenario(e *emitter, turn runtime.Turn, text string) {
	// The demo has current conditions only; a question about tomorrow or
	// the week says so first instead of answering a different question
	// (review 2026-10-30 round 4).
	if futureRe.MatchString(text) {
		e.text("I only have current conditions on the local runtime. ")
	}
	place := "Lisbon"
	if p, _, ok := knownPlace(text); ok {
		place = p
	}
	if turn.Context.Tools != nil {
		callID := e.nextID("call")
		args := m{"place": place}
		e.send(runtime.Event{Kind: runtime.EventToolCall, CallID: callID, Tool: "get_weather", Args: args})
		res, err := turn.Context.Tools.Call(e.ctx, "get_weather", args)
		if err == nil {
			var data struct {
				Place       string  `json:"place"`
				Temperature float64 `json:"temperature"`
				Conditions  string  `json:"conditions"`
			}
			_ = json.Unmarshal(res.Data, &data)
			e.send(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: "get_weather", Result: &runtime.ToolResult{Content: res.Content}})
			e.ops(
				m{"op": "clear"},
				m{"op": "add_node", "id": "glance", "node": node("Overlay", m{"position": "top_right"}, m{"slots": m{"content": []string{"stat"}}})},
				m{"op": "add_node", "id": "stat", "node": node("Stat", m{"label": data.Place, "value": fmt.Sprintf("%.0f", data.Temperature), "unit": "°C", "delta": data.Conditions}, m{"ttl_ms": 60000})},
				m{"op": "set_root", "id": "glance"},
				m{"op": "done"},
			)
			e.text(res.Content + ".")
			return
		}
		e.send(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: "get_weather", Result: &runtime.ToolResult{Content: "unavailable: " + err.Error()}})
	}
	e.ops(
		m{"op": "clear"},
		m{"op": "add_node", "id": "glance", "node": node("Overlay", m{"position": "top_right"}, m{"slots": m{"content": []string{"stat"}}})},
		m{"op": "add_node", "id": "stat", "node": node("Stat", m{"label": "Outside", "value": 21, "unit": "°C", "delta": "+2 since noon", "trend": "up"}, m{"ttl_ms": 60000})},
		m{"op": "set_root", "id": "glance"},
		m{"op": "done"},
	)
	e.text("Twenty-one degrees and clear. That's a sample value; connect the weather tool for real data.")
}
