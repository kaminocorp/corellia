// Package proactive puts things on screen unprompted (roadmap question
// 10): due reminders, and an ambient clock card on the hour when the
// screen is idle. Items go through the session, whose decider applies the
// interruption policy (hold while a turn runs or the agent speaks).
package proactive

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
)

// Item is something to surface.
type Item struct {
	Source string // reminder | ambient | runtime
	Title  string
	// Text is spoken (reminders) and shown in the card.
	Text string
	// Ops override the default card when set.
	Ops []map[string]any
	// TTL for the default card.
	TTL time.Duration
}

// Sink receives items (the session).
type Sink interface {
	Proactive(item Item)
	// Idle reports whether the screen is empty and no turn is running.
	Idle() bool
}

// Reminders is what the scheduler needs from the store.
type Reminders interface {
	Due(now time.Time) []builtin.Reminder
	Remove(id string) (bool, error)
}

// Scheduler fires reminders and the ambient clock.
type Scheduler struct {
	reminders Reminders
	sink      Sink
	now       func() time.Time
	loc       *time.Location
	logger    *slog.Logger
	// Ambient enables the on-the-hour clock card.
	Ambient bool

	mu        sync.Mutex
	lastHour  time.Time
	firedKeys map[string]bool
}

// New creates a scheduler; call Run or Tick.
func New(reminders Reminders, sink Sink, now func() time.Time, loc *time.Location) *Scheduler {
	if now == nil {
		now = time.Now
	}
	if loc == nil {
		loc = time.Local
	}
	return &Scheduler{reminders: reminders, sink: sink, now: now, loc: loc, logger: slog.Default(), Ambient: true, firedKeys: map[string]bool{}}
}

// Run ticks every interval until ctx ends.
func (s *Scheduler) Run(ctx context.Context, every time.Duration) {
	t := time.NewTicker(every)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			s.Tick()
		}
	}
}

// Tick fires whatever is due. Returns the number of items delivered.
func (s *Scheduler) Tick() int {
	now := s.now()
	n := 0
	for _, r := range s.reminders.Due(now) {
		s.sink.Proactive(Item{
			Source: "reminder",
			Title:  "Reminder",
			Text:   r.Text,
			TTL:    5 * time.Minute,
		})
		if _, err := s.reminders.Remove(r.ID); err != nil {
			s.logger.Error("proactive: remove reminder", "id", r.ID, "err", err)
		}
		n++
	}
	if s.Ambient {
		local := now.In(s.loc)
		hour := local.Truncate(time.Hour)
		s.mu.Lock()
		fresh := local.Minute() == 0 && !hour.Equal(s.lastHour)
		if fresh {
			s.lastHour = hour
		}
		s.mu.Unlock()
		if fresh && s.sink.Idle() {
			s.sink.Proactive(Item{
				Source: "ambient",
				Title:  "Clock",
				Ops: []map[string]any{
					{"op": "add_node", "id": "ambient_clock_text", "node": map[string]any{"type": "Stat", "props": map[string]any{"label": local.Format("Mon 2 Jan"), "value": local.Format("15:04")}, "ttl_ms": 120000}},
					{"op": "add_node", "id": "ambient_clock", "node": map[string]any{"type": "Overlay", "props": map[string]any{"position": "top_left"}, "slots": map[string]any{"content": []string{"ambient_clock_text"}}, "ttl_ms": 120000}},
				},
				TTL: 2 * time.Minute,
			})
			n++
		}
	}
	return n
}

// String implements fmt.Stringer for logs.
func (i Item) String() string { return fmt.Sprintf("%s:%s", i.Source, i.Title) }
