package session

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/memory"
	"github.com/hejijunhao/corellia/backend/internal/proactive"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/local"
	"github.com/hejijunhao/corellia/backend/internal/store"
)

func TestProactiveReminderDeliveredWhenIdle(t *testing.T) {
	now := time.Date(2026, 10, 29, 17, 0, 0, 0, time.UTC)
	s := New(Options{Registry: reg(t), Runtime: &local.Runtime{}, Now: func() time.Time { return now }})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	if !s.Idle() {
		t.Fatal("should be idle")
	}
	s.Proactive(proactive.Item{Source: "reminder", Title: "Reminder", Text: "Call Ana.", TTL: time.Minute})
	evs := drainUntil(t, ch, "speech", "")
	kinds := types(evs)
	if kinds[0] != "proactive" || !strings.Contains(strings.Join(kinds, ","), "spec_op") {
		t.Fatalf("kinds = %v", kinds)
	}
	if evs[len(evs)-1]["text"] != "Reminder: Call Ana." {
		t.Fatalf("speech = %v", evs[len(evs)-1])
	}
	spec := s.Spec()
	if _, ok := spec.Nodes["proactive_reminder"]; !ok {
		t.Fatalf("card missing: %v", spec.Nodes)
	}
	if s.Idle() {
		t.Fatal("screen has a card; not idle")
	}
	tr := s.Snapshot()["transcript"].([]gen.TranscriptEntry)
	if len(tr) != 1 || *tr[0].Source != "proactive" {
		t.Fatalf("transcript = %+v", tr)
	}
}

func TestProactiveHeldDuringTurnThenReleased(t *testing.T) {
	block := make(chan struct{})
	rt := &scripted{block: block, events: []runtime.Event{{Kind: runtime.EventTextDelta, Text: "ok"}, {Kind: runtime.EventDone}}}
	s := New(Options{Registry: reg(t), Runtime: rt})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("x", runtime.SourceKeyboard)
	s.Proactive(proactive.Item{Source: "ambient", Title: "Clock", Text: "14:00"})
	if s.HeldCount() != 1 {
		t.Fatal("item not held during turn")
	}
	close(block)
	drainUntil(t, ch, "turn_done", id)
	evs := drainUntil(t, ch, "proactive", "")
	if evs[len(evs)-1]["source"] != "ambient" {
		t.Fatalf("released item = %v", evs[len(evs)-1])
	}
	if s.HeldCount() != 0 {
		t.Fatal("held queue not drained")
	}
	// Ambient items show a card but never speak.
	for _, e := range drainUntil(t, ch, "spec_op", "") {
		if e["type"] == "speech" {
			t.Fatal("ambient item spoke")
		}
	}
}

func TestProactiveHeldWhileSpeaking(t *testing.T) {
	now := time.Date(2026, 10, 29, 17, 0, 0, 0, time.UTC)
	s := New(Options{Registry: reg(t), Runtime: &local.Runtime{}, Now: func() time.Time { return now }})
	defer s.Close()
	s.publishSpeech("", []string{strings.Repeat("a", 100)}) // ~6 s of speech
	s.Proactive(proactive.Item{Source: "reminder", Title: "R", Text: "x"})
	if s.HeldCount() != 1 {
		t.Fatal("not held while speaking")
	}
	now = now.Add(10 * time.Second)
	s.releaseHeld()
	if s.HeldCount() != 0 {
		t.Fatal("not released after speech ended")
	}
}

type contextCapture struct{ memory string }

func (c *contextCapture) Name() string                       { return "capture" }
func (c *contextCapture) Capabilities() runtime.Capabilities { return runtime.Capabilities{} }
func (c *contextCapture) Start(_ context.Context, turn runtime.Turn) (<-chan runtime.Event, error) {
	c.memory = turn.Context.MemorySummary
	out := make(chan runtime.Event, 1)
	out <- runtime.Event{Kind: runtime.EventDone}
	close(out)
	return out, nil
}

func TestMemoryAndTranscriptPersistence(t *testing.T) {
	dir := t.TempDir()
	now := time.Date(2026, 10, 29, 9, 0, 0, 0, time.UTC)
	st, _ := store.New(dir)
	mem, err := memory.Open(st, func() time.Time { return now })
	if err != nil {
		t.Fatal(err)
	}
	_, _ = mem.Remember(context.Background(), "Ana prefers oat milk", nil)
	rt := &contextCapture{}
	s := New(Options{Registry: reg(t), Runtime: rt, Memory: mem, Transcript: mem, Now: func() time.Time { return now }})
	id, _, _ := s.StartTurn("hello", runtime.SourceKeyboard)
	s.WaitTurn(id)
	s.Close()
	if !strings.Contains(rt.memory, "oat milk") {
		t.Fatalf("memory summary not in prompt: %q", rt.memory)
	}

	// Restart: transcript survives, yesterday's entries are not replayed.
	st2, _ := store.New(dir)
	mem2, _ := memory.Open(st2, nil)
	_ = mem2.AppendTranscript(gen.TranscriptEntry{Role: "user", Text: "old", Ts: now.Add(-48 * time.Hour)})
	s2 := New(Options{Registry: reg(t), Runtime: rt, Memory: mem2, Transcript: mem2, Now: func() time.Time { return now }})
	defer s2.Close()
	snap := s2.Snapshot()["transcript"].([]gen.TranscriptEntry)
	if len(snap) != 1 || snap[0].Text != "hello" {
		t.Fatalf("replayed transcript = %+v", snap)
	}
}
