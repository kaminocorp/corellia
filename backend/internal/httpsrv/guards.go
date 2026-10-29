package httpsrv

import (
	"mime"
	"net"
	"net/http"
	"net/url"
	"strings"

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
			}
			next.ServeHTTP(w, r)
		})
	}
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
// bundle with no inline scripts. 'unsafe-eval' is needed because Ajv
// compiles the contract validators with new Function at load time (the
// smoke test went blank without it); precompiling them at build time
// would remove it. MapLibre needs blob workers and inline style
// attributes, tiles come from OpenStreetMap over fetch.
func securityHeaders(cfg config.Config) func(http.Handler) http.Handler {
	csp := contentSecurityPolicy(cfg.ImageHosts)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := w.Header()
			h.Set("Content-Security-Policy", csp)
			h.Set("X-Content-Type-Options", "nosniff")
			h.Set("X-Frame-Options", "DENY")
			h.Set("Referrer-Policy", "no-referrer")
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
		"script-src 'self' 'unsafe-eval'",
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
