package uispec

import (
	"bytes"
	"encoding/json"
	"errors"
	"flag"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
)

var update = flag.Bool("update", false, "rewrite reducer golden files from the Go reducer")

func fixturesDir(t *testing.T) string {
	t.Helper()
	_, file, _, _ := runtime.Caller(0)
	return filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", "..", "shared", "schema", "fixtures"))
}

func loadRegistry(t *testing.T) (*contract.Registry, *Validator) {
	t.Helper()
	reg, err := contract.Load()
	if err != nil {
		t.Fatal(err)
	}
	return reg, NewValidator(reg)
}

func decodeOps(t *testing.T, reg *contract.Registry, raws []json.RawMessage) []contract.Op {
	t.Helper()
	ops := make([]contract.Op, 0, len(raws))
	for i, raw := range raws {
		op, err := reg.DecodeOp(raw)
		if err != nil {
			t.Fatalf("op %d: %v", i, err)
		}
		ops = append(ops, op)
	}
	return ops
}

func listFixtures(t *testing.T, sub string) []string {
	t.Helper()
	files, err := filepath.Glob(filepath.Join(fixturesDir(t), sub, "*.json"))
	if err != nil || len(files) == 0 {
		t.Fatalf("no fixtures in %s", sub)
	}
	sort.Strings(files)
	return files
}

func applyAll(t *testing.T, v *Validator, spec *gen.UISpec, ops []contract.Op) {
	t.Helper()
	for i, op := range ops {
		if e := v.CheckOp(spec, op); e != nil {
			t.Fatalf("op %d (%s) rejected: %v", i, contract.OpName(op), e)
		}
		if err := Apply(spec, op); err != nil {
			t.Fatalf("op %d (%s) apply: %v", i, contract.OpName(op), err)
		}
	}
}

// TestReducerGolden applies each reducer fixture and compares the canonical
// spec with the committed golden (`<name>.golden.json`). The TS reducer
// test reads the same goldens, which is what keeps the two in step.
func TestReducerGolden(t *testing.T) {
	reg, _ := loadRegistry(t)
	for _, file := range listFixtures(t, "reducer") {
		if strings.HasSuffix(file, ".golden.json") {
			continue
		}
		name := strings.TrimSuffix(filepath.Base(file), ".json")
		t.Run(name, func(t *testing.T) {
			var fx struct {
				Ops []json.RawMessage `json:"ops"`
			}
			mustRead(t, file, &fx)
			spec := New()
			for i, op := range decodeOps(t, reg, fx.Ops) {
				if err := Apply(&spec, op); err != nil {
					t.Fatalf("op %d: %v", i, err)
				}
			}
			got, err := Canonical(spec)
			if err != nil {
				t.Fatal(err)
			}
			golden := strings.TrimSuffix(file, ".json") + ".golden.json"
			if *update {
				if err := os.WriteFile(golden, append(got, '\n'), 0o644); err != nil {
					t.Fatal(err)
				}
				return
			}
			want, err := os.ReadFile(golden)
			if err != nil {
				t.Fatalf("missing golden (run with -update): %v", err)
			}
			if !bytes.Equal(bytes.TrimSpace(want), got) {
				t.Fatalf("golden mismatch\n got: %s\nwant: %s", got, bytes.TrimSpace(want))
			}
		})
	}
}

func TestValidFixtures(t *testing.T) {
	reg, v := loadRegistry(t)
	for _, file := range listFixtures(t, "valid") {
		t.Run(strings.TrimSuffix(filepath.Base(file), ".json"), func(t *testing.T) {
			var fx struct {
				Ops []json.RawMessage `json:"ops"`
			}
			mustRead(t, file, &fx)
			spec := New()
			applyAll(t, v, &spec, decodeOps(t, reg, fx.Ops))
			if issues := v.CheckSpec(&spec); len(issues) != 0 {
				t.Fatalf("whole-spec issues: %v", issues)
			}
			var generic any
			raw, _ := json.Marshal(spec)
			_ = json.Unmarshal(raw, &generic)
			if err := reg.ValidateSpec(generic); err != nil {
				t.Fatalf("final spec fails ui-spec schema: %v", err)
			}
		})
	}
}

func TestInvalidOpFixtures(t *testing.T) {
	reg, v := loadRegistry(t)
	for _, file := range listFixtures(t, "invalid") {
		t.Run(strings.TrimSuffix(filepath.Base(file), ".json"), func(t *testing.T) {
			var fx struct {
				Before []json.RawMessage `json:"before"`
				Op     json.RawMessage   `json:"op"`
				Code   string            `json:"code"`
			}
			mustRead(t, file, &fx)
			spec := New()
			applyAll(t, v, &spec, decodeOps(t, reg, fx.Before))
			op, err := reg.DecodeOp(fx.Op)
			if err != nil {
				if fx.Code == CodeInvalidOp {
					return
				}
				t.Fatalf("decode: %v", err)
			}
			e := v.CheckOp(&spec, op)
			if e == nil {
				t.Fatalf("op accepted, want %s", fx.Code)
			}
			if e.Code != fx.Code {
				t.Fatalf("code = %s (%s), want %s", e.Code, e.Message, fx.Code)
			}
		})
	}
}

func TestReducerErrorFixtures(t *testing.T) {
	reg, v := loadRegistry(t)
	for _, file := range listFixtures(t, "reducer-errors") {
		t.Run(strings.TrimSuffix(filepath.Base(file), ".json"), func(t *testing.T) {
			var fx struct {
				Before []json.RawMessage `json:"before"`
				Op     json.RawMessage   `json:"op"`
				Code   string            `json:"code"`
			}
			mustRead(t, file, &fx)
			spec := New()
			applyAll(t, v, &spec, decodeOps(t, reg, fx.Before))
			op, err := reg.DecodeOp(fx.Op)
			if err != nil {
				t.Fatalf("decode: %v", err)
			}
			if e := v.CheckOp(&spec, op); e != nil && e.Code != fx.Code {
				t.Fatalf("CheckOp code = %s, want %s", e.Code, fx.Code)
			}
			err = Apply(&spec, op)
			var re *Error
			if !errors.As(err, &re) || re.Code != fx.Code {
				t.Fatalf("Apply err = %v, want code %s", err, fx.Code)
			}
		})
	}
}

func TestInvalidSpecFixtures(t *testing.T) {
	reg, v := loadRegistry(t)
	for _, file := range listFixtures(t, "invalid-spec") {
		t.Run(strings.TrimSuffix(filepath.Base(file), ".json"), func(t *testing.T) {
			var fx struct {
				Ops   []json.RawMessage `json:"ops"`
				Codes []string          `json:"codes"`
			}
			mustRead(t, file, &fx)
			spec := New()
			applyAll(t, v, &spec, decodeOps(t, reg, fx.Ops))
			issues := v.CheckSpec(&spec)
			got := map[string]bool{}
			for _, is := range issues {
				got[is.Code] = true
			}
			var codes []string
			for c := range got {
				codes = append(codes, c)
			}
			sort.Strings(codes)
			if strings.Join(codes, ",") != strings.Join(fx.Codes, ",") {
				t.Fatalf("codes = %v, want %v (issues: %v)", codes, fx.Codes, issues)
			}
		})
	}
}

func mustRead(t *testing.T, file string, v any) {
	t.Helper()
	raw, err := os.ReadFile(file)
	if err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(raw, v); err != nil {
		t.Fatalf("%s: %v", file, err)
	}
}
