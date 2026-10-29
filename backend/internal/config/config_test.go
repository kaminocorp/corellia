package config

import (
	"strings"
	"testing"
)

func TestLoadDefaults(t *testing.T) {
	for _, k := range []string{"PORT", "CORELLIA_DEVICE_TOKEN", "CORELLIA_CLIENT_DIR", "CORELLIA_DATA_DIR", "CORELLIA_AGENT_NAME", "CORELLIA_DEV_ORIGINS"} {
		t.Setenv(k, "")
	}
	// t.Setenv to "" still counts as set for caarlos0/env; unset explicitly.
	for _, k := range []string{"PORT", "CORELLIA_DEVICE_TOKEN", "CORELLIA_CLIENT_DIR", "CORELLIA_DATA_DIR", "CORELLIA_AGENT_NAME", "CORELLIA_DEV_ORIGINS", "CORELLIA_RUNTIME", "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "OPENAI_BASE_URL", "CORELLIA_MODEL", "CORELLIA_EFFORT", "CORELLIA_HERMES_URL", "CORELLIA_HERMES_TOKEN", "CORELLIA_STT", "CORELLIA_TTS", "CORELLIA_TTS_VOICE", "CORELLIA_VOICE_MODE"} {
		unsetenv(t, k)
	}
	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Port != 8080 {
		t.Errorf("Port = %d, want 8080", cfg.Port)
	}
	if !cfg.DevMode() {
		t.Errorf("DevMode = false, want true with no token")
	}
	if cfg.Runtime != "auto" {
		t.Errorf("Runtime = %q", cfg.Runtime)
	}
	if cfg.AgentName != "Corellia" {
		t.Errorf("AgentName = %q", cfg.AgentName)
	}
	if len(cfg.DevOrigins) != 1 || cfg.DevOrigins[0] != "http://localhost:5173" {
		t.Errorf("DevOrigins = %v", cfg.DevOrigins)
	}
}

func TestValidate(t *testing.T) {
	base := Config{Port: 8080, AgentName: "Corellia", Runtime: "auto", Effort: "low", STT: "auto", TTS: "auto", VoiceMode: "toggle"}
	cases := []struct {
		name    string
		mutate  func(*Config)
		wantErr string
	}{
		{"ok", func(*Config) {}, ""},
		{"port low", func(c *Config) { c.Port = 0 }, "PORT"},
		{"port high", func(c *Config) { c.Port = 70000 }, "PORT"},
		{"blank name", func(c *Config) { c.AgentName = "  " }, "AGENT_NAME"},
		{"short token", func(c *Config) { c.DeviceToken = "short" }, "DEVICE_TOKEN"},
		{"long token ok", func(c *Config) { c.DeviceToken = strings.Repeat("x", 32) }, ""},
		{"bad runtime", func(c *Config) { c.Runtime = "deepseek" }, "CORELLIA_RUNTIME"},
		{"runtime local", func(c *Config) { c.Runtime = "local" }, ""},
		{"bad effort", func(c *Config) { c.Effort = "turbo" }, "CORELLIA_EFFORT"},
		{"bad stt", func(c *Config) { c.STT = "whisper" }, "CORELLIA_STT"},
		{"bad voice mode", func(c *Config) { c.VoiceMode = "wake" }, "CORELLIA_VOICE_MODE"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			c := base
			tc.mutate(&c)
			err := c.Validate()
			if tc.wantErr == "" && err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if tc.wantErr != "" && (err == nil || !strings.Contains(err.Error(), tc.wantErr)) {
				t.Fatalf("err = %v, want containing %q", err, tc.wantErr)
			}
		})
	}
}
