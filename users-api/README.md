# Users API

A starter REST API built with Node.js and Express.

## 1. Requirements
Install Node.js (LTS), then open a terminal in this folder.

## 2. Install packages
```bash
npm install
```

## 3. Configure environment
Copy `.env.example` to a new file named `.env`, then replace `JWT_SECRET`
with a long, random secret. Do not upload `.env` to GitHub.

## 4. Run the API
```bash
npm run dev
```
Open http://localhost:3000

## Endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/` | Check that the API is running | No |
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Log in | No |
| GET | `/api/users` | List users | Yes |
| GET | `/api/users/me` | Get your profile | Yes |
| GET | `/api/users/:id` | Get a user by ID | Yes |
| PATCH | `/api/users/me` | Update your name/email | Yes |
| DELETE | `/api/users/me` | Delete your account | Yes |

## Register example
POST `http://localhost:3000/api/auth/register`

Body → raw → JSON:
```json
{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "password": "pass12345"
}
```

## Login example
POST `http://localhost:3000/api/auth/login`

```json
{
  "email": "ahmed@example.com",
  "password": "pass12345"
}
```

The response contains a JWT token. For protected endpoints, add this header:
`Authorization: Bearer YOUR_TOKEN`

## Update profile example
PATCH `/api/users/me`

Header: `Authorization: Bearer YOUR_TOKEN`

```json
{
  "name": "Ahmed Ali"
}
```

## Important notes
- This starter stores users in `data/users.json` to keep setup simple. It is suitable for learning, not a production database.
- Passwords are hashed with bcryptjs; plain-text passwords are not saved.
- JWT tokens expire after 2 hours.
- Before production use, add a real database, request rate limiting, stronger validation, HTTPS, and a carefully designed authorization policy.
