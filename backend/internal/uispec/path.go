// Package uispec implements the UI spec tree: the op reducer, binding
// paths and catalog-aware validation. Semantics are specified in
// shared/schema/REDUCER.md and mirrored by client/src/contract.
package uispec

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// Segment is one step of a binding path: a key or an array index.
type Segment struct {
	Key     string
	Index   int
	IsIndex bool
}

var pathRe = regexp.MustCompile(`^\$((?:\.[A-Za-z_][A-Za-z0-9_]*|\[[0-9]+\])*)$`)
var segRe = regexp.MustCompile(`\.([A-Za-z_][A-Za-z0-9_]*)|\[([0-9]+)\]`)

// ParsePath parses `$`, `$.a`, `$.a.b[2].c` into segments.
func ParsePath(p string) ([]Segment, error) {
	m := pathRe.FindStringSubmatch(p)
	if m == nil {
		return nil, fmt.Errorf("invalid binding path %q", p)
	}
	var out []Segment
	for _, sm := range segRe.FindAllStringSubmatch(m[1], -1) {
		if sm[1] != "" {
			out = append(out, Segment{Key: sm[1]})
		} else {
			i, err := strconv.Atoi(sm[2])
			if err != nil {
				return nil, fmt.Errorf("invalid index in %q", p)
			}
			out = append(out, Segment{Index: i, IsIndex: true})
		}
	}
	return out, nil
}

// Resolve walks data along path. ok is false when any step is missing or
// the path is malformed. It never panics.
func Resolve(data map[string]any, path string) (any, bool) {
	segs, err := ParsePath(path)
	if err != nil {
		return nil, false
	}
	var cur any = data
	for _, s := range segs {
		if s.IsIndex {
			arr, ok := cur.([]any)
			if !ok || s.Index < 0 || s.Index >= len(arr) {
				return nil, false
			}
			cur = arr[s.Index]
			continue
		}
		obj, ok := cur.(map[string]any)
		if !ok {
			return nil, false
		}
		cur, ok = obj[s.Key]
		if !ok {
			return nil, false
		}
	}
	return cur, true
}

// SetPath writes value at path inside data and returns the (possibly new)
// root. `$` replaces the root, which must then be an object. Missing keys
// create objects; an index must point inside an existing array or at its
// end (append).
func SetPath(data map[string]any, path string, value any) (map[string]any, error) {
	segs, err := ParsePath(path)
	if err != nil {
		return data, &Error{Code: CodeInvalidOp, Message: err.Error()}
	}
	if len(segs) == 0 {
		obj, ok := value.(map[string]any)
		if !ok {
			return data, &Error{Code: CodeInvalidOp, Message: "set_data at $ requires an object value"}
		}
		return obj, nil
	}
	if data == nil {
		data = map[string]any{}
	}
	var parent any = data
	for i, s := range segs {
		last := i == len(segs)-1
		if s.IsIndex {
			arr, ok := parent.([]any)
			if !ok || s.Index < 0 || s.Index > len(arr) {
				return data, &Error{Code: CodePathNotSettable, Message: fmt.Sprintf("%s: index %d not settable", path, s.Index)}
			}
			if s.Index == len(arr) {
				// Appending requires rewriting the parent's reference; we
				// handle it by growing in place through the container that
				// holds arr, so we need the holder. Simplest: disallow append
				// on nested positions except through the holder below.
				return data, setIndexAppend(data, segs[:i], s.Index, value, segs[i+1:])
			}
			if last {
				arr[s.Index] = value
				return data, nil
			}
			if arr[s.Index] == nil {
				next := map[string]any{}
				arr[s.Index] = next
			}
			parent = arr[s.Index]
			continue
		}
		obj, ok := parent.(map[string]any)
		if !ok {
			return data, &Error{Code: CodePathNotSettable, Message: fmt.Sprintf("%s: %q is not inside an object", path, s.Key)}
		}
		if last {
			obj[s.Key] = value
			return data, nil
		}
		next, exists := obj[s.Key]
		if !exists || next == nil {
			nextSeg := segs[i+1]
			if nextSeg.IsIndex {
				return data, &Error{Code: CodePathNotSettable, Message: fmt.Sprintf("%s: cannot create an array at %q", path, s.Key)}
			}
			created := map[string]any{}
			obj[s.Key] = created
			next = created
		}
		parent = next
	}
	return data, nil
}

// setIndexAppend appends to the array found at holderPath, then descends
// into rest (which must be empty: appending creates a leaf).
func setIndexAppend(data map[string]any, holderPath []Segment, index int, value any, rest []Segment) error {
	if len(rest) != 0 {
		return &Error{Code: CodePathNotSettable, Message: "cannot append and descend in one path"}
	}
	if len(holderPath) == 0 {
		return &Error{Code: CodePathNotSettable, Message: "root is not an array"}
	}
	// Find the container holding the array.
	var parent any = data
	for _, s := range holderPath[:len(holderPath)-1] {
		if s.IsIndex {
			arr, ok := parent.([]any)
			if !ok || s.Index >= len(arr) {
				return &Error{Code: CodePathNotSettable, Message: "path not settable"}
			}
			parent = arr[s.Index]
		} else {
			obj, ok := parent.(map[string]any)
			if !ok {
				return &Error{Code: CodePathNotSettable, Message: "path not settable"}
			}
			parent = obj[s.Key]
		}
	}
	lastSeg := holderPath[len(holderPath)-1]
	if lastSeg.IsIndex {
		arr, ok := parent.([]any)
		if !ok || lastSeg.Index >= len(arr) {
			return &Error{Code: CodePathNotSettable, Message: "path not settable"}
		}
		inner, ok := arr[lastSeg.Index].([]any)
		if !ok || index != len(inner) {
			return &Error{Code: CodePathNotSettable, Message: "path not settable"}
		}
		arr[lastSeg.Index] = append(inner, value)
		return nil
	}
	obj, ok := parent.(map[string]any)
	if !ok {
		return &Error{Code: CodePathNotSettable, Message: "path not settable"}
	}
	inner, ok := obj[lastSeg.Key].([]any)
	if !ok || index != len(inner) {
		return &Error{Code: CodePathNotSettable, Message: "path not settable"}
	}
	obj[lastSeg.Key] = append(inner, value)
	return nil
}

// IsBinding reports whether a prop value is a `{bind: path}` object and
// returns the path.
func IsBinding(v any) (string, bool) {
	m, ok := v.(map[string]any)
	if !ok || len(m) != 1 {
		return "", false
	}
	p, ok := m["bind"].(string)
	if !ok || !pathRe.MatchString(p) {
		return "", false
	}
	return p, true
}

// ResolveProps returns a copy of props with every binding replaced by its
// value from data. Unresolved bindings are dropped and reported.
func ResolveProps(props map[string]any, data map[string]any) (resolved map[string]any, unresolved []string) {
	resolved = make(map[string]any, len(props))
	for k, v := range props {
		if path, ok := IsBinding(v); ok {
			val, found := Resolve(data, path)
			if !found {
				unresolved = append(unresolved, k)
				continue
			}
			resolved[k] = val
			continue
		}
		resolved[k] = v
	}
	if len(unresolved) > 1 {
		sortStrings(unresolved)
	}
	return resolved, unresolved
}

func sortStrings(s []string) {
	for i := 1; i < len(s); i++ {
		for j := i; j > 0 && strings.Compare(s[j-1], s[j]) > 0; j-- {
			s[j-1], s[j] = s[j], s[j-1]
		}
	}
}
