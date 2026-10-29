package decision

import (
	"reflect"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

func TestRules(t *testing.T) {
	r := NewRules()
	long := "This is a reply that is clearly longer than forty-eight characters in total."
	cases := []struct {
		name     string
		in       Input
		respond  bool
		modality Modality
		timing   Timing
		card     bool
		speaks   bool
	}{
		{"empty", Input{Source: runtime.SourceKeyboard}, false, ModalityNone, TimingNow, false, false},
		{"visual only", Input{SpecChanged: true}, true, ModalityVisual, TimingNow, false, false},
		{"visual with text", Input{SpecChanged: true, ReplyText: "Here."}, true, ModalityBoth, TimingNow, false, true},
		{"short text", Input{ReplyText: "It's 14:05."}, true, ModalityVoice, TimingNow, false, true},
		{"long text", Input{ReplyText: long}, true, ModalityBoth, TimingNow, true, true},
		{"reminder idle", Input{Proactive: "reminder", ReplyText: "Call Ana."}, true, ModalityBoth, TimingNow, true, true},
		{"reminder busy", Input{Proactive: "reminder", ReplyText: "Call Ana.", TurnActive: true}, true, ModalityBoth, TimingHold, true, true},
		{"ambient speaking", Input{Proactive: "ambient", ReplyText: "14:00", Speaking: true}, true, ModalityGlance, TimingHold, true, false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			d := r.Decide(tc.in)
			if d.Respond != tc.respond || d.Modality != tc.modality || d.Timing != tc.timing || d.AutoCard != tc.card || (len(d.Speech) > 0) != tc.speaks {
				t.Fatalf("decision = %+v", d)
			}
		})
	}
}

func TestSentences(t *testing.T) {
	cases := []struct {
		in   string
		want []string
	}{
		{"", nil},
		{"Hello.", []string{"Hello."}},
		{"It's **14:05**. Three things today: standup, review, call. Ok?", []string{"It's 14:05.", "Three things today: standup, review, call. Ok?"}},
		{"No punctuation at all", []string{"No punctuation at all"}},
		{"Wait... Really?! Yes. Go", []string{"Wait... Really?! Yes. Go"}},
		{"First sentence here. Second sentence here.", []string{"First sentence here.", "Second sentence here."}},
	}
	for _, tc := range cases {
		if got := Sentences(tc.in); !reflect.DeepEqual(got, tc.want) {
			t.Errorf("Sentences(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestSentenceStream(t *testing.T) {
	var st SentenceStream
	var got []string
	deltas := []string{"Sure", ". Here is ", "the **first** sentence. And", " the second one, which is 3.5 km long! ", "Then a question? Fi", "nal words"}
	for _, d := range deltas {
		got = append(got, st.Push(d)...)
	}
	want := []string{"Sure. Here is the first sentence.", "And the second one, which is 3.5 km long!", "Then a question?"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("pushed = %q, want %q", got, want)
	}
	if !st.Pending() {
		t.Fatal("remainder not pending")
	}
	if rest := st.Flush(); rest != "Final words" {
		t.Fatalf("flush = %q", rest)
	}
	if st.Pending() || st.Flush() != "" {
		t.Fatal("stream not empty after flush")
	}
	// A blank line ends a sentence without punctuation.
	if got := st.Push("First paragraph without a stop\n\nSecond"); !reflect.DeepEqual(got, []string{"First paragraph without a stop"}) {
		t.Fatalf("blank line = %q", got)
	}
	// The whole text, pushed at once, agrees with Sentences.
	var all SentenceStream
	text := "It's 14:05. Three things today: standup, review, call. Ok?"
	pieces := all.Push(text + " ")
	if rest := all.Flush(); rest != "" {
		pieces[len(pieces)-1] += " " + rest // the short remainder rule of Sentences
	}
	if !reflect.DeepEqual(pieces, Sentences(text)) {
		t.Fatalf("stream %q != Sentences %q", pieces, Sentences(text))
	}
}

func TestRulesStreamSpeech(t *testing.T) {
	r := NewRules()
	if !r.StreamSpeech(Input{Source: runtime.SourceKeyboard}) || r.StreamSpeech(Input{Proactive: "reminder"}) {
		t.Fatal("user turns stream, proactive items do not")
	}
}
