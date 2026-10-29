package local

import (
	"context"
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/uispec"
)

func collect(t *testing.T, r *Runtime, text string) []runtime.Event {
	t.Helper()
	ch, err := r.Start(context.Background(), runtime.Turn{ID: "t1", Text: text, Context: runtime.Context{Now: func() time.Time { return time.Date(2026, 10, 29, 14, 5, 0, 0, time.UTC) }}})
	if err != nil {
		t.Fatal(err)
	}
	var evs []runtime.Event
	for ev := range ch {
		evs = append(evs, ev)
	}
	return evs
}

func TestScenariosProduceValidSpecs(t *testing.T) {
	reg, err := contract.Load()
	if err != nil {
		t.Fatal(err)
	}
	v := uispec.NewValidator(reg)
	r := &Runtime{}
	cases := []struct {
		text     string
		wantText string
		wantOps  bool
		wantTool bool
	}{
		{"hello", "local runtime", false, false},
		{"what time is it", "14:05", true, true},
		{"show me a map of Berlin", "Berlin", true, false},
		{"give me the stock table", "stock", true, false},
		{"temperature trend", "midweek", true, false},
		{"what's on my schedule today", "standup", true, false},
		{"weather", "degrees", true, false},
		{"something else entirely", "I heard", false, false},
		{"", "did not catch", false, false},
	}
	for _, tc := range cases {
		t.Run(tc.text, func(t *testing.T) {
			evs := collect(t, r, tc.text)
			if evs[len(evs)-1].Kind != runtime.EventDone {
				t.Fatalf("last event = %v, want done", evs[len(evs)-1].Kind)
			}
			var text strings.Builder
			spec := uispec.New()
			ops, tools := 0, 0
			for _, ev := range evs {
				switch ev.Kind {
				case runtime.EventTextDelta:
					text.WriteString(ev.Text)
				case runtime.EventToolCall:
					tools++
				case runtime.EventSpecOp:
					ops++
					op, err := reg.DecodeOp(ev.Op)
					if err != nil {
						t.Fatalf("op %s: %v", ev.Op, err)
					}
					if e := v.CheckOp(&spec, op); e != nil {
						t.Fatalf("op rejected: %v (%s)", e, ev.Op)
					}
					if err := uispec.Apply(&spec, op); err != nil {
						t.Fatal(err)
					}
				case runtime.EventError:
					t.Fatalf("error event: %v", ev.Err)
				}
			}
			if !strings.Contains(strings.ToLower(text.String()), strings.ToLower(tc.wantText)) {
				t.Fatalf("text %q does not contain %q", text.String(), tc.wantText)
			}
			if (ops > 0) != tc.wantOps {
				t.Fatalf("ops = %d, wantOps=%v", ops, tc.wantOps)
			}
			if (tools > 0) != tc.wantTool {
				t.Fatalf("tool calls = %d, wantTool=%v", tools, tc.wantTool)
			}
			if tc.wantOps {
				if issues := v.CheckSpec(&spec); len(issues) != 0 {
					raw, _ := json.Marshal(spec)
					t.Fatalf("whole-spec issues %v for %s", issues, raw)
				}
			}
		})
	}
}

func TestReminderEmitsProposal(t *testing.T) {
	evs := collect(t, &Runtime{}, "remind me to call Ana")
	found := false
	for _, ev := range evs {
		if ev.Kind == runtime.EventProposal && ev.Proposal != nil && ev.Proposal.Tool == "set_reminder" {
			found = true
		}
	}
	if !found {
		t.Fatal("no proposal event")
	}
}

func TestSimulatedFailure(t *testing.T) {
	evs := collect(t, &Runtime{}, "please simulate a failure")
	var fatal bool
	for _, ev := range evs {
		if ev.Kind == runtime.EventError && ev.Fatal && ev.Err != nil && strings.Contains(ev.Err.Error(), "simulated failure") {
			fatal = true
		}
	}
	if !fatal {
		t.Fatalf("no fatal error event: %+v", evs)
	}
}

func TestCancelStopsStream(t *testing.T) {
	r := &Runtime{Delay: 50 * time.Millisecond}
	ctx, cancel := context.WithCancel(context.Background())
	ch, _ := r.Start(ctx, runtime.Turn{ID: "t", Text: "hello"})
	<-ch // first chunk
	cancel()
	deadline := time.After(2 * time.Second)
	for {
		select {
		case _, ok := <-ch:
			if !ok {
				return // closed without hanging
			}
		case <-deadline:
			t.Fatal("stream did not close after cancel")
		}
	}
}
