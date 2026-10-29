// Package session owns the single conversation: transcript, screen state
// (the current spec), turn lifecycle, pending proposals and the event bus
// the client subscribes to. Runtime output flows through here, gets
// validated against the catalog, and becomes stream events.
package session

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/uispec"
)

// Options configures a Session.
type Options struct {
	ID        string
	AgentName string
	Runtime   runtime.AgentRuntime
	Registry  *contract.Registry
	Tools     runtime.ToolCaller
	// Now is the wall clock; defaults to time.Now.
	Now func() time.Time
	// HistoryLimit is how many transcript entries a runtime sees.
	HistoryLimit int
	// BusCapacity is how many events are retained for replay.
	BusCapacity int
	// TranscriptLimit caps the in-memory transcript (oldest dropped).
	TranscriptLimit int
	// ProposalTTL is how long a proposal stays confirmable.
	ProposalTTL time.Duration
	Logger      *slog.Logger
	// STT and TTS name the configured voice providers (Phase 8), "none"
	// when absent; surfaced in capabilities.
	STT, TTS string
}

// Session is safe for concurrent use.
type Session struct {
	o   Options
	bus *Bus
	v   *uispec.Validator

	mu         sync.Mutex
	state      gen.AgentState
	spec       gen.UISpec
	transcript []gen.TranscriptEntry
	proposals  map[string]pendingProposal
	active     *activeTurn
	baseCtx    context.Context
	cancelAll  context.CancelFunc
}

type pendingProposal struct {
	gen.Proposal
	TurnID string
}

type activeTurn struct {
	id     string
	cancel context.CancelFunc
	done   chan struct{}
}

// ErrNoRuntime is returned when the session has no runtime.
var ErrNoRuntime = errors.New("session: no runtime configured")

// New creates a session. Call Close when done.
func New(o Options) *Session {
	if o.Now == nil {
		o.Now = time.Now
	}
	if o.ID == "" {
		o.ID = "main"
	}
	if o.AgentName == "" {
		o.AgentName = "Corellia"
	}
	if o.HistoryLimit <= 0 {
		o.HistoryLimit = 20
	}
	if o.BusCapacity <= 0 {
		o.BusCapacity = 1000
	}
	if o.TranscriptLimit <= 0 {
		o.TranscriptLimit = 500
	}
	if o.ProposalTTL <= 0 {
		o.ProposalTTL = 2 * time.Minute
	}
	if o.Logger == nil {
		o.Logger = slog.Default()
	}
	if o.STT == "" {
		o.STT = "none"
	}
	if o.TTS == "" {
		o.TTS = "none"
	}
	ctx, cancel := context.WithCancel(context.Background())
	s := &Session{
		o:         o,
		bus:       NewBus(o.BusCapacity, o.Now),
		state:     gen.AgentStateIdle,
		spec:      uispec.New(),
		proposals: map[string]pendingProposal{},
		baseCtx:   ctx,
		cancelAll: cancel,
	}
	if o.Registry != nil {
		s.v = uispec.NewValidator(o.Registry)
		s.bus.Validate = func(ev map[string]any) error { return o.Registry.ValidateEvent(ev) }
		s.bus.OnInvalid = func(ev map[string]any, err error) {
			o.Logger.Error("session: dropped off-contract event", "type", ev["type"], "err", err)
		}
	}
	return s
}

// Close cancels any running turn.
func (s *Session) Close() { s.cancelAll() }

// ID returns the session id.
func (s *Session) ID() string { return s.o.ID }

// Subscribe exposes the event bus (see Bus.Subscribe).
func (s *Session) Subscribe(lastSeq int) (<-chan Item, func()) {
	return s.bus.Subscribe(lastSeq, 256)
}

// Seq returns the latest event sequence number.
func (s *Session) Seq() int { return s.bus.Seq() }

// Capabilities reports what the client may rely on.
func (s *Session) Capabilities() gen.Capabilities {
	c := gen.Capabilities{Runtime: "none", Stt: s.o.STT, Tts: s.o.TTS}
	if s.o.Runtime != nil {
		rc := s.o.Runtime.Capabilities()
		c.Runtime = s.o.Runtime.Name()
		c.Streaming = rc.Streaming
		c.UiOps = rc.UIOps
		c.Tools = &rc.Tools
		c.Cancel = &rc.Cancel
	}
	return c
}

// Snapshot returns the `session` event payload (without seq/ts/type).
func (s *Session) Snapshot() map[string]any {
	s.mu.Lock()
	defer s.mu.Unlock()
	pending := make([]gen.Proposal, 0, len(s.proposals))
	now := s.o.Now()
	for _, p := range s.proposals {
		if p.ExpiresAt.After(now) {
			pending = append(pending, p.Proposal)
		}
	}
	transcript := s.transcript
	if len(transcript) > 50 {
		transcript = transcript[len(transcript)-50:]
	}
	return map[string]any{
		"session_id":        s.o.ID,
		"agent_name":        s.o.AgentName,
		"agent_state":       s.state,
		"spec":              uispec.Clone(s.spec),
		"pending_proposals": pending,
		"capabilities":      s.Capabilities(),
		"transcript":        append([]gen.TranscriptEntry(nil), transcript...),
	}
}

// Spec returns a copy of the current spec.
func (s *Session) Spec() gen.UISpec {
	s.mu.Lock()
	defer s.mu.Unlock()
	return uispec.Clone(s.spec)
}

// State returns the agent state.
func (s *Session) State() gen.AgentState {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.state
}

// ActiveTurn returns the running turn id, or "".
func (s *Session) ActiveTurn() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.active == nil {
		return ""
	}
	return s.active.id
}

// StartTurn records the user input, cancels any running turn and starts
// the runtime. It returns the new turn id and the id of the turn it
// cancelled, if any.
func (s *Session) StartTurn(text string, source runtime.Source) (turnID string, cancelled string, err error) {
	if s.o.Runtime == nil {
		return "", "", ErrNoRuntime
	}
	s.mu.Lock()
	if s.active != nil {
		cancelled = s.active.id
		s.active.cancel()
		s.active = nil
	}
	turnID = newID("t")
	now := s.o.Now()
	s.appendTranscriptLocked(gen.TranscriptEntry{Role: gen.TranscriptEntryRoleUser, Text: text, Ts: now, TurnID: ptr(gen.TurnID(turnID)), Source: ptr(gen.TranscriptEntrySource(source))})
	history := s.historyLocked()
	ctx, cancel := context.WithCancel(s.baseCtx)
	at := &activeTurn{id: turnID, cancel: cancel, done: make(chan struct{})}
	s.active = at
	s.state = gen.AgentStateThinking
	s.mu.Unlock()

	s.bus.Publish("turn_started", map[string]any{"turn_id": turnID, "text": text, "source": string(source)})
	s.bus.Publish("state", map[string]any{"state": gen.AgentStateThinking, "turn_id": turnID})

	turn := runtime.Turn{
		ID:      turnID,
		Text:    text,
		Source:  source,
		History: history,
		Context: runtime.Context{AgentName: s.o.AgentName, Tools: s.o.Tools, Now: s.o.Now},
	}
	go s.run(ctx, at, turn)
	return turnID, cancelled, nil
}

// Cancel stops the running turn. With an empty id any running turn is
// cancelled. It reports whether a turn was cancelled.
func (s *Session) Cancel(turnID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.active == nil || (turnID != "" && s.active.id != turnID) {
		return false
	}
	s.active.cancel()
	return true
}

// WaitTurn blocks until the turn with id has finished (for tests and the
// spike tool). It returns immediately when the id is not the active turn.
func (s *Session) WaitTurn(id string) {
	s.mu.Lock()
	at := s.active
	s.mu.Unlock()
	if at == nil || at.id != id {
		return
	}
	<-at.done
}

func (s *Session) run(ctx context.Context, at *activeTurn, turn runtime.Turn) {
	defer close(at.done)
	status := gen.TurnDoneEventStatusCompleted
	var reply []byte
	specTouched := false
	spoke := false

	finish := func() {
		s.mu.Lock()
		if s.active == at {
			s.active = nil
		}
		s.state = gen.AgentStateIdle
		text := string(reply)
		if text != "" {
			s.appendTranscriptLocked(gen.TranscriptEntry{Role: gen.TranscriptEntryRoleAgent, Text: text, Ts: s.o.Now(), TurnID: ptr(gen.TurnID(turn.ID))})
		}
		s.mu.Unlock()
		if text != "" && status != gen.TurnDoneEventStatusCancelled {
			s.bus.Publish("speech", map[string]any{"turn_id": turn.ID, "text": text, "final": true})
		}
		modality := "voice"
		if specTouched {
			modality = "both"
		}
		s.bus.Publish("turn_done", map[string]any{"turn_id": turn.ID, "status": status, "text": text, "modality": modality})
		s.bus.Publish("state", map[string]any{"state": gen.AgentStateIdle, "turn_id": turn.ID})
	}

	ch, err := s.o.Runtime.Start(ctx, turn)
	if err != nil {
		status = gen.TurnDoneEventStatusFailed
		s.bus.Publish("error", map[string]any{"turn_id": turn.ID, "code": "runtime_start", "message": err.Error(), "fatal": true})
		finish()
		return
	}

	for ev := range ch {
		if ctx.Err() != nil {
			break
		}
		switch ev.Kind {
		case runtime.EventTextDelta:
			if ev.Text == "" {
				continue
			}
			reply = append(reply, ev.Text...)
			if !spoke {
				spoke = true
				s.setState(gen.AgentStateSpeaking, turn.ID)
			}
			s.bus.Publish("text_delta", map[string]any{"turn_id": turn.ID, "delta": ev.Text})
		case runtime.EventSpecOp:
			if s.applyOp(turn.ID, ev.Op) {
				specTouched = true
			}
		case runtime.EventToolCall:
			s.bus.Publish("tool_call", map[string]any{"turn_id": turn.ID, "call_id": ev.CallID, "tool": ev.Tool, "args": orEmpty(ev.Args)})
		case runtime.EventToolResult:
			res := map[string]any{"turn_id": turn.ID, "call_id": ev.CallID, "tool": ev.Tool, "ok": true}
			if ev.Result != nil {
				res["summary"] = truncate(ev.Result.Content, 200)
			}
			s.bus.Publish("tool_result", res)
		case runtime.EventProposal:
			if ev.Proposal != nil {
				s.addProposal(turn.ID, *ev.Proposal)
			}
		case runtime.EventError:
			msg := "unknown error"
			if ev.Err != nil {
				msg = ev.Err.Error()
			}
			s.bus.Publish("error", map[string]any{"turn_id": turn.ID, "code": "runtime", "message": msg, "fatal": ev.Fatal})
			if ev.Fatal {
				status = gen.TurnDoneEventStatusFailed
			}
		case runtime.EventDone:
		}
	}
	if ctx.Err() != nil {
		status = gen.TurnDoneEventStatusCancelled
		// Drain so the runtime goroutine can exit.
		go func() {
			for range ch {
			}
		}()
	}
	finish()
}

func (s *Session) setState(st gen.AgentState, turnID string) {
	s.mu.Lock()
	s.state = st
	s.mu.Unlock()
	s.bus.Publish("state", map[string]any{"state": st, "turn_id": turnID})
}

// applyOp validates and applies one op; invalid ops become non-fatal
// error events and are dropped. Returns true if the spec changed.
func (s *Session) applyOp(turnID string, raw json.RawMessage) bool {
	if s.o.Registry == nil {
		s.bus.Publish("error", map[string]any{"turn_id": turnID, "code": "no_registry", "message": "spec ops need a contract registry"})
		return false
	}
	op, err := s.o.Registry.DecodeOp(raw)
	if err != nil {
		s.bus.Publish("error", map[string]any{"turn_id": turnID, "code": "invalid_op", "message": err.Error()})
		return false
	}
	s.mu.Lock()
	if e := s.v.CheckOp(&s.spec, op); e != nil {
		s.mu.Unlock()
		s.bus.Publish("error", map[string]any{"turn_id": turnID, "code": e.Code, "message": e.Error()})
		return false
	}
	if err := uispec.Apply(&s.spec, op); err != nil {
		s.mu.Unlock()
		code := "invalid_op"
		var re *uispec.Error
		if errors.As(err, &re) {
			code = re.Code
		}
		s.bus.Publish("error", map[string]any{"turn_id": turnID, "code": code, "message": err.Error()})
		return false
	}
	var issues []uispec.Error
	if _, isDone := op.(gen.DoneOp); isDone {
		issues = s.v.CheckSpec(&s.spec)
	}
	s.mu.Unlock()
	var opMap map[string]any
	_ = json.Unmarshal(raw, &opMap)
	s.bus.Publish("spec_op", map[string]any{"turn_id": turnID, "op": opMap})
	for _, is := range issues {
		s.bus.Publish("error", map[string]any{"turn_id": turnID, "code": is.Code, "message": is.Error()})
	}
	return true
}

func (s *Session) addProposal(turnID string, p runtime.Proposal) {
	if p.ID == "" {
		p.ID = newID("p")
	}
	if p.Risk == "" {
		p.Risk = "low"
	}
	gp := gen.Proposal{
		ID:        p.ID,
		Tool:      p.Tool,
		Args:      orEmpty(p.Args),
		Label:     p.Label,
		Risk:      gen.ProposalRisk(p.Risk),
		ExpiresAt: s.o.Now().Add(s.o.ProposalTTL),
	}
	if p.Detail != "" {
		gp.Detail = &p.Detail
	}
	s.mu.Lock()
	s.proposals[p.ID] = pendingProposal{Proposal: gp, TurnID: turnID}
	s.mu.Unlock()
	s.bus.Publish("proposal", map[string]any{"turn_id": turnID, "proposal": gp, "status": "pending"})
}

// PendingProposals lists unexpired proposals.
func (s *Session) PendingProposals() []gen.Proposal {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := s.o.Now()
	var out []gen.Proposal
	for _, p := range s.proposals {
		if p.ExpiresAt.After(now) {
			out = append(out, p.Proposal)
		}
	}
	return out
}

func (s *Session) appendTranscriptLocked(e gen.TranscriptEntry) {
	s.transcript = append(s.transcript, e)
	if len(s.transcript) > s.o.TranscriptLimit {
		s.transcript = s.transcript[len(s.transcript)-s.o.TranscriptLimit:]
	}
}

func (s *Session) historyLocked() []runtime.Message {
	start := 0
	if len(s.transcript) > s.o.HistoryLimit {
		start = len(s.transcript) - s.o.HistoryLimit
	}
	var out []runtime.Message
	for _, e := range s.transcript[start:] {
		out = append(out, runtime.Message{Role: string(e.Role), Text: e.Text})
	}
	return out
}

func newID(prefix string) string {
	var b [6]byte
	_, _ = rand.Read(b[:])
	return prefix + "_" + hex.EncodeToString(b[:])
}

func ptr[T any](v T) *T { return &v }

func orEmpty(m map[string]any) map[string]any {
	if m == nil {
		return map[string]any{}
	}
	return m
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return fmt.Sprintf("%s…", s[:n])
}
