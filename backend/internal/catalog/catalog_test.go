package catalog

import (
	"strings"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/contract"
)

func load(t *testing.T) *contract.Registry {
	t.Helper()
	r, err := contract.Load()
	if err != nil {
		t.Fatal(err)
	}
	return r
}

func TestDescribeCoversEveryComponent(t *testing.T) {
	reg := load(t)
	text := Describe(reg, nil)
	for _, name := range reg.ComponentNames() {
		if !strings.Contains(text, "- "+name+": ") {
			t.Errorf("missing %s", name)
		}
	}
	if !strings.Contains(text, "center:array<number> (required, bindable)") {
		t.Errorf("Map props not summarised as expected:\n%s", text)
	}
	if !strings.Contains(text, "slots: left(*, max 1), right(*, max 1)") {
		t.Errorf("Split slots not summarised:\n%s", text)
	}
	if !strings.Contains(text, "kind:string[bar|line|area] (required)") {
		t.Errorf("Chart enum not summarised:\n%s", text)
	}
	if Describe(reg, nil) != text {
		t.Error("Describe is not deterministic")
	}
	sub := Describe(reg, []string{"Stat", "Nope"})
	if !strings.Contains(sub, "- Stat:") || strings.Contains(sub, "- Map:") {
		t.Errorf("subset wrong:\n%s", sub)
	}
}

func TestRank(t *testing.T) {
	reg := load(t)
	names := Names(Rank(reg, Hints{Tags: []string{"place"}, PreferredFit: "full"}))
	if names[0] != "Map" {
		t.Fatalf("place ranking = %v", names)
	}
	names = Names(Rank(reg, Hints{Tags: []string{"numeric", "series"}}))
	if names[0] != "Chart" {
		t.Fatalf("numeric series ranking = %v", names)
	}
	names = Names(Rank(reg, Hints{}))
	if len(names) != len(reg.ComponentNames()) {
		t.Fatal("ranking dropped components")
	}
	// Layout components outrank unmatched content with no hints.
	if names[0] != "Grid" || names[1] != "Overlay" {
		t.Fatalf("no-hint ranking = %v", names)
	}
}

func TestClassify(t *testing.T) {
	for _, tc := range []struct {
		w, h  int
		class string
	}{{1280, 720, "small"}, {1920, 1080, "1080p"}, {2560, 1440, "1440p"}, {3840, 2160, "4k"}} {
		if got := Classify(tc.w, tc.h).Class; got != tc.class {
			t.Errorf("%dx%d = %s, want %s", tc.w, tc.h, got, tc.class)
		}
	}
}
