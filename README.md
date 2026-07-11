# Realtime Chat App

A full-stack real-time chat application built with **React (Vite)**, **Node.js / Express**, **Socket.io**, and **MongoDB Atlas (Mongoose)**. Messages sent by any connected user appear instantly for every other connected user, and the full chat history is persisted so a page refresh never loses messages.

No Firebase, no polling, no Supabase, no third-party realtime services — realtime delivery is Socket.io only.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [MongoDB Atlas Setup](#mongodb-atlas-setup)
8. [Running the App](#running-the-app)
9. [Socket Flow](#socket-flow)
10. [API Documentation](#api-documentation)
11. [Error Handling](#error-handling)
12. [Testing Instructions](#testing-instructions)
13. [Deployment](#deployment)
14. [Design Decisions](#design-decisions)
15. [Assumptions](#assumptions)
16. [Future Improvements](#future-improvements)
17. [Screenshots](#screenshots)

---

## Features

- Send and receive messages instantly across every connected client
- Full chat history served via REST and persisted in MongoDB (a refresh never loses messages)
- Timestamps on every message (relative "today" formatting, date + time otherwise)
- Clean, custom, responsive UI (desktop and mobile) — no UI template/kit used
- Automatic Socket.io reconnection with a live connection indicator
- Centralized error handling for network errors, database errors, and validation errors
- Enter to send, Shift+Enter for a new line, whitespace trimming, empty-message rejection
- Send button (and Enter key) disabled while a message is in flight

## Tech Stack

**Frontend:** React 19, Vite, React Router, Axios, Socket.io-client, TailwindCSS
**Backend:** Node.js, Express, Socket.io, Mongoose, CORS, dotenv, Morgan
**Database:** MongoDB Atlas

## Architecture

```
┌─────────────────┐        REST (Axios)        ┌──────────────────┐        ┌───────────────┐
│                  │ ─────────────────────────► │                  │        │               │
│  React + Vite    │                             │  Express API     │ ─────► │  MongoDB Atlas │
│  (client/)       │ ◄───────────────────────── │  (server/)       │ ◄───── │  (Mongoose)    │
│                  │      Socket.io (both ways)  │                  │        │               │
└─────────────────┘ ◄═══════════════════════════┤ Socket.io Server  │        └───────────────┘
                                                  └──────────────────┘
```

The backend follows an **MVC-style layered architecture**: routes → controllers → services → models, with cross-cutting concerns (validation, error handling, async wrapping) isolated in `middlewares/` and `utils/`. The Socket.io handlers reuse the exact same service layer as the REST controller, so there is a single source of truth for validation and persistence regardless of which path created a message.

## Folder Structure

```
chatbot/
├── package.json                 # root workspace scripts (npm install / npm run dev)
├── render.yaml                   # Render Blueprint for one-click backend deployment
├── server/
│   ├── config/
│   │   ├── env.js                # loads & validates environment variables
│   │   └── db.js                 # MongoDB/Mongoose connection
│   ├── controllers/
│   │   └── message.controller.js # REST request handlers
│   ├── routes/
│   │   └── message.routes.js     # /api/messages routes
│   ├── models/
│   │   └── message.model.js      # Mongoose Message schema
│   ├── services/
│   │   └── message.service.js    # business logic shared by REST + sockets
│   ├── socket/
│   │   ├── index.js              # io instance accessor (getIO/initSocket)
│   │   └── socketHandlers.js     # connection/send_message/disconnect handlers
│   ├── middlewares/
│   │   ├── asyncHandler.js       # wraps async route handlers
│   │   ├── notFound.js           # 404 handler
│   │   └── errorHandler.js       # centralized error handler
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── logger.js
│   │   └── validateMessagePayload.js
│   ├── app.js                    # Express app (middleware + routes)
│   ├── server.js                 # HTTP + Socket.io bootstrap
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   ├── components/           # Header, MessageList, MessageBubble, ChatInput, ...
    │   ├── pages/                 # ChatPage, NotFoundPage
    │   ├── hooks/                 # useSocket, useMessages
    │   ├── services/              # api.js (Axios), socket.js (Socket.io-client)
    │   ├── context/                # SocketContext (connection lifecycle)
    │   ├── layouts/                # MainLayout
    │   ├── utils/                  # formatTime, username (localStorage)
    │   ├── styles/                 # Tailwind entry stylesheet
    │   ├── assets/                 # logo.svg
    │   ├── App.jsx / main.jsx
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+ (npm workspaces support)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (or a local MongoDB instance)

### Installation

This repo is an **npm workspaces** monorepo — one `npm install` at the root installs both `server` and `client` dependencies.

```bash
git clone <your-fork-url> chatbot
cd chatbot
npm install
```

Then create the two environment files from their examples (see [Environment Variables](#environment-variables)):

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env` with your MongoDB Atlas connection string.

## Environment Variables

**`server/.env`**

| Variable      | Description                                          | Example                                             |
|---------------|-------------------------------------------------------|------------------------------------------------------|
| `PORT`        | Port the Express/Socket.io server listens on          | `5000`                                                |
| `MONGO_URI`   | MongoDB Atlas (or local) connection string            | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/realtime-chat` |
| `CLIENT_URL`  | Frontend origin allowed by CORS + Socket.io           | `http://localhost:5173`                               |
| `NODE_ENV`    | `development` or `production`                         | `development`                                         |

**`client/.env`**

| Variable            | Description                                 | Example                          |
|----------------------|----------------------------------------------|-----------------------------------|
| `VITE_API_URL`       | Backend REST base URL (with `/api`)          | `http://localhost:5000/api`       |
| `VITE_SOCKET_URL`    | Backend Socket.io base URL (no `/api`)       | `http://localhost:5000`           |

## MongoDB Atlas Setup

1. Create a free account/cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, add your current IP (or `0.0.0.0/0` for development/demo purposes only).
4. Click **Connect → Drivers**, copy the connection string, and paste it into `server/.env` as `MONGO_URI`, replacing `<username>`, `<password>`, and adding a database name (e.g. `/realtime-chat`) before the query string.

## Running the App

From the repository root:

```bash
npm run dev
```

This uses `concurrently` to start both the backend (`nodemon server.js`, port `5000`) and the frontend (`vite`, port `5173`) in one terminal. Open **http://localhost:5173**.

To run them separately:

```bash
npm run server   # backend only
npm run client   # frontend only
```

Production build of the frontend:

```bash
npm run build    # outputs client/dist
```

## Socket Flow

1. The user types a message and presses **Enter** (or clicks **Send**) in `ChatInput`.
2. The frontend (`useMessages` hook) emits a `send_message` socket event with `{ username, message }` and an acknowledgement callback, disabling the input until the ack resolves.
3. The backend's `socketHandlers.js` receives `send_message`, validates and persists it through `message.service.js` (shared with the REST controller), then:
   - broadcasts `receive_message` to **every** connected client (including the sender), so the message list has one single source of truth for appending new messages;
   - invokes the client's acknowledgement callback with `{ success, data }` or `{ success: false, error }`.
4. All connected clients receive `receive_message` and append the message (de-duplicated by `_id`).
5. The REST endpoint `POST /api/messages` follows the identical validate → persist flow and additionally broadcasts a `new_message` event, so a message created outside the socket flow (curl, Postman, another service) still reaches every live client. The frontend listens to both `receive_message` and `new_message` and merges them by `_id`.
6. On reconnect, Socket.io-client automatically retries (unlimited attempts, capped backoff); `SocketContext` reflects `connect` / `disconnect` / `connect_error` in real time so the header shows a live "Connected / Reconnecting..." indicator.
7. On mount (and on every full page refresh), the frontend calls `GET /api/messages` to load full history from MongoDB before the socket layer takes over — this is what guarantees a refresh never loses messages.

### Events Reference

| Event               | Direction        | Payload                              | Purpose                                             |
|---------------------|-------------------|----------------------------------------|------------------------------------------------------|
| `connection`         | server (internal) | —                                       | Socket.io lifecycle hook, logs the new connection     |
| `disconnect`         | server (internal) | reason string                          | Socket.io lifecycle hook, logs the disconnection      |
| `send_message`       | client → server   | `{ username, message }` + ack callback | Client asks the server to persist & broadcast a message |
| `receive_message`    | server → client   | saved message document                 | Broadcast after a socket-originated send              |
| `new_message`        | server → client   | saved message document                 | Broadcast after a REST-originated (`POST`) send       |

## API Documentation

Base URL: `VITE_API_URL` (default `http://localhost:5000/api`)

### `GET /api/messages`

Returns full chat history, sorted oldest first.

```bash
curl http://localhost:5000/api/messages
```

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Messages fetched successfully.",
  "data": [
    {
      "_id": "665f1c2e8b3c4a0012ab34cd",
      "username": "John",
      "message": "Hello",
      "timestamp": "2026-07-11T10:15:00.000Z",
      "createdAt": "2026-07-11T10:15:00.000Z",
      "updatedAt": "2026-07-11T10:15:00.000Z"
    }
  ]
}
```

### `POST /api/messages`

Creates and persists a message, then broadcasts it over Socket.io to every connected client.

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username":"John","message":"Hello"}'
```

Request body:

```json
{ "username": "John", "message": "Hello" }
```

Success response — `201 Created`:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Message sent successfully.",
  "data": {
    "_id": "665f1c2e8b3c4a0012ab34cd",
    "username": "John",
    "message": "Hello",
    "timestamp": "2026-07-11T10:15:00.000Z",
    "createdAt": "2026-07-11T10:15:00.000Z",
    "updatedAt": "2026-07-11T10:15:00.000Z"
  }
}
```

Validation error — `400 Bad Request` (empty message, empty username, or over the 40/2000 character limits):

```json
{ "success": false, "statusCode": 400, "message": "Message cannot be empty." }
```

### `GET /api/health`

Lightweight liveness check used by the Render health check.

```bash
curl http://localhost:5000/api/health
```

## Error Handling

| Scenario                         | Behavior                                                                                     |
|-----------------------------------|-----------------------------------------------------------------------------------------------|
| Network error (API unreachable)   | Axios interceptor normalizes it into a message shown in `ErrorBanner`                          |
| Database error                    | Caught by the Express `errorHandler` middleware, returns a `5xx` JSON error, logged server-side |
| Empty / invalid message           | Rejected client-side before sending; also rejected server-side (`400`) via shared validator     |
| Socket disconnect                 | `SocketContext` flips `isConnected` to `false`; header shows "Reconnecting..."                 |
| Socket reconnect                  | Socket.io-client retries automatically (unlimited attempts, capped exponential backoff)         |
| Invalid request (404 route)       | `notFound` middleware → centralized `errorHandler` → `404` JSON response                        |

## Testing Instructions

No automated test suite is included (see [Future Improvements](#future-improvements)); verify the app manually:

**REST API (backend running on port 5000):**

```bash
# Health check
curl http://localhost:5000/api/health

# Fetch history (should be [] on a fresh database)
curl http://localhost:5000/api/messages

# Create a message
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username":"Tester","message":"First message"}'

# Validation error (empty message)
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username":"Tester","message":"   "}'
```

**Real-time behavior:**

1. Run `npm run dev` from the repo root.
2. Open `http://localhost:5173` in two different browser tabs (or two different browsers), and pick a different display name in each.
3. Send a message from tab A — it should appear instantly in tab B with no refresh.
4. Refresh tab B — the message history (including the message just sent) should still be there, loaded from MongoDB.
5. Stop the backend process — both tabs' headers should switch to "Reconnecting...". Restart the backend — both tabs should reconnect automatically and resume working without a page reload.

## Deployment

### Backend — Render

**Option A — Blueprint (recommended):** this repo includes [`render.yaml`](render.yaml). In the Render Dashboard, choose **New → Blueprint**, point it at this repository, and Render will provision the web service defined there (root directory `server`, build command `npm install`, start command `npm start`). You'll be prompted to fill in `MONGO_URI` and `CLIENT_URL` since those are marked `sync: false`.

**Option B — Manual setup:**

1. Push this repository to GitHub.
2. In Render: **New → Web Service** → connect the repo.
3. **Root Directory:** `server`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Environment Variables:** add `MONGO_URI`, `CLIENT_URL` (your deployed frontend URL), `NODE_ENV=production`. Render sets `PORT` automatically — `server/config/env.js` reads it from `process.env.PORT`.
7. Deploy. Confirm `GET https://<your-service>.onrender.com/api/health` returns `200`.

### Frontend — Static Host (Vercel / Netlify / Render Static Site)

1. Build with `npm run build` (produces `client/dist`).
2. Deploy the `client` directory (build command `npm run build`, publish directory `dist`) to Vercel, Netlify, or a Render Static Site.
3. Set `VITE_API_URL` and `VITE_SOCKET_URL` in that host's environment variables to your deployed backend's URL (e.g. `https://chat-server.onrender.com/api` and `https://chat-server.onrender.com`).
4. Update the backend's `CLIENT_URL` env var to the deployed frontend's URL so CORS/Socket.io accept it.

## Design Decisions

- **REST for history, Socket.io for delivery, both write through one service.** `message.service.js` is the single place that validates and persists a message; both the REST controller (`POST /api/messages`) and the Socket.io handler (`send_message`) call it. This guarantees identical validation/behavior regardless of entry point and avoids duplicating logic — a direct consequence of the "no duplicated code" requirement.
- **Two broadcast events instead of one.** `receive_message` is emitted after a socket-originated send, `new_message` after a REST-originated one. The frontend listens to both and merges by `_id`. This means a message created via curl/Postman (bypassing the UI entirely) still reaches every live client, not just messages sent through the chat box — a stronger guarantee than a single shared event would give for the same amount of code.
- **History load is REST, live updates are sockets.** On mount, `useMessages` fetches `GET /api/messages` once to hydrate state before the socket listeners take over. This is what makes "refresh never loses messages" true without needing the socket layer to replay history.
- **MVC-style layered backend** (`routes → controllers → services → models`, cross-cutting concerns in `middlewares/`/`utils/`) was chosen over a flatter structure so the Socket.io handlers could reuse the service layer without reaching into controllers — controllers and socket handlers are two thin entry points over the same core logic.
- **npm workspaces monorepo** (root `package.json` with `server`/`client` as workspaces) so the whole project installs with one `npm install` and runs with one `npm run dev`, rather than requiring two separate installs/terminals.
- **Plain Tailwind, no component library.** The brief asked for a clean custom UI; a component kit would fight that requirement and add bundle weight for a small number of screens.
- **Client-side display name instead of real authentication.** Neither brief specifies a user/auth model, and the `Message` schema only has `username` + `message`. A lightweight join modal that stores the name in `localStorage` satisfies "username-based dummy login" (a bonus item) without over-building an auth system nothing else depends on.
- **MongoDB/Mongoose over SQLite.** Chat messages are naturally schema-light documents, and Mongoose's `timestamps: true` gives `createdAt`/`updatedAt` for free alongside the explicit `timestamp` field the spec calls out.

## Assumptions

- No authentication system was specified in the requirements, and the `Message` model only stores `username` + `message`. The frontend therefore captures a display name once (via a lightweight join modal) and persists it in `localStorage` — there is no password, session, or identity verification.
- `CLIENT_URL` supports a single origin for CORS/Socket.io. Supporting multiple origins (e.g. staging + production) is listed under Future Improvements.
- Chat is a single global room — there is no concept of multiple rooms/channels or direct messages, since none were requested.
- Message history is unpaginated (`GET /api/messages` returns the entire collection). Fine for a demo/assignment dataset size; see Future Improvements for pagination.

## Future Improvements

- User authentication (JWT-based sessions) and per-user identity instead of a client-chosen display name
- Multiple chat rooms/channels and private direct messages
- Pagination / infinite scroll for chat history once the collection grows large
- Typing indicators and read receipts via additional Socket.io events
- Message editing/deletion with optimistic UI updates
- Automated test suite (Jest + Supertest for the API, React Testing Library for components, a Socket.io integration test for the realtime flow)
- Rate limiting and profanity/spam filtering on the `POST /api/messages` and `send_message` paths
- Support multiple allowed CORS origins from a single `CLIENT_URL` env var (comma-separated list)

## Screenshots

> Add screenshots of the running app here after your first local run, e.g.:
>
> `docs/screenshot-desktop.png` — desktop chat view
> `docs/screenshot-mobile.png` — mobile responsive view

---

Built as a production-style reference implementation of a Socket.io + MongoDB real-time chat app.
