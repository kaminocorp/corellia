package httpsrv

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/config"
)

func newTestServer(t *testing.T, clientDir string, token string) http.Handler {
	t.Helper()
	cfg := config.Config{Port: 8080, AgentName: "Corellia", ClientDir: clientDir, DeviceToken: token, DevOrigins: []string{"http://localhost:5173"}}
	return New(Deps{Config: cfg, Build: BuildInfo{Version: "test"}, Now: func() time.Time { return time.Unix(0, 0) }})
}

func get(h http.Handler, url string, remote string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, url, nil)
	req.Host = "localhost:8080"
	req.RemoteAddr = remote
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestHealthz(t *testing.T) {
	h := newTestServer(t, t.TempDir(), "")
	rec := get(h, "/healthz", "10.0.0.1:1")
	if rec.Code != 200 {
		t.Fatalf("status %d", rec.Code)
	}
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body["ok"] != true || body["version"] != "test" || body["dev_mode"] != true {
		t.Fatalf("body = %v", body)
	}
}

func TestAPIConfigRequiresAuth(t *testing.T) {
	h := newTestServer(t, t.TempDir(), "")
	if rec := get(h, "/api/config", "10.0.0.1:1"); rec.Code != 403 {
		t.Fatalf("remote in dev mode: %d", rec.Code)
	}
	rec := get(h, "/api/config", "127.0.0.1:1")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"agent_name":"Corellia"`) {
		t.Fatalf("loopback: %d %s", rec.Code, rec.Body.String())
	}
	if rec := get(h, "/api/nope", "127.0.0.1:1"); rec.Code != 404 || !strings.Contains(rec.Header().Get("Content-Type"), "json") {
		t.Fatalf("api 404 should be json: %d %s", rec.Code, rec.Header().Get("Content-Type"))
	}
}

func TestStaticSPAFallback(t *testing.T) {
	dir := t.TempDir()
	if err := os.MkdirAll(filepath.Join(dir, "assets"), 0o755); err != nil {
		t.Fatal(err)
	}
	os.WriteFile(filepath.Join(dir, "index.html"), []byte("<html>index</html>"), 0o644)
	os.WriteFile(filepath.Join(dir, "assets", "app.js"), []byte("js"), 0o644)
	h := newTestServer(t, dir, "")

	if rec := get(h, "/", "1.1.1.1:1"); rec.Code != 200 || !strings.Contains(rec.Body.String(), "index") || rec.Header().Get("Cache-Control") != "no-store" {
		t.Fatalf("root: %d %q cc=%q", rec.Code, rec.Body.String(), rec.Header().Get("Cache-Control"))
	}
	if rec := get(h, "/some/client/route?debug=1", "1.1.1.1:1"); rec.Code != 200 || !strings.Contains(rec.Body.String(), "index") {
		t.Fatalf("fallback: %d", rec.Code)
	}
	if rec := get(h, "/assets/app.js", "1.1.1.1:1"); rec.Code != 200 || rec.Body.String() != "js" || !strings.Contains(rec.Header().Get("Cache-Control"), "immutable") {
		t.Fatalf("asset: %d %q cc=%q", rec.Code, rec.Body.String(), rec.Header().Get("Cache-Control"))
	}
	if rec := get(h, "/../../etc/passwd", "1.1.1.1:1"); rec.Code != 200 || !strings.Contains(rec.Body.String(), "index") {
		t.Fatalf("traversal should fall back to index: %d", rec.Code)
	}
}

func TestStaticMissingClient(t *testing.T) {
	h := newTestServer(t, filepath.Join(t.TempDir(), "missing"), "")
	if rec := get(h, "/", "1.1.1.1:1"); rec.Code != 503 || !strings.Contains(rec.Body.String(), "client not built") {
		t.Fatalf("missing client: %d %q", rec.Code, rec.Body.String())
	}
}

func TestCORSPreflight(t *testing.T) {
	h := newTestServer(t, t.TempDir(), "")
	req := httptest.NewRequest(http.MethodOptions, "/api/config", nil)
	req.Host = "localhost:8080"
	req.Header.Set("Origin", "http://localhost:5173")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 204 || rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Fatalf("preflight: %d %v", rec.Code, rec.Header())
	}
	req = httptest.NewRequest(http.MethodOptions, "/api/config", nil)
	req.Host = "localhost:8080"
	req.Header.Set("Origin", "http://evil.example")
	rec = httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("unknown origin must not be allowed")
	}
}

func TestHeartbeat(t *testing.T) {
	now := time.Unix(1000, 0)
	hb := NewHeartbeat(func() time.Time { return now })
	cfg := config.Config{Port: 8080, AgentName: "Corellia", ClientDir: t.TempDir()}
	h := New(Deps{Config: cfg, Heartbeat: hb, Now: func() time.Time { return now }})
	if rec := get(h, "/healthz", "1.1.1.1:1"); !strings.Contains(rec.Body.String(), `"client_heartbeat_age_s":-1`) {
		t.Fatalf("no heartbeat yet: %s", rec.Body.String())
	}
	req := httptest.NewRequest(http.MethodPost, "/api/heartbeat", nil)
	req.Host = "localhost:8080"
	req.RemoteAddr = "127.0.0.1:1"
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("heartbeat: %d", rec.Code)
	}
	now = now.Add(42 * time.Second)
	if rec := get(h, "/healthz", "1.1.1.1:1"); !strings.Contains(rec.Body.String(), `"client_heartbeat_age_s":42`) {
		t.Fatalf("age: %s", rec.Body.String())
	}
}

func postHeartbeat(t *testing.T, h http.Handler, body string) map[string]any {
	t.Helper()
	var r io.Reader
	if body != "" {
		r = strings.NewReader(body)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/heartbeat", r)
	req.Host = "localhost:8080"
	req.RemoteAddr = "127.0.0.1:1"
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("heartbeat %q: %d %s", body, rec.Code, rec.Body.String())
	}
	var out map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	return out
}

func healthz(t *testing.T, h http.Handler) map[string]any {
	t.Helper()
	rec := get(h, "/healthz", "1.1.1.1:1")
	var out map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	return out
}

// A Mac tab's heartbeat must not hide a hung kiosk from the watchdog: the
// kiosk's age is tracked on its own (review 2026-10-30 round 5).
func TestKioskHeartbeatIsTrackedApart(t *testing.T) {
	now := time.Unix(1000, 0)
	storeOK := true
	hb := NewHeartbeat(func() time.Time { return now }).WithStoreHealth(func() bool { return storeOK })
	cfg := config.Config{Port: 8080, AgentName: "Corellia", ClientDir: t.TempDir()}
	h := New(Deps{Config: cfg, Heartbeat: hb, Now: func() time.Time { return now }})

	// A browser checks in: the generic age moves, the kiosk age stays -1.
	resp := postHeartbeat(t, h, `{"client":"browser"}`)
	if resp["kiosk_heartbeat_age_s"] != float64(-1) || resp["store_ok"] != true {
		t.Fatalf("browser heartbeat response: %v", resp)
	}
	body := healthz(t, h)
	if body["client_heartbeat_age_s"] != float64(0) || body["kiosk_heartbeat_age_s"] != float64(-1) {
		t.Fatalf("after browser: %v", body)
	}

	// The kiosk checks in; then only the browser keeps posting.
	now = now.Add(10 * time.Second)
	postHeartbeat(t, h, `{"client":"kiosk"}`)
	now = now.Add(120 * time.Second)
	resp = postHeartbeat(t, h, `{"client":"browser"}`)
	if resp["kiosk_heartbeat_age_s"] != float64(120) {
		t.Fatalf("the browser was not told the kiosk's age: %v", resp)
	}
	body = healthz(t, h)
	if body["client_heartbeat_age_s"] != float64(0) || body["kiosk_heartbeat_age_s"] != float64(120) {
		t.Fatalf("a browser heartbeat hid the kiosk's age: %v", body)
	}

	// An untagged heartbeat (older client) counts as a browser.
	postHeartbeat(t, h, "")
	if body := healthz(t, h); body["kiosk_heartbeat_age_s"] != float64(120) {
		t.Fatalf("untagged heartbeat counted as kiosk: %v", body)
	}

	storeOK = false
	if resp := postHeartbeat(t, h, `{"client":"kiosk"}`); resp["store_ok"] != false {
		t.Fatalf("store failure not reported to the client: %v", resp)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/heartbeat", strings.NewReader("nope"))
	req.Host = "localhost:8080"
	req.RemoteAddr = "127.0.0.1:1"
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("malformed heartbeat body: %d", rec.Code)
	}
}

// The health check says when the data directory stopped taking writes:
// before, the Docker image on a root-owned volume reported ok while every
// turn's transcript, memory and reminders were lost (review round 5).
func TestHealthzReportsStoreFailure(t *testing.T) {
	var storeErr error
	cfg := config.Config{Port: 8080, AgentName: "Corellia", ClientDir: t.TempDir()}
	h := New(Deps{Config: cfg, Build: BuildInfo{Version: "test"}, StoreHealth: func() error { return storeErr }})
	body := healthz(t, h)
	if body["ok"] != true || body["store_ok"] != true || body["store_error"] != nil {
		t.Fatalf("healthy: %v", body)
	}
	storeErr = errors.New("open /data/transcript.jsonl: permission denied")
	rec := get(h, "/healthz", "1.1.1.1:1")
	if rec.Code != 200 {
		t.Fatalf("a store failure must keep /healthz answering 200 for the watchdog: %d", rec.Code)
	}
	body = healthz(t, h)
	if body["ok"] != false || body["store_ok"] != false || !strings.Contains(body["store_error"].(string), "permission denied") {
		t.Fatalf("failing: %v", body)
	}
}
