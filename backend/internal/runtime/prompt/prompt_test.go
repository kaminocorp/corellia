package prompt

import (
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

func TestSystem(t *testing.T) {
	ctx := runtime.Context{AgentName: "Jev", CatalogDescription: "Components: X", MemorySummary: "- likes tea", ScreenSummary: "a Map", Now: func() time.Time { return time.Date(2026, 10, 29, 14, 0, 0, 0, time.UTC) }}
	s := System(ctx, Options{IncludeShowUI: true})
	for _, want := range []string{"You are Jev", "show_ui", "Components: X", "likes tea", "Currently on screen: a Map", "Thursday 29 October 2026, 14:00"} {
		if !strings.Contains(s, want) {
			t.Errorf("missing %q", want)
		}
	}
	if strings.Contains(System(runtime.Context{}, Options{}), "show_ui") {
		t.Error("show_ui instructions included without tools")
	}
}
