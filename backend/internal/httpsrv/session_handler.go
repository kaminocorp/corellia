package httpsrv

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/session"
)

// sessionAPI is the slice of *session.Session the handlers need, so tests
// can fake it.
type sessionAPI interface {
	StartTurn(text string, source runtime.Source) (turnID string, cancelled string, err error)
	Cancel(turnID string) bool
	Snapshot() map[string]any
	Subscribe(lastSeq int) (<-chan session.Item, func())
	Seq() int
}

// SessionHandler serves /api/session, /api/turn, /api/turn/cancel and
// /api/catalog. Handlers parse, call the session, and write; nothing else.
type SessionHandler struct {
	s   sessionAPI
	reg *contract.Registry
}

// NewSessionHandler builds the handler.
func NewSessionHandler(s sessionAPI, reg *contract.Registry) *SessionHandler {
	return &SessionHandler{s: s, reg: reg}
}

const maxBody = 64 << 10

// decodeBody reads a JSON body, validates it against the named API
// definition and decodes it into v. It writes the error response itself.
func (h *SessionHandler) decodeBody(w http.ResponseWriter, r *http.Request, def string, v any) bool {
	raw, err := io.ReadAll(io.LimitReader(r.Body, maxBody+1))
	if err != nil || len(raw) > maxBody {
		writeError(w, http.StatusRequestEntityTooLarge, "body_too_large", "request body too large")
		return false
	}
	var generic any
	if err := json.Unmarshal(raw, &generic); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", err.Error())
		return false
	}
	if h.reg != nil {
		if err := h.reg.ValidateAPI(def, generic); err != nil {
			writeError(w, http.StatusBadRequest, "invalid_request", err.Error())
			return false
		}
	}
	if err := json.Unmarshal(raw, v); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", err.Error())
		return false
	}
	return true
}

// GetSession returns the snapshot.
func (h *SessionHandler) GetSession(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.s.Snapshot())
}

// PostTurn starts a turn.
func (h *SessionHandler) PostTurn(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Text   string `json:"text"`
		Source string `json:"source"`
	}
	if !h.decodeBody(w, r, "TurnRequest", &req) {
		return
	}
	source := runtime.SourceKeyboard
	if req.Source == "voice" {
		source = runtime.SourceVoice
	}
	id, cancelled, err := h.s.StartTurn(req.Text, source)
	if err != nil {
		if errors.Is(err, session.ErrNoRuntime) {
			writeError(w, http.StatusServiceUnavailable, "no_runtime", err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "turn_failed", err.Error())
		return
	}
	resp := map[string]any{"turn_id": id}
	if cancelled != "" {
		resp["cancelled_turn_id"] = cancelled
	}
	writeJSON(w, http.StatusAccepted, resp)
}

// PostCancel cancels the running turn (or a specific one).
func (h *SessionHandler) PostCancel(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TurnID string `json:"turn_id"`
	}
	if r.ContentLength != 0 {
		if !h.decodeBody(w, r, "CancelRequest", &req) {
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"cancelled": h.s.Cancel(req.TurnID)})
}

// GetCatalog serves the raw catalog JSON.
func (h *SessionHandler) GetCatalog(w http.ResponseWriter, _ *http.Request) {
	if h.reg == nil {
		writeError(w, http.StatusServiceUnavailable, "no_catalog", "catalog not loaded")
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(h.reg.CatalogJSON())
}

func writeError(w http.ResponseWriter, status int, code, msg string) {
	writeJSON(w, status, map[string]any{"error": msg, "code": code})
}
