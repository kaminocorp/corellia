package memory

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/store"
	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
)

func TestPersistsAcrossReopen(t *testing.T) {
	dir := t.TempDir()
	now := time.Date(2026, 10, 29, 14, 0, 0, 0, time.UTC)
	s, _ := store.New(dir)
	m, err := Open(s, func() time.Time { return now })
	if err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	n, _ := m.Remember(ctx, "Ana prefers oat milk", []string{"people"})
	_, _ = m.Remember(ctx, "The office code is 4421", nil)
	r, _ := m.Add(ctx, builtin.Reminder{Text: "call Ana", At: now.Add(time.Hour)})
	_ = m.AppendTranscript(gen.TranscriptEntry{Role: "user", Text: "hello", Ts: now})
	_ = m.AppendTranscript(gen.TranscriptEntry{Role: "agent", Text: "hi", Ts: now})

	s2, _ := store.New(dir)
	m2, err := Open(s2, nil)
	if err != nil {
		t.Fatal(err)
	}
	if notes := m2.Notes(); len(notes) != 2 || notes[0].ID != n.ID {
		t.Fatalf("notes = %+v", notes)
	}
	sum := m2.Summarise(10)
	if !strings.Contains(sum, "(2026-10-29) Ana prefers oat milk [people]") || !strings.Contains(sum, "4421") {
		t.Fatalf("summary = %q", sum)
	}
	if m2.Summarise(1) != "- (2026-10-29) The office code is 4421\n" {
		t.Fatalf("limited summary = %q", m2.Summarise(1))
	}
	if p := m2.Pending(); len(p) != 1 || p[0].ID != r.ID {
		t.Fatalf("pending = %+v", p)
	}
	if due := m2.Due(now); len(due) != 0 {
		t.Fatal("not due yet")
	}
	if due := m2.Due(now.Add(2 * time.Hour)); len(due) != 1 {
		t.Fatal("should be due")
	}
	tr, _ := m2.LoadTranscript(10)
	if len(tr) != 2 || tr[1].Text != "hi" {
		t.Fatalf("transcript = %+v", tr)
	}
	tr, _ = m2.LoadTranscript(1)
	if len(tr) != 1 || tr[0].Text != "hi" {
		t.Fatalf("transcript tail = %+v", tr)
	}
	ok, _ := m2.Forget(ctx, n.ID)
	if !ok || len(m2.Notes()) != 1 {
		t.Fatal("forget failed")
	}
	if ok, _ := m2.Remove(r.ID); !ok || len(m2.Pending()) != 0 {
		t.Fatal("remove failed")
	}
	notes, _ := m2.Recall(ctx, "code", 5)
	if len(notes) != 1 {
		t.Fatalf("recall = %+v", notes)
	}
	if Summary := (&Store{}).Summarise(5); Summary != "" {
		t.Fatal("empty store should summarise to empty")
	}
}
