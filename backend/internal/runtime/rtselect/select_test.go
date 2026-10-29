package rtselect

import (
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/config"
)

func TestSelect(t *testing.T) {
	cases := []struct {
		name string
		cfg  config.Config
		want string
		err  bool
	}{
		{"auto no keys", config.Config{Runtime: "auto"}, "local", false},
		{"auto anthropic", config.Config{Runtime: "auto", AnthropicAPIKey: "k"}, "anthropic", false},
		{"auto openai", config.Config{Runtime: "auto", OpenAIBaseURL: "http://x"}, "openai", false},
		{"auto with only OPENAI_API_KEY stays local", config.Config{Runtime: "auto", OpenAIAPIKey: "k"}, "local", false},
		{"explicit openai with key", config.Config{Runtime: "openai", OpenAIAPIKey: "k"}, "openai", false},
		{"anthropic without key", config.Config{Runtime: "anthropic"}, "", true},
		{"hermes", config.Config{Runtime: "hermes", HermesURL: "http://h"}, "hermes", false},
		{"hermes without url", config.Config{Runtime: "hermes"}, "", true},
		{"unknown", config.Config{Runtime: "deepseek"}, "", true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			rt, _, err := Select(tc.cfg)
			if (err != nil) != tc.err {
				t.Fatalf("err = %v", err)
			}
			if !tc.err && rt.Name() != tc.want {
				t.Fatalf("runtime = %s, want %s", rt.Name(), tc.want)
			}
		})
	}
}
