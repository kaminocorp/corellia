package store

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestJSONRoundTripAndAtomicity(t *testing.T) {
	s, err := New(filepath.Join(t.TempDir(), "data"))
	if err != nil {
		t.Fatal(err)
	}
	type doc struct {
		N int `json:"n"`
	}
	var d doc
	if err := s.ReadJSON("missing.json", &d); err != nil || d.N != 0 {
		t.Fatalf("missing: %v %+v", err, d)
	}
	if err := s.WriteJSON("doc.json", doc{N: 3}); err != nil {
		t.Fatal(err)
	}
	if err := s.ReadJSON("doc.json", &d); err != nil || d.N != 3 {
		t.Fatalf("read: %v %+v", err, d)
	}
	entries, _ := os.ReadDir(s.Dir())
	for _, e := range entries {
		if filepath.Ext(e.Name()) == ".tmp" {
			t.Fatalf("temp file left behind: %s", e.Name())
		}
	}
}

func TestJSONL(t *testing.T) {
	s, _ := New(t.TempDir())
	for i := 0; i < 3; i++ {
		if err := s.AppendJSONL("log.jsonl", map[string]int{"i": i}); err != nil {
			t.Fatal(err)
		}
	}
	// A corrupt line is skipped, not fatal.
	f, _ := os.OpenFile(filepath.Join(s.Dir(), "log.jsonl"), os.O_APPEND|os.O_WRONLY, 0o644)
	_, _ = f.WriteString("{broken\n")
	f.Close()
	var got []int
	err := s.ReadJSONL("log.jsonl", func(raw []byte) error {
		var m map[string]int
		if json.Unmarshal(raw, &m) == nil {
			got = append(got, m["i"])
		}
		return nil
	})
	if err != nil || len(got) != 3 || got[2] != 2 {
		t.Fatalf("got %v err %v", got, err)
	}
	if err := s.ReadJSONL("nope.jsonl", func([]byte) error { return nil }); err != nil {
		t.Fatal(err)
	}
}

func TestNewRefusesAnUnwritableDir(t *testing.T) {
	if os.Geteuid() == 0 {
		t.Skip("root can write anywhere")
	}
	dir := filepath.Join(t.TempDir(), "ro")
	if err := os.Mkdir(dir, 0o500); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chmod(dir, 0o700) })
	_, err := New(dir)
	if err == nil {
		t.Fatal("New accepted a read-only data dir")
	}
	for _, want := range []string{"not writable", "/data volume", dir} {
		if !strings.Contains(err.Error(), want) {
			t.Fatalf("error %q lacks %q", err, want)
		}
	}
}

func TestWriteFailuresAreRecordedAndCleared(t *testing.T) {
	if os.Geteuid() == 0 {
		t.Skip("root can write anywhere")
	}
	dir := t.TempDir()
	s, err := New(dir)
	if err != nil {
		t.Fatal(err)
	}
	if !s.Healthy() {
		t.Fatal("fresh store unhealthy")
	}
	if err := os.Chmod(dir, 0o500); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chmod(dir, 0o700) })
	if err := s.WriteJSON("doc.json", map[string]int{"n": 1}); err == nil {
		t.Fatal("WriteJSON succeeded on a read-only dir")
	}
	if s.Healthy() {
		t.Fatal("failure not recorded")
	}
	if err := s.AppendJSONL("log.jsonl", map[string]int{"i": 1}); err == nil {
		t.Fatal("AppendJSONL succeeded on a read-only dir")
	}
	if last, at := s.Err(); last == nil || at.IsZero() {
		t.Fatalf("Err = %v, %v", last, at)
	}
	_ = os.Chmod(dir, 0o700)
	if err := s.AppendJSONL("log.jsonl", map[string]int{"i": 2}); err != nil {
		t.Fatal(err)
	}
	if !s.Healthy() {
		t.Fatal("a successful write did not clear the failure")
	}
}
