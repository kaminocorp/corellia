package voice

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/config"
)

func TestOpenAIProvider(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer key" {
			w.WriteHeader(401)
			return
		}
		switch r.URL.Path {
		case "/v1/audio/transcriptions":
			if err := r.ParseMultipartForm(1 << 20); err != nil {
				w.WriteHeader(400)
				return
			}
			f, hdr, err := r.FormFile("file")
			if err != nil {
				w.WriteHeader(400)
				return
			}
			data, _ := io.ReadAll(f)
			if string(data) != "AUDIO" || !strings.HasSuffix(hdr.Filename, ".webm") || r.FormValue("model") != "gpt-4o-mini-transcribe" || r.FormValue("language") != "en" {
				w.WriteHeader(422)
				return
			}
			_, _ = w.Write([]byte(`{"text":"  what time is it \n","language":"en","duration":1.2}`))
		case "/v1/audio/speech":
			body, _ := io.ReadAll(r.Body)
			if !strings.Contains(string(body), `"input":"Hello."`) || !strings.Contains(string(body), `"voice":"alloy"`) {
				w.WriteHeader(422)
				return
			}
			w.Header().Set("Content-Type", "audio/mpeg")
			_, _ = w.Write([]byte("MP3DATA"))
		default:
			w.WriteHeader(404)
		}
	}))
	defer srv.Close()
	p := NewOpenAI(OpenAI{APIKey: "key", BaseURL: srv.URL + "/v1/"})
	tr, err := p.Transcribe(context.Background(), strings.NewReader("AUDIO"), "audio/webm;codecs=opus", "en")
	if err != nil || tr.Text != "what time is it" || tr.Duration != 1.2 {
		t.Fatalf("transcribe = %+v %v", tr, err)
	}
	a, err := p.Synthesize(context.Background(), "Hello.", "")
	if err != nil {
		t.Fatal(err)
	}
	data, _ := io.ReadAll(a.Body)
	a.Body.Close()
	if a.MIME != "audio/mpeg" || string(data) != "MP3DATA" {
		t.Fatalf("audio = %s %q", a.MIME, data)
	}
	bad := NewOpenAI(OpenAI{APIKey: "wrong", BaseURL: srv.URL + "/v1"})
	if _, err := bad.Transcribe(context.Background(), strings.NewReader("x"), "audio/webm", ""); err == nil || !strings.Contains(err.Error(), "401") {
		t.Fatalf("expected 401, got %v", err)
	}
}

func TestSelect(t *testing.T) {
	cases := []struct {
		name string
		cfg  config.Config
		stt  string
		tts  string
	}{
		{"auto without key", config.Config{STT: "auto", TTS: "auto", VoiceMode: "toggle"}, "none", "none"},
		{"auto with openai key", config.Config{STT: "auto", TTS: "auto", OpenAIAPIKey: "k"}, "openai", "openai"},
		{"auto with deepseek key is not openai audio", config.Config{STT: "auto", TTS: "auto", OpenAIAPIKey: "k", OpenAIBaseURL: "https://api.deepseek.com/v1"}, "none", "none"},
		{"explicit mix", config.Config{STT: "none", TTS: "openai", OpenAIAPIKey: "k"}, "none", "openai"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			p := Select(tc.cfg)
			c := p.Capabilities()
			if c.STT != tc.stt || c.TTS != tc.tts {
				t.Fatalf("caps = %+v", c)
			}
			if tc.tts == "openai" && c.TTSFormat != "audio/mpeg" {
				t.Fatalf("format = %q", c.TTSFormat)
			}
		})
	}
	if _, err := (None{}).Synthesize(context.Background(), "x", ""); err != ErrUnavailable {
		t.Fatal("none should be unavailable")
	}
}
