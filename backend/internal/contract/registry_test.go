package contract

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
)

func mustLoad(t *testing.T) *Registry {
	t.Helper()
	r, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	return r
}

func TestLoadCatalog(t *testing.T) {
	r := mustLoad(t)
	names := r.ComponentNames()
	want := []string{"Card", "Chart", "Confirm", "Grid", "Image", "List", "Map", "Markdown", "Overlay", "Split", "Stack", "Stat", "Status", "Table", "Timeline"}
	if strings.Join(names, ",") != strings.Join(want, ",") {
		t.Fatalf("components = %v", names)
	}
	if _, ok := r.Component("Nope"); ok {
		t.Fatal("unknown component found")
	}
	if def, _ := r.Component("Card"); def.Category != gen.ComponentDefCategoryContent {
		t.Fatalf("Card category = %v", def.Category)
	}
}

func TestValidateOp(t *testing.T) {
	r := mustLoad(t)
	cases := []struct {
		name string
		raw  string
		ok   bool
	}{
		{"add_node", `{"op":"add_node","id":"n1","node":{"type":"Card","props":{"title":"x"}}}`, true},
		{"set_data path", `{"op":"set_data","path":"$.a.b[0]","value":1}`, true},
		{"set_data bad path", `{"op":"set_data","path":"a.b","value":1}`, false},
		{"unknown op", `{"op":"explode"}`, false},
		{"bad id", `{"op":"remove_node","id":"1bad"}`, false},
		{"clear", `{"op":"clear","all":true}`, true},
		{"done extra field", `{"op":"done","x":1}`, false},
		{"action propose needs tool", `{"op":"set_action","id":"a1","action":{"kind":"propose"}}`, false},
		{"action propose ok", `{"op":"set_action","id":"a1","action":{"kind":"propose","tool":"set_reminder","args":{}}}`, true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var v any
			if err := json.Unmarshal([]byte(tc.raw), &v); err != nil {
				t.Fatal(err)
			}
			err := r.ValidateOp(v)
			if (err == nil) != tc.ok {
				t.Fatalf("err = %v, want ok=%v", err, tc.ok)
			}
			if tc.ok {
				if _, err := r.DecodeOp([]byte(tc.raw)); err != nil {
					t.Fatalf("DecodeOp: %v", err)
				}
			}
		})
	}
}

func TestDecodeOpTypes(t *testing.T) {
	r := mustLoad(t)
	op, err := r.DecodeOp([]byte(`{"op":"set_slot","id":"n1","slot":"body","children":["n2","n3"]}`))
	if err != nil {
		t.Fatal(err)
	}
	ss, ok := op.(gen.SetSlotOp)
	if !ok || ss.Slot != "body" || len(ss.Children) != 2 || OpName(op) != "set_slot" {
		t.Fatalf("decoded %#v", op)
	}
}

func TestValidateProps(t *testing.T) {
	r := mustLoad(t)
	cases := []struct {
		name  string
		comp  string
		props map[string]any
		bound map[string]bool
		ok    bool
	}{
		{"stat ok", "Stat", map[string]any{"label": "Outside", "value": 21.0}, nil, true},
		{"stat missing value", "Stat", map[string]any{"label": "Outside"}, nil, false},
		{"stat bound value", "Stat", map[string]any{"label": "Outside", "value": map[string]any{"bind": "$.t"}}, map[string]bool{"value": true}, true},
		{"stat bound value, other failure", "Stat", map[string]any{"label": 12.0, "value": map[string]any{"bind": "$.t"}}, map[string]bool{"value": true}, false},
		{"stat extra prop", "Stat", map[string]any{"label": "x", "value": 1.0, "zzz": true}, nil, false},
		{"map center wrong arity", "Map", map[string]any{"center": []any{1.0}}, nil, false},
		{"image http rejected", "Image", map[string]any{"src": "http://x/y.png", "alt": "y"}, nil, false},
		{"unknown component", "Nope", map[string]any{}, nil, false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := r.ValidateProps(tc.comp, tc.props, tc.bound)
			if (err == nil) != tc.ok {
				t.Fatalf("err = %v, want ok=%v", err, tc.ok)
			}
		})
	}
}

func TestValidateEventAndAPI(t *testing.T) {
	r := mustLoad(t)
	var ev any
	_ = json.Unmarshal([]byte(`{"type":"text_delta","seq":3,"ts":"2026-10-29T10:00:00Z","turn_id":"t1","delta":"hi"}`), &ev)
	if err := r.ValidateEvent(ev); err != nil {
		t.Fatalf("event: %v", err)
	}
	_ = json.Unmarshal([]byte(`{"type":"text_delta","seq":3,"ts":"nope","turn_id":"t1","delta":"hi"}`), &ev)
	if err := r.ValidateEvent(ev); err == nil {
		t.Fatal("bad date-time accepted")
	}
	var req any
	_ = json.Unmarshal([]byte(`{"text":"hello","source":"voice"}`), &req)
	if err := r.ValidateAPI("TurnRequest", req); err != nil {
		t.Fatalf("api: %v", err)
	}
	_ = json.Unmarshal([]byte(`{"text":""}`), &req)
	if err := r.ValidateAPI("TurnRequest", req); err == nil {
		t.Fatal("empty text accepted")
	}
	if err := r.ValidateAPI("Nope", req); err == nil {
		t.Fatal("unknown def accepted")
	}
}
