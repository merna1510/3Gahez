import ApiError from '../utils/ApiError.js';

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    return next(ApiError.forbidden('Admin access is required'));
  }
  return next();
};
