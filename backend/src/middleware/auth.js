import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

/**
 * Authentication middleware.
 *
 * Expects an `Authorization: Bearer <token>` header, verifies the JWT and
 * attaches the matching user document to `req.user`.
 *
 * The user is loaded from the database on every request so a deleted user can
 * no longer use an old (still valid) token.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized(
      'Authentication required. Provide a valid Bearer token.'
    );
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    throw ApiError.unauthorized(
      'Authentication required. Provide a valid Bearer token.'
    );
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Your session has expired. Please log in again.');
    }

    throw ApiError.unauthorized('Invalid authentication token');
  }

  const user = await User.findById(payload.id);

  if (!user) {
    throw ApiError.unauthorized(
      'The user belonging to this token no longer exists'
    );
  }

  req.user = user;
  next();
});
