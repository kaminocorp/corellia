package httpsrv

import (
	"net/http"

	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
)

// memoryAPI is what the inspection endpoint needs from the memory store.
type memoryAPI interface {
	Notes() []builtin.Note
	Pending() []builtin.Reminder
}

// MemoryHandler serves GET /api/memory for inspection and debugging.
type MemoryHandler struct{ m memoryAPI }

// NewMemoryHandler builds the handler.
func NewMemoryHandler(m memoryAPI) *MemoryHandler { return &MemoryHandler{m: m} }

func (h *MemoryHandler) Get(w http.ResponseWriter, _ *http.Request) {
	notes := h.m.Notes()
	if notes == nil {
		notes = []builtin.Note{}
	}
	reminders := h.m.Pending()
	if reminders == nil {
		reminders = []builtin.Reminder{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"notes": notes, "reminders": reminders})
}
