package httpsrv

import (
	"context"
	"log/slog"
	"mime"
	"net"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/hejijunhao/corellia/backend/internal/config"
)

// trustedRealIP rewrites RemoteAddr from X-Forwarded-For / X-Real-IP only
// when the TCP peer is one of the trusted proxies. With no trusted proxies
// the headers are ignored, so a client cannot claim to be loopback (the
// dev-mode auth check relies on RemoteAddr).
func trustedRealIP(nets []*net.IPNet) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		if len(nets) == 0 {
			return next
		}
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if peerTrusted(r.RemoteAddr, nets) {
				if ip := forwardedFor(r); ip != "" {
					r.RemoteAddr = net.JoinHostPort(ip, "0")
				}
				// The owner named this proxy; its forwarded client is the
				// client, and the dev-mode proxy guard stands down for it.
				r = r.WithContext(context.WithValue(r.Context(), trustedProxyKey{}, true))
			}
			next.ServeHTTP(w, r)
		})
	}
}

type trustedProxyKey struct{}

func viaTrustedProxy(r *http.Request) bool {
	v, _ := r.Context().Value(trustedProxyKey{}).(bool)
	return v
}

func peerTrusted(remoteAddr string, nets []*net.IPNet) bool {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		host = remoteAddr
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return false
	}
	for _, n := range nets {
		if n.Contains(ip) {
			return true
		}
	}
	return false
}

func forwardedFor(r *http.Request) string {
	if v := r.Header.Get("X-Forwarded-For"); v != "" {
		first := strings.TrimSpace(strings.Split(v, ",")[0])
		if net.ParseIP(first) != nil {
			return first
		}
	}
	if v := strings.TrimSpace(r.Header.Get("X-Real-IP")); net.ParseIP(v) != nil {
		return v
	}
	return ""
}

// originGuard handles cross-origin requests to the API. A request with no
// Origin, or whose Origin is this server itself, passes untouched. The
// configured dev origins (the Vite dev server) get CORS headers. Any other
// Origin is refused, preflight included, so a web page open in the owner's
// browser cannot drive the agent.
func originGuard(devOrigins []string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(devOrigins))
	for _, o := range devOrigins {
		if o = strings.TrimSpace(o); o != "" {
			allowed[strings.ToLower(o)] = struct{}{}
		}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin == "" || sameOrigin(origin, r.Host) {
				next.ServeHTTP(w, r)
				return
			}
			if _, ok := allowed[strings.ToLower(origin)]; !ok {
				writeError(w, http.StatusForbidden, "origin_not_allowed", "cross-origin requests are not allowed")
				return
			}
			h := w.Header()
			h.Set("Access-Control-Allow-Origin", origin)
			h.Set("Vary", "Origin")
			h.Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Last-Event-ID")
			h.Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// sameOrigin reports whether an Origin header names this server (the
// normal case: the backend serves the client).
func sameOrigin(origin, host string) bool {
	u, err := url.Parse(origin)
	if err != nil || u.Host == "" {
		return false
	}
	return strings.EqualFold(u.Host, host)
}

// hostGuard refuses, in dev mode, any request whose Host is not a loopback
// name or address: a DNS-rebinding page would otherwise reach the
// token-less API through the owner's browser.
func hostGuard(devMode bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		if !devMode {
			return next
		}
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !loopbackHost(r.Host) {
				writeError(w, http.StatusForbidden, "host_not_allowed", "dev mode: only loopback hosts are served")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// proxyHeaders are what reverse proxies add to a forwarded request:
// the standard and de-facto forwarding headers, and what `tailscale
// serve` sets about the tailnet user.
var proxyHeaders = []string{"X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Proto", "Forwarded", "X-Real-IP", "Via", "Tailscale-User-Login", "Tailscale-User-Name", "Tailscale-User-Profile-Pic"}

// ProxyRefusedMessage is the 403 body for a proxied request in dev mode.
const ProxyRefusedMessage = "dev mode: requests through a proxy need CORELLIA_DEVICE_TOKEN"

// proxyGuard refuses, in dev mode, any request that arrived through a
// reverse proxy. Dev-mode auth trusts the TCP peer, and a proxy on the
// same machine (`tailscale serve`, nginx) connects from loopback, so
// without this everyone the proxy serves could drive the agent and its
// confirm gate (review 2026-10-30 round 5). A proxy the owner listed in
// CORELLIA_TRUSTED_PROXIES is exempt: its forwarded address is the client
// and the loopback rule applies to that. The hint names the fix; the first
// refusal is also logged, once, so the owner sees it in the journal rather
// than only in the client's banner.
func proxyGuard(devMode bool, logger *slog.Logger) func(http.Handler) http.Handler {
	var once sync.Once
	return func(next http.Handler) http.Handler {
		if !devMode {
			return next
		}
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if h := proxiedBy(r); h != "" && !viaTrustedProxy(r) {
				once.Do(func() {
					if logger != nil {
						logger.Warn("dev mode: refused a request that came through a proxy; set CORELLIA_DEVICE_TOKEN to serve clients behind one", "header", h, "peer", r.RemoteAddr, "host", r.Host)
					}
				})
				writeError(w, http.StatusForbidden, "proxied_in_dev_mode", ProxyRefusedMessage)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// proxiedBy returns the first proxy header the request carries, or "".
func proxiedBy(r *http.Request) string {
	for _, h := range proxyHeaders {
		if r.Header.Get(h) != "" {
			return h
		}
	}
	for k := range r.Header {
		if strings.HasPrefix(strings.ToLower(k), "tailscale-") {
			return k
		}
	}
	return ""
}

func loopbackHost(hostport string) bool {
	host := hostport
	if h, _, err := net.SplitHostPort(hostport); err == nil {
		host = h
	}
	host = strings.ToLower(strings.Trim(host, "[]"))
	if host == "localhost" || strings.HasSuffix(host, ".localhost") {
		return true
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}

// requireJSON insists that a POST carrying a body declares
// application/json, except on the paths listed (audio uploads). Bodies of
// other types are what a cross-site form or a no-preflight fetch can send.
func requireJSON(exempt ...string) func(http.Handler) http.Handler {
	ex := make(map[string]struct{}, len(exempt))
	for _, p := range exempt {
		ex[p] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodPost && r.ContentLength != 0 {
				if _, skip := ex[r.URL.Path]; !skip {
					mt, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
					if err != nil || mt != "application/json" {
						writeError(w, http.StatusUnsupportedMediaType, "unsupported_media_type", "Content-Type must be application/json")
						return
					}
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

// securityHeaders adds a Content-Security-Policy built from the image
// host allowlist plus the usual hardening headers. The client is a single
// bundle with no inline scripts and no eval: the contract validators are
// precompiled at contract-generation time (Phase 12), so script-src is
// 'self' alone. MapLibre needs blob workers and inline style attributes,
// tiles come from OpenStreetMap over fetch.
func securityHeaders(cfg config.Config) func(http.Handler) http.Handler {
	csp := contentSecurityPolicy(cfg.ImageHosts)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := w.Header()
			h.Set("Content-Security-Policy", csp)
			h.Set("X-Content-Type-Options", "nosniff")
			h.Set("X-Frame-Options", "DENY")
			// Cross-origin requests carry the origin only: OpenStreetMap's tile
			// policy asks for a Referer to identify the application, and
			// serves an "access blocked" image (HTTP 200) to anonymous heavy
			// clients. Same-origin requests still get the full URL; nothing
			// in the path or query is secret (the token travels in a header).
			h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
			h.Set("Permissions-Policy", "camera=(), geolocation=(), microphone=(self), payment=()")
			h.Set("Cross-Origin-Opener-Policy", "same-origin")
			next.ServeHTTP(w, r)
		})
	}
}

const tileHost = "https://tile.openstreetmap.org"

func contentSecurityPolicy(imageHosts []string) string {
	img := []string{"'self'", "data:", "blob:"}
	for _, p := range imageHosts {
		p = strings.ToLower(strings.TrimSpace(p))
		switch {
		case p == "":
		case p == "*":
			img = append(img, "https:")
		default:
			img = append(img, "https://"+p)
		}
	}
	return strings.Join([]string{
		"default-src 'self'",
		"script-src 'self'",
		"style-src 'self' 'unsafe-inline'",
		"img-src " + strings.Join(img, " "),
		"connect-src 'self' " + tileHost,
		"worker-src 'self' blob:",
		"child-src 'self' blob:",
		"font-src 'self' data:",
		"media-src 'self' blob:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
	}, "; ")
}
