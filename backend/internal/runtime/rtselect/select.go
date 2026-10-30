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
// when ANTHROPIC_API_KEY is set, else openai when OPENAI_BASE_URL names an
// endpoint, else local. OPENAI_API_KEY alone does not switch the runtime:
// the README documents it as the voice key, so a silent switch to a
// gpt model surprised the reviewer (2026-10-29). Set CORELLIA_RUNTIME=openai
// explicitly for OpenAI's own chat endpoint. A named runtime without its
// credentials is an error (so a misconfigured box fails loudly).
func Select(cfg config.Config) (runtime.AgentRuntime, string, error) {
	name := cfg.Runtime
	if name == "auto" {
		switch {
		case cfg.AnthropicAPIKey != "":
			name = "anthropic"
		case cfg.OpenAIBaseURL != "":
			name = "openai"
		default:
			name = "local"
		}
	}
	switch name {
	case "local":
		detail := "keyless local runtime (scripted demo)"
		if cfg.Runtime == "auto" && cfg.OpenAIAPIKey != "" {
			detail += "; OPENAI_API_KEY is set but only enables voice: set CORELLIA_RUNTIME=openai to chat through it"
		}
		return local.New(), detail, nil
	case "anthropic":
		if cfg.AnthropicAPIKey == "" {
			return nil, "", fmt.Errorf("runtime anthropic needs ANTHROPIC_API_KEY")
		}
		fallbacks := cfg.AnthropicFallbacks
		return anthropicrt.New(anthropicrt.Options{APIKey: cfg.AnthropicAPIKey, BaseURL: cfg.AnthropicBaseURL, Model: cfg.Model, Effort: cfg.Effort, MaxTokens: cfg.MaxTokens, Fallbacks: &fallbacks, CacheTTL: cfg.CacheTTL}), "model " + orDefault(cfg.Model, "claude-opus-5-5"), nil
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
