package actions

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/tools"
)

func gate(t *testing.T) (*Gate, *time.Time, *int) {
	t.Helper()
	now := time.Date(2026, 10, 29, 12, 0, 0, 0, time.UTC)
	runs := 0
	reg := tools.NewRegistry()
	reg.Register(&tools.Tool{
		Name: "danger", RequiresConfirm: true,
		InputSchema: json.RawMessage(`{"type":"object","properties":{"x":{"type":"number"}}}`),
		Run: func(context.Context, map[string]any) (runtime.ToolResult, error) {
			runs++
			return runtime.ToolResult{Content: "done"}, nil
		},
	})
	return New(reg, time.Minute, func() time.Time { return now }), &now, &runs
}

func TestConfirmExecutesOnce(t *testing.T) {
	g, _, runs := gate(t)
	p := g.Propose("t1", runtime.Proposal{ID: "p1", Tool: "danger", Args: map[string]any{"x": 1.0}, Label: "Do"})
	if p.Risk != "low" || !p.ExpiresAt.Equal(p.CreatedAt.Add(time.Minute)) {
		t.Fatalf("pending = %+v", p)
	}
	if len(g.Pending()) != 1 {
		t.Fatal("not pending")
	}
	pd, res, err := g.Confirm(context.Background(), "p1")
	if err != nil || res.Content != "done" || pd.TurnID != "t1" || *runs != 1 {
		t.Fatalf("confirm = %+v %+v %v runs=%d", pd, res, err, *runs)
	}
	if _, _, err := g.Confirm(context.Background(), "p1"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("second confirm err = %v", err)
	}
}

func TestRejectAndExpire(t *testing.T) {
	g, now, runs := gate(t)
	g.Propose("t1", runtime.Proposal{ID: "a", Tool: "danger"})
	g.Propose("t1", runtime.Proposal{ID: "b", Tool: "danger"})
	if l, ok := g.Latest(); !ok || l.ID != "b" {
		t.Fatalf("latest = %+v", l)
	}
	if _, err := g.Reject("a"); err != nil {
		t.Fatal(err)
	}
	*now = now.Add(2 * time.Minute)
	if len(g.Pending()) != 0 {
		t.Fatal("expired proposal still listed")
	}
	if _, _, err := g.Confirm(context.Background(), "b"); !errors.Is(err, ErrExpired) {
		t.Fatalf("confirm expired err = %v", err)
	}
	g.Propose("t2", runtime.Proposal{ID: "c", Tool: "danger"})
	*now = now.Add(2 * time.Minute)
	if ex := g.Expire(); len(ex) != 1 || ex[0].ID != "c" {
		t.Fatalf("expire = %+v", ex)
	}
	if *runs != 0 {
		t.Fatal("something ran without confirmation")
	}
}
