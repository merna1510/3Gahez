import { Router } from 'express';
import { getMe } from '../controllers/authController.js';
import {
  deleteMe,
  getUser,
  getUsers,
  updateMe,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  objectIdRule,
  paginationRules,
} from '../middleware/validators/authValidators.js';
import { updateProfileRules } from '../middleware/validators/userValidators.js';

const router = Router();

// Current authenticated user's profile (kept here to match the project API contract).
router.get('/me', protect, getMe);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: |
 *       Returns a paginated list of public user profiles, newest accounts first.
 *       Email addresses and passwords are never included.
 *
 *       **Pagination:** `?page=1&limit=10` (limit is capped at 100).
 *       The `meta` object contains totals and next/previous page hints.
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated list of users.
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
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PublicUser'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *             example:
 *               success: true
 *               message: Users retrieved successfully
 *               data:
 *                 users:
 *                   - _id: 665f1c2a9b1e8a0012a4c111
 *                     name: Ada Lovelace
 *                     username: ada_lovelace
 *                     profilePicture: https://example.com/avatars/ada.png
 *                     bio: Mathematician. First programmer.
 *                     createdAt: '2026-01-01T10:00:00.000Z'
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 totalPages: 1
 *                 hasNextPage: false
 *                 hasPrevPage: false
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', paginationRules, validate, getUsers);

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     summary: Update my profile
 *     description: |
 *       Updates the authenticated user's own profile. No other account can be
 *       modified with this endpoint.
 *
 *       **Allowed fields:** `name`, `username`, `email`, `profilePicture`, `bio`.
 *
 *       **Protected fields are rejected with HTTP 400:** `password`, `role`,
 *       `isAdmin`, `_id`, `createdAt`, `updatedAt`. Send at least one allowed field.
 *
 *       Changing `email` or `username` checks uniqueness and returns `409`
 *       when the value is already taken.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Ada King
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: ada_king
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada.king@example.com
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatars/ada-new.png
 *               bio:
 *                 type: string
 *                 maxLength: 160
 *                 example: Mathematician and writer.
 *           example:
 *             name: Ada King
 *             bio: Mathematician and writer.
 *             profilePicture: https://example.com/avatars/ada-new.png
 *     responses:
 *       200:
 *         description: Profile updated successfully.
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
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: Profile updated successfully
 *               data:
 *                 user:
 *                   _id: 665f1c2a9b1e8a0012a4c111
 *                   name: Ada King
 *                   username: ada_lovelace
 *                   email: ada@example.com
 *                   profilePicture: https://example.com/avatars/ada-new.png
 *                   bio: Mathematician and writer.
 *                   createdAt: '2026-01-01T10:00:00.000Z'
 *                   updatedAt: '2026-01-03T12:00:00.000Z'
 *       400:
 *         description: Validation failed or a protected field was supplied.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: 'You cannot update protected field(s): role'
 *               errors: []
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/me', protect, updateProfileRules, validate, updateMe);

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     summary: Delete my account
 *     description: |
 *       Permanently deletes the authenticated user's account **and all posts
 *       they created**. This action cannot be undone.
 *
 *       The response contains the deleted user's public profile and the number
 *       of posts that were removed.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully.
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
 *                   example: Account deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedPosts:
 *                       type: integer
 *                       example: 3
 *                     user:
 *                       $ref: '#/components/schemas/PublicUser'
 *             example:
 *               success: true
 *               message: Account deleted successfully
 *               data:
 *                 deletedPosts: 3
 *                 user:
 *                   _id: 665f1c2a9b1e8a0012a4c111
 *                   name: Ada Lovelace
 *                   username: ada_lovelace
 *                   profilePicture: ''
 *                   bio: ''
 *                   createdAt: '2026-01-01T10:00:00.000Z'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/me', protect, deleteMe);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get a user's public profile
 *     description: |
 *       Returns another user's public profile. The email address is hidden for
 *       privacy; only the authenticated owner can see it via `/api/auth/me`.
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *     responses:
 *       200:
 *         description: Public user profile.
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
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/PublicUser'
 *             example:
 *               success: true
 *               message: User retrieved successfully
 *               data:
 *                 user:
 *                   _id: 665f1c2a9b1e8a0012a4c111
 *                   name: Ada Lovelace
 *                   username: ada_lovelace
 *                   profilePicture: https://example.com/avatars/ada.png
 *                   bio: Mathematician. First programmer.
 *                   createdAt: '2026-01-01T10:00:00.000Z'
 *       400:
 *         description: The supplied id is not a valid MongoDB ObjectId.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Validation failed
 *               errors:
 *                 - field: id
 *                   message: user id must be a valid MongoDB ObjectId
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', objectIdRule('id', 'user'), validate, getUser);

export default router;
