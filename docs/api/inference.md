# Inference API

aeqi-inference is an OpenAI-compatible API for running inference on multiple LLM providers. It exposes chat completions, embeddings, and model discovery endpoints.

## Base URL

| Environment | URL |
|-------------|-----|
| Hosted | `https://app.aeqi.ai/v1` |
| Self-hosted | `http://127.0.0.1:8400/v1` |

## Authentication

Endpoints require SIWE authentication via JWT token. See [Authentication](/docs/api/authentication) for JWT and token refresh details.

In Phase 1, inference is available through the **subscription lane** — included as part of a company's monthly plan ($25 USD monthly credit).

Treasury and x402 payment lanes (direct USDC debit and HTTP 402 "Pay-Per-Request") are in development.

## Rate Limits

Requests are rate-limited by entity (company or agent).

**Response Headers:**
```
RateLimit-Limit: <requests-per-minute>
RateLimit-Remaining: <requests-remaining>
RateLimit-Reset: <unix-timestamp>
```

Exceeding the limit returns `429 Too Many Requests`.

## Endpoints

### POST /v1/chat/completions

Chat completion endpoint supporting both streaming and non-streaming responses.

**Request:**
```typescript
{
  "model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Request Fields:**
- `model` (required) — Model identifier from the [Available Models](#available-models) list.
- `messages` (required) — Array of message objects with `role` and `content`. Roles: `"system"`, `"user"`, `"assistant"`, `"tool"`.
- `stream` (optional, default `false`) — Set to `true` for Server-Sent Events (SSE) streaming response.
- `temperature` (optional, default `1.0`) — Sampling temperature (0.0–2.0). Lower values = more deterministic.
- `max_tokens` (optional) — Maximum tokens to generate. If omitted, the model uses its default.

**Non-Streaming Response (200 OK):**
```json
{
  "id": "cmpl-8hPn...",
  "object": "text_completion",
  "created": 1714861200,
  "model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Paris is the capital of France."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 12,
    "total_tokens": 57
  }
}
```

**Streaming Response (200 OK):**

When `stream: true`, the response is Server-Sent Events (SSE) with `Content-Type: text/event-stream`. Each chunk is a `ChatCompletionChunk`:

```
data: {"id":"cmpl-8hPn...","object":"text_completion","created":1714861200,"model":"meta-llama/Meta-Llama-3.1-70B-Instruct","choices":[{"index":0,"delta":{"role":"assistant","content":"Paris"},"finish_reason":null}]}

data: {"id":"cmpl-8hPn...","object":"text_completion","created":1714861200,"model":"meta-llama/Meta-Llama-3.1-70B-Instruct","choices":[{"index":0,"delta":{"content":" is"},"finish_reason":null}]}

data: [DONE]
```

The stream ends with `data: [DONE]`.

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 401 | `auth_error` | Missing or invalid JWT token. |
| 402 | `billing_error` | Insufficient balance for inference quota. |
| 400 | `invalid_request_error` | Model not whitelisted, missing required fields, or invalid parameters. |
| 502 | `upstream_error` | Upstream provider error (model not available, rate limit, etc.). |
| 503 | `upstream_error` | Upstream provider temporarily unavailable. |
| 500 | `internal_error` | Internal aeqi server error. |

### GET /v1/models

List available models and their metadata.

**Response (200 OK):**
```json
{
  "object": "list",
  "data": [
    {
      "id": "meta-llama/Meta-Llama-3.1-70B-Instruct",
      "object": "model",
      "created": 1746403200,
      "owned_by": "deepinfra"
    },
    {
      "id": "meta-llama/Meta-Llama-3.1-8B-Instruct",
      "object": "model",
      "created": 1746403200,
      "owned_by": "deepinfra"
    }
  ]
}
```

### POST /v1/embeddings

Embedding endpoint. **Not yet implemented (Phase 2).**

Returns `501 Not Implemented`.

## Available Models

Phase 1 supports the following DeepInfra models:

| Model | Provider | Input $/M | Output $/M |
|-------|----------|-----------|-----------|
| `meta-llama/Meta-Llama-3.1-70B-Instruct` | DeepInfra | $0.59 | $0.79 |
| `meta-llama/Meta-Llama-3.1-8B-Instruct` | DeepInfra | $0.055 | $0.055 |
| `meta-llama/Meta-Llama-3.3-70B-Instruct` | DeepInfra | $0.59 | $0.79 |
| `mistralai/Mistral-7B-Instruct-v0.3` | DeepInfra | $0.055 | $0.055 |
| `Qwen/Qwen2.5-72B-Instruct` | DeepInfra | $0.35 | $0.40 |
| `deepinfra/airoboros-70b` | DeepInfra | $0.70 | $0.70 |

Additional providers (OpenAI, Anthropic, DeepSeek) are in development.

## Billing & Cost Accounting

Every workspace subscription includes pooled inference credit. Usage is debited from this balance in real time.

**Pricing Model:**
- Billed per million tokens (input and output separately).
- Prices vary by model and provider.
- Cost is debited immediately on completion for non-streaming requests.
- For streaming requests in Phase 1, cost is estimated pre-call; Phase 2 will reconcile with actual token counts.

**Example Cost Calculation:**
- Model: `meta-llama/Meta-Llama-3.1-70B-Instruct`
- Input: 1000 tokens at $0.59/M = $0.00059
- Output: 500 tokens at $0.79/M = $0.000395
- Total: ~$0.0009 (0.09 cents)

**Exceeding Quota:**
When the balance reaches zero, further inference requests return `402 Payment Required` with the message `"insufficient balance"`.

To add more balance, top up your account's Treasury through the dashboard (future integration with programmatic USDC payment pending).

## Examples

### Non-Streaming Chat Completion

```typescript
const response = await fetch("https://app.aeqi.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}` // SIWE JWT
  },
  body: JSON.stringify({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    messages: [
      {
        role: "user",
        content: "Explain quantum computing in two sentences."
      }
    ],
    stream: false
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### Streaming Chat Completion

```typescript
const response = await fetch("https://app.aeqi.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    messages: [
      {
        role: "user",
        content: "Write a haiku about code."
      }
    ],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6);
      if (data === "[DONE]") {
        console.log("Stream complete.");
        break;
      }
      const chunk = JSON.parse(data);
      const content = chunk.choices[0]?.delta?.content || "";
      process.stdout.write(content);
    }
  }
}
```

### List Available Models

```typescript
const response = await fetch("https://app.aeqi.ai/v1/models", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});

const models = await response.json();
models.data.forEach(model => {
  console.log(`${model.id} (by ${model.owned_by})`);
});
```

## OpenAI Compatibility

The aeqi-inference API is fully compatible with OpenAI's `/v1/chat/completions` API. You can use existing OpenAI client libraries by changing the base URL:

**Python (openai package):**
```python
from openai import OpenAI

client = OpenAI(
    api_key="<your-jwt-token>",
    base_url="https://app.aeqi.ai/v1"
)

response = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3.1-70B-Instruct",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

**JavaScript (openai package):**
```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "<your-jwt-token>",
  baseURL: "https://app.aeqi.ai/v1"
});

const response = await client.chat.completions.create({
  model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
  messages: [
    { role: "user", content: "Hello!" }
  ]
});

console.log(response.choices[0].message.content);
```

## Phase 2 Roadmap

- **Embeddings:** Full text-embedding model support via `POST /v1/embeddings`.
- **Treasury Lane:** Direct USDC debit from company treasury via smart contract signatures.
- **x402 Lane:** HTTP 402 + EIP-3009 USDC transfer for pay-per-request inference.
- **Additional Providers:** OpenAI, Anthropic, DeepSeek model routing.
- **Persistent Billing:** SQLite-backed balance tracking and invoice generation.
- **Advanced Parameters:** Vision models, function calling, JSON mode, tool use.
