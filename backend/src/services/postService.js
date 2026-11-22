import Post from '../models/Post.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { ensureValidObjectId } from '../utils/validateObjectId.js';
import {
  buildPaginationMeta,
  parsePagination,
} from '../utils/pagination.js';

// Only the author's public information is embedded in post responses.
const AUTHOR_FIELDS = 'name username profilePicture bio';

/**
 * Creates a post owned by the authenticated user.
 *
 * @param {string} userId
 * @param {{content: string, image?: string}} input
 */
export const createPost = async (userId, { content, image = '' }) => {
  const post = await Post.create({
    user: userId,
    content: content.trim(),
    image: image?.trim() || '',
  });

  await post.populate('user', AUTHOR_FIELDS);

  return post;
};

/**
 * Returns the newest posts first, with pagination.
 *
 * @param {{page?: string, limit?: string}} query
 */
export const listPosts = async (query) => {
  const { page, limit, skip } = parsePagination(query);

  const [posts, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', AUTHOR_FIELDS),
    Post.countDocuments(),
  ]);

  return {
    posts,
    meta: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Returns a single post with its author populated.
 *
 * @param {string} postId
 */
export const getPostById = async (postId) => {
  ensureValidObjectId(postId, 'post');

  const post = await Post.findById(postId).populate('user', AUTHOR_FIELDS);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  return post;
};

/**
 * Updates a post. Only the owner may do this.
 *
 * @param {string} postId
 * @param {string} userId
 * @param {{content?: string, image?: string}} updates
 */
export const updatePost = async (postId, userId, updates) => {
  ensureValidObjectId(postId, 'post');

  const post = await Post.findById(postId);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  // Authorization check: compare the post owner with the logged-in user.
  if (post.user.toString() !== userId.toString()) {
    throw ApiError.forbidden('You are not allowed to update this post');
  }

  if (updates.content !== undefined) {
    post.content = updates.content.trim();
  }

  if (updates.image !== undefined) {
    post.image = updates.image?.trim() || '';
  }

  await post.save();
  await post.populate('user', AUTHOR_FIELDS);

  return post;
};

/**
 * Deletes a post. Only the owner may do this.
 *
 * @param {string} postId
 * @param {string} userId
 */
export const deletePost = async (postId, userId) => {
  ensureValidObjectId(postId, 'post');

  const post = await Post.findById(postId);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  if (post.user.toString() !== userId.toString()) {
    throw ApiError.forbidden('You are not allowed to delete this post');
  }

  await post.deleteOne();

  return post;
};

/**
 * Returns all posts created by a specific user, newest first.
 *
 * @param {string} targetUserId
 * @param {{page?: string, limit?: string}} query
 */
export const listPostsByUser = async (targetUserId, query) => {
  ensureValidObjectId(targetUserId, 'user');

  const userExists = await User.exists({ _id: targetUserId });

  if (!userExists) {
    throw ApiError.notFound('User not found');
  }

  const { page, limit, skip } = parsePagination(query);

  const [posts, total] = await Promise.all([
    Post.find({ user: targetUserId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', AUTHOR_FIELDS),
    Post.countDocuments({ user: targetUserId }),
  ]);

  return {
    posts,
    meta: buildPaginationMeta(total, page, limit),
    author: await User.findById(targetUserId).select(AUTHOR_FIELDS),
  };
};
