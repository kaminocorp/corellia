package session

import (
	"errors"
	"strings"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

// describeFailure turns a runtime error into the short reason the user
// hears and sees. The full error stays in the `session_error` event (the
// debug pane) and in the server log; speaking a URL and a JSON body aloud
// helped nobody (review 2026-10-30, item 5). The cases mirror the
// diagnoses of cmd/runtime-check.
//
// A provider answer is classified by its HTTP status (runtime.StatusError),
// never by searching the message: a request id such as req_011CXyz4019
// contains "401", and a JSON body can contain "model:" or "500" (review
// 2026-10-30 round 3). Substrings are only used for errors that carry no
// status: transport failures, timeouts, the runtime's own messages.
func describeFailure(err error) string {
	if err == nil {
		return "I couldn't tell why; the details are in the server log."
	}
	var se *runtime.StatusError
	if errors.As(err, &se) {
		return describeStatus(se.Status)
	}
	if errors.Is(err, runtime.ErrTruncated) {
		return "My reply was cut off before it finished."
	}
	if errors.Is(err, runtime.ErrRefused) {
		return "I can't help with that one."
	}
	l := strings.ToLower(err.Error())
	has := func(subs ...string) bool {
		for _, s := range subs {
			if strings.Contains(l, s) {
				return true
			}
		}
		return false
	}
	switch {
	case has("authentication_error", "invalid x-api-key", "no credentials", "needs anthropic_api_key"):
		return "The model service rejected my credentials."
	case has("not_found_error", "unknown model"):
		return "The model I'm configured for isn't available."
	case has("rate_limit_error", "rate limit", "rate-limit"):
		return "The model service is rate-limiting me. Give it a moment."
	case has("overloaded_error", "overloaded"):
		return "The model service is overloaded right now."
	case has("api_error", "internal server error"):
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

// describeStatus is the plain-words reason for an HTTP status from the
// model service.
func describeStatus(status int) string {
	switch {
	case status == 401 || status == 403:
		return "The model service rejected my credentials."
	case status == 404:
		return "The model I'm configured for isn't available."
	case status == 429:
		return "The model service is rate-limiting me. Give it a moment."
	case status == 529 || status == 502 || status == 503 || status == 504:
		return "The model service is overloaded right now."
	case status == 408:
		return "The model took too long to answer."
	case status == 400 || status == 413 || status == 422:
		return "The model service rejected the request; the details are in the server log."
	case status >= 500:
		return "The model service had an internal error."
	}
	return "The model service answered with an error; the details are in the server log."
}

// ellipsize marks text that stops before its sentence ended, so a fragment
// is not read, or spoken, as the whole answer ("the Sorry, that didn't…"
// was one utterance; review 2026-10-30 round 3).
func ellipsize(partial string) string {
	p := strings.TrimSpace(partial)
	if p == "" {
		return ""
	}
	if strings.ContainsAny(p[len(p)-1:], ".!?…:") {
		return p
	}
	return p + "…"
}
