import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/auth/register
 * Creates an account and immediately returns a JWT so the frontend can log
 * the user in without a second request.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password, phone, universityId } = req.body;

  const result = await authService.registerUser({
    name,
    username,
    email,
    password,
    phone,
    universityId: universityId || null,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: result,
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser({ email, password });

  return sendSuccess(res, {
    message: 'Login successful',
    data: result,
  });
});

/**
 * GET /api/auth/me (protected)
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return sendSuccess(res, {
    message: 'Current user retrieved successfully',
    data: { user },
  });
});
