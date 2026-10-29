// Package hermes adapts the Hermes chat sidecar (adapters/hermes/sidecar:
// POST /chat {session_id, message} -> {content}, bearer auth) to the
// AgentRuntime seam. The sidecar is non-streaming and has no tool hook, so
// the whole reply arrives at once; a fenced ```corellia-ui block of spec
// ops in the reply is extracted and emitted as ops (best effort).
package hermes

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/prompt"
)

// Options configures the adapter.
type Options struct {
	BaseURL   string // sidecar base, e.g. http://localhost:8787
	Token     string // CORELLIA_SIDECAR_AUTH_TOKEN
	SessionID string // per-screen session id on the sidecar; default "corellia"
	HTTP      *http.Client
	// PrimeInstructions sends the system prompt as the first message of
	// the sidecar session so Hermes knows about the UI block format.
	PrimeInstructions bool
}

// Runtime implements runtime.AgentRuntime over the sidecar.
type Runtime struct {
	o      Options
	primed bool
}

// New builds the adapter.
func New(o Options) *Runtime {
	o.BaseURL = strings.TrimRight(o.BaseURL, "/")
	if o.SessionID == "" {
		o.SessionID = "corellia"
	}
	if o.HTTP == nil {
		o.HTTP = &http.Client{Timeout: 120 * time.Second}
	}
	return &Runtime{o: o}
}

func (r *Runtime) Name() string { return "hermes" }

func (r *Runtime) Capabilities() runtime.Capabilities {
	return runtime.Capabilities{Streaming: false, UIOps: true, Tools: false, Cancel: true}
}

var fenceRe = regexp.MustCompile("(?s)```corellia-ui\\s*(\\[.*?\\])\\s*```")

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

func (r *Runtime) run(ctx context.Context, turn runtime.Turn, emit func(runtime.Event) bool) error {
	if r.o.PrimeInstructions && !r.primed {
		instructions := prompt.System(turn.Context, prompt.Options{IncludeShowUI: true}) +
			"\nWhen you want to show a visual, append a fenced block ```corellia-ui containing a JSON array of spec ops.\n"
		if _, err := r.chat(ctx, "Instructions for this session (do not reply to them, just acknowledge with OK): "+instructions); err != nil {
			return err
		}
		r.primed = true
	}
	content, err := r.chat(ctx, turn.Text)
	if err != nil {
		return err
	}
	text := content
	if m := fenceRe.FindStringSubmatch(content); m != nil {
		var ops []json.RawMessage
		if err := json.Unmarshal([]byte(m[1]), &ops); err == nil {
			for _, op := range ops {
				if !emit(runtime.Event{Kind: runtime.EventSpecOp, Op: op}) {
					return nil
				}
			}
		}
		text = strings.TrimSpace(strings.Replace(content, m[0], "", 1))
	}
	if text != "" {
		emit(runtime.Event{Kind: runtime.EventTextDelta, Text: text})
	}
	return nil
}

func (r *Runtime) chat(ctx context.Context, message string) (string, error) {
	raw, _ := json.Marshal(map[string]string{"session_id": r.o.SessionID, "message": message})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, r.o.BaseURL+"/chat", bytes.NewReader(raw))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	if r.o.Token != "" {
		req.Header.Set("Authorization", "Bearer "+r.o.Token)
	}
	resp, err := r.o.HTTP.Do(req)
	if err != nil {
		return "", fmt.Errorf("hermes: %w", err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode/100 != 2 {
		return "", fmt.Errorf("hermes: HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	var out struct {
		Content string `json:"content"`
	}
	if err := json.Unmarshal(body, &out); err != nil {
		return "", fmt.Errorf("hermes: decode: %w", err)
	}
	return out.Content, nil
}
