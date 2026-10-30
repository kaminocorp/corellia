package session

import (
	"errors"
	"fmt"
	"strings"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

// The history window drops entries in steps so the cached prefix stays the
// same across several turns (review 2026-10-30 round 5: it slid by one pair
// per turn, so past 20 entries the provider cache hit only the system block).
func TestHistoryStart(t *testing.T) {
	cases := []struct{ n, limit, step, want int }{
		{0, 20, 10, 0}, {20, 20, 10, 0}, {21, 20, 10, 0}, {29, 20, 10, 0},
		{30, 20, 10, 10}, {39, 20, 10, 10}, {40, 20, 10, 20}, {41, 20, 10, 20},
		{25, 20, 1, 5}, {25, 20, 0, 5}, {100, 20, 10, 80},
	}
	for _, c := range cases {
		if got := historyStart(c.n, c.limit, c.step); got != c.want {
			t.Errorf("historyStart(%d, %d, %d) = %d, want %d", c.n, c.limit, c.step, got, c.want)
		}
		if got := historyStart(c.n, c.limit, c.step); c.n > c.limit && c.n-got < c.limit {
			t.Errorf("historyStart(%d, %d, %d) leaves %d entries, fewer than the limit", c.n, c.limit, c.step, c.n-got)
		}
	}
}

// Across turns the previous request's history is a prefix of the next one,
// except at a step boundary, where it is at most once per step entries.
func TestHistoryPrefixIsStableBetweenSteps(t *testing.T) {
	rt := &capturing{scripted: scripted{events: []runtime.Event{{Kind: runtime.EventTextDelta, Text: "reply"}, {Kind: runtime.EventDone}}}}
	s := New(Options{Registry: reg(t), Runtime: rt, HistoryLimit: 6, HistoryStep: 4})
	defer s.Close()
	var prev []string
	moves := 0
	for i := 0; i < 20; i++ {
		id, _, err := s.StartTurn(fmt.Sprintf("q%d", i), runtime.SourceKeyboard)
		if err != nil {
			t.Fatal(err)
		}
		s.WaitTurn(id)
		turn := rt.turns[len(rt.turns)-1]
		var hist []string
		for _, m := range turn.History {
			hist = append(hist, m.Role+":"+m.Text)
		}
		// The current user text is the last entry; the prefix before it must
		// extend the previous request's history unless the window moved.
		if len(prev) > 0 && !(len(hist) > len(prev) && strings.Join(hist[:len(prev)], ",") == strings.Join(prev, ",")) {
			moves++
		}
		if len(hist) < 6 && i >= 3 {
			t.Fatalf("turn %d: history has %d entries, fewer than the limit: %v", i, len(hist), hist)
		}
		prev = hist
	}
	// 20 turns write 40 entries; with limit 6 and step 4 the start moves at
	// 10, 14, 18, ... 38 entries: eight times, never on consecutive turns.
	if moves < 7 || moves > 9 {
		t.Fatalf("window moved %d times in 20 turns; a sliding-by-one window would move on every turn past the limit", moves)
	}
}

type failingTranscript struct{ err error }

func (f failingTranscript) AppendTranscript(gen.TranscriptEntry) error { return f.err }
func (f failingTranscript) LoadTranscript(int) ([]gen.TranscriptEntry, error) {
	return nil, nil
}

// A store that cannot write is reported on the event stream, not only in
// the log (review 2026-10-30 round 5: the Docker image on a root-owned
// volume served as if nothing were wrong).
func TestPersistFailureIsAnEvent(t *testing.T) {
	rt := &scripted{events: []runtime.Event{{Kind: runtime.EventTextDelta, Text: "ok"}, {Kind: runtime.EventDone}}}
	s := New(Options{Registry: reg(t), Runtime: rt, Transcript: failingTranscript{errors.New("open transcript.jsonl: permission denied")}})
	defer s.Close()
	ch, unsub := s.Subscribe(0)
	defer unsub()
	id, _, _ := s.StartTurn("hello", runtime.SourceKeyboard)
	evs := drainUntil(t, ch, "turn_done", id)
	var persist []map[string]any
	for _, e := range evs {
		if e["type"] == "session_error" && e["code"] == "persist" {
			persist = append(persist, e)
		}
	}
	if len(persist) < 2 {
		t.Fatalf("want a persist error for the user and the agent entry, got %d in %v", len(persist), types(evs))
	}
	if msg, _ := persist[0]["message"].(string); !strings.Contains(msg, "permission denied") {
		t.Fatalf("message = %q", msg)
	}
	if fatal, _ := persist[0]["fatal"].(bool); fatal {
		t.Fatal("a persist failure must not be fatal: the turn itself succeeded")
	}
}
