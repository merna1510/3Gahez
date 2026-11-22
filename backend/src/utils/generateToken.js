import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Creates a signed JWT for a user.
 *
 * We only store the user id inside the token. Everything else (name, email,
 * role, ...) is fetched fresh from the database on each request so it can
 * never become outdated.
 *
 * @param {string} userId MongoDB ObjectId as a string.
 * @returns {string} Signed JWT.
 */
export const generateToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
