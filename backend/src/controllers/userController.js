import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/users
 * Public list of users with pagination.
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.listUsers(req.query);

  return sendSuccess(res, {
    message: 'Users retrieved successfully',
    data: { users },
    meta,
  });
});

/**
 * GET /api/users/:id
 * Public profile of a single user.
 */
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  return sendSuccess(res, {
    message: 'User retrieved successfully',
    data: { user },
  });
});

/**
 * PUT /api/users/me (protected)
 * Updates only the authenticated user's own profile.
 */
export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);

  return sendSuccess(res, {
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * DELETE /api/users/me (protected)
 * Deletes the account and the posts that belong to it.
 */
export const deleteMe = asyncHandler(async (req, res) => {
  const result = await userService.deleteAccount(req.user._id);

  return sendSuccess(res, {
    message: 'Account deleted successfully',
    data: result,
  });
});
