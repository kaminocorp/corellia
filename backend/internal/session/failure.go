package session

import "strings"

// describeFailure turns a runtime error into the short reason the user
// hears and sees. The full error stays in the `session_error` event (the
// debug pane) and in the server log; speaking a URL and a JSON body aloud
// helped nobody (review 2026-10-30, item 5). The cases mirror the
// diagnoses of cmd/runtime-check.
func describeFailure(detail string) string {
	l := strings.ToLower(detail)
	has := func(subs ...string) bool {
		for _, s := range subs {
			if strings.Contains(l, s) {
				return true
			}
		}
		return false
	}
	switch {
	case has("401", "authentication", "invalid x-api-key", "no credentials", "needs anthropic_api_key", "api key"):
		return "The model service rejected my credentials."
	case has("not_found", "unknown model", "model:"):
		return "The model I'm configured for isn't available."
	case has("429", "rate limit", "rate_limit"):
		return "The model service is rate-limiting me. Give it a moment."
	case has("529", "overloaded", "503", "502", "504"):
		return "The model service is overloaded right now."
	case has("500", "internal server error", "api_error"):
		return "The model service had an internal error."
	case has("without a stop reason", "cut off", "unexpected eof", "connection reset", "broken pipe"):
		return "The connection to the model dropped before the reply finished."
	case has("timeout", "deadline exceeded"):
		return "The model took too long to answer."
	case has("dial", "no such host", "connection refused", "network is unreachable"):
		return "I can't reach the model service."
	case has("tool rounds exceeded"):
		return "That needed more tool calls than I'm allowed."
	case has("simulated failure"):
		return "A simulated failure, as requested."
	}
	return "I couldn't tell why; the details are in the server log."
}
