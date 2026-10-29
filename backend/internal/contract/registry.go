// Package contract loads the shared JSON Schemas and the component catalog
// (embedded copies of shared/schema and shared/catalog) and exposes
// compiled validators. The generated types live in the gen sub-package.
//
// Everything in embed/ and gen/ is produced by scripts/contracts-generate.sh
// and never hand-edited; drift_test.go fails when the copies are stale.
package contract

import (
	"bytes"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"sort"

	"github.com/santhosh-tekuri/jsonschema/v6"
	"github.com/santhosh-tekuri/jsonschema/v6/kind"

	"github.com/hejijunhao/corellia/backend/internal/contract/gen"
)

//go:embed embed/*.json
var files embed.FS

const (
	baseURL    = "https://corellia.dev/schema/"
	uiSpecURL  = baseURL + "ui-spec.schema.json"
	opsURL     = baseURL + "ops.schema.json"
	eventsURL  = baseURL + "events.schema.json"
	apiURL     = baseURL + "api.schema.json"
	catalogURL = baseURL + "catalog.schema.json"
)

var schemaFiles = []string{"ui-spec.schema.json", "ops.schema.json", "events.schema.json", "api.schema.json", "catalog.schema.json"}

// Registry holds compiled schemas and the parsed catalog.
type Registry struct {
	spec, op, event, catalogSchema *jsonschema.Schema
	api                            map[string]*jsonschema.Schema
	catalog                        gen.Catalog
	catalogRaw                     []byte
	props                          map[string]*jsonschema.Schema
	componentNames                 []string
}

// Load compiles every embedded schema and the catalog. It is called once at
// boot; the result is immutable and safe for concurrent use.
func Load() (*Registry, error) {
	c := jsonschema.NewCompiler()
	c.AssertFormat()
	for _, name := range schemaFiles {
		raw, err := files.ReadFile("embed/" + name)
		if err != nil {
			return nil, fmt.Errorf("contract: read %s: %w", name, err)
		}
		doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(raw))
		if err != nil {
			return nil, fmt.Errorf("contract: parse %s: %w", name, err)
		}
		if err := c.AddResource(baseURL+name, doc); err != nil {
			return nil, fmt.Errorf("contract: add %s: %w", name, err)
		}
	}
	r := &Registry{api: map[string]*jsonschema.Schema{}, props: map[string]*jsonschema.Schema{}}
	var err error
	if r.spec, err = c.Compile(uiSpecURL); err != nil {
		return nil, fmt.Errorf("contract: compile ui-spec: %w", err)
	}
	if r.op, err = c.Compile(opsURL); err != nil {
		return nil, fmt.Errorf("contract: compile ops: %w", err)
	}
	if r.event, err = c.Compile(eventsURL); err != nil {
		return nil, fmt.Errorf("contract: compile events: %w", err)
	}
	if r.catalogSchema, err = c.Compile(catalogURL); err != nil {
		return nil, fmt.Errorf("contract: compile catalog schema: %w", err)
	}
	for _, def := range []string{"TurnRequest", "TurnResponse", "CancelRequest", "ConfirmRequest", "ActionRequest", "ErrorResponse"} {
		s, err := c.Compile(apiURL + "#/$defs/" + def)
		if err != nil {
			return nil, fmt.Errorf("contract: compile api %s: %w", def, err)
		}
		r.api[def] = s
	}

	// Catalog: validate against its schema, then compile each component's
	// props schema as a standalone resource.
	r.catalogRaw, err = files.ReadFile("embed/catalog.json")
	if err != nil {
		return nil, fmt.Errorf("contract: read catalog: %w", err)
	}
	catDoc, err := jsonschema.UnmarshalJSON(bytes.NewReader(r.catalogRaw))
	if err != nil {
		return nil, fmt.Errorf("contract: parse catalog: %w", err)
	}
	if err := r.catalogSchema.Validate(catDoc); err != nil {
		return nil, fmt.Errorf("contract: catalog does not match catalog.schema.json: %w", err)
	}
	if err := json.Unmarshal(r.catalogRaw, &r.catalog); err != nil {
		return nil, fmt.Errorf("contract: decode catalog: %w", err)
	}
	pc := jsonschema.NewCompiler()
	pc.AssertFormat()
	catMap, _ := catDoc.(map[string]any)
	comps, _ := catMap["components"].(map[string]any)
	for name := range r.catalog.Components {
		def, _ := comps[name].(map[string]any)
		url := baseURL + "catalog/" + name + "/props.json"
		if err := pc.AddResource(url, def["props"]); err != nil {
			return nil, fmt.Errorf("contract: add props schema %s: %w", name, err)
		}
		s, err := pc.Compile(url)
		if err != nil {
			return nil, fmt.Errorf("contract: compile props schema %s: %w", name, err)
		}
		r.props[name] = s
		r.componentNames = append(r.componentNames, name)
	}
	sort.Strings(r.componentNames)
	return r, nil
}

// Catalog returns the parsed catalog.
func (r *Registry) Catalog() gen.Catalog { return r.catalog }

// CatalogJSON returns the raw catalog bytes as shipped to the client.
func (r *Registry) CatalogJSON() []byte { return r.catalogRaw }

// ComponentNames returns the sorted component names.
func (r *Registry) ComponentNames() []string { return append([]string(nil), r.componentNames...) }

// Component looks up a component definition.
func (r *Registry) Component(name string) (gen.ComponentDef, bool) {
	def, ok := r.catalog.Components[name]
	return def, ok
}

// ValidateSpec checks a whole spec document (any JSON-decoded value).
func (r *Registry) ValidateSpec(v any) error { return wrap("spec", r.spec.Validate(v)) }

// ValidateOp checks one op against ops.schema.json.
func (r *Registry) ValidateOp(v any) error { return wrap("op", r.op.Validate(v)) }

// ValidateEvent checks one stream event against events.schema.json.
func (r *Registry) ValidateEvent(v any) error { return wrap("event", r.event.Validate(v)) }

// ValidateAPI checks a request/response body against a named $def of
// api.schema.json.
func (r *Registry) ValidateAPI(def string, v any) error {
	s, ok := r.api[def]
	if !ok {
		return fmt.Errorf("contract: unknown api definition %q", def)
	}
	return wrap("api."+def, s.Validate(v))
}

// ValidateProps validates component props. Keys listed in bound are
// bindings whose value is not known yet: they are removed before
// validation and a `required` failure that only names bound keys is
// ignored.
func (r *Registry) ValidateProps(component string, props map[string]any, bound map[string]bool) error {
	s, ok := r.props[component]
	if !ok {
		return fmt.Errorf("contract: unknown component %q", component)
	}
	inst := make(map[string]any, len(props))
	for k, v := range props {
		if !bound[k] {
			inst[k] = v
		}
	}
	err := s.Validate(inst)
	if err == nil {
		return nil
	}
	var ve *jsonschema.ValidationError
	if !errors.As(err, &ve) {
		return wrap("props", err)
	}
	if remaining := filterBoundRequired(ve, bound); remaining == nil {
		return nil
	}
	return wrap("props", err)
}

// filterBoundRequired returns nil when every leaf failure in ve is a
// `required` failure whose missing properties are all bound keys.
func filterBoundRequired(ve *jsonschema.ValidationError, bound map[string]bool) *jsonschema.ValidationError {
	if len(bound) == 0 {
		return ve
	}
	var leaves []*jsonschema.ValidationError
	var walk func(e *jsonschema.ValidationError)
	walk = func(e *jsonschema.ValidationError) {
		if len(e.Causes) == 0 {
			leaves = append(leaves, e)
			return
		}
		for _, c := range e.Causes {
			walk(c)
		}
	}
	walk(ve)
	for _, leaf := range leaves {
		req, ok := leaf.ErrorKind.(*kind.Required)
		if !ok || len(leaf.InstanceLocation) != 0 {
			return ve
		}
		for _, name := range req.Missing {
			if !bound[name] {
				return ve
			}
		}
	}
	return nil
}

// Error is a validation failure with a stable code for the client.
type Error struct {
	Scope string
	Err   error
}

func (e *Error) Error() string { return e.Scope + ": " + e.Err.Error() }
func (e *Error) Unwrap() error { return e.Err }

func wrap(scope string, err error) error {
	if err == nil {
		return nil
	}
	return &Error{Scope: scope, Err: err}
}
