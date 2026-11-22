import * as postService from '../services/postService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/posts (protected)
 * The author is always the authenticated user, never a value from the body.
 */
export const createPost = asyncHandler(async (req, res) => {
  const { content, image } = req.body;

  const post = await postService.createPost(req.user._id, { content, image });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Post created successfully',
    data: { post },
  });
});

/**
 * GET /api/posts
 * Newest-first feed with pagination.
 */
export const getPosts = asyncHandler(async (req, res) => {
  const { posts, meta } = await postService.listPosts(req.query);

  return sendSuccess(res, {
    message: 'Posts retrieved successfully',
    data: { posts },
    meta,
  });
});

/**
 * GET /api/posts/:id
 */
export const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);

  return sendSuccess(res, {
    message: 'Post retrieved successfully',
    data: { post },
  });
});

/**
 * PUT /api/posts/:id (protected, owner only)
 */
export const updatePost = asyncHandler(async (req, res) => {
  const { content, image } = req.body;

  const post = await postService.updatePost(req.params.id, req.user._id, {
    content,
    image,
  });

  return sendSuccess(res, {
    message: 'Post updated successfully',
    data: { post },
  });
});

/**
 * DELETE /api/posts/:id (protected, owner only)
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await postService.deletePost(req.params.id, req.user._id);

  return sendSuccess(res, {
    message: 'Post deleted successfully',
    data: { post },
  });
});

/**
 * GET /api/posts/user/:userId
 * All posts written by one user, newest first.
 */
export const getPostsByUser = asyncHandler(async (req, res) => {
  const { posts, meta, author } = await postService.listPostsByUser(
    req.params.userId,
    req.query
  );

  return sendSuccess(res, {
    message: 'User posts retrieved successfully',
    data: { author, posts },
    meta,
  });
});
