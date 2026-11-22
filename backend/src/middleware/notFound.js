import ApiError from '../utils/ApiError.js';

/**
 * Handles requests that do not match any route.
 * Must be registered after all routes and before the error handler.
 */
export const notFound = (req, _res, next) => {
  next(
    ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`)
  );
};
