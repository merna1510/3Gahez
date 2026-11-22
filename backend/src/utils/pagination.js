const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Normalizes pagination query parameters.
 *
 * Examples:
 *   parsePagination({})                     -> { page: 1, limit: 10, skip: 0 }
 *   parsePagination({ page: '2', limit: '5' }) -> { page: 2, limit: 5, skip: 5 }
 *
 * Invalid or out-of-range values fall back to safe defaults instead of crashing.
 *
 * @param {{page?: string|number, limit?: string|number}} query
 * @returns {{page: number, limit: number, skip: number}}
 */
export const parsePagination = (query = {}) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;

  let limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT;

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Builds the `meta` object returned with paginated responses.
 *
 * @param {number} total Total number of matching documents.
 * @param {number} page Current page.
 * @param {number} limit Items per page.
 */
export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
