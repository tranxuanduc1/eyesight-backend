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


Now I'll create a comprehensive API documentation for this Eyesight backend project.

# Eyesight Backend API Documentation

This document provides a comprehensive overview of the API endpoints available in the Eyesight backend system. The API is built with NestJS and includes user management, authentication, chat functionality, and messaging capabilities.

## Base URL
```
http://localhost:3001
```

## Authentication
Most endpoints require authentication using JWT tokens. After logging in, include the token in the Authorization header as follows:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### Public Routes

#### Authentication (`/auth`)

**POST /auth/login**
- Description: Authenticate a user and return a JWT token
- Request Body:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- Response:
  ```json
  {
    "access_token": "string"
  }
  ```
- Status Codes:
  - 200: Successful login
  - 401: Invalid credentials

**POST /auth/register**
- Description: Register a new user
- Request Body:
  ```json
  {
    "email": "string",
    "name": "string",
    "password": "string"
  }
  ```
- Response: Returns the created user object
- Status Codes:
  - 200: Successfully registered
  - 401: Email already in use

#### Application Information ([/](file:///home/duc/Work/eyesight/backend/Dockerfile))

**GET /**
- Description: Get a welcome message
- Response: `"Hello World!"`

**GET /status**
- Description: Check database connection status
- Response: Status message indicating database connectivity

### Protected Routes (Require JWT Authentication)

#### Users (`/users`)

**POST /users**
- Description: Create a new user
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "email": "string",
    "name": "string",
    "password": "string"
  }
  ```
- Response: Created user object
- Status Codes:
  - 201: User created successfully

**GET /users/me**
- Description: Get the authenticated user's profile
- Headers: `Authorization: Bearer <token>`
- Response: User object with their details

**GET /users/:id**
- Description: Get a user by ID
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Response: User object

**GET /users/email/:email**
- Description: Get a user by email
- Parameters: `email` (string)
- Headers: `Authorization: Bearer <token>`
- Response: User object

**GET /users**
- Description: Get all users
- Headers: `Authorization: Bearer <token>`
- Response: Array of user objects

**PUT /users/:id**
- Description: Update a user
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "email": "string",
    "name": "string",
    "password": "string"
  }
  ```
- Response: Updated user object

**DELETE /users/:id**
- Description: Delete a user
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Response: Deleted user object

#### Chats (`/chats`)

**POST /chats**
- Description: Create a new chat
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "userId": 1,
    "title": "string (optional)"
  }
  ```
- Response: Created chat object

**GET /chats/:id**
- Description: Get a chat by ID
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Response: Chat object

**GET /chats**
- Description: Get all chats
- Headers: `Authorization: Bearer <token>`
- Response: Array of chat objects

**GET /chats/user/:userId**
- Description: Get all chats for a specific user
- Parameters: `userId` (number)
- Headers: `Authorization: Bearer <token>`
- Response: Array of chat objects

**PUT /chats/:id**
- Description: Update a chat
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "title": "string"
  }
  ```
- Response: Updated chat object

**DELETE /chats/:id**
- Description: Delete a chat
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Response: Deleted chat object

**POST /chats/:id/messages**
- Description: Add a message to a chat
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "content": "string (optional)",
    "messageType": "TEXT | IMAGE | FILE",
    "mediaUrl": "string (optional)",
    "mediaType": "string (optional)",
    "metadata": "object (optional)"
  }
  ```
- Response: Created message object

**GET /chats/:id/messages**
- Description: Get all messages for a specific chat
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Response: Array of message objects

#### Messages (`/messages`)

**POST /messages**
- Description: Create a new message
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "chatId": 1,
    "content": "string (optional)",
    "messageType": "TEXT | IMAGE | FILE",
    "mediaUrl": "string (optional)",
    "mediaType": "string (optional)",
    "metadata": "object (optional)"
  }
  ```
- Response: Created message object

**GET /messages/:id**
- Description: Get a message by ID
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Response: Message object

**GET /messages**
- Description: Get all messages or messages for a specific chat
- Headers: `Authorization: Bearer <token>`
- Query Parameters: `chatId` (number, optional)
- Response: Array of message objects

**PUT /messages/:id**
- Description: Update a message
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "content": "string (optional)",
    "messageType": "TEXT | IMAGE | FILE",
    "mediaUrl": "string (optional)",
    "mediaType": "string (optional)",
    "metadata": "object (optional)"
  }
  ```
- Response: Updated message object

**DELETE /messages/:id**
- Description: Delete a message
- Parameters: `id` (number)
- Headers: `Authorization: Bearer <token>`
- Response: Deleted message object

#### Chatbot (`/chatbot`)

**POST /chatbot**
- Description: Create a chat with the chatbot
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```json
  {
    "question": "string"
  }
  ```
- Response: Object with response from the chatbot

## Data Models

### User
- `id`: number (auto-generated)
- `email`: string (unique)
- `name`: string (optional)
- `password`: string (hashed)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `chats`: array of Chat objects

### Chat
- `id`: number (auto-generated)
- `userId`: number (foreign key to User)
- `title`: string (optional)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `user`: User object
- `messages`: array of Message objects

### Message
- `id`: number (auto-generated)
- `chatId`: number (foreign key to Chat)
- `content`: string (optional)
- `messageType`: enum ('TEXT', 'IMAGE', 'FILE')
- `mediaUrl`: string (optional)
- `mediaType`: string (optional)
- `metadata`: JSON object (optional)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `chat`: Chat object

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error responses typically include a descriptive message explaining the issue.

## Security Considerations

- All sensitive routes are protected with JWT authentication
- Passwords are hashed using bcrypt
- User passwords are never returned in API responses
- Authentication tokens must be included in requests to protected endpoints

