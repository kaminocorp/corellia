// Package deepseek is the placeholder for the OpenWorld DeepSeek harness
// (VISION.md 7). It stays NotImplemented until the code-boundary terms are
// cleared; nothing from Mission or OpenWorld is read or copied. DeepSeek
// models themselves are reachable today through runtime/openaicompat.
package deepseek

import (
	"context"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

// Runtime is the stub.
type Runtime struct{}

func (Runtime) Name() string { return "deepseek-harness" }

func (Runtime) Capabilities() runtime.Capabilities { return runtime.Capabilities{} }

// Start always fails with ErrNotImplemented.
func (Runtime) Start(context.Context, runtime.Turn) (<-chan runtime.Event, error) {
	return nil, runtime.ErrNotImplemented
}
