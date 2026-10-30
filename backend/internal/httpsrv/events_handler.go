package httpsrv

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

// EventsHandler streams session events over SSE. It sends a `session`
// snapshot first, then the events after the snapshot's seq, then live
// events, with heartbeats. The snapshot already holds everything earlier
// (spec, transcript, proposals, state) and the client resets to it, so a
// client's Last-Event-ID (header or `last_event_id` query parameter) only
// matters when it is ahead of the snapshot, which cannot happen on one
// server; replaying the whole buffer on every reload was waste (review
// 2026-10-30 round 3).
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

	snap := h.s.Snapshot()
	snap["type"] = "session"
	seq, ok := snap["seq"].(int)
	if !ok {
		// A session that does not report its own seq: read it afterwards
		// (an op in between is replayed and re-applied, never lost).
		seq = h.s.Seq()
		snap["seq"] = seq
	}
	snap["ts"] = h.Now().UTC().Format(time.RFC3339Nano)
	// Subscribe after the snapshot, from its seq: anything published in
	// between is in the bus buffer and comes out of the replay (an op the
	// snapshot already shows is re-applied by the client's reducer, never
	// lost). A snapshot cannot be older than the client's last id, so the
	// larger of the two wins.
	ch, unsub := h.s.Subscribe(max(lastSeq, seq))
	defer unsub()

	h.writeHeaders(w)
	_, _ = fmt.Fprint(w, "retry: 2000\n\n")

	snapJSON, err := json.Marshal(snap)
	if err != nil {
		return
	}
	writeSSE(w, seq, "session", snapJSON)
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
