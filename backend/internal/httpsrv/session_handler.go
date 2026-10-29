package httpsrv

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/hejijunhao/corellia/backend/internal/actions"
	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/session"
)

// sessionAPI is the slice of *session.Session the handlers need, so tests
// can fake it.
type sessionAPI interface {
	Handle(text string, source runtime.Source) (session.Outcome, error)
	Cancel(turnID string) bool
	Snapshot() map[string]any
	Subscribe(lastSeq int) (<-chan session.Item, func())
	Seq() int
	FireAction(actionID string, nodeID string) error
	ClearScreen() error
	RemoveNode(id string) error
	Confirm(id string, source runtime.Source) error
	Reject(id string, source runtime.Source) error
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
	if strings.TrimSpace(req.Text) == "" {
		writeError(w, http.StatusBadRequest, "invalid_request", "text must not be blank")
		return
	}
	source := runtime.SourceKeyboard
	if req.Source == "voice" {
		source = runtime.SourceVoice
	}
	out, err := h.s.Handle(req.Text, source)
	if err != nil {
		if errors.Is(err, session.ErrNoRuntime) {
			writeError(w, http.StatusServiceUnavailable, "no_runtime", err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "turn_failed", err.Error())
		return
	}
	resp := map[string]any{"turn_id": out.TurnID, "handled": out.Handled}
	if out.CancelledTurnID != "" {
		resp["cancelled_turn_id"] = out.CancelledTurnID
	}
	if out.ProposalID != "" {
		resp["proposal_id"] = out.ProposalID
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

// PostAction fires a spec action chosen on the client (keyboard or voice).
func (h *SessionHandler) PostAction(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ActionID string `json:"action_id"`
		NodeID   string `json:"node_id"`
	}
	if !h.decodeBody(w, r, "ActionRequest", &req) {
		return
	}
	switch err := h.s.FireAction(req.ActionID, req.NodeID); {
	case err == nil:
		writeJSON(w, http.StatusOK, map[string]any{"ok": true})
	case errors.Is(err, session.ErrActionNotFound):
		writeError(w, http.StatusNotFound, "action_not_found", err.Error())
	case errors.Is(err, session.ErrActionUnsupported):
		writeError(w, http.StatusNotImplemented, "action_unsupported", err.Error())
	default:
		writeError(w, http.StatusBadRequest, "action_failed", err.Error())
	}
}

// PostConfirm confirms a pending proposal; PostReject rejects it.
func (h *SessionHandler) PostConfirm(w http.ResponseWriter, r *http.Request) { h.decide(w, r, true) }
func (h *SessionHandler) PostReject(w http.ResponseWriter, r *http.Request)  { h.decide(w, r, false) }

func (h *SessionHandler) decide(w http.ResponseWriter, r *http.Request, confirm bool) {
	var req struct {
		ProposalID string `json:"proposal_id"`
		Source     string `json:"source"`
	}
	if !h.decodeBody(w, r, "ConfirmRequest", &req) {
		return
	}
	source := runtime.SourceKeyboard
	if req.Source == "voice" {
		source = runtime.SourceVoice
	}
	var err error
	if confirm {
		err = h.s.Confirm(req.ProposalID, source)
	} else {
		err = h.s.Reject(req.ProposalID, source)
	}
	switch {
	case err == nil:
		writeJSON(w, http.StatusOK, map[string]any{"ok": true})
	case errors.Is(err, actions.ErrNotFound), errors.Is(err, actions.ErrExpired):
		writeError(w, http.StatusNotFound, "proposal_not_found", err.Error())
	case errors.Is(err, session.ErrNoGate):
		writeError(w, http.StatusNotImplemented, "no_gate", err.Error())
	default:
		writeError(w, http.StatusBadRequest, "decision_failed", err.Error())
	}
}

// PostScreenClear clears the screen (Escape when idle).
func (h *SessionHandler) PostScreenClear(w http.ResponseWriter, _ *http.Request) {
	if err := h.s.ClearScreen(); err != nil {
		writeError(w, http.StatusInternalServerError, "clear_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// PostScreenRemove reports a client-side decay so the server spec follows.
func (h *SessionHandler) PostScreenRemove(w http.ResponseWriter, r *http.Request) {
	var req struct {
		NodeID string `json:"node_id"`
	}
	raw, err := io.ReadAll(io.LimitReader(r.Body, maxBody))
	if err != nil || json.Unmarshal(raw, &req) != nil || req.NodeID == "" {
		writeError(w, http.StatusBadRequest, "invalid_request", "node_id required")
		return
	}
	if err := h.s.RemoveNode(req.NodeID); err != nil {
		writeError(w, http.StatusBadRequest, "remove_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
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
