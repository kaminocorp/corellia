package builtin

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"sort"
	"strings"
	"sync"
	"time"
)

// InMemory implements MemoryStore and ReminderStore in process. Phase 9
// replaces it with the file-backed store; tests and keyless dev use this.
type InMemory struct {
	mu        sync.Mutex
	notes     []Note
	reminders []Reminder
	Now       func() time.Time
}

// NewInMemory creates an empty store.
func NewInMemory() *InMemory { return &InMemory{Now: time.Now} }

func (s *InMemory) Remember(_ context.Context, text string, tags []string) (Note, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	n := Note{ID: newID("m"), Text: strings.TrimSpace(text), Tags: tags, At: s.Now()}
	s.notes = append(s.notes, n)
	return n, nil
}

func (s *InMemory) Recall(_ context.Context, query string, limit int) ([]Note, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	q := strings.ToLower(strings.TrimSpace(query))
	var out []Note
	for i := len(s.notes) - 1; i >= 0; i-- {
		n := s.notes[i]
		if q == "" || strings.Contains(strings.ToLower(n.Text), q) || hasTag(n, q) {
			out = append(out, n)
		}
		if limit > 0 && len(out) >= limit {
			break
		}
	}
	return out, nil
}

func hasTag(n Note, q string) bool {
	for _, t := range n.Tags {
		if strings.ToLower(t) == q {
			return true
		}
	}
	return false
}

func (s *InMemory) Forget(_ context.Context, id string) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, n := range s.notes {
		if n.ID == id {
			s.notes = append(s.notes[:i], s.notes[i+1:]...)
			return true, nil
		}
	}
	return false, nil
}

func (s *InMemory) Add(_ context.Context, r Reminder) (Reminder, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if r.ID == "" {
		r.ID = newID("r")
	}
	s.reminders = append(s.reminders, r)
	sort.Slice(s.reminders, func(i, j int) bool { return s.reminders[i].At.Before(s.reminders[j].At) })
	return r, nil
}

// Reminders returns a copy of the scheduled reminders, soonest first.
func (s *InMemory) Reminders() []Reminder {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]Reminder(nil), s.reminders...)
}

func newID(prefix string) string {
	var b [5]byte
	_, _ = rand.Read(b[:])
	return prefix + "_" + hex.EncodeToString(b[:])
}
