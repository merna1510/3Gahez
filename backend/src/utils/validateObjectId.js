import mongoose from 'mongoose';
import ApiError from './ApiError.js';

/**
 * Ensures a route parameter is a valid MongoDB ObjectId before it reaches the
 * database. Without this check, Mongoose throws a confusing CastError.
 *
 * @param {string} id
 * @param {string} [resourceName='resource']
 * @returns {string} The validated id.
 * @throws {ApiError} 400 when the id is invalid.
 */
export const ensureValidObjectId = (id, resourceName = 'resource') => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(`Invalid ${resourceName} id`);
  }

  return id;
};
