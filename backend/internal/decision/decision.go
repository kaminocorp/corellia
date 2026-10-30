// Package decision is the seam for the "Jev logic" (VISION.md 6): given
// what the runtime produced and what is on screen, decide whether to
// respond, with which modality, what to say, when, and what to clear. The
// default is rules; a model-backed Decider can replace it later.
package decision

import (
	"bytes"
	"regexp"
	"strings"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

// Modality is how a reply surfaces (mirrors events.schema.json).
type Modality string

const (
	ModalityNone   Modality = "none"
	ModalityVoice  Modality = "voice"
	ModalityGlance Modality = "glance"
	ModalityVisual Modality = "visual"
	ModalityBoth   Modality = "both"
)

// Timing says when to surface something.
type Timing string

const (
	TimingNow            Timing = "now"
	TimingAfterUtterance Timing = "after_utterance"
	TimingHold           Timing = "hold"
)

// Input is everything the decider may look at.
type Input struct {
	Source   runtime.Source
	UserText string
	// ReplyText is the runtime's full text (may be empty).
	ReplyText string
	// SpecChanged says the runtime emitted ops this turn.
	SpecChanged bool
	// RootFit is the root component's fit class after the ops: "", "glance", "panel", "full".
	RootFit string
	// ScreenBusy: something is on screen from a previous turn.
	ScreenBusy bool
	// Speaking / TurnActive describe the current state when a proactive item arrives.
	Speaking   bool
	TurnActive bool
	// Proactive source: "" for user turns, else reminder|ambient|runtime.
	Proactive string
	Now       time.Time
}

// Decision is the outcome.
type Decision struct {
	Respond  bool
	Modality Modality
	// Speech is what to say, split into sentence-sized pieces (empty = say nothing).
	Speech []string
	Timing Timing
	// AutoCard: a text card should be shown for the reply (no spec came).
	AutoCard bool
	// AutoCardTTL applies when AutoCard is set.
	AutoCardTTL time.Duration
	// Reason is a short explanation for logs and the debug pane.
	Reason string
}

// Decider is the seam.
type Decider interface {
	Decide(Input) Decision
}

// Rules is the default rules-based decider.
type Rules struct {
	// ShortReply is the length under which a reply is voice-only.
	ShortReply int
	// AutoCardTTL for text cards.
	AutoCardTTL time.Duration
}

// ReminderLeadIn opens the speech of a fired reminder.
const ReminderLeadIn = "Reminder: "

// NewRules returns the defaults.
func NewRules() *Rules { return &Rules{ShortReply: 48, AutoCardTTL: 60 * time.Second} }

// Decide implements Decider.
func (r *Rules) Decide(in Input) Decision {
	d := Decision{Respond: true, Timing: TimingNow, AutoCardTTL: r.AutoCardTTL}
	text := strings.TrimSpace(in.ReplyText)

	if in.Proactive != "" {
		// Proactive items never interrupt; reminders speak, the rest only shows.
		if in.TurnActive || in.Speaking {
			d.Timing = TimingHold
		}
		if in.Proactive == "reminder" {
			d.Modality = ModalityBoth
			// Said with a lead-in: a bare "stretch" out of nowhere is not
			// understood as a reminder (review 2026-10-30 round 3).
			d.Speech = Sentences(ReminderLeadIn + text)
			d.Reason = "reminder: glance card and speech"
		} else {
			d.Modality = ModalityGlance
			d.Reason = "proactive: glance card only"
		}
		d.AutoCard = text != ""
		return d
	}

	switch {
	case text == "" && !in.SpecChanged:
		d.Respond = false
		d.Modality = ModalityNone
		d.Reason = "nothing to show or say"
	case text == "" && in.SpecChanged:
		d.Modality = ModalityVisual
		d.Reason = "visual only"
	case in.SpecChanged:
		d.Modality = ModalityBoth
		d.Speech = Sentences(text)
		d.Reason = "visual with speech"
	case len(text) <= r.ShortReply:
		d.Modality = ModalityVoice
		d.Speech = Sentences(text)
		d.Reason = "short reply: voice only"
	default:
		d.Modality = ModalityBoth
		d.Speech = Sentences(text)
		d.AutoCard = true
		d.Reason = "text reply: voice plus text card"
	}
	return d
}

// Sentences splits text into speakable pieces with the same rule as
// SentenceStream, so a turn spoken at the end and a turn spoken as it
// streams sound the same. A short trailing fragment joins the piece before it.
func Sentences(text string) []string {
	var st SentenceStream
	out := st.Push(text + " ")
	if rest := st.Flush(); rest != "" {
		if len(rest) < MinPiece && len(out) > 0 {
			out[len(out)-1] += " " + rest
		} else {
			out = append(out, rest)
		}
	}
	return out
}

// Streamer is implemented by deciders that can say, before a turn's text
// is complete, whether its sentences may be spoken as they complete
// (VISION 7 criterion 1: time to first audible response). A decider
// without it is treated as "speak at the end".
type Streamer interface {
	StreamSpeech(Input) bool
}

// StreamSpeech implements Streamer: user turns stream; proactive items go
// through Decide at the end as before.
func (r *Rules) StreamSpeech(in Input) bool { return in.Proactive == "" }

// MinPiece is the shortest sentence SentenceStream emits on its own;
// shorter ones ("Sure.") wait for the next sentence so TTS requests are
// not tiny, while "It's 14:05." still goes out alone.
const MinPiece = 8

// cleanSpeech strips Markdown emphasis so TTS does not read asterisks.
var cleanSpeech = strings.NewReplacer("**", "", "*", "", "`", "", "_", " ")

var sentenceBoundary = regexp.MustCompile(`([.!?]+\s+|\n\s*\n)`)

// SentenceStream turns streamed text deltas into speakable sentences as
// they complete. A sentence ends at punctuation followed by whitespace, or
// at a blank line; the whitespace is the proof that "3.5" or "e.g." is not
// an end. Push returns the sentences completed by the delta (cleaned like
// Sentences); Flush returns whatever is left.
type SentenceStream struct {
	buf []byte
}

// Push appends a delta and returns the sentences it completed.
func (s *SentenceStream) Push(delta string) []string {
	if delta == "" {
		return nil
	}
	s.buf = append(s.buf, delta...)
	var out []string
	last := 0
	for _, m := range sentenceBoundary.FindAllIndex(s.buf, -1) {
		piece := strings.TrimSpace(cleanSpeech.Replace(string(s.buf[last:m[1]])))
		if len(piece) < MinPiece {
			continue // too short to say alone; it merges with the next sentence
		}
		if piece != "" {
			out = append(out, piece)
		}
		last = m[1]
	}
	if last > 0 {
		s.buf = append([]byte(nil), s.buf[last:]...)
	}
	return out
}

// Flush returns the unfinished remainder, if any, and empties the stream.
func (s *SentenceStream) Flush() string {
	rest := strings.TrimSpace(cleanSpeech.Replace(string(s.buf)))
	s.buf = nil
	return rest
}

// Pending reports whether the stream holds unspoken text.
func (s *SentenceStream) Pending() bool { return len(bytes.TrimSpace(s.buf)) > 0 }
