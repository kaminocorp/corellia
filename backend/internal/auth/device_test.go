package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func okHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
}

func TestMiddleware(t *testing.T) {
	const tok = "0123456789abcdef0123456789abcdef"
	cases := []struct {
		name       string
		configured string
		remote     string
		header     string
		query      string
		want       int
	}{
		{"dev mode loopback v4", "", "127.0.0.1:5000", "", "", 200},
		{"dev mode loopback v6", "", "[::1]:5000", "", "", 200},
		{"dev mode remote", "", "10.0.0.9:5000", "", "", 403},
		{"token via header", tok, "10.0.0.9:5000", "Bearer " + tok, "", 200},
		{"token via header case", tok, "10.0.0.9:5000", "bearer " + tok, "", 200},
		{"token via query", tok, "10.0.0.9:5000", "", tok, 200},
		{"wrong token", tok, "10.0.0.9:5000", "Bearer nope", "", 401},
		{"missing token even on loopback", tok, "127.0.0.1:5000", "", "", 401},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			h := Middleware(tc.configured)(okHandler())
			url := "/api/x"
			if tc.query != "" {
				url += "?token=" + tc.query
			}
			req := httptest.NewRequest(http.MethodGet, url, nil)
			req.RemoteAddr = tc.remote
			if tc.header != "" {
				req.Header.Set("Authorization", tc.header)
			}
			rec := httptest.NewRecorder()
			h.ServeHTTP(rec, req)
			if rec.Code != tc.want {
				t.Fatalf("status = %d, want %d", rec.Code, tc.want)
			}
		})
	}
}
