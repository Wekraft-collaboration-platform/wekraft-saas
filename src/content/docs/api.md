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

### Unauthenticated Request Error
If you omit the token or supply an invalid token, the API returns a `401 Unauthorized` response:
```json
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "The provided API token is invalid or has expired."
  }
}
```

---

## Core Endpoints

The base URL for all API requests is:
`https://api.wekraft.xyz`

### Tasks

#### List Project Tasks
`GET /v1/projects/:slug/tasks`

Retrieve a paginated list of tasks belonging to a specific project.

**Query Parameters:**
- `status` (string, optional) - Filter tasks by status (e.g. `todo`, `in_progress`, `done`).
- `page` (number, optional) - The page number to retrieve. Default is `1`.
- `limit` (number, optional) - Number of results per page. Default is `20`. Max is `100`.

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_8a7d2c1",
      "title": "Implement OAuth2 login flow",
      "description": "Add support for Google and GitHub authentication",
      "status": "in_progress",
      "priority": "high",
      "assignee": {
        "id": "usr_91238",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "created_at": "2026-05-14T10:15:30Z",
      "updated_at": "2026-05-15T14:22:10Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "has_more": true
  }
}
```

#### Create a Task
`POST /v1/projects/:slug/tasks`

Create a new task within a project.

**Request Body (`application/json`):**
- `title` (string, required) - The title of the task.
- `description` (string, optional) - Detailed description.
- `status` (string, optional) - Defaults to `todo`.
- `priority` (string, optional) - One of `low`, `medium`, `high`, `urgent`. Defaults to `medium`.
- `assignee_id` (string, optional) - User ID of the assignee.

**Request Example:**
```json
{
  "title": "Refactor navigation component",
  "description": "Optimize layout for mobile responsiveness",
  "priority": "high"
}
```

**Response Example (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "task_9c8b3d2",
    "title": "Refactor navigation component",
    "description": "Optimize layout for mobile responsiveness",
    "status": "todo",
    "priority": "high",
    "assignee": null,
    "created_at": "2026-05-29T13:45:00Z",
    "updated_at": "2026-05-29T13:45:00Z"
  }
}
```

#### Update a Task
`PATCH /v1/tasks/:id`

Modify an existing task.

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "task_9c8b3d2",
    "status": "in_progress",
    "updated_at": "2026-05-29T14:10:00Z"
  }
}
```

---

### Issues

#### Retrieve Active Issues
`GET /v1/projects/:slug/issues`

Retrieve all active issues (bugs, user reports, incident logs) for the specified project.

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "issue_3f81e",
      "title": "Memory leak on dashboard load",
      "severity": "critical",
      "source": "client_error",
      "status": "open",
      "created_at": "2026-05-28T09:00:00Z"
    }
  ]
}
```

#### Report a New Issue
`POST /v1/projects/:slug/issues`

Submit an issue. Ideal for integrating automated error reporting from external crash monitors (e.g. Sentry).

**Request Body:**
- `title` (string, required) - Issue summary.
- `description` (string, required) - Error trace or description.
- `severity` (string, optional) - `low`, `medium`, `high`, `critical`. Defaults to `medium`.

---

### Sprints

#### Get Active Sprint
`GET /v1/projects/:slug/sprints/active`

Fetch information about the current sprint, including goals, start/end dates, and associated tasks.

---

## Webhooks

Webhooks allow you to receive real-time HTTP POST notifications when events happen in Wekraft.

### Supported Events
- `task.created`
- `task.completed`
- `issue.reported`
- `sprint.started`
- `sprint.ended`

### Webhook Signatures (Security)
To ensure webhook payloads originate from Wekraft, each request contains an `X-Wekraft-Signature` header calculated using an HMAC hex digest of the request body with your webhook secret.

**Verification Example (Node.js):**
```javascript
const crypto = require('crypto');

function verifyWebhook(secret, payload, signature) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
```

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

To ensure platform stability, we enforce the following limits based on your subscription plan:

| Plan | Limit | Header |
| :--- | :--- | :--- |
| **Free Plan** | 100 requests / hour | `X-RateLimit-Limit: 100` |
| **Pro Plan** | 5,000 requests / hour | `X-RateLimit-Limit: 5000` |

If you exceed these limits, the API returns a `429 Too Many Requests` response:
```json
{
  "success": false,
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Please slow down and try again later."
  }
}
```

---

## Next Steps
- [Generate an API Token →](/dashboard/my-profile)
- [View GitHub Integration →](/web/docs/projects#github-integration)
- [Need help? Contact Support →](https://mail.google.com/mail/?view=cm&fs=1&to=support@wekraft.xyz)
