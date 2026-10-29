package httpsrv

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

// EventsHandler streams session events over SSE. It sends a `session`
// snapshot first, then replays events after Last-Event-ID (header or
// `last_event_id` query parameter), then live events, with heartbeats.
type EventsHandler struct {
	s sessionAPI
	// Heartbeat interval; defaults to 15s.
	Heartbeat time.Duration
	Now       func() time.Time
}

// NewEventsHandler builds the SSE handler.
func NewEventsHandler(s sessionAPI) *EventsHandler {
	return &EventsHandler{s: s, Heartbeat: 15 * time.Second, Now: time.Now}
}

func (h *EventsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}
	lastSeq := 0
	if v := r.Header.Get("Last-Event-ID"); v != "" {
		lastSeq, _ = strconv.Atoi(v)
	} else if v := r.URL.Query().Get("last_event_id"); v != "" {
		lastSeq, _ = strconv.Atoi(v)
	}

	// Subscribe before snapshotting so nothing published in between is lost
	// (the snapshot already reflects it, and the replay re-sends it; the
	// client reducer tolerates that because ops are applied to the
	// snapshot's spec only when seq > snapshot seq).
	ch, unsub := h.s.Subscribe(lastSeq)
	defer unsub()

	h.writeHeaders(w)
	_, _ = fmt.Fprint(w, "retry: 2000\n\n")

	snap := h.s.Snapshot()
	snap["type"] = "session"
	snap["seq"] = h.s.Seq()
	snap["ts"] = h.Now().UTC().Format(time.RFC3339Nano)
	snapJSON, err := json.Marshal(snap)
	if err != nil {
		return
	}
	writeSSE(w, snap["seq"].(int), "session", snapJSON)
	flusher.Flush()

	hb := time.NewTicker(h.Heartbeat)
	defer hb.Stop()
	for {
		select {
		case <-r.Context().Done():
			return
		case it, ok := <-ch:
			if !ok {
				// Dropped as a slow subscriber: end the response so the
				// client reconnects and replays from its last id.
				return
			}
			writeSSE(w, it.Seq, it.Type, it.Data)
			flusher.Flush()
		case <-hb.C:
			_, _ = fmt.Fprint(w, ": hb\n\n")
			flusher.Flush()
		}
	}
}

func (h *EventsHandler) writeHeaders(w http.ResponseWriter) {
	hd := w.Header()
	hd.Set("Content-Type", "text/event-stream; charset=utf-8")
	hd.Set("Cache-Control", "no-cache, no-transform")
	hd.Set("Connection", "keep-alive")
	hd.Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)
}

func writeSSE(w http.ResponseWriter, seq int, typ string, data []byte) {
	_, _ = fmt.Fprintf(w, "id: %d\nevent: %s\ndata: %s\n\n", seq, typ, data)
}
