package httpsrv

import (
	"encoding/json"
	"io"
	"net/http"
	"sync"
	"time"
)

// Heartbeat records when the display clients last checked in. The box
// watchdog (box/corellia-watchdog.sh) reads the ages from /healthz and
// restarts the kiosk when its page has gone quiet.
//
// Clients say what they are: the kiosk (`?kiosk=1`, the box's Chromium)
// posts `{"client":"kiosk"}`, a browser on the Mac posts
// `{"client":"browser"}`. The ages are kept apart so an open Mac tab cannot
// hide a hung kiosk from the watchdog (review 2026-10-30 round 5).
type Heartbeat struct {
	mu        sync.Mutex
	last      time.Time
	lastKiosk time.Time
	now       func() time.Time
	// storeHealthy, when set, is reported back to the client with every
	// heartbeat so it can show a persistent warning without polling.
	storeHealthy func() bool
}

// NewHeartbeat creates a heartbeat tracker.
func NewHeartbeat(now func() time.Time) *Heartbeat {
	if now == nil {
		now = time.Now
	}
	return &Heartbeat{now: now}
}

// WithStoreHealth makes the heartbeat response carry `store_ok`.
func (h *Heartbeat) WithStoreHealth(healthy func() bool) *Heartbeat {
	h.storeHealthy = healthy
	return h
}

// heartbeatBody is what the client posts. An empty body (older clients) is
// an untagged browser heartbeat.
type heartbeatBody struct {
	Client string `json:"client"`
}

// Post handles POST /api/heartbeat. The response tells the client whether
// a kiosk is alive (`kiosk_heartbeat_age_s`, -1 when none has checked in)
// and whether the store is writing (`store_ok`).
func (h *Heartbeat) Post(w http.ResponseWriter, r *http.Request) {
	var body heartbeatBody
	if r.Body != nil {
		raw, _ := io.ReadAll(io.LimitReader(r.Body, 1024))
		if len(raw) > 0 {
			if err := json.Unmarshal(raw, &body); err != nil {
				writeError(w, http.StatusBadRequest, "bad_json", "heartbeat body must be JSON")
				return
			}
		}
	}
	h.mu.Lock()
	now := h.now()
	h.last = now
	if body.Client == "kiosk" {
		h.lastKiosk = now
	}
	h.mu.Unlock()
	resp := map[string]any{"ok": true, "kiosk_heartbeat_age_s": h.KioskAge()}
	if h.storeHealthy != nil {
		resp["store_ok"] = h.storeHealthy()
	}
	writeJSON(w, http.StatusOK, resp)
}

// Last returns the last check-in from any client (zero when none).
func (h *Heartbeat) Last() time.Time {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.last
}

// Age returns seconds since the last check-in from any client, or -1 when none.
func (h *Heartbeat) Age() float64 {
	return h.age(h.Last())
}

// KioskAge returns seconds since the last kiosk check-in, or -1 when no
// kiosk has checked in since the backend started.
func (h *Heartbeat) KioskAge() float64 {
	h.mu.Lock()
	last := h.lastKiosk
	h.mu.Unlock()
	return h.age(last)
}

func (h *Heartbeat) age(last time.Time) float64 {
	if last.IsZero() {
		return -1
	}
	return h.now().Sub(last).Seconds()
}
