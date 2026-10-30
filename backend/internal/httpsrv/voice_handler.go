package httpsrv

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/hejijunhao/corellia/backend/internal/voice"
)

// VoiceHandler serves STT and TTS for the client. The client falls back to
// browser speech APIs when capabilities report "none".
type VoiceHandler struct {
	p voice.Providers
	// MaxAudioBytes caps an uploaded utterance (default 8 MiB).
	MaxAudioBytes int64
}

// NewVoiceHandler builds the handler.
func NewVoiceHandler(p voice.Providers) *VoiceHandler {
	return &VoiceHandler{p: p, MaxAudioBytes: 8 << 20}
}

// GetCapabilities reports providers and activation mode.
func (h *VoiceHandler) GetCapabilities(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.p.Capabilities())
}

// PostSTT transcribes the request body (raw audio; Content-Type is the
// codec). `?lang=` hints the language.
func (h *VoiceHandler) PostSTT(w http.ResponseWriter, r *http.Request) {
	mime := r.Header.Get("Content-Type")
	if mime == "" || !strings.HasPrefix(mime, "audio/") {
		writeError(w, http.StatusUnsupportedMediaType, "unsupported_media", "send raw audio with an audio/* Content-Type")
		return
	}
	body := http.MaxBytesReader(w, r.Body, h.MaxAudioBytes)
	tr, err := h.p.STT.Transcribe(r.Context(), body, mime, r.URL.Query().Get("lang"))
	switch {
	case errors.Is(err, voice.ErrUnavailable):
		writeError(w, http.StatusNotImplemented, "stt_unavailable", "no server STT provider; use browser recognition")
	case err != nil:
		var mbe *http.MaxBytesError
		if errors.As(err, &mbe) {
			writeError(w, http.StatusRequestEntityTooLarge, "audio_too_large", err.Error())
			return
		}
		writeError(w, http.StatusBadGateway, "stt_failed", err.Error())
	default:
		writeJSON(w, http.StatusOK, tr)
	}
}

// PostTTS synthesises {"text": "...", "voice": "..."} and streams audio.
func (h *VoiceHandler) PostTTS(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Text  string `json:"text"`
		Voice string `json:"voice"`
	}
	raw, err := io.ReadAll(io.LimitReader(r.Body, maxBody))
	if err != nil || json.Unmarshal(raw, &req) != nil || strings.TrimSpace(req.Text) == "" {
		writeError(w, http.StatusBadRequest, "invalid_request", "text required")
		return
	}
	if len(req.Text) > 4000 {
		writeError(w, http.StatusBadRequest, "text_too_long", "text must be at most 4000 characters")
		return
	}
	a, err := h.p.TTS.Synthesize(r.Context(), req.Text, req.Voice)
	switch {
	case errors.Is(err, voice.ErrUnavailable):
		writeError(w, http.StatusNotImplemented, "tts_unavailable", "no server TTS provider; use speechSynthesis")
		return
	case err != nil:
		writeError(w, http.StatusBadGateway, "tts_failed", err.Error())
		return
	}
	defer a.Body.Close()
	w.Header().Set("Content-Type", a.MIME)
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusOK)
	_, _ = io.Copy(w, a.Body)
}
