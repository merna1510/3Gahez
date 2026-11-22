import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * Centralized error handler.
 *
 * Every error — validation, authentication, database, or unexpected — ends up
 * here and is converted into the same JSON shape:
 *
 *   { success: false, message: "...", errors: [] }
 *
 * Stack traces are only logged, never returned to clients.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = Array.isArray(err.errors) ? [...err.errors] : [];

  // --- Mongoose: schema validation failed -------------------------------
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }

  // --- Mongoose: invalid ObjectId / cast failed -------------------------
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'value'}`;
    errors = [];
  }

  // --- MongoDB: duplicate key (unique index) ----------------------------
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    message = field
      ? `That ${field} is already in use`
      : 'A record with these details already exists';
    errors = [];
  }

  // --- Body parser: malformed or too large JSON -------------------------
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
    errors = [];
  }

  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large (maximum 1 MB)';
    errors = [];
  }

  // --- JWT errors that were not caught by the auth middleware -----------
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // Log unexpected errors so they can be diagnosed. Operational errors
  // (ApiError, validation, duplicates) are expected and do not need a stack.
  if (!err.isOperational && statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.error(err);
  }

  if (env.isTest && statusCode >= 500) {
    // Make unexpected failures visible while running the test suite.
    console.error(err);
  }

  // Never leak internal details such as database errors in production.
  if (statusCode >= 500) {
    message = 'Something went wrong on the server';
    errors = [];
  }

  const body = {
    success: false,
    message,
    errors,
  };

  return res.status(statusCode).json(body);
};
