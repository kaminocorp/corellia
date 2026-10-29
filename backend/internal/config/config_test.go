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

func TestTokenModeDropsDefaultDevOrigins(t *testing.T) {
	unsetenv(t, "CORELLIA_DEV_ORIGINS")
	t.Setenv("CORELLIA_DEVICE_TOKEN", "0123456789abcdef0123456789abcdef")
	t.Setenv("ANTHROPIC_BASE_URL", "http://gateway.internal:8000")
	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if len(cfg.DevOrigins) != 0 {
		t.Errorf("DevOrigins = %v, want none in token mode without CORELLIA_DEV_ORIGINS", cfg.DevOrigins)
	}
	if cfg.AnthropicBaseURL != "http://gateway.internal:8000" {
		t.Errorf("AnthropicBaseURL = %q", cfg.AnthropicBaseURL)
	}
	t.Setenv("CORELLIA_DEV_ORIGINS", "http://box.local:5173")
	cfg, err = Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if len(cfg.DevOrigins) != 1 || cfg.DevOrigins[0] != "http://box.local:5173" {
		t.Errorf("explicit DevOrigins = %v", cfg.DevOrigins)
	}
}

func TestValidate(t *testing.T) {
	base := Config{Port: 8080, AgentName: "Corellia", Runtime: "auto", Effort: "low", STT: "auto", TTS: "auto", VoiceMode: "toggle", VoiceBargeIn: "auto"}
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
		{"bad barge-in", func(c *Config) { c.VoiceBargeIn = "sometimes" }, "CORELLIA_VOICE_BARGE_IN"},
		{"barge-in off", func(c *Config) { c.VoiceBargeIn = "off" }, ""},
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

func TestListenAddrAndProxies(t *testing.T) {
	dev := Config{Port: 8080}
	if got := dev.ListenAddr(); got != "127.0.0.1:8080" {
		t.Errorf("dev ListenAddr = %q", got)
	}
	tok := Config{Port: 8080, DeviceToken: "0123456789abcdef0123456789abcdef"}
	if got := tok.ListenAddr(); got != ":8080" {
		t.Errorf("token ListenAddr = %q", got)
	}
	bound := Config{Port: 9000, Bind: "0.0.0.0"}
	if got := bound.ListenAddr(); got != "0.0.0.0:9000" {
		t.Errorf("bind ListenAddr = %q", got)
	}
	nets, err := Config{TrustedProxies: []string{"10.0.0.0/8", "192.168.1.5", " "}}.TrustedProxyNets()
	if err != nil || len(nets) != 2 || nets[1].String() != "192.168.1.5/32" {
		t.Errorf("TrustedProxyNets = %v, %v", nets, err)
	}
	if _, err := (Config{TrustedProxies: []string{"nope"}}).TrustedProxyNets(); err == nil {
		t.Error("bad CIDR accepted")
	}
	valid := Config{Port: 8080, AgentName: "x", Runtime: "auto", Effort: "low", STT: "auto", TTS: "auto", VoiceMode: "toggle"}
	withBind := valid
	withBind.Bind = "localhost"
	if err := withBind.Validate(); err == nil {
		t.Error("bind hostname accepted")
	}
	withTZ := valid
	withTZ.TZ = "Mars/Olympus"
	if err := withTZ.Validate(); err == nil {
		t.Error("bad TZ accepted")
	}
	loc, err := (Config{TZ: "Europe/Lisbon"}).Location()
	if err != nil || loc.String() != "Europe/Lisbon" {
		t.Errorf("Location = %v, %v", loc, err)
	}
}

func TestHostAllowed(t *testing.T) {
	pats := []string{"upload.wikimedia.org", "*.unsplash.com"}
	cases := map[string]bool{
		"upload.wikimedia.org": true,
		"UPLOAD.wikimedia.org": true,
		"images.unsplash.com":  true,
		"unsplash.com":         false,
		"evil.org":             false,
		"":                     false,
	}
	for host, want := range cases {
		if got := HostAllowed(pats, host); got != want {
			t.Errorf("HostAllowed(%q) = %v, want %v", host, got, want)
		}
	}
	if !HostAllowed([]string{"*"}, "anything.example") {
		t.Error("wildcard should allow everything")
	}
}
