package proactive

import (
	"context"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
)

type fakeReminders struct {
	due     []builtin.Reminder
	removed []string
}

func (f *fakeReminders) Due(time.Time) []builtin.Reminder { return f.due }
func (f *fakeReminders) Remove(id string) (bool, error) {
	f.removed = append(f.removed, id)
	f.due = nil
	return true, nil
}

type fakeSink struct {
	items []Item
	idle  bool
}

func (f *fakeSink) Proactive(i Item) { f.items = append(f.items, i) }
func (f *fakeSink) Idle() bool       { return f.idle }

func TestTickFiresDueRemindersOnce(t *testing.T) {
	now := time.Date(2026, 10, 29, 14, 30, 0, 0, time.UTC)
	rem := &fakeReminders{due: []builtin.Reminder{{ID: "r1", Text: "call Ana", At: now}}}
	sink := &fakeSink{}
	s := New(rem, sink, func() time.Time { return now }, time.UTC)
	if n := s.Tick(); n != 1 || len(sink.items) != 1 || sink.items[0].Source != "reminder" || sink.items[0].Text != "call Ana" {
		t.Fatalf("n=%d items=%+v", n, sink.items)
	}
	if rem.removed[0] != "r1" {
		t.Fatal("reminder not removed")
	}
	if n := s.Tick(); n != 0 {
		t.Fatal("fired twice")
	}
}

func TestAmbientClockOnTheHourWhenIdle(t *testing.T) {
	now := time.Date(2026, 10, 29, 15, 0, 10, 0, time.UTC)
	sink := &fakeSink{idle: false}
	s := New(&fakeReminders{}, sink, func() time.Time { return now }, time.UTC)
	if s.Tick() != 0 {
		t.Fatal("fired while busy")
	}
	// Busy at the top of the hour means this hour is skipped (no catch-up).
	sink.idle = true
	if s.Tick() != 0 {
		t.Fatal("caught up on a skipped hour")
	}
	now = now.Add(time.Hour)
	if s.Tick() != 1 || sink.items[0].Source != "ambient" || len(sink.items[0].Ops) != 2 {
		t.Fatalf("items = %+v", sink.items)
	}
	now = now.Add(30 * time.Second)
	if s.Tick() != 0 {
		t.Fatal("fired twice in the same hour")
	}
	s.Ambient = false
	now = now.Add(time.Hour)
	if s.Tick() != 0 {
		t.Fatal("ambient disabled but fired")
	}
}

func TestRunStopsWithContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	s := New(&fakeReminders{}, &fakeSink{}, nil, nil)
	done := make(chan struct{})
	go func() {
		s.Run(ctx, time.Millisecond)
		close(done)
	}()
	cancel()
	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("Run did not stop")
	}
}
