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
	if t := c.DeviceToken; t != "" && len(t) < 16 {
		return fmt.Errorf("config: CORELLIA_DEVICE_TOKEN must be at least 16 characters when set")
	}
	return nil
}

// DevMode reports whether the server runs without a device token.
func (c Config) DevMode() bool { return c.DeviceToken == "" }
