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
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/actions"
	"github.com/hejijunhao/corellia/backend/internal/catalog"
	"github.com/hejijunhao/corellia/backend/internal/config"
	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
	"github.com/hejijunhao/corellia/backend/internal/decision"
	"github.com/hejijunhao/corellia/backend/internal/proactive"
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
	// Gate holds proposals (nil: proposals are recorded but not confirmable).
	Gate *actions.Gate
	// Decider chooses modality, speech and timing (nil: decision.NewRules()).
	Decider decision.Decider
	// ExpireEvery is the proposal expiry sweep interval (0: 5s).
	ExpireEvery time.Duration
	// Memory renders the memory summary for prompts (nil: none).
	Memory MemorySummariser
	// Transcript persists the conversation (nil: in-memory only).
	Transcript TranscriptStore
	// MemoryNotes is how many notes go into the prompt (0: 30).
	MemoryNotes int
	// Now is the wall clock; defaults to time.Now in Location.
	Now func() time.Time
	// Location is the zone the clock reads in (CORELLIA_TZ): the prompt's
	// date and time and every timestamp the session writes. nil: the
	// process zone. Ignored when Now is set.
	Location *time.Location
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
	// ImageHosts restricts the Image component's src to these hosts
	// (config.HostAllowed patterns). Nil: unrestricted.
	ImageHosts []string
}

// MemorySummariser renders memory for the runtime prompt.
type MemorySummariser interface {
	Summarise(limit int) string
}

// TranscriptStore persists transcript entries.
type TranscriptStore interface {
	AppendTranscript(e gen.TranscriptEntry) error
	LoadTranscript(limit int) ([]gen.TranscriptEntry, error)
}

// Session is safe for concurrent use.
type Session struct {
	o   Options
	bus *Bus
	v   *uispec.Validator

	catalogDesc string

	mu           sync.Mutex
	state        gen.AgentState
	spec         gen.UISpec
	transcript   []gen.TranscriptEntry
	proposals    map[string]pendingProposal
	held         []proactive.Item
	releaseTimer *time.Timer
	// speakingUntil estimates when the client finishes the last speech.
	speakingUntil time.Time
	active        *activeTurn
	baseCtx       context.Context
	cancelAll     context.CancelFunc
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
		if loc := o.Location; loc != nil {
			// The tools and the scheduler already read the configured zone;
			// the model's clock in the prompt must agree with them (review
			// 2026-10-30 round 4, item 3).
			o.Now = func() time.Time { return time.Now().In(loc) }
		}
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
	if o.Decider == nil {
		o.Decider = decision.NewRules()
	}
	if o.ExpireEvery <= 0 {
		o.ExpireEvery = 5 * time.Second
	}
	if o.MemoryNotes <= 0 {
		o.MemoryNotes = 30
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
		s.catalogDesc = catalog.Describe(o.Registry, nil)
		s.bus.Validate = func(ev map[string]any) error { return o.Registry.ValidateEvent(ev) }
		s.bus.OnInvalid = func(ev map[string]any, err error) {
			o.Logger.Error("session: dropped off-contract event", "type", ev["type"], "err", err)
		}
	}
	if o.Transcript != nil {
		if entries, err := o.Transcript.LoadTranscript(o.TranscriptLimit); err != nil {
			o.Logger.Error("session: load transcript", "err", err)
		} else {
			s.transcript = entries
		}
	}
	if o.Gate != nil {
		go s.expireLoop(o.ExpireEvery)
	}
	return s
}

// Close cancels any running turn and pending timers.
func (s *Session) Close() {
	s.cancelAll()
	s.mu.Lock()
	if s.releaseTimer != nil {
		s.releaseTimer.Stop()
		s.releaseTimer = nil
	}
	s.mu.Unlock()
}

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

// Snapshot returns the `session` event payload (without ts/type). It
// carries the bus seq read under the session lock, so a spec op or turn
// start published between the two cannot be missing from both the snapshot
// and the replay the client accepts (review 2026-10-30): state-changing
// publishes happen under the same lock.
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
	if s.o.Gate != nil {
		for _, p := range s.o.Gate.Pending() {
			pending = append(pending, toGen(p))
		}
	}
	transcript := s.todaysTranscriptLocked(50)
	return map[string]any{
		"seq":               s.bus.Seq(),
		"session_id":        s.o.ID,
		"agent_name":        s.o.AgentName,
		"agent_state":       s.state,
		"spec":              uispec.Clone(s.spec),
		"pending_proposals": pending,
		"capabilities":      s.Capabilities(),
		// Never nil: a fresh session must encode as [] (null fails the
		// client's schema check and the whole snapshot would be dropped).
		"transcript": append(make([]gen.TranscriptEntry, 0, len(transcript)), transcript...),
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
	screen := s.screenSummaryLocked()
	memory := ""
	if s.o.Memory != nil {
		memory = s.o.Memory.Summarise(s.o.MemoryNotes)
	}
	ctx, cancel := context.WithCancel(s.baseCtx)
	at := &activeTurn{id: turnID, cancel: cancel, done: make(chan struct{})}
	s.active = at
	s.state = gen.AgentStateThinking
	// Published under the lock so a snapshot sees the entry and the event
	// on the same side of its seq (the bus never blocks).
	s.bus.Publish("turn_started", map[string]any{"turn_id": turnID, "text": text, "source": string(source)})
	s.bus.Publish("state", map[string]any{"state": gen.AgentStateThinking, "turn_id": turnID})
	s.mu.Unlock()

	turn := runtime.Turn{
		ID:      turnID,
		Text:    text,
		Source:  source,
		History: history,
		Context: runtime.Context{AgentName: s.o.AgentName, Tools: s.o.Tools, Now: s.o.Now, CatalogDescription: s.catalogDesc, ScreenSummary: screen, MemorySummary: memory},
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
	var failure error
	// Sentences are spoken as they complete when the decider allows it
	// (VISION 7 criterion 1); the remainder goes out with turn_done.
	var stream *decision.SentenceStream
	if st, ok := s.o.Decider.(decision.Streamer); ok && st.StreamSpeech(decision.Input{Source: turn.Source, UserText: turn.Text, Now: s.o.Now()}) {
		stream = &decision.SentenceStream{}
	}

	finish := func() {
		s.mu.Lock()
		if s.active == at {
			s.active = nil
		}
		s.state = gen.AgentStateIdle
		text := string(reply)
		if status == gen.TurnDoneEventStatusFailed {
			// A failed turn must not be silent (review 2026-10-29, item 5):
			// the apology becomes the reply the user sees and hears.
			text = failureReply(text, failure)
		}
		if status == gen.TurnDoneEventStatusCancelled {
			// What was said before the interruption, marked as cut off.
			text = ellipsize(text)
		}
		if text != "" {
			entry := gen.TranscriptEntry{Role: gen.TranscriptEntryRoleAgent, Text: text, Ts: s.o.Now(), TurnID: ptr(gen.TurnID(turn.ID))}
			switch status {
			case gen.TurnDoneEventStatusFailed:
				// Shown and spoken, but never fed back to the model as its
				// own words (historyLocked skips it).
				entry.Failed = ptr(true)
			case gen.TurnDoneEventStatusCancelled:
				// Shown, but a half reply would anchor the next turn on half
				// a thought (phase 13 follow-up): historyLocked skips it.
				entry.Cancelled = ptr(true)
			}
			s.appendTranscriptLocked(entry)
		}
		rootFit := s.rootFitLocked()
		busy := s.spec.Root != nil
		s.mu.Unlock()

		d := s.o.Decider.Decide(decision.Input{
			Source: turn.Source, UserText: turn.Text, ReplyText: text, SpecChanged: specTouched,
			RootFit: rootFit, ScreenBusy: busy, Now: s.o.Now(),
		})
		switch {
		case status == gen.TurnDoneEventStatusFailed:
			if !errors.Is(failure, runtime.ErrRefused) {
				// A refusal is the model's decision, not a malfunction: it is
				// said, not reported as an error.
				s.showStatusCard("That didn't work: "+describeFailure(failure), "error", 20*time.Second)
			}
			if stream != nil {
				// Whatever was already said stays said; the unspoken rest of
				// the partial reply is its own piece, marked as cut off, and
				// the apology follows as another.
				var pieces []string
				if rest := ellipsize(stream.Flush()); rest != "" {
					pieces = decision.Sentences(rest)
				}
				pieces = append(pieces, decision.Sentences(failureReply("", failure))...)
				s.publishSpeech(turn.ID, pieces)
			} else {
				s.publishSpeech(turn.ID, decision.Sentences(text))
			}
		case status == gen.TurnDoneEventStatusCancelled:
			// Nothing more is said; the client cut playback on turn_done.
		case d.Respond:
			if d.AutoCard && text != "" {
				s.showReplyCard(text, d.AutoCardTTL)
			}
			if stream != nil {
				if rest := stream.Flush(); rest != "" {
					s.publishSpeech(turn.ID, decision.Sentences(rest))
				}
			} else {
				s.publishSpeech(turn.ID, d.Speech)
			}
		}
		modality := string(d.Modality)
		if status == gen.TurnDoneEventStatusCancelled {
			modality = string(decision.ModalityNone)
		}
		s.bus.Publish("turn_done", map[string]any{"turn_id": turn.ID, "status": status, "text": text, "modality": modality})
		s.bus.Publish("state", map[string]any{"state": gen.AgentStateIdle, "turn_id": turn.ID})
		s.releaseHeld()
	}

	ch, err := s.o.Runtime.Start(ctx, turn)
	if err != nil {
		status = gen.TurnDoneEventStatusFailed
		failure = err
		s.bus.Publish("session_error", map[string]any{"turn_id": turn.ID, "code": "runtime_start", "message": err.Error(), "fatal": true})
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
			if stream != nil {
				if pieces := stream.Push(ev.Text); len(pieces) > 0 {
					s.publishSpeechPieces(turn.ID, pieces, false)
				}
			}
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
			if ev.Result != nil {
				for _, raw := range ev.Result.Ops {
					if s.applyOp(turn.ID, raw) {
						specTouched = true
					}
				}
			}
		case runtime.EventProposal:
			if ev.Proposal != nil {
				s.propose(turn.ID, *ev.Proposal)
			}
		case runtime.EventError:
			msg := "unknown error"
			if ev.Err != nil {
				msg = ev.Err.Error()
			}
			s.bus.Publish("session_error", map[string]any{"turn_id": turn.ID, "code": "runtime", "message": msg, "fatal": ev.Fatal})
			if ev.Fatal {
				status = gen.TurnDoneEventStatusFailed
				failure = ev.Err
				if failure == nil {
					failure = errors.New(msg)
				}
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
	s.bus.Publish("state", withTurn(map[string]any{"state": st}, turnID))
}

// applyOp validates and applies one op; invalid ops become non-fatal
// error events and are dropped. Returns true if the spec changed.
func (s *Session) applyOp(turnID string, raw json.RawMessage) bool {
	if s.o.Registry == nil {
		s.bus.Publish("session_error", withTurn(map[string]any{"code": "no_registry", "message": "spec ops need a contract registry"}, turnID))
		return false
	}
	op, err := s.o.Registry.DecodeOp(raw)
	if err != nil {
		s.bus.Publish("session_error", withTurn(map[string]any{"code": "invalid_op", "message": err.Error()}, turnID))
		return false
	}
	s.mu.Lock()
	if e := s.checkImageHostLocked(op); e != nil {
		s.mu.Unlock()
		s.bus.Publish("session_error", withTurn(map[string]any{"code": e.Code, "message": e.Error()}, turnID))
		return false
	}
	if e := s.v.CheckOp(&s.spec, op); e != nil {
		s.mu.Unlock()
		s.bus.Publish("session_error", withTurn(map[string]any{"code": e.Code, "message": e.Error()}, turnID))
		return false
	}
	if err := uispec.Apply(&s.spec, op); err != nil {
		s.mu.Unlock()
		code := "invalid_op"
		var re *uispec.Error
		if errors.As(err, &re) {
			code = re.Code
		}
		s.bus.Publish("session_error", withTurn(map[string]any{"code": code, "message": err.Error()}, turnID))
		return false
	}
	var issues []uispec.Error
	if _, isDone := op.(gen.DoneOp); isDone {
		issues = s.v.CheckSpec(&s.spec)
	}
	var opMap map[string]any
	_ = json.Unmarshal(raw, &opMap)
	s.bus.Publish("spec_op", withTurn(map[string]any{"op": opMap}, turnID))
	s.mu.Unlock()
	for _, is := range issues {
		s.bus.Publish("session_error", withTurn(map[string]any{"code": is.Code, "message": is.Error()}, turnID))
	}
	if _, isClear := op.(gen.ClearOp); isClear {
		s.restoreConfirmCards()
	}
	return true
}

// restoreConfirmCards puts the Confirm cards of every still-pending
// proposal back after a clear. A proposal that is confirmable by Enter
// must stay visible: a runtime that starts its next visual with `clear`
// (the local runtime does) would otherwise leave an invisible proposal
// armed (found by the browser smoke test, 2026-10-29).
func (s *Session) restoreConfirmCards() { s.renderProposals() }

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

// PendingProposals lists unexpired proposals (gate first, then any
// recorded without a gate).
func (s *Session) PendingProposals() []gen.Proposal {
	var out []gen.Proposal
	if s.o.Gate != nil {
		for _, p := range s.o.Gate.Pending() {
			out = append(out, toGen(p))
		}
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	now := s.o.Now()
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
	if s.o.Transcript != nil {
		if err := s.o.Transcript.AppendTranscript(e); err != nil {
			s.o.Logger.Error("session: persist transcript", "err", err)
		}
	}
}

// todaysTranscriptLocked returns up to limit entries from the current
// local day (replay after a reconnect stays bounded).
func (s *Session) todaysTranscriptLocked(limit int) []gen.TranscriptEntry {
	now := s.o.Now()
	y, m, d := now.Date()
	start := time.Date(y, m, d, 0, 0, 0, 0, now.Location())
	var out []gen.TranscriptEntry
	for _, e := range s.transcript {
		if !e.Ts.In(now.Location()).Before(start) {
			out = append(out, e)
		}
	}
	if len(out) > limit {
		out = out[len(out)-limit:]
	}
	if out == nil {
		out = []gen.TranscriptEntry{}
	}
	return out
}

func (s *Session) historyLocked() []runtime.Message {
	start := 0
	if len(s.transcript) > s.o.HistoryLimit {
		start = len(s.transcript) - s.o.HistoryLimit
	}
	var out []runtime.Message
	for _, e := range s.transcript[start:] {
		if e.Failed != nil && *e.Failed {
			continue // an apology for a failed turn is not the model's reply
		}
		if e.Cancelled != nil && *e.Cancelled {
			continue // a reply cut by the user is not what the model said
		}
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
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return fmt.Sprintf("%s…", string(r[:n]))
}

// failureReply is what the user sees and hears when a turn fails: the
// partial reply, if any (marked as cut off), followed by a short apology
// with the reason in plain words (describeFailure); the raw error goes to
// the event stream and the log, not to the speaker.
func failureReply(partial string, reason error) string {
	apology := "Sorry, that didn't work on my side."
	switch {
	case errors.Is(reason, runtime.ErrRefused):
		// Not a malfunction: the model declined. Its words stand alone.
		apology = describeFailure(reason)
	case reason != nil:
		apology += " " + describeFailure(reason)
	}
	p := ellipsize(partial)
	if p == "" {
		return apology
	}
	return p + "\n\n" + apology
}

// checkImageHostLocked enforces Options.ImageHosts on Image nodes (an
// add_node of type Image, or set_props with src on an existing Image).
func (s *Session) checkImageHostLocked(op contract.Op) *uispec.Error {
	if s.o.ImageHosts == nil {
		return nil
	}
	var id, src string
	switch o := op.(type) {
	case gen.AddNodeOp:
		if o.Node.Type != "Image" {
			return nil
		}
		id = string(o.ID)
		src, _ = o.Node.Props["src"].(string)
	case gen.SetPropsOp:
		n, ok := s.spec.Nodes[string(o.ID)]
		if !ok || n.Type != "Image" {
			return nil
		}
		id = string(o.ID)
		src, _ = o.Props["src"].(string)
	default:
		return nil
	}
	if src == "" {
		return nil // a binding; the Content-Security-Policy covers resolved values
	}
	u, err := url.Parse(src)
	if err != nil || !config.HostAllowed(s.o.ImageHosts, u.Hostname()) {
		return &uispec.Error{Code: "image_host_not_allowed", NodeID: id, Message: fmt.Sprintf("Image src host %q is not in the allowed list (%s)", hostOf(src), strings.Join(s.o.ImageHosts, ", "))}
	}
	return nil
}

func hostOf(raw string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	return u.Hostname()
}

// OpIssue is one rejected op from DryRunOps.
type OpIssue struct {
	Index   int
	Code    string
	Message string
}

// DryRunOps validates a batch of ops against a copy of the current spec,
// applying each accepted op so later ops in the batch can refer to earlier
// ones. It changes nothing. show_ui uses it so the model learns which ops
// were rejected instead of hearing "Displayed N ops." for all of them.
func (s *Session) DryRunOps(raw []json.RawMessage) []OpIssue {
	var issues []OpIssue
	if s.o.Registry == nil {
		return nil
	}
	s.mu.Lock()
	spec := uispec.Clone(s.spec)
	hosts := s.o.ImageHosts
	s.mu.Unlock()
	scratch := &Session{o: Options{ImageHosts: hosts}, spec: spec}
	for i, r := range raw {
		op, err := s.o.Registry.DecodeOp(r)
		if err != nil {
			issues = append(issues, OpIssue{Index: i, Code: "invalid_op", Message: err.Error()})
			continue
		}
		if e := scratch.checkImageHostLocked(op); e != nil {
			issues = append(issues, OpIssue{Index: i, Code: e.Code, Message: e.Error()})
			continue
		}
		if e := s.v.CheckOp(&scratch.spec, op); e != nil {
			issues = append(issues, OpIssue{Index: i, Code: e.Code, Message: e.Error()})
			continue
		}
		if err := uispec.Apply(&scratch.spec, op); err != nil {
			code := "invalid_op"
			var re *uispec.Error
			if errors.As(err, &re) {
				code = re.Code
			}
			issues = append(issues, OpIssue{Index: i, Code: code, Message: err.Error()})
		}
	}
	return issues
}

// ErrActionNotFound is returned when an action id is unknown.
var ErrActionNotFound = errors.New("session: action not found")

// ErrActionUnsupported is returned for action kinds not yet executable.
var ErrActionUnsupported = errors.New("session: action kind not supported yet")

// publishLocalOp validates and applies an op the session itself issues
// (dismiss, clear, decay) and publishes it without a turn id.
func (s *Session) publishLocalOp(op map[string]any) error {
	raw, err := json.Marshal(op)
	if err != nil {
		return err
	}
	decoded, err := s.o.Registry.DecodeOp(raw)
	if err != nil {
		return err
	}
	s.mu.Lock()
	if e := s.v.CheckOp(&s.spec, decoded); e != nil {
		s.mu.Unlock()
		return e
	}
	if err := uispec.Apply(&s.spec, decoded); err != nil {
		s.mu.Unlock()
		return err
	}
	s.mu.Unlock()
	s.bus.Publish("spec_op", map[string]any{"op": op})
	return nil
}

// ClearScreen removes everything from the screen.
func (s *Session) ClearScreen() error {
	return s.publishLocalOp(map[string]any{"op": "clear"})
}

// RemoveNode removes a node (client-side decay reports through here so
// the server's spec stays authoritative). Unknown ids are a no-op.
func (s *Session) RemoveNode(id string) error {
	return s.publishLocalOp(map[string]any{"op": "remove_node", "id": id})
}

// FireAction executes a spec action by id. `dismiss` removes its target,
// `send_message` starts a turn with the message; `tool` and `propose`
// arrive with the Phase 6 gate and return ErrActionUnsupported until then.
func (s *Session) FireAction(actionID string, nodeID string) error {
	s.mu.Lock()
	action, ok := s.spec.Actions[actionID]
	s.mu.Unlock()
	if !ok {
		return ErrActionNotFound
	}
	switch action.Kind {
	case gen.ActionKindDismiss:
		target := nodeID
		if action.Target != nil {
			target = string(*action.Target)
		}
		if target == "" {
			return ErrActionNotFound
		}
		return s.RemoveNode(target)
	case gen.ActionKindSendMessage:
		if action.Message == nil {
			return ErrActionNotFound
		}
		_, _, err := s.StartTurn(*action.Message, runtime.SourceAction)
		return err
	case gen.ActionKindTool:
		if action.Tool == nil {
			return ErrActionNotFound
		}
		args := s.resolveArgs(map[string]any(action.Args))
		switch *action.Tool {
		case "confirm_proposal":
			id, _ := args["proposal_id"].(string)
			return s.Confirm(id, runtime.SourceKeyboard)
		case "reject_proposal":
			id, _ := args["proposal_id"].(string)
			return s.Reject(id, runtime.SourceKeyboard)
		}
		return s.runTool(*action.Tool, args)
	case gen.ActionKindPropose:
		if action.Tool == nil || s.o.Tools == nil || s.o.Gate == nil {
			return ErrActionUnsupported
		}
		reg, ok := s.o.Tools.(interface {
			Proposal(name string, args map[string]any) (runtime.Proposal, error)
		})
		if !ok {
			return ErrActionUnsupported
		}
		p, err := reg.Proposal(*action.Tool, s.resolveArgs(map[string]any(action.Args)))
		if err != nil {
			return err
		}
		if action.Risk != "" {
			p.Risk = string(action.Risk)
		}
		s.propose("", p)
		return nil
	default:
		return ErrActionUnsupported
	}
}

// screenSummaryLocked describes what is on screen for the runtime prompt.
func (s *Session) screenSummaryLocked() string {
	if s.spec.Root == nil {
		return ""
	}
	n, ok := s.spec.Nodes[*s.spec.Root]
	if !ok {
		return ""
	}
	return fmt.Sprintf("a %s with %d nodes (root id %q)", n.Type, len(s.spec.Nodes), *s.spec.Root)
}

// rootFitLocked returns the fit class of the root component ("" when empty).
func (s *Session) rootFitLocked() string {
	if s.spec.Root == nil || s.o.Registry == nil {
		return ""
	}
	n, ok := s.spec.Nodes[*s.spec.Root]
	if !ok {
		return ""
	}
	if n.Type == "Overlay" {
		return "glance"
	}
	def, ok := s.o.Registry.Component(string(n.Type))
	if !ok {
		return ""
	}
	hasFull, hasGlance := false, false
	for _, f := range def.Fit {
		if f == gen.FitFull {
			hasFull = true
		}
		if f == gen.FitGlance {
			hasGlance = true
		}
	}
	if hasFull && !hasGlance {
		return "full"
	}
	return "panel"
}

// showStatusCard puts a one-line status (level info|ok|warn|error) in a
// corner for ttl.
func (s *Session) showStatusCard(text, level string, ttl time.Duration) {
	ttlMs := int(ttl / time.Millisecond)
	if ttlMs < 1000 {
		ttlMs = 1000
	}
	ops := []map[string]any{
		{"op": "add_node", "id": "status_card_text", "node": map[string]any{"type": "Status", "props": map[string]any{"text": truncate(text, 200), "level": level}}},
		{"op": "add_node", "id": "status_card", "node": map[string]any{"type": "Overlay", "props": map[string]any{"position": "top_right"}, "slots": map[string]any{"content": []string{"status_card_text"}}, "ttl_ms": ttlMs}},
	}
	for _, op := range ops {
		if err := s.publishLocalOp(op); err != nil {
			s.o.Logger.Error("session: status card", "err", err)
			return
		}
	}
}

// showReplyCard renders the reply text as a floating glance card.
func (s *Session) showReplyCard(text string, ttl time.Duration) {
	ttlMs := int(ttl / time.Millisecond)
	if ttlMs < 1000 {
		ttlMs = 1000
	}
	ops := []map[string]any{
		{"op": "add_node", "id": "reply_card_text", "node": map[string]any{"type": "Markdown", "props": map[string]any{"text": truncate(text, 1200), "size": "md"}}},
		{"op": "add_node", "id": "reply_card_body", "node": map[string]any{"type": "Card", "props": map[string]any{"accent": "primary"}, "slots": map[string]any{"body": []string{"reply_card_text"}}, "ttl_ms": ttlMs}},
		{"op": "add_node", "id": "reply_card", "node": map[string]any{"type": "Overlay", "props": map[string]any{"position": "top_right"}, "slots": map[string]any{"content": []string{"reply_card_body"}}, "ttl_ms": ttlMs}},
	}
	for _, op := range ops {
		if err := s.publishLocalOp(op); err != nil {
			s.o.Logger.Error("session: reply card", "err", err)
			return
		}
	}
}
