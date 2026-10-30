// Package toolexec runs tool calls on behalf of a cloud runtime: it emits
// the tool_call / tool_result / proposal / spec_op events and returns the
// text the model should see.
package toolexec

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

// Emit sends events to the runtime's stream; returns false when the
// consumer is gone.
type Emit func(runtime.Event) bool

// Run executes one tool call and reports it. The returned content goes
// back to the model; isError says whether it should be marked as such.
func Run(ctx context.Context, tools runtime.ToolCaller, emit Emit, callID, name string, rawArgs json.RawMessage) (content string, isError bool) {
	args := map[string]any{}
	if len(rawArgs) > 0 {
		if err := json.Unmarshal(rawArgs, &args); err != nil {
			emit(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: name, Result: &runtime.ToolResult{Content: "invalid arguments"}})
			return "The arguments were not valid JSON: " + err.Error(), true
		}
	}
	emit(runtime.Event{Kind: runtime.EventToolCall, CallID: callID, Tool: name, Args: args})
	if tools == nil {
		emit(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: name, Result: &runtime.ToolResult{Content: "no tools available"}})
		return "No tools are available in this session.", true
	}
	res, err := tools.Call(ctx, name, args)
	switch {
	case errors.Is(err, runtime.ErrRequiresConfirm) && res.Proposal != nil:
		emit(runtime.Event{Kind: runtime.EventProposal, Proposal: res.Proposal})
		emit(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: name, Result: &runtime.ToolResult{Content: res.Content}})
		return fmt.Sprintf("Proposed to the user: %s. It runs only after they confirm; tell them briefly that it is waiting for their confirmation and do not call it again.", res.Proposal.Label), false
	case err != nil:
		emit(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: name, Result: &runtime.ToolResult{Content: "error: " + err.Error()}})
		return "Tool error: " + err.Error(), true
	}
	for _, op := range res.Ops {
		if !emit(runtime.Event{Kind: runtime.EventSpecOp, Op: op}) {
			return res.Content, false
		}
	}
	emit(runtime.Event{Kind: runtime.EventToolResult, CallID: callID, Tool: name, Result: &runtime.ToolResult{Content: res.Content}})
	content = res.Content
	if len(res.Data) > 0 {
		content += "\n" + string(res.Data)
	}
	if content == "" {
		content = "ok"
	}
	return content, false
}
