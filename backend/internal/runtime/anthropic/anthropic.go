// Package anthropic is the Claude-backed AgentRuntime: streaming Messages
// API with tool use. show_ui tool calls become spec ops; gated tools become
// proposals. Only this package imports the Anthropic SDK.
package anthropic

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/anthropics/anthropic-sdk-go/v2"
	"github.com/anthropics/anthropic-sdk-go/v2/option"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/prompt"
	"github.com/hejijunhao/corellia/backend/internal/runtime/toolexec"
)

// Options configures the runtime.
type Options struct {
	APIKey string
	// BaseURL overrides the API endpoint (ANTHROPIC_BASE_URL via config; tests).
	BaseURL string
	// Model id; default claude-opus-5-5.
	Model string
	// Effort: low, medium, high, xhigh, max. Default low (voice latency).
	Effort string
	// MaxTokens per response; default DefaultMaxTokens. On Opus 5.5
	// thinking is always on and counts toward this cap, so a small value
	// cuts replies and show_ui calls mid-way (review 2026-10-30 round 3,
	// item 5).
	MaxTokens int64
	// MaxToolRounds caps tool-use iterations per turn; default 8.
	MaxToolRounds int
	// Fallbacks enables server-side refusal fallbacks (default true).
	Fallbacks *bool
	// CacheTTL is the prompt-cache lifetime of the system breakpoint: ""
	// or "5m" (the API default) or "1h". An always-on agent's turns are
	// often more than five minutes apart, so the static prefix (system
	// block and tools, the large part) starts cold each time; the hour
	// option costs more per write and keeps it warm (review 2026-10-30
	// round 5). Later breakpoints keep the default, which the API allows
	// (longer lifetimes must come first).
	CacheTTL string
}

// DefaultMaxTokens is the output cap when CORELLIA_MAX_TOKENS is unset: the
// SDK guidance for streaming requests (tens of thousands), with room for
// the thinking tokens Opus 5.5 spends before the first word. It is a
// ceiling, not a target: a short answer costs the same as before.
const DefaultMaxTokens int64 = 64000

// Runtime implements runtime.AgentRuntime on the Claude Messages API.
type Runtime struct {
	o      Options
	client anthropic.Client
}

// New builds the runtime.
func New(o Options) *Runtime {
	if o.Model == "" {
		o.Model = "claude-opus-5-5"
	}
	if o.Effort == "" {
		o.Effort = "low"
	}
	if o.MaxTokens <= 0 {
		o.MaxTokens = DefaultMaxTokens
	}
	if o.MaxToolRounds <= 0 {
		o.MaxToolRounds = 8
	}
	if o.Fallbacks == nil {
		t := true
		o.Fallbacks = &t
	}
	// The SDK would otherwise read ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN,
	// ANTHROPIC_BASE_URL, ANTHROPIC_PROFILE and ANTHROPIC_CUSTOM_HEADERS on
	// its own; internal/config is the only environment reader (rule 4), so
	// everything the client needs arrives through Options.
	opts := []option.RequestOption{option.WithoutEnvironmentDefaults(), option.WithMaxRetries(1)}
	if o.APIKey != "" {
		opts = append(opts, option.WithAPIKey(o.APIKey))
	}
	if o.BaseURL != "" {
		opts = append(opts, option.WithBaseURL(o.BaseURL))
	}
	return &Runtime{o: o, client: anthropic.NewClient(opts...)}
}

func (r *Runtime) Name() string { return "anthropic" }

func (r *Runtime) Capabilities() runtime.Capabilities {
	return runtime.Capabilities{Streaming: true, UIOps: true, Tools: true, Cancel: true}
}

// Start runs the turn on a goroutine.
func (r *Runtime) Start(ctx context.Context, turn runtime.Turn) (<-chan runtime.Event, error) {
	out := make(chan runtime.Event, 64)
	go func() {
		defer close(out)
		emit := func(ev runtime.Event) bool {
			select {
			case <-ctx.Done():
				return false
			case out <- ev:
				return true
			}
		}
		if err := r.run(ctx, turn, emit); err != nil && ctx.Err() == nil {
			emit(runtime.Event{Kind: runtime.EventError, Err: err, Fatal: true})
		}
		if ctx.Err() == nil {
			emit(runtime.Event{Kind: runtime.EventDone})
		}
	}()
	return out, nil
}

func (r *Runtime) tools(turn runtime.Turn) []anthropic.BetaToolUnionParam {
	if turn.Context.Tools == nil {
		return nil
	}
	var out []anthropic.BetaToolUnionParam
	for _, d := range turn.Context.Tools.Definitions() {
		var schema map[string]any
		_ = json.Unmarshal(d.InputSchema, &schema)
		props, _ := schema["properties"]
		var required []string
		if req, ok := schema["required"].([]any); ok {
			for _, x := range req {
				if s, ok := x.(string); ok {
					required = append(required, s)
				}
			}
		}
		extra := map[string]any{}
		for k, v := range schema {
			if k != "properties" && k != "required" && k != "type" {
				extra[k] = v
			}
		}
		t := anthropic.BetaToolParam{
			Name:        d.Name,
			Description: anthropic.String(d.Description),
			InputSchema: anthropic.BetaToolInputSchemaParam{Properties: props, Required: required, ExtraFields: extra},
		}
		out = append(out, anthropic.BetaToolUnionParam{OfTool: &t})
	}
	return out
}

// history builds the messages for a turn: the conversation so far as plain
// text, then the current user message. The cache layout (review 2026-10-30
// round 4: nothing hit across turns because the clock sat in the system
// block) is:
//
//   - the system block, static across turns, with a breakpoint (see run);
//   - the history, identical to the previous request's prefix, with a
//     breakpoint on its last message;
//   - the current user message: the turn context (screen, clock) as its
//     own block, then the user's words. It changes every turn, so it comes
//     after both breakpoints; the next turn's history holds only the words.
func (r *Runtime) history(turn runtime.Turn) []anthropic.BetaMessageParam {
	var msgs []anthropic.BetaMessageParam
	hist := turn.History
	// The current turn's user text is already the last history entry when
	// the session built the turn; it is re-added below with the context.
	if n := len(hist); n > 0 && hist[n-1].Role == "user" && hist[n-1].Text == turn.Text {
		hist = hist[:n-1]
	}
	for _, m := range hist {
		if m.Text == "" {
			continue
		}
		switch m.Role {
		case "user":
			msgs = append(msgs, anthropic.NewBetaUserMessage(anthropic.NewBetaTextBlock(m.Text)))
		case "agent", "assistant":
			msgs = append(msgs, anthropic.BetaMessageParam{OfAssistant: &anthropic.BetaAssistantMessageParam{Content: []anthropic.BetaContentBlockParamUnion{anthropic.NewBetaTextBlock(m.Text)}}})
		}
	}
	// The API requires the first message to be from the user.
	for len(msgs) > 0 && msgs[0].OfUser == nil {
		msgs = msgs[1:]
	}
	if n := len(msgs); n > 0 {
		setCache(&msgs[n-1], true)
	}
	var blocks []anthropic.BetaContentBlockParamUnion
	if tc := prompt.TurnContext(turn.Context); tc != "" {
		blocks = append(blocks, anthropic.NewBetaTextBlock(tc))
	}
	blocks = append(blocks, anthropic.NewBetaTextBlock(turn.Text))
	return append(msgs, anthropic.NewBetaUserMessage(blocks...))
}

// setCache puts (or removes) a cache breakpoint on the last content block
// of a user or assistant message. Text, tool-use and tool-result blocks
// all take one; history and tool results are the only blocks that get it.
func setCache(msg *anthropic.BetaMessageParam, on bool) {
	var blocks []anthropic.BetaContentBlockParamUnion
	switch {
	case msg.OfUser != nil:
		blocks = msg.OfUser.Content
	case msg.OfAssistant != nil:
		blocks = msg.OfAssistant.Content
	}
	if len(blocks) == 0 {
		return
	}
	var cc anthropic.BetaCacheControlEphemeralParam
	if on {
		cc = anthropic.NewBetaCacheControlEphemeralParam()
	}
	switch b := &blocks[len(blocks)-1]; {
	case b.OfText != nil:
		b.OfText.CacheControl = cc
	case b.OfToolUse != nil:
		b.OfToolUse.CacheControl = cc
	case b.OfToolResult != nil:
		b.OfToolResult.CacheControl = cc
	}
}

// systemCache is the system block's breakpoint, with the configured TTL.
func (r *Runtime) systemCache() anthropic.BetaCacheControlEphemeralParam {
	cc := anthropic.NewBetaCacheControlEphemeralParam()
	if r.o.CacheTTL == "1h" {
		cc.TTL = anthropic.BetaCacheControlEphemeralTTLTTL1h
	}
	return cc
}

func (r *Runtime) run(ctx context.Context, turn runtime.Turn, emit toolexec.Emit) error {
	system := prompt.System(turn.Context, prompt.Options{IncludeShowUI: turn.Context.Tools != nil})
	messages := r.history(turn)
	tools := r.tools(turn)

	for round := 0; round <= r.o.MaxToolRounds; round++ {
		// A moving breakpoint on the request's last message: round 0 caches
		// the current user message for the tool rounds that follow, each of
		// which then caches its tool results for the next. Lookups walk back
		// from a breakpoint, so moving it loses nothing.
		setCache(&messages[len(messages)-1], true)
		params := anthropic.BetaMessageNewParams{
			Model:     anthropic.Model(r.o.Model),
			MaxTokens: r.o.MaxTokens,
			System:    []anthropic.BetaTextBlockParam{{Text: system, CacheControl: r.systemCache()}},
			Messages:  messages,
			Tools:     tools,
			OutputConfig: anthropic.BetaOutputConfigParam{
				Effort: anthropic.BetaOutputConfigEffort(r.o.Effort),
			},
		}
		if *r.o.Fallbacks {
			params.Fallbacks = anthropic.BetaFallbacksParamOfDefault()
			params.Betas = []anthropic.AnthropicBeta{anthropic.AnthropicBetaServerSideFallback2026_07_01}
		}

		stream := r.client.Beta.Messages.NewStreaming(ctx, params)
		message := anthropic.BetaMessage{}
		for stream.Next() {
			ev := stream.Current()
			if err := message.Accumulate(ev); err != nil {
				return fmt.Errorf("anthropic: accumulate: %w", err)
			}
			if delta, ok := ev.AsAny().(anthropic.BetaRawContentBlockDeltaEvent); ok {
				if td, ok := delta.Delta.AsAny().(anthropic.BetaTextDelta); ok && td.Text != "" {
					if !emit(runtime.Event{Kind: runtime.EventTextDelta, Text: td.Text}) {
						return nil
					}
				}
			}
		}
		if err := stream.Err(); err != nil {
			return wrapErr(err)
		}
		if message.StopReason == "" {
			// The connection closed before message_delta carried a stop
			// reason: a half reply, or a tool call cut mid-input. Reporting it
			// as complete would pass the fragment off as the answer (review
			// 2026-10-30, item 5).
			return fmt.Errorf("anthropic: stream ended without a stop reason (connection dropped after %d content blocks)", len(message.Content))
		}
		if message.StopReason == anthropic.BetaStopReasonRefusal {
			// The safety layer stopped the reply; what streamed before is a
			// fragment. The session says so, separately, and keeps it out of
			// the history (review 2026-10-30 round 4).
			return fmt.Errorf("anthropic: %w after %d content blocks", runtime.ErrRefused, len(message.Content))
		}
		if message.StopReason == anthropic.BetaStopReasonMaxTokens {
			// The cap cut the reply: the text so far is a fragment, and a
			// tool_use block in it (a large show_ui) has incomplete input and
			// must not run. The session speaks the partial and says why.
			return fmt.Errorf("anthropic: %w after %d content blocks (max_tokens %d; raise CORELLIA_MAX_TOKENS)", runtime.ErrTruncated, len(message.Content), r.o.MaxTokens)
		}
		if message.StopReason != anthropic.BetaStopReasonToolUse {
			return nil
		}
		setCache(&messages[len(messages)-1], false)
		messages = append(messages, message.ToParam())
		var results []anthropic.BetaContentBlockParamUnion
		for _, block := range message.Content {
			tu, ok := block.AsAny().(anthropic.BetaToolUseBlock)
			if !ok {
				continue
			}
			content, isErr := toolexec.Run(ctx, turn.Context.Tools, emit, tu.ID, tu.Name, json.RawMessage(tu.JSON.Input.Raw()))
			results = append(results, anthropic.NewBetaToolResultBlock(tu.ID, content, isErr))
		}
		if len(results) == 0 {
			return nil
		}
		messages = append(messages, anthropic.NewBetaUserMessage(results...))
	}
	return fmt.Errorf("anthropic: tool rounds exceeded %d", r.o.MaxToolRounds)
}

var _ = time.Second

// wrapErr keeps the SDK's message (method, URL, status and body, for the
// log) and adds the HTTP status as a typed value when the API answered,
// so the session can classify the failure without reading the text.
func wrapErr(err error) error {
	wrapped := fmt.Errorf("anthropic: %w", err)
	var ae *anthropic.Error
	if errors.As(err, &ae) && ae.StatusCode != 0 {
		return &runtime.StatusError{Status: ae.StatusCode, Err: wrapped}
	}
	return wrapped
}
