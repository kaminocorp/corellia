// Package config is the only place in the backend that reads environment
// variables. It validates at startup and hands a typed Config to everything
// else (roadmap rule 4).
package config

import (
	"fmt"
	"strings"

	"github.com/caarlos0/env/v11"
)

// Config is the typed view of the process environment.
type Config struct {
	// Port is the HTTP listen port for the API, the SSE stream and the
	// static client.
	Port int `env:"PORT" envDefault:"8080"`

	// DeviceToken is the bearer token the display client presents. When
	// empty the server runs in dev mode and accepts loopback clients only.
	DeviceToken string `env:"CORELLIA_DEVICE_TOKEN"`

	// ClientDir is the directory holding the built client (Vite output).
	// Served with an SPA fallback. When the directory does not exist the
	// server still runs and serves a plain "client not built" page.
	ClientDir string `env:"CORELLIA_CLIENT_DIR" envDefault:"../client/dist"`

	// DataDir holds all local state (transcript, memory, reminders).
	DataDir string `env:"CORELLIA_DATA_DIR" envDefault:"./data"`

	// AgentName is the product-facing name of the agent.
	AgentName string `env:"CORELLIA_AGENT_NAME" envDefault:"Corellia"`

	// Runtime selects the AgentRuntime: auto, local, anthropic, openai or
	// hermes. `auto` picks the first cloud runtime whose credentials are
	// present and falls back to local (Phase 7 adds the cloud ones).
	Runtime string `env:"CORELLIA_RUNTIME" envDefault:"auto"`

	// AnthropicAPIKey enables the anthropic runtime.
	AnthropicAPIKey string `env:"ANTHROPIC_API_KEY"`
	// OpenAIAPIKey / OpenAIBaseURL enable the openai-compatible runtime
	// (DeepSeek: OPENAI_BASE_URL=https://api.deepseek.com/v1).
	OpenAIAPIKey  string `env:"OPENAI_API_KEY"`
	OpenAIBaseURL string `env:"OPENAI_BASE_URL"`
	// Model overrides the cloud runtime's model id (CORELLIA_MODEL).
	Model string `env:"CORELLIA_MODEL"`
	// Effort for the anthropic runtime: low (default), medium, high, xhigh, max.
	Effort string `env:"CORELLIA_EFFORT" envDefault:"low"`
	// HermesURL / HermesToken point at the Hermes chat sidecar.
	HermesURL   string `env:"CORELLIA_HERMES_URL"`
	HermesToken string `env:"CORELLIA_HERMES_TOKEN"`

	// STT / TTS select the voice providers: auto (openai when OPENAI_API_KEY
	// is set and not pointed at DeepSeek, else none), none, openai.
	STT string `env:"CORELLIA_STT" envDefault:"auto"`
	TTS string `env:"CORELLIA_TTS" envDefault:"auto"`
	// TTSVoice is the provider voice name ("" = provider default).
	TTSVoice string `env:"CORELLIA_TTS_VOICE"`
	// VoiceMode is the mic activation mode the client uses: toggle
	// (Ctrl+Space toggles an open, VAD-gated mic) or ptt (hold Ctrl+Space).
	VoiceMode string `env:"CORELLIA_VOICE_MODE" envDefault:"toggle"`

	// DevOrigins are extra origins allowed by CORS (the Vite dev server by
	// default). Comma-separated. The Vite proxy makes this unnecessary in
	// the default dev setup; it exists for running the client from another
	// host while developing.
	DevOrigins []string `env:"CORELLIA_DEV_ORIGINS" envDefault:"http://localhost:5173" envSeparator:","`
}

// Load parses the environment into a Config and validates it.
func Load() (Config, error) {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return Config{}, fmt.Errorf("config: %w", err)
	}
	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

// Validate applies rules that the struct tags cannot express.
func (c Config) Validate() error {
	if c.Port < 1 || c.Port > 65535 {
		return fmt.Errorf("config: PORT %d out of range", c.Port)
	}
	if strings.TrimSpace(c.AgentName) == "" {
		return fmt.Errorf("config: CORELLIA_AGENT_NAME must not be blank")
	}
	switch c.Runtime {
	case "auto", "local", "anthropic", "openai", "hermes":
	default:
		return fmt.Errorf("config: CORELLIA_RUNTIME %q is not one of auto|local|anthropic|openai|hermes", c.Runtime)
	}
	switch c.Effort {
	case "low", "medium", "high", "xhigh", "max":
	default:
		return fmt.Errorf("config: CORELLIA_EFFORT %q is not one of low|medium|high|xhigh|max", c.Effort)
	}
	for _, v := range []string{c.STT, c.TTS} {
		switch v {
		case "auto", "none", "openai":
		default:
			return fmt.Errorf("config: CORELLIA_STT/CORELLIA_TTS %q is not one of auto|none|openai", v)
		}
	}
	switch c.VoiceMode {
	case "toggle", "ptt":
	default:
		return fmt.Errorf("config: CORELLIA_VOICE_MODE %q is not one of toggle|ptt", c.VoiceMode)
	}
	if t := c.DeviceToken; t != "" && len(t) < 16 {
		return fmt.Errorf("config: CORELLIA_DEVICE_TOKEN must be at least 16 characters when set")
	}
	return nil
}

// DevMode reports whether the server runs without a device token.
func (c Config) DevMode() bool { return c.DeviceToken == "" }
