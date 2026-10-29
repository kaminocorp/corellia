package store

import (
	"encoding/json"
	"os"
	"path/filepath"
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
