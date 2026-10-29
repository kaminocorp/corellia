// Package anthropic is the Claude-backed AgentRuntime: streaming Messages
// API with tool use. show_ui tool calls become spec ops; gated tools become
// proposals. Only this package imports the Anthropic SDK.
package anthropic

import (
	"context"
	"encoding/json"
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
	// BaseURL overrides the API endpoint (tests).
	BaseURL string
	// Model id; default claude-opus-5-5.
	Model string
	// Effort: low, medium, high, xhigh, max. Default low (voice latency).
	Effort string
	// MaxTokens per response; default 4096.
	MaxTokens int64
	// MaxToolRounds caps tool-use iterations per turn; default 8.
	MaxToolRounds int
	// Fallbacks enables server-side refusal fallbacks (default true).
	Fallbacks *bool
}

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
		o.MaxTokens = 4096
	}
	if o.MaxToolRounds <= 0 {
		o.MaxToolRounds = 8
	}
	if o.Fallbacks == nil {
		t := true
		o.Fallbacks = &t
	}
	opts := []option.RequestOption{option.WithMaxRetries(1)}
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

func (r *Runtime) history(turn runtime.Turn) []anthropic.BetaMessageParam {
	var msgs []anthropic.BetaMessageParam
	for _, m := range turn.History {
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
	// The current turn's user text is already the last history entry when
	// the session built the turn; add it if it is not.
	if n := len(turn.History); n == 0 || turn.History[n-1].Role != "user" || turn.History[n-1].Text != turn.Text {
		msgs = append(msgs, anthropic.NewBetaUserMessage(anthropic.NewBetaTextBlock(turn.Text)))
	}
	// The API requires the first message to be from the user.
	for len(msgs) > 0 && msgs[0].OfUser == nil {
		msgs = msgs[1:]
	}
	return msgs
}

func (r *Runtime) run(ctx context.Context, turn runtime.Turn, emit toolexec.Emit) error {
	system := prompt.System(turn.Context, prompt.Options{IncludeShowUI: turn.Context.Tools != nil})
	messages := r.history(turn)
	tools := r.tools(turn)

	for round := 0; round <= r.o.MaxToolRounds; round++ {
		params := anthropic.BetaMessageNewParams{
			Model:     anthropic.Model(r.o.Model),
			MaxTokens: r.o.MaxTokens,
			System:    []anthropic.BetaTextBlockParam{{Text: system, CacheControl: anthropic.NewBetaCacheControlEphemeralParam()}},
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
			return fmt.Errorf("anthropic: %w", err)
		}
		if message.StopReason == anthropic.BetaStopReasonRefusal {
			emit(runtime.Event{Kind: runtime.EventTextDelta, Text: "I can't help with that one."})
			return nil
		}
		if message.StopReason != anthropic.BetaStopReasonToolUse {
			return nil
		}
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
