package httpsrv

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/config"
)

func serverWith(t *testing.T, cfg config.Config) http.Handler {
	t.Helper()
	cfg.Port = 8080
	cfg.AgentName = "Corellia"
	cfg.ClientDir = t.TempDir()
	return New(Deps{Config: cfg, Build: BuildInfo{Version: "test"}, Now: func() time.Time { return time.Unix(0, 0) }})
}

func do(h http.Handler, method, url, remote string, hdr map[string]string, body string) *httptest.ResponseRecorder {
	var rd *strings.Reader
	if body != "" {
		rd = strings.NewReader(body)
	} else {
		rd = strings.NewReader("")
	}
	req := httptest.NewRequest(method, url, rd)
	req.RemoteAddr = remote
	for k, v := range hdr {
		if k == "Host" {
			req.Host = v
			continue
		}
		req.Header.Set(k, v)
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestForwardedHeadersAreIgnoredWithoutTrustedProxies(t *testing.T) {
	h := serverWith(t, config.Config{DevOrigins: []string{"http://localhost:5173"}})
	for _, hdr := range []string{"X-Forwarded-For", "X-Real-IP", "True-Client-IP"} {
		rec := do(h, http.MethodGet, "/api/config", "10.0.0.9:1", map[string]string{hdr: "127.0.0.1", "Host": "localhost:8080"}, "")
		if rec.Code != 403 {
			t.Fatalf("%s spoof got %d, want 403", hdr, rec.Code)
		}
	}
}

func TestTrustedProxyRealIP(t *testing.T) {
	h := serverWith(t, config.Config{TrustedProxies: []string{"10.0.0.0/8"}})
	rec := do(h, http.MethodGet, "/api/config", "10.0.0.9:1", map[string]string{"X-Forwarded-For": "127.0.0.1, 10.0.0.9", "Host": "localhost:8080"}, "")
	if rec.Code != 200 {
		t.Fatalf("trusted proxy forwarding loopback: %d", rec.Code)
	}
	rec = do(h, http.MethodGet, "/api/config", "192.168.1.1:1", map[string]string{"X-Forwarded-For": "127.0.0.1", "Host": "localhost:8080"}, "")
	if rec.Code != 403 {
		t.Fatalf("untrusted peer forwarding loopback: %d", rec.Code)
	}
}

func TestOriginGuard(t *testing.T) {
	h := serverWith(t, config.Config{DevOrigins: []string{"http://localhost:5173"}})
	loop := "127.0.0.1:1"
	// Same-origin (the backend serves the client): fine, no CORS headers.
	rec := do(h, http.MethodGet, "/api/config", loop, map[string]string{"Origin": "http://localhost:8080", "Host": "localhost:8080"}, "")
	if rec.Code != 200 || rec.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("same origin: %d %v", rec.Code, rec.Header())
	}
	// Dev origin: CORS headers.
	rec = do(h, http.MethodGet, "/api/config", loop, map[string]string{"Origin": "http://localhost:5173", "Host": "localhost:8080"}, "")
	if rec.Code != 200 || rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Fatalf("dev origin: %d %v", rec.Code, rec.Header())
	}
	// Anything else: refused, including a no-preflight text/plain POST.
	rec = do(h, http.MethodPost, "/api/turn", loop, map[string]string{"Origin": "http://evil.example", "Host": "localhost:8080", "Content-Type": "text/plain"}, `{"text":"yes"}`)
	if rec.Code != 403 || !strings.Contains(rec.Body.String(), "origin_not_allowed") {
		t.Fatalf("evil origin: %d %s", rec.Code, rec.Body.String())
	}
	rec = do(h, http.MethodOptions, "/api/turn", loop, map[string]string{"Origin": "http://evil.example", "Host": "localhost:8080"}, "")
	if rec.Code != 403 || rec.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("evil preflight: %d %v", rec.Code, rec.Header())
	}
}

func TestHostGuardInDevMode(t *testing.T) {
	h := serverWith(t, config.Config{})
	for host, want := range map[string]int{"localhost:8080": 200, "127.0.0.1:8080": 200, "[::1]:8080": 200, "corellia.localhost": 200, "evil.example:8080": 403, "192.168.1.20:8080": 403} {
		rec := do(h, http.MethodGet, "/api/config", "127.0.0.1:1", map[string]string{"Host": host}, "")
		if rec.Code != want {
			t.Errorf("host %s: %d, want %d", host, rec.Code, want)
		}
	}
	// With a token the host is not checked (the box reaches the backend by name).
	tok := serverWith(t, config.Config{DeviceToken: "0123456789abcdef0123456789abcdef"})
	rec := do(tok, http.MethodGet, "/api/config", "10.0.0.5:1", map[string]string{"Host": "backend.lan:8080", "Authorization": "Bearer 0123456789abcdef0123456789abcdef"}, "")
	if rec.Code != 200 {
		t.Fatalf("token mode host: %d", rec.Code)
	}
}

func TestPostsRequireJSON(t *testing.T) {
	h := serverWith(t, config.Config{})
	loop := "127.0.0.1:1"
	hdr := func(ct string) map[string]string {
		return map[string]string{"Host": "localhost:8080", "Content-Type": ct}
	}
	if rec := do(h, http.MethodPost, "/api/turn", loop, hdr("text/plain"), `{"text":"hi"}`); rec.Code != 415 {
		t.Fatalf("text/plain: %d", rec.Code)
	}
	if rec := do(h, http.MethodPost, "/api/turn", loop, hdr("application/x-www-form-urlencoded"), `text=hi`); rec.Code != 415 {
		t.Fatalf("form: %d", rec.Code)
	}
	// No session mounted: a JSON body reaches the (404) API router, which proves the guard let it through.
	if rec := do(h, http.MethodPost, "/api/turn", loop, hdr("application/json; charset=utf-8"), `{"text":"hi"}`); rec.Code != 404 {
		t.Fatalf("json: %d", rec.Code)
	}
	// Bodiless posts (heartbeat, cancel) need no content type.
	if rec := do(h, http.MethodPost, "/api/heartbeat", loop, map[string]string{"Host": "localhost:8080"}, ""); rec.Code != 404 {
		t.Fatalf("bodiless: %d", rec.Code)
	}
	// Audio uploads are exempt.
	if rec := do(h, http.MethodPost, "/api/voice/stt", loop, hdr("audio/webm"), "RIFF"); rec.Code != 404 {
		t.Fatalf("stt: %d", rec.Code)
	}
}

func TestSecurityHeaders(t *testing.T) {
	h := serverWith(t, config.Config{ImageHosts: []string{"upload.wikimedia.org", "*.unsplash.com"}})
	rec := do(h, http.MethodGet, "/healthz", "127.0.0.1:1", nil, "")
	csp := rec.Header().Get("Content-Security-Policy")
	for _, want := range []string{"default-src 'self'", "script-src 'self'; ", "img-src 'self' data: blob: https://upload.wikimedia.org https://*.unsplash.com", "connect-src 'self' https://tile.openstreetmap.org", "worker-src 'self' blob:", "frame-ancestors 'none'"} {
		if !strings.Contains(csp, want) {
			t.Errorf("CSP missing %q: %s", want, csp)
		}
	}
	if rec.Header().Get("X-Content-Type-Options") != "nosniff" || rec.Header().Get("X-Frame-Options") != "DENY" {
		t.Errorf("headers = %v", rec.Header())
	}
	// Tiles need a Referer (origin only) or OpenStreetMap may serve its block image.
	if got := rec.Header().Get("Referrer-Policy"); got != "strict-origin-when-cross-origin" {
		t.Errorf("Referrer-Policy = %q", got)
	}
	any := contentSecurityPolicy([]string{"*"})
	if !strings.Contains(any, "img-src 'self' data: blob: https:") {
		t.Errorf("wildcard CSP = %s", any)
	}
}
