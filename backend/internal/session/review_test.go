package session

import (
	"encoding/json"
	"errors"
	"fmt"
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
	// The apology names the reason in plain words; the raw error ("boom:
	// upstream HTTP 500") goes to the session_error event and the log only
	// (review 2026-10-30, item 5).
	if !strings.Contains(text, "Let me") || !strings.Contains(text, "Sorry") || !strings.Contains(text, "internal error") || strings.Contains(text, "boom") {
		t.Fatalf("turn_done text = %q", text)
	}
	if len(speech) == 0 || !strings.Contains(strings.Join(speech, " "), "Sorry") || strings.Contains(strings.Join(speech, " "), "boom") {
		t.Fatalf("apology not spoken in plain words: %v", speech)
	}
	if !statusCard {
		t.Fatal("no status card shown")
	}
	rawSeen := false
	for _, e := range evs {
		if e["type"] == "session_error" && strings.Contains(e["message"].(string), "boom") {
			rawSeen = true
		}
	}
	if !rawSeen {
		t.Fatal("raw error missing from the session_error event")
	}
	s.WaitTurn(id)
	tr := s.Snapshot()["transcript"].([]gen.TranscriptEntry)
	last := tr[len(tr)-1]
	if last.Role != gen.TranscriptEntryRoleAgent || !strings.Contains(last.Text, "Sorry") || last.Failed == nil || !*last.Failed {
		t.Fatalf("transcript tail = %+v", last)
	}
	// The next turn's history holds the question but not the apology.
	s.mu.Lock()
	hist := s.historyLocked()
	s.mu.Unlock()
	for _, m := range hist {
		if strings.Contains(m.Text, "Sorry") {
			t.Fatalf("failed reply leaked into model history: %+v", hist)
		}
	}
	if len(hist) == 0 || hist[len(hist)-1].Role != "user" {
		t.Fatalf("history = %+v", hist)
	}
}

func TestDescribeFailure(t *testing.T) {
	status := func(code int, msg string) error { return &runtime.StatusError{Status: code, Err: errors.New(msg)} }
	cases := []struct {
		name string
		err  error
		want string
	}{
		{"404 by status", status(404, `anthropic: POST "http://127.0.0.1:1/v1/messages": 404 Not Found {"type":"error","error":{"type":"not_found_error"}}`), "isn't available"},
		{"529 by status", status(529, "anthropic: 529 overloaded_error"), "overloaded"},
		{"401 by status", status(401, "anthropic: 401 authentication_error"), "credentials"},
		{"429 by status", status(429, "anthropic: 429 rate_limit_error"), "rate-limiting"},
		{"500 by status", status(500, "anthropic: 500 api_error"), "internal error"},
		{"400 by status", status(400, "anthropic: 400 invalid_request_error"), "rejected the request"},
		// The request id contains "401"; the status, not the text, decides
		// (review 2026-10-30 round 3: every failure was "credentials").
		{"request id with 401", status(429, `anthropic: 429 {"type":"error","error":{"type":"rate_limit_error"},"request_id":"req_011CXyz4019"}`), "rate-limiting"},
		{"request id with 401, 500", status(500, `anthropic: 500 {"request_id":"req_011CXyz4019","error":{"type":"api_error","message":"model: boom"}}`), "internal error"},
		{"wrapped status", fmt.Errorf("start: %w", status(503, "upstream")), "overloaded"},
		{"truncated", fmt.Errorf("anthropic: %w after 2 content blocks", runtime.ErrTruncated), "cut off"},
		{"dropped stream", errors.New("anthropic: stream ended without a stop reason"), "dropped"},
		{"timeout", errors.New("context deadline exceeded"), "too long"},
		{"dns", errors.New("dial tcp: lookup api.anthropic.com: no such host"), "can't reach"},
		{"simulated", errors.New("simulated failure (local demo): the user asked for one"), "simulated"},
		// Bare numbers in a message without a status mean nothing.
		{"401 in text only", errors.New("something about request req_401 happened"), "couldn't tell why"},
		{"unknown", errors.New("something nobody anticipated"), "couldn't tell why"},
		{"nil", nil, "couldn't tell why"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := describeFailure(tc.err)
			if !strings.Contains(got, tc.want) {
				t.Errorf("describeFailure(%v) = %q, want it to contain %q", tc.err, got, tc.want)
			}
			if strings.Contains(got, "http") || strings.Contains(got, "{") {
				t.Errorf("describeFailure(%v) = %q leaks detail", tc.err, got)
			}
		})
	}
}

// A reply the provider cut at the output-token cap is a failed turn with
// the fragment spoken as its own piece, marked as cut off, and the reason
// after it; it never passes as a completed answer (review 2026-10-30
// round 3, item 5).
func TestTruncatedReplyIsCutOffNotComplete(t *testing.T) {
	rt := &scripted{events: []runtime.Event{
		{Kind: runtime.EventTextDelta, Text: "The answer you asked for is that the"},
		{Kind: runtime.EventError, Err: fmt.Errorf("anthropic: %w after 1 content blocks (max_tokens 64000)", runtime.ErrTruncated), Fatal: true},
	}}
	s := New(Options{Registry: reg(t), Runtime: rt})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("x", runtime.SourceKeyboard)
	evs := drainUntil(t, ch, "turn_done", id)
	var speech []string
	var done map[string]any
	for _, e := range evs {
		switch e["type"] {
		case "speech":
			speech = append(speech, e["text"].(string))
		case "turn_done":
			done = e
		}
	}
	if done["status"] != "failed" {
		t.Fatalf("status = %v (a max_tokens stop passed as complete)", done["status"])
	}
	text, _ := done["text"].(string)
	if !strings.HasPrefix(text, "The answer you asked for is that the…") || !strings.Contains(text, "cut off") {
		t.Fatalf("turn_done text = %q", text)
	}
	if len(speech) < 2 {
		t.Fatalf("speech = %v, want the fragment and the apology as separate pieces", speech)
	}
	if !strings.HasSuffix(speech[0], "the…") || strings.Contains(speech[0], "Sorry") {
		t.Fatalf("first piece = %q: the fragment must not be glued to the apology", speech[0])
	}
	if joined := strings.Join(speech[1:], " "); !strings.Contains(joined, "Sorry") || !strings.Contains(joined, "cut off") {
		t.Fatalf("apology pieces = %v", speech[1:])
	}
}

func TestSnapshotCarriesSeqUnderLock(t *testing.T) {
	s := New(Options{Registry: reg(t), Runtime: &scripted{}})
	defer s.Close()
	before := s.Seq()
	snap := s.Snapshot()
	if seq, ok := snap["seq"].(int); !ok || seq != before {
		t.Fatalf("snapshot seq = %v, bus seq = %d", snap["seq"], before)
	}
}

type boom struct{}

func (boom) Error() string { return "boom: upstream HTTP 500" }

// errBoom carries its status as a value: the message alone no longer
// classifies a failure.
var errBoom = &runtime.StatusError{Status: 500, Err: boom{}}

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
		if e["type"] == "session_error" {
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

// TestProposalsStackAndHighRiskNeedsKey: two pending proposals share one
// overlay, newest on top with the Enter/Escape binding; a spoken "ok" does
// not confirm a high-risk proposal (Phase 12 review items).
func TestProposalsStackAndHighRiskNeedsKey(t *testing.T) {
	s, _, _ := gated(t)
	defer s.Close()
	s.propose("", runtime.Proposal{ID: "p_low", Tool: "set_reminder", Args: map[string]any{"text": "a", "at": "17:00"}, Label: "Low", Risk: "low"})
	s.propose("", runtime.Proposal{ID: "p_high", Tool: "forget", Args: map[string]any{"id": "n1"}, Label: "High", Risk: "high"})
	spec := s.Spec()
	stack, ok := spec.Nodes["proposals_stack"]
	if !ok || spec.Nodes["proposals"].Type != "Overlay" {
		t.Fatalf("no proposal overlay/stack: %v", spec.Nodes)
	}
	children := stack.Slots["children"]
	if len(children) != 2 || children[0] != "confirm_p_high_card" || children[1] != "confirm_p_low_card" {
		t.Fatalf("stack children = %v", children)
	}
	top := spec.Nodes["confirm_p_high_card"].Actions["confirm"]
	under := spec.Nodes["confirm_p_low_card"].Actions["confirm"]
	if top.Hotkey == nil || *top.Hotkey != "enter" || under.Hotkey != nil {
		t.Fatalf("hotkeys: top=%+v under=%+v", top, under)
	}
	// Voice "ok" is held for the high-risk one; a keyboard "ok" confirms (it fails to execute: unknown note, which is fine here).
	out, err := s.Handle("ok", runtime.SourceVoice)
	if err != nil || out.Handled != "held" || out.ProposalID != "p_high" {
		t.Fatalf("voice ok on high risk: %+v %v", out, err)
	}
	if n := len(s.o.Gate.Pending()); n != 2 {
		t.Fatalf("pending after held = %d", n)
	}
	out, err = s.Handle("ok", runtime.SourceKeyboard)
	if err != nil || out.Handled != "confirmed" || out.ProposalID != "p_high" {
		t.Fatalf("keyboard ok on high risk: %+v %v", out, err)
	}
	// One left: it is now the top card and owns Enter.
	spec = s.Spec()
	if _, gone := spec.Nodes["confirm_p_high_card"]; gone {
		t.Fatal("confirmed card still shown")
	}
	a := spec.Nodes["confirm_p_low_card"].Actions["confirm"]
	if a.Hotkey == nil || *a.Hotkey != "enter" {
		t.Fatalf("remaining card not bound to enter: %+v", a)
	}
	if err := s.Reject("p_low", runtime.SourceKeyboard); err != nil {
		t.Fatal(err)
	}
	if _, shown := s.Spec().Nodes["proposals"]; shown {
		t.Fatal("overlay not removed with the last proposal")
	}
}
