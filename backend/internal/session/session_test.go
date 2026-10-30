package session

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/actions"
	"github.com/hejijunhao/corellia/backend/internal/tools"
	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/local"
	"github.com/hejijunhao/corellia/backend/internal/runtime/prompt"
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
	after  int           // ... after this many events (0: before the first)
}

func (s *scripted) Name() string { return "scripted" }
func (s *scripted) Capabilities() runtime.Capabilities {
	return runtime.Capabilities{Streaming: true, UIOps: true}
}
func (s *scripted) Start(ctx context.Context, _ runtime.Turn) (<-chan runtime.Event, error) {
	out := make(chan runtime.Event)
	go func() {
		defer close(out)
		for i, ev := range s.events {
			if s.block != nil && i == s.after {
				select {
				case <-s.block:
				case <-ctx.Done():
					return
				}
			}
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
	if seen["turn_started"] != 1 || seen["text_delta"] == 0 || seen["spec_op"] < 5 || seen["speech"] == 0 {
		t.Fatalf("event mix = %v", seen)
	}
	if seen["session_error"] != 0 {
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
		if e["type"] == "session_error" {
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
	// Each turn says "late" and then blocks until released.
	rt := &scripted{block: block, after: 1, events: []runtime.Event{{Kind: runtime.EventTextDelta, Text: "late"}, {Kind: runtime.EventDone}}}
	s := New(Options{Registry: reg(t), Runtime: rt})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	first, _, _ := s.StartTurn("one", runtime.SourceKeyboard)
	drainUntil(t, ch, "text_delta", first)
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
	// The cancelled turn's partial reply stays on screen, marked, and the
	// model never sees it as its own words.
	s.mu.Lock()
	tr := s.transcript
	hist := s.historyLocked()
	s.mu.Unlock()
	var cut *gen.TranscriptEntry
	for i := range tr {
		if tr[i].TurnID != nil && string(*tr[i].TurnID) == first && tr[i].Role == gen.TranscriptEntryRoleAgent {
			cut = &tr[i]
		}
	}
	if cut == nil || cut.Cancelled == nil || !*cut.Cancelled || cut.Text != "late…" {
		t.Fatalf("cancelled entry = %+v", cut)
	}
	// Both turns streamed "late"; only the second, completed one is history.
	var roles []string
	for _, m := range hist {
		roles = append(roles, m.Role+":"+m.Text)
	}
	if got := strings.Join(roles, ","); got != "user:one,user:two,agent:late" {
		t.Fatalf("history = %s", got)
	}
}

// capturing records the turns it is started with.
type capturing struct {
	scripted
	turns []runtime.Turn
}

func (c *capturing) Start(ctx context.Context, turn runtime.Turn) (<-chan runtime.Event, error) {
	c.turns = append(c.turns, turn)
	return c.scripted.Start(ctx, turn)
}

// Options.Location sets the clock the runtime sees, so the prompt's date
// and time agree with the tools and the scheduler, which already read
// CORELLIA_TZ (review 2026-10-30 round 4, item 3).
func TestClockFollowsLocation(t *testing.T) {
	sg, err := time.LoadLocation("Asia/Singapore")
	if err != nil {
		t.Skip(err)
	}
	rt := &capturing{scripted: scripted{events: []runtime.Event{{Kind: runtime.EventTextDelta, Text: "ok"}, {Kind: runtime.EventDone}}}}
	s := New(Options{Registry: reg(t), Runtime: rt, Location: sg})
	defer s.Close()
	id, _, _ := s.StartTurn("what day is it", runtime.SourceKeyboard)
	s.WaitTurn(id)
	if len(rt.turns) != 1 || rt.turns[0].Context.Now == nil {
		t.Fatalf("turns = %+v", rt.turns)
	}
	now := rt.turns[0].Context.Now()
	if now.Location().String() != "Asia/Singapore" {
		t.Fatalf("clock zone = %s, want Asia/Singapore", now.Location())
	}
	if _, off := now.Zone(); off != 8*3600 {
		t.Fatalf("clock offset = %d, want +08:00", off)
	}
	if !strings.Contains(prompt.TurnContext(rt.turns[0].Context), "(+08)") {
		t.Fatalf("prompt clock = %q", prompt.TurnContext(rt.turns[0].Context))
	}
	// Timestamps the session writes follow too.
	s.mu.Lock()
	ts := s.transcript[0].Ts
	s.mu.Unlock()
	if ts.Location().String() != "Asia/Singapore" {
		t.Fatalf("transcript ts zone = %s", ts.Location())
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
	if evs[len(evs)-1]["modality"] != "both" {
		t.Fatalf("modality = %v (long text replies get a text card)", evs[len(evs)-1]["modality"])
	}
	s.WaitTurn(id)
	if _, ok := s.Spec().Nodes["reply_card"]; !ok {
		t.Fatal("reply card missing")
	}
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

func gated(t *testing.T) (*Session, *tools.Registry, *builtin.InMemory) {
	t.Helper()
	now := time.Date(2026, 10, 29, 14, 0, 0, 0, time.UTC)
	store := builtin.NewInMemory()
	reg := tools.NewRegistry()
	reg.NewProposalID = func() string { return "p_fixed" }
	builtin.Register(reg, builtin.Options{Now: func() time.Time { return now }, Location: time.UTC, Memory: store, Reminders: store,
		HTTP: &http.Client{Timeout: time.Millisecond, Transport: failingTransport{}}})
	g := actions.New(reg, time.Minute, func() time.Time { return now })
	s := New(Options{Registry: reg0(t), Runtime: &local.Runtime{}, Tools: reg, Gate: g, Now: func() time.Time { return now }})
	t.Cleanup(s.Close)
	return s, reg, store
}

type failingTransport struct{}

func (failingTransport) RoundTrip(*http.Request) (*http.Response, error) {
	return nil, errors.New("network disabled in tests")
}

func reg0(t *testing.T) *contract.Registry { return reg(t) }

func TestProposeConfirmFlow(t *testing.T) {
	s, _, store := gated(t)
	ch, unsub := s.Subscribe(0)
	defer unsub()
	out, err := s.Handle("remind me to call Ana at 17:00", runtime.SourceVoice)
	if err != nil || out.Handled != "turn" {
		t.Fatalf("handle = %+v %v", out, err)
	}
	statuses := map[string]bool{}
	note := func(evs []map[string]any) {
		for _, e := range evs {
			if e["type"] == "proposal" {
				statuses[e["status"].(string)] = true
			}
		}
	}
	note(drainUntil(t, ch, "turn_done", out.TurnID))
	s.WaitTurn(out.TurnID)
	spec := s.Spec()
	if _, ok := spec.Nodes["confirm_p_fixed_card"]; !ok {
		t.Fatalf("confirm card missing: %v", spec.Nodes)
	}
	if len(s.Snapshot()["pending_proposals"].([]gen.Proposal)) != 1 {
		t.Fatal("snapshot lacks the proposal")
	}
	// A confirmation phrase confirms instead of starting a turn.
	out, err = s.Handle("yes, do it!", runtime.SourceVoice)
	if err != nil || out.Handled != "confirmed" || out.ProposalID != "p_fixed" {
		t.Fatalf("handle = %+v %v", out, err)
	}
	note(drainUntil(t, ch, "speech", ""))
	if !statuses["pending"] || !statuses["confirmed"] || !statuses["executed"] {
		t.Fatalf("statuses = %v", statuses)
	}
	if rs := store.Reminders(); len(rs) != 1 || rs[0].Text != "call Ana" {
		t.Fatalf("reminders = %+v", rs)
	}
	spec = s.Spec()
	if _, ok := spec.Nodes["confirm_p_fixed_card"]; ok {
		t.Fatal("confirm card not removed")
	}
	if _, ok := spec.Nodes["status_reminder"]; !ok {
		t.Fatal("reminder status card missing")
	}
	if len(s.PendingProposals()) != 0 {
		t.Fatal("proposal still pending")
	}
	// A second confirmation phrase with nothing pending is a normal turn.
	out, _ = s.Handle("ok", runtime.SourceKeyboard)
	if out.Handled != "turn" {
		t.Fatalf("handle = %+v", out)
	}
}

func TestRejectAndExpireFlow(t *testing.T) {
	s, _, store := gated(t)
	out, _ := s.Handle("remind me to call Ana", runtime.SourceKeyboard)
	s.WaitTurn(out.TurnID)
	if out, err := s.Handle("no", runtime.SourceVoice); err != nil || out.Handled != "rejected" {
		t.Fatalf("reject = %+v %v", out, err)
	}
	if len(store.Reminders()) != 0 || len(s.PendingProposals()) != 0 {
		t.Fatal("reject executed or left the proposal")
	}
	if _, ok := s.Spec().Nodes["confirm_p_fixed_card"]; ok {
		t.Fatal("card not removed on reject")
	}
	// Expiry: the gate clock is fixed, so use a gate with a tiny TTL.
	s2, reg2, _ := gated(t)
	_ = reg2
	s2.o.Gate = actions.New(reg2, time.Nanosecond, time.Now)
	out, _ = s2.Handle("remind me", runtime.SourceKeyboard)
	s2.WaitTurn(out.TurnID)
	time.Sleep(time.Millisecond)
	if n := s2.ExpireProposals(); n != 1 {
		t.Fatalf("expired %d", n)
	}
	if _, ok := s2.Spec().Nodes["confirm_p_fixed_card"]; ok {
		t.Fatal("card not removed on expiry")
	}
}

func TestFireActionToolAndProposeKinds(t *testing.T) {
	s, _, _ := gated(t)
	out, _ := s.Handle("show me a map of Lisbon", runtime.SourceKeyboard)
	s.WaitTurn(out.TurnID)
	// The map card's Navigate action is a propose of open_directions with a bound arg.
	if err := s.FireAction("nav", "card"); err != nil {
		t.Fatalf("propose action: %v", err)
	}
	p := s.PendingProposals()
	if len(p) != 1 || p[0].Tool != "open_directions" {
		t.Fatalf("pending = %+v", p)
	}
	to, _ := p[0].Args["to"].([]any)
	if len(to) != 2 {
		t.Fatalf("bound arg not resolved: %v", p[0].Args)
	}
	// Confirm via the Enter action wired on the card.
	if err := s.FireAction("confirm_p_fixed_yes", ""); err != nil {
		t.Fatalf("confirm action: %v", err)
	}
	spec := s.Spec()
	if spec.Root == nil || *spec.Root != "route_map" {
		t.Fatalf("directions not rendered (routing falls back to a straight line): root=%v", spec.Root)
	}
	// A plain tool action runs immediately.
	if err := s.publishLocalOp(map[string]any{"op": "set_action", "id": "t", "action": map[string]any{"kind": "tool", "tool": "get_time", "args": map[string]any{}}}); err != nil {
		t.Fatal(err)
	}
	if err := s.FireAction("t", ""); err != nil {
		t.Fatal(err)
	}
	tr := s.Snapshot()["transcript"].([]gen.TranscriptEntry)
	if last := tr[len(tr)-1]; last.Role != "agent" || !strings.Contains(last.Text, "14:00") {
		t.Fatalf("tool result not spoken: %+v", last)
	}
}

func TestLocalRuntimeUsesRegistryForTime(t *testing.T) {
	s, _, _ := gated(t)
	out, _ := s.Handle("what time is it", runtime.SourceKeyboard)
	s.WaitTurn(out.TurnID)
	tr := s.Snapshot()["transcript"].([]gen.TranscriptEntry)
	if !strings.Contains(tr[len(tr)-1].Text, "14:00 on Thursday 29 October 2026") {
		t.Fatalf("reply = %q", tr[len(tr)-1].Text)
	}
}

// TestSpeechStreamsDuringTurn: sentences are published as speech while the
// runtime is still writing, the remainder goes out at the end and the
// transcript still holds the whole reply once (Phase 12, VISION 7
// criterion 1).
func TestSpeechStreamsDuringTurn(t *testing.T) {
	gate := make(chan struct{})
	rt := &pacedRuntime{deltas: []string{"The first sentence ", "is done. The second ", "one too! And a tail"}, gate: gate}
	s := New(Options{Registry: reg(t), Runtime: rt})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("tell me", runtime.SourceKeyboard)
	// Two deltas in: the first sentence must already be speech, with no turn_done yet.
	gate <- struct{}{}
	gate <- struct{}{}
	evs := drainUntil(t, ch, "speech", id)
	if last := evs[len(evs)-1]; last["text"] != "The first sentence is done." || last["final"] != false {
		t.Fatalf("first streamed piece = %v", last)
	}
	for _, e := range evs {
		if e["type"] == "turn_done" {
			t.Fatal("turn_done before the streamed speech")
		}
	}
	gate <- struct{}{}
	close(gate)
	evs = drainUntil(t, ch, "turn_done", id)
	var speech []string
	finals := 0
	for _, e := range evs {
		if e["type"] == "speech" {
			speech = append(speech, e["text"].(string))
			if e["final"] == true {
				finals++
			}
		}
	}
	if strings.Join(speech, "|") != "The second one too!|And a tail" || finals != 1 {
		t.Fatalf("speech after the first piece = %v (finals %d)", speech, finals)
	}
	s.WaitTurn(id)
	tr := s.Snapshot()["transcript"].([]gen.TranscriptEntry)
	if len(tr) != 2 || tr[1].Text != "The first sentence is done. The second one too! And a tail" {
		t.Fatalf("transcript = %+v", tr)
	}
}

// pacedRuntime emits one text delta per receive on gate, then done when gate closes.
type pacedRuntime struct {
	deltas []string
	gate   chan struct{}
}

func (g *pacedRuntime) Name() string { return "paced" }
func (g *pacedRuntime) Capabilities() runtime.Capabilities {
	return runtime.Capabilities{Streaming: true}
}
func (g *pacedRuntime) Start(ctx context.Context, _ runtime.Turn) (<-chan runtime.Event, error) {
	out := make(chan runtime.Event)
	go func() {
		defer close(out)
		for _, d := range g.deltas {
			select {
			case _, ok := <-g.gate:
				if !ok {
					return
				}
			case <-ctx.Done():
				return
			}
			select {
			case out <- runtime.Event{Kind: runtime.EventTextDelta, Text: d}:
			case <-ctx.Done():
				return
			}
		}
		<-g.gate
		out <- runtime.Event{Kind: runtime.EventDone}
	}()
	return out, nil
}
