# REST API

Every operation available through the dashboard is also available through the REST API. The API powers the dashboard, CLI, MCP server, and any custom integration.

## Base URL

| Environment | URL |
|-------------|-----|
| Hosted platform | `https://app.aeqi.ai/api` |
| Self-hosted | `http://localhost:8400/api` |

## Authentication

Pass your secret key as a Bearer token and specify the company:

```bash
curl https://app.aeqi.ai/api/status \
  -H "Authorization: Bearer sk_..." \
  -H "X-Company: your-company-name"
```

See [Authentication](/docs/api/authentication) for key setup.

## Endpoints

### Status

```
GET /api/status
```

Returns budget, active workers, costs, and project info.

### Agents

```
GET    /api/agents                    # List agents
GET    /api/agents/registry           # Agent registry with filters
POST   /api/agents/spawn              # Create agent from template
POST   /api/agents/{id}/retire        # Retire an agent
POST   /api/agents/{id}/activate      # Reactivate an agent
GET    /api/agents/{name}/identity    # Get agent identity
GET    /api/agents/{name}/prompts     # Get agent prompts
```

### Quests

```
GET    /api/quests                    # List quests (filter by status, agent)
POST   /api/quests                    # Create a quest
GET    /api/quests/{id}               # Quest details
PUT    /api/quests/{id}               # Update quest (status, priority)
POST   /api/quests/{id}/close         # Close/complete a quest
```

### Ideas (Memory)

```
GET    /api/ideas                     # List stored ideas
POST   /api/ideas                     # Store a new idea
GET    /api/ideas/search?q=...        # Semantic search
PUT    /api/ideas/{id}                # Update an idea
DELETE /api/ideas/{id}                # Delete an idea
```

### Events

```
GET    /api/events                    # List event handlers
POST   /api/events                    # Create event handler
PUT    /api/events/{id}               # Update (enable/disable)
DELETE /api/events/{id}               # Delete event handler
```

### Sessions

```
GET    /api/sessions                  # List sessions
GET    /api/sessions/{id}/messages    # Session transcript
```

### Chat

```
WebSocket /api/chat/stream            # Real-time chat with agents
POST      /api/chat                   # Send a message
```

## Response Format

All responses return JSON with an `ok` field:

```json
{
  "ok": true,
  "agents": [...]
}
```

Error responses include an `error` field:

```json
{
  "ok": false,
  "error": "description of what went wrong"
}
```
