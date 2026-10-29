package voice

import "github.com/hejijunhao/corellia/backend/internal/config"

// Providers bundles the selected STT and TTS.
type Providers struct {
	STT  STT
	TTS  TTS
	Mode string
}

// Select resolves CORELLIA_STT / CORELLIA_TTS (auto|none|openai).
func Select(cfg config.Config) Providers {
	p := Providers{STT: None{}, TTS: None{}, Mode: cfg.VoiceMode}
	var oa *OpenAI
	openai := func() *OpenAI {
		if oa == nil {
			oa = NewOpenAI(OpenAI{APIKey: cfg.OpenAIAPIKey, BaseURL: cfg.OpenAIBaseURL, Voice: cfg.TTSVoice})
		}
		return oa
	}
	wantOpenAI := func(v string) bool {
		return v == "openai" || (v == "auto" && cfg.OpenAIAPIKey != "" && !isDeepSeek(cfg.OpenAIBaseURL))
	}
	if wantOpenAI(cfg.STT) {
		p.STT = openai()
	}
	if wantOpenAI(cfg.TTS) {
		p.TTS = openai()
	}
	return p
}

func isDeepSeek(baseURL string) bool {
	return len(baseURL) > 0 && (contains(baseURL, "deepseek"))
}

func contains(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}

// Capabilities reports the providers.
func (p Providers) Capabilities() Capabilities {
	c := Capabilities{STT: p.STT.Name(), TTS: p.TTS.Name(), Mode: p.Mode}
	if o, ok := p.TTS.(*OpenAI); ok {
		c.TTSFormat = o.MIME()
	}
	return c
}
