package session

import (
	"fmt"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/decision"
	"github.com/hejijunhao/corellia/backend/internal/proactive"
)

// Idle implements proactive.Sink: nothing on screen and no turn running.
func (s *Session) Idle() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.active == nil && s.spec.Root == nil && len(s.spec.Nodes) == 0
}

// Proactive implements proactive.Sink. The decider applies the
// interruption policy: items that arrive while a turn runs or the agent
// is speaking are held and delivered when the turn finishes.
func (s *Session) Proactive(item proactive.Item) {
	s.mu.Lock()
	busy := s.active != nil
	speaking := s.speakingUntil.After(s.o.Now())
	s.mu.Unlock()
	d := s.o.Decider.Decide(decision.Input{
		Source: "proactive", Proactive: item.Source, ReplyText: item.Text,
		TurnActive: busy, Speaking: speaking, Now: s.o.Now(),
	})
	if !d.Respond {
		return
	}
	if d.Timing == decision.TimingHold {
		s.mu.Lock()
		s.held = append(s.held, item)
		// Held only because speech is playing: release once it should be
		// over (a running turn releases on turn_done instead).
		if !busy && speaking && s.releaseTimer == nil {
			delay := s.speakingUntil.Sub(s.o.Now()) + 200*time.Millisecond
			s.releaseTimer = time.AfterFunc(delay, func() {
				s.mu.Lock()
				s.releaseTimer = nil
				s.mu.Unlock()
				s.releaseHeld()
			})
		}
		s.mu.Unlock()
		return
	}
	s.deliver(item, d)
}

func (s *Session) deliver(item proactive.Item, d decision.Decision) {
	turnID := newID("px")
	s.bus.Publish("proactive", map[string]any{"turn_id": turnID, "source": item.Source, "title": item.Title})
	if len(item.Ops) > 0 {
		for _, op := range item.Ops {
			if err := s.publishLocalOp(op); err != nil {
				s.o.Logger.Error("session: proactive op", "err", err)
			}
		}
	} else if d.AutoCard && item.Text != "" {
		ttl := item.TTL
		if ttl <= 0 {
			ttl = d.AutoCardTTL
		}
		s.showProactiveCard(item, ttl)
	}
	if len(d.Speech) > 0 {
		s.mu.Lock()
		s.appendTranscriptLocked(gen.TranscriptEntry{Role: gen.TranscriptEntryRoleAgent, Text: item.Title + ": " + item.Text, Ts: s.o.Now(), TurnID: ptr(gen.TurnID(turnID)), Source: ptr(gen.TranscriptEntrySourceProactive)})
		s.mu.Unlock()
		s.publishSpeech(turnID, d.Speech)
	}
}

func (s *Session) showProactiveCard(item proactive.Item, ttl time.Duration) {
	ttlMs := int(ttl / time.Millisecond)
	id := "proactive_" + sanitizeID(item.Source)
	ops := []map[string]any{
		{"op": "add_node", "id": id + "_text", "node": map[string]any{"type": "Markdown", "props": map[string]any{"text": truncate(item.Text, 1200)}}},
		{"op": "add_node", "id": id + "_card", "node": map[string]any{"type": "Card", "props": map[string]any{"title": item.Title, "accent": "amber"}, "slots": map[string]any{"body": []string{id + "_text"}}, "ttl_ms": ttlMs}},
		{"op": "add_node", "id": id, "node": map[string]any{"type": "Overlay", "props": map[string]any{"position": "top_left"}, "slots": map[string]any{"content": []string{id + "_card"}}, "ttl_ms": ttlMs}},
	}
	for _, op := range ops {
		if err := s.publishLocalOp(op); err != nil {
			s.o.Logger.Error("session: proactive card", "err", err)
			return
		}
	}
}

// releaseHeld delivers items held during a turn. Called after turn_done.
func (s *Session) releaseHeld() {
	s.mu.Lock()
	held := s.held
	s.held = nil
	s.mu.Unlock()
	for _, item := range held {
		s.Proactive(item)
	}
}

// HeldCount reports queued proactive items (tests).
func (s *Session) HeldCount() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.held)
}

var _ proactive.Sink = (*Session)(nil)

// estimateSpeech guesses how long text takes to say.
func estimateSpeech(pieces []string) time.Duration {
	n := 0
	for _, p := range pieces {
		n += len(p)
	}
	return time.Duration(n) * 60 * time.Millisecond
}

func describeHeld(items []proactive.Item) string {
	var parts []string
	for _, it := range items {
		parts = append(parts, fmt.Sprint(it))
	}
	return fmt.Sprint(parts)
}
