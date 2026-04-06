<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

Docker image 
```bash
docker build -t eyesight-backend . &&  docker run -p 3001:3001 --env-file .env eyesight-backend 
                                              
```

or
```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


# Eyesight Backend API Documentation

## Base URL

```
http://localhost:3001
```

## Authentication

Protected endpoints require a JWT Bearer token. Tokens are valid for **1 day**.

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints

### POST /auth/login

Authenticate and receive a JWT token.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response**
```json
{
  "access_token": "<jwt>"
}
```

### POST /auth/register

Register a new user.

**Request Body**
```json
{
  "email": "user@example.com",
  "name": "Alice",
  "password": "secret"
}
```

**Response:** Created `User` object.

### GET /

Health check. Returns `"Hello World!"`.

### GET /status

Database connectivity status.

---

## Protected Endpoints

All routes below require `Authorization: Bearer <token>`.

---

### Users `/users`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Authenticated user's profile |
| GET | `/users` | All users |
| GET | `/users/:id` | User by ID |
| GET | `/users/email/:email` | User by email |
| POST | `/users` | Create a user |
| PUT | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |

**Create / Update Request Body**
```json
{
  "email": "user@example.com",
  "name": "Alice",
  "password": "secret"
}
```
All fields are optional on update. Password is hashed automatically.

---

### Chats `/chats`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chats` | Create a chat |
| GET | `/chats` | All chats (desc order) |
| GET | `/chats/:id` | Chat by ID (with messages) |
| GET | `/chats/user/:userId` | Chats for a user |
| PUT | `/chats/:id` | Update chat title |
| DELETE | `/chats/:id` | Delete a chat |
| POST | `/chats/:id/messages` | Add a message to a chat |
| GET | `/chats/:id/messages` | Messages in a chat (asc order) |

**Create Chat Request Body**
```json
{
  "userId": 1,
  "title": "Consultation #1"
}
```

**Add Message to Chat Request Body**
```json
{
  "content": "Hello"
}
```

---

### Messages `/messages`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/messages` | Create a message |
| GET | `/messages` | All messages (filter by `?chatId=<id>`) |
| GET | `/messages/:id` | Message by ID |
| PUT | `/messages/:id` | Update message content |
| DELETE | `/messages/:id` | Delete a message |

**Create Message Request Body**
```json
{
  "chatId": 1,
  "content": "Hello"
}
```

---

### Chatbot `/chatbot/message` — SSE Streaming

Send a fundus image with patient metadata and stream an AI analysis response.

**Method:** `POST /chatbot/message`  
**Content-Type:** `multipart/form-data`  
**Response:** `text/event-stream` (Server-Sent Events)

**Form Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chat_id` | string (integer) | Yes | ID of an existing chat owned by the user |
| `prompt` | string | Yes | User's question or instruction |
| `age` | string (number) | No | Patient age |
| `gender` | string | No | Patient gender |
| `fundus_right` | File | No | Right eye fundus image |
| `fundus_left` | File | No | Left eye fundus image |

**SSE Event Types**

Each event is a JSON line: `data: <json>\n\n`

| Event `type` | When | Payload |
|---|---|---|
| `dr_result` | After DR model returns | `{ type, data: { prediction, label, route, raw_outputs } }` |
| `ocular_result` | After Ocular model returns | `{ type, data: { prediction, label, raw_outputs } }` |
| `delta` | LLM token stream | `{ type, delta: "<token>" }` |
| `error` | Any error during processing | `{ type, message: "<error>" }` |
| `done` | Stream complete | `{ type }` |

Stream ends with a `[DONE]` sentinel line.

**Example client (fetch)**
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
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      const event = JSON.parse(line.slice(6));
      console.log(event);
    }
  }
}
```

---

## Data Models

### User
| Field | Type |
|-------|------|
| `id` | number |
| `email` | string (unique) |
| `name` | string \| null |
| `password` | string (bcrypt hash) |
| `createdAt` | timestamp |
| `updatedAt` | timestamp |
| `chats` | Chat[] |

### Chat
| Field | Type |
|-------|------|
| `id` | number |
| `userId` | number |
| `title` | string \| null |
| `createdAt` | timestamp |
| `updatedAt` | timestamp |
| `user` | User |
| `messages` | Message[] |

### Message
| Field | Type |
|-------|------|
| `id` | number |
| `chatId` | number |
| `content` | string \| null |
| `is_belonging_to_user` | boolean |
| `createdAt` | timestamp |
| `updatedAt` | timestamp |
| `chat` | Chat |
| `attachment` | Attachment \| null |

### Attachment
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | |
| `messageId` | number (1:1 with Message) | |
| `content` | string \| null | JSON string of model results or patient info |
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

Allowed origins: `http://localhost:3000`, `http://0.0.0.0:3000`, `https://eyesight.app`, `https://admin.eyesight.app`. Credentials are enabled.

