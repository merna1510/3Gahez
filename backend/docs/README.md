# API Documentation

This folder contains the OpenAPI documentation for the Social Media REST API.

## Interactive documentation

Start the backend and open:

```text
http://localhost:5000/api-docs
```

The Swagger UI lists every endpoint, request body, parameter, response example, and error status code. Use the **Authorize** button with a JWT from `/api/auth/register` or `/api/auth/login` to call protected endpoints.

## Raw OpenAPI JSON

While the server is running:

```text
http://localhost:5000/api-docs.json
```

A generated copy is stored at `docs/openapi.json` so it can be imported into Postman, Insomnia, or another OpenAPI client.

## Regenerate the OpenAPI file

The specification is generated from `@openapi` JSDoc comments in:

- `src/app.js`
- `src/routes/*.js`

After adding or changing endpoint documentation, run:

```bash
npm run docs:export
```

## Endpoint groups

| Group | Paths |
| --- | --- |
| System | `GET /`, `GET /api/health`, `GET /api-docs.json` |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET /api/users`, `GET /api/users/{id}`, `PUT /api/users/me`, `DELETE /api/users/me` |
| Posts | `GET /api/posts`, `POST /api/posts`, `GET /api/posts/{id}`, `PUT /api/posts/{id}`, `DELETE /api/posts/{id}`, `GET /api/posts/user/{userId}` |

## Authentication in Swagger

1. Register or log in.
2. Copy `data.token`.
3. Click **Authorize** and paste only the token.
4. Swagger sends `Authorization: Bearer <token>` automatically.

Protected operations are marked with a padlock. They are:

- `GET /api/auth/me`
- `PUT /api/users/me`
- `DELETE /api/users/me`
- `POST /api/posts`
- `PUT /api/posts/{id}`
- `DELETE /api/posts/{id}`

See the main [README](../README.md) for full setup, React/Axios integration, and endpoint details.
