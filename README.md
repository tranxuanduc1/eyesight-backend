# Eyesight Backend

NestJS (v11) REST API with TypeScript, Prisma ORM (v7), and PostgreSQL. Provides user management, JWT authentication, chat, messaging, and an ophthalmology chatbot with SSE streaming.

Runs on port **3001**.

---

## Project Setup

**Docker (recommended)**
```bash
docker compose up
# Postgres on 5432, Adminer on 8080, backend on 3001
```

**Local**
```bash
npm install
npm run start:dev   # watch mode
npm run build       # production build
npm run start:prod
```

**Prisma**
```bash
npx prisma generate          # regenerate client
npx prisma migrate dev       # apply migrations (dev)
npx prisma migrate deploy    # apply migrations (prod)
```

**Tests**
```bash
npm test            # unit tests
npm run test:e2e    # e2e tests
npm run test:cov    # coverage
```

---

## Environment Variables

See `.example.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 3001) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `DR_MODEL_SERVICE_URL` | Diabetic retinopathy ML service URL |
| `OCULAR_MODEL_SERVICE_URL` | Ocular disease ML service URL |
| `LLM_SERVICE_URL` | LLM streaming service URL |

---

## Base URL

```
http://localhost:3001
```

---

## Authentication

Protected endpoints require a JWT Bearer token (valid for **1 day**).

```
Authorization: Bearer <access_token>
```

### POST /auth/login

**Request**
```json
{ "email": "user@example.com", "password": "secret" }
```

**Response**
```json
{ "access_token": "<jwt>" }
```

### POST /auth/register

**Request**
```json
{ "email": "user@example.com", "name": "Alice", "password": "secret" }
```

**Response** — created `User` object.

---

## Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check — returns `"Hello World!"` |
| GET | `/status` | Database connectivity check |

---

## Users `/users`

All routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | Any | Authenticated user's profile |
| GET | `/users` | Any | All users (with chats) |
| GET | `/users/:id` | Any | User by ID (with chats) |
| GET | `/users/email/:email` | Any | User by email (with chats) |
| GET | `/users/analytics` | ADMIN | User registration analytics |
| POST | `/users` | Any | Create a user |
| PATCH | `/users/:id` | Owner or ADMIN | Partially update a user |
| DELETE | `/users/:id` | Owner or ADMIN | Delete a user |

**Create body**
```json
{ "email": "user@example.com", "name": "Alice", "password": "secret" }
```

**PATCH body** — all fields optional, password is bcrypt-hashed automatically:
```json
{ "email": "user@example.com", "name": "Alice", "password": "secret" }
```

**GET /users/analytics query params**

| Param | Required | Description |
|-------|----------|-------------|
| `start` | Yes | Start date (YYYY-MM-DD) |
| `end` | Yes | End date (YYYY-MM-DD) |
| `interval` | Yes | `day`, `week`, or `month` |

---

## Chats `/chats`

All routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/chats` | Any | Create a chat |
| GET | `/chats` | Any | All chats |
| GET | `/chats/:id` | Any | Chat by ID (with messages + attachments) |
| GET | `/chats/user/:userId` | Any | Chats for a user |
| PUT | `/chats/:id` | Any | Update chat title |
| DELETE | `/chats/:id` | Owner or ADMIN | Delete a chat |
| POST | `/chats/:id/messages` | Any | Add a message to a chat |
| GET | `/chats/:id/messages` | Any | Messages in a chat (ascending by `createdAt`) |

**Create Chat body**
```json
{ "userId": 1, "title": "Consultation #1" }
```

**Add Message body**
```json
{ "content": "Hello" }
```

### GET /chats/:id — Response

```json
{
  "id": 1,
  "userId": 2,
  "title": "Consultation #1",
  "createdAt": "2026-04-08T10:00:00.000Z",
  "updatedAt": "2026-04-08T10:00:00.000Z",
  "user": {
    "id": 2,
    "email": "alice@example.com",
    "name": "Alice",
    "password": "$2b$10$...",
    "createdAt": "2026-04-08T09:00:00.000Z",
    "updatedAt": "2026-04-08T09:00:00.000Z"
  },
  "messages": [
    {
      "id": 10,
      "chatId": 1,
      "content": "What does this fundus image show?",
      "is_belonging_to_user": true,
      "createdAt": "2026-04-08T10:01:00.000Z",
      "updatedAt": "2026-04-08T10:01:00.000Z",
      "attachments": [
        {
          "id": 5,
          "messageId": 10,
          "content": "{\"age\":45,\"gender\":\"male\"}",
          "image": "uploads/fundus/right_1234.jpg,uploads/fundus/left_1234.jpg",
          "createdAt": "2026-04-08T10:01:00.000Z",
          "updatedAt": "2026-04-08T10:01:00.000Z"
        }
      ]
    },
    {
      "id": 11,
      "chatId": 1,
      "content": "Based on the analysis...",
      "is_belonging_to_user": false,
      "createdAt": "2026-04-08T10:02:00.000Z",
      "updatedAt": "2026-04-08T10:02:00.000Z",
      "attachments": []
    }
  ]
}
```

### GET /chats/:id/messages — Response

```json
[
  {
    "id": 10,
    "chatId": 1,
    "content": "What does this fundus image show?",
    "is_belonging_to_user": true,
    "createdAt": "2026-04-08T10:01:00.000Z",
    "updatedAt": "2026-04-08T10:01:00.000Z",
    "attachments": [
      {
        "id": 5,
        "messageId": 10,
        "content": "{\"age\":45,\"gender\":\"male\"}",
        "image": "uploads/fundus/right_1234.jpg,uploads/fundus/left_1234.jpg",
        "createdAt": "2026-04-08T10:01:00.000Z",
        "updatedAt": "2026-04-08T10:01:00.000Z"
      }
    ]
  }
]
```

---

## Messages `/messages`

All routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/messages` | Create a message |
| GET | `/messages` | All messages (filter with `?chatId=<id>`) |
| GET | `/messages/:id` | Message by ID |
| PUT | `/messages/:id` | Update message content |
| DELETE | `/messages/:id` | Delete a message |

**Create Message body**
```json
{ "chatId": 1, "content": "Hello" }
```

### GET /messages/:id — Response

```json
{
  "id": 10,
  "chatId": 1,
  "content": "What does this fundus image show?",
  "is_belonging_to_user": true,
  "createdAt": "2026-04-08T10:01:00.000Z",
  "updatedAt": "2026-04-08T10:01:00.000Z",
  "chat": {
    "id": 1,
    "userId": 2,
    "title": "Consultation #1",
    "createdAt": "2026-04-08T10:00:00.000Z",
    "updatedAt": "2026-04-08T10:00:00.000Z",
    "user": {
      "id": 2,
      "email": "alice@example.com",
      "name": "Alice",
      "password": "$2b$10$...",
      "createdAt": "2026-04-08T09:00:00.000Z",
      "updatedAt": "2026-04-08T09:00:00.000Z"
    }
  },
  "attachments": [
    {
      "id": 5,
      "messageId": 10,
      "content": "{\"age\":45,\"gender\":\"male\"}",
      "image": "uploads/fundus/right_1234.jpg",
      "createdAt": "2026-04-08T10:01:00.000Z",
      "updatedAt": "2026-04-08T10:01:00.000Z"
    }
  ]
}
```

### GET /messages?chatId=1 — Response

Same shape as above but returns an array `[...]`.

---

## Attachments `/attachments`

All routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/attachments` | Create an attachment |
| GET | `/attachments` | All attachments (filter with `?messageId=<id>`) |
| GET | `/attachments/:id` | Attachment by ID |
| PUT | `/attachments/:id` | Update attachment |
| DELETE | `/attachments/:id` | Delete an attachment |

**Create body**
```json
{ "messageId": 10, "content": "{\"key\":\"value\"}", "image": "path/to/image.jpg" }
```

---

## Chatbot `/chatbot/message` — SSE Streaming

Send a fundus image with patient metadata and stream an AI analysis response.

**Method:** `POST /chatbot/message`  
**Content-Type:** `multipart/form-data`  
**Response:** `text/event-stream` (Server-Sent Events)  
**Auth:** Required

**Form Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chat_id` | string (integer) | Yes | ID of an existing chat |
| `prompt` | string | Yes | User's question or instruction |
| `age` | string (number) | No | Patient age |
| `gender` | string | No | Patient gender |
| `fundus_right` | File | No | Right eye fundus image |
| `fundus_left` | File | No | Left eye fundus image |

> **Note:** If `age` or `gender` is provided, at least one fundus image (`fundus_right` or `fundus_left`) must also be included. Returns `400` otherwise.

**SSE Event Types**

Each event: `data: <json>\n\n`

| `type` | When emitted | Payload |
|--------|-------------|---------|
| `dr_result` | After DR model returns | `{ type, data: { prediction, label, route, raw_outputs } }` |
| `ocular_result` | After Ocular model returns | `{ type, data: { prediction, label, raw_outputs } }` |
| `delta` | Each LLM token | `{ type, delta: "<token>" }` |
| `error` | Any processing error | `{ type, message: "<error>" }` |
| `done` | Stream complete | `{ type }` |

Stream ends with a `data: [DONE]` sentinel line.

**Example client**
```js
const form = new FormData();
form.append('chat_id', '42');
form.append('prompt', 'What does this fundus image show?');
form.append('fundus_right', imageFile);

const res = await fetch('http://localhost:3001/chatbot/message', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});

const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  for (const line of decoder.decode(value).split('\n')) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      console.log(JSON.parse(line.slice(6)));
    }
  }
}
```

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `email` | string (unique) | |
| `name` | string \| null | |
| `password` | string (bcrypt hash) | |
| `role` | `USER` \| `ADMIN` | default `USER` |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Chat
| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `userId` | number | cascade deletes on user delete |
| `title` | string \| null | |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Message
| Field | Type |
|-------|------|
| `id` | number |
| `chatId` | number |
| `content` | string \| null |
| `is_belonging_to_user` | boolean |
| `createdAt` | timestamp |
| `updatedAt` | timestamp |

### Attachment
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | |
| `messageId` | number | 1:1 with Message |
| `content` | string \| null | JSON string (model results or patient info) |
| `image` | string \| null | Comma-separated file paths of fundus images |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token or wrong credentials) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## CORS

Allowed origins: `http://localhost:3000`, `http://0.0.0.0:3000`, `https://eyesight.app`, `https://admin.eyesight.app`. Credentials enabled.
