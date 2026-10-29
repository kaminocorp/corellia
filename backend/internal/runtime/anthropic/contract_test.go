package anthropic

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/rttest"
)

var update = flag.Bool("update", false, "rewrite the request goldens under testdata/golden")

// recordedServer replays testdata/recorded/round-N.sse for the N-th request
// and keeps every request (headers that matter plus the JSON body) so the
// test can compare them with the goldens.
type recordedServer struct {
	mu       sync.Mutex
	requests []recordedRequest
}

type recordedRequest struct {
	Method  string            `json:"method"`
	Path    string            `json:"path"`
	Headers map[string]string `json:"headers"`
	Body    json.RawMessage   `json:"body"`
}

// The SDK (v2) sends an API key as `Authorization: Bearer`; older ones
// used `x-api-key`. Both are recorded so a change shows in the golden.
var recordedHeaders = []string{"anthropic-version", "anthropic-beta", "content-type", "accept", "authorization", "x-api-key"}

func newRecordedServer(t *testing.T) (*httptest.Server, *recordedServer) {
	t.Helper()
	rs := &recordedServer{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		h := map[string]string{}
		for _, k := range recordedHeaders {
			if v := r.Header.Get(k); v != "" {
				h[k] = v
			}
		}
		rs.mu.Lock()
		rs.requests = append(rs.requests, recordedRequest{Method: r.Method, Path: r.URL.Path, Headers: h, Body: raw})
		n := len(rs.requests)
		rs.mu.Unlock()
		data, err := os.ReadFile(filepath.Join("testdata", "recorded", fmt.Sprintf("round-%d.sse", n)))
		if err != nil {
			w.WriteHeader(500)
			_, _ = fmt.Fprintf(w, `{"type":"error","error":{"type":"api_error","message":"no recorded round %d"}}`, n)
			return
		}
		w.Header().Set("Content-Type", "text/event-stream")
		_, _ = w.Write(data)
	}))
	t.Cleanup(srv.Close)
	return srv, rs
}

// TestContractRecordedTurn replays a recorded three-round turn and checks
// both directions of the wire: the events the session receives, and the
// requests the runtime sent (against goldens a reviewer can hold next to
// the Messages API reference). Run with -update after a deliberate change.
func TestContractRecordedTurn(t *testing.T) {
	srv, rs := newRecordedServer(t)
	tools := &rttest.Tools{}
	rt := New(Options{APIKey: "test-key", BaseURL: srv.URL})
	ch, err := rt.Start(context.Background(), turn(tools))
	if err != nil {
		t.Fatal(err)
	}
	evs := rttest.Collect(ch)
	kinds := strings.Join(rttest.Kinds(evs), ",")
	want := "text_delta,text_delta,tool_call,spec_op,spec_op,spec_op,spec_op,tool_result,tool_call,tool_result,text_delta,text_delta,done"
	if kinds != want {
		t.Fatalf("events = %s\nwant     %s", kinds, want)
	}
	if got := rttest.Text(evs); got != "Let me show that.It's two o'clock." {
		t.Fatalf("text = %q", got)
	}
	if strings.Join(tools.Calls, ",") != "show_ui,get_time" {
		t.Fatalf("tool calls = %v", tools.Calls)
	}
	for _, ev := range evs {
		if ev.Kind == runtime.EventError {
			t.Fatalf("error event: %v", ev.Err)
		}
	}

	rs.mu.Lock()
	reqs := rs.requests
	rs.mu.Unlock()
	if len(reqs) != 3 {
		t.Fatalf("requests = %d, want 3", len(reqs))
	}
	for i, req := range reqs {
		name := filepath.Join("testdata", "golden", fmt.Sprintf("request-%d.json", i+1))
		got := renderRequest(t, req)
		if *update {
			if err := os.WriteFile(name, got, 0o644); err != nil {
				t.Fatal(err)
			}
			continue
		}
		wantB, err := os.ReadFile(name)
		if err != nil {
			t.Fatalf("%s: %v (run with -update)", name, err)
		}
		if !bytes.Equal(bytes.TrimSpace(wantB), bytes.TrimSpace(got)) {
			t.Errorf("%s differs from the request the runtime sent (go test ./internal/runtime/anthropic -update after a deliberate change)\n--- got ---\n%s", name, got)
		}
	}

	// Spot checks that hold whatever the goldens say, in plain words.
	first := decodeBody(t, reqs[0].Body)
	if auth := reqs[0].Headers; (auth["authorization"] != "Bearer test-key" && auth["x-api-key"] != "test-key") || auth["anthropic-version"] == "" {
		t.Fatalf("auth headers = %v", reqs[0].Headers)
	}
	if !strings.Contains(reqs[0].Headers["anthropic-beta"], "server-side-fallback-2026-07-01") || first["fallbacks"] != "default" {
		t.Fatalf("fallback beta not sent: headers=%v fallbacks=%v", reqs[0].Headers, first["fallbacks"])
	}
	if first["stream"] != true || first["model"] != "claude-opus-5-5" || first["max_tokens"] != float64(4096) {
		t.Fatalf("stream/model/max_tokens = %v %v %v", first["stream"], first["model"], first["max_tokens"])
	}
	if _, has := first["thinking"]; has {
		t.Fatal("thinking must be omitted (always on; an explicit config is rejected by Opus 5.5)")
	}
	if _, has := first["temperature"]; has {
		t.Fatal("temperature must not be sent (rejected on current API versions)")
	}
	sys := first["system"].([]any)[0].(map[string]any)
	if sys["cache_control"] == nil {
		t.Fatal("system prompt is not cached")
	}
	second := decodeBody(t, reqs[1].Body)
	msgs := second["messages"].([]any)
	assistant := msgs[len(msgs)-2].(map[string]any)
	if assistant["role"] != "assistant" {
		t.Fatalf("second request must replay the assistant turn, got %v", assistant["role"])
	}
	blocks := assistant["content"].([]any)
	if blocks[0].(map[string]any)["type"] != "thinking" {
		t.Fatalf("thinking block must be passed back unchanged, got %v", blocks[0])
	}
	result := msgs[len(msgs)-1].(map[string]any)["content"].([]any)[0].(map[string]any)
	if result["type"] != "tool_result" || result["tool_use_id"] != "toolu_01ShowUi" {
		t.Fatalf("tool result = %v", result)
	}
}

// TestContractWithoutFallbacks checks the escape hatch: no beta header, no
// fallbacks field.
func TestContractWithoutFallbacks(t *testing.T) {
	srv, rs := newRecordedServer(t)
	rt := New(Options{APIKey: "test-key", BaseURL: srv.URL, Fallbacks: new(bool), Model: "claude-sonnet-5-5", Effort: "medium", MaxTokens: 1024})
	// Without a tool caller the recorded tool-use rounds are answered with
	// "no tools available" results and the turn still ends on round 3.
	evs := rttest.Collect(mustStart(t, rt, turn(nil)))
	if got := rttest.Text(evs); got != "Let me show that.It's two o'clock." {
		t.Fatalf("text = %q", got)
	}
	rs.mu.Lock()
	req := rs.requests[0]
	rs.mu.Unlock()
	if _, has := req.Headers["anthropic-beta"]; has {
		t.Fatalf("beta header sent with fallbacks off: %v", req.Headers)
	}
	body := decodeBody(t, req.Body)
	if _, has := body["fallbacks"]; has {
		t.Fatal("fallbacks sent with fallbacks off")
	}
	if body["model"] != "claude-sonnet-5-5" || body["max_tokens"] != float64(1024) || body["output_config"].(map[string]any)["effort"] != "medium" {
		t.Fatalf("options not applied: %v", body)
	}
	if _, has := body["tools"]; has {
		t.Fatal("tools sent without a tool caller")
	}
}

func renderRequest(t *testing.T, req recordedRequest) []byte {
	t.Helper()
	body := decodeBody(t, req.Body)
	out, err := json.MarshalIndent(map[string]any{"method": req.Method, "path": req.Path, "headers": req.Headers, "body": body}, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	return append(out, '\n')
}

func decodeBody(t *testing.T, raw json.RawMessage) map[string]any {
	t.Helper()
	var m map[string]any
	if err := json.Unmarshal(raw, &m); err != nil {
		t.Fatalf("request body is not JSON: %v\n%s", err, raw)
	}
	return m
}

// TestLiveAnthropic runs one real turn when CORELLIA_LIVE=1 and
// ANTHROPIC_API_KEY are set; it is the in-test twin of cmd/runtime-check.
func TestLiveAnthropic(t *testing.T) {
	if os.Getenv("CORELLIA_LIVE") != "1" {
		t.Skip("set CORELLIA_LIVE=1 and ANTHROPIC_API_KEY to run against the live API")
	}
	key := os.Getenv("ANTHROPIC_API_KEY")
	if key == "" {
		t.Skip("ANTHROPIC_API_KEY is not set")
	}
	rt := New(Options{APIKey: key, Model: os.Getenv("CORELLIA_MODEL")})
	ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
	defer cancel()
	tr := runtime.Turn{ID: "live", Text: "Reply with the single word ready.", Context: runtime.Context{AgentName: "Corellia", Now: time.Now}}
	ch, err := rt.Start(ctx, tr)
	if err != nil {
		t.Fatal(err)
	}
	evs := rttest.Collect(ch)
	for _, ev := range evs {
		if ev.Kind == runtime.EventError {
			t.Fatalf("live turn failed: %v", ev.Err)
		}
	}
	if !strings.Contains(strings.ToLower(rttest.Text(evs)), "ready") {
		t.Fatalf("unexpected reply %q", rttest.Text(evs))
	}
}
