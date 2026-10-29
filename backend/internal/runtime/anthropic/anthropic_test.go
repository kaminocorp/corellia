package anthropic

import (
	"context"
	"encoding/json"
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
	evs := rttest.Collect(mustStart(t, rt, turn(nil)))
	if got := rttest.Text(evs); !strings.Contains(got, "can't help") {
		t.Fatalf("refusal text = %q", got)
	}
	evs = rttest.Collect(mustStart(t, rt, turn(nil)))
	if evs[0].Kind != runtime.EventError || !evs[0].Fatal {
		t.Fatalf("http error not surfaced: %v", rttest.Kinds(evs))
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
