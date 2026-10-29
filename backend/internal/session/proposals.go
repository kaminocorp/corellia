package session

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/actions"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/decision"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/uispec"
)

// Outcome is what Handle did with a piece of user input.
type Outcome struct {
	Handled         string // turn | confirmed | rejected
	TurnID          string
	CancelledTurnID string
	ProposalID      string
}

var (
	wordRe       = regexp.MustCompile(`[a-z']+`)
	confirmWords = set("yes", "yeah", "yep", "ok", "okay", "sure", "do", "it", "go", "ahead", "confirm", "confirmed", "proceed", "approve", "please", "fine", "absolutely", "correct", "right", "that", "yup")
	confirmKeys  = set("yes", "yeah", "yep", "ok", "okay", "sure", "confirm", "confirmed", "proceed", "approve", "fine", "absolutely", "correct", "do", "go", "yup")
	rejectWords  = set("no", "nope", "cancel", "never", "mind", "nevermind", "stop", "reject", "abort", "don't", "dont", "do", "not", "that", "it", "please", "thanks", "forget")
	rejectKeys   = set("no", "nope", "cancel", "never", "nevermind", "stop", "reject", "abort", "don't", "dont", "not", "forget")
)

func set(words ...string) map[string]bool {
	m := make(map[string]bool, len(words))
	for _, w := range words {
		m[w] = true
	}
	return m
}

// phrase reports whether text consists only of words from allowed and
// contains at least one key word.
func phrase(text string, allowed, keys map[string]bool) bool {
	words := wordRe.FindAllString(strings.ToLower(text), -1)
	if len(words) == 0 || len(words) > 6 {
		return false
	}
	hasKey := false
	for _, w := range words {
		if !allowed[w] {
			return false
		}
		if keys[w] {
			hasKey = true
		}
	}
	return hasKey
}

// IsConfirmPhrase and IsRejectPhrase classify short voice/keyboard replies.
func IsConfirmPhrase(text string) bool { return phrase(text, confirmWords, confirmKeys) }
func IsRejectPhrase(text string) bool  { return phrase(text, rejectWords, rejectKeys) }

// ErrNoGate is returned when proposals are used without a gate.
var ErrNoGate = errors.New("session: no action gate configured")

// Handle routes user input: a confirmation phrase while a proposal is
// pending confirms or rejects it; anything else starts a turn.
func (s *Session) Handle(text string, source runtime.Source) (Outcome, error) {
	if s.o.Gate != nil {
		if p, ok := s.o.Gate.Latest(); ok {
			switch {
			case IsRejectPhrase(text):
				s.recordUser(text, source)
				if err := s.Reject(p.ID, source); err != nil {
					return Outcome{}, err
				}
				return Outcome{Handled: "rejected", ProposalID: p.ID}, nil
			case IsConfirmPhrase(text):
				s.recordUser(text, source)
				if err := s.Confirm(p.ID, source); err != nil {
					return Outcome{}, err
				}
				return Outcome{Handled: "confirmed", ProposalID: p.ID}, nil
			}
		}
	}
	id, cancelled, err := s.StartTurn(text, source)
	if err != nil {
		return Outcome{}, err
	}
	return Outcome{Handled: "turn", TurnID: id, CancelledTurnID: cancelled}, nil
}

func (s *Session) recordUser(text string, source runtime.Source) {
	s.mu.Lock()
	s.appendTranscriptLocked(gen.TranscriptEntry{Role: gen.TranscriptEntryRoleUser, Text: text, Ts: s.o.Now(), Source: ptr(gen.TranscriptEntrySource(source))})
	s.mu.Unlock()
}

// propose records a proposal in the gate, publishes it and renders its
// confirmation card as a floating overlay.
func (s *Session) propose(turnID string, p runtime.Proposal) {
	if s.o.Gate == nil {
		s.addProposal(turnID, p)
		return
	}
	if p.ID == "" {
		p.ID = newID("p")
	}
	pd := s.o.Gate.Propose(turnID, p)
	s.bus.Publish("proposal", withTurn(map[string]any{"proposal": toGen(pd), "status": "pending"}, turnID))
	s.showConfirmCard(pd)
}

// withTurn adds turn_id to an event only when it is set (the schema
// forbids an empty id).
func withTurn(ev map[string]any, turnID string) map[string]any {
	if turnID != "" {
		ev["turn_id"] = turnID
	}
	return ev
}

func toGen(p actions.Pending) gen.Proposal {
	gp := gen.Proposal{ID: p.ID, Tool: p.Tool, Args: orEmpty(p.Args), Label: p.Label, Risk: gen.ProposalRisk(p.Risk), ExpiresAt: p.ExpiresAt}
	if p.Detail != "" {
		gp.Detail = &p.Detail
	}
	return gp
}

func confirmNodeID(id string) string { return "confirm_" + sanitizeID(id) }

func sanitizeID(id string) string {
	var b strings.Builder
	for _, r := range id {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			b.WriteRune(r)
		}
	}
	out := b.String()
	if len(out) > 40 {
		out = out[:40]
	}
	return out
}

func (s *Session) showConfirmCard(p actions.Pending) {
	nid := confirmNodeID(p.ID)
	props := map[string]any{"proposal_id": p.ID, "title": p.Label, "risk": p.Risk}
	if p.Detail != "" {
		props["detail"] = p.Detail
	}
	ops := []map[string]any{
		{"op": "set_action", "id": nid + "_yes", "action": map[string]any{"kind": "tool", "tool": "confirm_proposal", "args": map[string]any{"proposal_id": p.ID}}},
		{"op": "set_action", "id": nid + "_no", "action": map[string]any{"kind": "tool", "tool": "reject_proposal", "args": map[string]any{"proposal_id": p.ID}}},
		{"op": "add_node", "id": nid + "_card", "node": map[string]any{"type": "Confirm", "props": props,
			"actions": map[string]any{
				"confirm": map[string]any{"id": nid + "_yes", "label": "Do it", "hotkey": "enter"},
				"reject":  map[string]any{"id": nid + "_no", "label": "Cancel", "hotkey": "escape"},
			}}},
		{"op": "add_node", "id": nid, "node": map[string]any{"type": "Overlay", "props": map[string]any{"position": "bottom_right"}, "slots": map[string]any{"content": []string{nid + "_card"}}}},
	}
	for _, op := range ops {
		if err := s.publishLocalOp(op); err != nil {
			s.o.Logger.Error("session: confirm card", "err", err)
			return
		}
	}
}

func (s *Session) hideConfirmCard(id string) {
	_ = s.RemoveNode(confirmNodeID(id))
}

// Confirm executes a pending proposal.
func (s *Session) Confirm(id string, source runtime.Source) error {
	if s.o.Gate == nil {
		return ErrNoGate
	}
	ctx, cancel := context.WithTimeout(s.baseCtx, 30*time.Second)
	defer cancel()
	// Only touch the agent state when no turn is running: a confirmation
	// during a turn must not flip the display to idle under it.
	quiet := s.ActiveTurn() == ""
	if quiet {
		s.setState(gen.AgentStateThinking, "")
	}
	pd, res, err := s.o.Gate.Confirm(ctx, id)
	s.hideConfirmCard(id)
	gp := toGen(pd)
	if err != nil {
		if errors.Is(err, actions.ErrNotFound) || errors.Is(err, actions.ErrExpired) {
			if quiet {
				s.setState(gen.AgentStateIdle, "")
			}
			return err
		}
		s.bus.Publish("proposal", withTurn(map[string]any{"proposal": gp, "status": "failed"}, pd.TurnID))
		s.bus.Publish("error", withTurn(map[string]any{"code": "action_failed", "message": err.Error()}, pd.TurnID))
		s.sayAndRecord(pd.TurnID, fmt.Sprintf("That didn't work: %s", err.Error()))
		if quiet {
			s.setState(gen.AgentStateIdle, "")
		}
		return nil
	}
	s.bus.Publish("proposal", withTurn(map[string]any{"proposal": gp, "status": "confirmed"}, pd.TurnID))
	s.applyResultOps(pd.TurnID, res)
	s.bus.Publish("proposal", withTurn(map[string]any{"proposal": gp, "status": "executed"}, pd.TurnID))
	if res.Content != "" {
		s.sayAndRecord(pd.TurnID, res.Content)
	}
	if quiet {
		s.setState(gen.AgentStateIdle, "")
	}
	_ = source
	return nil
}

// Reject drops a pending proposal.
func (s *Session) Reject(id string, _ runtime.Source) error {
	if s.o.Gate == nil {
		return ErrNoGate
	}
	pd, err := s.o.Gate.Reject(id)
	s.hideConfirmCard(id)
	if err != nil && !errors.Is(err, actions.ErrExpired) {
		return err
	}
	s.bus.Publish("proposal", withTurn(map[string]any{"proposal": toGen(pd), "status": "rejected"}, pd.TurnID))
	return nil
}

// applyResultOps applies the ops a tool result carries (validated).
func (s *Session) applyResultOps(turnID string, res runtime.ToolResult) {
	for _, raw := range res.Ops {
		s.applyOp(turnID, raw)
	}
}

// sayAndRecord speaks text and adds it to the transcript.
func (s *Session) sayAndRecord(turnID string, text string) {
	s.mu.Lock()
	entry := gen.TranscriptEntry{Role: gen.TranscriptEntryRoleAgent, Text: text, Ts: s.o.Now()}
	if turnID != "" {
		entry.TurnID = ptr(gen.TurnID(turnID))
	}
	s.appendTranscriptLocked(entry)
	s.mu.Unlock()
	s.publishSpeech(turnID, decision.Sentences(text))
}

func (s *Session) publishSpeech(turnID string, pieces []string) {
	if len(pieces) > 0 {
		s.mu.Lock()
		until := s.o.Now().Add(estimateSpeech(pieces))
		if until.After(s.speakingUntil) {
			s.speakingUntil = until
		}
		s.mu.Unlock()
	}
	for i, piece := range pieces {
		ev := map[string]any{"text": piece, "final": i == len(pieces)-1}
		if turnID != "" {
			ev["turn_id"] = turnID
		}
		s.bus.Publish("speech", ev)
	}
}

// expireLoop retires stale proposals.
func (s *Session) expireLoop(every time.Duration) {
	t := time.NewTicker(every)
	defer t.Stop()
	for {
		select {
		case <-s.baseCtx.Done():
			return
		case <-t.C:
			s.ExpireProposals()
		}
	}
}

// ExpireProposals publishes and removes expired proposals.
func (s *Session) ExpireProposals() int {
	if s.o.Gate == nil {
		return 0
	}
	ex := s.o.Gate.Expire()
	for _, p := range ex {
		s.hideConfirmCard(p.ID)
		s.bus.Publish("proposal", withTurn(map[string]any{"proposal": toGen(p), "status": "expired"}, p.TurnID))
	}
	return len(ex)
}

// resolveArgs replaces {bind} values in action args with spec data.
func (s *Session) resolveArgs(args map[string]any) map[string]any {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make(map[string]any, len(args))
	for k, v := range args {
		if path, ok := uispec.IsBinding(v); ok {
			if val, found := uispec.Resolve(map[string]any(s.spec.Data), path); found {
				out[k] = val
				continue
			}
		}
		out[k] = v
	}
	return out
}

// runTool executes a tool from a spec action: gated tools become
// proposals, others run and present their result.
func (s *Session) runTool(tool string, args map[string]any) error {
	if s.o.Tools == nil {
		return ErrActionUnsupported
	}
	ctx, cancel := context.WithTimeout(s.baseCtx, 30*time.Second)
	defer cancel()
	res, err := s.o.Tools.Call(ctx, tool, args)
	if errors.Is(err, runtime.ErrRequiresConfirm) && res.Proposal != nil {
		s.propose("", *res.Proposal)
		return nil
	}
	if err != nil {
		s.bus.Publish("error", map[string]any{"code": "tool_failed", "message": err.Error()})
		return nil
	}
	s.applyResultOps("", res)
	if res.Content != "" {
		s.sayAndRecord("", res.Content)
	}
	return nil
}

// marshalArgs is a helper for tests and logs.
func marshalArgs(args map[string]any) string {
	b, _ := json.Marshal(args)
	return string(b)
}
