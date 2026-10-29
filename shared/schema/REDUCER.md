# Spec reducer and validation semantics

Both reducers (`backend/internal/uispec`, `client/src/contract/reducer.ts`) implement exactly this. The fixtures under `fixtures/` are applied in both languages and the results must match byte for byte after canonicalisation (empty `props`/`slots`/`actions` omitted, `pinned: false` omitted, keys sorted).

## State

`UISpec { spec_version: 1, root: id | null, nodes: {id: Node}, data: {}, actions: {id: Action} }`. The empty spec is `{1, null, {}, {}, {}}`.

## Ops

| op | effect | errors |
|---|---|---|
| `add_node {id, node}` | `nodes[id] = node` (replace if present). Slot children may not exist yet. | |
| `set_props {id, props}` | shallow merge of `props` into `nodes[id].props`; values are taken as given (`null` stays `null`). | `node_not_found` |
| `set_slot {id, slot, children}` | `nodes[id].slots[slot] = children` (copy). | `node_not_found` |
| `set_data {value}` | `value` must be an object; shallow merge into `data`. | `invalid_op` |
| `set_data {path, value}` | set `value` at `path`. `$` alone replaces `data` (object required). `.key` segments create missing objects; `[i]` segments require an existing array with `i < length`, or `i == length` to append. | `invalid_op`, `path_not_settable` |
| `set_action {id, action}` | `actions[id] = action`. | |
| `remove_node {id}` | remove the node and every node reachable through its slots; remove the id from every slot list; `root = null` if it was the root. Missing node: no-op. | |
| `set_root {id}` | `root = id`. The node may arrive later. | |
| `clear {all?}` | `nodes = {}`, `root = null`; with `all`, also `data = {}`, `actions = {}`. | |
| `done` | no change. | |

## Per-op validation (server, before forwarding; client, defensively)

Order of checks and error codes:

1. The op matches `ops.schema.json`: `invalid_op`.
2. `add_node`: `unknown_component`; each slot name is declared: `unknown_slot`; `len(children) <= max`: `slot_overflow`; existing children have an allowed type: `slot_type_not_allowed`; each action slot is declared: `unknown_action_slot`; each `{bind}` prop is in `bindable`: `binding_not_bindable`; props without bound keys validate against the component schema, ignoring `required` failures for bound keys: `invalid_props`.
3. `set_props`: `node_not_found`, then the merged props are checked as in 2.
4. `set_slot`: `node_not_found`, `unknown_slot`, `slot_overflow`, `slot_type_not_allowed`.
5. `set_data` without `path` whose `value` is not an object: `invalid_op`.

## Whole-spec validation (server at `done`; client before render)

Returns every issue, not just the first: `dangling_ref` (root, slot child, or node action ref missing), `slot_type_not_allowed`, `budget_exceeded` (more than 64 nodes or a slot depth above 8), `unresolved_binding`, `invalid_props` (resolved props fail the schema), `cycle` (a node reachable from itself).

## Binding paths

`$` then any number of `.key` (identifier) or `[index]` segments. Resolution walks `data`; a missing key, an index out of range, or a non-container in the middle yields "unresolved". Resolution never throws.

## Floating overlays

An `Overlay` node that no slot references (and that is not the root) is rendered as a floating layer in addition to the root tree. The session uses this for confirmation cards, auto text cards and proactive glance cards so they never disturb the main tree. `clear` removes them like any node; `remove_node` on the overlay id dismisses one.
