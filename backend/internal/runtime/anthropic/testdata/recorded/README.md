# Recorded Messages API streams

One file per request round of a single turn, in the exact `text/event-stream`
shape of `POST /v1/messages` with `stream: true` (event names, JSON payloads,
`ping` keepalives, an empty `thinking` block with its `signature_delta` as the
API streams it when `thinking.display` is omitted). `contract_test.go` replays
them from an `httptest` server and records the requests the runtime sends as
goldens under `../golden/` (`go test ./internal/runtime/anthropic -update`
rewrites them). Compare the goldens with the Messages API reference when the
SDK or the API changes; the live check (`cmd/runtime-check`) exercises the same
turn shape against the real endpoint.

- `round-1.sse`: text, then a `show_ui` tool use whose input streams in two
  `input_json_delta` pieces; `stop_reason: tool_use`.
- `round-2.sse`: a `get_time` tool use; `stop_reason: tool_use`.
- `round-3.sse`: the final text; `stop_reason: end_turn`.
