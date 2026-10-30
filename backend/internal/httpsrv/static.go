package httpsrv

import (
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

// staticHandler serves the built client from dir with an SPA fallback:
// unknown paths return index.html so client-side routes and query flags
// (`?debug=1`, `?gallery=1`) work on a cold load. Hashed assets under
// /assets/ are cached for a year; index.html is never cached so a new
// build shows on the next reload.
func staticHandler(dir string) http.Handler {
	index := filepath.Join(dir, "index.html")
	fs := http.FileServer(http.Dir(dir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		if _, err := os.Stat(index); err != nil {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte("corellia: client not built. Run `pnpm -C client build` or use the Vite dev server on :5173.\n"))
			return
		}
		clean := path.Clean("/" + r.URL.Path)
		full := filepath.Join(dir, filepath.FromSlash(clean))
		if st, err := os.Stat(full); err == nil && !st.IsDir() && clean != "/index.html" {
			if strings.HasPrefix(clean, "/assets/") {
				w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			}
			fs.ServeHTTP(w, r)
			return
		}
		serveIndex(w, r, index)
	})
}

// serveIndex streams index.html without http.ServeFile's path checks,
// which reject any request path containing "..": those requests should
// simply get the SPA shell like any other unknown path.
func serveIndex(w http.ResponseWriter, r *http.Request, index string) {
	f, err := os.Open(index)
	if err != nil {
		http.Error(w, "client not available", http.StatusServiceUnavailable)
		return
	}
	defer f.Close()
	st, err := f.Stat()
	if err != nil {
		http.Error(w, "client not available", http.StatusServiceUnavailable)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	http.ServeContent(w, r, "index.html", st.ModTime(), f)
}
