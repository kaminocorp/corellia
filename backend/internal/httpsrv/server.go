// Package httpsrv wires the Chi router: health, the API group behind the
// device token, and the static client with an SPA fallback. Handlers stay
// thin; behaviour lives in domain packages.
package httpsrv

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/hejijunhao/corellia/backend/internal/auth"
	"github.com/hejijunhao/corellia/backend/internal/config"
)

// BuildInfo is stamped at build time via -ldflags in cmd/api.
type BuildInfo struct {
	Version string `json:"version"`
	Commit  string `json:"commit"`
}

// Deps collects everything the router needs. Each later phase adds the
// handler for its domain here.
type Deps struct {
	Config config.Config
	Build  BuildInfo
	// Now is injectable for tests; defaults to time.Now.
	Now func() time.Time
	// Session routes. Nil leaves them unmounted (the health and static
	// routes still work), which the Phase 1 tests rely on.
	Session *SessionHandler
	Events  http.Handler
	Voice   *VoiceHandler
	Memory  *MemoryHandler
}

// New builds the root http.Handler.
func New(d Deps) http.Handler {
	if d.Now == nil {
		d.Now = time.Now
	}
	r := chi.NewRouter()
	r.Use(middleware.RealIP)
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware(d.Config.DevOrigins))

	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"ok":       true,
			"version":  d.Build.Version,
			"commit":   d.Build.Commit,
			"dev_mode": d.Config.DevMode(),
			"time":     d.Now().UTC().Format(time.RFC3339),
		})
	})

	r.Route("/api", func(r chi.Router) {
		r.Use(auth.Middleware(d.Config.DeviceToken))
		r.Use(middleware.NoCache)
		r.Get("/config", func(w http.ResponseWriter, _ *http.Request) {
			writeJSON(w, http.StatusOK, map[string]any{
				"agent_name": d.Config.AgentName,
				"dev_mode":   d.Config.DevMode(),
				"version":    d.Build.Version,
			})
		})
		if d.Session != nil {
			r.Get("/session", d.Session.GetSession)
			r.Post("/turn", d.Session.PostTurn)
			r.Post("/turn/cancel", d.Session.PostCancel)
			r.Get("/catalog", d.Session.GetCatalog)
			r.Post("/action", d.Session.PostAction)
			r.Post("/action/confirm", d.Session.PostConfirm)
			r.Post("/action/reject", d.Session.PostReject)
			r.Post("/screen/clear", d.Session.PostScreenClear)
			r.Post("/screen/remove", d.Session.PostScreenRemove)
		}
		if d.Events != nil {
			r.Get("/events", d.Events.ServeHTTP)
		}
		if d.Memory != nil {
			r.Get("/memory", d.Memory.Get)
		}
		if d.Voice != nil {
			r.Get("/voice/capabilities", d.Voice.GetCapabilities)
			r.Post("/voice/stt", d.Voice.PostSTT)
			r.Post("/voice/tts", d.Voice.PostTTS)
		}
		r.NotFound(func(w http.ResponseWriter, _ *http.Request) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "not found"})
		})
	})

	r.NotFound(staticHandler(d.Config.ClientDir).ServeHTTP)
	return r
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
