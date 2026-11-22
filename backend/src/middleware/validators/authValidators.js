import { body, param, query } from 'express-validator';

/**
 * Validation chains for authentication endpoints.
 * The `validate` middleware turns failures into a 400 response.
 */

export const registerRules = [
  body('name')
    .exists({ values: 'falsy' })
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('username')
    .optional()
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username may only contain letters, numbers and underscores'),

  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 20 }),
  body('universityId').optional({ values: 'falsy' }).isMongoId(),

  body('email')
    .exists({ values: 'falsy' })
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),

  body('password')
    .exists({ values: 'falsy' })
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters'),
];

export const loginRules = [
  body('email')
    .exists({ values: 'falsy' })
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),

  body('password')
    .exists({ values: 'falsy' })
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a string'),
];

/**
 * Shared query rules used by every paginated endpoint.
 */
export const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt(),
];

/**
 * Shared route param rule for MongoDB ObjectIds.
 */
export const objectIdRule = (paramName, label) =>
  param(paramName)
    .isMongoId()
    .withMessage(`${label} id must be a valid MongoDB ObjectId`);
