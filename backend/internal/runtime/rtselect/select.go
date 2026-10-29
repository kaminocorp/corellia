// Package rtselect resolves CORELLIA_RUNTIME into an AgentRuntime.
package rtselect

import (
	"fmt"

	"github.com/hejijunhao/corellia/backend/internal/config"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	anthropicrt "github.com/hejijunhao/corellia/backend/internal/runtime/anthropic"
	"github.com/hejijunhao/corellia/backend/internal/runtime/hermes"
	"github.com/hejijunhao/corellia/backend/internal/runtime/local"
	"github.com/hejijunhao/corellia/backend/internal/runtime/openaicompat"
)

// Select builds the runtime named by the config. `auto` picks anthropic
// when ANTHROPIC_API_KEY is set, else openai when OPENAI_API_KEY or
// OPENAI_BASE_URL is set, else local. A named runtime without its
// credentials is an error (so a misconfigured box fails loudly).
func Select(cfg config.Config) (runtime.AgentRuntime, string, error) {
	name := cfg.Runtime
	if name == "auto" {
		switch {
		case cfg.AnthropicAPIKey != "":
			name = "anthropic"
		case cfg.OpenAIAPIKey != "" || cfg.OpenAIBaseURL != "":
			name = "openai"
		default:
			name = "local"
		}
	}
	switch name {
	case "local":
		return local.New(), "keyless local runtime", nil
	case "anthropic":
		if cfg.AnthropicAPIKey == "" {
			return nil, "", fmt.Errorf("runtime anthropic needs ANTHROPIC_API_KEY")
		}
		return anthropicrt.New(anthropicrt.Options{APIKey: cfg.AnthropicAPIKey, Model: cfg.Model, Effort: cfg.Effort}), "model " + orDefault(cfg.Model, "claude-opus-5-5"), nil
	case "openai":
		if cfg.OpenAIAPIKey == "" && cfg.OpenAIBaseURL == "" {
			return nil, "", fmt.Errorf("runtime openai needs OPENAI_API_KEY or OPENAI_BASE_URL")
		}
		rt := openaicompat.New(openaicompat.Options{APIKey: cfg.OpenAIAPIKey, BaseURL: cfg.OpenAIBaseURL, Model: cfg.Model})
		return rt, "openai-compatible endpoint " + orDefault(cfg.OpenAIBaseURL, "https://api.openai.com/v1"), nil
	case "hermes":
		if cfg.HermesURL == "" {
			return nil, "", fmt.Errorf("runtime hermes needs CORELLIA_HERMES_URL")
		}
		return hermes.New(hermes.Options{BaseURL: cfg.HermesURL, Token: cfg.HermesToken, PrimeInstructions: true}), "sidecar " + cfg.HermesURL, nil
	}
	return nil, "", fmt.Errorf("unknown runtime %q", name)
}

func orDefault(v, d string) string {
	if v == "" {
		return d
	}
	return v
}
