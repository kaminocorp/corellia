// Package decision is the seam for the "Jev logic" (VISION.md 6): given
// what the runtime produced and what is on screen, decide whether to
// respond, with which modality, what to say, when, and what to clear. The
// default is rules; a model-backed Decider can replace it later.
package decision

import (
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
			d.Speech = Sentences(text)
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

var sentenceEnd = regexp.MustCompile(`([.!?]+)(\s+|$)`)

// Sentences splits text into speakable pieces, keeping punctuation and
// merging very short fragments into their neighbour so TTS requests are
// not tiny.
func Sentences(text string) []string {
	text = strings.TrimSpace(text)
	if text == "" {
		return nil
	}
	// Strip Markdown emphasis so TTS does not read asterisks.
	clean := strings.NewReplacer("**", "", "*", "", "`", "", "_", " ").Replace(text)
	var out []string
	last := 0
	for _, m := range sentenceEnd.FindAllStringIndex(clean, -1) {
		piece := strings.TrimSpace(clean[last:m[1]])
		last = m[1]
		if piece != "" {
			out = append(out, piece)
		}
	}
	if rest := strings.TrimSpace(clean[last:]); rest != "" {
		out = append(out, rest)
	}
	// Merge fragments shorter than 12 characters into the previous piece.
	var merged []string
	for _, s := range out {
		if len(merged) > 0 && len(s) < 12 {
			merged[len(merged)-1] += " " + s
			continue
		}
		merged = append(merged, s)
	}
	return merged
}
