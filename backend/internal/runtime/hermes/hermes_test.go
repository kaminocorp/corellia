package hermes

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/rttest"
)

func TestChatWithFencedOps(t *testing.T) {
	var messages []string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer tok" || r.URL.Path != "/chat" {
			w.WriteHeader(401)
			return
		}
		raw, _ := io.ReadAll(r.Body)
		var req struct {
			SessionID string `json:"session_id"`
			Message   string `json:"message"`
		}
		_ = json.Unmarshal(raw, &req)
		messages = append(messages, req.Message)
		reply := "OK"
		if !strings.HasPrefix(req.Message, "Instructions") {
			reply = "Here is the time.\n```corellia-ui\n[{\"op\":\"clear\"},{\"op\":\"done\"}]\n```"
		}
		_ = json.NewEncoder(w).Encode(map[string]string{"content": reply})
	}))
	defer srv.Close()
	rt := New(Options{BaseURL: srv.URL + "/", Token: "tok", PrimeInstructions: true})
	ch, _ := rt.Start(context.Background(), runtime.Turn{Text: "what time is it", Context: runtime.Context{AgentName: "C"}})
	evs := rttest.Collect(ch)
	if kinds := strings.Join(rttest.Kinds(evs), ","); kinds != "spec_op,spec_op,text_delta,done" {
		t.Fatalf("kinds = %s", kinds)
	}
	if rttest.Text(evs) != "Here is the time." {
		t.Fatalf("text = %q", rttest.Text(evs))
	}
	if len(messages) != 2 || !strings.HasPrefix(messages[0], "Instructions") || messages[1] != "what time is it" {
		t.Fatalf("messages = %v", messages)
	}
	// Second turn does not re-prime.
	ch, _ = rt.Start(context.Background(), runtime.Turn{Text: "again"})
	rttest.Collect(ch)
	if len(messages) != 3 {
		t.Fatalf("re-primed: %v", messages)
	}
}

func TestSidecarError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(502)
		_, _ = w.Write([]byte(`{"detail":"chat failed"}`))
	}))
	defer srv.Close()
	rt := New(Options{BaseURL: srv.URL})
	ch, err := rt.Start(context.Background(), runtime.Turn{Text: "x"})
	if err != nil {
		t.Fatal(err)
	}
	evs := rttest.Collect(ch)
	if evs[0].Kind != runtime.EventError || !strings.Contains(evs[0].Err.Error(), "502") {
		t.Fatalf("evs = %v", rttest.Kinds(evs))
	}
}
