import { body } from 'express-validator';

/**
 * Validation chains for user profile endpoints.
 */

export const updateProfileRules = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username may only contain letters, numbers and underscores'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),

  body('phone')
    .optional({ values: 'falsy' })
    .isString()
    .isLength({ max: 20 })
    .withMessage('Phone number is too long'),

  body('universityId')
    .optional({ values: 'falsy' })
    .isMongoId()
    .withMessage('University id must be valid'),

  body('profilePicture')
    .optional({ values: 'falsy' })
    .isURL({ require_protocol: true })
    .withMessage('profilePicture must be a valid URL including http:// or https://'),

  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 160 })
    .withMessage('Bio cannot exceed 160 characters'),
];
