import { Router } from 'express';
import { getMe, login, register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  loginRules,
  registerRules,
} from '../middleware/validators/authValidators.js';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Creates a new account, hashes the password with bcrypt and returns a JWT.
 *
 *       **Required fields:** `name`, `email`, `password`. The `username` is optional and is generated from the email when omitted.
 *
 *       * `email` and `username` must be unique (409 if already taken).
 *       * `username` may contain letters, numbers and underscores (3–30 chars).
 *       * `password` must be 8–72 characters.
 *       * The password is **never** included in any response.
 *
 *       The returned token can be used immediately for authenticated requests.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Ada Lovelace
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: ada_lovelace
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: Secret123!
 *           example:
 *             name: Ada Lovelace
 *             username: ada_lovelace
 *             email: ada@example.com
 *             password: Secret123!
 *     responses:
 *       201:
 *         description: Account created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Registration successful
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWYxYzJhOWIxZThhMDAxMmE0YzExMSIsImlhdCI6MTcxNzUwMDAwMCwiZXhwIjoxNzE4MTA0ODAwfQ.signature
 *                 user:
 *                   _id: 665f1c2a9b1e8a0012a4c111
 *                   name: Ada Lovelace
 *                   username: ada_lovelace
 *                   email: ada@example.com
 *                   profilePicture: ''
 *                   bio: ''
 *                   createdAt: '2026-01-01T10:00:00.000Z'
 *                   updatedAt: '2026-01-01T10:00:00.000Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email or username already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Email is already registered
 *               errors: []
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', registerRules, validate, register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     description: |
 *       Verifies the email and password and returns a signed JWT.
 *
 *       The same `401` message is returned for an unknown email and for a wrong
 *       password so it is not possible to discover registered emails.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Secret123!
 *           example:
 *             email: ada@example.com
 *             password: Secret123!
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWYxYzJhOWIxZThhMDAxMmE0YzExMSIsImlhdCI6MTcxNzUwMDAwMCwiZXhwIjoxNzE4MTA0ODAwfQ.signature
 *                 user:
 *                   _id: 665f1c2a9b1e8a0012a4c111
 *                   name: Ada Lovelace
 *                   username: ada_lovelace
 *                   email: ada@example.com
 *                   profilePicture: ''
 *                   bio: ''
 *                   createdAt: '2026-01-01T10:00:00.000Z'
 *                   updatedAt: '2026-01-01T10:00:00.000Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Incorrect email or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Invalid email or password
 *               errors: []
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', loginRules, validate, login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     description: |
 *       Returns the profile of the user who owns the supplied JWT.
 *
 *       Send the token in the `Authorization` header:
 *       `Authorization: Bearer <token>` (or use the Swagger **Authorize** button).
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile. Includes the private email address.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Current user retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: Current user retrieved successfully
 *               data:
 *                 user:
 *                   _id: 665f1c2a9b1e8a0012a4c111
 *                   name: Ada Lovelace
 *                   username: ada_lovelace
 *                   email: ada@example.com
 *                   profilePicture: https://example.com/avatars/ada.png
 *                   bio: Mathematician. First programmer.
 *                   createdAt: '2026-01-01T10:00:00.000Z'
 *                   updatedAt: '2026-01-02T09:30:00.000Z'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/me', protect, getMe);

export default router;
