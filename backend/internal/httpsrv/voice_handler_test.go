package httpsrv

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/config"
	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
	"github.com/hejijunhao/corellia/backend/internal/voice"
)

type fakeSTT struct{ got string }

func (f *fakeSTT) Name() string { return "fake" }
func (f *fakeSTT) Transcribe(_ context.Context, r io.Reader, mime string, lang string) (voice.Transcript, error) {
	b, _ := io.ReadAll(r)
	f.got = mime + "|" + lang + "|" + string(b)
	return voice.Transcript{Text: "hello"}, nil
}

type fakeTTS struct{}

func (fakeTTS) Name() string { return "fake" }
func (fakeTTS) Synthesize(_ context.Context, text string, _ string) (voice.Audio, error) {
	return voice.Audio{MIME: "audio/wav", Body: io.NopCloser(strings.NewReader("WAV:" + text))}, nil
}

func voiceServer(t *testing.T, p voice.Providers) http.Handler {
	t.Helper()
	cfg := config.Config{Port: 8080, AgentName: "Corellia", ClientDir: t.TempDir()}
	return New(Deps{Config: cfg, Voice: NewVoiceHandler(p)})
}

func TestVoiceEndpoints(t *testing.T) {
	stt := &fakeSTT{}
	h := voiceServer(t, voice.Providers{STT: stt, TTS: fakeTTS{}, Mode: "toggle"})
	rec := get(h, "/api/voice/capabilities", "127.0.0.1:1")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"stt":"fake"`) || !strings.Contains(rec.Body.String(), `"mode":"toggle"`) {
		t.Fatalf("caps: %d %s", rec.Code, rec.Body.String())
	}
	req := httptest.NewRequest(http.MethodPost, "/api/voice/stt?lang=en", strings.NewReader("AUDIO"))
	req.Host = "localhost:8080"
	req.RemoteAddr = "127.0.0.1:1"
	req.Header.Set("Content-Type", "audio/webm;codecs=opus")
	rec = httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"text":"hello"`) || stt.got != "audio/webm;codecs=opus|en|AUDIO" {
		t.Fatalf("stt: %d %s got=%q", rec.Code, rec.Body.String(), stt.got)
	}
	if rec := post(h, "/api/voice/stt", "x"); rec.Code != 415 {
		t.Fatalf("stt wrong media: %d", rec.Code)
	}
	rec = post(h, "/api/voice/tts", `{"text":"Hi there."}`)
	if rec.Code != 200 || rec.Header().Get("Content-Type") != "audio/wav" || rec.Body.String() != "WAV:Hi there." {
		t.Fatalf("tts: %d %s", rec.Code, rec.Body.String())
	}
	if rec := post(h, "/api/voice/tts", `{"text":""}`); rec.Code != 400 {
		t.Fatalf("tts empty: %d", rec.Code)
	}
}

func TestVoiceNoneProviders(t *testing.T) {
	h := voiceServer(t, voice.Providers{STT: voice.None{}, TTS: voice.None{}, Mode: "toggle"})
	req := httptest.NewRequest(http.MethodPost, "/api/voice/stt", strings.NewReader("AUDIO"))
	req.Host = "localhost:8080"
	req.RemoteAddr = "127.0.0.1:1"
	req.Header.Set("Content-Type", "audio/webm")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 501 {
		t.Fatalf("stt none: %d", rec.Code)
	}
	if rec := post(h, "/api/voice/tts", `{"text":"x"}`); rec.Code != 501 {
		t.Fatalf("tts none: %d", rec.Code)
	}
}

type fakeMemory struct{}

func (fakeMemory) Notes() []builtin.Note       { return []builtin.Note{{ID: "m1", Text: "oat milk"}} }
func (fakeMemory) Pending() []builtin.Reminder { return nil }

func TestMemoryEndpoint(t *testing.T) {
	cfg := config.Config{Port: 8080, AgentName: "Corellia", ClientDir: t.TempDir()}
	h := New(Deps{Config: cfg, Memory: NewMemoryHandler(fakeMemory{})})
	rec := get(h, "/api/memory", "127.0.0.1:1")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), "oat milk") || !strings.Contains(rec.Body.String(), `"reminders":[]`) {
		t.Fatalf("memory: %d %s", rec.Code, rec.Body.String())
	}
}
