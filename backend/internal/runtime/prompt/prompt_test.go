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
	for _, want := range []string{"You are Jev", "show_ui", "Components: X", "likes tea"} {
		if !strings.Contains(s, want) {
			t.Errorf("missing %q", want)
		}
	}
	// The per-turn part stays out of the cacheable prefix (review
	// 2026-10-30 round 4).
	for _, static := range []string{"Currently on screen", "Current date and time", "14:00"} {
		if strings.Contains(s, static) {
			t.Errorf("System contains the per-turn %q", static)
		}
	}
	tc := TurnContext(ctx)
	for _, want := range []string{"Currently on screen: a Map", "Thursday 29 October 2026, 14:00 (UTC)"} {
		if !strings.Contains(tc, want) {
			t.Errorf("TurnContext missing %q in %q", want, tc)
		}
	}
	if full := Full(ctx, Options{IncludeShowUI: true}); !strings.HasPrefix(full, s) || !strings.HasSuffix(full, tc) {
		t.Errorf("Full is not System then TurnContext: %q", full)
	}
	if strings.Contains(System(runtime.Context{}, Options{}), "show_ui") {
		t.Error("show_ui instructions included without tools")
	}
}

// The model's clock reads in the zone the session's Now returns (review
// 2026-10-30 round 4, item 3: it printed the process zone, a day off from
// get_time and the clock card under CORELLIA_TZ=Asia/Singapore).
func TestTurnContextClockFollowsNowZone(t *testing.T) {
	sg, err := time.LoadLocation("Asia/Singapore")
	if err != nil {
		t.Skip(err)
	}
	// 23:59 UTC on Thursday is 07:59 on Friday in Singapore.
	utc := time.Date(2026, 10, 29, 23, 59, 0, 0, time.UTC)
	got := TurnContext(runtime.Context{Now: func() time.Time { return utc.In(sg) }})
	if !strings.Contains(got, "Friday 30 October 2026, 07:59 (+08)") {
		t.Fatalf("clock = %q, want Singapore's Friday 07:59", got)
	}
}
