// Package openaicompat is an AgentRuntime for any OpenAI-shaped chat
// completions endpoint (DeepSeek, local gateways, OpenAI itself):
// streaming with function calling. No SDK; the wire format is small.
package openaicompat

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/prompt"
	"github.com/hejijunhao/corellia/backend/internal/runtime/toolexec"
)

// Options configures the runtime.
type Options struct {
	APIKey  string
	BaseURL string // e.g. https://api.deepseek.com/v1 or https://api.openai.com/v1
	Model   string
	HTTP    *http.Client
	// MaxToolRounds caps tool-use iterations per turn; default 8.
	MaxToolRounds int
	MaxTokens     int
}

// Runtime implements runtime.AgentRuntime.
type Runtime struct{ o Options }

// New builds the runtime.
func New(o Options) *Runtime {
	if o.BaseURL == "" {
		o.BaseURL = "https://api.openai.com/v1"
	}
	o.BaseURL = strings.TrimRight(o.BaseURL, "/")
	if o.Model == "" {
		if strings.Contains(o.BaseURL, "deepseek") {
			o.Model = "deepseek-chat"
		} else {
			o.Model = "gpt-4o-mini"
		}
	}
	if o.HTTP == nil {
		o.HTTP = &http.Client{Timeout: 120 * time.Second}
	}
	if o.MaxToolRounds <= 0 {
		o.MaxToolRounds = 8
	}
	if o.MaxTokens <= 0 {
		o.MaxTokens = 2048
	}
	return &Runtime{o: o}
}

func (r *Runtime) Name() string { return "openai" }

func (r *Runtime) Capabilities() runtime.Capabilities {
	return runtime.Capabilities{Streaming: true, UIOps: true, Tools: true, Cancel: true}
}

type message struct {
	Role       string     `json:"role"`
	Content    string     `json:"content,omitempty"`
	ToolCalls  []toolCall `json:"tool_calls,omitempty"`
	ToolCallID string     `json:"tool_call_id,omitempty"`
}

type toolCall struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

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

func (r *Runtime) toolDefs(turn runtime.Turn) []map[string]any {
	if turn.Context.Tools == nil {
		return nil
	}
	var out []map[string]any
	for _, d := range turn.Context.Tools.Definitions() {
		out = append(out, map[string]any{"type": "function", "function": map[string]any{
			"name": d.Name, "description": d.Description, "parameters": json.RawMessage(d.InputSchema),
		}})
	}
	return out
}

func (r *Runtime) run(ctx context.Context, turn runtime.Turn, emit toolexec.Emit) error {
	msgs := []message{{Role: "system", Content: prompt.Full(turn.Context, prompt.Options{IncludeShowUI: turn.Context.Tools != nil})}}
	for _, m := range turn.History {
		if m.Text == "" {
			continue
		}
		role := "user"
		if m.Role == "agent" || m.Role == "assistant" {
			role = "assistant"
		}
		msgs = append(msgs, message{Role: role, Content: m.Text})
	}
	if n := len(turn.History); n == 0 || turn.History[n-1].Role != "user" || turn.History[n-1].Text != turn.Text {
		msgs = append(msgs, message{Role: "user", Content: turn.Text})
	}
	tools := r.toolDefs(turn)

	for round := 0; round <= r.o.MaxToolRounds; round++ {
		assistant, err := r.stream(ctx, msgs, tools, emit)
		if err != nil {
			return err
		}
		if len(assistant.ToolCalls) == 0 {
			return nil
		}
		msgs = append(msgs, assistant)
		for _, tc := range assistant.ToolCalls {
			content, _ := toolexec.Run(ctx, turn.Context.Tools, emit, tc.ID, tc.Function.Name, json.RawMessage(tc.Function.Arguments))
			msgs = append(msgs, message{Role: "tool", ToolCallID: tc.ID, Content: content})
		}
	}
	return fmt.Errorf("openai: tool rounds exceeded %d", r.o.MaxToolRounds)
}

// stream performs one streaming completion, emitting text deltas, and
// returns the assembled assistant message.
func (r *Runtime) stream(ctx context.Context, msgs []message, tools []map[string]any, emit toolexec.Emit) (message, error) {
	body := map[string]any{"model": r.o.Model, "messages": msgs, "stream": true, "max_tokens": r.o.MaxTokens}
	if len(tools) > 0 {
		body["tools"] = tools
	}
	raw, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, r.o.BaseURL+"/chat/completions", bytes.NewReader(raw))
	if err != nil {
		return message{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "text/event-stream")
	if r.o.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+r.o.APIKey)
	}
	resp, err := r.o.HTTP.Do(req)
	if err != nil {
		return message{}, fmt.Errorf("openai: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode/100 != 2 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return message{}, &runtime.StatusError{Status: resp.StatusCode, Err: fmt.Errorf("openai: HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))}
	}
	assistant := message{Role: "assistant"}
	calls := map[int]*toolCall{}
	order := []int{}
	sc := bufio.NewScanner(resp.Body)
	sc.Buffer(make([]byte, 0, 64*1024), 4*1024*1024)
	for sc.Scan() {
		line := sc.Text()
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" {
			break
		}
		var chunk struct {
			Choices []struct {
				Delta struct {
					Content   string `json:"content"`
					ToolCalls []struct {
						Index    int    `json:"index"`
						ID       string `json:"id"`
						Function struct {
							Name      string `json:"name"`
							Arguments string `json:"arguments"`
						} `json:"function"`
					} `json:"tool_calls"`
				} `json:"delta"`
				FinishReason string `json:"finish_reason"`
			} `json:"choices"`
		}
		if err := json.Unmarshal([]byte(data), &chunk); err != nil || len(chunk.Choices) == 0 {
			continue
		}
		if chunk.Choices[0].FinishReason == "length" {
			// Cut by max_tokens: a fragment is not an answer, and a tool
			// call cut with it never ran (same rule as the Anthropic runtime).
			return assistant, fmt.Errorf("openai: %w at max_tokens %d", runtime.ErrTruncated, r.o.MaxTokens)
		}
		d := chunk.Choices[0].Delta
		if d.Content != "" {
			assistant.Content += d.Content
			if !emit(runtime.Event{Kind: runtime.EventTextDelta, Text: d.Content}) {
				return assistant, nil
			}
		}
		for _, tc := range d.ToolCalls {
			c, ok := calls[tc.Index]
			if !ok {
				c = &toolCall{Type: "function"}
				calls[tc.Index] = c
				order = append(order, tc.Index)
			}
			if tc.ID != "" {
				c.ID = tc.ID
			}
			if tc.Function.Name != "" {
				c.Function.Name = tc.Function.Name
			}
			c.Function.Arguments += tc.Function.Arguments
		}
	}
	if err := sc.Err(); err != nil && ctx.Err() == nil {
		return assistant, fmt.Errorf("openai: stream: %w", err)
	}
	for _, i := range order {
		c := calls[i]
		if c.ID == "" {
			c.ID = fmt.Sprintf("call_%d", i)
		}
		if c.Function.Arguments == "" {
			c.Function.Arguments = "{}"
		}
		assistant.ToolCalls = append(assistant.ToolCalls, *c)
	}
	return assistant, nil
}
