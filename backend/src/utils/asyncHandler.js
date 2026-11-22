/**
 * Wraps an async route handler and forwards rejected promises to Express'
 * error handler. Without this, every controller would need its own try/catch.
 *
 * @param {Function} handler Express route handler.
 * @returns {Function}
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
