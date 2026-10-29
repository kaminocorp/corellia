// Package tools is the registry of tools a runtime may call. Each tool
// declares a JSON Schema for its arguments, whether it needs confirmation
// (roadmap rule 5) and how to run. The registry validates arguments,
// turns gated calls into proposals and executes the rest.
package tools

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"sync"

	"github.com/santhosh-tekuri/jsonschema/v6"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

// Tool is one registered tool.
type Tool struct {
	Name        string
	Description string
	// InputSchema is a JSON Schema object for Args.
	InputSchema json.RawMessage
	// RequiresConfirm routes Call through the propose/confirm gate.
	RequiresConfirm bool
	// Risk for proposals: low, medium, high.
	Risk string
	// Label renders the human proposal label from the arguments.
	Label func(args map[string]any) string
	// Run executes the tool.
	Run func(ctx context.Context, args map[string]any) (runtime.ToolResult, error)
}

// ErrUnknownTool is returned for names not in the registry.
var ErrUnknownTool = errors.New("tools: unknown tool")

// ErrInvalidArgs wraps schema failures.
var ErrInvalidArgs = errors.New("tools: invalid arguments")

// Registry holds tools. Safe for concurrent use after registration.
type Registry struct {
	mu     sync.RWMutex
	tools  map[string]*Tool
	schema map[string]*jsonschema.Schema
	// NewProposalID mints proposal ids; defaults to a random id.
	NewProposalID func() string
}

// NewRegistry creates an empty registry.
func NewRegistry() *Registry {
	return &Registry{tools: map[string]*Tool{}, schema: map[string]*jsonschema.Schema{}, NewProposalID: func() string { return randomID("p") }}
}

// Register adds a tool, compiling its schema. Panics on an invalid schema
// (a programming error) and on duplicate names.
func (r *Registry) Register(t *Tool) {
	if t == nil || t.Name == "" {
		panic("tools: tool without a name")
	}
	if t.InputSchema == nil {
		t.InputSchema = json.RawMessage(`{"type":"object","additionalProperties":false}`)
	}
	doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(t.InputSchema))
	if err != nil {
		panic(fmt.Sprintf("tools: %s schema: %v", t.Name, err))
	}
	c := jsonschema.NewCompiler()
	url := "https://corellia.dev/tools/" + t.Name + ".json"
	if err := c.AddResource(url, doc); err != nil {
		panic(fmt.Sprintf("tools: %s schema: %v", t.Name, err))
	}
	s, err := c.Compile(url)
	if err != nil {
		panic(fmt.Sprintf("tools: %s schema: %v", t.Name, err))
	}
	if t.Risk == "" {
		t.Risk = "low"
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, dup := r.tools[t.Name]; dup {
		panic("tools: duplicate tool " + t.Name)
	}
	r.tools[t.Name] = t
	r.schema[t.Name] = s
}

// Get looks a tool up.
func (r *Registry) Get(name string) (*Tool, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	t, ok := r.tools[name]
	return t, ok
}

// Names returns the sorted tool names.
func (r *Registry) Names() []string {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]string, 0, len(r.tools))
	for n := range r.tools {
		out = append(out, n)
	}
	sort.Strings(out)
	return out
}

// Definitions implements runtime.ToolCaller.
func (r *Registry) Definitions() []runtime.ToolDefinition {
	var out []runtime.ToolDefinition
	for _, n := range r.Names() {
		t := r.tools[n]
		out = append(out, runtime.ToolDefinition{Name: t.Name, Description: t.Description, InputSchema: t.InputSchema, RequiresConfirm: t.RequiresConfirm})
	}
	return out
}

// Validate checks args against the tool's schema.
func (r *Registry) Validate(name string, args map[string]any) error {
	r.mu.RLock()
	s, ok := r.schema[name]
	r.mu.RUnlock()
	if !ok {
		return ErrUnknownTool
	}
	if args == nil {
		args = map[string]any{}
	}
	// Normalise to plain JSON types so typed values validate.
	raw, _ := json.Marshal(args)
	var generic any
	_ = json.Unmarshal(raw, &generic)
	if err := s.Validate(generic); err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidArgs, err)
	}
	return nil
}

// Proposal builds the proposal a gated call would produce.
func (r *Registry) Proposal(name string, args map[string]any) (runtime.Proposal, error) {
	t, ok := r.Get(name)
	if !ok {
		return runtime.Proposal{}, ErrUnknownTool
	}
	if err := r.Validate(name, args); err != nil {
		return runtime.Proposal{}, err
	}
	label := name
	if t.Label != nil {
		label = t.Label(args)
	}
	if args == nil {
		args = map[string]any{}
	}
	return runtime.Proposal{ID: r.NewProposalID(), Tool: name, Args: args, Label: label, Risk: t.Risk}, nil
}

// Call implements runtime.ToolCaller: validates, and either executes or
// returns the proposal with runtime.ErrRequiresConfirm.
func (r *Registry) Call(ctx context.Context, name string, args map[string]any) (runtime.ToolResult, error) {
	t, ok := r.Get(name)
	if !ok {
		return runtime.ToolResult{}, ErrUnknownTool
	}
	if err := r.Validate(name, args); err != nil {
		return runtime.ToolResult{}, err
	}
	if t.RequiresConfirm {
		p, err := r.Proposal(name, args)
		if err != nil {
			return runtime.ToolResult{}, err
		}
		return runtime.ToolResult{Content: "Awaiting confirmation: " + p.Label, Proposal: &p}, runtime.ErrRequiresConfirm
	}
	return t.Run(ctx, args)
}

// Execute runs a tool regardless of its confirmation flag (used by the
// gate after a confirmation). Arguments are validated.
func (r *Registry) Execute(ctx context.Context, name string, args map[string]any) (runtime.ToolResult, error) {
	t, ok := r.Get(name)
	if !ok {
		return runtime.ToolResult{}, ErrUnknownTool
	}
	if err := r.Validate(name, args); err != nil {
		return runtime.ToolResult{}, err
	}
	return t.Run(ctx, args)
}
