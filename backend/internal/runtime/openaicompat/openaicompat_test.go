package openaicompat

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/rttest"
)

func chunk(w io.Writer, delta string, finish string) {
	fin := "null"
	if finish != "" {
		fin = fmt.Sprintf("%q", finish)
	}
	fmt.Fprintf(w, "data: {\"id\":\"c\",\"object\":\"chat.completion.chunk\",\"choices\":[{\"index\":0,\"delta\":%s,\"finish_reason\":%s}]}\n\n", delta, fin)
}

func TestStreamingToolLoop(t *testing.T) {
	var bodies []map[string]any
	n := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		var body map[string]any
		_ = json.Unmarshal(raw, &body)
		bodies = append(bodies, body)
		n++
		if r.Header.Get("Authorization") != "Bearer key" || r.URL.Path != "/v1/chat/completions" {
			w.WriteHeader(401)
			return
		}
		w.Header().Set("Content-Type", "text/event-stream")
		switch n {
		case 1:
			chunk(w, `{"role":"assistant","content":"One "}`, "")
			chunk(w, `{"content":"moment."}`, "")
			chunk(w, `{"tool_calls":[{"index":0,"id":"call_1","type":"function","function":{"name":"show_ui","arguments":""}}]}`, "")
			chunk(w, `{"tool_calls":[{"index":0,"function":{"arguments":"{\"ops\":[{\"op\":\"clear\"},"}}]}`, "")
			chunk(w, `{"tool_calls":[{"index":0,"function":{"arguments":"{\"op\":\"done\"}]}"}}]}`, "")
			chunk(w, `{"tool_calls":[{"index":1,"id":"call_2","type":"function","function":{"name":"get_time","arguments":"{}"}}]}`, "")
			chunk(w, `{}`, "tool_calls")
			fmt.Fprint(w, "data: [DONE]\n\n")
		default:
			chunk(w, `{"content":"It is two."}`, "stop")
			fmt.Fprint(w, "data: [DONE]\n\n")
		}
	}))
	defer srv.Close()
	tools := &rttest.Tools{}
	rt := New(Options{APIKey: "key", BaseURL: srv.URL + "/v1/", Model: "deepseek-chat"})
	ch, _ := rt.Start(context.Background(), runtime.Turn{ID: "t", Text: "time?", Context: runtime.Context{Tools: tools}})
	evs := rttest.Collect(ch)
	kinds := strings.Join(rttest.Kinds(evs), ",")
	want := "text_delta,text_delta,tool_call,spec_op,spec_op,tool_result,tool_call,tool_result,text_delta,done"
	if kinds != want {
		t.Fatalf("kinds = %s\nwant    %s", kinds, want)
	}
	if strings.Join(tools.Calls, ",") != "show_ui,get_time" {
		t.Fatalf("calls = %v", tools.Calls)
	}
	if len(bodies) != 2 || bodies[0]["model"] != "deepseek-chat" || bodies[0]["stream"] != true {
		t.Fatalf("bodies = %v", bodies)
	}
	msgs, _ := bodies[1]["messages"].([]any)
	last := msgs[len(msgs)-1].(map[string]any)
	if last["role"] != "tool" || last["tool_call_id"] != "call_2" {
		t.Fatalf("tool message = %v", last)
	}
	assistant := msgs[len(msgs)-3].(map[string]any)
	if assistant["role"] != "assistant" || len(assistant["tool_calls"].([]any)) != 2 {
		t.Fatalf("assistant = %v", assistant)
	}
}

func TestHTTPErrorIsFatal(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(429)
		_, _ = w.Write([]byte(`{"error":{"message":"slow down"}}`))
	}))
	defer srv.Close()
	rt := New(Options{APIKey: "key", BaseURL: srv.URL})
	ch, _ := rt.Start(context.Background(), runtime.Turn{Text: "x"})
	evs := rttest.Collect(ch)
	if evs[0].Kind != runtime.EventError || !strings.Contains(evs[0].Err.Error(), "429") {
		t.Fatalf("evs = %v", rttest.Kinds(evs))
	}
}

func TestFinishReasonLengthIsTruncation(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		chunk(w, `{"role":"assistant","content":"The answer is that the"}`, "")
		chunk(w, `{"tool_calls":[{"index":0,"id":"call_1","type":"function","function":{"name":"show_ui","arguments":"{\"ops\":["}}]}`, "")
		chunk(w, `{}`, "length")
		fmt.Fprint(w, "data: [DONE]\n\n")
	}))
	defer srv.Close()
	tools := &rttest.Tools{}
	rt := New(Options{APIKey: "key", BaseURL: srv.URL, MaxTokens: 50})
	ch, _ := rt.Start(context.Background(), runtime.Turn{Text: "x", Context: runtime.Context{Tools: tools}})
	evs := rttest.Collect(ch)
	if kinds := strings.Join(rttest.Kinds(evs), ","); !strings.HasPrefix(kinds, "text_delta,error") {
		t.Fatalf("kinds = %s", kinds)
	}
	last := evs[1]
	if !last.Fatal || !errors.Is(last.Err, runtime.ErrTruncated) || !strings.Contains(last.Err.Error(), "50") {
		t.Fatalf("error = %v (fatal %v)", last.Err, last.Fatal)
	}
	if len(tools.Calls) != 0 {
		t.Fatalf("a cut tool call ran: %v", tools.Calls)
	}
}

func TestDefaults(t *testing.T) {
	if New(Options{BaseURL: "https://api.deepseek.com/v1"}).o.Model != "deepseek-chat" {
		t.Fatal("deepseek default model")
	}
	if New(Options{}).o.BaseURL != "https://api.openai.com/v1" {
		t.Fatal("base url default")
	}
}
