// Command runtime-spike runs the VISION.md section 7 evaluation script
// against a runtime and writes a Markdown report: time to first token,
// time to first valid spec op, total turn time, first-try spec validity,
// cancel latency.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"github.com/hejijunhao/corellia/backend/internal/actions"
	"github.com/hejijunhao/corellia/backend/internal/config"
	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/runtime/rtselect"
	"github.com/hejijunhao/corellia/backend/internal/session"
	"github.com/hejijunhao/corellia/backend/internal/tools"
	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
)

var script = []string{
	"hello",
	"what time is it",
	"what's the weather in Lisbon",
	"show me a map of Berlin",
	"make a table of my workshop stock",
	"show the temperature trend this week",
	"what's on my schedule today",
	"remind me to call Ana at 17:00",
	"yes",
	"clear the screen",
}

type turnStats struct {
	Text       string
	Handled    string
	FirstToken time.Duration
	FirstOp    time.Duration
	Total      time.Duration
	Ops        int
	SpecErrors int
	Status     string
}

func main() {
	rtName := flag.String("runtime", "", "runtime to test (default: CORELLIA_RUNTIME)")
	outDir := flag.String("out", "../docs/executing/spikes", "report directory")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		fail(err)
	}
	if *rtName != "" {
		cfg.Runtime = *rtName
	}
	reg, err := contract.Load()
	if err != nil {
		fail(err)
	}
	rt, detail, err := rtselect.Select(cfg)
	if err != nil {
		fail(err)
	}
	toolReg := tools.NewRegistry()
	builtin.Register(toolReg, builtin.Options{})
	gate := actions.New(toolReg, 2*time.Minute, time.Now)
	sess := session.New(session.Options{AgentName: cfg.AgentName, Runtime: rt, Registry: reg, Tools: toolReg, Gate: gate})
	defer sess.Close()

	ch, unsub := sess.Subscribe(0)
	defer unsub()

	var results []turnStats
	for _, text := range script {
		start := time.Now()
		out, err := sess.Handle(text, runtime.SourceKeyboard)
		if err != nil {
			fail(err)
		}
		st := turnStats{Text: text, Handled: out.Handled}
		if out.Handled != "turn" {
			st.Total = time.Since(start)
			st.Status = out.Handled
			results = append(results, st)
			continue
		}
		for ev := range ch {
			var m map[string]any
			_ = json.Unmarshal(ev.Data, &m)
			if m["turn_id"] != out.TurnID {
				continue
			}
			switch m["type"] {
			case "text_delta":
				if st.FirstToken == 0 {
					st.FirstToken = time.Since(start)
				}
			case "spec_op":
				st.Ops++
				if st.FirstOp == 0 {
					st.FirstOp = time.Since(start)
				}
			case "error":
				code, _ := m["code"].(string)
				if code != "runtime" && code != "runtime_start" && code != "tool_failed" {
					st.SpecErrors++
				}
			case "turn_done":
				st.Total = time.Since(start)
				st.Status, _ = m["status"].(string)
			}
			if st.Status != "" {
				break
			}
		}
		results = append(results, st)
	}

	// Cancel latency: start a turn and cancel after 300 ms.
	cstart := time.Now()
	out, _ := sess.Handle("show me a map of Lisbon and tell me everything about it", runtime.SourceKeyboard)
	time.Sleep(300 * time.Millisecond)
	cancelAt := time.Now()
	sess.Cancel(out.TurnID)
	sess.WaitTurn(out.TurnID)
	cancelLatency := time.Since(cancelAt)
	_ = cstart

	report := render(rt.Name(), detail, results, cancelLatency)
	fmt.Print(report)
	if *outDir != "" {
		if err := os.MkdirAll(*outDir, 0o755); err != nil {
			fail(err)
		}
		name := filepath.Join(*outDir, fmt.Sprintf("%s-%s.md", rt.Name(), time.Now().Format("2006-01-02")))
		if err := os.WriteFile(name, []byte(report), 0o644); err != nil {
			fail(err)
		}
		fmt.Fprintln(os.Stderr, "wrote", name)
	}
}

func render(name, detail string, results []turnStats, cancelLatency time.Duration) string {
	var b strings.Builder
	fmt.Fprintf(&b, "# Runtime spike: %s\n\n", name)
	fmt.Fprintf(&b, "**Date:** %s. **Runtime:** %s (%s). **Script:** VISION.md section 7, ten turns.\n\n", time.Now().Format("2006-01-02 15:04 MST"), name, detail)
	b.WriteString("| # | Turn | Handled | First token | First op | Total | Ops | Spec errors | Status |\n|---|---|---|---|---|---|---|---|---|\n")
	var ops, errs, turns int
	var sumFirst, sumTotal time.Duration
	for i, r := range results {
		fmt.Fprintf(&b, "| %d | %s | %s | %s | %s | %s | %d | %d | %s |\n", i+1, r.Text, r.Handled, ms(r.FirstToken), ms(r.FirstOp), ms(r.Total), r.Ops, r.SpecErrors, r.Status)
		if r.Handled == "turn" {
			turns++
			ops += r.Ops
			errs += r.SpecErrors
			sumFirst += r.FirstToken
			sumTotal += r.Total
		}
	}
	validity := 100.0
	if ops+errs > 0 {
		validity = 100 * float64(ops) / float64(ops+errs)
	}
	b.WriteString("\n## Summary\n\n")
	if turns > 0 {
		fmt.Fprintf(&b, "- Mean time to first token: %s\n", ms(sumFirst/time.Duration(turns)))
		fmt.Fprintf(&b, "- Mean total turn time: %s\n", ms(sumTotal/time.Duration(turns)))
	}
	fmt.Fprintf(&b, "- Spec ops accepted on first try: %.1f%% (%d ops, %d rejected)\n", validity, ops, errs)
	fmt.Fprintf(&b, "- Cancel latency (cancel to turn_done): %s\n", ms(cancelLatency))
	b.WriteString("\nSoak (24 h with sparse traffic) and voice coupling are measured separately; see the roadmap.\n")
	return b.String()
}

func ms(d time.Duration) string {
	if d == 0 {
		return "-"
	}
	return fmt.Sprintf("%d ms", d.Milliseconds())
}

func fail(err error) {
	fmt.Fprintln(os.Stderr, "runtime-spike:", err)
	os.Exit(1)
}
