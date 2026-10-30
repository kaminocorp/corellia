// Package rttest holds test doubles shared by the runtime packages.
package rttest

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

// Tools is a ToolCaller with show_ui, get_time and a gated set_reminder.
type Tools struct {
	Calls []string
}

func (t *Tools) Definitions() []runtime.ToolDefinition {
	return []runtime.ToolDefinition{
		{Name: "get_time", Description: "time", InputSchema: json.RawMessage(`{"type":"object","properties":{"timezone":{"type":"string"}},"additionalProperties":false}`)},
		{Name: "set_reminder", Description: "reminder", InputSchema: json.RawMessage(`{"type":"object","required":["text"],"properties":{"text":{"type":"string"},"at":{"type":"string"}}}`), RequiresConfirm: true},
		{Name: "show_ui", Description: "ui", InputSchema: json.RawMessage(`{"type":"object","required":["ops"],"properties":{"ops":{"type":"array"}}}`)},
	}
}

func (t *Tools) Call(_ context.Context, name string, args map[string]any) (runtime.ToolResult, error) {
	t.Calls = append(t.Calls, name)
	switch name {
	case "get_time":
		return runtime.ToolResult{Content: "14:00 on Thursday"}, nil
	case "set_reminder":
		return runtime.ToolResult{Content: "awaiting", Proposal: &runtime.Proposal{ID: "p1", Tool: name, Args: args, Label: "Set a reminder", Risk: "low"}}, runtime.ErrRequiresConfirm
	case "show_ui":
		ops, _ := args["ops"].([]any)
		res := runtime.ToolResult{Content: fmt.Sprintf("Displayed %d ops.", len(ops))}
		for _, op := range ops {
			raw, _ := json.Marshal(op)
			res.Ops = append(res.Ops, raw)
		}
		return res, nil
	}
	return runtime.ToolResult{}, fmt.Errorf("unknown tool %s", name)
}

// Collect drains a runtime stream.
func Collect(ch <-chan runtime.Event) []runtime.Event {
	var out []runtime.Event
	for ev := range ch {
		out = append(out, ev)
	}
	return out
}

// Kinds lists the event kinds in order.
func Kinds(evs []runtime.Event) []string {
	var out []string
	for _, ev := range evs {
		out = append(out, string(ev.Kind))
	}
	return out
}

// Text concatenates text deltas.
func Text(evs []runtime.Event) string {
	s := ""
	for _, ev := range evs {
		if ev.Kind == runtime.EventTextDelta {
			s += ev.Text
		}
	}
	return s
}
