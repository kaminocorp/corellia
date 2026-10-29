package session

import "testing"

func TestPhrases(t *testing.T) {
	for _, s := range []string{"yes", "Yes, do it!", "ok go ahead", "sure", "do it", "yep please", "confirmed."} {
		if !IsConfirmPhrase(s) || IsRejectPhrase(s) {
			t.Errorf("%q should confirm", s)
		}
	}
	for _, s := range []string{"no", "No thanks.", "cancel that", "never mind", "don't do it", "stop"} {
		if !IsRejectPhrase(s) || IsConfirmPhrase(s) {
			t.Errorf("%q should reject", s)
		}
	}
	for _, s := range []string{"", "yes and also show me a map", "what time is it", "it", "please"} {
		if IsConfirmPhrase(s) || IsRejectPhrase(s) {
			t.Errorf("%q should be neither", s)
		}
	}
}
