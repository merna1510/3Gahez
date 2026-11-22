# Social Media REST API

A complete, production-style social media backend built with **Node.js, Express, MongoDB, Mongoose, JWT, and Swagger**. It is designed to connect directly to an existing React frontend.

The API implements user registration/login, JWT authentication, profile management, and full post CRUD with ownership authorization. Passwords are hashed with bcryptjs, every response uses a consistent JSON format, and all validation and error handling are centralized.

> **Frontend safety:** This backend lives in its own `backend/` folder. The existing React/Vite project and the old `users-api/` demo were not modified.

---

## Table of contents

1. [Features](#1-features)
2. [Technologies used](#2-technologies-used)
3. [Project structure](#3-project-structure)
4. [Prerequisites](#4-prerequisites)
5. [Installation](#5-installation)
6. [Configure MongoDB](#6-configure-mongodb)
7. [Environment variables](#7-environment-variables)
8. [Start the server](#8-start-the-server)
9. [API response format](#9-api-response-format)
10. [All API endpoints](#10-all-api-endpoints)
11. [Authentication workflow](#11-authentication-workflow)
12. [Swagger / OpenAPI documentation](#12-swagger--openapi-documentation)
13. [Connect the API to React](#13-connect-the-api-to-react)
14. [Axios examples](#14-axios-examples)
15. [Add the JWT token to Axios requests](#15-add-the-jwt-token-to-axios-requests)
16. [Testing](#16-testing)
17. [Security notes](#17-security-notes)
18. [Troubleshooting](#18-troubleshooting)
19. [Manual configuration checklist](#19-manual-configuration-checklist)

---

## 1. Features

- User registration with unique email and username
- Password hashing with bcryptjs (cost factor 12)
- Login with JWT access tokens
- `GET /api/auth/me` for the authenticated user
- Public user list and public profiles with pagination
- Update and delete the authenticated user's own account
- Deleting an account also deletes that user's posts
- Full post CRUD
- Post ownership checks: only the author can update or delete a post
- Posts are populated with safe author information
- Pagination and newest-first sorting
- Request validation with express-validator
- Centralized error handling and consistent HTTP status codes
- CORS allowlist for local and deployed React apps
- Helmet security headers and a 1 MB request size limit
- Interactive Swagger UI with a Bearer-token **Authorize** button
- Exportable OpenAPI JSON document
- Automated integration tests with Vitest + Supertest

---

## 2. Technologies used

| Technology | Purpose |
| --- | --- |
| Node.js (ES Modules) | JavaScript runtime |
| Express.js | HTTP server and routing |
| MongoDB | Database |
| Mongoose | ODM, schemas, validation, population |
| JSON Web Token (jsonwebtoken) | Stateless authentication |
| bcryptjs | Password hashing and comparison |
| dotenv | Environment configuration |
| express-validator | Request body/query/param validation |
| cors | React frontend integration |
| helmet | Security-related HTTP headers |
| swagger-jsdoc + swagger-ui-express | OpenAPI generation and interactive docs |
| Vitest + Supertest | API integration tests |
| mongodb-memory-server | Optional fallback MongoDB for tests |

The backend uses **JavaScript with ES Modules** (`import` / `export`), not TypeScript.

---

## 3. Project structure

```text
backend/
├── docs/
│   ├── export-openapi.js      # Generates docs/openapi.json
│   ├── openapi.json           # Generated OpenAPI 3.0 document
│   └── README.md              # Documentation workflow
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── env.js             # Environment loading + validation
│   │   └── swagger.js         # OpenAPI definition and JSDoc scanning
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   ├── errorHandler.js    # Centralized error responses
│   │   ├── notFound.js
│   │   ├── validate.js
│   │   └── validators/
│   │       ├── authValidators.js
│   │       ├── postValidators.js
│   │       └── userValidators.js
│   ├── models/
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── index.js
│   │   ├── postRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── postService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── generateToken.js
│   │   ├── pagination.js
│   │   └── validateObjectId.js
│   └── app.js                 # Express app (no listen call)
├── tests/
│   ├── auth.test.js
│   ├── helpers.js
│   ├── posts.test.js
│   ├── setupEnv.js
│   └── users.test.js
├── .env                       # Local secrets (git-ignored)
├── .env.example               # Safe template to copy
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── server.js                  # Starts HTTP server after MongoDB connects
└── vitest.config.js
```

The code follows MVC-style separation:

- **Models** define MongoDB schemas.
- **Services** contain reusable business logic and database operations.
- **Controllers** handle HTTP requests/responses.
- **Routes** declare URLs, middleware, and Swagger documentation.
- **Middleware** handles authentication, validation, 404s, and errors.

---

## 4. Prerequisites

Before starting, make sure you have:

- **Node.js 20.19 or newer** (`node --version`)
- **npm** (`npm --version`)
- **MongoDB** running locally, or a free MongoDB Atlas account

Check MongoDB locally:

```bash
mongosh "mongodb://127.0.0.1:27017"
```

If the command connects, MongoDB is available. On Windows, the MongoDB service can also be checked in `services.msc`.

---

## 5. Installation

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

Create the local environment file:

**PowerShell**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux/Git Bash**

```bash
cp .env.example .env
```

> A local `.env` has already been created for this project with a randomly generated JWT secret. It is git-ignored. You only need to adjust `MONGODB_URI`, `CORS_ORIGIN`, and the secret if you deploy the API.

---

## 6. Configure MongoDB

### Option A — Local MongoDB (default)

The example configuration uses:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/social_media_api
```

Start MongoDB if it is not already running.

- **Windows:** open `services.msc` and start the **MongoDB** service, or run your local MongoDB installation.
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux (systemd):** `sudo systemctl start mongod`

The database and collections are created automatically on first use.

### Option B — MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with a strong password.
3. In **Network Access**, add your current IP address. For temporary local development you may allow `0.0.0.0/0`, but do not use that in production.
4. Copy the connection string and add the database name:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/social_media_api?retryWrites=true&w=majority
```

If your password contains special characters such as `@`, `#`, `/`, or `:`, URL-encode them.

### Database names used by the project

| Purpose | Database |
| --- | --- |
| Development | `social_media_api` |
| Automated tests | `social_media_api_test` |

The tests never use the development database.

---

## 7. Environment variables

All configuration is read from `backend/.env`. Required values are validated at startup, and the server refuses to start with a missing or very short JWT secret.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `PORT` | No | `5000` | HTTP port |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret used to sign JWTs; at least 32 characters |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime, e.g. `1h`, `7d` |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `MONGODB_URI_TEST` | No | local test DB | Optional custom MongoDB URI for tests |

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Example `.env`:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/social_media_api

JWT_SECRET=replace_with_your_own_random_secret_at_least_32_characters_long
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

**Never commit `.env`.** It is already listed in `.gitignore`. Commit `.env.example` instead.

---

## 8. Start the server

Development mode with automatic restart:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The server only begins accepting requests after MongoDB connects.

When it starts you will see:

```text
MongoDB connected: 127.0.0.1:27017/social_media_api

==============================================
  Social Media API (development)
  API:    http://localhost:5000
  Health: http://localhost:5000/api/health
  Docs:   http://localhost:5000/api-docs
==============================================
```

Useful URLs:

| URL | Purpose |
| --- | --- |
| `http://localhost:5000` | API welcome message |
| `http://localhost:5000/api` | Base URL for all application endpoints |
| `http://localhost:5000/api/health` | Health check |
| `http://localhost:5000/api-docs` | Interactive Swagger UI |
| `http://localhost:5000/api-docs.json` | Raw OpenAPI JSON |

Quick check:

```bash
curl http://localhost:5000/api/health
```

---

## 9. API response format

### Success

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {}
  }
}
```

Paginated endpoints also return a top-level `meta` object:

```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "posts": []
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "A valid email address is required"
    }
  ]
}
```

`errors` is always an array. Unexpected server errors return a generic message and never expose stack traces or database internals.

### Common status codes

| Status | Meaning |
| --- | --- |
| `200` | Request succeeded |
| `201` | Resource created |
| `400` | Validation failed or invalid ID/value |
| `401` | Missing, invalid, or expired JWT |
| `403` | Authenticated but not allowed (for example, not the post owner) |
| `404` | Resource or route not found |
| `409` | Email/username already in use |
| `413` | Request body larger than 1 MB |
| `500` | Unexpected server error |

---

## 10. All API endpoints

Base URL: **`http://localhost:5000/api`**

### System

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | API welcome/information |
| `GET` | `/api/health` | No | Health check |
| `GET` | `/api-docs` | No | Swagger UI |
| `GET` | `/api-docs.json` | No | Raw OpenAPI JSON |

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Register and receive a JWT |
| `POST` | `/api/auth/login` | No | Login and receive a JWT |
| `GET` | `/api/auth/me` | **Yes** | Current authenticated user's profile |

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users?page=1&limit=10` | No | Paginated public user list |
| `GET` | `/api/users/:id` | No | Public user profile |
| `PUT` | `/api/users/me` | **Yes** | Update own profile |
| `DELETE` | `/api/users/me` | **Yes** | Delete own account and all owned posts |

### Posts

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/posts` | **Yes** | Create a post |
| `GET` | `/api/posts?page=1&limit=10` | No | Paginated feed, newest first |
| `GET` | `/api/posts/:id` | No | Get one post |
| `PUT` | `/api/posts/:id` | **Yes, owner** | Update own post |
| `DELETE` | `/api/posts/:id` | **Yes, owner** | Delete own post |
| `GET` | `/api/posts/user/:userId?page=1&limit=10` | No | Posts by a specific user |

### Request field rules

**Register**

```json
{
  "name": "Ada Lovelace",
  "username": "ada_lovelace",
  "email": "ada@example.com",
  "password": "Secret123!"
}
```

- `name`: 2–50 characters
- `username`: 3–30 characters, letters/numbers/underscores; stored in lowercase
- `email`: valid and unique; stored in lowercase
- `password`: 8–72 characters; hashed before storage

**Login**

```json
{
  "email": "ada@example.com",
  "password": "Secret123!"
}
```

**Update profile** — one or more of:

```json
{
  "name": "Ada King",
  "username": "ada_king",
  "email": "ada.king@example.com",
  "profilePicture": "https://example.com/avatar.png",
  "bio": "Mathematician and writer."
}
```

Protected fields such as `password`, `role`, `isAdmin`, `_id`, and timestamps are rejected with `400`. The API has no role field that a client can change.

**Create post**

```json
{
  "content": "Hello world, this is my first post!",
  "image": "https://example.com/images/sunset.jpg"
}
```

- `content`: required, 1–5000 characters
- `image`: optional HTTP/HTTPS URL
- The post owner always comes from the JWT, never from the request body.

**Update post**

```json
{
  "content": "Updated text",
  "image": ""
}
```

Send at least one of `content` or `image`. An empty `image` removes the image.

---

## 11. Authentication workflow

1. The React app calls `POST /api/auth/register` or `POST /api/auth/login`.
2. The server verifies the credentials, hashes/compares the password with bcryptjs, and returns a signed JWT.
3. The frontend stores the token (for example in `localStorage`) and sends it on protected requests:

```http
Authorization: Bearer <your-jwt-token>
```

4. The `protect` middleware:
   - checks that the header starts with `Bearer `;
   - verifies the signature and expiry with `JWT_SECRET`;
   - loads the user from MongoDB;
   - rejects deleted users and invalid/expired tokens with `401`;
   - attaches the current user to `req.user`.
5. For post updates/deletes, the service compares `post.user` with `req.user._id`. A different authenticated user receives `403 Forbidden`.

The JWT contains only the user ID. User details are always loaded fresh from MongoDB. Passwords are excluded from queries by default and removed again in the model's JSON transform.

---

## 12. Swagger / OpenAPI documentation

Start the server and open:

**http://localhost:5000/api-docs**

The docs include:

- Every endpoint with method, URL, description, parameters, and request examples
- JSON response examples
- Possible `400`, `401`, `403`, `404`, `409`, and `500` responses
- The Bearer JWT security scheme
- An **Authorize** button

### Authorize in Swagger

1. Register or log in through Swagger.
2. Copy `data.token` from the response.
3. Click **Authorize** at the top of the page.
4. Paste the token itself (do **not** type `Bearer`; Swagger adds it automatically).
5. Click **Authorize**, then close the dialog.
6. Locked endpoints now send `Authorization: Bearer <token>`.

`persistAuthorization` is enabled, so the token is kept when the page is reloaded.

### Raw OpenAPI document

- Runtime: `http://localhost:5000/api-docs.json`
- Static file: `docs/openapi.json`
- Regenerate after changing route documentation:

```bash
npm run docs:export
```

See [`docs/README.md`](docs/README.md) for more details.

---

## 13. Connect the API to React

The existing React app is **not modified** by this backend. Add Axios to the frontend:

```bash
cd ..          # back to the React project root
npm install axios
```

Create a `.env` file in the React project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart the Vite dev server after changing frontend environment variables.

Create `src/api/client.js`:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

Make sure `CORS_ORIGIN` in `backend/.env` exactly matches the URL shown by Vite. By default Vite uses `http://localhost:5173`.

If you open the frontend as `http://127.0.0.1:5173` instead, add that origin too:

```env
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

Restart the backend after changing CORS configuration.

---

## 14. Axios examples

All examples use the `api` instance from the previous section.

### Register

```js
try {
  const response = await api.post('/auth/register', {
    name: 'Ada Lovelace',
    username: 'ada_lovelace',
    email: 'ada@example.com',
    password: 'Secret123!',
  });

  const { token, user } = response.data.data;
  localStorage.setItem('token', token);
  console.log('Registered:', user);
} catch (error) {
  console.error(error.response?.data?.message);
  console.error(error.response?.data?.errors);
}
```

### Login

```js
const response = await api.post('/auth/login', {
  email: 'ada@example.com',
  password: 'Secret123!',
});

const { token, user } = response.data.data;
localStorage.setItem('token', token);
```

### GET — current user

```js
const response = await api.get('/auth/me', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const user = response.data.data.user;
```

### GET — paginated posts

```js
const response = await api.get('/posts', {
  params: { page: 1, limit: 10 },
});

const posts = response.data.data.posts;
const pagination = response.data.meta;

if (pagination.hasNextPage) {
  // Load page + 1 when the user scrolls or clicks "Next"
}
```

### POST — create a post

```js
const response = await api.post(
  '/posts',
  {
    content: 'My first post from React!',
    image: 'https://example.com/image.jpg',
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }
);

const newPost = response.data.data.post;
```

### PUT — update a post

```js
await api.put(
  `/posts/${postId}`,
  { content: 'Updated post content' },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }
);
```

### DELETE — delete a post

```js
await api.delete(`/posts/${postId}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});
```

### PUT — update profile

```js
const response = await api.put(
  '/users/me',
  {
    name: 'Ada King',
    bio: 'Mathematician and writer.',
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }
);

const updatedUser = response.data.data.user;
```

---

## 15. Add the JWT token to Axios requests

Instead of repeating the `Authorization` header, add a request interceptor once in `src/api/client.js`:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Optional: clear the session when the token expires or is invalid.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Example: redirect to /login
    }

    return Promise.reject(error);
  }
);

export default api;
```

Now protected calls are simple:

```js
const { data } = await api.post('/posts', { content: 'Hello from React!' });
```

### Auth state suggestion

- Store only the JWT in `localStorage` for a beginner project.
- After login, call `GET /api/auth/me` to restore the user on page reload.
- Remove the token and navigate to the login page when a `401` response occurs.
- Never store the user's password in the browser.

---

## 16. Testing

The API has **34 integration tests** covering authentication, users, posts, authorization, validation, and account deletion.

Run:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

### Test database

By default, tests use a dedicated local database:

```text
mongodb://127.0.0.1:27017/social_media_api_test
```

The tests clear and drop only this test database. Your development data in `social_media_api` is never touched.

To use another MongoDB instance:

**PowerShell**

```powershell
$env:MONGODB_URI_TEST="mongodb://127.0.0.1:27017/my_social_api_test"
npm test
```

**macOS/Linux/Git Bash**

```bash
MONGODB_URI_TEST="mongodb://127.0.0.1:27017/my_social_api_test" npm test
```

If no local MongoDB is available, the test helper automatically starts a real, isolated MongoDB process with `mongodb-memory-server`. No data is mocked. The first fallback start may need to download a MongoDB binary.

### What is tested

- User registration and password hashing
- Duplicate email/username handling
- Login success and wrong password
- `GET /api/auth/me` with valid, invalid, and deleted-user tokens
- Creating posts
- Listing posts with newest-first sorting and pagination
- Getting a single post
- Updating and deleting a post
- Unauthorized post requests
- Preventing another user from editing/deleting a post
- User list/profile privacy
- Profile updates and protected-field rejection
- Account deletion cascading to posts

---

## 17. Security notes

- **JWT secret:** never hardcode it; stored only in `.env`. Startup fails if it is shorter than 32 characters.
- **Password hashing:** bcryptjs with cost 12, applied in a Mongoose pre-save hook.
- **Password exposure:** `password` uses `select: false` and is deleted by `toJSON`/`toObject` transforms. Responses also use explicit safe serializers.
- **Authorization:** post update/delete compares the post owner with the authenticated user and returns `403` when they differ.
- **Mass assignment:** profile updates only accept an explicit whitelist. Protected fields are rejected.
- **Account deletion:** owned posts are removed to avoid orphaned data.
- **Validation:** every write endpoint and paginated query is validated.
- **Errors:** a centralized handler hides internal details from clients.
- **CORS:** only configured React origins are allowed.
- **Headers:** Helmet is enabled. Swagger UI requires its inline assets, so CSP is disabled for this local documentation app.
- **Body size:** JSON and URL-encoded payloads are limited to 1 MB.
- **Tokens:** use a short lifetime and HTTPS in production.

### Recommended production additions

This learning project intentionally avoids extra complexity. For a public production deployment, also consider:

- HTTPS and secure hosting
- Rate limiting on authentication endpoints
- Refresh tokens / short-lived access tokens
- Email verification and password reset
- Image uploads to object storage (instead of URL strings)
- Logging/monitoring
- A distributed cache if the API scales horizontally
- Regular dependency audits (`npm audit`)

---

## 18. Troubleshooting

### `MongooseServerSelectionError` / cannot connect to MongoDB

- Confirm MongoDB is running.
- Confirm `MONGODB_URI` is correct.
- For Atlas, check the database user, password encoding, and Network Access IP allowlist.
- Test locally: `mongosh "mongodb://127.0.0.1:27017"`.

### CORS error in the browser

- Make sure `CORS_ORIGIN` exactly matches the frontend origin, including protocol and port.
- `http://localhost:5173` and `http://127.0.0.1:5173` are different origins.
- Restart the backend after changing `.env`.

### `401 Unauthorized`

- Send `Authorization: Bearer <token>`.
- The token may have expired; log in again.
- In Swagger, paste only the token into **Authorize**.

### `403 Forbidden` when updating/deleting a post

You are authenticated, but you are not the post's owner. This is expected authorization behavior.

### `400 Validation failed`

Inspect the `errors` array. Each item identifies the invalid `field`.

### `413 Payload Too Large`

The JSON body is over 1 MB. Send an image URL rather than a base64 image.

### Swagger page is empty or paths are missing

Regenerate the static document and restart the server:

```bash
npm run docs:export
npm run dev
```

### Tests fail to connect

Start local MongoDB, set `MONGODB_URI_TEST`, or allow the test helper to fall back to `mongodb-memory-server`.

---

## 19. Manual configuration checklist

Before using the API with your React app:

- [ ] Run `npm install` inside `backend/`.
- [ ] Confirm `backend/.env` exists (copy from `.env.example` if needed).
- [ ] Set `MONGODB_URI` to your local MongoDB or Atlas connection string.
- [ ] Replace `JWT_SECRET` with a long random value (at least 32 characters).
- [ ] Set `CORS_ORIGIN` to the exact URL(s) of your React app.
- [ ] Start MongoDB.
- [ ] Run `npm run dev` and confirm the API starts.
- [ ] Open `http://localhost:5000/api/health`.
- [ ] Open `http://localhost:5000/api-docs` and try registration/login.
- [ ] Add `VITE_API_URL=http://localhost:5000/api` to the React project's `.env`.
- [ ] Install `axios` in the React project and add the API client/interceptor.
- [ ] Run `npm test` to verify all 34 backend tests pass.

---

## Quick start

```bash
cd backend
npm install
npm run dev
```

- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/api-docs`
- Health: `http://localhost:5000/api/health`
- Tests: `npm test`
