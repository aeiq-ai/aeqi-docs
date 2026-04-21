# REST API

Every dashboard operation is available over REST. The same API powers the dashboard, CLI, and MCP server.

## Base URL

| Environment | URL |
|-------------|-----|
| Hosted | `https://app.aeqi.ai/api` |
| Self-hosted | `http://127.0.0.1:8400/api` |

## Authentication

```bash
curl https://app.aeqi.ai/api/status \
  -H "Authorization: Bearer sk_..." \
  -H "X-Company: your-company-name"
```

See [Authentication](/docs/api/authentication).

## Endpoints

### Status

```
GET /api/status
```

Budget, active workers, costs, and project info.

### Agents

```
GET    /api/agents                    List agents
GET    /api/agents/registry           Registry with filters
POST   /api/agents/spawn              Create from template
POST   /api/agents/{id}/retire        Retire
POST   /api/agents/{id}/activate      Reactivate
GET    /api/agents/{name}/identity    Get identity
GET    /api/agents/{name}/prompts     Get prompts
```

### Quests

```
GET    /api/quests                    List (filter by status, agent)
POST   /api/quests                    Create
GET    /api/quests/{id}               Details
PUT    /api/quests/{id}               Update (status, priority)
POST   /api/quests/{id}/close         Close
```

### Ideas

```
GET    /api/ideas                     List
POST   /api/ideas                     Store
GET    /api/ideas/search?q=...        Search
PUT    /api/ideas/{id}                Update
DELETE /api/ideas/{id}                Delete
```

### Events

```
GET    /api/events                    List handlers
POST   /api/events                    Create handler
PUT    /api/events/{id}               Enable/disable/update
DELETE /api/events/{id}               Delete
```

### Sessions

```
GET    /api/sessions                  List
GET    /api/sessions/{id}/messages    Transcript
```

### Chat

```
POST      /api/chat                   Send a message
WebSocket /api/chat/stream            Stream tokens and tool calls
```

## Response Shape

Success:

```json
{ "ok": true, "agents": [ ... ] }
```

Error:

```json
{ "ok": false, "error": "description" }
```

## Next Steps

- [Authentication](/docs/api/authentication) — keys and headers
- [MCP Integration](/docs/api/mcp) — same operations via MCP
- [Concepts](/docs/concepts/agents) — primitive definitions
