/* eslint-disable */
/**
 * Generated from shared/schema/api.schema.json by scripts/contracts-generate.sh. DO NOT EDIT.
 */

/**
 * Request and response bodies of the JSON HTTP API. The root object only indexes the definitions (so generators emit every one); handlers reference the $defs by name.
 */
export interface API {
  turn_request?: TurnRequest;
  turn_response?: TurnResponse;
  cancel_request?: CancelRequest;
  confirm_request?: ConfirmRequest;
  action_request?: ActionRequest;
  error_response?: ErrorResponse;
  [k: string]: unknown;
}
export interface TurnRequest {
  text: string;
  source?: "keyboard" | "voice";
  /**
   * Optional idempotency key chosen by the client.
   */
  client_turn_id?: string;
}
export interface TurnResponse {
  turn_id: string;
  /**
   * Set when starting this turn cancelled a running one.
   */
  cancelled_turn_id?: string;
  /**
   * `turn` when a runtime turn started; `confirmed`/`rejected` when the text was a confirmation phrase applied to the pending proposal instead.
   */
  handled?: "turn" | "confirmed" | "rejected";
  /**
   * Set with `confirmed`/`rejected`.
   */
  proposal_id?: string;
  [k: string]: unknown;
}
export interface CancelRequest {
  /**
   * Omit to cancel whatever is running.
   */
  turn_id?: string;
}
export interface ConfirmRequest {
  proposal_id: string;
  source?: "keyboard" | "voice";
}
/**
 * The client fired a node action.
 */
export interface ActionRequest {
  action_id: string;
  node_id?: string;
}
export interface ErrorResponse {
  error: string;
  code?: string;
  [k: string]: unknown;
}
