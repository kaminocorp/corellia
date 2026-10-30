package deepseek

import (
	"context"
	"errors"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
)

func TestNotImplemented(t *testing.T) {
	if _, err := (Runtime{}).Start(context.Background(), runtime.Turn{}); !errors.Is(err, runtime.ErrNotImplemented) {
		t.Fatalf("err = %v", err)
	}
}
