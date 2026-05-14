# Inference API

aeqi-inference is an OpenAI-compatible API for running inference on multiple LLM providers. It exposes chat completions, embeddings (stub), and model discovery endpoints.

## Base URL

| Environment | URL                          |
|-------------|------------------------------|
| Hosted      | `https://app.aeqi.ai/v1`     |
| Self-hosted | `http://127.0.0.1:8443/v1`   |

`/v1/*` is served by the platform binary alongside `/api/*`, not by a separate inference daemon.

## Authentication

`POST /v1/chat/completions` and `POST /v1/embeddings` are gated by a `SubscriptionLayer` that checks for:

- `Authorization: Bearer <token>` — bearer token (JWT or `sk_…` API key).
- `X-Entity: <entity_id>` — selects which Company's balance is debited.

Missing the bearer returns `401 Unauthorized`. The subscription middleware is currently a skeleton — it does **not** verify JWT signatures yet; that is on the Phase 1 hardening list. A non-empty bearer is sufficient to pass the auth check today.

`GET /v1/models` is **public** — no auth required.

## Lanes

Three planned payment lanes for inference:

| Lane | Status | How it bills |
|------|--------|--------------|
| Subscription | Phase 1 live | Pooled per-Company credit, debited on each call. |
| Treasury | Scaffolded | Direct USDC debit from the Company's on-chain treasury. |
| x402 | Planned | HTTP 402 + EIP-3009 USDC per request. |

Only the subscription lane is currently wired. Treasury and x402 endpoints land in Phase 2.

## Endpoints

### POST /v1/chat/completions

Chat completion endpoint with optional streaming.

**Request:**

```json
{
  "model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "What is the capital of France?" }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Request fields:**

- `model` (required) — one of [Available Models](#available-models).
- `messages` (required) — array of `{ role, content }`. Roles: `"system"`, `"user"`, `"assistant"`, `"tool"`.
- `stream` (optional, default `false`) — `true` for Server-Sent Events.
- `temperature` (optional, default `1.0`) — `0.0`–`2.0`.
- `max_tokens` (optional) — defaults to the model's default.

**Non-streaming response (200):**

```json
{
  "id": "cmpl-...",
  "object": "chat.completion",
  "created": 1714861200,
  "model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Paris is the capital of France." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 45, "completion_tokens": 12, "total_tokens": 57 }
}
```

**Streaming response (200):**

`Content-Type: text/event-stream`. Each chunk uses `object: "chat.completion.chunk"`:

```
data: {"id":"cmpl-...","object":"chat.completion.chunk","created":1714861200,"model":"meta-llama/Meta-Llama-3.1-70B-Instruct","choices":[{"index":0,"delta":{"role":"assistant","content":"Paris"},"finish_reason":null}]}

data: {"id":"cmpl-...","object":"chat.completion.chunk","created":1714861200,"model":"meta-llama/Meta-Llama-3.1-70B-Instruct","choices":[{"index":0,"delta":{"content":" is"},"finish_reason":null}]}

data: [DONE]
```

**Errors:**

| Status | Code | Reason |
|--------|------|--------|
| 401 | `auth_error` | Missing bearer header. |
| 402 | `billing_error` | Subscription balance exhausted (`balance ≤ 0`). |
| 400 | `invalid_request_error` | Model not in `ALLOWED_MODELS`, missing field, or malformed body. |
| 502 | `upstream_error` | DeepInfra returned an error or unexpected payload. |
| 503 | `upstream_error` | DeepInfra unreachable. |
| 500 | `internal_error` | Internal aeqi-inference error. |

### GET /v1/models

Public. List of currently-available models.

**Response (200):**

```json
{
  "object": "list",
  "data": [
    { "id": "meta-llama/Meta-Llama-3.1-70B-Instruct", "object": "model", "created": 1746403200, "owned_by": "deepinfra" },
    { "id": "meta-llama/Meta-Llama-3.1-8B-Instruct", "object": "model", "created": 1746403200, "owned_by": "deepinfra" }
  ]
}
```

The endpoint also lists planned-but-unrouted models (e.g. `gpt-5`, `claude-sonnet-4-6`) with their advertised providers; calling chat-completions against them returns `400` until the corresponding upstream adapter ships.

### POST /v1/embeddings

Embedding endpoint. **Not yet implemented.** Returns `501 Not Implemented`. Reserved for Phase 2.

## Available Models

The `ALLOWED_MODELS` whitelist in `aeqi-inference/src/upstream/deepinfra.rs`:

| Model | Provider | Input $/M | Output $/M |
|-------|----------|-----------|------------|
| `meta-llama/Meta-Llama-3.1-70B-Instruct` | DeepInfra | $0.59 | $0.79 |
| `meta-llama/Meta-Llama-3.1-8B-Instruct`  | DeepInfra | $0.055 | $0.055 |
| `meta-llama/Meta-Llama-3.3-70B-Instruct` | DeepInfra | $0.59 | $0.79 |
| `mistralai/Mistral-7B-Instruct-v0.3`     | DeepInfra | $0.055 | $0.055 |
| `Qwen/Qwen2.5-72B-Instruct`              | DeepInfra | $0.35 | $0.40 |
| `deepinfra/airoboros-70b`                | DeepInfra | $0.70 | $0.70 |

Prices are pulled from DeepInfra's public pricing page and snapshotted in `pricing_for()`. They are not refreshed automatically — when DeepInfra publishes a change, update both `pricing_for()` and this table together.

OpenAI, Anthropic, and DeepSeek provider adapters are stubs at this time.

## Billing & Cost Accounting

Each Company has an in-memory inference balance, debited on each non-streaming completion. Phase 1 stores this in a stub `BalanceStore`; Phase 1 hardening will persist the balance in platform SQLite and back it with an LRU cache.

**Pricing model:**

- Billed per million tokens (input and output separately).
- `compute_cost_microdollars(model, prompt_tokens, completion_tokens)` produces the debit amount; it returns `0` for any model not in `pricing_for()`.
- Cost is debited on completion of the response. For streaming requests the final usage row is debited after the stream closes; mid-stream debits are not yet implemented.

**Example:**

- Model `meta-llama/Meta-Llama-3.1-70B-Instruct`.
- Input 1000 tokens at $0.59/M = $0.00059.
- Output 500 tokens at $0.79/M = $0.000395.
- Total ~$0.0009 (0.09¢).

**Exhausted balance:** when the cached balance is `≤ 0`, the middleware short-circuits the request with `402 Payment Required`.

To top up, use the dashboard. Programmatic USDC top-up (treasury lane) lands in Phase 2.

## Examples

### Non-streaming

```typescript
const response = await fetch("https://app.aeqi.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "X-Entity": entityId,
  },
  body: JSON.stringify({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    messages: [{ role: "user", content: "Explain quantum computing in two sentences." }],
    stream: false,
  }),
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### Streaming

```typescript
const response = await fetch("https://app.aeqi.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "X-Entity": entityId,
  },
  body: JSON.stringify({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    messages: [{ role: "user", content: "Write a haiku about code." }],
    stream: true,
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const data = line.slice(6);
    if (data === "[DONE]") return;
    const chunk = JSON.parse(data);
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}
```

### List models

```typescript
const response = await fetch("https://app.aeqi.ai/v1/models");
const models = await response.json();
models.data.forEach((m) => console.log(`${m.id} (by ${m.owned_by})`));
```

## OpenAI Compatibility

`POST /v1/chat/completions` is wire-compatible with OpenAI's chat-completions API. Change the base URL and pass a bearer token:

```python
from openai import OpenAI

client = OpenAI(
    api_key="<bearer-token>",
    base_url="https://app.aeqi.ai/v1",
    default_headers={"X-Entity": "<entity_id>"},
)

response = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3.1-70B-Instruct",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)
```

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "<bearer-token>",
  baseURL: "https://app.aeqi.ai/v1",
  defaultHeaders: { "X-Entity": "<entity_id>" },
});

const response = await client.chat.completions.create({
  model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);
```

## Phase 2 Roadmap

- **Real JWT verification** — replace the bearer-presence stub with full signature verification against the platform's `auth_secret`.
- **Persistent balances** — SQLite-backed `inference_balance_cents`, LRU-cached.
- **Treasury lane** — USDC debit from a Company's on-chain treasury.
- **x402 lane** — HTTP 402 + EIP-3009 for pay-per-request inference.
- **Additional providers** — OpenAI, Anthropic, DeepSeek (the model list already advertises them; only routing remains).
- **Embeddings** — `POST /v1/embeddings`.
- **Mid-stream token accounting** — true debit at stream-close based on actual tokens.
