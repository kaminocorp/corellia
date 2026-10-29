// Package memory is the file-backed memory and reminder store (roadmap
// question 11) and the transcript log. It implements the interfaces the
// built-in tools and the scheduler use, and renders the memory summary
// that goes into every runtime prompt.
package memory

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/store"
	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
)

const (
	memoryFile     = "memory.json"
	remindersFile  = "reminders.json"
	transcriptFile = "transcript.jsonl"
)

// Store persists notes and reminders as JSON documents and the transcript
// as JSONL.
type Store struct {
	s   *store.Store
	now func() time.Time

	mu        sync.Mutex
	notes     []builtin.Note
	reminders []builtin.Reminder
}

// Open loads existing data from dir.
func Open(s *store.Store, now func() time.Time) (*Store, error) {
	if now == nil {
		now = time.Now
	}
	m := &Store{s: s, now: now}
	var mem struct {
		Notes []builtin.Note `json:"notes"`
	}
	if err := s.ReadJSON(memoryFile, &mem); err != nil {
		return nil, fmt.Errorf("memory: %w", err)
	}
	m.notes = mem.Notes
	var rem struct {
		Reminders []builtin.Reminder `json:"reminders"`
	}
	if err := s.ReadJSON(remindersFile, &rem); err != nil {
		return nil, fmt.Errorf("reminders: %w", err)
	}
	m.reminders = rem.Reminders
	return m, nil
}

func (m *Store) saveNotesLocked() error {
	return m.s.WriteJSON(memoryFile, map[string]any{"notes": m.notes})
}

func (m *Store) saveRemindersLocked() error {
	sort.Slice(m.reminders, func(i, j int) bool { return m.reminders[i].At.Before(m.reminders[j].At) })
	return m.s.WriteJSON(remindersFile, map[string]any{"reminders": m.reminders})
}

// Remember implements builtin.MemoryStore.
func (m *Store) Remember(_ context.Context, text string, tags []string) (builtin.Note, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	n := builtin.Note{ID: newID("m"), Text: strings.TrimSpace(text), Tags: tags, At: m.now()}
	m.notes = append(m.notes, n)
	return n, m.saveNotesLocked()
}

// Recall implements builtin.MemoryStore (newest first; substring or tag match).
func (m *Store) Recall(_ context.Context, query string, limit int) ([]builtin.Note, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	q := strings.ToLower(strings.TrimSpace(query))
	var out []builtin.Note
	for i := len(m.notes) - 1; i >= 0; i-- {
		n := m.notes[i]
		if q == "" || strings.Contains(strings.ToLower(n.Text), q) || hasTag(n, q) {
			out = append(out, n)
		}
		if limit > 0 && len(out) >= limit {
			break
		}
	}
	return out, nil
}

func hasTag(n builtin.Note, q string) bool {
	for _, t := range n.Tags {
		if strings.ToLower(t) == q {
			return true
		}
	}
	return false
}

// Forget implements builtin.MemoryStore.
func (m *Store) Forget(_ context.Context, id string) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, n := range m.notes {
		if n.ID == id {
			m.notes = append(m.notes[:i], m.notes[i+1:]...)
			return true, m.saveNotesLocked()
		}
	}
	return false, nil
}

// Notes returns a copy of all notes, oldest first.
func (m *Store) Notes() []builtin.Note {
	m.mu.Lock()
	defer m.mu.Unlock()
	return append([]builtin.Note(nil), m.notes...)
}

// Summarise renders the most recent notes for a prompt ("" when empty).
func (m *Store) Summarise(limit int) string {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.notes) == 0 {
		return ""
	}
	start := 0
	if limit > 0 && len(m.notes) > limit {
		start = len(m.notes) - limit
	}
	var b strings.Builder
	for _, n := range m.notes[start:] {
		fmt.Fprintf(&b, "- (%s) %s", n.At.Format("2006-01-02"), n.Text)
		if len(n.Tags) > 0 {
			fmt.Fprintf(&b, " [%s]", strings.Join(n.Tags, ", "))
		}
		b.WriteString("\n")
	}
	return b.String()
}

// Add implements builtin.ReminderStore.
func (m *Store) Add(_ context.Context, r builtin.Reminder) (builtin.Reminder, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if r.ID == "" {
		r.ID = newID("r")
	}
	m.reminders = append(m.reminders, r)
	return r, m.saveRemindersLocked()
}

// Due returns reminders at or before now, soonest first.
func (m *Store) Due(now time.Time) []builtin.Reminder {
	m.mu.Lock()
	defer m.mu.Unlock()
	var out []builtin.Reminder
	for _, r := range m.reminders {
		if !r.At.After(now) {
			out = append(out, r)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].At.Before(out[j].At) })
	return out
}

// Pending returns all scheduled reminders, soonest first.
func (m *Store) Pending() []builtin.Reminder {
	m.mu.Lock()
	defer m.mu.Unlock()
	out := append([]builtin.Reminder(nil), m.reminders...)
	sort.Slice(out, func(i, j int) bool { return out[i].At.Before(out[j].At) })
	return out
}

// Remove deletes a reminder (after it fired or was cancelled).
func (m *Store) Remove(id string) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, r := range m.reminders {
		if r.ID == id {
			m.reminders = append(m.reminders[:i], m.reminders[i+1:]...)
			return true, m.saveRemindersLocked()
		}
	}
	return false, nil
}

// AppendTranscript logs one entry.
func (m *Store) AppendTranscript(e gen.TranscriptEntry) error {
	return m.s.AppendJSONL(transcriptFile, e)
}

// LoadTranscript returns the last limit entries.
func (m *Store) LoadTranscript(limit int) ([]gen.TranscriptEntry, error) {
	var out []gen.TranscriptEntry
	err := m.s.ReadJSONL(transcriptFile, func(raw []byte) error {
		var e gen.TranscriptEntry
		if json.Unmarshal(raw, &e) == nil && e.Text != "" {
			out = append(out, e)
			if limit > 0 && len(out) > limit {
				out = out[len(out)-limit:]
			}
		}
		return nil
	})
	return out, err
}

func newID(prefix string) string {
	var b [5]byte
	_, _ = rand.Read(b[:])
	return prefix + "_" + hex.EncodeToString(b[:])
}
