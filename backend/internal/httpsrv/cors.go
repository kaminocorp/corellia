package httpsrv

import "net/http"

// corsMiddleware allows the listed origins (the Vite dev server by
// default) to call the API from another port. In production the client is
// served by this process, so no cross-origin request happens.
func corsMiddleware(origins []string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(origins))
	for _, o := range origins {
		if o != "" {
			allowed[o] = struct{}{}
		}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if _, ok := allowed[origin]; ok {
				h := w.Header()
				h.Set("Access-Control-Allow-Origin", origin)
				h.Set("Vary", "Origin")
				h.Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Last-Event-ID")
				h.Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
				if r.Method == http.MethodOptions {
					w.WriteHeader(http.StatusNoContent)
					return
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}
