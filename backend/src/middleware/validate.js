import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Runs after the express-validator chains. Collects every validation error and
 * passes them to the central error handler as a single 400 response.
 *
 * Example output:
 *   { field: 'email', message: 'A valid email is required' }
 */
export const validate = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  return next(ApiError.badRequest('Validation failed', errors));
};
