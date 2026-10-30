package tools

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

func echoTool(confirm bool) *Tool {
	return &Tool{
		Name:            "echo",
		Description:     "echoes",
		InputSchema:     json.RawMessage(`{"type":"object","required":["text"],"properties":{"text":{"type":"string"}},"additionalProperties":false}`),
		RequiresConfirm: confirm,
		Label:           func(a map[string]any) string { return "Echo " + a["text"].(string) },
		Run: func(_ context.Context, a map[string]any) (runtime.ToolResult, error) {
			return runtime.ToolResult{Content: a["text"].(string)}, nil
		},
	}
}

func TestRegistryCallAndValidate(t *testing.T) {
	r := NewRegistry()
	r.Register(echoTool(false))
	if _, err := r.Call(context.Background(), "nope", nil); !errors.Is(err, ErrUnknownTool) {
		t.Fatalf("err = %v", err)
	}
	if _, err := r.Call(context.Background(), "echo", map[string]any{"text": 1}); !errors.Is(err, ErrInvalidArgs) {
		t.Fatalf("err = %v", err)
	}
	if _, err := r.Call(context.Background(), "echo", map[string]any{"text": "x", "extra": true}); !errors.Is(err, ErrInvalidArgs) {
		t.Fatalf("extra arg accepted: %v", err)
	}
	res, err := r.Call(context.Background(), "echo", map[string]any{"text": "hi"})
	if err != nil || res.Content != "hi" {
		t.Fatalf("res = %+v, err = %v", res, err)
	}
	defs := r.Definitions()
	if len(defs) != 1 || defs[0].Name != "echo" || defs[0].RequiresConfirm {
		t.Fatalf("defs = %+v", defs)
	}
}

func TestGatedToolProposes(t *testing.T) {
	r := NewRegistry()
	r.NewProposalID = func() string { return "p1" }
	r.Register(echoTool(true))
	res, err := r.Call(context.Background(), "echo", map[string]any{"text": "hi"})
	if !errors.Is(err, runtime.ErrRequiresConfirm) {
		t.Fatalf("err = %v", err)
	}
	if res.Proposal == nil || res.Proposal.ID != "p1" || res.Proposal.Label != "Echo hi" || res.Proposal.Risk != "low" {
		t.Fatalf("proposal = %+v", res.Proposal)
	}
	exec, err := r.Execute(context.Background(), "echo", res.Proposal.Args)
	if err != nil || exec.Content != "hi" {
		t.Fatalf("execute = %+v, %v", exec, err)
	}
}

func TestRegisterPanics(t *testing.T) {
	r := NewRegistry()
	r.Register(echoTool(false))
	defer func() {
		if recover() == nil {
			t.Fatal("duplicate did not panic")
		}
	}()
	r.Register(echoTool(false))
}
