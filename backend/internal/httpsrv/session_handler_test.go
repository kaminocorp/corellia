package httpsrv

import (
	"bufio"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/config"
	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/local"
	"github.com/hejijunhao/corellia/backend/internal/session"
)

func sessionServer(t *testing.T) (http.Handler, *session.Session) {
	t.Helper()
	reg, err := contract.Load()
	if err != nil {
		t.Fatal(err)
	}
	sess := session.New(session.Options{Registry: reg, Runtime: &local.Runtime{}, AgentName: "Corellia"})
	t.Cleanup(sess.Close)
	cfg := config.Config{Port: 8080, AgentName: "Corellia", ClientDir: t.TempDir(), DevOrigins: []string{}}
	ev := NewEventsHandler(sess)
	ev.Heartbeat = 50 * time.Millisecond
	h := New(Deps{Config: cfg, Session: NewSessionHandler(sess, reg), Events: ev})
	return h, sess
}

func post(h http.Handler, url, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, url, strings.NewReader(body))
	req.RemoteAddr = "127.0.0.1:1"
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestTurnEndpointValidation(t *testing.T) {
	h, _ := sessionServer(t)
	if rec := post(h, "/api/turn", `{"text":""}`); rec.Code != 400 || !strings.Contains(rec.Body.String(), "invalid_request") {
		t.Fatalf("empty text: %d %s", rec.Code, rec.Body.String())
	}
	if rec := post(h, "/api/turn", `{"text":"hi","extra":1}`); rec.Code != 400 {
		t.Fatalf("extra field: %d", rec.Code)
	}
	if rec := post(h, "/api/turn", `not json`); rec.Code != 400 || !strings.Contains(rec.Body.String(), "invalid_json") {
		t.Fatalf("bad json: %d", rec.Code)
	}
	if rec := post(h, "/api/turn", `{"text":"`+strings.Repeat("x", 70000)+`"}`); rec.Code != 413 {
		t.Fatalf("huge body: %d", rec.Code)
	}
	rec := post(h, "/api/turn", `{"text":"hello","source":"voice"}`)
	if rec.Code != 202 {
		t.Fatalf("ok turn: %d %s", rec.Code, rec.Body.String())
	}
	var resp map[string]any
	_ = json.Unmarshal(rec.Body.Bytes(), &resp)
	if resp["turn_id"] == "" {
		t.Fatal("no turn id")
	}
}

func TestCancelAndSessionAndCatalog(t *testing.T) {
	h, sess := sessionServer(t)
	if rec := post(h, "/api/turn/cancel", ""); rec.Code != 200 || !strings.Contains(rec.Body.String(), `"cancelled":false`) {
		t.Fatalf("cancel idle: %d %s", rec.Code, rec.Body.String())
	}
	id, _, _ := sess.StartTurn("hello", runtime.SourceKeyboard)
	sess.WaitTurn(id)
	rec := get(h, "/api/session", "127.0.0.1:1")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"agent_name":"Corellia"`) || !strings.Contains(rec.Body.String(), `"transcript"`) {
		t.Fatalf("session: %d %s", rec.Code, rec.Body.String())
	}
	rec = get(h, "/api/catalog", "127.0.0.1:1")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"catalog_version"`) {
		t.Fatalf("catalog: %d", rec.Code)
	}
}

// readSSE reads events from the stream until it sees `until` (an event
// type) or the deadline passes.
func readSSE(t *testing.T, r *bufio.Reader, until string, deadline time.Duration) []map[string]any {
	t.Helper()
	var out []map[string]any
	done := make(chan struct{})
	go func() {
		defer close(done)
		var cur map[string]any
		for {
			line, err := r.ReadString('\n')
			if err != nil {
				return
			}
			line = strings.TrimRight(line, "\n")
			switch {
			case strings.HasPrefix(line, "data: "):
				cur = map[string]any{}
				_ = json.Unmarshal([]byte(line[6:]), &cur)
			case line == "" && cur != nil:
				out = append(out, cur)
				if cur["type"] == until {
					return
				}
				cur = nil
			}
		}
	}()
	select {
	case <-done:
	case <-time.After(deadline):
		t.Fatalf("timeout waiting for %s (got %d events)", until, len(out))
	}
	return out
}

func TestEventsStreamSnapshotThenLive(t *testing.T) {
	h, sess := sessionServer(t)
	srv := httptest.NewServer(h)
	defer srv.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, srv.URL+"/api/events", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if ct := resp.Header.Get("Content-Type"); !strings.HasPrefix(ct, "text/event-stream") {
		t.Fatalf("content-type %q", ct)
	}
	br := bufio.NewReader(resp.Body)
	first := readSSE(t, br, "session", 2*time.Second)
	if first[0]["agent_state"] != "idle" {
		t.Fatalf("snapshot = %v", first[0])
	}
	id, _, _ := sess.StartTurn("what time is it", runtime.SourceKeyboard)
	evs := readSSE(t, br, "turn_done", 3*time.Second)
	if evs[len(evs)-1]["turn_id"] != id {
		t.Fatalf("turn_done for %v, want %s", evs[len(evs)-1]["turn_id"], id)
	}
	kinds := map[string]bool{}
	for _, e := range evs {
		kinds[e["type"].(string)] = true
	}
	for _, k := range []string{"turn_started", "state", "tool_call", "tool_result", "spec_op", "text_delta", "speech", "turn_done"} {
		if !kinds[k] {
			t.Errorf("missing %s event", k)
		}
	}
}

func TestEventsStreamReplaysAfterLastEventID(t *testing.T) {
	h, sess := sessionServer(t)
	srv := httptest.NewServer(h)
	defer srv.Close()
	id, _, _ := sess.StartTurn("hello", runtime.SourceKeyboard)
	sess.WaitTurn(id)

	req, _ := http.NewRequest(http.MethodGet, srv.URL+"/api/events", nil)
	req.Header.Set("Last-Event-ID", "2")
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	resp, err := http.DefaultClient.Do(req.WithContext(ctx))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	evs := readSSE(t, bufio.NewReader(resp.Body), "turn_done", 2*time.Second)
	// snapshot + events 3..seq(turn_done)
	last := int(evs[len(evs)-1]["seq"].(float64))
	if len(evs) != 1+(last-2) {
		t.Fatalf("got %d events, want %d", len(evs), 1+(last-2))
	}
	if int(evs[1]["seq"].(float64)) != 3 {
		t.Fatalf("first replayed seq = %v", evs[1]["seq"])
	}
}
