// Package runtime defines AgentRuntime, the only seam between Corellia and
// any model, harness or agent framework (roadmap rule 1). Implementations
// live in sub-packages and nothing outside them imports provider SDKs.
package runtime

import (
	"context"
	"encoding/json"
	"errors"
	"time"
)

// Source says where a turn came from.
type Source string

const (
	SourceKeyboard  Source = "keyboard"
	SourceVoice     Source = "voice"
	SourceProactive Source = "proactive"
	SourceAction    Source = "action"
)

// Message is one prior exchange, oldest first.
type Message struct {
	Role string `json:"role"` // user | agent | system
	Text string `json:"text"`
}

// Turn is one user (or proactive) input plus the context the runtime needs
// to answer it.
type Turn struct {
	ID      string
	Text    string
	Source  Source
	History []Message
	Context Context
}

// Context is everything the runtime may use to shape its answer. Runtimes
// stay ignorant of presentation; the decision layer owns that.
type Context struct {
	AgentName string
	// CatalogDescription is the model-facing description of the component
	// catalog (Phase 4). Empty means "no UI available".
	CatalogDescription string
	// MemorySummary is the memory store rendered for the prompt (Phase 9).
	MemorySummary string
	// Tools lets the runtime call tools during its loop (Phase 6 registry).
	Tools ToolCaller
	// Now is the wall clock, injectable for tests.
	Now func() time.Time
	// ScreenSummary describes what is on screen so a follow-up can update
	// it in place.
	ScreenSummary string
}

// ToolCaller runs tools on behalf of a runtime.
type ToolCaller interface {
	// Definitions returns tool descriptions in a provider-neutral form.
	Definitions() []ToolDefinition
	// Call executes a tool. Tools that require confirmation return
	// ErrRequiresConfirm with a Proposal instead of executing.
	Call(ctx context.Context, name string, args map[string]any) (ToolResult, error)
}

// ToolDefinition describes one tool to a model.
type ToolDefinition struct {
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	InputSchema     json.RawMessage `json:"input_schema"`
	RequiresConfirm bool            `json:"requires_confirm"`
}

// ToolResult is what a tool returned.
type ToolResult struct {
	Content  string            `json:"content"`            // text for the model
	Data     json.RawMessage   `json:"data,omitempty"`     // structured result for bindings
	Ops      []json.RawMessage `json:"ops,omitempty"`      // spec ops presenting the result (applied by the session)
	Proposal *Proposal         `json:"proposal,omitempty"` // set when confirmation is required
}

// Proposal is a side effect awaiting confirmation (VISION.md 5.6).
type Proposal struct {
	ID     string         `json:"id"`
	Tool   string         `json:"tool"`
	Args   map[string]any `json:"args"`
	Label  string         `json:"label"`
	Detail string         `json:"detail,omitempty"`
	Risk   string         `json:"risk"`
}

// ErrRequiresConfirm is returned by ToolCaller.Call for gated tools.
var ErrRequiresConfirm = errors.New("tool requires confirmation")

// StatusError wraps a failure the provider answered with an HTTP status.
// The session classifies it by Status (401 is a credentials problem, 429
// a rate limit, …) instead of searching the message text, where a request
// id can contain "401" and a JSON body can contain "model:" (review
// 2026-10-30 round 3). Err keeps the provider's full message for the log.
type StatusError struct {
	Status int
	Err    error
}

func (e *StatusError) Error() string { return e.Err.Error() }
func (e *StatusError) Unwrap() error { return e.Err }

// ErrTruncated marks a reply the provider cut at the output-token cap
// (Messages API stop_reason max_tokens): the text so far is not the whole
// answer and a tool call in it never ran. Implementations wrap it so the
// session can tell the user instead of passing the fragment off as
// complete (review 2026-10-30 round 3, item 5).
var ErrTruncated = errors.New("reply cut off at the output-token cap")

// EventKind enumerates runtime events.
type EventKind string

const (
	EventTextDelta  EventKind = "text_delta"
	EventSpecOp     EventKind = "spec_op"
	EventToolCall   EventKind = "tool_call"
	EventToolResult EventKind = "tool_result"
	EventProposal   EventKind = "proposal"
	EventDone       EventKind = "done"
	EventError      EventKind = "error"
)

// Event is one item on a runtime's output stream. Exactly one payload
// field is set per kind.
type Event struct {
	Kind EventKind
	// TextDelta: a chunk of reply text.
	Text string
	// SpecOp: a raw op (validated by the session before it reaches the
	// client).
	Op json.RawMessage
	// ToolCall / ToolResult.
	CallID string
	Tool   string
	Args   map[string]any
	Result *ToolResult
	// Proposal.
	Proposal *Proposal
	// Error: a non-fatal error unless Fatal is set; Done follows.
	Err   error
	Fatal bool
}

// Capabilities reports what a runtime can do, surfaced to the client.
type Capabilities struct {
	Streaming bool `json:"streaming"`
	UIOps     bool `json:"ui_ops"`
	Tools     bool `json:"tools"`
	Cancel    bool `json:"cancel"`
}

// AgentRuntime runs the agent loop for one turn.
type AgentRuntime interface {
	// Name identifies the implementation (local, anthropic, openai, hermes).
	Name() string
	Capabilities() Capabilities
	// Start begins a turn and returns its event stream. The stream ends
	// with EventDone (or after a fatal EventError). Cancelling ctx stops
	// the turn; the runtime must still close the channel.
	Start(ctx context.Context, turn Turn) (<-chan Event, error)
}

// ErrNotImplemented is returned by stub runtimes (roadmap rule 7).
var ErrNotImplemented = errors.New("runtime not implemented")
