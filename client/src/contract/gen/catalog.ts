/* eslint-disable */
/**
 * Generated from shared/schema/catalog.schema.json by scripts/contracts-generate.sh. DO NOT EDIT.
 */

/**
 * Size and fit hint. glance: small card readable across the room, panel: beside the agent, full: takes the screen.
 */
export type Fit = "glance" | "panel" | "full";

/**
 * Shape of shared/catalog/catalog.json: the closed component catalog (VISION.md 5.1). It is the single source for the model-facing description, server validation and the client registry.
 */
export interface Catalog {
  catalog_version: number;
  components: {
    [k: string]: ComponentDef;
  };
}
export interface ComponentDef {
  description: string;
  category: "layout" | "content" | "action" | "status";
  /**
   * @minItems 1
   */
  fit: [Fit, ...Fit[]];
  /**
   * JSON Schema (object) for the props.
   */
  props: {
    [k: string]: unknown;
  };
  /**
   * Prop names that accept a Binding instead of a literal.
   */
  bindable?: string[];
  slots?: {
    [k: string]: SlotDef;
  };
  /**
   * Action slot names the component can fire.
   */
  actions?: string[];
  /**
   * Content hints used by fit-ranking (for example `place`, `numeric`, `list`).
   */
  tags?: string[];
  /**
   * A props example shown to the model.
   */
  example?: {
    [k: string]: unknown;
  };
}
export interface SlotDef {
  description?: string;
  /**
   * Allowed child component types, or ["*"] for any.
   *
   * @minItems 1
   */
  accepts: [string, ...string[]];
  max?: number;
}
