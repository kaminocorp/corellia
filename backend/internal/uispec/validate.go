package uispec

import (
	"fmt"
	"sort"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
)

// Budgets for a whole spec (REDUCER.md).
const (
	MaxNodes = 64
	MaxDepth = 8
)

// Validator performs catalog-aware checks on ops and whole specs.
type Validator struct {
	reg *contract.Registry
}

// NewValidator wraps a loaded registry.
func NewValidator(reg *contract.Registry) *Validator { return &Validator{reg: reg} }

// CheckOp validates op against the catalog and the current spec, before it
// is applied. A nil result means the op may be applied.
func (v *Validator) CheckOp(s *gen.UISpec, op contract.Op) *Error {
	switch o := op.(type) {
	case gen.AddNodeOp:
		return v.checkNode(s, string(o.ID), o.Node)
	case gen.SetPropsOp:
		n, ok := s.Nodes[string(o.ID)]
		if !ok {
			return &Error{Code: CodeNodeNotFound, NodeID: string(o.ID), Message: "set_props on missing node"}
		}
		merged := make(map[string]any, len(n.Props)+len(o.Props))
		for k, val := range n.Props {
			merged[k] = val
		}
		for k, val := range o.Props {
			merged[k] = val
		}
		return v.checkProps(string(o.ID), string(n.Type), merged)
	case gen.SetSlotOp:
		n, ok := s.Nodes[string(o.ID)]
		if !ok {
			return &Error{Code: CodeNodeNotFound, NodeID: string(o.ID), Message: "set_slot on missing node"}
		}
		return v.checkSlot(s, string(o.ID), string(n.Type), string(o.Slot), o.Children)
	case gen.SetDataOp:
		if o.Path == nil {
			if _, ok := o.Value.(map[string]any); !ok {
				return &Error{Code: CodeInvalidOp, Message: "set_data without path requires an object value"}
			}
		}
	}
	return nil
}

func (v *Validator) checkNode(s *gen.UISpec, id string, n gen.Node) *Error {
	def, ok := v.reg.Component(string(n.Type))
	if !ok {
		return &Error{Code: CodeUnknownComponent, NodeID: id, Message: fmt.Sprintf("component %q is not in the catalog", n.Type)}
	}
	for slot, children := range n.Slots {
		if e := v.checkSlot(s, id, string(n.Type), slot, children); e != nil {
			return e
		}
	}
	for actionSlot := range n.Actions {
		if !contains(def.Actions, actionSlot) {
			return &Error{Code: CodeUnknownActionSlot, NodeID: id, Message: fmt.Sprintf("%s has no action slot %q", n.Type, actionSlot)}
		}
	}
	return v.checkProps(id, string(n.Type), n.Props)
}

func (v *Validator) checkSlot(s *gen.UISpec, id, typ, slot string, children []gen.NodeID) *Error {
	def, _ := v.reg.Component(typ)
	sd, ok := def.Slots[slot]
	if !ok {
		return &Error{Code: CodeUnknownSlot, NodeID: id, Message: fmt.Sprintf("%s has no slot %q", typ, slot)}
	}
	if sd.Max != nil && len(children) > *sd.Max {
		return &Error{Code: CodeSlotOverflow, NodeID: id, Message: fmt.Sprintf("slot %q holds at most %d children", slot, *sd.Max)}
	}
	for _, c := range children {
		child, exists := s.Nodes[string(c)]
		if !exists {
			continue // may arrive later; whole-spec check catches it at done
		}
		if !slotAccepts(sd, string(child.Type)) {
			return &Error{Code: CodeSlotTypeNotAllowed, NodeID: id, Message: fmt.Sprintf("slot %q does not accept %s", slot, child.Type)}
		}
	}
	return nil
}

func (v *Validator) checkProps(id, typ string, props map[string]any) *Error {
	def, _ := v.reg.Component(typ)
	bound := map[string]bool{}
	for k, val := range props {
		if _, isBind := IsBinding(val); isBind {
			if !contains(def.Bindable, k) {
				return &Error{Code: CodeBindingNotBindable, NodeID: id, Message: fmt.Sprintf("prop %q of %s does not accept a binding", k, typ)}
			}
			bound[k] = true
		}
	}
	if err := v.reg.ValidateProps(typ, props, bound); err != nil {
		return &Error{Code: CodeInvalidProps, NodeID: id, Message: err.Error()}
	}
	return nil
}

// CheckSpec validates a whole spec: references, slot types, budget,
// bindings and resolved props. Returns every issue found.
func (v *Validator) CheckSpec(s *gen.UISpec) []Error {
	var issues []Error
	add := func(code, id, msg string) { issues = append(issues, Error{Code: code, NodeID: id, Message: msg}) }

	if len(s.Nodes) > MaxNodes {
		add(CodeBudgetExceeded, "", fmt.Sprintf("%d nodes exceed the budget of %d", len(s.Nodes), MaxNodes))
	}
	if s.Root != nil {
		if _, ok := s.Nodes[*s.Root]; !ok {
			add(CodeDanglingRef, *s.Root, "root node does not exist")
		}
	}
	ids := make([]string, 0, len(s.Nodes))
	for id := range s.Nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		n := s.Nodes[id]
		def, ok := v.reg.Component(string(n.Type))
		if !ok {
			add(CodeUnknownComponent, id, fmt.Sprintf("component %q is not in the catalog", n.Type))
			continue
		}
		slotNames := make([]string, 0, len(n.Slots))
		for slot := range n.Slots {
			slotNames = append(slotNames, slot)
		}
		sort.Strings(slotNames)
		for _, slot := range slotNames {
			sd, ok := def.Slots[slot]
			if !ok {
				add(CodeUnknownSlot, id, fmt.Sprintf("%s has no slot %q", n.Type, slot))
				continue
			}
			for _, c := range n.Slots[slot] {
				child, exists := s.Nodes[string(c)]
				if !exists {
					add(CodeDanglingRef, id, fmt.Sprintf("slot %q references missing node %q", slot, c))
					continue
				}
				if !slotAccepts(sd, string(child.Type)) {
					add(CodeSlotTypeNotAllowed, id, fmt.Sprintf("slot %q does not accept %s", slot, child.Type))
				}
			}
		}
		actionSlots := make([]string, 0, len(n.Actions))
		for a := range n.Actions {
			actionSlots = append(actionSlots, a)
		}
		sort.Strings(actionSlots)
		for _, a := range actionSlots {
			ref := n.Actions[a]
			if _, ok := s.Actions[string(ref.ID)]; !ok {
				add(CodeDanglingRef, id, fmt.Sprintf("action slot %q references missing action %q", a, ref.ID))
			}
		}
		resolved, unresolved := ResolveProps(n.Props, s.Data)
		for _, k := range unresolved {
			add(CodeUnresolvedBinding, id, fmt.Sprintf("prop %q binding does not resolve", k))
		}
		if len(unresolved) == 0 {
			if err := v.reg.ValidateProps(string(n.Type), resolved, nil); err != nil {
				add(CodeInvalidProps, id, err.Error())
			}
		}
	}
	// Depth and cycles from the root.
	if s.Root != nil {
		if _, ok := s.Nodes[*s.Root]; ok {
			depth, cycle := walkDepth(s, *s.Root, map[string]bool{})
			if cycle != "" {
				add(CodeCycle, cycle, "node is reachable from itself")
			} else if depth > MaxDepth {
				add(CodeBudgetExceeded, *s.Root, fmt.Sprintf("tree depth %d exceeds %d", depth, MaxDepth))
			}
		}
	}
	return issues
}

// walkDepth returns the depth of the tree under id (a leaf is depth 1) and
// the first node found on a cycle, if any.
func walkDepth(s *gen.UISpec, id string, onPath map[string]bool) (int, string) {
	if onPath[id] {
		return 0, id
	}
	n, ok := s.Nodes[id]
	if !ok {
		return 0, ""
	}
	onPath[id] = true
	defer delete(onPath, id)
	max := 0
	for _, children := range n.Slots {
		for _, c := range children {
			d, cyc := walkDepth(s, string(c), onPath)
			if cyc != "" {
				return 0, cyc
			}
			if d > max {
				max = d
			}
		}
	}
	return max + 1, ""
}

func slotAccepts(sd gen.SlotDef, typ string) bool {
	for _, a := range sd.Accepts {
		if a == "*" || a == typ {
			return true
		}
	}
	return false
}

func contains(list []string, s string) bool {
	for _, x := range list {
		if x == s {
			return true
		}
	}
	return false
}
