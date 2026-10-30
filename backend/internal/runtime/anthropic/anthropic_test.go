package anthropic

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/rttest"
)

// sse writes one Messages-API stream event.
func sse(w io.Writer, typ string, data string) {
	fmt.Fprintf(w, "event: %s\ndata: %s\n\n", typ, data)
}

func textStream(w io.Writer, text string, stop string) {
	sse(w, "message_start", `{"type":"message_start","message":{"id":"msg_1","type":"message","role":"assistant","model":"claude-opus-5-5","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":10,"output_tokens":1}}}`)
	sse(w, "content_block_start", `{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}`)
	for _, piece := range strings.SplitAfter(text, " ") {
		b, _ := json.Marshal(piece)
		sse(w, "content_block_delta", fmt.Sprintf(`{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}`, b))
	}
	sse(w, "content_block_stop", `{"type":"content_block_stop","index":0}`)
	sse(w, "message_delta", fmt.Sprintf(`{"type":"message_delta","delta":{"stop_reason":%q,"stop_sequence":null},"usage":{"output_tokens":5}}`, stop))
	sse(w, "message_stop", `{"type":"message_stop"}`)
}

func toolStream(w io.Writer, text, toolID, toolName, input string) {
	sse(w, "message_start", `{"type":"message_start","message":{"id":"msg_2","type":"message","role":"assistant","model":"claude-opus-5-5","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":10,"output_tokens":1}}}`)
	sse(w, "content_block_start", `{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}`)
	b, _ := json.Marshal(text)
	sse(w, "content_block_delta", fmt.Sprintf(`{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":%s}}`, b))
	sse(w, "content_block_stop", `{"type":"content_block_stop","index":0}`)
	sse(w, "content_block_start", fmt.Sprintf(`{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":%q,"name":%q,"input":{}}}`, toolID, toolName))
	half := len(input) / 2
	for _, part := range []string{input[:half], input[half:]} {
		pb, _ := json.Marshal(part)
		sse(w, "content_block_delta", fmt.Sprintf(`{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":%s}}`, pb))
	}
	sse(w, "content_block_stop", `{"type":"content_block_stop","index":1}`)
	sse(w, "message_delta", `{"type":"message_delta","delta":{"stop_reason":"tool_use","stop_sequence":null},"usage":{"output_tokens":5}}`)
	sse(w, "message_stop", `{"type":"message_stop"}`)
}

type capture struct {
	mu     sync.Mutex
	bodies []map[string]any
	betas  []string
}

func server(t *testing.T, handler func(n int, w http.ResponseWriter)) (*httptest.Server, *capture) {
	t.Helper()
	c := &capture{}
	n := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		var body map[string]any
		_ = json.Unmarshal(raw, &body)
		c.mu.Lock()
		c.bodies = append(c.bodies, body)
		c.betas = append(c.betas, r.Header.Get("anthropic-beta"))
		n++
		i := n
		c.mu.Unlock()
		w.Header().Set("Content-Type", "text/event-stream")
		handler(i, w)
	}))
	t.Cleanup(srv.Close)
	return srv, c
}

func turn(tools runtime.ToolCaller) runtime.Turn {
	return runtime.Turn{ID: "t1", Text: "show me the time", History: []runtime.Message{{Role: "user", Text: "hi"}, {Role: "agent", Text: "Hello."}, {Role: "user", Text: "show me the time"}},
		Context: runtime.Context{AgentName: "Corellia", Tools: tools, CatalogDescription: "Components: Status", Now: func() time.Time { return time.Unix(0, 0).UTC() }}}
}

func TestToolLoopWithShowUI(t *testing.T) {
	srv, c := server(t, func(n int, w http.ResponseWriter) {
		switch n {
		case 1:
			toolStream(w, "Let me show that.", "toolu_1", "show_ui", `{"ops":[{"op":"clear"},{"op":"add_node","id":"s","node":{"type":"Status","props":{"text":"14:00"}}},{"op":"set_root","id":"s"},{"op":"done"}]}`)
		case 2:
			toolStream(w, "", "toolu_2", "get_time", `{}`)
		default:
			textStream(w, "It's two o'clock.", "end_turn")
		}
	})
	tools := &rttest.Tools{}
	rt := New(Options{APIKey: "k", BaseURL: srv.URL})
	ch, err := rt.Start(context.Background(), turn(tools))
	if err != nil {
		t.Fatal(err)
	}
	evs := rttest.Collect(ch)
	kinds := strings.Join(rttest.Kinds(evs), ",")
	want := "text_delta,tool_call,spec_op,spec_op,spec_op,spec_op,tool_result,tool_call,tool_result,text_delta,text_delta,text_delta,done"
	if kinds != want {
		t.Fatalf("kinds = %s\nwant    %s", kinds, want)
	}
	if got := rttest.Text(evs); got != "Let me show that.It's two o'clock." {
		t.Fatalf("text = %q", got)
	}
	if strings.Join(tools.Calls, ",") != "show_ui,get_time" {
		t.Fatalf("calls = %v", tools.Calls)
	}
	if len(c.bodies) != 3 {
		t.Fatalf("requests = %d", len(c.bodies))
	}
	first := c.bodies[0]
	if first["model"] != "claude-opus-5-5" || first["fallbacks"] != "default" || !strings.Contains(c.betas[0], "server-side-fallback-2026-07-01") {
		t.Fatalf("first request = %v betas=%v", first, c.betas[0])
	}
	if oc, _ := first["output_config"].(map[string]any); oc["effort"] != "low" {
		t.Fatalf("effort = %v", first["output_config"])
	}
	if toolsList, _ := first["tools"].([]any); len(toolsList) != 3 {
		t.Fatalf("tools = %v", first["tools"])
	}
	sys, _ := first["system"].([]any)
	if len(sys) != 1 || !strings.Contains(sys[0].(map[string]any)["text"].(string), "show_ui") {
		t.Fatalf("system = %v", first["system"])
	}
	msgs, _ := first["messages"].([]any)
	if len(msgs) != 3 || msgs[0].(map[string]any)["role"] != "user" {
		t.Fatalf("messages = %v", msgs)
	}
	// Second request carries the assistant tool_use and our tool_result.
	second, _ := c.bodies[1]["messages"].([]any)
	last := second[len(second)-1].(map[string]any)
	content, _ := last["content"].([]any)
	if last["role"] != "user" || len(content) != 1 || content[0].(map[string]any)["tool_use_id"] != "toolu_1" {
		t.Fatalf("tool result message = %v", last)
	}
}

func TestGatedToolBecomesProposal(t *testing.T) {
	srv, _ := server(t, func(n int, w http.ResponseWriter) {
		if n == 1 {
			toolStream(w, "", "toolu_9", "set_reminder", `{"text":"call Ana","at":"17:00"}`)
			return
		}
		textStream(w, "Waiting for your go-ahead.", "end_turn")
	})
	rt := New(Options{APIKey: "k", BaseURL: srv.URL, Fallbacks: new(bool)})
	ch, _ := rt.Start(context.Background(), turn(&rttest.Tools{}))
	evs := rttest.Collect(ch)
	kinds := strings.Join(rttest.Kinds(evs), ",")
	if !strings.Contains(kinds, "tool_call,proposal,tool_result") {
		t.Fatalf("kinds = %s", kinds)
	}
}

func TestRefusalAndHTTPError(t *testing.T) {
	srv, _ := server(t, func(n int, w http.ResponseWriter) {
		if n == 1 {
			textStream(w, "", "refusal")
			return
		}
		w.WriteHeader(500)
		_, _ = w.Write([]byte(`{"type":"error","error":{"type":"api_error","message":"boom"}}`))
	})
	rt := New(Options{APIKey: "k", BaseURL: srv.URL})
	// A refusal is a fatal ErrRefused, never stock text glued to the reply
	// (review 2026-10-30 round 4); the session puts it in its own words.
	evs := rttest.Collect(mustStart(t, rt, turn(nil)))
	if rttest.Text(evs) != "" {
		t.Fatalf("refusal emitted text %q", rttest.Text(evs))
	}
	if len(evs) == 0 || evs[0].Kind != runtime.EventError || !evs[0].Fatal || !errors.Is(evs[0].Err, runtime.ErrRefused) {
		t.Fatalf("refusal events = %v (%v)", rttest.Kinds(evs), evs)
	}
	evs = rttest.Collect(mustStart(t, rt, turn(nil)))
	if evs[0].Kind != runtime.EventError || !evs[0].Fatal {
		t.Fatalf("http error not surfaced: %v", rttest.Kinds(evs))
	}
	// The status travels as a value, so the session classifies by it and
	// not by the text (which keeps the URL and body for the log).
	var se *runtime.StatusError
	if !errors.As(evs[0].Err, &se) || se.Status != 500 {
		t.Fatalf("error = %v, want a StatusError 500", evs[0].Err)
	}
	if !strings.Contains(evs[0].Err.Error(), "boom") {
		t.Fatalf("error text lost the body: %v", evs[0].Err)
	}
}

// A reply stopped by max_tokens is a fragment, and a tool_use block cut
// the same way has incomplete input: both are failures the user hears
// about, never a completed turn or a silently dropped call (review
// 2026-10-30 round 3, item 5).
func TestMaxTokensIsTruncation(t *testing.T) {
	tools := &rttest.Tools{}
	srv, _ := server(t, func(n int, w http.ResponseWriter) {
		if n == 1 {
			textStream(w, "Half a sent", "max_tokens")
			return
		}
		sse(w, "message_start", `{"type":"message_start","message":{"id":"m","type":"message","role":"assistant","model":"x","content":[],"stop_reason":null,"usage":{"input_tokens":1,"output_tokens":1}}}`)
		sse(w, "content_block_start", `{"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"tu_1","name":"show_ui","input":{}}}`)
		sse(w, "content_block_delta", `{"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"{\"ops\":[{\"op\":\"clear\"}"}}`)
		sse(w, "content_block_stop", `{"type":"content_block_stop","index":0}`)
		sse(w, "message_delta", `{"type":"message_delta","delta":{"stop_reason":"max_tokens","stop_sequence":null},"usage":{"output_tokens":5}}`)
		sse(w, "message_stop", `{"type":"message_stop"}`)
	})
	rt := New(Options{APIKey: "k", BaseURL: srv.URL, MaxTokens: 50})
	for round := 1; round <= 2; round++ {
		evs := rttest.Collect(mustStart(t, rt, turn(tools)))
		var fatal *runtime.Event
		for i := range evs {
			if evs[i].Kind == runtime.EventError && evs[i].Fatal {
				fatal = &evs[i]
			}
			if evs[i].Kind == runtime.EventToolCall {
				t.Fatalf("round %d: a tool call cut by max_tokens ran: %v", round, rttest.Kinds(evs))
			}
		}
		if fatal == nil {
			t.Fatalf("round %d: max_tokens ended %v without a fatal error", round, rttest.Kinds(evs))
		}
		if !errors.Is(fatal.Err, runtime.ErrTruncated) || !strings.Contains(fatal.Err.Error(), "max_tokens 50") {
			t.Fatalf("round %d: error = %v", round, fatal.Err)
		}
		if round == 1 && rttest.Text(evs) != "Half a sent" {
			t.Fatalf("partial text = %q", rttest.Text(evs))
		}
	}
	if len(tools.Calls) != 0 {
		t.Fatalf("tool ran on a cut call: %v", tools.Calls)
	}
}

// A stream that closes without message_delta/message_stop (the connection
// dropped) is a failure, not a short answer (review 2026-10-30, item 5).
func TestTruncatedStreamIsAnError(t *testing.T) {
	srv, _ := server(t, func(n int, w http.ResponseWriter) {
		sse(w, "message_start", `{"type":"message_start","message":{"id":"m","type":"message","role":"assistant","model":"x","content":[],"stop_reason":null,"usage":{"input_tokens":1,"output_tokens":1}}}`)
		sse(w, "content_block_start", `{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}`)
		sse(w, "content_block_delta", `{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Half a sent"}}`)
		if n == 2 {
			// A tool call cut mid-input must not be silently skipped either.
			sse(w, "content_block_stop", `{"type":"content_block_stop","index":0}`)
			sse(w, "content_block_start", `{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"tu_1","name":"get_time","input":{}}}`)
			sse(w, "content_block_delta", `{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\"zo"}}`)
		}
	})
	rt := New(Options{APIKey: "k", BaseURL: srv.URL})
	for round := 1; round <= 2; round++ {
		evs := rttest.Collect(mustStart(t, rt, turn(nil)))
		kinds := rttest.Kinds(evs)
		var fatal *runtime.Event
		for i := range evs {
			if evs[i].Kind == runtime.EventError && evs[i].Fatal {
				fatal = &evs[i]
			}
		}
		if fatal == nil {
			t.Fatalf("round %d: truncated stream ended %v without a fatal error", round, kinds)
		}
		if !strings.Contains(fatal.Err.Error(), "without a stop reason") {
			t.Fatalf("round %d: error = %v", round, fatal.Err)
		}
		if got := rttest.Text(evs); got != "Half a sent" {
			t.Fatalf("round %d: partial text = %q", round, got)
		}
	}
}

// The runtime follows only what config hands it: an ANTHROPIC_BASE_URL in
// the process environment (exported for other tools) is ignored (rule 4).
func TestEnvironmentIsNotRead(t *testing.T) {
	t.Setenv("ANTHROPIC_BASE_URL", "http://127.0.0.1:1/never")
	t.Setenv("ANTHROPIC_AUTH_TOKEN", "from-env")
	srv, cap := server(t, func(_ int, w http.ResponseWriter) { textStream(w, "ready", "end_turn") })
	rt := New(Options{APIKey: "k", BaseURL: srv.URL})
	evs := rttest.Collect(mustStart(t, rt, turn(nil)))
	if got := rttest.Text(evs); got != "ready" {
		t.Fatalf("text = %q (events %v)", got, rttest.Kinds(evs))
	}
	cap.mu.Lock()
	defer cap.mu.Unlock()
	if len(cap.bodies) != 1 {
		t.Fatalf("requests = %d", len(cap.bodies))
	}
}

func TestCancelMidStream(t *testing.T) {
	srv, _ := server(t, func(_ int, w http.ResponseWriter) {
		f := w.(http.Flusher)
		sse(w, "message_start", `{"type":"message_start","message":{"id":"m","type":"message","role":"assistant","model":"x","content":[],"stop_reason":null,"usage":{"input_tokens":1,"output_tokens":1}}}`)
		sse(w, "content_block_start", `{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}`)
		for i := 0; i < 50; i++ {
			sse(w, "content_block_delta", `{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"slow "}}`)
			f.Flush()
			time.Sleep(20 * time.Millisecond)
		}
	})
	rt := New(Options{APIKey: "k", BaseURL: srv.URL})
	ctx, cancel := context.WithCancel(context.Background())
	ch := mustStart(t, rt, turn(nil))
	ctx2 := ctx
	_ = ctx2
	go func() {
		time.Sleep(60 * time.Millisecond)
		cancel()
	}()
	ch2, _ := rt.Start(ctx, turn(nil))
	deadline := time.After(3 * time.Second)
	for {
		select {
		case _, ok := <-ch2:
			if !ok {
				_ = ch
				return
			}
		case <-deadline:
			t.Fatal("stream did not close after cancel")
		}
	}
}

func mustStart(t *testing.T, rt *Runtime, tr runtime.Turn) <-chan runtime.Event {
	t.Helper()
	ch, err := rt.Start(context.Background(), tr)
	if err != nil {
		t.Fatal(err)
	}
	return ch
}

// Prompt caching across turns (review 2026-10-30 round 4): the system block
// holds only what is stable and carries a breakpoint; the clock and the
// screen state travel in the current user message, after a breakpoint on
// the last history message; a third breakpoint moves along the request's
// last message so tool rounds within a turn hit too.
func TestCacheBreakpointsAndTurnContext(t *testing.T) {
	tools := &rttest.Tools{}
	srv, c := server(t, func(n int, w http.ResponseWriter) {
		if n == 1 {
			toolStream(w, "One sec.", "tu_1", "get_time", `{}`)
			return
		}
		textStream(w, "It is noon.", "end_turn")
	})
	rt := New(Options{APIKey: "k", BaseURL: srv.URL})
	tr := turn(tools)
	tr.Context.ScreenSummary = "a Map of Lisbon"
	rttest.Collect(mustStart(t, rt, tr))
	c.mu.Lock()
	defer c.mu.Unlock()
	if len(c.bodies) != 2 {
		t.Fatalf("requests = %d", len(c.bodies))
	}
	cached := func(block any) bool {
		_, ok := block.(map[string]any)["cache_control"]
		return ok
	}
	lastBlock := func(msg any) any {
		content := msg.(map[string]any)["content"].([]any)
		return content[len(content)-1]
	}
	first := c.bodies[0]
	sys := first["system"].([]any)
	if len(sys) != 1 || !cached(sys[0]) {
		t.Fatalf("system = %v", sys)
	}
	if text := sys[0].(map[string]any)["text"].(string); strings.Contains(text, "Current date") || strings.Contains(text, "Currently on screen") {
		t.Fatalf("system block carries per-turn state: %q", text)
	}
	msgs := first["messages"].([]any)
	// hi, Hello., [context, show me the time]
	if len(msgs) != 3 {
		t.Fatalf("messages = %d: %v", len(msgs), msgs)
	}
	if !cached(lastBlock(msgs[1])) {
		t.Fatalf("no breakpoint on the last history message: %v", msgs[1])
	}
	last := msgs[2].(map[string]any)
	blocks := last["content"].([]any)
	if last["role"] != "user" || len(blocks) != 2 {
		t.Fatalf("current user message = %v", last)
	}
	ctxText := blocks[0].(map[string]any)["text"].(string)
	if !strings.Contains(ctxText, "Currently on screen: a Map of Lisbon") || !strings.Contains(ctxText, "Current date and time: Thursday 1 January 1970, 00:00 (UTC)") {
		t.Fatalf("turn context = %q", ctxText)
	}
	if blocks[1].(map[string]any)["text"] != "show me the time" || !cached(blocks[1]) {
		t.Fatalf("user words = %v (the moving breakpoint belongs here in round 0)", blocks[1])
	}
	// Round 1: the moving breakpoint has left the user message for the
	// tool results; the history breakpoint is unchanged.
	second := c.bodies[1]["messages"].([]any)
	if len(second) != 5 {
		t.Fatalf("round-1 messages = %d", len(second))
	}
	if !cached(lastBlock(second[1])) || cached(lastBlock(second[2])) {
		t.Fatalf("breakpoints in round 1: history=%v user=%v", cached(lastBlock(second[1])), cached(lastBlock(second[2])))
	}
	results := lastBlock(second[4]).(map[string]any)
	if results["type"] != "tool_result" || !cached(results) {
		t.Fatalf("tool results block = %v", results)
	}
	n := 0
	for _, m := range second {
		for _, b := range m.(map[string]any)["content"].([]any) {
			if cached(b) {
				n++
			}
		}
	}
	if n != 2 {
		t.Fatalf("%d message breakpoints in round 1, want 2 (the API allows four in all)", n)
	}
}

// CORELLIA_CACHE_TTL=1h puts the hour lifetime on the system breakpoint
// only; the default sends no ttl (review 2026-10-30 round 5: turns on an
// always-on agent are often more than five minutes apart).
func TestCacheTTLOnSystemBreakpoint(t *testing.T) {
	for _, ttl := range []string{"", "5m", "1h"} {
		srv, c := server(t, func(_ int, w http.ResponseWriter) { textStream(w, "Hi.", "end_turn") })
		rt := New(Options{APIKey: "k", BaseURL: srv.URL, CacheTTL: ttl})
		rttest.Collect(mustStart(t, rt, turn(&rttest.Tools{})))
		c.mu.Lock()
		body := c.bodies[0]
		c.mu.Unlock()
		sys := body["system"].([]any)[0].(map[string]any)
		cc := sys["cache_control"].(map[string]any)
		got, _ := cc["ttl"].(string)
		want := ""
		if ttl == "1h" {
			want = "1h"
		}
		if got != want {
			t.Errorf("CacheTTL %q: system ttl = %q, want %q", ttl, got, want)
		}
		msgs := body["messages"].([]any)
		last := msgs[len(msgs)-1].(map[string]any)["content"].([]any)
		if cc, ok := last[len(last)-1].(map[string]any)["cache_control"].(map[string]any); !ok || cc["ttl"] != nil {
			t.Errorf("CacheTTL %q: the moving breakpoint must keep the default lifetime: %v", ttl, cc)
		}
	}
}
