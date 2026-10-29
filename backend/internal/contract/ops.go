package contract

import (
	"encoding/json"
	"fmt"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
)

// Op is one of the generated op structs: gen.AddNodeOp, gen.SetPropsOp,
// gen.SetSlotOp, gen.SetDataOp, gen.SetActionOp, gen.RemoveNodeOp,
// gen.SetRootOp, gen.ClearOp or gen.DoneOp (by value).
type Op any

// DecodeOp validates raw against ops.schema.json and decodes it into the
// matching generated struct.
func (r *Registry) DecodeOp(raw []byte) (Op, error) {
	var generic any
	if err := json.Unmarshal(raw, &generic); err != nil {
		return nil, wrap("op", err)
	}
	if err := r.ValidateOp(generic); err != nil {
		return nil, err
	}
	return DecodeOpUnchecked(raw)
}

// DecodeOpUnchecked decodes without schema validation. Use only for ops
// that were validated already (for example when re-reading a transcript).
func DecodeOpUnchecked(raw []byte) (Op, error) {
	var head struct {
		Op string `json:"op"`
	}
	if err := json.Unmarshal(raw, &head); err != nil {
		return nil, wrap("op", err)
	}
	var (
		out any
		err error
	)
	switch head.Op {
	case "add_node":
		var v gen.AddNodeOp
		err, out = json.Unmarshal(raw, &v), v
	case "set_props":
		var v gen.SetPropsOp
		err, out = json.Unmarshal(raw, &v), v
	case "set_slot":
		var v gen.SetSlotOp
		err, out = json.Unmarshal(raw, &v), v
	case "set_data":
		var v gen.SetDataOp
		err, out = json.Unmarshal(raw, &v), v
	case "set_action":
		var v gen.SetActionOp
		err, out = json.Unmarshal(raw, &v), v
	case "remove_node":
		var v gen.RemoveNodeOp
		err, out = json.Unmarshal(raw, &v), v
	case "set_root":
		var v gen.SetRootOp
		err, out = json.Unmarshal(raw, &v), v
	case "clear":
		var v gen.ClearOp
		err, out = json.Unmarshal(raw, &v), v
	case "done":
		var v gen.DoneOp
		err, out = json.Unmarshal(raw, &v), v
	default:
		return nil, wrap("op", fmt.Errorf("unknown op %q", head.Op))
	}
	if err != nil {
		return nil, wrap("op", err)
	}
	return out, nil
}

// OpName returns the `op` discriminator of a decoded op.
func OpName(op Op) string {
	switch op.(type) {
	case gen.AddNodeOp:
		return "add_node"
	case gen.SetPropsOp:
		return "set_props"
	case gen.SetSlotOp:
		return "set_slot"
	case gen.SetDataOp:
		return "set_data"
	case gen.SetActionOp:
		return "set_action"
	case gen.RemoveNodeOp:
		return "remove_node"
	case gen.SetRootOp:
		return "set_root"
	case gen.ClearOp:
		return "clear"
	case gen.DoneOp:
		return "done"
	}
	return ""
}
