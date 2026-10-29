package contract

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"testing"
)

func sharedDir(t *testing.T) string {
	t.Helper()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	return filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", "..", "shared"))
}

// TestEmbeddedCopiesMatchShared fails when scripts/contracts-generate.sh
// has not been run after a change to shared/schema or shared/catalog.
func TestEmbeddedCopiesMatchShared(t *testing.T) {
	shared := sharedDir(t)
	pairs := map[string]string{}
	for _, name := range schemaFiles {
		pairs["embed/"+name] = filepath.Join(shared, "schema", name)
	}
	pairs["embed/catalog.json"] = filepath.Join(shared, "catalog", "catalog.json")
	for embedded, source := range pairs {
		got, err := files.ReadFile(embedded)
		if err != nil {
			t.Fatalf("read %s: %v", embedded, err)
		}
		want, err := os.ReadFile(source)
		if err != nil {
			t.Fatalf("read %s: %v", source, err)
		}
		if !bytes.Equal(got, want) {
			t.Errorf("%s is stale: run scripts/contracts-generate.sh", embedded)
		}
	}
}

// TestGeneratedGoIsFresh regenerates the Go types into a temp dir and
// compares with the committed output. Skipped when go-jsonschema is not
// installed (the embedded-copy test above still catches schema drift).
func TestGeneratedGoIsFresh(t *testing.T) {
	gojs := filepath.Join(gopath(t), "bin", "go-jsonschema")
	if _, err := os.Stat(gojs); err != nil {
		t.Skip("go-jsonschema not installed; run scripts/contracts-generate.sh to install")
	}
	shared := sharedDir(t)
	tmp := t.TempDir()
	args := []string{"-p", "gen", "--only-models", "--tags", "json", "--capitalization", "ID", "--capitalization", "URL"}
	roots := map[string]string{"ui-spec": "UISpec", "ops": "SpecOp", "events": "SessionEvent", "api": "API", "catalog": "Catalog"}
	outs := map[string]string{"ui-spec": "uispec.go", "ops": "ops.go", "events": "events.go", "api": "api.go", "catalog": "catalog.go"}
	for _, k := range []string{"ui-spec", "ops", "events", "api", "catalog"} {
		args = append(args, "--schema-root-type", baseURL+k+".schema.json="+roots[k])
		args = append(args, "--schema-output", baseURL+k+".schema.json="+filepath.Join(tmp, outs[k]))
	}
	for _, k := range []string{"ui-spec", "ops", "events", "api", "catalog"} {
		args = append(args, k+".schema.json")
	}
	cmd := exec.Command(gojs, args...)
	cmd.Dir = filepath.Join(shared, "schema")
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("go-jsonschema: %v\n%s", err, out)
	}
	gofmt := filepath.Join(runtime.GOROOT(), "bin", "gofmt")
	if out, err := exec.Command(gofmt, "-w", tmp).CombinedOutput(); err != nil {
		t.Fatalf("gofmt: %v\n%s", err, out)
	}
	_, file, _, _ := runtime.Caller(0)
	genDir := filepath.Join(filepath.Dir(file), "gen")
	for _, name := range outs {
		want, err := os.ReadFile(filepath.Join(tmp, name))
		if err != nil {
			t.Fatal(err)
		}
		got, err := os.ReadFile(filepath.Join(genDir, name))
		if err != nil {
			t.Fatal(err)
		}
		if !bytes.Equal(got, want) {
			t.Errorf("gen/%s is stale: run scripts/contracts-generate.sh", name)
		}
	}
}

func gopath(t *testing.T) string {
	t.Helper()
	if p := os.Getenv("GOPATH"); p != "" {
		return p
	}
	out, err := exec.Command("go", "env", "GOPATH").Output()
	if err != nil {
		t.Fatal(err)
	}
	return string(bytes.TrimSpace(out))
}
