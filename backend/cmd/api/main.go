// Command api runs the Corellia backend: the session API, the SSE event
// stream and the static display client, in one binary.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"github.com/hejijunhao/corellia/backend/internal/config"
	"github.com/hejijunhao/corellia/backend/internal/httpsrv"
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
		slog.Warn("CORELLIA_DEVICE_TOKEN not set: dev mode, loopback clients only")
	}
	if err := os.MkdirAll(cfg.DataDir, 0o755); err != nil {
		slog.Error("data dir", "dir", cfg.DataDir, "err", err)
		os.Exit(1)
	}

	handler := httpsrv.New(httpsrv.Deps{
		Config: cfg,
		Build:  httpsrv.BuildInfo{Version: version, Commit: commit},
	})

	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.Port),
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
