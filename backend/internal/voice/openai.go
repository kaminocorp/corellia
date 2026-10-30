package voice

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"
)

// OpenAI implements STT and TTS over the OpenAI audio API (also usable
// against compatible gateways through BaseURL).
type OpenAI struct {
	APIKey   string
	BaseURL  string // default https://api.openai.com/v1
	STTModel string // default gpt-4o-mini-transcribe
	TTSModel string // default gpt-4o-mini-tts
	Voice    string // default alloy
	Format   string // default mp3
	HTTP     *http.Client
}

// NewOpenAI applies defaults.
func NewOpenAI(o OpenAI) *OpenAI {
	if o.BaseURL == "" {
		o.BaseURL = "https://api.openai.com/v1"
	}
	o.BaseURL = strings.TrimRight(o.BaseURL, "/")
	if o.STTModel == "" {
		o.STTModel = "gpt-4o-mini-transcribe"
	}
	if o.TTSModel == "" {
		o.TTSModel = "gpt-4o-mini-tts"
	}
	if o.Voice == "" {
		o.Voice = "alloy"
	}
	if o.Format == "" {
		o.Format = "mp3"
	}
	if o.HTTP == nil {
		o.HTTP = &http.Client{Timeout: 60 * time.Second}
	}
	return &o
}

func (o *OpenAI) Name() string { return "openai" }

// MIME of the synthesised audio.
func (o *OpenAI) MIME() string {
	switch o.Format {
	case "wav":
		return "audio/wav"
	case "opus":
		return "audio/ogg"
	case "aac":
		return "audio/aac"
	default:
		return "audio/mpeg"
	}
}

func extFor(mime string) string {
	switch {
	case strings.Contains(mime, "webm"):
		return "webm"
	case strings.Contains(mime, "ogg"):
		return "ogg"
	case strings.Contains(mime, "wav"):
		return "wav"
	case strings.Contains(mime, "mp4"), strings.Contains(mime, "m4a"):
		return "mp4"
	case strings.Contains(mime, "mpeg"), strings.Contains(mime, "mp3"):
		return "mp3"
	}
	return "webm"
}

// Transcribe posts multipart audio to /audio/transcriptions.
func (o *OpenAI) Transcribe(ctx context.Context, audio io.Reader, mime string, hintLanguage string) (Transcript, error) {
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)
	fw, err := mw.CreateFormFile("file", "utterance."+extFor(mime))
	if err != nil {
		return Transcript{}, err
	}
	if _, err := io.Copy(fw, audio); err != nil {
		return Transcript{}, err
	}
	_ = mw.WriteField("model", o.STTModel)
	_ = mw.WriteField("response_format", "json")
	if hintLanguage != "" {
		_ = mw.WriteField("language", hintLanguage)
	}
	_ = mw.Close()
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, o.BaseURL+"/audio/transcriptions", &body)
	if err != nil {
		return Transcript{}, err
	}
	req.Header.Set("Content-Type", mw.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+o.APIKey)
	resp, err := o.HTTP.Do(req)
	if err != nil {
		return Transcript{}, fmt.Errorf("stt: %w", err)
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode/100 != 2 {
		return Transcript{}, fmt.Errorf("stt: HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(raw)))
	}
	var out struct {
		Text     string  `json:"text"`
		Language string  `json:"language"`
		Duration float64 `json:"duration"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return Transcript{}, fmt.Errorf("stt: decode: %w", err)
	}
	return Transcript{Text: strings.TrimSpace(out.Text), Language: out.Language, Duration: out.Duration}, nil
}

// Synthesize posts to /audio/speech and streams the audio back.
func (o *OpenAI) Synthesize(ctx context.Context, text string, voice string) (Audio, error) {
	if voice == "" {
		voice = o.Voice
	}
	payload, _ := json.Marshal(map[string]any{"model": o.TTSModel, "input": text, "voice": voice, "response_format": o.Format})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, o.BaseURL+"/audio/speech", bytes.NewReader(payload))
	if err != nil {
		return Audio{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+o.APIKey)
	resp, err := o.HTTP.Do(req)
	if err != nil {
		return Audio{}, fmt.Errorf("tts: %w", err)
	}
	if resp.StatusCode/100 != 2 {
		raw, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		resp.Body.Close()
		return Audio{}, fmt.Errorf("tts: HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(raw)))
	}
	mime := resp.Header.Get("Content-Type")
	if mime == "" {
		mime = o.MIME()
	}
	return Audio{MIME: mime, Body: resp.Body}, nil
}
