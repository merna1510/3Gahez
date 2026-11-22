import User from '../models/User.js';
import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import { ensureValidObjectId } from '../utils/validateObjectId.js';
import {
  buildPaginationMeta,
  parsePagination,
} from '../utils/pagination.js';

// Fields a user is allowed to change through PUT /api/users/me.
const UPDATABLE_FIELDS = ['name', 'username', 'email', 'phone', 'universityId', 'profilePicture', 'bio'];

// Fields that must never be changed through a profile update.
const PROTECTED_FIELDS = [
  '_id',
  'id',
  'password',
  'role',
  'isAdmin',
  'createdAt',
  'updatedAt',
  '__v',
];

/**
 * Lists users with pagination. Only public profile data is returned.
 *
 * @param {{page?: string, limit?: string}} query
 */
export const listUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);

  const [users, total] = await Promise.all([
    User.find()
      .select('name username profilePicture bio createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(),
  ]);

  return {
    users: users.map((user) => ({
      _id: user._id,
      name: user.name,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
    })),
    meta: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Returns a single user's public profile.
 *
 * @param {string} userId
 */
export const getUserById = async (userId) => {
  ensureValidObjectId(userId, 'user');

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user.toPublicJSON();
};

/**
 * Updates the authenticated user's own profile.
 *
 * Protected fields (password, role, _id, timestamps) are rejected instead of
 * silently ignored, so clients get clear feedback.
 *
 * @param {string} userId
 * @param {object} updates Raw request body.
 */
export const updateProfile = async (userId, updates) => {
  const protectedKeys = Object.keys(updates).filter((key) =>
    PROTECTED_FIELDS.includes(key)
  );

  if (protectedKeys.length > 0) {
    throw ApiError.badRequest(
      `You cannot update protected field(s): ${protectedKeys.join(', ')}`
    );
  }

  const allowedUpdates = UPDATABLE_FIELDS.reduce((accumulator, field) => {
    if (updates[field] !== undefined) {
      accumulator[field] = updates[field];
    }
    return accumulator;
  }, {});

  if (Object.keys(allowedUpdates).length === 0) {
    throw ApiError.badRequest(
      `Provide at least one field to update: ${UPDATABLE_FIELDS.join(', ')}`
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Make sure email and username stay unique across other accounts.
  if (allowedUpdates.email) {
    const normalizedEmail = allowedUpdates.email.toLowerCase().trim();
    const emailTaken = await User.exists({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (emailTaken) {
      throw ApiError.conflict('Email is already in use');
    }

    allowedUpdates.email = normalizedEmail;
  }

  if (allowedUpdates.username) {
    const normalizedUsername = allowedUpdates.username.toLowerCase().trim();
    const usernameTaken = await User.exists({
      username: normalizedUsername,
      _id: { $ne: user._id },
    });

    if (usernameTaken) {
      throw ApiError.conflict('Username is already taken');
    }

    allowedUpdates.username = normalizedUsername;
  }

  Object.assign(user, allowedUpdates);

  try {
    await user.save();
  } catch (error) {
    // Handles the unlikely race between the check above and the unique index.
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      throw ApiError.conflict(`That ${field} is already in use`);
    }
    throw error;
  }

  return user.toAuthJSON();
};

/**
 * Deletes the authenticated user's account and all of their posts.
 * This keeps the database consistent (no orphaned posts).
 *
 * @param {string} userId
 */
export const deleteAccount = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const deletedPosts = await Post.deleteMany({ user: user._id });
  await user.deleteOne();

  return {
    deletedPosts: deletedPosts.deletedCount,
    user: user.toPublicJSON(),
  };
};
