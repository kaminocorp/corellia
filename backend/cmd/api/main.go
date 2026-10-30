// Command api runs the Corellia backend: the session API, the SSE event
// stream and the static display client, in one binary.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"github.com/hejijunhao/corellia/backend/internal/actions"
	"github.com/hejijunhao/corellia/backend/internal/config"
	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/decision"
	"github.com/hejijunhao/corellia/backend/internal/httpsrv"
	"github.com/hejijunhao/corellia/backend/internal/memory"
	"github.com/hejijunhao/corellia/backend/internal/proactive"
	"github.com/hejijunhao/corellia/backend/internal/runtime/rtselect"
	"github.com/hejijunhao/corellia/backend/internal/session"
	"github.com/hejijunhao/corellia/backend/internal/store"
	"github.com/hejijunhao/corellia/backend/internal/tools"
	"github.com/hejijunhao/corellia/backend/internal/tools/builtin"
	"github.com/hejijunhao/corellia/backend/internal/voice"
)

// Set via -ldflags "-X main.version=... -X main.commit=...".
var (
	version = "dev"
	commit  = "unknown"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	cfg, err := config.Load()
	if err != nil {
		slog.Error("config", "err", err)
		os.Exit(1)
	}
	if cfg.DevMode() {
		slog.Warn("CORELLIA_DEVICE_TOKEN not set: dev mode, loopback clients only", "listen", cfg.ListenAddr())
	}
	loc, err := cfg.Location()
	if err != nil {
		slog.Error("config", "err", err)
		os.Exit(1)
	}
	if err := os.MkdirAll(cfg.DataDir, 0o755); err != nil {
		slog.Error("data dir", "dir", cfg.DataDir, "err", err)
		os.Exit(1)
	}

	reg, err := contract.Load()
	if err != nil {
		slog.Error("contract", "err", err)
		os.Exit(1)
	}
	slog.Info("contract loaded", "components", len(reg.ComponentNames()))

	rt, detail, err := rtselect.Select(cfg)
	if err != nil {
		slog.Error("runtime", "err", err)
		os.Exit(1)
	}
	slog.Info("runtime selected", "runtime", rt.Name(), "requested", cfg.Runtime, "detail", detail)

	st, err := store.New(cfg.DataDir)
	if err != nil {
		slog.Error("store", "err", err)
		os.Exit(1)
	}
	mem, err := memory.Open(st, time.Now)
	if err != nil {
		slog.Error("memory", "err", err)
		os.Exit(1)
	}
	slog.Info("memory loaded", "dir", st.Dir(), "notes", len(mem.Notes()), "reminders", len(mem.Pending()))

	// show_ui validates its batch through the session, which exists only
	// after the tools do; the closure binds late.
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
	builtin.Register(toolReg, builtin.Options{Memory: mem, Reminders: mem, Location: loc, UICheck: uiCheck})
	gate := actions.New(toolReg, 2*time.Minute, time.Now)
	slog.Info("tools registered", "tools", toolReg.Names())

	voiceProviders := voice.Select(cfg)
	slog.Info("voice providers", "stt", voiceProviders.STT.Name(), "tts", voiceProviders.TTS.Name(), "mode", voiceProviders.Mode)

	sess = session.New(session.Options{
		AgentName:  cfg.AgentName,
		Runtime:    rt,
		Registry:   reg,
		Tools:      toolReg,
		Gate:       gate,
		Decider:    decision.NewRules(),
		STT:        voiceProviders.STT.Name(),
		TTS:        voiceProviders.TTS.Name(),
		Memory:     mem,
		Transcript: mem,
		ImageHosts: append([]string{}, cfg.ImageHosts...),
		Location:   loc,
	})
	defer sess.Close()

	schedCtx, stopSched := context.WithCancel(context.Background())
	defer stopSched()
	go proactive.New(mem, sess, time.Now, loc).Run(schedCtx, time.Second)
	slog.Info("time zone", "location", loc.String())

	handler := httpsrv.New(httpsrv.Deps{
		Config:    cfg,
		Build:     httpsrv.BuildInfo{Version: version, Commit: commit},
		Session:   httpsrv.NewSessionHandler(sess, reg),
		Events:    httpsrv.NewEventsHandler(sess),
		Voice:     httpsrv.NewVoiceHandler(voiceProviders),
		Memory:    httpsrv.NewMemoryHandler(mem),
		Heartbeat: httpsrv.NewHeartbeat(time.Now),
	})

	srv := &http.Server{
		Addr:              cfg.ListenAddr(),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		slog.Info("listening", "addr", srv.Addr, "version", version, "client_dir", cfg.ClientDir)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server", "err", err)
			os.Exit(1)
		}
	}()

	<-ctx.Done()
	slog.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("shutdown", "err", err)
	}
}
