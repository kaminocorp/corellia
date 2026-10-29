// Package voice defines the speech-to-text and text-to-speech provider
// seams (roadmap question 3) and the providers: none (the client uses the
// browser's own recognition and synthesis) and openai (Whisper-shaped
// transcription and the speech endpoint). Vendor swap is one file.
package voice

import (
	"context"
	"errors"
	"io"
)

// Transcript is an STT result.
type Transcript struct {
	Text     string  `json:"text"`
	Language string  `json:"language,omitempty"`
	Duration float64 `json:"duration,omitempty"`
}

// STT transcribes an utterance.
type STT interface {
	Name() string
	// Transcribe reads encoded audio (webm/opus, wav, mp3...) with its MIME type.
	Transcribe(ctx context.Context, audio io.Reader, mime string, hintLanguage string) (Transcript, error)
}

// Audio is a synthesised speech stream.
type Audio struct {
	MIME string
	Body io.ReadCloser
}

// TTS renders speech.
type TTS interface {
	Name() string
	// Synthesize returns audio for text. Voice is provider-specific; "" means default.
	Synthesize(ctx context.Context, text string, voice string) (Audio, error)
}

// ErrUnavailable is returned by the none provider.
var ErrUnavailable = errors.New("voice: provider not configured")

// None is the keyless provider: the client falls back to browser speech APIs.
type None struct{}

func (None) Name() string { return "none" }
func (None) Transcribe(context.Context, io.Reader, string, string) (Transcript, error) {
	return Transcript{}, ErrUnavailable
}
func (None) Synthesize(context.Context, string, string) (Audio, error) {
	return Audio{}, ErrUnavailable
}

// Capabilities is what /api/voice/capabilities reports.
type Capabilities struct {
	STT       string `json:"stt"`
	TTS       string `json:"tts"`
	TTSFormat string `json:"tts_format,omitempty"`
	// Mode is the activation mode the client should use (toggle | ptt).
	Mode string `json:"mode"`
}
