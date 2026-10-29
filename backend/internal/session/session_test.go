package session

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/local"
)

func reg(t *testing.T) *contract.Registry {
	t.Helper()
	r, err := contract.Load()
	if err != nil {
		t.Fatal(err)
	}
	return r
}

// scripted is a runtime that replays a fixed event list.
type scripted struct {
	events []runtime.Event
	block  chan struct{} // when non-nil, blocks before emitting
}

func (s *scripted) Name() string { return "scripted" }
func (s *scripted) Capabilities() runtime.Capabilities {
	return runtime.Capabilities{Streaming: true, UIOps: true}
}
func (s *scripted) Start(ctx context.Context, _ runtime.Turn) (<-chan runtime.Event, error) {
	out := make(chan runtime.Event)
	go func() {
		defer close(out)
		if s.block != nil {
			select {
			case <-s.block:
			case <-ctx.Done():
				return
			}
		}
		for _, ev := range s.events {
			select {
			case out <- ev:
			case <-ctx.Done():
				return
			}
		}
	}()
	return out, nil
}

func op(s string) runtime.Event {
	return runtime.Event{Kind: runtime.EventSpecOp, Op: json.RawMessage(s)}
}

func drainUntil(t *testing.T, ch <-chan Item, typ string, turnID string) []map[string]any {
	t.Helper()
	var evs []map[string]any
	deadline := time.After(3 * time.Second)
	for {
		select {
		case it, ok := <-ch:
			if !ok {
				t.Fatal("subscription closed")
			}
			var m map[string]any
			_ = json.Unmarshal(it.Data, &m)
			evs = append(evs, m)
			if m["type"] == typ && (turnID == "" || m["turn_id"] == turnID) {
				return evs
			}
		case <-deadline:
			t.Fatalf("did not see %s; got %d events", typ, len(evs))
		}
	}
}

func types(evs []map[string]any) []string {
	var out []string
	for _, e := range evs {
		out = append(out, e["type"].(string))
	}
	return out
}

func TestTurnLifecycleWithLocalRuntime(t *testing.T) {
	s := New(Options{Registry: reg(t), Runtime: &local.Runtime{}, AgentName: "Corellia"})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()

	id, cancelled, err := s.StartTurn("show me a map of Lisbon", runtime.SourceKeyboard)
	if err != nil || cancelled != "" {
		t.Fatalf("StartTurn: %v %q", err, cancelled)
	}
	evs := drainUntil(t, ch, "turn_done", id)
	seen := map[string]int{}
	for _, e := range evs {
		seen[e["type"].(string)]++
	}
	if seen["turn_started"] != 1 || seen["text_delta"] == 0 || seen["spec_op"] < 5 || seen["speech"] != 1 {
		t.Fatalf("event mix = %v", seen)
	}
	if seen["error"] != 0 {
		t.Fatalf("unexpected error events: %v", evs)
	}
	last := evs[len(evs)-1]
	if last["status"] != "completed" || last["modality"] != "both" {
		t.Fatalf("turn_done = %v", last)
	}
	s.WaitTurn(id)
	spec := s.Spec()
	if spec.Root == nil || *spec.Root != "split" || len(spec.Nodes) != 4 {
		t.Fatalf("spec = %+v", spec)
	}
	snap := s.Snapshot()
	tr := snap["transcript"].([]gen.TranscriptEntry)
	if len(tr) != 2 || tr[0].Role != "user" || tr[1].Role != "agent" {
		t.Fatalf("transcript = %+v", tr)
	}
	if s.State() != gen.AgentStateIdle {
		t.Fatalf("state = %s", s.State())
	}
}

func TestInvalidOpsBecomeErrorEventsAndAreDropped(t *testing.T) {
	rt := &scripted{events: []runtime.Event{
		op(`{"op":"add_node","id":"n1","node":{"type":"Hologram","props":{}}}`),
		op(`{"op":"add_node","id":"n2","node":{"type":"Status","props":{"text":"ok"}}}`),
		op(`{"op":"set_root","id":"n9"}`),
		op(`{"op":"done"}`),
		{Kind: runtime.EventTextDelta, Text: "hi"},
		{Kind: runtime.EventDone},
	}}
	s := New(Options{Registry: reg(t), Runtime: rt})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("x", runtime.SourceKeyboard)
	evs := drainUntil(t, ch, "turn_done", id)
	var codes []string
	for _, e := range evs {
		if e["type"] == "error" {
			codes = append(codes, e["code"].(string))
		}
	}
	if len(codes) != 2 || codes[0] != "unknown_component" || codes[1] != "dangling_ref" {
		t.Fatalf("error codes = %v", codes)
	}
	s.WaitTurn(id)
	spec := s.Spec()
	if _, ok := spec.Nodes["n1"]; ok {
		t.Fatal("invalid node applied")
	}
	if _, ok := spec.Nodes["n2"]; !ok {
		t.Fatal("valid node missing")
	}
}

func TestNewTurnCancelsRunningOne(t *testing.T) {
	block := make(chan struct{})
	rt := &scripted{block: block, events: []runtime.Event{{Kind: runtime.EventTextDelta, Text: "late"}, {Kind: runtime.EventDone}}}
	s := New(Options{Registry: reg(t), Runtime: rt})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	first, _, _ := s.StartTurn("one", runtime.SourceKeyboard)
	second, cancelled, _ := s.StartTurn("two", runtime.SourceVoice)
	if cancelled != first {
		t.Fatalf("cancelled = %q, want %q", cancelled, first)
	}
	evs := drainUntil(t, ch, "turn_done", first)
	if evs[len(evs)-1]["status"] != "cancelled" {
		t.Fatalf("first turn status = %v", evs[len(evs)-1]["status"])
	}
	close(block)
	evs = drainUntil(t, ch, "turn_done", second)
	if evs[len(evs)-1]["status"] != "completed" {
		t.Fatalf("second turn status = %v", evs[len(evs)-1]["status"])
	}
	if s.ActiveTurn() != "" {
		t.Fatal("turn still active")
	}
}

func TestCancelExplicit(t *testing.T) {
	block := make(chan struct{})
	rt := &scripted{block: block, events: []runtime.Event{{Kind: runtime.EventDone}}}
	s := New(Options{Registry: reg(t), Runtime: rt})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("one", runtime.SourceKeyboard)
	if !s.Cancel("nope") == false {
		t.Fatal("cancel of unknown id should be false")
	}
	if !s.Cancel("") {
		t.Fatal("cancel any should be true")
	}
	evs := drainUntil(t, ch, "turn_done", id)
	if evs[len(evs)-1]["status"] != "cancelled" {
		t.Fatal("not cancelled")
	}
	if s.Cancel("") {
		t.Fatal("nothing left to cancel")
	}
}

func TestReplayFromLastSeq(t *testing.T) {
	s := New(Options{Registry: reg(t), Runtime: &scripted{events: []runtime.Event{{Kind: runtime.EventTextDelta, Text: "a"}, {Kind: runtime.EventDone}}}})
	defer s.Close()
	id, _, _ := s.StartTurn("x", runtime.SourceKeyboard)
	s.WaitTurn(id)
	all, unsub := s.Subscribe(0)
	first := drainUntil(t, all, "turn_done", id)
	unsub()
	seq := int(first[1]["seq"].(float64))
	ch, unsub2 := s.Subscribe(seq)
	defer unsub2()
	rest := drainUntil(t, ch, "turn_done", id)
	if len(rest) != len(first)-2 {
		t.Fatalf("replayed %d events, want %d", len(rest), len(first)-2)
	}
	if int(rest[0]["seq"].(float64)) != seq+1 {
		t.Fatalf("first replayed seq = %v", rest[0]["seq"])
	}
}

func TestProposalRecorded(t *testing.T) {
	now := time.Date(2026, 10, 29, 12, 0, 0, 0, time.UTC)
	s := New(Options{Registry: reg(t), Runtime: &local.Runtime{}, Now: func() time.Time { return now }})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("remind me to call Ana", runtime.SourceVoice)
	evs := drainUntil(t, ch, "turn_done", id)
	if evs[len(evs)-1]["modality"] != "voice" {
		t.Fatalf("modality = %v", evs[len(evs)-1]["modality"])
	}
	s.WaitTurn(id)
	if p := s.PendingProposals(); len(p) != 1 || p[0].Tool != "set_reminder" || !p[0].ExpiresAt.Equal(now.Add(2*time.Minute)) {
		t.Fatalf("pending = %+v", p)
	}
	if snap := s.Snapshot(); len(snap["pending_proposals"].([]gen.Proposal)) != 1 {
		t.Fatal("snapshot lacks proposal")
	}
}

func TestEveryPublishedEventIsOnContract(t *testing.T) {
	r := reg(t)
	s := New(Options{Registry: r, Runtime: &local.Runtime{}})
	defer s.Close()
	dropped := 0
	s.bus.OnInvalid = func(ev map[string]any, err error) { dropped++; t.Errorf("off-contract event %v: %v", ev["type"], err) }
	for _, text := range []string{"hello", "what time is it", "show me a map of Paris", "table", "chart", "schedule", "weather", "remind me", "clear"} {
		id, _, _ := s.StartTurn(text, runtime.SourceKeyboard)
		s.WaitTurn(id)
	}
	if dropped != 0 {
		t.Fatalf("%d events dropped", dropped)
	}
	// The snapshot must also be a valid session event.
	snap := s.Snapshot()
	snap["type"], snap["seq"], snap["ts"] = "session", 1, now().Format(time.RFC3339)
	raw, _ := json.Marshal(snap)
	var generic any
	_ = json.Unmarshal(raw, &generic)
	if err := r.ValidateEvent(generic); err != nil {
		t.Fatalf("snapshot off-contract: %v", err)
	}
}

func TestNoRuntime(t *testing.T) {
	s := New(Options{Registry: reg(t)})
	if _, _, err := s.StartTurn("x", runtime.SourceKeyboard); !errors.Is(err, ErrNoRuntime) {
		t.Fatalf("err = %v", err)
	}
	if c := s.Capabilities(); c.Runtime != "none" || c.Stt != "none" {
		t.Fatalf("caps = %+v", c)
	}
}

func now() time.Time { return time.Now() }

func TestLocalOpsAndActions(t *testing.T) {
	s := New(Options{Registry: reg(t), Runtime: &local.Runtime{}})
	defer s.Close()
	id, _, _ := s.StartTurn("show me a map of Lisbon", runtime.SourceKeyboard)
	s.WaitTurn(id)
	ch, unsub := s.Subscribe(s.Seq())
	defer unsub()

	if err := s.FireAction("missing", ""); !errors.Is(err, ErrActionNotFound) {
		t.Fatalf("missing action err = %v", err)
	}
	if err := s.FireAction("nav", ""); !errors.Is(err, ErrActionUnsupported) {
		t.Fatalf("propose action err = %v", err)
	}
	if err := s.RemoveNode("text"); err != nil {
		t.Fatal(err)
	}
	evs := drainUntil(t, ch, "spec_op", "")
	if op := evs[len(evs)-1]["op"].(map[string]any); op["op"] != "remove_node" || op["id"] != "text" {
		t.Fatalf("op = %v", op)
	}
	if _, ok := s.Spec().Nodes["text"]; ok {
		t.Fatal("node not removed")
	}
	if err := s.RemoveNode("ghost"); err != nil {
		t.Fatalf("removing an unknown node should be a no-op: %v", err)
	}
	if err := s.ClearScreen(); err != nil {
		t.Fatal(err)
	}
	if spec := s.Spec(); spec.Root != nil || len(spec.Nodes) != 0 {
		t.Fatal("screen not cleared")
	}
	// A dismiss action and a send_message action through the gate.
	for _, op := range []map[string]any{
		{"op": "add_node", "id": "n1", "node": map[string]any{"type": "Status", "props": map[string]any{"text": "x"}, "actions": map[string]any{}}},
		{"op": "set_root", "id": "n1"},
		{"op": "set_action", "id": "bye", "action": map[string]any{"kind": "dismiss", "target": "n1"}},
		{"op": "set_action", "id": "ask", "action": map[string]any{"kind": "send_message", "message": "hello"}},
	} {
		if err := s.publishLocalOp(op); err != nil {
			t.Fatal(err)
		}
	}
	if err := s.FireAction("bye", ""); err != nil {
		t.Fatal(err)
	}
	if spec := s.Spec(); spec.Root != nil {
		t.Fatal("dismiss did not remove the root")
	}
	if err := s.FireAction("ask", ""); err != nil {
		t.Fatal(err)
	}
	active := s.ActiveTurn()
	s.WaitTurn(active)
	snap := s.Snapshot()
	tr := snap["transcript"].([]gen.TranscriptEntry)
	last := tr[len(tr)-2]
	if last.Text != "hello" || *last.Source != "action" {
		t.Fatalf("send_message turn = %+v", last)
	}
}
