/**
 * Sends a consistent success response.
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: { ... },
 *   meta: { ... }   // only for paginated lists
 * }
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {string} options.message
 * @param {object|Array} options.data
 * @param {object} [options.meta] Pagination metadata.
 */
export const sendSuccess = (
  res,
  { statusCode = 200, message = 'Success', data = {}, meta }
) => {
  const body = {
    success: true,
    message,
    data,
  };

  if (meta) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
};
