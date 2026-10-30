package uispec

import "testing"

func TestParsePath(t *testing.T) {
	cases := []struct {
		in   string
		ok   bool
		segs int
	}{
		{"$", true, 0},
		{"$.a", true, 1},
		{"$.a.b[2].c", true, 4},
		{"$[0]", true, 1},
		{"a.b", false, 0},
		{"$.", false, 0},
		{"$.a[", false, 0},
		{"$.1a", false, 0},
		{"$ .a", false, 0},
	}
	for _, tc := range cases {
		segs, err := ParsePath(tc.in)
		if (err == nil) != tc.ok || (tc.ok && len(segs) != tc.segs) {
			t.Errorf("ParsePath(%q) = %v, %v", tc.in, segs, err)
		}
	}
}

func TestResolve(t *testing.T) {
	data := map[string]any{
		"place": map[string]any{"coords": []any{38.72, -9.14}},
		"list":  []any{map[string]any{"k": "v"}},
		"n":     nil,
	}
	cases := []struct {
		path string
		want any
		ok   bool
	}{
		{"$", data, true},
		{"$.place.coords[1]", -9.14, true},
		{"$.list[0].k", "v", true},
		{"$.list[1]", nil, false},
		{"$.place.coords.x", nil, false},
		{"$.missing", nil, false},
		{"$.n", nil, true},
		{"not a path", nil, false},
	}
	for _, tc := range cases {
		got, ok := Resolve(data, tc.path)
		if ok != tc.ok {
			t.Errorf("Resolve(%q) ok = %v, want %v", tc.path, ok, tc.ok)
			continue
		}
		if tc.ok && tc.path != "$" && got != tc.want {
			t.Errorf("Resolve(%q) = %v, want %v", tc.path, got, tc.want)
		}
	}
}

func TestIsBinding(t *testing.T) {
	if p, ok := IsBinding(map[string]any{"bind": "$.a"}); !ok || p != "$.a" {
		t.Fatal("binding not recognised")
	}
	for _, v := range []any{map[string]any{"bind": "a"}, map[string]any{"bind": "$.a", "x": 1}, "$.a", nil, map[string]any{}} {
		if _, ok := IsBinding(v); ok {
			t.Errorf("%v should not be a binding", v)
		}
	}
}
