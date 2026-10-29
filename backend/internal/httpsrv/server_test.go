package httpsrv

import (
	"encoding/json"
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
	req.Header.Set("Origin", "http://localhost:5173")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 204 || rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Fatalf("preflight: %d %v", rec.Code, rec.Header())
	}
	req = httptest.NewRequest(http.MethodOptions, "/api/config", nil)
	req.Header.Set("Origin", "http://evil.example")
	rec = httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("unknown origin must not be allowed")
	}
}
