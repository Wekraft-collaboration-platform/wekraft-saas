# API & Webhooks (Beta)

Integrate Wekraft into your existing workflows with our REST API and real-time Webhooks. 

> [!NOTE]
> The Wekraft API is currently in **Public Beta**. Rate limits and endpoint structures are subject to change based on feedback.

## Authentication

Wekraft uses **Personal Access Tokens (PAT)** for API authentication. You can generate a token in your **[User Settings](/dashboard/my-profile)**.

All API requests must include the token in the `Authorization` header:

```http
Authorization: Bearer wk_your_token_here
```

---

## Core Endpoints

### Tasks
- `GET /v1/projects/:slug/tasks` — List all tasks in a project.
- `POST /v1/projects/:slug/tasks` — Create a new task.
- `PATCH /v1/tasks/:id` — Update a task's status or priority.

### Issues
- `GET /v1/projects/:slug/issues` — Retrieve all active issues.
- `POST /v1/projects/:slug/issues` — Report a new bug or incident.

### Sprints
- `GET /v1/projects/:slug/sprints/active` — Get details of the currently running sprint.

---

## Webhooks

Webhooks allow you to receive real-time HTTP POST notifications when events happen in Wekraft.

### Supported Events
- `task.created`
- `task.completed`
- `issue.reported`
- `sprint.started`
- `sprint.ended`

### Payload Example
```json
{
  "event": "task.completed",
  "timestamp": "2026-05-14T12:00:00Z",
  "data": {
    "task_id": "task_123",
    "title": "Fix login bug",
    "completed_by": "user_abc"
  }
}
```

---

## Rate Limits

To ensure platform stability, we enforce the following limits:
- **Free Plan**: 100 requests per hour.
- **Pro Plan**: 5,000 requests per hour.

---

## Next Steps
- [Generate an API Token →](/dashboard/my-profile)
- [View GitHub Integration →](/web/docs/projects#github-integration)
- [Need help? Contact Support →](mailto:support@wekraft.com)
