// Command runtime-check verifies a configured runtime against its live
// endpoint in one go: a plain turn, a tool turn that must put something on
// screen through show_ui, and a cancel. It prints a pass/fail table with a
// diagnosis for the usual failures (bad key, unknown model, rejected beta,
// no tool use) and exits non-zero when a check fails. It is the first thing
// to run with a real key; scripts/anthropic-live-check.sh wraps it with the
// VISION 7 spike.
//
//	go run ./cmd/runtime-check -runtime anthropic
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
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

type check struct {
	Name   string
	OK     bool
	Detail string
	Took   time.Duration
}

type turnResult struct {
	status     string
	text       string
	firstToken time.Duration
	firstOp    time.Duration
	total      time.Duration
	toolCalls  []string
	ops        int
	specErrors []string
	failures   []string
	speechAt   time.Duration
}

func main() {
	rtName := flag.String("runtime", "", "runtime to check (default: CORELLIA_RUNTIME)")
	timeout := flag.Duration("timeout", 90*time.Second, "per-turn timeout")
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
		fmt.Fprintf(os.Stderr, "runtime-check: %v\n", err)
		fmt.Fprintln(os.Stderr, diagnose(err.Error()))
		os.Exit(2)
	}
	fmt.Printf("runtime %s (%s)\n", rt.Name(), detail)
	caps := rt.Capabilities()
	fmt.Printf("capabilities: streaming=%v ui_ops=%v tools=%v cancel=%v\n\n", caps.Streaming, caps.UIOps, caps.Tools, caps.Cancel)

	// Same wiring as cmd/api: show_ui dry-runs its batch through the session.
	var sess *session.Session
	uiCheck := func(ops []json.RawMessage) []string {
		if sess == nil {
			return nil
		}
		var out []string
		for _, is := range sess.DryRunOps(ops) {
			out = append(out, fmt.Sprintf("op %d (%s): %s", is.Index, is.Code, is.Message))
		}
		return out
	}
	toolReg := tools.NewRegistry()
	loc, _ := cfg.Location()
	builtin.Register(toolReg, builtin.Options{Location: loc, UICheck: uiCheck})
	gate := actions.New(toolReg, 2*time.Minute, time.Now)
	sess = session.New(session.Options{AgentName: cfg.AgentName, Runtime: rt, Registry: reg, Tools: toolReg, Gate: gate})
	defer sess.Close()
	ch, unsub := sess.Subscribe(0)
	defer unsub()

	var checks []check

	// 1. A plain turn: the endpoint answers at all.
	r := runTurn(sess, ch, "Reply with the single word ready and nothing else.", *timeout)
	ok := r.status == "completed" && strings.Contains(strings.ToLower(r.text), "ready")
	d := fmt.Sprintf("status=%s first_token=%s text=%q", r.status, ms(r.firstToken), truncate(r.text, 60))
	if len(r.failures) > 0 {
		d += "; " + strings.Join(r.failures, "; ")
	}
	checks = append(checks, check{"plain turn", ok, d, r.total})

	// 2. A tool turn: get_time must be called and valid ops must reach the
	// screen (cloud runtimes do that through show_ui; the local runtime
	// emits ops natively).
	r = runTurn(sess, ch, "What time is it right now? Call get_time, then put the time on screen with show_ui as a Status component, and tell me in one short sentence.", *timeout)
	ok = r.status == "completed" && contains(r.toolCalls, "get_time") && r.ops > 0 && len(r.specErrors) == 0
	d = fmt.Sprintf("status=%s tools=%v ops=%d spec_errors=%d first_op=%s first_speech=%s", r.status, r.toolCalls, r.ops, len(r.specErrors), ms(r.firstOp), ms(r.speechAt))
	if len(r.specErrors) > 0 {
		d += " [" + strings.Join(r.specErrors, "; ") + "]"
	}
	if len(r.failures) > 0 {
		d += "; " + strings.Join(r.failures, "; ")
	}
	checks = append(checks, check{"tool turn with show_ui", ok, d, r.total})

	// 3. Cancel: a long answer cut after 400 ms must end as cancelled quickly.
	out, err := sess.Handle("Describe, in at least twenty sentences, how a mechanical watch works.", runtime.SourceKeyboard)
	if err != nil {
		fail(err)
	}
	time.Sleep(400 * time.Millisecond)
	cancelAt := time.Now()
	sess.Cancel(out.TurnID)
	st := waitDone(ch, out.TurnID, *timeout)
	lat := time.Since(cancelAt)
	checks = append(checks, check{"cancel", st.status == "cancelled" && lat < 5*time.Second, fmt.Sprintf("status=%s latency=%s", st.status, ms(lat)), lat})

	fmt.Println("| Check | Result | Took | Detail |")
	fmt.Println("|---|---|---|---|")
	failed := false
	for _, c := range checks {
		res := "pass"
		if !c.OK {
			res = "FAIL"
			failed = true
		}
		fmt.Printf("| %s | %s | %s | %s |\n", c.Name, res, ms(c.Took), c.Detail)
	}
	if failed {
		fmt.Println()
		for _, c := range checks {
			if !c.OK {
				fmt.Println(diagnose(c.Detail))
			}
		}
		os.Exit(1)
	}
	fmt.Println("\nall checks passed")
}

func runTurn(sess *session.Session, ch <-chan session.Item, text string, timeout time.Duration) turnResult {
	start := time.Now()
	out, err := sess.Handle(text, runtime.SourceKeyboard)
	if err != nil {
		return turnResult{status: "failed", failures: []string{err.Error()}}
	}
	r := collect(ch, out.TurnID, start, timeout)
	return r
}

func waitDone(ch <-chan session.Item, turnID string, timeout time.Duration) turnResult {
	return collect(ch, turnID, time.Now(), timeout)
}

func collect(ch <-chan session.Item, turnID string, start time.Time, timeout time.Duration) turnResult {
	var r turnResult
	deadline := time.After(timeout)
	for {
		select {
		case <-deadline:
			r.status = "timeout"
			r.failures = append(r.failures, fmt.Sprintf("no turn_done within %s", timeout))
			return r
		case it, ok := <-ch:
			if !ok {
				r.status = "closed"
				return r
			}
			var m map[string]any
			_ = json.Unmarshal(it.Data, &m)
			if m["turn_id"] != turnID {
				continue
			}
			switch m["type"] {
			case "text_delta":
				if r.firstToken == 0 {
					r.firstToken = time.Since(start)
				}
			case "speech":
				if r.speechAt == 0 {
					r.speechAt = time.Since(start)
				}
			case "tool_call":
				name, _ := m["tool"].(string)
				r.toolCalls = append(r.toolCalls, name)
			case "spec_op":
				r.ops++
				if r.firstOp == 0 {
					r.firstOp = time.Since(start)
				}
			case "session_error":
				code, _ := m["code"].(string)
				msg, _ := m["message"].(string)
				if code == "runtime" || code == "runtime_start" || code == "tool_failed" {
					r.failures = append(r.failures, code+": "+msg)
				} else {
					r.specErrors = append(r.specErrors, code+": "+msg)
				}
			case "turn_done":
				r.status, _ = m["status"].(string)
				r.text, _ = m["text"].(string)
				r.total = time.Since(start)
				return r
			}
		}
	}
}

// diagnose maps the usual failure texts to the setting that fixes them.
func diagnose(detail string) string {
	l := strings.ToLower(detail)
	switch {
	case strings.Contains(l, "401") || strings.Contains(l, "authentication") || strings.Contains(l, "invalid x-api-key") || strings.Contains(l, "needs anthropic_api_key"):
		return "diagnosis: the API key is missing or rejected. Set ANTHROPIC_API_KEY in backend/.env (or run `ant auth status` to see which credential the SDK would use)."
	case strings.Contains(l, "not_found") || strings.Contains(l, "model:") || strings.Contains(l, "unknown model"):
		return "diagnosis: the model id is not available to this account. Set CORELLIA_MODEL to a model you can use (default claude-opus-5-5)."
	case strings.Contains(l, "beta") || strings.Contains(l, "fallback"):
		return "diagnosis: the request's beta header or fallbacks field was rejected. Set CORELLIA_ANTHROPIC_FALLBACKS=false and run again."
	case strings.Contains(l, "effort") || strings.Contains(l, "output_config"):
		return "diagnosis: the effort setting was rejected. Try CORELLIA_EFFORT=medium."
	case strings.Contains(l, "429") || strings.Contains(l, "rate"):
		return "diagnosis: rate limited. Wait a minute and run again."
	case strings.Contains(l, "tools=[]") || strings.Contains(l, "ops=0"):
		return "diagnosis: the model answered without calling get_time or show_ui. The prompt asks for both; check the server log for rejected ops (`session_error` events) and try CORELLIA_EFFORT=medium."
	case strings.Contains(l, "timeout"):
		return "diagnosis: no answer within the timeout. Check connectivity to api.anthropic.com or raise -timeout."
	}
	return "diagnosis: see the detail column; the server log (go run ./cmd/api) shows the full error."
}

func contains(list []string, s string) bool {
	for _, x := range list {
		if x == s {
			return true
		}
	}
	return false
}

func truncate(s string, n int) string {
	r := []rune(strings.TrimSpace(s))
	if len(r) <= n {
		return string(r)
	}
	return string(r[:n]) + "…"
}

func ms(d time.Duration) string {
	if d == 0 {
		return "-"
	}
	return fmt.Sprintf("%d ms", d.Milliseconds())
}

func fail(err error) {
	fmt.Fprintln(os.Stderr, "runtime-check:", err)
	os.Exit(2)
}
