package uispec

import (
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
)

// Error codes shared with the client (REDUCER.md).
const (
	CodeInvalidOp          = "invalid_op"
	CodeUnknownComponent   = "unknown_component"
	CodeInvalidProps       = "invalid_props"
	CodeUnknownSlot        = "unknown_slot"
	CodeSlotTypeNotAllowed = "slot_type_not_allowed"
	CodeSlotOverflow       = "slot_overflow"
	CodeUnknownActionSlot  = "unknown_action_slot"
	CodeNodeNotFound       = "node_not_found"
	CodeDanglingRef        = "dangling_ref"
	CodeBudgetExceeded     = "budget_exceeded"
	CodeBindingNotBindable = "binding_not_bindable"
	CodeUnresolvedBinding  = "unresolved_binding"
	CodePathNotSettable    = "path_not_settable"
	CodeCycle              = "cycle"
)

// Error is a reducer or validation failure with a stable code.
type Error struct {
	Code    string
	Message string
	NodeID  string
}

func (e *Error) Error() string {
	if e.NodeID != "" {
		return fmt.Sprintf("%s (%s): %s", e.Code, e.NodeID, e.Message)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// New returns the empty spec.
func New() gen.UISpec {
	return gen.UISpec{
		SpecVersion: 1,
		Root:        nil,
		Nodes:       gen.UISpecNodes{},
		Data:        gen.UISpecData{},
		Actions:     gen.UISpecActions{},
	}
}

// Clone deep-copies a spec through JSON (specs are small).
func Clone(s gen.UISpec) gen.UISpec {
	raw, _ := json.Marshal(s)
	var out gen.UISpec
	_ = json.Unmarshal(raw, &out)
	if out.Nodes == nil {
		out.Nodes = gen.UISpecNodes{}
	}
	if out.Data == nil {
		out.Data = gen.UISpecData{}
	}
	if out.Actions == nil {
		out.Actions = gen.UISpecActions{}
	}
	return out
}

// Apply mutates s according to op. It performs only the structural checks
// REDUCER.md lists for the reducer; catalog checks live in Validator.
func Apply(s *gen.UISpec, op contract.Op) error {
	if s.Nodes == nil {
		s.Nodes = gen.UISpecNodes{}
	}
	if s.Data == nil {
		s.Data = gen.UISpecData{}
	}
	if s.Actions == nil {
		s.Actions = gen.UISpecActions{}
	}
	switch o := op.(type) {
	case gen.AddNodeOp:
		n := o.Node
		if n.Props == nil {
			n.Props = gen.NodeProps{}
		}
		if n.Slots == nil {
			n.Slots = gen.NodeSlots{}
		}
		if n.Actions == nil {
			n.Actions = gen.NodeActions{}
		}
		s.Nodes[string(o.ID)] = n
	case gen.SetPropsOp:
		n, ok := s.Nodes[string(o.ID)]
		if !ok {
			return &Error{Code: CodeNodeNotFound, NodeID: string(o.ID), Message: "set_props on missing node"}
		}
		if n.Props == nil {
			n.Props = gen.NodeProps{}
		}
		for k, v := range o.Props {
			n.Props[k] = v
		}
		s.Nodes[string(o.ID)] = n
	case gen.SetSlotOp:
		n, ok := s.Nodes[string(o.ID)]
		if !ok {
			return &Error{Code: CodeNodeNotFound, NodeID: string(o.ID), Message: "set_slot on missing node"}
		}
		if n.Slots == nil {
			n.Slots = gen.NodeSlots{}
		}
		n.Slots[string(o.Slot)] = append([]gen.NodeID(nil), o.Children...)
		s.Nodes[string(o.ID)] = n
	case gen.SetDataOp:
		if o.Path == nil {
			obj, ok := o.Value.(map[string]any)
			if !ok {
				return &Error{Code: CodeInvalidOp, Message: "set_data without path requires an object value"}
			}
			for k, v := range obj {
				s.Data[k] = v
			}
			return nil
		}
		newRoot, err := SetPath(map[string]any(s.Data), string(*o.Path), o.Value)
		if err != nil {
			return err
		}
		s.Data = gen.UISpecData(newRoot)
	case gen.SetActionOp:
		s.Actions[string(o.ID)] = o.Action
	case gen.RemoveNodeOp:
		removeNode(s, string(o.ID))
	case gen.SetRootOp:
		id := string(o.ID)
		s.Root = &id
	case gen.ClearOp:
		s.Nodes = gen.UISpecNodes{}
		s.Root = nil
		if o.All {
			s.Data = gen.UISpecData{}
			s.Actions = gen.UISpecActions{}
		}
	case gen.DoneOp:
	default:
		return &Error{Code: CodeInvalidOp, Message: fmt.Sprintf("unsupported op %T", op)}
	}
	return nil
}

// removeNode deletes id and every node reachable through its slots, then
// strips id from all slot lists.
func removeNode(s *gen.UISpec, id string) {
	if _, ok := s.Nodes[id]; !ok {
		return
	}
	doomed := map[string]bool{}
	var mark func(string)
	mark = func(cur string) {
		if doomed[cur] {
			return
		}
		n, ok := s.Nodes[cur]
		if !ok {
			return
		}
		doomed[cur] = true
		for _, children := range n.Slots {
			for _, c := range children {
				mark(string(c))
			}
		}
	}
	mark(id)
	for d := range doomed {
		delete(s.Nodes, d)
	}
	for nid, n := range s.Nodes {
		changed := false
		for slot, children := range n.Slots {
			kept := children[:0:0]
			for _, c := range children {
				if !doomed[string(c)] {
					kept = append(kept, c)
				}
			}
			if len(kept) != len(children) {
				n.Slots[slot] = kept
				changed = true
			}
		}
		if changed {
			s.Nodes[nid] = n
		}
	}
	if s.Root != nil && doomed[string(*s.Root)] {
		s.Root = nil
	}
}

// Canonical renders the spec as canonical JSON (sorted keys, empty
// props/slots/actions and false pinned omitted) for golden comparisons.
func Canonical(s gen.UISpec) ([]byte, error) {
	raw, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	var generic any
	if err := json.Unmarshal(raw, &generic); err != nil {
		return nil, err
	}
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(generic); err != nil {
		return nil, err
	}
	return bytes.TrimRight(buf.Bytes(), "\n"), nil
}
