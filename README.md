# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Run the application locally

### Backend

1. Open a terminal in `backend`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a `JWT_SECRET` (at least 32 characters).
3. Install dependencies with `npm install`.
4. Start the API with `npm run dev`.
5. Optional: in another backend terminal, run `npm run seed:universities` to add the sample university directory.

The API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

### Frontend

1. In the project root, install dependencies with `npm install`.
2. Copy the root `.env.example` to `.env` if you need to change the API URL.
3. Start Vite with `npm run dev`.

The frontend defaults to `http://localhost:5173` and calls `http://localhost:5000/api`.

### Authentication and university API

- `POST /api/auth/register` — name, email, password; username is generated if omitted.
- `POST /api/auth/login` — email and password.
- `GET /api/auth/me` — current user (Bearer token required).
- `PUT /api/users/me` — update name, phone and universityId (Bearer token required).
- `GET /api/universities` — list universities and calculated place counts.
- `GET /api/universities/:id` — university details and its campus places.
- `POST /api/universities` — create a university (admin token required).

New accounts receive the `student` role. To test the admin-only create endpoint, promote a trusted test account to `role: "admin"` directly in your development MongoDB database.
