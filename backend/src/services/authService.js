import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';
import { randomBytes } from 'node:crypto';

/**
 * Registers a new user.
 *
 * - Normalizes email/username to lowercase.
 * - Rejects duplicate emails and usernames with HTTP 409.
 * - The User model hashes the password in a pre-save hook.
 *
 * @param {{name: string, username: string, email: string, password: string}} input
 * @returns {Promise<{user: object, token: string}>}
 */
export const registerUser = async ({ name, username, email, password, phone = '', universityId = null }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const baseUsername = (username || normalizedEmail.split('@')[0])
    .toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '').slice(0, 23) || 'student';
  const normalizedUsername = username
    ? baseUsername
    : `${baseUsername}_${randomBytes(3).toString('hex')}`;

  const [emailExists, usernameExists] = await Promise.all([
    User.exists({ email: normalizedEmail }),
    User.exists({ username: normalizedUsername }),
  ]);

  if (emailExists) {
    throw ApiError.conflict('Email is already registered');
  }

  if (usernameExists) {
    throw ApiError.conflict('Username is already taken');
  }

  const user = await User.create({
    name: name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    phone,
    universityId,
  });

  return {
    token: generateToken(user._id.toString()),
    user: user.toAuthJSON(),
  };
};

/**
 * Logs a user in with email and password.
 *
 * The same generic message is used for an unknown email and a wrong password so
 * attackers cannot discover which emails are registered.
 *
 * @param {{email: string, password: string}} input
 * @returns {Promise<{user: object, token: string}>}
 */
export const loginUser = async ({ email, password }) => {
  // `password` is excluded by default, so ask for it explicitly here.
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+password'
  );

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return {
    token: generateToken(user._id.toString()),
    user: user.toAuthJSON(),
  };
};

/**
 * Returns the authenticated user's own profile.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists');
  }

  return user.toAuthJSON();
};
