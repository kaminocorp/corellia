// Package auth implements the display client's device-token authentication
// (roadmap section 1, question 9). There is no user login: one screen, one
// credential.
package auth

import (
	"crypto/subtle"
	"net"
	"net/http"
	"strings"
)

// Middleware returns a Chi-compatible middleware that enforces the device
// token. With an empty token the server is in dev mode: only loopback
// clients are accepted and no credential is required.
//
// The token is accepted as `Authorization: Bearer <token>` or, because
// EventSource cannot set headers, as the `token` query parameter.
func Middleware(token string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if token == "" {
				if !isLoopback(r.RemoteAddr) {
					http.Error(w, "dev mode: loopback clients only", http.StatusForbidden)
					return
				}
				next.ServeHTTP(w, r)
				return
			}
			if !tokenMatches(presented(r), token) {
				w.Header().Set("WWW-Authenticate", `Bearer realm="corellia"`)
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func presented(r *http.Request) string {
	if h := r.Header.Get("Authorization"); strings.HasPrefix(strings.ToLower(h), "bearer ") {
		return strings.TrimSpace(h[len("bearer "):])
	}
	return r.URL.Query().Get("token")
}

func tokenMatches(got, want string) bool {
	if got == "" || want == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(got), []byte(want)) == 1
}

func isLoopback(remoteAddr string) bool {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		host = remoteAddr
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}
