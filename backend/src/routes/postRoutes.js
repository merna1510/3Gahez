import { Router } from 'express';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getPostsByUser,
  updatePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createPostRules,
  updatePostRules,
} from '../middleware/validators/postValidators.js';
import {
  objectIdRule,
  paginationRules,
} from '../middleware/validators/authValidators.js';

const router = Router();

/**
 * @openapi
 * /api/posts:
 *   post:
 *     summary: Create a post
 *     description: |
 *       Creates a post owned by the authenticated user. The author is taken
 *       from the JWT — any `user` value in the request body is ignored.
 *
 *       **Required:** `content` (1–2000 characters).
 *       **Optional:** `image` (absolute http/https URL).
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 example: Hello world, this is my first post!
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/images/sunset.jpg
 *           example:
 *             content: Hello world, this is my first post!
 *             image: https://example.com/images/sunset.jpg
 *     responses:
 *       201:
 *         description: Post created successfully.
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
 *                   example: Post created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *             example:
 *               success: true
 *               message: Post created successfully
 *               data:
 *                 post:
 *                   _id: 665f1c2a9b1e8a0012a4c222
 *                   user:
 *                     _id: 665f1c2a9b1e8a0012a4c111
 *                     name: Ada Lovelace
 *                     username: ada_lovelace
 *                     profilePicture: https://example.com/avatars/ada.png
 *                     bio: Mathematician. First programmer.
 *                   content: Hello world, this is my first post!
 *                   image: https://example.com/images/sunset.jpg
 *                   createdAt: '2026-01-02T08:00:00.000Z'
 *                   updatedAt: '2026-01-02T08:00:00.000Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', protect, createPostRules, validate, createPost);

/**
 * @openapi
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     description: |
 *       Returns the public feed, **newest first**, with the author's basic
 *       information populated on every post.
 *
 *       **Pagination:** `?page=1&limit=10` (limit is capped at 100).
 *       Use `meta.hasNextPage` to know when to load more in React.
 *     tags: [Posts]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated list of posts.
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
 *                   example: Posts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *             example:
 *               success: true
 *               message: Posts retrieved successfully
 *               data:
 *                 posts:
 *                   - _id: 665f1c2a9b1e8a0012a4c222
 *                     user:
 *                       _id: 665f1c2a9b1e8a0012a4c111
 *                       name: Ada Lovelace
 *                       username: ada_lovelace
 *                       profilePicture: https://example.com/avatars/ada.png
 *                       bio: Mathematician. First programmer.
 *                     content: Hello world, this is my first post!
 *                     image: ''
 *                     createdAt: '2026-01-02T08:00:00.000Z'
 *                     updatedAt: '2026-01-02T08:00:00.000Z'
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
router.get('/', paginationRules, validate, getPosts);

/**
 * @openapi
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Get all posts by a specific user
 *     description: |
 *       Returns every post written by one user, newest first, with pagination.
 *       Returns `404` if the user does not exist.
 *
 *       **Pagination:** `?page=1&limit=10` (limit is capped at 100).
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1c2a9b1e8a0012a4c111
 *         description: MongoDB ObjectId of the post author.
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated list of the user's posts.
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
 *                   example: User posts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     author:
 *                       $ref: '#/components/schemas/PublicUser'
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *             example:
 *               success: true
 *               message: User posts retrieved successfully
 *               data:
 *                 author:
 *                   _id: 665f1c2a9b1e8a0012a4c111
 *                   name: Ada Lovelace
 *                   username: ada_lovelace
 *                   profilePicture: https://example.com/avatars/ada.png
 *                   bio: Mathematician. First programmer.
 *                   createdAt: '2026-01-01T10:00:00.000Z'
 *                 posts:
 *                   - _id: 665f1c2a9b1e8a0012a4c222
 *                     user: 665f1c2a9b1e8a0012a4c111
 *                     content: Hello world, this is my first post!
 *                     image: ''
 *                     createdAt: '2026-01-02T08:00:00.000Z'
 *                     updatedAt: '2026-01-02T08:00:00.000Z'
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 totalPages: 1
 *                 hasNextPage: false
 *                 hasPrevPage: false
 *       400:
 *         description: Invalid user id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Validation failed
 *               errors:
 *                 - field: userId
 *                   message: user id must be a valid MongoDB ObjectId
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/user/:userId',
  objectIdRule('userId', 'user'),
  paginationRules,
  validate,
  getPostsByUser
);

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post
 *     description: Returns one post by its MongoDB ObjectId with the author populated.
 *     tags: [Posts]
 *     parameters:
 *       - $ref: '#/components/parameters/PostIdParam'
 *     responses:
 *       200:
 *         description: The requested post.
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
 *                   example: Post retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *             example:
 *               success: true
 *               message: Post retrieved successfully
 *               data:
 *                 post:
 *                   _id: 665f1c2a9b1e8a0012a4c222
 *                   user:
 *                     _id: 665f1c2a9b1e8a0012a4c111
 *                     name: Ada Lovelace
 *                     username: ada_lovelace
 *                     profilePicture: ''
 *                     bio: ''
 *                   content: Hello world, this is my first post!
 *                   image: ''
 *                   createdAt: '2026-01-02T08:00:00.000Z'
 *                   updatedAt: '2026-01-02T08:00:00.000Z'
 *       400:
 *         description: Invalid post id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Validation failed
 *               errors:
 *                 - field: id
 *                   message: post id must be a valid MongoDB ObjectId
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', objectIdRule('id', 'post'), validate, getPost);

/**
 * @openapi
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post (owner only)
 *     description: |
 *       Updates the content and/or image of a post.
 *
 *       **Authorization:** the JWT must belong to the post's author.
 *       Any other authenticated user receives `403 Forbidden`.
 *
 *       Send at least one of `content` or `image`. Sending `image: ""` removes
 *       the image.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PostIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 example: Updated post content.
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/images/new-image.jpg
 *           example:
 *             content: Updated post content.
 *             image: https://example.com/images/new-image.jpg
 *     responses:
 *       200:
 *         description: Post updated successfully.
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
 *                   example: Post updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *             example:
 *               success: true
 *               message: Post updated successfully
 *               data:
 *                 post:
 *                   _id: 665f1c2a9b1e8a0012a4c222
 *                   user:
 *                     _id: 665f1c2a9b1e8a0012a4c111
 *                     name: Ada Lovelace
 *                     username: ada_lovelace
 *                     profilePicture: ''
 *                     bio: ''
 *                   content: Updated post content.
 *                   image: https://example.com/images/new-image.jpg
 *                   createdAt: '2026-01-02T08:00:00.000Z'
 *                   updatedAt: '2026-01-02T09:00:00.000Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/:id',
  protect,
  objectIdRule('id', 'post'),
  updatePostRules,
  validate,
  updatePost
);

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post (owner only)
 *     description: |
 *       Permanently deletes a post.
 *
 *       **Authorization:** only the post's author can delete it. Other
 *       authenticated users receive `403 Forbidden`.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PostIdParam'
 *     responses:
 *       200:
 *         description: Post deleted successfully. The deleted post is returned.
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
 *                   example: Post deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *             example:
 *               success: true
 *               message: Post deleted successfully
 *               data:
 *                 post:
 *                   _id: 665f1c2a9b1e8a0012a4c222
 *                   user: 665f1c2a9b1e8a0012a4c111
 *                   content: Updated post content.
 *                   image: ''
 *                   createdAt: '2026-01-02T08:00:00.000Z'
 *                   updatedAt: '2026-01-02T09:00:00.000Z'
 *       400:
 *         description: Invalid post id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Validation failed
 *               errors:
 *                 - field: id
 *                   message: post id must be a valid MongoDB ObjectId
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id',
  protect,
  objectIdRule('id', 'post'),
  validate,
  deletePost
);

export default router;
