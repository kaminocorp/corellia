package httpsrv

import (
	"net/http"
	"sync"
	"time"
)

// Heartbeat records when the display client last checked in. The box
// watchdog (box/corellia-watchdog.sh) reads it from /healthz and restarts
// the kiosk when the page has gone quiet.
type Heartbeat struct {
	mu   sync.Mutex
	last time.Time
	now  func() time.Time
}

// NewHeartbeat creates a heartbeat tracker.
func NewHeartbeat(now func() time.Time) *Heartbeat {
	if now == nil {
		now = time.Now
	}
	return &Heartbeat{now: now}
}

// Post handles POST /api/heartbeat.
func (h *Heartbeat) Post(w http.ResponseWriter, _ *http.Request) {
	h.mu.Lock()
	h.last = h.now()
	h.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// Last returns the last check-in (zero when none).
func (h *Heartbeat) Last() time.Time {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.last
}

// Age returns seconds since the last check-in, or -1 when none.
func (h *Heartbeat) Age() float64 {
	last := h.Last()
	if last.IsZero() {
		return -1
	}
	return h.now().Sub(last).Seconds()
}
