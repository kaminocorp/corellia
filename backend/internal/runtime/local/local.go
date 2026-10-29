// Package local is a deterministic, keyless AgentRuntime used for all
// development and tests. It recognises a handful of intents and answers
// with streamed text plus valid spec ops, exercising every event kind the
// session handles. It is the fallback when no cloud runtime is configured.
package local

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
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
	case hasAny(text, "hello", "hi ", "hey", "good morning", "good evening") || text == "hi":
		e.text(fmt.Sprintf("Hello. I'm %s, running on the local runtime. Ask me the time, for a map of a city, a table, a chart, or your schedule.", name(turn)))
	case hasAny(text, "what time", "the time", "what's the time", "time is it"):
		r.timeScenario(ctx, e, turn)
	case hasAny(text, "map of", "where is", "show me ", "directions"):
		r.mapScenario(e, text)
	case hasAny(text, "table", "inventory", "stock"):
		r.tableScenario(e)
	case hasAny(text, "chart", "trend", "graph", "temperature this week"):
		r.chartScenario(e)
	case hasAny(text, "schedule", "today", "calendar", "agenda"):
		r.scheduleScenario(e, turn)
	case hasAny(text, "remind me", "reminder"):
		r.reminderScenario(e, turn)
	case hasAny(text, "weather"):
		r.weatherScenario(e)
	default:
		e.text(fmt.Sprintf("I heard: \"%s\". The local runtime only knows a few scripted replies; connect a cloud runtime for real answers.", strings.TrimSpace(turn.Text)))
	}
}

func name(t runtime.Turn) string {
	if t.Context.AgentName != "" {
		return t.Context.AgentName
	}
	return "Corellia"
}

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

func (r *Runtime) mapScenario(e *emitter, text string) {
	place, coords := "Lisbon", gazetteer["lisbon"]
	for key, c := range gazetteer {
		if strings.Contains(text, key) {
			place, coords = strings.ToUpper(key[:1])+key[1:], c
			break
		}
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
	e.text(fmt.Sprintf("Here's %s on the map.", place))
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

func (r *Runtime) reminderScenario(e *emitter, turn runtime.Turn) {
	p := &runtime.Proposal{
		ID:    e.nextID("p"),
		Tool:  "set_reminder",
		Args:  m{"text": strings.TrimSpace(turn.Text), "at": "17:00"},
		Label: "Set a reminder for 17:00",
		Risk:  "low",
	}
	e.send(runtime.Event{Kind: runtime.EventProposal, Proposal: p})
	e.text("I can set that reminder for five o'clock. Say \"do it\" or press Enter to confirm.")
}

func (r *Runtime) weatherScenario(e *emitter) {
	e.ops(
		m{"op": "clear"},
		m{"op": "add_node", "id": "glance", "node": node("Overlay", m{"position": "top_right"}, m{"slots": m{"content": []string{"stat"}}})},
		m{"op": "add_node", "id": "stat", "node": node("Stat", m{"label": "Outside", "value": 21, "unit": "°C", "delta": "+2 since noon", "trend": "up"}, m{"ttl_ms": 60000})},
		m{"op": "set_root", "id": "glance"},
		m{"op": "done"},
	)
	e.text("Twenty-one degrees and clear. That's a sample value; the weather tool arrives in a later phase.")
}
