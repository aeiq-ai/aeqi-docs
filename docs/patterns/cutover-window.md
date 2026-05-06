# Cutover window

How aeqi-platform tells clients "the runtime is starting, hold on" instead of "the system is broken." The pattern is a structured 503 + `Retry-After: 5` + JSON body that says explicitly: come back in five seconds.

## The problem

Spawning a Company runs through several stages: a `runtime_placements` row gets written with `status='creating'`, the host service gets started under systemd, and the runtime opens its socket on the assigned port. Two cutover windows sit between the click and a working dashboard:

1. **Pre-ready window.** The placement exists with `status != 'ready'`. The proxy has nothing to forward to.
2. **Post-ready, pre-socket window.** `status='ready'`, but the runtime hasn't bound the socket yet. The proxy tries, the connection is refused, the upstream is "down."

A bare `503` collapses both into "outage." Clients can't tell whether to retry or to surface a failure to the user.

## The shape

`aeqi-platform/src/proxy.rs` defines one shared response builder for both windows. Status `503`, header `Retry-After: 5`, and a JSON body:

```json
{
  "status": "creating",
  "placement_status": "creating",
  "retry_after_seconds": 5
}
```

`placement_status` carries the actual underlying state (`creating`, `pending`, `restarting`, `spawning`, `failed`, or `starting` for the post-ready connect-refused case). `status: "creating"` is a stable client-readable label that says "wait, don't escalate."

## The two match arms

```rust
// Window 1: placement exists but isn't ready yet.
pub fn cutover_response_if_creating(state, entity_id) -> Option<Response> {
    let placement = state.user_store.get_runtime_placement(entity_id)?;
    if placement.status == "ready" { return None; }
    // 503 + Retry-After + JSON body…
}

// Window 2: placement is ready but socket isn't bound.
match client.request(proxied_req).await {
    Err(e) if is_connection_refused(&e) => {
        cutover_response(StatusCode::SERVICE_UNAVAILABLE, "starting")
    }
    …
}
```

Both arms emit the same JSON shape. Clients can't tell — and don't need to — which window they're in. `Retry-After: 5` is the protocol; the body is the explanation.

## Why JSON body shape matters

`apps/ui/src/lib/useResource` and equivalent fetchers branch on `response.headers.get('retry-after')` to pick a backoff. They branch on the JSON `status` field to render "Spinning up your company…" instead of "Service unavailable." A bare `503` with no body forces the client to guess; the structured body removes the guess.

It also keeps the `Retry-After` and the body in lockstep — five seconds in the header, `retry_after_seconds: 5` in the body. One source of truth, two delivery vectors.

## The "failed" carve-out

A placement stuck at `status='failed'` is *also* non-ready, so the same 503 fires. That's intentional — emitting `Retry-After` is still correct because a failed placement may eventually be retried by the operator, and a permanent failure will surface through the resolver path once the row updates. The cutover window is the optimistic state; the resolver is the pessimistic one. Both are honest.

## Related

- [Platform/runtime identity boundary](/docs/architecture/platform) — placement.agent_id is the routing identity.
- [Runtime](/docs/architecture/runtime) — host vs sandbox vs vps placement types.
