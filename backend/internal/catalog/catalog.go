// Package catalog turns the component catalog into what the rest of the
// system needs: a compact model-facing description (VISION.md 5.1) and a
// fit-ranking that narrows which components a turn is offered (5.5).
package catalog

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
)

// Fit is a size/fit hint.
type Fit = gen.Fit

// DisplayProfile describes the attached screen. Width and height are CSS
// pixels; Class is derived.
type DisplayProfile struct {
	Width  int    `json:"width"`
	Height int    `json:"height"`
	Class  string `json:"class"` // small | 1080p | 1440p | 4k
}

// Classify derives the size class from the viewport.
func Classify(width, height int) DisplayProfile {
	p := DisplayProfile{Width: width, Height: height}
	switch {
	case width >= 3000:
		p.Class = "4k"
	case width >= 2200:
		p.Class = "1440p"
	case width >= 1600:
		p.Class = "1080p"
	default:
		p.Class = "small"
	}
	return p
}

// Hints describe the content a turn wants to show.
type Hints struct {
	// Tags such as "place", "numeric", "list", "time", "prose".
	Tags []string
	// PreferredFit, when set, favours components that support it.
	PreferredFit Fit
}

// Ranked is one ranking result.
type Ranked struct {
	Name  string
	Score int
}

// Rank orders components for the given hints. Layout components always
// rank (they are needed to compose anything); content components score by
// tag overlap and fit match. Ties break alphabetically so results are
// stable.
func Rank(reg *contract.Registry, hints Hints) []Ranked {
	tags := map[string]bool{}
	for _, t := range hints.Tags {
		tags[strings.ToLower(t)] = true
	}
	cat := reg.Catalog()
	var out []Ranked
	for name, def := range cat.Components {
		score := 0
		if def.Category == gen.ComponentDefCategoryLayout {
			score += 1
		}
		for _, t := range def.Tags {
			if tags[strings.ToLower(t)] {
				score += 3
			}
		}
		if hints.PreferredFit != "" {
			for _, f := range def.Fit {
				if f == hints.PreferredFit {
					score += 2
				}
			}
		}
		out = append(out, Ranked{Name: name, Score: score})
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Score != out[j].Score {
			return out[i].Score > out[j].Score
		}
		return out[i].Name < out[j].Name
	})
	return out
}

// Names extracts the names of a ranking.
func Names(r []Ranked) []string {
	out := make([]string, len(r))
	for i, x := range r {
		out[i] = x.Name
	}
	return out
}

// Describe renders a compact, deterministic description of the named
// components (all when names is nil) for a model prompt: one block per
// component with description, props (type, enum, required, bindable),
// slots, actions, fit and an example.
func Describe(reg *contract.Registry, names []string) string {
	if names == nil {
		names = reg.ComponentNames()
	}
	var b strings.Builder
	b.WriteString("Components (name: description; props; slots; actions; fit):\n")
	for _, name := range names {
		def, ok := reg.Component(name)
		if !ok {
			continue
		}
		fmt.Fprintf(&b, "- %s: %s\n", name, def.Description)
		fmt.Fprintf(&b, "  props: %s\n", describeProps(def))
		if len(def.Slots) > 0 {
			var slots []string
			for slot := range def.Slots {
				slots = append(slots, slot)
			}
			sort.Strings(slots)
			var parts []string
			for _, slot := range slots {
				sd := def.Slots[slot]
				p := slot + "(" + strings.Join(sd.Accepts, "|")
				if sd.Max != nil {
					p += fmt.Sprintf(", max %d", *sd.Max)
				}
				parts = append(parts, p+")")
			}
			fmt.Fprintf(&b, "  slots: %s\n", strings.Join(parts, ", "))
		}
		if len(def.Actions) > 0 {
			fmt.Fprintf(&b, "  actions: %s\n", strings.Join(def.Actions, ", "))
		}
		fits := make([]string, len(def.Fit))
		for i, f := range def.Fit {
			fits[i] = string(f)
		}
		fmt.Fprintf(&b, "  fit: %s\n", strings.Join(fits, ", "))
		if def.Example != nil {
			ex, _ := json.Marshal(def.Example)
			fmt.Fprintf(&b, "  example: %s\n", ex)
		}
	}
	return b.String()
}

// describeProps summarises a props JSON Schema: `name:type[enum] (required, bindable)`.
func describeProps(def gen.ComponentDef) string {
	props, _ := def.Props["properties"].(map[string]any)
	required := map[string]bool{}
	if req, ok := def.Props["required"].([]any); ok {
		for _, r := range req {
			if s, ok := r.(string); ok {
				required[s] = true
			}
		}
	}
	bindable := map[string]bool{}
	for _, b := range def.Bindable {
		bindable[b] = true
	}
	names := make([]string, 0, len(props))
	for n := range props {
		names = append(names, n)
	}
	sort.Strings(names)
	var parts []string
	for _, n := range names {
		schema, _ := props[n].(map[string]any)
		part := n + ":" + typeOf(schema)
		if enum, ok := schema["enum"].([]any); ok {
			vals := make([]string, len(enum))
			for i, v := range enum {
				vals[i] = fmt.Sprint(v)
			}
			part += "[" + strings.Join(vals, "|") + "]"
		}
		var flags []string
		if required[n] {
			flags = append(flags, "required")
		}
		if bindable[n] {
			flags = append(flags, "bindable")
		}
		if len(flags) > 0 {
			part += " (" + strings.Join(flags, ", ") + ")"
		}
		parts = append(parts, part)
	}
	if len(parts) == 0 {
		return "none"
	}
	return strings.Join(parts, ", ")
}

func typeOf(schema map[string]any) string {
	switch t := schema["type"].(type) {
	case string:
		if t == "array" {
			if items, ok := schema["items"].(map[string]any); ok {
				return "array<" + typeOf(items) + ">"
			}
			return "array"
		}
		return t
	case []any:
		parts := make([]string, len(t))
		for i, v := range t {
			parts[i] = fmt.Sprint(v)
		}
		return strings.Join(parts, "|")
	}
	return "any"
}
