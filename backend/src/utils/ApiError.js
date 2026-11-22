/**
 * An error that is safe to show to API clients.
 *
 * Anything thrown that is *not* an ApiError is treated as an unexpected server
 * error and returns a generic HTTP 500 response.
 */
export default class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code.
   * @param {string} message Human-readable message.
   * @param {Array<string|{field: string, message: string}>} [errors] Extra details.
   */
  constructor(statusCode, message, errors = []) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to do that') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  static tooLarge(message = 'Request body is too large') {
    return new ApiError(413, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}
